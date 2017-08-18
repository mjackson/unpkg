const getMetadata = require('./utils/getMetadata')

/**
 * Maximum recursion depth for meta listings.
 */
const MaximumDepth = 128

function serveMetadata(req, res) {
  getMetadata(req.packageDir, req.file, req.stats, MaximumDepth, function (error, metadata) {
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
}

module.exports = serveMetadata
