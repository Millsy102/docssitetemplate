const express = require('express');
const router = express.Router();
const BeamAuth = require('../../middleware/BeamAuth');

// V1 Admin API - Legacy format

// Get system status
router.get('/status', BeamAuth.requireAuth, async (req, res) => {
    try {
        const status = {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            environment: process.env.NODE_ENV || 'development',
            version: '3.0.0'
        };
        
        res.json({
            success: true,
            message: 'System status retrieved',
            data: status,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get system status',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Get system logs
router.get('/logs', BeamAuth.requireAuth, async (req, res) => {
    try {
        const logs = []; // This would be populated from actual log system
        res.json({
            success: true,
            message: 'System logs retrieved',
            data: logs,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get system logs',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;
