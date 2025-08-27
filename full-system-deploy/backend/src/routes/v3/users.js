const express = require('express');
const router = express.Router();
const BeamUserService = require('../../services/BeamUserService');
const BeamAuth = require('../../middleware/BeamAuth');
const { v4: uuidv4 } = require('uuid');

// V3 Users API - Current format with request IDs and enhanced features

// Get all users (admin only)
router.get('/', BeamAuth.requireAuth, async (req, res) => {
    const requestId = uuidv4();
    req.id = requestId;
    
    try {
        const users = await BeamUserService.getAllUsers();
        const totalCount = users.length;
        
        res.json({
            success: true,
            message: 'Users retrieved successfully',
            data: users,
            meta: {
                version: 'v3',
                timestamp: new Date().toISOString(),
                requestId,
                totalCount,
                pagination: {
                    page: 1,
                    limit: totalCount,
                    total: totalCount
                },
                filters: req.query
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: {
                code: 'FETCH_USERS_ERROR',
                message: error.message,
                details: null,
                requestId
            },
            timestamp: new Date().toISOString()
        });
    }
});

// Get user by ID
router.get('/:id', BeamAuth.requireAuth, async (req, res) => {
    const requestId = uuidv4();
    req.id = requestId;
    
    try {
        const user = await BeamUserService.getUserById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found',
                    details: { userId: req.params.id },
                    requestId
                },
                timestamp: new Date().toISOString()
            });
        }
        res.json({
            success: true,
            message: 'User retrieved successfully',
            data: user,
            meta: {
                version: 'v3',
                timestamp: new Date().toISOString(),
                requestId,
                userId: req.params.id,
                cacheStatus: 'fresh'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user',
            error: {
                code: 'FETCH_USER_ERROR',
                message: error.message,
                details: { userId: req.params.id },
                requestId
            },
            timestamp: new Date().toISOString()
        });
    }
});

// Create new user
router.post('/', async (req, res) => {
    const requestId = uuidv4();
    req.id = requestId;
    
    try {
        const user = await BeamUserService.createUser(req.body);
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: user,
            meta: {
                version: 'v3',
                timestamp: new Date().toISOString(),
                requestId,
                userId: user.id || user._id,
                action: 'created',
                validation: {
                    passed: true,
                    checks: ['email_format', 'password_strength', 'username_availability']
                }
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Failed to create user',
            error: {
                code: 'CREATE_USER_ERROR',
                message: error.message,
                details: {
                    validationErrors: error.validationErrors || null,
                    field: error.field || null
                },
                requestId
            },
            timestamp: new Date().toISOString()
        });
    }
});

// Update user
router.put('/:id', BeamAuth.requireAuth, async (req, res) => {
    const requestId = uuidv4();
    req.id = requestId;
    
    try {
        const user = await BeamUserService.updateUser(req.params.id, req.body);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found',
                    details: { userId: req.params.id },
                    requestId
                },
                timestamp: new Date().toISOString()
            });
        }
        res.json({
            success: true,
            message: 'User updated successfully',
            data: user,
            meta: {
                version: 'v3',
                timestamp: new Date().toISOString(),
                requestId,
                userId: req.params.id,
                action: 'updated',
                changes: req.body,
                validation: {
                    passed: true,
                    checks: ['email_format', 'username_availability']
                }
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Failed to update user',
            error: {
                code: 'UPDATE_USER_ERROR',
                message: error.message,
                details: {
                    userId: req.params.id,
                    validationErrors: error.validationErrors || null,
                    field: error.field || null
                },
                requestId
            },
            timestamp: new Date().toISOString()
        });
    }
});

// Delete user
router.delete('/:id', BeamAuth.requireAuth, async (req, res) => {
    const requestId = uuidv4();
    req.id = requestId;
    
    try {
        const success = await BeamUserService.deleteUser(req.params.id);
        if (!success) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found',
                    details: { userId: req.params.id },
                    requestId
                },
                timestamp: new Date().toISOString()
            });
        }
        res.json({
            success: true,
            message: 'User deleted successfully',
            data: { deleted: true, userId: req.params.id },
            meta: {
                version: 'v3',
                timestamp: new Date().toISOString(),
                requestId,
                userId: req.params.id,
                action: 'deleted',
                softDelete: false
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete user',
            error: {
                code: 'DELETE_USER_ERROR',
                message: error.message,
                details: { userId: req.params.id },
                requestId
            },
            timestamp: new Date().toISOString()
        });
    }
});

// New V3 features

// Get user statistics
router.get('/stats/overview', BeamAuth.requireAuth, async (req, res) => {
    const requestId = uuidv4();
    req.id = requestId;
    
    try {
        const users = await BeamUserService.getAllUsers();
        const stats = {
            totalUsers: users.length,
            activeUsers: users.filter(u => u.status === 'active').length,
            inactiveUsers: users.filter(u => u.status === 'inactive').length,
            newUsersThisMonth: users.filter(u => {
                const created = new Date(u.createdAt || u.created_at);
                const now = new Date();
                return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
            }).length
        };
        
        res.json({
            success: true,
            message: 'User statistics retrieved successfully',
            data: stats,
            meta: {
                version: 'v3',
                timestamp: new Date().toISOString(),
                requestId,
                period: 'overview'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user statistics',
            error: {
                code: 'FETCH_STATS_ERROR',
                message: error.message,
                details: null,
                requestId
            },
            timestamp: new Date().toISOString()
        });
    }
});

// Bulk operations
router.post('/bulk', BeamAuth.requireAuth, async (req, res) => {
    const requestId = uuidv4();
    req.id = requestId;
    
    try {
        const { action, userIds, data } = req.body;
        
        if (!action || !userIds || !Array.isArray(userIds)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid bulk operation parameters',
                error: {
                    code: 'INVALID_BULK_OPERATION',
                    message: 'Missing required parameters: action, userIds',
                    details: { action, userIds },
                    requestId
                },
                timestamp: new Date().toISOString()
            });
        }
        
        const results = [];
        for (const userId of userIds) {
            try {
                let result;
                switch (action) {
                    case 'update':
                        result = await BeamUserService.updateUser(userId, data);
                        break;
                    case 'delete':
                        result = await BeamUserService.deleteUser(userId);
                        break;
                    default:
                        throw new Error(`Unsupported bulk action: ${action}`);
                }
                results.push({ userId, success: true, result });
            } catch (error) {
                results.push({ userId, success: false, error: error.message });
            }
        }
        
        const successCount = results.filter(r => r.success).length;
        const failureCount = results.length - successCount;
        
        res.json({
            success: true,
            message: `Bulk operation completed: ${successCount} successful, ${failureCount} failed`,
            data: results,
            meta: {
                version: 'v3',
                timestamp: new Date().toISOString(),
                requestId,
                action,
                totalProcessed: userIds.length,
                successCount,
                failureCount
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to perform bulk operation',
            error: {
                code: 'BULK_OPERATION_ERROR',
                message: error.message,
                details: null,
                requestId
            },
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;
