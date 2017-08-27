const fs = require('fs')
const path = require('path')
const babel = require('babel-core')
const unpkgRewrite = require('babel-plugin-unpkg-rewrite')
const getMetadata = require('./utils/getMetadata')
const getFileContentType = require('./utils/getFileContentType')
const getIndexHTML = require('./utils/getIndexHTML')

/**
 * Automatically generate HTML pages that show package contents.
 */
const AutoIndex = !process.env.DISABLE_INDEX

/**
 * Maximum recursion depth for meta listings.
 */
const MaximumDepth = 128

const FileTransforms = {
  expand: function (file, dependencies, callback) {
    const options = {
      plugins: [
        unpkgRewrite(dependencies)
      ]
    }

    babel.transformFile(file, options, function (error, result) {
      callback(error, result && result.code)
    })
  }
}

/**
 * Send the file, JSON metadata, or HTML directory listing.
 */
function serveFile(req, res, next) {
  if (req.query.meta != null) {
    getMetadata(req.packageDir, req.filename, req.stats, MaximumDepth, function (error, metadata) {
      if (error) {
        console.error(error)
        res.status(500).type('text').send(`Cannot generate metadata for ${req.packageSpec}${req.filename}`)
      } else {
        // Cache metadata for 1 year.
        res.set({
          'Cache-Control': 'public, max-age=31536000',
          'Cache-Tag': 'meta'
        }).send(metadata)
      }
    })
  } else if (req.stats.isFile()) {
    const file = path.join(req.packageDir, req.filename)

    let contentType = getFileContentType(file)

    if (contentType === 'text/html')
      contentType = 'text/plain' // We can't serve HTML because bad people :(

    // Cache files for 1 year.
    res.set({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000'
    })

    if (contentType === 'application/javascript' && req.query.module != null) {
      const dependencies = Object.assign({},
        req.packageConfig.peerDependencies,
        req.packageConfig.dependencies
      )

      FileTransforms.expand(file, dependencies, function (error, code) {
        if (error) {
          console.error(error)
          res.status(500).type('text').send(`Cannot generate index page for ${req.packageSpec}${req.filename}`)
        } else {
          res.set({
            'Cache-Tag': 'file,module'
          }).send(code)
        }
      })
    } else {
      res.set({
        'Cache-Tag': 'file'
      }).sendFile(file, function (error) {
        if (error) {
          console.error(`Cannot send file ${req.packageSpec}${req.filename}`)
          console.error(error)
          // res.status(500).type('text').send(`Cannot send file ${req.packageSpec}${req.filename}`)
          res.sendStatus(500)
        }
      })
    }
  } else if (AutoIndex && req.stats.isDirectory()) {
    getIndexHTML(req.packageInfo, req.packageVersion, req.packageDir, req.filename, function (error, html) {
      if (error) {
        console.error(error)
        res.status(500).type('text').send(`Cannot generate index page for ${req.packageSpec}${req.filename}`)
      } else {
        // Cache HTML directory listings for 1 minute.
        res.set({
          'Cache-Control': 'public, max-age=60',
          'Cache-Tag': 'index'
        }).send(html)
      }
    })
  } else {
    res.status(403).type('text').send(`Cannot serve ${req.packageSpec}${req.filename}; it's not a file`)
  }
}

module.exports = serveFile
