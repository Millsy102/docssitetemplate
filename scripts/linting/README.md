# Beam Universe - Linting & Quality Assurance Scripts

This folder contains comprehensive scripts for maintaining code quality, cleaning up content, and ensuring all files meet Beam Universe standards.

## 📁 Scripts Overview

### 🧹 `remove-more-from-md.js`
**Purpose**: Removes the word "more" from markdown files to clean up content
- Searches all `.md` files in the project
- Removes standalone "more" words (case insensitive)
- Cleans up extra whitespace
- Provides detailed reporting of changes

**Usage**:
```bash
node scripts/linting/remove-more-from-md.js
```

### 🔍 `run-linting.js`
**Purpose**: Runs comprehensive linting on all file types
- **ESLint**: JavaScript/TypeScript code quality
- **Prettier**: Code formatting consistency
- **Markdownlint**: Markdown file standards
- **CSpell**: Spelling and typo checking
- Runs all tools in parallel for efficiency
- Generates detailed reports

**Usage**:
```bash
node scripts/linting/run-linting.js
```

### 🚀 `run-all-checks.js` (MASTER SCRIPT)
**Purpose**: Complete quality assurance suite - runs everything
- **Step 1**: Markdown cleanup (removes "more")
- **Step 2**: Comprehensive linting (all tools)
- **Step 3**: Additional checks:
  - Link validation
  - Security audit (npm audit)
  - Accessibility checks (if pa11y-ci available)
- Categorized reporting by issue type
- Detailed recommendations for fixes

**Usage**:
```bash
node scripts/linting/run-all-checks.js
```

## 🛠️ Available Tools

The scripts utilize these npm packages (already installed):
- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **Markdownlint**: Markdown file validation
- **CSpell**: Spelling and typo detection
- **npm audit**: Security vulnerability scanning

## 📊 Output & Reports

### Console Output
- Real-time progress indicators
- Categorized results by tool
- Summary statistics
- Quick fix commands
- Total execution time

### Generated Reports
- `linting-report.json`: Results from linting only
- `comprehensive-report.json`: Complete check results
- Includes timestamps, error counts, and recommendations

## 🎯 File Types Covered

### Code Files
- `.js`, `.jsx`, `.ts`, `.tsx` - JavaScript/TypeScript
- `.json` - Configuration files
- `.css` - Stylesheets

### Documentation
- `.md` - Markdown files
- `.html` - HTML files

### Configuration
- `package.json` - Dependencies and scripts
- Various config files

## 🔧 Quick Fix Commands

When issues are found, use these commands to fix them:

```bash
# Fix ESLint issues
npm run lint:fix

# Fix Prettier formatting
npm run format

# Fix markdown issues
npx markdownlint --fix

# Fix spelling issues
npx cspell --fix

# Fix security issues
npm audit fix

# Validate links
node scripts/validate-links.js
```

## 📋 Integration with Package.json

Add these scripts to your `package.json` for easy access:

```json
{
  "scripts": {
    "cleanup:md": "node scripts/linting/remove-more-from-md.js",
    "lint:all": "node scripts/linting/run-linting.js",
    "check:all": "node scripts/linting/run-all-checks.js",
    "quality": "npm run check:all"
  }
}
```

Then run with:
```bash
npm run quality
```

## 🎨 Customization

### Adding New Checks
1. Add the check to the `results` object in `run-all-checks.js`
2. Implement the check in `runAdditionalChecks()`
3. Add error counting logic in `countErrors()`

### Modifying Markdown Cleanup
Edit the `removeMoreFromMarkdown()` function in `remove-more-from-md.js` to:
- Add more patterns to remove
- Change the cleaning logic
- Add new file types

### Custom Linting Rules
- ESLint: Edit `.eslintrc.js`
- Prettier: Edit `.prettierrc`
- Markdownlint: Edit `.markdownlint.json`
- CSpell: Edit `cspell.json`

## 🚨 Error Handling

All scripts include comprehensive error handling:
- Graceful failure for missing tools
- Detailed error messages
- Non-blocking execution (one tool failure doesn't stop others)
- Exit codes for CI/CD integration

## 📈 Performance

- Parallel execution where possible
- Efficient file searching with glob patterns
- Minimal memory usage
- Progress indicators for long-running operations

## 🔄 Continuous Integration

These scripts are designed to work in CI/CD pipelines:
- Proper exit codes (0 for success, 1 for issues)
- JSON reports for parsing
- No interactive prompts
- Configurable error thresholds

## 📝 Best Practices

1. **Run regularly**: Use in pre-commit hooks or CI/CD
2. **Fix issues promptly**: Use the provided quick fix commands
3. **Review reports**: Check generated JSON reports for detailed analysis
4. **Customize rules**: Adjust linting rules to match your team's preferences
5. **Monitor performance**: Track execution times and optimize if needed

## 🤝 Contributing

When adding new scripts or modifying existing ones:
1. Follow the existing naming convention (Beam prefix)
2. Include comprehensive error handling
3. Add detailed console output
4. Generate appropriate reports
5. Update this README

---

**Beam Universe Quality Assurance Suite** - Ensuring code quality and consistency across the entire project.
