const PackageURL = require('../PackageURL')

/**
 * Parse and validate the URL.
 */
function parseURL(req, res, next) {
  const url = PackageURL.parse(req.url)

  if (url == null)
    return res.status(403).send(`Invalid URL: ${req.url}`)

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
