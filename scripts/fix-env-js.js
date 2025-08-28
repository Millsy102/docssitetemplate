#!/usr/bin/env node

/**
 * Fix env.js - Replace placeholders with actual environment variables
 * This script updates the env.js file with real values from .env
 */

const fs = require('fs').promises;
const path = require('path');

// Load environment variables from .env
require('dotenv').config();

async function fixEnvJs() {
    try {
        const envJsPath = path.join(__dirname, '..', 'docs', 'env.js');
        const distEnvJsPath = path.join(__dirname, '..', 'dist', 'env.js');
        
        console.log('Fixing env.js with environment variables...');
        
        // Read the env.js file
        let envJsContent = await fs.readFile(envJsPath, 'utf8');
        
        // Replace placeholders with actual environment variables
        const replacements = {
            '___ADMIN_USERNAME___': process.env.ADMIN_USERNAME || 'admin',
            '___ADMIN_PASSWORD___': process.env.ADMIN_PASSWORD || 'secret',
            '___ADMIN_API_KEY___': process.env.ADMIN_API_KEY || 'your-admin-api-key',
            '___SUPABASE_URL___': process.env.SUPABASE_URL || 'https://your-project.supabase.co',
            '___SUPABASE_ANON_KEY___': process.env.SUPABASE_ANON_KEY || 'your-supabase-anon-key',
            '___GOOGLE_OAUTH_CLIENT_ID___': process.env.GOOGLE_OAUTH_CLIENT_ID || 'your-google-client-id',
            '___GITHUB_OAUTH_CLIENT_ID___': process.env.GITHUB_OAUTH_CLIENT_ID || 'your-github-client-id'
        };
        
        // Apply replacements
        Object.entries(replacements).forEach(([placeholder, value]) => {
            envJsContent = envJsContent.replace(new RegExp(placeholder, 'g'), value);
        });
        
        // Write the updated content back to both source and dist
        await fs.writeFile(envJsPath, envJsContent);
        await fs.writeFile(distEnvJsPath, envJsContent);
        
        console.log('✅ env.js updated with environment variables');
        console.log('   Source: docs/env.js');
        console.log('   Dist: dist/env.js');
        
    } catch (error) {
        console.error('❌ Error fixing env.js:', error.message);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    fixEnvJs();
}

module.exports = { fixEnvJs };
