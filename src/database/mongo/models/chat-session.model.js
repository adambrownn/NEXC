const mongoose = require('mongoose');

const ChatSessionSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true
    },
    customer: {
        id: String,
        name: String,
        email: String,
        isAnonymous: Boolean
    },
    agent: {
        id: String,
        name: String
    },
    status: {
        type: String,
        enum: ['active', 'pending', 'closed'],
        default: 'pending'
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    endedAt: Date,
    lastActivity: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ChatSession', ChatSessionSchema);