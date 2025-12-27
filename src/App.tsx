import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import { AppProvider, useApp } from "@/contexts/AppContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SafeAreaBar } from "@/components/SafeAreaBar";
import { useRevenueCat } from "@/hooks/useRevenueCat";
import TrialExpired from "@/components/TrialExpired";
import Index from "./pages/Index";
import PracticeTest from "./pages/PracticeTest";
import Results from "./pages/Results";
import StudyMode from "./pages/StudyMode";
import LearningList from "./pages/LearningList";
import Settings from "./pages/Settings";
import WeakAreas from "./pages/WeakAreas";
import Install from "./pages/Install";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { isTrialExpired } = useApp();
  const location = useLocation();
  
  // Allow practice test page even when trial expired (so users can finish/restart tests)
  const isPracticePage = location.pathname === '/practice';
  const showTrialExpired = isTrialExpired && !isPracticePage;

  if (showTrialExpired) {
    return <TrialExpired />;
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/practice" element={<PracticeTest />} />
      <Route path="/results" element={<Results />} />
      <Route path="/study" element={<StudyMode />} />
      <Route path="/learning" element={<LearningList />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/weak-areas" element={<WeakAreas />} />
      <Route path="/install" element={<Install />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const AppContent = () => {
  // Check RevenueCat subscription status on app startup
  const { checkSubscriptionStatus, isInitialized } = useRevenueCat();
  
  useEffect(() => {
    if (isInitialized) {
      checkSubscriptionStatus();
    }
  }, [isInitialized, checkSubscriptionStatus]);

  return (
    <>
      <SafeAreaBar />
      <Toaster />
      <Sonner />
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <TooltipProvider>
          <AppContent />
        </TooltipProvider>
      </AppProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
