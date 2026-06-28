import { useEffect } from 'react';

/**
 * Reveals story sections as they enter the viewport. Content remains visible
 * without JavaScript; the data attribute only opts a section into enhancement.
 */
export default function useScrollReveal() {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const sections = Array.from(document.querySelectorAll('[data-reveal]'));
    if (!sections.length) return undefined;

    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
      || !('IntersectionObserver' in window)
    ) {
      sections.forEach((section) => section.classList.add('is-revealed'));
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    }, {
      rootMargin: '0px 0px -12% 0px',
      threshold: 0.08,
    });

    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
    };
  }, []);
}
