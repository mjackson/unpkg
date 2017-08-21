const invariant = require('invariant')
const startOfDay = require('date-fns/start_of_day')
const addDays = require('date-fns/add_days')
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

const oneSecond = 1000
const oneMinute = oneSecond * 60
const oneHour = oneMinute * 60
const oneDay = oneHour * 24

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
          return cf.getZoneAnalyticsDashboard(zone.id, since)
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

function errorCount(httpStatus) {
  return Object.keys(httpStatus).reduce(function (memo, status) {
    return parseInt(status, 10) >= 500 ? memo + httpStatus[status] : memo
  }, 0)
}

function processPerDayTimeseries(ts) {
  return new Promise(function (resolve) {
    const since = new Date(ts.since)
    const until = new Date(ts.until)

    invariant(
      since.getUTCHours() === 0 && since.getUTCMinutes() === 0 && since.getUTCSeconds() === 0,
      'Per-day timeseries.since must begin exactly on the day'
    )

    invariant(
      (until - since) === oneDay,
      'Per-day timeseries must span exactly one day'
    )

    const nextDay = startOfDay(addDays(until, 1))
    const oneYearLater = getSeconds(addDays(nextDay, 365))
    const dayKey = createDayKey(since)

    // Q: How many requests do we serve per day?
    db.set(`stats-requests-${dayKey}`, ts.requests.all)
    db.expireat(`stats-requests-${dayKey}`, oneYearLater)

    // Q: How many requests do we serve per day from the cache?
    db.set(`stats-cachedRequests-${dayKey}`, ts.requests.cached)
    db.expireat(`stats-cachedRequests-${dayKey}`, oneYearLater)

    // Q: How much bandwidth do we serve per day?
    db.set(`stats-bandwidth-${dayKey}`, ts.bandwidth.all)
    db.expireat(`stats-bandwidth-${dayKey}`, oneYearLater)

    // Q: How much bandwidth do we serve per day from the cache?
    db.set(`stats-cachedBandwidth-${dayKey}`, ts.bandwidth.cached)
    db.expireat(`stats-cachedBandwidth-${dayKey}`, oneYearLater)

    // Q: How many errors do we serve per day?
    db.set(`stats-errors-${dayKey}`, errorCount(ts.requests.http_status))
    db.expireat(`stats-errors-${dayKey}`, oneYearLater)

    // Q: How many threats do we see each day?
    db.set(`stats-threats-${dayKey}`, ts.threats.all)
    db.expireat(`stats-threats-${dayKey}`, oneYearLater)

    // Q: How many unique visitors do we see each day?
    db.set(`stats-uniques-${dayKey}`, ts.uniques.all)
    db.expireat(`stats-uniques-${dayKey}`, oneYearLater)

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

    const thirtyDaysLater = getSeconds(addDays(nextDay, 30))

    // Q: How many requests do we serve to a country per day?
    if (requestsByCountry.length) {
      db.zadd([ `stats-countryRequests-${dayKey}`, ...requestsByCountry ])
      db.expireat(`stats-countryRequests-${dayKey}`, thirtyDaysLater)
    }

    // Q: How much bandwidth do we serve to a country per day?
    if (bandwidthByCountry.length) {
      db.zadd([ `stats-countryBandwidth-${dayKey}`, ...bandwidthByCountry ])
      db.expireat(`stats-countryBandwidth-${dayKey}`, thirtyDaysLater)
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
      'Per-hour timeseries.since must begin exactly on the hour'
    )

    invariant(
      (until - since) === oneHour,
      'Per-hour timeseries must span exactly one hour'
    )

    const nextDay = startOfDay(addDays(until, 1))
    const sevenDaysLater = getSeconds(addDays(nextDay, 7))
    const hourKey = createHourKey(since)

    // Q: How many requests do we serve per hour?
    db.set(`stats-requests-${hourKey}`, ts.requests.all)
    db.expireat(`stats-requests-${hourKey}`, sevenDaysLater)

    // Q: How many requests do we serve per hour from the cache?
    db.set(`stats-cachedRequests-${hourKey}`, ts.requests.cached)
    db.expireat(`stats-cachedRequests-${hourKey}`, sevenDaysLater)

    // Q: How much bandwidth do we serve per hour?
    db.set(`stats-bandwidth-${hourKey}`, ts.bandwidth.all)
    db.expireat(`stats-bandwidth-${hourKey}`, sevenDaysLater)

    // Q: How much bandwidth do we serve per hour from the cache?
    db.set(`stats-cachedBandwidth-${hourKey}`, ts.bandwidth.cached)
    db.expireat(`stats-cachedBandwidth-${hourKey}`, sevenDaysLater)

    // Q: How many errors do we serve per hour?
    db.set(`stats-errors-${hourKey}`, errorCount(ts.requests.http_status))
    db.expireat(`stats-errors-${hourKey}`, sevenDaysLater)

    // Q: How many threats do we see each hour?
    db.set(`stats-threats-${hourKey}`, ts.threats.all)
    db.expireat(`stats-threats-${hourKey}`, sevenDaysLater)

    // Q: How many unique visitors do we see each hour?
    db.set(`stats-uniques-${hourKey}`, ts.uniques.all)
    db.expireat(`stats-uniques-${hourKey}`, sevenDaysLater)

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
      'Per-minute timeseries.since must begin exactly on the minute'
    )

    invariant(
      (until - since) === oneMinute,
      'Per-minute timeseries must span exactly one minute'
    )

    const nextDay = startOfDay(addDays(until, 1))
    const oneDayLater = getSeconds(addDays(nextDay, 1))
    const minuteKey = createMinuteKey(since)

    // Q: How many requests do we serve per minute?
    db.set(`stats-requests-${minuteKey}`, ts.requests.all)
    db.expireat(`stats-requests-${minuteKey}`, oneDayLater)

    // Q: How many requests do we serve per minute from the cache?
    db.set(`stats-cachedRequests-${minuteKey}`, ts.requests.cached)
    db.expireat(`stats-cachedRequests-${minuteKey}`, oneDayLater)

    // Q: How much bandwidth do we serve per minute?
    db.set(`stats-bandwidth-${minuteKey}`, ts.bandwidth.all)
    db.expireat(`stats-bandwidth-${minuteKey}`, oneDayLater)

    // Q: How much bandwidth do we serve per minute from the cache?
    db.set(`stats-cachedBandwidth-${minuteKey}`, ts.bandwidth.cached)
    db.expireat(`stats-cachedBandwidth-${minuteKey}`, oneDayLater)

    // Q: How many errors do we serve per hour?
    db.set(`stats-errors-${minuteKey}`, errorCount(ts.requests.http_status))
    db.expireat(`stats-errors-${minuteKey}`, oneDayLater)

    // Q: How many threats do we see each minute?
    db.set(`stats-threats-${minuteKey}`, ts.threats.all)
    db.expireat(`stats-threats-${minuteKey}`, oneDayLater)

    // Q: How many unique visitors do we see each minute?
    db.set(`stats-uniques-${minuteKey}`, ts.uniques.all)
    db.expireat(`stats-uniques-${minuteKey}`, oneDayLater)

    resolve()
  })
}

function startZones(zones) {
  function takePerMinuteTurn() {
    ingestPerMinuteStats(zones)
  }

  function takePerHourTurn() {
    ingestPerHourStats(zones)
  }

  function takePerDayTurn() {
    ingestPerDayStats(zones)
  }

  takePerMinuteTurn()
  takePerHourTurn()
  takePerDayTurn()

  setInterval(takePerMinuteTurn, oneMinute)
  setInterval(takePerHourTurn, oneHour / 2)
  setInterval(takePerDayTurn, oneHour / 2)
}

Promise.all(DomainNames.map(cf.getZones)).then(function (results) {
  const zones = results.reduce(function (memo, zones) {
    return memo.concat(zones)
  })

  startZones(zones)
})
