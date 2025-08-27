#!/bin/bash

# Clean Generated Assets Script for Unix/Linux/macOS
#
# This script removes all generated assets and temporary files from the project.
# It's designed to clean up build outputs, test coverage reports, logs, and other
# generated content to free up disk space and ensure clean builds.

set -e

# ANSI color codes for console output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BRIGHT='\033[1m'
RESET='\033[0m'

# Default options
DRY_RUN=false
VERBOSE=false
INCLUDE_NODE_MODULES=false
INCLUDE_NPM_CACHE=false
INCLUDE_GIT=false

# Logging utility
log() {
    local message="$1"
    local level="${2:-INFO}"
    local color="$RESET"
    
    case $level in
        ERROR) color="$RED" ;;
        WARN) color="$YELLOW" ;;
        SUCCESS) color="$GREEN" ;;
        INFO) color="$BLUE" ;;
    esac
    
    timestamp=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")
    echo -e "${color}${timestamp} [${color}${level}${color}] ${message}${RESET}"
}

# Check if directory exists and is not empty
directory_exists() {
    local dir="$1"
    [ -d "$dir" ] && [ "$(ls -A "$dir" 2>/dev/null)" ]
}

# Safely remove directory
remove_directory() {
    local path="$1"
    local description="$2"
    
    if [ ! -d "$path" ]; then
        log "Skipping $description: directory does not exist" "INFO" "$CYAN"
        return 1
    fi
    
    if [ "$DRY_RUN" = true ]; then
        log "Would clean $description: $path" "INFO" "$CYAN"
        return 0
    fi
    
    if rm -rf "$path" 2>/dev/null; then
        log "Cleaned $description: $path" "SUCCESS" "$GREEN"
        return 0
    else
        log "Failed to clean $description: $path" "ERROR" "$RED"
        return 1
    fi
}

# Clean specific file types
clean_files() {
    local pattern="$1"
    local description="$2"
    local cleaned_count=0
    
    if [ "$DRY_RUN" = true ]; then
        log "Would clean $description" "INFO" "$CYAN"
        return 0
    fi
    
    # Find and remove files matching pattern
    while IFS= read -r -d '' file; do
        if [ -f "$file" ]; then
            if rm -f "$file" 2>/dev/null; then
                ((cleaned_count++))
            else
                log "Failed to remove file $file" "WARN" "$YELLOW"
            fi
        fi
    done < <(find . -name "$pattern" -type f -print0 2>/dev/null)
    
    if [ $cleaned_count -gt 0 ]; then
        log "Cleaned $cleaned_count $description" "SUCCESS" "$GREEN"
    else
        log "No $description found to clean" "INFO" "$CYAN"
    fi
    
    return $cleaned_count
}

# Main cleanup function
clean_assets() {
    log "🚀 Starting asset cleanup..." "INFO" "$BRIGHT"
    
    if [ "$DRY_RUN" = true ]; then
        log "DRY RUN MODE: No files will be actually deleted" "WARN" "$YELLOW"
    fi
    
    start_time=$(date +%s)
    total_cleaned=0
    
    # Define directories to clean
    declare -a directories=(
        "dist:Build output directory"
        "build:Build directory"
        "coverage:Test coverage reports"
        "logs:Log files"
        "gh-pages-deploy:GitHub Pages deployment"
        "full-system-deploy:Full system deployment"
        "backup:Backup files"
        ".vercel:Vercel deployment cache"
        ".next:Next.js build cache"
        ".nuxt:Nuxt.js build cache"
        ".cache:Cache directory"
        "tmp:Temporary files"
        "temp:Temporary files"
    )
    
    # Add conditional directories
    if [ "$INCLUDE_NODE_MODULES" = true ]; then
        directories+=("node_modules:Node modules")
    fi
    
    # Clean directories
    for dir_info in "${directories[@]}"; do
        IFS=':' read -r path description <<< "$dir_info"
        if directory_exists "$path"; then
            if remove_directory "$path" "$description"; then
                ((total_cleaned++))
            fi
        elif [ "$VERBOSE" = true ]; then
            log "Skipping $description: directory does not exist" "INFO" "$CYAN"
        fi
    done
    
    # Clean specific file patterns
    declare -a file_patterns=(
        "*.log:log files"
        "*.tmp:temporary files"
        "*.temp:temporary files"
        ".DS_Store:macOS system files"
        "Thumbs.db:Windows thumbnail files"
        "*.swp:Vim swap files"
        "*.swo:Vim swap files"
        "*~:backup files"
        "*.orig:merge conflict files"
        "*.rej:rejected patch files"
    )
    
    for pattern_info in "${file_patterns[@]}"; do
        IFS=':' read -r pattern description <<< "$pattern_info"
        count=$(clean_files "$pattern" "$description")
        total_cleaned=$((total_cleaned + count))
    done
    
    # Clean Docker artifacts (if Docker is available)
    if command -v docker >/dev/null 2>&1; then
        if [ "$DRY_RUN" = true ]; then
            log "Would clean Docker system cache" "INFO" "$CYAN"
            ((total_cleaned++))
        else
            if docker system prune -f >/dev/null 2>&1; then
                log "Cleaned Docker system cache" "SUCCESS" "$GREEN"
                ((total_cleaned++))
            fi
        fi
    elif [ "$VERBOSE" = true ]; then
        log "Docker not available or no Docker artifacts to clean" "INFO" "$CYAN"
    fi
    
    # Clean npm cache (optional)
    if [ "$INCLUDE_NPM_CACHE" = true ]; then
        if [ "$DRY_RUN" = true ]; then
            log "Would clean npm cache" "INFO" "$CYAN"
            ((total_cleaned++))
        else
            if npm cache clean --force >/dev/null 2>&1; then
                log "Cleaned npm cache" "SUCCESS" "$GREEN"
                ((total_cleaned++))
            else
                log "Failed to clean npm cache" "WARN" "$YELLOW"
            fi
        fi
    fi
    
    end_time=$(date +%s)
    duration=$((end_time - start_time))
    
    log "✨ Cleanup completed in ${duration}s" "SUCCESS" "$BRIGHT$GREEN"
    
    if [ "$DRY_RUN" = true ]; then
        log "Would have cleaned $total_cleaned items" "INFO" "$CYAN"
    else
        log "Cleaned $total_cleaned items" "SUCCESS" "$GREEN"
    fi
    
    return 0
}

# Show help
show_help() {
    cat << EOF
${BRIGHT}Asset Cleanup Script${RESET}

Usage: ./scripts/clean-assets.sh [options]

Options:
  -d, --dry-run              Show what would be cleaned without actually deleting
  -v, --verbose              Show detailed output
  -n, --include-node-modules Clean node_modules directory (use with caution!)
  -c, --include-npm-cache    Clean npm cache
  -g, --include-git          Clean git artifacts (use with extreme caution!)
  -h, --help                 Show this help message

Examples:
  ./scripts/clean-assets.sh                    # Clean all generated assets
  ./scripts/clean-assets.sh --dry-run          # Preview what would be cleaned
  ./scripts/clean-assets.sh --verbose          # Show detailed output
  ./scripts/clean-assets.sh --include-npm-cache # Also clean npm cache

${YELLOW}Warning:${RESET} This script will permanently delete files. Use --dry-run first to see what will be cleaned.
EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -n|--include-node-modules)
            INCLUDE_NODE_MODULES=true
            shift
            ;;
        -c|--include-npm-cache)
            INCLUDE_NPM_CACHE=true
            shift
            ;;
        -g|--include-git)
            INCLUDE_GIT=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            log "Unknown option: $1" "ERROR" "$RED"
            show_help
            exit 1
            ;;
    esac
done

# Safety check for dangerous options
if [ "$INCLUDE_NODE_MODULES" = true ] && [ "$DRY_RUN" = false ]; then
    log "⚠️  WARNING: You are about to delete node_modules!" "WARN" "$YELLOW"
    log "This will require running npm install again." "WARN" "$YELLOW"
fi

if [ "$INCLUDE_GIT" = true ] && [ "$DRY_RUN" = false ]; then
    log "⚠️  WARNING: You are about to clean git artifacts!" "WARN" "$YELLOW"
    log "This could affect your git repository." "WARN" "$YELLOW"
fi

# Run cleanup
if clean_assets; then
    exit 0
else
    log "Cleanup failed" "ERROR" "$RED"
    exit 1
fi
