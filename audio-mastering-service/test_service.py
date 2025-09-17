#!/usr/bin/env python3
"""
Test script for the Audio Mastering Microservice
"""

import asyncio
import aiohttp
import sys

BASE_URL = "http://localhost:8000"

async def test_health_check():
    """Test health check endpoint"""
    print("🔍 Testing health check...")
    
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(f"{BASE_URL}/health") as response:
                if response.status == 200:
                    data = await response.json()
                    print(f"✅ Health check passed: {data['status']}")
                    return True
                else:
                    print(f"❌ Health check failed: {response.status}")
                    return False
        except Exception as e:
            print(f"❌ Health check error: {e}")
            return False

async def test_formats():
    """Test formats endpoint"""
    print("🔍 Testing formats endpoint...")
    
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(f"{BASE_URL}/formats") as response:
                if response.status == 200:
                    data = await response.json()
                    print("✅ Formats endpoint working")
                    print(f"   Supported formats: {', '.join(data['output_formats'])}")
                    print(f"   Sample rates: {data['sample_rates']}")
                    return True
                else:
                    print(f"❌ Formats endpoint failed: {response.status}")
                    return False
        except Exception as e:
            print(f"❌ Formats endpoint error: {e}")
            return False

async def test_mastering():
    """Test mastering endpoint with sample data"""
    print("🔍 Testing mastering endpoint...")
    
    # Sample request data
    request_data = {
        "user_id": 123,
        "tier": "Pro",
        "genre": "Afrobeats",
        "target_format": "WAV",
        "target_sample_rate": 44100,
        "file_url": "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",  # Sample audio file
        "target_lufs": -14.0
    }
    
    async with aiohttp.ClientSession() as session:
        try:
            async with session.post(
                f"{BASE_URL}/master",
                json=request_data,
                timeout=aiohttp.ClientTimeout(total=300)  # 5 minute timeout
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    print("✅ Mastering test passed")
                    print(f"   Status: {data['status']}")
                    print(f"   URL: {data.get('url', 'N/A')}")
                    print(f"   Format: {data.get('format', 'N/A')}")
                    print(f"   Duration: {data.get('duration', 'N/A')}s")
                    return True
                else:
                    error_text = await response.text()
                    print(f"❌ Mastering test failed: {response.status}")
                    print(f"   Error: {error_text}")
                    return False
        except asyncio.TimeoutError:
            print("❌ Mastering test timed out")
            return False
        except Exception as e:
            print(f"❌ Mastering test error: {e}")
            return False

async def test_tiers():
    """Test tiers endpoint"""
    print("🔍 Testing tiers endpoint...")
    
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(f"{BASE_URL}/tiers") as response:
                if response.status == 200:
                    data = await response.json()
                    print("✅ Tiers endpoint working")
                    for tier, info in data.items():
                        print(f"   {tier}: {info['formats']} formats, {info['sample_rates']} sample rates")
                    return True
                else:
                    print(f"❌ Tiers endpoint failed: {response.status}")
                    return False
        except Exception as e:
            print(f"❌ Tiers endpoint error: {e}")
            return False

async def main():
    """Run all tests"""
    print("🚀 Starting Audio Mastering Microservice Tests")
    print("=" * 50)
    
    tests = [
        ("Health Check", test_health_check),
        ("Formats", test_formats),
        ("Tiers", test_tiers),
        ("Mastering", test_mastering),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n📋 {test_name}")
        print("-" * 30)
        try:
            result = await test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} crashed: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Results Summary")
    print("=" * 50)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
        if result:
            passed += 1
    
    print(f"\n🎯 Overall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Service is working correctly.")
        return 0
    else:
        print("⚠️  Some tests failed. Check the service configuration.")
        return 1

if __name__ == "__main__":
    try:
        exit_code = asyncio.run(main())
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n⏹️  Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Test runner crashed: {e}")
        sys.exit(1)


