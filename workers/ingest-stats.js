require('isomorphic-fetch')
const invariant = require('invariant')
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
  'unpkg.com',
  'npmcdn.com'
]

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

const getZoneAnalyticsDashboard = (zoneId, since) =>
  fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/analytics/dashboard?since=${since}&continuous=true`, {
    method: 'GET',
    headers: {
      'X-Auth-Email': CloudflareEmail,
      'X-Auth-Key': CloudflareKey
    }
  }).then(res => res.json())
    .then(data => data.result)

const oneSecond = 1000
const oneMinute = oneSecond * 60
const oneHour = oneMinute * 60
const oneDay = oneHour * 24

const oneMinuteSeconds = 60
const oneHourSeconds = oneMinuteSeconds * 60
const oneDaySeconds = oneHourSeconds * 24

const reduceResults = (memo, results) => {
  Object.keys(results).forEach(key => {
    const value = results[key]

    if (typeof value === 'object' && value) {
      memo[key] = reduceResults(memo[key] || {}, value)
    } else if (typeof value === 'number') {
      memo[key] = (memo[key] || 0) + results[key]
    }
  })

  return memo
}

const ingestStatsForZones = (zones, since, processDashboard) =>
  new Promise(resolve => {
    const zoneNames = zones.map(zone => zone.name).join(', ')

    console.log(
      'LOG: start ingesting stats for zones %s since %d',
      zoneNames,
      since
    )

    const startFetchTime = Date.now()

    resolve(
      Promise.all(
        zones.map(zone => getZoneAnalyticsDashboard(zone.id, since))
      ).then(
        results => {
          const endFetchTime = Date.now()

          console.log(
            'LOG: fetched zone analytics dashboards for %s since %d in %dms',
            zoneNames,
            since,
            endFetchTime - startFetchTime
          )

          // We don't have per-minute dashboards available for npmcdn.com yet,
          // so the dashboard for that domain will be null when querying for
          // per-minute data. Just filter it out here for now.
          results = results.filter(Boolean)

          return results.length ? results.reduce(reduceResults) : null
        }
      ).then(
        dashboard => {
          if (dashboard == null) {
            console.warn(
              'WARNING: missing dashboards for %s since %d',
              zoneNames,
              since
            )

            return
          }

          const startProcessTime = Date.now()

          return processDashboard(dashboard).then(() => {
            const endProcessTime = Date.now()

            console.log(
              'LOG: processed zone analytics dashboards for %s since %d in %dms',
              zoneNames,
              since,
              endProcessTime - startProcessTime
            )
          })
        }
      )
    )
  })

const ingestPerDayStats = (zones) =>
  ingestStatsForZones(zones, -10080, processPerDayDashboard)

const processPerDayDashboard = (dashboard) =>
  Promise.all(dashboard.timeseries.map(processPerDayTimeseries))

const processPerDayTimeseries = (ts) =>
  new Promise(resolve => {
    const since = new Date(ts.since)
    const until = new Date(ts.until)

    invariant(
      since.getUTCHours() === 0 && since.getUTCMinutes() === 0 && since.getUTCSeconds() === 0,
      'ERROR: per-day timeseries.since must begin exactly on the day'
    )

    invariant(
      (until - since) === oneDay,
      'ERROR: per-day timeseries must span exactly one day'
    )

    const dayKey = `${since.getUTCFullYear()}-${since.getUTCMonth()}-${since.getUTCDate()}`

    // Q: How many requests do we serve per day?
    db.set(`stats-requests-${dayKey}`, ts.requests.all)
    // Q: How many requests do we serve per day from the cache?
    db.set(`stats-requestsFromCache-${dayKey}`, ts.requests.cached)

    // Q: How much bandwidth do we serve per day?
    db.set(`stats-bandwidth-${dayKey}`, ts.bandwidth.all)
    // Q: How much bandwidth do we serve per day from the cache?
    db.set(`stats-bandwidthFromCache-${dayKey}`, ts.bandwidth.cached)

    // Q: How many errors do we serve per day?
    const httpStatus = ts.requests.http_status
    const errors = Object.keys(httpStatus).reduce((memo, status) => {
      return parseInt(status, 10) >= 500 ? memo + httpStatus[status] : memo
    }, 0)

    db.set(`stats-errors-${dayKey}`, errors)

    // Q: How many requests do we serve to a country per day?
    // Q: How much bandwidth do we serve to a country per day?
    const requestsByCountry = []
    const bandwidthByCountry = []

    Object.keys(ts.requests.country).forEach(country => {
      const requests = ts.requests.country[country]
      const bandwidth = ts.bandwidth.country[country]

      // Include only countries who made at least 1M requests.
      if (requests > 1000000) {
        requestsByCountry.push(requests, country)
        bandwidthByCountry.push(bandwidth, country)
      }
    })

    if (requestsByCountry.length)
      db.zadd([ `stats-requestsByCountry-${dayKey}`, ...requestsByCountry ])

    if (bandwidthByCountry.length)
      db.zadd([ `stats-bandwidthByCountry-${dayKey}`, ...bandwidthByCountry ])

    resolve()
  })

const ingestPerHourStats = (zones) =>
  ingestStatsForZones(zones, -1440, processPerHourDashboard)

const processPerHourDashboard = (dashboard) =>
  Promise.all(dashboard.timeseries.map(processPerHourTimeseries))

const processPerHourTimeseries = (ts) =>
  new Promise(resolve => {
    const since = new Date(ts.since)
    const until = new Date(ts.until)

    invariant(
      since.getUTCMinutes() === 0 && since.getUTCSeconds() === 0,
      'ERROR: per-hour timeseries.since must begin exactly on the hour'
    )

    invariant(
      (until - since) === oneHour,
      'ERROR: per-hour timeseries must span exactly one hour'
    )

    const hourKey = `${since.getUTCFullYear()}-${since.getUTCMonth()}-${since.getUTCDate()}-${since.getUTCHours()}`

    // Q: How many requests do we serve per hour? (expire after 7 days)
    db.setex(`stats-requests-${hourKey}`, (oneDaySeconds * 7), ts.requests.all)
    // Q: How many requests do we serve per hour from the cache? (expire after 7 days)
    db.setex(`stats-requestsFromCache-${hourKey}`, (oneDaySeconds * 7), ts.requests.cached)

    // Q: How much bandwidth do we serve per hour? (expire after 7 days)
    db.setex(`stats-bandwidth-${hourKey}`, (oneDaySeconds * 7), ts.bandwidth.all)
    // Q: How much bandwidth do we serve per hour from the cache? (expire after 7 days)
    db.setex(`stats-bandwidthFromCache-${hourKey}`, (oneDaySeconds * 7), ts.bandwidth.cached)

    resolve()
  })

const ingestPerMinuteStats = (zones) =>
  ingestStatsForZones(zones, -30, processPerMinuteDashboard)

const processPerMinuteDashboard = (dashboard) =>
  Promise.all(dashboard.timeseries.map(processPerMinuteTimeseries))

const processPerMinuteTimeseries = (ts) =>
  new Promise(resolve => {
    const since = new Date(ts.since)
    const until = new Date(ts.until)

    invariant(
      since.getUTCSeconds() === 0,
      'ERROR: per-minute timeseries.since must begin exactly on the minute'
    )

    invariant(
      (until - since) === oneMinute,
      'ERROR: per-minute timeseries must span exactly one minute'
    )

    const minuteKey = `${since.getUTCFullYear()}-${since.getUTCMonth()}-${since.getUTCDate()}-${since.getUTCHours()}-${since.getUTCMinutes()}`

    // Q: How many requests do we serve per minute? (expire after 1 day)
    db.setex(`stats-requests-${minuteKey}`, oneDaySeconds, ts.requests.all)
    // Q: How many requests do we serve per minute from the cache? (expire after 1 day)
    db.setex(`stats-requestsFromCache-${minuteKey}`, oneDaySeconds, ts.requests.cached)

    // Q: How much bandwidth do we serve per minute? (expire after 1 day)
    db.setex(`stats-bandwidth-${minuteKey}`, oneDaySeconds, ts.bandwidth.all)
    // Q: How much bandwidth do we serve per minute from the cache? (expire after 1 day)
    db.setex(`stats-bandwidthFromCache-${minuteKey}`, oneDaySeconds, ts.bandwidth.cached)

    resolve()
  })

const startZones = (zones) => {
  const takePerMinuteTurn = () =>
    ingestPerMinuteStats(zones)

  const takePerHourTurn = () =>
    ingestPerHourStats(zones)

  const takePerDayTurn = () =>
    ingestPerDayStats(zones)

  takePerMinuteTurn()
  takePerHourTurn()
  takePerDayTurn()

  setInterval(takePerMinuteTurn, oneMinute)
  setInterval(takePerHourTurn, oneHour)
  setInterval(takePerDayTurn, oneDay / 2)
}

Promise.all(DomainNames.map(getZones)).then(results => {
  const zones = results.reduce((memo, zones) => memo.concat(zones))
  startZones(zones)
})
