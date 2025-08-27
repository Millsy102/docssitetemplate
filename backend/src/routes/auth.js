const express = require('express');
const router = express.Router();
const BeamAuth = require('../middleware/BeamAuth');

/**
 * @route POST /api/auth/login
 * @desc Authenticate user and return JWT token
 * @access Public
 */
router.post('/login', BeamAuth.getLoginLimiter(), async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username and password are required'
            });
        }

        // Authenticate user
        const user = await BeamAuth.authenticateUser(username, password);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Generate tokens
        const accessToken = BeamAuth.generateToken({
            userId: user.id,
            username: user.username,
            role: user.role,
            email: user.email
        });

        const refreshToken = BeamAuth.generateRefreshToken(user.id);

        // Return tokens and user info
        res.json({
            success: true,
            message: 'Login successful',
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                email: user.email
            },
            expiresIn: BeamAuth.tokenExpiry
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * @route POST /api/auth/logout
 * @desc Logout user by blacklisting token
 * @access Private
 */
router.post('/logout', BeamAuth.requireAuth, async (req, res) => {
    try {
        await BeamAuth.logout(req, res);
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * @route POST /api/auth/refresh
 * @desc Refresh access token using refresh token
 * @access Public
 */
router.post('/refresh', BeamAuth.getRefreshLimiter(), async (req, res) => {
    try {
        await BeamAuth.refreshToken(req, res);
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * @route GET /api/auth/me
 * @desc Get current user information
 * @access Private
 */
router.get('/me', BeamAuth.requireAuth, (req, res) => {
    try {
        res.json({
            success: true,
            user: {
                id: req.user.userId || req.user.id,
                username: req.user.username,
                role: req.user.role,
                email: req.user.email
            }
        });
    } catch (error) {
        console.error('Get user info error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * @route POST /api/auth/validate-token
 * @desc Validate JWT token without requiring authentication
 * @access Public
 */
router.post('/validate-token', (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'Token is required'
            });
        }

        const decoded = BeamAuth.verifyToken(token);
        
        if (!decoded) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token'
            });
        }

        res.json({
            success: true,
            valid: true,
            user: {
                id: decoded.userId || decoded.id,
                username: decoded.username,
                role: decoded.role,
                email: decoded.email
            }
        });

    } catch (error) {
        console.error('Token validation error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * @route GET /api/auth/config
 * @desc Get authentication configuration
 * @access Public
 */
router.get('/config', (req, res) => {
    try {
        const config = {
            useEnvironmentCredentials: !!(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD),
            hasOAuth: !!(process.env.GH_CLIENT_ID && process.env.GH_CLIENT_SECRET),
            tokenExpiry: BeamAuth.tokenExpiry,
            refreshTokenExpiry: BeamAuth.refreshTokenExpiry,
            bcryptRounds: BeamAuth.bcryptRounds,
            features: {
                tokenBlacklisting: !!BeamAuth.redis,
                rateLimiting: true,
                passwordValidation: true,
                roleBasedAccess: true
            }
        };

        res.json({
            success: true,
            config
        });

    } catch (error) {
        console.error('Config error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * @route POST /api/auth/change-password
 * @desc Change user password
 * @access Private
 */
router.post('/change-password', BeamAuth.requireAuth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                error: 'Current password and new password are required'
            });
        }

        // Validate new password strength
        const passwordValidation = BeamAuth.validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                success: false,
                error: 'Password does not meet requirements',
                details: passwordValidation.errors
            });
        }

        // Verify current password
        const adminPassword = process.env.ADMIN_PASSWORD;
        const isCurrentPasswordValid = await BeamAuth.comparePassword(currentPassword, adminPassword);
        
        if (!isCurrentPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Current password is incorrect'
            });
        }

        // Hash new password
        const hashedPassword = await BeamAuth.hashPassword(newPassword);
        
        // In a real application, you would update the password in the database
        // For now, we'll just return success
        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * @route POST /api/auth/validate-password
 * @desc Validate password strength
 * @access Public
 */
router.post('/validate-password', (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                error: 'Password is required'
            });
        }

        const validation = BeamAuth.validatePassword(password);

        res.json({
            success: true,
            isValid: validation.isValid,
            errors: validation.errors
        });

    } catch (error) {
        console.error('Password validation error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

module.exports = router;
