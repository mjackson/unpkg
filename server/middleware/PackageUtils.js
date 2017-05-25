const { parse: parseURL } = require('url')

const URLFormat = /^\/((?:@[^\/@]+\/)?[^\/@]+)(?:@([^\/]+))?(\/.*)?$/

const decodeParam = (param) =>
  param && decodeURIComponent(param)

const ValidQueryKeys = {
  main: true,
  json: true
}

const queryIsValid = (query) =>
  Object.keys(query).every(key => ValidQueryKeys[key])

const parsePackageURL = (url) => {
  const { pathname, search, query } = parseURL(url, true)

  if (!queryIsValid(query))
    return null

  const match = URLFormat.exec(pathname)

  if (match == null)
    return null

  const packageName = match[1]
  const version = decodeParam(match[2]) || 'latest'
  const filename = decodeParam(match[3])

  return {        // If the URL is /@scope/name@version/path.js?main=browser:
    pathname,     // /@scope/name@version/path.js
    search,       // ?main=browser
    query,        // { main: 'browser' }
    packageName,  // @scope/name
    version,      // version
    filename      // /path.js
  }
}

const createPackageURL = (packageName, version, filename, search) => {
  let pathname = `/${packageName}`

  if (version != null)
    pathname += `@${version}`

  if (filename != null)
    pathname += filename

  if (search)
    pathname += search

  return pathname
}

module.exports = {
  parsePackageURL,
  createPackageURL
}
