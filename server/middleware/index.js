const express = require('express')
const parseURL = require('./parseURL')
const checkBlacklist = require('./checkBlacklist')
const fetchPackage = require('./fetchPackage')
const findFile = require('./findFile')
const serveFile = require('./serveFile')

/**
 * Creates and returns a function that can be used in the "request"
 * event of a standard node HTTP server. Supported URL schemes are:
 *
 * /history@1.12.5/umd/History.min.js (recommended)
 * /history@1.12.5 (package.json's main is implied)
 *
 * Additionally, the following URLs are supported but will return a
 * temporary (302) redirect:
 *
 * /history (redirects to version, latest is implied)
 * /history/umd/History.min.js (redirects to version, latest is implied)
 * /history@latest/umd/History.min.js (redirects to version)
 * /history@^1/umd/History.min.js (redirects to max satisfying version)
 */
function createRequestHandler() {
  const app = express.Router()

  app.use(
    parseURL,
    checkBlacklist,
    fetchPackage,
    findFile,
    serveFile
  )

  return app
}

module.exports = createRequestHandler
