const fs = require("fs")
const path = require("path")
const etag = require("etag")
const babel = require("babel-core")
const unpkgRewrite = require("babel-plugin-unpkg-rewrite")
const getMetadata = require("./utils/getMetadata")
const getFileContentType = require("./utils/getFileContentType")
const getIndexHTML = require("./utils/getIndexHTML")

/**
 * Automatically generate HTML pages that show package contents.
 */
const AutoIndex = !process.env.DISABLE_INDEX

/**
 * Maximum recursion depth for meta listings.
 */
const MaximumDepth = 128

function rewriteBareModuleIdentifiers(file, packageConfig, callback) {
  const dependencies = Object.assign({}, packageConfig.peerDependencies, packageConfig.dependencies)
  const options = {
    plugins: [unpkgRewrite(dependencies)]
  }

  babel.transformFile(file, options, (error, result) => {
    callback(error, result && result.code)
  })
}

/**
 * Send the file, JSON metadata, or HTML directory listing.
 */
function serveFile(req, res) {
  if (req.query.meta != null) {
    // Serve JSON metadata.
    getMetadata(req.packageDir, req.filename, req.stats, MaximumDepth, (error, metadata) => {
      if (error) {
        console.error(error)
        res
          .status(500)
          .type("text")
          .send(`Cannot generate metadata for ${req.packageSpec}${req.filename}`)
      } else {
        // Cache metadata for 1 year.
        res
          .set({
            "Cache-Control": "public, max-age=31536000",
            "Cache-Tag": "meta"
          })
          .send(metadata)
      }
    })
  } else if (req.stats.isFile()) {
    // Serve a file.
    const file = path.join(req.packageDir, req.filename)

    let contentType = getFileContentType(file)

    if (contentType === "text/html") contentType = "text/plain" // We can't serve HTML because bad people :(

    if (contentType === "application/javascript" && req.query.module != null) {
      // Serve a JavaScript module.
      rewriteBareModuleIdentifiers(file, req.packageConfig, (error, code) => {
        if (error) {
          console.error(error)
          const debugInfo =
            error.constructor.name +
            ": " +
            error.message.replace(/^.*?\/unpkg-.+?\//, `/${req.packageSpec}/`) +
            "\n\n" +
            error.codeFrame
          res
            .status(500)
            .type("text")
            .send(`Cannot generate module for ${req.packageSpec}${req.filename}\n\n${debugInfo}`)
        } else {
          // Cache modules for 1 year.
          res
            .set({
              "Content-Type": `${contentType}; charset=utf-8`,
              "Content-Length": Buffer.byteLength(code),
              "Cache-Control": "public, max-age=31536000",
              "Cache-Tag": "file,js-file,js-module"
            })
            .send(code)
        }
      })
    } else {
      // Serve some other static file.
      const tags = ["file"]

      const ext = path.extname(req.filename).substr(1)
      if (ext) tags.push(`${ext}-file`)

      if (contentType === "application/javascript") contentType += "; charset=utf-8"

      // Cache files for 1 year.
      res.set({
        "Content-Type": contentType,
        "Content-Length": req.stats.size,
        "Cache-Control": "public, max-age=31536000",
        "Last-Modified": req.stats.mtime.toUTCString(),
        ETag: etag(req.stats),
        "Cache-Tag": tags.join(",")
      })

      const stream = fs.createReadStream(file)

      stream.on("error", error => {
        console.error(`Cannot send file ${req.packageSpec}${req.filename}`)
        console.error(error)
        res.sendStatus(500)
      })

      stream.pipe(res)
    }
  } else if (AutoIndex && req.stats.isDirectory()) {
    // Serve an HTML directory listing.
    getIndexHTML(req.packageInfo, req.packageVersion, req.packageDir, req.filename).then(
      html => {
        // Cache HTML directory listings for 1 minute.
        res
          .set({
            "Cache-Control": "public, max-age=60",
            "Cache-Tag": "index"
          })
          .send(html)
      },
      error => {
        console.error(error)
        res
          .status(500)
          .type("text")
          .send(`Cannot generate index page for ${req.packageSpec}${req.filename}`)
      }
    )
  } else {
    res
      .status(403)
      .type("text")
      .send(`Cannot serve ${req.packageSpec}${req.filename}; it's not a file`)
  }
}

module.exports = serveFile
