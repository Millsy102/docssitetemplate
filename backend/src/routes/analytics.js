const express = require('express');
const router = express.Router();

// In-memory storage for analytics (in production, use a proper database)
const analyticsData = {
    events: [],
    sessions: []
};

// Middleware to parse JSON
router.use(express.json());

// POST /api/analytics - Track analytics events
router.post('/', (req, res) => {
    try {
        const eventData = req.body;
        
        // Validate required fields
        if (!eventData.event || !eventData.timestamp) {
            return res.status(400).json({ 
                error: 'Missing required fields: event and timestamp' 
            });
        }
        
        // Add server timestamp
        eventData.server_timestamp = new Date().toISOString();
        eventData.ip_address = req.ip || req.connection.remoteAddress;
        eventData.user_agent = req.get('User-Agent');
        
        // Store the event
        analyticsData.events.push(eventData);
        
        // Keep only last 1000 events to prevent memory issues
        if (analyticsData.events.length > 1000) {
            analyticsData.events = analyticsData.events.slice(-1000);
        }
        
        res.status(200).json({ 
            success: true, 
            message: 'Event tracked successfully' 
        });
        
    } catch (error) {
        console.error('Analytics tracking error:', error);
        res.status(500).json({ 
            error: 'Internal server error' 
        });
    }
});

// POST /api/analytics/session - Track session data
router.post('/session', (req, res) => {
    try {
        const sessionData = req.body;
        
        // Validate required fields
        if (!sessionData.session_id) {
            return res.status(400).json({ 
                error: 'Missing required field: session_id' 
            });
        }
        
        // Add server timestamp
        sessionData.server_timestamp = new Date().toISOString();
        sessionData.ip_address = req.ip || req.connection.remoteAddress;
        sessionData.user_agent = req.get('User-Agent');
        
        // Store the session
        analyticsData.sessions.push(sessionData);
        
        // Keep only last 100 sessions to prevent memory issues
        if (analyticsData.sessions.length > 100) {
            analyticsData.sessions = analyticsData.sessions.slice(-100);
        }
        
        res.status(200).json({ 
            success: true, 
            message: 'Session tracked successfully' 
        });
        
    } catch (error) {
        console.error('Session tracking error:', error);
        res.status(500).json({ 
            error: 'Internal server error' 
        });
    }
});

// GET /api/analytics/stats - Get analytics statistics (admin only)
router.get('/stats', (req, res) => {
    try {
        // Basic stats
        const stats = {
            total_events: analyticsData.events.length,
            total_sessions: analyticsData.sessions.length,
            events_by_type: {},
            recent_events: analyticsData.events.slice(-10),
            recent_sessions: analyticsData.sessions.slice(-5)
        };
        
        // Count events by type
        analyticsData.events.forEach(event => {
            const eventType = event.event;
            stats.events_by_type[eventType] = (stats.events_by_type[eventType] || 0) + 1;
        });
        
        res.json(stats);
        
    } catch (error) {
        console.error('Analytics stats error:', error);
        res.status(500).json({ 
            error: 'Internal server error' 
        });
    }
});

// GET /api/analytics/health - Health check endpoint
router.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        events_count: analyticsData.events.length,
        sessions_count: analyticsData.sessions.length
    });
});

module.exports = router;
