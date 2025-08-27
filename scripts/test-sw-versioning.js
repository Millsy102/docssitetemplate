#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const ServiceWorkerVersionGenerator = require('./generate-sw-version.js');

/**
 * Test script for Service Worker Versioning
 * Verifies that the versioning system works correctly
 */

class ServiceWorkerVersioningTester {
    constructor() {
        this.projectRoot = path.join(__dirname, '..');
        this.swGenerator = new ServiceWorkerVersionGenerator();
    }

    /**
     * Run all tests
     */
    async runTests() {
        console.log(' Testing Service Worker Versioning...\n');

        const tests = [
            this.testVersionGeneration,
            this.testBuildHash,
            this.testGitInfo,
            this.testCacheNames,
            this.testServiceWorkerGeneration,
            this.testVersionInfoStructure
        ];

        let passed = 0;
        let failed = 0;

        for (const test of tests) {
            try {
                await test.call(this);
                console.log(` ${test.name} - PASSED`);
                passed++;
            } catch (error) {
                console.log(` ${test.name} - FAILED: ${error.message}`);
                failed++;
            }
        }

        console.log(`\n Test Results: ${passed} passed, ${failed} failed`);

        if (failed > 0) {
            process.exit(1);
        } else {
            console.log(' All tests passed!');
        }
    }

    /**
     * Test version generation
     */
    async testVersionGeneration() {
        const versionInfo = this.swGenerator.generateVersionInfo();
        
        if (!versionInfo.version) {
            throw new Error('Version is missing');
        }

        if (!versionInfo.version.includes('-')) {
            throw new Error('Version should contain package version and build hash');
        }

        const [packageVersion, buildHash] = versionInfo.version.split('-');
        
        if (!packageVersion || !buildHash) {
            throw new Error('Version format should be packageVersion-buildHash');
        }

        if (buildHash.length < 8) {
            throw new Error('Build hash should be at least 8 characters');
        }
    }

    /**
     * Test build hash generation
     */
    async testBuildHash() {
        const buildHash1 = this.swGenerator.generateBuildHash();
        const buildHash2 = this.swGenerator.generateBuildHash();

        if (!buildHash1 || !buildHash2) {
            throw new Error('Build hash generation failed');
        }

        if (buildHash1.length !== buildHash2.length) {
            throw new Error('Build hash length should be consistent');
        }

        // Hash should be alphanumeric
        if (!/^[a-f0-9]+$/i.test(buildHash1)) {
            throw new Error('Build hash should be hexadecimal');
        }
    }

    /**
     * Test Git information
     */
    async testGitInfo() {
        const gitInfo = this.swGenerator.getGitInfo();

        if (!gitInfo) {
            throw new Error('Git info is missing');
        }

        if (!gitInfo.commit || !gitInfo.branch || !gitInfo.date) {
            throw new Error('Git info should contain commit, branch, and date');
        }

        if (typeof gitInfo.dirty !== 'boolean') {
            throw new Error('Git dirty flag should be boolean');
        }
    }

    /**
     * Test cache names
     */
    async testCacheNames() {
        const versionInfo = this.swGenerator.generateVersionInfo();
        const { cache } = versionInfo;

        const requiredCaches = ['static', 'dynamic', 'api', 'runtime'];

        for (const cacheName of requiredCaches) {
            if (!cache[cacheName]) {
                throw new Error(`Cache name '${cacheName}' is missing`);
            }

            if (!cache[cacheName].includes(versionInfo.buildHash)) {
                throw new Error(`Cache name '${cacheName}' should include build hash`);
            }
        }
    }

    /**
     * Test service worker generation
     */
    async testServiceWorkerGeneration() {
        const versionInfo = this.swGenerator.generateVersionInfo();
        
        // Test service worker generation
        const generatedInfo = this.swGenerator.generateServiceWorker(versionInfo);
        
        if (!generatedInfo) {
            throw new Error('Service worker generation failed');
        }

        // Check if service worker file exists
        const swPath = path.join(this.projectRoot, 'dist', 'sw.js');
        if (!fs.existsSync(swPath)) {
            throw new Error('Service worker file not generated');
        }

        // Check if version info file exists
        const versionPath = path.join(this.projectRoot, 'dist', 'sw-version.json');
        if (!fs.existsSync(versionPath)) {
            throw new Error('Version info file not generated');
        }

        // Verify service worker content
        const swContent = fs.readFileSync(swPath, 'utf8');
        if (!swContent.includes(versionInfo.version)) {
            throw new Error('Service worker should contain version information');
        }

        // Verify version info file
        const versionContent = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
        if (versionContent.version !== versionInfo.version) {
            throw new Error('Version info file should match generated version');
        }
    }

    /**
     * Test version info structure
     */
    async testVersionInfoStructure() {
        const versionInfo = this.swGenerator.generateVersionInfo();

        const requiredFields = [
            'version',
            'buildHash',
            'timestamp',
            'git',
            'package',
            'cache',
            'features'
        ];

        for (const field of requiredFields) {
            if (!(field in versionInfo)) {
                throw new Error(`Version info missing required field: ${field}`);
            }
        }

        // Test nested structures
        if (!versionInfo.git.commit || !versionInfo.git.branch) {
            throw new Error('Git info should contain commit and branch');
        }

        if (!versionInfo.package.version || !versionInfo.package.name) {
            throw new Error('Package info should contain version and name');
        }

        if (!versionInfo.cache.static || !versionInfo.cache.dynamic) {
            throw new Error('Cache info should contain static and dynamic caches');
        }

        if (typeof versionInfo.features.offlineSupport !== 'boolean') {
            throw new Error('Features should contain boolean flags');
        }

        // Test timestamp
        if (typeof versionInfo.timestamp !== 'number') {
            throw new Error('Timestamp should be a number');
        }

        if (versionInfo.timestamp > Date.now()) {
            throw new Error('Timestamp should not be in the future');
        }
    }

    /**
     * Test cache manifest generation
     */
    async testCacheManifest() {
        const versionInfo = this.swGenerator.generateVersionInfo();
        const manifest = this.swGenerator.generateCacheManifest(versionInfo);

        if (!manifest.version || !manifest.timestamp) {
            throw new Error('Cache manifest should contain version and timestamp');
        }

        if (!Array.isArray(manifest.files)) {
            throw new Error('Cache manifest should contain files array');
        }

        // Check if manifest file exists
        const manifestPath = path.join(this.projectRoot, 'dist', 'cache-manifest.json');
        if (!fs.existsSync(manifestPath)) {
            throw new Error('Cache manifest file not generated');
        }
    }

    /**
     * Test build integration
     */
    async testBuildIntegration() {
        const BuildWithServiceWorker = require('./build-with-sw.js');
        const buildScript = new BuildWithServiceWorker();

        // Test that build script can be instantiated
        if (!buildScript) {
            throw new Error('Build script instantiation failed');
        }

        // Test that required methods exist
        const requiredMethods = ['build', 'generateServiceWorker', 'copyAdditionalFiles'];
        
        for (const method of requiredMethods) {
            if (typeof buildScript[method] !== 'function') {
                throw new Error(`Build script missing required method: ${method}`);
            }
        }
    }
}

// Run tests if called directly
if (require.main === module) {
    const tester = new ServiceWorkerVersioningTester();
    tester.runTests().catch(error => {
        console.error(' Test runner failed:', error);
        process.exit(1);
    });
}

module.exports = ServiceWorkerVersioningTester;
