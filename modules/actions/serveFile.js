const serveAutoIndexPage = require("./serveAutoIndexPage");
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
    return serveJavaScriptModule(req, res);
  }

  serveStaticFile(req, res);
}

module.exports = serveFile;
