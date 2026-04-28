import { useCallback, useEffect, useRef, useState } from 'react';
import { snippetService } from '@/services/snippetService';
import type { Snippet, PaginatedSnippets, SnippetFilters, CreateSnippetInput, UpdateSnippetInput } from '@/types/domain';

interface UseSnippetsReturn extends PaginatedSnippets {
  isLoading: boolean;
  error: string | null;
  filters: SnippetFilters;
  setFilters: (f: Partial<SnippetFilters>) => void;
  createSnippet: (input: CreateSnippetInput) => Promise<Snippet>;
  updateSnippet: (id: string, input: UpdateSnippetInput) => Promise<Snippet>;
  deleteSnippet: (id: string) => Promise<void>;
  refresh: () => void;
}

const DEFAULT_FILTERS: SnippetFilters = { page: 1, limit: 20 };

export function useSnippets(initialFilters: SnippetFilters = {}): UseSnippetsReturn {
  const [data, setData] = useState<PaginatedSnippets>({ snippets: [], total: 0, page: 1, limit: 20, totalPages: 0 });
  const [filters, setFiltersState] = useState<SnippetFilters>({ ...DEFAULT_FILTERS, ...initialFilters });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchSnippets = useCallback(async (f: SnippetFilters) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setIsLoading(true);
    setError(null);
    try {
      const result = await snippetService.getMany(f);
      setData(result);
    } catch (err: unknown) {
      if ((err as { name?: string }).name !== 'CanceledError') {
        setError((err as Error).message ?? 'Failed to load snippets');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchSnippets(filters); }, [filters, fetchSnippets]);

  const setFilters = useCallback((partial: Partial<SnippetFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...partial, page: partial.page ?? 1 }));
  }, []);

  const createSnippet = useCallback(async (input: CreateSnippetInput) => {
    const snippet = await snippetService.create(input);
    setData((prev) => ({ ...prev, snippets: [snippet, ...(prev.snippets ?? [])], total: prev.total + 1 }));
    return snippet;
  }, []);

  const updateSnippet = useCallback(async (id: string, input: UpdateSnippetInput) => {
    const updated = await snippetService.update(id, input);
    setData((prev) => ({ ...prev, snippets: (prev.snippets ?? []).map((s) => (s.id === id ? updated : s)) }));
    return updated;
  }, []);

  const deleteSnippet = useCallback(async (id: string) => {
    await snippetService.delete(id);
    setData((prev) => ({ ...prev, snippets: (prev.snippets ?? []).filter((s) => s.id !== id), total: prev.total - 1 }));
  }, []);

  return { ...data, isLoading, error, filters, setFilters, createSnippet, updateSnippet, deleteSnippet, refresh: () => fetchSnippets(filters) };
}
