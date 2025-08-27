#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

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

class BundleSizeAnalyzer {
  constructor() {
    this.distPath = path.join(process.cwd(), 'dist');
    this.analysisPath = path.join(process.cwd(), 'bundle-analysis');
    this.sizeHistoryPath = path.join(this.analysisPath, 'size-history.json');
  }

  // Format bytes to human readable format
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Calculate total size of directory
  calculateDirectorySize(dirPath) {
    if (!fs.existsSync(dirPath)) return 0;

    let totalSize = 0;
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        totalSize += this.calculateDirectorySize(itemPath);
      } else {
        totalSize += stats.size;
      }
    }

    return totalSize;
  }

  // Get file sizes by type
  getFileSizesByType() {
    const sizes = {
      javascript: 0,
      css: 0,
      images: 0,
      html: 0,
      other: 0,
    };

    if (!fs.existsSync(this.distPath)) return sizes;

    const assetsDir = path.join(this.distPath, 'assets');
    if (fs.existsSync(assetsDir)) {
      const files = fs.readdirSync(assetsDir);

      for (const file of files) {
        const filePath = path.join(assetsDir, file);
        const stats = fs.statSync(filePath);

        if (file.endsWith('.js')) {
          sizes.javascript += stats.size;
        } else if (file.endsWith('.css')) {
          sizes.css += stats.size;
        } else if (/\.(png|jpe?g|svg|gif|webp|avif)$/i.test(file)) {
          sizes.images += stats.size;
        } else {
          sizes.other += stats.size;
        }
      }
    }

    // Check for HTML files in root
    const rootFiles = fs.readdirSync(this.distPath);
    for (const file of rootFiles) {
      if (file.endsWith('.html')) {
        const filePath = path.join(this.distPath, file);
        const stats = fs.statSync(filePath);
        sizes.html += stats.size;
      }
    }

    return sizes;
  }

  // Get largest files
  getLargestFiles(limit = 10) {
    const files = [];

    const scanDirectory = (dirPath, relativePath = '') => {
      if (!fs.existsSync(dirPath)) return;

      const items = fs.readdirSync(dirPath);

      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stats = fs.statSync(itemPath);

        if (stats.isDirectory()) {
          scanDirectory(itemPath, path.join(relativePath, item));
        } else {
          files.push({
            name: path.join(relativePath, item),
            size: stats.size,
            path: itemPath,
          });
        }
      }
    };

    scanDirectory(this.distPath);

    return files.sort((a, b) => b.size - a.size).slice(0, limit);
  }

  // Load size history
  loadSizeHistory() {
    if (!fs.existsSync(this.sizeHistoryPath)) return [];

    try {
      return JSON.parse(fs.readFileSync(this.sizeHistoryPath, 'utf8'));
    } catch (error) {
      console.warn(
        `${colors.yellow}Warning: Could not load size history${colors.reset}`
      );
      return [];
    }
  }

  // Save size history
  saveSizeHistory(history) {
    if (!fs.existsSync(this.analysisPath)) {
      fs.mkdirSync(this.analysisPath, { recursive: true });
    }

    try {
      fs.writeFileSync(this.sizeHistoryPath, JSON.stringify(history, null, 2));
    } catch (error) {
      console.error(
        `${colors.red}Error saving size history: ${error.message}${colors.reset}`
      );
    }
  }

  // Generate size report
  generateSizeReport() {
    console.log(
      `${colors.bold}${colors.cyan}📏 Bundle Size Analysis${colors.reset}\n`
    );

    const sizes = this.getFileSizesByType();
    const totalSize = Object.values(sizes).reduce((sum, size) => sum + size, 0);
    const largestFiles = this.getLargestFiles(5);

    // Display summary
    console.log(`${colors.bold}📊 Size Summary:${colors.reset}`);
    console.log(
      `Total Bundle Size: ${colors.green}${this.formatBytes(totalSize)}${colors.reset}\n`
    );

    // Display breakdown by type
    console.log(`${colors.bold}📁 Breakdown by Type:${colors.reset}`);
    console.log(
      `JavaScript: ${colors.blue}${this.formatBytes(sizes.javascript)}${colors.reset} (${((sizes.javascript / totalSize) * 100).toFixed(1)}%)`
    );
    console.log(
      `CSS: ${colors.magenta}${this.formatBytes(sizes.css)}${colors.reset} (${((sizes.css / totalSize) * 100).toFixed(1)}%)`
    );
    console.log(
      `Images: ${colors.yellow}${this.formatBytes(sizes.images)}${colors.reset} (${((sizes.images / totalSize) * 100).toFixed(1)}%)`
    );
    console.log(
      `HTML: ${colors.cyan}${this.formatBytes(sizes.html)}${colors.reset} (${((sizes.html / totalSize) * 100).toFixed(1)}%)`
    );
    console.log(
      `Other: ${colors.white}${this.formatBytes(sizes.other)}${colors.reset} (${((sizes.other / totalSize) * 100).toFixed(1)}%)\n`
    );

    // Display largest files
    if (largestFiles.length > 0) {
      console.log(`${colors.bold}📦 Largest Files:${colors.reset}`);
      largestFiles.forEach((file, index) => {
        const percentage = ((file.size / totalSize) * 100).toFixed(1);
        console.log(
          `  ${index + 1}. ${file.name}: ${this.formatBytes(file.size)} (${percentage}%)`
        );
      });
      console.log('');
    }

    // Size recommendations
    this.generateSizeRecommendations(totalSize, sizes, largestFiles);

    // Save to history
    const history = this.loadSizeHistory();
    const currentAnalysis = {
      timestamp: new Date().toISOString(),
      totalSize,
      breakdown: sizes,
      largestFiles: largestFiles
        .slice(0, 3)
        .map(f => ({ name: f.name, size: f.size })),
    };

    history.push(currentAnalysis);

    // Keep only last 30 entries
    if (history.length > 30) {
      history.splice(0, history.length - 30);
    }

    this.saveSizeHistory(history);

    // Show trend if available
    if (history.length > 1) {
      this.showSizeTrend(history);
    }

    return currentAnalysis;
  }

  // Generate size recommendations
  generateSizeRecommendations(totalSize, sizes, largestFiles) {
    console.log(`${colors.bold}💡 Size Recommendations:${colors.reset}`);

    // Overall size recommendations
    if (totalSize > 2 * 1024 * 1024) {
      // 2MB
      console.log(
        `  ${colors.red}⚠️  Bundle is very large (${this.formatBytes(totalSize)}). Consider aggressive optimization.${colors.reset}`
      );
    } else if (totalSize > 1 * 1024 * 1024) {
      // 1MB
      console.log(
        `  ${colors.yellow}⚠️  Bundle is large (${this.formatBytes(totalSize)}). Monitor for growth.${colors.reset}`
      );
    } else if (totalSize > 500 * 1024) {
      // 500KB
      console.log(
        `  ${colors.yellow}📦 Bundle is moderately sized (${this.formatBytes(totalSize)}).${colors.reset}`
      );
    } else {
      console.log(
        `  ${colors.green}✅ Bundle size is excellent (${this.formatBytes(totalSize)})${colors.reset}`
      );
    }

    // JavaScript size recommendations
    if (sizes.javascript > 500 * 1024) {
      // 500KB
      console.log(
        `  ${colors.yellow}📜 JavaScript bundle is large. Consider code splitting.${colors.reset}`
      );
    }

    // CSS size recommendations
    if (sizes.css > 100 * 1024) {
      // 100KB
      console.log(
        `  ${colors.yellow}🎨 CSS bundle is large. Consider purging unused styles.${colors.reset}`
      );
    }

    // Image size recommendations
    if (sizes.images > 500 * 1024) {
      // 500KB
      console.log(
        `  ${colors.yellow}🖼️  Images are large. Consider optimization and modern formats.${colors.reset}`
      );
    }

    // Individual file recommendations
    const veryLargeFiles = largestFiles.filter(f => f.size > 200 * 1024); // 200KB
    if (veryLargeFiles.length > 0) {
      console.log(
        `  ${colors.yellow}📁 Very large files detected:${colors.reset}`
      );
      veryLargeFiles.forEach(file => {
        console.log(`    - ${file.name}: ${this.formatBytes(file.size)}`);
      });
    }

    console.log('');
  }

  // Show size trend
  showSizeTrend(history) {
    if (history.length < 2) return;

    const recent = history[history.length - 1];
    const previous = history[history.length - 2];
    const change = recent.totalSize - previous.totalSize;
    const changePercent = (change / previous.totalSize) * 100;

    console.log(`${colors.bold}📈 Size Trend:${colors.reset}`);

    if (change > 0) {
      console.log(
        `  ${colors.red}📈 Increased by ${this.formatBytes(change)} (${changePercent.toFixed(1)}%)${colors.reset}`
      );
    } else if (change < 0) {
      console.log(
        `  ${colors.green}📉 Decreased by ${this.formatBytes(Math.abs(change))} (${Math.abs(changePercent).toFixed(1)}%)${colors.reset}`
      );
    } else {
      console.log(`  ${colors.blue}➡️  No change in size${colors.reset}`);
    }

    // Show trend over last 5 builds
    if (history.length >= 5) {
      const recent5 = history.slice(-5);
      const first = recent5[0];
      const last = recent5[recent5.length - 1];
      const totalChange = last.totalSize - first.totalSize;
      const totalChangePercent = (totalChange / first.totalSize) * 100;

      console.log(
        `  ${colors.cyan}📊 Last 5 builds: ${totalChange > 0 ? '+' : ''}${this.formatBytes(totalChange)} (${totalChangePercent.toFixed(1)}%)${colors.reset}`
      );
    }

    console.log('');
  }

  // Run the analyzer
  run() {
    if (!fs.existsSync(this.distPath)) {
      console.error(
        `${colors.red}Error: dist directory not found. Please run 'npm run build' first.${colors.reset}`
      );
      process.exit(1);
    }

    console.log(
      `${colors.cyan}🔍 Analyzing bundle size in ${this.distPath}...${colors.reset}\n`
    );
    return this.generateSizeReport();
  }
}

// Run the analyzer
const analyzer = new BundleSizeAnalyzer();
analyzer.run();
