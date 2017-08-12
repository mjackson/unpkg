const url = require('url')

const URLFormat = /^\/((?:@[^\/@]+\/)?[^\/@]+)(?:@([^\/]+))?(\/.*)?$/

function decodeParam(param) {
  if (param) {
    try {
      return decodeURIComponent(param)
    } catch (error) {
      // Ignore invalid params.
    }
  }

  return ''
}

function parsePackageURL(packageURL) {
  const { pathname, search, query } = url.parse(packageURL, true)

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

function createPackageURL(packageName, version, filename, search) {
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
  parse: parsePackageURL,
  create: createPackageURL
}
