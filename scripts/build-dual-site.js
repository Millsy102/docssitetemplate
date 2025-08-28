#!/usr/bin/env node

const BuildUtils = require('./build-utils');

async function buildDualSite() {
  console.log('🚀 Building dual-site for GitHub Pages...');
  
  const buildUtils = new BuildUtils();
  
  try {
    // Step 1: Build public site
    const publicSuccess = await buildUtils.buildPublicSite();
    if (!publicSuccess) {
      throw new Error('Public site build failed');
    }
    
    // Step 2: Convert backend to static files
    console.log('🔄 Converting backend to static files...');
    const convertBackend = require('./convert-backend-to-static');
    await convertBackend();
    
    // Step 3: Build secondary site
    const secondarySuccess = await buildUtils.buildSecondarySite();
    if (!secondarySuccess) {
      throw new Error('Secondary site build failed');
    }
    
    // Step 4: Compose final output
    const composeSuccess = await buildUtils.composeOutput();
    if (!composeSuccess) {
      throw new Error('Output composition failed');
    }
    
    console.log('🎉 Dual-site build completed successfully!');
    console.log('');
    console.log('📁 Build output:');
    console.log('   Public site: dist/');
    console.log('   Admin site: dist/admin/');
    console.log('   Routing: dist/_redirects');
    console.log('');
    console.log('🔐 Hidden login triggers:');
    console.log('   - Keyboard: Ctrl+Shift+L (3 times)');
    console.log('   - Click: Footer copyright text (3 times)');
    console.log('   - URL: ?debug=true (3 times)');
    console.log('');
    console.log('🌐 URLs:');
    console.log('   Public: https://millsy102.github.io/docssitetemplate/');
    console.log('   Admin: https://millsy102.github.io/docssitetemplate/admin/');
    
  } catch (error) {
    console.error('💥 Dual-site build failed:', error.message);
    process.exit(1);
  }
}

// Run the build if this script is executed directly
if (require.main === module) {
  buildDualSite();
}

module.exports = buildDualSite;
