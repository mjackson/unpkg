import createSearch from '../utils/createSearch.js';

/**
 * Redirect old URLs that we no longer support.
 */
export default function redirectLegacyURLs(req, res, next) {
  // Permanently redirect /_meta/path to /path?meta
  if (req.path.match(/^\/_meta\//)) {
    req.query.meta = '';
    return res.redirect(301, req.path.substr(6) + createSearch(req.query));
  }

  // Permanently redirect /path?json => /path?meta
  if (req.query.json != null) {
    delete req.query.json;
    req.query.meta = '';
    return res.redirect(301, req.path + createSearch(req.query));
  }

  next();
}
