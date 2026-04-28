export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'USER' | 'ADMIN';
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
}

export interface Note {
  id: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface Snippet {
  id: string;
  title: string;
  code: string;
  language: string;
  description?: string;
  isPublic: boolean;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  snippetTags: { tag: Tag }[];
  notes: Note[];
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  parentId?: string;
  children?: Collection[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedSnippets {
  snippets: Snippet[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SnippetFilters {
  page?: number;
  limit?: number;
  language?: string;
  tagId?: string;
  isFavorite?: boolean;
  search?: string;
}

export interface CreateSnippetInput {
  title: string;
  code: string;
  language: string;
  description?: string;
  isPublic?: boolean;
  isFavorite?: boolean;
  tagIds?: string[];
  notes?: string[];
}

export type UpdateSnippetInput = Partial<CreateSnippetInput>;

export interface CreateCollectionInput {
  name: string;
  description?: string;
  isPublic?: boolean;
  parentId?: string;
}

export type UpdateCollectionInput = Partial<CreateCollectionInput>;
