const mongoose = require('mongoose');
const redis = require('redis');
const { promisify } = require('util');

class BeamDatabase {
    constructor() {
        this.mongoConnection = null;
        this.redisClient = null;
        this.models = {};
        this.isConnected = false;
        
        // Database configuration
        this.mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/beamflow';
        this.redisUri = process.env.REDIS_URI || 'redis://localhost:6379';
        
        this.initializeModels();
    }

    /**
     * Initialize database connection
     */
    async connect() {
        try {
            console.log(' Connecting to databases...');

            // Connect to MongoDB
            this.mongoConnection = await mongoose.connect(this.mongoUri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });

            console.log(' MongoDB connected successfully');

            // Connect to Redis
            this.redisClient = redis.createClient({
                url: this.redisUri,
                retry_strategy: (options) => {
                    if (options.error && options.error.code === 'ECONNREFUSED') {
                        return new Error('Redis server refused connection');
                    }
                    if (options.total_retry_time > 1000 * 60 * 60) {
                        return new Error('Retry time exhausted');
                    }
                    if (options.attempt > 10) {
                        return undefined;
                    }
                    return Math.min(options.attempt * 100, 3000);
                }
            });

            this.redisClient.on('connect', () => {
                console.log(' Redis connected successfully');
            });

            this.redisClient.on('error', (err) => {
                console.error(' Redis connection error:', err);
            });

            await this.redisClient.connect();
            this.isConnected = true;

            console.log(' All databases connected successfully');
            return true;

        } catch (error) {
            console.error(' Database connection failed:', error);
            throw error;
        }
    }

    /**
     * Initialize all database models
     */
    initializeModels() {
        // User Model
        const userSchema = new mongoose.Schema({
            username: {
                type: String,
                required: true,
                unique: true,
                trim: true,
                minlength: 3,
                maxlength: 30
            },
            email: {
                type: String,
                required: true,
                unique: true,
                lowercase: true,
                trim: true
            },
            password: {
                type: String,
                required: true,
                minlength: 8
            },
            role: {
                type: String,
                enum: ['admin', 'user', 'moderator'],
                default: 'user'
            },
            profile: {
                firstName: String,
                lastName: String,
                avatar: String,
                bio: String,
                location: String,
                website: String
            },
            preferences: {
                theme: { type: String, default: 'light' },
                language: { type: String, default: 'en' },
                notifications: { type: Boolean, default: true },
                twoFactorEnabled: { type: Boolean, default: false }
            },
            status: {
                type: String,
                enum: ['active', 'inactive', 'suspended'],
                default: 'active'
            },
            lastLogin: Date,
            loginAttempts: { type: Number, default: 0 },
            lockUntil: Date,
            createdAt: { type: Date, default: Date.now },
            updatedAt: { type: Date, default: Date.now }
        });

        userSchema.pre('save', function(next) {
            this.updatedAt = new Date();
            next();
        });

        // File Model
        const fileSchema = new mongoose.Schema({
            name: {
                type: String,
                required: true,
                trim: true
            },
            originalName: {
                type: String,
                required: true
            },
            path: {
                type: String,
                required: true
            },
            size: {
                type: Number,
                required: true
            },
            mimeType: {
                type: String,
                required: true
            },
            extension: String,
            owner: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            permissions: {
                public: { type: Boolean, default: false },
                sharedWith: [{
                    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                    permission: { type: String, enum: ['read', 'write', 'admin'], default: 'read' }
                }]
            },
            tags: [String],
            metadata: mongoose.Schema.Types.Mixed,
            version: { type: Number, default: 1 },
            isDeleted: { type: Boolean, default: false },
            createdAt: { type: Date, default: Date.now },
            updatedAt: { type: Date, default: Date.now }
        });

        // Plugin Model
        const pluginSchema = new mongoose.Schema({
            name: {
                type: String,
                required: true,
                unique: true
            },
            version: {
                type: String,
                required: true
            },
            description: String,
            author: String,
            category: {
                type: String,
                required: true
            },
            status: {
                type: String,
                enum: ['active', 'inactive', 'error', 'updating'],
                default: 'inactive'
            },
            config: mongoose.Schema.Types.Mixed,
            dependencies: [String],
            permissions: [String],
            apiEndpoints: [{
                path: String,
                method: String,
                description: String
            }],
            widgets: [{
                name: String,
                description: String,
                config: mongoose.Schema.Types.Mixed
            }],
            installedAt: { type: Date, default: Date.now },
            updatedAt: { type: Date, default: Date.now }
        });

        // Session Model
        const sessionSchema = new mongoose.Schema({
            sessionId: {
                type: String,
                required: true,
                unique: true
            },
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            userAgent: String,
            ipAddress: String,
            expiresAt: {
                type: Date,
                required: true
            },
            isActive: {
                type: Boolean,
                default: true
            },
            createdAt: { type: Date, default: Date.now }
        });

        // Log Model
        const logSchema = new mongoose.Schema({
            level: {
                type: String,
                enum: ['error', 'warn', 'info', 'debug'],
                required: true
            },
            message: {
                type: String,
                required: true
            },
            source: {
                type: String,
                required: true
            },
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            metadata: mongoose.Schema.Types.Mixed,
            timestamp: { type: Date, default: Date.now }
        });

        // Create models
        this.models.User = mongoose.model('User', userSchema);
        this.models.File = mongoose.model('File', fileSchema);
        this.models.Plugin = mongoose.model('Plugin', pluginSchema);
        this.models.Session = mongoose.model('Session', sessionSchema);
        this.models.Log = mongoose.model('Log', logSchema);

        console.log(' Database models initialized');
    }

    /**
     * Get model by name
     */
    getModel(name) {
        return this.models[name];
    }

    /**
     * Redis operations
     */
    async redisGet(key) {
        if (!this.redisClient) return null;
        return await this.redisClient.get(key);
    }

    async redisSet(key, value, ttl = 3600) {
        if (!this.redisClient) return false;
        return await this.redisClient.setEx(key, ttl, value);
    }

    async redisDel(key) {
        if (!this.redisClient) return false;
        return await this.redisClient.del(key);
    }

    async redisExists(key) {
        if (!this.redisClient) return false;
        return await this.redisClient.exists(key);
    }

    /**
     * Health check
     */
    async healthCheck() {
        try {
            const mongoStatus = mongoose.connection.readyState === 1;
            const redisStatus = this.redisClient && this.redisClient.isReady;
            
            return {
                status: mongoStatus && redisStatus ? 'healthy' : 'unhealthy',
                mongo: mongoStatus ? 'connected' : 'disconnected',
                redis: redisStatus ? 'connected' : 'disconnected',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                status: 'error',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Close database connections
     */
    async disconnect() {
        try {
            if (this.mongoConnection) {
                await mongoose.disconnect();
                console.log(' MongoDB disconnected');
            }
            
            if (this.redisClient) {
                await this.redisClient.quit();
                console.log(' Redis disconnected');
            }
            
            this.isConnected = false;
        } catch (error) {
            console.error(' Error disconnecting databases:', error);
        }
    }
}

// Create singleton instance
const beamDatabase = new BeamDatabase();

module.exports = beamDatabase;
