import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Ensure environment variables are loaded before Prisma Client initialization
dotenv.config();

// Verify DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in environment variables');
}

// Prisma Client will use DATABASE_URL from environment
// For Prisma 7, ensure the client is generated with the correct engine type
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;

