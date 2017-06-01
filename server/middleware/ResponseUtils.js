const fs = require('fs')
const etag = require('etag')
const { getContentType } = require('./FileUtils')

const sendText = (res, statusCode, text) => {
  res.writeHead(statusCode, {
    'Content-Type': 'text/plain',
    'Content-Length': text.length
  })

  res.end(text)
}

const sendJSON = (res, json, maxAge = 0, statusCode = 200) => {
  const text = JSON.stringify(json)

  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': text.length,
    'Cache-Control': `public, max-age=${maxAge}`
  })

  res.end(text)
}

const sendInvalidURLError = (res, url) =>
  sendText(res, 403, `Invalid URL: ${url}`)

const sendNotFoundError = (res, what) =>
  sendText(res, 404, `Not found: ${what}`)

const sendServerError = (res, error) =>
  sendText(res, 500, `Server error: ${error.message || error}`)

const sendHTML = (res, html, maxAge = 0, statusCode = 200) => {
  res.writeHead(statusCode, {
    'Content-Type': 'text/html',
    'Content-Length': html.length,
    'Cache-Control': `public, max-age=${maxAge}`
  })

  res.end(html)
}

const sendRedirect = (res, relativeLocation, maxAge = 0, statusCode = 302) => {
  const location = res.req && res.req.baseUrl ? res.req.baseUrl + relativeLocation : relativeLocation

  const html = `<p>You are being redirected to <a href="${location}">${location}</a>`

  res.writeHead(statusCode, {
    'Content-Type': 'text/html',
    'Content-Length': html.length,
    'Cache-Control': `public, max-age=${maxAge}`,
    'Location': encodeURI(location)
  })

  res.end(html)
}

const sendFile = (res, file, stats, maxAge = 0) => {
  let contentType = getContentType(file)

  if (contentType === 'text/html')
    contentType = 'text/plain' // We can't serve HTML because bad people :(

  res.writeHead(200, {
    'Content-Type': contentType,
    'Content-Length': stats.size,
    'Cache-Control': `public, max-age=${maxAge}`,
    'ETag': etag(stats)
  })

  const stream = fs.createReadStream(file)

  stream.on('error', (error) => {
    sendServerError(res, error)
  })

  stream.pipe(res)
}

module.exports = {
  sendText,
  sendJSON,
  sendInvalidURLError,
  sendNotFoundError,
  sendServerError,
  sendHTML,
  sendRedirect,
  sendFile
}
