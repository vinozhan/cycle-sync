import env from './config/env.js';
import connectDB from './config/db.js';
import app from './app.js';

const startServer = async () => {
  await connectDB();

  app.listen(env.port, () => {
    console.log(`Server running in ${env.nodeEnv} mode on port ${env.port}`);
    console.log(`API docs available at http://localhost:${env.port}/api-docs`);
  });
};

startServer();
