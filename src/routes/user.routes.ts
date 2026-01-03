import type { FastifyInstance } from 'fastify';
import { createUserHandler, deleteUserByIDHandler, fetchAllUsersHandler } from '../controllers/user.controller.js';

export async function userRoutes(fastify: FastifyInstance) {
  // Register user (public route)
  fastify.post('/register', createUserHandler);
  fastify.post('/get-all-users', fetchAllUsersHandler);
  fastify.delete('/delete-by-id/:id', deleteUserByIDHandler);
}
