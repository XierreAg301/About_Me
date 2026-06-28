import { useEffect, useState } from 'react';
import usePortfolioNavigation from './usePortfolioNavigation';
import { SECTION_BY_ID } from './portfolioSections';

export default function ScrollProgress() {
  const { activeSection } = usePortfolioNavigation();
  const [progress, setProgress] = useState(0);
  const activeMeta = SECTION_BY_ID.get(activeSection);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? window.scrollY / scrollable : 0);
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, []);

  return (
    <aside className="scroll-progress" aria-label="Page scroll progress">
      <span className="scroll-progress-label" aria-hidden="true">
        {activeMeta?.index}
      </span>
      <span className="scroll-progress-track" aria-hidden="true">
        <span style={{ transform: `scaleY(${progress})` }} />
      </span>
      <span className="sr-only">{Math.round(progress * 100)}% through portfolio</span>
    </aside>
  );
}
