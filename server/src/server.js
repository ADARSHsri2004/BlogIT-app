const http = require('http');
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

