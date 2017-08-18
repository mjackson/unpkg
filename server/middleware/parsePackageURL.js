const qs = require('querystring')
const validateNPMPackageName = require('validate-npm-package-name')
const PackageURL = require('../PackageURL')

const KnownQueryParams = {
  json: true, // deprecated
  main: true,
  meta: true
}

function isKnownQueryParam(param) {
  return !!KnownQueryParams[param]
}

function queryIsKnown(query) {
  return Object.keys(query).every(isKnownQueryParam)
}

function sanitizeQuery(query) {
  const saneQuery = {}

  Object.keys(query).forEach(function (param) {
    if (isKnownQueryParam(param))
      saneQuery[param] = query[param]
  })

  return saneQuery
}

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

  // Redirect requests with unknown query params to their equivalents
  // with only known params so they can be served from the cache. This
  // prevents people using random query params designed to bust the cache.
  if (!queryIsKnown(url.query)) {
    const search = qs.stringify(sanitizeQuery(url.query))
    return res.redirect(url.pathname + (search ? `?${search}` : ''))
  }

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
