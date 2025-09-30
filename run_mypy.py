#!/usr/bin/env python3
"""Simple script to run mypy on the audio mastering service files."""
import subprocess
import sys
import os

def main():
    # Change to the audio-mastering-service directory
    os.chdir("audio-mastering-service")
    
    # Run mypy on the current directory
    cmd = [
        sys.executable, "-m", "mypy", 
        "--ignore-missing-imports",
        "--follow-imports=skip",
        "."
    ]
    
    result = subprocess.run(cmd)
    return result.returncode

if __name__ == "__main__":
    sys.exit(main())
