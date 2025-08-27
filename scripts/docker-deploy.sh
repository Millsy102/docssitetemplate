#!/bin/bash

# Docker Deployment Script for BeamFlow Documentation Site
# This script simplifies the deployment process using Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="beamflow-docs"
CONTAINER_NAME="beamflow-docs-frontend"
PORT="3000"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to build the Docker image
build_image() {
    print_status "Building Docker image..."
    docker build -t $IMAGE_NAME .
    print_success "Docker image built successfully"
}

# Function to stop and remove existing container
cleanup_container() {
    if docker ps -a --format "table {{.Names}}" | grep -q $CONTAINER_NAME; then
        print_status "Stopping existing container..."
        docker stop $CONTAINER_NAME || true
        print_status "Removing existing container..."
        docker rm $CONTAINER_NAME || true
        print_success "Existing container cleaned up"
    fi
}

# Function to run the container
run_container() {
    print_status "Starting container..."
    docker run -d \
        --name $CONTAINER_NAME \
        -p $PORT:80 \
        --restart unless-stopped \
        $IMAGE_NAME
    
    print_success "Container started successfully"
    print_status "Application is running at http://localhost:$PORT"
}

# Function to show container status
show_status() {
    print_status "Container status:"
    docker ps --filter "name=$CONTAINER_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

# Function to show logs
show_logs() {
    print_status "Container logs:"
    docker logs $CONTAINER_NAME
}

# Function to stop the application
stop_app() {
    print_status "Stopping application..."
    docker stop $CONTAINER_NAME
    print_success "Application stopped"
}

# Function to restart the application
restart_app() {
    print_status "Restarting application..."
    docker restart $CONTAINER_NAME
    print_success "Application restarted"
}

# Function to update the application
update_app() {
    print_status "Updating application..."
    stop_app
    cleanup_container
    build_image
    run_container
    print_success "Application updated successfully"
}

# Function to show help
show_help() {
    echo "Docker Deployment Script for BeamFlow Documentation Site"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  build     - Build the Docker image"
    echo "  start     - Start the application"
    echo "  stop      - Stop the application"
    echo "  restart   - Restart the application"
    echo "  status    - Show container status"
    echo "  logs      - Show container logs"
    echo "  update    - Update the application (stop, rebuild, start)"
    echo "  deploy    - Full deployment (build and start)"
    echo "  cleanup   - Stop and remove container"
    echo "  help      - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 deploy    # Full deployment"
    echo "  $0 update    # Update existing deployment"
    echo "  $0 logs      # View logs"
}

# Main script logic
main() {
    case "${1:-deploy}" in
        "build")
            check_docker
            build_image
            ;;
        "start")
            check_docker
            cleanup_container
            run_container
            show_status
            ;;
        "stop")
            stop_app
            ;;
        "restart")
            restart_app
            show_status
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs
            ;;
        "update")
            check_docker
            update_app
            show_status
            ;;
        "deploy")
            check_docker
            build_image
            cleanup_container
            run_container
            show_status
            print_success "Deployment completed successfully!"
            print_status "Access your application at: http://localhost:$PORT"
            ;;
        "cleanup")
            cleanup_container
            print_success "Cleanup completed"
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
