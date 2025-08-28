const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const beamDatabase = require('../database/BeamDatabase');
const BeamErrorHandler = require('../utils/BeamErrorHandler');

class BeamUserService {
    constructor() {
        this.User = beamDatabase.getModel('User');
        this.Session = beamDatabase.getModel('Session');
        this.Log = beamDatabase.getModel('Log');
        this.jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
        this.bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        this.sessionTimeout = parseInt(process.env.SESSION_TIMEOUT) || 3600000; // 1 hour
    }

    /**
     * Create a new user
     */
    async createUser(userData) {
        try {
            // Validate required fields
            if (!userData.username || !userData.email || !userData.password) {
                throw new Error('Username, email, and password are required');
            }

            // Check if user already exists
            const existingUser = await this.User.findOne({
                $or: [{ username: userData.username }, { email: userData.email }]
            });

            if (existingUser) {
                throw new Error('Username or email already exists');
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(userData.password, this.bcryptRounds);

            // Create user
            const user = new this.User({
                username: userData.username,
                email: userData.email,
                password: hashedPassword,
                role: userData.role || 'user',
                profile: userData.profile || {},
                preferences: userData.preferences || {}
            });

            await user.save();

            // Log user creation
            await this.logAction('info', 'User created', 'BeamUserService', user._id, {
                username: user.username,
                email: user.email,
                role: user.role
            });

            // Return user without password
            const userResponse = user.toObject();
            delete userResponse.password;

            return {
                success: true,
                user: userResponse,
                message: 'User created successfully'
            };

        } catch (error) {
            BeamErrorHandler.logError('User Creation Error', error);
            throw error;
        }
    }

    /**
     * Authenticate user
     */
    async authenticateUser(username, password) {
        try {
            // Find user by username or email
            const user = await this.User.findOne({
                $or: [{ username: username }, { email: username }]
            });

            if (!user) {
                throw new Error('Invalid credentials');
            }

            // Check if account is locked
            if (user.lockUntil && user.lockUntil > Date.now()) {
                throw new Error('Account is temporarily locked');
            }

            // Check if account is active
            if (user.status !== 'active') {
                throw new Error('Account is not active');
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.password);

            if (!isValidPassword) {
                // Increment login attempts
                user.loginAttempts += 1;
                
                // Lock account after 5 failed attempts
                if (user.loginAttempts >= 5) {
                    user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
                }
                
                await user.save();
                throw new Error('Invalid credentials');
            }

            // Reset login attempts on successful login
            user.loginAttempts = 0;
            user.lockUntil = null;
            user.lastLogin = new Date();
            await user.save();

            // Log successful login
            await this.logAction('info', 'User logged in', 'BeamUserService', user._id, {
                username: user.username,
                ipAddress: 'unknown' // Will be set by middleware
            });

            // Return user without password
            const userResponse = user.toObject();
            delete userResponse.password;

            return {
                success: true,
                user: userResponse,
                message: 'Authentication successful'
            };

        } catch (error) {
            BeamErrorHandler.logError('User Authentication Error', error);
            throw error;
        }
    }

    /**
     * Generate JWT token
     */
    generateToken(user, expiresIn = '24h') {
        const payload = {
            userId: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        return jwt.sign(payload, this.jwtSecret, { expiresIn });
    }

    /**
     * Verify JWT token
     */
    verifyToken(token) {
        try {
            return jwt.verify(token, this.jwtSecret);
        } catch (error) {
            return null;
        }
    }

    /**
     * Create user session
     */
    async createSession(userId, userAgent, ipAddress) {
        try {
            const sessionId = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date(Date.now() + this.sessionTimeout);

            const session = new this.Session({
                sessionId,
                userId,
                userAgent,
                ipAddress,
                expiresAt
            });

            await session.save();

            return sessionId;
        } catch (error) {
            BeamErrorHandler.logError('Session Creation Error', error);
            throw error;
        }
    }

    /**
     * Validate session
     */
    async validateSession(sessionId) {
        try {
            const session = await this.Session.findOne({
                sessionId,
                isActive: true,
                expiresAt: { $gt: new Date() }
            });

            if (!session) {
                return null;
            }

            const user = await this.User.findById(session.userId);
            return user;
        } catch (error) {
            BeamErrorHandler.logError('Session Validation Error', error);
            return null;
        }
    }

    /**
     * Invalidate session
     */
    async invalidateSession(sessionId) {
        try {
            await this.Session.updateOne(
                { sessionId },
                { isActive: false }
            );
        } catch (error) {
            BeamErrorHandler.logError('Session Invalidation Error', error);
        }
    }

    /**
     * Get user by ID
     */
    async getUserById(userId) {
        try {
            const user = await this.User.findById(userId).select('-password');
            return user;
        } catch (error) {
            BeamErrorHandler.logError('Get User Error', error);
            throw error;
        }
    }

    /**
     * Get all users with pagination
     */
    async getUsers(page = 1, limit = 10, filters = {}) {
        try {
            const skip = (page - 1) * limit;
            const query = {};

            // Apply filters
            if (filters.role) query.role = filters.role;
            if (filters.status) query.status = filters.status;
            if (filters.search) {
                query.$or = [
                    { username: { $regex: filters.search, $options: 'i' } },
                    { email: { $regex: filters.search, $options: 'i' } }
                ];
            }

            const users = await this.User.find(query)
                .select('-password')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });

            const total = await this.User.countDocuments(query);

            return {
                users,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            BeamErrorHandler.logError('Get Users Error', error);
            throw error;
        }
    }

    /**
     * Update user
     */
    async updateUser(userId, updateData) {
        try {
            const user = await this.User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Don't allow updating password through this method
            delete updateData.password;

            // Update user
            Object.assign(user, updateData);
            await user.save();

            // Log update
            await this.logAction('info', 'User updated', 'BeamUserService', userId, {
                updatedFields: Object.keys(updateData)
            });

            const userResponse = user.toObject();
            delete userResponse.password;

            return {
                success: true,
                user: userResponse,
                message: 'User updated successfully'
            };
        } catch (error) {
            BeamErrorHandler.logError('User Update Error', error);
            throw error;
        }
    }

    /**
     * Change user password
     */
    async changePassword(userId, currentPassword, newPassword) {
        try {
            const user = await this.User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Verify current password
            const isValidPassword = await bcrypt.compare(currentPassword, user.password);
            if (!isValidPassword) {
                throw new Error('Current password is incorrect');
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, this.bcryptRounds);
            user.password = hashedPassword;
            await user.save();

            // Log password change
            await this.logAction('info', 'Password changed', 'BeamUserService', userId);

            return {
                success: true,
                message: 'Password changed successfully'
            };
        } catch (error) {
            BeamErrorHandler.logError('Password Change Error', error);
            throw error;
        }
    }

    /**
     * Reset user password (admin function)
     */
    async resetPassword(userId, newPassword) {
        try {
            const user = await this.User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, this.bcryptRounds);
            user.password = hashedPassword;
            user.loginAttempts = 0;
            user.lockUntil = null;
            await user.save();

            // Log password reset
            await this.logAction('info', 'Password reset by admin', 'BeamUserService', userId);

            return {
                success: true,
                message: 'Password reset successfully'
            };
        } catch (error) {
            BeamErrorHandler.logError('Password Reset Error', error);
            throw error;
        }
    }

    /**
     * Delete user
     */
    async deleteUser(userId) {
        try {
            const user = await this.User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Soft delete - mark as inactive
            user.status = 'inactive';
            await user.save();

            // Invalidate all user sessions
            await this.Session.updateMany(
                { userId },
                { isActive: false }
            );

            // Log user deletion
            await this.logAction('info', 'User deleted', 'BeamUserService', userId, {
                username: user.username,
                email: user.email
            });

            return {
                success: true,
                message: 'User deleted successfully'
            };
        } catch (error) {
            BeamErrorHandler.logError('User Deletion Error', error);
            throw error;
        }
    }

    /**
     * Get user statistics
     */
    async getUserStats() {
        try {
            const stats = await this.User.aggregate([
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        active: {
                            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
                        },
                        inactive: {
                            $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] }
                        },
                        suspended: {
                            $sum: { $cond: [{ $eq: ['$status', 'suspended'] }, 1, 0] }
                        }
                    }
                }
            ]);

            const roleStats = await this.User.aggregate([
                {
                    $group: {
                        _id: '$role',
                        count: { $sum: 1 }
                    }
                }
            ]);

            return {
                total: stats[0]?.total || 0,
                active: stats[0]?.active || 0,
                inactive: stats[0]?.inactive || 0,
                suspended: stats[0]?.suspended || 0,
                byRole: roleStats.reduce((acc, stat) => {
                    acc[stat._id] = stat.count;
                    return acc;
                }, {})
            };
        } catch (error) {
            BeamErrorHandler.logError('User Stats Error', error);
            throw error;
        }
    }

    /**
     * Log action
     */
    async logAction(level, message, source, userId = null, metadata = {}) {
        try {
            const log = new this.Log({
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

module.exports = new BeamUserService();
