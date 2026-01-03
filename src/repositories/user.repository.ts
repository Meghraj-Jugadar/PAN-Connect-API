import prisma from '../lib/prisma.js';
import type { PANUser } from '@prisma/client';

type SafeUser = Omit<PANUser, 'password'>;

export class UserRepository {

    static async createUser(email: string, hashedPassword: string, name?: string | null): Promise<{ success: boolean; message: string; data: SafeUser }> {
        await prisma.$connect();
        try {
            const user = await prisma.pANUser.create({
                data: {
                    email,
                    password: hashedPassword,
                    name: name === undefined ? null : name
                },
                select: { id: true, email: true, name: true, isDeleted: true, createdAt: true, updatedAt: true }
            });
            return {
                success: true,
                message: "User created successfully",
                data: user
            };
        } finally {
            await prisma.$disconnect();
        }
    }

    static async findUserByEmail(email: string): Promise<{ success: boolean; message: string; data: PANUser | null }> {
        await prisma.$connect();
        try {
            const user = await prisma.pANUser.findUnique({ where: { email } });
            return {
                success: true,
                message: user ? "User found" : "User not found",
                data: user
            };
        } finally {
            await prisma.$disconnect();
        }
    }

    static async findAllUsers(): Promise<{ success: boolean; message: string; data: SafeUser[]; total: number }> {
        await prisma.$connect();
        try {
            const [users, total] = await Promise.all([
                prisma.pANUser.findMany({
                    select: { id: true, email: true, name: true, isDeleted: true, createdAt: true, updatedAt: true }
                }),
                prisma.pANUser.count()
            ]);
            return {
                success: true,
                message: "Users fetched successfully",
                data: users,
                total
            };
        } finally {
            await prisma.$disconnect();
        }
    }

    static async findUserById(id: number): Promise<{ success: boolean; message: string; data: PANUser | null }> {
        await prisma.$connect();
        try {
            const user = await prisma.pANUser.findUnique({ where: { id } });
            return {
                success: true,
                message: user ? "User found" : "User not found",
                data: user
            };
        } finally {
            await prisma.$disconnect();
        }
    }

    static async deleteUserByID(id: number): Promise<{ success: boolean; message: string; rowsAffected: number }> {
        await prisma.$connect();
        try {
            await prisma.pANUser.update({
                where: { id },
                data: { isDeleted: true }
            });
            return {
                success: true,
                message: "User deleted successfully",
                rowsAffected: 1
            };
        } finally {
            await prisma.$disconnect();
        }
    }
}
