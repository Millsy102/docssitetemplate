#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Vercel deployment...');

// Check if we're in the right directory
if (!fs.existsSync('vercel.json')) {
    console.error('❌ Error: vercel.json not found. Make sure you\'re in the full-system-deploy directory.');
    process.exit(1);
}

try {
    // Set environment variables for the deployment
    process.env.VERCEL_PROJECT_NAME = 'docssitetemplate';
    process.env.VERCEL_SCOPE = 'millsy102';
    
    console.log('📦 Project name: docssitetemplate');
    console.log('👤 Scope: Millsy\'s projects');
    
    // Run the deployment
    console.log('🔄 Deploying to Vercel...');
    execSync('vercel --prod --yes', { 
        stdio: 'inherit',
        env: { ...process.env }
    });
    
    console.log('✅ Deployment completed successfully!');
    
} catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
}
