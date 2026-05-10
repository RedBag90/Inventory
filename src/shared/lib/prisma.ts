// Singleton PrismaClient — prevents connection exhaustion in development (hot reload).
// Import this everywhere — never instantiate PrismaClient directly.
import { PrismaClient, Prisma } from '@/generated/prisma';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// eslint-disable-next-line no-restricted-syntax
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/** Convert a Prisma Decimal field to number. Returns null when the input is null/undefined. */
export function toNum(d: Prisma.Decimal | null | undefined): number | null {
  return d == null ? null : d.toNumber();
}
