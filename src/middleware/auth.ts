// // src/middleware/auth.ts
// import type { FastifyRequest, FastifyReply } from 'fastify';
// import jwt from 'jsonwebtoken';
// import type { AuthenticatedRequest } from '../types/auth.types.js';
// import { JWTService } from '../services/jwt.service.js';

// export const authMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
//   try {
//     const token = request.headers.authorization?.replace('Bearer ', '');
    
//     if (!token) {
//       return reply.status(401).send({ error: 'Access token required' });
//     }

//     const decoded = JWTService.verifyToken(token);
//     (request as AuthenticatedRequest).user = decoded;

//     const currentTime = Math.floor(Date.now() / 1000);
//     const timeUntilExpiry = decoded.exp - currentTime;
    
//     if (timeUntilExpiry < 300) { // 5 minutes
//       const newToken = JWTService.generateToken(decoded.userId, decoded.role);
//       reply.header('X-New-Token', newToken);
//     }
//   } catch (error) {
//     if (error instanceof jwt.TokenExpiredError) {
//       return reply.status(401).send({ error: 'Token expired' });
//     }
//     return reply.status(401).send({ error: 'Invalid token' });
//   }
// };
