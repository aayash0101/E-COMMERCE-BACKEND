import { env } from '@config/env';
import { connectDB } from '@config/db';
import { createApp } from './app';

async function bootstrap(): Promise<void> {
  await connectDB();

  const app = createApp();

  const server = app.listen(env.port, () => {
    console.log(`Server running in ${env.nodeEnv} mode on port ${env.port}`);
  });

  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
    server.close(() => process.exit(1));
  });
}

bootstrap();