const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const BeamUserService = require('../services/BeamUserService');

class BeamAuth {
    constructor() {
        this.jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
        this.bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    }

    /**
     * Generate JWT token
     */
    generateToken(payload, expiresIn = '24h') {
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
     * Hash password
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
     * Authenticate user
     */
    async authenticateUser(username, password) {
        return await BeamUserService.authenticateUser(username, password);
    }

    /**
     * Middleware to authenticate JWT token
     */
    authenticateToken(req, res, next) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Access token required'
            });
        }

        const decoded = this.verifyToken(token);
        if (!decoded) {
            return res.status(403).json({
                success: false,
                error: 'Invalid or expired token'
            });
        }

        req.user = decoded;
        next();
    }

    /**
     * Middleware to require authentication
     */
    requireAuth(req, res, next) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const decoded = this.verifyToken(token);
        if (!decoded) {
            return res.status(403).json({
                success: false,
                error: 'Invalid or expired token'
            });
        }

        req.user = decoded;
        next();
    }

    /**
     * Middleware to require admin role
     */
    requireAdmin(req, res, next) {
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
    }

    /**
     * Middleware to require specific role
     */
    requireRole(role) {
        return (req, res, next) => {
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
        };
    }

    /**
     * Middleware to require any of the specified roles
     */
    requireAnyRole(roles) {
        return (req, res, next) => {
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
        };
    }
}

module.exports = new BeamAuth();
