const BlacklistAPI = require('../BlacklistAPI')

function checkBlacklist(req, res, next) {
  BlacklistAPI.containsPackage(req.packageName).then(
    blacklisted => {
      // Disallow packages that have been blacklisted.
      if (blacklisted) {
        res
          .status(403)
          .type('text')
          .send(`Package "${req.packageName}" is blacklisted`)
      } else {
        next()
      }
    },
    error => {
      console.error(error)

      res.status(500).send({
        error: 'Unable to fetch the blacklist'
      })
    }
  )
}

module.exports = checkBlacklist
