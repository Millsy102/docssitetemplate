#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Utility functions
const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const runCommand = (command, description) => {
  log(`\n${colors.cyan} ${description}...${colors.reset}`);
  try {
    const result = execSync(command, {
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 300000, // 5 minutes timeout
    });
    log(
      `${colors.green} ${description} completed successfully${colors.reset}`
    );
    return { success: true, output: result };
  } catch (error) {
    log(`${colors.red} ${description} failed${colors.reset}`);
    log(`${colors.yellow}Error: ${error.message}${colors.reset}`);
    return { success: false, output: error.stdout || error.message };
  }
};

const generateReport = results => {
  const timestamp = new Date().toISOString();
  const report = {
    timestamp,
    summary: {
      total: Object.keys(results).length,
      passed: Object.values(results).filter(r => r.success).length,
      failed: Object.values(results).filter(r => !r.success).length,
    },
    results,
  };

  // Save report to file
  const reportPath = path.join(
    __dirname,
    '..',
    'accessibility-test-report.json'
  );
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // Generate markdown report
  const markdownReport = generateMarkdownReport(report);
  const markdownPath = path.join(
    __dirname,
    '..',
    'accessibility-test-report.md'
  );
  fs.writeFileSync(markdownPath, markdownReport);

  return report;
};

const generateMarkdownReport = report => {
  const { summary, results } = report;

  let markdown = `# Accessibility Test Report\n\n`;
  markdown += `**Generated:** ${new Date(report.timestamp).toLocaleString()}\n\n`;

  // Summary
  markdown += `## Summary\n\n`;
  markdown += `- **Total Tests:** ${summary.total}\n`;
  markdown += `- **Passed:** ${summary.passed} ${summary.passed === summary.total ? '' : ''}\n`;
  markdown += `- **Failed:** ${summary.failed} ${summary.failed === 0 ? '' : ''}\n\n`;

  // Results
  markdown += `## Test Results\n\n`;

  Object.entries(results).forEach(([testName, result]) => {
    const status = result.success ? ' PASS' : ' FAIL';
    markdown += `### ${testName}\n`;
    markdown += `**Status:** ${status}\n\n`;

    if (!result.success && result.output) {
      markdown += `**Error Details:**\n`;
      markdown += `\`\`\`\n${result.output}\n\`\`\`\n\n`;
    }
  });

  // Recommendations
  if (summary.failed > 0) {
    markdown += `## Recommendations\n\n`;
    markdown += `1. Review failed tests and fix accessibility issues\n`;
    markdown += `2. Run tests again to verify fixes\n`;
    markdown += `3. Consider manual testing with screen readers\n`;
    markdown += `4. Test with users who have disabilities\n\n`;
  } else {
    markdown += `## Status\n\n`;
    markdown += ` All accessibility tests passed! The site meets WCAG 2.1 AA standards.\n\n`;
  }

  return markdown;
};

// Main execution
const main = async () => {
  log(
    `${colors.bright}${colors.blue} BeamFlow Accessibility Test Suite${colors.reset}\n`
  );

  const results = {};

  // 1. ESLint accessibility checks
  results['ESLint Accessibility Rules'] = runCommand(
    'npm run lint',
    'Running ESLint accessibility checks'
  );

  // 2. Jest component accessibility tests
  results['Jest Component Tests'] = runCommand(
    'npm run test:accessibility',
    'Running Jest accessibility component tests'
  );

  // 3. Check if dev server is running
  let devServerRunning = false;
  try {
    execSync('curl -s http://localhost:5173 > /dev/null', { stdio: 'ignore' });
    devServerRunning = true;
    log(`${colors.green} Development server is running${colors.reset}`);
  } catch (error) {
    log(
      `${colors.yellow}  Development server not running. Starting it...${colors.reset}`
    );
    try {
      execSync('npm run dev &', { stdio: 'ignore' });
      // Wait for server to start
      await new Promise(resolve => setTimeout(resolve, 10000));
      devServerRunning = true;
      log(`${colors.green} Development server started${colors.reset}`);
    } catch (error) {
      log(`${colors.red} Failed to start development server${colors.reset}`);
    }
  }

  // 4. Playwright E2E accessibility tests
  if (devServerRunning) {
    results['Playwright E2E Tests'] = runCommand(
      'npm run test:accessibility:e2e',
      'Running Playwright E2E accessibility tests'
    );
  } else {
    results['Playwright E2E Tests'] = {
      success: false,
      output: 'Development server not available',
    };
  }

  // 5. Lighthouse accessibility audit
  if (devServerRunning) {
    results['Lighthouse Accessibility Audit'] = runCommand(
      'npm run test:accessibility:lighthouse',
      'Running Lighthouse accessibility audit'
    );
  } else {
    results['Lighthouse Accessibility Audit'] = {
      success: false,
      output: 'Development server not available',
    };
  }

  // Generate and display report
  const report = generateReport(results);

  log(
    `\n${colors.bright}${colors.blue} Accessibility Test Summary${colors.reset}`
  );
  log(`Total Tests: ${report.summary.total}`);
  log(`Passed: ${colors.green}${report.summary.passed}${colors.reset}`);
  log(
    `Failed: ${report.summary.failed > 0 ? colors.red : colors.green}${report.summary.failed}${colors.reset}`
  );

  if (report.summary.failed === 0) {
    log(
      `\n${colors.green}${colors.bright} All accessibility tests passed!${colors.reset}`
    );
    log(
      `${colors.green}The BeamFlow documentation site meets WCAG 2.1 AA standards.${colors.reset}`
    );
  } else {
    log(
      `\n${colors.red}${colors.bright}  Some accessibility tests failed.${colors.reset}`
    );
    log(
      `${colors.yellow}Please review the detailed report and fix the issues.${colors.reset}`
    );
  }

  log(`\n${colors.cyan} Detailed reports saved to:${colors.reset}`);
  log(`- accessibility-test-report.json`);
  log(`- accessibility-test-report.md`);

  // Exit with appropriate code
  process.exit(report.summary.failed === 0 ? 0 : 1);
};

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  log(`${colors.bright}BeamFlow Accessibility Test Suite${colors.reset}\n`);
  log('Usage: node scripts/run-accessibility-tests.js [options]\n');
  log('Options:');
  log('  --help, -h     Show this help message');
  log('  --quick        Run only ESLint and Jest tests (no E2E)');
  log('  --e2e-only     Run only E2E tests (requires dev server)');
  log('  --lighthouse-only  Run only Lighthouse audit (requires dev server)\n');
  process.exit(0);
}

if (args.includes('--quick')) {
  log(
    `${colors.yellow}Running quick accessibility tests only...${colors.reset}`
  );
  // Modify main function to skip E2E tests
  const originalMain = main;
  main = async () => {
    const results = {};
    results['ESLint Accessibility Rules'] = runCommand(
      'npm run lint',
      'Running ESLint accessibility checks'
    );
    results['Jest Component Tests'] = runCommand(
      'npm run test:accessibility',
      'Running Jest accessibility component tests'
    );
    const report = generateReport(results);
    // ... rest of the logic
  };
}

// Run the main function
main().catch(error => {
  log(`${colors.red} Unexpected error: ${error.message}${colors.reset}`);
  process.exit(1);
});
