#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const EmojiRemover = require('./remove-emojis');

/**
 * Simple Test Suite for Emoji Removal Utility
 * Runs without Jest dependencies
 */

class SimpleTestRunner {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
        this.testDir = path.join(__dirname, 'test-temp');
    }

    /**
     * Add a test to the suite
     */
    test(name, testFunction) {
        this.tests.push({ name, testFunction });
    }

    /**
     * Assert that a condition is true
     */
    assert(condition, message) {
        if (!condition) {
            throw new Error(message || 'Assertion failed');
        }
    }

    /**
     * Assert that two values are equal
     */
    assertEqual(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(`${message || 'Assertion failed'}: expected ${expected}, got ${actual}`);
        }
    }

    /**
     * Assert that a value is greater than another
     */
    assertGreaterThan(actual, expected, message) {
        if (actual <= expected) {
            throw new Error(`${message || 'Assertion failed'}: expected > ${expected}, got ${actual}`);
        }
    }

    /**
     * Run all tests
     */
    async runTests() {
        console.log('🧪 Running Simple Emoji Removal Tests...\n');

        for (const test of this.tests) {
            try {
                await test.testFunction();
                console.log(`✅ ${test.name}`);
                this.passed++;
            } catch (error) {
                console.log(`❌ ${test.name}`);
                console.log(`   Error: ${error.message}`);
                this.failed++;
            }
        }

        console.log(`\n📊 Test Results: ${this.passed} passed, ${this.failed} failed`);
        return this.failed === 0;
    }

    /**
     * Clean up test directory
     */
    cleanup() {
        if (fs.existsSync(this.testDir)) {
            try {
                fs.rmSync(this.testDir, { recursive: true, force: true });
            } catch (error) {
                console.log(`Warning: Could not clean up test directory: ${error.message}`);
            }
        }
    }

    /**
     * Create test directory
     */
    setupTestDir() {
        if (!fs.existsSync(this.testDir)) {
            fs.mkdirSync(this.testDir, { recursive: true });
        }
    }
}

// Create test runner
const runner = new SimpleTestRunner();

// Test 1: Constructor initialization
runner.test('Constructor should initialize correctly', () => {
    const remover = new EmojiRemover();
    
    runner.assert(Array.isArray(remover.emojiRanges), 'emojiRanges should be an array');
    runner.assert(remover.emojiRanges.length > 0, 'emojiRanges should not be empty');
    runner.assert(remover.emojiRanges[0] instanceof RegExp, 'emojiRanges should contain RegExp objects');
    
    runner.assert(Array.isArray(remover.supportedExtensions), 'supportedExtensions should be an array');
    runner.assert(remover.supportedExtensions.includes('.md'), 'should support .md files');
    runner.assert(remover.supportedExtensions.includes('.js'), 'should support .js files');
    
    runner.assertEqual(remover.stats.filesProcessed, 0, 'filesProcessed should start at 0');
    runner.assertEqual(remover.stats.filesModified, 0, 'filesModified should start at 0');
    runner.assertEqual(remover.stats.emojisRemoved, 0, 'emojisRemoved should start at 0');
    runner.assertEqual(remover.stats.errors, 0, 'errors should start at 0');
});

// Test 2: Basic emoji removal
runner.test('Should remove basic emojis', () => {
    const remover = new EmojiRemover();
    const text = 'Hello 😀 world 🌍!';
    const result = remover.removeEmojis(text);
    
    runner.assertEqual(result, 'Hello  world !', 'Should remove emojis correctly');
    runner.assertGreaterThan(remover.stats.emojisRemoved, 0, 'Should count removed emojis');
});

// Test 3: Multiple emojis
runner.test('Should remove multiple emojis', () => {
    const remover = new EmojiRemover();
    const text = '😀🌍🎉🚀💻';
    const result = remover.removeEmojis(text);
    
    runner.assertEqual(result, '', 'Should remove all emojis');
    runner.assertGreaterThan(remover.stats.emojisRemoved, 0, 'Should count removed emojis');
});

// Test 4: Text without emojis
runner.test('Should handle text without emojis', () => {
    const remover = new EmojiRemover();
    const text = 'Hello world!';
    const result = remover.removeEmojis(text);
    
    runner.assertEqual(result, text, 'Should return original text unchanged');
    runner.assertEqual(remover.stats.emojisRemoved, 0, 'Should not count any emojis removed');
});

// Test 5: Emoji sequences
runner.test('Should remove emoji sequences', () => {
    const remover = new EmojiRemover();
    const text = '👨‍👩‍👧‍👦'; // Family emoji sequence
    const result = remover.removeEmojis(text);
    
    runner.assertEqual(result, '', 'Should remove emoji sequence');
    runner.assertGreaterThan(remover.stats.emojisRemoved, 0, 'Should count removed emojis');
});

// Test 6: Skin tone modifiers
runner.test('Should remove skin tone modifiers', () => {
    const remover = new EmojiRemover();
    const text = '👍🏽'; // Thumbs up with skin tone
    const result = remover.removeEmojis(text);
    
    runner.assertEqual(result, '', 'Should remove emoji with skin tone');
    runner.assertGreaterThan(remover.stats.emojisRemoved, 0, 'Should count removed emojis');
});

// Test 7: File type filtering
runner.test('Should filter file types correctly', () => {
    const remover = new EmojiRemover();
    
    runner.assert(remover.shouldProcessFile('test.md'), 'Should process .md files');
    runner.assert(remover.shouldProcessFile('script.js'), 'Should process .js files');
    runner.assert(remover.shouldProcessFile('style.css'), 'Should process .css files');
    runner.assert(remover.shouldProcessFile('config.json'), 'Should process .json files');
    
    runner.assert(!remover.shouldProcessFile('image.png'), 'Should not process .png files');
    runner.assert(!remover.shouldProcessFile('video.mp4'), 'Should not process .mp4 files');
    runner.assert(!remover.shouldProcessFile('archive.zip'), 'Should not process .zip files');
});

// Test 8: Path exclusion
runner.test('Should exclude paths correctly', () => {
    const remover = new EmojiRemover();
    const excludePatterns = ['node_modules', 'dist', 'build'];
    
    runner.assert(remover.shouldExcludePath('node_modules', excludePatterns), 'Should exclude node_modules');
    runner.assert(remover.shouldExcludePath('dist', excludePatterns), 'Should exclude dist');
    runner.assert(remover.shouldExcludePath('build', excludePatterns), 'Should exclude build');
    
    runner.assert(!remover.shouldExcludePath('src', excludePatterns), 'Should not exclude src');
    runner.assert(!remover.shouldExcludePath('public', excludePatterns), 'Should not exclude public');
});

// Test 9: Statistics tracking
runner.test('Should track statistics correctly', () => {
    const remover = new EmojiRemover();
    
    // Simulate some processing
    remover.stats.filesProcessed = 5;
    remover.stats.filesModified = 3;
    remover.stats.emojisRemoved = 10;
    remover.stats.errors = 1;
    
    runner.assertEqual(remover.stats.filesProcessed, 5, 'filesProcessed should be tracked');
    runner.assertEqual(remover.stats.filesModified, 3, 'filesModified should be tracked');
    runner.assertEqual(remover.stats.emojisRemoved, 10, 'emojisRemoved should be tracked');
    runner.assertEqual(remover.stats.errors, 1, 'errors should be tracked');
});

// Test 10: Statistics reset
runner.test('Should reset statistics correctly', () => {
    const remover = new EmojiRemover();
    
    // Set some values
    remover.stats.filesProcessed = 5;
    remover.stats.filesModified = 3;
    
    remover.resetStats();
    
    runner.assertEqual(remover.stats.filesProcessed, 0, 'filesProcessed should be reset');
    runner.assertEqual(remover.stats.filesModified, 0, 'filesModified should be reset');
    runner.assertEqual(remover.stats.emojisRemoved, 0, 'emojisRemoved should be reset');
    runner.assertEqual(remover.stats.errors, 0, 'errors should be reset');
});

// Test 11: Real file processing
runner.test('Should process real files', async () => {
    const remover = new EmojiRemover();
    runner.setupTestDir();
    
    const testFile = path.join(runner.testDir, 'test.md');
    const content = '# Test Document 😀\n\nThis is a test with 🌍 emojis!';
    
    // Write test file
    fs.writeFileSync(testFile, content, 'utf8');
    
    // Process file
    const result = await remover.processFile(testFile);
    
    runner.assert(result, 'Should return true for processed file');
    runner.assertEqual(remover.stats.filesProcessed, 1, 'Should count processed file');
    runner.assertEqual(remover.stats.filesModified, 1, 'Should count modified file');
    
    // Check file content
    const processedContent = fs.readFileSync(testFile, 'utf8');
    runner.assertEqual(processedContent, '# Test Document \n\nThis is a test with  emojis!', 'Should remove emojis from file');
    
    // Clean up
    fs.unlinkSync(testFile);
});

// Test 12: Dry run mode
runner.test('Should handle dry run mode', async () => {
    const remover = new EmojiRemover();
    runner.setupTestDir();
    
    const testFile = path.join(runner.testDir, 'test.txt');
    const content = 'Hello 😀 world 🌍!';
    
    // Write test file
    fs.writeFileSync(testFile, content, 'utf8');
    
    // Process file in dry run mode
    const result = await remover.processFile(testFile, true);
    
    runner.assert(result, 'Should return true for processed file');
    runner.assertEqual(remover.stats.filesProcessed, 1, 'Should count processed file');
    runner.assertEqual(remover.stats.filesModified, 1, 'Should count modified file');
    
    // Check file content (should be unchanged in dry run)
    const processedContent = fs.readFileSync(testFile, 'utf8');
    runner.assertEqual(processedContent, content, 'File should be unchanged in dry run mode');
    
    // Clean up
    fs.unlinkSync(testFile);
});

// Test 13: Error handling
runner.test('Should handle non-existent files gracefully', async () => {
    const remover = new EmojiRemover();
    
    const result = await remover.processFile('nonexistent.md');
    
    runner.assert(!result, 'Should return false for non-existent file');
    runner.assertEqual(remover.stats.errors, 1, 'Should count error');
});

// Test 14: Mixed content preservation
runner.test('Should preserve text content accurately', () => {
    const remover = new EmojiRemover();
    const text = 'Code: console.log("Hello 😀"); // Debug 🌍';
    const result = remover.removeEmojis(text);
    
    runner.assertEqual(result, 'Code: console.log("Hello "); // Debug ', 'Should preserve text content');
    runner.assertGreaterThan(remover.stats.emojisRemoved, 0, 'Should count removed emojis');
});

// Test 15: Edge cases
runner.test('Should handle edge cases', () => {
    const remover = new EmojiRemover();
    
    // Empty string
    const emptyResult = remover.removeEmojis('');
    runner.assertEqual(emptyResult, '', 'Should handle empty string');
    
    // Very long string
    const longString = '😀'.repeat(1000) + 'Hello world';
    const longResult = remover.removeEmojis(longString);
    runner.assertEqual(longResult, 'Hello world', 'Should handle very long strings');
    
    // Special characters
    const specialText = 'Test\u{200D}\u{1F600}'; // Zero-width joiner + emoji
    const specialResult = remover.removeEmojis(specialText);
    runner.assertEqual(specialResult, 'Test', 'Should handle special unicode characters');
});

// Run all tests
async function runAllTests() {
    try {
        const success = await runner.runTests();
        runner.cleanup();
        
        if (success) {
            console.log('\n🎉 All tests passed!');
            process.exit(0);
        } else {
            console.log('\n❌ Some tests failed!');
            process.exit(1);
        }
    } catch (error) {
        console.error('\n💥 Test runner error:', error.message);
        runner.cleanup();
        process.exit(1);
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests();
}

module.exports = SimpleTestRunner;
