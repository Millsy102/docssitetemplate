#!/usr/bin/env node

const { spawn } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

/**
 * Comprehensive linting script
 * Runs all available linting tools and reports results
 */

class LintingRunner {
  constructor() {
    this.results = {
      eslint: { success: false, output: '', errors: 0 },
      prettier: { success: false, output: '', errors: 0 },
      markdownlint: { success: false, output: '', errors: 0 },
      cspell: { success: false, output: '', errors: 0 }
    };
    this.totalErrors = 0;
  }

  async runCommand(command, args, name) {
    return new Promise((resolve) => {
      console.log(`\n🔍 Running ${name}...`);
      
      const child = spawn(command, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
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
        const errorCount = this.countErrors(fullOutput, name);
        
        this.results[name] = {
          success,
          output: fullOutput,
          errors: errorCount
        };
        
        this.totalErrors += errorCount;
        
        if (success) {
          console.log(`✅ ${name} completed successfully`);
        } else {
          console.log(`❌ ${name} found ${errorCount} issues`);
        }
        
        resolve();
      });

      child.on('error', (error) => {
        console.log(`❌ ${name} failed to start: ${error.message}`);
        this.results[name] = {
          success: false,
          output: error.message,
          errors: 1
        };
        this.totalErrors += 1;
        resolve();
      });
    });
  }

  countErrors(output, tool) {
    switch (tool) {
      case 'eslint':
        // Count ESLint errors and warnings
        const eslintMatches = output.match(/(\d+)\s+(error|warning)s?/gi);
        return eslintMatches ? parseInt(eslintMatches[0]) : 0;
      
      case 'prettier':
        // Count files that need formatting
        const prettierMatches = output.match(/(\d+)\s+files?/gi);
        return prettierMatches ? parseInt(prettierMatches[0]) : 0;
      
      case 'markdownlint':
        // Count markdownlint violations
        const mdMatches = output.match(/(\d+)\s+violations?/gi);
        return mdMatches ? parseInt(mdMatches[0]) : 0;
      
      case 'cspell':
        // Count spelling errors
        const spellMatches = output.match(/(\d+)\s+spelling\s+errors?/gi);
        return spellMatches ? parseInt(spellMatches[0]) : 0;
      
      default:
        return 0;
    }
  }

  async runAllLinters() {
    console.log('🚀 Starting comprehensive linting process...\n');
    
    const startTime = Date.now();
    
    // Run all linting tools in parallel
    await Promise.all([
      this.runCommand('npx', ['eslint', '.', '--ext', '.js,.jsx,.ts,.tsx'], 'eslint'),
      this.runCommand('npx', ['prettier', '--check', '**/*.{js,jsx,ts,tsx,json,md,html,css}'], 'prettier'),
      this.runCommand('npx', ['markdownlint', '**/*.md', '--ignore', 'node_modules/**'], 'markdownlint'),
      this.runCommand('npx', ['cspell', '**/*.{js,jsx,ts,tsx,md,html,css,json}'], 'cspell')
    ]);
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    this.printResults(duration);
  }

  printResults(duration) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 LINTING RESULTS SUMMARY');
    console.log('='.repeat(60));
    
    Object.entries(this.results).forEach(([tool, result]) => {
      const status = result.success ? '✅ PASS' : '❌ FAIL';
      const errorInfo = result.errors > 0 ? ` (${result.errors} issues)` : '';
      console.log(`${status} ${tool.toUpperCase()}${errorInfo}`);
      
      if (!result.success && result.output) {
        console.log(`   Details: ${result.output.split('\n')[0]}`);
      }
    });
    
    console.log('\n' + '-'.repeat(60));
    console.log(`⏱️  Total time: ${duration}s`);
    console.log(`📈 Total issues found: ${this.totalErrors}`);
    
    if (this.totalErrors === 0) {
      console.log('\n🎉 All linting checks passed!');
    } else {
      console.log('\n⚠️  Some issues were found. Please review and fix them.');
      console.log('\n💡 Quick fix commands:');
      console.log('   npm run lint:fix          # Fix ESLint issues');
      console.log('   npm run format            # Fix Prettier issues');
      console.log('   npx markdownlint --fix    # Fix markdown issues');
    }
    
    console.log('='.repeat(60));
  }

  async generateReport() {
    const reportPath = path.join(__dirname, 'linting-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      results: this.results,
      totalErrors: this.totalErrors,
      summary: {
        passed: Object.values(this.results).filter(r => r.success).length,
        failed: Object.values(this.results).filter(r => !r.success).length,
        total: Object.keys(this.results).length
      }
    };
    
    try {
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`\n📄 Report saved to: ${reportPath}`);
    } catch (error) {
      console.error(`\n❌ Failed to save report: ${error.message}`);
    }
  }
}

async function main() {
  const runner = new LintingRunner();
  
  try {
    await runner.runAllLinters();
    await runner.generateReport();
    
    // Exit with appropriate code
    process.exit(runner.totalErrors > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ Linting process failed:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = LintingRunner;
