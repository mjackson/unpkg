import parsePackageURL from '../utils/parsePackageURL';

/**
 * Parse the URL and add various properties to the request object to
 * do with the package/file being requested. Reject invalid URLs.
 */
export default function validatePackageURL(req, res, next) {
  const url = parsePackageURL(req.url);

  if (url == null) {
    return res.status(403).send({ error: `Invalid URL: ${req.url}` });
  }

  req.packageName = url.packageName;
  req.packageVersion = url.packageVersion;
  req.packageSpec = `${url.packageName}@${url.packageVersion}`;
  req.pathname = url.pathname; // TODO: remove
  req.filename = url.filename;
  req.search = url.search;
  req.query = url.query;

  next();
}
