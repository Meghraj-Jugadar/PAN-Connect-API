import type { PANUser } from '@prisma/client';

export type SafeUser = Omit<PANUser, 'password' | 'resetToken' | 'resetTokenExpiry'>;
export type PublicUser = Pick<PANUser, 'id' | 'email' | 'name' | 'role' | 'createdAt'>;
