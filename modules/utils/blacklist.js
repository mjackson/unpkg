import data from './data';

const blacklistSet = 'blacklisted-packages';

export function addPackage(packageName) {
  return new Promise((resolve, reject) => {
    data.sadd(blacklistSet, packageName, (error, value) => {
      if (error) {
        reject(error);
      } else {
        resolve(value === 1);
      }
    });
  });
}

export function removePackage(packageName) {
  return new Promise((resolve, reject) => {
    data.srem(blacklistSet, packageName, (error, value) => {
      if (error) {
        reject(error);
      } else {
        resolve(value === 1);
      }
    });
  });
}

export function removeAllPackages() {
  return new Promise((resolve, reject) => {
    data.del(blacklistSet, error => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

export function getPackages() {
  return new Promise((resolve, reject) => {
    data.smembers(blacklistSet, (error, value) => {
      if (error) {
        reject(error);
      } else {
        resolve(value);
      }
    });
  });
}

export function includesPackage(packageName) {
  return new Promise((resolve, reject) => {
    data.sismember(blacklistSet, packageName, (error, value) => {
      if (error) {
        reject(error);
      } else {
        resolve(value === 1);
      }
    });
  });
}
