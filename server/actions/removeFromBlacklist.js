const validateNpmPackageName = require("validate-npm-package-name")
const BlacklistAPI = require("../BlacklistAPI")

function removeFromBlacklist(req, res) {
  const packageName = req.packageName

  BlacklistAPI.removePackage(packageName).then(
    removed => {
      if (removed) {
        const userId = req.user.jti
        console.log(`Package "${packageName}" was removed from the blacklist by ${userId}`)
      }

      res.send({
        ok: true,
        message: `Package "${packageName}" was ${removed ? "removed from" : "not in"} the blacklist`
      })
    },
    error => {
      console.error(error)

      res.status(500).send({
        error: `Unable to remove "${packageName}" from the blacklist`
      })
    }
  )
}

module.exports = removeFromBlacklist
