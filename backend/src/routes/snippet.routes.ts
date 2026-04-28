import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { snippetController } from '../controllers/snippet.controller';
import { noteController } from '../controllers/note.controller';

const snippetRouter = Router();

snippetRouter.use(authenticate);

snippetRouter.route('/')
  .get(snippetController.getMany)
  .post(snippetController.create);

snippetRouter.route('/:id')
  .get(snippetController.getOne)
  .patch(snippetController.update)
  .delete(snippetController.delete);

// Notes nested under snippets
snippetRouter.route('/:snippetId/notes')
  .get(noteController.getMany)
  .post(noteController.add);

snippetRouter.route('/:snippetId/notes/:noteId')
  .patch(noteController.update)
  .delete(noteController.delete);

export default snippetRouter;
