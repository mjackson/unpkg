import LRUCache from 'lru-cache';

import fetchNpmPackageInfo from './fetchNpmPackageInfo';

const maxMegabytes = 40; // Cap the cache at 40 MB
const maxLength = maxMegabytes * 1024 * 1024;
const oneSecond = 1000;
const oneMinute = 60 * oneSecond;

const cache = new LRUCache({
  max: maxLength,
  maxAge: oneMinute,
  length: Buffer.byteLength
});

const notFound = '';

export default function getNpmPackageInfo(packageName) {
  return new Promise((resolve, reject) => {
    const key = `npmPackageInfo-${packageName}`;
    const value = cache.get(key);

    if (value != null) {
      resolve(value === notFound ? null : JSON.parse(value));
    } else {
      fetchNpmPackageInfo(packageName).then(info => {
        if (info == null) {
          // Cache 404s for 5 minutes. This prevents us from making
          // unnecessary requests to the registry for bad package names.
          // In the worst case, a brand new package's info will be
          // available within 5 minutes.
          cache.set(key, notFound, oneMinute * 5);
          resolve(null);
        } else {
          // Cache valid package info for 1 minute. In the worst case,
          // new versions won't be available for 1 minute.
          cache.set(key, JSON.stringify(info), oneMinute);
          resolve(info);
        }
      }, reject);
    }
  });
}
