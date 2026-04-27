import express, { Application } from 'express';
import cors from 'cors';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { env } from './config/env';
import router from './routes';

const app: Application = express();

app.use(cors({
  origin: env.ALLOWED_ORIGINS,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.use('/api/v1', router);

// 404 handler — must be after all routes
app.use((_req, res) => {
  res.status(404).json({ status: 'error', message: 'Route not found' });
});

// Error handler — must be last
app.use(errorHandler);

export default app;
