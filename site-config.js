// Site Configuration - Using Environment Variables
const envConfig = require('./scripts/env-config');

// Site Configuration object - dynamically generated from environment variables
const siteConfig = {
  // Site metadata - from environment variables
  title: envConfig.siteTitle,
  description: envConfig.siteDescription,
  author: envConfig.siteAuthor,
  
  // URLs and paths - from environment variables
  baseUrl: envConfig.siteUrl,
  
  // GitHub configuration - from environment variables
  githubUsername: envConfig.githubUsername,
  repositoryName: envConfig.repositoryName,
  twitterHandle: process.env.TWITTER_HANDLE || "@[your-username]",
  
  // Authentication - from environment variables
  auth: {
    clientId: process.env.GH_CLIENT_ID || "",
    callbackUrl: `${envConfig.siteUrl}/auth/callback`,
  },
  
  // Admin credentials - from environment variables (NO HARDCODED VALUES)
  admin: {
    username: envConfig.adminUsername,
    password: envConfig.adminPassword,
    apiKey: envConfig.adminApiKey,
  },
  
  // Social Media
  social: {
    twitter: {
      creator: process.env.TWITTER_HANDLE || "@[your-username]",
      site: process.env.TWITTER_HANDLE || "@[your-username]"
    },
    github: process.env.GITHUB_URL || `https://github.com/${envConfig.githubUsername}`
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
  const baseUrl = siteConfig.baseUrl.replace(/\/$/, '');
  const cleanPath = path.replace(/^\//, '');
  return `${baseUrl}/${cleanPath}`;
}

// Helper function to get the GitHub Pages URL
function getGitHubPagesUrl() {
  return envConfig.githubPagesUrl;
}

// Helper function to get admin credentials (from environment variables)
function getAdminCredentials() {
  return envConfig.getAdminCredentials();
}

// Helper function to get site configuration (from environment variables)
function getSiteConfig() {
  return envConfig.getSiteConfig();
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    siteConfig, 
    getFullUrl, 
    getGitHubPagesUrl, 
    getAdminCredentials,
    getSiteConfig,
    envConfig 
  };
} else if (typeof window !== 'undefined') {
  window.siteConfig = siteConfig;
  window.getFullUrl = getFullUrl;
  window.getGitHubPagesUrl = getGitHubPagesUrl;
  window.getAdminCredentials = getAdminCredentials;
  window.getSiteConfig = getSiteConfig;
  window.envConfig = envConfig;
}
