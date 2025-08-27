#!/usr/bin/env node

/**
 * Favicon Generator Script
 * 
 * This script generates PNG favicon files from the SVG favicon.
 * It uses a simple approach to create placeholder PNG files.
 * 
 * Usage: node scripts/generate-favicons.js
 */

const fs = require('fs');
const path = require('path');

// SVG content for the favicon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#dc2626;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#991b1b;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="32" height="32" rx="4" fill="#111827"/>
  <path d="M8 8 L24 8 L24 24 L8 24 Z" fill="url(#grad)" stroke="#dc2626" stroke-width="1"/>
  <circle cx="16" cy="16" r="6" fill="#dc2626"/>
  <path d="M13 16 L19 16 M16 13 L16 19" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
</svg>`;

// Create a simple HTML file that can be used to generate PNG
const htmlTemplate = `<!DOCTYPE html>
<html>
<head>
    <title>Favicon Generator</title>
    <style>
        body { margin: 0; padding: 0; background: transparent; }
        .favicon { display: block; }
    </style>
</head>
<body>
    <div class="favicon">
        ${svgContent}
    </div>
</body>
</html>`;

// Function to create favicon files
function createFaviconFiles() {
    const publicDir = path.join(__dirname, '..', 'public');
    
    // Ensure public directory exists
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }
    
    // Create SVG favicon
    const svgPath = path.join(publicDir, 'favicon.svg');
    fs.writeFileSync(svgPath, svgContent);
    console.log(' Created favicon.svg');
    
    // Create HTML template for PNG generation
    const htmlPath = path.join(publicDir, 'favicon-generator.html');
    fs.writeFileSync(htmlPath, htmlTemplate);
    console.log(' Created favicon-generator.html');
    
    // Create placeholder PNG files with instructions
    const pngFiles = [
        { name: 'favicon-16x16.png', size: '16x16' },
        { name: 'favicon-32x32.png', size: '32x32' },
        { name: 'apple-touch-icon.png', size: '180x180' }
    ];
    
    pngFiles.forEach(file => {
        const filePath = path.join(publicDir, file.name);
        const content = `# Placeholder for ${file.name}
# This file should be replaced with an actual ${file.size} PNG favicon
# 
# To generate the actual PNG file:
# 1. Open public/favicon-generator.html in a browser
# 2. Take a screenshot or use browser dev tools to save as PNG
# 3. Resize to ${file.size} pixels
# 4. Replace this file with the actual PNG
# 
# For now, the SVG favicon will be used as fallback`;
        
        fs.writeFileSync(filePath, content);
        console.log(` Created ${file.name} (placeholder)`);
    });
    
    console.log('\n Next steps:');
    console.log('1. Open public/favicon-generator.html in a browser');
    console.log('2. Take screenshots and resize to create actual PNG files');
    console.log('3. Replace the placeholder files with actual PNGs');
    console.log('4. The SVG favicon will work as a fallback until then');
}

// Run the script
if (require.main === module) {
    try {
        createFaviconFiles();
        console.log('\n Favicon generation complete!');
    } catch (error) {
        console.error(' Error generating favicons:', error.message);
        process.exit(1);
    }
}

module.exports = { createFaviconFiles, svgContent };
