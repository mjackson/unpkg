require('isomorphic-fetch')
const parseURL = require('url').parse
const formatURL = require('url').format
const crypto = require('crypto')
const invariant = require('invariant')
const admin = require('firebase-admin')
const gunzip = require('gunzip-maybe')
const ndjson = require('ndjson')

const CloudflareEmail = process.env.CLOUDFLARE_EMAIL
const CloudflareKey = process.env.CLOUDFLARE_KEY
const FirebaseURL = process.env.FIREBASE_URL
const FirebaseAccount = process.env.FIREBASE_ACCOUNT

invariant(
  CloudflareEmail,
  'Missing the $CLOUDFLARE_EMAIL environment variable'
)

invariant(
  CloudflareKey,
  'Missing the $CLOUDFLARE_KEY environment variable'
)

invariant(
  FirebaseURL,
  'Missing the $FIREBASE_URL environment variable'
)

invariant(
  FirebaseAccount,
  'Missing the $FIREBASE_ACCOUNT environment variable'
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

/*
Stuff we wanna show on the website:

- Most popular packages
- Protocol usage (HTTP/1.1 vs HTTP/2)
- Requests per minute
- Requests per day/week/month (aggregate)
- Edge/cache/origin hit rates
- Browser usage
*/

const serviceAccount = JSON.parse(FirebaseAccount)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: FirebaseURL,
  databaseAuthVariableOverride: {
    uid: 'ingest-logs-worker'
  }
})

const db = admin.database()

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
  new Date(seconds * 1000).toGMTString()

const hashKey = (key) =>
  crypto.createHash('sha1').update(key).digest('hex')

// TODO: Copied from express-unpkg, use the same function
const URLFormat = /^\/((?:@[^\/@]+\/)?[^\/@]+)(?:@([^\/]+))?(\/.*)?$/

const getPackageName = (pathname) => {
  const match = URLFormat.exec(pathname)
  return match && match[1]
}

const oneSecond = 1000
const oneMinute = oneSecond * 60
const thirtyMinutes = oneMinute * 30
const oneHour = oneMinute * 60

const computeLogChanges = (stream) =>
  new Promise((resolve, reject) => {
    const changes = {}

    const incKey = (key, n = 1) =>
      changes[key] = (changes[key] || 0) + n

    stream
      .pipe(ndjson.parse())
      .on('error', reject)
      .on('data', entry => {
        const date = new Date(Math.round(entry.timestamp / 1000000))
        const dayKey = `${date.getUTCFullYear()}/${date.getUTCMonth()}/${date.getUTCDate()}`
        const hourKey = `${dayKey}/${date.getUTCHours()}`
        const minuteKey = `${hourKey}/${date.getUTCMinutes()}`

        // Q: How many requests do we receive per day?
        incKey(`requestsPerDay/${dayKey}`)

        // Q: How many requests do we receive per minute?
        incKey(`requestsPerMinute/${minuteKey}`)

        // Q: How many requests do we receive to edge/cache/origin per hour?
        if (entry.origin) {
          incKey(`originRequestsPerHour/${hourKey}`)
        } else if (entry.cache) {
          incKey(`cacheRequestsPerHour/${hourKey}`)
        } else {
          incKey(`edgeRequestsPerHour/${hourKey}`)
        }

        const clientRequest = entry.clientRequest

        // Q: How many requests per day do we receive for a package?
        const uri = clientRequest.uri
        const package = getPackageName(parseURL(uri).pathname)

        if (package) {
          const key = `packageRequestsPerDay/${dayKey}/${hashKey(package)}`

          if (changes[key]) {
            changes[key].requests += 1
          } else {
            changes[key] = { package, requests: 1 }
          }
        }

        // Q: How many requests per day do we receive via each protocol?
        const protocol = clientRequest.httpProtocol

        if (protocol) {
          const key = `protocolRequestsPerDay/${dayKey}/${hashKey(protocol)}`

          if (changes[key]) {
            changes[key].requests += 1
          } else {
            changes[key] = { protocol, requests: 1 }
          }
        }

        // Q: How many requests per day do we receive from a hostname?
        const referer = clientRequest.referer

        if (referer) {
          const hostname = parseURL(referer).hostname
          const key = `requestsPerDayAndRefererHostname/${dayKey}/${hashKey(hostname)}`

          if (changes[key]) {
            changes[key].requests += 1
          } else {
            changes[key] = { hostname, requests: 1 }
          }
        }
      })
      .on('end', () => {
        resolve(changes)
      })
  })

const processLogs = (stream) =>
  computeLogChanges(stream).then(changes => {
    // Record the changes.
    Object.keys(changes).forEach(key => {
      const ref = db.ref(`logs/${key}`)

      ref.transaction(value => {
        if (typeof changes[key].requests === 'number') {
          // Nested value with a "requests" property.
          if (value && value.requests) {
            value.requests += changes[key].requests
            return value
          } else {
            return changes[key]
          }
        } else {
          // Simple counter.
          return (value || 0) + changes[key]
        }
      })
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
  const startSecondsRef = db.ref(`logs/nextStartSeconds/${zone.name.replace('.', '-')}`)

  const takeATurn = () => {
    startSecondsRef.once('value', snapshot => {
      let startSeconds = snapshot.val()

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
      const maxSeconds = toSeconds(now - thirtyMinutes)

      if (startSeconds < maxSeconds) {
        const endSeconds = startSeconds + LogWindowSeconds

        ingestLogs(zone, startSeconds, endSeconds).then(() => {
          startSecondsRef.set(endSeconds)
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

//const getValues = (object) =>
//  Object.keys(object).map(key => object[key])
//
//db.ref('logs/2017/4/17/packages').orderByChild('requests').limitToLast(10).once('value', (snapshot) => {
//  const values = getValues(snapshot.val()).sort((a, b) => b.requests - a.requests)
//  console.log(values)
//})
