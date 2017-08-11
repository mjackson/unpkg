const { parse: parseURL } = require('url')

const URLFormat = /^\/((?:@[^\/@]+\/)?[^\/@]+)(?:@([^\/]+))?(\/.*)?$/

const decodeParam = (param) =>
  param ? decodeURIComponent(param) : ''

const ValidQueryKeys = {
  main: true,
  meta: true,
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
  const packageVersion = decodeParam(match[2]) || 'latest'
  const filename = decodeParam(match[3])

  return {          // If the URL is /@scope/name@version/file.js?main=browser:
    pathname,       // /@scope/name@version/path.js
    search,         // ?main=browser
    query,          // { main: 'browser' }
    packageName,    // @scope/name
    packageVersion, // version
    filename        // /file.js
  }
}

const createPackageURL = (packageName, version, filename, search) => {
  let pathname = `/${packageName}`

  if (version != null)
    pathname += `@${version}`

  if (filename)
    pathname += filename

  if (search)
    pathname += search

  return pathname
}

module.exports = {
  parsePackageURL,
  createPackageURL
}
