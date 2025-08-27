#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Emoji Removal Tool
 * Removes emojis from various file types in your project
 */

class EmojiRemover {
    constructor() {
        // Unicode ranges for emojis
        this.emojiRanges = [
            // Basic emoji blocks
            /[\u{1F600}-\u{1F64F}]/gu, // Emoticons
            /[\u{1F300}-\u{1F5FF}]/gu, // Miscellaneous Symbols and Pictographs
            /[\u{1F680}-\u{1F6FF}]/gu, // Transport and Map Symbols
            /[\u{1F1E0}-\u{1F1FF}]/gu, // Regional Indicator Symbols
            /[\u{2600}-\u{26FF}]/gu,   // Miscellaneous Symbols
            /[\u{2700}-\u{27BF}]/gu,   // Dingbats
            /[\u{FE00}-\u{FE0F}]/gu,   // Variation Selectors
            /[\u{1F900}-\u{1F9FF}]/gu, // Supplemental Symbols and Pictographs
            /[\u{1F018}-\u{1F270}]/gu, // Enclosed Alphanumeric Supplement
            /[\u{238C}-\u{2454}]/gu,   // Technical
            /[\u{20D0}-\u{20FF}]/gu,   // Combining Diacritical Marks for Symbols
            /[\u{1F000}-\u{1F02F}]/gu, // Mahjong Tiles
            /[\u{1F0A0}-\u{1F0FF}]/gu, // Playing Cards
            /[\u{1F030}-\u{1F09F}]/gu, // Domino Tiles
            /[\u{1F100}-\u{1F64F}]/gu, // Enclosed Alphanumeric Supplement
            /[\u{1F650}-\u{1F67F}]/gu, // Geometric Shapes Extended
            /[\u{1F780}-\u{1F7FF}]/gu, // Geometric Shapes Extended
            /[\u{1F800}-\u{1F8FF}]/gu, // Supplemental Arrows-C
            /[\u{1FA00}-\u{1FA6F}]/gu, // Chess Symbols
            /[\u{1FA70}-\u{1FAFF}]/gu, // Symbols and Pictographs Extended-A
            /[\u{1FAB0}-\u{1FAFF}]/gu, // Symbols and Pictographs Extended-B
            /[\u{1FAC0}-\u{1FAFF}]/gu, // Symbols and Pictographs Extended-C
            /[\u{1FAD0}-\u{1FAFF}]/gu, // Symbols and Pictographs Extended-D
            /[\u{1FAE0}-\u{1FAFF}]/gu, // Symbols and Pictographs Extended-E
            /[\u{1FAF0}-\u{1FAFF}]/gu, // Symbols and Pictographs Extended-F
        ];
        
        this.supportedExtensions = [
            '.md', '.txt', '.js', '.jsx', '.ts', '.tsx', 
            '.html', '.css', '.scss', '.sass', '.json', 
            '.xml', '.yaml', '.yml', '.ini', '.cfg', '.conf'
        ];
        
        this.stats = {
            filesProcessed: 0,
            filesModified: 0,
            emojisRemoved: 0,
            errors: 0
        };
    }

    /**
     * Remove emojis from a string
     */
    removeEmojis(text) {
        let originalLength = text.length;
        let cleanedText = text;
        
        this.emojiRanges.forEach(range => {
            cleanedText = cleanedText.replace(range, '');
        });
        
        // Also remove emoji sequences (combinations)
        cleanedText = cleanedText.replace(/[\u{1F3FB}-\u{1F3FF}]/gu, ''); // Skin tone modifiers
        cleanedText = cleanedText.replace(/[\u{200D}]/gu, ''); // Zero-width joiner
        
        this.stats.emojisRemoved += (originalLength - cleanedText.length);
        return cleanedText;
    }

    /**
     * Check if file should be processed
     */
    shouldProcessFile(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        return this.supportedExtensions.includes(ext);
    }

    /**
     * Check if path should be excluded
     */
    shouldExcludePath(filePath, excludePatterns) {
        const normalizedPath = filePath.replace(/\\/g, '/');
        return excludePatterns.some(pattern => {
            const regexPattern = pattern
                .replace(/\*\*/g, '.*')
                .replace(/\*/g, '[^/]*')
                .replace(/\?/g, '.');
            const regex = new RegExp(`^${regexPattern}$`);
            return regex.test(normalizedPath);
        });
    }

    /**
     * Get all files recursively from a directory
     */
    getAllFiles(dirPath, excludePatterns = []) {
        const files = [];
        
        try {
            const items = fs.readdirSync(dirPath);
            
            for (const item of items) {
                const fullPath = path.join(dirPath, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    // Skip excluded directories
                    if (!this.shouldExcludePath(fullPath, excludePatterns)) {
                        files.push(...this.getAllFiles(fullPath, excludePatterns));
                    }
                } else if (stat.isFile()) {
                    // Skip excluded files
                    if (!this.shouldExcludePath(fullPath, excludePatterns)) {
                        files.push(fullPath);
                    }
                }
            }
        } catch (error) {
            console.error(` Error reading directory ${dirPath}:`, error.message);
        }
        
        return files;
    }

    /**
     * Process a single file
     */
    async processFile(filePath, dryRun = false) {
        try {
            if (!this.shouldProcessFile(filePath)) {
                return false;
            }

            const content = fs.readFileSync(filePath, 'utf8');
            const originalContent = content;
            const cleanedContent = this.removeEmojis(content);

            this.stats.filesProcessed++;

            if (cleanedContent !== originalContent) {
                this.stats.filesModified++;
                
                if (!dryRun) {
                    fs.writeFileSync(filePath, cleanedContent, 'utf8');
                    console.log(` Modified: ${filePath}`);
                } else {
                    console.log(` Would modify: ${filePath}`);
                }
                return true;
            } else {
                console.log(`  No changes: ${filePath}`);
                return false;
            }
        } catch (error) {
            this.stats.errors++;
            console.error(` Error processing ${filePath}:`, error.message);
            return false;
        }
    }

    /**
     * Process files using patterns
     */
    async processFiles(patterns = ['.'], options = {}) {
        const {
            dryRun = false,
            exclude = ['node_modules', 'dist', 'build', '.git'],
            includeHidden = false
        } = options;

        console.log(` Starting emoji removal${dryRun ? ' (DRY RUN)' : ''}...`);
        console.log(` Patterns: ${patterns.join(', ')}`);
        console.log(` Excluding: ${exclude.join(', ')}`);
        console.log('');

        const allFiles = [];
        
        // Process each pattern
        for (const pattern of patterns) {
            if (pattern === '.' || pattern === './') {
                // Current directory
                allFiles.push(...this.getAllFiles('.', exclude));
            } else if (fs.existsSync(pattern)) {
                const stat = fs.statSync(pattern);
                if (stat.isDirectory()) {
                    allFiles.push(...this.getAllFiles(pattern, exclude));
                } else if (stat.isFile()) {
                    allFiles.push(pattern);
                }
            } else {
                console.log(`  Pattern not found: ${pattern}`);
            }
        }

        // Remove duplicates and sort
        const uniqueFiles = [...new Set(allFiles)].sort();

        console.log(` Found ${uniqueFiles.length} files to process`);
        console.log('');

        // Process each file
        for (const file of uniqueFiles) {
            await this.processFile(file, dryRun);
        }

        this.printStats();
    }

    /**
     * Process a specific directory
     */
    async processDirectory(dirPath, options = {}) {
        await this.processFiles([dirPath], options);
    }

    /**
     * Print statistics
     */
    printStats() {
        console.log('\n Statistics:');
        console.log(`   Files processed: ${this.stats.filesProcessed}`);
        console.log(`   Files modified: ${this.stats.filesModified}`);
        console.log(`   Emojis removed: ${this.stats.emojisRemoved}`);
        console.log(`   Errors: ${this.stats.errors}`);
    }

    /**
     * Reset statistics
     */
    resetStats() {
        this.stats = {
            filesProcessed: 0,
            filesModified: 0,
            emojisRemoved: 0,
            errors: 0
        };
    }
}

// CLI Interface
if (require.main === module) {
    const args = process.argv.slice(2);
    const remover = new EmojiRemover();

    // Parse command line arguments
    const options = {
        dryRun: args.includes('--dry-run') || args.includes('-d'),
        exclude: ['node_modules', 'dist', 'build', '.git'],
        includeHidden: args.includes('--include-hidden') || args.includes('-h'),
        patterns: ['.']
    };

    // Extract exclude patterns
    const excludeIndex = args.indexOf('--exclude');
    if (excludeIndex !== -1 && args[excludeIndex + 1]) {
        options.exclude = args[excludeIndex + 1].split(',');
    }

    // Extract custom patterns
    const patternIndex = args.indexOf('--patterns');
    if (patternIndex !== -1 && args[patternIndex + 1]) {
        options.patterns = args[patternIndex + 1].split(',');
    }

    // Show help
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
 Emoji Removal Tool

Usage: node remove-emojis.js [options] [patterns]

Options:
  --dry-run, -d           Show what would be changed without making changes
  --exclude <patterns>    Comma-separated patterns to exclude
  --include-hidden, -h    Include hidden files and directories
  --patterns <patterns>   Comma-separated patterns to process
  --help                  Show this help message

Examples:
  node remove-emojis.js
  node remove-emojis.js --dry-run
  node remove-emojis.js --patterns "src,_internal"
  node remove-emojis.js --exclude "node_modules,dist"
  node remove-emojis.js "_internal" --dry-run

Supported file types: ${remover.supportedExtensions.join(', ')}
        `);
        process.exit(0);
    }

    // Run the tool
    remover.processFiles(options.patterns, options)
        .then(() => {
            console.log('\n Emoji removal completed!');
            process.exit(0);
        })
        .catch(error => {
            console.error(' Error:', error.message);
            process.exit(1);
        });
}

module.exports = EmojiRemover;
