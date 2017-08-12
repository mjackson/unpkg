const PackageURL = require('../PackageURL')

const ValidQueryKeys = {
  main: true,
  meta: true,
  json: true // deprecated
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
    return res.status(403).send(`Invalid URL: ${req.url}`)

  // Do not allow unrecognized query parameters because
  // some people use them to bust the cache.
  if (!queryIsValid(url.query))
    return res.status(403).send(`Invalid query: ${JSON.stringify(url.query)}`)

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
