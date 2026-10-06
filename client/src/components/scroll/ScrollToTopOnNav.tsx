import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTopOnNav
 * Automatically resets scroll position to the top of the viewport
 * whenever the user transitions between routes.
 */
export const ScrollToTopOnNav: React.FC = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Only scroll to top if there isn't an anchor hash in the URL
    if (!window.location.hash) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant', // Instant prevents sluggish bounce when changing pages
      });
    }
  }, [pathname, search]);

  return null;
};
