import { Request, Response, NextFunction } from 'express';
import { collectionService } from '../services/collection.service';
import { createCollectionSchema, updateCollectionSchema, collectionSnippetSchema } from '../schemas/snippet.schema';

export const collectionController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createCollectionSchema.parse(req.body);
      const collection = await collectionService.create(req.user!.id, data);
      res.status(201).json({ status: 'success', data: { collection } });
    } catch (err) { next(err); }
  },

  async getMany(req: Request, res: Response, next: NextFunction) {
    try {
      const collections = await collectionService.getMany(req.user!.id);
      res.json({ status: 'success', data: { collections } });
    } catch (err) { next(err); }
  },

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const collection = await collectionService.getOne(req.params.id, req.user!.id);
      res.json({ status: 'success', data: { collection } });
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateCollectionSchema.parse(req.body);
      const collection = await collectionService.update(req.params.id, req.user!.id, data);
      res.json({ status: 'success', data: { collection } });
    } catch (err) { next(err); }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await collectionService.delete(req.params.id, req.user!.id);
      res.status(204).send();
    } catch (err) { next(err); }
  },

  async addSnippet(req: Request, res: Response, next: NextFunction) {
    try {
      const { snippetId } = collectionSnippetSchema.parse(req.body);
      await collectionService.addSnippet(req.params.id, req.user!.id, snippetId);
      res.status(201).json({ status: 'success', message: 'Snippet added to collection' });
    } catch (err) { next(err); }
  },

  async removeSnippet(req: Request, res: Response, next: NextFunction) {
    try {
      const { snippetId } = collectionSnippetSchema.parse(req.body);
      await collectionService.removeSnippet(req.params.id, req.user!.id, snippetId);
      res.status(204).send();
    } catch (err) { next(err); }
  },
};
