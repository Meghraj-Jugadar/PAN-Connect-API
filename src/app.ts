import fastify from 'fastify';
import cors from '@fastify/cors';
import { userRoutes } from './routes/user.routes.js';
import { authRoutes } from './routes/auth.routes.js';
import { BootstrapService } from './services/bootstrap.service.js';
import { healthRoutes } from './routes/health.routes.js';

const app = fastify({ logger: false });

// Secure CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? process.env.ALLOWED_PROD_ORIGINS?.split(',') || []
  : process.env.ALLOWED_LOCAL_ORIGINS?.split(',') || [];

app.register(cors, {
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400
});

// Security headers
app.addHook('onSend', async (req, res) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
});

// Create admin account on startup
app.addHook('onReady', async () => {
  await BootstrapService.createAdminAccount();
});

app.register(healthRoutes, { prefix: '/api' });
app.register(userRoutes, { prefix: '/api/users' });
app.register(authRoutes, { prefix: '/api/auth' });

export default app;
