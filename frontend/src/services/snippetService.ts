import apiClient from '@/lib/apiClient';
import type { Snippet, PaginatedSnippets, SnippetFilters, CreateSnippetInput, UpdateSnippetInput, Note } from '@/types/domain';

export const snippetService = {
  async getMany(filters: SnippetFilters = {}): Promise<PaginatedSnippets> {
    const res = await apiClient.get<{ status: string; data: PaginatedSnippets }>('/snippets', { params: filters });
    return res.data.data;
  },

  async getOne(id: string): Promise<Snippet> {
    const res = await apiClient.get<{ status: string; data: { snippet: Snippet } }>(`/snippets/${id}`);
    return res.data.data.snippet;
  },

  async create(input: CreateSnippetInput): Promise<Snippet> {
    const res = await apiClient.post<{ status: string; data: { snippet: Snippet } }>('/snippets', input);
    return res.data.data.snippet;
  },

  async update(id: string, input: UpdateSnippetInput): Promise<Snippet> {
    const res = await apiClient.patch<{ status: string; data: { snippet: Snippet } }>(`/snippets/${id}`, input);
    return res.data.data.snippet;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/snippets/${id}`);
  },

  async getNotes(snippetId: string): Promise<Note[]> {
    const res = await apiClient.get<{ status: string; data: { notes: Note[] } }>(`/snippets/${snippetId}/notes`);
    return res.data.data.notes;
  },

  async addNote(snippetId: string, body: string): Promise<Note> {
    const res = await apiClient.post<{ status: string; data: { note: Note } }>(`/snippets/${snippetId}/notes`, { body });
    return res.data.data.note;
  },
};
