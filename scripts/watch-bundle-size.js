#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

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
  bold: '\x1b[1m'
};

class BundleSizeWatcher {
  constructor() {
    this.distPath = path.join(process.cwd(), 'dist');
    this.analysisPath = path.join(process.cwd(), 'bundle-analysis');
    this.sizeHistoryPath = path.join(this.analysisPath, 'size-history.json');
    this.watchInterval = 5000; // 5 seconds
    this.lastSize = 0;
    this.isWatching = false;
    this.buildProcess = null;
  }

  // Format bytes to human readable format
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Calculate total directory size
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

  // Get current bundle size
  getCurrentBundleSize() {
    if (!fs.existsSync(this.distPath)) {
      return 0;
    }

    return this.calculateDirectorySize(this.distPath);
  }

  // Get file sizes by type
  getFileSizesByType() {
    const sizes = {
      javascript: 0,
      css: 0,
      images: 0,
      html: 0,
      other: 0
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

  // Save size to history
  saveSizeToHistory(size, breakdown) {
    if (!fs.existsSync(this.analysisPath)) {
      fs.mkdirSync(this.analysisPath, { recursive: true });
    }

    const history = this.loadSizeHistory();
    const entry = {
      timestamp: new Date().toISOString(),
      totalSize: size,
      breakdown
    };

    history.push(entry);

    // Keep only last 100 entries
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }

    try {
      fs.writeFileSync(this.sizeHistoryPath, JSON.stringify(history, null, 2));
    } catch (error) {
      console.error(`${colors.red}Error saving size history: ${error.message}${colors.reset}`);
    }
  }

  // Load size history
  loadSizeHistory() {
    if (!fs.existsSync(this.sizeHistoryPath)) {
      return [];
    }

    try {
      return JSON.parse(fs.readFileSync(this.sizeHistoryPath, 'utf8'));
    } catch (error) {
      return [];
    }
  }

  // Display size change
  displaySizeChange(currentSize, previousSize) {
    const change = currentSize - previousSize;
    const changePercent = previousSize > 0 ? ((change / previousSize) * 100) : 0;

    const changeSymbol = change > 0 ? '📈' : change < 0 ? '📉' : '➡️';
    const changeColor = change > 0 ? colors.red : change < 0 ? colors.green : colors.blue;

    console.log(`  ${changeSymbol} ${changeColor}${change > 0 ? '+' : ''}${this.formatBytes(change)} (${changePercent.toFixed(1)}%)${colors.reset}`);
  }

  // Display current bundle info
  displayBundleInfo() {
    const currentSize = this.getCurrentBundleSize();
    const breakdown = this.getFileSizesByType();
    const timestamp = new Date().toLocaleTimeString();

    console.log(`\n${colors.bold}${colors.cyan}📏 Bundle Size Monitor - ${timestamp}${colors.reset}`);
    console.log(`Total Size: ${colors.green}${this.formatBytes(currentSize)}${colors.reset}`);

    if (this.lastSize > 0) {
      this.displaySizeChange(currentSize, this.lastSize);
    }

    // Display breakdown
    const totalBreakdown = Object.values(breakdown).reduce((sum, size) => sum + size, 0);
    if (totalBreakdown > 0) {
      console.log(`\n${colors.bold}📁 Breakdown:${colors.reset}`);
      console.log(`  JavaScript: ${colors.blue}${this.formatBytes(breakdown.javascript)}${colors.reset} (${((breakdown.javascript / totalBreakdown) * 100).toFixed(1)}%)`);
      console.log(`  CSS: ${colors.magenta}${this.formatBytes(breakdown.css)}${colors.reset} (${((breakdown.css / totalBreakdown) * 100).toFixed(1)}%)`);
      console.log(`  Images: ${colors.yellow}${this.formatBytes(breakdown.images)}${colors.reset} (${((breakdown.images / totalBreakdown) * 100).toFixed(1)}%)`);
      console.log(`  HTML: ${colors.cyan}${this.formatBytes(breakdown.html)}${colors.reset} (${((breakdown.html / totalBreakdown) * 100).toFixed(1)}%)`);
      console.log(`  Other: ${colors.white}${this.formatBytes(breakdown.other)}${colors.reset} (${((breakdown.other / totalBreakdown) * 100).toFixed(1)}%)`);
    }

    // Save to history
    this.saveSizeToHistory(currentSize, breakdown);

    // Update last size
    this.lastSize = currentSize;

    // Show warnings if size is large
    if (currentSize > 2 * 1024 * 1024) { // 2MB
      console.log(`\n${colors.red}⚠️  Bundle is very large (${this.formatBytes(currentSize)})${colors.reset}`);
    } else if (currentSize > 1 * 1024 * 1024) { // 1MB
      console.log(`\n${colors.yellow}⚠️  Bundle is large (${this.formatBytes(currentSize)})${colors.reset}`);
    }
  }

  // Start watching
  startWatching() {
    if (this.isWatching) {
      console.log(`${colors.yellow}Already watching bundle size${colors.reset}`);
      return;
    }

    console.log(`${colors.cyan}🔍 Starting bundle size monitor...${colors.reset}`);
    console.log(`Watching: ${this.distPath}`);
    console.log(`Interval: ${this.watchInterval / 1000} seconds`);
    console.log(`Press Ctrl+C to stop\n`);

    this.isWatching = true;

    // Initial check
    this.displayBundleInfo();

    // Set up interval
    this.watchTimer = setInterval(() => {
      if (fs.existsSync(this.distPath)) {
        this.displayBundleInfo();
      } else {
        console.log(`${colors.yellow}Waiting for dist directory...${colors.reset}`);
      }
    }, this.watchInterval);
  }

  // Stop watching
  stopWatching() {
    if (!this.isWatching) {
      return;
    }

    console.log(`\n${colors.cyan}🛑 Stopping bundle size monitor${colors.reset}`);
    
    if (this.watchTimer) {
      clearInterval(this.watchTimer);
      this.watchTimer = null;
    }

    this.isWatching = false;
  }

  // Start build process
  startBuildProcess() {
    console.log(`${colors.cyan}🔨 Starting build process...${colors.reset}`);

    this.buildProcess = spawn('npm', ['run', 'build'], {
      stdio: 'inherit',
      shell: true
    });

    this.buildProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`${colors.green}✅ Build completed successfully${colors.reset}`);
        this.displayBundleInfo();
      } else {
        console.log(`${colors.red}❌ Build failed with code ${code}${colors.reset}`);
      }
      this.buildProcess = null;
    });

    this.buildProcess.on('error', (error) => {
      console.error(`${colors.red}Build process error: ${error.message}${colors.reset}`);
      this.buildProcess = null;
    });
  }

  // Show size history summary
  showSizeHistorySummary() {
    const history = this.loadSizeHistory();
    
    if (history.length === 0) {
      console.log(`${colors.yellow}No size history available${colors.reset}`);
      return;
    }

    console.log(`\n${colors.bold}${colors.cyan}📊 Size History Summary${colors.reset}`);

    const sizes = history.map(h => h.totalSize);
    const maxSize = Math.max(...sizes);
    const minSize = Math.min(...sizes);
    const avgSize = sizes.reduce((sum, size) => sum + size, 0) / sizes.length;

    const maxEntry = history.find(h => h.totalSize === maxSize);
    const minEntry = history.find(h => h.totalSize === minSize);

    console.log(`Records: ${history.length}`);
    console.log(`Largest: ${this.formatBytes(maxSize)} (${new Date(maxEntry.timestamp).toLocaleString()})`);
    console.log(`Smallest: ${this.formatBytes(minSize)} (${new Date(minEntry.timestamp).toLocaleString()})`);
    console.log(`Average: ${this.formatBytes(avgSize)}`);

    // Show recent trend
    if (history.length >= 2) {
      const recent = history.slice(-5);
      const first = recent[0];
      const last = recent[recent.length - 1];
      const change = last.totalSize - first.totalSize;
      const changePercent = ((change / first.totalSize) * 100);

      console.log(`Recent trend (last ${recent.length} builds): ${change > 0 ? '+' : ''}${this.formatBytes(change)} (${changePercent.toFixed(1)}%)`);
    }
  }

  // Parse command line arguments
  parseArguments() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      // Default: start watching
      return this.startWatching();
    }

    const command = args[0];

    switch (command) {
      case 'watch':
        return this.startWatching();
      
      case 'build':
        return this.startBuildProcess();
      
      case 'build-watch':
        this.startBuildProcess();
        setTimeout(() => this.startWatching(), 2000);
        return;
      
      case 'summary':
        return this.showSizeHistorySummary();
      
      case 'current':
        return this.displayBundleInfo();
      
      default:
        console.log(`${colors.cyan}Bundle Size Watcher${colors.reset}\n`);
        console.log('Usage:');
        console.log('  npm run analyze:watch                    - Start watching bundle size');
        console.log('  npm run analyze:watch watch              - Start watching bundle size');
        console.log('  npm run analyze:watch build              - Start build process');
        console.log('  npm run analyze:watch build-watch        - Build and then watch');
        console.log('  npm run analyze:watch summary            - Show size history summary');
        console.log('  npm run analyze:watch current            - Show current bundle info');
        console.log('');
    }
  }

  // Handle process termination
  handleTermination() {
    this.stopWatching();
    
    if (this.buildProcess) {
      this.buildProcess.kill();
    }

    process.exit(0);
  }

  // Run the watcher
  run() {
    // Handle process termination
    process.on('SIGINT', () => this.handleTermination());
    process.on('SIGTERM', () => this.handleTermination());

    console.log(`${colors.cyan}📏 Bundle Size Watcher${colors.reset}\n`);
    this.parseArguments();
  }
}

// Run the watcher
const watcher = new BundleSizeWatcher();
watcher.run();
