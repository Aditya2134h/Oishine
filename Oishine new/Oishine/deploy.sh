#!/bin/bash

# Deployment Script for Oishine! App on Debian with Docker
# Usage: ./deploy.sh [dev|prod|stop|logs]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Global variable for compose command
COMPOSE_CMD=""

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        echo "Install Docker on Debian:"
        echo "curl -fsSL https://get.docker.com -o get-docker.sh"
        echo "sudo sh get-docker.sh"
        echo "sudo usermod -aG docker \$USER"
        exit 1
    fi

    # Check for docker compose (new syntax: docker compose, old: docker-compose)
    if ! docker compose version &> /dev/null && ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        echo "Install Docker Compose on Debian:"
        echo "sudo apt-get update"
        echo "sudo apt-get install docker-compose-plugin"
        exit 1
    fi

    # Set the correct compose command
    if docker compose version &> /dev/null; then
        COMPOSE_CMD="docker compose"
    else
        COMPOSE_CMD="docker-compose"
    fi

    print_status "Docker and Docker Compose are installed"
    print_status "Using command: $COMPOSE_CMD"
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    mkdir -p db uploads
    chmod 755 db uploads
}

# Build and start the application
start_app() {
    local mode=$1
    print_status "Starting Oishine! App in $mode mode..."
    
    if [ "$mode" = "prod" ]; then
        # Start with nginx reverse proxy
        $COMPOSE_CMD --profile production up -d --build
        print_status "App is running on http://localhost (port 80)"
    else
        # Start without nginx (direct port 3000)
        $COMPOSE_CMD up -d --build app
        print_status "App is running on http://localhost:3000"
    fi
}

# Stop the application
stop_app() {
    print_status "Stopping Oishine! App..."
    $COMPOSE_CMD down
    print_status "App stopped successfully"
}

# Show logs
show_logs() {
    print_status "Showing application logs..."
    $COMPOSE_CMD logs -f
}

# Database operations
setup_database() {
    print_status "Setting up database..."
    $COMPOSE_CMD exec app npx prisma db push
    print_status "Database setup completed"
}

# Main script logic
case "$1" in
    "dev")
        check_docker
        create_directories
        start_app "dev"
        print_status "Development environment is ready!"
        print_status "To view logs: ./deploy.sh logs"
        print_status "To stop: ./deploy.sh stop"
        ;;
    "prod")
        check_docker
        create_directories
        start_app "prod"
        setup_database
        print_status "Production environment is ready!"
        print_status "App is running on http://localhost"
        print_status "To view logs: ./deploy.sh logs"
        print_status "To stop: ./deploy.sh stop"
        ;;
    "stop")
        # Set compose command for stop operation
        if docker compose version &> /dev/null; then
            COMPOSE_CMD="docker compose"
        else
            COMPOSE_CMD="docker-compose"
        fi
        stop_app
        ;;
    "logs")
        # Set compose command for logs operation
        if docker compose version &> /dev/null; then
            COMPOSE_CMD="docker compose"
        else
            COMPOSE_CMD="docker-compose"
        fi
        show_logs
        ;;
    "setup-db")
        check_docker
        setup_database
        ;;
    *)
        echo "Oishine! App Deployment Script"
        echo "Usage: $0 {dev|prod|stop|logs|setup-db}"
        echo ""
        echo "Commands:"
        echo "  dev      - Start in development mode (port 3000)"
        echo "  prod     - Start in production mode with nginx (port 80)"
        echo "  stop     - Stop the application"
        echo "  logs     - Show application logs"
        echo "  setup-db - Setup database only"
        echo ""
        echo "First time setup:"
        echo "1. Make sure Docker is installed"
        echo "2. Run: chmod +x deploy.sh"
        echo "3. Run: ./deploy.sh dev (for development) or ./deploy.sh prod (for production)"
        exit 1
        ;;
esac