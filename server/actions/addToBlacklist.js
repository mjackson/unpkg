const validateNpmPackageName = require("validate-npm-package-name")
const BlacklistAPI = require("../BlacklistAPI")

function addToBlacklist(req, res) {
  const packageName = req.body.packageName

  if (!packageName) {
    return res.status(403).send({ error: 'Missing "packageName" body parameter' })
  }

  const nameErrors = validateNpmPackageName(packageName).errors

  // Disallow invalid package names.
  if (nameErrors) {
    const reason = nameErrors.join(", ")
    return res.status(403).send({
      error: `Invalid package name "${packageName}" (${reason})`
    })
  }

  BlacklistAPI.addPackage(packageName).then(
    added => {
      if (added) {
        const userId = req.user.jti
        console.log(`Package "${packageName}" was added to the blacklist by ${userId}`)
      }

      res.set({ "Content-Location": `/_blacklist/${packageName}` }).send({
        ok: true,
        message: `Package "${packageName}" was ${added ? "added to" : "already in"} the blacklist`
      })
    },
    error => {
      console.error(error)
      res.status(500).send({
        error: `Unable to add "${packageName}" to the blacklist`
      })
    }
  )
}

module.exports = addToBlacklist
