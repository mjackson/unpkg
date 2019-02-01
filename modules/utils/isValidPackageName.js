import validateNpmPackageName from 'validate-npm-package-name';

export default function isValidPackageName(packageName) {
  return validateNpmPackageName(packageName).errors == null;
}
