import { Router } from 'express';
import healthRouter from './health.routes';
import authRouter from './auth.routes';
import snippetRouter from './snippet.routes';
import collectionRouter from './collection.routes';

const router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/snippets', snippetRouter);
router.use('/collections', collectionRouter);
router.get('/', (_req, res) => {
  res.json({ status: 'Server is up & running' });
});

export default router;
