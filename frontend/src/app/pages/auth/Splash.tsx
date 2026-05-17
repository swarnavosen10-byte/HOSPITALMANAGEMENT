import { useEffect, useState } from "react";
import { Activity } from "lucide-react";

interface SplashProps {
  onComplete: () => void;
}

export default function Splash({ onComplete }: SplashProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onComplete, 800);
    }, 3200);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const renderAnimatedLogo = (text: string) => {
    return text.split("").map((letter, index) => (
      <span
        key={index}
        className="splash-letter"
        style={{
          animationDelay: `${index * 100}ms`,
        }}
      >
        {letter}
      </span>
    ));
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-cyan-50 via-white to-blue-50 transition-opacity duration-700 ${
        isExiting ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="splash-bg-gradient absolute -top-1/2 -right-1/2 w-full h-full rounded-full blur-3xl" />
        <div className="splash-bg-gradient-alt absolute -bottom-1/2 -left-1/2 w-full h-full rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Icon with pulse */}
        <div className="splash-icon-pulse">
          <div className="relative">
            <Activity size={48} className="text-cyan-600" strokeWidth={1.5} />
            <div className="absolute inset-0 animate-pulse">
              <Activity size={48} className="text-cyan-400/40" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* MEDISYNC Text - Staggered letter reveal */}
        <h1 className="text-7xl font-black tracking-tighter text-center" style={{ perspective: "1200px" }}>
          <span className="splash-text-glow inline-block bg-gradient-to-r from-cyan-700 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
            {renderAnimatedLogo("MEDISYNC")}
          </span>
        </h1>

        {/* Subtitle */}
        <div className="text-center max-w-sm">
          <p className="splash-subtitle text-slate-600 text-lg font-semibold">
            Centralized Hospital Management
          </p>
          <p className="splash-subtitle-2 text-slate-500 text-sm mt-2">
            Secure clinical workspace for hospital teams and patients
          </p>
        </div>

        {/* Loading dots */}
        <div className="flex gap-2 mt-8">
          <div className="splash-dot w-2 h-2 bg-cyan-600 rounded-full" />
          <div className="splash-dot w-2 h-2 bg-cyan-600 rounded-full" style={{ animationDelay: "0.15s" }} />
          <div className="splash-dot w-2 h-2 bg-cyan-600 rounded-full" style={{ animationDelay: "0.3s" }} />
        </div>
      </div>
    </div>
  );
}
