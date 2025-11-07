import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from './LanguageContext';

interface VoiceGuidanceProps {
  message: string;
  autoPlay?: boolean;
}

export function VoiceGuidance({ message, autoPlay = false }: VoiceGuidanceProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const { language } = useLanguage();

  // Mock voice guidance - in a real app, this would use Text-to-Speech API
  const playVoiceGuidance = () => {
    if (isMuted) return;
    
    setIsPlaying(true);
    
    // Simulate voice playback duration
    setTimeout(() => {
      setIsPlaying(false);
    }, 3000);
    
    // In a real implementation, you would use:
    // const utterance = new SpeechSynthesisUtterance(message);
    // utterance.lang = language === 'hi' ? 'hi-IN' : language === 'ml' ? 'ml-IN' : 'en-US';
    // speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (autoPlay && !isMuted) {
      playVoiceGuidance();
    }
  }, [message, autoPlay, isMuted]);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsMuted(!isMuted)}
        className="p-2"
      >
        {isMuted ? (
          <VolumeX className="h-5 w-5 text-gray-500" />
        ) : (
          <Volume2 className={`h-5 w-5 ${isPlaying ? 'text-blue-600 animate-pulse' : 'text-gray-600'}`} />
        )}
      </Button>
      {!isMuted && (
        <Button
          variant="ghost"
          size="sm"
          onClick={playVoiceGuidance}
          className="text-sm text-blue-600 p-1"
          disabled={isPlaying}
        >
          {isPlaying ? 'Playing...' : 'Replay'}
        </Button>
      )}
    </div>
  );
}