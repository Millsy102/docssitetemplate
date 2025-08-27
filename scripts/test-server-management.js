#!/usr/bin/env node

/**
 * Test script for BeamFlow Server Management System
 * Verifies that all components are properly configured and accessible
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFileExists(filePath, description) {
    try {
        if (fs.existsSync(filePath)) {
            log(` ${description}: Found`, 'green');
            return true;
        } else {
            log(` ${description}: Not found`, 'red');
            return false;
        }
    } catch (error) {
        log(` ${description}: Error checking file`, 'red');
        return false;
    }
}

function checkNpmScript(scriptName, description) {
    try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        if (packageJson.scripts && packageJson.scripts[scriptName]) {
            log(` ${description}: Available`, 'green');
            return true;
        } else {
            log(` ${description}: Not found in package.json`, 'red');
            return false;
        }
    } catch (error) {
        log(` ${description}: Error checking npm script`, 'red');
        return false;
    }
}

function checkBackendDependencies() {
    try {
        const backendPackageJson = path.join('_internal', 'system', 'package.json');
        if (fs.existsSync(backendPackageJson)) {
            const packageJson = JSON.parse(fs.readFileSync(backendPackageJson, 'utf8'));
            const hasFtpDeps = packageJson.dependencies && (
                packageJson.dependencies['ftp-srv'] || 
                packageJson.dependencies['ssh2']
            );
            if (hasFtpDeps) {
                log(` Backend dependencies: FTP/SSH packages found`, 'green');
                return true;
            } else {
                log(` Backend dependencies: FTP/SSH packages missing`, 'red');
                return false;
            }
        } else {
            log(` Backend dependencies: package.json not found`, 'red');
            return false;
        }
    } catch (error) {
        log(` Backend dependencies: Error checking`, 'red');
        return false;
    }
}

function testNpmScript(scriptName) {
    try {
        log(` Testing npm script: ${scriptName}`, 'blue');
        execSync(`npm run ${scriptName} --silent`, { stdio: 'pipe' });
        log(` npm script ${scriptName}: Executed successfully`, 'green');
        return true;
    } catch (error) {
        log(` npm script ${scriptName}: Failed to execute`, 'red');
        return false;
    }
}

// Main test function
function runTests() {
    log(' BeamFlow Server Management System Test', 'blue');
    log('==========================================', 'blue');
    console.log('');

    let allTestsPassed = true;

    // Test 1: Check if backend components exist
    log(' Checking backend components...', 'yellow');
    const backendTests = [
        checkFileExists('_internal/system/src/ftp-server.js', 'FTP Server'),
        checkFileExists('_internal/system/src/ssh-server.js', 'SSH Server'),
        checkFileExists('_internal/system/src/process-manager.js', 'Process Manager'),
        checkFileExists('_internal/system/package.json', 'Backend package.json')
    ];

    if (backendTests.every(test => test)) {
        log(' All backend components found', 'green');
    } else {
        log(' Some backend components missing', 'red');
        allTestsPassed = false;
    }
    console.log('');

    // Test 2: Check if npm scripts are defined
    log(' Checking npm scripts...', 'yellow');
    const npmScriptTests = [
        checkNpmScript('servers:start', 'servers:start'),
        checkNpmScript('servers:stop', 'servers:stop'),
        checkNpmScript('servers:status', 'servers:status'),
        checkNpmScript('ftp:start', 'ftp:start'),
        checkNpmScript('ssh:start', 'ssh:start')
    ];

    if (npmScriptTests.every(test => test)) {
        log(' All npm scripts defined', 'green');
    } else {
        log(' Some npm scripts missing', 'red');
        allTestsPassed = false;
    }
    console.log('');

    // Test 3: Check backend dependencies
    log(' Checking backend dependencies...', 'yellow');
    if (checkBackendDependencies()) {
        log(' Backend dependencies configured', 'green');
    } else {
        log(' Backend dependencies missing', 'red');
        allTestsPassed = false;
    }
    console.log('');

    // Test 4: Test npm scripts (non-destructive tests only)
    log(' Testing npm scripts (status only)...', 'yellow');
    if (testNpmScript('servers:status')) {
        log(' Status command working', 'green');
    } else {
        log(' Status command failed', 'red');
        allTestsPassed = false;
    }
    console.log('');

    // Summary
    log(' Test Summary', 'blue');
    log('==============', 'blue');
    
    if (allTestsPassed) {
        log(' All tests passed! Server management system is properly configured.', 'green');
        log(' You can now use the server management scripts:', 'blue');
        log('   npm run servers:start    # Start all servers', 'blue');
        log('   npm run servers:stop     # Stop all servers', 'blue');
        log('   npm run servers:status   # Check server status', 'blue');
    } else {
        log('  Some tests failed. Please check the issues above.', 'yellow');
        log(' To fix missing backend dependencies:', 'blue');
        log('   cd _internal/system && npm install', 'blue');
    }

    console.log('');
    log(' For more information, see scripts/SERVER_MANAGEMENT_README.md', 'blue');
}

// Run tests if this script is executed directly
if (require.main === module) {
    runTests();
}

module.exports = { runTests };
