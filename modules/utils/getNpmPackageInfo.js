const cache = require('./cache');
const fetchNpmPackageInfo = require('./fetchNpmPackageInfo');

const notFound = '';

function cleanPackageConfig(packageConfig) {
  return {
    name: packageConfig.name,
    version: packageConfig.version,
    unpkg: packageConfig.unpkg,
    main: packageConfig.main,
    module: packageConfig.module,
    'js:next': packageConfig['js:next'],
    browser: packageConfig.browser,
    dependencies: Object.assign(
      {},
      packageConfig.dependencies,
      packageConfig.peerDependencies
    ),
    tarballURL: packageConfig.dist.tarball
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
    const value = cache.get(key);

    if (value != null) {
      console.log('GOT VALUE');
      resolve(value === notFound ? null : JSON.parse(value));
    } else {
      console.log('NO VALUE');
      fetchNpmPackageInfo(packageName).then(value => {
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
          cache.setex(key, 60, JSON.stringify(value));
          resolve(value);
        }
      }, reject);
    }
  });
}

module.exports = getNpmPackageInfo;
