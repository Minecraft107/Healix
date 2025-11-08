#!/usr/bin/env python3
"""Test audio conversion with FFmpeg."""

import sys
import os
import tempfile
import subprocess

# Add the parent directory to path to import from app.py
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import check_ffmpeg, convert_to_wav_16k_mono

def test_check_ffmpeg():
    """Test the check_ffmpeg function."""
    print("Testing check_ffmpeg()...")
    result = check_ffmpeg()
    print(f"  Result: {result}")
    return result

def test_conversion():
    """Test audio conversion (will fail without a real audio file)."""
    print("\nTesting conversion function...")
    
    # Create a dummy audio file for testing
    # This will fail, but we can see the error
    test_file = tempfile.NamedTemporaryFile(delete=False, suffix=".webm")
    test_file.write(b"fake audio data")
    test_file.close()
    
    try:
        wav_path = convert_to_wav_16k_mono(test_file.name)
        print(f"  Conversion successful: {wav_path}")
        if os.path.exists(wav_path):
            os.unlink(wav_path)
        return True
    except Exception as e:
        print(f"  Conversion failed (expected with dummy file): {type(e).__name__}: {e}")
        return False
    finally:
        if os.path.exists(test_file.name):
            os.unlink(test_file.name)

if __name__ == "__main__":
    print("=" * 60)
    print("Testing FFmpeg Integration")
    print("=" * 60)
    
    # Test 1: Check FFmpeg availability
    ffmpeg_available = test_check_ffmpeg()
    
    if not ffmpeg_available:
        print("\n❌ FFmpeg is not available!")
        print("   This might be a PATH issue in the Flask process.")
        print("   Try restarting the Flask server in a new terminal.")
        sys.exit(1)
    
    print("\n✓ FFmpeg is available in Python subprocess calls")
    
    # Test 2: Try conversion (will fail with dummy file, but shows if function works)
    test_conversion()
    
    print("\n" + "=" * 60)
    print("✓ All tests completed")
    print("=" * 60)

