import { Router } from 'express';
import healthRouter from './health.routes';

const router = Router();

router.use('/health', healthRouter);
router.get('/', (_req, res) => {
  res.json({ status: 'Server is up & running' });
});

// Mount future routers here:
// router.use('/users', userRouter);
// router.use('/auth', authRouter);

export default router;
