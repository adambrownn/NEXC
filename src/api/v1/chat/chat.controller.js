const express = require('express');
const chatService = require('./chat.service');
const { extractTokenDetails } = require('../../../common/services/auth.service');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Create upload directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../../../uploads/chat');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Create a new chat session
router.post('/session', async (req, res) => {
    try {
        const customerData = req.body;
        const session = await chatService.createChatSession(customerData);
        res.status(201).json(session);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get chat history
router.get('/history/:sessionId', extractTokenDetails, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const messages = await chatService.getChatHistory(sessionId);
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get active chat sessions (for staff)
router.get('/sessions/active', extractTokenDetails, async (req, res) => {
    try {
        // Check if user is staff
        if (!['admin', 'superadmin', 'support'].includes(req.user.accountType)) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const sessions = await chatService.getActiveSessions();
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Assign agent to session
router.put('/session/:sessionId/assign', extractTokenDetails, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const agentData = {
            id: req.user.userId,
            name: req.user.name
        };

        const session = await chatService.assignAgentToSession(sessionId, agentData);
        res.json(session);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Close a chat session
router.put('/session/:sessionId/close', extractTokenDetails, async (req, res) => {
    try {
        const { sessionId } = req.params;
        await chatService.closeSession(sessionId);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/sessions/closed', extractTokenDetails, async (req, res) => {
    try {
        // Check if user is staff
        if (!['admin', 'superadmin', 'support'].includes(req.user.accountType)) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const sessions = await chatService.getClosedSessions();
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// File upload handler
router.post('/upload', extractTokenDetails, async (req, res) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ error: 'No files were uploaded' });
        }

        // Get the file from the request
        const file = req.files.file;
        const sessionId = req.body.sessionId;

        // Validate sessionId is present
        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID is required' });
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return res.status(400).json({ error: 'File size exceeds the 5MB limit' });
        }

        // Validate file type
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif',
            'application/pdf',
            'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            return res.status(400).json({ error: 'File type not allowed' });
        }

        // Generate safe filename to prevent path traversal
        const timestamp = Date.now();
        const safeName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filepath = path.join(uploadDir, safeName);

        // Save the file
        await file.mv(filepath);

        // Generate URL for client
        const fileUrl = `/uploads/chat/${safeName}`;

        res.json({
            success: true,
            fileName: file.name,
            fileType: file.mimetype,
            fileSize: file.size,
            fileUrl
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: error.message });
    }
});

// Transfer chat to another agent
router.post('/transfer/:sessionId', extractTokenDetails, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { toAgentId } = req.body;

        if (!toAgentId) {
            return res.status(400).json({ error: 'Target agent ID is required' });
        }

        const result = await chatService.transferChat(sessionId, toAgentId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Submit feedback for a chat session
router.post('/session/:sessionId/feedback', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { rating, comments } = req.body;

        if (!rating) {
            return res.status(400).json({ error: 'Rating is required' });
        }

        const result = await chatService.saveFeedback(sessionId, rating, comments);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;