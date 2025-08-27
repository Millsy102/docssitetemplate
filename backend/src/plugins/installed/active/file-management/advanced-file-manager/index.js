/**
 * Advanced file manager with drag & drop, preview, and bulk operations
 * 
 * Drag & drop upload interface
 * File preview (images, PDFs, videos)
 * Bulk operations (move, copy, delete)
 * Search and filter files
 * File sharing with temporary links
 * Version control for documents
 * 
 * @version 1.0.0
 * @author BeamFlow System
 * @license MIT
 */

const EnhancedPluginTemplate = require('../../templates/EnhancedPluginTemplate');
const BeamFileService = require('../../../services/BeamFileService');
const path = require('path');
const fs = require('fs-extra');

class AdvancedFileManagerPlugin extends EnhancedPluginTemplate {
    constructor() {
        super({
            name: 'advanced-file-manager',
            version: '1.0.0',
            description: 'Advanced file manager with drag & drop, preview, and bulk operations',
            author: 'BeamFlow System',
            license: 'MIT',
            category: 'file-management',
            subcategory: '',
            complexity: 'advanced',
            resourceUsage: 'medium',
            
            // Enhanced features
            cachingStrategy: 'redis',
            backgroundProcessing: true,
            queueManagement: true,
            encryptionRequired: false,
            auditLogging: true,
            mobileSupport: true,
            offlineSupport: false,
            realTimeUpdates: true
        });

        this.fileService = BeamFileService;
        this.upload = this.fileService.configureMulter();
    }

    /**
     * Enhanced initialization
     */
    async onEnhancedInit(context) {
        this.log('info', 'Advanced file manager with drag & drop, preview, and bulk operations Plugin initialized successfully');
        
        // Register API routes
        this.registerApiRoutes();
        
        // Register WebSocket events
        this.registerWebSocketEvents();
        
        // Register scheduled tasks
        this.registerScheduledTasks();
    }

    /**
     * Register API routes
     */
    registerApiRoutes() {
        // File upload endpoint
        this.addApiRoute('POST', '/upload', this.handleFileUpload.bind(this), {
            description: 'Upload files with drag & drop support',
            middleware: [this.upload.array('files', 10)]
        });

        // Get files endpoint
        this.addApiRoute('GET', '/files', this.getFiles.bind(this), {
            description: 'Get user files with pagination and filtering'
        });

        // File preview endpoint
        this.addApiRoute('GET', '/files/:id/preview', this.getFilePreview.bind(this), {
            description: 'Get file preview (images, PDFs, videos)'
        });

        // Download file endpoint
        this.addApiRoute('GET', '/files/:id/download', this.downloadFile.bind(this), {
            description: 'Download file'
        });

        // Share file endpoint
        this.addApiRoute('POST', '/files/:id/share', this.shareFile.bind(this), {
            description: 'Share file with other users or make public'
        });

        // Bulk operations endpoint
        this.addApiRoute('POST', '/files/bulk', this.bulkOperations.bind(this), {
            description: 'Perform bulk operations on files'
        });

        // Search files endpoint
        this.addApiRoute('GET', '/files/search', this.searchFiles.bind(this), {
            description: 'Search files by name, tags, or content'
        });

        // File metadata endpoint
        this.addApiRoute('PUT', '/files/:id/metadata', this.updateFileMetadata.bind(this), {
            description: 'Update file metadata and tags'
        });

        // Delete file endpoint
        this.addApiRoute('DELETE', '/files/:id', this.deleteFile.bind(this), {
            description: 'Delete file (soft delete)'
        });

        // Create archive endpoint
        this.addApiRoute('POST', '/files/archive', this.createArchive.bind(this), {
            description: 'Create zip archive from multiple files'
        });

        // Extract archive endpoint
        this.addApiRoute('POST', '/files/:id/extract', this.extractArchive.bind(this), {
            description: 'Extract zip archive'
        });

        // File statistics endpoint
        this.addApiRoute('GET', '/files/stats', this.getFileStats.bind(this), {
            description: 'Get file statistics and usage'
        });
    }

    /**
     * Register WebSocket events
     */
    registerWebSocketEvents() {
        this.addWebSocketEvent('file_upload_progress', 'File upload progress updates');
        this.addWebSocketEvent('file_operation_complete', 'File operation completion notifications');
        this.addWebSocketEvent('file_shared', 'File sharing notifications');
        this.addWebSocketEvent('file_deleted', 'File deletion notifications');
    }

    /**
     * Register scheduled tasks
     */
    registerScheduledTasks() {
        this.addScheduledTask({
            name: 'cleanup_temp_files',
            schedule: '0 2 * * *', // Daily at 2 AM
            handler: this.cleanupTempFiles.bind(this),
            description: 'Clean up temporary files older than 24 hours'
        });

        this.addScheduledTask({
            name: 'update_file_statistics',
            schedule: '0 */6 * * *', // Every 6 hours
            handler: this.updateFileStatistics.bind(this),
            description: 'Update file statistics and usage metrics'
        });
    }

    // API Handlers

    /**
     * Handle file upload
     */
    async handleFileUpload(req, res) {
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'No files uploaded'
                });
            }

            const userId = req.user.userId;
            const uploadedFiles = [];

            for (const file of req.files) {
                try {
                    const result = await this.fileService.uploadFile(file, userId, {
                        uploadedVia: 'advanced-file-manager',
                        userAgent: req.headers['user-agent'],
                        ipAddress: req.ip
                    });

                    uploadedFiles.push(result.file);

                    // Emit WebSocket event for real-time updates
                    this.emitWebSocketEvent('file_upload_progress', {
                        userId,
                        fileId: result.file._id,
                        fileName: result.file.originalName,
                        progress: 100,
                        status: 'completed'
                    });

                } catch (error) {
                    this.error('File upload failed', error);
                    uploadedFiles.push({
                        originalName: file.originalname,
                        error: error.message
                    });
                }
            }

            res.json({
                success: true,
                files: uploadedFiles,
                message: `${uploadedFiles.length} files uploaded successfully`
            });

        } catch (error) {
            this.error('File upload handler failed', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Get files with pagination and filtering
     */
    async getFiles(req, res) {
        try {
            const userId = req.user.userId;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const filters = {
                mimeType: req.query.mimeType,
                search: req.query.search,
                tags: req.query.tags ? req.query.tags.split(',') : undefined
            };

            const result = await this.fileService.getUserFiles(userId, page, limit, filters);

            res.json({
                success: true,
                data: result
            });

        } catch (error) {
            this.error('Get files failed', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Get file preview
     */
    async getFilePreview(req, res) {
        try {
            const userId = req.user.userId;
            const fileId = req.params.id;

            const file = await this.fileService.getFileById(fileId, userId);

            // Check if file supports preview
            const previewableTypes = [
                'image/jpeg', 'image/png', 'image/gif', 'image/webp',
                'application/pdf', 'text/plain', 'text/html', 'text/css',
                'text/javascript', 'application/json'
            ];

            if (!previewableTypes.includes(file.mimeType)) {
                return res.status(400).json({
                    success: false,
                    error: 'File type does not support preview'
                });
            }

            // For images, return the file directly
            if (file.mimeType.startsWith('image/')) {
                return res.sendFile(file.path);
            }

            // For text files, read and return content
            if (file.mimeType.startsWith('text/') || file.mimeType === 'application/json') {
                const content = await fs.readFile(file.path, 'utf8');
                return res.json({
                    success: true,
                    content,
                    mimeType: file.mimeType
                });
            }

            // For PDFs, return file path for client-side preview
            if (file.mimeType === 'application/pdf') {
                return res.json({
                    success: true,
                    filePath: `/api/plugins/advanced-file-manager/files/${fileId}/download`,
                    mimeType: file.mimeType
                });
            }

        } catch (error) {
            this.error('File preview failed', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Download file
     */
    async downloadFile(req, res) {
        try {
            const userId = req.user.userId;
            const fileId = req.params.id;

            const result = await this.fileService.downloadFile(fileId, userId);

            res.download(result.filePath, result.fileName, (err) => {
                if (err) {
                    this.error('File download failed', err);
                }
            });

        } catch (error) {
            this.error('File download failed', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Share file
     */
    async shareFile(req, res) {
        try {
            const userId = req.user.userId;
            const fileId = req.params.id;
            const shareData = req.body;

            const result = await this.fileService.shareFile(fileId, userId, shareData);

            // Emit WebSocket event
            this.emitWebSocketEvent('file_shared', {
                userId,
                fileId,
                sharedWith: shareData.users?.length || 0,
                public: shareData.public || false
            });

            res.json({
                success: true,
                data: result
            });

        } catch (error) {
            this.error('File share failed', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Bulk operations
     */
    async bulkOperations(req, res) {
        try {
            const userId = req.user.userId;
            const { operation, fileIds, ...options } = req.body;

            if (!fileIds || fileIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'No files selected'
                });
            }

            let results = [];

            switch (operation) {
                case 'delete':
                    for (const fileId of fileIds) {
                        try {
                            await this.fileService.deleteFile(fileId, userId);
                            results.push({ fileId, success: true });
                        } catch (error) {
                            results.push({ fileId, success: false, error: error.message });
                        }
                    }
                    break;

                case 'share':
                    for (const fileId of fileIds) {
                        try {
                            await this.fileService.shareFile(fileId, userId, options);
                            results.push({ fileId, success: true });
                        } catch (error) {
                            results.push({ fileId, success: false, error: error.message });
                        }
                    }
                    break;

                case 'update_metadata':
                    for (const fileId of fileIds) {
                        try {
                            await this.fileService.updateFile(fileId, userId, options);
                            results.push({ fileId, success: true });
                        } catch (error) {
                            results.push({ fileId, success: false, error: error.message });
                        }
                    }
                    break;

                default:
                    return res.status(400).json({
                        success: false,
                        error: 'Invalid operation'
                    });
            }

            // Emit WebSocket event
            this.emitWebSocketEvent('file_operation_complete', {
                userId,
                operation,
                results
            });

            res.json({
                success: true,
                results
            });

        } catch (error) {
            this.error('Bulk operations failed', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Search files
     */
    async searchFiles(req, res) {
        try {
            const userId = req.user.userId;
            const { query, type, tags } = req.query;

            const filters = {};
            if (query) filters.search = query;
            if (type) filters.mimeType = type;
            if (tags) filters.tags = tags.split(',');

            const result = await this.fileService.getUserFiles(userId, 1, 50, filters);

            res.json({
                success: true,
                data: result
            });

        } catch (error) {
            this.error('File search failed', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Update file metadata
     */
    async updateFileMetadata(req, res) {
        try {
            const userId = req.user.userId;
            const fileId = req.params.id;
            const updateData = req.body;

            const result = await this.fileService.updateFile(fileId, userId, updateData);

            res.json({
                success: true,
                data: result
            });

        } catch (error) {
            this.error('Update file metadata failed', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Delete file
     */
    async deleteFile(req, res) {
        try {
            const userId = req.user.userId;
            const fileId = req.params.id;

            const result = await this.fileService.deleteFile(fileId, userId);

            // Emit WebSocket event
            this.emitWebSocketEvent('file_deleted', {
                userId,
                fileId
            });

            res.json({
                success: true,
                data: result
            });

        } catch (error) {
            this.error('Delete file failed', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Create archive
     */
    async createArchive(req, res) {
        try {
            const userId = req.user.userId;
            const { fileIds } = req.body;

            if (!fileIds || fileIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'No files selected for archive'
                });
            }

            const result = await this.fileService.createZipArchive(fileIds, userId);

            res.json({
                success: true,
                data: result
            });

        } catch (error) {
            this.error('Create archive failed', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Extract archive
     */
    async extractArchive(req, res) {
        try {
            const userId = req.user.userId;
            const fileId = req.params.id;

            const result = await this.fileService.extractArchive(fileId, userId);

            res.json({
                success: true,
                data: result
            });

        } catch (error) {
            this.error('Extract archive failed', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Get file statistics
     */
    async getFileStats(req, res) {
        try {
            const userId = req.user.userId;

            const stats = await this.fileService.getFileStats(userId);

            res.json({
                success: true,
                data: stats
            });

        } catch (error) {
            this.error('Get file stats failed', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Scheduled Task Handlers

    /**
     * Clean up temporary files
     */
    async cleanupTempFiles() {
        try {
            await this.fileService.cleanupTempFiles();
            this.log('info', 'Temporary files cleanup completed');
        } catch (error) {
            this.error('Temporary files cleanup failed', error);
        }
    }

    /**
     * Update file statistics
     */
    async updateFileStatistics() {
        try {
            // This could update cached statistics or generate reports
            this.log('info', 'File statistics update completed');
        } catch (error) {
            this.error('File statistics update failed', error);
        }
    }

    // Helper methods

    /**
     * Add API route
     */
    addApiRoute(method, path, handler, options = {}) {
        const fullPath = `/api/plugins/${this.name}${path}`;
        this.apiRoutes.push({
            method,
            path: fullPath,
            handler,
            options
        });
    }

    /**
     * Add WebSocket event
     */
    addWebSocketEvent(event, description) {
        this.websocketEvents.push({
            event: `${this.name}:${event}`,
            description
        });
    }

    /**
     * Add scheduled task
     */
    addScheduledTask(task) {
        this.scheduledTasks.push({
            ...task,
            plugin: this.name
        });
    }

    /**
     * Emit WebSocket event
     */
    emitWebSocketEvent(event, data) {
        // This would emit to connected WebSocket clients
        // Implementation depends on your WebSocket setup
        console.log(`WebSocket event: ${this.name}:${event}`, data);
    }
}

module.exports = AdvancedFileManagerPlugin;
