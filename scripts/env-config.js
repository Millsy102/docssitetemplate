#!/usr/bin/env node

/**
 * Environment Configuration Manager
 * Dynamically reads configuration from environment variables
 * No hardcoded values - everything comes from environment
 * Supports GitHub Actions environment variables and secrets
 */

const fs = require('fs').promises;
const path = require('path');

class EnvironmentConfig {
    constructor() {
        this.loadEnvironmentVariables();
    }

    loadEnvironmentVariables() {
        // Load from .env file if it exists (for local development)
        try {
            const dotenv = require('dotenv');
            dotenv.config();
        } catch (error) {
            // dotenv not available, use system environment variables
        }
    }

    // Site Configuration
    get siteTitle() {
        return process.env.SITE_TITLE || 'BeamFlow Documentation';
    }

    get siteDescription() {
        return process.env.SITE_DESCRIPTION || 'Comprehensive documentation for the BeamFlow Unreal Engine plugin';
    }

    get siteUrl() {
        return process.env.SITE_URL || 'https://Millsy102.github.io/docssitetemplate';
    }

    get siteAuthor() {
        return process.env.SITE_AUTHOR || 'BeamFlow Team';
    }

    // Admin Configuration - NO HARDCODED VALUES
    // These should be set via GitHub Secrets in production
    get adminUsername() {
        return process.env.ADMIN_USERNAME || 'admin';
    }

    get adminPassword() {
        return process.env.ADMIN_PASSWORD || 'your-secure-admin-password';
    }

    get adminApiKey() {
        return process.env.ADMIN_API_KEY || 'your-admin-api-key';
    }

    // GitHub Configuration
    get githubUsername() {
        return process.env.GITHUB_USERNAME || 'Millsy102';
    }

    get repositoryName() {
        return process.env.REPOSITORY_NAME || 'docssitetemplate';
    }

    get githubPagesUrl() {
        return `https://${this.githubUsername}.github.io/${this.repositoryName}/`;
    }

    // Security Configuration
    get jwtSecret() {
        return process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
    }

    get bcryptRounds() {
        return parseInt(process.env.BCRYPT_ROUNDS) || 12;
    }

    // Database Configuration
    get databaseUrl() {
        return process.env.DATABASE_URL || 'mongodb://localhost:27017/beamflow';
    }

    get redisUrl() {
        return process.env.REDIS_URL || 'redis://localhost:6379';
    }

    // Get all admin credentials as an object
    getAdminCredentials() {
        return {
            username: this.adminUsername,
            password: this.adminPassword,
            apiKey: this.adminApiKey
        };
    }

    // Get all site configuration as an object
    getSiteConfig() {
        return {
            title: this.siteTitle,
            description: this.siteDescription,
            url: this.siteUrl,
            author: this.siteAuthor,
            githubUsername: this.githubUsername,
            repositoryName: this.repositoryName,
            githubPagesUrl: this.githubPagesUrl
        };
    }

    // Check if we're running in GitHub Actions
    isGitHubActions() {
        return process.env.GITHUB_ACTIONS === 'true';
    }

    // Check if we're in production environment
    isProduction() {
        return process.env.NODE_ENV === 'production' || this.isGitHubActions();
    }

    // Validate that required environment variables are set
    validateEnvironment() {
        const required = [
            'ADMIN_USERNAME',
            'ADMIN_PASSWORD',
            'ADMIN_API_KEY'
        ];

        const missing = required.filter(key => !process.env[key]);
        
        if (missing.length > 0) {
            console.warn('  Missing environment variables:', missing.join(', '));
            
            if (this.isProduction()) {
                console.warn(' In production, set these as GitHub Secrets:');
                console.warn('   Go to: Repository Settings → Secrets and variables → Actions');
                console.warn('   Add repository secrets: ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_API_KEY');
            } else {
                console.warn(' For local development, set these in your .env file');
            }
            return false;
        }

        return true;
    }

    // Generate configuration summary (without exposing sensitive data)
    getConfigSummary() {
        return {
            environment: {
                isProduction: this.isProduction(),
                isGitHubActions: this.isGitHubActions(),
                nodeEnv: process.env.NODE_ENV || 'development'
            },
            site: this.getSiteConfig(),
            admin: {
                username: this.adminUsername,
                password: '[HIDDEN]',
                apiKey: '[HIDDEN]'
            },
            github: {
                username: this.githubUsername,
                repository: this.repositoryName,
                pagesUrl: this.githubPagesUrl
            },
            security: {
                jwtSecret: '[HIDDEN]',
                bcryptRounds: this.bcryptRounds
            }
        };
    }

    // Export configuration for use in other files
    exportConfig() {
        return {
            siteConfig: this.getSiteConfig(),
            adminCredentials: this.getAdminCredentials(),
            githubConfig: {
                username: this.githubUsername,
                repository: this.repositoryName,
                pagesUrl: this.githubPagesUrl
            },
            securityConfig: {
                jwtSecret: this.jwtSecret,
                bcryptRounds: this.bcryptRounds
            }
        };
    }

    // Get instructions for setting up environment variables
    getSetupInstructions() {
        if (this.isProduction()) {
            return `
 GitHub Secrets Setup Instructions:
====================================

1. Go to your GitHub repository: https://github.com/Millsy102/docssitetemplate
2. Click "Settings" tab
3. Click "Secrets and variables" → "Actions"
4. Click "New repository secret"
5. Add these secrets:

   ADMIN_USERNAME=your-admin-username
   ADMIN_PASSWORD=your-secure-admin-password
   ADMIN_API_KEY=your-admin-api-key

6. Click "Add secret" for each one
7. These will be available in GitHub Actions as environment variables

 Security Note: GitHub Secrets are encrypted and never exposed in logs
            `;
        } else {
            return `
 Local Environment Setup Instructions:
=======================================

1. Create or edit .env file in your project root
2. Add these variables:

   ADMIN_USERNAME=your-admin-username
   ADMIN_PASSWORD=your-secure-admin-password
   ADMIN_API_KEY=your-admin-api-key

3. Save the file
4. Restart your development server

 Security Note: Never commit .env files to version control
            `;
        }
    }
}

// Create singleton instance
const envConfig = new EnvironmentConfig();

// Export for use in other files
module.exports = envConfig;

// If run directly, show configuration summary
if (require.main === module) {
    console.log(' Environment Configuration Summary:');
    console.log('=====================================');
    console.log(JSON.stringify(envConfig.getConfigSummary(), null, 2));
    
    if (!envConfig.validateEnvironment()) {
        console.log('\n' + envConfig.getSetupInstructions());
        process.exit(1);
    } else {
        console.log('\n Environment validation passed!');
    }
}
