import type { FastifyInstance } from 'fastify';
import { allRoles } from '../middleware/role.middleware.js';
import { loginHandler, refreshTokenHandler, requestPasswordResetHandler, resetPasswordHandler } from '../controllers/auth.contoller.js';
import { EmailService } from '../services/email.service.js';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/login', loginHandler);
  fastify.post('/refresh', { preHandler: allRoles }, refreshTokenHandler);
  fastify.post('/forgot-password', requestPasswordResetHandler);
  fastify.post('/reset-password', resetPasswordHandler);
  // Test route
  fastify.get('/test-email', async (request, reply) => {
    await EmailService.testConnection();
    reply.send({ message: 'Email test completed, check logs' });
  });
}
