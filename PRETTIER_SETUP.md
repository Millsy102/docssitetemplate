# Prettier Setup and Usage

This project uses Prettier for consistent code formatting across all files.

## Configuration

### Prettier Configuration (`.prettierrc`)

The project uses the following Prettier configuration:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "quoteProps": "as-needed",
  "jsxSingleQuote": true,
  "proseWrap": "preserve",
  "htmlWhitespaceSensitivity": "css",
  "embeddedLanguageFormatting": "auto"
}
```

### Ignored Files (`.prettierignore`)

The following files and directories are excluded from Prettier formatting:

- Build outputs (`dist/`, `build/`, `coverage/`)
- Dependencies (`node_modules/`)
- Generated files (`*.d.ts`, `*.generated.*`)
- Configuration files that should maintain their format
- Documentation files (`*.md`)
- Files with complex template literals that cause parsing issues

## Available Scripts

### Format All Files
```bash
npm run format
```
Formats all files in the project according to Prettier rules.

### Check Formatting
```bash
npm run format:check
```
Checks if all files are properly formatted without making changes.

### Fix Formatting
```bash
npm run format:fix
```
Alias for `npm run format` - formats all files.

## Integration with Git Hooks

The project uses `lint-staged` with Husky to automatically format files on commit:

- **JavaScript/TypeScript files**: ESLint + Prettier
- **JSON/YAML/CSS/HTML files**: Prettier only

## IDE Integration

### VS Code
1. Install the Prettier extension
2. Enable "Format on Save" in VS Code settings
3. Set Prettier as the default formatter

### Other IDEs
Most modern IDEs support Prettier integration. Check your IDE's documentation for setup instructions.

## Version

- **Prettier**: ^3.2.5
- **Last Updated**: August 2024

## Troubleshooting

### Common Issues

1. **Syntax Errors**: Some files with complex template literals may cause parsing issues. These are excluded in `.prettierignore`.

2. **Conflicts with ESLint**: The project uses `eslint-config-prettier` to disable ESLint rules that conflict with Prettier.

3. **Line Ending Issues**: Prettier is configured to use LF line endings (`endOfLine: "lf"`).

### Manual Formatting

To format a specific file:
```bash
npx prettier --write path/to/file
```

To check a specific file:
```bash
npx prettier --check path/to/file
```

## Best Practices

1. **Run format before committing**: Always run `npm run format` before committing changes
2. **Use IDE integration**: Enable format-on-save in your IDE for automatic formatting
3. **Check CI/CD**: The project includes format checking in CI/CD pipelines
4. **Consistent configuration**: Don't modify `.prettierrc` without team consensus

## Migration from Previous Setup

This setup replaces the previous Prettier v2.8.7 configuration with:
- Updated to Prettier v3.2.5
- Enhanced configuration for modern JavaScript/TypeScript projects
- Comprehensive `.prettierignore` file
- Integration with existing lint-staged setup
- Additional npm scripts for better developer experience
