const validateNPMPackageName = require('validate-npm-package-name')
const PackageBlacklist = require('../PackageBlacklist').blacklist
const PackageURL = require('../PackageURL')

/**
 * Parse and validate the URL.
 */
function parsePackageURL(req, res, next) {
  const url = PackageURL.parse(req.url)

  if (url == null)
    return res.status(403).type('text').send(`Invalid URL: ${req.url}`)

  const nameErrors = validateNPMPackageName(url.packageName).errors

  // Do not allow invalid package names.
  if (nameErrors)
    return res.status(403).type('text').send(`Invalid package name: ${url.packageName} (${nameErrors.join(', ')})`)

  // Do not allow packages that have been blacklisted.
  if (PackageBlacklist.includes(req.packageName))
    return res.status(403).type('text').send(`Package ${req.packageName} is blacklisted`)

  req.packageName = url.packageName
  req.packageVersion = url.packageVersion
  req.packageSpec = `${req.packageName}@${req.packageVersion}`
  req.pathname = url.pathname
  req.filename = url.filename
  req.search = url.search
  req.query = url.query

  next()
}

module.exports = parsePackageURL
