#!/usr/bin/env node

/**
 * Rate Limiting Test Script
 * 
 * This script tests the rate limiting implementation by making multiple
 * requests to different endpoints and verifying that rate limits are enforced.
 */

const axios = require('axios');

// Configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const TEST_DELAY = 100; // ms between requests

// Test scenarios
const testScenarios = [
    {
        name: 'Global Rate Limiting',
        endpoint: '/health',
        expectedLimit: 1000,
        requests: 5
    },
    {
        name: 'API Rate Limiting',
        endpoint: '/api/auth/config',
        expectedLimit: 500,
        requests: 5
    },
    {
        name: 'Auth Rate Limiting',
        endpoint: '/api/auth/login',
        method: 'POST',
        data: { username: 'test', password: 'test' },
        expectedLimit: 5,
        requests: 3
    }
];

async function makeRequest(scenario, index) {
    try {
        const config = {
            method: scenario.method || 'GET',
            url: `${BASE_URL}${scenario.endpoint}`,
            timeout: 5000
        };

        if (scenario.data) {
            config.data = scenario.data;
        }

        const response = await axios(config);
        
        // Check for rate limit headers
        const limitHeader = response.headers['x-ratelimit-limit'];
        const remainingHeader = response.headers['x-ratelimit-remaining'];
        const resetHeader = response.headers['x-ratelimit-reset'];

        console.log(`  Request ${index + 1}: Success (${response.status})`);
        console.log(`    Rate Limit: ${limitHeader}/${remainingHeader} (resets: ${resetHeader})`);
        
        return {
            success: true,
            status: response.status,
            limit: limitHeader,
            remaining: remainingHeader,
            reset: resetHeader
        };
    } catch (error) {
        if (error.response && error.response.status === 429) {
            console.log(`  Request ${index + 1}: Rate Limited (429)`);
            console.log(`    Error: ${error.response.data.error}`);
            console.log(`    Retry After: ${error.response.data.retryAfter}s`);
            
            return {
                success: false,
                status: 429,
                error: error.response.data.error,
                retryAfter: error.response.data.retryAfter
            };
        } else {
            console.log(`  Request ${index + 1}: Error (${error.response?.status || 'Network Error'})`);
            return {
                success: false,
                status: error.response?.status || 0,
                error: error.message
            };
        }
    }
}

async function testScenario(scenario) {
    console.log(`\n🧪 Testing: ${scenario.name}`);
    console.log(`   Endpoint: ${scenario.endpoint}`);
    console.log(`   Expected Limit: ${scenario.expectedLimit}`);
    console.log(`   Requests: ${scenario.requests}`);
    
    const results = [];
    
    for (let i = 0; i < scenario.requests; i++) {
        const result = await makeRequest(scenario, i);
        results.push(result);
        
        // Add delay between requests
        if (i < scenario.requests - 1) {
            await new Promise(resolve => setTimeout(resolve, TEST_DELAY));
        }
    }
    
    // Analyze results
    const successfulRequests = results.filter(r => r.success).length;
    const rateLimitedRequests = results.filter(r => r.status === 429).length;
    const otherErrors = results.filter(r => !r.success && r.status !== 429).length;
    
    console.log(`\n   Results:`);
    console.log(`     Successful: ${successfulRequests}`);
    console.log(`     Rate Limited: ${rateLimitedRequests}`);
    console.log(`     Other Errors: ${otherErrors}`);
    
    // Check if rate limiting is working
    if (rateLimitedRequests > 0) {
        console.log(`   ✅ Rate limiting is working (${rateLimitedRequests} requests blocked)`);
    } else if (successfulRequests === scenario.requests) {
        console.log(`   ⚠️  All requests succeeded - rate limits may be too high or not enforced`);
    } else {
        console.log(`   ❌ Unexpected errors occurred`);
    }
    
    return {
        scenario: scenario.name,
        successful: successfulRequests,
        rateLimited: rateLimitedRequests,
        errors: otherErrors
    };
}

async function testRateLimitStats() {
    console.log(`\n📊 Testing Rate Limit Statistics Endpoint`);
    
    try {
        // Note: This endpoint requires admin authentication
        // In a real test, you would need to provide valid admin credentials
        const response = await axios.get(`${BASE_URL}/api/rate-limit/stats`, {
            timeout: 5000,
            headers: {
                'X-API-Key': process.env.ADMIN_API_KEY || 'test-key'
            }
        });
        
        console.log(`   ✅ Rate limit stats endpoint accessible`);
        console.log(`   Response:`, JSON.stringify(response.data, null, 2));
        
        return true;
    } catch (error) {
        console.log(`   ❌ Rate limit stats endpoint error: ${error.response?.status || error.message}`);
        return false;
    }
}

async function runTests() {
    console.log('🚀 Starting Rate Limiting Tests');
    console.log(`   Base URL: ${BASE_URL}`);
    console.log(`   Test Delay: ${TEST_DELAY}ms`);
    
    const startTime = Date.now();
    const results = [];
    
    // Test each scenario
    for (const scenario of testScenarios) {
        const result = await testScenario(scenario);
        results.push(result);
    }
    
    // Test rate limit stats endpoint
    await testRateLimitStats();
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Summary
    console.log(`\n📋 Test Summary`);
    console.log(`   Duration: ${duration}ms`);
    console.log(`   Scenarios: ${results.length}`);
    
    const totalSuccessful = results.reduce((sum, r) => sum + r.successful, 0);
    const totalRateLimited = results.reduce((sum, r) => sum + r.rateLimited, 0);
    const totalErrors = results.reduce((sum, r) => sum + r.errors, 0);
    
    console.log(`   Total Requests: ${totalSuccessful + totalRateLimited + totalErrors}`);
    console.log(`   Successful: ${totalSuccessful}`);
    console.log(`   Rate Limited: ${totalRateLimited}`);
    console.log(`   Errors: ${totalErrors}`);
    
    if (totalRateLimited > 0) {
        console.log(`\n✅ Rate limiting system is working correctly!`);
    } else {
        console.log(`\n⚠️  Rate limiting may not be enforced or limits are too high`);
    }
    
    console.log(`\n💡 Tips:`);
    console.log(`   - Check server logs for rate limiting activity`);
    console.log(`   - Verify Redis connection if using distributed rate limiting`);
    console.log(`   - Adjust limits in rate-limit-config.js if needed`);
    console.log(`   - Use RATE_LIMIT_LOGGING=true for detailed logs`);
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
Rate Limiting Test Script

Usage: node test-rate-limiting.js [options]

Options:
  --base-url <url>    Base URL for testing (default: http://localhost:3000)
  --delay <ms>        Delay between requests in milliseconds (default: 100)
  --help, -h          Show this help message

Environment Variables:
  TEST_BASE_URL       Base URL for testing
  ADMIN_API_KEY       Admin API key for testing protected endpoints

Examples:
  node test-rate-limiting.js
  node test-rate-limiting.js --base-url http://localhost:3000 --delay 200
  TEST_BASE_URL=http://localhost:3000 node test-rate-limiting.js
`);
    process.exit(0);
}

// Parse command line arguments
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
    if (args[i] === '--base-url' && args[i + 1]) {
        process.env.TEST_BASE_URL = args[i + 1];
        i++;
    } else if (args[i] === '--delay' && args[i + 1]) {
        process.env.TEST_DELAY = parseInt(args[i + 1]);
        i++;
    }
}

// Run tests
runTests().catch(error => {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
});
