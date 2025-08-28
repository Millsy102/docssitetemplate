#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

/**
 * Service Worker Version Generator
 * Generates version information for service worker caching and updates
 */

class ServiceWorkerVersionGenerator {
    constructor() {
        this.buildDir = path.join(__dirname, '..', 'dist');
        this.swTemplatePath = path.join(__dirname, '..', 'public', 'sw.js');
        this.swOutputPath = path.join(this.buildDir, 'sw.js');
        this.versionInfoPath = path.join(this.buildDir, 'sw-version.json');
    }

    /**
     * Generate version information
     */
    generateVersionInfo() {
        const timestamp = Date.now();
        const buildHash = this.generateBuildHash();
        const gitInfo = this.getGitInfo();
        const packageVersion = this.getPackageVersion();

        const versionInfo = {
            version: `${packageVersion}-${buildHash}`,
            buildHash,
            timestamp,
            git: gitInfo,
            package: {
                version: packageVersion,
                name: this.getPackageName()
            },
            cache: {
                static: `static-${buildHash}`,
                dynamic: `dynamic-${buildHash}`,
                api: `api-${buildHash}`,
                runtime: `runtime-${buildHash}`
            },
            features: {
                backgroundSync: true,
                pushNotifications: true,
                offlineSupport: true,
                cacheFirst: true,
                networkFirst: true
            }
        };

        return versionInfo;
    }

    /**
     * Generate build hash based on file contents
     */
    generateBuildHash() {
        try {
            // Get list of files to hash
            const filesToHash = this.getFilesToHash();
            let combinedContent = '';

            filesToHash.forEach(filePath => {
                if (fs.existsSync(filePath)) {
                    const content = fs.readFileSync(filePath, 'utf8');
                    combinedContent += content;
                }
            });

            // Add timestamp for uniqueness
            combinedContent += Date.now().toString();

            // Generate hash
            const hash = crypto.createHash('sha256').update(combinedContent).digest('hex');
            return hash.substring(0, 8); // Use first 8 characters
        } catch (error) {
            console.warn('Warning: Could not generate build hash, using timestamp:', error.message);
            return Date.now().toString(36);
        }
    }

    /**
     * Get list of files to include in hash generation
     */
    getFilesToHash() {
        const files = [
            path.join(__dirname, '..', 'package.json'),
            path.join(__dirname, '..', 'vite.config.ts'),
            path.join(__dirname, '..', 'public', 'sw.js'),
            path.join(__dirname, '..', 'src', 'main.tsx'),
            path.join(__dirname, '..', 'src', 'App.tsx')
        ];

        // Add all source files if they exist
        const srcDir = path.join(__dirname, '..', 'src');
        if (fs.existsSync(srcDir)) {
            this.addFilesRecursively(srcDir, files, ['.ts', '.tsx', '.js', '.jsx']);
        }

        return files;
    }

    /**
     * Recursively add files to hash list
     */
    addFilesRecursively(dir, files, extensions) {
        const items = fs.readdirSync(dir);
        
        items.forEach(item => {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                this.addFilesRecursively(fullPath, files, extensions);
            } else if (stat.isFile()) {
                const ext = path.extname(item);
                if (extensions.includes(ext)) {
                    files.push(fullPath);
                }
            }
        });
    }

    /**
     * Get git information
     */
    getGitInfo() {
        try {
            const commitHash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
            const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
            const commitDate = execSync('git log -1 --format=%cd', { encoding: 'utf8' }).trim();
            
            return {
                commit: commitHash.substring(0, 8),
                branch,
                date: commitDate,
                dirty: this.isGitDirty()
            };
        } catch (error) {
            console.warn('Warning: Could not get git info:', error.message);
            return {
                commit: 'unknown',
                branch: 'unknown',
                date: new Date().toISOString(),
                dirty: false
            };
        }
    }

    /**
     * Check if git repository is dirty
     */
    isGitDirty() {
        try {
            const status = execSync('git status --porcelain', { encoding: 'utf8' });
            return status.trim().length > 0;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get package version
     */
    getPackageVersion() {
        try {
            const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
            return packageJson.version;
        } catch (error) {
            return '1.0.0';
        }
    }

    /**
     * Get package name
     */
    getPackageName() {
        try {
            const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
            return packageJson.name;
        } catch (error) {
            return '[your-repo-name]';
        }
    }

    /**
     * Generate service worker with version information
     */
    generateServiceWorker(versionInfo) {
        try {
            let swContent = fs.readFileSync(this.swTemplatePath, 'utf8');

            // Replace version placeholders
            swContent = swContent.replace(/const CACHE_NAME = ['"][^'"]*['"];/, `const CACHE_NAME = '${versionInfo.version}';`);
            swContent = swContent.replace(/const STATIC_CACHE = ['"][^'"]*['"];/, `const STATIC_CACHE = '${versionInfo.cache.static}';`);
            swContent = swContent.replace(/const DYNAMIC_CACHE = ['"][^'"]*['"];/, `const DYNAMIC_CACHE = '${versionInfo.cache.dynamic}';`);
            swContent = swContent.replace(/const API_CACHE = ['"][^'"]*['"];/, `const API_CACHE = '${versionInfo.cache.api}';`);

            // Add version information to service worker
            const versionData = `
// Version Information
const VERSION_INFO = ${JSON.stringify(versionInfo, null, 2)};

// Version check function
function getVersionInfo() {
    return VERSION_INFO;
}

// Export version info for main thread
self.getVersionInfo = getVersionInfo;
`;

            // Insert version data after cache constants
            const insertIndex = swContent.indexOf('// Development flag');
            if (insertIndex !== -1) {
                swContent = swContent.slice(0, insertIndex) + versionData + '\n' + swContent.slice(insertIndex);
            }

            // Write to build directory
            if (!fs.existsSync(this.buildDir)) {
                fs.mkdirSync(this.buildDir, { recursive: true });
            }

            fs.writeFileSync(this.swOutputPath, swContent);
            fs.writeFileSync(this.versionInfoPath, JSON.stringify(versionInfo, null, 2));

            console.log(' Service worker generated with version:', versionInfo.version);
            console.log(' Output files:');
            console.log(`   - ${this.swOutputPath}`);
            console.log(`   - ${this.versionInfoPath}`);

            return versionInfo;
        } catch (error) {
            console.error(' Error generating service worker:', error);
            throw error;
        }
    }

    /**
     * Generate cache manifest
     */
    generateCacheManifest(versionInfo) {
        const manifest = {
            version: versionInfo.version,
            timestamp: versionInfo.timestamp,
            caches: versionInfo.cache,
            files: this.getCacheableFiles()
        };

        const manifestPath = path.join(this.buildDir, 'cache-manifest.json');
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
        
        console.log(' Cache manifest generated:', manifestPath);
        return manifest;
    }

    /**
     * Get list of files to cache
     */
    getCacheableFiles() {
        const files = [
            '/',
            '/index.html',
            '/sw.js',
            '/manifest.json'
        ];

        // Add built assets if they exist
        if (fs.existsSync(this.buildDir)) {
            const assets = this.getBuiltAssets();
            files.push(...assets);
        }

        return files;
    }

    /**
     * Get built assets from dist directory
     */
    getBuiltAssets() {
        const assets = [];
        
        try {
            const items = fs.readdirSync(this.buildDir);
            
            items.forEach(item => {
                const fullPath = path.join(this.buildDir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isFile()) {
                    const ext = path.extname(item);
                    if (['.js', '.css', '.json', '.png', '.jpg', '.jpeg', '.svg', '.ico'].includes(ext)) {
                        assets.push(`/${item}`);
                    }
                }
            });
        } catch (error) {
            console.warn('Warning: Could not read built assets:', error.message);
        }

        return assets;
    }

    /**
     * Main generation process
     */
    generate() {
        console.log(' Generating service worker version...');
        
        const versionInfo = this.generateVersionInfo();
        this.generateServiceWorker(versionInfo);
        this.generateCacheManifest(versionInfo);
        
        console.log(' Service worker versioning complete!');
        return versionInfo;
    }
}

// Run if called directly
if (require.main === module) {
    const generator = new ServiceWorkerVersionGenerator();
    generator.generate();
}

module.exports = ServiceWorkerVersionGenerator;
