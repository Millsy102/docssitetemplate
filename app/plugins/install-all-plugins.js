#!/usr/bin/env node

/**
 * Install All Plugins Script
 * 
 * This script installs all plugin categories for the BeamFlow system.
 * Run this script to set up the complete plugin ecosystem.
 * 
 * Usage: node install-all-plugins.js
 * 
 * @version 1.0.0
 * @author BeamFlow System
 * @license MIT
 */

const ComprehensivePluginInstaller = require('./installers/ComprehensivePluginInstaller');

async function main() {
    console.log(' BeamFlow Comprehensive Plugin Installation');
    console.log('==============================================');
    console.log('');
    
    try {
        const installer = new ComprehensivePluginInstaller();
        
        // Install all plugins
        await installer.installAllPlugins();
        
        // Get installation summary
        const summary = installer.getInstallationSummary();
        
        console.log('');
        console.log(' Installation Summary:');
        console.log('========================');
        console.log(`Total Plugins Installed: ${summary.total}`);
        console.log('');
        console.log('By Category:');
        
        for (const [category, count] of Object.entries(summary.byCategory)) {
            console.log(`  ${category}: ${count} plugins`);
        }
        
        console.log('');
        console.log(' Installation completed successfully!');
        console.log('');
        console.log('Next Steps:');
        console.log('1. Restart your BeamFlow server');
        console.log('2. Access the admin dashboard to configure plugins');
        console.log('3. Check the installation report for details');
        console.log('');
        console.log(' Installation report saved to: installation-report.json');
        
    } catch (error) {
        console.error(' Installation failed:', error);
        process.exit(1);
    }
}

// Run the installation
if (require.main === module) {
    main();
}

module.exports = main;
