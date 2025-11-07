import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ArrowLeft, Send, Mic, MicOff, Bot, User, Volume2, VolumeX, Languages } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { toast } from 'sonner';
import axios from 'axios';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isVoice?: boolean;
  detectedLanguage?: string;
}

export function ChatbotPage() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: getWelcomeMessage(),
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [detectedLanguage, setDetectedLanguage] = useState<string>('en');
  const [currentMicLanguage, setCurrentMicLanguage] = useState<string>('en');
  const [showLangSelector, setShowLangSelector] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Your Google Gemini API key
  const apiKey = 'AIzaSyDMQcIgjvSBCm7hM_cjqsKdWnqUgF1NpRE';

  // Popular languages for quick selection
  const popularLanguages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
    { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
    { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  ];

  // Load all available voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      console.log(`Loaded ${voices.length} voices for TTS`);
    };

    loadVoices();

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Auto-detect language from text
  const detectLanguageFromText = (text: string): string => {
    const scripts = [
      { pattern: /[\u0600-\u06FF]/, lang: 'ar', name: 'Arabic' },
      { pattern: /[\u0980-\u09FF]/, lang: 'bn', name: 'Bengali' },
      { pattern: /[\u4E00-\u9FFF]/, lang: 'zh', name: 'Chinese' },
      { pattern: /[\u0900-\u097F]/, lang: 'hi', name: 'Hindi' },
      { pattern: /[\u0D00-\u0D7F]/, lang: 'ml', name: 'Malayalam' },
      { pattern: /[\u0A80-\u0AFF]/, lang: 'gu', name: 'Gujarati' },
      { pattern: /[\u0A00-\u0A7F]/, lang: 'pa', name: 'Punjabi' },
      { pattern: /[\u0B80-\u0BFF]/, lang: 'ta', name: 'Tamil' },
      { pattern: /[\u0C00-\u0C7F]/, lang: 'te', name: 'Telugu' },
      { pattern: /[\u0C80-\u0CFF]/, lang: 'kn', name: 'Kannada' },
      { pattern: /[\u0B00-\u0B7F]/, lang: 'or', name: 'Odia' },
      { pattern: /[\u0400-\u04FF]/, lang: 'ru', name: 'Russian' },
      { pattern: /[\u0E00-\u0E7F]/, lang: 'th', name: 'Thai' },
      { pattern: /[\u0590-\u05FF]/, lang: 'he', name: 'Hebrew' },
      { pattern: /[\u1100-\u11FF\uAC00-\uD7AF]/, lang: 'ko', name: 'Korean' },
      { pattern: /[\u3040-\u309F\u30A0-\u30FF]/, lang: 'ja', name: 'Japanese' },
      { pattern: /[\u0370-\u03FF]/, lang: 'el', name: 'Greek' },
      { pattern: /[\u1780-\u17FF]/, lang: 'km', name: 'Khmer' },
      { pattern: /[\u0E80-\u0EFF]/, lang: 'lo', name: 'Lao' },
      { pattern: /[\u1000-\u109F]/, lang: 'my', name: 'Myanmar' },
      { pattern: /[a-zA-Z]/, lang: 'en', name: 'English' },
    ];

    for (const script of scripts) {
      if (script.pattern.test(text)) {
        return script.lang;
      }
    }

    return 'en';
  };

  // Get best voice for detected language
  const getBestVoiceForLanguage = (langCode: string): SpeechSynthesisVoice | null => {
    if (availableVoices.length === 0) return null;

    let voice = availableVoices.find(v => v.lang.toLowerCase() === langCode.toLowerCase());
    
    if (!voice) {
      voice = availableVoices.find(v => v.lang.toLowerCase().startsWith(langCode.toLowerCase()));
    }

    if (!voice) {
      const localVoices = availableVoices.filter(v => 
        v.lang.toLowerCase().startsWith(langCode.toLowerCase()) && v.localService
      );
      if (localVoices.length > 0) voice = localVoices[0];
    }

    if (!voice) {
      voice = availableVoices.find(v => v.lang.includes(langCode));
    }

    if (!voice) {
      voice = availableVoices.find(v => v.default) || availableVoices[0];
    }

    return voice || null;
  };

  // Get language code for Speech Recognition
  const getRecognitionLanguageCode = (langCode: string): string => {
    const langMap: Record<string, string> = {
      'hi': 'hi-IN',
      'ml': 'ml-IN',
      'en': 'en-US',
      'ar': 'ar-SA',
      'bn': 'bn-IN',
      'zh': 'zh-CN',
      'gu': 'gu-IN',
      'ja': 'ja-JP',
      'kn': 'kn-IN',
      'ko': 'ko-KR',
      'mr': 'mr-IN',
      'pa': 'pa-IN',
      'ta': 'ta-IN',
      'te': 'te-IN',
      'ur': 'ur-PK',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'it': 'it-IT',
      'pt': 'pt-BR',
      'ru': 'ru-RU',
      'th': 'th-TH',
      'tr': 'tr-TR',
      'vi': 'vi-VN',
      'id': 'id-ID',
      'pl': 'pl-PL',
      'nl': 'nl-NL',
      'sv': 'sv-SE',
      'no': 'no-NO',
      'da': 'da-DK',
      'fi': 'fi-FI',
      'el': 'el-GR',
      'he': 'he-IL',
      'ro': 'ro-RO',
      'cs': 'cs-CZ',
      'hu': 'hu-HU',
      'uk': 'uk-UA',
    };

    return langMap[langCode] || `${langCode}-${langCode.toUpperCase()}`;
  };

  // Create or recreate Speech Recognition with specific language
  const createSpeechRecognition = (langCode: string) => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.log('Recognition already stopped');
        }
      }

      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      const recognitionLang = getRecognitionLanguageCode(langCode);
      recognitionRef.current.lang = recognitionLang;
      
      console.log(`🎤 Speech Recognition set to: ${recognitionLang} (${langCode})`);

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        
        // Verify the detected language matches
        const spokenLang = detectLanguageFromText(transcript);
        console.log(`🗣️ Transcribed in ${langCode}, detected as: ${spokenLang}`);
        toast.success(`Recognized (${langCode.toUpperCase()}): "${transcript.substring(0, 40)}..."`, { duration: 3000 });
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'language-not-supported') {
          toast.error(`Language ${langCode.toUpperCase()} not supported on your device`);
        } else if (event.error === 'no-speech') {
          toast.error('No speech detected. Please try again.');
        } else {
          toast.error('Voice recognition failed. Try again.');
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  };

  // Recreate recognition when mic language changes
  useEffect(() => {
    createSpeechRecognition(currentMicLanguage);
  }, [currentMicLanguage]);

  function getWelcomeMessage() {
    switch (language) {
      case 'hi':
        return 'नमस्ते! मैं Healix Assistant हूँ — आपका स्वास्थ्य साथी। मैं आपके स्वास्थ्य, फिटनेस, डाइट या किसी भी मेडिकल जानकारी में मदद कर सकता हूँ।';
      case 'ml':
        return 'നമസ്കാരം! ഞാൻ Healix Assistant ആണ് — നിങ്ങളുടെ ഹെൽത്ത് കൂട്ടുകാരൻ. ആരോഗ്യ, ഭക്ഷണം, ഫിറ്റ്‌നെസ്, രോഗങ്ങൾ എന്നിവയെക്കുറിച്ച് ഞാൻ നിങ്ങളെ സഹായിക്കാം.';
      default:
        return 'Hello! I\'m Healix Assistant — your personal healthcare companion. I can help with health tips, symptoms, fitness, diet, and wellness guidance.';
    }
  }

  const generateAIResponse = async (userMessage: string, userLang: string): Promise<string> => {
    try {
      if (!apiKey) {
        throw new Error('API key not configured');
      }

      const languageNames: Record<string, string> = {
        'en': 'English', 'hi': 'Hindi', 'ml': 'Malayalam', 'ar': 'Arabic',
        'bn': 'Bengali', 'zh': 'Chinese', 'gu': 'Gujarati', 'ja': 'Japanese',
        'kn': 'Kannada', 'ko': 'Korean', 'mr': 'Marathi', 'pa': 'Punjabi',
        'ta': 'Tamil', 'te': 'Telugu', 'ur': 'Urdu', 'es': 'Spanish',
        'fr': 'French', 'de': 'German', 'it': 'Italian', 'pt': 'Portuguese',
        'ru': 'Russian', 'th': 'Thai', 'tr': 'Turkish', 'vi': 'Vietnamese',
        'id': 'Indonesian', 'pl': 'Polish', 'nl': 'Dutch', 'sv': 'Swedish'
      };

      const targetLanguage = languageNames[userLang] || 'English';

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `You are "Healix Assistant", an empathetic and knowledgeable AI healthcare assistant. 
                  
                  CRITICAL INSTRUCTION: You MUST respond in ${targetLanguage} language ONLY. The user wrote in ${targetLanguage}, so reply in ${targetLanguage}.
                  
                  Your role is to provide reliable, safe, and educational health-related information (like wellness, symptoms, diet, fitness, or mental health).
                  Avoid giving medical prescriptions. 
                  Keep your answer short, friendly, and informative.
                  
                  User message: ${userMessage}`
                }
              ]
            }
          ]
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      return response.data.candidates[0].content.parts[0].text;
    } catch (error: any) {
      console.error('Healix API Error:', error);

      if (error.response?.status === 400 || error.response?.status === 403) {
        return 'Sorry, the API key is invalid. Please add a valid one.';
      }

      return 'Sorry, I had trouble responding. Please try again.';
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const detectedLang = detectLanguageFromText(inputText);
    setDetectedLanguage(detectedLang);
    
    // Auto-update mic language based on typed text
    if (detectedLang !== currentMicLanguage) {
      setCurrentMicLanguage(detectedLang);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputText,
      sender: 'user',
      timestamp: new Date(),
      detectedLanguage: detectedLang,
    };

    const currentInput = inputText;
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const aiResponse = await generateAIResponse(currentInput, detectedLang);
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'bot',
        timestamp: new Date(),
        detectedLanguage: detectedLang,
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);

      if (voiceEnabled) {
        playVoiceResponse(botResponse.content, detectedLang);
      }
    } catch {
      setIsTyping(false);
      toast.error('Failed to get Healix response. Please try again.');
    }
  };

  const playVoiceResponse = (text: string, langCode: string) => {
    if ('speechSynthesis' in window && voiceEnabled) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      const voice = getBestVoiceForLanguage(langCode);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = getRecognitionLanguageCode(langCode);
      }
      
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleVoice = () => {
    const newState = !voiceEnabled;
    setVoiceEnabled(newState);

    if (!newState && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    toast[newState ? 'success' : 'info'](
      newState ? 'Voice assistant enabled' : 'Voice assistant disabled'
    );
  };

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast.error('Voice input not supported on this device.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      const targetLang = getRecognitionLanguageCode(currentMicLanguage);
      const langName = popularLanguages.find(l => l.code === currentMicLanguage)?.name || currentMicLanguage;
      
      toast.info(`🎤 Listening in ${langName}...`, { duration: 2000 });
      
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Recognition start error:', error);
        setIsListening(false);
        toast.error('Could not start voice input.');
      }
    }
  };

  const changeMicLanguage = (langCode: string) => {
    setCurrentMicLanguage(langCode);
    setShowLangSelector(false);
    const langName = popularLanguages.find(l => l.code === langCode)?.name || langCode;
    toast.success(`Microphone set to ${langName}`, { duration: 2000 });
  };

  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const quickQuestions = [
    {
      text: language === 'hi' ? 'स्वास्थ्य सुझाव' : language === 'ml' ? 'ആരോഗ്യ ടിപ്പുകൾ' : 'Health Tips',
      query: language === 'hi' ? 'मुझे अच्छे स्वास्थ्य के लिए कुछ सुझाव दें।' : language === 'ml' ? 'നല്ല ആരോഗ്യത്തിനായി കുറച്ച് ടിപ്പുകൾ പറയൂ.' : 'Give me some tips for better health.'
    },
    {
      text: language === 'hi' ? 'डाइट प्लान' : language === 'ml' ? 'ഭക്ഷണ പദ്ധതി' : 'Diet Plan',
      query: language === 'hi' ? 'संतुलित डाइट प्लान क्या होता है?' : language === 'ml' ? 'സന്തുലിതമായ ഭക്ഷണ പദ്ധതി എന്താണ്?' : 'What is a balanced diet plan?'
    },
    {
      text: language === 'hi' ? 'फिटनेस गाइड' : language === 'ml' ? 'ഫിറ്റ്‌നെസ് ഗൈഡ്' : 'Fitness Guide',
      query: language === 'hi' ? 'फिट रहने के लिए क्या करें?' : language === 'ml' ? 'ഫിറ്റ് ആയി ഇരിക്കാൻ എന്ത് ചെയ്യണം?' : 'How can I stay fit?'
    }
  ];

  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-to-br from-blue-50 to-green-50 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white shadow-sm border-b z-10">
        <div className="w-full max-w-md mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate('/home')} className="p-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-blue-500 to-green-500 p-2 rounded-full">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-gray-900">Healix Assistant</h1>
                  <p className="text-xs text-green-600">
                    {isTyping ? 'Typing...' : '● Online'}
                  </p>
                </div>
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={toggleVoice} className="p-2">
              {voiceEnabled ? <Volume2 className="h-5 w-5 text-blue-600" /> : <VolumeX className="h-5 w-5 text-gray-400" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto overscroll-contain" ref={scrollAreaRef}>
        <div className="w-full max-w-md mx-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex items-start gap-2 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gradient-to-br from-blue-500 to-green-500 text-white'}`}>
                {message.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={`max-w-[75%] rounded-2xl p-3 ${message.sender === 'user' ? 'bg-blue-500 text-white rounded-tr-none' : 'bg-white text-gray-900 shadow-md rounded-tl-none'}`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                  {formatTime(message.timestamp)}
                  {message.detectedLanguage && ` • ${message.detectedLanguage}`}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-green-500 text-white flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-white shadow-md rounded-2xl rounded-tl-none p-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick questions */}
      {messages.length === 1 && (
        <div className="flex-shrink-0 bg-gradient-to-t from-blue-50 to-transparent">
          <div className="w-full max-w-md mx-auto px-4 py-3">
            <p className="text-sm text-gray-600 mb-2 font-medium">
              {language === 'hi' ? 'त्वरित प्रश्न:' : language === 'ml' ? 'പെട്ടെന്നുള്ള ചോദ്യങ്ങൾ:' : 'Quick questions:'}
            </p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((q, i) => (
                <Button key={i} variant="outline" size="sm" onClick={() => setInputText(q.query)} className="text-xs bg-white">
                  {q.text}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Language Selector Modal */}
      {showLangSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full max-w-md mx-auto rounded-t-3xl p-4 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Select Microphone Language</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowLangSelector(false)}>✕</Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {popularLanguages.map((lang) => (
                <Button
                  key={lang.code}
                  variant="outline"
                  className={`justify-start text-left ${currentMicLanguage === lang.code ? 'bg-blue-100 border-blue-500' : ''}`}
                  onClick={() => changeMicLanguage(lang.code)}
                >
                  <span className="mr-2">{lang.flag}</span>
                  <span className="text-sm">{lang.name}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="flex-shrink-0 bg-white border-t shadow-lg z-10">
        <div className="w-full max-w-md mx-auto p-4">
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLangSelector(true)}
              className="text-xs"
            >
              {popularLanguages.find(l => l.code === currentMicLanguage)?.flag} {currentMicLanguage.toUpperCase()}
            </Button>
            <span className="text-xs text-gray-500">← Tap to change mic language</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type in any language..."
                className="rounded-full border-2 focus:border-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isTyping}
              />
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleVoiceInput}
              disabled={isTyping}
              className={`p-2 rounded-full ${isListening ? 'text-red-500 animate-pulse' : 'text-blue-600'}`}
              title={`Voice input (${currentMicLanguage.toUpperCase()})`}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>

            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isTyping}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center disabled:opacity-50 hover:scale-110 active:scale-95 transition-transform"
              title="Send message"
            >
              <Send className="h-4 w-4 text-white" />
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-2 text-center">
            🌍 20+ languages • Voice & Text • Auto language switching
          </p>
        </div>
      </div>
    </div>
  );
}
