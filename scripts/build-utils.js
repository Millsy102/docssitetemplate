const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class BuildUtils {
  constructor() {
    this.config = {
      publicSrc: 'src/',
      secondarySrc: 'content/admin/',
      pagesOutput: 'dist/',
      secondarySubpath: 'admin',
      basePath: '/docssitetemplate/',
      siteUrl: 'https://millsy102.github.io/docssitetemplate'
    };
  }

  async buildPublicSite(options = {}) {
    console.log('Building public site...');
    
    const config = { ...this.config, ...options };
    
    try {
      // Run the existing build process
      execSync('npm run build', { stdio: 'inherit' });
      console.log('✅ Public site built successfully');
      return true;
    } catch (error) {
      console.error('❌ Public site build failed:', error.message);
      return false;
    }
  }

  async buildSecondarySite(options = {}) {
    console.log('Building secondary site...');
    
    const config = { ...this.config, ...options };
    const secondaryOutput = path.join(config.pagesOutput, config.secondarySubpath);
    
    try {
      // Create secondary site output directory
      await fs.mkdir(secondaryOutput, { recursive: true });
      
      // Copy admin public files (the built admin site)
      const adminPublicDir = path.join(config.secondarySrc, 'public');
      if (await this.fileExists(adminPublicDir)) {
        await this.copyDirectory(adminPublicDir, secondaryOutput);
      }
      
      // Create API directory and copy static API files
      const apiDir = path.join(secondaryOutput, 'api');
      await fs.mkdir(apiDir, { recursive: true });
      
      // Apply SEO controls (noindex, nofollow)
      await this.applySeoControls(secondaryOutput, {
        noindex: true,
        nofollow: true
      });
      
      console.log('✅ Secondary site built successfully');
      return true;
    } catch (error) {
      console.error('❌ Secondary site build failed:', error.message);
      return false;
    }
  }

  async composeOutput(options = {}) {
    console.log('Composing final output...');
    
    const config = { ...this.config, ...options };
    
    try {
      // Create routing configuration
      await this.createRoutingConfig(config);
      
      // Create hidden login mechanism
      await this.createHiddenLogin(config);
      
      // Validate final output
      await this.validateOutput(config);
      
      console.log('✅ Final output composed successfully');
      return true;
    } catch (error) {
      console.error('❌ Output composition failed:', error.message);
      return false;
    }
  }

  async copyDirectory(src, dest) {
    const entries = await fs.readdir(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        await fs.mkdir(destPath, { recursive: true });
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  async applySeoControls(outputDir, seoConfig) {
    const htmlFiles = await this.findHtmlFiles(outputDir);
    
    for (const htmlFile of htmlFiles) {
      let content = await fs.readFile(htmlFile, 'utf8');
      
      if (seoConfig.noindex || seoConfig.nofollow) {
        const robotsContent = [];
        if (seoConfig.noindex) robotsContent.push('noindex');
        if (seoConfig.nofollow) robotsContent.push('nofollow');
        
        const robotsMeta = `<meta name="robots" content="${robotsContent.join(', ')}">`;
        
        // Add robots meta tag if not present
        if (!content.includes('<meta name="robots"')) {
          content = content.replace('</head>', `  ${robotsMeta}\n</head>`);
        }
      }
      
      await fs.writeFile(htmlFile, content);
    }
  }

  async findHtmlFiles(dir) {
    const files = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        files.push(...await this.findHtmlFiles(fullPath));
      } else if (entry.name.endsWith('.html')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  async createRoutingConfig(config) {
    const redirectsContent = `# Public site routing
/* /index.html 200

# Secondary site routing
/${config.secondarySubpath}/* /${config.secondarySubpath}/index.html 200

# Fallback for both sites
/* /index.html 404`;

    await fs.writeFile(
      path.join(config.pagesOutput, '_redirects'),
      redirectsContent
    );
  }

  async createHiddenLogin(config) {
    // Add hidden login mechanism to public site
    const publicIndexPath = path.join(config.pagesOutput, 'index.html');
    
    if (await this.fileExists(publicIndexPath)) {
      let content = await fs.readFile(publicIndexPath, 'utf8');
      
      // Add hidden login script
      const hiddenLoginScript = `
<script>
// Hidden login mechanism
(function() {
  let loginAttempts = 0;
  const maxAttempts = 3;
  
  // Keyboard shortcut: Ctrl+Shift+L
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'L') {
      loginAttempts++;
      if (loginAttempts >= maxAttempts) {
        window.location.href = '${config.basePath}${config.secondarySubpath}/';
      }
    }
  });
  
  // Hidden click area (footer copyright)
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('footer-copyright')) {
      loginAttempts++;
      if (loginAttempts >= maxAttempts) {
        window.location.href = '${config.basePath}${config.secondarySubpath}/';
      }
    }
  });
  
  // URL parameter: ?debug=true
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('debug') === 'true') {
    loginAttempts++;
    if (loginAttempts >= maxAttempts) {
      window.location.href = '${config.basePath}${config.secondarySubpath}/';
    }
  }
})();
</script>`;
      
      content = content.replace('</body>', `${hiddenLoginScript}\n</body>`);
      await fs.writeFile(publicIndexPath, content);
    }
  }

  async validateOutput(config) {
    const requiredFiles = [
      'index.html',
      '_redirects',
      path.join(config.secondarySubpath, 'index.html')
    ];
    
    for (const file of requiredFiles) {
      const filePath = path.join(config.pagesOutput, file);
      if (!await this.fileExists(filePath)) {
        throw new Error(`Required file missing: ${file}`);
      }
    }
    
    console.log('✅ Output validation passed');
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = BuildUtils;
