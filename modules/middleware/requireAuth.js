/**
 * Adds the given scope to the array in req.auth if the user has sufficient
 * permissions. Otherwise rejects the request.
 */
function requireAuth(scope) {
  let checkScopes;
  if (scope.includes('.')) {
    const parts = scope.split('.');
    checkScopes = scopes =>
      parts.reduce((memo, part) => memo && memo[part], scopes) != null;
  } else {
    checkScopes = scopes => scopes[scope] != null;
  }

  return function(req, res, next) {
    if (req.auth && req.auth.includes(scope)) {
      return next(); // Already auth'd
    }

    const user = req.user;

    if (!user) {
      return res.status(403).send({ error: 'Missing auth token' });
    }

    if (!user.scopes || !checkScopes(user.scopes)) {
      return res.status(403).send({ error: 'Insufficient scopes' });
    }

    if (req.auth) {
      req.auth.push(scope);
    } else {
      req.auth = [scope];
    }

    next();
  };
}

module.exports = requireAuth;
