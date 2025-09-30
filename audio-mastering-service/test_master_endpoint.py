#!/usr/bin/env python3
"""
Test script for the /master endpoint
"""

import requests
import json

def test_master_endpoint():
    """Test the /master endpoint with a sample request"""
    
    # Test data - this should match what the frontend sends
    test_request = {
        "user_id": "test-user",
        "tier": "Free",
        "genre": "Afrobeats",
        "file_url": "http://localhost:8000/storage/uploads/test.mp3",  # This will fail, but we'll see the error
        "target_format": "MP3",
        "target_sample_rate": 44100,
        "mp3_bitrate_kbps": 32,
        "wav_bit_depth": 16
    }
    
    print("Testing /master endpoint...")
    print(f"Request: {json.dumps(test_request, indent=2)}")
    
    try:
        response = requests.post(
            "http://localhost:8002/master",
            json=test_request,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"\nResponse Status: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("✅ Success!")
            print(f"Response: {response.json()}")
        else:
            print("❌ Error!")
            print(f"Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

def test_health_endpoint():
    """Test the health endpoint"""
    print("Testing /health endpoint...")
    
    try:
        response = requests.get("http://localhost:8002/health", timeout=10)
        print(f"Health Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ Health check passed!")
            print(f"Response: {response.json()}")
        else:
            print("❌ Health check failed!")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Health check error: {e}")

def test_tiers_endpoint():
    """Test the tiers endpoint"""
    print("\nTesting /tiers endpoint...")
    
    try:
        response = requests.get("http://localhost:8002/tiers", timeout=10)
        print(f"Tiers Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ Tiers endpoint works!")
            print(f"Response: {response.json()}")
        else:
            print("❌ Tiers endpoint failed!")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Tiers endpoint error: {e}")

if __name__ == "__main__":
    print("=== Testing Python Audio Mastering Service ===\n")
    
    test_health_endpoint()
    test_tiers_endpoint()
    test_master_endpoint()
    
    print("\n=== Test Complete ===")
