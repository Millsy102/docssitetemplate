// Site Configuration
const siteConfig = {
  // Site metadata
  title: process.env.SITE_TITLE || "BeamFlow Documentation",
  description: process.env.SITE_DESCRIPTION || "Comprehensive documentation for the BeamFlow Unreal Engine plugin",
  author: process.env.SITE_AUTHOR || "BeamFlow Team",
  
  // URLs and paths
  baseUrl: process.env.SITE_URL || "https://millsy102.github.io/docssitetemplate/",
  
  // GitHub configuration
  githubUsername: process.env.GITHUB_USERNAME || "Millsy102",
  repositoryName: process.env.REPOSITORY_NAME || "docssitetemplate",
  twitterHandle: process.env.TWITTER_HANDLE || "@Millsy102",
  
  // Authentication - Using environment variables
  auth: {
    clientId: process.env.GH_CLIENT_ID || "",
    callbackUrl: process.env.SITE_URL ? `${process.env.SITE_URL}auth/callback` : "https://millsy102.github.io/docssitetemplate/auth/callback",
  },
  
  // Admin credentials - Using environment variables
  admin: {
    username: process.env.ADMIN_USERNAME || "admin",
    password: process.env.ADMIN_PASSWORD || "your-secure-admin-password",
    apiKey: process.env.ADMIN_API_KEY || "your-admin-api-key",
  },
  
  // Social Media
  social: {
    twitter: {
      creator: process.env.TWITTER_HANDLE || "@Millsy102",
      site: process.env.TWITTER_HANDLE || "@Millsy102"
    },
    github: process.env.GITHUB_URL || "https://github.com/Millsy102"
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
  return `https://${siteConfig.githubUsername}.github.io/${siteConfig.repositoryName}/`;
}

// Helper function to get admin credentials
function getAdminCredentials() {
  return {
    username: siteConfig.admin.username,
    password: siteConfig.admin.password,
    apiKey: siteConfig.admin.apiKey
  };
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { siteConfig, getFullUrl, getGitHubPagesUrl, getAdminCredentials };
} else if (typeof window !== 'undefined') {
  window.siteConfig = siteConfig;
  window.getFullUrl = getFullUrl;
  window.getGitHubPagesUrl = getGitHubPagesUrl;
  window.getAdminCredentials = getAdminCredentials;
}
