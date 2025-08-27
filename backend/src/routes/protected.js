const express = require('express');
const router = express.Router();
const BeamAuth = require('../middleware/BeamAuth');

/**
 * Protected Routes Example
 * Demonstrates various authentication middleware usage patterns
 */

// All routes in this router require authentication
router.use(BeamAuth.requireAuth);

/**
 * @route GET /api/protected/profile
 * @desc Get user profile (requires authentication)
 * @access Private
 */
router.get('/profile', (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Profile data retrieved successfully',
            user: {
                id: req.user.userId || req.user.id,
                username: req.user.username,
                role: req.user.role,
                email: req.user.email
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * @route GET /api/protected/admin-only
 * @desc Admin-only endpoint
 * @access Admin
 */
router.get('/admin-only', BeamAuth.requireAdmin, (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Admin access granted',
            user: req.user,
            adminData: {
                systemStatus: 'operational',
                userCount: 150,
                lastMaintenance: '2024-01-15T10:30:00Z'
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Admin endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * @route GET /api/protected/moderator
 * @desc Moderator-only endpoint
 * @access Moderator
 */
router.get('/moderator', BeamAuth.requireRole('moderator'), (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Moderator access granted',
            user: req.user,
            moderatorData: {
                pendingReports: 5,
                activeModerations: 12,
                lastAction: '2024-01-15T09:15:00Z'
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Moderator endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * @route GET /api/protected/staff
 * @desc Staff-only endpoint (admin or moderator)
 * @access Staff
 */
router.get('/staff', BeamAuth.requireAnyRole(['admin', 'moderator']), (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Staff access granted',
            user: req.user,
            staffData: {
                role: req.user.role,
                permissions: ['read', 'write', 'moderate'],
                accessLevel: req.user.role === 'admin' ? 'full' : 'limited'
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Staff endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * @route POST /api/protected/update-profile
 * @desc Update user profile
 * @access Private
 */
router.post('/update-profile', (req, res) => {
    try {
        const { displayName, bio, preferences } = req.body;

        // Validate input
        if (!displayName || displayName.length < 2) {
            return res.status(400).json({
                success: false,
                error: 'Display name must be at least 2 characters long'
            });
        }

        // In a real application, you would update the user profile in the database
        const updatedProfile = {
            id: req.user.userId || req.user.id,
            username: req.user.username,
            displayName,
            bio: bio || '',
            preferences: preferences || {},
            updatedAt: new Date().toISOString()
        };

        res.json({
            success: true,
            message: 'Profile updated successfully',
            profile: updatedProfile
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * @route GET /api/protected/settings
 * @desc Get user settings
 * @access Private
 */
router.get('/settings', (req, res) => {
    try {
        // In a real application, you would fetch user settings from the database
        const userSettings = {
            userId: req.user.userId || req.user.id,
            notifications: {
                email: true,
                push: false,
                sms: false
            },
            privacy: {
                profileVisibility: 'public',
                showEmail: false,
                allowMessages: true
            },
            preferences: {
                theme: 'dark',
                language: 'en',
                timezone: 'UTC'
            },
            lastUpdated: new Date().toISOString()
        };

        res.json({
            success: true,
            settings: userSettings
        });

    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * @route POST /api/protected/settings
 * @desc Update user settings
 * @access Private
 */
router.post('/settings', (req, res) => {
    try {
        const { notifications, privacy, preferences } = req.body;

        // Validate settings
        if (notifications && typeof notifications !== 'object') {
            return res.status(400).json({
                success: false,
                error: 'Invalid notifications format'
            });
        }

        // In a real application, you would update user settings in the database
        const updatedSettings = {
            userId: req.user.userId || req.user.id,
            notifications: notifications || {},
            privacy: privacy || {},
            preferences: preferences || {},
            updatedAt: new Date().toISOString()
        };

        res.json({
            success: true,
            message: 'Settings updated successfully',
            settings: updatedSettings
        });

    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * @route GET /api/protected/activity
 * @desc Get user activity log
 * @access Private
 */
router.get('/activity', (req, res) => {
    try {
        // In a real application, you would fetch user activity from the database
        const userActivity = [
            {
                id: 1,
                type: 'login',
                description: 'User logged in',
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                ip: '192.168.1.1'
            },
            {
                id: 2,
                type: 'profile_update',
                description: 'Profile updated',
                timestamp: new Date(Date.now() - 7200000).toISOString(),
                ip: '192.168.1.1'
            },
            {
                id: 3,
                type: 'settings_change',
                description: 'Settings modified',
                timestamp: new Date(Date.now() - 86400000).toISOString(),
                ip: '192.168.1.1'
            }
        ];

        res.json({
            success: true,
            activity: userActivity,
            total: userActivity.length
        });

    } catch (error) {
        console.error('Get activity error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

module.exports = router;
