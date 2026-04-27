import { PrismaClient } from '@prisma/client';

class PrismaService {
  private static instance: PrismaClient;

  static getInstance(): PrismaClient {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaClient();
    }
    return PrismaService.instance;
  }

  static async disconnect(): Promise<void> {
    if (PrismaService.instance) {
      await PrismaService.instance.$disconnect();
    }
  }
}

export const prisma = PrismaService.getInstance();
export const disconnectPrisma = PrismaService.disconnect;
