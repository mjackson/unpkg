import serveAutoIndexPage from './serveAutoIndexPage.js';
import serveMetadata from './serveMetadata.js';
import serveModule from './serveModule.js';
import serveStaticFile from './serveStaticFile.js';

/**
 * Send the file, JSON metadata, or HTML directory listing.
 */
export default function serveFile(req, res) {
  if (req.query.meta != null) {
    return serveMetadata(req, res);
  }

  if (req.entry.type === 'directory') {
    return serveAutoIndexPage(req, res);
  }

  if (req.query.module != null) {
    return serveModule(req, res);
  }

  serveStaticFile(req, res);
}
