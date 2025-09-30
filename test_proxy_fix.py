#!/usr/bin/env python3
"""
Test script to verify the proxy-download fix works
"""
import requests
import tempfile
import os

def test_proxy_download():
    """Test the proxy-download endpoint"""
    base_url = "http://localhost:8002"
    
    # Test health endpoint first
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        print(f"Health check: {response.status_code}")
        if response.status_code != 200:
            print("Python service is not running properly")
            return False
    except requests.exceptions.RequestException as e:
        print(f"Python service is not running: {e}")
        return False
    
    # Create a test file in the temp directory
    temp_dir = tempfile.gettempdir()
    test_filename = "test_mastered_file.wav"
    test_file_path = os.path.join(temp_dir, test_filename)
    
    # Create a dummy WAV file
    with open(test_file_path, 'wb') as f:
        # Write a minimal WAV header
        f.write(b'RIFF')
        f.write(b'\x24\x00\x00\x00')  # File size
        f.write(b'WAVE')
        f.write(b'fmt ')
        f.write(b'\x10\x00\x00\x00')  # Format chunk size
        f.write(b'\x01\x00')  # Audio format (PCM)
        f.write(b'\x02\x00')  # Number of channels
        f.write(b'\x44\xac\x00\x00')  # Sample rate
        f.write(b'\x10\xb1\x02\x00')  # Byte rate
        f.write(b'\x04\x00')  # Block align
        f.write(b'\x10\x00')  # Bits per sample
        f.write(b'data')
        f.write(b'\x00\x00\x00\x00')  # Data size
    
    print(f"Created test file: {test_file_path}")
    
    # Test proxy-download endpoint
    test_url = f"{base_url}/files/{test_filename}"
    proxy_url = f"{base_url}/proxy-download?file_url={test_url}"
    
    try:
        response = requests.get(proxy_url, timeout=10)
        print(f"Proxy download test: {response.status_code}")
        if response.status_code == 200:
            print("✅ Proxy download is working!")
            print(f"Content-Type: {response.headers.get('content-type')}")
            print(f"Content-Length: {len(response.content)}")
            return True
        else:
            print(f"❌ Proxy download failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Proxy download request failed: {e}")
        return False
    finally:
        # Clean up test file
        if os.path.exists(test_file_path):
            os.remove(test_file_path)
            print(f"Cleaned up test file: {test_file_path}")

if __name__ == "__main__":
    print("Testing proxy-download fix...")
    success = test_proxy_download()
    if success:
        print("\n🎉 All tests passed! The proxy-download fix is working.")
    else:
        print("\n❌ Tests failed. The proxy-download endpoint needs more work.")
