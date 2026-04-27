import app from './app';
import { env } from './config/env';
import { disconnectPrisma } from './services/prisma.service';

const server = app.listen(env.PORT, () => {
  console.log(`[server] Running in ${env.NODE_ENV} mode on port ${env.PORT}`);
});

async function shutdown(signal: string): Promise<void> {
  console.log(`[server] ${signal} received — shutting down gracefully`);
  server.close(async () => {
    await disconnectPrisma();
    console.log('[server] Shutdown complete');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('[server] Unhandled rejection:', reason);
  process.exit(1);
});
