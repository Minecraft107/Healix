#!/bin/bash
# Start script for Flask voice assistant server on Linux/Mac

echo "Starting Flask Voice Assistant Server..."
echo

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "ERROR: Virtual environment not found!"
    echo "Please create it first with: python3 -m venv venv"
    exit 1
fi

# Activate virtual environment
source venv/bin/activate

# Check if VOSK is installed
python -c "import vosk" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "ERROR: VOSK not installed in virtual environment!"
    echo "Installing dependencies..."
    pip install -r requirements.txt
fi

# Run the server
echo "Starting server..."
python app.py

