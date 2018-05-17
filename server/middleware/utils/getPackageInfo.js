require("isomorphic-fetch");

const config = require("../../config");

const createCache = require("./createCache");
const createMutex = require("./createMutex");

const packageInfoCache = createCache("packageInfo");

function fetchPackageInfo(packageName) {
  console.log(`info: Fetching package info for ${packageName}`);

  let encodedPackageName;
  if (packageName.charAt(0) === "@") {
    encodedPackageName = `@${encodeURIComponent(packageName.substring(1))}`;
  } else {
    encodedPackageName = encodeURIComponent(packageName);
  }

  const url = `${config.registryURL}/${encodedPackageName}`;

  return fetch(url, {
    headers: {
      Accept: "application/json"
    }
  }).then(res => {
    return res.status === 404 ? null : res.json();
  });
}

const PackageNotFound = "PackageNotFound";

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
        packageInfoCache.set(packageName, PackageNotFound, 300, () => {
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

function getPackageInfo(packageName, callback) {
  packageInfoCache.get(packageName, (error, value) => {
    if (error || value != null) {
      callback(error, value === PackageNotFound ? null : value);
    } else {
      fetchMutex(packageName, packageName, callback);
    }
  });
}

module.exports = getPackageInfo;
