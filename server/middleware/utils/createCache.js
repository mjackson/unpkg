const db = require("../../utils/redis");

function createCache(keyPrefix) {
  function createKey(key) {
    return keyPrefix + "-" + key;
  }

  function set(key, value, expiry, callback) {
    db.setex(createKey(key), expiry, JSON.stringify(value), callback);
  }

  function get(key, callback) {
    db.get(createKey(key), function(error, value) {
      callback(error, value && JSON.parse(value));
    });
  }

  function del(key, callback) {
    db.del(createKey(key), callback);
  }

  return {
    set,
    get,
    del
  };
}

module.exports = createCache;
