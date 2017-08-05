require('isomorphic-fetch')
const parseURL = require('url').parse
const invariant = require('invariant')
const gunzip = require('gunzip-maybe')
const ndjson = require('ndjson')
const redis = require('redis')
const startOfDay = require('date-fns/start_of_day')
const addDays = require('date-fns/add_days')
const {
  parsePackageURL
} = require('./middleware/PackageUtils')
const {
  createDayKey,
  createHourKey
} = require('./StatsServer')

const CloudflareEmail = process.env.CLOUDFLARE_EMAIL
const CloudflareKey = process.env.CLOUDFLARE_KEY
const RedisURL = process.env.OPENREDIS_URL

invariant(
  CloudflareEmail,
  'Missing the $CLOUDFLARE_EMAIL environment variable'
)

invariant(
  CloudflareKey,
  'Missing the $CLOUDFLARE_KEY environment variable'
)

invariant(
  RedisURL,
  'Missing the $OPENREDIS_URL environment variable'
)

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

const db = redis.createClient(RedisURL)

const getZones = (domain) =>
  fetch(`https://api.cloudflare.com/client/v4/zones?name=${domain}`, {
    method: 'GET',
    headers: {
      'X-Auth-Email': CloudflareEmail,
      'X-Auth-Key': CloudflareKey
    }
  }).then(res => res.json())
    .then(data => data.result)

const getLogs = (zoneId, startTime, endTime) =>
  fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/logs/requests?start=${startTime}&end=${endTime}`, {
    method: 'GET',
    headers: {
      'X-Auth-Email': CloudflareEmail,
      'X-Auth-Key': CloudflareKey,
      'Accept-Encoding': 'gzip'
    }
  }).then(res => res.body.pipe(gunzip()))

const toSeconds = (millis) =>
  Math.floor(millis / 1000)

const stringifySeconds = (seconds) =>
  new Date(seconds * 1000).toISOString()

const getPackageName = (pathname) => {
  const parsed = parsePackageURL(pathname)
  return parsed && parsed.packageName
}

const oneSecond = 1000
const oneMinute = oneSecond * 60
const oneHour = oneMinute * 60

const getSeconds = (date) =>
  Math.floor(date.getTime() / 1000)

const computeCounters = (stream) =>
  new Promise((resolve, reject) => {
    const counters = {}
    const expireat = {}

    const incrCounter = (counterName, by = 1) =>
      counters[counterName] = (counters[counterName] || 0) + by

    const incrCounterMember = (counterName, member, by = 1) => {
      counters[counterName] = counters[counterName] || {}
      counters[counterName][member] = (counters[counterName][member] || 0) + by
    }

    stream
      .pipe(ndjson.parse())
      .on('error', reject)
      .on('data', entry => {
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
      .on('end', () => {
        resolve({ counters, expireat })
      })
  })

const processLogs = (stream) =>
  computeCounters(stream).then(({ counters, expireat }) => {
    Object.keys(counters).forEach(key => {
      const value = counters[key]

      if (typeof value === 'number') {
        // Simple counter.
        db.incrby(key, value)
      } else {
        // Sorted set.
        Object.keys(value).forEach(member => {
          db.zincrby(key, value[member], member)
        })
      }

      if (expireat[key])
        db.expireat(key, expireat[key])
    })
  })

const ingestLogs = (zone, startSeconds, endSeconds) =>
  new Promise(resolve => {
    console.log(
      'LOG: start ingesting logs for %s from %s to %s',
      zone.name,
      stringifySeconds(startSeconds),
      stringifySeconds(endSeconds)
    )

    const startFetchTime = Date.now()

    resolve(
      getLogs(zone.id, startSeconds, endSeconds).then(stream => {
        const endFetchTime = Date.now()

        console.log(
          'LOG: fetched %ds worth of logs for %s in %dms',
          endSeconds - startSeconds,
          zone.name,
          endFetchTime - startFetchTime
        )

        const startProcessTime = Date.now()

        return processLogs(stream).then(() => {
          const endProcessTime = Date.now()

          console.log(
            'LOG: processed %ds worth of logs for %s in %dms',
            endSeconds - startSeconds,
            zone.name,
            endProcessTime - startProcessTime
          )
        })
      })
    )
  })

const startZone = (zone) => {
  const startSecondsKey = `ingestLogsWorker-nextStartSeconds-${zone.name.replace('.', '-')}`

  const takeATurn = () => {
    db.get(startSecondsKey, (error, value) => {
      let startSeconds = value && parseInt(value, 10)

      const now = Date.now()

      // Cloudflare keeps logs around for 72 hours.
      // https://support.cloudflare.com/hc/en-us/articles/216672448-Enterprise-Log-Share-REST-API
      const minSeconds = toSeconds(now - oneHour * 72)

      if (startSeconds == null) {
        startSeconds = minSeconds
      } else if (startSeconds < minSeconds) {
        console.warn(
          'WARNING: dropped logs for %s from %s to %s!',
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

        ingestLogs(zone, startSeconds, endSeconds).then(() => {
          db.set(startSecondsKey, endSeconds)
          setTimeout(takeATurn)
        }, error => {
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

Promise.all(DomainNames.map(getZones)).then(results => {
  const zones = results.reduce((memo, zones) => memo.concat(zones))
  zones.forEach(startZone)
})
