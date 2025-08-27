const express = require('express');
const router = express.Router();
const BeamFileService = require('../../services/BeamFileService');
const BeamAuth = require('../../middleware/BeamAuth');

// V1 Files API - Legacy format

// Get all files
router.get('/', BeamAuth.requireAuth, async (req, res) => {
    try {
        const files = await BeamFileService.getAllFiles();
        res.json({
            success: true,
            message: 'Files retrieved successfully',
            data: files,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch files',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Get file by ID
router.get('/:id', BeamAuth.requireAuth, async (req, res) => {
    try {
        const file = await BeamFileService.getFileById(req.params.id);
        if (!file) {
            return res.status(404).json({
                success: false,
                message: 'File not found',
                error: 'File not found',
                timestamp: new Date().toISOString()
            });
        }
        res.json({
            success: true,
            message: 'File retrieved successfully',
            data: file,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch file',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Upload file
router.post('/upload', BeamAuth.requireAuth, async (req, res) => {
    try {
        const file = await BeamFileService.uploadFile(req.body);
        res.status(201).json({
            success: true,
            message: 'File uploaded successfully',
            data: file,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Failed to upload file',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Delete file
router.delete('/:id', BeamAuth.requireAuth, async (req, res) => {
    try {
        const success = await BeamFileService.deleteFile(req.params.id);
        if (!success) {
            return res.status(404).json({
                success: false,
                message: 'File not found',
                error: 'File not found',
                timestamp: new Date().toISOString()
            });
        }
        res.json({
            success: true,
            message: 'File deleted successfully',
            data: { deleted: true },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete file',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;
