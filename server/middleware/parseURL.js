const validateNPMPackageName = require('validate-npm-package-name')
const PackageURL = require('../PackageURL')

const ValidQueryKeys = {
  main: true,
  meta: true,
  json: true, // deprecated
  v: true // we don't do anything with this, but some icon font libraries
          // use it to bust the cache on private servers (see #52)
}

function queryIsValid(query) {
  return Object.keys(query).every(function (key) {
    return ValidQueryKeys[key]
  })
}

/**
 * Parse and validate the URL.
 */
function parseURL(req, res, next) {
  const url = PackageURL.parse(req.url)

  if (url == null)
    return res.status(403).type('text').send(`Invalid URL: ${req.url}`)

  const nameErrors = validateNPMPackageName(url.packageName).errors

  // Do not allow invalid package names.
  if (nameErrors)
    return res.status(403).type('text').send(`Invalid package name: ${url.packageName} (${nameErrors.join(', ')})`)

  // Do not allow unrecognized query parameters because
  // some people use them to bust the cache.
  if (!queryIsValid(url.query))
    return res.status(403).type('text').send(`Invalid query: ${url.search}`)

  req.packageName = url.packageName
  req.packageVersion = url.packageVersion
  req.packageSpec = `${req.packageName}@${req.packageVersion}`
  req.pathname = url.pathname
  req.filename = url.filename
  req.search = url.search
  req.query = url.query

  next()
}

module.exports = parseURL
