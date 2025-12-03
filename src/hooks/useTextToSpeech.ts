import { useState, useCallback, useEffect, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';

export const useTextToSpeech = () => {
  const { settings } = useApp();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string) => {
    if (!settings.audioEnabled || !('speechSynthesis' in window)) {
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Try to use a US English voice
    const voices = window.speechSynthesis.getVoices();
    const usVoice = voices.find(voice => 
      voice.lang.includes('en-US') || voice.lang.includes('en_US')
    );
    if (usVoice) {
      utterance.voice = usVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [settings.audioEnabled]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const toggle = useCallback((text: string) => {
    if (isSpeaking) {
      stop();
    } else {
      speak(text);
    }
  }, [isSpeaking, speak, stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Load voices
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  return { speak, stop, toggle, isSpeaking };
};
