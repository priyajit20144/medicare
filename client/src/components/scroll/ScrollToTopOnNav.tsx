import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTopOnNav
 * Automatically resets scroll position to the top of the viewport
 * whenever the user transitions between routes.
 */
export const ScrollToTopOnNav: React.FC = () => {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const targetId = hash.replace('#', '');
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant', // Instant prevents sluggish bounce when changing pages
    });
  }, [pathname, search, hash]);

  return null;
};
