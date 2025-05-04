import { config } from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Carrega as variáveis de ambiente do arquivo .env
config();

// Schema de validação das variáveis de ambiente
const envSchema = z.object({
  // App
  PORT: z.string().transform(Number),
  NODE_ENV: z.enum(['development', 'test', 'production']),

  // Database
  DB_USERNAME: z.string(),
  DB_PASSWORD: z.string(),
  DB_DATABASE: z.string(),
  DB_HOST: z.string(),
  DB_PORT: z.string().transform(Number),

  // Redis
  REDIS_HOST: z.string(),
  REDIS_PORT: z.string().transform(Number),

  // JWT
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string(),
  JWT_REFRESH_EXPIRES_IN: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_EXPIRES_IN: z.string(),

  // Email
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string().transform(Number),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  EMAIL_FROM: z.string(),

  // Geolocation
  GOOGLE_MAPS_API_KEY: z.string(),
  MAX_DISTANCE_METERS: z.string().transform(Number),

  // Upload
  UPLOAD_DIR: z.string(),
  MAX_FILE_SIZE: z.string().transform(Number),

  // Time
  TIMEZONE: z.string(),
  WORKING_HOURS_START: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  WORKING_HOURS_END: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  LUNCH_BREAK_START: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  LUNCH_BREAK_END: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),

  // Log
  LOG_LEVEL: z.string(),
  LOG_FILE: z.string(),

  // Rate Limit
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number),
  RATE_LIMIT_MAX: z.string().transform(Number),

  // URLs
  API_URL: z.string(),
  FRONTEND_URL: z.string(),
  CORS_ORIGIN: z.string(),
});

// Valida as variáveis de ambiente
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  process.exit(1);
}

export const env = _env.data;

// Importa o logger após a validação das variáveis de ambiente
import { logger } from '../utils/logger';

// Configuração do ambiente
export const envConfig = {
  nodeEnv: process.env.NODE_ENV as 'development' | 'test' | 'production',
  port: Number(process.env.PORT),
  db: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    refreshSecret: process.env.REFRESH_TOKEN_SECRET,
  },
  email: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM,
  },
  geolocation: {
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
    maxDistanceMeters: Number(process.env.MAX_DISTANCE_METERS),
  },
  upload: {
    dir: process.env.UPLOAD_DIR,
    maxFileSize: Number(process.env.MAX_FILE_SIZE),
  },
  time: {
    timezone: process.env.TIMEZONE,
    workingHours: {
      start: process.env.WORKING_HOURS_START,
      end: process.env.WORKING_HOURS_END,
    },
    lunchBreak: {
      start: process.env.LUNCH_BREAK_START,
      end: process.env.LUNCH_BREAK_END,
    },
  },
  log: {
    level: process.env.LOG_LEVEL,
    file: process.env.LOG_FILE,
  },
  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS),
    max: Number(process.env.RATE_LIMIT_MAX),
  },
  urls: {
    api: process.env.API_URL,
    frontend: process.env.FRONTEND_URL,
    corsOrigin: process.env.CORS_ORIGIN,
  },
}; 