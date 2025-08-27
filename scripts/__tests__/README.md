# Emoji Removal Utility Test Suite

This directory contains comprehensive tests for the emoji removal utility (`remove-emojis.js`). The test suite ensures the utility works correctly across various scenarios and edge cases.

##  Test Structure

```
__tests__/
├── remove-emojis.test.js           # Unit tests with mocked dependencies
├── remove-emojis.integration.test.js # Integration tests with real file operations
└── README.md                       # This file
```

##  Test Categories

### Unit Tests (`remove-emojis.test.js`)

Tests individual components in isolation using mocked dependencies:

- **Constructor & Initialization**
  - Emoji range initialization
  - Supported file extensions
  - Statistics initialization

- **Emoji Removal Logic**
  - Basic emoji removal
  - Multiple emoji handling
  - Emoji sequences (family emojis, skin tones)
  - Unicode edge cases
  - Mixed content preservation

- **File Processing**
  - File type filtering
  - File reading/writing
  - Dry run mode
  - Error handling

- **Directory Traversal**
  - Recursive file discovery
  - Directory exclusion
  - Path normalization

- **Path Exclusion**
  - Pattern matching
  - Wildcard support
  - Cross-platform path handling

- **Statistics Tracking**
  - Counter accuracy
  - Statistics reset
  - Error counting

- **CLI Interface**
  - Argument parsing
  - Help display
  - Exit codes

- **Edge Cases**
  - Null/undefined inputs
  - Very long strings
  - Special characters
  - File path variations

### Integration Tests (`remove-emojis.integration.test.js`)

Tests the utility with real file system operations:

- **Real File Processing**
  - Markdown files
  - JavaScript files
  - Text files
  - HTML files
  - Files without emojis
  - Dry run mode

- **Directory Processing**
  - Multiple file processing
  - Nested directories
  - File type filtering

- **Error Handling**
  - Non-existent files
  - Permission errors
  - File system errors

- **Statistics Tracking**
  - Multi-file statistics
  - Statistics reset
  - Error counting

- **Emoji Removal Accuracy**
  - Various emoji types
  - Text content preservation
  - Complex emoji sequences

##  Running Tests

### Using npm scripts (Recommended)

```bash
# Run all tests
npm run test:scripts

# Run tests with coverage
npm run test:scripts:coverage

# Run from scripts directory
cd scripts
npm run test:scripts
```

### Using the test runner

```bash
# Run all tests
node scripts/test-runner.js

# Run unit tests only
node scripts/test-runner.js --unit

# Run integration tests only
node scripts/test-runner.js --integration

# Run with coverage
node scripts/test-runner.js --coverage

# Run in watch mode
node scripts/test-runner.js --watch

# Run with verbose output
node scripts/test-runner.js --verbose

# Show test summary
node scripts/test-runner.js --summary

# Show help
node scripts/test-runner.js --help
```

### Using Jest directly

```bash
# Run all tests
npx jest --config scripts/jest.config.js

# Run specific test file
npx jest --config scripts/jest.config.js remove-emojis.test.js

# Run with coverage
npx jest --config scripts/jest.config.js --coverage

# Run in watch mode
npx jest --config scripts/jest.config.js --watch
```

##  Coverage Requirements

The test suite aims for comprehensive coverage:

- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

Coverage reports are generated in `../coverage/scripts/` when running with coverage.

##  Test Configuration

The test suite uses a custom Jest configuration (`jest.config.js`):

- **Environment**: Node.js
- **Test Matching**: `**/__tests__/**/*.test.js`
- **Coverage**: Excludes test files and config files
- **Mocking**: Automatic mock clearing and restoration
- **Verbose**: Detailed test output

##  Mocking Strategy

### Unit Tests
- **fs module**: Mocked to avoid file system dependencies
- **path module**: Used normally (no mocking needed)
- **console**: Spied for CLI testing
- **process**: Mocked for exit code testing

### Integration Tests
- **Real file system**: Uses actual file operations
- **Temporary files**: Created and cleaned up automatically
- **Error simulation**: Tests real error conditions

##  Test Data

### Emoji Test Cases
The tests cover various emoji types:

- Basic emojis:     
- Emoji sequences:  (family)
- Skin tone modifiers: 
- Regional indicators: 
- Symbols:   
- Objects:    

### File Content Examples
- Markdown: `# Test Document \n\nThis is a test with  emojis!`
- JavaScript: `// Test comment \nconsole.log("Hello  world!");`
- HTML: `<title>Test </title><body>Hello !</body>`
- Text: `Hello  world ! This is a test.`

##  Debugging Tests

### Verbose Output
```bash
npm run test:scripts -- --verbose
```

### Single Test Execution
```bash
# Run specific test
npx jest --config scripts/jest.config.js -t "should remove basic emojis"

# Run specific describe block
npx jest --config scripts/jest.config.js -t "removeEmojis"
```

### Debug Mode
```bash
# Run with Node.js debugger
node --inspect-brk node_modules/.bin/jest --config scripts/jest.config.js
```

##  Continuous Integration

The test suite is designed to work in CI environments:

- **No external dependencies**: All tests are self-contained
- **Cross-platform**: Works on Windows, macOS, and Linux
- **Fast execution**: Unit tests run quickly
- **Reliable cleanup**: Integration tests clean up after themselves
- **Clear output**: Structured test results

##  Adding New Tests

### Unit Test Guidelines
1. Use descriptive test names
2. Test one behavior per test
3. Use appropriate assertions
4. Mock external dependencies
5. Test both success and failure cases

### Integration Test Guidelines
1. Create temporary test files
2. Clean up after tests
3. Test real file operations
4. Verify file content changes
5. Test error conditions

### Example Test Structure
```javascript
describe('Feature Name', () => {
    test('should handle normal case', () => {
        // Arrange
        const input = 'test  input';
        
        // Act
        const result = remover.process(input);
        
        // Assert
        expect(result).toBe('test  input');
    });
    
    test('should handle edge case', () => {
        // Test edge case
    });
    
    test('should handle error case', () => {
        // Test error handling
    });
});
```

##  Test Maintenance

### Regular Tasks
- Update emoji ranges when Unicode standards change
- Add tests for new file types
- Verify cross-platform compatibility
- Review and update coverage thresholds

### Performance Monitoring
- Monitor test execution time
- Optimize slow tests
- Remove redundant test cases
- Update test data as needed

##  Related Documentation

- [Emoji Removal Utility](../EMOJI_REMOVAL_README.md)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Node.js Testing Best Practices](https://nodejs.org/en/docs/guides/testing-and-debugging/)
