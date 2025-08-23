const ChatSession = require('../../../database/mongo/models/chat-session.model');
const ChatMessage = require('../../../database/mongo/models/chat-message.model');

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
        const sessions = await ChatSession.find({
            ...dateFilter,
            status: 'closed',
            endedAt: { $exists: true }
        });

        if (sessions.length === 0) return 0;

        const totalSeconds = sessions.reduce((sum, session) => {
            const duration = (new Date(session.endedAt) - new Date(session.startedAt)) / 1000;
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
        const sessions = await ChatSession.find({
            ...dateFilter,
            agent: { $exists: true }
        });

        if (sessions.length === 0) return 0;

        let totalResponseTime = 0;
        let count = 0;

        for (const session of sessions) {
            // Get first customer message
            const firstCustomerMessage = await ChatMessage.findOne({
                sessionId: session.sessionId,
                'sender.role': 'customer'
            }).sort({ timestamp: 1 });

            // Get first agent message
            const firstAgentMessage = await ChatMessage.findOne({
                sessionId: session.sessionId,
                'sender.role': 'agent'
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