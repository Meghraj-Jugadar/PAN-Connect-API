import fastify from 'fastify';
import { userRoutes } from './routes/user.routes.js';

const app = fastify({ logger: false });
app.register(userRoutes, { prefix: '/api/users' });

export default app;
