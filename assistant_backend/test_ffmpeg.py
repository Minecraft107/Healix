#!/usr/bin/env python3
"""Quick test to verify FFmpeg is working."""

import subprocess
import sys

def test_ffmpeg():
    """Test if FFmpeg is available and working."""
    try:
        result = subprocess.run(
            ["ffmpeg", "-version"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=5
        )
        if result.returncode == 0:
            print("✓ FFmpeg is installed and working!")
            # Print first line of version info
            version_line = result.stdout.decode('utf-8').split('\n')[0]
            print(f"  {version_line}")
            return True
        else:
            print("✗ FFmpeg returned an error")
            return False
    except FileNotFoundError:
        print("✗ FFmpeg is not found in PATH")
        print("  Please restart your terminal/command prompt after installation")
        return False
    except Exception as e:
        print(f"✗ Error checking FFmpeg: {e}")
        return False

if __name__ == "__main__":
    print("Testing FFmpeg installation...")
    print("-" * 60)
    success = test_ffmpeg()
    print("-" * 60)
    sys.exit(0 if success else 1)

