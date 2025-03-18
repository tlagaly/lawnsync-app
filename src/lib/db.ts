import { PrismaClient } from '@prisma/client';
import type { DatabaseClient } from '@/types/db';

declare global {
  var prisma: DatabaseClient | undefined;
}

if (!global.prisma) {
  global.prisma = new PrismaClient() as DatabaseClient;
}

export const db = global.prisma;