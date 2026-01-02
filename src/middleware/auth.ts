import type { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import type { AuthenticatedRequest } from '../types/auth.types.js';

export const authMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const token = request.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return reply.status(401).send({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
    (request as AuthenticatedRequest).user = decoded;
  } catch (error) {
    return reply.status(401).send({ error: 'Invalid token' });
  }
};
