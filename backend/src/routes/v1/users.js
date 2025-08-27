const express = require('express');
const router = express.Router();
const BeamUserService = require('../../services/BeamUserService');
const BeamAuth = require('../../middleware/BeamAuth');

// V1 Users API - Legacy format

// Get all users (admin only)
router.get('/', BeamAuth.requireAuth, async (req, res) => {
    try {
        const users = await BeamUserService.getAllUsers();
        res.json({
            success: true,
            message: 'Users retrieved successfully',
            data: users,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: error.message,
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
                error: 'User not found',
                timestamp: new Date().toISOString()
            });
        }
        res.json({
            success: true,
            message: 'User retrieved successfully',
            data: user,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user',
            error: error.message,
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
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Failed to create user',
            error: error.message,
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
                error: 'User not found',
                timestamp: new Date().toISOString()
            });
        }
        res.json({
            success: true,
            message: 'User updated successfully',
            data: user,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Failed to update user',
            error: error.message,
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
                error: 'User not found',
                timestamp: new Date().toISOString()
            });
        }
        res.json({
            success: true,
            message: 'User deleted successfully',
            data: { deleted: true },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete user',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;
