import { useState, useCallback, useEffect, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';

export const useTextToSpeech = () => {
  const { settings } = useApp();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string) => {
    if (!settings.audioEnabled || !('speechSynthesis' in window) || !window.speechSynthesis) {
      return;
    }

    // Cancel any ongoing speech
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.warn('Speech synthesis cancel failed:', e);
    }

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
    try {
      if ('speechSynthesis' in window && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } catch (e) {
      console.warn('Speech synthesis cancel failed:', e);
    }
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
      try {
        if ('speechSynthesis' in window && window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
      } catch (e) {
        // Ignore cleanup errors
      }
    };
  }, []);

  // Load voices
  useEffect(() => {
    try {
      if ('speechSynthesis' in window && window.speechSynthesis) {
        window.speechSynthesis.getVoices();
      }
    } catch (e) {
      // Ignore voice loading errors
    }
  }, []);

  return { speak, stop, toggle, isSpeaking };
};
