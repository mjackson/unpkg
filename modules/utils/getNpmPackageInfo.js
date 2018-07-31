const cache = require("./cache");
const fetchNpmPackageInfo = require("./fetchNpmPackageInfo");

const notFound = "PackageNotFound";

function getNpmPackageInfo(packageName) {
  return new Promise((resolve, reject) => {
    const key = `npmPackageInfo-${packageName}`;

    cache.get(key, (error, value) => {
      if (error) {
        reject(error);
      } else if (value != null) {
        resolve(value === notFound ? null : JSON.parse(value));
      } else {
        fetchNpmPackageInfo(packageName).then(value => {
          if (value == null) {
            resolve(null);

            // Cache 404s for 5 minutes. This prevents us from making
            // unnecessary requests to the registry for bad package names.
            // In the worst case, a brand new package's info will be
            // available within 5 minutes.
            cache.setex(key, 300, notFound);
          } else {
            resolve(value);

            // Cache valid package info for 1 minute. In the worst case,
            // new versions won't be available for 1 minute.
            cache.setnx(key, JSON.stringify(value), (error, reply) => {
              if (reply === 1) cache.expire(key, 60);
            });
          }
        }, reject);
      }
    });
  });
}

module.exports = getNpmPackageInfo;
