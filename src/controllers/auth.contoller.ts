import type { FastifyReply, FastifyRequest } from "fastify";
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { JWTService } from "../services/jwt.service.js";
import { UserRepository } from '../repositories/user.repository.js';
import { LOGGER } from '../utils/logger.js';
import { ErrorHandler } from '../utils/error-handler.js';
import { EmailService } from "../services/email.service.js";

export const loginHandler = async (request: FastifyRequest<{ Body: { email: string; password: string } }>, reply: FastifyReply) => {
  try {
    const { email, password } = request.body;
    
    const result = await UserRepository.findUserByEmail(email);
    if (!result.success || !result.data) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, result.data.password);
    if (!isValidPassword) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    const token = JWTService.generateToken(result.data.id, result.data.role);
    
    reply.send({
      success: true,
      message: 'Login successful',
      data: { id: result.data.id, email: result.data.email, name: result.data.name, role: result.data.role },
      token
    });
    LOGGER.info(`User logged in successfully: ${email}`);
  } catch (error: any) {
    ErrorHandler.handleGenericError(error, reply, 'login', 400);
  }
};

export const refreshTokenHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const token = request.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return reply.status(401).send({ error: 'Access token required' });
    }

    const decoded = JWTService.verifyToken(token);
    const newToken = JWTService.generateToken(decoded.userId, decoded.role);
    
    reply.send({
      success: true,
      message: 'Token refreshed successfully',
      token: newToken
    });
  } catch (error) {
    return reply.status(401).send({ error: 'Invalid token' });
  }
};

export const requestPasswordResetHandler = async (
  request: FastifyRequest<{ Body: { email: string } }>, 
  reply: FastifyReply
) => {
  try {
    const { email } = request.body;
    
    const userResult = await UserRepository.findUserByEmail(email);
    if (!userResult.data) {
      // Don't reveal if email exists for security
      return reply.send({
        success: true,
        message: "If the email exists, a reset link has been sent"
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiryTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await UserRepository.setResetToken(email, resetToken, expiryTime);
    await EmailService.sendPasswordResetEmail(email, resetToken);

    reply.send({
      success: true,
      message: "If the email exists, a reset link has been sent"
    });
    
    LOGGER.info(`Password reset requested for: ${email}`);
  } catch (error: any) {
    ErrorHandler.handleGenericError(error, reply, 'requestPasswordReset', 500);
  }
};

export const resetPasswordHandler = async (
  request: FastifyRequest<{ Body: { token: string; newPassword: string } }>, 
  reply: FastifyReply
) => {
  try {
    const { token, newPassword } = request.body;
    
    const userResult = await UserRepository.findUserByResetToken(token);
    if (!userResult.data) {
      return reply.status(400).send({
        error: "Invalid or expired reset token"
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await UserRepository.updatePassword(userResult.data.id, hashedPassword);

    reply.send({
      success: true,
      message: "Password reset successfully"
    });
    
    LOGGER.info(`Password reset completed for user ID: ${userResult.data.id}`);
  } catch (error: any) {
    ErrorHandler.handleGenericError(error, reply, 'resetPassword', 500);
  }
};
