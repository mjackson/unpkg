const parseURL = require('url').parse
const startOfDay = require('date-fns/start_of_day')
const addDays = require('date-fns/add_days')
const validateNPMPackageName = require('validate-npm-package-name')
const parsePackageURL = require('./utils/parsePackageURL')
const cf = require('./CloudflareAPI')
const db = require('./RedisClient')
const { createDayKey } = require('./StatsServer')

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

function getSeconds(date) {
  return Math.floor(date.getTime() / 1000)
}

function stringifySeconds(seconds) {
  return new Date(seconds * 1000).toISOString()
}

function toSeconds(millis) {
  return Math.floor(millis / 1000)
}

const oneSecond = 1000
const oneMinute = oneSecond * 60
const oneHour = oneMinute * 60

function computeCounters(stream) {
  return new Promise(function (resolve, reject) {
    const counters = {}
    const expireat = {}

    function incr(key, member, by, expiry) {
      counters[key] = counters[key] || {}
      counters[key][member] = (counters[key][member] || 0) + by
      expireat[key] = expiry
    }

    stream
      .on('error', reject)
      .on('data', function (entry) {
        const date = new Date(Math.round(entry.timestamp / 1000000))

        const nextDay = startOfDay(addDays(date, 1))
        const sevenDaysLater = getSeconds(addDays(nextDay, 7))
        const thirtyDaysLater = getSeconds(addDays(nextDay, 30))
        const dayKey = createDayKey(date)

        const clientRequest = entry.clientRequest
        const edgeResponse = entry.edgeResponse

        if (edgeResponse.status === 200) {
          // Q: How many requests do we serve for a package per day?
          // Q: How many bytes do we serve for a package per day?
          const url = parsePackageURL(parseURL(clientRequest.uri).pathname)
          const packageName = url && url.packageName

          if (packageName && validateNPMPackageName(packageName).errors == null) {
            incr(`stats-packageRequests-${dayKey}`, packageName, 1, thirtyDaysLater)
            incr(`stats-packageBytes-${dayKey}`, packageName, edgeResponse.bytes, thirtyDaysLater)
          }
        }

        // Q: How many requests per day do we receive via a protocol?
        const protocol = clientRequest.httpProtocol

        if (protocol)
          incr(`stats-protocolRequests-${dayKey}`, protocol, 1, thirtyDaysLater)

        // Q: How many requests do we receive from a hostname per day?
        // Q: How many bytes do we serve to a hostname per day?
        const referer = clientRequest.referer
        const hostname = referer && parseURL(referer).hostname

        if (hostname) {
          incr(`stats-hostnameRequests-${dayKey}`, hostname, 1, sevenDaysLater)
          incr(`stats-hostnameBytes-${dayKey}`, hostname, edgeResponse.bytes, sevenDaysLater)
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
      const values = counters[key]

      Object.keys(values).forEach(function (member) {
        db.zincrby(key, values[member], member)
      })

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
      cf.getLogs(zone.id, startSeconds, endSeconds).then(function (stream) {
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

Promise.all(DomainNames.map(cf.getZones)).then(function (results) {
  const zones = results.reduce(function (memo, zones) {
    return memo.concat(zones)
  })

  zones.forEach(startZone)
})
