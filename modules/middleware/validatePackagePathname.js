import parsePackagePathname from '../utils/parsePackagePathname.js';

/**
 * Parse the pathname in the URL. Reject invalid URLs.
 */
export default function validatePackagePathname(req, res, next) {
  const parsed = parsePackagePathname(req.path);

  if (parsed == null) {
    return res.status(403).send({ error: `Invalid URL: ${req.path}` });
  }

  req.packageName = parsed.packageName;
  req.packageVersion = parsed.packageVersion;
  req.packageSpec = parsed.packageSpec;
  req.filename = parsed.filename;

  next();
}
