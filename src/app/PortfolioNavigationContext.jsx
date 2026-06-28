import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { isPortfolioSection, PORTFOLIO_SECTIONS } from './portfolioSections';
import { PortfolioNavigationContext } from './portfolioNavigationState';
import useReducedMotion from '../hooks/useReducedMotion';

const FIRST_SECTION = PORTFOLIO_SECTIONS[0].id; // 'hero'

function sectionFromHash() {
  if (typeof window === 'undefined') return null;
  const id = window.location.hash.replace(/^#/, '');
  return isPortfolioSection(id) ? id : null;
}

function cleanUrl() {
  return `${window.location.pathname}${window.location.search}`;
}

/**
 * Scroll-driven navigation. The portfolio is now a vertical scroll story: the
 * 3D network is a fixed backdrop and each section flows down the page. The
 * "active" section is whatever the visitor has scrolled to (reported by an
 * IntersectionObserver in the shell). `navigateTo` smooth-scrolls to a section
 * and keeps the URL hash and history in sync. `isPanelOpen` is kept as a
 * derived flag (true once the visitor has scrolled past the hero) so the 3D
 * backdrop can fly the camera from the wide network view onto the active node.
 */
export function PortfolioNavigationProvider({ children }) {
  const [activeSection, setActiveSection] = useState(
    () => sectionFromHash() || FIRST_SECTION
  );
  const [focusedSection, setFocusedSection] = useState(
    () => sectionFromHash() || FIRST_SECTION
  );
  const reducedMotion = useReducedMotion();
  // While a programmatic scroll is animating, ignore observer reports so the
  // target section stays "active" until the scroll settles.
  const navLockRef = useRef(false);

  const scrollToSection = useCallback((id, { smooth = true } = {}) => {
    const element = document.getElementById(id);
    if (!element) return;
    element.scrollIntoView({
      behavior: smooth && !reducedMotion ? 'smooth' : 'auto',
      block: 'start',
    });
  }, [reducedMotion]);

  const focusMap = useCallback(() => {
    document.getElementById('portfolio-map-nav')?.focus?.({ preventScroll: true });
  }, []);

  // Called by the scroll observer as sections cross the viewport centre.
  const reportActiveSection = useCallback((id) => {
    if (!isPortfolioSection(id) || navLockRef.current) return;
    setActiveSection((previous) => {
      if (previous === id) return previous;
      const nextUrl = id === FIRST_SECTION ? cleanUrl() : `#${id}`;
      window.history.replaceState({ section: id }, '', nextUrl);
      return id;
    });
    setFocusedSection(id);
  }, []);

  const navigateTo = useCallback((id, options = {}) => {
    if (!isPortfolioSection(id)) return;
    const { history = 'push' } = options;

    setActiveSection(id);
    setFocusedSection(id);

    const targetHash = `#${id}`;
    if (history !== 'none' && window.location.hash !== targetHash) {
      const nextUrl = id === FIRST_SECTION ? cleanUrl() : targetHash;
      if (history === 'replace') {
        window.history.replaceState({ section: id }, '', nextUrl);
      } else {
        window.history.pushState({ section: id }, '', nextUrl);
      }
    }

    navLockRef.current = true;
    scrollToSection(id);
    window.setTimeout(() => {
      navLockRef.current = false;
    }, reducedMotion ? 60 : 900);

    // Move focus to the section for keyboard/screen-reader users without
    // triggering a second scroll jump.
    window.setTimeout(() => {
      document.getElementById(id)?.focus?.({ preventScroll: true });
    }, reducedMotion ? 0 : 620);
  }, [reducedMotion, scrollToSection]);

  const closePanel = useCallback((options = {}) => {
    navigateTo(FIRST_SECTION, { source: 'close', ...options });
  }, [navigateTo]);

  // Browser history / manual hash edits -> scroll to the section.
  useEffect(() => {
    const syncFromUrl = () => {
      const id = sectionFromHash() || FIRST_SECTION;
      navLockRef.current = true;
      setActiveSection(id);
      setFocusedSection(id);
      scrollToSection(id);
      window.setTimeout(() => {
        navLockRef.current = false;
      }, reducedMotion ? 60 : 900);
    };

    window.addEventListener('popstate', syncFromUrl);
    window.addEventListener('hashchange', syncFromUrl);
    return () => {
      window.removeEventListener('popstate', syncFromUrl);
      window.removeEventListener('hashchange', syncFromUrl);
    };
  }, [reducedMotion, scrollToSection]);

  // Honour a deep link on first load once the sections have laid out.
  useEffect(() => {
    const id = sectionFromHash();
    if (!id || id === FIRST_SECTION) return;
    navLockRef.current = true;
    window.requestAnimationFrame(() => scrollToSection(id, { smooth: false }));
    const timer = window.setTimeout(() => {
      navLockRef.current = false;
    }, 400);
    return () => window.clearTimeout(timer);
    // Run once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') focusMap();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [focusMap]);

  const isPanelOpen = activeSection !== FIRST_SECTION;

  const value = useMemo(() => ({
    activeSection,
    focusedSection,
    isPanelOpen,
    reducedMotion,
    setFocusedSection,
    reportActiveSection,
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
    reportActiveSection,
  ]);

  return (
    <PortfolioNavigationContext.Provider value={value}>
      {children}
    </PortfolioNavigationContext.Provider>
  );
}
