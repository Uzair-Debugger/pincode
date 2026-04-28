import { Prisma } from '@prisma/client';
import { prisma } from '../services/prisma.service';

export interface SnippetFilters {
  userId: string;
  language?: string;
  tagId?: string;
  isFavorite?: boolean;
  search?: string;
  page: number;
  limit: number;
}

export const snippetRepository = {
  async create(userId: string, data: Prisma.SnippetCreateInput, tagIds?: string[], noteBodies?: string[]) {
    return prisma.snippet.create({
      data: {
        ...data,
        user: { connect: { id: userId } },
        snippetTags: tagIds?.length
          ? { create: tagIds.map((tagId) => ({ tag: { connect: { id: tagId } } })) }
          : undefined,
        notes: noteBodies?.length
          ? { create: noteBodies.map((body) => ({ body })) }
          : undefined,
      },
      include: { snippetTags: { include: { tag: true } }, notes: true },
    });
  },

  async findMany({ userId, language, tagId, isFavorite, search, page, limit }: SnippetFilters) {
    const where: Prisma.SnippetWhereInput = {
      userId,
      ...(language && { language }),
      ...(isFavorite !== undefined && { isFavorite }),
      ...(tagId && { snippetTags: { some: { tagId } } }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, items] = await Promise.all([
      prisma.snippet.count({ where }),
      prisma.snippet.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { snippetTags: { include: { tag: true } }, notes: true },
      }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async findOne(id: string, userId: string) {
    return prisma.snippet.findFirst({
      where: { id, userId },
      include: { snippetTags: { include: { tag: true } }, notes: true },
    });
  },

  async update(id: string, userId: string, data: Prisma.SnippetUpdateInput, tagIds?: string[]) {
    // Replace tags if provided
    if (tagIds !== undefined) {
      await prisma.snippetTag.deleteMany({ where: { snippetId: id } });
    }
    return prisma.snippet.update({
      where: { id },
      data: {
        ...data,
        ...(tagIds !== undefined && {
          snippetTags: { create: tagIds.map((tagId) => ({ tag: { connect: { id: tagId } } })) },
        }),
      },
      include: { snippetTags: { include: { tag: true } }, notes: true },
    });
  },

  async delete(id: string, userId: string) {
    return prisma.snippet.deleteMany({ where: { id, userId } });
  },
};
