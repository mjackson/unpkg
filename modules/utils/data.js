import redis from 'redis';

redis.debug_mode = process.env.DEBUG_REDIS != null;

const client = redis.createClient(
  process.env.DATA_URL || process.env.OPENREDIS_URL || 'redis://localhost:6379'
);

export default client;
