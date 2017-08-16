const db = require('./RedisClient')

function createKey(packageName) {
  return 'packageInfo-' + packageName
}

function set(packageName, value, expiry, callback) {
  db.setex(createKey(packageName), expiry, JSON.stringify(value), callback)
}

function get(packageName, callback) {
  db.get(createKey(packageName), function (error, value) {
    callback(error, value && JSON.parse(value))
  })
}

function del(packageName, callback) {
  db.del(createKey(packageName), callback)
}

module.exports = {
  set,
  get,
  del
}
