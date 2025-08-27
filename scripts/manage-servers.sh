#!/bin/bash

# BeamFlow Server Management Script
# Bash script for managing FTP and SSH servers

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}🔧 BeamFlow Server Management${NC}"
    echo -e "${GREEN}=============================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to run npm commands
run_npm_command() {
    local command=$1
    echo -e "${CYAN}Running: npm run $command${NC}"
    
    if npm run "$command"; then
        print_success "Command completed successfully"
        return 0
    else
        print_error "Command failed with exit code $?"
        return 1
    fi
}

# Show usage
show_usage() {
    echo "Usage: $0 {start|stop|restart|status} [ftp|ssh|all]"
    echo ""
    echo "Commands:"
    echo "  start   - Start server(s)"
    echo "  stop    - Stop server(s)"
    echo "  restart - Restart server(s)"
    echo "  status  - Show server status"
    echo ""
    echo "Services:"
    echo "  ftp     - FTP server only"
    echo "  ssh     - SSH server only"
    echo "  all     - All servers (default)"
    echo ""
    echo "Examples:"
    echo "  $0 start ftp     # Start FTP server only"
    echo "  $0 stop ssh      # Stop SSH server only"
    echo "  $0 restart       # Restart all servers"
    echo "  $0 status        # Show status of all servers"
}

# Check if action is provided
if [ $# -eq 0 ]; then
    show_usage
    exit 1
fi

ACTION=$1
SERVICE=${2:-all}

# Validate action
case $ACTION in
    start|stop|restart|status)
        ;;
    *)
        print_error "Invalid action: $ACTION"
        show_usage
        exit 1
        ;;
esac

# Validate service
case $SERVICE in
    ftp|ssh|all)
        ;;
    *)
        print_error "Invalid service: $SERVICE"
        show_usage
        exit 1
        ;;
esac

# Main logic
print_status

case $ACTION in
    start)
        case $SERVICE in
            ftp)
                print_info "🚀 Starting FTP server..."
                run_npm_command "ftp:start"
                ;;
            ssh)
                print_info "🚀 Starting SSH server..."
                run_npm_command "ssh:start"
                ;;
            all)
                print_info "🚀 Starting all servers..."
                run_npm_command "servers:start"
                ;;
        esac
        ;;
    
    stop)
        case $SERVICE in
            ftp)
                print_warning "🛑 Stopping FTP server..."
                run_npm_command "ftp:stop"
                ;;
            ssh)
                print_warning "🛑 Stopping SSH server..."
                run_npm_command "ssh:stop"
                ;;
            all)
                print_warning "🛑 Stopping all servers..."
                run_npm_command "servers:stop"
                ;;
        esac
        ;;
    
    restart)
        case $SERVICE in
            ftp)
                print_info "🔄 Restarting FTP server..."
                run_npm_command "ftp:restart"
                ;;
            ssh)
                print_info "🔄 Restarting SSH server..."
                run_npm_command "ssh:restart"
                ;;
            all)
                print_info "🔄 Restarting all servers..."
                run_npm_command "servers:restart"
                ;;
        esac
        ;;
    
    status)
        print_info "📊 Checking server status..."
        run_npm_command "servers:status"
        ;;
esac

echo ""
print_success "Server management completed!"
