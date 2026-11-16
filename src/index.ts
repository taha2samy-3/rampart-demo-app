import express, { Request, Response } from 'express';
import cors from 'cors';
import pino from 'pino';
import { config } from './config';
import { authRouter } from './routes/auth';
import { ordersRouter } from './routes/orders';
import { filesRouter } from './routes/files';

const logger = pino({
  level: config.nodeEnv === 'production' ? 'info' : 'debug',
});

const app = express();

app.use(cors());
app.use(express.json());

// Health and Readiness probes for Kubernetes
app.get('/healthz', (_req: Request, res: Response) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.get('/readyz', (_req: Request, res: Response) => {
  res.json({ status: 'ready', timestamp: new Date().toISOString() });
});

// App Info
app.get('/', (_req: Request, res: Response) => {
  res.json({
    service: 'Rampart Demo App - Payment & Order Processing Gateway',
    version: '1.0.0',
    env: config.nodeEnv,
    endpoints: ['/healthz', '/readyz', '/api/v1/auth', '/api/v1/orders', '/api/v1/files'],
  });
});

// Mount Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/orders', ordersRouter);
app.use('/api/v1/files', filesRouter);

// Start server
const server = app.listen(config.port, () => {
  logger.info(`Server listening on port ${config.port} in ${config.nodeEnv} mode`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
  });
});

export { app, server };
