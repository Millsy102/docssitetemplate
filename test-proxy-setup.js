#!/usr/bin/env node

/**
 * Test script to verify the development proxy setup
 * Run this after starting both frontend and backend servers
 */

const http = require('http');
const https = require('https');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, description) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function testEndpoint(url, description, expectedStatus = 200) {
  try {
    log(`\n${colors.cyan}Testing: ${description}${colors.reset}`);
    log(`URL: ${url}`, 'blue');
    
    const response = await makeRequest(url);
    
    if (response.statusCode === expectedStatus) {
      log(` ${description} - Status: ${response.statusCode}`, 'green');
      return true;
    } else {
      log(` ${description} - Expected ${expectedStatus}, got ${response.statusCode}`, 'red');
      return false;
    }
  } catch (error) {
    log(` ${description} - Error: ${error.message}`, 'red');
    return false;
  }
}

async function runTests() {
  log('\n BeamFlow Development Proxy Test Suite', 'bright');
  log('==========================================', 'bright');
  
  const tests = [
    {
      url: 'http://localhost:3000',
      description: 'Frontend Dev Server (Vite)',
      expectedStatus: 200
    },
    {
      url: 'http://localhost:3001',
      description: 'Backend API Server (Express)',
      expectedStatus: 200
    },
    {
      url: 'http://localhost:3000/api/health',
      description: 'API Health Check (via Proxy)',
      expectedStatus: 200
    },
    {
      url: 'http://localhost:3001/api/health',
      description: 'API Health Check (Direct)',
      expectedStatus: 200
    },
    {
      url: 'http://localhost:3000/admin',
      description: 'Admin Dashboard (via Proxy)',
      expectedStatus: 200
    },
    {
      url: 'http://localhost:3001/admin',
      description: 'Admin Dashboard (Direct)',
      expectedStatus: 200
    }
  ];

  let passed = 0;
  let total = tests.length;

  for (const test of tests) {
    const success = await testEndpoint(test.url, test.description, test.expectedStatus);
    if (success) passed++;
  }

  log('\n Test Results', 'bright');
  log('==============', 'bright');
  log(`Passed: ${passed}/${total}`, passed === total ? 'green' : 'yellow');
  
  if (passed === total) {
    log('\n All tests passed! Your development proxy setup is working correctly.', 'green');
    log('\nYou can now:', 'bright');
    log('• Access the frontend at: http://localhost:3000', 'cyan');
    log('• Make API calls from frontend (they will be proxied to backend)', 'cyan');
    log('• Access admin dashboard at: http://localhost:3000/admin', 'cyan');
  } else {
    log('\n  Some tests failed. Please check:', 'yellow');
    log('1. Is the frontend server running? (npm run dev)', 'yellow');
    log('2. Is the backend server running? (npm run dev:backend:env)', 'yellow');
    log('3. Are the ports 3000 and 3001 available?', 'yellow');
    log('4. Check the proxy configuration in vite.config.ts', 'yellow');
  }

  log('\n For more information, see: DEVELOPMENT_PROXY_SETUP.md', 'blue');
}

// Run the tests
runTests().catch(console.error);
