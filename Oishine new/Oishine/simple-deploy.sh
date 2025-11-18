#!/bin/bash

# Simple Deployment Script - Auto detects docker compose version
# Usage: ./simple-deploy.sh [dev|prod|stop|logs]

set -e

echo "🚀 Oishine! Simple Deployment Script"

# Auto-detect docker compose command
if docker compose version &> /dev/null; then
    COMPOSE="docker compose"
    echo "✅ Using: docker compose"
else
    COMPOSE="docker-compose"
    echo "✅ Using: docker-compose"
fi

# Create directories
mkdir -p db uploads

case "$1" in
    "dev")
        echo "🔧 Starting development mode..."
        $COMPOSE up -d --build app
        echo "🌐 App running on: http://localhost:3000"
        echo "📊 Admin: http://localhost:3000/admin"
        ;;
    "prod")
        echo "🚀 Starting production mode..."
        $COMPOSE --profile production up -d --build
        echo "⏳ Setting up database..."
        $COMPOSE exec app npx prisma db push
        echo "🌐 App running on: http://localhost"
        echo "📊 Admin: http://localhost/admin"
        ;;
    "stop")
        echo "🛑 Stopping app..."
        $COMPOSE down
        echo "✅ App stopped"
        ;;
    "logs")
        echo "📋 Showing logs..."
        $COMPOSE logs -f
        ;;
    "status")
        echo "📊 Container status:"
        $COMPOSE ps
        ;;
    "setup-db")
        echo "⚙️ Setting up database..."
        $COMPOSE exec app npx prisma db push
        echo "✅ Database ready"
        ;;
    *)
        echo "Usage: $0 {dev|prod|stop|logs|status|setup-db}"
        echo ""
        echo "Commands:"
        echo "  dev      - Development mode (port 3000)"
        echo "  prod     - Production mode (port 80)"
        echo "  stop     - Stop all containers"
        echo "  logs     - Show logs"
        echo "  status   - Show container status"
        echo "  setup-db - Setup database"
        ;;
esac