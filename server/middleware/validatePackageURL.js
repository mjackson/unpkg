const parsePackageURL = require("../utils/parsePackageURL");

/**
 * Adds various properties to the request object to do with the
 * package/file being requested.
 */
function validatePackageURL(req, res, next) {
  const url = parsePackageURL(req.url);

  if (url == null) {
    return res.status(403).send({ error: `Invalid URL: ${req.url}` });
  }

  req.packageName = url.packageName;
  req.packageVersion = url.packageVersion;
  req.packageSpec = `${url.packageName}@${url.packageVersion}`;
  req.pathname = url.pathname;
  req.filename = url.filename;
  req.search = url.search;
  req.query = url.query;

  next();
}

module.exports = validatePackageURL;
