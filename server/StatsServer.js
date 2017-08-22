const cf = require('./CloudflareAPI')
const db = require('./RedisClient')

const PackageBlacklist = require('./PackageBlacklist').blacklist

function prunePackages(packagesMap) {
  PackageBlacklist.forEach(function (packageName) {
    delete packagesMap[packageName]
  })

  return packagesMap
}

function createDayKey(date) {
  return `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`
}

function createHourKey(date) {
  return `${createDayKey(date)}-${date.getUTCHours()}`
}

function createMinuteKey(date) {
  return `${createHourKey(date)}-${date.getUTCMinutes()}`
}

function createScoresMap(array) {
  const map = {}

  for (let i = 0; i < array.length; i += 2)
    map[array[i]] = parseInt(array[i + 1], 10)

  return map
}

function getScoresMap(key, n = 100) {
  return new Promise(function (resolve, reject) {
    db.zrevrange(key, 0, n, 'withscores', function (error, value) {
      if (error) {
        reject(error)
      } else {
        resolve(createScoresMap(value))
      }
    })
  })
}

function getPackageRequests(date, n = 100) {
  return getScoresMap(`stats-packageRequests-${createDayKey(date)}`, n).then(prunePackages)
}

function getPackageBandwidth(date, n = 100) {
  return getScoresMap(`stats-packageBytes-${createDayKey(date)}`, n).then(prunePackages)
}

function getProtocolRequests(date) {
  return getScoresMap(`stats-protocolRequests-${createDayKey(date)}`)
}

function addDailyMetricsToTimeseries(timeseries) {
  const since = new Date(timeseries.since)

  return Promise.all([
    getPackageRequests(since),
    getPackageBandwidth(since),
    getProtocolRequests(since)
  ]).then(function (results) {
    timeseries.requests.package = results[0]
    timeseries.bandwidth.package = results[1]
    timeseries.requests.protocol = results[2]
    return timeseries
  })
}

function sumMaps(maps) {
  return maps.reduce(function (memo, map) {
    Object.keys(map).forEach(function (key) {
      memo[key] = (memo[key] || 0) + map[key]
    })

    return memo
  }, {})
}

function addDailyMetrics(result) {
  return Promise.all(
    result.timeseries.map(addDailyMetricsToTimeseries)
  ).then(function () {
    result.totals.requests.package = sumMaps(
      result.timeseries.map(function (timeseries) {
        return timeseries.requests.package
      })
    )

    result.totals.bandwidth.package = sumMaps(
      result.timeseries.map(function (timeseries) {
        return timeseries.bandwidth.package
      })
    )

    result.totals.requests.protocol = sumMaps(
      result.timeseries.map(function (timeseries) {
        return timeseries.requests.protocol
      })
    )

    return result
  })
}

function extractPublicInfo(data) {
  return {
    since: data.since,
    until: data.until,

    requests: {
      all: data.requests.all,
      cached: data.requests.cached,
      country: data.requests.country,
      status: data.requests.http_status
    },

    bandwidth: {
      all: data.bandwidth.all,
      cached: data.bandwidth.cached,
      country: data.bandwidth.country
    },

    threats: {
      all: data.threats.all,
      country: data.threats.country
    },

    uniques: {
      all: data.uniques.all
    }
  }
}

const DomainNames = [
  'unpkg.com',
  'npmcdn.com'
]

function fetchStats(since, until) {
  return cf.getZones(DomainNames).then(function (zones) {
    return cf.getZoneAnalyticsDashboard(zones, since, until).then(function (dashboard) {
      return {
        timeseries: dashboard.timeseries.map(extractPublicInfo),
        totals: extractPublicInfo(dashboard.totals)
      }
    })
  })
}

const oneMinute = 1000 * 60
const oneHour = oneMinute * 60
const oneDay = oneHour * 24

function getStats(since, until, callback) {
  let promise = fetchStats(since, until)

  if ((until - since) > oneDay)
    promise = promise.then(addDailyMetrics)

  promise.then(function (value) {
    callback(null, value)
  }, callback)
}

module.exports = {
  createDayKey,
  createHourKey,
  createMinuteKey,
  getStats
}
