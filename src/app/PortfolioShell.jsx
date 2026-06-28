import { useEffect } from 'react';
import MissionControlNav from './MissionControlNav';
import PortfolioWorldStage from '../experience/PortfolioWorldStage';
import HomePanel from '../panels/HomePanel';
import AboutPanel from '../panels/AboutPanel';
import SkillsPanel from '../panels/SkillsPanel';
import BackgroundPanel from '../panels/BackgroundPanel';
import ProjectsPanel from '../panels/ProjectsPanel';
import CertificatesPanel from '../panels/CertificatesPanel';
import ContactPanel from '../panels/ContactPanel';

export default function PortfolioShell() {
  useEffect(() => {
    document.title = 'Aaron Austin C. Amaro | Full Stack Developer';
  }, []);

  return (
    <div className="portfolio-shell">
      <a className="skip-link" href="#hero">Skip to portfolio content</a>
      <MissionControlNav />
      <div className="portfolio-grid">
        <PortfolioWorldStage />
        <main className="panel-stack">
          <HomePanel />
          <AboutPanel />
          <SkillsPanel />
          <BackgroundPanel />
          <ProjectsPanel />
          <CertificatesPanel />
          <ContactPanel />
          <footer className="site-footer">
            <span>© {new Date().getFullYear()} Aaron Austin C. Amaro</span>
            <span>Built with React + one carefully contained WebGL universe.</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
