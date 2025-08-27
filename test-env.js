#!/usr/bin/env node

// Test script to verify environment variables for static documentation site
const config = require('./src/config/env');

console.log('🔧 Static Site Environment Configuration Test');
console.log('============================================');

// Test basic application settings
console.log('\n📱 Application Settings:');
console.log(`NODE_ENV: ${config.NODE_ENV}`);
console.log(`PORT: ${config.PORT}`);
console.log(`HOST: ${config.HOST}`);

// Test analytics (relevant for static sites)
console.log('\n📊 Analytics:');
console.log(`GA_MEASUREMENT_ID: ${config.GA_MEASUREMENT_ID ? '✅ Set' : '❌ Missing'}`);

// Test GitHub Pages deployment (if applicable)
console.log('\n🚀 Deployment:');
console.log(`GITHUB_TOKEN: ${config.GITHUB_TOKEN ? '✅ Set' : '❌ Missing'}`);
console.log(`REPOSITORY_NAME: ${config.REPOSITORY_NAME || 'Not set'}`);

// Test site configuration
console.log('\n⚙️ Site Configuration:');
console.log(`SITE_TITLE: ${config.SITE_TITLE || 'Not set'}`);
console.log(`SITE_DESCRIPTION: ${config.SITE_DESCRIPTION || 'Not set'}`);
console.log(`SITE_URL: ${config.SITE_URL || 'Not set'}`);

// Test build settings
console.log('\n🔨 Build Settings:');
console.log(`BUILD_OUTPUT_DIR: ${config.BUILD_OUTPUT_DIR || 'dist'}`);
console.log(`ENABLE_SERVICE_WORKER: ${config.ENABLE_SERVICE_WORKER || 'Not set'}`);

console.log('\n✅ Static site environment test complete!');
console.log('\n💡 Note: Server-only variables (database, OAuth, SMTP, etc.) are not tested');
console.log('   as they are not needed for a static documentation site.');
