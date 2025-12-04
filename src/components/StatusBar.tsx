export const StatusBar = () => {
  return (
    <div 
      className="bg-primary w-full fixed top-0 left-0 right-0 z-50"
      style={{ height: 'env(safe-area-inset-top, 0px)' }}
    />
  );
};
