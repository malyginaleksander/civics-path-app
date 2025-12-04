import { useState, useCallback, useEffect, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';

export const useTextToSpeech = () => {
  const { settings } = useApp();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load voices - critical for mobile
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setVoicesLoaded(true);
        console.log('TTS: Voices loaded:', voices.length);
      }
    };

    // Try loading immediately
    loadVoices();

    // Also listen for voiceschanged event (needed for mobile)
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = useCallback((text: string) => {
    if (!settings.audioEnabled) {
      console.log('TTS: Audio disabled in settings');
      return;
    }

    if (!('speechSynthesis' in window) || !window.speechSynthesis) {
      console.log('TTS: Speech synthesis not supported');
      return;
    }

    console.log('TTS: Attempting to speak:', text.substring(0, 50) + '...');

    // Cancel any ongoing speech
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.warn('TTS: Cancel failed:', e);
    }

    // Mobile workaround: resume synthesis if paused
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch (e) {
      console.warn('TTS: Resume failed:', e);
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Get voices and try to use US English
    const voices = window.speechSynthesis.getVoices();
    console.log('TTS: Available voices:', voices.length);
    
    const usVoice = voices.find(voice => 
      voice.lang.includes('en-US') || voice.lang.includes('en_US')
    );
    if (usVoice) {
      utterance.voice = usVoice;
      console.log('TTS: Using voice:', usVoice.name);
    }

    utterance.onstart = () => {
      console.log('TTS: Speech started');
      setIsSpeaking(true);
    };
    
    utterance.onend = () => {
      console.log('TTS: Speech ended');
      setIsSpeaking(false);
    };
    
    utterance.onerror = (event) => {
      console.error('TTS: Speech error:', event.error);
      setIsSpeaking(false);
    };

    utteranceRef.current = utterance;
    
    // Small delay for mobile compatibility
    setTimeout(() => {
      try {
        window.speechSynthesis.speak(utterance);
        console.log('TTS: Speak called');
      } catch (e) {
        console.error('TTS: Speak failed:', e);
        setIsSpeaking(false);
      }
    }, 50);
  }, [settings.audioEnabled]);

  const stop = useCallback(() => {
    try {
      if ('speechSynthesis' in window && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } catch (e) {
      console.warn('TTS: Stop failed:', e);
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

  return { speak, stop, toggle, isSpeaking, voicesLoaded };
};
