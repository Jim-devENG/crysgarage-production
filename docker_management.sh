#!/bin/bash

echo "🐳 Docker Management for Crys Garage"
echo "==================================="

cd /var/www/crysgarage-deploy

case "$1" in
    "start")
        echo "🚀 Starting Docker containers..."
        docker-compose up -d
        ;;
    "stop")
        echo "🛑 Stopping Docker containers..."
        docker-compose down
        ;;
    "restart")
        echo "🔄 Restarting Docker containers..."
        docker-compose restart
        ;;
    "status")
        echo "📊 Container status:"
        docker-compose ps
        ;;
    "logs")
        echo "📋 Container logs:"
        docker-compose logs --tail=50
        ;;
    "rebuild")
        echo "🔨 Rebuilding Docker containers..."
        docker-compose down
        docker-compose build --no-cache
        docker-compose up -d
        ;;
    "update")
        echo "📦 Updating application and rebuilding..."
        git pull origin master
        docker-compose down
        docker-compose build --no-cache
        docker-compose up -d
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs|rebuild|update}"
        echo ""
        echo "Commands:"
        echo "  start   - Start all containers"
        echo "  stop    - Stop all containers"
        echo "  restart - Restart all containers"
        echo "  status  - Show container status"
        echo "  logs    - Show container logs"
        echo "  rebuild - Rebuild all containers"
        echo "  update  - Pull latest code and rebuild"
        exit 1
        ;;
esac 