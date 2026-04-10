import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import productsRouter from './routes/products';
import adminRouter from './routes/admin';
import { errorHandler } from './middleware/errorHandler';
import { getDb } from './database';

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(helmet());
app.use(cors({ origin: [FRONTEND_URL, 'http://localhost:5173', 'http://localhost:4173'], credentials: true }));
app.use(express.json({ limit: '1mb' }));

const publicLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
const adminLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });

app.use('/api/products', publicLimiter, productsRouter);
app.use('/api/admin/products', adminLimiter, adminRouter);

app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'RCPL rPET API is running', timestamp: new Date().toISOString() });
});

app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

app.use(errorHandler);

// Initialize DB (seeds on first run)
getDb();

app.listen(PORT, () => {
  console.log(`\n  RCPL rPET Backend → http://localhost:${PORT}`);
  console.log(`  Health:  http://localhost:${PORT}/health`);
  console.log(`  Lookup:  http://localhost:${PORT}/api/products/lookup?code=AA\n`);
});

export default app;
