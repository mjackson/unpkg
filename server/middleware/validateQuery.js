const createSearch = require("../utils/createSearch");

const knownQueryParams = {
  main: true, // Deprecated, see #63
  meta: true,
  module: true,
  bundle: true
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
function validateQuery(req, res, next) {
  if (!Object.keys(req.query).every(isKnownQueryParam)) {
    return res.redirect(302, req.path + createSearch(sanitizeQuery(req.query)));
  }

  next();
}

module.exports = validateQuery;
