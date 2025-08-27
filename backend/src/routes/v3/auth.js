const express = require('express');
const router = express.Router();
const BeamAuth = require('../../middleware/BeamAuth');
const { v4: uuidv4 } = require('uuid');

// V3 Auth API - Current format with request IDs and enhanced features

// Login endpoint
router.post('/login', async (req, res) => {
    const requestId = uuidv4();
    req.id = requestId;
    
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
                    version: 'v3',
                    timestamp: new Date().toISOString(),
                    requestId,
                    action: 'login',
                    sessionId: result.sessionId,
                    security: {
                        mfaEnabled: result.user.mfaEnabled || false,
                        lastLogin: result.user.lastLogin,
                        loginAttempts: 0
                    }
                }
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Login failed',
                error: {
                    code: 'LOGIN_FAILED',
                    message: result.message,
                    details: {
                        failedAttempts: result.failedAttempts || 0,
                        lockoutRemaining: result.lockoutRemaining || 0
                    },
                    requestId
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
                details: null,
                requestId
            },
            timestamp: new Date().toISOString()
        });
    }
});

// Logout endpoint
router.post('/logout', BeamAuth.requireAuth, async (req, res) => {
    const requestId = uuidv4();
    req.id = requestId;
    
    try {
        await BeamAuth.logout(req.user);
        res.json({
            success: true,
            message: 'Logout successful',
            data: { loggedOut: true },
            meta: {
                version: 'v3',
                timestamp: new Date().toISOString(),
                requestId,
                action: 'logout',
                userId: req.user.id,
                sessionDuration: req.user.sessionDuration
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Logout error',
            error: {
                code: 'LOGOUT_ERROR',
                message: error.message,
                details: null,
                requestId
            },
            timestamp: new Date().toISOString()
        });
    }
});

// Verify token endpoint
router.get('/verify', BeamAuth.requireAuth, async (req, res) => {
    const requestId = uuidv4();
    req.id = requestId;
    
    try {
        res.json({
            success: true,
            message: 'Token is valid',
            data: req.user,
            meta: {
                version: 'v3',
                timestamp: new Date().toISOString(),
                requestId,
                action: 'verify',
                userId: req.user.id,
                tokenExpiry: req.user.tokenExpiry,
                permissions: req.user.permissions || []
            }
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Token verification failed',
            error: {
                code: 'TOKEN_INVALID',
                message: error.message,
                details: null,
                requestId
            },
            timestamp: new Date().toISOString()
        });
    }
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
    const requestId = uuidv4();
    req.id = requestId;
    
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
                    version: 'v3',
                    timestamp: new Date().toISOString(),
                    requestId,
                    action: 'refresh',
                    userId: result.user.id,
                    tokenLifetime: result.tokenLifetime
                }
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Token refresh failed',
                error: {
                    code: 'REFRESH_FAILED',
                    message: result.message,
                    details: null,
                    requestId
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
                details: null,
                requestId
            },
            timestamp: new Date().toISOString()
        });
    }
});

// New V3 features

// Multi-factor authentication setup
router.post('/mfa/setup', BeamAuth.requireAuth, async (req, res) => {
    const requestId = uuidv4();
    req.id = requestId;
    
    try {
        const result = await BeamAuth.setupMFA(req.user.id);
        res.json({
            success: true,
            message: 'MFA setup initiated',
            data: {
                qrCode: result.qrCode,
                secret: result.secret,
                backupCodes: result.backupCodes
            },
            meta: {
                version: 'v3',
                timestamp: new Date().toISOString(),
                requestId,
                action: 'mfa_setup',
                userId: req.user.id
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'MFA setup failed',
            error: {
                code: 'MFA_SETUP_ERROR',
                message: error.message,
                details: null,
                requestId
            },
            timestamp: new Date().toISOString()
        });
    }
});

// Verify MFA token
router.post('/mfa/verify', BeamAuth.requireAuth, async (req, res) => {
    const requestId = uuidv4();
    req.id = requestId;
    
    try {
        const { token } = req.body;
        const result = await BeamAuth.verifyMFAToken(req.user.id, token);
        
        if (result.success) {
            res.json({
                success: true,
                message: 'MFA verification successful',
                data: { verified: true },
                meta: {
                    version: 'v3',
                    timestamp: new Date().toISOString(),
                    requestId,
                    action: 'mfa_verify',
                    userId: req.user.id
                }
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'MFA verification failed',
                error: {
                    code: 'MFA_VERIFY_FAILED',
                    message: result.message,
                    details: null,
                    requestId
                },
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'MFA verification error',
            error: {
                code: 'MFA_VERIFY_ERROR',
                message: error.message,
                details: null,
                requestId
            },
            timestamp: new Date().toISOString()
        });
    }
});

// Get user sessions
router.get('/sessions', BeamAuth.requireAuth, async (req, res) => {
    const requestId = uuidv4();
    req.id = requestId;
    
    try {
        const sessions = await BeamAuth.getUserSessions(req.user.id);
        res.json({
            success: true,
            message: 'User sessions retrieved',
            data: sessions,
            meta: {
                version: 'v3',
                timestamp: new Date().toISOString(),
                requestId,
                action: 'get_sessions',
                userId: req.user.id,
                activeSessions: sessions.filter(s => s.active).length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve sessions',
            error: {
                code: 'GET_SESSIONS_ERROR',
                message: error.message,
                details: null,
                requestId
            },
            timestamp: new Date().toISOString()
        });
    }
});

// Revoke session
router.delete('/sessions/:sessionId', BeamAuth.requireAuth, async (req, res) => {
    const requestId = uuidv4();
    req.id = requestId;
    
    try {
        const result = await BeamAuth.revokeSession(req.user.id, req.params.sessionId);
        res.json({
            success: true,
            message: 'Session revoked successfully',
            data: { revoked: true },
            meta: {
                version: 'v3',
                timestamp: new Date().toISOString(),
                requestId,
                action: 'revoke_session',
                userId: req.user.id,
                sessionId: req.params.sessionId
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to revoke session',
            error: {
                code: 'REVOKE_SESSION_ERROR',
                message: error.message,
                details: null,
                requestId
            },
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;
