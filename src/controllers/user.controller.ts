import type { FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { CreateUserSchema } from '../schemas/user.schema.js';
import type { CreateUserRequest } from '../types/request.types.js';
import { LOGGER } from '../utils/logger.js';
import { UserRepository } from '../repositories/user.repository.js';
import { ErrorHandler } from '../utils/error-handler.js';

export const createUserHandler = async (request: FastifyRequest<CreateUserRequest>, reply: FastifyReply) => {
  try {
    const { email, password, name } = CreateUserSchema.parse(request.body);
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await UserRepository.createUser(email, hashedPassword, name ?? null);
    const token = jwt.sign({ userId: result.data.id }, process.env.JWT_SECRET!);
    
    reply.send({ ...result, token });
    LOGGER.info(`User created successfully`);
  } catch (error: any) {
    if (!ErrorHandler.handlePrismaError(error, reply, 'createUser')) {
      ErrorHandler.handleGenericError(error, reply, 'createUser', 400);
    }
  }
};

export const fetchAllUsersHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    LOGGER.info(`Fetching all users`);
    const result = await UserRepository.findAllUsers();
    reply.send(result);
    LOGGER.info(`Users fetched successfully : ${result.total}`);
  } catch (error: any) {
    ErrorHandler.handleGenericError(error, reply, 'fetchUsers');
  }
};

export const deleteUserByIDHandler = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  try {
    const { id } = request.params;
    LOGGER.info(`Deleting user with id: ${id}`);
    const result = await UserRepository.deleteUserByID(Number(id));
    reply.send(result);
    LOGGER.info(`User deleted successfully`);
  } catch (error: any) {
    if (!ErrorHandler.handlePrismaError(error, reply, 'deleteUser')) {
      ErrorHandler.handleGenericError(error, reply, 'deleteUser');
    }
  }
};
