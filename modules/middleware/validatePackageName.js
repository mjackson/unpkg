const validateNpmPackageName = require("validate-npm-package-name");

/**
 * Reject requests for invalid npm package names.
 */
function validatePackageName(req, res, next) {
  const errors = validateNpmPackageName(req.packageName).errors;

  if (errors) {
    const reason = errors.join(", ");

    return res
      .status(403)
      .type("text")
      .send(`Invalid package name "${req.packageName}" (${reason})`);
  }

  next();
}

module.exports = validatePackageName;
