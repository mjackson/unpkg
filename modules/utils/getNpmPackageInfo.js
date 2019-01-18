const cache = require('./cache');
const fetchNpmPackageInfo = require('./fetchNpmPackageInfo');

const notFound = '';

function cleanPackageInfo(packageInfo) {
  return {
    versions: Object.keys(packageInfo.versions).reduce((memo, key) => {
      memo[key] = packageInfo.versions[key];
      return memo;
    }, {}),
    'dist-tags': packageInfo['dist-tags']
  };
}

// added npmrc parameter to function decleration for
// use in generating NPM bearer authentication header
function getNpmPackageInfo(packageName, npmrc) {
  return new Promise((resolve, reject) => {

    // Don't cache private packages or try to retrieve them from cache.
    // Caching can be re-enabled if needed; however, some additional
    // adjustements to the caching scheme will need to be made in order
    // to handle the complexities around access, etc.

    const key = `npmPackageInfo-${packageName}`;
    const value = (npmrc) ? null : cache.get(key);

    if (value != null) {
      resolve(value === notFound ? null : JSON.parse(value));
    } else {
      fetchNpmPackageInfo(packageName, npmrc).then(value => {
        if (value == null) {
          // Cache 404s for 5 minutes. This prevents us from making
          // unnecessary requests to the registry for bad package names.
          // In the worst case, a brand new package's info will be
          // available within 5 minutes.
          cache.setex(key, 300, notFound);
          resolve(null);
        } else {
          value = cleanPackageInfo(value);

          // Cache valid package info for 1 minute. In the worst case,
          // new versions won't be available for 1 minute.
          if (!npmrc) {
            cache.setex(key, 60, JSON.stringify(value));
          }
          resolve(value);
        }
      }, reject);
    }
  });
}

module.exports = getNpmPackageInfo;
