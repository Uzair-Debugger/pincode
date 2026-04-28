import { noteRepository } from '../repositories/note.repository';
import { snippetRepository } from '../repositories/snippet.repository';
import { AppError } from '../utils/AppError';

export const noteService = {
  async add(snippetId: string, userId: string, body: string) {
    const snippet = await snippetRepository.findOne(snippetId, userId);
    if (!snippet) throw new AppError('Snippet not found', 404);
    return noteRepository.create(snippetId, body);
  },

  async getMany(snippetId: string, userId: string) {
    const snippet = await snippetRepository.findOne(snippetId, userId);
    if (!snippet) throw new AppError('Snippet not found', 404);
    return noteRepository.findMany(snippetId);
  },

  async update(noteId: string, userId: string, body: string) {
    const note = await noteRepository.findOne(noteId);
    if (!note) throw new AppError('Note not found', 404);
    const snippet = await snippetRepository.findOne(note.snippetId, userId);
    if (!snippet) throw new AppError('Forbidden', 403);
    return noteRepository.update(noteId, body);
  },

  async delete(noteId: string, userId: string) {
    const note = await noteRepository.findOne(noteId);
    if (!note) throw new AppError('Note not found', 404);
    const snippet = await snippetRepository.findOne(note.snippetId, userId);
    if (!snippet) throw new AppError('Forbidden', 403);
    return noteRepository.delete(noteId);
  },
};
