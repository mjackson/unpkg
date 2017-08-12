const fs = require('fs')
const path = require('path')
const etag = require('etag')
const Metadata = require('./MetadataUtils')
const { generateDirectoryIndexHTML } = require('./IndexUtils')
const { getContentType } = require('./FileUtils')

function sendFile(res, file, stats) {
  let contentType = getContentType(file)

  if (contentType === 'text/html')
    contentType = 'text/plain' // We can't serve HTML because bad people :(

  res.writeHead(200, {
    'Content-Type': contentType,
    'Content-Length': stats.size,
    'ETag': etag(stats)
  })

  const stream = fs.createReadStream(file)

  stream.on('error', (error) => {
    console.error(error)
    res.status(500).send('There was an error serving this file')
  })

  stream.pipe(res)
}

/**
 * Send the file, JSON metadata, or HTML directory listing.
 */
function serveFile(autoIndex, maximumDepth) {
  return function (req, res, next) {
    // TODO: remove support for "json" query param
    if (req.query.meta != null || req.query.json != null) {
      Metadata.get(req.packageDir, req.file, req.stats, maximumDepth, function (error, metadata) {
        if (error) {
          console.error(error)
          res.status(500).send(`Cannot generate JSON metadata for ${req.packageSpec}${req.filename}`)
        } else {
          // Cache metadata for 1 year.
          res.set('Cache-Control', 'public, max-age=31536000').send(metadata)
        }
      })
    } else if (req.stats.isFile()) {
      // Cache files for 1 year.
      res.set('Cache-Control', 'public, max-age=31536000')

      // TODO: use res.sendFile instead of our own sendFile?
      sendFile(res, path.join(req.packageDir, req.file), req.stats)
    } else if (autoIndex && req.stats.isDirectory()) {
      generateDirectoryIndexHTML(req.packageInfo, req.packageVersion, req.packageDir, req.file, function (error, html) {
        if (error) {
          console.error(error)
          res.status(500).send(`Cannot generate index page for ${req.packageSpec}${req.filename}`)
        } else {
          // Cache HTML directory listings for 1 minute.
          res.set('Cache-Control', 'public, max-age=60').send(html)
        }
      })
    } else {
      res.status(403).send(`Cannot serve ${req.packageSpec}${req.filename}; it's not a file`)
    }
  }
}

module.exports = serveFile
