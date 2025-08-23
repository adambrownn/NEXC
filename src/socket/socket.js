const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const ChatMessage = require('../database/mongo/models/chat-message.model');
const ChatSession = require('../database/mongo/models/chat-session.model');

// At the top of socket.js, declare a global io variable
let io;

function initializeSocketServer(server) {
    io = socketIo(server, {
        cors: {
            origin: [
                'https://localhost:3000',
                'http://localhost:3000'
            ],
            methods: ["GET", "POST", "OPTIONS"],
            credentials: true,
            allowedHeaders: ["Authorization", "Content-Type"]
        },
        transports: ['polling', 'websocket'],
        path: '/socket.io/'
    });

    // Authentication middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;

        // Allow anonymous users but mark them differently
        if (!token) {
            socket.user = { isAnonymous: true, id: socket.id };
            return next();
        }

        try {
            // Verify token for authenticated users
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded;
            return next();
        } catch (err) {
            socket.user = { isAnonymous: true, id: socket.id };
            return next();
        }
    });

    // Connection handler
    io.on('connection', (socket) => {
        console.log('New client connected', socket.id, socket.user);

        // Join appropriate rooms based on user role
        if (socket.user.isAnonymous) {
            socket.join('anonymous');
        } else if (['admin', 'superadmin', 'support'].includes(socket.user.accountType)) {
            socket.join('staff');
        } else {
            socket.join(`user:${socket.user.id}`);
        }

        // Handle new chat messages
        socket.on('send_message', async (data) => {
            try {
                // Save message to database
                const message = await saveChatMessage(data);

                // Broadcast to ALL staff members
                io.to('staff').emit('new_message', message);

                // Broadcast to the specific session room
                io.to(`session:${data.sessionId}`).emit('new_message', message);

                // Additional broadcast to specific user if available
                const session = await ChatSession.findOne({ sessionId: data.sessionId });
                if (session && session.customer && session.customer.id) {
                    io.to(`user:${session.customer.id}`).emit('new_message', message);
                }

                // Broadcast session update to all staff
                io.to('staff').emit('session_updated', { sessionId: data.sessionId });
            } catch (error) {
                console.error('Error handling message:', error);
            }
        });

        // Handle typing indicators
        socket.on('typing', (data) => {
            socket.to(data.to).emit('user_typing', {
                from: data.from,
                isTyping: data.isTyping
            });
        });

        // Handle joining sessions
        socket.on('join_session', ({ sessionId }) => {
            if (sessionId) {
                console.log(`Client ${socket.id} joining session room: session:${sessionId}`);
                socket.join(`session:${sessionId}`);
            }
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('Client disconnected', socket.id);
        });
    });

    return io;
}

async function saveChatMessage(messageData) {
    try {
        // Create new message document
        const message = new ChatMessage({
            sessionId: messageData.sessionId,
            sender: messageData.sender,
            content: messageData.content,
            timestamp: messageData.timestamp || new Date()
        });

        await message.save();

        // Update session's lastActivity timestamp
        await ChatSession.updateOne(
            { sessionId: messageData.sessionId },
            { lastActivity: new Date() }
        );

        return message;
    } catch (error) {
        console.error('Error saving chat message:', error);
        throw error;
    }
}

// Export both the function and the io object
module.exports = { initializeSocketServer, io };