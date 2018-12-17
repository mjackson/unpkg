const cache = require('./cache');
const fetchNpmPackageInfo = require('./fetchNpmPackageInfo');

const notFound = 0;

function cleanPackageConfig(packageConfig) {
  return {
    name: packageConfig.name,
    version: packageConfig.version,
    dependencies: packageConfig.dependencies,
    peerDependencies: packageConfig.peerDependencies,
    dist: packageConfig.dist
  };
}

function cleanPackageInfo(packageInfo) {
  return {
    versions: Object.keys(packageInfo.versions).reduce((memo, key) => {
      memo[key] = cleanPackageConfig(packageInfo.versions[key]);
      return memo;
    }, {}),
    'dist-tags': packageInfo['dist-tags']
  };
}

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
            // Cache 404s for 5 minutes. This prevents us from making
            // unnecessary requests to the registry for bad package names.
            // In the worst case, a brand new package's info will be
            // available within 5 minutes.
            cache.setex(key, 300, notFound);
            resolve(null);
          } else {
            const cachedValue = JSON.stringify(cleanPackageInfo(value));

            // Cache valid package info for 1 minute. In the worst case,
            // new versions won't be available for 1 minute.
            cache.setex(key, 60, cachedValue);
            resolve(value);
          }
        }, reject);
      }
    });
  });
}

module.exports = getNpmPackageInfo;
