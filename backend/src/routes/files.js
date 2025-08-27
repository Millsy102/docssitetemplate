const express = require('express');
const router = express.Router();
const BeamFileService = require('../services/BeamFileService');
const BeamAuth = require('../middleware/BeamAuth');
const multer = require('multer');

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Get all files
router.get('/', BeamAuth.requireAuth, async (req, res) => {
    try {
        const files = await BeamFileService.getAllFiles();
        res.json(files);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch files' });
    }
});

// Get file by ID
router.get('/:id', BeamAuth.requireAuth, async (req, res) => {
    try {
        const file = await BeamFileService.getFileById(req.params.id);
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }
        res.json(file);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch file' });
    }
});

// Upload file
router.post('/upload', BeamAuth.requireAuth, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' });
        }

        const fileData = {
            originalName: req.file.originalname,
            buffer: req.file.buffer,
            mimetype: req.file.mimetype,
            size: req.file.size
        };

        const file = await BeamFileService.uploadFile(fileData);
        res.status(201).json(file);
    } catch (error) {
        res.status(400).json({ error: 'Failed to upload file' });
    }
});

// Download file
router.get('/:id/download', BeamAuth.requireAuth, async (req, res) => {
    try {
        const file = await BeamFileService.getFileById(req.params.id);
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        res.setHeader('Content-Type', file.mimetype);
        res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
        res.send(file.buffer);
    } catch (error) {
        res.status(500).json({ error: 'Failed to download file' });
    }
});

// Delete file
router.delete('/:id', BeamAuth.requireAuth, async (req, res) => {
    try {
        const success = await BeamFileService.deleteFile(req.params.id);
        if (!success) {
            return res.status(404).json({ error: 'File not found' });
        }
        res.json({ message: 'File deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete file' });
    }
});

module.exports = router;
