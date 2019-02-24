/**
 * Redirect old URLs that we no longer support.
 */
export default function redirectLegacyURLs(req, res, next) {
  // Permanently redirect /_meta/path to /_metadata/path
  if (req.path.match(/^\/_meta\//)) {
    return res.redirect(301, '/_metadata' + req.path.substr(6));
  }

  // Permanently redirect /path?json => /path?meta
  if (req.query.json != null) {
    return res.redirect(301, '/_metadata' + req.path);
  }

  next();
}
