import type { FastifyInstance } from 'fastify';
import { createUserHandler, deleteUserByIDHandler, fetchAllUsersHandler } from '../controllers/user.controller.js';
import { adminOnly, adminOrStaff } from '../middleware/role.middleware.js';

export async function userRoutes(fastify: FastifyInstance) {
  // Register user (public route)
  fastify.post('/register', createUserHandler);

  // Admin only routes
  fastify.post('/get-all-users', { preHandler: adminOnly }, fetchAllUsersHandler);
  
  fastify.delete<{ Params: { id: string } }>('/delete-by-id/:id', { 
    preHandler: adminOnly 
  }, deleteUserByIDHandler);
}
