#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

class BundleAnalyzer {
  constructor() {
    this.distPath = path.join(process.cwd(), 'dist');
    this.analysisPath = path.join(process.cwd(), 'bundle-analysis');
    this.historyPath = path.join(this.analysisPath, 'history.json');
  }

  // Ensure analysis directory exists
  ensureAnalysisDir() {
    if (!fs.existsSync(this.analysisPath)) {
      fs.mkdirSync(this.analysisPath, { recursive: true });
    }
  }

  // Get file size in human readable format
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Calculate gzip size
  getGzipSize(filePath) {
    try {
      const content = fs.readFileSync(filePath);
      const zlib = require('zlib');
      const gzipped = zlib.gzipSync(content);
      return gzipped.length;
    } catch (error) {
      console.warn(
        `${colors.yellow}Warning: Could not calculate gzip size for ${filePath}${colors.reset}`
      );
      return 0;
    }
  }

  // Calculate brotli size
  getBrotliSize(filePath) {
    try {
      const content = fs.readFileSync(filePath);
      const zlib = require('zlib');
      const brotli = zlib.brotliCompressSync(content);
      return brotli.length;
    } catch (error) {
      console.warn(
        `${colors.yellow}Warning: Could not calculate brotli size for ${filePath}${colors.reset}`
      );
      return 0;
    }
  }

  // Analyze JavaScript files
  analyzeJavaScriptFiles() {
    const jsFiles = [];
    const jsDir = path.join(this.distPath, 'assets');

    if (fs.existsSync(jsDir)) {
      const files = fs.readdirSync(jsDir);
      files.forEach(file => {
        if (file.endsWith('.js')) {
          const filePath = path.join(jsDir, file);
          const stats = fs.statSync(filePath);
          const gzipSize = this.getGzipSize(filePath);
          const brotliSize = this.getBrotliSize(filePath);

          jsFiles.push({
            name: file,
            size: stats.size,
            gzipSize,
            brotliSize,
            path: filePath,
          });
        }
      });
    }

    return jsFiles.sort((a, b) => b.size - a.size);
  }

  // Analyze CSS files
  analyzeCSSFiles() {
    const cssFiles = [];
    const cssDir = path.join(this.distPath, 'assets');

    if (fs.existsSync(cssDir)) {
      const files = fs.readdirSync(cssDir);
      files.forEach(file => {
        if (file.endsWith('.css')) {
          const filePath = path.join(cssDir, file);
          const stats = fs.statSync(filePath);
          const gzipSize = this.getGzipSize(filePath);
          const brotliSize = this.getBrotliSize(filePath);

          cssFiles.push({
            name: file,
            size: stats.size,
            gzipSize,
            brotliSize,
            path: filePath,
          });
        }
      });
    }

    return cssFiles.sort((a, b) => b.size - a.size);
  }

  // Analyze image files
  analyzeImageFiles() {
    const imageFiles = [];
    const imageDir = path.join(this.distPath, 'assets');

    if (fs.existsSync(imageDir)) {
      const files = fs.readdirSync(imageDir);
      files.forEach(file => {
        if (/\.(png|jpe?g|svg|gif|webp|avif)$/i.test(file)) {
          const filePath = path.join(imageDir, file);
          const stats = fs.statSync(filePath);

          imageFiles.push({
            name: file,
            size: stats.size,
            path: filePath,
          });
        }
      });
    }

    return imageFiles.sort((a, b) => b.size - a.size);
  }

  // Analyze HTML files
  analyzeHTMLFiles() {
    const htmlFiles = [];
    const htmlDir = this.distPath;

    if (fs.existsSync(htmlDir)) {
      const files = fs.readdirSync(htmlDir);
      files.forEach(file => {
        if (file.endsWith('.html')) {
          const filePath = path.join(htmlDir, file);
          const stats = fs.statSync(filePath);
          const gzipSize = this.getGzipSize(filePath);
          const brotliSize = this.getBrotliSize(filePath);

          htmlFiles.push({
            name: file,
            size: stats.size,
            gzipSize,
            brotliSize,
            path: filePath,
          });
        }
      });
    }

    return htmlFiles.sort((a, b) => b.size - a.size);
  }

  // Generate analysis report
  generateReport() {
    console.log(
      `${colors.bold}${colors.cyan} Bundle Analysis Report${colors.reset}\n`
    );

    const jsFiles = this.analyzeJavaScriptFiles();
    const cssFiles = this.analyzeCSSFiles();
    const imageFiles = this.analyzeImageFiles();
    const htmlFiles = this.analyzeHTMLFiles();

    // Calculate totals
    const totalJS = jsFiles.reduce((sum, file) => sum + file.size, 0);
    const totalCSS = cssFiles.reduce((sum, file) => sum + file.size, 0);
    const totalImages = imageFiles.reduce((sum, file) => sum + file.size, 0);
    const totalHTML = htmlFiles.reduce((sum, file) => sum + file.size, 0);
    const totalGzip =
      jsFiles.reduce((sum, file) => sum + file.gzipSize, 0) +
      cssFiles.reduce((sum, file) => sum + file.gzipSize, 0) +
      htmlFiles.reduce((sum, file) => sum + file.gzipSize, 0);
    const totalBrotli =
      jsFiles.reduce((sum, file) => sum + file.brotliSize, 0) +
      cssFiles.reduce((sum, file) => sum + file.brotliSize, 0) +
      htmlFiles.reduce((sum, file) => sum + file.brotliSize, 0);

    const totalSize = totalJS + totalCSS + totalImages + totalHTML;

    // Display summary
    console.log(`${colors.bold} Bundle Summary:${colors.reset}`);
    console.log(
      `Total Size: ${colors.green}${this.formatBytes(totalSize)}${colors.reset}`
    );
    console.log(
      `Gzipped: ${colors.blue}${this.formatBytes(totalGzip)}${colors.reset} (${((totalGzip / totalSize) * 100).toFixed(1)}% reduction)`
    );
    console.log(
      `Brotli: ${colors.magenta}${this.formatBytes(totalBrotli)}${colors.reset} (${((totalBrotli / totalSize) * 100).toFixed(1)}% reduction)\n`
    );

    // Display JavaScript files
    if (jsFiles.length > 0) {
      console.log(
        `${colors.bold} JavaScript Files (${this.formatBytes(totalJS)}):${colors.reset}`
      );
      jsFiles.forEach(file => {
        const gzipReduction = ((file.gzipSize / file.size) * 100).toFixed(1);
        const brotliReduction = ((file.brotliSize / file.size) * 100).toFixed(
          1
        );
        console.log(
          `  ${file.name}: ${this.formatBytes(file.size)} (gzip: ${this.formatBytes(file.gzipSize)}, brotli: ${this.formatBytes(file.brotliSize)})`
        );
      });
      console.log('');
    }

    // Display CSS files
    if (cssFiles.length > 0) {
      console.log(
        `${colors.bold} CSS Files (${this.formatBytes(totalCSS)}):${colors.reset}`
      );
      cssFiles.forEach(file => {
        const gzipReduction = ((file.gzipSize / file.size) * 100).toFixed(1);
        const brotliReduction = ((file.brotliSize / file.size) * 100).toFixed(
          1
        );
        console.log(
          `  ${file.name}: ${this.formatBytes(file.size)} (gzip: ${this.formatBytes(file.gzipSize)}, brotli: ${this.formatBytes(file.brotliSize)})`
        );
      });
      console.log('');
    }

    // Display image files
    if (imageFiles.length > 0) {
      console.log(
        `${colors.bold}  Image Files (${this.formatBytes(totalImages)}):${colors.reset}`
      );
      imageFiles.forEach(file => {
        console.log(`  ${file.name}: ${this.formatBytes(file.size)}`);
      });
      console.log('');
    }

    // Display HTML files
    if (htmlFiles.length > 0) {
      console.log(
        `${colors.bold} HTML Files (${this.formatBytes(totalHTML)}):${colors.reset}`
      );
      htmlFiles.forEach(file => {
        const gzipReduction = ((file.gzipSize / file.size) * 100).toFixed(1);
        const brotliReduction = ((file.brotliSize / file.size) * 100).toFixed(
          1
        );
        console.log(
          `  ${file.name}: ${this.formatBytes(file.size)} (gzip: ${this.formatBytes(file.gzipSize)}, brotli: ${this.formatBytes(file.brotliSize)})`
        );
      });
      console.log('');
    }

    // Performance recommendations
    this.generateRecommendations(
      totalSize,
      totalGzip,
      totalBrotli,
      jsFiles,
      cssFiles,
      imageFiles
    );

    // Save analysis data
    const analysisData = {
      timestamp: new Date().toISOString(),
      summary: {
        totalSize,
        totalGzip,
        totalBrotli,
        jsSize: totalJS,
        cssSize: totalCSS,
        imageSize: totalImages,
        htmlSize: totalHTML,
      },
      files: {
        javascript: jsFiles,
        css: cssFiles,
        images: imageFiles,
        html: htmlFiles,
      },
    };

    this.saveAnalysisData(analysisData);
  }

  // Generate performance recommendations
  generateRecommendations(
    totalSize,
    totalGzip,
    totalBrotli,
    jsFiles,
    cssFiles,
    imageFiles
  ) {
    console.log(`${colors.bold} Performance Recommendations:${colors.reset}`);

    // Check bundle size thresholds
    if (totalSize > 2 * 1024 * 1024) {
      // 2MB
      console.log(
        `  ${colors.red}  Bundle is large (${this.formatBytes(totalSize)}). Consider code splitting and lazy loading.${colors.reset}`
      );
    } else if (totalSize > 1 * 1024 * 1024) {
      // 1MB
      console.log(
        `  ${colors.yellow}  Bundle is moderately large (${this.formatBytes(totalSize)}). Monitor for growth.${colors.reset}`
      );
    } else {
      console.log(
        `  ${colors.green} Bundle size is good (${this.formatBytes(totalSize)})${colors.reset}`
      );
    }

    // Check JavaScript bundle size
    const totalJS = jsFiles.reduce((sum, file) => sum + file.size, 0);
    if (totalJS > 500 * 1024) {
      // 500KB
      console.log(
        `  ${colors.yellow} Consider splitting large JavaScript chunks${colors.reset}`
      );
    }

    // Check for large individual files
    const largeFiles = [...jsFiles, ...cssFiles].filter(
      file => file.size > 100 * 1024
    ); // 100KB
    if (largeFiles.length > 0) {
      console.log(`  ${colors.yellow} Large files detected:${colors.reset}`);
      largeFiles.forEach(file => {
        console.log(`    - ${file.name}: ${this.formatBytes(file.size)}`);
      });
    }

    // Check image optimization
    const largeImages = imageFiles.filter(file => file.size > 200 * 1024); // 200KB
    if (largeImages.length > 0) {
      console.log(
        `  ${colors.yellow}  Consider optimizing large images:${colors.reset}`
      );
      largeImages.forEach(file => {
        console.log(`    - ${file.name}: ${this.formatBytes(file.size)}`);
      });
    }

    // Compression recommendations
    const gzipRatio = (totalGzip / totalSize) * 100;
    const brotliRatio = (totalBrotli / totalSize) * 100;

    if (gzipRatio > 70) {
      console.log(
        `  ${colors.green} Good gzip compression (${gzipRatio.toFixed(1)}% reduction)${colors.reset}`
      );
    } else {
      console.log(
        `  ${colors.yellow} Consider improving gzip compression (${gzipRatio.toFixed(1)}% reduction)${colors.reset}`
      );
    }

    if (brotliRatio > 75) {
      console.log(
        `  ${colors.green} Excellent brotli compression (${brotliRatio.toFixed(1)}% reduction)${colors.reset}`
      );
    } else {
      console.log(
        `  ${colors.yellow} Consider improving brotli compression (${brotliRatio.toFixed(1)}% reduction)${colors.reset}`
      );
    }

    console.log('');
  }

  // Save analysis data for historical tracking
  saveAnalysisData(analysisData) {
    this.ensureAnalysisDir();

    // Load existing history
    let history = [];
    if (fs.existsSync(this.historyPath)) {
      try {
        history = JSON.parse(fs.readFileSync(this.historyPath, 'utf8'));
      } catch (error) {
        console.warn(
          `${colors.yellow}Warning: Could not load existing history${colors.reset}`
        );
      }
    }

    // Add new analysis
    history.push(analysisData);

    // Keep only last 50 entries
    if (history.length > 50) {
      history = history.slice(-50);
    }

    // Save updated history
    try {
      fs.writeFileSync(this.historyPath, JSON.stringify(history, null, 2));
      console.log(
        `${colors.green} Analysis data saved to ${this.historyPath}${colors.reset}\n`
      );
    } catch (error) {
      console.error(
        `${colors.red}Error saving analysis data: ${error.message}${colors.reset}`
      );
    }
  }

  // Run the analysis
  run() {
    if (!fs.existsSync(this.distPath)) {
      console.error(
        `${colors.red}Error: dist directory not found. Please run 'npm run build' first.${colors.reset}`
      );
      process.exit(1);
    }

    console.log(
      `${colors.cyan} Analyzing bundle in ${this.distPath}...${colors.reset}\n`
    );
    this.generateReport();
  }
}

// Run the analyzer
const analyzer = new BundleAnalyzer();
analyzer.run();
