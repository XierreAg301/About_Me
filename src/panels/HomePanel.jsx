import { CONFIG } from '../../config';
import usePortfolioNavigation from '../app/usePortfolioNavigation';
import Icon from '../components/Icon';

function NavAction({ target, children, className }) {
  const { navigateTo } = usePortfolioNavigation();
  return (
    <a
      href={`#${target}`}
      className={className}
      onClick={(event) => {
        event.preventDefault();
        navigateTo(target, { source: 'cta' });
      }}
    >
      {children}
    </a>
  );
}

export default function HomePanel() {
  const { activeSection, navigateTo } = usePortfolioNavigation();

  return (
    <section
      id="hero"
      tabIndex="-1"
      aria-labelledby="hero-heading"
      data-active={activeSection === 'hero'}
      data-reveal=""
      className="portfolio-panel home-panel story-reveal"
    >
      <div className="home-hero-copy">
        <div className="home-status">
          <span className="status-dot" aria-hidden="true" />
          <span>Global portfolio network online</span>
        </div>

        <p className="system-label"><span>00</span> PORTFOLIO / 2026</p>
        <h1 id="hero-heading">{CONFIG.name}</h1>
        <p className="home-role">
          <span className="gem" data-gem="red" aria-hidden="true" />
          {CONFIG.title}
        </p>
        <p className="home-tagline">{CONFIG.tagline}</p>

        <div className="panel-actions" aria-label="Primary actions">
          <NavAction target="projects" className="action-primary">
            View selected work
            <Icon name="arrow-up-right" size={16} />
          </NavAction>
          <NavAction target="about" className="action-secondary">
            Enter the network
            <Icon name="chevron-down" size={16} />
          </NavAction>
        </div>

        <div className="hero-readout" aria-hidden="true">
          <span>SG / 01.3521° N</span>
          <i />
          <span>PORTFOLIO SYSTEM ONLINE</span>
        </div>
      </div>

      <div className="hero-beacon-label" aria-hidden="true">
        <span>CONNECTED WORLD</span>
        <strong>07 ACTIVE NODES</strong>
        <i />
      </div>

      <button
        type="button"
        className="scroll-cue"
        onClick={() => navigateTo('about', { source: 'hero-cue' })}
      >
        <span>Scroll to enter</span>
        <Icon name="chevron-down" size={16} />
      </button>
    </section>
  );
}
