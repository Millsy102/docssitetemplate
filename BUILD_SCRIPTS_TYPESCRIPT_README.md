# TypeScript Typings for Build Scripts

This document provides comprehensive TypeScript typings for the BeamFlow build scripts, enabling type-safe development and better IDE support.

## Overview

The TypeScript typings provide:

- **Type Safety**: Catch errors at compile time instead of runtime
- **IntelliSense**: Better IDE support with autocomplete and documentation
- **Consistency**: Standardized interfaces across all build scripts
- **Maintainability**: Easier refactoring and code maintenance

## File Structure

```
src/
├── types/
│   └── build-scripts.d.ts    # Main type definitions
└── utils/
    └── build-utils.ts        # TypeScript utility functions
scripts/
└── build-full-system.ts      # Example TypeScript build script
```

## Core Types

### Build Configuration

```typescript
import type { BuildConfig } from '@/types/build-scripts';

const config: BuildConfig = {
  inputDir: 'src',
  outputDir: 'dist',
  verbose: true,
  production: process.env.NODE_ENV === 'production',
  options: {
    clean: true,
    skipTests: false
  }
};
```

### Logger Interface

```typescript
import type { Logger, LogLevelType } from '@/types/build-scripts';

class CustomLogger implements Logger {
  log(message: string, level: LogLevelType = 'INFO'): void {
    // Implementation
  }
  
  info(message: string): void { /* ... */ }
  warn(message: string): void { /* ... */ }
  error(message: string): void { /* ... */ }
  success(message: string): void { /* ... */ }
  debug(message: string): void { /* ... */ }
}
```

### File System Types

```typescript
import type { FileInfo, DirectoryInfo, CopyOptions } from '@/types/build-scripts';

// File information
const fileInfo: FileInfo = {
  path: '/path/to/file.txt',
  relativePath: 'file.txt',
  name: 'file.txt',
  ext: '.txt',
  size: 1024,
  modified: new Date(),
  isDirectory: false
};

// Copy options
const copyOptions: CopyOptions = {
  overwrite: true,
  preserveAttributes: false,
  filter: (file) => !file.name.startsWith('.'),
  onProgress: (file, progress) => console.log(`${file}: ${progress}%`)
};
```

## Utility Functions

### Build Logger

```typescript
import { BuildLogger } from '@/utils/build-utils';

const logger = new BuildLogger(true); // Enable verbose mode

logger.info('Starting build...');
logger.success('Build completed!');
logger.error('Build failed!');
logger.warn('Warning message');
logger.debug('Debug information');
```

### File Operations

```typescript
import {
  getFileInfo,
  getDirectoryInfo,
  copyDirectory,
  findFiles,
  ensureDirectory,
  removeDirectory
} from '@/utils/build-utils';

// Get file information
const fileInfo = await getFileInfo('/path/to/file.txt');

// Get directory information
const dirInfo = await getDirectoryInfo('/path/to/directory');

// Copy directory with progress
await copyDirectory('/src', '/dest', {
  onProgress: (file, progress) => console.log(`${file}: ${progress}%`)
});

// Find files matching pattern
const jsFiles = await findFiles('/src', /\.js$/);

// Ensure directory exists
await ensureDirectory('/path/to/directory');

// Remove directory
await removeDirectory('/path/to/directory');
```

### Process Execution

```typescript
import { executeProcess, executeSync } from '@/utils/build-utils';

// Async process execution
const result = await executeProcess({
  command: 'npm',
  args: ['install'],
  cwd: '/project/directory',
  stdio: 'inherit',
  timeout: 300000 // 5 minutes
});

if (result.success) {
  console.log('Process completed successfully');
} else {
  console.error(`Process failed: ${result.error}`);
}

// Sync process execution
const syncResult = executeSync('npm --version', {
  stdio: 'pipe'
});
```

### Validation

```typescript
import {
  validateBuildConfig,
  validatePrerequisites,
  createBuildContext,
  validateBuildContext
} from '@/utils/build-utils';

// Validate build configuration
const configValidation = await validateBuildConfig(config);
if (!configValidation.valid) {
  configValidation.errors.forEach(error => console.error(error));
}

// Validate prerequisites
const prereqValidation = await validatePrerequisites(['node', 'npm']);
if (!prereqValidation.valid) {
  prereqValidation.errors.forEach(error => console.error(error));
}

// Create and validate build context
const context = createBuildContext(config);
const contextValidation = await validateBuildContext(context);
```

## Build Pipeline Example

Here's a complete example of a TypeScript build script:

```typescript
#!/usr/bin/env tsx

import type { BuildConfig, BuildContext, BuildResult } from '@/types/build-scripts';
import {
  BuildLogger,
  createBuildContext,
  validateBuildContext,
  executeProcess,
  formatDuration,
  generateBuildId
} from '@/utils/build-utils';

class BuildPipeline {
  private context: BuildContext;

  constructor(config: BuildConfig) {
    this.context = createBuildContext(config);
  }

  async execute(): Promise<BuildResult> {
    const startTime = Date.now();
    const logger = this.context.logger;

    try {
      // Validate context
      const validation = await validateBuildContext(this.context);
      if (!validation.valid) {
        throw new Error('Build context validation failed');
      }

      // Execute build steps
      await this.installDependencies();
      await this.buildProject();
      await this.runTests();

      const duration = Date.now() - startTime;
      
      return {
        success: true,
        duration,
        outputFiles: ['dist/index.html', 'dist/assets/'],
        metadata: {
          buildId: generateBuildId(),
          duration: formatDuration(duration)
        }
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration,
        outputFiles: [],
        metadata: { buildId: generateBuildId() }
      };
    }
  }

  private async installDependencies(): Promise<void> {
    const result = await executeProcess({
      command: 'npm',
      args: ['install'],
      stdio: 'inherit'
    });

    if (!result.success) {
      throw new Error(`Failed to install dependencies: ${result.error}`);
    }
  }

  private async buildProject(): Promise<void> {
    const result = await executeProcess({
      command: 'npm',
      args: ['run', 'build'],
      stdio: 'inherit'
    });

    if (!result.success) {
      throw new Error(`Build failed: ${result.error}`);
    }
  }

  private async runTests(): Promise<void> {
    const result = await executeProcess({
      command: 'npm',
      args: ['test'],
      stdio: 'inherit'
    });

    if (!result.success) {
      throw new Error(`Tests failed: ${result.error}`);
    }
  }
}

// Usage
async function main() {
  const config: BuildConfig = {
    inputDir: '.',
    outputDir: 'dist',
    verbose: true,
    production: true
  };

  const pipeline = new BuildPipeline(config);
  const result = await pipeline.execute();

  if (result.success) {
    console.log('Build completed successfully!');
  } else {
    console.error('Build failed:', result.error);
    process.exit(1);
  }
}

main().catch(console.error);
```

## Deployment Types

### GitHub Pages Configuration

```typescript
import type { GitHubPagesConfig } from '@/types/build-scripts';

const ghPagesConfig: GitHubPagesConfig = {
  target: 'github-pages',
  deployDir: 'gh-pages-deploy',
  repoUrl: 'https://github.com/username/repo.git',
  branch: 'gh-pages',
  useActions: true,
  customDomain: 'example.com'
};
```

### Vercel Configuration

```typescript
import type { VercelConfig } from '@/types/build-scripts';

const vercelConfig: VercelConfig = {
  target: 'vercel',
  deployDir: 'dist',
  projectId: 'proj_123456',
  teamId: 'team_123456',
  envVars: {
    NODE_ENV: 'production'
  },
  buildCommand: 'npm run build',
  outputDirectory: 'dist'
};
```

## Testing Types

### Test Configuration

```typescript
import type { TestConfig, ResponsiveTestConfig } from '@/types/build-scripts';

const testConfig: TestConfig = {
  framework: 'jest',
  testDir: 'tests',
  include: ['**/*.test.js'],
  exclude: ['**/*.spec.js'],
  parallel: true,
  workers: 4,
  timeout: 30000
};

const responsiveConfig: ResponsiveTestConfig = {
  framework: 'playwright',
  testDir: 'tests/responsive',
  include: ['**/*.test.ts'],
  exclude: [],
  viewports: [
    { width: 1920, height: 1080, name: 'desktop' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 375, height: 667, name: 'mobile' }
  ],
  screenshots: true,
  screenshotDir: 'screenshots'
};
```

## Security Types

### Security Headers

```typescript
import type { SecurityHeader, SecurityTestConfig } from '@/types/build-scripts';

const securityHeaders: SecurityHeader[] = [
  {
    name: 'Content-Security-Policy',
    value: "default-src 'self'",
    required: true,
    description: 'Prevents XSS attacks'
  },
  {
    name: 'X-Frame-Options',
    value: 'DENY',
    required: true,
    description: 'Prevents clickjacking'
  }
];

const securityConfig: SecurityTestConfig = {
  url: 'https://example.com',
  expectedHeaders: securityHeaders,
  requireHttps: true,
  requireCSP: true,
  requireHSTS: true
};
```

## Image Optimization Types

### Image Configuration

```typescript
import type { ImageOptimizationConfig, ImageFormat } from '@/types/build-scripts';

const imageFormats: ImageFormat[] = [
  {
    ext: '.webp',
    quality: 85,
    options: { quality: 85 },
    enabled: true
  },
  {
    ext: '.avif',
    quality: 80,
    options: { quality: 80 },
    enabled: true
  }
];

const imageConfig: ImageOptimizationConfig = {
  inputDir: 'public/images',
  outputDir: 'public/images',
  supportedFormats: ['.png', '.jpg', '.jpeg'],
  outputFormats: imageFormats,
  preserveOriginals: true,
  maxDimensions: { width: 1920, height: 1080 },
  responsive: true,
  breakpoints: [320, 768, 1024, 1920]
};
```

## Cache Management Types

### Cache Configuration

```typescript
import type { CacheConfig, CacheEntry } from '@/types/build-scripts';

const cacheConfig: CacheConfig = {
  cacheDir: '.cache',
  maxSize: 100 * 1024 * 1024, // 100MB
  expirationTime: 24 * 60 * 60 * 1000, // 24 hours
  compression: true,
  keyStrategy: 'hash',
  keyGenerator: (file) => `${file.name}-${file.size}`
};

const cacheEntry: CacheEntry = {
  key: 'file-hash-123',
  filePath: '/path/to/file.txt',
  size: 1024,
  createdAt: new Date(),
  lastAccessed: new Date(),
  metadata: { version: '1.0.0' }
};
```

## Plugin System Types

### Plugin Definition

```typescript
import type { Plugin, PluginManager } from '@/types/build-scripts';

const myPlugin: Plugin = {
  name: 'my-build-plugin',
  version: '1.0.0',
  description: 'Custom build plugin',
  entry: './plugins/my-plugin.js',
  configSchema: {
    type: 'object',
    properties: {
      enabled: { type: 'boolean' }
    }
  },
  dependencies: ['core-plugin'],
  hooks: {
    preBuild: async (context) => {
      console.log('Pre-build hook executed');
    },
    postBuild: async (context, result) => {
      console.log('Post-build hook executed');
    }
  }
};

class CustomPluginManager implements PluginManager {
  private plugins: Map<string, Plugin> = new Map();

  register(plugin: Plugin): void {
    this.plugins.set(plugin.name, plugin);
  }

  unregister(name: string): void {
    this.plugins.delete(name);
  }

  getPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  async executeHook(hookName: string, ...args: any[]): Promise<void> {
    for (const plugin of this.plugins.values()) {
      const hook = plugin.hooks?.[hookName as keyof typeof plugin.hooks];
      if (hook) {
        await hook(...args);
      }
    }
  }
}
```

## Usage in Package.json Scripts

Add TypeScript build scripts to your `package.json`:

```json
{
  "scripts": {
    "build:ts": "tsx scripts/build-full-system.ts",
    "build:ts:verbose": "tsx scripts/build-full-system.ts --verbose",
    "build:ts:clean": "tsx scripts/build-full-system.ts --clean",
    "build:ts:production": "NODE_ENV=production tsx scripts/build-full-system.ts"
  }
}
```

## Best Practices

### 1. Use Type Annotations

Always use explicit type annotations for better code clarity:

```typescript
// Good
const config: BuildConfig = { /* ... */ };
const result: BuildResult = await pipeline.execute();

// Avoid
const config = { /* ... */ };
const result = await pipeline.execute();
```

### 2. Handle Errors Properly

Use the provided error handling patterns:

```typescript
try {
  const result = await executeProcess(options);
  if (!result.success) {
    throw new Error(result.error);
  }
} catch (error) {
  logger.error(`Process failed: ${error}`);
  throw error;
}
```

### 3. Use Validation

Always validate configurations and contexts:

```typescript
const validation = await validateBuildConfig(config);
if (!validation.valid) {
  validation.errors.forEach(error => logger.error(error));
  process.exit(1);
}
```

### 4. Implement Proper Logging

Use the structured logging approach:

```typescript
const logger = new BuildLogger(verbose);
logger.info('Starting process...');
logger.success('Process completed');
logger.error('Process failed');
```

### 5. Use Async/Await

Prefer async/await over callbacks for better readability:

```typescript
// Good
const files = await findFiles(directory, pattern);

// Avoid
findFiles(directory, pattern, (files) => {
  // Handle files
});
```

## Migration from JavaScript

To migrate existing JavaScript build scripts to TypeScript:

1. **Rename files**: Change `.js` to `.ts`
2. **Add imports**: Import types and utilities
3. **Add type annotations**: Add explicit types
4. **Update package.json**: Add TypeScript scripts
5. **Test thoroughly**: Ensure all functionality works

Example migration:

```typescript
// Before (JavaScript)
const fs = require('fs');
const path = require('path');

function build() {
  // Implementation
}

// After (TypeScript)
import type { BuildConfig, BuildResult } from '@/types/build-scripts';
import { BuildLogger, executeProcess } from '@/utils/build-utils';

async function build(config: BuildConfig): Promise<BuildResult> {
  const logger = new BuildLogger();
  // Implementation
}
```

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure TypeScript paths are configured correctly in `tsconfig.json`
2. **Type Errors**: Use explicit type annotations and check interface definitions
3. **Runtime Errors**: Validate configurations before use
4. **Performance**: Use async operations for file I/O and process execution

### Debug Mode

Enable verbose logging for debugging:

```typescript
const logger = new BuildLogger(true); // Enable verbose mode
logger.debug('Debug information');
```

### Type Checking

Run TypeScript compiler to check types:

```bash
npx tsc --noEmit
```

## Conclusion

The TypeScript typings provide a robust foundation for building type-safe build scripts. They enable better development experience, catch errors early, and provide comprehensive documentation through IntelliSense.

For more information, see the individual type definitions in `src/types/build-scripts.d.ts` and utility functions in `src/utils/build-utils.ts`.
