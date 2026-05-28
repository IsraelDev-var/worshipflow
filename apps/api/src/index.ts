import 'dotenv/config';
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { rateLimit } from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '@/config/swagger';
import { errorMiddleware } from '@/middlewares/error.middleware';
import authRoutes from '@/routes/auth.routes';
import songRoutes from '@/routes/song.routes';
import setlistRoutes from '@/routes/setlist.routes';
import eventRoutes from '@/routes/event.routes';
import categoryRoutes from '@/routes/category.routes';
import userRoutes from '@/routes/user.routes';
import organizationRoutes from '@/routes/organization.routes';

const app: Application = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
const NODE_ENV = process.env.NODE_ENV || 'development';

// ========================================
// Rate limiting
// ========================================
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Demasiados intentos, intenta más tarde' },
});

// ========================================
// Middlewares globales
// ========================================
app.use(helmet());
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ========================================
// Logging middleware
// ========================================
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.info(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// ========================================
// Swagger documentation
// ========================================
app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { swaggerOptions: { persistAuthorization: true } }),
);

// ========================================
// Welcome + health
// ========================================
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'WorshipFlow API',
    version: '0.1.0',
    status: 'running',
    environment: NODE_ENV,
    documentation: `http://localhost:${PORT}/api/docs`,
    health: `http://localhost:${PORT}/api/v1/health`,
  });
});

app.get('/api/v1/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'WorshipFlow API is running',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
    uptime: process.uptime(),
    environment: NODE_ENV,
  });
});

// ========================================
// Rutas de API
// ========================================
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);
app.use('/api/v1/auth/forgot-password', authLimiter);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/songs', songRoutes);
app.use('/api/v1/setlists', setlistRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/organizations', organizationRoutes);

// ========================================
// 404 Handler
// ========================================
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl,
  });
});

// ========================================
// Error Handler Global
// ========================================
app.use(errorMiddleware);

// ========================================
// Iniciar servidor
// ========================================
app.listen(PORT, () => {
  console.info(`✨ WorshipFlow API running on http://localhost:${PORT}`);
  console.info(`📚 Swagger Docs: http://localhost:${PORT}/api/docs`);
  console.info(`💚 Health check: http://localhost:${PORT}/api/v1/health`);
  console.info(`🌍 Environment: ${NODE_ENV}`);
});

export default app;
