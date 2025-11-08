#!/usr/bin/env python3
"""Simple FFmpeg test that mimics the Flask app's check."""

import subprocess
import sys
import os

def check_ffmpeg_improved():
    """Check if ffmpeg is available with improved PATH handling."""
    # On Windows, subprocess might not inherit PATH correctly
    # Try multiple methods
    
    # Method 1: Direct check
    try:
        result = subprocess.run(
            ["ffmpeg", "-version"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=5,
            shell=False
        )
        if result.returncode == 0:
            return True, "Direct call successful"
    except FileNotFoundError:
        pass
    except Exception as e:
        print(f"  Method 1 failed: {e}")
    
    # Method 2: Try with shell=True on Windows
    if sys.platform == "win32":
        try:
            result = subprocess.run(
                "ffmpeg -version",
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                timeout=5,
                shell=True
            )
            if result.returncode == 0:
                return True, "Shell call successful"
        except Exception as e:
            print(f"  Method 2 failed: {e}")
    
    # Method 3: Try to find ffmpeg.exe in common locations
    if sys.platform == "win32":
        common_paths = [
            r"C:\ffmpeg\bin\ffmpeg.exe",
            r"C:\Program Files\ffmpeg\bin\ffmpeg.exe",
            os.path.expanduser(r"~\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_*\ffmpeg-*\bin\ffmpeg.exe"),
        ]
        for path in common_paths:
            if os.path.exists(path):
                try:
                    result = subprocess.run(
                        [path, "-version"],
                        stdout=subprocess.PIPE,
                        stderr=subprocess.PIPE,
                        timeout=5
                    )
                    if result.returncode == 0:
                        return True, f"Found at: {path}"
                except:
                    continue
    
    return False, "FFmpeg not found in PATH or common locations"

def test_with_current_path():
    """Test with current environment PATH."""
    print("Current PATH environment:")
    path_env = os.environ.get("PATH", "")
    paths = path_env.split(os.pathsep)
    ffmpeg_paths = [p for p in paths if "ffmpeg" in p.lower()]
    if ffmpeg_paths:
        print(f"  Found FFmpeg in PATH: {ffmpeg_paths}")
    else:
        print("  No FFmpeg found in current PATH")
        print(f"  Total PATH entries: {len(paths)}")
    
    print("\nTesting FFmpeg detection...")
    success, message = check_ffmpeg_improved()
    print(f"  Result: {success}")
    print(f"  Method: {message}")
    
    return success

if __name__ == "__main__":
    print("=" * 60)
    print("FFmpeg Detection Test")
    print("=" * 60)
    
    success = test_with_current_path()
    
    print("\n" + "=" * 60)
    if success:
        print("✓ FFmpeg is accessible")
    else:
        print("✗ FFmpeg is NOT accessible")
        print("\nTroubleshooting:")
        print("1. Make sure FFmpeg is installed")
        print("2. Restart your terminal/command prompt")
        print("3. Restart your Flask server")
        print("4. Check if FFmpeg is in your PATH: echo %PATH%")
    print("=" * 60)
    
    sys.exit(0 if success else 1)

