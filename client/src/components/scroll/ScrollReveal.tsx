import React, { useRef } from 'react';
import { motion, useInView, useReducedMotion, Variants } from 'framer-motion';

export type ScrollRevealEffect =
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right'
  | 'zoom-in'
  | 'blur-reveal';

export interface ScrollRevealProps {
  children: React.ReactNode;
  /** Animation preset (default: 'fade-up') */
  effect?: ScrollRevealEffect;
  /** Animation duration in seconds (default: 0.55) */
  duration?: number;
  /** Explicit delay in seconds (default: 0) */
  delay?: number;
  /** Index for automatic staggered children delay (0.08s * index) */
  staggerIndex?: number;
  /** Distance in pixels for translation effects (default: 24) */
  distance?: number;
  /** Viewport margin or threshold for triggering (e.g. '-40px') */
  viewportMargin?: string;
  /** Whether the animation should trigger only once (default: true for static stability) */
  once?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** HTML element tag to render as (default: 'div') */
  as?: keyof typeof motion;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  effect = 'fade-up',
  duration = 0.55,
  delay = 0,
  staggerIndex,
  distance = 24,
  viewportMargin = '-40px',
  once = true,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once,
    margin: (viewportMargin as any) || '-40px',
  });
  const shouldReduceMotion = useReducedMotion();

  // Compute staggered delay if index provided
  const computedDelay = staggerIndex !== undefined ? staggerIndex * 0.08 + delay : delay;

  // Reduced motion fallback: pure instant static presentation
  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  // Variant definitions based on effect preset
  const getVariants = (): Variants => {
    switch (effect) {
      case 'fade-up':
        return {
          hidden: { opacity: 0, y: distance },
          visible: { opacity: 1, y: 0 },
        };
      case 'fade-down':
        return {
          hidden: { opacity: 0, y: -distance },
          visible: { opacity: 1, y: 0 },
        };
      case 'fade-left':
        return {
          hidden: { opacity: 0, x: -distance },
          visible: { opacity: 1, x: 0 },
        };
      case 'fade-right':
        return {
          hidden: { opacity: 0, x: distance },
          visible: { opacity: 1, x: 0 },
        };
      case 'zoom-in':
        return {
          hidden: { opacity: 0, scale: 0.94 },
          visible: { opacity: 1, scale: 1 },
        };
      case 'blur-reveal':
        return {
          hidden: { opacity: 0, filter: 'blur(8px)', y: 16 },
          visible: { opacity: 1, filter: 'blur(0px)', y: 0 },
        };
      default:
        return {
          hidden: { opacity: 0, y: distance },
          visible: { opacity: 1, y: 0 },
        };
    }
  };

  const variants = getVariants();

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      transition={{
        duration,
        delay: computedDelay,
        ease: [0.22, 1, 0.36, 1], // Custom smooth cubic-bezier easing
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
