export const SafeAreaBar = () => {
  // Use env for iOS notch, fallback to 24px for Android status bar
  return (
    <div 
      className="fixed top-0 left-0 right-0 z-50 bg-slate-900"
      style={{ 
        height: 'max(env(safe-area-inset-top, 24px), 24px)'
      }}
    />
  );
};
