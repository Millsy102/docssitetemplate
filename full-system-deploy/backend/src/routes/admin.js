const express = require('express');
const router = express.Router();
const BeamAuth = require('../middleware/BeamAuth');
const AdminSecurity = require('../middleware/AdminSecurity');
const BeamPerformanceMonitor = require('../utils/BeamPerformanceMonitor');

// Admin dashboard data
router.get('/dashboard', AdminSecurity.protectAdminRoutes, BeamAuth.requireAuth, async (req, res) => {
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
router.get('/health', AdminSecurity.protectAdminRoutes, BeamAuth.requireAuth, async (req, res) => {
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
router.get('/logs', AdminSecurity.protectAdminRoutes, BeamAuth.requireAuth, async (req, res) => {
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
router.get('/config', AdminSecurity.protectAdminRoutes, BeamAuth.requireAuth, async (req, res) => {
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

// Security management routes
router.get('/security/rate-limits/:ip', AdminSecurity.protectAdminRoutes, BeamAuth.requireAuth, async (req, res) => {
    try {
        const { ip } = req.params;
        const rateLimitInfo = await AdminSecurity.getRateLimitInfo(ip);
        res.json(rateLimitInfo);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch rate limit info' });
    }
});

router.post('/security/reset-rate-limits/:ip', AdminSecurity.protectAdminRoutes, BeamAuth.requireAuth, async (req, res) => {
    try {
        const { ip } = req.params;
        const result = await AdminSecurity.resetRateLimits(ip);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to reset rate limits' });
    }
});

router.get('/security/whitelist', AdminSecurity.protectAdminRoutes, BeamAuth.requireAuth, async (req, res) => {
    try {
        const whitelist = AdminSecurity.getWhitelistedIPs();
        res.json({
            whitelistedIPs: whitelist,
            count: whitelist.length
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch whitelist' });
    }
});

router.post('/security/whitelist/add', AdminSecurity.protectAdminRoutes, BeamAuth.requireAuth, async (req, res) => {
    try {
        const { ip } = req.body;
        if (!ip) {
            return res.status(400).json({ error: 'IP address is required' });
        }
        
        AdminSecurity.addToWhitelist(ip);
        res.json({ 
            message: `IP ${ip} added to whitelist`,
            whitelist: AdminSecurity.getWhitelistedIPs()
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add IP to whitelist' });
    }
});

router.delete('/security/whitelist/remove/:ip', AdminSecurity.protectAdminRoutes, BeamAuth.requireAuth, async (req, res) => {
    try {
        const { ip } = req.params;
        AdminSecurity.removeFromWhitelist(ip);
        res.json({ 
            message: `IP ${ip} removed from whitelist`,
            whitelist: AdminSecurity.getWhitelistedIPs()
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove IP from whitelist' });
    }
});

module.exports = router;
