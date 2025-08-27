/**
 * Real-Time Chat Plugin
 * 
 * A modern real-time chat system with file sharing and collaboration features.
 * Follows BeamFlow plugin standards and extends the PluginTemplate.
 * 
 * @version 1.0.0
 * @author BeamFlow System
 * @license MIT
 */

const PluginTemplate = require('../../templates/PluginTemplate');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');

class RealTimeChatPlugin extends PluginTemplate {
    constructor() {
        super({
            name: 'real-time-chat',
            version: '1.0.0',
            description: 'Modern real-time chat system with file sharing and collaboration features',
            author: 'BeamFlow System',
            license: 'MIT',
            dependencies: ['socket.io', 'fs-extra'],
            permissions: [
                'plugin:real-time-chat:read',
                'plugin:real-time-chat:write',
                'plugin:real-time-chat:admin',
                'plugin:real-time-chat:moderate'
            ],
            
            // Settings schema
            settings: {
                max_message_length: {
                    type: 'number',
                    default: 1000,
                    required: true,
                    description: 'Maximum message length in characters',
                    validation: (value) => value >= 1 && value <= 10000
                },
                file_upload_enabled: {
                    type: 'boolean',
                    default: true,
                    description: 'Enable file upload functionality'
                },
                max_file_size: {
                    type: 'number',
                    default: 10485760, // 10MB
                    description: 'Maximum file size in bytes',
                    validation: (value) => value >= 1024 && value <= 104857600
                },
                allowed_file_types: {
                    type: 'select',
                    default: 'images',
                    description: 'Allowed file types for upload',
                    options: ['images', 'documents', 'all']
                },
                chat_rooms_enabled: {
                    type: 'boolean',
                    default: true,
                    description: 'Enable multiple chat rooms'
                },
                moderation_enabled: {
                    type: 'boolean',
                    default: false,
                    description: 'Enable message moderation'
                },
                auto_delete_messages: {
                    type: 'boolean',
                    default: false,
                    description: 'Automatically delete old messages'
                },
                message_retention_days: {
                    type: 'number',
                    default: 30,
                    description: 'Number of days to retain messages',
                    validation: (value) => value >= 1 && value <= 365
                }
            },
            
            // Hooks
            hooks: [
                {
                    name: 'onRequest',
                    description: 'Process incoming chat requests',
                    priority: 0,
                    handler: this.handleRequest.bind(this)
                },
                {
                    name: 'onUserJoin',
                    description: 'Handle user joining chat',
                    priority: 0,
                    handler: this.handleUserJoin.bind(this)
                },
                {
                    name: 'onUserLeave',
                    description: 'Handle user leaving chat',
                    priority: 0,
                    handler: this.handleUserLeave.bind(this)
                },
                {
                    name: 'onMessage',
                    description: 'Process chat messages',
                    priority: 0,
                    handler: this.handleMessage.bind(this)
                },
                {
                    name: 'onFileUpload',
                    description: 'Handle file uploads',
                    priority: 0,
                    handler: this.handleFileUpload.bind(this)
                }
            ],
            
            // UI configuration
            ui: {
                navigation: {
                    enabled: true,
                    title: 'Team Chat',
                    icon: 'chat',
                    path: '/plugins/real-time-chat',
                    order: 10,
                    permissions: ['plugin:real-time-chat:read']
                },
                widgets: [
                    {
                        name: 'ChatWidget',
                        description: 'Real-time chat widget',
                        component: 'ChatWidget',
                        permissions: ['plugin:real-time-chat:read']
                    },
                    {
                        name: 'ChatRoomsWidget',
                        description: 'Chat rooms management',
                        component: 'ChatRoomsWidget',
                        permissions: ['plugin:real-time-chat:admin']
                    },
                    {
                        name: 'ChatStatsWidget',
                        description: 'Chat statistics and analytics',
                        component: 'ChatStatsWidget',
                        permissions: ['plugin:real-time-chat:read']
                    }
                ],
                pages: [
                    {
                        name: 'ChatPage',
                        description: 'Main chat interface',
                        component: 'ChatPage',
                        path: '/plugins/real-time-chat',
                        permissions: ['plugin:real-time-chat:read']
                    },
                    {
                        name: 'ChatSettingsPage',
                        description: 'Chat settings and configuration',
                        component: 'ChatSettingsPage',
                        path: '/plugins/real-time-chat/settings',
                        permissions: ['plugin:real-time-chat:admin']
                    },
                    {
                        name: 'ChatModerationPage',
                        description: 'Message moderation interface',
                        component: 'ChatModerationPage',
                        path: '/plugins/real-time-chat/moderation',
                        permissions: ['plugin:real-time-chat:moderate']
                    }
                ]
            },
            
            // API configuration
            api: {
                routes: [
                    {
                        method: 'GET',
                        path: '/messages',
                        handler: this.getMessages.bind(this),
                        middleware: ['auth'],
                        permissions: ['plugin:real-time-chat:read']
                    },
                    {
                        method: 'POST',
                        path: '/messages',
                        handler: this.createMessage.bind(this),
                        middleware: ['auth', 'rateLimit'],
                        permissions: ['plugin:real-time-chat:write']
                    },
                    {
                        method: 'DELETE',
                        path: '/messages/:id',
                        handler: this.deleteMessage.bind(this),
                        middleware: ['auth'],
                        permissions: ['plugin:real-time-chat:moderate']
                    },
                    {
                        method: 'GET',
                        path: '/rooms',
                        handler: this.getRooms.bind(this),
                        middleware: ['auth'],
                        permissions: ['plugin:real-time-chat:read']
                    },
                    {
                        method: 'POST',
                        path: '/rooms',
                        handler: this.createRoom.bind(this),
                        middleware: ['auth'],
                        permissions: ['plugin:real-time-chat:admin']
                    },
                    {
                        method: 'POST',
                        path: '/upload',
                        handler: this.uploadFile.bind(this),
                        middleware: ['auth', 'fileUpload'],
                        permissions: ['plugin:real-time-chat:write']
                    },
                    {
                        method: 'GET',
                        path: '/stats',
                        handler: this.getStats.bind(this),
                        middleware: ['auth'],
                        permissions: ['plugin:real-time-chat:read']
                    }
                ],
                websocket: [
                    {
                        event: 'join',
                        handler: this.handleWebSocketJoin.bind(this),
                        permissions: ['plugin:real-time-chat:read']
                    },
                    {
                        event: 'leave',
                        handler: this.handleWebSocketLeave.bind(this),
                        permissions: ['plugin:real-time-chat:read']
                    },
                    {
                        event: 'message',
                        handler: this.handleWebSocketMessage.bind(this),
                        permissions: ['plugin:real-time-chat:write']
                    },
                    {
                        event: 'typing',
                        handler: this.handleWebSocketTyping.bind(this),
                        permissions: ['plugin:real-time-chat:read']
                    }
                ],
                middleware: [
                    {
                        name: 'auth',
                        handler: this.authenticateUser.bind(this)
                    },
                    {
                        name: 'rateLimit',
                        handler: this.rateLimitMessages.bind(this)
                    },
                    {
                        name: 'fileUpload',
                        handler: this.validateFileUpload.bind(this)
                    }
                ],
                rateLimit: {
                    windowMs: 60000, // 1 minute
                    max: 30 // 30 messages per minute
                }
            }
        });
        
        // Chat-specific properties
        this.rooms = new Map();
        this.onlineUsers = new Map();
        this.messageHistory = new Map();
        this.typingUsers = new Map();
        this.fileUploads = new Map();
        
        // WebSocket server reference
        this.io = null;
    }
    
    // ============================================================================
    // LIFECYCLE METHODS
    // ============================================================================
    
    /**
     * Plugin initialization
     */
    async onInit(context) {
        this.log('info', 'Initializing Real-Time Chat Plugin');
        
        // Initialize WebSocket server
        if (context.io) {
            this.io = context.io;
            this.setupWebSocketHandlers();
        }
        
        // Create default room
        await this.createDefaultRoom();
        
        // Start cleanup task
        this.startCleanupTask();
        
        this.log('info', 'Real-Time Chat Plugin initialized successfully');
    }
    
    /**
     * Plugin enable
     */
    async onEnable() {
        this.log('info', 'Enabling Real-Time Chat Plugin');
        
        // Start WebSocket server if not already running
        if (!this.io && this.app) {
            const { Server } = require('socket.io');
            this.io = new Server(this.app);
            this.setupWebSocketHandlers();
        }
        
        this.log('info', 'Real-Time Chat Plugin enabled');
    }
    
    /**
     * Plugin disable
     */
    async onDisable() {
        this.log('info', 'Disabling Real-Time Chat Plugin');
        
        // Disconnect all users
        if (this.io) {
            this.io.disconnectSockets();
        }
        
        // Clear data
        this.onlineUsers.clear();
        this.typingUsers.clear();
        
        this.log('info', 'Real-Time Chat Plugin disabled');
    }
    
    /**
     * Plugin uninstall
     */
    async onUninstall() {
        this.log('info', 'Uninstalling Real-Time Chat Plugin');
        
        // Clean up database tables
        await this.cleanupDatabase();
        
        // Remove uploaded files
        await this.cleanupFiles();
        
        this.log('info', 'Real-Time Chat Plugin uninstalled');
    }
    
    // ============================================================================
    // DATABASE METHODS
    // ============================================================================
    
    /**
     * Initialize database tables
     */
    async initializeDatabase() {
        if (!this.database) return;
        
        try {
            // Messages table
            await this.database.run(`
                CREATE TABLE IF NOT EXISTS chat_messages (
                    id TEXT PRIMARY KEY,
                    room_id TEXT NOT NULL,
                    user_id TEXT NOT NULL,
                    user_name TEXT NOT NULL,
                    user_avatar TEXT,
                    content TEXT NOT NULL,
                    message_type TEXT DEFAULT 'text',
                    file_data TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);
            
            // Rooms table
            await this.database.run(`
                CREATE TABLE IF NOT EXISTS chat_rooms (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    description TEXT,
                    is_private BOOLEAN DEFAULT 0,
                    created_by TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);
            
            // Room members table
            await this.database.run(`
                CREATE TABLE IF NOT EXISTS chat_room_members (
                    room_id TEXT NOT NULL,
                    user_id TEXT NOT NULL,
                    role TEXT DEFAULT 'member',
                    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (room_id, user_id),
                    FOREIGN KEY (room_id) REFERENCES chat_rooms (id)
                )
            `);
            
            // Create indexes
            await this.database.run(`
                CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id 
                ON chat_messages(room_id)
            `);
            
            await this.database.run(`
                CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at 
                ON chat_messages(created_at)
            `);
            
            this.log('info', 'Database tables initialized');
        } catch (error) {
            this.error('Failed to initialize database', error);
        }
    }
    
    /**
     * Clean up database
     */
    async cleanupDatabase() {
        if (!this.database) return;
        
        try {
            await this.database.run('DROP TABLE IF EXISTS chat_messages');
            await this.database.run('DROP TABLE IF EXISTS chat_room_members');
            await this.database.run('DROP TABLE IF EXISTS chat_rooms');
            
            this.log('info', 'Database tables cleaned up');
        } catch (error) {
            this.error('Failed to cleanup database', error);
        }
    }
    
    // ============================================================================
    // HOOK HANDLERS
    // ============================================================================
    
    /**
     * Handle incoming requests
     */
    async handleRequest(req, res, next) {
        // Add chat-specific headers
        res.set('X-Chat-Plugin', 'real-time-chat');
        
        // Log request
        this.metrics.requestCount++;
        
        next();
    }
    
    /**
     * Handle user joining
     */
    async handleUserJoin(user, roomId = 'default') {
        try {
            // Add user to online users
            this.onlineUsers.set(user.id, {
                id: user.id,
                name: user.name,
                avatar: user.avatar,
                roomId: roomId,
                joinedAt: new Date()
            });
            
            // Join room
            await this.joinRoom(user.id, roomId);
            
            // Broadcast user joined
            this.broadcastToRoom(roomId, 'userJoined', {
                user: {
                    id: user.id,
                    name: user.name,
                    avatar: user.avatar
                },
                roomId: roomId
            });
            
            this.log('info', `User ${user.name} joined room ${roomId}`);
        } catch (error) {
            this.error('Failed to handle user join', error);
        }
    }
    
    /**
     * Handle user leaving
     */
    async handleUserLeave(user, roomId = 'default') {
        try {
            // Remove user from online users
            this.onlineUsers.delete(user.id);
            
            // Leave room
            await this.leaveRoom(user.id, roomId);
            
            // Broadcast user left
            this.broadcastToRoom(roomId, 'userLeft', {
                user: {
                    id: user.id,
                    name: user.name
                },
                roomId: roomId
            });
            
            this.log('info', `User ${user.name} left room ${roomId}`);
        } catch (error) {
            this.error('Failed to handle user leave', error);
        }
    }
    
    /**
     * Handle message
     */
    async handleMessage(message) {
        try {
            // Validate message
            if (!this.validateMessage(message)) {
                return false;
            }
            
            // Save message to database
            await this.saveMessage(message);
            
            // Broadcast message
            this.broadcastToRoom(message.roomId, 'message', message);
            
            // Update metrics
            this.metrics.requestCount++;
            
            this.log('debug', `Message processed: ${message.id}`);
            return true;
        } catch (error) {
            this.error('Failed to handle message', error);
            return false;
        }
    }
    
    /**
     * Handle file upload
     */
    async handleFileUpload(file, user) {
        try {
            // Validate file
            if (!this.validateFile(file)) {
                return false;
            }
            
            // Save file
            const fileData = await this.saveFile(file, user);
            
            // Create file message
            const message = {
                id: uuidv4(),
                roomId: 'default',
                userId: user.id,
                userName: user.name,
                userAvatar: user.avatar,
                content: `Uploaded: ${file.originalname}`,
                messageType: 'file',
                fileData: fileData,
                createdAt: new Date()
            };
            
            // Save message
            await this.saveMessage(message);
            
            // Broadcast file message
            this.broadcastToRoom(message.roomId, 'message', message);
            
            this.log('info', `File uploaded: ${file.originalname}`);
            return true;
        } catch (error) {
            this.error('Failed to handle file upload', error);
            return false;
        }
    }
    
    // ============================================================================
    // API HANDLERS
    // ============================================================================
    
    /**
     * Get messages
     */
    async getMessages(req, res) {
        try {
            const { roomId = 'default', limit = 50, offset = 0 } = req.query;
            
            // Check permissions
            if (!this.hasPermission(req.user, 'plugin:real-time-chat:read')) {
                return res.status(403).json({ error: 'Insufficient permissions' });
            }
            
            // Get messages from database
            const messages = await this.getMessagesFromDatabase(roomId, limit, offset);
            
            res.json({
                success: true,
                data: messages,
                pagination: {
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    total: await this.getMessageCount(roomId)
                }
            });
        } catch (error) {
            this.error('Failed to get messages', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    
    /**
     * Create message
     */
    async createMessage(req, res) {
        try {
            const { content, roomId = 'default', messageType = 'text' } = req.body;
            
            // Check permissions
            if (!this.hasPermission(req.user, 'plugin:real-time-chat:write')) {
                return res.status(403).json({ error: 'Insufficient permissions' });
            }
            
            // Validate message
            if (!content || content.length > this.getSetting('max_message_length')) {
                return res.status(400).json({ error: 'Invalid message content' });
            }
            
            // Create message
            const message = {
                id: uuidv4(),
                roomId: roomId,
                userId: req.user.id,
                userName: req.user.name,
                userAvatar: req.user.avatar,
                content: content,
                messageType: messageType,
                createdAt: new Date()
            };
            
            // Save message
            await this.saveMessage(message);
            
            // Broadcast message
            this.broadcastToRoom(roomId, 'message', message);
            
            res.status(201).json({
                success: true,
                data: message
            });
        } catch (error) {
            this.error('Failed to create message', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    
    /**
     * Delete message
     */
    async deleteMessage(req, res) {
        try {
            const { id } = req.params;
            
            // Check permissions
            if (!this.hasPermission(req.user, 'plugin:real-time-chat:moderate')) {
                return res.status(403).json({ error: 'Insufficient permissions' });
            }
            
            // Delete message
            await this.deleteMessageFromDatabase(id);
            
            // Broadcast message deleted
            this.broadcastToAll('messageDeleted', { id });
            
            res.json({
                success: true,
                message: 'Message deleted successfully'
            });
        } catch (error) {
            this.error('Failed to delete message', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    
    /**
     * Get rooms
     */
    async getRooms(req, res) {
        try {
            // Check permissions
            if (!this.hasPermission(req.user, 'plugin:real-time-chat:read')) {
                return res.status(403).json({ error: 'Insufficient permissions' });
            }
            
            // Get rooms from database
            const rooms = await this.getRoomsFromDatabase();
            
            res.json({
                success: true,
                data: rooms
            });
        } catch (error) {
            this.error('Failed to get rooms', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    
    /**
     * Create room
     */
    async createRoom(req, res) {
        try {
            const { name, description, isPrivate = false } = req.body;
            
            // Check permissions
            if (!this.hasPermission(req.user, 'plugin:real-time-chat:admin')) {
                return res.status(403).json({ error: 'Insufficient permissions' });
            }
            
            // Validate room data
            if (!name || name.length > 100) {
                return res.status(400).json({ error: 'Invalid room name' });
            }
            
            // Create room
            const room = {
                id: uuidv4(),
                name: name,
                description: description,
                isPrivate: isPrivate,
                createdBy: req.user.id,
                createdAt: new Date()
            };
            
            // Save room
            await this.saveRoom(room);
            
            res.status(201).json({
                success: true,
                data: room
            });
        } catch (error) {
            this.error('Failed to create room', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    
    /**
     * Upload file
     */
    async uploadFile(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }
            
            // Check permissions
            if (!this.hasPermission(req.user, 'plugin:real-time-chat:write')) {
                return res.status(403).json({ error: 'Insufficient permissions' });
            }
            
            // Handle file upload
            const success = await this.handleFileUpload(req.file, req.user);
            
            if (success) {
                res.json({
                    success: true,
                    message: 'File uploaded successfully'
                });
            } else {
                res.status(400).json({ error: 'File upload failed' });
            }
        } catch (error) {
            this.error('Failed to upload file', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    
    /**
     * Get stats
     */
    async getStats(req, res) {
        try {
            // Check permissions
            if (!this.hasPermission(req.user, 'plugin:real-time-chat:read')) {
                return res.status(403).json({ error: 'Insufficient permissions' });
            }
            
            // Get statistics
            const stats = await this.getChatStats();
            
            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            this.error('Failed to get stats', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    
    // ============================================================================
    // WEB SOCKET HANDLERS
    // ============================================================================
    
    /**
     * Setup WebSocket handlers
     */
    setupWebSocketHandlers() {
        if (!this.io) return;
        
        this.io.on('connection', (socket) => {
            this.log('info', `WebSocket connected: ${socket.id}`);
            
            // Handle join
            socket.on('join', (data) => {
                this.handleWebSocketJoin(socket, data);
            });
            
            // Handle leave
            socket.on('leave', (data) => {
                this.handleWebSocketLeave(socket, data);
            });
            
            // Handle message
            socket.on('message', (data) => {
                this.handleWebSocketMessage(socket, data);
            });
            
            // Handle typing
            socket.on('typing', (data) => {
                this.handleWebSocketTyping(socket, data);
            });
            
            // Handle disconnect
            socket.on('disconnect', () => {
                this.handleWebSocketDisconnect(socket);
            });
        });
    }
    
    /**
     * Handle WebSocket join
     */
    async handleWebSocketJoin(socket, data) {
        try {
            const { user, roomId = 'default' } = data;
            
            // Validate user
            if (!user || !user.id) {
                socket.emit('error', { message: 'Invalid user data' });
                return;
            }
            
            // Join room
            socket.join(roomId);
            socket.user = user;
            socket.roomId = roomId;
            
            // Handle user join
            await this.handleUserJoin(user, roomId);
            
            // Send room data
            const roomData = await this.getRoomData(roomId);
            socket.emit('roomJoined', roomData);
            
        } catch (error) {
            this.error('WebSocket join error', error);
            socket.emit('error', { message: 'Failed to join room' });
        }
    }
    
    /**
     * Handle WebSocket leave
     */
    async handleWebSocketLeave(socket, data) {
        try {
            const { roomId = 'default' } = data;
            
            // Leave room
            socket.leave(roomId);
            
            // Handle user leave
            if (socket.user) {
                await this.handleUserLeave(socket.user, roomId);
            }
            
            socket.emit('roomLeft', { roomId });
            
        } catch (error) {
            this.error('WebSocket leave error', error);
            socket.emit('error', { message: 'Failed to leave room' });
        }
    }
    
    /**
     * Handle WebSocket message
     */
    async handleWebSocketMessage(socket, data) {
        try {
            const { content, roomId = 'default', messageType = 'text' } = data;
            
            // Validate user
            if (!socket.user) {
                socket.emit('error', { message: 'Unauthorized' });
                return;
            }
            
            // Create message
            const message = {
                id: uuidv4(),
                roomId: roomId,
                userId: socket.user.id,
                userName: socket.user.name,
                userAvatar: socket.user.avatar,
                content: content,
                messageType: messageType,
                createdAt: new Date()
            };
            
            // Handle message
            const success = await this.handleMessage(message);
            
            if (success) {
                socket.emit('messageSent', { id: message.id });
            } else {
                socket.emit('error', { message: 'Failed to send message' });
            }
            
        } catch (error) {
            this.error('WebSocket message error', error);
            socket.emit('error', { message: 'Internal error' });
        }
    }
    
    /**
     * Handle WebSocket typing
     */
    async handleWebSocketTyping(socket, data) {
        try {
            const { isTyping, roomId = 'default' } = data;
            
            // Validate user
            if (!socket.user) {
                return;
            }
            
            // Update typing status
            if (isTyping) {
                this.typingUsers.set(socket.user.id, {
                    user: socket.user,
                    roomId: roomId,
                    startedAt: new Date()
                });
            } else {
                this.typingUsers.delete(socket.user.id);
            }
            
            // Broadcast typing status
            socket.to(roomId).emit('typing', {
                user: socket.user,
                isTyping: isTyping,
                roomId: roomId
            });
            
        } catch (error) {
            this.error('WebSocket typing error', error);
        }
    }
    
    /**
     * Handle WebSocket disconnect
     */
    async handleWebSocketDisconnect(socket) {
        try {
            this.log('info', `WebSocket disconnected: ${socket.id}`);
            
            // Handle user leave
            if (socket.user && socket.roomId) {
                await this.handleUserLeave(socket.user, socket.roomId);
            }
            
        } catch (error) {
            this.error('WebSocket disconnect error', error);
        }
    }
    
    // ============================================================================
    // MIDDLEWARE
    // ============================================================================
    
    /**
     * Authenticate user
     */
    authenticateUser(req, res, next) {
        // This would integrate with your existing auth system
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        next();
    }
    
    /**
     * Rate limit messages
     */
    rateLimitMessages(req, res, next) {
        // Simple rate limiting - in production, use a proper rate limiting library
        const userKey = `rate_limit:${req.user.id}`;
        const current = this.cache?.get(userKey) || 0;
        
        if (current >= this.api.rateLimit.max) {
            return res.status(429).json({ error: 'Rate limit exceeded' });
        }
        
        this.cache?.set(userKey, current + 1, this.api.rateLimit.windowMs / 1000);
        next();
    }
    
    /**
     * Validate file upload
     */
    validateFileUpload(req, res, next) {
        // File upload validation would be handled by multer middleware
        next();
    }
    
    // ============================================================================
    // UTILITY METHODS
    // ============================================================================
    
    /**
     * Create default room
     */
    async createDefaultRoom() {
        try {
            const defaultRoom = {
                id: 'default',
                name: 'General',
                description: 'General chat room',
                isPrivate: false,
                createdBy: 'system',
                createdAt: new Date()
            };
            
            await this.saveRoom(defaultRoom);
            this.rooms.set('default', defaultRoom);
            
            this.log('info', 'Default room created');
        } catch (error) {
            this.error('Failed to create default room', error);
        }
    }
    
    /**
     * Start cleanup task
     */
    startCleanupTask() {
        // Clean up old messages and files every hour
        setInterval(async () => {
            try {
                await this.cleanupOldData();
            } catch (error) {
                this.error('Cleanup task error', error);
            }
        }, 60 * 60 * 1000); // 1 hour
    }
    
    /**
     * Clean up old data
     */
    async cleanupOldData() {
        try {
            if (this.getSetting('auto_delete_messages')) {
                const retentionDays = this.getSetting('message_retention_days');
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
                
                await this.deleteOldMessages(cutoffDate);
            }
            
            this.log('debug', 'Cleanup task completed');
        } catch (error) {
            this.error('Cleanup error', error);
        }
    }
    
    /**
     * Broadcast to room
     */
    broadcastToRoom(roomId, event, data) {
        if (this.io) {
            this.io.to(roomId).emit(event, data);
        }
    }
    
    /**
     * Broadcast to all
     */
    broadcastToAll(event, data) {
        if (this.io) {
            this.io.emit(event, data);
        }
    }
    
    /**
     * Validate message
     */
    validateMessage(message) {
        if (!message.content || message.content.length > this.getSetting('max_message_length')) {
            return false;
        }
        return true;
    }
    
    /**
     * Validate file
     */
    validateFile(file) {
        if (!this.getSetting('file_upload_enabled')) {
            return false;
        }
        
        if (file.size > this.getSetting('max_file_size')) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Check permission
     */
    hasPermission(user, permission) {
        return user.permissions && user.permissions.includes(permission);
    }
    
    // ============================================================================
    // DATABASE OPERATIONS
    // ============================================================================
    
    async saveMessage(message) {
        if (!this.database) return;
        
        await this.database.run(`
            INSERT INTO chat_messages (id, room_id, user_id, user_name, user_avatar, content, message_type, file_data, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            message.id,
            message.roomId,
            message.userId,
            message.userName,
            message.userAvatar,
            message.content,
            message.messageType,
            message.fileData ? JSON.stringify(message.fileData) : null,
            message.createdAt.toISOString()
        ]);
    }
    
    async getMessagesFromDatabase(roomId, limit, offset) {
        if (!this.database) return [];
        
        const messages = await this.database.all(`
            SELECT * FROM chat_messages 
            WHERE room_id = ? 
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
        `, [roomId, limit, offset]);
        
        return messages.reverse();
    }
    
    async getMessageCount(roomId) {
        if (!this.database) return 0;
        
        const result = await this.database.get(`
            SELECT COUNT(*) as count FROM chat_messages WHERE room_id = ?
        `, [roomId]);
        
        return result.count;
    }
    
    async deleteMessageFromDatabase(id) {
        if (!this.database) return;
        
        await this.database.run(`
            DELETE FROM chat_messages WHERE id = ?
        `, [id]);
    }
    
    async saveRoom(room) {
        if (!this.database) return;
        
        await this.database.run(`
            INSERT OR REPLACE INTO chat_rooms (id, name, description, is_private, created_by, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            room.id,
            room.name,
            room.description,
            room.isPrivate ? 1 : 0,
            room.createdBy,
            room.createdAt.toISOString()
        ]);
    }
    
    async getRoomsFromDatabase() {
        if (!this.database) return [];
        
        return await this.database.all(`
            SELECT * FROM chat_rooms ORDER BY created_at ASC
        `);
    }
    
    async getRoomData(roomId) {
        if (!this.database) return null;
        
        return await this.database.get(`
            SELECT * FROM chat_rooms WHERE id = ?
        `, [roomId]);
    }
    
    async deleteOldMessages(cutoffDate) {
        if (!this.database) return;
        
        await this.database.run(`
            DELETE FROM chat_messages WHERE created_at < ?
        `, [cutoffDate.toISOString()]);
    }
    
    async getChatStats() {
        if (!this.database) return {};
        
        const messageCount = await this.database.get(`
            SELECT COUNT(*) as count FROM chat_messages
        `);
        
        const roomCount = await this.database.get(`
            SELECT COUNT(*) as count FROM chat_rooms
        `);
        
        return {
            totalMessages: messageCount.count,
            totalRooms: roomCount.count,
            onlineUsers: this.onlineUsers.size,
            typingUsers: this.typingUsers.size
        };
    }
    
    // ============================================================================
    // FILE OPERATIONS
    // ============================================================================
    
    async saveFile(file, user) {
        const uploadDir = path.join(this.dataPath, 'uploads');
        await fs.ensureDir(uploadDir);
        
        const fileName = `${uuidv4()}-${file.originalname}`;
        const filePath = path.join(uploadDir, fileName);
        
        await fs.writeFile(filePath, file.buffer);
        
        return {
            id: uuidv4(),
            originalName: file.originalname,
            fileName: fileName,
            filePath: filePath,
            size: file.size,
            mimeType: file.mimetype,
            uploadedBy: user.id,
            uploadedAt: new Date()
        };
    }
    
    async cleanupFiles() {
        const uploadDir = path.join(this.dataPath, 'uploads');
        if (await fs.pathExists(uploadDir)) {
            await fs.remove(uploadDir);
        }
    }
    
    // ============================================================================
    // ROOM OPERATIONS
    // ============================================================================
    
    async joinRoom(userId, roomId) {
        if (!this.database) return;
        
        await this.database.run(`
            INSERT OR REPLACE INTO chat_room_members (room_id, user_id, role, joined_at)
            VALUES (?, ?, ?, ?)
        `, [roomId, userId, 'member', new Date().toISOString()]);
    }
    
    async leaveRoom(userId, roomId) {
        if (!this.database) return;
        
        await this.database.run(`
            DELETE FROM chat_room_members WHERE room_id = ? AND user_id = ?
        `, [roomId, userId]);
    }
}

module.exports = RealTimeChatPlugin;
