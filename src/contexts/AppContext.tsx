import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Question } from '@/data/questions';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

export interface TestResult {
  id: string;
  date: string;
  score: number;
  totalQuestions: number;
  accuracy: number;
  timeSpent: number; // in seconds
  answers: {
    questionId: number;
    selectedAnswer: string;
    isCorrect: boolean;
  }[];
}

export interface LearningItem {
  questionId: number;
  status: 'still-learning' | 'known';
  addedAt: string;
  lastReviewed?: string;
}

interface Settings {
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'normal' | 'medium' | 'large';
  audioEnabled: boolean;
  audioAutoplay: boolean;
  reminderTime: string | null;
  seniorMode: boolean; // 65/20 rule - only show 20 specially marked questions
  selectedState: string | null; // User's state for dynamic answer questions
}

const TRIAL_DAYS = 5;
const VALID_PROMO_CODES = ['FREEUSCIS', 'CITIZEN2025', 'PREMIUM100'];

interface AppContextType {
  // Test Results
  testResults: TestResult[];
  addTestResult: (result: TestResult) => void;
  clearTestResults: () => void;
  
  // Learning List
  learningList: LearningItem[];
  addToLearningList: (questionId: number) => void;
  removeFromLearningList: (questionId: number) => void;
  updateLearningStatus: (questionId: number, status: 'still-learning' | 'known') => void;
  isInLearningList: (questionId: number) => boolean;
  
  // Seen Questions
  seenQuestions: number[];
  markQuestionAsSeen: (questionId: number) => void;
  
  // Settings
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => void;
  
  // Trial & Premium
  trialDaysLeft: number;
  isTrialExpired: boolean;
  isPremium: boolean;
  setPremium: (value: boolean) => void;
  activatePromoCode: (code: string) => { success: boolean; message: string };
  clearPromoCode: () => void;
  usedPromoCode: string | null;
  
  // Clear all data
  clearAllData: () => void;
}

const defaultSettings: Settings = {
  theme: 'auto',
  fontSize: 'normal',
  audioEnabled: true,
  audioAutoplay: false,
  reminderTime: null,
  seniorMode: false,
  selectedState: null,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [testResults, setTestResults] = useState<TestResult[]>(() => {
    const saved = localStorage.getItem('testResults');
    return saved ? JSON.parse(saved) : [];
  });

  const [learningList, setLearningList] = useState<LearningItem[]>(() => {
    const saved = localStorage.getItem('learningList');
    return saved ? JSON.parse(saved) : [];
  });

  const [seenQuestions, setSeenQuestions] = useState<number[]>(() => {
    const saved = localStorage.getItem('seenQuestions');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('settings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  const [trialStartDate, setTrialStartDate] = useState<string>(() => {
    const saved = localStorage.getItem('trialStartDate');
    if (saved) return saved;
    const now = new Date().toISOString();
    localStorage.setItem('trialStartDate', now);
    return now;
  });

  const [usedPromoCode, setUsedPromoCode] = useState<string | null>(() => {
    return localStorage.getItem('usedPromoCode');
  });

  // "Store premium" is the purchase-based premium flag (RevenueCat / restore)
  const [storePremium, setStorePremium] = useState<boolean>(() => {
    const saved = localStorage.getItem('isPremium');
    return saved === 'true';
  });

  // Effective premium includes promo-code activation (so purchases can't override it)
  const isPremium = storePremium || !!usedPromoCode;

  const trialDaysLeft = React.useMemo(() => {
    if (isPremium) return TRIAL_DAYS;
    const start = new Date(trialStartDate);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(0, TRIAL_DAYS - diffDays);
  }, [trialStartDate, isPremium]);

  const isTrialExpired = !isPremium && trialDaysLeft === 0;

  const setPremium = (value: boolean) => {
    setStorePremium(value);
    localStorage.setItem('isPremium', String(value));
  };

  const clearPromoCode = () => {
    setUsedPromoCode(null);
    localStorage.removeItem('usedPromoCode');
  };

  const activatePromoCode = (code: string): { success: boolean; message: string } => {
    const normalizedCode = code.trim().toUpperCase();

    // If a promo code is already applied, require clearing it first
    if (usedPromoCode) {
      return { success: false, message: 'Promo code already applied. Tap "Use different code" to change it.' };
    }

    if (!normalizedCode) {
      return { success: false, message: 'Please enter a promo code.' };
    }

    if (VALID_PROMO_CODES.includes(normalizedCode)) {
      setPremium(true);
      setUsedPromoCode(normalizedCode);
      localStorage.setItem('usedPromoCode', normalizedCode);
      return { success: true, message: 'Premium activated successfully!' };
    }

    return { success: false, message: 'Invalid promo code. Please try again.' };
  };

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('testResults', JSON.stringify(testResults.slice(0, 10)));
  }, [testResults]);

  useEffect(() => {
    localStorage.setItem('learningList', JSON.stringify(learningList));
  }, [learningList]);

  useEffect(() => {
    localStorage.setItem('seenQuestions', JSON.stringify(seenQuestions));
  }, [seenQuestions]);

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
    
    // Apply theme + update native status bar for Capacitor mobile apps
    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      // Update native status bar icons/background when running on mobile
      (async () => {
        try {
          const platform = Capacitor.getPlatform();
          console.log('[AppContext] applyTheme: platform=', platform, 'isDark=', isDark);
          if (platform === 'android' || platform === 'ios') {
            // Ensure the system status bar draws the background color we request
            // (some devices require overlays disabled to respect background color)
            try {
              await StatusBar.setOverlaysWebView({ overlay: false });
              console.log('[AppContext] setOverlaysWebView(false) success');
            } catch (e) {
              console.warn('[AppContext] setOverlaysWebView failed', e);
            }

            if (!isDark) {
              // Light app theme -> request dark icons and white background
              console.log('[AppContext] Setting StatusBar: background=#ffffff, style=Dark (dark icons)');
              await StatusBar.setBackgroundColor({ color: '#ffffff' });
              await StatusBar.setStyle({ style: Style.Light });
            } else {
              // Dark app theme -> request light icons and dark background
              console.log('[AppContext] Setting StatusBar: background=#0f172a, style=Light (light icons)');
              await StatusBar.setBackgroundColor({ color: '#0f172a' });
              await StatusBar.setStyle({ style: Style.Dark });
            }
          } else {
            console.log('[AppContext] StatusBar plugin not used on platform:', platform);
          }
        } catch (e) {
          console.warn('[AppContext] StatusBar call failed:', e);
        }
      })();
    };

    if (settings.theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches);
      
      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      applyTheme(settings.theme === 'dark');
    }
    
    // Update meta theme-color for browsers and WebViews as a fallback
    try {
      let meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'theme-color';
        document.head.appendChild(meta);
      }
      // Light theme -> white status bar background, Dark theme -> dark background
      meta.content = settings.theme === 'dark' ? '#0f172a' : '#ffffff';
    } catch (e) {
      // ignore in non-browser environments
    }
  }, [settings.theme]);

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
    
    // Apply font size
    document.documentElement.classList.remove('font-size-normal', 'font-size-medium', 'font-size-large');
    if (settings.fontSize !== 'normal') {
      document.documentElement.classList.add(`font-size-${settings.fontSize}`);
    }
  }, [settings]);

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [result, ...prev].slice(0, 10));
  };

  const clearTestResults = () => {
    setTestResults([]);
  };

  const addToLearningList = (questionId: number) => {
    if (!learningList.find(item => item.questionId === questionId)) {
      setLearningList(prev => [...prev, {
        questionId,
        status: 'still-learning',
        addedAt: new Date().toISOString(),
      }]);
    }
  };

  const removeFromLearningList = (questionId: number) => {
    setLearningList(prev => prev.filter(item => item.questionId !== questionId));
  };

  const updateLearningStatus = (questionId: number, status: 'still-learning' | 'known') => {
    setLearningList(prev => prev.map(item => 
      item.questionId === questionId 
        ? { ...item, status, lastReviewed: new Date().toISOString() }
        : item
    ));
  };

  const isInLearningList = (questionId: number) => {
    return learningList.some(item => item.questionId === questionId);
  };

  const markQuestionAsSeen = (questionId: number) => {
    if (!seenQuestions.includes(questionId)) {
      setSeenQuestions(prev => [...prev, questionId]);
    }
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const clearAllData = () => {
    setTestResults([]);
    setLearningList([]);
    setSeenQuestions([]);
    setSettings(defaultSettings);
    setStorePremium(false);
    setUsedPromoCode(null);
    localStorage.removeItem('usedPromoCode');
    // Reset trial start date to now (restarts the 5-day trial)
    const now = new Date().toISOString();
    setTrialStartDate(now);
    localStorage.clear();
    localStorage.setItem('trialStartDate', now);
  };

  return (
    <AppContext.Provider value={{
      testResults,
      addTestResult,
      clearTestResults,
      learningList,
      addToLearningList,
      removeFromLearningList,
      updateLearningStatus,
      isInLearningList,
      seenQuestions,
      markQuestionAsSeen,
      settings,
      updateSettings,
      trialDaysLeft,
      isTrialExpired,
      isPremium,
      setPremium,
      activatePromoCode,
      clearPromoCode,
      usedPromoCode,
      clearAllData,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
