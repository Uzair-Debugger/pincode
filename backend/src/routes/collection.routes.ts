import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { collectionController } from '../controllers/collection.controller';

const collectionRouter = Router();

collectionRouter.use(authenticate);

collectionRouter.route('/')
  .get(collectionController.getMany)
  .post(collectionController.create);

collectionRouter.route('/:id')
  .get(collectionController.getOne)
  .patch(collectionController.update)
  .delete(collectionController.delete);

collectionRouter.route('/:id/snippets')
  .post(collectionController.addSnippet)
  .delete(collectionController.removeSnippet);

export default collectionRouter;
