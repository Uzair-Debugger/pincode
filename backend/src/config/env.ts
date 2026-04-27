import dotenv from 'dotenv';

dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: parseInt(process.env.PORT ?? '5000', 10),
  DATABASE_URL: requireEnv('DATABASE_URL'),
  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000').split(','),
} as const;
