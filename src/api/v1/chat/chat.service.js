const modelRegistry = require('../../../database/mongo/modelRegistry');
const { v4: uuidv4 } = require('uuid');

// Helper functions to get models
const getChatSessionModel = () => modelRegistry.getModel('chat_sessions');
const getChatMessageModel = () => modelRegistry.getModel('chat_messages');

// Create a new chat session
exports.createChatSession = async (customerData) => {
    try {
        const ChatSession = getChatSessionModel();
        const sessionId = uuidv4();
        
        // Check if customer has previous chats
        let previousChatCount = 0;
        let lastChatDate = null;
        let previousAgents = [];
        let isFirstChat = true;
        
        if (customerData.id && !customerData.isAnonymous) {
            const previousSessions = await ChatSession.find({
                'customer.id': customerData.id,
                status: 'closed'
            }).sort({ startedAt: -1 }).limit(10);
            
            previousChatCount = previousSessions.length;
            isFirstChat = previousChatCount === 0;
            
            if (previousSessions.length > 0) {
                lastChatDate = previousSessions[0].startedAt;
                // Collect unique agent IDs from previous chats
                previousAgents = [...new Set(previousSessions
                    .filter(s => s.agent && s.agent.id)
                    .map(s => s.agent.id))];
            }
        }
        
        const session = new ChatSession({
            sessionId,
            customer: {
                id: customerData.id || 'anonymous',
                name: customerData.name || 'Anonymous User',
                email: customerData.email || '',
                isAnonymous: !customerData.id
            },
            status: 'pending',
            priority: 'normal',
            isFirstChat,
            previousChatCount,
            lastChatDate,
            previousAgents
        });

        await session.save();

        // Get io from socket.js
        const { io } = require('../../../socket/socket');

        // Emit to all staff members with customer history
        if (io) {
            io.to('staff').emit('new_chat_session', {
                ...session.toObject(),
                customerHistory: {
                    isNew: isFirstChat,
                    previousChats: previousChatCount,
                    lastChat: lastChatDate,
                    wasPreviousAgent: false // Will be set per agent
                }
            });
        }

        return session.toObject();
    } catch (error) {
        console.error('Error creating chat session:', error);
        throw error;
    }
};

// Save a new message
exports.saveMessage = async (messageData) => {
    try {
        const ChatMessage = getChatMessageModel();
        const ChatSession = getChatSessionModel();
        
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
        console.error('Error saving message:', error);
        throw error;
    }
};

// Assign an agent to a chat session
exports.assignAgentToSession = async (sessionId, agentData) => {
    try {
        const ChatSession = getChatSessionModel();
        
        const session = await ChatSession.findOne({ sessionId });
        if (!session) {
            throw new Error('Chat session not found');
        }

        session.agent = {
            id: agentData.id,
            name: agentData.name,
            assignedAt: new Date()
        };
        session.status = 'active';

        await session.save();

        // Emit assignment event
        const { io } = require('../../../socket/socket');
        if (io) {
            io.to('staff').emit('session_assigned', {
                sessionId,
                agent: session.agent,
                status: session.status
            });
        }

        return session.toObject();
    } catch (error) {
        console.error('Error assigning agent:', error);
        throw error;
    }
};

// Get chat history for a session
exports.getChatHistory = async (sessionId) => {
    try {
        const ChatMessage = getChatMessageModel();
        return await ChatMessage.find({ sessionId }).sort({ timestamp: 1 }).lean();
    } catch (error) {
        console.error('Error fetching chat history:', error);
        throw error;
    }
};

// Get a specific session by ID
exports.getSessionById = async (sessionId) => {
    try {
        const ChatSession = getChatSessionModel();
        return await ChatSession.findOne({ sessionId }).lean();
    } catch (error) {
        console.error('Error fetching session:', error);
        throw error;
    }
};

// Get active sessions for staff dashboard
exports.getActiveSessions = async () => {
    try {
        const ChatSession = getChatSessionModel();
        return await ChatSession.find({
            status: { $in: ['active', 'pending'] }
        }).sort({ lastActivity: -1 }).lean();
    } catch (error) {
        console.error('Error fetching active sessions:', error);
        throw error;
    }
};

// Close a chat session
exports.closeSession = async (sessionId, closedBy = 'agent') => {
    try {
        const ChatSession = getChatSessionModel();
        
        const result = await ChatSession.updateOne(
            { sessionId },
            {
                status: 'closed',
                endedAt: new Date()
            }
        );

        // Emit session closed event to all parties
        const { io } = require('../../../socket/socket');
        if (io) {
            const closeData = { 
                sessionId, 
                closedAt: new Date(),
                closedBy: closedBy
            };
            
            // Notify staff
            io.to('staff').emit('session_closed', closeData);
            
            // Notify customer in the session room
            io.to(`session:${sessionId}`).emit('session_closed', closeData);
            
            console.log(`📢 Session ${sessionId} closed by ${closedBy}, notified all parties`);
        }

        return result;
    } catch (error) {
        console.error('Error closing chat session:', error);
        throw error;
    }
};

exports.getClosedSessions = async () => {
    try {
        const ChatSession = getChatSessionModel();
        return await ChatSession.find({
            status: 'closed'
        }).sort({ endedAt: -1 }).limit(100).lean(); // Limit to recent 100 closed chats
    } catch (error) {
        console.error('Error fetching closed sessions:', error);
        throw error;
    }
};

// Transfer chat to another agent
exports.transferChat = async (sessionId, toAgentId) => {
    try {
        const ChatSession = getChatSessionModel();
        
        const session = await ChatSession.findOne({ sessionId });
        if (!session) {
            throw new Error('Chat session not found');
        }

        // Record transfer history
        const transferRecord = {
            fromAgent: session.agent?.id || null,
            toAgent: toAgentId,
            transferredAt: new Date(),
            reason: 'Manual transfer'
        };

        // Update session
        await ChatSession.updateOne(
            { sessionId },
            {
                $set: {
                    'agent.id': toAgentId,
                    'agent.assignedAt': new Date(),
                    status: 'active'
                },
                $push: { transferHistory: transferRecord }
            }
        );

        // Emit transfer event
        const { io } = require('../../../socket/socket');
        if (io) {
            io.to('staff').emit('session_transferred', {
                sessionId,
                fromAgent: transferRecord.fromAgent,
                toAgent: toAgentId,
                transferredAt: transferRecord.transferredAt
            });
        }

        return { success: true, transferRecord };
    } catch (error) {
        console.error('Error transferring chat:', error);
        throw error;
    }
};

// Save feedback for a chat session
exports.saveFeedback = async (sessionId, rating, comments) => {
    try {
        const ChatSession = getChatSessionModel();
        
        const result = await ChatSession.updateOne(
            { sessionId },
            {
                feedback: {
                    rating,
                    comments: comments || '',
                    submittedAt: new Date()
                }
            }
        );

        return { success: true, feedback: { rating, comments } };
    } catch (error) {
        console.error('Error saving feedback:', error);
        throw error;
    }
};