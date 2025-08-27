# Asset Cleanup Scripts

This project includes comprehensive scripts to clean generated assets and temporary files. These scripts help free up disk space and ensure clean builds by removing build outputs, test coverage reports, logs, and other generated content.

## Available Scripts

### Node.js Script (Cross-platform)
- **File**: `scripts/clean-assets.js`
- **Usage**: `node scripts/clean-assets.js [options]`

### PowerShell Script (Windows)
- **File**: `scripts/clean-assets.ps1`
- **Usage**: `powershell -ExecutionPolicy Bypass -File scripts/clean-assets.ps1 [options]`

### Bash Script (Unix/Linux/macOS)
- **File**: `scripts/clean-assets.sh`
- **Usage**: `bash scripts/clean-assets.sh [options]`

## NPM Scripts

For convenience, the following npm scripts are available:

```bash
# Basic cleanup (recommended)
npm run clean

# Preview what would be cleaned (safe)
npm run clean:dry-run

# Verbose output
npm run clean:verbose

# Include npm cache cleanup
npm run clean:all

# Full cleanup including node_modules (use with caution!)
npm run clean:full

# Windows PowerShell versions
npm run clean:win
npm run clean:win:dry-run

# Unix/Linux/macOS versions
npm run clean:unix
npm run clean:unix:dry-run
```

## What Gets Cleaned

### Directories
- `dist/` - Build output directory
- `build/` - Build directory
- `coverage/` - Test coverage reports
- `logs/` - Log files
- `gh-pages-deploy/` - GitHub Pages deployment
- `full-system-deploy/` - Full system deployment
- `backup/` - Backup files
- `.vercel/` - Vercel deployment cache
- `.next/` - Next.js build cache
- `.nuxt/` - Nuxt.js build cache
- `.cache/` - Cache directory
- `tmp/` - Temporary files
- `temp/` - Temporary files
- `node_modules/` - Node modules (optional, use with caution)

### File Types
- `*.log` - Log files
- `*.tmp` - Temporary files
- `*.temp` - Temporary files
- `.DS_Store` - macOS system files
- `Thumbs.db` - Windows thumbnail files
- `*.swp` - Vim swap files
- `*.swo` - Vim swap files
- `*~` - Backup files
- `*.orig` - Merge conflict files
- `*.rej` - Rejected patch files

### System Caches
- Docker system cache (if Docker is available)
- npm cache (optional)

## Command Line Options

### Common Options
- `--dry-run` or `-d` - Show what would be cleaned without actually deleting
- `--verbose` or `-v` - Show detailed output
- `--help` or `-h` - Show help message

### Advanced Options
- `--include-node-modules` or `-n` - Clean node_modules directory (use with caution!)
- `--include-npm-cache` or `-c` - Clean npm cache
- `--include-git` or `-g` - Clean git artifacts (use with extreme caution!)

## Usage Examples

### Basic Usage
```bash
# Clean all generated assets
npm run clean

# Preview what would be cleaned
npm run clean:dry-run
```

### Advanced Usage
```bash
# Clean with verbose output
npm run clean:verbose

# Clean including npm cache
npm run clean:all

# Full cleanup (including node_modules)
npm run clean:full

# Windows PowerShell version
npm run clean:win

# Unix/Linux/macOS version
npm run clean:unix
```

### Direct Script Usage
```bash
# Node.js script
node scripts/clean-assets.js --dry-run --verbose

# PowerShell script (Windows)
powershell -ExecutionPolicy Bypass -File scripts/clean-assets.ps1 -DryRun -Verbose

# Bash script (Unix/Linux/macOS)
bash scripts/clean-assets.sh --dry-run --verbose
```

## Safety Features

### Dry Run Mode
Always use `--dry-run` first to see what will be cleaned:
```bash
npm run clean:dry-run
```

### Warnings
The scripts provide warnings for dangerous operations:
- Deleting `node_modules/` (requires `npm install` afterward)
- Cleaning git artifacts (could affect repository)
- Cleaning npm cache

### Error Handling
- Graceful handling of missing directories
- Detailed error messages
- Safe file deletion with proper error handling

## When to Use

### Regular Development
```bash
# Clean build outputs and test coverage
npm run clean
```

### Before Deployment
```bash
# Clean everything for a fresh build
npm run clean:all
```

### Disk Space Issues
```bash
# Full cleanup including node_modules
npm run clean:full
```

### Troubleshooting
```bash
# Clean with verbose output to see what's happening
npm run clean:verbose
```

## Recovery

### After Cleaning node_modules
If you accidentally cleaned `node_modules/`, simply reinstall:
```bash
npm install
```

### After Cleaning npm Cache
The npm cache will be rebuilt automatically on next use.

### After Cleaning Build Outputs
Rebuild your project:
```bash
npm run build
```

## Integration with Build Process

You can integrate cleanup into your build process:

```json
{
  "scripts": {
    "prebuild": "npm run clean",
    "build": "vite build",
    "postbuild": "npm run clean:all"
  }
}
```

## Customization

### Adding Custom Directories
Edit the script files to add your own directories to clean:

```javascript
// In clean-assets.js
const directoriesToClean = [
  // ... existing directories
  { path: 'my-custom-dir', description: 'My custom directory' }
];
```

### Adding Custom File Patterns
```javascript
// In clean-assets.js
const filePatterns = [
  // ... existing patterns
  { pattern: '*.custom', description: 'custom files' }
];
```

## Troubleshooting

### Permission Errors
On Unix/Linux/macOS, ensure the script is executable:
```bash
chmod +x scripts/clean-assets.sh
```

### PowerShell Execution Policy
On Windows, you might need to adjust PowerShell execution policy:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Node.js Not Found
Ensure Node.js is installed and in your PATH:
```bash
node --version
```

## Contributing

When adding new cleanup targets:
1. Add them to all three script versions (Node.js, PowerShell, Bash)
2. Update this README
3. Test with `--dry-run` first
4. Consider safety implications

## License

These scripts are part of the project and follow the same license terms.

