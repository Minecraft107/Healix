#!/usr/bin/env python3
"""Test script to verify VOSK model installation and loading."""

import os
import sys

print("=" * 60)
print("VOSK Model Diagnostic Test")
print("=" * 60)

# Check Python version
print(f"\nPython version: {sys.version}")

# Check if vosk is installed
print("\n1. Checking VOSK library...")
try:
    import vosk
    print(f"   ✓ VOSK library found: {vosk.__file__}")
    from vosk import Model, KaldiRecognizer, SetLogLevel
    print("   ✓ VOSK imports successful")
except ImportError as e:
    print(f"   ✗ VOSK library not found: {e}")
    print("   → Install with: pip install vosk")
    sys.exit(1)

# Check model directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
VOSK_MODEL_DIR = os.path.join(BASE_DIR, "vosk-model-small-en-us-0.15")

print(f"\n2. Checking model directory...")
print(f"   Base directory: {BASE_DIR}")
print(f"   Model directory: {VOSK_MODEL_DIR}")
print(f"   Model directory exists: {os.path.exists(VOSK_MODEL_DIR)}")

if not os.path.exists(VOSK_MODEL_DIR):
    print("   ✗ Model directory not found!")
    print(f"   → Expected at: {VOSK_MODEL_DIR}")
    sys.exit(1)

# Check required files
required_files = [
    "am/final.mdl",
    "conf/model.conf",
    "graph/HCLr.fst",
    "graph/Gr.fst",
    "graph/phones/word_boundary.int",
]

print(f"\n3. Checking required model files...")
all_files_exist = True
for file_path in required_files:
    full_path = os.path.join(VOSK_MODEL_DIR, file_path)
    exists = os.path.exists(full_path)
    status = "✓" if exists else "✗"
    print(f"   {status} {file_path}")
    if not exists:
        all_files_exist = False

if not all_files_exist:
    print("\n   ✗ Some required files are missing!")
    sys.exit(1)

# Try to load the model
print(f"\n4. Loading VOSK model...")
try:
    SetLogLevel(-1)  # Suppress verbose logs
    print(f"   Loading from: {VOSK_MODEL_DIR}")
    model = Model(VOSK_MODEL_DIR)
    print("   ✓ Model loaded successfully!")
except Exception as e:
    print(f"   ✗ Failed to load model: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Test recognition setup
print(f"\n5. Testing recognition setup...")
try:
    rec = KaldiRecognizer(model, 16000)
    print("   ✓ Recognizer created successfully!")
except Exception as e:
    print(f"   ✗ Failed to create recognizer: {e}")
    sys.exit(1)

print("\n" + "=" * 60)
print("✓ All tests passed! VOSK model is ready to use.")
print("=" * 60)

