import { collectionRepository } from '../repositories/collection.repository';
import { AppError } from '../utils/AppError';
import { z } from 'zod';
import { createCollectionSchema, updateCollectionSchema } from '../schemas/snippet.schema';

type CreateInput = z.infer<typeof createCollectionSchema>;
type UpdateInput = z.infer<typeof updateCollectionSchema>;

export const collectionService = {
  async create(userId: string, input: CreateInput) {
    const { parentId, ...rest } = input;
    return collectionRepository.create(userId, {
      ...rest,
      ...(parentId && { parent: { connect: { id: parentId } } }),
    } as any);
  },

  async getMany(userId: string) {
    return collectionRepository.findMany(userId);
  },

  async getOne(id: string, userId: string) {
    const col = await collectionRepository.findOne(id, userId);
    if (!col) throw new AppError('Collection not found', 404);
    return col;
  },

  async update(id: string, userId: string, input: UpdateInput) {
    await collectionService.getOne(id, userId);
    return collectionRepository.update(id, input as any);
  },

  async delete(id: string, userId: string) {
    await collectionService.getOne(id, userId);
    return collectionRepository.delete(id, userId);
  },

  async addSnippet(collectionId: string, userId: string, snippetId: string) {
    await collectionService.getOne(collectionId, userId);
    return collectionRepository.addSnippet(collectionId, snippetId);
  },

  async removeSnippet(collectionId: string, userId: string, snippetId: string) {
    await collectionService.getOne(collectionId, userId);
    return collectionRepository.removeSnippet(collectionId, snippetId);
  },
};
