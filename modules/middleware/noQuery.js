/**
 * Strips all query params from the URL to increase cache hit rates.
 */
export default function noQuery() {
  return (req, res, next) => {
    const keys = Object.keys(req.query);

    if (keys.length) {
      return res.redirect(302, req.baseUrl + req.path);
    }

    next();
  };
}
