import createSearch from '../utils/createSearch';

const knownQueryParams = {
  main: true, // Deprecated, see #63
  meta: true, // Deprecated
  module: true // Deprecated
};

function isKnownQueryParam(param) {
  return !!knownQueryParams[param];
}

function sanitizeQuery(originalQuery) {
  const query = {};

  Object.keys(originalQuery).forEach(param => {
    if (isKnownQueryParam(param)) query[param] = originalQuery[param];
  });

  return query;
}

/**
 * Reject URLs with invalid query parameters to increase cache hit rates.
 */
export default function validateQuery(req, res, next) {
  if (!Object.keys(req.query).every(isKnownQueryParam)) {
    return res.redirect(302, req.path + createSearch(sanitizeQuery(req.query)));
  }

  next();
}
