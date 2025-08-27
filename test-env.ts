#!/usr/bin/env node

// Test script to verify environment variables for static documentation site
import config from './src/config/env';
import { log } from './src/utils/logger';

log.info(' Static Site Environment Configuration Test');
log.info('============================================');

// Test basic application settings
log.info('\n Application Settings:');
log.info(`NODE_ENV: ${config.NODE_ENV}`);
log.info(`PORT: ${config.PORT}`);
log.info(`HOST: ${config.HOST}`);

// Test analytics (relevant for static sites)
log.info('\n Analytics:');
log.info(`GA_MEASUREMENT_ID: ${config.GA_MEASUREMENT_ID ? ' Set' : ' Missing'}`);

// Test GitHub Pages deployment (if applicable)
log.info('\n Deployment:');
log.info(`GH_TOKEN: ${config.GH_TOKEN ? ' Set' : ' Missing'}`);
log.info(`REPOSITORY_NAME: ${config.REPOSITORY_NAME || 'Not set'}`);

// Test site configuration
log.info('\n Site Configuration:');
log.info(`SITE_TITLE: ${config.SITE_TITLE || 'Not set'}`);
log.info(`SITE_DESCRIPTION: ${config.SITE_DESCRIPTION || 'Not set'}`);
log.info(`SITE_URL: ${config.SITE_URL || 'Not set'}`);

// Test build settings
log.info('\n Build Settings:');
log.info(`BUILD_OUTPUT_DIR: ${config.BUILD_OUTPUT_DIR || 'dist'}`);
log.info(`ENABLE_SERVICE_WORKER: ${config.ENABLE_SERVICE_WORKER || 'Not set'}`);

log.info('\n Static site environment test complete!');
log.info('\n Note: Server-only variables (database, OAuth, SMTP, etc.) are not tested');
log.info('   as they are not needed for a static documentation site.');
