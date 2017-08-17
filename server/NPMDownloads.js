const NPMAPI = require('./NPMAPI')
const createCache = require('./createCache')
const createMutex = require('./createMutex')

const NPMDownloadsCache = createCache('npmDownloads')

function fetchDailyDownloads(packageName) {
  console.log(`info: Fetching downloads for ${packageName}`)

  return NPMAPI.getJSON(`/downloads/point/last-week/${packageName}`).then(function (data) {
    return data && Math.round(data.downloads / 7)
  })
}

const PackageNotFound = 'PackageNotFound'

const fetchMutex = createMutex(function (packageName, callback) {
  fetchDailyDownloads(packageName).then(function (value) {
    if (value == null) {
      // Cache 404s for 5 minutes. This prevents us from making
      // unnecessary requests to the NPM API for bad package names.
      // In the worst case, a brand new package's downloads will be
      // available within 5 minutes.
      NPMDownloadsCache.set(packageName, PackageNotFound, 300, function () {
        callback(null, value)
      })
    } else {
      // Cache downloads for 1 minute.
      NPMDownloadsCache.set(packageName, value, 60, function () {
        callback(null, value)
      })
    }
  }, function (error) {
    // Do not cache errors.
    NPMDownloadsCache.del(packageName, function () {
      callback(error)
    })
  })
})

function getDailyDownloads(packageName, callback) {
  NPMDownloadsCache.get(packageName, function (error, value) {
    if (error || value != null) {
      callback(error, value === PackageNotFound ? null : value)
    } else {
      fetchMutex(packageName, packageName, callback)
    }
  })
}

module.exports = {
  getDaily: getDailyDownloads
}
