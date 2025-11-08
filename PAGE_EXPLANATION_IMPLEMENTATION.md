# Page Explanation Feature Implementation

## PR Description

This PR implements automatic page explanation functionality for the Healix voice assistant, replacing the single speaker button with a two-button interface (mic + speaker) and enabling context-aware page explanations. **Important browser autoplay policy note:** Modern browsers block autoplay audio without user interaction. To comply with this policy, the implementation shows explanation text immediately (which is allowed), but requires one user gesture (clicking the speaker button) before playing audio. On first visit, a banner prompts users to "Click the speaker to enable audio explanations." Once the user clicks the speaker button, the gesture requirement is satisfied and audio explanations will play automatically on subsequent page navigations. The user's preference is persisted in localStorage, but the initial gesture is still required on first visit to satisfy browser autoplay policies.

## Summary

This implementation adds automatic page explanation functionality to the Healix voice assistant, replacing the single speaker button with a two-button interface (mic + speaker) and enabling automatic page explanations that respect browser autoplay policies.

## Changes Made

### 1. Frontend: `src/components/VoiceAssistant.jsx`
- **Replaced single button with two-button UI:**
  - Circular mic button (bottom) for voice queries (press-and-hold)
  - Speaker button (above mic) for toggling page explanations
- **Added automatic page explanation:**
  - Detects route changes using `useLocation()` from react-router-dom
  - Shows explanation text immediately (text-only is allowed without gesture)
  - Plays audio explanation only after user gesture (browser autoplay policy compliance)
  - Persists speaker preference in localStorage
- **Browser autoplay policy handling:**
  - Shows banner "Click the speaker to enable audio explanations" on first visit
  - Requires one user gesture (click) before playing audio
  - Displays explanation text even if audio is blocked
- **Audio behavior:**
  - Stops explanation immediately when user starts recording (mic pressed)
  - Toggle speaker button to stop/restart explanation
  - Shows "Explaining..." indicator while audio plays
- **Accessibility:**
  - Both buttons are keyboard-focusable (`tabIndex={0}`)
  - Operable via Enter/Space keys
  - ARIA labels on both buttons
  - Text explanation visible for screen readers

### 2. Backend: `assistant_backend/app.py`
- **Added `/explain` endpoint:**
  - Accepts `GET /explain?path=/login`
  - Returns JSON: `{ "text": <explanation>, "tts_url": "/tts/<file>" }`
- **Rule-based explanation generator:**
  - Mapping for common routes (/, /login, /register, /dashboard, /home, /family, /health-records, /profile, /policies, /chatbot, /settings, /legal/*)
  - Fallback logic for unknown routes based on path structure
  - Generic fallback message for completely unknown paths
- **TTS integration:**
  - Uses existing `synthesize_tts_to_file()` function
  - Returns `tts_url` if TTS succeeds, `null` if it fails (still returns text)
  - Graceful degradation when TTS is unavailable

### 3. Configuration: `vite.config.ts`
- **Added proxy for `/explain` endpoint:**
  - Forwards `/explain` requests to `http://localhost:7860`
  - Enables seamless development without CORS issues

### 4. Documentation: `assistant_backend/CONNECT.md`
- **Added testing section:**
  - cURL examples for testing `/explain` endpoint
  - Instructions for testing TTS audio files
  - Updated "How It Works" section to mention `/explain`

## Browser Autoplay Policy Compliance

**Important:** Modern browsers block autoplay audio without user interaction. This implementation:

1. **Shows explanation text immediately** (text-only display is allowed)
2. **Requires one user gesture** before playing audio (clicking the speaker button)
3. **Shows a banner** on first visit prompting the user to click the speaker
4. **Persists preference** in localStorage so subsequent visits remember the user's choice
5. **Still requires gesture on first visit** even if preference is saved (to satisfy browser policy)

## Verification Steps

### Prerequisites
1. Backend server running: `cd assistant_backend && python app.py` (should show "✓ LOADED" for VOSK model)
2. Frontend dev server running: `npm run dev` (from project root)

### Manual Test Checklist

#### Test 1: First Visit - Gesture Requirement
- [ ] Open app in a fresh browser (or clear localStorage)
- [ ] Navigate to `/login` page
- [ ] **Expected:** Banner appears: "Click the speaker to enable audio explanations"
- [ ] **Expected:** Explanation text is visible (text-only, no audio)
- [ ] Click the speaker button (🔇 → 🔊)
- [ ] **Expected:** Banner disappears
- [ ] **Expected:** Audio explanation plays for login page
- [ ] **Expected:** "Explaining..." indicator shows while playing

#### Test 2: Speaker Toggle
- [ ] While explanation is playing, click speaker button again
- [ ] **Expected:** Audio stops immediately
- [ ] Click speaker button again
- [ ] **Expected:** Explanation restarts from beginning

#### Test 3: Mic Interrupts Explanation
- [ ] Enable speaker (if not already)
- [ ] Navigate to a new page (e.g., `/register`)
- [ ] **Expected:** Explanation starts playing
- [ ] While explanation is playing, press and hold mic button
- [ ] **Expected:** Explanation audio stops immediately
- [ ] **Expected:** Recording starts (button turns red)
- [ ] Release mic button
- [ ] **Expected:** Voice query is processed normally

#### Test 4: Route Change Triggers Explanation
- [ ] Enable speaker (if not already)
- [ ] Navigate to `/login`
- [ ] **Expected:** Login page explanation plays
- [ ] Navigate to `/register`
- [ ] **Expected:** Register page explanation plays (different text)
- [ ] Navigate to `/home`
- [ ] **Expected:** Home page explanation plays

#### Test 5: Preference Persistence
- [ ] Enable speaker, navigate to a page
- [ ] Refresh the page (F5)
- [ ] **Expected:** Explanation plays automatically (preference remembered)
- [ ] Disable speaker, refresh
- [ ] **Expected:** No explanation plays (preference remembered)

#### Test 6: Keyboard Accessibility
- [ ] Tab to speaker button
- [ ] **Expected:** Button receives focus (outline visible)
- [ ] Press Enter or Space
- [ ] **Expected:** Speaker toggles on/off
- [ ] Tab to mic button
- [ ] Press Enter or Space
- [ ] **Expected:** Recording starts/stops

#### Test 7: Backend Endpoint (cURL)
```bash
# Test explanation endpoint
curl "http://localhost:7860/explain?path=/login"

# Expected: JSON response with text and tts_url
# Example:
# {
#   "text": "This is the login page...",
#   "tts_url": "/tts/1234567890_login.wav"
# }

# Test TTS file (replace filename with actual from response)
curl "http://localhost:7860/tts/1234567890_login.wav" --output out.wav

# Play the file to verify TTS works
```

#### Test 8: Unknown Route Fallback
- [ ] Navigate to a route not in the mapping (e.g., `/unknown-page`)
- [ ] **Expected:** Generic explanation is generated
- [ ] **Expected:** Explanation text is displayed
- [ ] **Expected:** TTS is generated (if TTS available)

## Edge Cases Handled

1. ✅ Audio playback blocked → Shows text + "Tap to allow audio" message
2. ✅ TTS generation fails → Returns text only, `tts_url: null`
3. ✅ Rapid route changes → Debounced to avoid duplicate TTS generation
4. ✅ User starts recording during explanation → Explanation stops immediately
5. ✅ Browser autoplay policy → Requires gesture, shows banner
6. ✅ Unknown routes → Fallback explanation based on path structure
7. ✅ Keyboard navigation → Full keyboard support with ARIA labels

## Files Modified

1. `src/components/VoiceAssistant.jsx` - Complete rewrite with new UI and logic
2. `assistant_backend/app.py` - Added `/explain` endpoint and `generate_page_explanation()` function
3. `vite.config.ts` - Added proxy for `/explain` endpoint
4. `assistant_backend/CONNECT.md` - Added testing instructions

## Next Steps (Optional)

- [ ] Clean up old TTS files periodically (add cleanup job)
- [ ] Add explanation customization per user preference
- [ ] Add explanation language selection
- [ ] Add explanation speed/volume controls
- [ ] Add analytics for explanation usage

