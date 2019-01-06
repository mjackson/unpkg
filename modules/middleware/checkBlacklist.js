import { includesPackage } from '../utils/blacklist';

export default function checkBlacklist(req, res, next) {
  includesPackage(req.packageName).then(
    blacklisted => {
      // Disallow packages that have been blacklisted.
      if (blacklisted) {
        res
          .status(403)
          .type('text')
          .send(`Package "${req.packageName}" is blacklisted`);
      } else {
        next();
      }
    },
    error => {
      console.error('Unable to fetch the blacklist: %s', error);

      // Continue anyway.
      next();
    }
  );
}
