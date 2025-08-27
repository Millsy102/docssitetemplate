#!/usr/bin/env node

/**
 * Comprehensive Security Audit Script
 *
 * This script performs various security checks on the project:
 * - Dependency vulnerability scanning
 * - Code pattern analysis for security issues
 * - Configuration file security checks
 * - Best practices validation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

// Colors for output
const colors = {
  success: chalk.green,
  error: chalk.red,
  warning: chalk.yellow,
  info: chalk.blue,
  title: chalk.cyan.bold,
};

class SecurityAuditor {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.passed = [];
    this.projectRoot = process.cwd();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const color = colors[type] || colors.info;
    console.log(`[${timestamp}] ${color(message)}`);
  }

  addIssue(severity, category, message, file = null, line = null) {
    this.issues.push({ severity, category, message, file, line });
  }

  addWarning(category, message, file = null, line = null) {
    this.warnings.push({ category, message, file, line });
  }

  addPassed(category, message) {
    this.passed.push({ category, message });
  }

  async checkDependencies() {
    this.log(' Checking dependencies for vulnerabilities...', 'title');

    try {
      // Run npm audit
      const auditResult = execSync('npm audit --json', { encoding: 'utf8' });
      const auditData = JSON.parse(auditResult);

      if (auditData.metadata.vulnerabilities.total > 0) {
        this.addIssue(
          'high',
          'dependencies',
          `Found ${auditData.metadata.vulnerabilities.total} vulnerabilities in dependencies`
        );

        Object.keys(auditData.advisories).forEach(advisoryId => {
          const advisory = auditData.advisories[advisoryId];
          this.addIssue(
            advisory.severity,
            'dependencies',
            `${advisory.module_name}: ${advisory.title} (${advisory.severity})`
          );
        });
      } else {
        this.addPassed(
          'dependencies',
          'No vulnerabilities found in dependencies'
        );
      }
    } catch (error) {
      this.addWarning(
        'dependencies',
        'Could not run npm audit: ' + error.message
      );
    }

    // Check for outdated packages
    try {
      const outdatedResult = execSync('npm outdated --json', {
        encoding: 'utf8',
      });
      const outdatedData = JSON.parse(outdatedResult);

      if (Object.keys(outdatedData).length > 0) {
        this.addWarning(
          'dependencies',
          `Found ${Object.keys(outdatedData).length} outdated packages`
        );
      } else {
        this.addPassed('dependencies', 'All packages are up to date');
      }
    } catch (error) {
      // npm outdated returns non-zero exit code when packages are outdated
      this.addWarning('dependencies', 'Some packages may be outdated');
    }
  }

  async checkCodePatterns() {
    this.log(' Scanning code for security patterns...', 'title');

    const srcDir = path.join(this.projectRoot, 'src');
    if (!fs.existsSync(srcDir)) {
      this.addWarning('code-patterns', 'No src directory found');
      return;
    }

    const patterns = [
      {
        pattern: /eval\s*\(/g,
        message: 'Use of eval() detected - security risk',
        severity: 'high',
      },
      {
        pattern: /innerHTML\s*=/g,
        message: 'Use of innerHTML detected - potential XSS risk',
        severity: 'medium',
      },
      {
        pattern: /document\.write\s*\(/g,
        message: 'Use of document.write() detected - potential XSS risk',
        severity: 'medium',
      },
      {
        pattern: /password\s*[:=]\s*['"`][^'"`]+['"`]/gi,
        message: 'Hardcoded password detected',
        severity: 'high',
      },
      {
        pattern: /api_key\s*[:=]\s*['"`][^'"`]+['"`]/gi,
        message: 'Hardcoded API key detected',
        severity: 'high',
      },
      {
        pattern: /secret\s*[:=]\s*['"`][^'"`]+['"`]/gi,
        message: 'Hardcoded secret detected',
        severity: 'high',
      },
      {
        pattern: /console\.log\s*\(/g,
        message: 'Console.log statements found in production code',
        severity: 'low',
      },
    ];

    const scanDirectory = dir => {
      const files = fs.readdirSync(dir);

      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (
          stat.isDirectory() &&
          !file.startsWith('.') &&
          file !== 'node_modules'
        ) {
          scanDirectory(filePath);
        } else if (stat.isFile() && /\.(js|jsx|ts|tsx)$/.test(file)) {
          try {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');

            patterns.forEach(({ pattern, message, severity }) => {
              let match;
              while ((match = pattern.exec(content)) !== null) {
                const lineNumber = content
                  .substring(0, match.index)
                  .split('\n').length;
                this.addIssue(
                  severity,
                  'code-patterns',
                  message,
                  filePath,
                  lineNumber
                );
              }
            });
          } catch (error) {
            this.addWarning(
              'code-patterns',
              `Could not read file: ${filePath}`
            );
          }
        }
      });
    };

    scanDirectory(srcDir);

    if (this.issues.filter(i => i.category === 'code-patterns').length === 0) {
      this.addPassed(
        'code-patterns',
        'No obvious security code patterns found'
      );
    }
  }

  async checkConfiguration() {
    this.log(' Checking configuration files...', 'title');

    const configFiles = [
      'package.json',
      'vite.config.js',
      'vite.config.ts',
      '.env',
      '.env.local',
      '.env.production',
    ];

    configFiles.forEach(configFile => {
      const configPath = path.join(this.projectRoot, configFile);
      if (fs.existsSync(configPath)) {
        try {
          const content = fs.readFileSync(configPath, 'utf8');

          // Check for sensitive data in config files
          if (
            content.includes('password') ||
            content.includes('secret') ||
            content.includes('key')
          ) {
            this.addWarning(
              'configuration',
              `Potential sensitive data in ${configFile}`
            );
          }

          this.addPassed(
            'configuration',
            `Configuration file ${configFile} checked`
          );
        } catch (error) {
          this.addWarning('configuration', `Could not read ${configFile}`);
        }
      }
    });
  }

  async checkSecurityHeaders() {
    this.log(' Checking security headers configuration...', 'title');

    // Check if helmet is configured
    const srcDir = path.join(this.projectRoot, 'src');
    if (fs.existsSync(srcDir)) {
      const files = fs.readdirSync(srcDir);
      const hasHelmet = files.some(file => {
        const filePath = path.join(srcDir, file);
        if (fs.statSync(filePath).isFile()) {
          try {
            const content = fs.readFileSync(filePath, 'utf8');
            return content.includes('helmet') || content.includes('Helmet');
          } catch (error) {
            return false;
          }
        }
        return false;
      });

      if (hasHelmet) {
        this.addPassed(
          'security-headers',
          'Helmet security middleware detected'
        );
      } else {
        this.addWarning(
          'security-headers',
          'No security headers middleware detected'
        );
      }
    }
  }

  async checkEnvironmentVariables() {
    this.log(' Checking environment variable usage...', 'title');

    const envFiles = ['.env', '.env.local', '.env.production'];
    const hasEnvFiles = envFiles.some(file =>
      fs.existsSync(path.join(this.projectRoot, file))
    );

    if (hasEnvFiles) {
      this.addPassed('environment', 'Environment files found');
    } else {
      this.addWarning('environment', 'No environment files found');
    }
  }

  async generateReport() {
    this.log(' Generating security audit report...', 'title');

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.issues.length + this.warnings.length,
        issues: this.issues.length,
        warnings: this.warnings.length,
        passed: this.passed.length,
      },
      issues: this.issues,
      warnings: this.warnings,
      passed: this.passed,
    };

    // Save report to file
    const reportPath = path.join(
      this.projectRoot,
      'security-audit-report.json'
    );
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    this.log(`Report saved to: ${reportPath}`, 'success');

    return report;
  }

  async printSummary() {
    this.log('\n' + '='.repeat(60), 'title');
    this.log(' SECURITY AUDIT SUMMARY', 'title');
    this.log('='.repeat(60), 'title');

    this.log(`\n Passed: ${this.passed.length}`, 'success');
    this.passed.forEach(item => {
      this.log(`  • ${item.category}: ${item.message}`, 'success');
    });

    if (this.warnings.length > 0) {
      this.log(`\n  Warnings: ${this.warnings.length}`, 'warning');
      this.warnings.forEach(item => {
        this.log(`  • ${item.category}: ${item.message}`, 'warning');
      });
    }

    if (this.issues.length > 0) {
      this.log(`\n Issues: ${this.issues.length}`, 'error');
      this.issues.forEach(item => {
        const severity = item.severity.toUpperCase();
        const fileInfo = item.file
          ? ` (${item.file}${item.line ? `:${item.line}` : ''})`
          : '';
        this.log(
          `  • [${severity}] ${item.category}: ${item.message}${fileInfo}`,
          'error'
        );
      });
    }

    this.log('\n' + '='.repeat(60), 'title');

    if (this.issues.length === 0) {
      this.log(' No critical security issues found!', 'success');
    } else {
      this.log(
        `  Found ${this.issues.length} security issues that need attention`,
        'error'
      );
    }

    this.log('='.repeat(60), 'title');
  }

  async run() {
    this.log(' Starting comprehensive security audit...', 'title');

    await this.checkDependencies();
    await this.checkCodePatterns();
    await this.checkConfiguration();
    await this.checkSecurityHeaders();
    await this.checkEnvironmentVariables();

    const report = await this.generateReport();
    await this.printSummary();

    return report;
  }
}

// Run the audit if this script is executed directly
if (require.main === module) {
  const auditor = new SecurityAuditor();
  auditor.run().catch(error => {
    console.error('Security audit failed:', error);
    process.exit(1);
  });
}

module.exports = SecurityAuditor;
