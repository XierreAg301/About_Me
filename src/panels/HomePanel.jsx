import { useState } from 'react';
import { CONFIG } from '../../config';
import usePortfolioNavigation from '../app/usePortfolioNavigation';

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
  const [avatarFailed, setAvatarFailed] = useState(false);
  const featuredProject = CONFIG.projects.find((project) => project.featured) || CONFIG.projects[0];

  return (
    <section
      id="hero"
      tabIndex="-1"
      aria-labelledby="hero-heading"
      className="portfolio-panel home-panel"
    >
      <div className="home-status">
        <span className="status-dot" aria-hidden="true" />
        <span>Portfolio network online</span>
      </div>

      <div className="home-identity">
        <div className="avatar-frame">
          {!avatarFailed && CONFIG.avatar ? (
            <img
              src={CONFIG.avatar}
              alt=""
              referrerPolicy="no-referrer"
              onError={() => setAvatarFailed(true)}
            />
          ) : (
            <span aria-hidden="true">AA</span>
          )}
        </div>

        <div>
          <p className="system-label"><span>00</span> IDENTITY</p>
          <h1 id="hero-heading">{CONFIG.name}</h1>
          <p className="home-role">{CONFIG.title}</p>
        </div>
      </div>

      <p className="home-tagline">{CONFIG.tagline}</p>
      <p className="home-summary">{CONFIG.summary}</p>

      <div className="panel-actions" aria-label="Primary actions">
        <NavAction target="projects" className="action-primary">
          Explore projects <span aria-hidden="true">↗</span>
        </NavAction>
        <NavAction target="contact" className="action-secondary">
          Open comms
        </NavAction>
      </div>

      <div className="signal-card">
        <div>
          <p className="system-label">FEATURED MISSION</p>
          <h2>{featuredProject.title}</h2>
          <p>{featuredProject.outcome}</p>
        </div>
        <NavAction target="projects" className="text-link">
          Inspect mission
        </NavAction>
      </div>
    </section>
  );
}
