#!/usr/bin/env python3
"""
Startup script for the Audio Mastering Service
This script handles dependency checking and service startup
"""

import sys
import os
import subprocess
import importlib.util

def check_dependencies():
    """Check if all required dependencies are installed"""
    required_packages = [
        'fastapi',
        'uvicorn', 
        'numpy',
        'librosa',
        'soundfile',
        'pyloudnorm',
        'aiohttp',
        'aiofiles'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            # Only test importability without binding names to avoid linting errors
            if package == 'uvicorn':
                importlib.util.find_spec('uvicorn')
            else:
                importlib.import_module(package)
            print(f"✓ {package} is installed")
        except ImportError:
            print(f"✗ {package} is missing")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n❌ Missing packages: {', '.join(missing_packages)}")
        print("Please install them with: pip install " + " ".join(missing_packages))
        return False
    
    print("\n✅ All dependencies are installed!")
    return True

def check_ffmpeg():
    """Check if FFmpeg is available"""
    try:
        result = subprocess.run(['ffmpeg', '-version'], 
                              capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            print("✓ FFmpeg is available")
            return True
        else:
            print("✗ FFmpeg not working properly")
            return False
    except Exception as e:
        print(f"✗ FFmpeg not found: {e}")
        print("Please install FFmpeg: https://ffmpeg.org/download.html")
        return False

def start_service():
    """Start the FastAPI service"""
    try:
        import uvicorn
        print("\n🚀 Starting Audio Mastering Service...")
        print("Service will be available at: http://localhost:8002")
        print("API docs will be available at: http://localhost:8002/docs")
        print("Press Ctrl+C to stop the service\n")
        
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8002,
            reload=True,
            log_level="info",
            proxy_headers=True,
            timeout_keep_alive=30
        )
    except Exception as e:
        print(f"❌ Failed to start service: {e}")
        return False

if __name__ == "__main__":
    print("=== Audio Mastering Service Startup ===\n")
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Check FFmpeg
    if not check_ffmpeg():
        print("\n⚠️  FFmpeg is required for audio processing. Service may not work properly.")
        response = input("Continue anyway? (y/N): ")
        if response.lower() != 'y':
            sys.exit(1)
    
    # Start service
    start_service()
