const path = require('path')
const PackageInfo = require('../PackageInfo')
const { generateMetadata } = require('./MetadataUtils')
const { generateDirectoryIndexHTML } = require('./IndexUtils')
const { sendFile } = require('./ResponseUtils')

/**
 * Send the file, JSON metadata, or HTML directory listing.
 */
function serveFile(autoIndex, maximumDepth) {
  return function (req, res, next) {
    // TODO: change query param from "json" to "meta"
    if (req.query.json != null) {
      generateMetadata(req.packageDir, req.file, req.stats, maximumDepth, function (error, metadata) {
        if (metadata) {
          res.set('Cache-Control', 'public, max-age=31536000').send(metadata)
        } else {
          res.status(500).send(`Cannot generate JSON metadata for ${req.packageSpec}${req.filename}`)
        }
      })
    } else if (req.stats.isFile()) {
      // TODO: use res.sendFile instead of our own custom function?
      sendFile(res, path.join(req.packageDir, req.file), req.stats, 31536000)
    } else if (autoIndex && req.stats.isDirectory()) {
      PackageInfo.get(req.packageName, function (error, packageInfo) {
        if (error) {
          res.status(500).send(`Cannot generate index page for ${req.packageSpec}${req.filename}`)
        } else {
          generateDirectoryIndexHTML(packageInfo, req.packageVersion, req.packageDir, req.file, function (error, html) {
            if (html) {
              res.send(html)
            } else {
              res.status(500).send(`Cannot generate index page for ${req.packageSpec}${req.filename}`)
            }
          })
        }
      })
    } else {
      res.status(403).send(`Cannot serve ${req.packageSpec}${req.filename}; it's not a req.file`)
    }
  }
}

module.exports = serveFile
