const http = require('http');
const mongoose = require('mongoose');
const app = require('./app');
const connectDB = require('./utils/db');
const { PORT } = require('./utils/config');

const server = http.createServer(app);

const start = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      process.stdout.write(`API running on http://localhost:${PORT}\n`);
    });
  } catch (error) {
    process.stderr.write(`Failed to start server: ${error?.message}\n`);
    process.exit(1);
  }
};

start();

const shutdown = (signal) => {
  process.stdout.write(`${signal} received. Shutting down...\n`);
  server.close(async () => {
    await mongoose.connection.close();
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

