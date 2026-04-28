import { Prisma } from '@prisma/client';
import { prisma } from '../services/prisma.service';

export const collectionRepository = {
  async create(userId: string, data: Prisma.CollectionCreateInput) {
    return prisma.collection.create({
      data: { ...data, user: { connect: { id: userId } } },
      include: { children: true },
    });
  },

  async findMany(userId: string) {
    return prisma.collection.findMany({
      where: { userId },
      include: { children: true, snippetCols: { include: { snippet: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findOne(id: string, userId: string) {
    return prisma.collection.findFirst({
      where: { id, userId },
      include: { children: true, snippetCols: { include: { snippet: true } } },
    });
  },

  async update(id: string, data: Prisma.CollectionUpdateInput) {
    return prisma.collection.update({
      where: { id },
      data,
      include: { children: true },
    });
  },

  async delete(id: string, userId: string) {
    return prisma.collection.deleteMany({ where: { id, userId } });
  },

  async addSnippet(collectionId: string, snippetId: string) {
    return prisma.snippetCollection.create({ data: { collectionId, snippetId } });
  },

  async removeSnippet(collectionId: string, snippetId: string) {
    return prisma.snippetCollection.delete({
      where: { snippetId_collectionId: { snippetId, collectionId } },
    });
  },
};
