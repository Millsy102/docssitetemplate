const express = require('express');
const router = express.Router();
const BeamUserService = require('../services/BeamUserService');
const BeamAuth = require('../middleware/BeamAuth');

// Get all users (admin only)
router.get('/', BeamAuth.requireAuth, async (req, res) => {
    try {
        const users = await BeamUserService.getAllUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Get user by ID
router.get('/:id', BeamAuth.requireAuth, async (req, res) => {
    try {
        const user = await BeamUserService.getUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Create new user
router.post('/', async (req, res) => {
    try {
        const user = await BeamUserService.createUser(req.body);
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create user' });
    }
});

// Update user
router.put('/:id', BeamAuth.requireAuth, async (req, res) => {
    try {
        const user = await BeamUserService.updateUser(req.params.id, req.body);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: 'Failed to update user' });
    }
});

// Delete user
router.delete('/:id', BeamAuth.requireAuth, async (req, res) => {
    try {
        const success = await BeamUserService.deleteUser(req.params.id);
        if (!success) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

module.exports = router;
