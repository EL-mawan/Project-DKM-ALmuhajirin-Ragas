import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

// Diagnostic log for available models
if (process.env.NODE_ENV !== 'production') {
  console.log('📦 Prisma Models Loaded:', Object.keys(db).filter(k => !k.startsWith('_')));
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db