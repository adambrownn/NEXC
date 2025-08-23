const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        index: true
    },
    sender: {
        id: String,
        name: String,
        role: String // 'customer' or 'agent'
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    read: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);