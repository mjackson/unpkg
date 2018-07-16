const cache = require("./cache");
const createMutex = require("./createMutex");
const fetchNpmPackageInfo = require("./fetchNpmPackageInfo");

const notFound = "PackageNotFound";

const mutex = createMutex((packageName, callback) => {
  const key = `packageInfo2-${packageName}`;

  cache.get(key, (error, value) => {
    if (error) {
      callback(error);
    } else if (value != null) {
      callback(null, value === notFound ? null : JSON.parse(value));
    } else {
      fetchNpmPackageInfo(packageName).then(
        value => {
          if (value == null) {
            // Cache 404s for 5 minutes. This prevents us from making
            // unnecessary requests to the registry for bad package names.
            // In the worst case, a brand new package's info will be
            // available within 5 minutes.
            cache.setex(key, 300, notFound, () => {
              callback(null, null);
            });
          } else {
            // Cache valid package info for 1 minute. In the worst case,
            // new versions won't be available for 1 minute.
            cache.setnx(key, JSON.stringify(value), (error, reply) => {
              if (reply === 1) cache.expire(key, 60);
              callback(null, value);
            });
          }
        },
        error => {
          // Do not cache errors.
          cache.del(key);
          callback(error);
        }
      );
    }
  });
});

function getNpmPackageInfo(packageName) {
  return new Promise((resolve, reject) => {
    mutex(packageName, (error, value) => {
      if (error) {
        reject(error);
      } else {
        resolve(value);
      }
    });
  });
}

module.exports = getNpmPackageInfo;
