import apiClient from '@/lib/apiClient';
import type { Collection, CreateCollectionInput, UpdateCollectionInput } from '@/types/domain';

export const collectionService = {
  async getMany(): Promise<Collection[]> {
    const res = await apiClient.get<{ status: string; data: { collections: Collection[] } }>('/collections');
    return res.data.data.collections;
  },

  async getOne(id: string): Promise<Collection> {
    const res = await apiClient.get<{ status: string; data: { collection: Collection } }>(`/collections/${id}`);
    return res.data.data.collection;
  },

  async create(input: CreateCollectionInput): Promise<Collection> {
    const res = await apiClient.post<{ status: string; data: { collection: Collection } }>('/collections', input);
    return res.data.data.collection;
  },

  async update(id: string, input: UpdateCollectionInput): Promise<Collection> {
    const res = await apiClient.patch<{ status: string; data: { collection: Collection } }>(`/collections/${id}`, input);
    return res.data.data.collection;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/collections/${id}`);
  },

  async addSnippet(collectionId: string, snippetId: string): Promise<void> {
    await apiClient.post(`/collections/${collectionId}/snippets`, { snippetId });
  },

  async removeSnippet(collectionId: string, snippetId: string): Promise<void> {
    await apiClient.delete(`/collections/${collectionId}/snippets`, { data: { snippetId } });
  },
};
