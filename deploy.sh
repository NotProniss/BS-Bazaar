#!/bin/bash

# BS-Bazaar Production Deployment Script
# This script handles the complete deployment process

set -e  # Exit on any error

echo "🚀 BS-Bazaar Production Deployment"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if required tools are installed
check_requirements() {
    print_status "Checking requirements..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        print_warning "Docker is not installed - Docker deployment will not be available"
    fi
    
    print_success "Requirements check passed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install root dependencies
    npm install
    
    # Install client dependencies
    cd bazaar-client
    npm install
    cd ..
    
    # Install server dependencies
    cd bazaar-server
    npm install
    cd ..
    
    print_success "Dependencies installed"
}

# Switch to production environment
switch_environment() {
    print_status "Switching to production environment..."
    
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        # Windows
        powershell -ExecutionPolicy Bypass -File ./switch-env.ps1 -env production
    else
        # Unix-like systems
        if [ -f "./switch-env.sh" ]; then
            ./switch-env.sh production
        else
            print_warning "switch-env.sh not found, manually copying environment files"
            cp ./bazaar-client/.env.production ./bazaar-client/.env
            cp ./bazaar-server/.env.production ./bazaar-server/.env
        fi
    fi
    
    print_success "Environment switched to production"
}

# Build the application
build_app() {
    print_status "Building application..."
    
    # Build client
    cd bazaar-client
    npm run build
    cd ..
    
    print_success "Application built successfully"
}

# Deploy with Docker
deploy_docker() {
    print_status "Deploying with Docker..."
    
    # Stop existing containers
    docker-compose down || true
    
    # Build and start new containers
    docker-compose up --build -d
    
    print_success "Docker deployment completed"
}

# Deploy manually
deploy_manual() {
    print_status "Manual deployment preparation..."
    
    print_status "Client build files are ready in: ./bazaar-client/build/"
    print_status "Server files are ready in: ./bazaar-server/"
    
    print_warning "Manual deployment steps:"
    echo "1. Copy ./bazaar-client/build/ contents to your web server"
    echo "2. Deploy ./bazaar-server/ to your Node.js hosting environment"
    echo "3. Ensure environment variables are properly set"
    echo "4. Start the server with: npm start"
    
    print_success "Manual deployment preparation completed"
}

# Health check
health_check() {
    print_status "Performing health check..."
    
    sleep 10  # Wait for services to start
    
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        print_success "Server health check passed"
    else
        print_error "Server health check failed"
        return 1
    fi
    
    if curl -f http://localhost/ > /dev/null 2>&1; then
        print_success "Client health check passed"
    else
        print_error "Client health check failed"
        return 1
    fi
}

# Main deployment function
deploy() {
    local deployment_type=${1:-"docker"}
    
    print_status "Starting deployment (type: $deployment_type)"
    
    check_requirements
    install_dependencies
    switch_environment
    build_app
    
    if [ "$deployment_type" = "docker" ]; then
        if command -v docker &> /dev/null; then
            deploy_docker
            health_check
        else
            print_error "Docker not available, falling back to manual deployment"
            deploy_manual
        fi
    else
        deploy_manual
    fi
    
    print_success "🎉 Deployment completed successfully!"
    echo ""
    echo "Your application should now be available at:"
    echo "- Frontend: http://localhost"
    echo "- Backend API: http://localhost:3001"
    echo "- Health Check: http://localhost:3001/health"
}

# Parse command line arguments
case "${1:-}" in
    "docker")
        deploy "docker"
        ;;
    "manual")
        deploy "manual"
        ;;
    "health")
        health_check
        ;;
    *)
        echo "Usage: $0 [docker|manual|health]"
        echo ""
        echo "Commands:"
        echo "  docker  - Deploy using Docker (default)"
        echo "  manual  - Prepare for manual deployment"
        echo "  health  - Run health checks only"
        echo ""
        deploy "docker"
        ;;
esac
