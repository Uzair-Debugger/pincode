import { z } from 'zod';

export const createSnippetSchema = z.object({
  title: z.string().min(1).max(200),
  code: z.string().min(1),
  language: z.string().min(1).max(50),
  description: z.string().max(1000).optional(),
  isPublic: z.boolean().optional(),
  isFavorite: z.boolean().optional(),
  tagIds: z.array(z.string().cuid()).optional(),
  notes: z.array(z.string().min(1)).optional(),
});

export const updateSnippetSchema = createSnippetSchema.partial();

export const snippetQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  language: z.string().optional(),
  tagId: z.string().cuid().optional(),
  isFavorite: z.enum(['true', 'false']).optional(),
  search: z.string().optional(),
});

export const addNoteSchema = z.object({
  body: z.string().min(1).max(5000),
});

export const createCollectionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().optional(),
  parentId: z.string().cuid().optional(),
});

export const updateCollectionSchema = createCollectionSchema.partial();

export const collectionSnippetSchema = z.object({
  snippetId: z.string().cuid(),
});
