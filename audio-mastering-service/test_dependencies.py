#!/usr/bin/env python3
"""
Test script to check Python dependencies and identify issues
"""

def test_imports():
    """Test all required imports"""
    print("Testing Python dependencies...")
    
    try:
        import sys
        print(f"✓ Python version: {sys.version}")
    except Exception as e:
        print(f"✗ Python import failed: {e}")
        return False
    
    try:
        import numpy as np
        print(f"✓ NumPy version: {np.__version__}")
    except Exception as e:
        print(f"✗ NumPy import failed: {e}")
        return False
    
    try:
        import librosa
        print(f"✓ Librosa version: {librosa.__version__}")
    except Exception as e:
        print(f"✗ Librosa import failed: {e}")
        return False
    
    try:
        import soundfile as sf
        print(f"✓ SoundFile version: {sf.__version__}")
    except Exception as e:
        print(f"✗ SoundFile import failed: {e}")
        return False
    
    try:
        import aiohttp
        print(f"✓ aiohttp available")
    except Exception as e:
        print(f"✗ aiohttp import failed: {e}")
        return False
    
    try:
        import aiofiles
        print(f"✓ aiofiles available")
    except Exception as e:
        print(f"✗ aiofiles import failed: {e}")
        return False
    
    try:
        import pyloudnorm
        print(f"✓ pyloudnorm available")
    except Exception as e:
        print(f"✗ pyloudnorm import failed: {e}")
        return False
    
    return True

def test_audio_processing():
    """Test basic audio processing functionality"""
    print("\nTesting audio processing...")
    
    try:
        import numpy as np
        import librosa
        
        # Create test audio
        test_audio = np.random.randn(1000)
        
        # Test librosa features
        mfcc = librosa.feature.mfcc(y=test_audio, sr=22050)
        print(f"✓ MFCC feature extraction works: {mfcc.shape}")
        
        # Test spectral features
        spectral_centroid = librosa.feature.spectral_centroid(y=test_audio, sr=22050)
        print(f"✓ Spectral centroid works: {spectral_centroid.shape}")
        
        return True
        
    except Exception as e:
        print(f"✗ Audio processing test failed: {e}")
        return False

def test_ffmpeg():
    """Test FFmpeg availability"""
    print("\nTesting FFmpeg...")
    
    try:
        import subprocess
        result = subprocess.run(['ffmpeg', '-version'], 
                              capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            print("✓ FFmpeg is available")
            return True
        else:
            print("✗ FFmpeg not working properly")
            return False
    except Exception as e:
        print(f"✗ FFmpeg test failed: {e}")
        return False

if __name__ == "__main__":
    print("=== Python Audio Mastering Service Dependency Test ===\n")
    
    imports_ok = test_imports()
    audio_ok = test_audio_processing() if imports_ok else False
    ffmpeg_ok = test_ffmpeg()
    
    print(f"\n=== Test Results ===")
    print(f"Imports: {'✓ PASS' if imports_ok else '✗ FAIL'}")
    print(f"Audio Processing: {'✓ PASS' if audio_ok else '✗ FAIL'}")
    print(f"FFmpeg: {'✓ PASS' if ffmpeg_ok else '✗ FAIL'}")
    
    if imports_ok and audio_ok and ffmpeg_ok:
        print("\n🎉 All tests passed! The service should work correctly.")
    else:
        print("\n❌ Some tests failed. Please install missing dependencies.")
        print("\nTo install dependencies, run:")
        print("pip install numpy librosa soundfile aiohttp aiofiles pyloudnorm")
        print("And ensure FFmpeg is installed on your system.")
