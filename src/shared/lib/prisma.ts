// Singleton PrismaClient — prevents connection exhaustion in development (hot reload).
// Import this everywhere — never instantiate PrismaClient directly.
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// eslint-disable-next-line no-restricted-syntax
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
