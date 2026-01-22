const modelRegistry = require('../../../database/mongo/modelRegistry');

// Helper functions to get models via registry
const getChatSessionModel = () => modelRegistry.getModel('chat_sessions');
const getChatMessageModel = () => modelRegistry.getModel('chat_messages');

// Get aggregated chat metrics for dashboard
exports.getChatMetrics = async (period = 'today') => {
    try {
        let dateFilter = {};
        const now = new Date();

        // Set date filter based on period
        if (period === 'today') {
            const startOfDay = new Date(now.setHours(0, 0, 0, 0));
            dateFilter = { lastActivity: { $gte: startOfDay } };
        } else if (period === 'week') {
            const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
            startOfWeek.setHours(0, 0, 0, 0);
            dateFilter = { lastActivity: { $gte: startOfWeek } };
        } else if (period === 'month') {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            dateFilter = { lastActivity: { $gte: startOfMonth } };
        }

        const ChatSession = getChatSessionModel();
        
        // Get session metrics
        const [
            totalSessions,
            pendingSessions,
            activeSessions,
            closedSessions,
            averageSessionTime,
            averageResponseTime
        ] = await Promise.all([
            ChatSession.countDocuments(dateFilter),
            ChatSession.countDocuments({ ...dateFilter, status: 'pending' }),
            ChatSession.countDocuments({ ...dateFilter, status: 'active' }),
            ChatSession.countDocuments({ ...dateFilter, status: 'closed', endedAt: { $exists: true } }),
            calculateAverageSessionTime(dateFilter),
            calculateAverageResponseTime(dateFilter)
        ]);

        return {
            totalSessions,
            pendingSessions,
            activeSessions,
            closedSessions,
            averageSessionTime, // in seconds
            averageResponseTime, // in seconds
            period
        };
    } catch (error) {
        console.error('Error getting chat metrics:', error);
        throw error;
    }
};

// Calculate average session time (from start to end)
async function calculateAverageSessionTime(dateFilter) {
    try {
        const ChatSession = getChatSessionModel();
        const sessions = await ChatSession.find({
            ...dateFilter,
            status: 'closed',
            endedAt: { $exists: true }
        });

        if (sessions.length === 0) return 0;

        const totalSeconds = sessions.reduce((sum, session) => {
            const duration = (new Date(session.endedAt) - new Date(session.createdAt)) / 1000;
            return sum + duration;
        }, 0);

        return Math.round(totalSeconds / sessions.length);
    } catch (error) {
        console.error('Error calculating average session time:', error);
        return 0;
    }
}

// Calculate average first response time
async function calculateAverageResponseTime(dateFilter) {
    try {
        const ChatSession = getChatSessionModel();
        const ChatMessage = getChatMessageModel();
        
        const sessions = await ChatSession.find({
            ...dateFilter,
            assignedAgent: { $exists: true }
        });

        if (sessions.length === 0) return 0;

        let totalResponseTime = 0;
        let count = 0;

        for (const session of sessions) {
            // Get first customer message
            const firstCustomerMessage = await ChatMessage.findOne({
                sessionId: session.sessionId,
                sender: 'customer'
            }).sort({ timestamp: 1 });

            // Get first agent message
            const firstAgentMessage = await ChatMessage.findOne({
                sessionId: session.sessionId,
                sender: 'agent'
            }).sort({ timestamp: 1 });

            if (firstCustomerMessage && firstAgentMessage) {
                const responseTime = (
                    new Date(firstAgentMessage.timestamp) -
                    new Date(firstCustomerMessage.timestamp)
                ) / 1000;

                // Only count if response time is positive
                if (responseTime > 0) {
                    totalResponseTime += responseTime;
                    count++;
                }
            }
        }

        return count > 0 ? Math.round(totalResponseTime / count) : 0;
    } catch (error) {
        console.error('Error calculating average response time:', error);
        return 0;
    }
}

// Get real-time chat statistics for dashboard
exports.getRealTimeStats = async () => {
    try {
        const ChatSession = getChatSessionModel();
        const ChatMessage = getChatMessageModel();
        
        const now = new Date();
        const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        
        const [
            activeChats,
            pendingChats,
            totalAgentsOnline,
            totalMessagesToday,
            averageWaitTime,
            customerSatisfactionRate
        ] = await Promise.all([
            ChatSession.countDocuments({ status: 'active' }),
            ChatSession.countDocuments({ status: 'pending' }),
            getOnlineAgentsCount(),
            ChatMessage.countDocuments({ timestamp: { $gte: last24Hours } }),
            calculateAverageWaitTime(),
            calculateCustomerSatisfactionRate()
        ]);

        return {
            activeChats,
            pendingChats,
            totalAgentsOnline,
            totalMessagesToday,
            averageWaitTime,
            customerSatisfactionRate,
            timestamp: now
        };
    } catch (error) {
        console.error('Error getting real-time stats:', error);
        throw error;
    }
};

// Get detailed session analytics
exports.getSessionAnalytics = async (sessionId) => {
    try {
        const ChatSession = getChatSessionModel();
        const ChatMessage = getChatMessageModel();
        
        const session = await ChatSession.findOne({ sessionId });
        if (!session) {
            throw new Error('Session not found');
        }

        const messages = await ChatMessage.find({ sessionId }).sort({ timestamp: 1 });
        
        const analytics = {
            sessionInfo: {
                sessionId: session.sessionId,
                status: session.status,
                customerInfo: session.customerInfo,
                assignedAgent: session.assignedAgent,
                priority: session.priority,
                createdAt: session.createdAt,
                endedAt: session.endedAt,
                duration: session.endedAt ? 
                    Math.round((new Date(session.endedAt) - new Date(session.createdAt)) / 1000) : null
            },
            messageStats: {
                totalMessages: messages.length,
                customerMessages: messages.filter(m => m.sender === 'customer').length,
                agentMessages: messages.filter(m => m.sender === 'agent').length,
                filesShared: messages.filter(m => m.files && m.files.length > 0).length,
                averageResponseTime: await calculateSessionResponseTime(sessionId)
            },
            timeline: messages.map(msg => ({
                timestamp: msg.timestamp,
                sender: msg.sender,
                content: msg.content,
                messageType: msg.messageType,
                hasFiles: msg.files && msg.files.length > 0
            })),
            transferHistory: session.transferHistory || [],
            feedback: session.feedback
        };

        return analytics;
    } catch (error) {
        console.error('Error getting session analytics:', error);
        throw error;
    }
};

// Get agent performance metrics
exports.getAgentPerformance = async (agentId, period = 'week') => {
    try {
        const ChatSession = getChatSessionModel();
        const ChatMessage = getChatMessageModel();
        
        let dateFilter = {};
        const now = new Date();

        if (period === 'today') {
            const startOfDay = new Date(now.setHours(0, 0, 0, 0));
            dateFilter = { lastActivity: { $gte: startOfDay } };
        } else if (period === 'week') {
            const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
            startOfWeek.setHours(0, 0, 0, 0);
            dateFilter = { lastActivity: { $gte: startOfWeek } };
        } else if (period === 'month') {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            dateFilter = { lastActivity: { $gte: startOfMonth } };
        }

        const agentSessions = await ChatSession.find({
            ...dateFilter,
            'assignedAgent.id': agentId
        });

        const sessionIds = agentSessions.map(s => s.sessionId);
        const agentMessages = await ChatMessage.find({
            sessionId: { $in: sessionIds },
            sender: 'agent'
        });

        const performance = {
            agentId,
            period,
            totalSessions: agentSessions.length,
            activeSessions: agentSessions.filter(s => s.status === 'active').length,
            closedSessions: agentSessions.filter(s => s.status === 'closed').length,
            totalMessages: agentMessages.length,
            averageSessionDuration: calculateAverageSessionDuration(agentSessions),
            averageResponseTime: await calculateAgentResponseTime(agentId, sessionIds),
            customerSatisfactionScore: calculateAgentSatisfactionScore(agentSessions),
            transfersReceived: agentSessions.filter(s => 
                s.transferHistory && s.transferHistory.some(t => t.toAgent?.id === agentId)
            ).length,
            transfersGiven: agentSessions.filter(s => 
                s.transferHistory && s.transferHistory.some(t => t.fromAgent?.id === agentId)
            ).length
        };

        return performance;
    } catch (error) {
        console.error('Error getting agent performance:', error);
        throw error;
    }
};

// Get chat volume trends
exports.getChatTrends = async (days = 7) => {
    try {
        const ChatSession = getChatSessionModel();
        const ChatMessage = getChatMessageModel();
        
        const trends = [];
        const now = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            
            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);

            const [sessionCount, messageCount] = await Promise.all([
                ChatSession.countDocuments({
                    createdAt: { $gte: date, $lt: nextDate }
                }),
                ChatMessage.countDocuments({
                    timestamp: { $gte: date, $lt: nextDate }
                })
            ]);

            trends.push({
                date: date.toISOString().split('T')[0],
                sessions: sessionCount,
                messages: messageCount
            });
        }

        return trends;
    } catch (error) {
        console.error('Error getting chat trends:', error);
        throw error;
    }
};

// Helper functions for advanced analytics
async function getOnlineAgentsCount() {
    // This would integrate with your user session tracking
    // For now, return a placeholder value
    return 5; // Implement based on your online user tracking system
}

async function calculateAverageWaitTime() {
    try {
        const ChatSession = getChatSessionModel();
        const pendingSessions = await ChatSession.find({ 
            status: 'pending',
            createdAt: { $exists: true }
        });

        if (pendingSessions.length === 0) return 0;

        const now = new Date();
        const totalWaitTime = pendingSessions.reduce((sum, session) => {
            return sum + (now - new Date(session.createdAt)) / 1000;
        }, 0);

        return Math.round(totalWaitTime / pendingSessions.length);
    } catch (error) {
        console.error('Error calculating average wait time:', error);
        return 0;
    }
}

async function calculateCustomerSatisfactionRate() {
    try {
        const ChatSession = getChatSessionModel();
        const sessionsWithFeedback = await ChatSession.find({
            'feedback.rating': { $exists: true }
        });

        if (sessionsWithFeedback.length === 0) return 0;

        const totalRating = sessionsWithFeedback.reduce((sum, session) => {
            return sum + (session.feedback.rating || 0);
        }, 0);

        return Math.round((totalRating / sessionsWithFeedback.length) * 20); // Convert to percentage
    } catch (error) {
        console.error('Error calculating customer satisfaction rate:', error);
        return 0;
    }
}

async function calculateSessionResponseTime(sessionId) {
    try {
        const ChatMessage = getChatMessageModel();
        const messages = await ChatMessage.find({ sessionId }).sort({ timestamp: 1 });
        
        let totalResponseTime = 0;
        let responseCount = 0;
        
        for (let i = 0; i < messages.length - 1; i++) {
            const currentMsg = messages[i];
            const nextMsg = messages[i + 1];
            
            if (currentMsg.sender === 'customer' && nextMsg.sender === 'agent') {
                const responseTime = (new Date(nextMsg.timestamp) - new Date(currentMsg.timestamp)) / 1000;
                if (responseTime > 0) {
                    totalResponseTime += responseTime;
                    responseCount++;
                }
            }
        }
        
        return responseCount > 0 ? Math.round(totalResponseTime / responseCount) : 0;
    } catch (error) {
        console.error('Error calculating session response time:', error);
        return 0;
    }
}

function calculateAverageSessionDuration(sessions) {
    const closedSessions = sessions.filter(s => s.endedAt);
    if (closedSessions.length === 0) return 0;
    
    const totalDuration = closedSessions.reduce((sum, session) => {
        return sum + (new Date(session.endedAt) - new Date(session.createdAt)) / 1000;
    }, 0);
    
    return Math.round(totalDuration / closedSessions.length);
}

async function calculateAgentResponseTime(agentId, sessionIds) {
    try {
        const ChatMessage = getChatMessageModel();
        let totalResponseTime = 0;
        let responseCount = 0;
        
        for (const sessionId of sessionIds) {
            const messages = await ChatMessage.find({ sessionId }).sort({ timestamp: 1 });
            
            for (let i = 0; i < messages.length - 1; i++) {
                const currentMsg = messages[i];
                const nextMsg = messages[i + 1];
                
                if (currentMsg.sender === 'customer' && 
                    nextMsg.sender === 'agent' && 
                    nextMsg.senderInfo?.id === agentId) {
                    const responseTime = (new Date(nextMsg.timestamp) - new Date(currentMsg.timestamp)) / 1000;
                    if (responseTime > 0) {
                        totalResponseTime += responseTime;
                        responseCount++;
                    }
                }
            }
        }
        
        return responseCount > 0 ? Math.round(totalResponseTime / responseCount) : 0;
    } catch (error) {
        console.error('Error calculating agent response time:', error);
        return 0;
    }
}

function calculateAgentSatisfactionScore(sessions) {
    const sessionsWithFeedback = sessions.filter(s => s.feedback && s.feedback.rating);
    if (sessionsWithFeedback.length === 0) return 0;
    
    const totalRating = sessionsWithFeedback.reduce((sum, session) => {
        return sum + (session.feedback.rating || 0);
    }, 0);
    
    return Math.round((totalRating / sessionsWithFeedback.length) * 20); // Convert to percentage
}