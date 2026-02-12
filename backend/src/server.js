import mongoose from 'mongoose';
import env from './config/env.js';
import connectDB from './config/db.js';
import app from './app.js';

const startServer = async () => {
  await connectDB();

  const server = app.listen(env.port, () => {
    console.log(`Server running in ${env.nodeEnv} mode on port ${env.port}`);
    console.log(`API docs available at http://localhost:${env.port}/api-docs`);
  });

  const gracefulShutdown = (signal) => {
    console.log(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
      console.log('HTTP server closed');
      mongoose.connection.close(false).then(() => {
        console.log('MongoDB connection closed');
        process.exit(0);
      });
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
};

startServer();
