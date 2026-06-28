import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { isPortfolioSection, PORTFOLIO_SECTIONS } from './portfolioSections';
import { PortfolioNavigationContext } from './portfolioNavigationState';
import useReducedMotion from '../hooks/useReducedMotion';

const HOME_SECTION = PORTFOLIO_SECTIONS[0].id;

function sectionFromHash() {
  if (typeof window === 'undefined') return HOME_SECTION;
  const id = window.location.hash.replace(/^#/, '');
  return isPortfolioSection(id) ? id : HOME_SECTION;
}

function cleanUrl() {
  return `${window.location.pathname}${window.location.search}`;
}

export function PortfolioNavigationProvider({ children }) {
  const [activeSection, setActiveSection] = useState(sectionFromHash);
  const [focusedSection, setFocusedSection] = useState(sectionFromHash);
  const reducedMotion = useReducedMotion();

  const focusMap = useCallback(() => {
    document.getElementById('portfolio-globe-nav')?.focus?.({
      preventScroll: true,
    });
  }, []);

  const navigateTo = useCallback((id, options = {}) => {
    if (!isPortfolioSection(id)) return;
    const { history = 'push', focusPanel = true } = options;
    setActiveSection(id);
    setFocusedSection(id);

    if (history !== 'none') {
      const nextUrl = id === HOME_SECTION ? cleanUrl() : `#${id}`;
      const state = { section: id };
      if (history === 'replace') {
        window.history.replaceState(state, '', nextUrl);
      } else {
        window.history.pushState(state, '', nextUrl);
      }
    }

    if (id !== HOME_SECTION && focusPanel) {
      window.setTimeout(() => {
        document.getElementById(id)?.focus?.({ preventScroll: true });
      }, reducedMotion ? 0 : 420);
    }
  }, [reducedMotion]);

  const closePanel = useCallback((options = {}) => {
    navigateTo(HOME_SECTION, { source: 'close', ...options });
    window.setTimeout(focusMap, reducedMotion ? 0 : 260);
  }, [focusMap, navigateTo, reducedMotion]);

  useEffect(() => {
    const syncFromHistory = () => {
      const id = sectionFromHash();
      setActiveSection(id);
      setFocusedSection(id);
    };
    window.addEventListener('popstate', syncFromHistory);
    window.addEventListener('hashchange', syncFromHistory);
    return () => {
      window.removeEventListener('popstate', syncFromHistory);
      window.removeEventListener('hashchange', syncFromHistory);
    };
  }, []);

  const isPanelOpen = activeSection !== HOME_SECTION;

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key !== 'Escape') return;
      if (isPanelOpen) {
        closePanel({ source: 'keyboard' });
      } else {
        focusMap();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [closePanel, focusMap, isPanelOpen]);

  const value = useMemo(() => ({
    activeSection,
    focusedSection,
    isPanelOpen,
    reducedMotion,
    setFocusedSection,
    navigateTo,
    closePanel,
    focusMap,
  }), [
    activeSection,
    closePanel,
    focusMap,
    focusedSection,
    isPanelOpen,
    navigateTo,
    reducedMotion,
  ]);

  return (
    <PortfolioNavigationContext.Provider value={value}>
      {children}
    </PortfolioNavigationContext.Provider>
  );
}
