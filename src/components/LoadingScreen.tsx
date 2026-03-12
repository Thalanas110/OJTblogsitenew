import { useEffect, useState } from "react";

const LoadingScreen = () => {
  const [dots, setDots] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Fade in effect
    setVisible(true);
    
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className={`fixed inset-0 bg-background flex items-center justify-center z-[9999] transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ pointerEvents: 'all' }}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Animated Logo/Spinner */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-primary/50 rounded-full animate-spin animation-delay-150" />
        </div>
        
        {/* Loading Text */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Loading{dots}
          </h2>
          <p className="text-muted-foreground text-sm">
            Please wait while we prepare your experience
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-64 h-1 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full animate-progress" />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
