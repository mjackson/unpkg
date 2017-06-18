require('isomorphic-fetch')
const gunzip = require('gunzip-maybe')
const mkdirp = require('mkdirp')
const tar = require('tar-fs')
const RegistryCache = require('./RegistryCache')

const fetchPackageInfoFromRegistry = (registryURL, packageName) => {
  let encodedPackageName
  if (packageName.charAt(0) === '@') {
    encodedPackageName = `@${encodeURIComponent(packageName.substring(1))}`
  } else {
    encodedPackageName = encodeURIComponent(packageName)
  }

  const url = `${registryURL}/${encodedPackageName}`

  return fetch(url, {
    headers: { 'Accept': 'application/json' }
  }).then(response => (
    response.status === 404 ? null : response.json()
  ))
}

const PackageNotFound = 'PackageNotFound'

const fetchPackageInfo = (registryURL, packageName) =>
  new Promise((resolve, reject) => {
    RegistryCache.get(packageName, (error, value) => {
      if (error) {
        reject(error)
      } else if (value) {
        resolve(value === PackageNotFound ? null : value)
      } else {
        fetchPackageInfoFromRegistry(registryURL, packageName).then(value => {
          if (value == null) {
            // Keep 404s in the cache for 5 minutes. This prevents us
            // from making unnecessary requests to the registry for
            // bad package names. In the worst case, a brand new
            // package's info will be available within 5 minutes.
            RegistryCache.set(packageName, PackageNotFound, 300)
          } else {
            // Keep package.json in the cache for a minute.
            RegistryCache.set(packageName, value, 60)
          }

          resolve(value)
        }, error => {
          // Do not cache errors.
          RegistryCache.del(packageName)
          reject(error)
        })
      }
    })
  })

const normalizeTarHeader = (header) => {
  // Most packages have header names that look like "package/index.js"
  // so we shorten that to just "index.js" here. A few packages use a
  // prefix other than "package/". e.g. the firebase package uses the
  // "firebase_npm/" prefix. So we just strip the first dir name.
  header.name = header.name.replace(/^[^\/]+\//, '')
  return header
}

const fetchAndExtractPackage = (tarballURL, outputDir) =>
  new Promise((resolve, reject) => {
    mkdirp(outputDir, (error) => {
      if (error) {
        reject(error)
      } else {
        fetch(tarballURL).then(response => {
          response.body
            .pipe(gunzip())
            .pipe(
              tar.extract(outputDir, {
                dmode: 0o666, // All dirs should be writable
                fmode: 0o444, // All files should be readable
                map: normalizeTarHeader
              })
            )
            .on('finish', resolve)
            .on('error', reject)
        }, reject)
      }
    })
  })

const runCache = {}

// A helper that prevents running multiple async operations
// identified by the same key concurrently. Instead, the operation
// is performed only once the first time it is requested and all
// subsequent calls get that same result until it is completed.
const runOnce = (key, perform) => {
  let promise = runCache[key]

  if (!promise) {
    promise = runCache[key] = perform()

    // Clear the cache when we're done.
    promise.then(() => {
      delete runCache[key]
    }, () => {
      delete runCache[key]
    })
  }

  return promise
}

const getPackageInfo = (registryURL, packageName, callback) => {
  runOnce(registryURL + packageName, () => fetchPackageInfo(registryURL, packageName))
    .then(info => callback(null, info), callback)
}

const getPackage = (tarballURL, outputDir, callback) => {
  runOnce(tarballURL + outputDir, () => fetchAndExtractPackage(tarballURL, outputDir))
    .then(() => callback(null), callback)
}

module.exports = {
  getPackageInfo,
  getPackage
}
