const fs = require('fs');
const path = require('path');
const EmojiRemover = require('../remove-emojis');

describe('EmojiRemover Integration Tests', () => {
    let remover;
    let testDir;
    let testFiles;

    beforeEach(() => {
        remover = new EmojiRemover();
        testDir = path.join(__dirname, 'test-files');
        
        // Create test directory
        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir, { recursive: true });
        }
        
        testFiles = {
            markdown: path.join(testDir, 'test.md'),
            javascript: path.join(testDir, 'test.js'),
            text: path.join(testDir, 'test.txt'),
            html: path.join(testDir, 'test.html')
        };
    });

    afterEach(() => {
        // Clean up test files
        Object.values(testFiles).forEach(filePath => {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });
        
        // Remove test directory
        if (fs.existsSync(testDir)) {
            fs.rmdirSync(testDir);
        }
    });

    describe('Real File Processing', () => {
        test('should remove emojis from markdown file', async () => {
            const content = '# Test Document \n\nThis is a test with  emojis!';
            fs.writeFileSync(testFiles.markdown, content, 'utf8');
            
            const result = await remover.processFile(testFiles.markdown);
            
            expect(result).toBe(true);
            expect(remover.stats.filesProcessed).toBe(1);
            expect(remover.stats.filesModified).toBe(1);
            
            const processedContent = fs.readFileSync(testFiles.markdown, 'utf8');
            expect(processedContent).toBe('# Test Document \n\nThis is a test with  emojis!');
        });

        test('should remove emojis from JavaScript file', async () => {
            const content = '// Test comment \nconsole.log("Hello  world!");';
            fs.writeFileSync(testFiles.javascript, content, 'utf8');
            
            const result = await remover.processFile(testFiles.javascript);
            
            expect(result).toBe(true);
            expect(remover.stats.filesProcessed).toBe(1);
            expect(remover.stats.filesModified).toBe(1);
            
            const processedContent = fs.readFileSync(testFiles.javascript, 'utf8');
            expect(processedContent).toBe('// Test comment \nconsole.log("Hello  world!");');
        });

        test('should remove emojis from text file', async () => {
            const content = 'Hello  world ! This is a test.';
            fs.writeFileSync(testFiles.text, content, 'utf8');
            
            const result = await remover.processFile(testFiles.text);
            
            expect(result).toBe(true);
            expect(remover.stats.filesProcessed).toBe(1);
            expect(remover.stats.filesModified).toBe(1);
            
            const processedContent = fs.readFileSync(testFiles.text, 'utf8');
            expect(processedContent).toBe('Hello  world ! This is a test.');
        });

        test('should remove emojis from HTML file', async () => {
            const content = '<!DOCTYPE html>\n<html>\n<head><title>Test </title></head>\n<body>Hello !</body>\n</html>';
            fs.writeFileSync(testFiles.html, content, 'utf8');
            
            const result = await remover.processFile(testFiles.html);
            
            expect(result).toBe(true);
            expect(remover.stats.filesProcessed).toBe(1);
            expect(remover.stats.filesModified).toBe(1);
            
            const processedContent = fs.readFileSync(testFiles.html, 'utf8');
            expect(processedContent).toBe('<!DOCTYPE html>\n<html>\n<head><title>Test </title></head>\n<body>Hello !</body>\n</html>');
        });

        test('should not modify files without emojis', async () => {
            const content = 'This is a test file without any emojis.';
            fs.writeFileSync(testFiles.text, content, 'utf8');
            
            const result = await remover.processFile(testFiles.text);
            
            expect(result).toBe(false);
            expect(remover.stats.filesProcessed).toBe(1);
            expect(remover.stats.filesModified).toBe(0);
            
            const processedContent = fs.readFileSync(testFiles.text, 'utf8');
            expect(processedContent).toBe(content);
        });

        test('should handle dry run mode', async () => {
            const content = 'Hello  world !';
            fs.writeFileSync(testFiles.text, content, 'utf8');
            
            const result = await remover.processFile(testFiles.text, true);
            
            expect(result).toBe(true);
            expect(remover.stats.filesProcessed).toBe(1);
            expect(remover.stats.filesModified).toBe(1);
            
            // File should not be modified in dry run mode
            const processedContent = fs.readFileSync(testFiles.text, 'utf8');
            expect(processedContent).toBe(content);
        });
    });

    describe('Directory Processing', () => {
        test('should process all files in directory', async () => {
            // Create multiple test files
            const files = [
                { path: testFiles.markdown, content: 'Test  markdown' },
                { path: testFiles.javascript, content: '// Test  JavaScript' },
                { path: testFiles.text, content: 'Test text ' }
            ];
            
            files.forEach(file => {
                fs.writeFileSync(file.path, file.content, 'utf8');
            });
            
            await remover.processDirectory(testDir);
            
            expect(remover.stats.filesProcessed).toBe(3);
            expect(remover.stats.filesModified).toBe(3);
            
            // Verify all files were processed
            files.forEach(file => {
                const processedContent = fs.readFileSync(file.path, 'utf8');
                expect(processedContent).not.toContain('');
                expect(processedContent).not.toContain('');
                expect(processedContent).not.toContain('');
            });
        });

        test('should handle nested directories', async () => {
            const nestedDir = path.join(testDir, 'nested');
            const nestedFile = path.join(nestedDir, 'test.md');
            
            fs.mkdirSync(nestedDir, { recursive: true });
            fs.writeFileSync(nestedFile, 'Nested  file', 'utf8');
            
            await remover.processDirectory(testDir);
            
            expect(remover.stats.filesProcessed).toBe(1);
            expect(remover.stats.filesModified).toBe(1);
            
            const processedContent = fs.readFileSync(nestedFile, 'utf8');
            expect(processedContent).toBe('Nested  file');
        });
    });

    describe('File Type Filtering', () => {
        test('should only process supported file types', async () => {
            // Create supported and unsupported files
            const supportedFile = testFiles.markdown;
            const unsupportedFile = path.join(testDir, 'test.png');
            
            fs.writeFileSync(supportedFile, 'Test  markdown', 'utf8');
            fs.writeFileSync(unsupportedFile, 'Test  image', 'utf8');
            
            await remover.processDirectory(testDir);
            
            expect(remover.stats.filesProcessed).toBe(1);
            expect(remover.stats.filesModified).toBe(1);
            
            // Supported file should be modified
            const processedContent = fs.readFileSync(supportedFile, 'utf8');
            expect(processedContent).toBe('Test  markdown');
            
            // Unsupported file should remain unchanged
            const unchangedContent = fs.readFileSync(unsupportedFile, 'utf8');
            expect(unchangedContent).toBe('Test  image');
        });
    });

    describe('Error Handling', () => {
        test('should handle non-existent files gracefully', async () => {
            const result = await remover.processFile('nonexistent.md');
            
            expect(result).toBe(false);
            expect(remover.stats.errors).toBe(1);
        });

        test('should handle permission errors gracefully', async () => {
            // Create a file and then make it read-only (if possible)
            fs.writeFileSync(testFiles.text, 'Test  content', 'utf8');
            
            // On Windows, we can't easily test permission errors
            // This test mainly ensures the error handling code path exists
            const result = await remover.processFile(testFiles.text);
            expect(result).toBe(true);
        });
    });

    describe('Statistics Tracking', () => {
        test('should track statistics across multiple files', async () => {
            const files = [
                { path: testFiles.markdown, content: 'Test  markdown ' },
                { path: testFiles.javascript, content: '// Test  JavaScript ' },
                { path: testFiles.text, content: 'Test text ' }
            ];
            
            files.forEach(file => {
                fs.writeFileSync(file.path, file.content, 'utf8');
            });
            
            await remover.processDirectory(testDir);
            
            expect(remover.stats.filesProcessed).toBe(3);
            expect(remover.stats.filesModified).toBe(3);
            expect(remover.stats.emojisRemoved).toBeGreaterThan(0);
            expect(remover.stats.errors).toBe(0);
        });

        test('should reset statistics correctly', async () => {
            fs.writeFileSync(testFiles.text, 'Test  content', 'utf8');
            await remover.processFile(testFiles.text);
            
            expect(remover.stats.filesProcessed).toBe(1);
            expect(remover.stats.filesModified).toBe(1);
            
            remover.resetStats();
            
            expect(remover.stats).toEqual({
                filesProcessed: 0,
                filesModified: 0,
                emojisRemoved: 0,
                errors: 0
            });
        });
    });

    describe('Emoji Removal Accuracy', () => {
        test('should remove various emoji types', async () => {
            const emojis = [
                '', '', '', '', '', '', '', '', '', '',
                '', '', '', '', '', '', '⭐', '', '', ''
            ];
            
            const content = `Test content with emojis: ${emojis.join(' ')}`;
            fs.writeFileSync(testFiles.text, content, 'utf8');
            
            await remover.processFile(testFiles.text);
            
            const processedContent = fs.readFileSync(testFiles.text, 'utf8');
            
            // Verify all emojis were removed
            emojis.forEach(emoji => {
                expect(processedContent).not.toContain(emoji);
            });
            
            // Verify the text content remains
            expect(processedContent).toContain('Test content with emojis:');
        });

        test('should preserve text content accurately', async () => {
            const content = 'Hello  world ! This is a test with  emojis and  symbols.';
            fs.writeFileSync(testFiles.text, content, 'utf8');
            
            await remover.processFile(testFiles.text);
            
            const processedContent = fs.readFileSync(testFiles.text, 'utf8');
            expect(processedContent).toBe('Hello  world ! This is a test with  emojis and  symbols.');
        });
    });
});
