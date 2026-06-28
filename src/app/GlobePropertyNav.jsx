import { PORTFOLIO_SECTIONS } from './portfolioSections';
import usePortfolioNavigation from './usePortfolioNavigation';

export default function GlobePropertyNav() {
  const {
    activeSection,
    isPanelOpen,
    navigateTo,
    setFocusedSection,
  } = usePortfolioNavigation();

  return (
    <nav
      id="portfolio-globe-nav"
      className="globe-property-nav"
      data-panel-open={isPanelOpen}
      aria-label="Interactive globe properties"
      tabIndex="-1"
    >
      {PORTFOLIO_SECTIONS.map((section) => (
        <button
          type="button"
          key={section.id}
          className="globe-property"
          data-id={section.id}
          data-active={activeSection === section.id}
          style={{ '--property-color': section.color }}
          onFocus={() => setFocusedSection(section.id)}
          onMouseEnter={() => setFocusedSection(section.id)}
          onClick={() => navigateTo(section.id, { source: 'globe-property' })}
        >
          <span className="property-index">{section.index}</span>
          <span className="property-copy">
            <strong>{section.label}</strong>
            <small>{section.nodeType}</small>
          </span>
          <i aria-hidden="true" />
        </button>
      ))}
    </nav>
  );
}
