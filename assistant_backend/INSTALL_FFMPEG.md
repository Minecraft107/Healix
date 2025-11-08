# Installing FFmpeg for Windows

FFmpeg is required to convert audio files (webm, mp3, etc.) to the WAV format that VOSK needs.

## Option 1: Using winget (Recommended for Windows 10/11)

1. Open PowerShell or Command Prompt as Administrator
2. Run:
   ```powershell
   winget install ffmpeg
   ```
3. Restart your terminal/command prompt
4. Verify installation:
   ```powershell
   ffmpeg -version
   ```

## Option 2: Manual Installation

1. Download FFmpeg from: https://www.gyan.dev/ffmpeg/builds/
   - Choose: `ffmpeg-release-essentials.zip` (smaller) or `ffmpeg-release-full.zip` (complete)
   
2. Extract the zip file to a location like `C:\ffmpeg`

3. Add FFmpeg to PATH:
   - Press `Win + X` and select "System"
   - Click "Advanced system settings"
   - Click "Environment Variables"
   - Under "System variables", find and select "Path", then click "Edit"
   - Click "New" and add: `C:\ffmpeg\bin` (or wherever you extracted ffmpeg)
   - Click "OK" on all dialogs
   - Restart your terminal/command prompt

4. Verify installation:
   ```powershell
   ffmpeg -version
   ```

## Option 3: Using Chocolatey

If you have Chocolatey installed:
```powershell
choco install ffmpeg
```

## Verify Installation

After installation, verify FFmpeg is available:
```powershell
ffmpeg -version
```

You should see version information. Then restart your Flask server and check the startup output - it should show "✓ AVAILABLE" for FFmpeg status.

## Troubleshooting

- **"ffmpeg is not recognized"**: Make sure you've added FFmpeg to your PATH and restarted your terminal
- **Still not working**: Try restarting your computer after adding to PATH
- **Permission errors**: Make sure you're running the terminal as Administrator when installing

