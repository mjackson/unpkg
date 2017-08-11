const fs = require('fs')
const path = require('path')
const tmpdir = require('os-tmpdir')
const { maxSatisfying: maxSatisfyingVersion } = require('semver')
const PackageInfo = require('../PackageInfo')
const { createPackageURL } = require('./PackageUtils')
const { getPackage } = require('./RegistryUtils')

function checkLocalCache(dir, callback) {
  fs.stat(path.join(dir, 'package.json'), function (error, stats) {
    callback(stats && stats.isFile())
  })
}

function createTempPath(name) {
  return path.join(tmpdir(), `unpkg-${name}`)
}

/**
 * Fetch the package from the registry and store a local copy on disk.
 * Redirect if the URL does not specify an exact req.packageVersion number.
 */
function fetchPackage() {
  return function (req, res, next) {
    req.packageDir = createTempPath(req.packageSpec)

    // TODO: fix race condition! (see #38)
    checkLocalCache(req.packageDir, function (isCached) {
      if (isCached)
        return next() // Best case: we already have this package on disk.

      PackageInfo.get(req.packageName, function (error, packageInfo) {
        if (error) {
          console.error(error)
          return res.status(500).send(`Cannot get info for package "${req.packageName}"`)
        }

        if (packageInfo == null || packageInfo.versions == null)
          return res.status(404).send(`Cannot find package "${req.packageName}"`)

        const { versions, 'dist-tags': tags } = packageInfo

        if (req.packageVersion in versions) {
          // A valid request for a package we haven't downloaded yet.
          const packageConfig = versions[req.packageVersion]
          const tarballURL = packageConfig.dist.tarball

          getPackage(tarballURL, req.packageDir, function (error) {
            if (error) {
              res.status(500).send(error.message || error)
            } else {
              next()
            }
          })
        } else if (req.packageVersion in tags) {
          res.redirect(createPackageURL(req.packageName, tags[req.packageVersion], req.filename, req.search))
        } else {
          const maxVersion = maxSatisfyingVersion(Object.keys(versions), req.packageVersion)

          if (maxVersion) {
            res.redirect(createPackageURL(req.packageName, maxVersion, req.filename, req.search))
          } else {
            res.status(404).send(`Cannot find package ${req.packageSpec}`)
          }
        }
      })
    })
  }
}

module.exports = fetchPackage
