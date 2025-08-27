const express = require('express');
const router = express.Router();
const BeamAuth = require('../../middleware/BeamAuth');

// V1 Auth API - Legacy format

// Login endpoint
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await BeamAuth.authenticate(username, password);
        
        if (result.success) {
            res.json({
                success: true,
                message: 'Login successful',
                data: result.user,
                token: result.token,
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Login failed',
                error: result.message,
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Authentication error',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Logout endpoint
router.post('/logout', BeamAuth.requireAuth, async (req, res) => {
    try {
        await BeamAuth.logout(req.user);
        res.json({
            success: true,
            message: 'Logout successful',
            data: { loggedOut: true },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Logout error',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Verify token endpoint
router.get('/verify', BeamAuth.requireAuth, async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Token is valid',
            data: req.user,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Token verification failed',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;
