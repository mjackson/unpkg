const redis = require('redis')

const RedisURL = process.env.OPENREDIS_URL || 'redis://localhost:6379'

const db = redis.createClient(RedisURL)

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
