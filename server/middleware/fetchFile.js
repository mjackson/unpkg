const fs = require('fs')
const path = require('path')
const semver = require('semver')
const createPackageURL = require('../utils/createPackageURL')
const getPackage = require('./utils/getPackage')
const getPackageInfo = require('./utils/getPackageInfo')

const FindExtensions = [ '', '.js', '.json' ]

/**
 * Resolves a path like "lib/file" into "lib/file.js" or "lib/file.json"
 * depending on which one is available, similar to require('lib/file').
 */
function findFile(base, useIndex, callback) {
  FindExtensions.reduceRight(function (next, ext) {
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
          findFile(path.join(file, 'index'), false, function (error, indexFile, indexStats) {
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
 * Fetch the file from the registry and get its stats. Redirect if the URL
 * does not specify an exact version number or targets a directory with no
 * trailing slash.
 */
function fetchFile(req, res, next) {
  getPackageInfo(req.packageName, function (error, packageInfo) {
    if (error) {
      console.error(error)
      return res.status(500).type('text').send(`Cannot get info for package "${req.packageName}"`)
    }

    if (packageInfo == null || packageInfo.versions == null)
      return res.status(404).type('text').send(`Cannot find package "${req.packageName}"`)

    req.packageInfo = packageInfo

    const { versions, 'dist-tags': tags } = req.packageInfo

    if (req.packageVersion in versions) {
      // A valid request for a package we haven't downloaded yet.
      req.packageConfig = versions[req.packageVersion]

      getPackage(req.packageConfig, function (error, outputDir) {
        if (error) {
          console.error(error)
          res.status(500).type('text').send(`Cannot fetch package ${req.packageSpec}`)
        } else {
          req.packageDir = outputDir

          if (req.filename) {
            // Based on the URL, figure out which file they want.
            const base = path.join(req.packageDir, req.filename)

            findFile(base, false, function (error, file, stats) {
              if (error)
                console.error(error)

              if (file == null) {
                res.status(404).type('text').send(`Cannot find file "${req.filename}" in package ${req.packageSpec}`)
              } else if (stats.isDirectory() && req.pathname[req.pathname.length - 1] !== '/') {
                // Append / to directory URLs.
                res.status(301).redirect(`${req.pathname}/${req.search}`)
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
                return res.status(404).type('text').send(`Cannot find field "${queryMain}" in ${req.packageSpec} package config`)

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

            findFile(path.join(req.packageDir, mainFilename), true, function (error, file, stats) {
              if (error)
                console.error(error)

              if (file == null) {
                res.status(404).type('text').send(`Cannot find main file "${mainFilename}" in package ${req.packageSpec}`)
              } else {
                req.file = file.replace(req.packageDir, '')
                req.stats = stats
                next()
              }
            })
          }
        }
      })
    } else if (req.packageVersion in tags) {
      // Cache tag redirects for 1 minute.
      res.set({
        'Cache-Control': 'public, max-age=60',
        'Cache-Tag': 'redirect'
      }).redirect(302, createPackageURL(req.packageName, tags[req.packageVersion], req.filename, req.search))
    } else {
      const maxVersion = semver.maxSatisfying(Object.keys(versions), req.packageVersion)

      if (maxVersion) {
        // Cache semver redirects for 1 minute.
        res.set({
          'Cache-Control': 'public, max-age=60',
          'Cache-Tag': 'redirect'
        }).redirect(302, createPackageURL(req.packageName, maxVersion, req.filename, req.search))
      } else {
        res.status(404).type('text').send(`Cannot find package ${req.packageSpec}`)
      }
    }
  })
}

module.exports = fetchFile
