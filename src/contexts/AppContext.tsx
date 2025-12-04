import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Question } from '@/data/questions';

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
}

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
  
  // Clear all data
  clearAllData: () => void;
}

const defaultSettings: Settings = {
  theme: 'auto',
  fontSize: 'normal',
  audioEnabled: true,
  audioAutoplay: false,
  reminderTime: null,
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
    
    // Apply theme and status bar
    const applyTheme = async (isDark: boolean) => {
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // Update status bar for native apps
      // Style.Dark = dark icons (for light backgrounds)
      // Style.Light = light icons (for dark backgrounds)
      try {
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        // Disable overlay so status bar has its own background
        await StatusBar.setOverlaysWebView({ overlay: false });
        // Set style - Dark means dark icons for light backgrounds
        await StatusBar.setStyle({ style: isDark ? Style.Light : Style.Dark });
        // Set background color for Android
        await StatusBar.setBackgroundColor({ 
          color: isDark ? '#1a1a2e' : '#ffffff' 
        });
      } catch (e) {
        // Not running in Capacitor or plugin not available
      }
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
    localStorage.clear();
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
