#!/usr/bin/env tsx

/**
 * BeamFlow Full System Build Script (TypeScript Version)
 * Builds both the public documentation site and the hidden secret system
 * Demonstrates usage of TypeScript typings and utilities
 */

import type {
  BuildConfig,
  BuildContext,
  BuildResult,
  ValidationResult,
  ProcessResult,
} from '@/types/build-scripts';

import {
  BuildLogger,
  createBuildContext,
  validateBuildContext,
  validatePrerequisites,
  executeSync,
  executeProcess,
  copyDirectory,
  ensureDirectory,
  removeDirectory,
  getFileInfo,
  findFiles,
  formatBytes,
  formatDuration,
  generateBuildId,
} from '@/utils/build-utils';

import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_BUILD_CONFIG: BuildConfig = {
  inputDir: '.',
  outputDir: 'dist',
  verbose: process.argv.includes('--verbose'),
  production: process.env.NODE_ENV === 'production',
  options: {
    clean: process.argv.includes('--clean'),
    skipTests: process.argv.includes('--skip-tests'),
    skipOptimization: process.argv.includes('--skip-optimization'),
  },
};

// ============================================================================
// Build Steps
// ============================================================================

interface BuildStep {
  name: string;
  execute: (context: BuildContext) => Promise<void>;
  dependencies?: string[];
}

class BuildPipeline {
  private context: BuildContext;
  private steps: Map<string, BuildStep> = new Map();
  private executedSteps: Set<string> = new Set();

  constructor(context: BuildContext) {
    this.context = context;
    this.initializeSteps();
  }

  private initializeSteps(): void {
    this.steps.set('prerequisites', {
      name: 'Check Prerequisites',
      execute: this.checkPrerequisites.bind(this),
    });

    this.steps.set('clean', {
      name: 'Clean Build Directories',
      execute: this.cleanBuildDirectories.bind(this),
      dependencies: ['prerequisites'],
    });

    this.steps.set('install-deps', {
      name: 'Install Dependencies',
      execute: this.installDependencies.bind(this),
      dependencies: ['clean'],
    });

    this.steps.set('build-public', {
      name: 'Build Public Site',
      execute: this.buildPublicSite.bind(this),
      dependencies: ['install-deps'],
    });

    this.steps.set('build-secret', {
      name: 'Build Secret System',
      execute: this.buildSecretSystem.bind(this),
      dependencies: ['install-deps'],
    });

    this.steps.set('optimize', {
      name: 'Optimize Assets',
      execute: this.optimizeAssets.bind(this),
      dependencies: ['build-public'],
    });

    this.steps.set('test', {
      name: 'Run Tests',
      execute: this.runTests.bind(this),
      dependencies: ['build-public', 'build-secret'],
    });

    this.steps.set('package', {
      name: 'Create Deployment Package',
      execute: this.createDeploymentPackage.bind(this),
      dependencies: ['optimize', 'test'],
    });
  }

  async execute(): Promise<BuildResult> {
    const startTime = Date.now();
    const logger = this.context.logger;

    try {
      logger.info('Starting build pipeline...');

      // Validate build context
      const validation = await validateBuildContext(this.context);
      if (!validation.valid) {
        logger.error('Build context validation failed:');
        validation.errors.forEach(error => logger.error(`  - ${error}`));
        validation.warnings.forEach(warning => logger.warn(`  - ${warning}`));
        throw new Error('Build context validation failed');
      }

      // Execute all steps
      const stepNames = Array.from(this.steps.keys());
      for (const stepName of stepNames) {
        await this.executeStep(stepName);
      }

      const duration = Date.now() - startTime;
      logger.success(
        `Build completed successfully in ${formatDuration(duration)}`
      );

      return {
        success: true,
        duration,
        outputFiles: await this.getOutputFiles(),
        metadata: {
          buildId: generateBuildId(),
          stepsExecuted: Array.from(this.executedSteps),
          totalDuration: duration,
        },
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      logger.error(
        `Build failed after ${formatDuration(duration)}: ${errorMessage}`
      );

      return {
        success: false,
        error: errorMessage,
        duration,
        outputFiles: [],
        metadata: {
          buildId: generateBuildId(),
          stepsExecuted: Array.from(this.executedSteps),
          error: errorMessage,
        },
      };
    }
  }

  private async executeStep(stepName: string): Promise<void> {
    const step = this.steps.get(stepName);
    if (!step) {
      throw new Error(`Unknown build step: ${stepName}`);
    }

    // Check dependencies
    if (step.dependencies) {
      for (const dep of step.dependencies) {
        if (!this.executedSteps.has(dep)) {
          throw new Error(
            `Step ${stepName} depends on ${dep} which has not been executed`
          );
        }
      }
    }

    // Execute step
    this.context.logger.info(`Executing step: ${step.name}`);
    await step.execute(this.context);
    this.executedSteps.add(stepName);
    this.context.logger.success(`Completed step: ${step.name}`);
  }

  private async getOutputFiles(): Promise<string[]> {
    const outputDir = this.context.config.outputDir;
    if (!outputDir) return [];

    try {
      const files = await findFiles(outputDir, /.*/);
      return files.map(file => file.relativePath);
    } catch {
      return [];
    }
  }

  // ============================================================================
  // Step Implementations
  // ============================================================================

  private async checkPrerequisites(context: BuildContext): Promise<void> {
    const logger = context.logger;
    logger.info('Checking prerequisites...');

    const required = ['node', 'npm'];
    const validation = await validatePrerequisites(required);

    if (!validation.valid) {
      logger.error('Prerequisites check failed:');
      validation.errors.forEach(error => logger.error(`  - ${error}`));
      throw new Error('Missing required prerequisites');
    }

    logger.success('Prerequisites check passed');
  }

  private async cleanBuildDirectories(context: BuildContext): Promise<void> {
    const logger = context.logger;
    const { clean } = context.config.options || {};

    if (!clean) {
      logger.info('Skipping clean step (use --clean to enable)');
      return;
    }

    logger.info('Cleaning build directories...');

    const dirsToClean = ['dist', 'build', 'coverage', 'gh-pages-deploy'];

    for (const dir of dirsToClean) {
      if (dir === 'dist' && !context.config.options?.clean) {
        continue; // Skip dist unless explicitly cleaning
      }

      try {
        await removeDirectory(dir);
        logger.debug(`Cleaned directory: ${dir}`);
      } catch (error) {
        logger.warn(`Could not clean directory ${dir}: ${error}`);
      }
    }

    logger.success('Build directories cleaned');
  }

  private async installDependencies(context: BuildContext): Promise<void> {
    const logger = context.logger;
    logger.info('Installing dependencies...');

    const result = await executeProcess({
      command: 'npm',
      args: ['install'],
      stdio: 'inherit',
    });

    if (!result.success) {
      throw new Error(`Failed to install dependencies: ${result.error}`);
    }

    logger.success('Dependencies installed successfully');
  }

  private async buildPublicSite(context: BuildContext): Promise<void> {
    const logger = context.logger;
    logger.info('Building public documentation site...');

    const result = await executeProcess({
      command: 'npm',
      args: ['run', 'build'],
      stdio: 'inherit',
    });

    if (!result.success) {
      throw new Error(`Public site build failed: ${result.error}`);
    }

    // Verify build output
    const outputDir = context.config.outputDir;
    if (outputDir) {
      const indexFile = `${outputDir}/index.html`;
      try {
        await getFileInfo(indexFile);
        logger.success('Public site build completed and verified');
      } catch {
        throw new Error('Build output missing index.html');
      }
    }
  }

  private async buildSecretSystem(context: BuildContext): Promise<void> {
    const logger = context.logger;
    const secretPath = '_internal/system';

    logger.info('Building hidden secret system...');

    if (!fsSync.existsSync(secretPath)) {
      logger.error('Secret system directory not found');
      throw new Error('Secret system directory not found');
    }

    const originalCwd = process.cwd();

    try {
      // Change to secret system directory
      process.chdir(secretPath);
      logger.debug(`Changed to directory: ${secretPath}`);

      // Install dependencies
      const installResult = await executeProcess({
        command: 'npm',
        args: ['install'],
        stdio: 'inherit',
      });

      if (!installResult.success) {
        throw new Error(
          `Failed to install secret system dependencies: ${installResult.error}`
        );
      }

      // Build the secret system
      const buildResult = await executeProcess({
        command: 'npm',
        args: ['run', 'build'],
        stdio: 'inherit',
      });

      if (!buildResult.success) {
        throw new Error(`Secret system build failed: ${buildResult.error}`);
      }

      logger.success('Secret system build completed');
    } finally {
      // Always return to original directory
      process.chdir(originalCwd);
      logger.debug(`Returned to directory: ${originalCwd}`);
    }
  }

  private async optimizeAssets(context: BuildContext): Promise<void> {
    const logger = context.logger;
    const { skipOptimization } = context.config.options || {};

    if (skipOptimization) {
      logger.info(
        'Skipping asset optimization (use --skip-optimization to disable)'
      );
      return;
    }

    logger.info('Optimizing assets...');

    // Run image optimization
    const imageResult = await executeProcess({
      command: 'npm',
      args: ['run', 'optimize:images'],
      stdio: 'inherit',
    });

    if (!imageResult.success) {
      logger.warn(`Image optimization failed: ${imageResult.error}`);
    } else {
      logger.success('Asset optimization completed');
    }
  }

  private async runTests(context: BuildContext): Promise<void> {
    const logger = context.logger;
    const { skipTests } = context.config.options || {};

    if (skipTests) {
      logger.info('Skipping tests (use --skip-tests to disable)');
      return;
    }

    logger.info('Running tests...');

    const testResult = await executeProcess({
      command: 'npm',
      args: ['test'],
      stdio: 'inherit',
    });

    if (!testResult.success) {
      throw new Error(`Tests failed: ${testResult.error}`);
    }

    logger.success('All tests passed');
  }

  private async createDeploymentPackage(context: BuildContext): Promise<void> {
    const logger = context.logger;
    logger.info('Creating deployment package...');

    const deployDir = 'gh-pages-deploy';
    const outputDir = context.config.outputDir;

    if (!outputDir) {
      throw new Error('Output directory not configured');
    }

    try {
      // Clean previous deployment directory
      await removeDirectory(deployDir);

      // Create deployment directory
      await ensureDirectory(deployDir);

      // Copy built files
      await copyDirectory(outputDir, deployDir, {
        onProgress: (file, progress) => {
          logger.debug(`Copying: ${file} (${progress.toFixed(1)}%)`);
        },
      });

      // Copy additional files for GitHub Pages
      await this.copyAdditionalFiles(deployDir);

      // Create .nojekyll file
      await fs.writeFile(path.join(deployDir, '.nojekyll'), '');

      // Create deployment README
      await this.createDeploymentReadme(deployDir);

      logger.success(`Deployment package created in: ${deployDir}`);
    } catch (error) {
      throw new Error(`Failed to create deployment package: ${error}`);
    }
  }

  private async copyAdditionalFiles(deployDir: string): Promise<void> {
    const additionalFiles = ['README.md', 'LICENSE', 'CNAME'];

    for (const file of additionalFiles) {
      try {
        if (fsSync.existsSync(file)) {
          await fs.copyFile(file, path.join(deployDir, file));
        }
      } catch (error) {
        // Ignore errors for optional files
      }
    }
  }

  private async createDeploymentReadme(deployDir: string): Promise<void> {
    const readmeContent = `# BeamFlow Documentation Site - Deployment

This directory contains the built documentation site ready for deployment.

## Build Information
- Build Time: ${new Date().toISOString()}
- Build ID: ${generateBuildId()}
- Node Version: ${process.version}

## Deployment Instructions

### GitHub Pages
1. Push this directory to the \`gh-pages\` branch
2. Configure GitHub Pages in repository settings
3. Set source to \`gh-pages\` branch

### Vercel
1. Deploy this directory to Vercel
2. Configure build settings as needed

For more information, see the main README.md file.
`;

    await fs.writeFile(path.join(deployDir, 'DEPLOYMENT.md'), readmeContent);
  }
}

// ============================================================================
// Main Execution
// ============================================================================

async function main(): Promise<void> {
  const logger = new BuildLogger(DEFAULT_BUILD_CONFIG.verbose);

  try {
    logger.info('BeamFlow Full System Build Script (TypeScript)');
    logger.info(`Node.js version: ${process.version}`);
    logger.info(`Platform: ${process.platform}`);
    logger.info(`Architecture: ${process.arch}`);

    // Create build context
    const context = createBuildContext(DEFAULT_BUILD_CONFIG);

    // Create and execute build pipeline
    const pipeline = new BuildPipeline(context);
    const result = await pipeline.execute();

    if (result.success) {
      logger.success('Build completed successfully!');
      logger.info(`Output files: ${result.outputFiles.length}`);
      logger.info(`Build duration: ${formatDuration(result.duration)}`);

      if (result.outputFiles.length > 0) {
        logger.info('Output files:');
        result.outputFiles.slice(0, 10).forEach(file => {
          logger.info(`  - ${file}`);
        });
        if (result.outputFiles.length > 10) {
          logger.info(`  ... and ${result.outputFiles.length - 10} more files`);
        }
      }
    } else {
      logger.error('Build failed!');
      if (result.error) {
        logger.error(`Error: ${result.error}`);
      }
      process.exit(1);
    }
  } catch (error) {
    logger.error('Unexpected error during build:');
    logger.error(error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

// Run the main function if this script is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { BuildPipeline, main };
