import { Request, Response, NextFunction } from 'express';
import { noteService } from '../services/note.service';
import { addNoteSchema } from '../schemas/snippet.schema';

export const noteController = {
  async add(req: Request, res: Response, next: NextFunction) {
    try {
      const { body } = addNoteSchema.parse(req.body);
      const note = await noteService.add(req.params.snippetId, req.user!.id, body);
      res.status(201).json({ status: 'success', data: { note } });
    } catch (err) { next(err); }
  },

  async getMany(req: Request, res: Response, next: NextFunction) {
    try {
      const notes = await noteService.getMany(req.params.snippetId, req.user!.id);
      res.json({ status: 'success', data: { notes } });
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { body } = addNoteSchema.parse(req.body);
      const note = await noteService.update(req.params.noteId, req.user!.id, body);
      res.json({ status: 'success', data: { note } });
    } catch (err) { next(err); }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await noteService.delete(req.params.noteId, req.user!.id);
      res.status(204).send();
    } catch (err) { next(err); }
  },
};
