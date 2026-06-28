import { CONFIG } from '../../config';
import usePortfolioNavigation from './usePortfolioNavigation';
import { PORTFOLIO_SECTIONS } from './portfolioSections';

export default function MissionControlNav() {
  const { activeSection, navigateTo } = usePortfolioNavigation();

  return (
    <header className="mission-header">
      <a
        href="#hero"
        className="brand-mark"
        aria-label={`${CONFIG.name}, home`}
        onClick={(event) => {
          event.preventDefault();
          navigateTo('hero', { source: 'header' });
        }}
      >
        <span>AA</span>
        <span className="brand-copy">
          <strong>{CONFIG.name}</strong>
          <small>CYBERSPACE PORTFOLIO</small>
        </span>
      </a>

      <nav aria-label="Primary navigation">
        {PORTFOLIO_SECTIONS.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            aria-current={activeSection === section.id ? 'location' : undefined}
            onClick={(event) => {
              event.preventDefault();
              navigateTo(section.id, { source: 'header' });
            }}
          >
            <small>{section.index}</small>
            {section.label}
          </a>
        ))}
      </nav>

      <a className="header-contact" href={`mailto:${CONFIG.email}`}>
        INITIATE CONTACT
      </a>
    </header>
  );
}
