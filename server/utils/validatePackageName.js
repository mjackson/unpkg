const validateNpmPackageName = require("validate-npm-package-name");

function validatePackageName(packageName) {
  return validateNpmPackageName(packageName).errors == null;
}

module.exports = validatePackageName;
