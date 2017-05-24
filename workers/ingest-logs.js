require('isomorphic-fetch')
const parseURL = require('url').parse
const invariant = require('invariant')
const gunzip = require('gunzip-maybe')
const ndjson = require('ndjson')
const redis = require('redis')

const CloudflareEmail = process.env.CLOUDFLARE_EMAIL
const CloudflareKey = process.env.CLOUDFLARE_KEY
const RedisURL = process.env.REDIS_URL

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
  'Missing the $REDIS_URL environment variable'
)

/**
 * Domains we want to analyze.
 */
const DomainNames = [
  //'npmcdn.com', // We don't have log data on npmcdn.com yet :/
  'unpkg.com'
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

// TODO: Copied from express-unpkg, use the same function
const URLFormat = /^\/((?:@[^\/@]+\/)?[^\/@]+)(?:@([^\/]+))?(\/.*)?$/

const getPackageName = (pathname) => {
  const match = URLFormat.exec(pathname)
  return match && match[1]
}

const oneSecond = 1000
const oneMinute = oneSecond * 60
const oneHour = oneMinute * 60

const computeCounters = (stream) =>
  new Promise((resolve, reject) => {
    const counters = {}

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
        const dayKey = `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`
        const hourKey = `${dayKey}-${date.getUTCHours()}`
        const minuteKey = `${hourKey}-${date.getUTCMinutes()}`

        // Q: How many requests do we receive per day/hour/minute?
        incrCounter(`stats-requests-${dayKey}`)
        incrCounter(`stats-requests-${hourKey}`)
        incrCounter(`stats-requests-${minuteKey}`)

        // Q: How many requests are served by origin/cache/edge per day/hour?
        if (entry.origin) {
          incrCounter(`stats-originRequests-${dayKey}`)
          incrCounter(`stats-originRequests-${hourKey}`)
        } else if (entry.cache) {
          incrCounter(`stats-cacheRequests-${dayKey}`)
          incrCounter(`stats-cacheRequests-${hourKey}`)
        } else {
          incrCounter(`stats-edgeRequests-${dayKey}`)
          incrCounter(`stats-edgeRequests-${hourKey}`)
        }

        const clientRequest = entry.clientRequest
        const edgeResponse = entry.edgeResponse

        // Q: How many requests do we receive for a package per day?
        // Q: How many bytes do we serve for a package per day?
        const uri = clientRequest.uri
        const package = getPackageName(parseURL(uri).pathname)

        if (package) {
          incrCounterMember(`stats-packageRequests-${dayKey}`, package)
          incrCounterMember(`stats-packageBytes-${dayKey}`, package, edgeResponse.bytes)
        }

        // Q: How many requests per day do we receive via each protocol?
        const protocol = clientRequest.httpProtocol

        if (protocol)
          incrCounterMember(`stats-protocolRequests-${dayKey}`, protocol)

        // Q: How many requests do we receive from a hostname per day?
        // Q: How many bytes do we serve to a hostname per day?
        const referer = clientRequest.referer
        const hostname = referer && parseURL(referer).hostname

        if (hostname) {
          incrCounterMember(`stats-hostnameRequests-${dayKey}`, hostname)
          incrCounterMember(`stats-hostnameBytes-${dayKey}`, hostname, edgeResponse.bytes)
        }
      })
      .on('end', () => {
        resolve(counters)
      })
  })

const processLogs = (stream) =>
  computeCounters(stream).then(counters => {
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
