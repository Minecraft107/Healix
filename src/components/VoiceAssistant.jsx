// src/components/VoiceAssistant.jsx
import React, { useRef, useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";

// Frontend default explanation mapping for common routes
const DEFAULT_EXPLANATIONS = {
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
};

export default function VoiceAssistant() {
  const [listening, setListening] = useState(false);
  const [reply, setReply] = useState("");
  const [explanationEnabled, setExplanationEnabled] = useState(false);
  const [explanationText, setExplanationText] = useState("");
  const [explaining, setExplaining] = useState(false);
  const [userGestureDone, setUserGestureDone] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const explanationAudioRef = useRef(null);
  const location = useLocation();
  const debounceTimerRef = useRef(null);

  // Track screen size for responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load explanation preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("healix_explanation_enabled");
    if (saved === "true") {
      setExplanationEnabled(true);
    }
  }, []);

  // Save explanation preference to localStorage
  useEffect(() => {
    localStorage.setItem("healix_explanation_enabled", explanationEnabled.toString());
  }, [explanationEnabled]);

  // Stop any playing audio
  const stopAllAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (explanationAudioRef.current) {
      explanationAudioRef.current.pause();
      explanationAudioRef.current.currentTime = 0;
      explanationAudioRef.current = null;
    }
    setExplaining(false);
  }, []);

  // Fetch explanation for current route
  const fetchExplanation = useCallback(async (path) => {
    // Always call backend to get TTS, even if we have a frontend default
    // Frontend defaults are only used as fallback if backend fails
    try {
      const resp = await fetch(`/explain?path=${encodeURIComponent(path)}`);
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}`);
      }
      const data = await resp.json();
      console.log("Explanation response from backend:", data);
      return { text: data.text || "", tts_url: data.tts_url || null };
    } catch (error) {
      console.warn("Failed to fetch explanation from backend:", error);
      // Fallback to frontend default if backend fails
      const fallbackText = DEFAULT_EXPLANATIONS[path] || `This is the ${path} page. Explore the interface to discover available features.`;
      return { text: fallbackText, tts_url: null };
    }
  }, []);

  // Play explanation audio
  const playExplanation = useCallback(async (text, ttsUrl) => {
    stopAllAudio();
    setExplanationText(text);
    setExplaining(true);
    setAudioBlocked(false);

    if (!ttsUrl) {
      console.warn("No TTS URL provided, showing text only");
      setExplaining(false);
      return;
    }

    try {
      console.log("Playing explanation audio from:", ttsUrl);
      const audio = new Audio(ttsUrl);
      explanationAudioRef.current = audio;

      // Set up event handlers before loading
      audio.onended = () => {
        console.log("Explanation audio finished playing");
        setExplaining(false);
        explanationAudioRef.current = null;
      };

      audio.onerror = (e) => {
        console.error("Audio playback error:", e);
        console.error("Audio element error details:", {
          error: audio.error,
          errorCode: audio.error ? audio.error.code : null,
          networkState: audio.networkState,
          readyState: audio.readyState,
          src: audio.src
        });
        setExplaining(false);
        setAudioBlocked(true);
        explanationAudioRef.current = null;
      };

      audio.onloadstart = () => {
        console.log("Audio loading started");
      };

      audio.oncanplay = () => {
        console.log("Audio can play - ready to play");
      };

      audio.onloadeddata = () => {
        console.log("Audio data loaded");
      };

      // Wait for audio to be ready before playing
      const playPromise = new Promise((resolve, reject) => {
        const playAudio = async () => {
          try {
            await audio.play();
            console.log("Audio playback started successfully");
            resolve();
          } catch (playError) {
            console.error("Failed to play audio:", playError);
            setExplaining(false);
            setAudioBlocked(true);
            reject(playError);
          }
        };

        // If already loaded, play immediately
        if (audio.readyState >= 2) { // HAVE_CURRENT_DATA
          playAudio();
        } else {
          // Wait for canplay event
          audio.addEventListener('canplay', playAudio, { once: true });
          // Also handle errors during loading
          audio.addEventListener('error', (e) => {
            console.error("Audio loading error:", e);
            setExplaining(false);
            setAudioBlocked(true);
            reject(new Error("Audio loading failed"));
          }, { once: true });
          // Start loading
          audio.load();
        }
      });

      await playPromise;
    } catch (error) {
      console.error("Audio playback blocked or failed:", error);
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        ttsUrl: ttsUrl
      });
      setExplaining(false);
      setAudioBlocked(true);
    }
  }, [stopAllAudio]);

  // Handle route change and trigger explanation if enabled
  useEffect(() => {
    if (!explanationEnabled || !userGestureDone) {
      return;
    }

    // Debounce to avoid multiple calls
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      const path = location.pathname;
      const { text, tts_url } = await fetchExplanation(path);
      if (text) {
        playExplanation(text, tts_url);
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [location.pathname, explanationEnabled, userGestureDone, fetchExplanation, playExplanation]);

  // Toggle explanation on/off
  const toggleExplanation = useCallback(async () => {
    const newState = !explanationEnabled;
    setExplanationEnabled(newState);
    setUserGestureDone(true);

    if (newState) {
      // If enabling, fetch and play explanation
      const path = location.pathname;
      const { text, tts_url } = await fetchExplanation(path);
      if (text) {
        playExplanation(text, tts_url);
      }
    } else {
      // If disabling, stop any playing explanation
      stopAllAudio();
      setExplanationText("");
    }
  }, [explanationEnabled, location.pathname, fetchExplanation, playExplanation, stopAllAudio]);

  // Handle user gesture for audio permission
  const handleUserGesture = useCallback(() => {
    if (!userGestureDone) {
      setUserGestureDone(true);
    }
  }, [userGestureDone]);

  async function startListening() {
    // Stop any playing explanation when user starts recording
    stopAllAudio();
    setReply("");
    
    if (!navigator.mediaDevices) {
      alert("Microphone not supported.");
      return;
    }
    
    handleUserGesture(); // Mark gesture as done
    
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    audioChunksRef.current = [];
    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };
    mediaRecorderRef.current.onstop = async () => {
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      // send to server
      const fd = new FormData();
      fd.append("audio", blob, "query.webm");
      try {
        const resp = await fetch("/query", {
          method: "POST",
          body: fd,
        });
        const j = await resp.json();
        if (j.error) {
          setReply(`Error: ${j.error}`);
          return;
        }
        if (j.text) setReply(j.text);
        if (j.tts_url) {
          // play TTS
          const audio = new Audio(j.tts_url);
          audioRef.current = audio;
          audio.play().catch((e) => console.warn(e));
        }
      } catch (error) {
        setReply(`Error: ${error.message}`);
      }
    };
    mediaRecorderRef.current.start();
    setListening(true);
  }

  function stopListening() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      // stop tracks
      mediaRecorderRef.current.stream?.getTracks().forEach(t => t.stop());
    }
    setListening(false);
  }

  // Handle keyboard events for accessibility
  const handleKeyDown = (e, action) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action();
    }
  };

  return (
    <>
      {/* Banner for first-time gesture requirement - positioned above buttons */}
      {!userGestureDone && explanationEnabled && (
        <div style={{
          position: "fixed",
          bottom: 80,
          ...(isMobile 
            ? { right: 20, left: "auto", transform: "none" } 
            : { left: "50%", transform: "translateX(-50%)", right: "auto" }
          ),
          zIndex: 10000,
          background: "#3b82f6",
          color: "#fff",
          padding: "10px 16px",
          borderRadius: 8,
          fontSize: "13px",
          maxWidth: "calc(100vw - 40px)",
          width: "auto",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          cursor: "pointer",
        }}
        onClick={handleUserGesture}
        onKeyDown={(e) => handleKeyDown(e, handleUserGesture)}
        tabIndex={0}
        role="button"
        aria-label="Click to enable audio explanations">
          Click the speaker to enable audio explanations
        </div>
      )}

      {/* Minimal status indicators - no text content, audio only */}
      {listening && (
        <div style={{
          position: "fixed",
          bottom: 80,
          ...(isMobile 
            ? { right: 20, left: "auto", transform: "none" } 
            : { left: "50%", transform: "translateX(-50%)", right: "auto" }
          ),
          zIndex: 10000,
          background: "rgba(239, 68, 68, 0.9)",
          color: "#fff",
          padding: "8px 16px",
          borderRadius: 20,
          fontSize: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        }}>
          🎤 Listening...
        </div>
      )}

      {explaining && !listening && (
        <div style={{
          position: "fixed",
          bottom: 80,
          ...(isMobile 
            ? { right: 20, left: "auto", transform: "none" } 
            : { left: "50%", transform: "translateX(-50%)", right: "auto" }
          ),
          zIndex: 10000,
          background: "rgba(59, 130, 246, 0.9)",
          color: "#fff",
          padding: "8px 16px",
          borderRadius: 20,
          fontSize: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        }}>
          🔊 Explaining...
        </div>
      )}

      {audioBlocked && (
        <div style={{
          position: "fixed",
          bottom: 80,
          ...(isMobile 
            ? { right: 20, left: "auto", transform: "none" } 
            : { left: "50%", transform: "translateX(-50%)", right: "auto" }
          ),
          zIndex: 10000,
          background: "rgba(254, 243, 199, 0.95)",
          color: "#92400e",
          padding: "8px 16px",
          borderRadius: 20,
          fontSize: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        }}>
          ⚠️ Audio blocked. Tap to allow.
        </div>
      )}
      
      {/* Button container: Responsive positioning - Bottom center (desktop) or Bottom-right (mobile) */}
      <div style={{
        position: "fixed",
        bottom: 20,
        ...(isMobile 
          ? { right: 20, left: "auto", transform: "none" } 
          : { left: "50%", transform: "translateX(-50%)", right: "auto" }
        ),
        zIndex: 9999,
        display: "flex",
        flexDirection: "row",
        gap: 12,
        alignItems: "center",
        justifyContent: "center",
        padding: "0",
      }}>
        {/* Mic button - Left side */}
        <button
          onMouseDown={startListening}
          onMouseUp={stopListening}
          onTouchStart={startListening}
          onTouchEnd={stopListening}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (listening) {
                stopListening();
              } else {
                startListening();
              }
            }
          }}
          tabIndex={0}
          aria-label={listening ? "Stop recording" : "Hold to speak"}
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            background: listening ? "#ef4444" : "#3b82f6",
            border: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            cursor: "pointer",
            fontSize: "22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
            WebkitTapHighlightColor: "transparent",
            touchAction: "manipulation",
          }}
          title="Hold to speak"
        >
          🎤
        </button>

        {/* Speaker button - Right side */}
        <button
          onClick={toggleExplanation}
          onKeyDown={(e) => handleKeyDown(e, toggleExplanation)}
          tabIndex={0}
          aria-label={explanationEnabled ? "Stop page explanation" : "Start page explanation"}
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            background: explanationEnabled ? "#10b981" : "#6b7280",
            border: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            cursor: "pointer",
            fontSize: "22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
            color: "#fff",
            WebkitTapHighlightColor: "transparent",
            touchAction: "manipulation",
          }}
          title={explanationEnabled ? "Stop page explanation" : "Start page explanation"}
        >
          {explanationEnabled ? "🔊" : "🔇"}
        </button>
      </div>
    </>
  );
}
