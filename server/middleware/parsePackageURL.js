const validateNPMPackageName = require('validate-npm-package-name')
const PackageURL = require('../PackageURL')

const KnownQueryParams = {
  expand: true,
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

function createSearch(query) {
  const params = []

  Object.keys(query).forEach(function (param) {
    if (query[param] === '') {
      params.push(param) // Omit the trailing "=" from param=
    } else {
      params.push(`${param}=${encodeURIComponent(query[param])}`)
    }
  })

  const search = params.join('&')

  return search ? `?${search}` : ''
}

/**
 * Parse and validate the URL.
 */
function parsePackageURL(req, res, next) {
  // Redirect /_meta/pkg to /pkg?meta.
  if (req.path.match(/^\/_meta\//)) {
    delete req.query.json
    req.query.meta = ''
    return res.redirect(req.path.substr(6) + createSearch(req.query))
  }

  const url = PackageURL.parse(req.url)

  // Do not allow invalid URLs.
  if (url == null)
    return res.status(403).type('text').send(`Invalid URL: ${req.url}`)

  const nameErrors = validateNPMPackageName(url.packageName).errors

  // Do not allow invalid package names.
  if (nameErrors)
    return res.status(403).type('text').send(`Invalid package name: ${url.packageName} (${nameErrors.join(', ')})`)

  // Redirect requests with unknown query params to their equivalents
  // with only known params so they can be served from the cache. This
  // prevents people using random query params designed to bust the cache.
  if (!queryIsKnown(url.query))
    return res.redirect(url.pathname + createSearch(sanitizeQuery(url.query)))

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
