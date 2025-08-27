const express = require('express');
const router = express.Router();
const BeamAuth = require('../../middleware/BeamAuth');

// V2 Auth API - Enhanced format with metadata

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
                meta: {
                    version: 'v2',
                    timestamp: new Date().toISOString(),
                    action: 'login',
                    sessionId: result.sessionId
                }
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Login failed',
                error: {
                    code: 'LOGIN_FAILED',
                    message: result.message,
                    details: null
                },
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Authentication error',
            error: {
                code: 'AUTH_ERROR',
                message: error.message,
                details: null
            },
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
            meta: {
                version: 'v2',
                timestamp: new Date().toISOString(),
                action: 'logout',
                userId: req.user.id
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Logout error',
            error: {
                code: 'LOGOUT_ERROR',
                message: error.message,
                details: null
            },
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
            meta: {
                version: 'v2',
                timestamp: new Date().toISOString(),
                action: 'verify',
                userId: req.user.id,
                tokenExpiry: req.user.tokenExpiry
            }
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Token verification failed',
            error: {
                code: 'TOKEN_INVALID',
                message: error.message,
                details: null
            },
            timestamp: new Date().toISOString()
        });
    }
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const result = await BeamAuth.refreshToken(refreshToken);
        
        if (result.success) {
            res.json({
                success: true,
                message: 'Token refreshed successfully',
                data: { user: result.user },
                token: result.token,
                meta: {
                    version: 'v2',
                    timestamp: new Date().toISOString(),
                    action: 'refresh',
                    userId: result.user.id
                }
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Token refresh failed',
                error: {
                    code: 'REFRESH_FAILED',
                    message: result.message,
                    details: null
                },
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Token refresh error',
            error: {
                code: 'REFRESH_ERROR',
                message: error.message,
                details: null
            },
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;
