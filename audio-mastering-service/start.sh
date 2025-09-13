#!/bin/bash

# Audio Mastering Microservice Startup Script

echo "🎵 Starting Audio Mastering Microservice..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.11+ first."
    exit 1
fi

# Check if FFmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ FFmpeg is not installed. Please install FFmpeg first."
    echo "   Ubuntu/Debian: sudo apt install ffmpeg"
    echo "   macOS: brew install ffmpeg"
    echo "   Windows: Download from https://ffmpeg.org/download.html"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📚 Installing dependencies..."
pip install -r requirements.txt

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p logs
mkdir -p temp_audio

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file from template..."
    cp .env.example .env
    echo "   Please edit .env file with your configuration"
fi

# Start the service
echo "🚀 Starting Audio Mastering Microservice..."
echo "   Service will be available at: http://localhost:8000"
echo "   API docs will be available at: http://localhost:8000/docs"
echo "   Press Ctrl+C to stop the service"
echo ""

uvicorn main:app --host 0.0.0.0 --port 8000 --reload
