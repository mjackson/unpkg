const fs = require('fs')
const path = require('path')

const ResolveExtensions = [ '', '.js', '.json' ]

/**
 * Resolves a path like "lib/file" into "lib/file.js" or "lib/file.json"
 * depending on which one is available, similar to require('lib/file').
 */
function resolveFile(base, useIndex, callback) {
  ResolveExtensions.reduceRight(function (next, ext) {
    const file = base + ext

    return function () {
      fs.stat(file, function (error, stats) {
        if (error) {
          if (error.code === 'ENOENT' || error.code === 'ENOTDIR') {
            next()
          } else {
            callback(error)
          }
        } else if (useIndex && stats.isDirectory()) {
          resolveFile(path.join(file, 'index'), false, function (error, indexFile, indexStats) {
            if (error) {
              callback(error)
            } else if (indexFile) {
              callback(null, indexFile, indexStats)
            } else {
              next()
            }
          })
        } else {
          callback(null, file, stats)
        }
      })
    }
  }, callback)()
}

/**
 * Determine which file we're going to serve and get its stats.
 * Redirect if the request targets a directory with no trailing slash.
 */
function findFile(req, res, next) {
  if (req.filename) {
    const base = path.join(req.packageDir, req.filename)

    // Based on the URL, figure out which file they want.
    resolveFile(base, false, function (error, file, stats) {
      if (error)
        console.error(error)

      if (file == null) {
        res.status(404).send(`Cannot find file "${req.filename}" in package ${req.packageSpec}`)
      } else if (stats.isDirectory() && req.pathname[req.pathname.length - 1] !== '/') {
        // Append / to directory URLs.
        res.redirect(`${req.pathname}/${req.search}`)
      } else {
        req.file = file.replace(req.packageDir, '')
        req.stats = stats
        next()
      }
    })
  } else {
    // No filename in the URL. Try to figure out which file they want by
    // checking package.json's "unpkg", "browser", and "main" fields.
    let mainFilename

    const packageConfig = req.packageConfig
    const queryMain = req.query.main

    if (queryMain) {
      if (!(queryMain in packageConfig))
        return res.status(404).send(`Cannot find field "${queryMain}" in ${req.packageSpec}/package.json`)

      mainFilename = packageConfig[queryMain]
    } else {
      if (typeof packageConfig.unpkg === 'string') {
        // The "unpkg" field allows packages to explicitly declare the
        // file to serve at the bare URL (see #59).
        mainFilename = packageConfig.unpkg
      } else if (typeof packageConfig.browser === 'string') {
        // Fall back to the "browser" field if declared (only support strings).
        mainFilename = packageConfig.browser
      } else {
        // If there is no main, use "index" (same as npm).
        mainFilename = packageConfig.main || 'index'
      }
    }

    resolveFile(path.join(req.packageDir, mainFilename), true, function (error, file, stats) {
      if (error)
        console.error(error)

      if (file == null) {
        res.status(404).send(`Cannot find main file "${mainFilename}" in package ${req.packageSpec}`)
      } else {
        req.file = file.replace(req.packageDir, '')
        req.stats = stats
        next()
      }
    })
  }
}

module.exports = findFile
