#!/usr/bin/env node

/**
 * Site Setup Script
 * 
 * This script helps you configure the site with your own domain and username information.
 * Run this script after cloning the repository to customize it for your use.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function setupSite() {
    console.log('🚀 BeamFlow Site Setup\n');
    console.log('This script will help you configure the site with your own information.\n');

    // Get user information
    const githubUsername = await question('Enter your GitHub username: ');
    const repositoryName = await question('Enter your repository name: ');
    const twitterHandle = await question('Enter your Twitter handle (optional, press Enter to skip): ');
    const siteName = await question('Enter your site name (default: BeamFlow): ') || 'BeamFlow';
    const siteDescription = await question('Enter your site description (press Enter for default): ') || 
        'A powerful and flexible development framework designed to simplify complex development tasks. Build robust applications with minimal effort.';

    // Generate configuration
    const baseUrl = `https://${githubUsername}.github.io/${repositoryName}/`;
    const callbackUrl = `${baseUrl}auth/callback`;
    const twitterCreator = twitterHandle || `@${githubUsername}`;

    // Update site-config.js
    const configContent = `// Site Configuration - Update these values for your deployment
const siteConfig = {
  // Site Information
  siteName: "${siteName}",
  siteDescription: "${siteDescription}",
  siteKeywords: "development framework, web development, API, documentation, open source",
  siteAuthor: "${siteName} Team",
  
  // Domain Configuration
  // Update these values for your deployment
  domain: {
    // For GitHub Pages: https://[username].github.io/[repository-name]/
    baseUrl: "${baseUrl}",
    // For custom domain (optional): "https://yourdomain.com/"
    // For local development: "http://localhost:3000/"
    
    // GitHub username (used for OAuth and social links)
    githubUsername: "${githubUsername}",
    
    // Repository name
    repositoryName: "${repositoryName}",
    
    // Twitter handle (optional)
    twitterHandle: "${twitterHandle || ''}"
  },
  
  // OAuth Configuration
  oauth: {
    // GitHub OAuth callback URL
    callbackUrl: "${callbackUrl}",
    
    // OAuth app name
    appName: "${siteName} Site"
  },
  
  // Social Media
  social: {
    twitter: {
      creator: "${twitterCreator}",
      site: "${twitterCreator}"
    },
    github: "https://github.com/${githubUsername}"
  },
  
  // Theme Configuration
  theme: {
    primaryColor: "#667eea",
    secondaryColor: "#764ba2",
    accentColor: "#27ae60",
    backgroundColor: "#ffffff",
    textColor: "#1a202c"
  },
  
  // SEO Configuration
  seo: {
    ogImage: "/assets/og-image.png",
    favicon: "/favicon.svg",
    manifest: "/site.webmanifest"
  }
};

// Helper function to get the full URL for a path
function getFullUrl(path = '') {
  const baseUrl = siteConfig.domain.baseUrl.replace(/\\/\\/$/, '');
  const cleanPath = path.replace(/^\\//, '');
  return \`\${baseUrl}/\${cleanPath}\`;
}

// Helper function to get the GitHub Pages URL
function getGitHubPagesUrl() {
  return \`https://\${siteConfig.domain.githubUsername}.github.io/\${siteConfig.domain.repositoryName}/\`;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { siteConfig, getFullUrl, getGitHubPagesUrl };
} else if (typeof window !== 'undefined') {
  window.siteConfig = siteConfig;
  window.getFullUrl = getFullUrl;
  window.getGitHubPagesUrl = getGitHubPagesUrl;
}
`;

    // Write the configuration file
    fs.writeFileSync('site-config.js', configContent);

    // Update mkdocs.yml
    const mkdocsPath = 'mkdocs.yml';
    if (fs.existsSync(mkdocsPath)) {
        let mkdocsContent = fs.readFileSync(mkdocsPath, 'utf8');
        mkdocsContent = mkdocsContent.replace(
            /site_url: .*/,
            `site_url: ${baseUrl}`
        );
        mkdocsContent = mkdocsContent.replace(
            /repo_name: .*/,
            `repo_name: ${githubUsername}/${repositoryName}`
        );
        fs.writeFileSync(mkdocsPath, mkdocsContent);
    }

    // Create a README for the user
    const setupReadme = `# ${siteName} - Site Setup Complete

## Your Site Configuration

- **Site Name**: ${siteName}
- **GitHub Username**: ${githubUsername}
- **Repository**: ${repositoryName}
- **Site URL**: ${baseUrl}
- **OAuth Callback**: ${callbackUrl}

## Next Steps

1. **Push your changes to GitHub**:
   \`\`\`bash
   git add .
   git commit -m "Configure site for ${githubUsername}"
   git push origin main
   \`\`\`

2. **Set up GitHub Pages**:
   - Go to your repository settings
   - Enable GitHub Pages
   - Set source to "GitHub Actions"

3. **Configure OAuth** (optional):
   - Go to GitHub Developer Settings
   - Create a new OAuth App
   - Use these URLs:
     - Homepage: ${baseUrl}
     - Callback: ${callbackUrl}

4. **Customize your content**:
   - Edit \`site-config.js\` to change site information
   - Update \`public/index.html\` for main content
   - Modify \`docs/\` folder for documentation

## Files Modified

- \`site-config.js\` - Main site configuration
- \`mkdocs.yml\` - Documentation configuration

Your site is now ready to deploy!
`;

    fs.writeFileSync('SETUP_COMPLETE.md', setupReadme);

    console.log('\n✅ Site configuration complete!\n');
    console.log('📋 Summary:');
    console.log(`   Site Name: ${siteName}`);
    console.log(`   GitHub Username: ${githubUsername}`);
    console.log(`   Repository: ${repositoryName}`);
    console.log(`   Site URL: ${baseUrl}`);
    console.log(`   OAuth Callback: ${callbackUrl}\n`);

    console.log('📝 Next steps:');
    console.log('1. Review SETUP_COMPLETE.md for detailed instructions');
    console.log('2. Push your changes to GitHub');
    console.log('3. Enable GitHub Pages in your repository settings');
    console.log('4. Your site will be available at the URL above\n');

    console.log('🎉 Happy coding!');

    rl.close();
}

// Handle errors
process.on('SIGINT', () => {
    console.log('\n\nSetup cancelled. You can run this script again anytime.');
    rl.close();
    process.exit(0);
});

// Run the setup
setupSite().catch(error => {
    console.error('❌ Setup failed:', error.message);
    rl.close();
    process.exit(1);
});
