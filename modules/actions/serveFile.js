const serveAutoIndexPage = require("./serveAutoIndexPage");
const serveHTMLModule = require("./serveHTMLModule");
const serveJavaScriptModule = require("./serveJavaScriptModule");
const serveStaticFile = require("./serveStaticFile");
const serveMetadata = require("./serveMetadata");

/**
 * Send the file, JSON metadata, or HTML directory listing.
 */
function serveFile(req, res) {
  if (req.query.meta != null) {
    return serveMetadata(req, res);
  }

  if (req.entry.type === "directory") {
    return serveAutoIndexPage(req, res);
  }

  if (req.query.module != null) {
    if (req.entry.contentType === "application/javascript") {
      return serveJavaScriptModule(req, res);
    }

    if (req.entry.contentType === "text/html") {
      return serveHTMLModule(req, res);
    }

    return res
      .status(403)
      .type("text")
      .send("?module mode is available only for JavaScript and HTML files");
  }

  serveStaticFile(req, res);
}

module.exports = serveFile;
