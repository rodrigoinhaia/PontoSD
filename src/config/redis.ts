import { createClient } from 'redis';
import { logger } from '../utils/logger';
import { env } from './env';

const redisClient = createClient({
  url: `redis://${env.REDIS_HOST}:${env.REDIS_PORT}`,
  password: env.REDIS_PASS,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redisClient.on('error', (err) => {
  logger.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  logger.info('Redis Client Connected');
});

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    logger.info('Redis connection has been established successfully.');
  } catch (error) {
    logger.error('Unable to connect to Redis:', error);
    process.exit(1);
  }
};

export default redisClient; 