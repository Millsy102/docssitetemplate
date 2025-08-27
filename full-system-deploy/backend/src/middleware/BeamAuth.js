const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const rateLimit = require('express-rate-limit');
const Redis = require('ioredis');

/**
 * BeamAuth - Comprehensive Authentication Middleware
 * Provides JWT authentication, role-based access control, and security features
 */
class BeamAuth {
    constructor() {
        this.jwtSecret = process.env.JWT_SECRET || 'beamflow-super-secret-jwt-key-change-in-production';
        this.bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        this.tokenExpiry = process.env.JWT_EXPIRES_IN || '24h';
        this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
        
        this.redis = null;
        this.initializeRedis();
        this.setupPassport();
        this.setupRateLimiters();
    }

    /**
     * Initialize Redis connection for token blacklisting and rate limiting
     */
    initializeRedis() {
        try {
            if (process.env.REDIS_URI) {
                this.redis = new Redis(process.env.REDIS_URI, {
                    retryDelayOnFailover: 100,
                    maxRetriesPerRequest: 3,
                    lazyConnect: true
                });

                this.redis.on('error', (err) => {
                    console.warn('Redis connection failed, using memory storage:', err.message);
                    this.redis = null;
                });

                this.redis.on('connect', () => {
                    console.log('Redis connected for authentication');
                });
            }
        } catch (error) {
            console.warn('Redis initialization failed, using memory storage:', error.message);
            this.redis = null;
        }
    }

    /**
     * Setup Passport.js JWT strategy
     */
    setupPassport() {
        const jwtOptions = {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: this.jwtSecret,
            passReqToCallback: true
        };

        passport.use(new JwtStrategy(jwtOptions, async (req, payload, done) => {
            try {
                // Check if token is blacklisted
                if (await this.isTokenBlacklisted(payload.jti)) {
                    return done(null, false);
                }

                // Add user info to request
                req.user = payload;
                return done(null, payload);
            } catch (error) {
                return done(error, false);
            }
        }));
    }

    /**
     * Setup rate limiters for authentication endpoints
     */
    setupRateLimiters() {
        // Login rate limiter
        this.loginLimiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 5, // 5 login attempts per 15 minutes
            message: {
                error: 'Too many login attempts. Please try again later.',
                retryAfter: '15 minutes'
            },
            standardHeaders: true,
            legacyHeaders: false,
            store: this.redis ? new (require('rate-limit-redis'))({
                sendCommand: (...args) => this.redis.call(...args),
            }) : undefined,
            keyGenerator: (req) => {
                return `login:${req.ip}`;
            }
        });

        // Token refresh rate limiter
        this.refreshLimiter = rateLimit({
            windowMs: 5 * 60 * 1000, // 5 minutes
            max: 10, // 10 refresh attempts per 5 minutes
            message: {
                error: 'Too many token refresh attempts. Please try again later.',
                retryAfter: '5 minutes'
            },
            standardHeaders: true,
            legacyHeaders: false,
            store: this.redis ? new (require('rate-limit-redis'))({
                sendCommand: (...args) => this.redis.call(...args),
            }) : undefined,
            keyGenerator: (req) => {
                return `refresh:${req.ip}`;
            }
        });
    }

    /**
     * Generate JWT token with additional security features
     */
    generateToken(payload, expiresIn = null) {
        const tokenPayload = {
            ...payload,
            jti: this.generateTokenId(), // JWT ID for blacklisting
            iat: Math.floor(Date.now() / 1000),
            iss: 'beamflow-system', // Issuer
            aud: 'beamflow-users' // Audience
        };

        return jwt.sign(tokenPayload, this.jwtSecret, { 
            expiresIn: expiresIn || this.tokenExpiry 
        });
    }

    /**
     * Generate refresh token
     */
    generateRefreshToken(userId) {
        const refreshPayload = {
            userId,
            type: 'refresh',
            jti: this.generateTokenId(),
            iat: Math.floor(Date.now() / 1000)
        };

        return jwt.sign(refreshPayload, this.jwtSecret, { 
            expiresIn: this.refreshTokenExpiry 
        });
    }

    /**
     * Generate unique token ID
     */
    generateTokenId() {
        return require('crypto').randomBytes(32).toString('hex');
    }

    /**
     * Verify JWT token
     */
    verifyToken(token) {
        try {
            const decoded = jwt.verify(token, this.jwtSecret);
            
            // Check if token is blacklisted
            if (this.isTokenBlacklisted(decoded.jti)) {
                return null;
            }
            
            return decoded;
        } catch (error) {
            return null;
        }
    }

    /**
     * Check if token is blacklisted
     */
    async isTokenBlacklisted(jti) {
        if (!this.redis) {
            return false; // No Redis, assume not blacklisted
        }

        try {
            const blacklisted = await this.redis.get(`blacklist:${jti}`);
            return !!blacklisted;
        } catch (error) {
            console.error('Error checking token blacklist:', error);
            return false;
        }
    }

    /**
     * Blacklist a token
     */
    async blacklistToken(jti, expiresIn = 86400) { // Default 24 hours
        if (!this.redis) {
            return false; // No Redis, can't blacklist
        }

        try {
            await this.redis.setex(`blacklist:${jti}`, expiresIn, '1');
            return true;
        } catch (error) {
            console.error('Error blacklisting token:', error);
            return false;
        }
    }

    /**
     * Hash password using bcrypt
     */
    async hashPassword(password) {
        return await bcrypt.hash(password, this.bcryptRounds);
    }

    /**
     * Compare password with hash
     */
    async comparePassword(password, hash) {
        return await bcrypt.compare(password, hash);
    }

    /**
     * Authenticate user credentials
     */
    async authenticateUser(username, password) {
        // This should be implemented with your user service
        // For now, using environment variables for admin authentication
        const adminUsername = process.env.ADMIN_USERNAME;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (username === adminUsername && password === adminPassword) {
            return {
                id: 'admin',
                username: adminUsername,
                role: 'admin',
                email: process.env.ADMIN_EMAIL || 'admin@beamflow.com'
            };
        }

        return null;
    }

    /**
     * Middleware to authenticate JWT token
     */
    authenticateToken(req, res, next) {
        passport.authenticate('jwt', { session: false }, (err, user, info) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    error: 'Authentication error'
                });
            }

            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid or expired token'
                });
            }

            req.user = user;
            next();
        })(req, res, next);
    }

    /**
     * Middleware to require authentication
     */
    requireAuth(req, res, next) {
        return this.authenticateToken(req, res, next);
    }

    /**
     * Middleware to require admin role
     */
    requireAdmin(req, res, next) {
        this.authenticateToken(req, res, (err) => {
            if (err) return next(err);

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
            }

            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    error: 'Admin access required'
                });
            }

            next();
        });
    }

    /**
     * Middleware to require specific role
     */
    requireRole(role) {
        return (req, res, next) => {
            this.authenticateToken(req, res, (err) => {
                if (err) return next(err);

                if (!req.user) {
                    return res.status(401).json({
                        success: false,
                        error: 'Authentication required'
                    });
                }

                if (req.user.role !== role) {
                    return res.status(403).json({
                        success: false,
                        error: `${role} access required`
                    });
                }

                next();
            });
        };
    }

    /**
     * Middleware to require any of the specified roles
     */
    requireAnyRole(roles) {
        return (req, res, next) => {
            this.authenticateToken(req, res, (err) => {
                if (err) return next(err);

                if (!req.user) {
                    return res.status(401).json({
                        success: false,
                        error: 'Authentication required'
                    });
                }

                if (!roles.includes(req.user.role)) {
                    return res.status(403).json({
                        success: false,
                        error: 'Insufficient permissions'
                    });
                }

                next();
            });
        };
    }

    /**
     * Middleware to require specific permissions
     */
    requirePermission(permission) {
        return (req, res, next) => {
            this.authenticateToken(req, res, (err) => {
                if (err) return next(err);

                if (!req.user) {
                    return res.status(401).json({
                        success: false,
                        error: 'Authentication required'
                    });
                }

                if (!req.user.permissions || !req.user.permissions.includes(permission)) {
                    return res.status(403).json({
                        success: false,
                        error: `Permission '${permission}' required`
                    });
                }

                next();
            });
        };
    }

    /**
     * Middleware to require any of the specified permissions
     */
    requireAnyPermission(permissions) {
        return (req, res, next) => {
            this.authenticateToken(req, res, (err) => {
                if (err) return next(err);

                if (!req.user) {
                    return res.status(401).json({
                        success: false,
                        error: 'Authentication required'
                    });
                }

                const hasPermission = req.user.permissions && 
                    permissions.some(permission => req.user.permissions.includes(permission));

                if (!hasPermission) {
                    return res.status(403).json({
                        success: false,
                        error: 'Insufficient permissions'
                    });
                }

                next();
            });
        };
    }

    /**
     * Optional authentication middleware (doesn't fail if no token)
     */
    optionalAuth(req, res, next) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return next(); // Continue without authentication
        }

        const decoded = this.verifyToken(token);
        if (decoded) {
            req.user = decoded;
        }

        next();
    }

    /**
     * Get login rate limiter
     */
    getLoginLimiter() {
        return this.loginLimiter;
    }

    /**
     * Get refresh rate limiter
     */
    getRefreshLimiter() {
        return this.refreshLimiter;
    }

    /**
     * Logout user by blacklisting token
     */
    async logout(req, res) {
        if (!req.user || !req.user.jti) {
            return res.status(400).json({
                success: false,
                error: 'No valid token to logout'
            });
        }

        const blacklisted = await this.blacklistToken(req.user.jti);
        
        if (blacklisted) {
            return res.json({
                success: true,
                message: 'Successfully logged out'
            });
        } else {
            return res.status(500).json({
                success: false,
                error: 'Failed to logout'
            });
        }
    }

    /**
     * Refresh access token
     */
    async refreshToken(req, res) {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                error: 'Refresh token required'
            });
        }

        try {
            const decoded = jwt.verify(refreshToken, this.jwtSecret);
            
            if (decoded.type !== 'refresh') {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid refresh token'
                });
            }

            // Check if refresh token is blacklisted
            if (await this.isTokenBlacklisted(decoded.jti)) {
                return res.status(401).json({
                    success: false,
                    error: 'Refresh token has been revoked'
                });
            }

            // Generate new access token
            const newToken = this.generateToken({
                userId: decoded.userId,
                role: 'admin', // You might want to fetch this from database
                username: 'admin'
            });

            // Blacklist the old refresh token
            await this.blacklistToken(decoded.jti);

            // Generate new refresh token
            const newRefreshToken = this.generateRefreshToken(decoded.userId);

            return res.json({
                success: true,
                accessToken: newToken,
                refreshToken: newRefreshToken,
                expiresIn: this.tokenExpiry
            });

        } catch (error) {
            return res.status(401).json({
                success: false,
                error: 'Invalid refresh token'
            });
        }
    }

    /**
     * Validate password strength
     */
    validatePassword(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        const errors = [];

        if (password.length < minLength) {
            errors.push(`Password must be at least ${minLength} characters long`);
        }
        if (!hasUpperCase) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if (!hasLowerCase) {
            errors.push('Password must contain at least one lowercase letter');
        }
        if (!hasNumbers) {
            errors.push('Password must contain at least one number');
        }
        if (!hasSpecialChar) {
            errors.push('Password must contain at least one special character');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

module.exports = new BeamAuth();
