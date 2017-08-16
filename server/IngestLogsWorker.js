const parseURL = require('url').parse
const invariant = require('invariant')
const gunzip = require('gunzip-maybe')
const ndjson = require('ndjson')
const startOfDay = require('date-fns/start_of_day')
const addDays = require('date-fns/add_days')
const PackageURL = require('./PackageURL')
const cf = require('./CloudflareAPI')
const db = require('./RedisClient')
const {
  createDayKey,
  createHourKey
} = require('./StatsServer')

/**
 * Domains we want to analyze.
 */
const DomainNames = [
  'unpkg.com'
  //'npmcdn.com' // We don't have log data on npmcdn.com yet :/
]

/**
 * The window of time to download in a single fetch.
 */
const LogWindowSeconds = 30

function getZones(domain) {
  return cf.getJSON(`/zones?name=${domain}`)
}

function getLogs(zoneId, startTime, endTime) {
  return cf.get(
    `/zones/${zoneId}/logs/requests?start=${startTime}&end=${endTime}`,
    { 'Accept-Encoding': 'gzip' }
  ).then(function (res) {
    return res.body.pipe(gunzip())
  })
}

function toSeconds(millis) {
  return Math.floor(millis / 1000)
}

function stringifySeconds(seconds) {
  return new Date(seconds * 1000).toISOString()
}

function getPackageName(pathname) {
  const parsed = PackageURL.parse(pathname)
  return parsed && parsed.packageName
}

const oneSecond = 1000
const oneMinute = oneSecond * 60
const oneHour = oneMinute * 60

function getSeconds(date) {
  return Math.floor(date.getTime() / 1000)
}

function computeCounters(stream) {
  return new Promise(function (resolve, reject) {
    const counters = {}
    const expireat = {}

    function incrCounter(counterName, by = 1) {
      counters[counterName] = (counters[counterName] || 0) + by
    }

    function incrCounterMember(counterName, member, by = 1) {
      counters[counterName] = counters[counterName] || {}
      counters[counterName][member] = (counters[counterName][member] || 0) + by
    }

    stream
      .pipe(ndjson.parse())
      .on('error', reject)
      .on('data', function (entry) {
        const date = new Date(Math.round(entry.timestamp / 1000000))
        const nextDay = startOfDay(addDays(date, 1))
        const thirtyDaysLater = getSeconds(addDays(nextDay, 30))

        const dayKey = createDayKey(date)
        const hourKey = createHourKey(date)

        // Q: How many requests are served by origin/cache/edge per day/hour?
        if (entry.origin) {
          incrCounter(`stats-originRequests-${dayKey}`)
          expireat[`stats-originRequests-${dayKey}`] = thirtyDaysLater

          incrCounter(`stats-originRequests-${hourKey}`)
          expireat[`stats-originRequests-${hourKey}`] = thirtyDaysLater
        } else if (entry.cache) {
          incrCounter(`stats-cacheRequests-${dayKey}`)
          expireat[`stats-cacheRequests-${dayKey}`] = thirtyDaysLater

          incrCounter(`stats-cacheRequests-${hourKey}`)
          expireat[`stats-cacheRequests-${hourKey}`] = thirtyDaysLater
        } else {
          incrCounter(`stats-edgeRequests-${dayKey}`)
          expireat[`stats-edgeRequests-${dayKey}`] = thirtyDaysLater

          incrCounter(`stats-edgeRequests-${hourKey}`)
          expireat[`stats-edgeRequests-${hourKey}`] = thirtyDaysLater
        }

        const clientRequest = entry.clientRequest
        const edgeResponse = entry.edgeResponse

        // Q: How many requests do we receive for a package per day?
        // Q: How many bytes do we serve for a package per day?
        const uri = clientRequest.uri
        const package = getPackageName(parseURL(uri).pathname)

        if (package) {
          incrCounterMember(`stats-packageRequests-${dayKey}`, package)
          expireat[`stats-packageRequests-${dayKey}`] = thirtyDaysLater

          incrCounterMember(`stats-packageBytes-${dayKey}`, package, edgeResponse.bytes)
          expireat[`stats-packageBytes-${dayKey}`] = thirtyDaysLater
        }

        // Q: How many requests per day do we receive via each protocol?
        const protocol = clientRequest.httpProtocol

        if (protocol) {
          incrCounterMember(`stats-protocolRequests-${dayKey}`, protocol)
          expireat[`stats-protocolRequests-${dayKey}`] = thirtyDaysLater
        }

        // Q: How many requests do we receive from a hostname per day?
        // Q: How many bytes do we serve to a hostname per day?
        const referer = clientRequest.referer
        const hostname = referer && parseURL(referer).hostname

        if (hostname) {
          incrCounterMember(`stats-hostnameRequests-${dayKey}`, hostname)
          expireat[`stats-hostnameRequests-${dayKey}`] = thirtyDaysLater

          incrCounterMember(`stats-hostnameBytes-${dayKey}`, hostname, edgeResponse.bytes)
          expireat[`stats-hostnameBytes-${dayKey}`] = thirtyDaysLater
        }
      })
      .on('end', function () {
        resolve({ counters, expireat })
      })
  })
}

function processLogs(stream) {
  return computeCounters(stream).then(function ({ counters, expireat }) {
    Object.keys(counters).forEach(function (key) {
      const value = counters[key]

      if (typeof value === 'number') {
        // Simple counter.
        db.incrby(key, value)
      } else {
        // Sorted set.
        Object.keys(value).forEach(function (member) {
          db.zincrby(key, value[member], member)
        })
      }

      if (expireat[key])
        db.expireat(key, expireat[key])
    })
  })
}

function ingestLogs(zone, startSeconds, endSeconds) {
  return new Promise(function (resolve) {
    console.log(
      'info: Started ingesting logs for %s from %s to %s',
      zone.name,
      stringifySeconds(startSeconds),
      stringifySeconds(endSeconds)
    )

    const startFetchTime = Date.now()

    resolve(
      getLogs(zone.id, startSeconds, endSeconds).then(function (stream) {
        const endFetchTime = Date.now()

        console.log(
          'info: Fetched %ds worth of logs for %s in %dms',
          endSeconds - startSeconds,
          zone.name,
          endFetchTime - startFetchTime
        )

        const startProcessTime = Date.now()

        return processLogs(stream).then(function () {
          const endProcessTime = Date.now()

          console.log(
            'info: Processed %ds worth of logs for %s in %dms',
            endSeconds - startSeconds,
            zone.name,
            endProcessTime - startProcessTime
          )
        })
      })
    )
  })
}

function startZone(zone) {
  const startSecondsKey = `ingestLogsWorker-nextStartSeconds-${zone.name.replace('.', '-')}`

  function takeATurn() {
    db.get(startSecondsKey, function (error, value) {
      let startSeconds = value && parseInt(value, 10)

      const now = Date.now()

      // Cloudflare keeps logs around for 72 hours.
      // https://support.cloudflare.com/hc/en-us/articles/216672448-Enterprise-Log-Share-REST-API
      const minSeconds = toSeconds(now - oneHour * 72)

      if (startSeconds == null) {
        startSeconds = minSeconds
      } else if (startSeconds < minSeconds) {
        console.warn(
          'warning: Dropped logs for %s from %s to %s!',
          zone.name,
          stringifySeconds(startSeconds),
          stringifySeconds(minSeconds)
        )

        startSeconds = minSeconds
      }

      // The log for a request is typically available within thirty (30) minutes
      // of the request taking place under normal conditions. We deliver logs
      // ordered by the time that the logs were created, i.e. the timestamp of
      // the request when it was received by the edge. Given the order of
      // delivery, we recommend waiting a full thirty minutes to ingest a full
      // set of logs. This will help ensure that any congestion in the log
      // pipeline has passed and a full set of logs can be ingested.
      // https://support.cloudflare.com/hc/en-us/articles/216672448-Enterprise-Log-Share-REST-API
      const maxSeconds = toSeconds(now - (oneMinute * 30))

      if (startSeconds < maxSeconds) {
        const endSeconds = startSeconds + LogWindowSeconds

        ingestLogs(zone, startSeconds, endSeconds).then(function () {
          db.set(startSecondsKey, endSeconds)
          setTimeout(takeATurn)
        }, function (error) {
          console.error(error.stack)
          process.exit(1)
        })
      } else {
        setTimeout(takeATurn, (startSeconds - maxSeconds) * 1000)
      }
    })
  }

  takeATurn()
}

Promise.all(DomainNames.map(getZones)).then(function (results) {
  const zones = results.reduce(function (memo, zones) {
    return memo.concat(zones)
  })

  zones.forEach(startZone)
})
