import { env } from '@config/env';
import { connectDB } from '@config/db';
import { createApp } from './app';

async function bootstrap(): Promise<void> {
  await connectDB();

  const app = createApp();

  // Render sets PORT dynamically — must use process.env.PORT directly
  // and bind to 0.0.0.0 so Render can detect the open port
  const PORT = process.env.PORT ?? '5000';

  const server = app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running in ${env.nodeEnv} mode on port ${PORT}`);
  });

  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
    server.close(() => process.exit(1));
  });
}

bootstrap();