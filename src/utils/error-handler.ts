import type { FastifyReply } from 'fastify';
import { LOGGER } from './logger.js';

export class ErrorHandler {
  
  static readonly PRISMA_ERRORS = {
    UNIQUE_CONSTRAINT: 'P2002',
    RECORD_NOT_FOUND: 'P2025',
    FOREIGN_KEY_CONSTRAINT: 'P2003'
  } as const;

  static readonly ERROR_MESSAGES = {
    EMAIL_EXISTS: 'Email already exists. Please try to login.',
    USER_CREATION_FAILED: 'User creation failed',
    USER_NOT_FOUND: 'User not found',
    INVALID_CREDENTIALS: 'Invalid credentials',
    FETCH_USERS_FAILED: 'Failed to fetch users'
  } as const;

  static handlePrismaError(error: any, reply: FastifyReply, operation: string): boolean {
    if (error.code === this.PRISMA_ERRORS.UNIQUE_CONSTRAINT) {
      if (error.meta?.target?.includes('email')) {
        reply.status(409).send({ error: this.ERROR_MESSAGES.EMAIL_EXISTS });
        return true;
      }
    }
    
    if (error.code === this.PRISMA_ERRORS.RECORD_NOT_FOUND) {
      reply.status(404).send({ error: this.ERROR_MESSAGES.USER_NOT_FOUND });
      return true;
    }

    return false;
  }

  static handleGenericError(error: any, reply: FastifyReply, operation: string, statusCode: number = 500): void {
    LOGGER.error(`Error in ${operation}: ${error.message}`);
    reply.status(statusCode).send({ 
      error: operation === 'createUser' ? this.ERROR_MESSAGES.USER_CREATION_FAILED : 'Operation failed'
    });
  }
}
