import type { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma.js';
import { LOGGER } from '../utils/logger.js';

export async function healthRoutes(fastify: FastifyInstance) {
  // Health check endpoint
  fastify.get('/health', async (request, reply) => {
    reply.send({ status: 'OK', message: 'Server is running' });
  });

  // Database connection check
  fastify.get('/health/db', async (request, reply) => {
    try {
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1`;
      await prisma.$disconnect();
      
      reply.send({ 
        status: 'OK', 
        message: 'Database connection successful',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      LOGGER.error(`Database connection failed: ${error.message}`);
      reply.status(500).send({ 
        status: 'ERROR', 
        message: 'Database connection failed',
        error: error.message 
      });
    }
  });
}
