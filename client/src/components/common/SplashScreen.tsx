import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartPulse, ShieldCheck, Pill, Stethoscope, Sparkles } from 'lucide-react';
import { useIntroStore } from '../../store/introStore';

interface SplashScreenProps {
  onComplete?: () => void;
  minDurationMs?: number;
}

const steps = [
  { text: 'Establishing 256-Bit Encrypted Healthcare Channel...', icon: ShieldCheck },
  { text: 'Syncing Real-Time Pharmacy Formularies & Cold-Chain...', icon: Pill },
  { text: 'Connecting to Licensed Pharmacists & Board Specialists...', icon: Stethoscope },
  { text: 'Medicare Healthcare Ecosystem Ready', icon: Sparkles },
];

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  minDurationMs = 2400,
}) => {
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const { autoPlayOnVisit, toggleAutoPlayOnVisit, closeIntro } = useIntroStore();

  // Prevent background scrolling while splash is active
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / minDurationMs) * 100));
      setProgress(pct);

      if (pct < 30) {
        setStepIndex(0);
      } else if (pct < 65) {
        setStepIndex(1);
      } else if (pct < 90) {
        setStepIndex(2);
      } else {
        setStepIndex(3);
      }

      if (elapsed >= minDurationMs) {
        clearInterval(interval);
        setTimeout(() => {
          setIsVisible(false);
          closeIntro();
          if (onComplete) onComplete();
        }, 300);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [minDurationMs, onComplete, closeIntro]);

  const handleSkip = () => {
    setIsVisible(false);
    closeIntro();
    if (onComplete) onComplete();
  };

  const CurrentIcon = steps[stepIndex].icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="splash-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02, filter: 'blur(8px)' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white overflow-hidden p-4 select-none"
        >
          {/* Animated Medical Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.25),rgba(255,255,255,0))] pointer-events-none" />
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(to right, #10b981 1px, transparent 1px), linear-gradient(to bottom, #10b981 1px, transparent 1px)`,
              backgroundSize: '32px 32px',
            }}
          />

          {/* Glowing Ambient Orbs */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.15, 0.3, 0.15],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none"
          />

          {/* Main Content Box */}
          <div className="relative z-10 flex flex-col items-center max-w-sm sm:max-w-md w-full px-2 sm:px-6 text-center">
            {/* Centerpiece Emblem with ECG Rings */}
            <div className="relative mb-6 sm:mb-8 flex items-center justify-center">
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.2, 0.7, 0.2],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute w-24 sm:w-28 h-24 sm:h-28 rounded-full border border-emerald-400/30"
              />

              {/* Glowing Core Icon */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-0.5 shadow-2xl shadow-emerald-500/50 flex items-center justify-center"
              >
                <div className="w-full h-full rounded-[14px] bg-slate-950/85 backdrop-blur-md flex items-center justify-center">
                  <motion.div
                    animate={{
                      scale: [1, 1.18, 1, 1.12, 1],
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <HeartPulse className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Brand Title */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="space-y-1 mb-5 sm:mb-6"
            >
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center justify-center gap-1.5">
                <span>MEDI</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                  CARE
                </span>
              </h1>
              <p className="text-[10px] sm:text-xs uppercase tracking-widest text-emerald-400/80 font-bold">
                Integrated Healthcare Ecosystem
              </p>
            </motion.div>

            {/* Continuous SVG ECG Heartbeat Line */}
            <div className="w-full max-w-xs h-10 sm:h-12 relative flex items-center justify-center overflow-hidden mb-5 sm:mb-6">
              <svg
                viewBox="0 0 300 60"
                className="w-full h-full stroke-emerald-400 fill-none"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 30 L60 30 L75 30 L85 10 L95 50 L105 20 L115 38 L125 30 L180 30 L195 30 L205 8 L215 52 L225 18 L235 40 L245 30 L300 30"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    strokeDasharray: '300',
                    strokeDashoffset: `${300 - (progress / 100) * 300}`,
                    filter: 'drop-shadow(0 0 6px #10b981)',
                  }}
                />
              </svg>
            </div>

            {/* Progress Bar & Status Text */}
            <div className="w-full space-y-3">
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-300 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)] transition-all duration-75"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Dynamic Status Step */}
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <div className="flex items-center gap-1.5 sm:gap-2 text-emerald-300/90 font-medium truncate max-w-[240px] sm:max-w-[280px]">
                  <CurrentIcon className="w-3.5 h-3.5 text-emerald-400 animate-pulse flex-shrink-0" />
                  <span className="truncate text-[11px] sm:text-xs">{steps[stepIndex].text}</span>
                </div>
                <span className="font-mono text-xs font-bold text-slate-300 ml-2">
                  {progress}%
                </span>
              </div>
            </div>

            {/* Next Time Preference Toggle Checkbox (User Request) */}
            <div className="mt-5 flex items-center justify-center">
              <label className="flex items-center gap-2 cursor-pointer select-none py-1.5 px-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition">
                <input
                  type="checkbox"
                  checked={autoPlayOnVisit}
                  onChange={() => toggleAutoPlayOnVisit()}
                  className="w-4 h-4 rounded text-emerald-500 bg-slate-950 border-slate-700 focus:ring-emerald-500 cursor-pointer accent-emerald-500"
                />
                <span className="text-[11px] sm:text-xs text-slate-300 font-medium">
                  Show intro animation next time
                </span>
              </label>
            </div>

            {/* Enter / Skip Button with 44px touch target */}
            <button
              type="button"
              onClick={handleSkip}
              className="mt-4 min-h-[44px] inline-flex items-center justify-center text-xs text-slate-400 hover:text-emerald-400 transition-colors py-2 px-6 rounded-full border border-slate-800 hover:border-emerald-500/40 font-semibold"
            >
              Enter Platform →
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
