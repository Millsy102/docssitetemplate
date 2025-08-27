#!/usr/bin/env node

/**
 * Security Headers Testing Script
 * Tests and verifies that all security headers are properly applied
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

class SecurityHeadersTester {
    constructor() {
        this.results = [];
        this.requiredHeaders = [
            'X-Content-Type-Options',
            'X-Frame-Options',
            'X-XSS-Protection',
            'Referrer-Policy',
            'Permissions-Policy',
            'Cross-Origin-Embedder-Policy',
            'Cross-Origin-Opener-Policy',
            'Cross-Origin-Resource-Policy',
            'Origin-Agent-Cluster',
            'X-Download-Options',
            'X-Permitted-Cross-Domain-Policies',
            'X-DNS-Prefetch-Control',
            'Strict-Transport-Security'
        ];
        
        this.sensitiveHeaders = [
            'Cache-Control',
            'Pragma',
            'Expires'
        ];
    }

    async testEndpoint(url, description = '') {
        return new Promise((resolve, reject) => {
            const urlObj = new URL(url);
            const client = urlObj.protocol === 'https:' ? https : http;
            
            const options = {
                hostname: urlObj.hostname,
                port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
                path: urlObj.pathname + urlObj.search,
                method: 'GET',
                headers: {
                    'User-Agent': 'SecurityHeadersTester/1.0'
                }
            };

            const req = client.request(options, (res) => {
                const headers = res.headers;
                const statusCode = res.statusCode;
                
                const result = {
                    url,
                    description,
                    statusCode,
                    headers: headers,
                    missingHeaders: [],
                    presentHeaders: [],
                    score: 0
                };

                // Check required security headers
                this.requiredHeaders.forEach(header => {
                    if (headers[header.toLowerCase()]) {
                        result.presentHeaders.push(header);
                        result.score += 1;
                    } else {
                        result.missingHeaders.push(header);
                    }
                });

                // Check for server information leakage
                if (headers['server'] || headers['x-powered-by']) {
                    result.warnings = result.warnings || [];
                    result.warnings.push('Server information exposed');
                }

                // Check Content Security Policy
                if (headers['content-security-policy']) {
                    result.presentHeaders.push('Content-Security-Policy');
                    result.score += 1;
                } else {
                    result.missingHeaders.push('Content-Security-Policy');
                }

                // Check for sensitive page headers
                if (url.includes('/api/') || url.includes('/admin/')) {
                    const hasNoCache = headers['cache-control'] && 
                                     headers['cache-control'].includes('no-cache');
                    if (hasNoCache) {
                        result.presentHeaders.push('Cache-Control (no-cache)');
                        result.score += 1;
                    } else {
                        result.missingHeaders.push('Cache-Control (no-cache)');
                    }
                }

                resolve(result);
            });

            req.on('error', (error) => {
                reject({ url, description, error: error.message });
            });

            req.setTimeout(10000, () => {
                req.destroy();
                reject({ url, description, error: 'Request timeout' });
            });

            req.end();
        });
    }

    async runTests(baseUrl) {
        console.log(' Testing Security Headers...\n');
        
        const testUrls = [
            { url: baseUrl, description: 'Homepage' },
            { url: `${baseUrl}/api/auth/config`, description: 'API Endpoint' },
            { url: `${baseUrl}/health`, description: 'Health Check' },
            { url: `${baseUrl}/docs/getting-started`, description: 'Documentation' },
            { url: `${baseUrl}/assets/main.js`, description: 'Static Asset' }
        ];

        for (const test of testUrls) {
            try {
                const result = await this.testEndpoint(test.url, test.description);
                this.results.push(result);
                
                console.log(` ${test.description} (${test.url})`);
                console.log(`   Status: ${result.statusCode}`);
                console.log(`   Score: ${result.score}/${this.requiredHeaders.length + 1}`);
                
                if (result.missingHeaders.length > 0) {
                    console.log(`    Missing: ${result.missingHeaders.join(', ')}`);
                }
                
                if (result.warnings && result.warnings.length > 0) {
                    console.log(`     Warnings: ${result.warnings.join(', ')}`);
                }
                
                console.log('');
                
            } catch (error) {
                console.log(` ${test.description} (${test.url})`);
                console.log(`   Error: ${error.error}`);
                console.log('');
            }
        }

        this.generateReport();
    }

    generateReport() {
        console.log(' Security Headers Report\n');
        console.log('='.repeat(50));
        
        const totalTests = this.results.length;
        const successfulTests = this.results.filter(r => r.statusCode === 200).length;
        const averageScore = this.results.reduce((sum, r) => sum + r.score, 0) / totalTests;
        const maxScore = this.requiredHeaders.length + 1;
        
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Successful: ${successfulTests}`);
        console.log(`Average Score: ${averageScore.toFixed(1)}/${maxScore}`);
        console.log(`Security Grade: ${this.getGrade(averageScore, maxScore)}`);
        
        console.log('\n Detailed Results:');
        console.log('-'.repeat(50));
        
        this.results.forEach(result => {
            const percentage = ((result.score / maxScore) * 100).toFixed(1);
            console.log(`${result.description}: ${result.score}/${maxScore} (${percentage}%)`);
        });
        
        console.log('\n Recommendations:');
        console.log('-'.repeat(50));
        
        const allMissingHeaders = new Set();
        this.results.forEach(result => {
            result.missingHeaders.forEach(header => allMissingHeaders.add(header));
        });
        
        if (allMissingHeaders.size > 0) {
            console.log('Missing headers across all tests:');
            Array.from(allMissingHeaders).forEach(header => {
                console.log(`  - ${header}`);
            });
        } else {
            console.log(' All required security headers are present!');
        }
        
        console.log('\n Additional Security Recommendations:');
        console.log('-'.repeat(50));
        console.log('1. Consider implementing Subresource Integrity (SRI) for external resources');
        console.log('2. Set up CSP reporting to monitor violations');
        console.log('3. Regularly audit and update security headers');
        console.log('4. Consider implementing Certificate Transparency monitoring');
        console.log('5. Test headers with security scanning tools like SecurityHeaders.com');
    }

    getGrade(score, maxScore) {
        const percentage = (score / maxScore) * 100;
        if (percentage >= 90) return 'A+';
        if (percentage >= 80) return 'A';
        if (percentage >= 70) return 'B';
        if (percentage >= 60) return 'C';
        if (percentage >= 50) return 'D';
        return 'F';
    }
}

// Main execution
async function main() {
    const tester = new SecurityHeadersTester();
    
    // Get base URL from command line or use default
    const baseUrl = process.argv[2] || 'http://localhost:3000';
    
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
        console.error(' Please provide a valid URL starting with http:// or https://');
        console.error('Usage: node test-security-headers.js <base-url>');
        console.error('Example: node test-security-headers.js https://your-site.vercel.app');
        process.exit(1);
    }
    
    try {
        await tester.runTests(baseUrl);
    } catch (error) {
        console.error(' Test execution failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = SecurityHeadersTester;
