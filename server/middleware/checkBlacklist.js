const blacklist = require('../PackageBlacklist').blacklist

/**
 * Check the blacklist to see if we can serve files from this package.
 */
function checkBlacklist(req, res, next) {
  if (blacklist.includes(req.packageName)) {
    res.status(403).send(`Package ${req.packageName} is blacklisted`)
  } else {
    next()
  }
}

module.exports = checkBlacklist
