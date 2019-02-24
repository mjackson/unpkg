import serveAutoIndexPage from './serveAutoIndexPage';
import serveMetadata from './serveMetadata';
import serveModule from './serveModule';
import serveStaticFile from './serveStaticFile';

/**
 * Send the file, JSON metadata, or HTML directory listing.
 */
export default function serveFile(req, res) {
  // Deprecated.
  if (req.query.meta != null) {
    return serveMetadata(req, res);
  }

  if (req.entry.type === 'directory') {
    return serveAutoIndexPage(req, res);
  }

  // Deprecated.
  if (req.query.module != null) {
    return serveModule(req, res);
  }

  serveStaticFile(req, res);
}
