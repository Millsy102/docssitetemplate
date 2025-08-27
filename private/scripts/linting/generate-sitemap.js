#!/usr/bin/env node

/**
 * Generate sitemap for GitHub Pages site
 * This script creates a sitemap.xml file for better SEO
 */

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://beamflow.com'; // Update with your actual domain
const OUTPUT_FILE = 'site/sitemap.xml';

// Define the pages to include in sitemap
const pages = [
  { url: '/', priority: '1.0', changefreq: 'weekly' },
  { url: '/getting-started/', priority: '0.9', changefreq: 'monthly' },
  { url: '/installation/', priority: '0.8', changefreq: 'monthly' },
  { url: '/api-reference/', priority: '0.8', changefreq: 'monthly' },
  { url: '/configuration/', priority: '0.7', changefreq: 'monthly' },
  { url: '/deployment/', priority: '0.7', changefreq: 'monthly' },
  { url: '/security/', priority: '0.7', changefreq: 'monthly' },
  { url: '/performance/', priority: '0.6', changefreq: 'monthly' },
  { url: '/examples/', priority: '0.6', changefreq: 'monthly' },
  { url: '/faq/', priority: '0.5', changefreq: 'monthly' },
  { url: '/contributing/', priority: '0.4', changefreq: 'monthly' },
  { url: '/code-of-conduct/', priority: '0.3', changefreq: 'yearly' },
  { url: '/changelog/', priority: '0.6', changefreq: 'weekly' }
];

// Generate sitemap XML
function generateSitemap() {
  const currentDate = new Date().toISOString();
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  pages.forEach(page => {
    sitemap += `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
  });

  sitemap += '</urlset>';

  // Ensure the output directory exists
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write sitemap to file
  fs.writeFileSync(OUTPUT_FILE, sitemap);
  console.log(`✅ Sitemap generated: ${OUTPUT_FILE}`);
}

// Generate robots.txt
function generateRobotsTxt() {
  const robotsContent = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml

# Disallow admin and private areas
Disallow: /admin/
Disallow: /private/
Disallow: /api/
Disallow: /_next/
Disallow: /node_modules/

# Allow important pages
Allow: /docs/
Allow: /content/
Allow: /assets/
`;

  const robotsFile = 'site/robots.txt';
  const outputDir = path.dirname(robotsFile);
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(robotsFile, robotsContent);
  console.log(`✅ Robots.txt generated: ${robotsFile}`);
}

// Main execution
try {
  generateSitemap();
  generateRobotsTxt();
  console.log('🎉 SEO files generated successfully!');
} catch (error) {
  console.error('❌ Error generating SEO files:', error);
  process.exit(1);
}
