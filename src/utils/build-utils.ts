/**
 * TypeScript utility functions for build scripts
 * Provides type-safe implementations of common build operations
 */

import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import { execSync, spawn } from 'child_process';
import type {
  Logger,
  ConsoleColors,
  LogLevelType,
  FileInfo,
  DirectoryInfo,
  CopyOptions,
  ProcessOptions,
  ProcessResult,
  BuildConfig,
  BuildContext,
  ValidationResult,
} from '@/types/build-scripts';

// ============================================================================
// Console Colors
// ============================================================================

export const colors: ConsoleColors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
};

// ============================================================================
// Logger Implementation
// ============================================================================

export class BuildLogger implements Logger {
  private verbose: boolean;

  constructor(verbose = false) {
    this.verbose = verbose;
  }

  log(message: string, level: LogLevelType = 'INFO'): void {
    const timestamp = new Date().toISOString().replace('T', ' ').substr(0, 19);
    const color = this.getColorForLevel(level);

    console.log(`${color}[${timestamp}] [${level}]${colors.reset} ${message}`);
  }

  info(message: string): void {
    this.log(message, 'INFO');
  }

  warn(message: string): void {
    this.log(message, 'WARN');
  }

  error(message: string): void {
    this.log(message, 'ERROR');
  }

  success(message: string): void {
    this.log(message, 'SUCCESS');
  }

  debug(message: string): void {
    if (this.verbose) {
      this.log(message, 'DEBUG');
    }
  }

  private getColorForLevel(level: LogLevelType): string {
    switch (level) {
      case 'ERROR':
        return colors.red;
      case 'WARN':
        return colors.yellow;
      case 'SUCCESS':
        return colors.green;
      case 'DEBUG':
        return colors.gray;
      default:
        return colors.blue;
    }
  }
}

// ============================================================================
// File System Utilities
// ============================================================================

export async function getFileInfo(filePath: string): Promise<FileInfo> {
  const stats = await fs.stat(filePath);
  const relativePath = path.relative(process.cwd(), filePath);

  return {
    path: filePath,
    relativePath,
    name: path.basename(filePath),
    ext: path.extname(filePath),
    size: stats.size,
    modified: stats.mtime,
    isDirectory: stats.isDirectory(),
  };
}

export async function getDirectoryInfo(
  dirPath: string
): Promise<DirectoryInfo> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files: FileInfo[] = [];
  const subdirectories: DirectoryInfo[] = [];
  let totalSize = 0;

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      const subDir = await getDirectoryInfo(fullPath);
      subdirectories.push(subDir);
      totalSize += subDir.totalSize;
    } else {
      const fileInfo = await getFileInfo(fullPath);
      files.push(fileInfo);
      totalSize += fileInfo.size;
    }
  }

  return {
    path: dirPath,
    name: path.basename(dirPath),
    files,
    subdirectories,
    totalSize,
  };
}

export async function copyDirectory(
  src: string,
  dest: string,
  options: CopyOptions = {}
): Promise<void> {
  const { overwrite = true, filter, onProgress } = options;

  if (!fsSync.existsSync(dest)) {
    await fs.mkdir(dest, { recursive: true });
  }

  const entries = await fs.readdir(src, { withFileTypes: true });
  let processed = 0;

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath, options);
    } else {
      const fileInfo = await getFileInfo(srcPath);

      if (filter && !filter(fileInfo)) {
        continue;
      }

      if (overwrite || !fsSync.existsSync(destPath)) {
        await fs.copyFile(srcPath, destPath);
      }

      processed++;
      if (onProgress) {
        onProgress(entry.name, (processed / entries.length) * 100);
      }
    }
  }
}

export async function findFiles(
  dir: string,
  pattern: RegExp | string
): Promise<FileInfo[]> {
  const files: FileInfo[] = [];

  async function scan(currentDir: string): Promise<void> {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        await scan(fullPath);
      } else {
        const fileInfo = await getFileInfo(fullPath);
        const matches =
          typeof pattern === 'string'
            ? fileInfo.name.includes(pattern)
            : pattern.test(fileInfo.name);

        if (matches) {
          files.push(fileInfo);
        }
      }
    }
  }

  await scan(dir);
  return files;
}

export async function ensureDirectory(dirPath: string): Promise<void> {
  if (!fsSync.existsSync(dirPath)) {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

export async function removeDirectory(dirPath: string): Promise<void> {
  if (fsSync.existsSync(dirPath)) {
    await fs.rm(dirPath, { recursive: true, force: true });
  }
}

// ============================================================================
// Process Execution Utilities
// ============================================================================

export async function executeProcess(
  options: ProcessOptions
): Promise<ProcessResult> {
  const startTime = Date.now();

  try {
    const { command, args = [], cwd, env, stdio = 'pipe', timeout } = options;

    return new Promise(resolve => {
      const child = spawn(command, args, {
        cwd,
        env: { ...process.env, ...env },
        stdio,
      });

      let stdout = '';
      let stderr = '';

      if (stdio === 'pipe') {
        child.stdout?.on('data', data => {
          stdout += data.toString();
        });

        child.stderr?.on('data', data => {
          stderr += data.toString();
        });
      }

      const timeoutId = timeout
        ? setTimeout(() => {
            child.kill('SIGTERM');
            resolve({
              success: false,
              exitCode: -1,
              stdout,
              stderr,
              duration: Date.now() - startTime,
              error: 'Process timed out',
            });
          }, timeout)
        : null;

      child.on('close', code => {
        if (timeoutId) clearTimeout(timeoutId);

        resolve({
          success: code === 0,
          exitCode: code ?? -1,
          stdout,
          stderr,
          duration: Date.now() - startTime,
          error: code !== 0 ? `Process exited with code ${code}` : undefined,
        });
      });

      child.on('error', error => {
        if (timeoutId) clearTimeout(timeoutId);

        resolve({
          success: false,
          exitCode: -1,
          stdout,
          stderr,
          duration: Date.now() - startTime,
          error: error.message,
        });
      });
    });
  } catch (error) {
    return {
      success: false,
      exitCode: -1,
      stdout: '',
      stderr: '',
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export function executeSync(
  command: string,
  options: {
    cwd?: string;
    env?: Record<string, string>;
    stdio?: 'inherit' | 'pipe' | 'ignore';
    timeout?: number;
  } = {}
): ProcessResult {
  const startTime = Date.now();

  try {
    const { cwd, env, stdio = 'pipe', timeout } = options;

    const result = execSync(command, {
      cwd,
      env: { ...process.env, ...env },
      stdio,
      timeout,
      encoding: 'utf8',
    });

    return {
      success: true,
      exitCode: 0,
      stdout: typeof result === 'string' ? result : '',
      stderr: '',
      duration: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      success: false,
      exitCode: error.status ?? -1,
      stdout: error.stdout?.toString() ?? '',
      stderr: error.stderr?.toString() ?? '',
      duration: Date.now() - startTime,
      error: error.message,
    };
  }
}

// ============================================================================
// Validation Utilities
// ============================================================================

export async function validateBuildConfig(
  config: BuildConfig
): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate input directory
  if (!config.inputDir) {
    errors.push('Input directory is required');
  } else if (!fsSync.existsSync(config.inputDir)) {
    errors.push(`Input directory does not exist: ${config.inputDir}`);
  }

  // Validate output directory
  if (!config.outputDir) {
    errors.push('Output directory is required');
  }

  // Check if output directory is writable
  if (config.outputDir) {
    try {
      await ensureDirectory(config.outputDir);
    } catch (error) {
      errors.push(`Cannot create output directory: ${config.outputDir}`);
    }
  }

  // Validate Node.js and npm versions
  try {
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

    if (majorVersion < 18) {
      warnings.push(
        `Node.js version ${nodeVersion} is below recommended version 18`
      );
    }
  } catch (error) {
    warnings.push('Could not determine Node.js version');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    metadata: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
    },
  };
}

export async function validatePrerequisites(
  required: string[]
): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const tool of required) {
    try {
      const result = executeSync(`${tool} --version`);
      if (!result.success) {
        errors.push(`Tool ${tool} is not available`);
      }
    } catch (error) {
      errors.push(`Tool ${tool} is not available`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    metadata: {
      requiredTools: required,
      availableTools: required.filter(tool => {
        try {
          return executeSync(`${tool} --version`).success;
        } catch {
          return false;
        }
      }),
    },
  };
}

// ============================================================================
// Build Context Utilities
// ============================================================================

export function createBuildContext(config: BuildConfig): BuildContext {
  return {
    config,
    logger: new BuildLogger(config.verbose),
    cwd: process.cwd(),
    startTime: new Date(),
    env: process.env,
    artifacts: new Map(),
  };
}

export async function validateBuildContext(
  context: BuildContext
): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate working directory
  if (!fsSync.existsSync(context.cwd)) {
    errors.push('Working directory does not exist');
  }

  // Validate build configuration
  const configValidation = await validateBuildConfig(context.config);
  errors.push(...configValidation.errors);
  warnings.push(...configValidation.warnings);

  // Check for required environment variables
  const requiredEnvVars = ['NODE_ENV'];
  for (const envVar of requiredEnvVars) {
    if (!context.env[envVar]) {
      warnings.push(`Environment variable ${envVar} is not set`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    metadata: {
      ...configValidation.metadata,
      workingDirectory: context.cwd,
      buildStartTime: context.startTime.toISOString(),
    },
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;

  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(1);
  return `${minutes}m ${seconds}s`;
}

export function generateBuildId(): string {
  return `build-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-z0-9.-]/gi, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

export function getRelativePath(from: string, to: string): string {
  return path.relative(from, to).replace(/\\/g, '/');
}

// ============================================================================
// Export all utilities
// ============================================================================

export {
  BuildLogger,
  getFileInfo,
  getDirectoryInfo,
  copyDirectory,
  findFiles,
  ensureDirectory,
  removeDirectory,
  executeProcess,
  executeSync,
  validateBuildConfig,
  validatePrerequisites,
  createBuildContext,
  validateBuildContext,
  formatBytes,
  formatDuration,
  generateBuildId,
  sanitizeFileName,
  getRelativePath,
};
