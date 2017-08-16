const addDays = require('date-fns/add_days')
const invariant = require('invariant')
const cf = require('./CloudflareAPI')
const db = require('./RedisClient')
const {
  createDayKey,
  createHourKey,
  createMinuteKey
} = require('./StatsServer')

/**
 * Domains we want to analyze.
 */
const DomainNames = [
  'unpkg.com',
  'npmcdn.com'
]

function getZones(domain) {
  return cf.getJSON(`/zones?name=${domain}`)
}

function getZoneAnalyticsDashboard(zoneId, since) {
  return cf.getJSON(`/zones/${zoneId}/analytics/dashboard?since=${since}&continuous=true`)
}

const oneSecond = 1000
const oneMinute = oneSecond * 60
const oneHour = oneMinute * 60
const oneDay = oneHour * 24

const oneMinuteSeconds = 60
const oneHourSeconds = oneMinuteSeconds * 60
const oneDaySeconds = oneHourSeconds * 24

function getSeconds(date) {
  return Math.floor(date.getTime() / 1000)
}

function reduceResults(memo, results) {
  Object.keys(results).forEach(function (key) {
    const value = results[key]

    if (typeof value === 'object' && value) {
      memo[key] = reduceResults(memo[key] || {}, value)
    } else if (typeof value === 'number') {
      memo[key] = (memo[key] || 0) + results[key]
    }
  })

  return memo
}

function ingestStatsForZones(zones, since, processDashboard) {
  return new Promise(function (resolve) {
    const zoneNames = zones.map(function (zone) {
      return zone.name
    }).join(', ')

    console.log(
      'info: Started ingesting stats for zones %s since %d',
      zoneNames,
      since
    )

    const startFetchTime = Date.now()

    resolve(
      Promise.all(
        zones.map(function (zone) {
          return getZoneAnalyticsDashboard(zone.id, since)
        })
      ).then(function (results) {
          const endFetchTime = Date.now()

          console.log(
            'info: Fetched zone analytics dashboards for %s since %d in %dms',
            zoneNames,
            since,
            endFetchTime - startFetchTime
          )

          // We don't have per-minute dashboards available for npmcdn.com yet,
          // so the dashboard for that domain will be null when querying for
          // per-minute data. Just filter it out here for now.
          results = results.filter(Boolean)

          return results.length ? results.reduce(reduceResults) : null
      }).then(function (dashboard) {
        if (dashboard == null) {
          console.warn(
            'warning: Missing dashboards for %s since %d',
            zoneNames,
            since
          )

          return
        }

        const startProcessTime = Date.now()

        return processDashboard(dashboard).then(function () {
          const endProcessTime = Date.now()

          console.log(
            'info: Processed zone analytics dashboards for %s since %d in %dms',
            zoneNames,
            since,
            endProcessTime - startProcessTime
          )
        })
      })
    )
  })
}

function ingestPerDayStats(zones) {
  return ingestStatsForZones(zones, -10080, processPerDayDashboard)
}

function processPerDayDashboard(dashboard) {
  return Promise.all(dashboard.timeseries.map(processPerDayTimeseries))
}

function processPerDayTimeseries(ts) {
  return new Promise(function (resolve) {
    const since = new Date(ts.since)
    const until = new Date(ts.until)

    invariant(
      since.getUTCHours() === 0 && since.getUTCMinutes() === 0 && since.getUTCSeconds() === 0,
      'error: Per-day timeseries.since must begin exactly on the day'
    )

    invariant(
      (until - since) === oneDay,
      'error: Per-day timeseries must span exactly one day'
    )

    const dayKey = createDayKey(since)
    const oneYearLater = getSeconds(addDays(until, 365))
    const thirtyDaysLater = getSeconds(addDays(until, 30))

    // Q: How many requests do we serve per day?
    db.set(`stats-requests-${dayKey}`, ts.requests.all)
    db.expireat(`stats-requests-${dayKey}`, oneYearLater)

    // Q: How many requests do we serve per day from the cache?
    db.set(`stats-requestsFromCache-${dayKey}`, ts.requests.cached)
    db.expireat(`stats-requestsFromCache-${dayKey}`, oneYearLater)

    // Q: How much bandwidth do we serve per day?
    db.set(`stats-bandwidth-${dayKey}`, ts.bandwidth.all)
    db.expireat(`stats-bandwidth-${dayKey}`, oneYearLater)

    // Q: How much bandwidth do we serve per day from the cache?
    db.set(`stats-bandwidthFromCache-${dayKey}`, ts.bandwidth.cached)
    db.expireat(`stats-bandwidthFromCache-${dayKey}`, oneYearLater)

    const httpStatus = ts.requests.http_status
    const errors = Object.keys(httpStatus).reduce(function (memo, status) {
      return parseInt(status, 10) >= 500 ? memo + httpStatus[status] : memo
    }, 0)

    // Q: How many errors do we serve per day?
    db.set(`stats-errors-${dayKey}`, errors)
    db.expireat(`stats-errors-${dayKey}`, oneYearLater)

    const requestsByCountry = []
    const bandwidthByCountry = []

    Object.keys(ts.requests.country).forEach(function (country) {
      const requests = ts.requests.country[country]
      const bandwidth = ts.bandwidth.country[country]

      // Include only countries who made at least 100K requests.
      if (requests > 100000) {
        requestsByCountry.push(requests, country)
        bandwidthByCountry.push(bandwidth, country)
      }
    })

    // Q: How many requests do we serve to a country per day?
    if (requestsByCountry.length) {
      db.zadd([ `stats-requestsByCountry-${dayKey}`, ...requestsByCountry ])
      db.expireat(`stats-requestsByCountry-${dayKey}`, thirtyDaysLater)
    }

    // Q: How much bandwidth do we serve to a country per day?
    if (bandwidthByCountry.length) {
      db.zadd([ `stats-bandwidthByCountry-${dayKey}`, ...bandwidthByCountry ])
      db.expireat(`stats-bandwidthByCountry-${dayKey}`, thirtyDaysLater)
    }

    resolve()
  })
}

function ingestPerHourStats(zones) {
  return ingestStatsForZones(zones, -1440, processPerHourDashboard)
}

function processPerHourDashboard(dashboard) {
  return Promise.all(dashboard.timeseries.map(processPerHourTimeseries))
}

function processPerHourTimeseries(ts) {
  return new Promise(function (resolve) {
    const since = new Date(ts.since)
    const until = new Date(ts.until)

    invariant(
      since.getUTCMinutes() === 0 && since.getUTCSeconds() === 0,
      'error: Per-hour timeseries.since must begin exactly on the hour'
    )

    invariant(
      (until - since) === oneHour,
      'error: Per-hour timeseries must span exactly one hour'
    )

    const hourKey = createHourKey(since)

    // Q: How many requests do we serve per hour?
    db.setex(`stats-requests-${hourKey}`, (oneDaySeconds * 7), ts.requests.all)

    // Q: How many requests do we serve per hour from the cache?
    db.setex(`stats-requestsFromCache-${hourKey}`, (oneDaySeconds * 7), ts.requests.cached)

    // Q: How much bandwidth do we serve per hour?
    db.setex(`stats-bandwidth-${hourKey}`, (oneDaySeconds * 7), ts.bandwidth.all)

    // Q: How much bandwidth do we serve per hour from the cache?
    db.setex(`stats-bandwidthFromCache-${hourKey}`, (oneDaySeconds * 7), ts.bandwidth.cached)

    resolve()
  })
}

function ingestPerMinuteStats(zones) {
  return ingestStatsForZones(zones, -30, processPerMinuteDashboard)
}

function processPerMinuteDashboard(dashboard) {
  return Promise.all(dashboard.timeseries.map(processPerMinuteTimeseries))
}

function processPerMinuteTimeseries(ts) {
  return new Promise(function (resolve) {
    const since = new Date(ts.since)
    const until = new Date(ts.until)

    invariant(
      since.getUTCSeconds() === 0,
      'error: Per-minute timeseries.since must begin exactly on the minute'
    )

    invariant(
      (until - since) === oneMinute,
      'error: Per-minute timeseries must span exactly one minute'
    )

    const minuteKey = createMinuteKey(since)

    // Q: How many requests do we serve per minute?
    db.setex(`stats-requests-${minuteKey}`, oneDaySeconds, ts.requests.all)

    // Q: How many requests do we serve per minute from the cache?
    db.setex(`stats-requestsFromCache-${minuteKey}`, oneDaySeconds, ts.requests.cached)

    // Q: How much bandwidth do we serve per minute?
    db.setex(`stats-bandwidth-${minuteKey}`, oneDaySeconds, ts.bandwidth.all)

    // Q: How much bandwidth do we serve per minute from the cache?
    db.setex(`stats-bandwidthFromCache-${minuteKey}`, oneDaySeconds, ts.bandwidth.cached)

    resolve()
  })
}

function startZones(zones) {
  function takePerMinuteTurn() {
    return ingestPerMinuteStats(zones)
  }

  function takePerHourTurn() {
    return ingestPerHourStats(zones)
  }

  function takePerDayTurn() {
    return ingestPerDayStats(zones)
  }

  takePerMinuteTurn()
  takePerHourTurn()
  takePerDayTurn()

  setInterval(takePerMinuteTurn, oneMinute)
  setInterval(takePerHourTurn, oneHour / 2)
  setInterval(takePerDayTurn, oneHour / 2)
}

Promise.all(DomainNames.map(getZones)).then(function (results) {
  const zones = results.reduce(function (memo, zones) {
    return memo.concat(zones)
  })

  startZones(zones)
})
