import type { FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { CreateUserSchema, LoginSchema } from '../schemas/user.schema.js';
import type { CreateUserRequest, LoginRequest } from '../types/request.types.js';
import { LOGGER } from '../utils/logger.js';

export const createUserHandler = async (request: FastifyRequest<CreateUserRequest>, reply: FastifyReply) => {
  try {
    LOGGER.info(`Creating user with data: ${JSON.stringify(request.body)}`);
    const { email, password, name } = CreateUserSchema.parse(request.body);
    
    // Connect to database
    await prisma.$connect();
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.pANUser.create({
      data: { email, password: hashedPassword, name: name ?? null }
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!);
    
    // Disconnect from database
    await prisma.$disconnect();
    
    reply.send({ user: { id: user.id, email: user.email, name: user.name }, token });
    LOGGER.info(`User created successfully`);
  } catch (error: any) {
    await prisma.$disconnect(); // Ensure disconnect on error
    
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return reply.status(409).send({ error: 'Email already exists. Please try to login.' });
    }
    LOGGER.error(`Error creating user: ${error.message}`);
    reply.status(400).send({ error: 'User creation failed' });
  }
};
