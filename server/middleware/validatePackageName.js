const validateNpmPackageName = require("validate-npm-package-name");

/**
 * Reject requests for invalid npm package names.
 */
function validatePackageName(req, res, next) {
  const nameErrors = validateNpmPackageName(req.packageName).errors;

  if (nameErrors) {
    const reason = nameErrors.join(", ");
    return res
      .status(403)
      .type("text")
      .send(`Invalid package name "${req.packageName}" (${reason})`);
  }

  next();
}

module.exports = validatePackageName;
