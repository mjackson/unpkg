const qs = require('querystring')
const validateNPMPackageName = require('validate-npm-package-name')
const PackageURL = require('../PackageURL')

const KnownQueryParams = {
  main: true,
  meta: true
}

function isKnownQueryParam(param) {
  return !!KnownQueryParams[param]
}

function queryIsKnown(query) {
  return Object.keys(query).every(isKnownQueryParam)
}

function createSearch(query, withMeta) {
  let search = ''

  if (query.main)
    search += `main=${encodeURIComponent(query.main)}`

  // Do this manually because stringify uses ?meta= for { meta: true }
  if (query.meta != null || query.json != null || withMeta)
    search += (search ? '&' : '') + 'meta'

  return search ? `?${search}` : ''
}

/**
 * Parse and validate the URL.
 */
function parsePackageURL(req, res, next) {
  // Redirect /_meta/pkg to /pkg?meta.
  if (req.path.match(/^\/_meta\//))
    return res.redirect(req.path.substr(6) + createSearch(req.query, true))

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
    return res.redirect(url.pathname + createSearch(url.query))

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
