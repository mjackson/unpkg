require('isomorphic-fetch')
const debug = require('debug')
const gunzip = require('gunzip-maybe')
const mkdirp = require('mkdirp')
const tar = require('tar-fs')
const RegistryCache = require('./RegistryCache')

const log = debug('express-unpkg')

const getPackageInfoFromRegistry = (registryURL, packageName) => {
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

const OneMinute = 60 * 1000
const PackageNotFound = 'PackageNotFound'

const getPackageInfo = (registryURL, packageName, callback) => {
  const cacheKey = registryURL + packageName

  RegistryCache.get(cacheKey, (error, value) => {
    if (error) {
      callback(error)
    } else if (value) {
      callback(null, value === PackageNotFound ? null : value)
    } else {
      log('Registry cache miss for package %s', packageName)

      getPackageInfoFromRegistry(registryURL, packageName).then(value => {
        if (value == null) {
          // Keep 404s in the cache for 5 minutes. This prevents us
          // from making unnecessary requests to the registry for
          // bad package names. In the worst case, a brand new
          // package's info will be available within 5 minutes.
          RegistryCache.set(cacheKey, PackageNotFound, OneMinute * 5)
        } else {
          RegistryCache.set(cacheKey, value, OneMinute)
        }

        callback(null, value)
      }, error => {
        // Do not cache errors.
        RegistryCache.del(cacheKey)
        callback(error)
      })
    }
  })
}

const normalizeTarHeader = (header) => {
  // Most packages have header names that look like "package/index.js"
  // so we shorten that to just "index.js" here. A few packages use a
  // prefix other than "package/". e.g. the firebase package uses the
  // "firebase_npm/" prefix. So we just strip the first dir name.
  header.name = header.name.replace(/^[^\/]+\//, '')
  return header
}

const getPackage = (tarballURL, outputDir, callback) => {
  mkdirp(outputDir, (error) => {
    if (error) {
      callback(error)
    } else {
      let callbackWasCalled = false

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
          .on('finish', callback)
          .on('error', (error) => {
            if (callbackWasCalled) // LOL node streams
              return

            callbackWasCalled = true
            callback(error)
          })
      })
    }
  })
}

module.exports = {
  getPackageInfo,
  getPackage
}
