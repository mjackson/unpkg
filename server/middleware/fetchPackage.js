const { maxSatisfying: maxSatisfyingVersion } = require('semver')
const PackageCache = require('../PackageCache')
const PackageInfo = require('../PackageInfo')
const { createPackageURL } = require('./PackageUtils')

/**
 * Fetch the package from the registry and store a local copy on disk.
 * Redirect if the URL does not specify an exact req.packageVersion number.
 */
function fetchPackage(req, res, next) {
  PackageInfo.get(req.packageName, function (error, packageInfo) {
    if (error) {
      console.error(error)
      return res.status(500).send(`Cannot get info for package "${req.packageName}"`)
    }

    if (packageInfo == null || packageInfo.versions == null)
      return res.status(404).send(`Cannot find package "${req.packageName}"`)

    req.packageInfo = packageInfo

    const { versions, 'dist-tags': tags } = req.packageInfo

    if (req.packageVersion in versions) {
      // A valid request for a package we haven't downloaded yet.
      req.packageConfig = versions[req.packageVersion]

      PackageCache.get(req.packageConfig, function (error, outputDir) {
        if (error) {
          console.error(error)
          res.status(500).send(`Cannot fetch package ${req.packageSpec}`)
        } else {
          req.packageDir = outputDir
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
}

module.exports = fetchPackage
