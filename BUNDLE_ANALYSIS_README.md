# Bundle Analysis Tools

Comprehensive bundle analysis and monitoring tools for the BeamFlow documentation site. These tools help you track, analyze, and optimize your bundle size over time.

## 🚀 Quick Start

### Basic Analysis
```bash
# Build and analyze bundle
npm run build
npm run analyze:report

# Quick size check
npm run analyze:size
```

### Visual Analysis
```bash
# Generate visual bundle analysis
npm run analyze
```

### Continuous Monitoring
```bash
# Watch bundle size during development
npm run analyze:watch
```

## 📊 Available Commands

### Core Analysis
- `npm run analyze` - Generate visual bundle analysis with rollup-plugin-visualizer
- `npm run analyze:report` - Comprehensive bundle analysis with detailed breakdown
- `npm run analyze:size` - Quick bundle size analysis with trends
- `npm run analyze:trends` - Analyze bundle size trends over time
- `npm run analyze:compare` - Compare bundle sizes between builds
- `npm run analyze:watch` - Continuously monitor bundle size

### Advanced Usage
- `npm run analyze:compare list` - List available builds for comparison
- `npm run analyze:compare index 0 5` - Compare builds by index
- `npm run analyze:compare date 2024-01-01 2024-01-31` - Compare builds by date range
- `npm run analyze:watch build-watch` - Build and then start watching

## 🔍 Analysis Features

### Bundle Breakdown
- **JavaScript**: Core application code and dependencies
- **CSS**: Stylesheets and styling frameworks
- **Images**: Static assets and media files
- **HTML**: Page templates and markup
- **Other**: Additional assets and files

### Compression Analysis
- **Gzip**: Standard compression analysis
- **Brotli**: Modern compression analysis
- **Compression ratios**: Effectiveness of compression algorithms

### Performance Metrics
- **Total bundle size**: Overall size of the build
- **File size distribution**: Breakdown by file type
- **Largest files**: Identification of oversized assets
- **Growth trends**: Size changes over time

## 📈 Trend Analysis

### Growth Tracking
- **Average growth rate**: Per-build size changes
- **Component trends**: Individual asset type growth
- **Compression trends**: Compression efficiency over time
- **Volatility analysis**: Size stability metrics

### Historical Data
- **Build history**: Up to 50 detailed analysis records
- **Size history**: Up to 100 size tracking records
- **Trend summaries**: Automated trend analysis
- **Comparison data**: Build-to-build comparisons

## 🎯 Performance Recommendations

### Size Thresholds
- **Excellent**: < 500KB
- **Good**: 500KB - 1MB
- **Moderate**: 1MB - 2MB
- **Large**: > 2MB

### Optimization Suggestions
- **Code splitting**: For JavaScript bundles > 500KB
- **CSS purging**: For CSS bundles > 100KB
- **Image optimization**: For image bundles > 500KB
- **Compression improvement**: For compression ratios < 70%

## 📁 Output Files

### Analysis Data
- `bundle-analysis/history.json` - Detailed analysis history
- `bundle-analysis/size-history.json` - Size tracking data
- `bundle-analysis/trend-summary.json` - Trend analysis summary
- `bundle-analysis/comparison.json` - Build comparison data

### Visual Reports
- `dist/bundle-analysis.html` - Interactive bundle visualization
- Console output with colored formatting and emojis

## 🔧 Configuration

### Vite Configuration
The bundle analysis is integrated into the Vite build process:

```typescript
// vite.config.ts
export default defineConfig(({ mode }) => {
  const plugins = [
    react(),
    legacy({ /* legacy support */ })
  ];

  // Add bundle analyzer in analyze mode
  if (mode === 'analyze') {
    plugins.push(
      visualizer({
        filename: 'dist/bundle-analysis.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
        template: 'treemap'
      })
    );
  }

  return { plugins, /* other config */ };
});
```

### Manual Chunks
The build is configured with optimized chunk splitting:

```typescript
manualChunks: {
  'react-vendor': ['react', 'react-dom'],
  'router': ['react-router-dom'],
  'ui': ['react-dropzone'],
  'utils': ['uuid', 'axios'],
  'heavy-components': [
    './src/components/StreamingFileUpload.tsx',
    './src/components/RequestTracker.tsx'
  ],
  'pages': [
    './src/pages/Home.tsx',
    './src/pages/Installation.tsx',
    './src/pages/GettingStarted.tsx',
    './src/pages/Contributing.tsx',
    './src/pages/NotFound.tsx'
  ]
}
```

## 📊 Monitoring Workflow

### Development Workflow
1. **Start monitoring**: `npm run analyze:watch`
2. **Make changes**: Edit code and save files
3. **Monitor size**: Watch real-time size changes
4. **Analyze impact**: Review size impact of changes

### Build Workflow
1. **Build project**: `npm run build`
2. **Analyze bundle**: `npm run analyze:report`
3. **Review trends**: `npm run analyze:trends`
4. **Compare builds**: `npm run analyze:compare`

### Optimization Workflow
1. **Identify issues**: Review analysis recommendations
2. **Implement fixes**: Apply optimizations
3. **Measure impact**: Compare before/after sizes
4. **Track progress**: Monitor long-term trends

## 🎨 Color Coding

### Console Output
- **🟢 Green**: Good performance, optimizations
- **🟡 Yellow**: Warnings, moderate issues
- **🔴 Red**: Critical issues, large bundles
- **🔵 Blue**: Neutral information
- **🟣 Magenta**: CSS-related metrics
- **🟠 Cyan**: HTML-related metrics

### Trend Indicators
- **📈**: Size increase
- **📉**: Size decrease
- **➡️**: No change
- **⚠️**: Warning
- **✅**: Success
- **❌**: Error

## 🔍 Troubleshooting

### Common Issues

#### No Analysis Data
```bash
# Ensure you have built the project first
npm run build
npm run analyze:report
```

#### Missing Dependencies
```bash
# Install bundle analysis dependencies
npm install rollup-plugin-visualizer vite-bundle-analyzer webpack-bundle-analyzer
```

#### Permission Issues
```bash
# Make scripts executable (Linux/Mac)
chmod +x scripts/*.js
```

### Debug Mode
```bash
# Enable verbose logging
DEBUG=bundle-analyzer npm run analyze:report
```

## 📚 Best Practices

### Regular Monitoring
- Run analysis after each build
- Monitor trends weekly
- Set up size alerts for large increases

### Optimization Strategies
- Use code splitting for large components
- Implement lazy loading for routes
- Optimize images and assets
- Remove unused dependencies

### Performance Budgets
- Set maximum bundle size limits
- Monitor individual component sizes
- Track compression ratios
- Establish growth rate thresholds

## 🤝 Contributing

### Adding New Analysis
1. Create analysis script in `scripts/`
2. Add npm script to `package.json`
3. Update this README
4. Test with various bundle sizes

### Extending Features
- Add new file type analysis
- Implement custom metrics
- Create additional visualizations
- Add CI/CD integration

## 📄 License

This bundle analysis toolset is part of the BeamFlow documentation site and follows the same MIT license.

---

**Note**: These tools are designed specifically for the BeamFlow documentation site and may need adaptation for other projects.
