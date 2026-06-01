const config = require('./config');
const logger = require('./services/logger');
const prisma = require('./lib/prisma');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const ctvRoutes = require('./routes/ctv');
const adminRoutes = require('./routes/admin');
const { globalLimiter } = require('./middleware/rateLimiter');
const { initRedis } = require('./services/cache');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = config.port;

// Trust reverse proxy (Railway) so rate limiter sees real client IP
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (config.cors.origins.includes(origin)) return callback(null, true);
    if (config.nodeEnv !== 'production' && origin.startsWith('http://localhost:')) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

// Liveness probe — always 200 (Railway healthcheck)
app.get('/api/ping', (_req, res) => res.json({ ok: true }));
app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'up' });
  } catch {
    res.status(503).json({ status: 'degraded', db: 'down' });
  }
});

app.use('/api/', globalLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/ctv', ctvRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorHandler);

let server;
async function start() {
  server = app.listen(PORT, () => {
    logger.info(`Dream Sales API running on http://localhost:${PORT}`);
    logger.info(`Environment: ${config.nodeEnv}`);
  });
  await initRedis().catch(err => logger.error('Redis init failed', { error: err.message }));
}

const gracefulShutdown = (signal) => {
  console.log(`${signal} received, shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000);
};
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

start().catch(err => {
  logger.error('Failed to start server', { error: err.message, stack: err.stack });
  process.exit(1);
});
