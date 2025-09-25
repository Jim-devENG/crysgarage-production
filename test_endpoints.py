#!/usr/bin/env python3
"""
Test script to verify A/B player and download functionality
"""
import requests
import json
import time

def test_python_service():
    """Test Python service health and proxy endpoint"""
    print("🔍 Testing Python Service...")
    
    # Test health endpoint
    try:
        response = requests.get("http://localhost:8002/health", timeout=5)
        if response.status_code == 200:
            health_data = response.json()
            print(f"✅ Python service is running: {health_data['status']}")
            print(f"   Services: {health_data['services']}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Cannot connect to Python service: {e}")
        return False
    
    # Test proxy endpoint with a sample URL
    test_url = "https://crysgarage.studio/files/mastered_user_dev-user_20250924_201530_96505fdc.wav"
    proxy_url = f"http://localhost:8002/proxy-download?file_url={test_url}"
    
    try:
        print(f"🔍 Testing proxy download: {test_url}")
        response = requests.get(proxy_url, timeout=10)
        if response.status_code == 200:
            content_length = len(response.content)
            content_type = response.headers.get('content-type', 'unknown')
            print(f"✅ Proxy download successful!")
            print(f"   Content-Length: {content_length} bytes")
            print(f"   Content-Type: {content_type}")
            
            if content_length < 1024:
                print(f"⚠️  Warning: File size is very small ({content_length} bytes)")
            else:
                print(f"✅ File size looks good")
        else:
            print(f"❌ Proxy download failed: {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return False
    except Exception as e:
        print(f"❌ Proxy download error: {e}")
        return False
    
    return True

def test_frontend_endpoints():
    """Test frontend endpoints"""
    print("\n🔍 Testing Frontend...")
    
    try:
        response = requests.get("http://localhost:5173", timeout=5)
        if response.status_code == 200:
            print("✅ Frontend is running")
        else:
            print(f"❌ Frontend check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Cannot connect to frontend: {e}")
        return False
    
    return True

def main():
    print("🚀 Starting A/B Player and Download Test Suite")
    print("=" * 50)
    
    # Test Python service
    python_ok = test_python_service()
    
    # Test frontend
    frontend_ok = test_frontend_endpoints()
    
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print(f"   Python Service: {'✅ PASS' if python_ok else '❌ FAIL'}")
    print(f"   Frontend: {'✅ PASS' if frontend_ok else '❌ FAIL'}")
    
    if python_ok and frontend_ok:
        print("\n🎉 All tests passed! A/B player and download should work.")
        print("\n📝 Next steps:")
        print("   1. Open http://localhost:5173 in your browser")
        print("   2. Upload an audio file")
        print("   3. Select a genre and process")
        print("   4. Test A/B switching in the download tab")
        print("   5. Test downloading the mastered file")
    else:
        print("\n❌ Some tests failed. Check the issues above.")
        if not python_ok:
            print("   - Make sure Python service is running on port 8002")
        if not frontend_ok:
            print("   - Make sure frontend is running on port 5173")

if __name__ == "__main__":
    main()
