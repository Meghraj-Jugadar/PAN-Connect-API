import prisma from '../lib/prisma.js';
import type { PANUser } from '@prisma/client';
import type { PublicUser } from '../types/user.types.js';

type SafeUser = Omit<PANUser, 'password'>;

export class UserRepository {

    static async createUser(
        email: string,
        hashedPassword: string,
        name?: string | null,
        role?: string): Promise<{ success: boolean; message: string; data: PublicUser }> {
        await prisma.$connect();
        try {
            const userRole = role || process.env.USER_ROLE!;
            const user = await prisma.pANUser.create({
                data: {
                    email,
                    password: hashedPassword,
                    name: name === undefined ? null : name,
                    role: userRole
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    createdAt: true
                }
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
    
    // For internal use (authentication, password reset) - returns full user data
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

    // For public APIs - returns safe user data only
    static async findPublicUserById(id: number): Promise<{ success: boolean; message: string; data: PublicUser | null }> {
        await prisma.$connect();
        try {
            const user = await prisma.pANUser.findUnique({
                where: { id },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    createdAt: true
                }
            });
            return {
                success: true,
                message: user ? "User found" : "User not found",
                data: user
            };
        } finally {
            await prisma.$disconnect();
        }
    }

    // For internal use - returns full user data
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

    // For public APIs - returns safe user data only
    static async findPublicUserByEmail(email: string): Promise<{ success: boolean; message: string; data: PublicUser | null }> {
        await prisma.$connect();
        try {
            const user = await prisma.pANUser.findUnique({
                where: { email },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    createdAt: true
                }
            });
            return {
                success: true,
                message: user ? "User found" : "User not found",
                data: user
            };
        } finally {
            await prisma.$disconnect();
        }
    }

    static async findAllUsers(): Promise<{ success: boolean; message: string; data: PublicUser[]; total: number }> {
        await prisma.$connect();
        try {
            const customerRole = process.env.USER_ROLE!;
            const [users, total] = await Promise.all([
                prisma.pANUser.findMany({
                    where: { role: customerRole },
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        role: true,
                        createdAt: true,
                        updatedAt: true
                    }
                }),
                prisma.pANUser.count({
                    where: { role: customerRole }
                })
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

    static async setResetToken(email: string, resetToken: string, expiryTime: Date): Promise<{ success: boolean; message: string }> {
        await prisma.$connect();
        try {
            await prisma.pANUser.update({
                where: { email },
                data: {
                    resetToken,
                    resetTokenExpiry: expiryTime
                }
            });
            return {
                success: true,
                message: "Reset token set successfully"
            };
        } finally {
            await prisma.$disconnect();
        }
    }

    static async findUserByResetToken(resetToken: string): Promise<{ success: boolean; message: string; data: PANUser | null }> {
        await prisma.$connect();
        try {
            const user = await prisma.pANUser.findFirst({
                where: {
                    resetToken,
                    resetTokenExpiry: {
                        gt: new Date()
                    }
                }
            });
            return {
                success: true,
                message: user ? "User found" : "Invalid or expired token",
                data: user
            };
        } finally {
            await prisma.$disconnect();
        }
    }

    static async updatePassword(userId: number, hashedPassword: string): Promise<{ success: boolean; message: string }> {
        await prisma.$connect();
        try {
            await prisma.pANUser.update({
                where: { id: userId },
                data: {
                    password: hashedPassword,
                    resetToken: null,
                    resetTokenExpiry: null
                }
            });
            return {
                success: true,
                message: "Password updated successfully"
            };
        } finally {
            await prisma.$disconnect();
        }
    }
}
