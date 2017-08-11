const express = require('express')
const parseURL = require('./parseURL')
const checkBlacklist = require('./checkBlacklist')
const fetchPackage = require('./fetchPackage')
const findFile = require('./findFile')
const serveFile = require('./serveFile')

/**
 * Creates and returns a function that can be used in the "request"
 * event of a standard node HTTP server. Options are:
 *
 * - registryURL    The URL of the npm registry (defaults to https://registry.npmjs.org)
 * - autoIndex      Automatically generate index HTML pages for directories (defaults to true)
 *
 * Supported URL schemes are:
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
function createRequestHandler(options = {}) {
  const autoIndex = options.autoIndex !== false
  const maximumDepth = options.maximumDepth || Number.MAX_VALUE
  const blacklist = options.blacklist || []

  const app = express.Router()

  app.use(
    parseURL(),
    checkBlacklist(blacklist),
    fetchPackage(),
    findFile(),
    serveFile(autoIndex, maximumDepth)
  )

  return app
}

module.exports = createRequestHandler
