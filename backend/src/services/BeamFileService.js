const fs = require('fs-extra');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');
const crypto = require('crypto');
const archiver = require('archiver');
const extract = require('extract-zip');
const beamDatabase = require('../database/BeamDatabase');
const BeamErrorHandler = require('../utils/BeamErrorHandler');

class BeamFileService {
    constructor() {
        this.File = beamDatabase.getModel('File');
        this.User = beamDatabase.getModel('User');
        this.uploadDir = path.join(__dirname, '../../uploads');
        this.tempDir = path.join(__dirname, '../../temp');
        this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024; // 100MB
        this.allowedMimeTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf', 'text/plain', 'text/html', 'text/css', 'text/javascript',
            'application/json', 'application/xml', 'application/zip', 'application/rar',
            'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav',
            'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];

        this.ensureDirectories();
    }

    /**
     * Ensure required directories exist
     */
    ensureDirectories() {
        fs.ensureDirSync(this.uploadDir);
        fs.ensureDirSync(this.tempDir);
        fs.ensureDirSync(path.join(this.uploadDir, 'images'));
        fs.ensureDirSync(path.join(this.uploadDir, 'documents'));
        fs.ensureDirSync(path.join(this.uploadDir, 'videos'));
        fs.ensureDirSync(path.join(this.uploadDir, 'audio'));
        fs.ensureDirSync(path.join(this.uploadDir, 'archives'));
    }

    /**
     * Configure multer for file uploads
     */
    configureMulter() {
        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
                const category = this.getFileCategory(file.mimetype);
                const uploadPath = path.join(this.uploadDir, category);
                fs.ensureDirSync(uploadPath);
                cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
                const uniqueName = this.generateUniqueFileName(file.originalname);
                cb(null, uniqueName);
            }
        });

        const fileFilter = (req, file, cb) => {
            if (this.allowedMimeTypes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error('File type not allowed'), false);
            }
        };

        return multer({
            storage,
            fileFilter,
            limits: {
                fileSize: this.maxFileSize,
                files: 10 // Max 10 files per upload
            }
        });
    }

    /**
     * Get file category based on MIME type
     */
    getFileCategory(mimeType) {
        if (mimeType.startsWith('image/')) return 'images';
        if (mimeType.startsWith('video/')) return 'videos';
        if (mimeType.startsWith('audio/')) return 'audio';
        if (mimeType.includes('zip') || mimeType.includes('rar')) return 'archives';
        return 'documents';
    }

    /**
     * Generate unique filename
     */
    generateUniqueFileName(originalName) {
        const timestamp = Date.now();
        const random = crypto.randomBytes(8).toString('hex');
        const extension = path.extname(originalName);
        const name = path.basename(originalName, extension);
        return `${name}_${timestamp}_${random}${extension}`;
    }

    /**
     * Upload file
     */
    async uploadFile(file, userId, metadata = {}) {
        try {
            // Validate file
            if (!file) {
                throw new Error('No file provided');
            }

            if (file.size > this.maxFileSize) {
                throw new Error('File size exceeds limit');
            }

            // Get file info
            const fileInfo = await this.getFileInfo(file.path);
            
            // Create file record
            const fileRecord = new this.File({
                name: file.filename,
                originalName: file.originalname,
                path: file.path,
                size: file.size,
                mimeType: file.mimetype,
                extension: path.extname(file.originalname),
                owner: userId,
                metadata: {
                    ...metadata,
                    ...fileInfo
                }
            });

            await fileRecord.save();

            // Process image if needed
            if (file.mimetype.startsWith('image/')) {
                await this.processImage(file.path);
            }

            // Log file upload
            await this.logAction('info', 'File uploaded', 'BeamFileService', userId, {
                fileName: file.originalname,
                fileSize: file.size,
                fileId: fileRecord._id
            });

            return {
                success: true,
                file: fileRecord,
                message: 'File uploaded successfully'
            };

        } catch (error) {
            BeamErrorHandler.logError('File Upload Error', error);
            throw error;
        }
    }

    /**
     * Get file information
     */
    async getFileInfo(filePath) {
        try {
            const stats = await fs.stat(filePath);
            return {
                created: stats.birthtime,
                modified: stats.mtime,
                accessed: stats.atime
            };
        } catch (error) {
            return {};
        }
    }

    /**
     * Process image (resize, optimize)
     */
    async processImage(filePath) {
        try {
            const image = sharp(filePath);
            const metadata = await image.metadata();

            // Create thumbnail if image is large
            if (metadata.width > 800 || metadata.height > 600) {
                const thumbnailPath = filePath.replace(/(\.[^.]+)$/, '_thumb$1');
                await image
                    .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
                    .jpeg({ quality: 80 })
                    .toFile(thumbnailPath);
            }

            // Optimize original image
            await image
                .jpeg({ quality: 85, progressive: true })
                .toFile(filePath + '.optimized');

            // Replace original with optimized version
            await fs.move(filePath + '.optimized', filePath, { overwrite: true });

        } catch (error) {
            console.error('Image processing error:', error);
        }
    }

    /**
     * Get file by ID
     */
    async getFileById(fileId, userId) {
        try {
            const file = await this.File.findById(fileId);
            if (!file) {
                throw new Error('File not found');
            }

            // Check permissions
            if (!this.hasFileAccess(file, userId)) {
                throw new Error('Access denied');
            }

            return file;
        } catch (error) {
            BeamErrorHandler.logError('Get File Error', error);
            throw error;
        }
    }

    /**
     * Get user files with pagination
     */
    async getUserFiles(userId, page = 1, limit = 20, filters = {}) {
        try {
            const skip = (page - 1) * limit;
            const query = { owner: userId, isDeleted: false };

            // Apply filters
            if (filters.mimeType) {
                query.mimeType = { $regex: filters.mimeType, $options: 'i' };
            }
            if (filters.search) {
                query.$or = [
                    { name: { $regex: filters.search, $options: 'i' } },
                    { originalName: { $regex: filters.search, $options: 'i' } },
                    { tags: { $in: [new RegExp(filters.search, 'i')] } }
                ];
            }
            if (filters.tags && filters.tags.length > 0) {
                query.tags = { $in: filters.tags };
            }

            const files = await this.File.find(query)
                .populate('owner', 'username email')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });

            const total = await this.File.countDocuments(query);

            return {
                files,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            BeamErrorHandler.logError('Get User Files Error', error);
            throw error;
        }
    }

    /**
     * Download file
     */
    async downloadFile(fileId, userId) {
        try {
            const file = await this.getFileById(fileId, userId);
            
            if (!await fs.pathExists(file.path)) {
                throw new Error('File not found on disk');
            }

            // Log download
            await this.logAction('info', 'File downloaded', 'BeamFileService', userId, {
                fileName: file.originalName,
                fileId: file._id
            });

            return {
                filePath: file.path,
                fileName: file.originalName,
                mimeType: file.mimeType
            };
        } catch (error) {
            BeamErrorHandler.logError('File Download Error', error);
            throw error;
        }
    }

    /**
     * Share file
     */
    async shareFile(fileId, userId, shareData) {
        try {
            const file = await this.getFileById(fileId, userId);
            
            // Add sharing permissions
            if (shareData.public) {
                file.permissions.public = true;
            }

            if (shareData.users && shareData.users.length > 0) {
                for (const userShare of shareData.users) {
                    const existingShare = file.permissions.sharedWith.find(
                        share => share.user.toString() === userShare.userId
                    );

                    if (existingShare) {
                        existingShare.permission = userShare.permission;
                    } else {
                        file.permissions.sharedWith.push({
                            user: userShare.userId,
                            permission: userShare.permission || 'read'
                        });
                    }
                }
            }

            await file.save();

            // Log sharing
            await this.logAction('info', 'File shared', 'BeamFileService', userId, {
                fileName: file.originalName,
                fileId: file._id,
                sharedWith: shareData.users?.length || 0,
                public: shareData.public || false
            });

            return {
                success: true,
                file,
                message: 'File shared successfully'
            };
        } catch (error) {
            BeamErrorHandler.logError('File Share Error', error);
            throw error;
        }
    }

    /**
     * Update file metadata
     */
    async updateFile(fileId, userId, updateData) {
        try {
            const file = await this.getFileById(fileId, userId);
            
            // Update allowed fields
            if (updateData.tags) file.tags = updateData.tags;
            if (updateData.metadata) file.metadata = { ...file.metadata, ...updateData.metadata };
            
            await file.save();

            return {
                success: true,
                file,
                message: 'File updated successfully'
            };
        } catch (error) {
            BeamErrorHandler.logError('File Update Error', error);
            throw error;
        }
    }

    /**
     * Delete file
     */
    async deleteFile(fileId, userId) {
        try {
            const file = await this.getFileById(fileId, userId);
            
            // Soft delete
            file.isDeleted = true;
            await file.save();

            // Log deletion
            await this.logAction('info', 'File deleted', 'BeamFileService', userId, {
                fileName: file.originalName,
                fileId: file._id
            });

            return {
                success: true,
                message: 'File deleted successfully'
            };
        } catch (error) {
            BeamErrorHandler.logError('File Delete Error', error);
            throw error;
        }
    }

    /**
     * Create zip archive
     */
    async createZipArchive(fileIds, userId) {
        try {
            const files = await this.File.find({
                _id: { $in: fileIds },
                owner: userId,
                isDeleted: false
            });

            if (files.length === 0) {
                throw new Error('No files found');
            }

            const archiveName = `archive_${Date.now()}.zip`;
            const archivePath = path.join(this.tempDir, archiveName);
            const output = fs.createWriteStream(archivePath);
            const archive = archiver('zip', { zlib: { level: 9 } });

            archive.pipe(output);

            for (const file of files) {
                if (await fs.pathExists(file.path)) {
                    archive.file(file.path, { name: file.originalName });
                }
            }

            await archive.finalize();

            return {
                success: true,
                archivePath,
                archiveName,
                fileCount: files.length
            };
        } catch (error) {
            BeamErrorHandler.logError('Create Archive Error', error);
            throw error;
        }
    }

    /**
     * Extract archive
     */
    async extractArchive(fileId, userId) {
        try {
            const file = await this.getFileById(fileId, userId);
            
            if (!file.mimeType.includes('zip')) {
                throw new Error('File is not a zip archive');
            }

            const extractDir = path.join(this.tempDir, `extract_${Date.now()}`);
            await fs.ensureDir(extractDir);

            await extract(file.path, { dir: extractDir });

            // Get extracted files
            const extractedFiles = await this.getFilesInDirectory(extractDir);

            return {
                success: true,
                extractDir,
                files: extractedFiles
            };
        } catch (error) {
            BeamErrorHandler.logError('Extract Archive Error', error);
            throw error;
        }
    }

    /**
     * Get files in directory
     */
    async getFilesInDirectory(dirPath) {
        const files = [];
        
        try {
            const items = await fs.readdir(dirPath, { withFileTypes: true });
            
            for (const item of items) {
                const fullPath = path.join(dirPath, item.name);
                
                if (item.isFile()) {
                    const stats = await fs.stat(fullPath);
                    files.push({
                        name: item.name,
                        path: fullPath,
                        size: stats.size,
                        isDirectory: false
                    });
                } else if (item.isDirectory()) {
                    files.push({
                        name: item.name,
                        path: fullPath,
                        isDirectory: true
                    });
                }
            }
        } catch (error) {
            console.error('Error reading directory:', error);
        }

        return files;
    }

    /**
     * Check file access permissions
     */
    hasFileAccess(file, userId) {
        // Owner has full access
        if (file.owner.toString() === userId) {
            return true;
        }

        // Public files
        if (file.permissions.public) {
            return true;
        }

        // Shared files
        const sharedWith = file.permissions.sharedWith.find(
            share => share.user.toString() === userId
        );

        return !!sharedWith;
    }

    /**
     * Get file statistics
     */
    async getFileStats(userId) {
        try {
            const stats = await this.File.aggregate([
                { $match: { owner: this.User.base.Types.ObjectId(userId), isDeleted: false } },
                {
                    $group: {
                        _id: null,
                        totalFiles: { $sum: 1 },
                        totalSize: { $sum: '$size' },
                        byType: {
                            $push: {
                                mimeType: '$mimeType',
                                size: '$size'
                            }
                        }
                    }
                }
            ]);

            const typeStats = await this.File.aggregate([
                { $match: { owner: this.User.base.Types.ObjectId(userId), isDeleted: false } },
                {
                    $group: {
                        _id: '$mimeType',
                        count: { $sum: 1 },
                        totalSize: { $sum: '$size' }
                    }
                }
            ]);

            return {
                totalFiles: stats[0]?.totalFiles || 0,
                totalSize: stats[0]?.totalSize || 0,
                byType: typeStats.reduce((acc, stat) => {
                    acc[stat._id] = {
                        count: stat.count,
                        totalSize: stat.totalSize
                    };
                    return acc;
                }, {})
            };
        } catch (error) {
            BeamErrorHandler.logError('File Stats Error', error);
            throw error;
        }
    }

    /**
     * Clean up temporary files
     */
    async cleanupTempFiles() {
        try {
            const tempFiles = await fs.readdir(this.tempDir);
            const now = Date.now();
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours

            for (const file of tempFiles) {
                const filePath = path.join(this.tempDir, file);
                const stats = await fs.stat(filePath);
                
                if (now - stats.mtime.getTime() > maxAge) {
                    await fs.remove(filePath);
                }
            }
        } catch (error) {
            console.error('Cleanup error:', error);
        }
    }

    /**
     * Log action
     */
    async logAction(level, message, source, userId = null, metadata = {}) {
        try {
            const Log = beamDatabase.getModel('Log');
            const log = new Log({
                level,
                message,
                source,
                userId,
                metadata
            });
            await log.save();
        } catch (error) {
            console.error('Logging error:', error);
        }
    }
}

module.exports = new BeamFileService();
