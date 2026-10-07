import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  ShoppingBag,
  Stethoscope,
  Activity,
  Building2,
  Crown,
  Star,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  FileCheck,
} from 'lucide-react';

export interface SectionTarget {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
}

const DEFAULT_SECTIONS: SectionTarget[] = [
  { id: 'hero', label: 'Top / Discovery Hub', shortLabel: 'Discovery', icon: Compass },
  { id: 'quick-services', label: 'Core Services', shortLabel: 'Services', icon: Sparkles },
  { id: 'prescription-upload', label: 'Prescription Verification', shortLabel: 'Rx Upload', icon: FileCheck },
  { id: 'medicines-store', label: 'Genuine Medicines', shortLabel: 'Medicines', icon: ShoppingBag },
  { id: 'doctors-hub', label: 'Specialist Doctors', shortLabel: 'Doctors', icon: Stethoscope },
  { id: 'checkups-hub', label: 'Health Checkups', shortLabel: 'Checkups', icon: Activity },
  { id: 'premium-care', label: 'Medicare VIP Club', shortLabel: 'VIP Club', icon: Crown },
  { id: 'reviews-hub', label: 'Patient Reviews', shortLabel: 'Reviews', icon: Star },
  { id: 'faq-hub', label: 'Questions & Answers', shortLabel: 'FAQ', icon: HelpCircle },
];

export interface ScrollTimelineNavProps {
  sections?: SectionTarget[];
}

export const ScrollTimelineNav: React.FC<ScrollTimelineNavProps> = ({
  sections = DEFAULT_SECTIONS,
}) => {
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id || 'hero');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show the timeline nav once the user starts exploring past the hero headline
    const checkScrollVisibility = () => {
      setIsVisible(window.scrollY > 150);
    };

    window.addEventListener('scroll', checkScrollVisibility, { passive: true });
    checkScrollVisibility();

    return () => window.removeEventListener('scroll', checkScrollVisibility);
  }, []);

  // Intersection Observer to accurately detect the active in-view section
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -40% 0px',
      threshold: 0,
    };

    const handleIntersect: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    const navOffset = 90; // offset for sticky header
    const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - navOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Page Section Quick Navigation"
      className="hidden xl:flex fixed right-4 top-1/2 -translate-y-1/2 z-30 flex-col items-end select-none"
    >
      <div className="relative flex items-center">
        {/* Toggle Collapse Pill */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? 'Expand navigation dock' : 'Collapse navigation dock'}
          className="mr-2 p-1.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 shadow-md text-slate-500 hover:text-emerald-600 hover:border-emerald-300 transition-all text-xs"
        >
          {isCollapsed ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>

        {/* Navigation Rail Container */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.nav
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="relative py-3 px-2 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-xl shadow-slate-300/40 flex flex-col gap-2"
            >
              {/* Vertical connecting line */}
              <div className="absolute left-[19px] top-5 bottom-5 w-0.5 bg-slate-100 -z-10 rounded-full" />

              {sections.map((section, idx) => {
                const isActive = activeSection === section.id;
                const isHovered = hoveredSection === section.id;
                const Icon = section.icon;

                return (
                  <div
                    key={section.id}
                    className="relative flex items-center justify-end group"
                    onMouseEnter={() => setHoveredSection(section.id)}
                    onMouseLeave={() => setHoveredSection(null)}
                  >
                    {/* Floating Tooltip Label */}
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, x: -10, scale: 0.95 }}
                          animate={{ opacity: 1, x: -6, scale: 1 }}
                          exit={{ opacity: 0, x: -6, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-full mr-2 pointer-events-none whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-900/90 text-white text-[11px] font-semibold tracking-wide shadow-lg border border-slate-700/60 flex items-center gap-1.5"
                        >
                          <span>{section.label}</span>
                          <span className="text-[10px] text-emerald-400 font-mono">0{idx + 1}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Section Pill / Node */}
                    <button
                      type="button"
                      onClick={() => scrollToSection(section.id)}
                      aria-label={`Jump to ${section.label}`}
                      className={`relative flex items-center gap-2 p-1.5 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105'
                          : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100/80'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'currentColor'}`} />
                      {isActive && (
                        <motion.span
                          layoutId="activeSectionLabel"
                          className="text-[11px] font-bold pr-1.5 hidden 2xl:inline-block max-w-[90px] truncate"
                        >
                          {section.shortLabel}
                        </motion.span>
                      )}
                    </button>
                  </div>
                );
              })}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
};
