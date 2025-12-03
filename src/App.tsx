import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import Index from "./pages/Index";
import PracticeTest from "./pages/PracticeTest";
import Results from "./pages/Results";
import StudyMode from "./pages/StudyMode";
import LearningList from "./pages/LearningList";
import Settings from "./pages/Settings";
import WeakAreas from "./pages/WeakAreas";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/practice" element={<PracticeTest />} />
            <Route path="/results" element={<Results />} />
            <Route path="/study" element={<StudyMode />} />
            <Route path="/learning" element={<LearningList />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/weak-areas" element={<WeakAreas />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
