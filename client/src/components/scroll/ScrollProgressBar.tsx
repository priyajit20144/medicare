import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export interface ScrollProgressBarProps {
  /** Height in pixels of the scroll progress bar (default: 3.5) */
  height?: number;
  /** Whether to show the percentage indicator pill on active scroll (default: true) */
  showPercentagePill?: boolean;
}

/**
 * ScrollProgressBar
 * A high-performance, spring-physics-smoothed top reading progress bar
 * with a luminous vital-rhythm medical gradient and pulse spark head.
 */
export const ScrollProgressBar: React.FC<ScrollProgressBarProps> = ({
  height = 3.5,
  showPercentagePill = true,
}) => {
  const { scrollYProgress } = useScroll();
  const [percent, setPercent] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  // Smooth spring physics for fluid motion without jitter
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 28,
    restDelta: 0.001,
  });

  useEffect(() => {
    let scrollTimeout: ReturnType<typeof setTimeout>;

    const unsubscribe = scrollYProgress.on('change', (latest) => {
      setPercent(Math.round(latest * 100));
      setIsScrolling(true);

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 1400);
    });

    return () => {
      unsubscribe();
      clearTimeout(scrollTimeout);
    };
  }, [scrollYProgress]);

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none select-none"
    >
      {/* Background glow track (ambient) */}
      <div
        className="w-full bg-emerald-950/5 backdrop-blur-[1px]"
        style={{ height: `${height}px` }}
      >
        {/* Animated Fill Bar */}
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 origin-left relative shadow-[0_0_12px_rgba(16,185,129,0.7)]"
          style={{ scaleX }}
        >
          {/* Leading Vital Spark / Pulse Bead */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_#34d399] relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-80" />
            </span>
          </div>
        </motion.div>
      </div>

      {/* Optional Minimalist Percentage Indicator Pill */}
      {showPercentagePill && (
        <div
          className={`absolute top-2.5 right-4 sm:right-6 transition-all duration-300 ease-out transform ${
            isScrolling && percent > 2 && percent < 99
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 -translate-y-1'
          }`}
        >
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-semibold tracking-wider shadow-lg shadow-black/10 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{percent}%</span>
          </div>
        </div>
      )}
    </div>
  );
};
