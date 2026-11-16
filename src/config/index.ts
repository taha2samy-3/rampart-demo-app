import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-super-insecure-key-do-not-use-in-prod',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://app:secret@localhost:5432/rampart_demo',
  externalServiceUrl: process.env.EXTERNAL_SERVICE_URL || 'https://api.github.com',
};
