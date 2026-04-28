import { Request, Response, NextFunction } from 'express';
import { snippetService } from '../services/snippet.service';
import { createSnippetSchema, updateSnippetSchema, snippetQuerySchema } from '../schemas/snippet.schema';

export const snippetController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createSnippetSchema.parse(req.body);
      const snippet = await snippetService.create(req.user!.id, data);
      res.status(201).json({ status: 'success', data: { snippet } });
    } catch (err) { next(err); }
  },

  async getMany(req: Request, res: Response, next: NextFunction) {
    try {
      const query = snippetQuerySchema.parse(req.query);
      const result = await snippetService.getMany({
        userId: req.user!.id,
        ...query,
        isFavorite: query.isFavorite === 'true' ? true : query.isFavorite === 'false' ? false : undefined,
      });
      res.json({ status: 'success', data: result });
    } catch (err) { next(err); }
  },

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const snippet = await snippetService.getOne(req.params.id, req.user!.id);
      res.json({ status: 'success', data: { snippet } });
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateSnippetSchema.parse(req.body);
      const snippet = await snippetService.update(req.params.id, req.user!.id, data);
      res.json({ status: 'success', data: { snippet } });
    } catch (err) { next(err); }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await snippetService.delete(req.params.id, req.user!.id);
      res.status(204).send();
    } catch (err) { next(err); }
  },
};
