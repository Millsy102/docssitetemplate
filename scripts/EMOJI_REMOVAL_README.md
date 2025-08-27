#  Emoji Removal Tool

A comprehensive tool to remove emojis from various file types in your project. This tool supports multiple platforms and provides both command-line and programmatic interfaces.

##  Features

- **Multi-platform support**: Node.js, PowerShell, and Windows Batch
- **Multiple file types**: Markdown, JavaScript, TypeScript, HTML, CSS, JSON, and more
- **Flexible patterns**: Use glob patterns to target specific files
- **Dry run mode**: Preview changes without modifying files
- **Exclusion support**: Skip specific directories and files
- **Detailed statistics**: Track files processed and emojis removed
- **Error handling**: Graceful error handling with detailed reporting

##  Quick Start

### Prerequisites

- **Node.js** (for the JavaScript version)
- **PowerShell** (for the PowerShell version, Windows only)
- **Windows Command Prompt** (for the batch version, Windows only)

### Installation

1. Ensure you have Node.js installed (download from [nodejs.org](https://nodejs.org/))
2. Install the required dependency:
   ```bash
   npm install glob
   ```

### Basic Usage

#### Node.js Version (Cross-platform)

```bash
# Remove emojis from all supported files
node scripts/remove-emojis.js

# Preview changes without modifying files (dry run)
node scripts/remove-emojis.js --dry-run

# Target specific file types
node scripts/remove-emojis.js --patterns "**/*.md,**/*.js"

# Exclude specific directories
node scripts/remove-emojis.js --exclude "node_modules/**,dist/**"
```

#### PowerShell Version (Windows)

```powershell
# Remove emojis from all supported files
.\scripts\remove-emojis.ps1

# Preview changes without modifying files
.\scripts\remove-emojis.ps1 -DryRun

# Target specific file types
.\scripts\remove-emojis.ps1 -Patterns "**/*.md","**/*.js"

# Exclude specific directories
.\scripts\remove-emojis.ps1 -Exclude "node_modules/**","dist/**"
```

#### Batch Version (Windows)

```cmd
# Remove emojis from all supported files
scripts\remove-emojis.bat

# Preview changes without modifying files
scripts\remove-emojis.bat --dry-run

# Target specific file types
scripts\remove-emojis.bat --patterns "**/*.md,**/*.js"
```

##  Supported File Types

The tool supports the following file extensions:

- **Documentation**: `.md`, `.txt`
- **JavaScript/TypeScript**: `.js`, `.jsx`, `.ts`, `.tsx`
- **Web**: `.html`, `.css`, `.scss`, `.sass`
- **Configuration**: `.json`, `.xml`, `.yaml`, `.yml`, `.ini`, `.cfg`, `.conf`

##  Command Line Options

### Node.js Version

| Option | Short | Description |
|--------|-------|-------------|
| `--dry-run` | `-d` | Show what would be changed without making changes |
| `--exclude <patterns>` | | Comma-separated glob patterns to exclude |
| `--include-hidden` | `-h` | Include hidden files and directories |
| `--patterns <patterns>` | | Comma-separated glob patterns to process |
| `--help` | | Show help message |

### PowerShell Version

| Option | Description |
|--------|-------------|
| `-DryRun` | Show what would be changed without making changes |
| `-Exclude <patterns>` | Comma-separated glob patterns to exclude |
| `-IncludeHidden` | Include hidden files and directories |
| `-Patterns <patterns>` | Comma-separated glob patterns to process |
| `-Help` | Show help message |

##  Output and Statistics

The tool provides detailed output including:

- **File processing status**: Shows which files were modified, skipped, or had errors
- **Statistics summary**: 
  - Files processed
  - Files modified
  - Emojis removed
  - Errors encountered

### Example Output

```
 Starting emoji removal...
 Patterns: **/*
 Excluding: node_modules/**,dist/**,build/**,.git/**

 Modified: _internal/system/AI_GAME_ENGINE_SYSTEM.md
  No changes: README.md
 Would modify: src/components/Header.jsx

 Statistics:
   Files processed: 15
   Files modified: 3
   Emojis removed: 47
   Errors: 0

 Emoji removal completed!
```

##  Advanced Usage

### Programmatic Usage (Node.js)

```javascript
const EmojiRemover = require('./scripts/remove-emojis.js');

const remover = new EmojiRemover();

// Process specific directory
await remover.processDirectory('./src', {
    dryRun: true,
    exclude: ['node_modules/**', 'dist/**']
});

// Process specific files
await remover.processFiles(['**/*.md', '**/*.js'], {
    dryRun: false
});

// Process single file
await remover.processFile('./README.md', false);

// Get statistics
console.log(remover.stats);
```

### Custom File Types

To add support for additional file types, modify the `supportedExtensions` array in the script:

```javascript
this.supportedExtensions = [
    '.md', '.txt', '.js', '.jsx', '.ts', '.tsx', 
    '.html', '.css', '.scss', '.sass', '.json', 
    '.xml', '.yaml', '.yml', '.ini', '.cfg', '.conf',
    '.php', '.py', '.java', '.cpp', '.c' // Add your extensions
];
```

### Custom Exclusion Patterns

```bash
# Exclude multiple patterns
node scripts/remove-emojis.js --exclude "node_modules/**,dist/**,coverage/**,.git/**"

# Exclude specific file types
node scripts/remove-emojis.js --exclude "**/*.min.js,**/*.bundle.js"
```

##  Troubleshooting

### Common Issues

1. **"Node.js is not installed"**
   - Download and install Node.js from [nodejs.org](https://nodejs.org/)
   - Ensure Node.js is added to your system PATH

2. **"glob module not found"**
   - Install the required dependency: `npm install glob`

3. **"Permission denied" errors**
   - Ensure you have write permissions for the target files
   - On Windows, try running as Administrator

4. **Unicode/encoding issues**
   - The tool uses UTF-8 encoding by default
   - Ensure your files are saved in UTF-8 format

### Error Handling

The tool includes comprehensive error handling:

- **File access errors**: Logged but don't stop processing
- **Encoding errors**: Attempts to handle various encodings
- **Pattern errors**: Warns about invalid glob patterns
- **Statistics tracking**: Tracks all errors for reporting

##  Safety Features

- **Dry run mode**: Always test with `--dry-run` first
- **Backup recommendation**: Consider backing up your files before running
- **Selective processing**: Use patterns to target specific files only
- **Exclusion patterns**: Automatically excludes common build directories

##  Examples

### Remove emojis from documentation only

```bash
node scripts/remove-emojis.js --patterns "**/*.md,**/*.txt"
```

### Preview changes in source code

```bash
node scripts/remove-emojis.js --patterns "src/**/*" --dry-run
```

### Process specific directory with exclusions

```bash
node scripts/remove-emojis.js --patterns "_internal/**/*" --exclude "_internal/node_modules/**"
```

### PowerShell equivalent

```powershell
.\scripts\remove-emojis.ps1 -Patterns "_internal/**/*" -Exclude "_internal/node_modules/**"
```

##  Contributing

To contribute to this tool:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

##  License

This tool is part of the project and follows the same license terms.

---

**Note**: Always test the tool on a small subset of files first using the `--dry-run` option to ensure it behaves as expected with your specific content.
