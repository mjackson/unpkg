const validateNpmPackageName = require('validate-npm-package-name');

function isValidPackageName(packageName) {
  return validateNpmPackageName(packageName).errors == null;
}

module.exports = isValidPackageName;
