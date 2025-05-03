import { config } from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Carrega as variáveis de ambiente do arquivo .env
config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('3000'),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('1d'),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().default('5432'),
  DB_USER: z.string().default('postgres'),
  DB_PASS: z.string().default('postgres'),
  DB_NAME: z.string().default('pontosd'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379'),
  REDIS_PASS: z.string().optional(),
  MAIL_HOST: z.string().default('smtp.gmail.com'),
  MAIL_PORT: z.string().default('587'),
  MAIL_USER: z.string().email(),
  MAIL_PASS: z.string(),
  MAIL_FROM: z.string().email(),
  MAIL_NAME: z.string(),
  STORAGE_TYPE: z.enum(['local', 's3']).default('local'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_BUCKET_NAME: z.string().optional(),
  AWS_REGION: z.string().optional(),
  FRONTEND_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);

// Validação das variáveis de ambiente obrigatórias
const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'DB_HOST',
  'DB_PORT',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_SECRET',
  'FRONTEND_URL'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(`Variáveis de ambiente obrigatórias não definidas: ${missingEnvVars.join(', ')}`);
}

// Configurações do ambiente
export const envConfig = {
  nodeEnv: env.NODE_ENV as 'development' | 'production' | 'test',
  port: parseInt(env.PORT || '3000'),
  db: {
    host: env.DB_HOST,
    port: parseInt(env.DB_PORT || '5432'),
    user: env.DB_USER,
    password: env.DB_PASS,
    name: env.DB_NAME
  },
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN
  },
  frontendUrl: env.FRONTEND_URL,
  uploadDir: path.join(__dirname, '../../public/uploads'),
  redis: {
    host: env.REDIS_HOST,
    port: parseInt(env.REDIS_PORT || '6379'),
    password: env.REDIS_PASS,
  },
  mail: {
    host: env.MAIL_HOST,
    port: parseInt(env.MAIL_PORT || '587'),
    user: env.MAIL_USER,
    pass: env.MAIL_PASS,
    from: env.MAIL_FROM,
    name: env.MAIL_NAME,
  },
  frontendUrl: process.env.FRONTEND_URL,
  uploadDir: path.join(__dirname, '../../public/uploads')
}; 