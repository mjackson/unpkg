const redis = require('redis')

const RedisURL = process.env.OPENREDIS_URL || process.env.REDIS_URL || 'redis://localhost:6379'

const client = redis.createClient(RedisURL)

module.exports = client
