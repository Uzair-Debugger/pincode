import { useCallback, useEffect, useState } from 'react';
import { collectionService } from '@/services/collectionService';
import type { Collection, CreateCollectionInput, UpdateCollectionInput } from '@/types/domain';

interface UseCollectionsReturn {
  collections: Collection[];
  isLoading: boolean;
  error: string | null;
  createCollection: (input: CreateCollectionInput) => Promise<Collection>;
  updateCollection: (id: string, input: UpdateCollectionInput) => Promise<Collection>;
  deleteCollection: (id: string) => Promise<void>;
  addSnippet: (collectionId: string, snippetId: string) => Promise<void>;
  removeSnippet: (collectionId: string, snippetId: string) => Promise<void>;
}

export function useCollections(): UseCollectionsReturn {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    collectionService.getMany()
      .then(setCollections)
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  const createCollection = useCallback(async (input: CreateCollectionInput) => {
    const col = await collectionService.create(input);
    setCollections((prev) => [...prev, col]);
    return col;
  }, []);

  const updateCollection = useCallback(async (id: string, input: UpdateCollectionInput) => {
    const updated = await collectionService.update(id, input);
    setCollections((prev) => prev.map((c) => (c.id === id ? updated : c)));
    return updated;
  }, []);

  const deleteCollection = useCallback(async (id: string) => {
    await collectionService.delete(id);
    setCollections((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const addSnippet = useCallback(async (collectionId: string, snippetId: string) => {
    await collectionService.addSnippet(collectionId, snippetId);
  }, []);

  const removeSnippet = useCallback(async (collectionId: string, snippetId: string) => {
    await collectionService.removeSnippet(collectionId, snippetId);
  }, []);

  return { collections, isLoading, error, createCollection, updateCollection, deleteCollection, addSnippet, removeSnippet };
}
