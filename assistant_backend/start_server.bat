@echo off
REM Start script for Flask voice assistant server on Windows
echo Starting Flask Voice Assistant Server...
echo.

REM Check if venv exists
if not exist "venv\Scripts\activate.bat" (
    echo ERROR: Virtual environment not found!
    echo Please create it first with: python -m venv venv
    pause
    exit /b 1
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Check if dependencies are installed
python -c "import vosk; import flask_cors" 2>nul
if errorlevel 1 (
    echo WARNING: Some dependencies may be missing!
    echo Installing/updating dependencies...
    pip install -r requirements.txt
)

REM Check if FFmpeg is installed
ffmpeg -version >nul 2>&1
if errorlevel 1 (
    echo.
    echo WARNING: FFmpeg is not installed or not in PATH!
    echo FFmpeg is required for audio conversion.
    echo.
    echo To install FFmpeg:
    echo   1. Quick install: winget install ffmpeg
    echo   2. Or see INSTALL_FFMPEG.md for detailed instructions
    echo.
    echo Press any key to continue anyway (audio conversion will fail)...
    pause >nul
) else (
    echo FFmpeg is available.
)

REM Run the server
echo.
echo Starting server...
python app.py

pause

