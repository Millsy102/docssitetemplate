#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

/**
 * Test Runner for Emoji Removal Utility
 * Provides easy access to run tests with different configurations
 */

class TestRunner {
    constructor() {
        this.jestConfigPath = path.join(__dirname, 'jest.config.js');
        this.testDir = path.join(__dirname, '__tests__');
    }

    /**
     * Run tests with specified options
     */
    async runTests(options = {}) {
        const {
            coverage = false,
            watch = false,
            verbose = false,
            testPattern = null
        } = options;

        const args = ['--config', this.jestConfigPath];

        if (coverage) {
            args.push('--coverage');
        }

        if (watch) {
            args.push('--watch');
        }

        if (verbose) {
            args.push('--verbose');
        }

        if (testPattern) {
            args.push('--testNamePattern', testPattern);
        }

        console.log('🧪 Running Emoji Removal Tests...');
        console.log(`📁 Test Directory: ${this.testDir}`);
        console.log(`⚙️  Jest Config: ${this.jestConfigPath}`);
        console.log(`🔧 Options: ${JSON.stringify(options, null, 2)}`);
        console.log('');

        return new Promise((resolve, reject) => {
            const jest = spawn('npx', ['jest', ...args], {
                stdio: 'inherit',
                shell: true
            });

            jest.on('close', (code) => {
                if (code === 0) {
                    console.log('\n✅ Tests completed successfully!');
                    resolve();
                } else {
                    console.log(`\n❌ Tests failed with exit code ${code}`);
                    reject(new Error(`Tests failed with exit code ${code}`));
                }
            });

            jest.on('error', (error) => {
                console.error('❌ Failed to start Jest:', error.message);
                reject(error);
            });
        });
    }

    /**
     * Run unit tests only
     */
    async runUnitTests(options = {}) {
        console.log('🔬 Running Unit Tests...');
        return this.runTests({
            ...options,
            testPattern: 'Unit'
        });
    }

    /**
     * Run integration tests only
     */
    async runIntegrationTests(options = {}) {
        console.log('🔗 Running Integration Tests...');
        return this.runTests({
            ...options,
            testPattern: 'Integration'
        });
    }

    /**
     * Run tests with coverage
     */
    async runTestsWithCoverage(options = {}) {
        console.log('📊 Running Tests with Coverage...');
        return this.runTests({
            ...options,
            coverage: true
        });
    }

    /**
     * Run tests in watch mode
     */
    async runTestsInWatchMode(options = {}) {
        console.log('👀 Running Tests in Watch Mode...');
        return this.runTests({
            ...options,
            watch: true
        });
    }

    /**
     * Show test summary
     */
    showTestSummary() {
        console.log('📋 Emoji Removal Test Suite Summary:');
        console.log('');
        console.log('📁 Test Files:');
        console.log('  ├── remove-emojis.test.js (Unit Tests)');
        console.log('  └── remove-emojis.integration.test.js (Integration Tests)');
        console.log('');
        console.log('🧪 Test Categories:');
        console.log('  ├── Constructor & Initialization');
        console.log('  ├── Emoji Removal Logic');
        console.log('  ├── File Processing');
        console.log('  ├── Directory Traversal');
        console.log('  ├── Path Exclusion');
        console.log('  ├── Error Handling');
        console.log('  ├── Statistics Tracking');
        console.log('  ├── CLI Interface');
        console.log('  └── Edge Cases');
        console.log('');
        console.log('🚀 Available Commands:');
        console.log('  npm run test:scripts              # Run all tests');
        console.log('  npm run test:scripts:coverage     # Run tests with coverage');
        console.log('  node test-runner.js --unit        # Run unit tests only');
        console.log('  node test-runner.js --integration # Run integration tests only');
        console.log('  node test-runner.js --coverage    # Run with coverage');
        console.log('  node test-runner.js --watch       # Run in watch mode');
        console.log('  node test-runner.js --verbose     # Run with verbose output');
        console.log('');
    }
}

// CLI Interface
if (require.main === module) {
    const runner = new TestRunner();
    const args = process.argv.slice(2);

    // Parse command line arguments
    const options = {
        coverage: args.includes('--coverage') || args.includes('-c'),
        watch: args.includes('--watch') || args.includes('-w'),
        verbose: args.includes('--verbose') || args.includes('-v'),
        unit: args.includes('--unit') || args.includes('-u'),
        integration: args.includes('--integration') || args.includes('-i'),
        summary: args.includes('--summary') || args.includes('-s'),
        help: args.includes('--help') || args.includes('-h')
    };

    // Show help
    if (options.help) {
        console.log(`
🧪 Emoji Removal Test Runner

Usage: node test-runner.js [options]

Options:
  --unit, -u           Run unit tests only
  --integration, -i    Run integration tests only
  --coverage, -c       Run tests with coverage
  --watch, -w          Run tests in watch mode
  --verbose, -v        Run with verbose output
  --summary, -s        Show test summary
  --help, -h           Show this help message

Examples:
  node test-runner.js
  node test-runner.js --unit
  node test-runner.js --integration --coverage
  node test-runner.js --watch --verbose
  node test-runner.js --summary

Or use npm scripts:
  npm run test:scripts
  npm run test:scripts:coverage
        `);
        process.exit(0);
    }

    // Show summary
    if (options.summary) {
        runner.showTestSummary();
        process.exit(0);
    }

    // Run appropriate tests
    const runTests = async () => {
        try {
            if (options.unit) {
                await runner.runUnitTests(options);
            } else if (options.integration) {
                await runner.runIntegrationTests(options);
            } else {
                await runner.runTests(options);
            }
        } catch (error) {
            console.error('❌ Test execution failed:', error.message);
            process.exit(1);
        }
    };

    runTests();
}

module.exports = TestRunner;
