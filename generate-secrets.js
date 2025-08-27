#!/usr/bin/env node

const crypto = require('crypto');

console.log('🔐 BeamFlow Secret Generator');
console.log('============================\n');

// Generate JWT Secret
const jwtSecret = crypto.randomBytes(32).toString('hex');
console.log('JWT_SECRET:');
console.log(jwtSecret);
console.log('');

// Generate Session Secret
const sessionSecret = crypto.randomBytes(16).toString('hex');
console.log('SESSION_SECRET:');
console.log(sessionSecret);
console.log('');

// Generate Admin Password
const adminPassword = crypto.randomBytes(16).toString('hex');
console.log('ADMIN_PASSWORD (suggested):');
console.log(adminPassword);
console.log('');

// Generate FTP Password
const ftpPassword = crypto.randomBytes(12).toString('hex');
console.log('FTP_PASS (suggested):');
console.log(ftpPassword);
console.log('');

console.log('📋 Next Steps:');
console.log('1. Copy these values to your GitHub Secrets');
console.log('2. Set up your database (MongoDB Atlas recommended)');
console.log('3. Create GitHub OAuth app');
console.log('4. Set up email service (Gmail/SendGrid)');
console.log('5. Get OpenAI API key');
console.log('6. Update CORS_ORIGIN with your GitHub Pages URL');
console.log('');

console.log('🔗 Useful Links:');
console.log('- MongoDB Atlas: https://www.mongodb.com/atlas');
console.log('- Redis Cloud: https://redis.com/try-free/');
console.log('- GitHub OAuth: https://github.com/settings/developers');
console.log('- OpenAI API: https://platform.openai.com/');
console.log('- Gmail App Passwords: https://myaccount.google.com/apppasswords');
