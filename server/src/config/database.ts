import mongoose from 'mongoose';
import { ENV, isDev } from './env';

let isConnected = false;

export async function connectDatabase(): Promise<typeof mongoose> {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose;
  }

  const uri = ENV.MONGODB_URI;

  if (!uri || uri.includes('USERNAME:PASSWORD') || uri.includes('YOUR_CLUSTER')) {
    const errorMsg =
      `\n=======================================================\n` +
      `[DATABASE CONFIGURATION REQUIRED]\n` +
      `MONGODB_URI is not configured with real MongoDB Atlas credentials.\n` +
      `Current value: "${uri}"\n` +
      `Please update MONGODB_URI in the root .env file with your MongoDB Atlas connection string.\n` +
      `Example: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/medicare\n` +
      `=======================================================\n`;
    console.error(errorMsg);
    throw new Error('MONGODB_URI is missing or contains placeholder values. Please update your .env file.');
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      autoIndex: isDev,
    });

    isConnected = true;
    if (isDev) {
      console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);
    }

    mongoose.connection.on('error', (err) => {
      console.error('[MongoDB] Connection error occurred:', err);
    });

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.warn('[MongoDB] Connection lost. Attempting reconnection...');
    });

    return conn;
  } catch (error: any) {
    console.error(`\n=======================================================`);
    console.error(`[MongoDB Connection Failed]`);
    console.error(`Could not connect to MongoDB Atlas at the provided URI.`);
    console.error(`Error details: ${error.message || error}`);
    console.error(`Ensure your IP address is whitelisted in MongoDB Atlas Network Access (0.0.0.0/0 or current IP)`);
    console.error(`and your database user credentials in .env are correct.`);
    console.error(`=======================================================\n`);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('[MongoDB] Disconnected gracefully');
  }
}
