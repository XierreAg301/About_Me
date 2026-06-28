import { lazy, Suspense, useCallback, useState } from 'react';
import { PortfolioNavigationProvider } from './app/PortfolioNavigationContext';
import PortfolioShell from './app/PortfolioShell';

const IntroPortal = lazy(() => import('./components/IntroPortal'));
const INTRO_SEEN_KEY = 'intro_seen_v1';

export default function App() {
  const [showIntro, setShowIntro] = useState(
    () => typeof window !== 'undefined' && !sessionStorage.getItem(INTRO_SEEN_KEY)
  );

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
    try {
      sessionStorage.setItem(INTRO_SEEN_KEY, '1');
    } catch {
      // Storage can be unavailable in privacy-restricted browsing contexts.
    }
    window.requestAnimationFrame(() => {
      const focusTarget = document.getElementById('portfolio-globe-nav');
      focusTarget?.focus({ preventScroll: true });
    });
  }, []);

  return (
    <PortfolioNavigationProvider>
      <PortfolioShell />
      {showIntro ? (
        <Suspense fallback={<div className="intro-loading-screen" aria-hidden="true" />}>
          <IntroPortal onComplete={handleIntroComplete} />
        </Suspense>
      ) : null}
    </PortfolioNavigationProvider>
  );
}
