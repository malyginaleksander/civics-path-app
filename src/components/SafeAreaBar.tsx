export const SafeAreaBar = () => {
  return (
    <div className="fixed top-0 left-0 right-0 h-[env(safe-area-inset-top,0px)] bg-background z-50" />
  );
};