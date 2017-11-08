function checkBlacklist(blacklist) {
  return function(req, res, next) {
    // Do not allow packages that have been blacklisted.
    if (blacklist.includes(req.packageName)) {
      res
        .status(403)
        .type('text')
        .send(`Package "${req.packageName}" is blacklisted`)
    } else {
      next()
    }
  }
}

module.exports = checkBlacklist
