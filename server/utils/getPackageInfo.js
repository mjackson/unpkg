const createCache = require("./createCache");
const createMutex = require("./createMutex");
const fetchPackageInfo = require("./fetchPackageInfo");

const cache = createCache("packageInfo");
const notFound = "PackageNotFound";

const fetchMutex = createMutex((packageName, callback) => {
  cache.get(packageName, (error, value) => {
    if (error) {
      callback(error);
    } else if (value != null) {
      callback(null, value === notFound ? null : value);
    } else {
      fetchPackageInfo(packageName).then(
        value => {
          if (value == null) {
            // Cache 404s for 5 minutes. This prevents us from making
            // unnecessary requests to the registry for bad package names.
            // In the worst case, a brand new package's info will be
            // available within 5 minutes.
            cache.set(packageName, notFound, 300, () => {
              callback(null, value);
            });
          } else {
            // Cache valid package info for 1 minute.
            cache.set(packageName, value, 60, () => {
              callback(null, value);
            });
          }
        },
        error => {
          // Do not cache errors.
          cache.del(packageName, () => {
            callback(error);
          });
        }
      );
    }
  });
});

function getPackageInfo(packageName) {
  return new Promise((resolve, reject) => {
    fetchMutex(packageName, (error, value) => {
      if (error) {
        reject(error);
      } else {
        resolve(value);
      }
    });
  });
}

module.exports = getPackageInfo;
