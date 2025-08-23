const ChatSession = require('../../../database/mongo/models/chat-session.model');
const ChatMessage = require('../../../database/mongo/models/chat-message.model');
const { v4: uuidv4 } = require('uuid');

// Create a new chat session
exports.createChatSession = async (customerData) => {
    try {
        const sessionId = uuidv4();
        const session = new ChatSession({
            sessionId,
            customer: {
                id: customerData.id || 'anonymous',
                name: customerData.name || 'Anonymous User',
                email: customerData.email || '',
                isAnonymous: !customerData.id
            }
        });

        await session.save();

        // Get io from socket.js
        const { io } = require('../../../socket/socket');

        // Emit to all staff members
        if (io) {
            io.to('staff').emit('new_chat_session', session);
        }

        return session;
    } catch (error) {
        console.error('Error creating chat session:', error);
        throw error;
    }
};

// Save a new message
exports.saveMessage = async (messageData) => {
    try {
        const message = new ChatMessage({
            sessionId: messageData.sessionId,
            sender: messageData.sender,
            content: messageData.content
        });

        await message.save();

        // Update session's lastActivity timestamp
        await ChatSession.updateOne(
            { sessionId: messageData.sessionId },
            { lastActivity: new Date() }
        );

        return message;
    } catch (error) {
        console.error('Error saving message:', error);
        throw error;
    }
};

// Assign an agent to a chat session
exports.assignAgentToSession = async (sessionId, agentData) => {
    try {
        const session = await ChatSession.findOne({ sessionId });
        if (!session) {
            throw new Error('Chat session not found');
        }

        session.agent = {
            id: agentData.id,
            name: agentData.name
        };
        session.status = 'active';

        await session.save();
        return session;
    } catch (error) {
        console.error('Error assigning agent:', error);
        throw error;
    }
};

// Get chat history for a session
exports.getChatHistory = async (sessionId) => {
    try {
        return await ChatMessage.find({ sessionId }).sort({ timestamp: 1 });
    } catch (error) {
        console.error('Error fetching chat history:', error);
        throw error;
    }
};

// Get active sessions for staff dashboard
exports.getActiveSessions = async () => {
    try {
        return await ChatSession.find({
            status: { $in: ['active', 'pending'] }
        }).sort({ lastActivity: -1 });
    } catch (error) {
        console.error('Error fetching active sessions:', error);
        throw error;
    }
};

// Close a chat session
exports.closeSession = async (sessionId) => {
    try {
        await ChatSession.updateOne(
            { sessionId },
            {
                status: 'closed',
                endedAt: new Date()
            }
        );
    } catch (error) {
        console.error('Error closing chat session:', error);
        throw error;
    }
};

exports.getClosedSessions = async () => {
    try {
        return await ChatSession.find({
            status: 'closed'
        }).sort({ endedAt: -1 }).limit(100); // Limit to recent 100 closed chats
    } catch (error) {
        console.error('Error fetching closed sessions:', error);
        throw error;
    }
};