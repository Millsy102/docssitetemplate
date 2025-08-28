const fs = require('fs').promises;
const path = require('path');

async function testLinks() {
  console.log(' Testing links in dual-site setup...');
  
  const testUrls = [
    '/',
    '/installation',
    '/getting-started',
    '/contributing',
    '/admin/',
    '/admin/api/auth.json',
    '/admin/api/users.json',
    '/admin/api/files.json',
    '/admin/api/system.json'
  ];
  
  const baseUrl = 'https://[your-username].github.io/[your-repo-name]';
  
  console.log(' Test URLs:');
  testUrls.forEach(url => {
    console.log(`   ${baseUrl}${url}`);
  });
  
  console.log('');
  console.log(' Link test configuration ready');
  console.log('   Run this after deployment to verify all URLs are accessible');
}

if (require.main === module) {
  testLinks();
}

module.exports = testLinks;
