const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const crypto = require('crypto');

dotenv.config();

function createApp(db) {
  const app = express();
  app.use(cors({
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200
  }));
  app.use(express.json());

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

  // ... (keep existing routes and middleware)

  // New routes for control panel
  app.get('/api/server-status', (req, res) => {
    try {
      // In a real application, you'd get this data from your system
      const status = {
        status: 'online',
        storageUsed: 250,
        storageTotal: 1000,
        activeDownloads: 2,
        activeStreams: 1,
      };
      res.json(status);
    } catch (error) {
      console.error('Error fetching server status:', error);
      res.status(500).json({ error: 'Failed to fetch server status' });
    }
  });

  app.post('/api/restart-server', (req, res) => {
    try {
      // In a real application, you'd implement actual server restart logic
      console.log('Server restart requested');
      res.json({ message: 'Server restart initiated' });
    } catch (error) {
      console.error('Error restarting server:', error);
      res.status(500).json({ error: 'Failed to restart server' });
    }
  });

  return app;
}

function createServer(db) {
  const app = createApp(db);
  const PORT = process.env.PORT || 4000;
  const httpServer = http.createServer(app);
  const io = socketIo(httpServer, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  // ... (keep existing Socket.IO logic)

  const server = httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('Shutting down gracefully...');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  return server;
}

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process here, just log the error
});

if (require.main === module) {
  const db = {}; // Replace this with your actual database connection
  createServer(db);
}

module.exports = { createApp, createServer };