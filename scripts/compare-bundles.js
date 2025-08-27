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
  bold: '\x1b[1m'
};

class BundleComparer {
  constructor() {
    this.analysisPath = path.join(process.cwd(), 'bundle-analysis');
    this.historyPath = path.join(this.analysisPath, 'history.json');
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

  // Load analysis history
  loadHistory() {
    if (!fs.existsSync(this.historyPath)) {
      console.error(`${colors.red}Error: No analysis history found. Run 'npm run analyze:report' first.${colors.reset}`);
      return [];
    }

    try {
      return JSON.parse(fs.readFileSync(this.historyPath, 'utf8'));
    } catch (error) {
      console.error(`${colors.red}Error loading history: ${error.message}${colors.reset}`);
      return [];
    }
  }

  // Load size history
  loadSizeHistory() {
    if (!fs.existsSync(this.sizeHistoryPath)) {
      console.error(`${colors.red}Error: No size history found. Run 'npm run analyze:size' first.${colors.reset}`);
      return [];
    }

    try {
      return JSON.parse(fs.readFileSync(this.sizeHistoryPath, 'utf8'));
    } catch (error) {
      console.error(`${colors.red}Error loading size history: ${error.message}${colors.reset}`);
      return [];
    }
  }

  // Format date for display
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  // Compare two builds
  compareBuilds(build1, build2) {
    const comparison = {
      totalSize: {
        build1: build1.summary.totalSize,
        build2: build2.summary.totalSize,
        change: build2.summary.totalSize - build1.summary.totalSize,
        changePercent: ((build2.summary.totalSize - build1.summary.totalSize) / build1.summary.totalSize) * 100
      },
      components: {
        javascript: {
          build1: build1.summary.jsSize,
          build2: build2.summary.jsSize,
          change: build2.summary.jsSize - build1.summary.jsSize,
          changePercent: ((build2.summary.jsSize - build1.summary.jsSize) / build1.summary.jsSize) * 100
        },
        css: {
          build1: build1.summary.cssSize,
          build2: build2.summary.cssSize,
          change: build2.summary.cssSize - build1.summary.cssSize,
          changePercent: ((build2.summary.cssSize - build1.summary.cssSize) / build1.summary.cssSize) * 100
        },
        images: {
          build1: build1.summary.imageSize,
          build2: build2.summary.imageSize,
          change: build2.summary.imageSize - build1.summary.imageSize,
          changePercent: ((build2.summary.imageSize - build1.summary.imageSize) / build1.summary.imageSize) * 100
        },
        html: {
          build1: build1.summary.htmlSize,
          build2: build2.summary.htmlSize,
          change: build2.summary.htmlSize - build1.summary.htmlSize,
          changePercent: ((build2.summary.htmlSize - build1.summary.htmlSize) / build1.summary.htmlSize) * 100
        }
      },
      compression: {
        gzip: {
          build1: build1.summary.totalGzip,
          build2: build2.summary.totalGzip,
          change: build2.summary.totalGzip - build1.summary.totalGzip,
          changePercent: ((build2.summary.totalGzip - build1.summary.totalGzip) / build1.summary.totalGzip) * 100
        },
        brotli: {
          build1: build1.summary.totalBrotli,
          build2: build2.summary.totalBrotli,
          change: build2.summary.totalBrotli - build1.summary.totalBrotli,
          changePercent: ((build2.summary.totalBrotli - build1.summary.totalBrotli) / build1.summary.totalBrotli) * 100
        }
      }
    };

    return comparison;
  }

  // Display comparison results
  displayComparison(comparison, build1Date, build2Date) {
    console.log(`${colors.bold}${colors.cyan} Bundle Comparison${colors.reset}\n`);
    console.log(`Build 1: ${build1Date}`);
    console.log(`Build 2: ${build2Date}\n`);

    // Overall size comparison
    const total = comparison.totalSize;
    const changeSymbol = total.change > 0 ? '' : total.change < 0 ? '' : '';
    const changeColor = total.change > 0 ? colors.red : total.change < 0 ? colors.green : colors.blue;

    console.log(`${colors.bold} Overall Size:${colors.reset}`);
    console.log(`  Build 1: ${this.formatBytes(total.build1)}`);
    console.log(`  Build 2: ${this.formatBytes(total.build2)}`);
    console.log(`  Change: ${changeSymbol} ${changeColor}${total.change > 0 ? '+' : ''}${this.formatBytes(total.change)} (${total.changePercent.toFixed(1)}%)${colors.reset}\n`);

    // Component comparison
    console.log(`${colors.bold} Component Changes:${colors.reset}`);
    const components = [
      { key: 'javascript', name: 'JavaScript', color: colors.blue },
      { key: 'css', name: 'CSS', color: colors.magenta },
      { key: 'images', name: 'Images', color: colors.yellow },
      { key: 'html', name: 'HTML', color: colors.cyan }
    ];

    components.forEach(component => {
      const comp = comparison.components[component.key];
      const changeSymbol = comp.change > 0 ? '' : comp.change < 0 ? '' : '';
      const changeColor = comp.change > 0 ? colors.red : comp.change < 0 ? colors.green : colors.blue;

      console.log(`  ${component.color}${component.name}:${colors.reset} ${this.formatBytes(comp.build1)} → ${this.formatBytes(comp.build2)}`);
      console.log(`    ${changeSymbol} ${changeColor}${comp.change > 0 ? '+' : ''}${this.formatBytes(comp.change)} (${comp.changePercent.toFixed(1)}%)${colors.reset}`);
    });

    console.log('');

    // Compression comparison
    console.log(`${colors.bold}  Compression Changes:${colors.reset}`);
    const compressionTypes = [
      { key: 'gzip', name: 'Gzip', color: colors.blue },
      { key: 'brotli', name: 'Brotli', color: colors.magenta }
    ];

    compressionTypes.forEach(type => {
      const comp = comparison.compression[type.key];
      const changeSymbol = comp.change > 0 ? '' : comp.change < 0 ? '' : '';
      const changeColor = comp.change > 0 ? colors.red : comp.change < 0 ? colors.green : colors.blue;

      console.log(`  ${type.color}${type.name}:${colors.reset} ${this.formatBytes(comp.build1)} → ${this.formatBytes(comp.build2)}`);
      console.log(`    ${changeSymbol} ${changeColor}${comp.change > 0 ? '+' : ''}${this.formatBytes(comp.change)} (${comp.changePercent.toFixed(1)}%)${colors.reset}`);
    });

    console.log('');

    // Generate comparison recommendations
    this.generateComparisonRecommendations(comparison);
  }

  // Generate comparison recommendations
  generateComparisonRecommendations(comparison) {
    console.log(`${colors.bold} Comparison Recommendations:${colors.reset}`);

    const total = comparison.totalSize;

    // Overall size recommendations
    if (total.changePercent > 20) {
      console.log(`  ${colors.red}  Significant size increase (${total.changePercent.toFixed(1)}%). Review changes.${colors.reset}`);
    } else if (total.changePercent > 10) {
      console.log(`  ${colors.yellow} Notable size increase (${total.changePercent.toFixed(1)}%). Monitor for continued growth.${colors.reset}`);
    } else if (total.changePercent < -10) {
      console.log(`  ${colors.green} Good optimization (${Math.abs(total.changePercent).toFixed(1)}% reduction).${colors.reset}`);
    } else {
      console.log(`  ${colors.blue}  Minimal size change (${total.changePercent.toFixed(1)}%).${colors.reset}`);
    }

    // Component-specific recommendations
    Object.entries(comparison.components).forEach(([key, comp]) => {
      const componentNames = {
        javascript: 'JavaScript',
        css: 'CSS',
        images: 'Images',
        html: 'HTML'
      };

      if (comp.changePercent > 30) {
        console.log(`  ${colors.yellow} ${componentNames[key]} increased significantly (${comp.changePercent.toFixed(1)}%).${colors.reset}`);
      } else if (comp.changePercent < -20) {
        console.log(`  ${colors.green} ${componentNames[key]} optimized well (${Math.abs(comp.changePercent).toFixed(1)}% reduction).${colors.reset}`);
      }
    });

    console.log('');
  }

  // Compare latest builds
  compareLatestBuilds() {
    const history = this.loadHistory();
    
    if (history.length < 2) {
      console.error(`${colors.red}Error: Need at least 2 builds for comparison.${colors.reset}`);
      return;
    }

    const latest = history[history.length - 1];
    const previous = history[history.length - 2];

    const comparison = this.compareBuilds(previous, latest);
    this.displayComparison(comparison, this.formatDate(previous.timestamp), this.formatDate(latest.timestamp));

    return comparison;
  }

  // Compare specific builds by index
  compareBuildsByIndex(index1, index2) {
    const history = this.loadHistory();
    
    if (history.length === 0) {
      console.error(`${colors.red}Error: No build history found.${colors.reset}`);
      return;
    }

    if (index1 < 0 || index1 >= history.length || index2 < 0 || index2 >= history.length) {
      console.error(`${colors.red}Error: Invalid build indices. Available builds: 0-${history.length - 1}${colors.reset}`);
      return;
    }

    const build1 = history[index1];
    const build2 = history[index2];

    const comparison = this.compareBuilds(build1, build2);
    this.displayComparison(comparison, this.formatDate(build1.timestamp), this.formatDate(build2.timestamp));

    return comparison;
  }

  // Compare builds by date range
  compareBuildsByDateRange(startDate, endDate) {
    const history = this.loadHistory();
    
    if (history.length === 0) {
      console.error(`${colors.red}Error: No build history found.${colors.reset}`);
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const buildsInRange = history.filter(build => {
      const buildDate = new Date(build.timestamp);
      return buildDate >= start && buildDate <= end;
    });

    if (buildsInRange.length < 2) {
      console.error(`${colors.red}Error: Need at least 2 builds in the specified date range.${colors.reset}`);
      return;
    }

    const first = buildsInRange[0];
    const last = buildsInRange[buildsInRange.length - 1];

    const comparison = this.compareBuilds(first, last);
    this.displayComparison(comparison, this.formatDate(first.timestamp), this.formatDate(last.timestamp));

    return comparison;
  }

  // List available builds
  listAvailableBuilds() {
    const history = this.loadHistory();
    
    if (history.length === 0) {
      console.error(`${colors.red}Error: No build history found.${colors.reset}`);
      return;
    }

    console.log(`${colors.bold}${colors.cyan} Available Builds:${colors.reset}\n`);

    history.forEach((build, index) => {
      const date = this.formatDate(build.timestamp);
      const size = this.formatBytes(build.summary.totalSize);
      console.log(`  ${index}: ${date} - ${size}`);
    });

    console.log('');
  }

  // Save comparison results
  saveComparison(comparison, build1Date, build2Date) {
    if (!fs.existsSync(this.analysisPath)) {
      fs.mkdirSync(this.analysisPath, { recursive: true });
    }

    const comparisonData = {
      timestamp: new Date().toISOString(),
      build1Date,
      build2Date,
      comparison
    };

    const comparisonPath = path.join(this.analysisPath, 'comparison.json');
    try {
      fs.writeFileSync(comparisonPath, JSON.stringify(comparisonData, null, 2));
      console.log(`${colors.green} Comparison saved to ${comparisonPath}${colors.reset}\n`);
    } catch (error) {
      console.error(`${colors.red}Error saving comparison: ${error.message}${colors.reset}`);
    }
  }

  // Parse command line arguments
  parseArguments() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      // Default: compare latest two builds
      return this.compareLatestBuilds();
    }

    const command = args[0];

    switch (command) {
      case 'latest':
        return this.compareLatestBuilds();
      
      case 'list':
        return this.listAvailableBuilds();
      
      case 'index':
        if (args.length < 3) {
          console.error(`${colors.red}Usage: npm run analyze:compare index <index1> <index2>${colors.reset}`);
          return;
        }
        const index1 = parseInt(args[1]);
        const index2 = parseInt(args[2]);
        return this.compareBuildsByIndex(index1, index2);
      
      case 'date':
        if (args.length < 3) {
          console.error(`${colors.red}Usage: npm run analyze:compare date <startDate> <endDate>${colors.reset}`);
          return;
        }
        const startDate = args[1];
        const endDate = args[2];
        return this.compareBuildsByDateRange(startDate, endDate);
      
      default:
        console.log(`${colors.cyan}Bundle Comparison Tool${colors.reset}\n`);
        console.log('Usage:');
        console.log('  npm run analyze:compare                    - Compare latest two builds');
        console.log('  npm run analyze:compare latest             - Compare latest two builds');
        console.log('  npm run analyze:compare list               - List available builds');
        console.log('  npm run analyze:compare index <i1> <i2>    - Compare builds by index');
        console.log('  npm run analyze:compare date <start> <end> - Compare builds by date range');
        console.log('');
        console.log('Examples:');
        console.log('  npm run analyze:compare index 0 5');
        console.log('  npm run analyze:compare date 2024-01-01 2024-01-31');
        console.log('');
    }
  }

  // Run the comparer
  run() {
    console.log(`${colors.cyan} Bundle Comparison Tool${colors.reset}\n`);
    this.parseArguments();
  }
}

// Run the comparer
const comparer = new BundleComparer();
comparer.run();
