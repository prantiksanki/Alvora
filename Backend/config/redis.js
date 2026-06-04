const { createClient } = require('redis');
const logger = require('../utils/logger');

let client = null;
let isConnected = false;
let isDisabled = !process.env.REDIS_URL;

const getClient = async () => {
  if (isDisabled) return null;
  if (client && isConnected) return client;

  client = createClient({ url: process.env.REDIS_URL });

  client.on('error', (err) => logger.error('Redis client error', { error: err.message }));
  client.on('connect', () => { isConnected = true; logger.info('Redis connected'); });
  client.on('disconnect', () => { isConnected = false; logger.warn('Redis disconnected'); });

  try {
    await client.connect();
  } catch (err) {
    logger.warn('Redis unavailable — caching disabled', { error: err.message });
    client.removeAllListeners();
    client.destroy();
    client = null;
    isConnected = false;
    isDisabled = true;
  }

  return client;
};

const getCache = async (key) => {
  try {
    const c = await getClient();
    if (!c) return null;
    const data = await c.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

const setCache = async (key, value, ttlSeconds = 1800) => {
  try {
    const c = await getClient();
    if (!c) return;
    await c.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch {
    // Cache failures are non-fatal
  }
};

const delCache = async (...keys) => {
  try {
    const c = await getClient();
    if (!c) return;
    await Promise.all(keys.map((k) => c.del(k)));
  } catch {
    // Cache failures are non-fatal
  }
};

// Connection object for BullMQ (uses ioredis-compatible interface)
const bullConnection = {
  host: (() => {
    try {
      const url = new URL(process.env.REDIS_URL || 'redis://localhost:6379');
      return url.hostname;
    } catch { return 'localhost'; }
  })(),
  port: (() => {
    try {
      const url = new URL(process.env.REDIS_URL || 'redis://localhost:6379');
      return Number(url.port) || 6379;
    } catch { return 6379; }
  })(),
};

module.exports = { getClient, getCache, setCache, delCache, bullConnection };
