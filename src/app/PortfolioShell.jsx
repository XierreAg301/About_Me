import { useEffect } from 'react';
import { CONFIG } from '../../config';
import GlobePropertyNav from './GlobePropertyNav';
import MissionControlNav from './MissionControlNav';
import { SECTION_BY_ID } from './portfolioSections';
import usePortfolioNavigation from './usePortfolioNavigation';
import PortfolioWorldStage from '../experience/PortfolioWorldStage';
import AboutPanel from '../panels/AboutPanel';
import SkillsPanel from '../panels/SkillsPanel';
import BackgroundPanel from '../panels/BackgroundPanel';
import ProjectsPanel from '../panels/ProjectsPanel';
import CertificatesPanel from '../panels/CertificatesPanel';
import ContactPanel from '../panels/ContactPanel';

export default function PortfolioShell() {
  const {
    activeSection,
    isPanelOpen,
    closePanel,
  } = usePortfolioNavigation();
  const activeMeta = SECTION_BY_ID.get(activeSection);

  useEffect(() => {
    document.title = 'Aaron Austin C. Amaro | Interactive Globe Portfolio';
  }, []);

  return (
    <div className="portfolio-shell immersive-shell world-only-shell" data-panel-open={isPanelOpen}>
      <a
        className="skip-link"
        href={isPanelOpen ? '#portfolio-content' : '#portfolio-globe-nav'}
      >
        Skip to interactive portfolio
      </a>

      <MissionControlNav />
      <PortfolioWorldStage />
      <GlobePropertyNav />

      <section className="world-identity" aria-labelledby="world-identity-title">
        <p className="system-label">GLOBAL PORTFOLIO / 2026</p>
        <h1 id="world-identity-title">{CONFIG.name}</h1>
        <p>{CONFIG.title}</p>
        <span>Select a globe property to open its record.</span>
      </section>

      <section
        className="world-content-panel"
        aria-label={`${activeMeta?.label || 'Portfolio'} property`}
        hidden={!isPanelOpen}
      >
        <header className="world-content-chrome">
          <button type="button" onClick={() => closePanel({ source: 'panel' })}>
            <span aria-hidden="true">←</span>
            Return to globe
          </button>
          <div aria-hidden="true">
            <span>{activeMeta?.index}</span>
            <span>{activeMeta?.nodeType}</span>
            <i />
            <span>CONNECTED</span>
          </div>
        </header>

        <main id="portfolio-content" className="world-panel-scroll">
          <AboutPanel />
          <SkillsPanel />
          <BackgroundPanel />
          <ProjectsPanel />
          <CertificatesPanel />
          <ContactPanel />
          <footer className="site-footer">
            <span>© {new Date().getFullYear()} Aaron Austin C. Amaro</span>
            <span>Blender + React Three Fiber globe interface</span>
          </footer>
        </main>
      </section>

      <div className="world-corners" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
