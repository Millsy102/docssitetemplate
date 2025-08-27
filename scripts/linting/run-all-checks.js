#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Master script that runs all possible checks and fixes
 * - Removes "more" from markdown files
 * - Runs comprehensive linting
 * - Checks all file types for issues
 * - Provides detailed reporting
 */

class BeamAllChecksRunner {
  constructor() {
    this.results = {
      markdownCleanup: { success: false, output: '', filesModified: 0 },
      eslint: { success: false, output: '', errors: 0 },
      prettier: { success: false, output: '', errors: 0 },
      markdownlint: { success: false, output: '', errors: 0 },
      cspell: { success: false, output: '', errors: 0 },
      linkValidation: { success: false, output: '', errors: 0 },
      accessibility: { success: false, output: '', errors: 0 },
      security: { success: false, output: '', errors: 0 }
    };
    this.totalErrors = 0;
    this.startTime = Date.now();
  }

  async runCommand(command, args, name, options = {}) {
    return new Promise((resolve) => {
      console.log(`\n🔍 Running ${name}...`);
      
      const child = spawn(command, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true,
        ...options
      });

      let output = '';
      let errorOutput = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      child.on('close', (code) => {
        const fullOutput = output + errorOutput;
        const success = code === 0;
        
        this.results[name] = {
          success,
          output: fullOutput,
          errors: this.countErrors(fullOutput, name),
          filesModified: this.countFilesModified(fullOutput, name)
        };
        
        this.totalErrors += this.results[name].errors;
        
        if (success) {
          console.log(`✅ ${name} completed successfully`);
        } else {
          console.log(`❌ ${name} found ${this.results[name].errors} issues`);
        }
        
        resolve();
      });

      child.on('error', (error) => {
        console.log(`❌ ${name} failed to start: ${error.message}`);
        this.results[name] = {
          success: false,
          output: error.message,
          errors: 1,
          filesModified: 0
        };
        this.totalErrors += 1;
        resolve();
      });
    });
  }

  countErrors(output, tool) {
    switch (tool) {
      case 'eslint':
        const eslintMatches = output.match(/(\d+)\s+(error|warning)s?/gi);
        return eslintMatches ? parseInt(eslintMatches[0]) : 0;
      
      case 'prettier':
        const prettierMatches = output.match(/(\d+)\s+files?/gi);
        return prettierMatches ? parseInt(prettierMatches[0]) : 0;
      
      case 'markdownlint':
        const mdMatches = output.match(/(\d+)\s+violations?/gi);
        return mdMatches ? parseInt(mdMatches[0]) : 0;
      
      case 'cspell':
        const spellMatches = output.match(/(\d+)\s+spelling\s+errors?/gi);
        return spellMatches ? parseInt(spellMatches[0]) : 0;
      
      case 'linkValidation':
        const linkMatches = output.match(/(\d+)\s+broken\s+links?/gi);
        return linkMatches ? parseInt(linkMatches[0]) : 0;
      
      case 'accessibility':
        const a11yMatches = output.match(/(\d+)\s+accessibility\s+issues?/gi);
        return a11yMatches ? parseInt(a11yMatches[0]) : 0;
      
      case 'security':
        const securityMatches = output.match(/(\d+)\s+security\s+issues?/gi);
        return securityMatches ? parseInt(securityMatches[0]) : 0;
      
      default:
        return 0;
    }
  }

  countFilesModified(output, tool) {
    switch (tool) {
      case 'markdownCleanup':
        const modifiedMatches = output.match(/Files modified:\s*(\d+)/i);
        return modifiedMatches ? parseInt(modifiedMatches[1]) : 0;
      
      default:
        return 0;
    }
  }

  async runMarkdownCleanup() {
    console.log('\n🧹 Step 1: Cleaning up markdown files...');
    try {
      const { processMarkdownFiles } = require('./remove-more-from-md');
      await processMarkdownFiles();
      this.results.markdownCleanup.success = true;
    } catch (error) {
      console.log(`❌ Markdown cleanup failed: ${error.message}`);
      this.results.markdownCleanup.success = false;
      this.results.markdownCleanup.output = error.message;
    }
  }

  async runAllLinters() {
    console.log('\n🔍 Step 2: Running comprehensive linting...');
    
    // Run all linting tools in parallel
    await Promise.all([
      this.runCommand('npx', ['eslint', '.', '--ext', '.js,.jsx,.ts,.tsx'], 'eslint'),
      this.runCommand('npx', ['prettier', '--check', '**/*.{js,jsx,ts,tsx,json,md,html,css}'], 'prettier'),
      this.runCommand('npx', ['markdownlint', '**/*.md', '--ignore', 'node_modules/**'], 'markdownlint'),
      this.runCommand('npx', ['cspell', '**/*.{js,jsx,ts,tsx,md,html,css,json}'], 'cspell')
    ]);
  }

  async runAdditionalChecks() {
    console.log('\n🔍 Step 3: Running additional checks...');
    
    // Link validation
    try {
      await this.runCommand('node', ['scripts/validate-links.js'], 'linkValidation');
    } catch (error) {
      console.log('⚠️  Link validation not available');
    }

    // Security checks with npm audit
    try {
      await this.runCommand('npm', ['audit', '--audit-level=moderate'], 'security');
    } catch (error) {
      console.log('⚠️  Security audit not available');
    }

    // Accessibility checks (if pa11y is available)
    try {
      await this.runCommand('npx', ['pa11y-ci'], 'accessibility');
    } catch (error) {
      console.log('⚠️  Accessibility checks not available (install pa11y-ci for this)');
    }
  }

  async runAllChecks() {
    console.log('🚀 Starting Beam Universe comprehensive checks...\n');
    console.log('='.repeat(60));
    console.log('🔧 BEAM UNIVERSE - ALL CHECKS & FIXES');
    console.log('='.repeat(60));
    
    // Step 1: Clean up markdown files
    await this.runMarkdownCleanup();
    
    // Step 2: Run all linting tools
    await this.runAllLinters();
    
    // Step 3: Run additional checks
    await this.runAdditionalChecks();
    
    const endTime = Date.now();
    const duration = ((endTime - this.startTime) / 1000).toFixed(2);
    
    this.printResults(duration);
  }

  printResults(duration) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 COMPREHENSIVE CHECK RESULTS');
    console.log('='.repeat(60));
    
    // Group results by category
    const categories = {
      'Content Cleanup': ['markdownCleanup'],
      'Code Quality': ['eslint', 'prettier'],
      'Documentation': ['markdownlint', 'cspell'],
      'Infrastructure': ['linkValidation', 'accessibility', 'security']
    };
    
    Object.entries(categories).forEach(([category, tools]) => {
      console.log(`\n📁 ${category}:`);
      tools.forEach(tool => {
        const result = this.results[tool];
        if (result) {
          const status = result.success ? '✅ PASS' : '❌ FAIL';
          const errorInfo = result.errors > 0 ? ` (${result.errors} issues)` : '';
          const fileInfo = result.filesModified > 0 ? ` (${result.filesModified} files modified)` : '';
          console.log(`   ${status} ${tool.toUpperCase()}${errorInfo}${fileInfo}`);
          
          if (!result.success && result.output) {
            const firstLine = result.output.split('\n')[0];
            if (firstLine && firstLine.trim()) {
              console.log(`      Details: ${firstLine.substring(0, 50)}...`);
            }
          }
        }
      });
    });
    
    console.log('\n' + '-'.repeat(60));
    console.log(`⏱️  Total time: ${duration}s`);
    console.log(`📈 Total issues found: ${this.totalErrors}`);
    
    const successfulChecks = Object.values(this.results).filter(r => r.success).length;
    const totalChecks = Object.keys(this.results).length;
    
    console.log(`✅ Successful checks: ${successfulChecks}/${totalChecks}`);
    
    if (this.totalErrors === 0) {
      console.log('\n🎉 All checks passed! Your codebase is clean and ready.');
    } else {
      console.log('\n⚠️  Some issues were found. Here are quick fix commands:');
      console.log('\n💡 Quick Fix Commands:');
      console.log('   npm run lint:fix                    # Fix ESLint issues');
      console.log('   npm run format                      # Fix Prettier issues');
      console.log('   npx markdownlint --fix              # Fix markdown issues');
      console.log('   npx cspell --fix                    # Fix spelling issues');
      console.log('   npm audit fix                       # Fix security issues');
      console.log('   node scripts/validate-links.js      # Check broken links');
    }
    
    console.log('\n📋 Available Scripts:');
    console.log('   node scripts/linting/remove-more-from-md.js  # Clean markdown');
    console.log('   node scripts/linting/run-linting.js          # Run linting only');
    console.log('   node scripts/linting/run-all-checks.js       # Run all checks (this)');
    
    console.log('='.repeat(60));
  }

  async generateReport() {
    const reportPath = path.join(__dirname, 'comprehensive-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      project: 'Beam Universe',
      results: this.results,
      totalErrors: this.totalErrors,
      summary: {
        passed: Object.values(this.results).filter(r => r.success).length,
        failed: Object.values(this.results).filter(r => !r.success).length,
        total: Object.keys(this.results).length
      },
      recommendations: this.generateRecommendations()
    };
    
    try {
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`\n📄 Comprehensive report saved to: ${reportPath}`);
    } catch (error) {
      console.error(`\n❌ Failed to save report: ${error.message}`);
    }
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (!this.results.eslint.success) {
      recommendations.push('Run "npm run lint:fix" to automatically fix ESLint issues');
    }
    
    if (!this.results.prettier.success) {
      recommendations.push('Run "npm run format" to fix code formatting issues');
    }
    
    if (!this.results.markdownlint.success) {
      recommendations.push('Run "npx markdownlint --fix" to fix markdown issues');
    }
    
    if (!this.results.cspell.success) {
      recommendations.push('Run "npx cspell --fix" to fix spelling issues');
    }
    
    if (!this.results.security.success) {
      recommendations.push('Run "npm audit fix" to fix security vulnerabilities');
    }
    
    return recommendations;
  }
}

async function main() {
  const runner = new BeamAllChecksRunner();
  
  try {
    await runner.runAllChecks();
    await runner.generateReport();
    
    // Exit with appropriate code
    process.exit(runner.totalErrors > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ Comprehensive check process failed:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = BeamAllChecksRunner;
