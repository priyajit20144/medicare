import { app } from './app';
import { ENV } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';

async function startServer() {
  console.log(`\n-------------------------------------------------------`);
  console.log(`[MEDICARE] Initializing Backend Services...`);
  console.log(`Environment: ${ENV.NODE_ENV}`);
  console.log(`Port: ${ENV.PORT}`);
  console.log(`-------------------------------------------------------\n`);

  // Bind HTTP server immediately so port is open without ECONNREFUSED startup race conditions
  const server = app.listen(ENV.PORT, () => {
    console.log(`🚀 [MEDICARE API] Server actively listening at http://localhost:${ENV.PORT}`);
    console.log(`📋 [Health Check] http://localhost:${ENV.PORT}/api/health`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ [Port Conflict] Port ${ENV.PORT} is already in use by another process.`);
      console.error(`To free port ${ENV.PORT}, run: fuser -k ${ENV.PORT}/tcp\n`);
    } else {
      console.error('[Server Error]', err);
    }
    process.exit(1);
  });

  const handleShutdown = async (signal: string) => {
    console.log(`\n[Server] Received ${signal}. Starting graceful shutdown...`);
    server.close(async () => {
      console.log('[Server] HTTP server closed.');
      await disconnectDatabase();
      process.exit(0);
    });

    // Force shutdown after timeout
    setTimeout(() => {
      console.error('[Server] Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));

  try {
    // Connect to MongoDB Atlas (Mongoose buffers queries during connection)
    await connectDatabase();
  } catch (error: any) {
    console.error(`\n❌ [Server Startup Aborted]`);
    console.error(`Database connection could not be established.`);
    console.error(`Please review your MONGODB_URI in the root .env file.`);
    console.error(`Error details: ${error.message || error}`);
    console.error(`=======================================================\n`);
    server.close(() => process.exit(1));
  }
}

startServer();
