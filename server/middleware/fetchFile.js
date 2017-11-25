const fs = require("fs")
const path = require("path")
const semver = require("semver")
const createPackageURL = require("../utils/createPackageURL")
const createSearch = require("./utils/createSearch")
const getPackageInfo = require("./utils/getPackageInfo")
const getPackage = require("./utils/getPackage")
const incrementCounter = require("./utils/incrementCounter")

function getBasename(file) {
  return path.basename(file, path.extname(file))
}

/**
 * File extensions to look for when automatically resolving.
 */
const FindExtensions = ["", ".js", ".json"]

/**
 * Resolves a path like "lib/file" into "lib/file.js" or "lib/file.json"
 * depending on which one is available, similar to require('lib/file').
 */
function findFile(base, useIndex, callback) {
  FindExtensions.reduceRight((next, ext) => {
    const file = base + ext

    return function() {
      fs.stat(file, function(error, stats) {
        if (error) {
          if (error.code === "ENOENT" || error.code === "ENOTDIR") {
            next()
          } else {
            callback(error)
          }
        } else if (useIndex && stats.isDirectory()) {
          findFile(path.join(file, "index"), false, function(error, indexFile, indexStats) {
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
  getPackageInfo(req.packageName, function(error, packageInfo) {
    if (error) {
      console.error(error)
      return res
        .status(500)
        .type("text")
        .send(`Cannot get info for package "${req.packageName}"`)
    }

    if (packageInfo == null || packageInfo.versions == null)
      return res
        .status(404)
        .type("text")
        .send(`Cannot find package "${req.packageName}"`)

    req.packageInfo = packageInfo

    if (req.packageVersion in req.packageInfo.versions) {
      // A valid request for a package we haven't downloaded yet.
      req.packageConfig = req.packageInfo.versions[req.packageVersion]

      getPackage(req.packageConfig, function(error, outputDir) {
        if (error) {
          console.error(error)
          res
            .status(500)
            .type("text")
            .send(`Cannot fetch package ${req.packageSpec}`)
        } else {
          req.packageDir = outputDir

          let filename = req.filename
          let useIndex = true

          if (req.query.module != null) {
            // They want an ES module. Try "module", "jsnext:main", and "/"
            // https://github.com/rollup/rollup/wiki/pkg.module
            if (!filename)
              filename = req.packageConfig.module || req.packageConfig["jsnext:main"] || "/"
          } else if (filename) {
            // They are requesting an explicit filename. Only try to find an
            // index file if they are NOT requesting an HTML directory listing.
            useIndex = filename[filename.length - 1] !== "/"
          } else if (req.query.main && typeof req.packageConfig[req.query.main] === "string") {
            // They specified a custom ?main field.
            filename = req.packageConfig[req.query.main]

            incrementCounter(
              "package-json-custom-main",
              req.packageSpec + "?main=" + req.query.main,
              1
            )
          } else if (typeof req.packageConfig.unpkg === "string") {
            // The "unpkg" field allows packages to explicitly declare the
            // file to serve at the bare URL (see #59).
            filename = req.packageConfig.unpkg
          } else if (typeof req.packageConfig.browser === "string") {
            // Fall back to the "browser" field if declared (only support strings).
            filename = req.packageConfig.browser

            // Count which packages + versions are actually using this fallback
            // so we can warn them when we deprecate this functionality.
            // See https://github.com/unpkg/unpkg/issues/63
            incrementCounter("package-json-browser-fallback", req.packageSpec, 1)
          } else {
            // Fall back to "main" or / (same as npm).
            filename = req.packageConfig.main || "/"
          }

          findFile(path.join(req.packageDir, filename), useIndex, function(error, file, stats) {
            if (error) console.error(error)

            if (file == null)
              return res
                .status(404)
                .type("text")
                .send(`Cannot find module "${filename}" in package ${req.packageSpec}`)

            filename = file.replace(req.packageDir, "")

            if (req.query.main != null || getBasename(req.filename) !== getBasename(filename)) {
              // Need to redirect to the module file so relative imports resolve
              // correctly. Cache module redirects for 1 minute.
              delete req.query.main
              res
                .set({
                  "Cache-Control": "public, max-age=60",
                  "Cache-Tag": "redirect,module-redirect"
                })
                .redirect(
                  302,
                  createPackageURL(
                    req.packageName,
                    req.packageVersion,
                    filename,
                    createSearch(req.query)
                  )
                )
            } else {
              req.filename = filename
              req.stats = stats
              next()
            }
          })
        }
      })
    } else if (req.packageVersion in req.packageInfo["dist-tags"]) {
      // Cache tag redirects for 1 minute.
      res
        .set({
          "Cache-Control": "public, max-age=60",
          "Cache-Tag": "redirect,tag-redirect"
        })
        .redirect(
          302,
          createPackageURL(
            req.packageName,
            req.packageInfo["dist-tags"][req.packageVersion],
            req.filename,
            req.search
          )
        )
    } else {
      const maxVersion = semver.maxSatisfying(
        Object.keys(req.packageInfo.versions),
        req.packageVersion
      )

      if (maxVersion) {
        // Cache semver redirects for 1 minute.
        res
          .set({
            "Cache-Control": "public, max-age=60",
            "Cache-Tag": "redirect,semver-redirect"
          })
          .redirect(302, createPackageURL(req.packageName, maxVersion, req.filename, req.search))
      } else {
        res
          .status(404)
          .type("text")
          .send(`Cannot find package ${req.packageSpec}`)
      }
    }
  })
}

module.exports = fetchFile
