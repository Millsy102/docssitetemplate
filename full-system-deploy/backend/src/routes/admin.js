const express = require('express');
const router = express.Router();
const BeamAuth = require('../middleware/BeamAuth');
const BeamPerformanceMonitor = require('../utils/BeamPerformanceMonitor');

// Admin dashboard data
router.get('/dashboard', BeamAuth.requireAuth, async (req, res) => {
    try {
        const metrics = BeamPerformanceMonitor.getMetrics();
        const systemInfo = {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            cpu: process.cpuUsage(),
            environment: process.env.NODE_ENV || 'development',
            version: '3.0.0'
        };

        res.json({
            metrics,
            systemInfo,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

// System health check
router.get('/health', BeamAuth.requireAuth, async (req, res) => {
    try {
        const health = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            environment: process.env.NODE_ENV || 'development'
        };

        res.json(health);
    } catch (error) {
        res.status(500).json({ error: 'Failed to check system health' });
    }
});

// System logs
router.get('/logs', BeamAuth.requireAuth, async (req, res) => {
    try {
        // This would typically fetch logs from a logging service
        // For now, return a placeholder
        res.json({
            logs: [],
            message: 'Log retrieval not implemented in Vercel environment'
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});

// System configuration
router.get('/config', BeamAuth.requireAuth, async (req, res) => {
    try {
        const config = {
            environment: process.env.NODE_ENV || 'development',
            version: '3.0.0',
            features: {
                database: !!(process.env.DATABASE_URL || process.env.MONGODB_URI),
                oauth: !!(process.env.GH_CLIENT_ID && process.env.GH_CLIENT_SECRET),
                ftp: process.env.FTP_ENABLED === 'true',
                ssh: process.env.SSH_ENABLED === 'true'
            }
        };

        res.json(config);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch configuration' });
    }
});

module.exports = router;
