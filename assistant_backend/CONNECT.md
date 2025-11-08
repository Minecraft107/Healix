# Connecting Frontend to Backend

This guide explains how to run both the React frontend and Flask backend for the voice assistant.

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd assistant_backend
   ```

2. Create a virtual environment (if not already created):
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - **Windows (PowerShell):**
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - **Windows (Command Prompt):**
     ```cmd
     venv\Scripts\activate.bat
     ```
   - **Linux/Mac:**
     ```bash
     source venv/bin/activate
     ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Start the Flask server:
   ```bash
   python app.py
   ```
   
   **OR use the startup script:**
   - Windows: Double-click `start_server.bat` or run it from command prompt
   - Linux/Mac: Run `bash start_server.sh`

   The backend will run on `http://localhost:7860`
   
   **Important:** Make sure you see "✓ LOADED" for the model status when starting the server. If you see "✗ FAILED", check the error message.

## Frontend Setup

1. Navigate to the project root (where `package.json` is located):
   ```bash
   cd ..
   ```

2. Install dependencies (if not already installed):
   ```bash
   npm ci
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:3000` (or the port configured in `vite.config.ts`)

## How It Works

- The Vite dev server is configured with a proxy that forwards `/query`, `/tts`, and `/explain` requests to `http://localhost:7860`
- The backend has CORS enabled to allow requests from the frontend
- Audio files are sent as `multipart/form-data` to `/query`
- The backend returns `{text, tts_url}` where `tts_url` is a path to the generated audio file
- The `/explain` endpoint provides automatic page explanations with text and TTS audio

## Testing the Backend

### Health Check

First, verify the VOSK model is loaded correctly:
```bash
curl http://localhost:7860/health
```

You should see a response like:
```json
{
  "status": "ok",
  "vosk_model_loaded": true,
  "vosk_error": null,
  "model_path": "...",
  "model_path_exists": true
}
```

If `vosk_model_loaded` is `false`, check the `vosk_error` field for details.

### Test Voice Query Endpoint

You can test the `/query` endpoint directly using curl:

```bash
curl -X POST http://localhost:7860/query \
  -F "audio=@sample.webm" \
  -H "Content-Type: multipart/form-data"
```

Or test with text input:

```bash
curl -X POST http://localhost:7860/query \
  -F "text=Hello, how are you?" \
  -H "Content-Type: multipart/form-data"
```

Replace `sample.webm` with the path to a local audio file in webm format.

### Test Page Explanation Endpoint

You can test the `/explain` endpoint directly using curl:

```bash
curl "http://localhost:7860/explain?path=/login"
```

This should return JSON like:
```json
{
  "text": "This is the login page. Enter your email and password...",
  "tts_url": "/tts/1234567890_login.wav"
}
```

To test the TTS audio file:
```bash
curl "http://localhost:7860/tts/1234567890_login.wav" --output out.wav
```

Then play `out.wav` with your system's audio player to verify the TTS is working correctly.

**Note:** The TTS filename will vary based on the timestamp, so check the `tts_url` value from the `/explain` response.

## Alternative: CORS-Only Setup (No Proxy)

If you prefer not to use the proxy, you can:

1. Remove the proxy configuration from `vite.config.ts`
2. Update `VoiceAssistant.jsx` to use the full backend URL:
   ```javascript
   const resp = await fetch("http://localhost:7860/query", {
     method: "POST",
     body: fd,
   });
   ```
3. The backend already has CORS enabled, so cross-origin requests will work.

## Production Build

To serve the React build from the Flask server:

1. Build the React app:
   ```bash
   npm run build
   ```

2. Set the `BUILD_DIR` environment variable to point to the build directory:
   ```bash
   export BUILD_DIR=./build  # Linux/Mac
   set BUILD_DIR=./build     # Windows Command Prompt
   $env:BUILD_DIR="./build"  # Windows PowerShell
   ```

3. Run the Flask server - it will serve the React app at `/` and API endpoints at `/query` and `/tts`

## Troubleshooting

### VOSK Model Not Loading

If you get a "VOSK model not available" error:

1. **Check if virtual environment is activated:**
   - Make sure you see `(venv)` in your command prompt before running the server
   - On Windows: `venv\Scripts\activate.bat`
   - On Linux/Mac: `source venv/bin/activate`

2. **Verify VOSK is installed in the venv:**
   ```bash
   python -c "import vosk; print('VOSK installed:', vosk.__file__)"
   ```
   If this fails, reinstall: `pip install -r requirements.txt`

3. **Check model directory exists:**
   ```bash
   python test_vosk.py
   ```
   This will run a diagnostic test to verify the model setup.

4. **Check the server startup output:**
   When you run `python app.py`, you should see:
   ```
   Model status: ✓ LOADED
   ```
   If you see `✗ FAILED`, check the error message that follows.

5. **Verify model path:**
   The model should be at: `assistant_backend/vosk-model-small-en-us-0.15/`
   It should contain directories: `am/`, `conf/`, `graph/`, `ivector/`

### FFmpeg Not Found

If you get "transcription failed: [WinError 2] The system cannot find the file specified":

1. **FFmpeg is required** for audio conversion. Install it:
   - **Windows**: See `INSTALL_FFMPEG.md` for detailed instructions
   - Quick install (Windows 10/11): `winget install ffmpeg`
   - **Mac**: `brew install ffmpeg`
   - **Linux**: `sudo apt install ffmpeg` or `sudo yum install ffmpeg`

2. **Verify installation**:
   ```bash
   ffmpeg -version
   ```

3. **Restart the Flask server** after installing FFmpeg

4. **Check startup output**: You should see "✓ AVAILABLE" for FFmpeg status

### Other Issues

- **CORS errors**: Ensure `flask-cors` is installed and `CORS(app)` is called in `app.py`
- **Proxy errors**: Check that the backend is running on port 7860
- **Audio playback issues**: Verify that the TTS files are being generated and the `/tts/<file>` route is accessible
- **Port already in use**: Change the port in `app.py` or stop the process using port 7860

