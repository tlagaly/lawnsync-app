import { PrismaClient } from '@prisma/client';
import type { DatabaseClient } from '@/types/db';

const prismaClientSingleton = () => {
  return new PrismaClient({
    // Log queries only in development
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
    // Configure connection pool
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  }) as DatabaseClient;
};

declare global {
  var prisma: DatabaseClient | undefined;
}

const prisma = global.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export const db = prisma;