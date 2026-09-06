import { afterAll, beforeEach } from 'vitest';
import { prisma } from '@/shared/lib/prisma';
import { resetDb } from './reset';

beforeEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await prisma.$disconnect();
});
