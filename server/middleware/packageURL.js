const validateNPMPackageName = require('validate-npm-package-name')
const parsePackageURL = require('../utils/parsePackageURL')
const createSearch = require('./utils/createSearch')

const KnownQueryParams = {
  main: true,
  meta: true,
  module: true
}

function isKnownQueryParam(param) {
  return !!KnownQueryParams[param]
}

function queryIsKnown(query) {
  return Object.keys(query).every(isKnownQueryParam)
}

function sanitizeQuery(query) {
  const saneQuery = {}

  Object.keys(query).forEach(param => {
    if (isKnownQueryParam(param)) saneQuery[param] = query[param]
  })

  return saneQuery
}

/**
 * Parse and validate the URL.
 */
function packageURL(req, res, next) {
  // Redirect /_meta/path to /path?meta.
  if (req.path.match(/^\/_meta\//)) {
    req.query.meta = ''
    return res.redirect(302, req.path.substr(6) + createSearch(req.query))
  }

  // Redirect /path?json => /path?meta
  if (req.query.json != null) {
    delete req.query.json
    req.query.meta = ''
    return res.redirect(302, req.path + createSearch(req.query))
  }

  // Redirect requests with unknown query params to their equivalents
  // with only known params so they can be served from the cache. This
  // prevents people using random query params designed to bust the cache.
  if (!queryIsKnown(req.query))
    return res.redirect(302, req.path + createSearch(sanitizeQuery(req.query)))

  const url = parsePackageURL(req.url)

  // Do not allow invalid URLs.
  if (url == null)
    return res
      .status(403)
      .type('text')
      .send(`Invalid URL: ${req.url}`)

  const nameErrors = validateNPMPackageName(url.packageName).errors

  // Do not allow invalid package names.
  if (nameErrors)
    return res
      .status(403)
      .type('text')
      .send(
        `Invalid package name: ${url.packageName} (${nameErrors.join(', ')})`
      )

  req.packageName = url.packageName
  req.packageVersion = url.packageVersion
  req.packageSpec = `${req.packageName}@${req.packageVersion}`
  req.pathname = url.pathname
  req.filename = url.filename
  req.search = url.search
  req.query = url.query

  next()
}

module.exports = packageURL
