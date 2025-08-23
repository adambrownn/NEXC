const dns = require('dns').promises;
const net = require('net');
const mongoose = require('mongoose');
require('dotenv').config({ path: './env/.env' });

async function testDNS() {
    try {
        console.log('\n=== Testing MongoDB Atlas DNS Resolution ===');
        const url = new URL(process.env.MONGO_CONNECTION_URL);
        console.log('MongoDB URL protocol:', url.protocol);
        console.log('MongoDB hostname:', url.hostname);

        // Test SRV records
        try {
            console.log('\nTesting SRV records...');
            const srvRecords = await dns.resolveSrv(`_mongodb._tcp.${url.hostname}`);
            console.log('SRV records found:', srvRecords.length);
            
            // Test each SRV target
            for (const record of srvRecords) {
                console.log(`\nTesting SRV target: ${record.name}:${record.port}`);
                
                // DNS resolution
                try {
                    const addresses = await dns.resolve4(record.name);
                    console.log('IP addresses:', addresses);

                    // Test TCP connection
                    for (const ip of addresses) {
                        try {
                            await testTCPConnection(ip, record.port);
                            console.log(`TCP connection to ${ip}:${record.port} successful`);
                        } catch (err) {
                            console.error(`TCP connection to ${ip}:${record.port} failed:`, err.message);
                        }
                    }
                } catch (err) {
                    console.error(`Failed to resolve ${record.name}:`, err.message);
                }
            }
        } catch (err) {
            console.error('SRV lookup failed:', err.message);
        }

        // Test direct connection
        console.log('\n=== Testing MongoDB Connection ===');
        try {
            console.log('Attempting MongoDB connection...');
            await mongoose.connect(process.env.MONGO_CONNECTION_URL, {
                serverSelectionTimeoutMS: 30000,
                socketTimeoutMS: 30000,
                connectTimeoutMS: 30000,
                heartbeatFrequencyMS: 2000,
            });
            console.log('MongoDB connection successful!');
            console.log('Connection details:', {
                host: mongoose.connection.host,
                port: mongoose.connection.port,
                name: mongoose.connection.name,
                readyState: mongoose.connection.readyState
            });
            await mongoose.disconnect();
        } catch (err) {
            console.error('MongoDB connection failed:', err);
            if (err.name === 'MongooseServerSelectionError') {
                console.log('\nPossible issues:');
                console.log('1. IP Whitelist: Make sure your IP is whitelisted in MongoDB Atlas');
                console.log('2. Network: Check if there are any firewalls blocking outbound connections');
                console.log('3. Credentials: Verify username and password are correct');
                console.log('4. Database: Confirm the database exists and user has access');
            }
        }
    } catch (error) {
        console.error('Test failed:', error);
    }
}

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

testDNS();
