import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import authRouter from './routes/auth';
import entityRouter from './routes/entities';
import { errorHandler } from './middleware/errorHandler';
import { log5xx } from './middleware/log5xx';
import { openApiSpec } from './middleware/openapi';

export const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(morgan('dev'));
app.use(log5xx);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api', apiLimiter);

app.use((req, res, next) => {
  const csrfProtectedMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  const hasRefreshCookie = Boolean(req.cookies?.[env.refreshCookieName]);
  if (!hasRefreshCookie || !csrfProtectedMethods.includes(req.method)) {
    return next();
  }

  const origin = req.get('origin') ?? req.get('referer');
  if (!origin || !origin.startsWith(env.clientUrl)) {
    return res.status(403).json({ detail: 'CSRF protection: invalid origin' });
  }

  return next();
});

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
app.use('/api/auth', authRouter);
app.use('/api', entityRouter);

app.use((_req, res) => {
  res.status(404).json({ detail: 'Not found' });
});

app.use(errorHandler);
