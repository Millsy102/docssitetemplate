#!/usr/bin/env node

// Test script to verify environment variables are loaded
const config = require('./src/config/env');

console.log('🔧 Environment Configuration Test');
console.log('================================');

// Test application settings
console.log('\n📱 Application Settings:');
console.log(`NODE_ENV: ${config.NODE_ENV}`);
console.log(`PORT: ${config.PORT}`);
console.log(`HOST: ${config.HOST}`);

// Test authentication
console.log('\n🔐 Authentication:');
console.log(`ADMIN_USERNAME: ${config.ADMIN_USERNAME ? '✅ Set' : '❌ Missing'}`);
console.log(`ADMIN_PASSWORD: ${config.ADMIN_PASSWORD ? '✅ Set' : '❌ Missing'}`);
console.log(`JWT_SECRET: ${config.JWT_SECRET ? '✅ Set' : '❌ Missing'}`);

// Test database
console.log('\n🗄️ Database:');
console.log(`DATABASE_URL: ${config.DATABASE_URL ? '✅ Set' : '❌ Missing'}`);
console.log(`REDIS_URL: ${config.REDIS_URL ? '✅ Set' : '❌ Missing'}`);

// Test OAuth
console.log('\n🔗 OAuth:');
console.log(`GITHUB_CLIENT_ID: ${config.GITHUB_CLIENT_ID ? '✅ Set' : '❌ Missing'}`);
console.log(`GITHUB_CLIENT_SECRET: ${config.GITHUB_CLIENT_SECRET ? '✅ Set' : '❌ Missing'}`);

// Test email
console.log('\n📧 Email:');
console.log(`SMTP_HOST: ${config.SMTP_HOST ? '✅ Set' : '❌ Missing'}`);
console.log(`SMTP_USER: ${config.SMTP_USER ? '✅ Set' : '❌ Missing'}`);
console.log(`SMTP_PASS: ${config.SMTP_PASS ? '✅ Set' : '❌ Missing'}`);

// Test AI
console.log('\n🤖 AI Integration:');
console.log(`OPENAI_API_KEY: ${config.OPENAI_API_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`AI_MODEL: ${config.AI_MODEL}`);

console.log('\n✅ Environment test complete!');
