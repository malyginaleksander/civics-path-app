import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Configure status bar for native apps immediately on startup
const configureStatusBar = async () => {
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    // Check if we're in dark mode
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Disable overlay so status bar has solid background
    await StatusBar.setOverlaysWebView({ overlay: false });
    
    // Set icon style: Dark = dark icons (for light bg), Light = light icons (for dark bg)
    await StatusBar.setStyle({ style: isDark ? Style.Light : Style.Dark });
    
    // Set background color
    await StatusBar.setBackgroundColor({ 
      color: isDark ? '#1a1a2e' : '#ffffff' 
    });
    
    console.log('StatusBar configured successfully');
  } catch (e) {
    // Not running in Capacitor or plugin not available
    console.log('StatusBar not available:', e);
  }
};

configureStatusBar();

createRoot(document.getElementById("root")!).render(<App />);
