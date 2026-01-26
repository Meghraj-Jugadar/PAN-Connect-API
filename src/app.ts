import fastify from 'fastify';
import { userRoutes } from './routes/user.routes.js';
import { authRoutes } from './routes/auth.routes.js';
import { BootstrapService } from './services/bootstrap.service.js';
import { healthRoutes } from './routes/health.routes.js';

const app = fastify({ logger: false });

// Create admin account on startup
app.addHook('onReady', async () => {
  await BootstrapService.createAdminAccount();
});
app.register(healthRoutes, { prefix: '/api' });
app.register(userRoutes, { prefix: '/api/users' });
app.register(authRoutes, { prefix: '/api/auth' });

export default app;
