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
const logsRef = db.ref('logs')

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

const incrementKey = (object, key, n = 1) =>
  object[key] = (object[key] || 0) + n

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

const ingestLogs = (zone, startSeconds, endSeconds) =>
  new Promise((resolve, reject) => {
    console.log(
      'START ingesting logs for %s from %s to %s',
      zone.name,
      stringifySeconds(startSeconds),
      stringifySeconds(endSeconds)
    )

    const startFetchTime = Date.now()

    getLogs(zone.id, startSeconds, endSeconds).then(stream => {
      const endFetchTime = Date.now()

      console.log(
        'Fetched %ds worth of logs for %s at %s in %dms',
        endSeconds - startSeconds,
        zone.name,
        stringifySeconds(startSeconds),
        endFetchTime - startFetchTime
      )

      const changes = {}

      stream
        .pipe(ndjson.parse())
        .on('error', reject)
        .on('data', entry => {
          const date = new Date(Math.round(entry.timestamp / 1000000))
          const dayKey = `${date.getUTCFullYear()}/${date.getUTCMonth()}/${date.getUTCDate()}`
          const minuteKey = `${date.getUTCHours()}/${date.getUTCMinutes()}`

          // Q: How many requests do we receive per minute?
          incrementKey(changes, `${dayKey}/totalRequests/${minuteKey}`, 1)

          // Q: How many requests do we receive to edge/cache/origin per minute?
          if (entry.origin) {
            incrementKey(changes, `${dayKey}/originRequests/${minuteKey}`)
          } else if (entry.cache) {
            incrementKey(changes, `${dayKey}/cacheRequests/${minuteKey}`)
          } else {
            incrementKey(changes, `${dayKey}/edgeRequests/${minuteKey}`)
          }

          const clientRequest = entry.clientRequest

          // Q: How many requests per day do we receive for a package?
          const uri = clientRequest.uri
          const package = getPackageName(parseURL(uri).pathname)
          if (package) {
            const key = `${dayKey}/packages/${hashKey(package)}`

            if (changes[key]) {
              changes[key].requests += 1
            } else {
              changes[key] = { package, requests: 1 }
            }
          }

          // Q: How many requests per day do we receive via each protocol?
          const protocol = clientRequest.httpProtocol
          if (protocol) {
            const key = `${dayKey}/protocols/${hashKey(protocol)}`

            if (changes[key]) {
              changes[key].requests += 1
            } else {
              changes[key] = { protocol, requests: 1 }
            }
          }

          // Q: How many requests per day do we receive from an origin?
          // const referer = clientRequest.referer
          // if (referer) {
          //   const url = parseURL(referer)
          //   const origin = formatURL({
          //     protocol: url.protocol,
          //     hostname: url.hostname
          //   })
          //
          //   const key = `${dayKey}/origins/${hashKey(origin)}`
          //
          //   if (changes[key]) {
          //     changes[key].requests += 1
          //   } else {
          //     changes[key] = { origin, requests: 1 }
          //   }
          // }
        })
        .on('end', () => {
          console.log(
            'FINISH ingesting logs for %s from %s to %s',
            zone.name,
            stringifySeconds(startSeconds),
            stringifySeconds(endSeconds)
          )

          // Record the changes.
          Object.keys(changes).forEach(key => {
            const ref = logsRef.child(key)

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

          resolve(changes)
        })
    })
  })

const startIngestingLogs = (zone) => {
  const startSecondsRef = logsRef.child(`nextStartSeconds/${zone.name.replace('.', '-')}`)

  let inProgress = false

  const takeATurn = () => {
    if (inProgress) {
      console.log(
        'Still ingesting logs for %s, waiting for another turn...',
        zone.name
      )

      return
    }

    inProgress = true

    startSecondsRef.once('value', snapshot => {
      let startSeconds = snapshot.val()

      const now = Date.now()

      // Cloudflare keeps logs around for 72 hours.
      const minSeconds = toSeconds(now - oneHour * 72)

      if (startSeconds == null) {
        startSeconds = minSeconds
      } else if (startSeconds < minSeconds) {
        console.warn(
          'WARNING: dropping logs for %s from %s to %s!',
          zone.name,
          stringifySeconds(startSeconds),
          stringifySeconds(minSeconds)
        )

        startSeconds = minSeconds
      }

      if (startSeconds < toSeconds(now - thirtyMinutes)) {
        const endSeconds = startSeconds + 10

        ingestLogs(zone, startSeconds, endSeconds).then(() => {
          startSecondsRef.set(endSeconds)
          inProgress = false
        })
      } else {
        console.log(
          'Waiting for 30 minutes to pass before fetching logs for %s...',
          zone.name
        )

        inProgress = false
      }
    })
  }

  takeATurn()
  setInterval(takeATurn, oneSecond * 3)
}

const domains = [
  //'npmcdn.com', // We don't have log data on npmcdn.com yet :/
  'unpkg.com'
]

Promise.all(domains.map(getZones)).then(results => {
  const zones = results.reduce((memo, zones) => memo.concat(zones))
  zones.forEach(startIngestingLogs)
})
