import { useRef } from 'react';
import usePortfolioNavigation from '../app/usePortfolioNavigation';
import { PORTFOLIO_SECTIONS } from '../app/portfolioSections';

/**
 * The clickable node layer. It now lives inside the persistent mini-map and
 * doubles as a scroll progress indicator: the node matching the section in view
 * is marked active, and selecting one smooth-scrolls to that section.
 */
export default function NodeNavigator() {
  const {
    activeSection,
    focusedSection,
    navigateTo,
    setFocusedSection,
  } = usePortfolioNavigation();
  const buttonRefs = useRef(new Map());

  const moveFocus = (nextIndex) => {
    const section = PORTFOLIO_SECTIONS[nextIndex];
    if (!section) return;
    setFocusedSection(section.id);
    buttonRefs.current.get(section.id)?.focus();
  };

  const handleKeyDown = (event) => {
    const currentIndex = Math.max(
      0,
      PORTFOLIO_SECTIONS.findIndex(({ id }) => id === focusedSection)
    );
    let nextIndex = null;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % PORTFOLIO_SECTIONS.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (currentIndex - 1 + PORTFOLIO_SECTIONS.length)
        % PORTFOLIO_SECTIONS.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = PORTFOLIO_SECTIONS.length - 1;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      moveFocus(nextIndex);
    }
  };

  return (
    <div
      id="portfolio-map-nav"
      className="node-navigator"
      role="toolbar"
      aria-label="Portfolio section map"
      aria-describedby="map-instructions"
      tabIndex="-1"
      onKeyDown={handleKeyDown}
    >
      {PORTFOLIO_SECTIONS.map((section) => {
        const isActive = activeSection === section.id;
        const isFocused = focusedSection === section.id;
        return (
          <button
            type="button"
            key={section.id}
            ref={(element) => {
              if (element) buttonRefs.current.set(section.id, element);
            }}
            className="map-node-control"
            style={{
              '--node-x': `${section.mapPosition[0]}%`,
              '--node-y': `${section.mapPosition[1]}%`,
            }}
            data-active={isActive}
            data-priority={section.priority}
            data-color={section.color}
            aria-label={`${section.label} section`}
            aria-current={isActive ? 'location' : undefined}
            tabIndex={isFocused ? 0 : -1}
            onFocus={() => setFocusedSection(section.id)}
            onClick={() => navigateTo(section.id, { source: 'map' })}
          >
            <span className="map-node-pulse" aria-hidden="true" />
            <span className="map-node-label" aria-hidden="true">
              <small>{section.index}</small>
              {section.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
