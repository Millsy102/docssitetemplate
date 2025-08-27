#!/bin/bash

# BeamFlow Build and Deploy Script (Bash Version)
# This script builds and deploys the BeamFlow application

set -e  # Exit on any error

# Default values
ENVIRONMENT="production"
SKIP_TESTS=false
SKIP_LINT=false
FORCE=false
DEPLOY_TARGET="local"

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
            echo "  -t, --deploy-target TARGET  Deploy target (default: local)"
            echo "  -h, --help              Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

echo -e "${GREEN}🚀 BeamFlow Build and Deploy Script${NC}"
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

# Navigate to the system directory
cd "_internal/system"
log "INFO" "Changed to system directory"

# Clean previous builds
log "INFO" "Cleaning previous builds..."
if [ -d "dist" ]; then
    rm -rf dist
    log "SUCCESS" "Removed previous dist directory"
fi

if [ -d "node_modules" ]; then
    log "WARN" "Removing node_modules for clean install..."
    rm -rf node_modules
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

# Build frontend
log "INFO" "Building frontend..."
if npm run frontend:build; then
    log "SUCCESS" "Frontend build completed"
else
    log "ERROR" "Frontend build failed"
    exit 1
fi

# Build backend (if needed)
log "INFO" "Building backend..."
if npm run build; then
    log "SUCCESS" "Backend build completed"
else
    log "ERROR" "Backend build failed"
    exit 1
fi

# Create deployment package
log "INFO" "Creating deployment package..."
DEPLOY_DIR="deploy"
if [ -d "$DEPLOY_DIR" ]; then
    rm -rf "$DEPLOY_DIR"
fi
mkdir -p "$DEPLOY_DIR"

# Copy necessary files
FILES_TO_COPY=("dist" "src" "package.json" "package-lock.json" "vite.config.ts" "tsconfig.json" "tailwind.config.js" "env.example")

for file in "${FILES_TO_COPY[@]}"; do
    if [ -e "$file" ]; then
        if [ -d "$file" ]; then
            cp -r "$file" "$DEPLOY_DIR/"
        else
            cp "$file" "$DEPLOY_DIR/"
        fi
        log "INFO" "Copied $file"
    fi
done

# Create deployment scripts
cat > "$DEPLOY_DIR/start.sh" << 'EOF'
#!/bin/bash
# BeamFlow Production Start Script
echo "Starting BeamFlow Server..."

# Set environment
export NODE_ENV="production"

# Install production dependencies
npm ci --only=production

# Start the server
node src/server.js
EOF

chmod +x "$DEPLOY_DIR/start.sh"
log "INFO" "Created start.sh"

cat > "$DEPLOY_DIR/deploy.sh" << 'EOF'
#!/bin/bash
# BeamFlow Deployment Script
TARGET=${1:-"local"}

echo "Deploying BeamFlow to $TARGET..."

# Copy files to target location
case $TARGET in
    "local")
        TARGET_PATH="/opt/BeamFlow"
        sudo mkdir -p "$TARGET_PATH"
        sudo cp -r * "$TARGET_PATH/"
        echo "Deployed to $TARGET_PATH"
        ;;
    "server")
        echo "Server deployment not configured. Please update this script."
        ;;
    *)
        echo "Unknown target: $TARGET"
        ;;
esac
EOF

chmod +x "$DEPLOY_DIR/deploy.sh"
log "INFO" "Created deploy.sh"

# Create README for deployment
cat > "$DEPLOY_DIR/README.md" << 'EOF'
# BeamFlow Deployment Package

This package contains the built BeamFlow application ready for deployment.

## Quick Start

### Linux/Mac
```bash
chmod +x start.sh
./start.sh
```

### Windows
```powershell
npm ci --only=production
node src/server.js
```

## Configuration

1. Copy `.env.example` to `.env`
2. Update the environment variables as needed
3. Start the application

## Files Included

- `dist/` - Built frontend assets
- `src/` - Backend source code
- `package.json` - Dependencies
- `start.sh` - Linux/Mac start script
- `deploy.sh` - Deployment script

## Environment Variables

Required environment variables (see .env.example):
- NODE_ENV
- PORT
- DATABASE_URL
- REDIS_URL
- JWT_SECRET
- GITHUB_CLIENT_ID
- GITHUB_CLIENT_SECRET

## Support

For issues or questions, please refer to the main documentation.
EOF

log "INFO" "Created deployment README"

# Create deployment archive
log "INFO" "Creating deployment archive..."
ARCHIVE_NAME="beamflow-deploy-$(date +%Y%m%d-%H%M%S).tar.gz"
if tar -czf "$ARCHIVE_NAME" -C "$DEPLOY_DIR" .; then
    log "SUCCESS" "Created deployment archive: $ARCHIVE_NAME"
else
    log "ERROR" "Failed to create archive"
fi

# Deploy based on target
log "INFO" "Deploying to $DEPLOY_TARGET..."
case $DEPLOY_TARGET in
    "local")
        LOCAL_DEPLOY_PATH="/opt/BeamFlow"
        if [ ! -d "$LOCAL_DEPLOY_PATH" ]; then
            sudo mkdir -p "$LOCAL_DEPLOY_PATH"
            log "INFO" "Created local deployment directory: $LOCAL_DEPLOY_PATH"
        fi
        sudo cp -r "$DEPLOY_DIR"/* "$LOCAL_DEPLOY_PATH/"
        log "SUCCESS" "Deployed to local directory: $LOCAL_DEPLOY_PATH"
        ;;
    "vercel")
        log "WARN" "Vercel deployment requires manual setup"
        log "INFO" "Please run: vercel --prod"
        ;;
    "github-pages")
        log "WARN" "GitHub Pages deployment requires manual setup"
        log "INFO" "Please push to gh-pages branch or configure GitHub Pages"
        ;;
    *)
        log "WARN" "Unknown deploy target: $DEPLOY_TARGET"
        log "INFO" "Deployment package ready in: $DEPLOY_DIR"
        ;;
esac

# Return to original directory
cd ../..

log "SUCCESS" "Build and deploy completed successfully!"
log "INFO" "Deployment package: $DEPLOY_DIR"
if [ -f "$ARCHIVE_NAME" ]; then
    log "INFO" "Archive created: $ARCHIVE_NAME"
fi

echo ""
echo -e "${GREEN}🎉 Build and deployment completed!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Review the deployment package in: $DEPLOY_DIR"
echo -e "2. Configure environment variables"
echo -e "3. Start the application"
