const db = require("./utils/redis");

const blacklistSet = "blacklisted-packages";
const objectPrototypes = Object.getOwnPropertyNames(Object.prototype);

function addPackage(packageName) {
  return new Promise((resolve, reject) => {
    db.sadd(blacklistSet, packageName, (error, value) => {
      if (error) {
        reject(error);
      } else {
        resolve(value === 1);
      }
    });
  });
}

function removePackage(packageName) {
  return new Promise((resolve, reject) => {
    db.srem(blacklistSet, packageName, (error, value) => {
      if (error) {
        reject(error);
      } else {
        resolve(value === 1);
      }
    });
  });
}

function removeAllPackages() {
  return new Promise((resolve, reject) => {
    db.del(blacklistSet, error => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

function getPackages() {
  return new Promise((resolve, reject) => {
    db.smembers(blacklistSet, (error, value) => {
      if (error) {
        reject(error);
      } else {
        resolve(value);
      }
    });
  });
}

function includesPackage(packageName) {
  return new Promise((resolve, reject) => {
    if (objectPrototypes.indexOf(packageName) > -1) {
      reject("Disallowed package name.");
    } else {
      db.sismember(blacklistSet, packageName, (error, value) => {
        if (error) {
          reject(error);
        } else {
          resolve(value === 1);
        }
      });
    }
  });
}

module.exports = {
  addPackage,
  removePackage,
  removeAllPackages,
  getPackages,
  includesPackage
};
