const express = require('express');
const router = express.Router();
const BeamFileService = require('../../services/BeamFileService');
const BeamAuth = require('../../middleware/BeamAuth');

// V2 Files API - Enhanced format with metadata

// Get all files
router.get('/', BeamAuth.requireAuth, async (req, res) => {
    try {
        const files = await BeamFileService.getAllFiles();
        const totalCount = files.length;
        
        res.json({
            success: true,
            message: 'Files retrieved successfully',
            data: files,
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
            message: 'Failed to fetch files',
            error: {
                code: 'FETCH_FILES_ERROR',
                message: error.message,
                details: null
            },
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
                error: {
                    code: 'FILE_NOT_FOUND',
                    message: 'File not found',
                    details: { fileId: req.params.id }
                },
                timestamp: new Date().toISOString()
            });
        }
        res.json({
            success: true,
            message: 'File retrieved successfully',
            data: file,
            meta: {
                version: 'v2',
                timestamp: new Date().toISOString(),
                fileId: req.params.id
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch file',
            error: {
                code: 'FETCH_FILE_ERROR',
                message: error.message,
                details: { fileId: req.params.id }
            },
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
            meta: {
                version: 'v2',
                timestamp: new Date().toISOString(),
                fileId: file.id || file._id,
                action: 'uploaded'
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Failed to upload file',
            error: {
                code: 'UPLOAD_FILE_ERROR',
                message: error.message,
                details: null
            },
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
                error: {
                    code: 'FILE_NOT_FOUND',
                    message: 'File not found',
                    details: { fileId: req.params.id }
                },
                timestamp: new Date().toISOString()
            });
        }
        res.json({
            success: true,
            message: 'File deleted successfully',
            data: { deleted: true, fileId: req.params.id },
            meta: {
                version: 'v2',
                timestamp: new Date().toISOString(),
                fileId: req.params.id,
                action: 'deleted'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete file',
            error: {
                code: 'DELETE_FILE_ERROR',
                message: error.message,
                details: { fileId: req.params.id }
            },
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;
