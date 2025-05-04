import { corsConfig } from './cors';
import { databaseConfig } from './database';
import { env } from './env';
import { helmetConfig } from './helmet';
import { loggerConfig } from './logger';
import { mailConfig } from './mail';
import { rateLimitConfig } from './rate-limit';
import { redisConfig } from './redis';
import { serverConfig } from './server';
import { socketConfig } from './socket';
import { storageConfig } from './storage';

export const config = {
  cors: corsConfig,
  database: databaseConfig,
  env,
  helmet: helmetConfig,
  logger: loggerConfig,
  mail: mailConfig,
  rateLimit: rateLimitConfig,
  redis: redisConfig,
  server: serverConfig,
  socket: socketConfig,
  storage: storageConfig,
};

export default config; 