import { snippetRepository, SnippetFilters } from '../repositories/snippet.repository';
import { AppError } from '../utils/AppError';
import { z } from 'zod';
import { createSnippetSchema, updateSnippetSchema } from '../schemas/snippet.schema';

type CreateInput = z.infer<typeof createSnippetSchema>;
type UpdateInput = z.infer<typeof updateSnippetSchema>;

export const snippetService = {
  async create(userId: string, input: CreateInput) {
    const { tagIds, notes, ...rest } = input;
    return snippetRepository.create(userId, rest as any, tagIds, notes);
  },

  async getMany(filters: SnippetFilters) {
    return snippetRepository.findMany(filters);
  },

  async getOne(id: string, userId: string) {
    const snippet = await snippetRepository.findOne(id, userId);
    if (!snippet) throw new AppError('Snippet not found', 404);
    return snippet;
  },

  async update(id: string, userId: string, input: UpdateInput) {
    await snippetService.getOne(id, userId); // ownership check
    const { tagIds, notes, ...rest } = input;
    return snippetRepository.update(id, userId, rest as any, tagIds);
  },

  async delete(id: string, userId: string) {
    await snippetService.getOne(id, userId); // ownership check
    return snippetRepository.delete(id, userId);
  },
};
