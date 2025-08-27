// Site Configuration
const siteConfig = {
  // Site metadata
  title: "BeamFlow Documentation",
  description: "Comprehensive documentation for the BeamFlow Unreal Engine plugin",
  author: "BeamFlow Team",
  
  // URLs and paths
  baseUrl: "https://millsy102.github.io/docssitetemplate/",
  
  // GitHub configuration
  githubUsername: "Millsy102",
  repositoryName: "docssitetemplate",
  twitterHandle: "@Millsy102",
  
  // Authentication
  auth: {
    clientId: process.env.GITHUB_CLIENT_ID || "",
    callbackUrl: "https://millsy102.github.io/docssitetemplate/auth/callback",
  },
  
  // Social Media
  social: {
    twitter: {
      creator: "@Millsy102",
      site: "@Millsy102"
    },
    github: "https://github.com/Millsy102"
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

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { siteConfig, getFullUrl, getGitHubPagesUrl };
} else if (typeof window !== 'undefined') {
  window.siteConfig = siteConfig;
  window.getFullUrl = getFullUrl;
  window.getGitHubPagesUrl = getGitHubPagesUrl;
}
