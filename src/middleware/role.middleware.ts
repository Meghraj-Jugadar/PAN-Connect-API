import type { FastifyRequest, FastifyReply } from 'fastify';
import { JWTService } from '../services/jwt.service.js';
import type { AuthenticatedRequest } from '../types/auth.types.js';

export const createRoleMiddleware = (allowedRoles: string[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const token = request.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return reply.status(401).send({ error: 'Access token required' });
      }

      const decoded = JWTService.verifyToken(token);
      (request as AuthenticatedRequest).user = decoded;

      // Check if user role is allowed
      if (!allowedRoles.includes(decoded.role)) {
        return reply.status(403).send({ 
          error: 'Access denied. Insufficient permissions.'
        });
      }

      // Auto-refresh token if expiring soon
      const currentTime = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = decoded.exp - currentTime;
      
      if (timeUntilExpiry < 300) { // 5 minutes
        const newToken = JWTService.generateToken(decoded.userId, decoded.role);
        reply.header('X-New-Token', newToken);
      }
    } catch (error) {
      return reply.status(401).send({ error: 'Invalid or expired token' });
    }
  };
};

// Specific role middlewares - no fallbacks
export const adminOnly = createRoleMiddleware([process.env.ADMIN_ROLE!]);

export const customerOnly = createRoleMiddleware([process.env.USER_ROLE!]);

export const staffOnly = createRoleMiddleware([process.env.STAFF_ROLE!]);

export const adminOrStaff = createRoleMiddleware([
  process.env.ADMIN_ROLE!,
  process.env.STAFF_ROLE!
]);

export const allRoles = createRoleMiddleware([
  process.env.ADMIN_ROLE!,
  process.env.USER_ROLE!,
  process.env.STAFF_ROLE!
]);