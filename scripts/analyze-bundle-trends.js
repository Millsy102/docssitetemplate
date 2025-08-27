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
  bold: '\x1b[1m'
};

class BundleTrendsAnalyzer {
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

  // Calculate growth rate
  calculateGrowthRate(initial, final, periods) {
    if (initial === 0) return 0;
    const growthRate = Math.pow(final / initial, 1 / periods) - 1;
    return growthRate * 100; // Convert to percentage
  }

  // Analyze overall trends
  analyzeOverallTrends(history) {
    if (history.length < 2) {
      console.log(`${colors.yellow}Not enough data for trend analysis. Need at least 2 builds.${colors.reset}\n`);
      return;
    }

    console.log(`${colors.bold}${colors.cyan}📈 Bundle Size Trends Analysis${colors.reset}\n`);

    const first = history[0];
    const last = history[history.length - 1];
    const periods = history.length - 1;

    // Overall size trends
    const totalSizeChange = last.summary.totalSize - first.summary.totalSize;
    const totalSizeChangePercent = ((totalSizeChange / first.summary.totalSize) * 100);
    const avgGrowthRate = this.calculateGrowthRate(first.summary.totalSize, last.summary.totalSize, periods);

    console.log(`${colors.bold}📊 Overall Size Trends:${colors.reset}`);
    console.log(`Initial Size: ${this.formatBytes(first.summary.totalSize)}`);
    console.log(`Current Size: ${this.formatBytes(last.summary.totalSize)}`);
    console.log(`Total Change: ${totalSizeChange > 0 ? '+' : ''}${this.formatBytes(totalSizeChange)} (${totalSizeChangePercent.toFixed(1)}%)`);
    console.log(`Average Growth Rate: ${avgGrowthRate > 0 ? '+' : ''}${avgGrowthRate.toFixed(2)}% per build`);
    console.log(`Builds Analyzed: ${history.length}\n`);

    // Component trends
    this.analyzeComponentTrends(history, first, last);

    // Compression trends
    this.analyzeCompressionTrends(history, first, last);

    // Recent trends
    this.analyzeRecentTrends(history);
  }

  // Analyze component trends
  analyzeComponentTrends(history, first, last) {
    console.log(`${colors.bold}📁 Component Trends:${colors.reset}`);

    const components = [
      { key: 'jsSize', name: 'JavaScript', color: colors.blue },
      { key: 'cssSize', name: 'CSS', color: colors.magenta },
      { key: 'imageSize', name: 'Images', color: colors.yellow },
      { key: 'htmlSize', name: 'HTML', color: colors.cyan }
    ];

    components.forEach(component => {
      const initial = first.summary[component.key];
      const current = last.summary[component.key];
      const change = current - initial;
      const changePercent = ((change / initial) * 100);

      console.log(`${component.color}${component.name}:${colors.reset} ${this.formatBytes(initial)} → ${this.formatBytes(current)} (${change > 0 ? '+' : ''}${changePercent.toFixed(1)}%)`);
    });

    console.log('');
  }

  // Analyze compression trends
  analyzeCompressionTrends(history, first, last) {
    console.log(`${colors.bold}🗜️  Compression Trends:${colors.reset}`);

    // Gzip trends
    const gzipInitial = first.summary.totalGzip;
    const gzipCurrent = last.summary.totalGzip;
    const gzipChange = gzipCurrent - gzipInitial;
    const gzipChangePercent = ((gzipChange / gzipInitial) * 100);
    const gzipRatioInitial = (gzipInitial / first.summary.totalSize) * 100;
    const gzipRatioCurrent = (gzipCurrent / last.summary.totalSize) * 100;

    console.log(`${colors.blue}Gzip:${colors.reset} ${this.formatBytes(gzipInitial)} → ${this.formatBytes(gzipCurrent)} (${gzipChange > 0 ? '+' : ''}${gzipChangePercent.toFixed(1)}%)`);
    console.log(`  Compression Ratio: ${gzipRatioInitial.toFixed(1)}% → ${gzipRatioCurrent.toFixed(1)}%`);

    // Brotli trends
    const brotliInitial = first.summary.totalBrotli;
    const brotliCurrent = last.summary.totalBrotli;
    const brotliChange = brotliCurrent - brotliInitial;
    const brotliChangePercent = ((brotliChange / brotliInitial) * 100);
    const brotliRatioInitial = (brotliInitial / first.summary.totalSize) * 100;
    const brotliRatioCurrent = (brotliCurrent / last.summary.totalSize) * 100;

    console.log(`${colors.magenta}Brotli:${colors.reset} ${this.formatBytes(brotliInitial)} → ${this.formatBytes(brotliCurrent)} (${brotliChange > 0 ? '+' : ''}${brotliChangePercent.toFixed(1)}%)`);
    console.log(`  Compression Ratio: ${brotliRatioInitial.toFixed(1)}% → ${brotliRatioCurrent.toFixed(1)}%\n`);
  }

  // Analyze recent trends
  analyzeRecentTrends(history) {
    if (history.length < 5) {
      console.log(`${colors.yellow}Not enough data for recent trend analysis. Need at least 5 builds.${colors.reset}\n`);
      return;
    }

    console.log(`${colors.bold}🕒 Recent Trends (Last 5 Builds):${colors.reset}`);

    const recent = history.slice(-5);
    const firstRecent = recent[0];
    const lastRecent = recent[recent.length - 1];
    const recentChange = lastRecent.summary.totalSize - firstRecent.summary.totalSize;
    const recentChangePercent = ((recentChange / firstRecent.summary.totalSize) * 100);

    console.log(`Size Change: ${recentChange > 0 ? '+' : ''}${this.formatBytes(recentChange)} (${recentChangePercent.toFixed(1)}%)`);

    // Show individual build changes
    console.log(`\n${colors.bold}📊 Individual Build Changes:${colors.reset}`);
    for (let i = 1; i < recent.length; i++) {
      const current = recent[i];
      const previous = recent[i - 1];
      const change = current.summary.totalSize - previous.summary.totalSize;
      const changePercent = ((change / previous.summary.totalSize) * 100);
      const date = this.formatDate(current.timestamp);

      const changeSymbol = change > 0 ? '📈' : change < 0 ? '📉' : '➡️';
      const changeColor = change > 0 ? colors.red : change < 0 ? colors.green : colors.blue;

      console.log(`  ${changeSymbol} ${date}: ${changeColor}${change > 0 ? '+' : ''}${this.formatBytes(change)} (${changePercent.toFixed(1)}%)${colors.reset}`);
    }

    console.log('');
  }

  // Analyze size history trends
  analyzeSizeHistoryTrends(sizeHistory) {
    if (sizeHistory.length < 2) {
      console.log(`${colors.yellow}Not enough size history data for analysis.${colors.reset}\n`);
      return;
    }

    console.log(`${colors.bold}📏 Size History Trends:${colors.reset}`);

    const first = sizeHistory[0];
    const last = sizeHistory[sizeHistory.length - 1];
    const change = last.totalSize - first.totalSize;
    const changePercent = ((change / first.totalSize) * 100);

    console.log(`Total Change: ${change > 0 ? '+' : ''}${this.formatBytes(change)} (${changePercent.toFixed(1)}%)`);
    console.log(`Builds Tracked: ${sizeHistory.length}`);

    // Find largest and smallest builds
    const sizes = sizeHistory.map(h => h.totalSize);
    const maxSize = Math.max(...sizes);
    const minSize = Math.min(...sizes);
    const maxBuild = sizeHistory.find(h => h.totalSize === maxSize);
    const minBuild = sizeHistory.find(h => h.totalSize === minSize);

    console.log(`Largest Build: ${this.formatBytes(maxSize)} (${this.formatDate(maxBuild.timestamp)})`);
    console.log(`Smallest Build: ${this.formatBytes(minSize)} (${this.formatDate(minBuild.timestamp)})`);

    // Calculate volatility
    const avgSize = sizes.reduce((sum, size) => sum + size, 0) / sizes.length;
    const variance = sizes.reduce((sum, size) => sum + Math.pow(size - avgSize, 2), 0) / sizes.length;
    const volatility = Math.sqrt(variance);
    const volatilityPercent = (volatility / avgSize) * 100;

    console.log(`Average Size: ${this.formatBytes(avgSize)}`);
    console.log(`Size Volatility: ${this.formatBytes(volatility)} (${volatilityPercent.toFixed(1)}%)\n`);
  }

  // Generate trend recommendations
  generateTrendRecommendations(history, sizeHistory) {
    console.log(`${colors.bold}💡 Trend Recommendations:${colors.reset}`);

    if (history.length < 2) {
      console.log(`  ${colors.yellow}Need more data for trend recommendations.${colors.reset}\n`);
      return;
    }

    const first = history[0];
    const last = history[history.length - 1];
    const totalGrowth = ((last.summary.totalSize - first.summary.totalSize) / first.summary.totalSize) * 100;
    const periods = history.length - 1;
    const avgGrowthRate = this.calculateGrowthRate(first.summary.totalSize, last.summary.totalSize, periods);

    // Growth rate recommendations
    if (avgGrowthRate > 5) {
      console.log(`  ${colors.red}⚠️  High growth rate (${avgGrowthRate.toFixed(1)}% per build). Consider optimization.${colors.reset}`);
    } else if (avgGrowthRate > 2) {
      console.log(`  ${colors.yellow}📈 Moderate growth rate (${avgGrowthRate.toFixed(1)}% per build). Monitor closely.${colors.reset}`);
    } else if (avgGrowthRate < -2) {
      console.log(`  ${colors.green}📉 Good optimization trend (${avgGrowthRate.toFixed(1)}% reduction per build).${colors.reset}`);
    } else {
      console.log(`  ${colors.blue}➡️  Stable bundle size (${avgGrowthRate.toFixed(1)}% change per build).${colors.reset}`);
    }

    // Total growth recommendations
    if (totalGrowth > 50) {
      console.log(`  ${colors.red}⚠️  Significant size increase (${totalGrowth.toFixed(1)}%). Review recent changes.${colors.reset}`);
    } else if (totalGrowth > 20) {
      console.log(`  ${colors.yellow}📈 Notable size increase (${totalGrowth.toFixed(1)}%). Monitor for continued growth.${colors.reset}`);
    }

    // Component-specific recommendations
    const jsGrowth = ((last.summary.jsSize - first.summary.jsSize) / first.summary.jsSize) * 100;
    if (jsGrowth > 30) {
      console.log(`  ${colors.yellow}📜 JavaScript growth (${jsGrowth.toFixed(1)}%). Consider code splitting.${colors.reset}`);
    }

    const cssGrowth = ((last.summary.cssSize - first.summary.cssSize) / first.summary.cssSize) * 100;
    if (cssGrowth > 30) {
      console.log(`  ${colors.yellow}🎨 CSS growth (${cssGrowth.toFixed(1)}%). Consider purging unused styles.${colors.reset}`);
    }

    const imageGrowth = ((last.summary.imageSize - first.summary.imageSize) / first.summary.imageSize) * 100;
    if (imageGrowth > 50) {
      console.log(`  ${colors.yellow}🖼️  Image growth (${imageGrowth.toFixed(1)}%). Consider optimization.${colors.reset}`);
    }

    console.log('');
  }

  // Generate trend report
  generateTrendReport() {
    const history = this.loadHistory();
    const sizeHistory = this.loadSizeHistory();

    if (history.length === 0 && sizeHistory.length === 0) {
      console.error(`${colors.red}No analysis data found. Please run bundle analysis first.${colors.reset}`);
      process.exit(1);
    }

    // Analyze overall trends if we have detailed history
    if (history.length > 0) {
      this.analyzeOverallTrends(history);
      this.generateTrendRecommendations(history, sizeHistory);
    }

    // Analyze size history trends
    if (sizeHistory.length > 0) {
      this.analyzeSizeHistoryTrends(sizeHistory);
    }

    // Save trend summary
    this.saveTrendSummary(history, sizeHistory);
  }

  // Save trend summary
  saveTrendSummary(history, sizeHistory) {
    if (!fs.existsSync(this.analysisPath)) {
      fs.mkdirSync(this.analysisPath, { recursive: true });
    }

    const trendSummary = {
      timestamp: new Date().toISOString(),
      historyCount: history.length,
      sizeHistoryCount: sizeHistory.length,
      trends: {}
    };

    if (history.length >= 2) {
      const first = history[0];
      const last = history[history.length - 1];
      const totalGrowth = ((last.summary.totalSize - first.summary.totalSize) / first.summary.totalSize) * 100;
      const periods = history.length - 1;
      const avgGrowthRate = this.calculateGrowthRate(first.summary.totalSize, last.summary.totalSize, periods);

      trendSummary.trends = {
        totalGrowth,
        avgGrowthRate,
        periods,
        initialSize: first.summary.totalSize,
        currentSize: last.summary.totalSize
      };
    }

    const trendSummaryPath = path.join(this.analysisPath, 'trend-summary.json');
    try {
      fs.writeFileSync(trendSummaryPath, JSON.stringify(trendSummary, null, 2));
      console.log(`${colors.green}✅ Trend summary saved to ${trendSummaryPath}${colors.reset}\n`);
    } catch (error) {
      console.error(`${colors.red}Error saving trend summary: ${error.message}${colors.reset}`);
    }
  }

  // Run the analyzer
  run() {
    console.log(`${colors.cyan}📈 Analyzing bundle trends...${colors.reset}\n`);
    this.generateTrendReport();
  }
}

// Run the analyzer
const analyzer = new BundleTrendsAnalyzer();
analyzer.run();
