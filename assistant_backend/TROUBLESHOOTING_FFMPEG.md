# Troubleshooting FFmpeg Issues

If you're getting "FFmpeg is not installed or not in PATH" errors even though FFmpeg is installed, follow these steps:

## Problem: Flask Server Can't Find FFmpeg

This usually happens because:
1. The Flask server was started BEFORE FFmpeg was installed
2. The Flask server is running in a different terminal session that doesn't have the updated PATH
3. Windows PATH changes require a terminal restart

## Solution

### Step 1: Stop the Flask Server
- Press `Ctrl+C` in the terminal where Flask is running
- Make sure it's completely stopped

### Step 2: Verify FFmpeg is Installed
Open a NEW terminal/PowerShell window and run:
```powershell
ffmpeg -version
```

You should see version information. If not, FFmpeg isn't installed or not in PATH.

### Step 3: Restart Terminal
- Close ALL terminal windows (the one running Flask, and any others)
- Open a NEW terminal/PowerShell window
- This ensures the new PATH is loaded

### Step 4: Navigate to Backend Directory
```powershell
cd assistant_backend
```

### Step 5: Activate Virtual Environment
```powershell
.\venv\Scripts\Activate.ps1
```

### Step 6: Start Flask Server
```powershell
python app.py
```

### Step 7: Check Startup Output
You should see:
```
============================================================
Starting Flask Voice Assistant Server
============================================================
Model status: ✓ LOADED
FFmpeg status: ✓ AVAILABLE
============================================================
```

If you see "✗ NOT FOUND" for FFmpeg, the PATH still isn't updated.

## Alternative: Check Health Endpoint

Once the server is running, check:
```powershell
curl http://localhost:7860/health
```

Or open in browser: http://localhost:7860/health

Look for:
- `"ffmpeg_available": true`
- `"ffmpeg_path": "..."` (should show the path to ffmpeg.exe)

## If FFmpeg Still Not Found

### Option 1: Reinstall FFmpeg
```powershell
winget uninstall Gyan.FFmpeg
winget install --id=Gyan.FFmpeg -e --accept-source-agreements --accept-package-agreements
```

### Option 2: Manual PATH Update
1. Find where FFmpeg was installed (usually in `C:\Users\<YourUser>\AppData\Local\Microsoft\WinGet\Packages\`)
2. Add the `bin` folder to your system PATH manually:
   - Press `Win + X` → System → Advanced system settings
   - Environment Variables → System variables → Path → Edit
   - Add the FFmpeg bin directory
   - Restart your computer (or at least restart all terminals)

### Option 3: Use Full Path
If nothing else works, you can modify `app.py` to use the full path to ffmpeg.exe, but this is not recommended as it's system-specific.

## Verify Installation

Run this test script:
```powershell
python test_ffmpeg_simple.py
```

It should show:
```
✓ FFmpeg is accessible
```

## Still Having Issues?

1. Check if FFmpeg works in a fresh terminal
2. Make sure you're using the same terminal session for everything
3. Try restarting your computer to ensure PATH is fully updated
4. Check the `/health` endpoint for detailed diagnostic information

