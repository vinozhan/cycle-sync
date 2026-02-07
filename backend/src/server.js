const env = require('./config/env');
const connectDB = require('./config/db');
const app = require('./app');

const startServer = async () => {
  await connectDB();

  app.listen(env.port, () => {
    console.log(`Server running in ${env.nodeEnv} mode on port ${env.port}`);
    console.log(`API docs available at http://localhost:${env.port}/api-docs`);
  });
};

startServer();
