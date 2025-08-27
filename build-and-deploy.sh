#!/bin/bash

# BeamFlow Documentation Site Build and Deploy Script
# This script builds the static documentation site for GitHub Pages

set -e  # Exit on any error

# Default values
ENVIRONMENT="production"
SKIP_TESTS=false
SKIP_LINT=false
FORCE=false
DEPLOY_TARGET="github-pages"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to log messages
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "ERROR")
            echo -e "[$timestamp] [ERROR] $message" >&2
            ;;
        "WARN")
            echo -e "[$timestamp] [WARN] $message"
            ;;
        "SUCCESS")
            echo -e "[$timestamp] [SUCCESS] $message"
            ;;
        *)
            echo -e "[$timestamp] [INFO] $message"
            ;;
    esac
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --environment|-e)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --skip-lint)
            SKIP_LINT=true
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        --deploy-target|-t)
            DEPLOY_TARGET="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  -e, --environment ENV    Set environment (default: production)"
            echo "  --skip-tests            Skip running tests"
            echo "  --skip-lint             Skip running linting"
            echo "  --force                 Continue despite errors"
            echo "  -t, --deploy-target TARGET  Deploy target (default: github-pages)"
            echo "  -h, --help              Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

echo -e "${GREEN}🚀 BeamFlow Documentation Site Build Script${NC}"
echo -e "${YELLOW}Environment: $ENVIRONMENT${NC}"
echo -e "${YELLOW}Deploy Target: $DEPLOY_TARGET${NC}"
echo ""

# Check prerequisites
log "INFO" "Checking prerequisites..."

PREREQUISITES=("node" "npm")
MISSING=()

for prereq in "${PREREQUISITES[@]}"; do
    if ! command_exists "$prereq"; then
        MISSING+=("$prereq")
    fi
done

if [ ${#MISSING[@]} -gt 0 ]; then
    log "ERROR" "Missing prerequisites: ${MISSING[*]}"
    log "ERROR" "Please install the missing tools and try again."
    exit 1
fi

log "SUCCESS" "All prerequisites found"

# Clean previous builds
log "INFO" "Cleaning previous builds..."
if [ -d "dist" ]; then
    rm -rf dist
    log "SUCCESS" "Removed previous dist directory"
fi

# Install dependencies
log "INFO" "Installing dependencies..."
if npm install; then
    log "SUCCESS" "Dependencies installed successfully"
else
    log "ERROR" "Failed to install dependencies"
    exit 1
fi

# Run linting (unless skipped)
if [ "$SKIP_LINT" = false ]; then
    log "INFO" "Running linting..."
    if npm run lint; then
        log "SUCCESS" "Linting passed"
    else
        log "ERROR" "Linting failed"
        if [ "$FORCE" = false ]; then
            log "WARN" "Use --force to continue despite linting errors"
            exit 1
        fi
        log "WARN" "Continuing despite linting errors (Force mode)"
    fi
fi

# Run tests (unless skipped)
if [ "$SKIP_TESTS" = false ]; then
    log "INFO" "Running tests..."
    if npm test; then
        log "SUCCESS" "Tests passed"
    else
        log "ERROR" "Tests failed"
        if [ "$FORCE" = false ]; then
            log "WARN" "Use --force to continue despite test failures"
            exit 1
        fi
        log "WARN" "Continuing despite test failures (Force mode)"
    fi
fi

# Build the static site
log "INFO" "Building static documentation site..."
if npm run build; then
    log "SUCCESS" "Static site build completed"
else
    log "ERROR" "Static site build failed"
    exit 1
fi

# Verify build output
if [ ! -d "dist" ]; then
    log "ERROR" "Build output directory 'dist' not found"
    exit 1
fi

if [ ! -f "dist/index.html" ]; then
    log "ERROR" "Build output missing index.html"
    exit 1
fi

log "SUCCESS" "Build verification passed"

# Create deployment package for GitHub Pages
log "INFO" "Preparing GitHub Pages deployment..."
DEPLOY_DIR="gh-pages-deploy"
if [ -d "$DEPLOY_DIR" ]; then
    rm -rf "$DEPLOY_DIR"
fi
mkdir -p "$DEPLOY_DIR"

# Copy built files
cp -r dist/* "$DEPLOY_DIR/"
log "INFO" "Copied built files to deployment directory"

# Copy additional files for GitHub Pages
if [ -f "public/favicon.svg" ]; then
    cp public/favicon.svg "$DEPLOY_DIR/"
    log "INFO" "Copied favicon"
fi

if [ -f "public/manifest.json" ]; then
    cp public/manifest.json "$DEPLOY_DIR/"
    log "INFO" "Copied manifest"
fi

# Create .nojekyll file for GitHub Pages
touch "$DEPLOY_DIR/.nojekyll"
log "INFO" "Created .nojekyll file"

# Create deployment README
cat > "$DEPLOY_DIR/README.md" << 'EOF'
# BeamFlow Documentation Site

This is the built documentation site for BeamFlow.

## Deployment

This directory contains the static files ready for GitHub Pages deployment.

### Manual Deployment

1. Push the contents of this directory to the `gh-pages` branch
2. Configure GitHub Pages in your repository settings
3. Set the source to the `gh-pages` branch

### Automated Deployment

Use GitHub Actions to automatically deploy on push to main branch.

## Files

- `index.html` - Main documentation page
- `assets/` - CSS, JS, and other assets
- `.nojekyll` - Prevents GitHub Pages from processing with Jekyll

## Support

For issues or questions, please refer to the main repository.
EOF

log "INFO" "Created deployment README"

# Create deployment archive
log "INFO" "Creating deployment archive..."
ARCHIVE_NAME="beamflow-docs-$(date +%Y%m%d-%H%M%S).tar.gz"
if tar -czf "$ARCHIVE_NAME" -C "$DEPLOY_DIR" .; then
    log "SUCCESS" "Created deployment archive: $ARCHIVE_NAME"
else
    log "ERROR" "Failed to create archive"
fi

# Deploy based on target
log "INFO" "Deploying to $DEPLOY_TARGET..."
case $DEPLOY_TARGET in
    "github-pages")
        log "INFO" "GitHub Pages deployment package ready"
        log "INFO" "To deploy:"
        log "INFO" "1. Push contents of $DEPLOY_DIR to gh-pages branch"
        log "INFO" "2. Configure GitHub Pages in repository settings"
        log "INFO" "3. Set source to gh-pages branch"
        ;;
    "local")
        LOCAL_DEPLOY_PATH="./local-deploy"
        if [ ! -d "$LOCAL_DEPLOY_PATH" ]; then
            mkdir -p "$LOCAL_DEPLOY_PATH"
            log "INFO" "Created local deployment directory: $LOCAL_DEPLOY_PATH"
        fi
        cp -r "$DEPLOY_DIR"/* "$LOCAL_DEPLOY_PATH/"
        log "SUCCESS" "Deployed to local directory: $LOCAL_DEPLOY_PATH"
        log "INFO" "To preview: npm run preview"
        ;;
    "vercel")
        log "WARN" "Vercel deployment requires manual setup"
        log "INFO" "Please run: vercel --prod"
        ;;
    *)
        log "WARN" "Unknown deploy target: $DEPLOY_TARGET"
        log "INFO" "Deployment package ready in: $DEPLOY_DIR"
        ;;
esac

log "SUCCESS" "Build and deploy completed successfully!"
log "INFO" "Deployment package: $DEPLOY_DIR"
if [ -f "$ARCHIVE_NAME" ]; then
    log "INFO" "Archive created: $ARCHIVE_NAME"
fi

echo ""
echo -e "${GREEN}🎉 Build and deployment completed!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Review the deployment package in: $DEPLOY_DIR"
echo -e "2. For GitHub Pages: Push contents to gh-pages branch"
echo -e "3. Configure GitHub Pages in repository settings"
