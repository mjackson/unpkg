const redis = require('redis');

redis.debug_mode = process.env.DEBUG_REDIS != null;

const client = redis.createClient(
  process.env.CACHE_URL || process.env.OPENREDIS_URL || 'redis://localhost:6379'
);

module.exports = client;
