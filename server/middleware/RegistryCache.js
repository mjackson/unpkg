const redis = require('redis')
const createLRUCache = require('lru-cache')

const createRedisCache = (redisURL) => {
  const client = redis.createClient(redisURL)

  const createKey = (key) => 'registry:' + key

  const set = (key, value, expiry) => {
    client.set(createKey(key), JSON.stringify(value))
    client.pexpire(createKey(key), expiry)
  }

  const get = (key, callback) => {
    client.get(createKey(key), (error, value) => {
      callback(error, value && JSON.parse(value))
    })
  }

  const del = (key) => {
    client.del(createKey(key))
  }

  return { set, get, del }
}

const createMemoryCache = (options) => {
  const cache = createLRUCache(options)

  const set = (key, value, expiry) => {
    cache.set(key, value, expiry)
  }

  const get = (key, callback) => {
    callback(null, cache.get(key))
  }

  const del = (key) => {
    cache.del(key)
  }

  return { set, get, del }
}

const RegistryCache = process.env.REDIS_URL
  ? createRedisCache(process.env.REDIS_URL)
  : createMemoryCache({ max: 1000 })

module.exports = RegistryCache
