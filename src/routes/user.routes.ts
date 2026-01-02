import type { FastifyInstance } from 'fastify';
import { createUserHandler } from '../controllers/user.controller.js';

export async function userRoutes(fastify: FastifyInstance) {
  // Register user (public route)
  fastify.post('/register', createUserHandler);
}
