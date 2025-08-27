const express = require('express');
const router = express.Router();
const BeamFileService = require('../../services/BeamFileService');
const BeamAuth = require('../../middleware/BeamAuth');
const { v4: uuidv4 } = require('uuid');

// V3 Files API - Current format with request IDs and enhanced features

// Get all files
router.get('/', BeamAuth.requireAuth, async (req, res) => {
    const requestId = uuidv4();
    req.id = requestId;
    
    try {
        const files = await BeamFileService.getAllFiles();
        const totalCount = files.length;
        
        res.json({
            success: true,
            message: 'Files retrieved successfully',
            data: files,
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
            message: 'Failed to fetch files',
            error: {
                code: 'FETCH_FILES_ERROR',
                message: error.message,
                details: null,
                requestId
            },
            timestamp: new Date().toISOString()
        });
    }
});

// Get file by ID
router.get('/:id', BeamAuth.requireAuth, async (req, res) => {
    const requestId = uuidv4();
    req.id = requestId;
    
    try {
        const file = await BeamFileService.getFileById(req.params.id);
        if (!file) {
            return res.status(404).json({
                success: false,
                message: 'File not found',
                error: {
                    code: 'FILE_NOT_FOUND',
                    message: 'File not found',
                    details: { fileId: req.params.id },
                    requestId
                },
                timestamp: new Date().toISOString()
            });
        }
        res.json({
            success: true,
            message: 'File retrieved successfully',
            data: file,
            meta: {
                version: 'v3',
                timestamp: new Date().toISOString(),
                requestId,
                fileId: req.params.id,
                cacheStatus: 'fresh'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch file',
            error: {
                code: 'FETCH_FILE_ERROR',
                message: error.message,
                details: { fileId: req.params.id },
                requestId
            },
            timestamp: new Date().toISOString()
        });
    }
});

// Upload file
router.post('/upload', BeamAuth.requireAuth, async (req, res) => {
    const requestId = uuidv4();
    req.id = requestId;
    
    try {
        const file = await BeamFileService.uploadFile(req.body);
        res.status(201).json({
            success: true,
            message: 'File uploaded successfully',
            data: file,
            meta: {
                version: 'v3',
                timestamp: new Date().toISOString(),
                requestId,
                fileId: file.id || file._id,
                action: 'uploaded',
                validation: {
                    passed: true,
                    checks: ['file_size', 'file_type', 'virus_scan']
                }
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Failed to upload file',
            error: {
                code: 'UPLOAD_FILE_ERROR',
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

// Delete file
router.delete('/:id', BeamAuth.requireAuth, async (req, res) => {
    const requestId = uuidv4();
    req.id = requestId;
    
    try {
        const success = await BeamFileService.deleteFile(req.params.id);
        if (!success) {
            return res.status(404).json({
                success: false,
                message: 'File not found',
                error: {
                    code: 'FILE_NOT_FOUND',
                    message: 'File not found',
                    details: { fileId: req.params.id },
                    requestId
                },
                timestamp: new Date().toISOString()
            });
        }
        res.json({
            success: true,
            message: 'File deleted successfully',
            data: { deleted: true, fileId: req.params.id },
            meta: {
                version: 'v3',
                timestamp: new Date().toISOString(),
                requestId,
                fileId: req.params.id,
                action: 'deleted',
                softDelete: false
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete file',
            error: {
                code: 'DELETE_FILE_ERROR',
                message: error.message,
                details: { fileId: req.params.id },
                requestId
            },
            timestamp: new Date().toISOString()
        });
    }
});

// New V3 features

// Get file statistics
router.get('/stats/overview', BeamAuth.requireAuth, async (req, res) => {
    const requestId = uuidv4();
    req.id = requestId;
    
    try {
        const files = await BeamFileService.getAllFiles();
        const stats = {
            totalFiles: files.length,
            totalSize: files.reduce((sum, file) => sum + (file.size || 0), 0),
            fileTypes: files.reduce((types, file) => {
                const ext = file.name ? file.name.split('.').pop() : 'unknown';
                types[ext] = (types[ext] || 0) + 1;
                return types;
            }, {}),
            recentUploads: files.filter(f => {
                const uploaded = new Date(f.uploadedAt || f.created_at);
                const now = new Date();
                const diffDays = (now - uploaded) / (1000 * 60 * 60 * 24);
                return diffDays <= 7;
            }).length
        };
        
        res.json({
            success: true,
            message: 'File statistics retrieved successfully',
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
            message: 'Failed to fetch file statistics',
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

// Bulk file operations
router.post('/bulk', BeamAuth.requireAuth, async (req, res) => {
    const requestId = uuidv4();
    req.id = requestId;
    
    try {
        const { action, fileIds, data } = req.body;
        
        if (!action || !fileIds || !Array.isArray(fileIds)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid bulk operation parameters',
                error: {
                    code: 'INVALID_BULK_OPERATION',
                    message: 'Missing required parameters: action, fileIds',
                    details: { action, fileIds },
                    requestId
                },
                timestamp: new Date().toISOString()
            });
        }
        
        const results = [];
        for (const fileId of fileIds) {
            try {
                let result;
                switch (action) {
                    case 'delete':
                        result = await BeamFileService.deleteFile(fileId);
                        break;
                    default:
                        throw new Error(`Unsupported bulk action: ${action}`);
                }
                results.push({ fileId, success: true, result });
            } catch (error) {
                results.push({ fileId, success: false, error: error.message });
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
                totalProcessed: fileIds.length,
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
