const config = require('../config/env');

// Authentication middleware
function authenticateAdmin(username, password) {
    // Get admin credentials from environment variables
    const adminUsername = config.ADMIN_USERNAME;
    const adminPassword = config.ADMIN_PASSWORD;
    
    // Check if credentials match
    if (username === adminUsername && password === adminPassword) {
        return true;
    }
    
    return false;
}

// Generate JWT token
function generateToken(userData) {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
        { 
            username: userData.username,
            role: 'admin',
            iat: Math.floor(Date.now() / 1000)
        },
        config.JWT_SECRET,
        { expiresIn: config.JWT_EXPIRES_IN }
    );
    return token;
}

// Verify JWT token
function verifyToken(token) {
    const jwt = require('jsonwebtoken');
    try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        return decoded;
    } catch (error) {
        return null;
    }
}

module.exports = {
    authenticateAdmin,
    generateToken,
    verifyToken
};
