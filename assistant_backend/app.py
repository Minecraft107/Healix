# assistant-backend/app.py
import os
import sys
import tempfile
import time
import subprocess
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename

# ---------- CONFIG ----------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TTS_DIR = os.path.join(BASE_DIR, "tts_cache")
VOSK_MODEL_DIR = os.path.join(BASE_DIR, "vosk-model-small-en-us-0.15")  # place VOSK model here
os.makedirs(TTS_DIR, exist_ok=True)
# ----------------------------

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes (dev only)

# ---------- VOSK STT setup ----------
vosk_model = None
vosk_error = None
try:
    from vosk import Model, KaldiRecognizer, SetLogLevel
    SetLogLevel(-1)
    print(f"Checking VOSK model at: {VOSK_MODEL_DIR}")
    print(f"Model directory exists: {os.path.exists(VOSK_MODEL_DIR)}")
    if not os.path.exists(VOSK_MODEL_DIR):
        vosk_error = f"VOSK model directory not found at: {VOSK_MODEL_DIR}"
        print(f"ERROR: {vosk_error}")
    else:
        print(f"Loading VOSK model from: {VOSK_MODEL_DIR}")
        vosk_model = Model(VOSK_MODEL_DIR)
        print(f"✓ SUCCESS: VOSK model loaded from: {VOSK_MODEL_DIR}")
except ImportError as e:
    vosk_error = f"VOSK library not installed: {e}. Install with: pip install vosk"
    print(f"ERROR: {vosk_error}")
except Exception as e:
    vosk_error = f"VOSK model load error: {type(e).__name__}: {str(e)}"
    print(f"ERROR: {vosk_error}")
    import traceback
    traceback.print_exc()

def transcribe_with_vosk(wav_path):
    """Return transcribed text from a 16k/mono WAV file using VOSK."""
    import wave, json
    wf = wave.open(wav_path, "rb")
    if wf.getnchannels() != 1 or wf.getsampwidth() != 2:
        raise ValueError("wav must be PCM 16-bit mono")
    rec = KaldiRecognizer(vosk_model, wf.getframerate())
    texts = []
    while True:
        data = wf.readframes(4000)
        if len(data) == 0:
            break
        if rec.AcceptWaveform(data):
            res = json.loads(rec.Result())
            if res.get("text"):
                texts.append(res.get("text"))
    final = json.loads(rec.FinalResult())
    if final.get("text"):
        texts.append(final.get("text"))
    return " ".join(texts).strip()

# ---------- TTS using pyttsx3 ----------
_tts_available = None
_tts_error = None

def _check_tts():
    """Check if pyttsx3 is available."""
    global _tts_available, _tts_error
    if _tts_available is not None:
        return _tts_available
    
    try:
        import pyttsx3
        # Try to initialize to verify it works
        engine = pyttsx3.init()
        engine.stop()
        _tts_available = True
        _tts_error = None
        return True
    except ImportError as e:
        _tts_available = False
        _tts_error = f"pyttsx3 not installed: {e}. Install with: pip install pyttsx3"
        return False
    except Exception as e:
        _tts_available = False
        _tts_error = f"pyttsx3 initialization failed: {e}"
        return False

def synthesize_tts_to_file(text, filename):
    """
    Save TTS to a WAV file in TTS_DIR. Uses pyttsx3 (offline).
    """
    if not _check_tts():
        raise RuntimeError(_tts_error or "TTS (pyttsx3) is not available")
    
    import pyttsx3
    out_path = os.path.join(TTS_DIR, filename)
    try:
        engine = pyttsx3.init()
        # optional: tune rate/volume/voice here
        engine.setProperty("rate", 160)
        engine.save_to_file(text, out_path)
        engine.runAndWait()
        # ensure file exists
        if not os.path.exists(out_path):
            raise RuntimeError("TTS generation failed: output file was not created")
        return out_path
    except Exception as e:
        raise RuntimeError(f"TTS generation failed: {e}")

# ---------- Simple offline responder ----------
def generate_reply_offline(user_text):
    """
    Minimal rule-based responder for Healix-specific queries.
    Extend this function or replace with an intent model later.
    """
    t = user_text.lower()
    # greetings
    if any(w in t for w in ("hello", "hi", "hey")):
        return "Hi! I am the Healix assistant. How can I help you today?"
    # add family
    if "add" in t and "family" in t or "add member" in t:
        return ("To add a family member: open the Family section in the app (check the left sidebar), "
                "click Add Member, and fill the form. If you are a developer, look at src/components/Family or search the repo for 'Family'.")
    # health records
    if "health record" in t or "my records" in t or "records" in t:
        return ("Your health records are available under 'My Records' in the dashboard. "
                "Check src/components/Records or README.md for details about storage and endpoints.")
    # privacy
    if "privacy" in t or "privacy policy" in t:
        return ("You can view the privacy policy in Settings > Privacy Policy, or see README.md for a developer summary.")
    # registration
    if "register" in t or "sign up" in t or "create account" in t:
        return ("To register: click Sign Up on the login screen, fill the required fields, and verify your account if prompted.")
    # default fallback
    return ("Sorry, I don't have a specific answer for that offline. "
            "Try checking README.md or ask a more specific question like 'How do I add a family member?'.")

# Cache for FFmpeg executable path
_ffmpeg_path = None

# ---------- Helper: check if ffmpeg is available and get its path ----------
def _find_ffmpeg():
    """Find FFmpeg executable and return its path. Returns None if not found."""
    global _ffmpeg_path
    if _ffmpeg_path:
        return _ffmpeg_path
    
    # On Windows, refresh PATH from registry to get latest system/user PATH
    if os.name == 'nt':
        try:
            import winreg
            # Get user PATH
            with winreg.OpenKey(winreg.HKEY_CURRENT_USER, "Environment") as key:
                user_path = winreg.QueryValueEx(key, "PATH")[0]
            # Get system PATH
            with winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, r"SYSTEM\CurrentControlSet\Control\Session Manager\Environment") as key:
                system_path = winreg.QueryValueEx(key, "PATH")[0]
            # Combine and update current process PATH
            combined_path = system_path + os.pathsep + user_path
            os.environ["PATH"] = combined_path + os.pathsep + os.environ.get("PATH", "")
        except Exception:
            pass  # If we can't refresh, continue with existing PATH
    
    # Method 1: Try shutil.which (checks PATH)
    import shutil
    ffmpeg_path = shutil.which("ffmpeg")
    if ffmpeg_path and os.path.exists(ffmpeg_path):
        _ffmpeg_path = ffmpeg_path
        return _ffmpeg_path
    
    # Method 2: Check WinGet Links folder directly (common FFmpeg install location on Windows)
    if os.name == 'nt':
        try:
            winget_links = os.path.join(os.environ.get("LOCALAPPDATA", ""), 
                                       "Microsoft", "WinGet", "Links", "ffmpeg.exe")
            if os.path.exists(winget_links):
                # Verify it works
                result = subprocess.run(
                    [winget_links, "-version"],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    timeout=5,
                    shell=False
                )
                if result.returncode == 0:
                    _ffmpeg_path = winget_links
                    # Add to PATH for this process
                    winget_links_dir = os.path.dirname(winget_links)
                    os.environ["PATH"] = winget_links_dir + os.pathsep + os.environ.get("PATH", "")
                    return _ffmpeg_path
        except Exception:
            pass
    
    # Method 3: Try with shell=True on Windows (handles aliases/shortcuts)
    if os.name == 'nt':
        try:
            result = subprocess.run(
                "ffmpeg -version",
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                timeout=5,
                shell=True
            )
            if result.returncode == 0:
                # If it works with shell, try to find the actual path
                ffmpeg_path = shutil.which("ffmpeg") or "ffmpeg"
                _ffmpeg_path = ffmpeg_path
                return _ffmpeg_path
        except Exception:
            pass
    
    return None

def check_ffmpeg():
    """Check if ffmpeg is available in the system PATH."""
    return _find_ffmpeg() is not None

# ---------- Helper: convert uploaded audio to 16k mono WAV using ffmpeg ----------
def convert_to_wav_16k_mono(src_path):
    """Convert audio file to 16k mono WAV format using ffmpeg."""
    if not check_ffmpeg():
        raise RuntimeError(
            "FFmpeg is not installed or not in PATH. "
            "Please install FFmpeg from https://ffmpeg.org/download.html "
            "or use: winget install ffmpeg (Windows) / brew install ffmpeg (Mac)"
        )
    
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
    tmp.close()
    wav_path = tmp.name
    
    # Get FFmpeg path (will find it if available)
    ffmpeg_exe = _find_ffmpeg()
    if not ffmpeg_exe:
        raise RuntimeError("FFmpeg not found. Please install FFmpeg and restart the server.")
    
    # Build command with found FFmpeg path
    cmd = [
        ffmpeg_exe, "-y",
        "-i", src_path,
        "-ac", "1",            # mono
        "-ar", "16000",        # 16 kHz
        "-sample_fmt", "s16",  # 16-bit PCM
        wav_path
    ]
    
    # Try direct execution first
    try:
        result = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=30,
            shell=False
        )
    except Exception as e:
        # Fallback: Try with shell=True on Windows if direct call fails
        if os.name == 'nt':
            # Escape paths for Windows shell
            src_escaped = src_path.replace('"', '\\"')
            wav_escaped = wav_path.replace('"', '\\"')
            cmd_str = f'"{ffmpeg_exe}" -y -i "{src_escaped}" -ac 1 -ar 16000 -sample_fmt s16 "{wav_escaped}"'
            result = subprocess.run(
                cmd_str,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                timeout=30,
                shell=True
            )
        else:
            raise RuntimeError(f"FFmpeg execution failed: {e}")
    
    if result.returncode != 0:
        error_msg = result.stderr.decode('utf-8', errors='ignore')
        raise RuntimeError(f"FFmpeg conversion failed: {error_msg}")
    
    if not os.path.exists(wav_path):
        raise RuntimeError("FFmpeg conversion failed: output file was not created")
    
    return wav_path

# ---------- Endpoints ----------
@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint to verify VOSK model status and FFmpeg availability."""
    ffmpeg_available = check_ffmpeg()
    ffmpeg_path = _find_ffmpeg()
    tts_available = _check_tts()
    
    all_ok = vosk_model and ffmpeg_available and tts_available
    
    status = {
        "status": "ok" if all_ok else "error",
        "vosk_model_loaded": vosk_model is not None,
        "vosk_error": vosk_error,
        "model_path": VOSK_MODEL_DIR,
        "model_path_exists": os.path.exists(VOSK_MODEL_DIR),
        "ffmpeg_available": ffmpeg_available,
        "ffmpeg_path": ffmpeg_path,
        "tts_available": tts_available,
        "tts_error": _tts_error,
        "python_path": sys.executable,
    }
    return jsonify(status), 200 if all_ok else 500

@app.route("/query", methods=["POST"])
def query():
    """
    Accepts multipart/form-data with 'audio' file (webm/wav) or a typed 'text' field.
    Returns JSON: { "text": <reply>, "tts_url": "/tts/<file>" }
    """
    # typed fallback
    if "text" in request.form:
        user_text = request.form["text"].strip()
    else:
        if "audio" not in request.files:
            return jsonify({"error": "no audio or text provided"}), 400
        f = request.files["audio"]
        filename = secure_filename(f.filename or "upload.webm")
        tmp_in = tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(filename)[1])
        f.save(tmp_in.name)
        tmp_in.close()

        if not vosk_model:
            # cleanup
            try: os.unlink(tmp_in.name)
            except: pass
            error_msg = vosk_error or "VOSK model not available on server"
            return jsonify({"error": error_msg}), 500

        # Convert to 16k mono wav for VOSK
        try:
            wav_path = convert_to_wav_16k_mono(tmp_in.name)
            user_text = transcribe_with_vosk(wav_path)
        except Exception as e:
            # cleanup
            try: os.unlink(tmp_in.name)
            except: pass
            try: os.unlink(wav_path)
            except: pass
            return jsonify({"error": f"transcription failed: {e}"}), 500
        finally:
            try: os.unlink(tmp_in.name)
            except: pass
            try: os.unlink(wav_path)
            except: pass

    if not user_text:
        return jsonify({"error": "could not transcribe audio or empty text"}), 400

    # Generate reply (offline rules)
    reply = generate_reply_offline(user_text)

    # Synthesize TTS (blocking) and return URL
    safe_name = secure_filename(user_text)[:30].replace(" ", "_") or "reply"
    tts_filename = f"{int(time.time())}_{safe_name}.wav"
    try:
        tts_path = synthesize_tts_to_file(reply, tts_filename)
    except Exception as e:
        return jsonify({"error": f"tts generation failed: {e}", "text": reply}), 500

    return jsonify({"text": reply, "tts_url": f"/tts/{os.path.basename(tts_path)}"})

# ---------- Page explanation endpoint ----------
def generate_page_explanation(path):
    """
    Generate a friendly explanation for a given page path.
    Uses rule-based mapping for common routes, falls back to generic message.
    """
    # Normalize path
    path = path.strip().lower()
    if not path.startswith("/"):
        path = "/" + path
    
    # Rule-based mapping for common Healix routes
    explanations = {
        "/": "Welcome to Healix! This is the home page where you can access all your health information.",
        "/login": "This is the login page. Enter your email and password to access your Healix account. You can also navigate to the registration page if you need to create an account.",
        "/register": "This is the registration page. Fill in your details to create a new Healix account. Make sure to provide accurate information.",
        "/dashboard": "This is your dashboard. Here you can view your health summary, recent activities, and quick access to important features.",
        "/home": "This is your home page. You can navigate to different sections like your profile, family members, health records, and more.",
        "/family": "This is the family management page. You can add family members, view their profiles, and manage their health information here.",
        "/health-records": "This is your health records page. View and manage your health records, test results, and medical history.",
        "/health-records/choose": "Choose which profile's health records you want to view. Select from your own profile or any family members you manage.",
        "/profile": "This is your profile page. Update your personal information, contact details, and account settings.",
        "/policies": "Browse available healthcare policies and insurance schemes. Compare options and find the best coverage for your needs.",
        "/chatbot": "Chat with our AI assistant to get answers about your health, policies, or general questions about Healix.",
        "/settings": "Manage your account settings, privacy preferences, and app configuration options.",
        "/legal/terms": "Read the terms and conditions for using Healix. This outlines your rights and responsibilities as a user.",
        "/legal/privacy": "Review our privacy policy to understand how we collect, use, and protect your personal health information.",
        "/legal/consent": "Manage your consent preferences for data sharing and health information access.",
    }
    
    # Check if we have a specific explanation
    if path in explanations:
        return explanations[path]
    
    # Fallback: try to infer from path structure
    if "/health" in path or "/records" in path:
        return "This page relates to health records and medical information. You can view, add, or manage your health data here."
    if "/family" in path:
        return "This page is related to family member management. Add or manage family profiles and their health information."
    if "/legal" in path or "/terms" in path or "/privacy" in path:
        return "This is a legal or policy page. Review important terms, privacy information, or consent settings."
    if "/scheme" in path or "/policy" in path:
        return "This page shows healthcare policies or insurance schemes. Browse and compare available coverage options."
    
    # Generic fallback
    return f"This is the {path} page. Explore the interface to discover available features and actions. Check the README for more details about this section."

@app.route("/explain", methods=["GET"])
def explain():
    """
    Accepts GET /explain?path=/login
    Returns JSON: { "text": <explanation>, "tts_url": "/tts/<file>" }
    """
    path = request.args.get("path", "/")
    print(f"[EXPLAIN] Requested path: {path}")
    
    # Generate explanation text
    explanation_text = generate_page_explanation(path)
    print(f"[EXPLAIN] Generated explanation text: {explanation_text[:50]}...")
    
    # Generate TTS file
    safe_name = secure_filename(path.replace("/", "_"))[:30] or "page"
    tts_filename = f"{int(time.time())}_{safe_name}.wav"
    print(f"[EXPLAIN] TTS filename: {tts_filename}")
    
    tts_url = None
    try:
        print(f"[EXPLAIN] Attempting to synthesize TTS...")
        tts_path = synthesize_tts_to_file(explanation_text, tts_filename)
        tts_url = f"/tts/{os.path.basename(tts_path)}"
        print(f"[EXPLAIN] TTS generated successfully: {tts_url}")
    except Exception as e:
        # If TTS fails, still return text explanation
        print(f"[EXPLAIN] Warning: TTS generation failed for explanation: {e}")
        import traceback
        traceback.print_exc()
    
    response = {
        "text": explanation_text,
        "tts_url": tts_url
    }
    print(f"[EXPLAIN] Returning response: {response}")
    return jsonify(response)

@app.route("/tts/<path:filename>")
def serve_tts(filename):
    """Serve TTS files with correct MIME type and CORS headers."""
    response = send_from_directory(TTS_DIR, filename, as_attachment=False, mimetype='audio/wav')
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response

# Optional: Serve React build in production
BUILD_DIR = os.environ.get('BUILD_DIR')
if BUILD_DIR and os.path.exists(BUILD_DIR):
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_react(path):
        if path and os.path.exists(os.path.join(BUILD_DIR, path)):
            return send_from_directory(BUILD_DIR, path)
        return send_from_directory(BUILD_DIR, 'index.html')

if __name__ == "__main__":
    # Print startup status
    print("\n" + "=" * 60)
    print("Starting Flask Voice Assistant Server")
    print("=" * 60)
    print(f"Python: {sys.executable}")
    print(f"Model status: {'✓ LOADED' if vosk_model else '✗ FAILED'}")
    if vosk_error:
        print(f"  Error: {vosk_error}")
    print(f"FFmpeg status: {'✓ AVAILABLE' if check_ffmpeg() else '✗ NOT FOUND'}")
    ffmpeg_path = _find_ffmpeg()
    if ffmpeg_path:
        print(f"  Path: {ffmpeg_path}")
    elif not check_ffmpeg():
        print("  WARNING: FFmpeg is not installed. Audio conversion will fail.")
        print("  Install from: https://ffmpeg.org/download.html")
        print("  Windows: winget install ffmpeg")
    print(f"TTS (pyttsx3) status: {'✓ AVAILABLE' if _check_tts() else '✗ NOT FOUND'}")
    if not _check_tts():
        print(f"  Error: {_tts_error}")
        print("  Make sure you're using the virtual environment:")
        print("    .\\venv\\Scripts\\Activate.ps1")
        print("  Then install: pip install -r requirements.txt")
    print(f"Server will run on: http://0.0.0.0:7860")
    print(f"Health check: http://localhost:7860/health")
    print("=" * 60 + "\n")
    
    # run dev server
    app.run(host="0.0.0.0", port=7860, debug=True)
