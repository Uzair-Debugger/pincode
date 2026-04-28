import { prisma } from '../services/prisma.service';

export const noteRepository = {
  async create(snippetId: string, body: string) {
    return prisma.note.create({ data: { body, snippetId } });
  },

  async findMany(snippetId: string) {
    return prisma.note.findMany({ where: { snippetId }, orderBy: { createdAt: 'asc' } });
  },

  async update(id: string, body: string) {
    return prisma.note.update({ where: { id }, data: { body } });
  },

  async delete(id: string) {
    return prisma.note.delete({ where: { id } });
  },

  async findOne(id: string) {
    return prisma.note.findUnique({ where: { id } });
  },
};
