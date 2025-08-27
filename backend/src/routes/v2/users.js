const express = require('express');
const router = express.Router();
const BeamUserService = require('../../services/BeamUserService');
const BeamAuth = require('../../middleware/BeamAuth');

// V2 Users API - Enhanced format with metadata

// Get all users (admin only)
router.get('/', BeamAuth.requireAuth, async (req, res) => {
    try {
        const users = await BeamUserService.getAllUsers();
        const totalCount = users.length;
        
        res.json({
            success: true,
            message: 'Users retrieved successfully',
            data: users,
            meta: {
                version: 'v2',
                timestamp: new Date().toISOString(),
                totalCount,
                pagination: {
                    page: 1,
                    limit: totalCount,
                    total: totalCount
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: {
                code: 'FETCH_USERS_ERROR',
                message: error.message,
                details: null
            },
            timestamp: new Date().toISOString()
        });
    }
});

// Get user by ID
router.get('/:id', BeamAuth.requireAuth, async (req, res) => {
    try {
        const user = await BeamUserService.getUserById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found',
                    details: { userId: req.params.id }
                },
                timestamp: new Date().toISOString()
            });
        }
        res.json({
            success: true,
            message: 'User retrieved successfully',
            data: user,
            meta: {
                version: 'v2',
                timestamp: new Date().toISOString(),
                userId: req.params.id
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user',
            error: {
                code: 'FETCH_USER_ERROR',
                message: error.message,
                details: { userId: req.params.id }
            },
            timestamp: new Date().toISOString()
        });
    }
});

// Create new user
router.post('/', async (req, res) => {
    try {
        const user = await BeamUserService.createUser(req.body);
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: user,
            meta: {
                version: 'v2',
                timestamp: new Date().toISOString(),
                userId: user.id || user._id,
                action: 'created'
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Failed to create user',
            error: {
                code: 'CREATE_USER_ERROR',
                message: error.message,
                details: null
            },
            timestamp: new Date().toISOString()
        });
    }
});

// Update user
router.put('/:id', BeamAuth.requireAuth, async (req, res) => {
    try {
        const user = await BeamUserService.updateUser(req.params.id, req.body);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found',
                    details: { userId: req.params.id }
                },
                timestamp: new Date().toISOString()
            });
        }
        res.json({
            success: true,
            message: 'User updated successfully',
            data: user,
            meta: {
                version: 'v2',
                timestamp: new Date().toISOString(),
                userId: req.params.id,
                action: 'updated'
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Failed to update user',
            error: {
                code: 'UPDATE_USER_ERROR',
                message: error.message,
                details: { userId: req.params.id }
            },
            timestamp: new Date().toISOString()
        });
    }
});

// Delete user
router.delete('/:id', BeamAuth.requireAuth, async (req, res) => {
    try {
        const success = await BeamUserService.deleteUser(req.params.id);
        if (!success) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found',
                    details: { userId: req.params.id }
                },
                timestamp: new Date().toISOString()
            });
        }
        res.json({
            success: true,
            message: 'User deleted successfully',
            data: { deleted: true, userId: req.params.id },
            meta: {
                version: 'v2',
                timestamp: new Date().toISOString(),
                userId: req.params.id,
                action: 'deleted'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete user',
            error: {
                code: 'DELETE_USER_ERROR',
                message: error.message,
                details: { userId: req.params.id }
            },
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;
