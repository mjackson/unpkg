import validateNpmPackageName from 'validate-npm-package-name';

const hexValue = /^[a-f0-9]+$/i;

function isHash(value) {
  return value.length === 32 && hexValue.test(value);
}

/**
 * Reject requests for invalid npm package names.
 */
export default function validatePackageName(req, res, next) {
  if (isHash(req.packageName)) {
    return res
      .status(403)
      .type('text')
      .send(`Invalid package name "${req.packageName}" (cannot be a hash)`);
  }

  const errors = validateNpmPackageName(req.packageName).errors;

  if (errors) {
    const reason = errors.join(', ');

    return res
      .status(403)
      .type('text')
      .send(`Invalid package name "${req.packageName}" (${reason})`);
  }

  next();
}
