import validateNpmPackageName from 'validate-npm-package-name';

import { removePackage } from '../utils/blacklist';

export default function removeFromBlacklist(req, res) {
  // TODO: Remove req.packageName when DELETE
  // /_blacklist/:packageName API is removed
  const packageName = req.body.packageName || req.packageName;

  if (!packageName) {
    return res
      .status(403)
      .send({ error: 'Missing "packageName" body parameter' });
  }

  const nameErrors = validateNpmPackageName(packageName).errors;

  // Disallow invalid package names.
  if (nameErrors) {
    const reason = nameErrors.join(', ');
    return res.status(403).send({
      error: `Invalid package name "${packageName}" (${reason})`
    });
  }

  removePackage(packageName).then(
    removed => {
      if (removed) {
        const userId = req.user.jti;
        console.log(
          `Package "${packageName}" was removed from the blacklist by ${userId}`
        );
      }

      res.send({
        ok: true,
        message: `Package "${packageName}" was ${
          removed ? 'removed from' : 'not in'
        } the blacklist`
      });
    },
    error => {
      console.error(error);

      res.status(500).send({
        error: `Unable to remove "${packageName}" from the blacklist`
      });
    }
  );
}
