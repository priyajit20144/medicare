import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export interface ScrollToTopButtonProps {
  /** Scroll distance in pixels after which button becomes visible (default: 260) */
  visibilityThreshold?: number;
}

/**
 * ScrollToTopButton
 * A tactile, high-aesthetic floating button with a circular SVG progress gauge
 * that visually fills as the user traverses the page, with smooth return-to-top behavior.
 */
export const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({
  visibilityThreshold = 260,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);

  // SVG circular gauge geometry
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;

      if (scrollHeight > 0) {
        const progress = Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100));
        setScrollProgress(progress);
      }

      setIsVisible(scrollTop > visibilityThreshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [visibilityThreshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-6 right-5 sm:bottom-8 sm:right-8 z-40 flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.7, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        >
          {/* Micro Tooltip */}
          <div
            className={`pointer-events-none mb-2 px-2.5 py-1 rounded-lg bg-slate-900/90 backdrop-blur-md text-white text-[11px] font-medium shadow-md border border-slate-700/50 whitespace-nowrap transition-all duration-200 ${
              showTooltip ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
            }`}
          >
            Back to top • {Math.round(scrollProgress)}%
          </div>

          {/* Interactive Button with Radial Progress Ring */}
          <button
            type="button"
            onClick={scrollToTop}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onFocus={() => setShowTooltip(true)}
            onBlur={() => setShowTooltip(false)}
            aria-label={`Scroll to top of page, currently at ${Math.round(scrollProgress)} percent`}
            className="group relative w-12 h-12 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xl shadow-emerald-950/15 border border-slate-200/80 hover:border-emerald-500/50 flex items-center justify-center transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/25 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            {/* SVG Circular Progress Meter */}
            <svg
              className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-0.5"
              viewBox="0 0 44 44"
            >
              {/* Background Track Circle */}
              <circle
                cx="22"
                cy="22"
                r={radius}
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="2.5"
                fill="none"
              />
              {/* Dynamic Fill Circle with Gradient */}
              <circle
                cx="22"
                cy="22"
                r={radius}
                className="transition-all duration-150 ease-out"
                stroke="url(#progress-gradient)"
                strokeWidth="2.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
              <defs>
                <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="50%" stopColor="#14b8a6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>

            {/* Arrow Icon with Hover Float Micro-Animation */}
            <ArrowUp className="w-4 h-4 text-slate-700 group-hover:text-emerald-600 transition-all duration-200 group-hover:-translate-y-0.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
