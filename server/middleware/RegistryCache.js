const redis = require('redis')

const RedisURL = process.env.OPENREDIS_URL || 'redis://localhost:6379'

const db = redis.createClient(RedisURL)

const createKey = (key) => 'registryCache-' + key

const set = (key, value, expiry) => {
  db.setex(createKey(key), expiry, JSON.stringify(value))
}

const get = (key, callback) => {
  db.get(createKey(key), (error, value) => {
    callback(error, value && JSON.parse(value))
  })
}

const del = (key) => {
  db.del(createKey(key))
}

module.exports = {
  set,
  get,
  del
}
