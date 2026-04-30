// Vercel optimized

import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const disconnectPrisma = async () => {
  if (prisma) await prisma.$disconnect();
};


// import { PrismaClient } from '@prisma/client';

// class PrismaService {
//   private static instance: PrismaClient;

//   static getInstance(): PrismaClient {
//     if (!PrismaService.instance) {
//       PrismaService.instance = new PrismaClient();
//     }
//     return PrismaService.instance;
//   }

//   static async disconnect(): Promise<void> {
//     if (PrismaService.instance) {
//       await PrismaService.instance.$disconnect();
//     }
//   }
// }

// export const prisma = PrismaService.getInstance();
// export const disconnectPrisma = PrismaService.disconnect;
