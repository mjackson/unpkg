require('isomorphic-fetch')
const PackageInfoCache = require('./PackageInfoCache')
const createMutex = require('./createMutex')

const RegistryURL = process.env.NPM_REGISTRY_URL || 'https://registry.npmjs.org'

function fetchPackageInfo(packageName) {
  console.log(`info: Fetching package info for ${packageName}`)

  let encodedPackageName
  if (packageName.charAt(0) === '@') {
    encodedPackageName = `@${encodeURIComponent(packageName.substring(1))}`
  } else {
    encodedPackageName = encodeURIComponent(packageName)
  }

  const url = `${RegistryURL}/${encodedPackageName}`

  return fetch(url, {
    headers: { 'Accept': 'application/json' }
  }).then(function (response) {
    return response.status === 404 ? null : response.json()
  })
}

const PackageNotFound = 'PackageNotFound'

// This mutex prevents multiple concurrent requests to
// the registry for the same package info.
const fetchMutex = createMutex(function (packageName, callback) {
  fetchPackageInfo(packageName).then(function (value) {
    if (value == null) {
      // Cache 404s for 5 minutes. This prevents us from making
      // unnecessary requests to the registry for bad package names.
      // In the worst case, a brand new package's info will be
      // available within 5 minutes.
      PackageInfoCache.set(packageName, PackageNotFound, 300, function () {
        callback(null, value)
      })
    } else {
      // Cache valid package info for one minute.
      PackageInfoCache.set(packageName, value, 60, function () {
        callback(null, value)
      })
    }
  }, function (error) {
    // Do not cache errors.
    PackageInfoCache.del(packageName, function () {
      callback(error)
    })
  })
})

function getPackageInfo(packageName, callback) {
  PackageInfoCache.get(packageName, function (error, value) {
    if (error) {
      callback(error)
    } else if (value) {
      callback(null, value === PackageNotFound ? null : value)
    } else {
      fetchMutex(packageName, packageName, callback)
    }
  })
}

module.exports = {
  get: getPackageInfo
}
