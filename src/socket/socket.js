const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const modelRegistry = require('../database/mongo/modelRegistry');

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
            
            // Enhanced logging to diagnose role detection issues
            console.log('[Socket.IO Auth] Token decoded successfully:', {
                userId: decoded.userId,
                email: decoded.email,
                accountType: decoded.accountType,
                name: decoded.name,
                hasAccountType: !!decoded.accountType
            });
            
            socket.user = decoded;
            return next();
        } catch (err) {
            console.log('[Socket.IO Auth] Token verification failed:', err.message);
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
                const ChatSession = modelRegistry.getModel('chat_sessions');
                
                // CRITICAL: Validate sender and session ownership
                const session = await ChatSession.findOne({ sessionId: data.sessionId });
                
                if (!session) {
                    console.error(`❌ Session not found: ${data.sessionId}`);
                    socket.emit('message_error', { error: 'Session not found' });
                    return;
                }

                // Validate sender belongs to this session
                let isAuthorizedSender = false;
                
                if (data.sender?.role === 'customer' || data.sender?.role === 'guest') {
                    // For customers, verify they match the session customer
                    // Either by ID or by being anonymous from same session room
                    if (session.customer?.isAnonymous && socket.user?.isAnonymous) {
                        // Anonymous customer sending to their own anonymous session - allowed
                        isAuthorizedSender = true;
                    } else if (session.customer?.id && data.sender?.id === session.customer?.id) {
                        // Authenticated customer sending to their own session - allowed
                        isAuthorizedSender = true;
                    } else if (session.customer?.id === socket.user?.id) {
                        // Authenticated user sending to their own session - allowed
                        isAuthorizedSender = true;
                    }
                } else if (data.sender?.role === 'agent') {
                    // For agents, verify they are authenticated staff
                    const senderRole = socket.user?.accountType || socket.user?.role || 'user';
                    if (['admin', 'superadmin', 'support', 'supervisor', 'manager'].includes(senderRole)) {
                        // Authenticated staff sending agent message - allowed
                        isAuthorizedSender = true;
                        
                        // Auto-assign agent if not already assigned
                        if (!session.agent?.id) {
                            session.agent = {
                                id: socket.user?.userId || socket.user?.id,
                                name: socket.user?.name || 'Support Agent',
                                assignedAt: new Date()
                            };
                            session.status = 'active';
                        }
                    }
                }

                if (!isAuthorizedSender) {
                    console.error(`❌ Unauthorized sender for session ${data.sessionId}:`, {
                        senderRole: data.sender?.role,
                        socketUser: socket.user,
                        sessionCustomer: session.customer
                    });
                    socket.emit('message_error', { error: 'Not authorized to send messages to this session' });
                    return;
                }

                // Save message to database
                const message = await saveChatMessage(data);

                console.log(`📤 Broadcasting message to:`);
                console.log(`   - staff room`);
                console.log(`   - session:${data.sessionId} room`);

                // Broadcast to ALL staff members
                io.to('staff').emit('new_message', message);

                // Broadcast to the specific session room
                io.to(`session:${data.sessionId}`).emit('new_message', message);
                
                // Log room members for debugging
                const sessionRoom = io.sockets.adapter.rooms.get(`session:${data.sessionId}`);
                console.log(`   - ${sessionRoom?.size || 0} clients in session room`);

                // Additional broadcast to specific user if available
                if (session && session.customer && session.customer.id && !session.customer.isAnonymous) {
                    io.to(`user:${session.customer.id}`).emit('new_message', message);
                    console.log(`   - user:${session.customer.id} room`);
                }

                // Broadcast session update to all staff
                io.to('staff').emit('session_updated', { sessionId: data.sessionId, lastActivity: new Date() });
            } catch (error) {
                console.error('Error handling message:', error);
                socket.emit('message_error', { error: 'Failed to send message' });
            }
        });

        // Handle typing indicators
        socket.on('typing', (data) => {
            // Broadcast typing indicator to session room
            socket.to(`session:${data.sessionId}`).emit('user_typing', {
                sessionId: data.sessionId,
                from: data.from,
                isTyping: data.isTyping,
                userInfo: {
                    id: socket.user.id || socket.id,
                    name: socket.user.name || 'Anonymous'
                }
            });

            // Also broadcast to staff room if customer is typing
            if (data.from === 'customer') {
                io.to('staff').emit('customer_typing', {
                    sessionId: data.sessionId,
                    isTyping: data.isTyping
                });
            }
        });

        // Handle joining sessions - WITH AUTHORIZATION
        socket.on('join_session', async ({ sessionId }) => {
            if (!sessionId) {
                return socket.emit('session_joined', { sessionId, success: false, error: 'Session ID required' });
            }
            
            try {
                const ChatSession = modelRegistry.getModel('chat_sessions');
                const session = await ChatSession.findOne({ sessionId });
                
                if (!session) {
                    console.log(`❌ Client ${socket.id} tried to join non-existent session: ${sessionId}`);
                    return socket.emit('session_joined', { sessionId, success: false, error: 'Session not found' });
                }
                
                // Check authorization
                const isStaff = ['admin', 'superadmin', 'support', 'supervisor', 'manager'].includes(socket.user?.accountType);
                const isSessionOwner = session.customer?.id === socket.user?.id || 
                                       session.customer?.id === socket.user?.userId;
                const isAnonymousOwner = session.customer?.isAnonymous && socket.user?.isAnonymous;
                
                if (!isStaff && !isSessionOwner && !isAnonymousOwner) {
                    console.log(`❌ Client ${socket.id} unauthorized for session: ${sessionId}`);
                    return socket.emit('session_joined', { sessionId, success: false, error: 'Unauthorized' });
                }
                
                console.log(`✅ Client ${socket.id} joining session room: session:${sessionId}`);
                socket.join(`session:${sessionId}`);
                socket.emit('session_joined', { sessionId, success: true });
            } catch (error) {
                console.error(`Error in join_session: ${error.message}`);
                socket.emit('session_joined', { sessionId, success: false, error: 'Server error' });
            }
        });

        // Handle joining user room for notifications
        socket.on('join_user_room', ({ userId }) => {
            if (userId) {
                console.log(`Client ${socket.id} joining user room: user:${userId}`);
                socket.join(`user:${userId}`);
            }
        });

        // Handle joining voice monitoring room (for admins/supervisors)
        socket.on('join_voice_monitoring', () => {
            // Only allow staff/admin roles to join monitoring
            // Check BOTH accountType and role fields for maximum compatibility
            const userRole = socket.user?.accountType || socket.user?.role || 'user';
            const userId = socket.user?.userId || socket.user?.id;
            
            console.log(`[Socket.IO] Client ${socket.id} requesting voice_monitoring access`);
            console.log(`[Socket.IO] User info:`, {
                userId,
                accountType: socket.user?.accountType,
                role: socket.user?.role,
                determinedRole: userRole,
                isAnonymous: socket.user?.isAnonymous,
                allowedRoles: ['admin', 'superadmin', 'support', 'supervisor', 'manager']
            });
            
            if (socket.user && !socket.user.isAnonymous && ['admin', 'superadmin', 'support', 'supervisor', 'manager'].includes(userRole)) {
                socket.join('voice_monitoring');
                console.log(`✅ [Socket.IO] Client ${socket.id} (role: ${userRole}) joined voice_monitoring room`);
                
                // Acknowledge to client
                socket.emit('voice_monitoring_joined', { 
                    success: true, 
                    role: userRole,
                    accountType: socket.user?.accountType,
                    roomMembers: io.sockets.adapter.rooms.get('voice_monitoring')?.size || 0
                });
            } else {
                console.log(`❌ [Socket.IO] Client ${socket.id} (role: ${userRole}) denied access to voice_monitoring`);
                socket.emit('voice_monitoring_joined', { 
                    success: false, 
                    reason: 'Insufficient permissions',
                    role: userRole,
                    accountType: socket.user?.accountType,
                    requiredRoles: ['admin', 'superadmin', 'support', 'supervisor', 'manager']
                });
            }
        });

        // Handle customer ending chat
        socket.on('end_chat', async (data) => {
            try {
                const { sessionId, closedBy, feedback } = data;
                console.log(`🔚 Customer ending chat session: ${sessionId}`);
                
                // Import chat service
                const chatService = require('../api/v1/chat/chat.service');
                
                // Close session in database (will emit to all parties)
                await chatService.closeSession(sessionId, closedBy || 'customer');
                
                // Additional notification with feedback if provided
                if (feedback) {
                    io.to('staff').emit('session_closed', {
                        sessionId,
                        closedBy: closedBy || 'customer',
                        closedAt: new Date(),
                        feedback: feedback,
                        reason: 'Customer ended chat session'
                    });
                }
                
                console.log(`✅ Session ${sessionId} closed by customer`);
            } catch (error) {
                console.error('Error handling customer chat end:', error);
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
        const ChatMessage = modelRegistry.getModel('chat_messages');
        const ChatSession = modelRegistry.getModel('chat_sessions');
        
        // Create new message document
        const message = new ChatMessage({
            sessionId: messageData.sessionId,
            sender: messageData.sender,
            content: messageData.content || messageData.text, // Handle both field names
            messageType: messageData.fileData ? 'file' : 'text',
            fileData: messageData.fileData || null,
            timestamp: messageData.timestamp || new Date()
        });

        await message.save();

        // Update session's lastActivity timestamp
        await ChatSession.updateOne(
            { sessionId: messageData.sessionId },
            { lastActivity: new Date() }
        );

        return message.toObject();
    } catch (error) {
        console.error('Error saving chat message:', error);
        throw error;
    }
}

// Export both the function and a getter for the io object
// Use getIO() to access the initialized Socket.IO instance
function getIO() {
    if (!io) {
        throw new Error('Socket.IO not initialized. Call initializeSocketServer() first.');
    }
    return io;
}

module.exports = { initializeSocketServer, getIO, io };