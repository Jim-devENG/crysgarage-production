#!/bin/bash

echo "🐳 Checking Docker Installation Status"
echo "====================================="

echo "📋 Checking if Docker is installed..."
if command -v docker &> /dev/null; then
    echo "✅ Docker is installed"
    echo "📊 Docker version:"
    docker --version
    
    echo "🔍 Checking Docker service status..."
    if systemctl is-active --quiet docker; then
        echo "✅ Docker service is running"
    else
        echo "❌ Docker service is not running"
        echo "🔄 Attempting to start Docker service..."
        systemctl start docker
        if systemctl is-active --quiet docker; then
            echo "✅ Docker service started successfully"
        else
            echo "❌ Failed to start Docker service"
        fi
    fi
    
    echo "🔍 Checking Docker Compose..."
    if command -v docker-compose &> /dev/null; then
        echo "✅ Docker Compose is installed"
        docker-compose --version
    else
        echo "❌ Docker Compose is not installed"
    fi
    
    echo "🔍 Checking Docker Compose Plugin..."
    if command -v docker compose &> /dev/null; then
        echo "✅ Docker Compose Plugin is installed"
        docker compose version
    else
        echo "❌ Docker Compose Plugin is not installed"
    fi
    
    echo "🔍 Testing Docker functionality..."
    if docker run --rm hello-world &> /dev/null; then
        echo "✅ Docker is working correctly"
    else
        echo "❌ Docker is not working correctly"
    fi
    
else
    echo "❌ Docker is not installed"
    echo "💡 To install Docker, run: .\comprehensive_vps_setup_centos.bat"
fi

echo ""
echo "📊 System Information:"
echo "OS: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
echo "Kernel: $(uname -r)"
echo "Architecture: $(uname -m)"

echo ""
echo "🔍 Checking for Docker containers..."
if command -v docker &> /dev/null; then
    echo "📋 Running containers:"
    docker ps
    echo ""
    echo "📋 All containers (including stopped):"
    docker ps -a
fi 