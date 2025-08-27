#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const ServiceWorkerVersionGenerator = require('./generate-sw-version.js');

/**
 * Build script with Service Worker versioning
 * Runs Vite build and then generates versioned service worker
 */

class BuildWithServiceWorker {
    constructor() {
        this.projectRoot = path.join(__dirname, '..');
        this.distDir = path.join(this.projectRoot, 'dist');
        this.swGenerator = new ServiceWorkerVersionGenerator();
    }

    /**
     * Run the complete build process
     */
    async build() {
        console.log(' Starting build with service worker versioning...');
        
        try {
            // Step 1: Run Vite build
            await this.runViteBuild();
            
            // Step 2: Generate service worker with versioning
            await this.generateServiceWorker();
            
            // Step 3: Copy additional files
            await this.copyAdditionalFiles();
            
            // Step 4: Generate build manifest
            await this.generateBuildManifest();
            
            console.log(' Build completed successfully!');
            
        } catch (error) {
            console.error(' Build failed:', error);
            process.exit(1);
        }
    }

    /**
     * Run Vite build
     */
    async runViteBuild() {
        console.log(' Running Vite build...');
        
        try {
            execSync('npm run build', {
                cwd: this.projectRoot,
                stdio: 'inherit'
            });
            console.log(' Vite build completed');
        } catch (error) {
            throw new Error(`Vite build failed: ${error.message}`);
        }
    }

    /**
     * Generate service worker with versioning
     */
    async generateServiceWorker() {
        console.log(' Generating service worker with versioning...');
        
        try {
            const versionInfo = this.swGenerator.generate();
            console.log(' Service worker generated with version:', versionInfo.version);
            
            // Update the service worker with actual built assets
            await this.updateServiceWorkerAssets(versionInfo);
            
        } catch (error) {
            throw new Error(`Service worker generation failed: ${error.message}`);
        }
    }

    /**
     * Update service worker with actual built assets
     */
    async updateServiceWorkerAssets(versionInfo) {
        const swPath = path.join(this.distDir, 'sw.js');
        let swContent = fs.readFileSync(swPath, 'utf8');
        
        // Get built assets
        const builtAssets = this.getBuiltAssets();
        
        // Update STATIC_FILES array
        const staticFilesPattern = /const STATIC_FILES = \[([\s\S]*?)\];/;
        const staticFilesReplacement = `const STATIC_FILES = [
    '/',
    '/index.html',
    '/sw.js',
    '/manifest.json',
    ${builtAssets.map(asset => `    '${asset}'`).join(',\n')}
];`;
        
        swContent = swContent.replace(staticFilesPattern, staticFilesReplacement);
        
        // Write updated service worker
        fs.writeFileSync(swPath, swContent);
        console.log(' Service worker updated with built assets');
    }

    /**
     * Get list of built assets
     */
    getBuiltAssets() {
        const assets = [];
        
        if (!fs.existsSync(this.distDir)) {
            return assets;
        }
        
        const addAssetsRecursively = (dir, basePath = '') => {
            const items = fs.readdirSync(dir);
            
            items.forEach(item => {
                const fullPath = path.join(dir, item);
                const relativePath = path.join(basePath, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    addAssetsRecursively(fullPath, relativePath);
                } else if (stat.isFile()) {
                    const ext = path.extname(item);
                    if (['.js', '.css', '.json', '.png', '.jpg', '.jpeg', '.svg', '.ico', '.woff', '.woff2', '.ttf'].includes(ext)) {
                        assets.push(`/${relativePath.replace(/\\/g, '/')}`);
                    }
                }
            });
        };
        
        addAssetsRecursively(this.distDir);
        return assets;
    }

    /**
     * Copy additional files to dist
     */
    async copyAdditionalFiles() {
        console.log(' Copying additional files...');
        
        const filesToCopy = [
            { src: 'public/manifest.json', dest: 'dist/manifest.json' },
            { src: 'public/offline.html', dest: 'dist/offline.html' },
            { src: 'public/error.html', dest: 'dist/error.html' },
            { src: 'public/404.html', dest: 'dist/404.html' }
        ];
        
        for (const file of filesToCopy) {
            const srcPath = path.join(this.projectRoot, file.src);
            const destPath = path.join(this.projectRoot, file.dest);
            
            if (fs.existsSync(srcPath)) {
                fs.copyFileSync(srcPath, destPath);
                console.log(` Copied ${file.src} to ${file.dest}`);
            } else {
                console.warn(`  Warning: ${file.src} not found, skipping`);
            }
        }
    }

    /**
     * Generate build manifest
     */
    async generateBuildManifest() {
        console.log(' Generating build manifest...');
        
        const manifest = {
            buildTime: new Date().toISOString(),
            version: this.swGenerator.getPackageVersion(),
            assets: this.getBuiltAssets(),
            serviceWorker: {
                version: this.swGenerator.generateVersionInfo().version,
                features: ['offline', 'caching', 'background-sync', 'push-notifications']
            },
            environment: {
                node: process.version,
                platform: process.platform,
                arch: process.arch
            }
        };
        
        const manifestPath = path.join(this.distDir, 'build-manifest.json');
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
        
        console.log(' Build manifest generated');
    }

    /**
     * Clean build directory
     */
    clean() {
        console.log(' Cleaning build directory...');
        
        if (fs.existsSync(this.distDir)) {
            fs.rmSync(this.distDir, { recursive: true, force: true });
            console.log(' Build directory cleaned');
        }
    }

    /**
     * Development build (with source maps)
     */
    async buildDev() {
        console.log(' Starting development build...');
        
        try {
            // Set NODE_ENV to development
            process.env.NODE_ENV = 'development';
            
            // Run Vite build with source maps
            execSync('npm run build -- --mode development', {
                cwd: this.projectRoot,
                stdio: 'inherit'
            });
            
            // Generate service worker
            await this.generateServiceWorker();
            await this.copyAdditionalFiles();
            
            console.log(' Development build completed');
            
        } catch (error) {
            console.error(' Development build failed:', error);
            process.exit(1);
        }
    }
}

// CLI interface
if (require.main === module) {
    const buildScript = new BuildWithServiceWorker();
    const command = process.argv[2];
    
    switch (command) {
        case 'clean':
            buildScript.clean();
            break;
        case 'dev':
            buildScript.buildDev();
            break;
        case 'build':
        default:
            buildScript.build();
            break;
    }
}

module.exports = BuildWithServiceWorker;
