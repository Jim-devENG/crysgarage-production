#!/usr/bin/env python3
"""
Test script to verify genre presets are working
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.genre_presets import get_genre_presets
from services.ml_mastering import MLMasteringEngine

def test_genre_presets():
    print("Testing genre presets...")
    
    # Test 1: Direct genre presets import
    print("\n1. Testing direct genre presets import:")
    presets = get_genre_presets()
    print(f"   Found {len(presets)} genres:")
    for genre in presets.keys():
        print(f"   - {genre}")
    
    # Test 2: ML Mastering Engine genre information
    print("\n2. Testing ML Mastering Engine genre information:")
    try:
        ml_engine = MLMasteringEngine()
        genre_info = ml_engine.get_genre_information()
        print(f"   Found {len(genre_info)} genres:")
        for genre in genre_info.keys():
            print(f"   - {genre}")
            
        # Test specific genre lookup
        print("\n3. Testing specific genre lookup:")
        test_genres = ["Afrobeats", "Hip Hop", "Pop", "Amapiano"]
        for genre in test_genres:
            if genre in genre_info:
                preset = genre_info[genre]
                print(f"   ✓ {genre}: EQ={preset['eq_curve']['low_shelf']['gain']}dB, LUFS={preset['target_lufs']}")
            else:
                print(f"   ✗ {genre}: NOT FOUND")
                
    except Exception as e:
        print(f"   Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_genre_presets()

