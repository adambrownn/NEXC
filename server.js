const https = require('https');
const http = require('http');
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

// IMPORTANT: Do NOT use express.json() and express.urlencoded() globally
// They will corrupt multipart/form-data uploads (multer)
// These are applied selectively in routes that need them

app.use(cookieParser());

// REMOVED: app.use(fileUpload());
// express-fileupload conflicts with multer for multipart/form-data parsing
// Use multer in specific routes that need file uploads

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

// Load Blog schema
console.log('Loading Blog schema...');
require("./src/database/mongo/schemas/Blog.schema");

// Load Media schema
console.log('Loading Media schema...');
require("./src/database/mongo/schemas/Media.schema");

// Load Chat schemas
console.log('Loading Chat schemas...');
require("./src/database/mongo/schemas/ChatSession.schema");
require("./src/database/mongo/schemas/ChatMessage.schema");

// Load Support Ticket schema
console.log('Loading Support Ticket schema...');
require("./src/database/mongo/schemas/SupportTicket.schema");

// Load Notification schema
console.log('Loading Notification schema...');
require("./src/database/mongo/schemas/Notification.schema");

// Load Voice (Twilio) call log schema
console.log('Loading VoiceCalls schema...');
require("./src/database/mongo/schemas/VoiceCalls.schema");

// Load Technician schema
console.log('Loading Technician schema...');
require("./src/database/mongo/schemas/Technicians.schema");

// Add this with other route imports
const chatController = require('./src/api/v1/chat/chat.controller');

// Declare server at module scope for cleanup handlers
let server = null;

async function initializeServer() {
  try {
    // Initialize MongoDB connection
    await initializeConnection();
    console.log('MongoDB connection established');

    // Wait for models to initialize
    console.log('Initializing models...');
    // Initialize models first
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
        console.log('All required models initialized successfully');
        resolve();
      } catch (error) {
        reject(error);
      }
    });

    // API routes - mount these BEFORE creating the server
    console.log('[Server] Setting up API routes...');
    const routes = require("./src/routes/routes");
    console.log('[Server] Routes module loaded successfully');
    
    // Test email service initialization
    console.log('\n[Server] Testing email service...');
    const emailService = require('./src/common/services/email.service');
    const emailConfig = emailService.getConfig();
    console.log('[Server] Email service config:', JSON.stringify(emailConfig, null, 2));
    if (emailConfig.hasApiKey) {
      console.log('✅ [Server] Email service is configured and ready');
    } else {
      console.warn('⚠️ [Server] Email service not configured - missing API key');
    }

    // Mount API routes at /v1
    app.use("/v1", routes);
    
    // Log routes after mounting
    console.log('\nMounted API routes at /v1');
    console.log('Auth endpoints available:');
    console.log('  POST /v1/auth/login');
    console.log('  POST /v1/auth/create-admin');
    console.log('  POST /v1/auth/sync-users');
    console.log('  GET /v1/auth/debug-users (dev only)');

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

    // NOW create and start the HTTPS server AFTER all routes are mounted
    const httpsOptions = {
      key: fs.readFileSync(path.join(__dirname, 'certs/server.key')),
      cert: fs.readFileSync(path.join(__dirname, 'certs/server.cert'))
    };

    // Create HTTPS server
    server = https.createServer(httpsOptions, app);

    // Initialize Socket.IO with the server
    const io = initializeSocketServer(server);

    // Start listening
    server.listen(PORT, () => {
      console.log(`\n✅ HTTPS Server is running on port ${PORT}`);
      console.log('✅ Socket.IO server initialized');
      console.log('✅ Database connection status:', isDbConnected() ? 'Connected' : 'Not Connected');
      console.log('✅ Models initialization status:', modelRegistry.areModelsInitialized() ? 'Initialized' : 'Not Initialized');
    });

    // ALSO start HTTP server on port 8081 for ngrok (development only)
    if (process.env.ENV !== 'production') {
      const httpServer = http.createServer(app);
      const HTTP_PORT = 8081;
      httpServer.listen(HTTP_PORT, () => {
        console.log(`✅ HTTP Server (for ngrok) running on port ${HTTP_PORT}`);
      });
    }

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

    // Add development-specific optimizations
    if (process.env.NODE_ENV !== 'production') {
      // Reduce logging in development - FIXED VERSION
      const originalLog = console.log;
      console.log = (...args) => {
        // Only log important messages - safely check if args[0] is a string
        if (args[0] && 
            typeof args[0] === 'string' && 
            (args[0].includes('Error') || 
             args[0].includes('Warning') || 
             args[0].includes('✅') || 
             args[0].includes('❌'))) {
          originalLog(...args);
        }
        // Also log objects/arrays that might contain error information
        else if (args[0] && typeof args[0] === 'object') {
          const stringified = JSON.stringify(args[0]);
          if (stringified.includes('Error') || stringified.includes('Warning')) {
            originalLog(...args);
          }
        }
        // Always log console calls that don't have a first argument (edge case)
        else if (!args[0]) {
          originalLog(...args);
        }
      };
      
      // Add process monitoring
      setInterval(() => {
        const usage = process.memoryUsage();
        const usedMB = usage.heapUsed / 1024 / 1024;
        
        if (usedMB > 200) { // 200MB threshold
          console.warn(`⚠️ [Server] High memory usage: ${usedMB.toFixed(2)}MB`);
          
          // Force garbage collection
          if (global.gc) {
            global.gc();
            console.log('🧹 [Server] Forced garbage collection');
          }
        }
      }, 60000); // Check every minute
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