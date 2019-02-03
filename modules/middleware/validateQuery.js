import createSearch from '../utils/createSearch';

const knownQueryParams = {
  main: true, // Deprecated, see #63
  meta: true,
  module: true
};

function isKnownQueryParam(param) {
  return !!knownQueryParams[param];
}

/**
 * Reject URLs with invalid query parameters to increase cache hit rates.
 */
export default function validateQuery(req, res, next) {
  const keys = Object.keys(req.query);

  if (keys.every(isKnownQueryParam)) {
    return next();
  }

  const newQuery = {};

  keys.forEach(param => {
    if (isKnownQueryParam(param)) {
      newQuery[param] = req.query[param];
    }
  });

  return res.redirect(302, req.path + createSearch(newQuery));
}
