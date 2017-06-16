require('isomorphic-fetch')
const gunzip = require('gunzip-maybe')
const mkdirp = require('mkdirp')
const tar = require('tar-fs')
const RegistryCache = require('./RegistryCache')

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

const PackageNotFound = 'PackageNotFound'

const getPackageInfo = (registryURL, packageName, callback) => {
  RegistryCache.get(packageName, (error, value) => {
    if (error) {
      callback(error)
    } else if (value) {
      callback(null, value === PackageNotFound ? null : value)
    } else {
      getPackageInfoFromRegistry(registryURL, packageName).then(value => {
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

        callback(null, value)
      }, error => {
        // Do not cache errors.
        RegistryCache.del(packageName)
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

const extractions = {}

const triggerCallbacks = (tarballURL, error) => {
  const callbacks = extractions[tarballURL]

  for (let i = 0; i < callbacks.length; i++) {
    if (error) {
      callbacks[i](error)
    } else {
      callbacks[i]()
    }
  }
}

const getPackage = (tarballURL, outputDir, callback) => {
  if (!extractions[tarballURL]) {
    extractions[tarballURL] = [];
  }

  if (!extractions[tarballURL].length) {
    extractions[tarballURL].push(callback)

    mkdirp(outputDir, (error) => {
      if (error) {
        triggerCallbacks(tarballURL, error)
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
            .on('finish', () => {
              triggerCallbacks(tarballURL)
            })
            .on('error', (error) => {
              if (callbackWasCalled) // LOL node streams
                return

              callbackWasCalled = true
              triggerCallbacks(tarballURL, error)
            })
        })
      }
    })
  } else {
    extractions[tarballURL].push(callback)
  }
}

module.exports = {
  getPackageInfo,
  getPackage
}
