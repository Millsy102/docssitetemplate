// Site Configuration - Update these values for your deployment
const siteConfig = {
  // Site Information
  siteName: "BeamFlow",
  siteDescription: "A powerful and flexible development framework designed to simplify complex development tasks. Build robust applications with minimal effort.",
  siteKeywords: "development framework, web development, API, documentation, open source",
  siteAuthor: "BeamFlow Team",
  
  // Domain Configuration
  // Update these values for your deployment
  domain: {
    // For GitHub Pages: https://[username].github.io/[repository-name]/
    baseUrl: "https://yourusername.github.io/your-repo-name/",
    // For custom domain (optional): "https://yourdomain.com/"
    // For local development: "http://localhost:3000/"
    
    // GitHub username (used for OAuth and social links)
    githubUsername: "yourusername",
    
    // Repository name
    repositoryName: "your-repo-name",
    
    // Twitter handle (optional)
    twitterHandle: "@yourusername"
  },
  
  // OAuth Configuration
  oauth: {
    // GitHub OAuth callback URL
    callbackUrl: "https://yourusername.github.io/your-repo-name/auth/callback",
    
    // OAuth app name
    appName: "BeamFlow Site"
  },
  
  // Social Media
  social: {
    twitter: {
      creator: "@yourusername",
      site: "@yourusername"
    },
    github: "https://github.com/yourusername"
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
  const baseUrl = siteConfig.domain.baseUrl.replace(/\/$/, '');
  const cleanPath = path.replace(/^\//, '');
  return `${baseUrl}/${cleanPath}`;
}

// Helper function to get the GitHub Pages URL
function getGitHubPagesUrl() {
  return `https://${siteConfig.domain.githubUsername}.github.io/${siteConfig.domain.repositoryName}/`;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { siteConfig, getFullUrl, getGitHubPagesUrl };
} else if (typeof window !== 'undefined') {
  window.siteConfig = siteConfig;
  window.getFullUrl = getFullUrl;
  window.getGitHubPagesUrl = getGitHubPagesUrl;
}
