const https = require('https');
const fs = require('fs');
const express = require("express");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const path = require("path");

require("dotenv").config({ path: "./env/.env" });

const app = express();
const PORT = process.env.PORT || 8080;

// Basic middleware setup
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://nexc.co.uk', 'http://localhost:3000']
    : ['http://localhost:3000', 'https://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(fileUpload());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Request Headers:', req.headers);
  next();
});

// Response logging middleware
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function (data) {
    console.log(`[${new Date().toISOString()}] Response for ${req.method} ${req.url}:`, {
      statusCode: res.statusCode,
      contentType: res.get('Content-Type'),
      dataLength: data?.length
    });
    return originalSend.apply(res, arguments);
  };
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// mongodb connection
console.log('Initializing MongoDB connection...');
const { initializeConnection, isDbConnected } = require("./src/database/connection");
const mongoose = require('mongoose');
const modelRegistry = require("./src/database/mongo/modelRegistry");

const { initializeSocketServer } = require('./src/socket/socket');

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

// Load all schemas first
console.log('Loading schemas...');
require("./src/database/mongo/schemas/Qualifications.schema");
require("./src/database/mongo/schemas/Centers.schema");
require("./src/database/mongo/schemas/Trades.schema");
require("./src/database/mongo/schemas/TradeServiceAssociation.schema");
require("./src/database/mongo/schemas/Cards.schema");
require("./src/database/mongo/schemas/Courses.schema");
require("./src/database/mongo/schemas/Tests.schema");

// Add this with other route imports
const chatController = require('./src/api/v1/chat/chat.controller');

async function initializeServer() {
  try {
    // Initialize MongoDB connection
    await initializeConnection();
    console.log('MongoDB connection established');

    // Wait for models to initialize
    console.log('Initializing models...');
    await new Promise((resolve, reject) => {
      try {
        modelRegistry.initializeModels();
        // Verify all required models are initialized
        const requiredModels = ['cards', 'courses', 'tests', 'trades'];
        for (const model of requiredModels) {
          if (!modelRegistry.getModel(model)) {
            throw new Error(`Required model ${model} was not initialized`);
          }
        }

        const httpsOptions = {
          key: fs.readFileSync(path.join(__dirname, 'certs/server.key')),
          cert: fs.readFileSync(path.join(__dirname, 'certs/server.cert'))
        };

        // Create HTTPS server
        const server = https.createServer(httpsOptions, app);

        // Initialize Socket.IO with the server
        const io = initializeSocketServer(server);

        // Start listening
        server.listen(PORT, () => {
          console.log(`HTTPS Server is running on port ${PORT}`);
          console.log('Socket.IO server initialized');
          console.log('Database connection status:', isDbConnected() ? 'Connected' : 'Not Connected');
          console.log('Models initialization status:', modelRegistry.areModelsInitialized() ? 'Initialized' : 'Not Initialized');
        });

        console.log('All required models initialized successfully');
        resolve();
      } catch (error) {
        reject(error);
      }
    });

    // API routes - mount these before static files
    console.log('[Server] Setting up API routes...');
    const routes = require("./src/routes/routes");
    console.log('[Server] Routes module loaded successfully');

    // Test route to verify API mounting
    app.get('/v1/test', (req, res) => {
      res.json({
        message: 'API routes are mounted correctly',
        dbConnected: isDbConnected(),
        modelsInitialized: modelRegistry.areModelsInitialized()
      });
    });

    // Mount API routes at /v1
    app.use("/v1", routes);
    app._router.stack.forEach(function (r) {
      if (r.route && r.route.path) {
        console.log(r.route.path)
      }
    });

    // Then add this with other app.use statements
    app.use('/v1/chat', chatController);

    // Log all registered routes
    console.log('\nRegistered API Routes:');
    function listEndpoints(router, basePath = '') {
      if (!router || !router.stack) return;

      router.stack.forEach(middleware => {
        if (middleware.route) {
          // Routes registered directly on the router
          const methods = Object.keys(middleware.route.methods).join(', ').toUpperCase();
          console.log(`${methods} ${basePath}${middleware.route.path}`);
        } else if (middleware.name === 'router') {
          // Nested routers
          const regexp = middleware.regexp.toString();
          const match = regexp.match(/^\/\^((?:\\[.*+?^${}()|[\]\\\/]|[^.*+?^${}()|[\]\\\/])*)\\\//i);
          const newPath = match ? basePath + match[1].replace(/\\./g, '.') : basePath;
          listEndpoints(middleware.handle, newPath);
        }
      });
    }

    // List routes for the main router
    console.log('Main routes:');
    listEndpoints(routes, '/v1');

    // Catch-all route for handling 404 API errors
    app.use('/v1/*', (req, res) => {
      console.log(`[404] No route found for ${req.method} ${req.originalUrl}`);
      res.status(404).json({
        success: false,
        error: 'API endpoint not found'
      });
    });

    // Serve static files AFTER API routes
    app.use(express.static(path.join(__dirname, 'build')));

    // Handle React routing AFTER API routes and static files
    app.get('*', function (req, res) {
      res.sendFile(path.join(__dirname, 'build', 'index.html'));
    });

    // Global error handler - keep this last
    app.use((err, req, res, next) => {
      console.error(`[Error] ${req.method} ${req.url}:`, err);
      res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
      });
    });

    // if in production
    if (process.env.ENV === "production") {
      // Add production-specific configurations here
    }

    // Graceful shutdown handling
    ['SIGINT', 'SIGTERM'].forEach(signal => {
      process.on(signal, async () => {
        console.log(`\nReceived ${signal}. Starting graceful shutdown...`);
        server.close(() => {
          console.log('HTTP server closed');
          // Close MongoDB connection etc.
          if (isDbConnected()) {
            console.log('Closing MongoDB connection...');
            mongoose.connection.close()
              .then(() => process.exit(0))
              .catch(err => {
                console.error('Error closing MongoDB connection:', err);
                process.exit(1);
              });
          } else {
            process.exit(0);
          }
        });
      });
    });
  } catch (error) {
    console.error('Server initialization failed:', error);
    process.exit(1);
  }
}

// Start server initialization
initializeServer();