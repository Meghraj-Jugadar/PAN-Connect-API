import app from './app.js';
import prisma from './lib/prisma.js';
import { LOGGER } from './utils/logger.js';

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3000');
    await app.listen({ port, host: '0.0.0.0' });
    LOGGER.info(`Server running at http://localhost:${port}`);
  } catch (err) {
    LOGGER.error(err);
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  LOGGER.info('Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});

start();
