/**
 * TypeScript typings for BeamFlow build scripts
 * Provides type definitions for all build and deployment scripts
 */

// ============================================================================
// Core Types and Interfaces
// ============================================================================

export interface BuildConfig {
  /** Input directory for build operations */
  inputDir: string;
  /** Output directory for build results */
  outputDir: string;
  /** Whether to enable verbose logging */
  verbose?: boolean;
  /** Whether to run in production mode */
  production?: boolean;
  /** Custom build options */
  options?: Record<string, any>;
}

export interface LogLevel {
  INFO: 'INFO';
  WARN: 'WARN';
  ERROR: 'ERROR';
  SUCCESS: 'SUCCESS';
  DEBUG: 'DEBUG';
}

export type LogLevelType = keyof LogLevel;

export interface Logger {
  /** Log a message with optional level */
  log(message: string, level?: LogLevelType): void;
  /** Log an info message */
  info(message: string): void;
  /** Log a warning message */
  warn(message: string): void;
  /** Log an error message */
  error(message: string): void;
  /** Log a success message */
  success(message: string): void;
  /** Log a debug message */
  debug(message: string): void;
}

export interface ConsoleColors {
  reset: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;
  gray: string;
}

// ============================================================================
// File System Types
// ============================================================================

export interface FileInfo {
  /** Full path to the file */
  path: string;
  /** Relative path from base directory */
  relativePath: string;
  /** File name with extension */
  name: string;
  /** File extension */
  ext: string;
  /** File size in bytes */
  size: number;
  /** Last modified timestamp */
  modified: Date;
  /** Whether the file is a directory */
  isDirectory: boolean;
}

export interface DirectoryInfo {
  /** Full path to the directory */
  path: string;
  /** Directory name */
  name: string;
  /** Array of files in the directory */
  files: FileInfo[];
  /** Array of subdirectories */
  subdirectories: DirectoryInfo[];
  /** Total size of directory contents */
  totalSize: number;
}

export interface CopyOptions {
  /** Whether to overwrite existing files */
  overwrite?: boolean;
  /** Whether to preserve file attributes */
  preserveAttributes?: boolean;
  /** File filter function */
  filter?: (file: FileInfo) => boolean;
  /** Progress callback */
  onProgress?: (file: string, progress: number) => void;
}

// ============================================================================
// Build System Types
// ============================================================================

export interface BuildStep {
  /** Unique identifier for the build step */
  id: string;
  /** Human-readable name */
  name: string;
  /** Function to execute the build step */
  execute: () => Promise<void>;
  /** Dependencies that must complete before this step */
  dependencies?: string[];
  /** Whether this step is required */
  required?: boolean;
  /** Timeout in milliseconds */
  timeout?: number;
}

export interface BuildResult {
  /** Whether the build was successful */
  success: boolean;
  /** Error message if build failed */
  error?: string;
  /** Build duration in milliseconds */
  duration: number;
  /** Output files generated */
  outputFiles: string[];
  /** Build metadata */
  metadata: Record<string, any>;
}

export interface BuildContext {
  /** Build configuration */
  config: BuildConfig;
  /** Logger instance */
  logger: Logger;
  /** Current working directory */
  cwd: string;
  /** Build start time */
  startTime: Date;
  /** Environment variables */
  env: NodeJS.ProcessEnv;
  /** Build artifacts */
  artifacts: Map<string, any>;
}

// ============================================================================
// Deployment Types
// ============================================================================

export interface DeploymentConfig {
  /** Deployment target (e.g., 'github-pages', 'vercel') */
  target: string;
  /** Deployment directory */
  deployDir: string;
  /** Whether to create a backup before deployment */
  backup?: boolean;
  /** Whether to validate deployment */
  validate?: boolean;
  /** Custom deployment options */
  options?: Record<string, any>;
}

export interface GitHubPagesConfig extends DeploymentConfig {
  target: 'github-pages';
  /** GitHub repository URL */
  repoUrl: string;
  /** Branch to deploy to */
  branch: string;
  /** Whether to use GitHub Actions */
  useActions?: boolean;
  /** Custom domain configuration */
  customDomain?: string;
}

export interface VercelConfig extends DeploymentConfig {
  target: 'vercel';
  /** Vercel project ID */
  projectId: string;
  /** Vercel team ID */
  teamId?: string;
  /** Environment variables for deployment */
  envVars?: Record<string, string>;
  /** Build command override */
  buildCommand?: string;
  /** Output directory override */
  outputDirectory?: string;
}

export interface DeploymentResult {
  /** Whether deployment was successful */
  success: boolean;
  /** Deployment URL */
  url?: string;
  /** Error message if deployment failed */
  error?: string;
  /** Deployment duration */
  duration: number;
  /** Deployment metadata */
  metadata: Record<string, any>;
}

// ============================================================================
// Image Optimization Types
// ============================================================================

export interface ImageFormat {
  /** File extension */
  ext: string;
  /** Quality setting (0-100) */
  quality: number;
  /** Sharp.js options */
  options: Record<string, any>;
  /** Whether this format is enabled */
  enabled?: boolean;
}

export interface ImageOptimizationConfig {
  /** Input directory for images */
  inputDir: string;
  /** Output directory for optimized images */
  outputDir: string;
  /** Supported input formats */
  supportedFormats: string[];
  /** Output formats to generate */
  outputFormats: ImageFormat[];
  /** Whether to preserve original files */
  preserveOriginals?: boolean;
  /** Maximum image dimensions */
  maxDimensions?: {
    width: number;
    height: number;
  };
  /** Whether to generate responsive images */
  responsive?: boolean;
  /** Responsive breakpoints */
  breakpoints?: number[];
}

export interface OptimizedImage {
  /** Original file path */
  originalPath: string;
  /** Optimized file path */
  optimizedPath: string;
  /** File format */
  format: string;
  /** Original file size in bytes */
  originalSize: number;
  /** Optimized file size in bytes */
  optimizedSize: number;
  /** Compression ratio percentage */
  compressionRatio: number;
  /** Image dimensions */
  dimensions: {
    width: number;
    height: number;
  };
  /** Processing time in milliseconds */
  processingTime: number;
}

export interface ImageOptimizationResult {
  /** Whether optimization was successful */
  success: boolean;
  /** Array of optimized images */
  images: OptimizedImage[];
  /** Total processing time */
  totalTime: number;
  /** Total size reduction */
  totalSizeReduction: number;
  /** Error messages */
  errors: string[];
}

// ============================================================================
// Testing Types
// ============================================================================

export interface TestConfig {
  /** Test framework to use */
  framework: 'jest' | 'playwright' | 'puppeteer';
  /** Test directory */
  testDir: string;
  /** Test patterns to include */
  include: string[];
  /** Test patterns to exclude */
  exclude: string[];
  /** Whether to run tests in parallel */
  parallel?: boolean;
  /** Number of parallel workers */
  workers?: number;
  /** Test timeout in milliseconds */
  timeout?: number;
  /** Environment variables for tests */
  env?: Record<string, string>;
}

export interface TestResult {
  /** Whether all tests passed */
  passed: boolean;
  /** Number of tests run */
  total: number;
  /** Number of tests passed */
  passed: number;
  /** Number of tests failed */
  failed: number;
  /** Number of tests skipped */
  skipped: number;
  /** Test duration in milliseconds */
  duration: number;
  /** Test coverage information */
  coverage?: {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
  };
  /** Error messages */
  errors: string[];
}

export interface ResponsiveTestConfig extends TestConfig {
  framework: 'playwright';
  /** Viewport sizes to test */
  viewports: Array<{
    width: number;
    height: number;
    name: string;
  }>;
  /** Devices to emulate */
  devices?: string[];
  /** Whether to capture screenshots */
  screenshots?: boolean;
  /** Screenshot directory */
  screenshotDir?: string;
}

// ============================================================================
// Security Types
// ============================================================================

export interface SecurityHeader {
  /** Header name */
  name: string;
  /** Header value */
  value: string;
  /** Whether this header is required */
  required?: boolean;
  /** Description of the header's purpose */
  description?: string;
}

export interface SecurityTestConfig {
  /** URL to test */
  url: string;
  /** Expected security headers */
  expectedHeaders: SecurityHeader[];
  /** Whether to check for HTTPS */
  requireHttps?: boolean;
  /** Whether to check for CSP */
  requireCSP?: boolean;
  /** Whether to check for HSTS */
  requireHSTS?: boolean;
  /** Custom security checks */
  customChecks?: Array<{
    name: string;
    check: (headers: Record<string, string>) => boolean;
    description: string;
  }>;
}

export interface SecurityTestResult {
  /** Whether all security checks passed */
  passed: boolean;
  /** Array of security headers found */
  headers: Array<{
    name: string;
    value: string;
    expected: boolean;
  }>;
  /** Missing required headers */
  missingHeaders: string[];
  /** Security warnings */
  warnings: string[];
  /** Security errors */
  errors: string[];
}

// ============================================================================
// Cache Management Types
// ============================================================================

export interface CacheConfig {
  /** Cache directory */
  cacheDir: string;
  /** Maximum cache size in bytes */
  maxSize: number;
  /** Cache expiration time in milliseconds */
  expirationTime: number;
  /** Whether to enable cache compression */
  compression?: boolean;
  /** Cache key generation strategy */
  keyStrategy?: 'hash' | 'timestamp' | 'custom';
  /** Custom key generation function */
  keyGenerator?: (file: FileInfo) => string;
}

export interface CacheEntry {
  /** Cache key */
  key: string;
  /** File path */
  filePath: string;
  /** File size */
  size: number;
  /** Creation timestamp */
  createdAt: Date;
  /** Last access timestamp */
  lastAccessed: Date;
  /** Cache metadata */
  metadata: Record<string, any>;
}

export interface CacheResult {
  /** Whether cache operation was successful */
  success: boolean;
  /** Number of cache entries processed */
  entriesProcessed: number;
  /** Total cache size */
  totalSize: number;
  /** Number of entries removed */
  entriesRemoved: number;
  /** Error messages */
  errors: string[];
}

// ============================================================================
// Utility Types
// ============================================================================

export interface ProcessOptions {
  /** Command to execute */
  command: string;
  /** Command arguments */
  args?: string[];
  /** Working directory */
  cwd?: string;
  /** Environment variables */
  env?: Record<string, string>;
  /** Whether to inherit stdio */
  stdio?: 'inherit' | 'pipe' | 'ignore';
  /** Timeout in milliseconds */
  timeout?: number;
  /** Whether to run in background */
  background?: boolean;
}

export interface ProcessResult {
  /** Whether process completed successfully */
  success: boolean;
  /** Process exit code */
  exitCode: number;
  /** Standard output */
  stdout?: string;
  /** Standard error */
  stderr?: string;
  /** Process duration in milliseconds */
  duration: number;
  /** Error message if process failed */
  error?: string;
}

export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean;
  /** Validation errors */
  errors: string[];
  /** Validation warnings */
  warnings: string[];
  /** Validation metadata */
  metadata: Record<string, any>;
}

// ============================================================================
// Plugin System Types
// ============================================================================

export interface Plugin {
  /** Plugin name */
  name: string;
  /** Plugin version */
  version: string;
  /** Plugin description */
  description: string;
  /** Plugin entry point */
  entry: string;
  /** Plugin configuration schema */
  configSchema?: Record<string, any>;
  /** Plugin dependencies */
  dependencies?: string[];
  /** Plugin hooks */
  hooks?: {
    preBuild?: (context: BuildContext) => Promise<void>;
    postBuild?: (context: BuildContext, result: BuildResult) => Promise<void>;
    preDeploy?: (config: DeploymentConfig) => Promise<void>;
    postDeploy?: (config: DeploymentConfig, result: DeploymentResult) => Promise<void>;
  };
}

export interface PluginManager {
  /** Register a plugin */
  register(plugin: Plugin): void;
  /** Unregister a plugin */
  unregister(name: string): void;
  /** Get all registered plugins */
  getPlugins(): Plugin[];
  /** Execute plugin hook */
  executeHook(hookName: string, ...args: any[]): Promise<void>;
}

// ============================================================================
// Export all types
// ============================================================================

export type {
  BuildConfig,
  LogLevel,
  LogLevelType,
  Logger,
  ConsoleColors,
  FileInfo,
  DirectoryInfo,
  CopyOptions,
  BuildStep,
  BuildResult,
  BuildContext,
  DeploymentConfig,
  GitHubPagesConfig,
  VercelConfig,
  DeploymentResult,
  ImageFormat,
  ImageOptimizationConfig,
  OptimizedImage,
  ImageOptimizationResult,
  TestConfig,
  TestResult,
  ResponsiveTestConfig,
  SecurityHeader,
  SecurityTestConfig,
  SecurityTestResult,
  CacheConfig,
  CacheEntry,
  CacheResult,
  ProcessOptions,
  ProcessResult,
  ValidationResult,
  Plugin,
  PluginManager
};
