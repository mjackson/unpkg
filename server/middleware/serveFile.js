const fs = require('fs')
const path = require('path')
const qs = require('querystring')
const etag = require('etag')
const getFileContentType = require('./utils/getFileContentType')
const getIndexHTML = require('./utils/getIndexHTML')

/**
 * Automatically generate HTML pages that show package contents.
 */
const AutoIndex = !process.env.DISABLE_INDEX

function sendFile(res, file, stats) {
  let contentType = getFileContentType(file)

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
    res.status(500).type('text').send('There was an error serving this file')
  })

  stream.pipe(res)
}

/**
 * Send the file, JSON metadata, or HTML directory listing.
 */
function serveFile(req, res, next) {
  if (req.query.meta != null || req.query.json != null) {
    // Preserve support for ?meta and ?json for backwards compat.
    delete req.query.meta
    delete req.query.json
    const search = qs.stringify(req.query)
    res.redirect(`/_meta${req.pathname}${search}`)
  } else if (req.stats.isFile()) {
    // Cache files for 1 year.
    res.set({
      'Cache-Control': 'public, max-age=31536000',
      'Cache-Tag': 'file'
    })

    // TODO: use res.sendFile instead of our own sendFile?
    sendFile(res, path.join(req.packageDir, req.file), req.stats)
  } else if (AutoIndex && req.stats.isDirectory()) {
    getIndexHTML(req.packageInfo, req.packageVersion, req.packageDir, req.file, function (error, html) {
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
