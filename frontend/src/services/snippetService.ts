import apiClient from '@/lib/apiClient';
import type { Snippet, PaginatedSnippets, SnippetFilters, CreateSnippetInput, UpdateSnippetInput, Note } from '@/types/domain';

export const snippetService = {
  async getMany(filters: SnippetFilters = {}, signal?: AbortSignal): Promise<PaginatedSnippets> {
    const res = await apiClient.get<{ status: string; data: { items: Snippet[]; total: number; page: number; limit: number; totalPages: number } }>('/snippets', { params: filters, signal });
    const { items, ...rest } = res.data.data;
    return { snippets: items, ...rest };
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

  async updateNote(snippetId: string, noteId: string, body: string): Promise<Note> {
    const res = await apiClient.patch<{ status: string; data: { note: Note } }>(`/snippets/${snippetId}/notes/${noteId}`, { body });
    return res.data.data.note;
  },

  async deleteNote(snippetId: string, noteId: string): Promise<void> {
    await apiClient.delete(`/snippets/${snippetId}/notes/${noteId}`);
  },
};
