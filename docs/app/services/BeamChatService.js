const socketIo = require('socket.io');
const beamDatabase = require('../database/BeamDatabase');
const BeamUserService = require('./BeamUserService');
const BeamErrorHandler = require('../utils/BeamErrorHandler');
const { modelsSystem } = require('../../models');

class BeamChatService {
    constructor() {
        this.io = null;
        this.connectedUsers = new Map(); // userId -> socket
        this.userSockets = new Map(); // socketId -> userId
        this.rooms = new Map(); // roomId -> Set of userIds
        this.Message = null;
        this.Room = null;
        this.modelsSystem = null;
        this.initializeModels();
    }

    /**
     * Initialize database models and AI models system
     */
    async initializeModels() {
        try {
            // Initialize database models
            this.initializeDatabaseModels();
            
            // Initialize AI models system
            await this.initializeAIModels();
            
        } catch (error) {
            BeamErrorHandler.logError('Models Initialization Error', error);
        }
    }

    /**
     * Initialize database models
     */
    initializeDatabaseModels() {
        const mongoose = require('mongoose');

        // Message Schema
        const messageSchema = new mongoose.Schema({
            roomId: {
                type: String,
                required: true,
                index: true
            },
            senderId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            content: {
                type: String,
                required: true,
                maxlength: 1000
            },
            messageType: {
                type: String,
                enum: ['text', 'image', 'file', 'system', 'typing'],
                default: 'text'
            },
            metadata: {
                fileName: String,
                fileSize: Number,
                mimeType: String,
                url: String
            },
            isEdited: {
                type: Boolean,
                default: false
            },
            editedAt: Date,
            isDeleted: {
                type: Boolean,
                default: false
            },
            deletedAt: Date,
            readBy: [{
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                readAt: {
                    type: Date,
                    default: Date.now
                }
            }],
            createdAt: {
                type: Date,
                default: Date.now
            }
        });

        // Room Schema
        const roomSchema = new mongoose.Schema({
            name: {
                type: String,
                required: true,
                trim: true
            },
            type: {
                type: String,
                enum: ['direct', 'group', 'channel'],
                default: 'direct'
            },
            description: String,
            avatar: String,
            members: [{
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true
                },
                role: {
                    type: String,
                    enum: ['member', 'moderator', 'admin'],
                    default: 'member'
                },
                joinedAt: {
                    type: Date,
                    default: Date.now
                },
                isActive: {
                    type: Boolean,
                    default: true
                }
            }],
            settings: {
                isPrivate: {
                    type: Boolean,
                    default: false
                },
                allowInvites: {
                    type: Boolean,
                    default: true
                },
                maxMembers: {
                    type: Number,
                    default: 100
                },
                slowMode: {
                    type: Boolean,
                    default: false
                },
                slowModeInterval: {
                    type: Number,
                    default: 5 // seconds
                }
            },
            lastMessage: {
                content: String,
                senderId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                timestamp: Date
            },
            createdAt: {
                type: Date,
                default: Date.now
            },
            updatedAt: {
                type: Date,
                default: Date.now
            }
        });

        this.Message = mongoose.model('Message', messageSchema);
        this.Room = mongoose.model('Room', roomSchema);
    }

    /**
     * Initialize AI models system
     */
    async initializeAIModels() {
        try {
            // Wait for models system to be ready
            let attempts = 0;
            const maxAttempts = 30;
            
            while (!(await modelsSystem.isReady()) && attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                attempts++;
            }
            
            if (await modelsSystem.isReady()) {
                this.modelsSystem = modelsSystem;
                console.log(' AI Models System integrated with Chat Service');
            } else {
                console.warn(' AI Models System not ready, continuing without AI features');
            }
            
        } catch (error) {
            BeamErrorHandler.logError('AI Models Initialization Error', error);
            console.warn(' Continuing without AI models integration');
        }
    }

    /**
     * Initialize Socket.IO
     */
    initializeSocketIO(server) {
        this.io = socketIo(server, {
            cors: {
                origin: process.env.CLIENT_URL || "http://localhost:3000",
                methods: ["GET", "POST"]
            }
        });

        this.setupSocketHandlers();
        console.log(' Chat service initialized with Socket.IO');
    }

    /**
     * Setup Socket.IO event handlers
     */
    setupSocketHandlers() {
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token;
                if (!token) {
                    return next(new Error('Authentication token required'));
                }

                const decoded = BeamUserService.verifyToken(token);
                if (!decoded) {
                    return next(new Error('Invalid token'));
                }

                socket.userId = decoded.userId;
                socket.user = decoded;
                next();
            } catch (error) {
                next(new Error('Authentication failed'));
            }
        });

        this.io.on('connection', (socket) => {
            this.handleConnection(socket);
        });
    }

    /**
     * Handle new socket connection
     */
    handleConnection(socket) {
        const userId = socket.userId;
        const user = socket.user;

        console.log(`User connected: ${user.username} (${userId})`);

        // Store user connection
        this.connectedUsers.set(userId, socket);
        this.userSockets.set(socket.id, userId);

        // Join user's rooms
        this.joinUserRooms(userId);

        // Send user's active rooms
        this.sendUserRooms(socket);

        // Handle disconnection
        socket.on('disconnect', () => {
            this.handleDisconnection(socket);
        });

        // Handle joining room
        socket.on('join_room', (roomId) => {
            this.handleJoinRoom(socket, roomId);
        });

        // Handle leaving room
        socket.on('leave_room', (roomId) => {
            this.handleLeaveRoom(socket, roomId);
        });

        // Handle sending message
        socket.on('send_message', async (data) => {
            await this.handleSendMessage(socket, data);
        });

        // Handle typing indicator
        socket.on('typing', (data) => {
            this.handleTyping(socket, data);
        });

        // Handle stop typing
        socket.on('stop_typing', (data) => {
            this.handleStopTyping(socket, data);
        });

        // Handle message edit
        socket.on('edit_message', async (data) => {
            await this.handleEditMessage(socket, data);
        });

        // Handle message delete
        socket.on('delete_message', async (data) => {
            await this.handleDeleteMessage(socket, data);
        });

        // Handle read receipts
        socket.on('mark_read', async (data) => {
            await this.handleMarkRead(socket, data);
        });

        // Handle file upload
        socket.on('upload_file', async (data) => {
            await this.handleFileUpload(socket, data);
        });

        // Emit user online status
        this.emitUserStatus(userId, 'online');
    }

    /**
     * Handle socket disconnection
     */
    handleDisconnection(socket) {
        const userId = socket.userId;
        const user = socket.user;

        console.log(`User disconnected: ${user.username} (${userId})`);

        // Remove from connected users
        this.connectedUsers.delete(userId);
        this.userSockets.delete(socket.id);

        // Emit user offline status
        this.emitUserStatus(userId, 'offline');
    }

    /**
     * Join user to their rooms
     */
    async joinUserRooms(userId) {
        try {
            const rooms = await this.Room.find({
                'members.userId': userId,
                'members.isActive': true
            });

            for (const room of rooms) {
                const socket = this.connectedUsers.get(userId);
                if (socket) {
                    socket.join(room._id.toString());
                }
            }
        } catch (error) {
            BeamErrorHandler.logError('Join User Rooms Error', error);
        }
    }

    /**
     * Send user's active rooms
     */
    async sendUserRooms(socket) {
        try {
            const rooms = await this.Room.find({
                'members.userId': socket.userId,
                'members.isActive': true
            }).populate('members.userId', 'username email profile.avatar');

            socket.emit('user_rooms', {
                success: true,
                rooms: rooms.map(room => ({
                    id: room._id,
                    name: room.name,
                    type: room.type,
                    description: room.description,
                    avatar: room.avatar,
                    members: room.members,
                    lastMessage: room.lastMessage,
                    unreadCount: 0 // Will be calculated separately
                }))
            });
        } catch (error) {
            BeamErrorHandler.logError('Send User Rooms Error', error);
        }
    }

    /**
     * Handle joining a room
     */
    async handleJoinRoom(socket, roomId) {
        try {
            const room = await this.Room.findById(roomId);
            if (!room) {
                socket.emit('error', { message: 'Room not found' });
                return;
            }

            // Check if user is member
            const isMember = room.members.some(member => 
                member.userId.toString() === socket.userId && member.isActive
            );

            if (!isMember) {
                socket.emit('error', { message: 'Not a member of this room' });
                return;
            }

            socket.join(roomId);
            socket.emit('room_joined', { roomId, room });

            // Notify other members
            socket.to(roomId).emit('user_joined_room', {
                roomId,
                user: {
                    id: socket.userId,
                    username: socket.user.username
                }
            });

        } catch (error) {
            BeamErrorHandler.logError('Join Room Error', error);
            socket.emit('error', { message: 'Failed to join room' });
        }
    }

    /**
     * Handle leaving a room
     */
    async handleLeaveRoom(socket, roomId) {
        try {
            socket.leave(roomId);
            socket.emit('room_left', { roomId });

            // Notify other members
            socket.to(roomId).emit('user_left_room', {
                roomId,
                user: {
                    id: socket.userId,
                    username: socket.user.username
                }
            });

        } catch (error) {
            BeamErrorHandler.logError('Leave Room Error', error);
        }
    }

    /**
     * Handle sending a message
     */
    async handleSendMessage(socket, data) {
        try {
            const { roomId, content, messageType = 'text', metadata = {} } = data;

            // Check for AI commands first
            if (content.startsWith('/ai ') && this.modelsSystem) {
                await this.handleAICommand(socket, roomId, content, metadata);
                return;
            }

            // Check for model commands
            if (content.startsWith('/model ') && this.modelsSystem) {
                await this.handleModelCommand(socket, roomId, content, metadata);
                return;
            }

            // Validate room membership
            const room = await this.Room.findById(roomId);
            if (!room) {
                socket.emit('error', { message: 'Room not found' });
                return;
            }

            const isMember = room.members.some(member => 
                member.userId.toString() === socket.userId && member.isActive
            );

            if (!isMember) {
                socket.emit('error', { message: 'Not a member of this room' });
                return;
            }

            // Check slow mode
            if (room.settings.slowMode) {
                const lastMessage = await this.Message.findOne({
                    senderId: socket.userId,
                    roomId,
                    createdAt: { $gte: new Date(Date.now() - room.settings.slowModeInterval * 1000) }
                });

                if (lastMessage) {
                    socket.emit('error', { 
                        message: `Slow mode enabled. Wait ${room.settings.slowModeInterval} seconds between messages.` 
                    });
                    return;
                }
            }

            // Create message
            const message = new this.Message({
                roomId,
                senderId: socket.userId,
                content,
                messageType,
                metadata
            });

            await message.save();

            // Populate sender info
            await message.populate('senderId', 'username email profile.avatar');

            // Update room's last message
            await this.Room.findByIdAndUpdate(roomId, {
                lastMessage: {
                    content,
                    senderId: socket.userId,
                    timestamp: new Date()
                },
                updatedAt: new Date()
            });

            // Emit message to room
            this.io.to(roomId).emit('new_message', {
                success: true,
                message: {
                    id: message._id,
                    roomId: message.roomId,
                    sender: message.senderId,
                    content: message.content,
                    messageType: message.messageType,
                    metadata: message.metadata,
                    createdAt: message.createdAt
                }
            });

            // Log message
            await this.logAction('info', 'Message sent', 'BeamChatService', socket.userId, {
                roomId,
                messageId: message._id,
                messageType
            });

        } catch (error) {
            BeamErrorHandler.logError('Send Message Error', error);
            socket.emit('error', { message: 'Failed to send message' });
        }
    }

    /**
     * Handle typing indicator
     */
    handleTyping(socket, data) {
        const { roomId } = data;
        socket.to(roomId).emit('user_typing', {
            roomId,
            user: {
                id: socket.userId,
                username: socket.user.username
            }
        });
    }

    /**
     * Handle stop typing
     */
    handleStopTyping(socket, data) {
        const { roomId } = data;
        socket.to(roomId).emit('user_stop_typing', {
            roomId,
            user: {
                id: socket.userId,
                username: socket.user.username
            }
        });
    }

    /**
     * Handle message edit
     */
    async handleEditMessage(socket, data) {
        try {
            const { messageId, content } = data;

            const message = await this.Message.findById(messageId);
            if (!message) {
                socket.emit('error', { message: 'Message not found' });
                return;
            }

            // Check if user is the sender
            if (message.senderId.toString() !== socket.userId) {
                socket.emit('error', { message: 'Cannot edit others\' messages' });
                return;
            }

            // Update message
            message.content = content;
            message.isEdited = true;
            message.editedAt = new Date();
            await message.save();

            // Emit edited message
            this.io.to(message.roomId).emit('message_edited', {
                success: true,
                message: {
                    id: message._id,
                    content: message.content,
                    isEdited: message.isEdited,
                    editedAt: message.editedAt
                }
            });

        } catch (error) {
            BeamErrorHandler.logError('Edit Message Error', error);
            socket.emit('error', { message: 'Failed to edit message' });
        }
    }

    /**
     * Handle message delete
     */
    async handleDeleteMessage(socket, data) {
        try {
            const { messageId } = data;

            const message = await this.Message.findById(messageId);
            if (!message) {
                socket.emit('error', { message: 'Message not found' });
                return;
            }

            // Check if user is the sender or admin
            const room = await this.Room.findById(message.roomId);
            const userRole = room.members.find(member => 
                member.userId.toString() === socket.userId
            )?.role;

            if (message.senderId.toString() !== socket.userId && userRole !== 'admin') {
                socket.emit('error', { message: 'Cannot delete others\' messages' });
                return;
            }

            // Soft delete message
            message.isDeleted = true;
            message.deletedAt = new Date();
            await message.save();

            // Emit deleted message
            this.io.to(message.roomId).emit('message_deleted', {
                success: true,
                messageId: message._id
            });

        } catch (error) {
            BeamErrorHandler.logError('Delete Message Error', error);
            socket.emit('error', { message: 'Failed to delete message' });
        }
    }

    /**
     * Handle mark as read
     */
    async handleMarkRead(socket, data) {
        try {
            const { roomId, messageIds } = data;

            // Mark messages as read
            await this.Message.updateMany(
                {
                    _id: { $in: messageIds },
                    roomId,
                    'readBy.userId': { $ne: socket.userId }
                },
                {
                    $push: {
                        readBy: {
                            userId: socket.userId,
                            readAt: new Date()
                        }
                    }
                }
            );

            // Emit read receipts
            socket.to(roomId).emit('messages_read', {
                roomId,
                user: {
                    id: socket.userId,
                    username: socket.user.username
                },
                messageIds
            });

        } catch (error) {
            BeamErrorHandler.logError('Mark Read Error', error);
        }
    }

    /**
     * Handle file upload
     */
    async handleFileUpload(socket, data) {
        try {
            const { roomId, file } = data;

            // Validate room membership
            const room = await this.Room.findById(roomId);
            if (!room) {
                socket.emit('error', { message: 'Room not found' });
                return;
            }

            const isMember = room.members.some(member => 
                member.userId.toString() === socket.userId && member.isActive
            );

            if (!isMember) {
                socket.emit('error', { message: 'Not a member of this room' });
                return;
            }

            // Create file message
            const message = new this.Message({
                roomId,
                senderId: socket.userId,
                content: `File: ${file.name}`,
                messageType: 'file',
                metadata: {
                    fileName: file.name,
                    fileSize: file.size,
                    mimeType: file.type,
                    url: file.url
                }
            });

            await message.save();
            await message.populate('senderId', 'username email profile.avatar');

            // Emit file message
            this.io.to(roomId).emit('new_message', {
                success: true,
                message: {
                    id: message._id,
                    roomId: message.roomId,
                    sender: message.senderId,
                    content: message.content,
                    messageType: message.messageType,
                    metadata: message.metadata,
                    createdAt: message.createdAt
                }
            });

        } catch (error) {
            BeamErrorHandler.logError('File Upload Error', error);
            socket.emit('error', { message: 'Failed to upload file' });
        }
    }

    /**
     * Emit user status
     */
    emitUserStatus(userId, status) {
        this.io.emit('user_status', {
            userId,
            status,
            timestamp: new Date()
        });
    }

    /**
     * Get room messages
     */
    async getRoomMessages(roomId, page = 1, limit = 50) {
        try {
            const skip = (page - 1) * limit;
            
            const messages = await this.Message.find({
                roomId,
                isDeleted: false
            })
            .populate('senderId', 'username email profile.avatar')
            .populate('readBy.userId', 'username')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

            const total = await this.Message.countDocuments({
                roomId,
                isDeleted: false
            });

            return {
                messages: messages.reverse(),
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            BeamErrorHandler.logError('Get Room Messages Error', error);
            throw error;
        }
    }

    /**
     * Create room
     */
    async createRoom(roomData, creatorId) {
        try {
            const room = new this.Room({
                name: roomData.name,
                type: roomData.type || 'group',
                description: roomData.description,
                avatar: roomData.avatar,
                members: [
                    {
                        userId: creatorId,
                        role: 'admin'
                    },
                    ...(roomData.members || []).map(member => ({
                        userId: member.userId,
                        role: member.role || 'member'
                    }))
                ]
            });

            await room.save();
            await room.populate('members.userId', 'username email profile.avatar');

            return {
                success: true,
                room
            };
        } catch (error) {
            BeamErrorHandler.logError('Create Room Error', error);
            throw error;
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

    /**
     * Handle AI commands
     */
    async handleAICommand(socket, roomId, content, metadata) {
        try {
            const command = content.substring(4).trim(); // Remove '/ai '
            
            // Send typing indicator
            socket.to(roomId).emit('user_typing', {
                roomId,
                user: {
                    id: 'ai-assistant',
                    username: 'AI Assistant'
                }
            });

            // Process AI command
            const response = await this.modelsSystem.chatWithModel(command, {
                context: 'chat',
                roomId,
                userId: socket.userId
            });

            // Create AI response message
            const aiMessage = new this.Message({
                roomId,
                senderId: 'ai-assistant',
                content: response.response,
                messageType: 'ai',
                metadata: {
                    model: response.model,
                    provider: response.provider,
                    confidence: response.confidence,
                    originalCommand: command
                }
            });

            await aiMessage.save();

            // Emit AI response
            this.io.to(roomId).emit('new_message', {
                success: true,
                message: {
                    id: aiMessage._id,
                    roomId: aiMessage.roomId,
                    sender: {
                        id: 'ai-assistant',
                        username: 'AI Assistant',
                        profile: { avatar: '/ai-avatar.png' }
                    },
                    content: aiMessage.content,
                    messageType: aiMessage.messageType,
                    metadata: aiMessage.metadata,
                    createdAt: aiMessage.createdAt
                }
            });

            // Stop typing indicator
            socket.to(roomId).emit('stop_typing', {
                roomId,
                user: {
                    id: 'ai-assistant',
                    username: 'AI Assistant'
                }
            });

        } catch (error) {
            BeamErrorHandler.logError('AI Command Error', error);
            socket.emit('error', { message: 'AI command failed: ' + error.message });
        }
    }

    /**
     * Handle model commands
     */
    async handleModelCommand(socket, roomId, content, metadata) {
        try {
            const command = content.substring(7).trim(); // Remove '/model '
            const parts = command.split(' ');
            const action = parts[0];
            const args = parts.slice(1);

            let response;

            switch (action.toLowerCase()) {
                case 'search':
                    const query = args.join(' ');
                    const models = await this.modelsSystem.searchModels(query);
                    response = `Found ${models.length} models:\n${models.slice(0, 5).map(m => `- ${m.id} (${m.provider})`).join('\n')}`;
                    break;

                case 'download':
                    const modelId = args[0];
                    const provider = args[1] || 'huggingface';
                    const result = await this.modelsSystem.downloadModel(modelId, provider);
                    response = result.success ? 
                        ` Model '${modelId}' downloaded successfully` : 
                        ` Failed to download model: ${result.error}`;
                    break;

                case 'recommend':
                    const purpose = args.join(' ') || 'text-generation';
                    const recommendations = await this.modelsSystem.getRecommendations(purpose);
                    response = `Top recommendations for ${purpose}:\n${recommendations.map(r => 
                        `${r.rank}. ${r.model.id} (${r.model.provider}) - ${r.reason}`
                    ).join('\n')}`;
                    break;

                case 'stats':
                    const stats = await this.modelsSystem.getSystemStats();
                    response = `System Stats:\n- Loaded Models: ${stats.modelManager.loadedModels}\n- Cache Size: ${this.formatBytes(stats.cache.totalSize)}\n- AI Agent Tasks: ${stats.aiAgent.taskHistory}`;
                    break;

                default:
                    response = `Available model commands:\n- /model search <query>\n- /model download <modelId> [provider]\n- /model recommend <purpose>\n- /model stats`;
            }

            // Send response as system message
            const systemMessage = new this.Message({
                roomId,
                senderId: 'system',
                content: response,
                messageType: 'system',
                metadata: { command: action, args }
            });

            await systemMessage.save();

            this.io.to(roomId).emit('new_message', {
                success: true,
                message: {
                    id: systemMessage._id,
                    roomId: systemMessage.roomId,
                    sender: {
                        id: 'system',
                        username: 'System',
                        profile: { avatar: '/system-avatar.png' }
                    },
                    content: systemMessage.content,
                    messageType: systemMessage.messageType,
                    metadata: systemMessage.metadata,
                    createdAt: systemMessage.createdAt
                }
            });

        } catch (error) {
            BeamErrorHandler.logError('Model Command Error', error);
            socket.emit('error', { message: 'Model command failed: ' + error.message });
        }
    }

    /**
     * Format bytes to human readable format
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

module.exports = new BeamChatService();
