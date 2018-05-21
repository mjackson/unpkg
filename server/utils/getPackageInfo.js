const createCache = require("./createCache");
const createMutex = require("./createMutex");
const fetchPackageInfo = require("./fetchPackageInfo");

const packageInfoCache = createCache("packageInfo");
const packageNotFound = "PackageNotFound";

// This mutex prevents multiple concurrent requests to
// the registry for the same package info.
const fetchMutex = createMutex((packageName, callback) => {
  fetchPackageInfo(packageName).then(
    value => {
      if (value == null) {
        // Cache 404s for 5 minutes. This prevents us from making
        // unnecessary requests to the registry for bad package names.
        // In the worst case, a brand new package's info will be
        // available within 5 minutes.
        packageInfoCache.set(packageName, packageNotFound, 300, () => {
          callback(null, value);
        });
      } else {
        // Cache valid package info for 1 minute.
        packageInfoCache.set(packageName, value, 60, () => {
          callback(null, value);
        });
      }
    },
    error => {
      // Do not cache errors.
      packageInfoCache.del(packageName, () => {
        callback(error);
      });
    }
  );
});

function getPackageInfo(packageName) {
  return new Promise((resolve, reject) => {
    packageInfoCache.get(packageName, (error, value) => {
      if (error) {
        reject(error);
      } else if (value != null) {
        resolve(value === packageNotFound ? null : value);
      } else {
        fetchMutex(packageName, (error, value) => {
          if (error) {
            reject(error);
          } else {
            resolve(value);
          }
        });
      }
    });
  });
}

module.exports = getPackageInfo;
