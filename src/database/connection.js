const mongoose = require('mongoose');
const dns = require('dns').promises;
const modelRegistry = require('./mongo/modelRegistry');
const net = require('net'); // Added this line

// Track connection state
let isConnected = false;

console.log('MongoDB Connection Setup:');
console.log('- Node Environment:', process.env.NODE_ENV);
console.log('- MongoDB URL configured:', process.env.MONGO_CONNECTION_URL ? 'Yes' : 'No');

// Configure mongoose
mongoose.set('debug', process.env.NODE_ENV !== 'production');
mongoose.set('strictQuery', true);

// Connection options optimized for MongoDB Atlas
const mongooseOptions = {
  serverSelectionTimeoutMS: 15000,    // Reduced from 60000
  heartbeatFrequencyMS: 10000,         // Increased
  connectTimeoutMS: 30000,            // Reduced from 60000
  socketTimeoutMS: 30000,             // Reduced from 45000
  maxPoolSize: process.env.NODE_ENV === 'production' ? 50 : 10,                    // Maximum pool size
  minPoolSize: process.env.NODE_ENV === 'production' ? 10 : 2,                    // Minimum pool size
  retryWrites: true,                  // Enable retry writes
  retryReads: true,                   // Enable retry reads
  family: 4,                          // Force IPv4
  autoIndex: true,                    // Build indexes
  maxConnecting: 10,                  // Maximum number of connections being established at once
  ssl: true,                          // Enable SSL for Atlas
  tls: true,                          // Enable TLS
  directConnection: false,            // Required for replica sets
  authSource: 'admin',                // Authentication database
  serverApi: {
    version: '1',                     // Use latest stable API version
    strict: true,
    deprecationErrors: true
  }
};

// Initialize connection
const initializeConnection = async (retryAttempt = 1) => {
  try {
    if (!process.env.MONGO_CONNECTION_URL) {
      throw new Error('MongoDB connection URL is not configured. Please check your environment variables.');
    }

    if (!isConnected) {
      console.log(`[MongoDB] Connection attempt ${retryAttempt} of 3`);
      
      // Parse and validate MongoDB Atlas URL
      const url = new URL(process.env.MONGO_CONNECTION_URL);
      
      // For MongoDB Atlas, verify DNS resolution
      try {
        console.log('[MongoDB] Resolving DNS for MongoDB Atlas...');
        if (url.protocol === 'mongodb+srv:') {
          // Try SRV records first (for Atlas)
          try {
            const srvRecords = await dns.resolveSrv(`_mongodb._tcp.${url.hostname}`);
            console.log('[MongoDB] SRV records found:', srvRecords.length);
            
            // Test TCP connection to each SRV target
            for (const record of srvRecords) {
              try {
                const addresses = await dns.resolve4(record.name);
                console.log(`[MongoDB] Resolved ${record.name} to:`, addresses);
                
                // Test TCP connection
                for (const ip of addresses) {
                  try {
                    await testTCPConnection(ip, record.port);
                    console.log(`[MongoDB] TCP connection to ${ip}:${record.port} successful`);
                  } catch (err) {
                    console.warn(`[MongoDB] TCP connection to ${ip}:${record.port} failed:`, err.message);
                  }
                }
              } catch (err) {
                console.warn(`[MongoDB] Failed to resolve ${record.name}:`, err.message);
              }
            }
          } catch (srvErr) {
            console.warn('[MongoDB] SRV lookup failed:', srvErr.message);
          }
        } else {
          // For standard mongodb:// URLs, just do A record lookup
          const addresses = await dns.resolve4(url.hostname);
          console.log(`[MongoDB] DNS resolved. Available addresses: ${addresses.join(', ')}`);
        }
      } catch (dnsError) {
        console.warn('[MongoDB] DNS resolution warning:', dnsError.message);
        console.log('[MongoDB] Proceeding with connection attempt anyway...');
      }

      // Connect to MongoDB
      console.log('[MongoDB] Attempting to connect...');
      await mongoose.connect(process.env.MONGO_CONNECTION_URL, mongooseOptions);
      
      // Set up connection event handlers
      mongoose.connection.on('connected', () => {
        console.log('[MongoDB] Connected successfully');
        isConnected = true;
        
        // Initialize models after connection
        try {
          console.log('[MongoDB] Initializing model registry...');
          modelRegistry.initializeModels();
          console.log('[MongoDB] Model registry initialized successfully');
        } catch (error) {
          console.error('[MongoDB] Error initializing model registry:', error);
        }
      });

      mongoose.connection.on('error', (err) => {
        console.error('[MongoDB] Connection error:', err);
        isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('[MongoDB] Disconnected');
        isConnected = false;
      });

      return true;
    }
  } catch (error) {
    console.error('[MongoDB] Connection error:', error);
    if (retryAttempt < 3) {
      console.log(`[MongoDB] Retrying connection (attempt ${retryAttempt + 1} of 3)...`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      return initializeConnection(retryAttempt + 1);
    }
    throw error;
  }
};

// Helper function to test TCP connection
function testTCPConnection(host, port) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    const timeout = 5000;

    socket.setTimeout(timeout);

    socket.on('connect', () => {
      socket.end();
      resolve();
    });

    socket.on('timeout', () => {
      socket.destroy();
      reject(new Error('Connection timed out'));
    });

    socket.on('error', (err) => {
      reject(err);
    });

    socket.connect(port, host);
  });
}

// Export connection state checker
const isDbConnected = () => isConnected;

// Handle process termination
process.on('SIGINT', async () => {
  try {
    process.env.IS_SHUTTING_DOWN = true;
    if (isConnected) {
      console.log('[MongoDB] Closing connection...');
      await mongoose.connection.close();
      console.log('[MongoDB] Connection closed.');
    }
    process.exit(0);
  } catch (error) {
    console.error('[MongoDB] Error during shutdown:', error);
    process.exit(1);
  }
});

module.exports = {
  initializeConnection,
  isDbConnected
};