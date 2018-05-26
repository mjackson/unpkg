const fs = require("fs");
const mkdirp = require("mkdirp");
const lockfile = require("proper-lockfile");

const createMutex = require("./createMutex");
const createTempPath = require("./createTempPath");
const fetchPackage = require("./fetchPackage");

const fetchMutex = createMutex((packageConfig, callback) => {
  const tarballURL = packageConfig.dist.tarball;
  const outputDir = createTempPath(packageConfig.name, packageConfig.version);

  fs.access(outputDir, error => {
    if (error) {
      if (error.code === "ENOENT" || error.code === "ENOTDIR") {
        // ENOENT or ENOTDIR are to be expected when we haven't yet
        // fetched a package for the first time. Carry on!
        mkdirp.sync(outputDir);
        const release = lockfile.lockSync(outputDir);

        fetchPackage(tarballURL, outputDir).then(
          () => {
            release();
            callback(null, outputDir);
          },
          error => {
            release();
            callback(error);
          }
        );
      } else {
        callback(error);
      }
    } else {
      lockfile.check(outputDir).then(locked => {
        if (locked) {
          // Another process on this same machine has locked the
          // directory. We need to wait for it to be unlocked
          // before we callback.
          const timer = setInterval(() => {
            lockfile.check(outputDir).then(
              locked => {
                if (!locked) {
                  clearInterval(timer);
                  callback(null, outputDir);
                }
              },
              error => {
                clearInterval(timer);
                callback(error);
              }
            );
          }, 10);

          timer.unref();
        } else {
          // Best case: we already have this package cached on disk
          // and it's not locked!
          callback(null, outputDir);
        }
      }, callback);
    }
  });
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
