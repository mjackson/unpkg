const LRUCache = require('lru-cache');

const maxMegabytes = 40; // Cap the cache at 40 MB
const maxLength = maxMegabytes * 1024 * 1024;

const maxSeconds = 60;
const maxAge = maxSeconds * 1000;

const cache = new LRUCache({
  max: maxLength,
  maxAge: maxAge,
  length: Buffer.byteLength
});

function get(key) {
  return cache.get(key);
}

function setex(key, ttlSeconds, value) {
  return cache.set(key, value, ttlSeconds * 1000);
}

module.exports = { get, setex };
