const createMutex = require("./createMutex");
const fetchPackage = require("./fetchPackage");

const fetchMutex = createMutex((packageConfig, callback) => {
  fetchPackage(packageConfig).then(
    outputDir => {
      callback(null, outputDir);
    },
    error => {
      callback(error);
    }
  );
}, packageConfig => packageConfig.dist.tarball);

function getPackage(packageConfig) {
  return new Promise((resolve, reject) => {
    fetchMutex(packageConfig, (error, value) => {
      if (error) {
        reject(error);
      } else {
        resolve(value);
      }
    });
  });
}

module.exports = getPackage;
