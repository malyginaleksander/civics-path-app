import { useState, useCallback, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { Capacitor } from '@capacitor/core';

export const useTextToSpeech = () => {
  const { settings } = useApp();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  const speak = useCallback(async (text: string) => {
    if (!settings.audioEnabled) {
      console.log('TTS: Audio disabled in settings');
      return;
    }

    console.log('TTS: Attempting to speak, isNative:', isNative);

    try {
      setIsSpeaking(true);

      if (isNative) {
        // Use Capacitor native TTS
        await TextToSpeech.speak({
          text,
          lang: 'en-US',
          rate: 0.9,
          pitch: 1.0,
          volume: 1.0,
          category: 'playback',
        });
        console.log('TTS: Native speech completed');
      } else {
        // Fallback to Web Speech API for browser
        if (!('speechSynthesis' in window)) {
          console.log('TTS: Speech synthesis not supported');
          setIsSpeaking(false);
          return;
        }

        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        const voices = window.speechSynthesis.getVoices();
        const usVoice = voices.find(voice => 
          voice.lang.includes('en-US') || voice.lang.includes('en_US')
        );
        if (usVoice) utterance.voice = usVoice;

        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
        return; // Don't set isSpeaking to false here, wait for onend
      }
    } catch (error) {
      console.error('TTS: Error speaking:', error);
    } finally {
      if (isNative) {
        setIsSpeaking(false);
      }
    }
  }, [settings.audioEnabled, isNative]);

  const stop = useCallback(async () => {
    try {
      if (isNative) {
        await TextToSpeech.stop();
      } else if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } catch (e) {
      console.warn('TTS: Stop failed:', e);
    }
    setIsSpeaking(false);
  }, [isNative]);

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
      if (isNative) {
        TextToSpeech.stop().catch(() => {});
      } else if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isNative]);

  return { speak, stop, toggle, isSpeaking };
};
