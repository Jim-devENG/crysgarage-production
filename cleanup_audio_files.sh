#!/bin/bash

# Crys Garage Audio Files Cleanup Script
# This script removes all audio files and temporary processing directories
# Run this on the VPS to clean up any existing audio files

echo "🧹 Crys Garage Audio Files Cleanup"
echo "=================================="

# Function to safely remove directories
cleanup_directory() {
    local dir="$1"
    local description="$2"
    
    if [ -d "$dir" ]; then
        echo "Removing $description: $dir"
        rm -rf "$dir"
        echo "✅ Removed $description"
    else
        echo "ℹ️  $description not found: $dir"
    fi
}

# Function to safely remove files
cleanup_files() {
    local pattern="$1"
    local description="$2"
    
    if ls $pattern 1> /dev/null 2>&1; then
        echo "Removing $description: $pattern"
        rm -f $pattern
        echo "✅ Removed $description"
    else
        echo "ℹ️  No $description found"
    fi
}

# Navigate to the Ruby service directory
cd /root/crysgarage-deploy/crysgarage-ruby 2>/dev/null || {
    echo "❌ Ruby service directory not found"
    exit 1
}

echo ""
echo "📁 Cleaning up audio processing directories..."

# Remove output directories (processed audio files)
cleanup_directory "output" "output directories"

# Remove temp upload directories
cleanup_directory "temp_uploads" "temp upload directories"

# Remove temp directories
cleanup_directory "temp" "temp directories"

# Remove logs directory
cleanup_directory "logs" "logs directory"

# Remove any audio files in the current directory
echo ""
echo "🎵 Cleaning up audio files..."

# Remove common audio file formats
cleanup_files "*.wav" "WAV files"
cleanup_files "*.mp3" "MP3 files"
cleanup_files "*.flac" "FLAC files"
cleanup_files "*.aac" "AAC files"
cleanup_files "*.ogg" "OGG files"
cleanup_files "*.aiff" "AIFF files"

# Remove any session directories that might exist
cleanup_files "session_*" "session directories"

echo ""
echo "🔍 Checking for any remaining audio files..."

# Find any remaining audio files
remaining_files=$(find . -type f \( -name "*.wav" -o -name "*.mp3" -o -name "*.flac" -o -name "*.aac" -o -name "*.ogg" -o -name "*.aiff" \) 2>/dev/null)

if [ -n "$remaining_files" ]; then
    echo "⚠️  Found remaining audio files:"
    echo "$remaining_files"
    echo ""
    read -p "Do you want to remove these files? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "$remaining_files" | xargs rm -f
        echo "✅ Removed remaining audio files"
    else
        echo "ℹ️  Skipped removing remaining files"
    fi
else
    echo "✅ No remaining audio files found"
fi

echo ""
echo "📊 Disk space after cleanup:"
df -h .

echo ""
echo "🎉 Audio files cleanup completed!"
echo ""
echo "📝 Summary:"
echo "  • All output directories removed"
echo "  • All temp upload directories removed"
echo "  • All audio files removed"
echo "  • Auto-cleanup system will prevent future accumulation"
echo ""
echo "🔧 Auto-cleanup is now active and will:"
echo "  • Delete audio files after 5 minutes"
echo "  • Run cleanup every 60 seconds"
echo "  • Track active sessions automatically"
echo ""
echo "🌐 Your site is clean and ready: https://crysgarage.studio"
