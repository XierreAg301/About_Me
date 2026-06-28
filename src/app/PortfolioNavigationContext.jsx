import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { PORTFOLIO_SECTIONS, isPortfolioSection } from './portfolioSections';
import { PortfolioNavigationContext } from './portfolioNavigationState';
import useReducedMotion from '../hooks/useReducedMotion';

function sectionFromHash() {
  if (typeof window === 'undefined') return 'hero';
  const id = window.location.hash.replace(/^#/, '');
  return isPortfolioSection(id) ? id : 'hero';
}

export function PortfolioNavigationProvider({ children }) {
  const [activeSection, setActiveSection] = useState(sectionFromHash);
  const [focusedSection, setFocusedSection] = useState(sectionFromHash);
  const [navigationSource, setNavigationSource] = useState('initial');
  const reducedMotion = useReducedMotion();
  const activeRef = useRef(activeSection);
  const ratiosRef = useRef(new Map());
  const programmaticTargetRef = useRef(null);

  useEffect(() => {
    activeRef.current = activeSection;
  }, [activeSection]);

  const focusMap = useCallback(() => {
    const map = document.getElementById('portfolio-map-nav');
    map?.focus({ preventScroll: true });
  }, []);

  const navigateTo = useCallback((id, options = {}) => {
    if (!isPortfolioSection(id)) return;
    const {
      source = 'control',
      history = 'push',
      focusPanel = true,
      scrollBehavior,
    } = options;
    const target = document.getElementById(id);

    setActiveSection(id);
    setFocusedSection(id);
    setNavigationSource(source);
    programmaticTargetRef.current = id;

    if (history === 'push' && window.location.hash !== `#${id}`) {
      window.history.pushState({ section: id }, '', `#${id}`);
    } else if (history === 'replace' && window.location.hash !== `#${id}`) {
      window.history.replaceState({ section: id }, '', `#${id}`);
    }

    if (!target) {
      programmaticTargetRef.current = null;
      return;
    }
    target.scrollIntoView({
      behavior: scrollBehavior || (reducedMotion ? 'auto' : 'smooth'),
      block: 'start',
    });

    window.setTimeout(() => {
      if (programmaticTargetRef.current === id) {
        programmaticTargetRef.current = null;
      }
    }, reducedMotion ? 80 : 1200);

    if (focusPanel) {
      window.setTimeout(() => {
        target.focus({ preventScroll: true });
      }, reducedMotion ? 0 : 420);
    }
  }, [reducedMotion]);

  useEffect(() => {
    const initialSection = sectionFromHash();
    if (initialSection === 'hero') return;
    navigateTo(initialSection, {
      source: 'initial',
      history: 'none',
      focusPanel: false,
      scrollBehavior: 'auto',
    });
  }, [navigateTo]);

  useEffect(() => {
    const updateFromHistory = () => {
      const id = sectionFromHash();
      navigateTo(id, { source: 'history', history: 'none', focusPanel: false });
    };
    window.addEventListener('popstate', updateFromHistory);
    window.addEventListener('hashchange', updateFromHistory);
    return () => {
      window.removeEventListener('popstate', updateFromHistory);
      window.removeEventListener('hashchange', updateFromHistory);
    };
  }, [navigateTo]);

  useEffect(() => {
    const elements = PORTFOLIO_SECTIONS
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        ratiosRef.current.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
      });

      const [mostVisible] = [...ratiosRef.current.entries()]
        .sort((left, right) => right[1] - left[1]);
      if (
        programmaticTargetRef.current
        && mostVisible?.[0] !== programmaticTargetRef.current
      ) {
        return;
      }
      if (mostVisible?.[0] === programmaticTargetRef.current) {
        programmaticTargetRef.current = null;
      }
      if (!mostVisible || mostVisible[1] <= 0 || mostVisible[0] === activeRef.current) return;

      const id = mostVisible[0];
      setActiveSection(id);
      setFocusedSection(id);
      setNavigationSource('scroll');
      window.history.replaceState({ section: id }, '', `#${id}`);
    }, {
      threshold: [0.15, 0.3, 0.5, 0.7],
      rootMargin: '-16% 0px -58% 0px',
    });

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') focusMap();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [focusMap]);

  const value = useMemo(() => ({
    activeSection,
    focusedSection,
    navigationSource,
    reducedMotion,
    setFocusedSection,
    navigateTo,
    focusMap,
  }), [
    activeSection,
    focusMap,
    focusedSection,
    navigateTo,
    navigationSource,
    reducedMotion,
  ]);

  return (
    <PortfolioNavigationContext.Provider value={value}>
      {children}
    </PortfolioNavigationContext.Provider>
  );
}
