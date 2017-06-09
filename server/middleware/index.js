const tmpdir = require('os-tmpdir')
const { join: joinPaths } = require('path')
const { stat: statFile, readFile } = require('fs')
const { maxSatisfying: maxSatisfyingVersion } = require('semver')
const { parsePackageURL, createPackageURL } = require('./PackageUtils')
const { getPackageInfo, getPackage } = require('./RegistryUtils')
const { generateDirectoryIndexHTML } = require('./IndexUtils')
const { generateMetadata } = require('./MetadataUtils')
const { getFileType } = require('./FileUtils')
const {
  sendNotFoundError,
  sendInvalidURLError,
  sendServerError,
  sendRedirect,
  sendFile,
  sendText,
  sendJSON,
  sendHTML
} = require('./ResponseUtils')

const OneMinute = 60
const OneDay = OneMinute * 60 * 24
const OneYear = OneDay * 365

const checkLocalCache = (dir, callback) =>
  statFile(joinPaths(dir, 'package.json'), (error, stats) => {
    callback(stats && stats.isFile())
  })

const createTempPath = (name) =>
  joinPaths(tmpdir(), `unpkg-${name}`)

const ResolveExtensions = [ '', '.js', '.json' ]

/**
 * Resolves a path like "lib/file" into "lib/file.js" or
 * "lib/file.json" depending on which one is available, similar
 * to how require('lib/file') does.
 */
const resolveFile = (path, useIndex, callback) => {
  ResolveExtensions.reduceRight((next, ext) => {
    const file = path + ext

    return () => {
      statFile(file, (error, stats) => {
        if (error) {
          if (error.code === 'ENOENT' || error.code === 'ENOTDIR') {
            next()
          } else {
            callback(error)
          }
        } else if (useIndex && stats.isDirectory()) {
          resolveFile(joinPaths(file, 'index'), false, (error, indexFile, indexStats) => {
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
 * Creates and returns a function that can be used in the "request"
 * event of a standard node HTTP server. Options are:
 *
 * - registryURL    The URL of the npm registry (defaults to https://registry.npmjs.org)
 * - redirectTTL    The TTL (in seconds) for redirects (defaults to 0)
 * - autoIndex      Automatically generate index HTML pages for directories (defaults to true)
 * - maximumDepth   The maximum recursion depth when generating metadata
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
const createRequestHandler = (options = {}) => {
  const registryURL = options.registryURL || 'https://registry.npmjs.org'
  const redirectTTL = options.redirectTTL || 0
  const autoIndex = options.autoIndex !== false
  const maximumDepth = options.maximumDepth || Number.MAX_VALUE

  const handleRequest = (req, res) => {
    let url
    try {
      url = parsePackageURL(req.url)
    } catch (error) {
      return sendInvalidURLError(res, req.url)
    }

    if (url == null)
      return sendInvalidURLError(res, req.url)

    const { pathname, search, query, packageName, version, filename } = url
    const displayName = `${packageName}@${version}`

    // Step 1: Fetch the package from the registry and store a local copy.
    // Redirect if the URL does not specify an exact version number.
    const fetchPackage = (next) => {
      const packageDir = createTempPath(displayName)

      checkLocalCache(packageDir, (isCached) => {
        if (isCached)
          return next(packageDir) // Best case: we already have this package on disk.

        // Fetch package info from NPM registry.
        getPackageInfo(registryURL, packageName, (error, packageInfo) => {
          if (error)
            return sendServerError(res, error)

          if (packageInfo == null || packageInfo.versions == null)
            return sendNotFoundError(res, `package "${packageName}"`)

          const { versions, 'dist-tags': tags } = packageInfo

          if (version in versions) {
            // A valid request for a package we haven't downloaded yet.
            const packageConfig = versions[version]
            const tarballURL = packageConfig.dist.tarball

            getPackage(tarballURL, packageDir, (error) => {
              if (error) {
                sendServerError(res, error)
              } else {
                next(packageDir)
              }
            })
          } else if (version in tags) {
            sendRedirect(res, createPackageURL(packageName, tags[version], filename, search), redirectTTL)
          } else {
            const maxVersion = maxSatisfyingVersion(Object.keys(versions), version)

            if (maxVersion) {
              sendRedirect(res, createPackageURL(packageName, maxVersion, filename, search), redirectTTL)
            } else {
              sendNotFoundError(res, `package ${displayName}`)
            }
          }
        })
      })
    }

    // Step 2: Determine which file we're going to serve and get its stats.
    // Redirect if the request targets a directory with no trailing slash.
    const findFile = (packageDir, next) => {
      if (filename) {
        const path = joinPaths(packageDir, filename)

        // Based on the URL, figure out which file they want.
        resolveFile(path, false, (error, file, stats) => {
          if (error) {
            sendServerError(res, error)
          } else if (file == null) {
            sendNotFoundError(res, `file "${filename}" in package ${displayName}`)
          } else if (stats.isDirectory() && pathname[pathname.length - 1] !== '/') {
            // Append `/` to directory URLs
            sendRedirect(res, pathname + '/' + search, OneYear)
          } else {
            next(file.replace(packageDir, ''), stats)
          }
        })
      } else {
        // No filename in the URL. Try to serve the package's "main" file.
        readFile(joinPaths(packageDir, 'package.json'), 'utf8', (error, data) => {
          if (error)
            return sendServerError(res, error)

          let packageConfig
          try {
            packageConfig = JSON.parse(data)
          } catch (error) {
            return sendText(res, 500, `Error parsing ${displayName}/package.json: ${error.message}`)
          }

          let mainFilename
          const queryMain = query && query.main

          if (queryMain) {
            if (!(queryMain in packageConfig))
              return sendNotFoundError(res, `field "${queryMain}" in ${displayName}/package.json`)

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

          resolveFile(joinPaths(packageDir, mainFilename), true, (error, file, stats) => {
            if (error) {
              sendServerError(res, error)
            } else if (file == null) {
              sendNotFoundError(res, `main file "${mainFilename}" in package ${displayName}`)
            } else {
              next(file.replace(packageDir, ''), stats)
            }
          })
        })
      }
    }

    // Step 3: Send the file, JSON metadata, or HTML directory listing.
    const serveFile = (baseDir, path, stats) => {
      if (query.json != null) {
        generateMetadata(baseDir, path, stats, maximumDepth, (error, metadata) => {
          if (metadata) {
            sendJSON(res, metadata, OneYear)
          } else {
            sendServerError(res, `unable to generate JSON metadata for ${displayName}${filename}`)
          }
        })
      } else if (stats.isFile()) {
        sendFile(res, joinPaths(baseDir, path), stats, OneYear)
      } else if (autoIndex && stats.isDirectory()) {
        getPackageInfo(registryURL, packageName, (error, packageInfo) => {
          if (error) {
            sendServerError(res, `unable to generate index page for ${displayName}${filename}`)
          } else {
            generateDirectoryIndexHTML(packageInfo, version, baseDir, path, (error, html) => {
              if (html) {
                sendHTML(res, html, OneYear)
              } else {
                sendServerError(res, `unable to generate index page for ${displayName}${filename}`)
              }
            })
          }
        })
      } else {
        sendInvalidURLError(res, `${displayName}${filename} is a ${getFileType(stats)}`)
      }
    }

    fetchPackage(packageDir => {
      findFile(packageDir, (file, stats) => {
        serveFile(packageDir, file, stats)
      })
    })
  }

  return handleRequest
}

module.exports = createRequestHandler
