import { useEffect } from 'react';
import MissionControlNav from './MissionControlNav';
import MiniMap from './MiniMap';
import ScrollProgress from './ScrollProgress';
import usePortfolioNavigation from './usePortfolioNavigation';
import { PORTFOLIO_SECTIONS } from './portfolioSections';
import useScrollReveal from '../hooks/useScrollReveal';
import PortfolioWorldStage from '../experience/PortfolioWorldStage';
import HomePanel from '../panels/HomePanel';
import AboutPanel from '../panels/AboutPanel';
import SkillsPanel from '../panels/SkillsPanel';
import BackgroundPanel from '../panels/BackgroundPanel';
import ProjectsPanel from '../panels/ProjectsPanel';
import CertificatesPanel from '../panels/CertificatesPanel';
import ContactPanel from '../panels/ContactPanel';

export default function PortfolioShell() {
  const { isPanelOpen, reportActiveSection } = usePortfolioNavigation();

  // Reveal section content as it scrolls into view.
  useScrollReveal();

  useEffect(() => {
    document.title = 'Aaron Austin C. Amaro | Full Stack Developer';
  }, []);

  // Drive the active section (and the camera tour + mini-map) from scroll
  // position: a section is active while it crosses the viewport centre band.
  useEffect(() => {
    const sections = PORTFOLIO_SECTIONS
      .map((section) => document.getElementById(section.id))
      .filter(Boolean);
    if (!sections.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) reportActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [reportActiveSection]);

  return (
    <div className="portfolio-shell immersive-shell" data-panel-open={isPanelOpen}>
      <a className="skip-link" href="#portfolio-content">Skip to content</a>
      <MissionControlNav />
      <PortfolioWorldStage />
      <MiniMap />
      <ScrollProgress />

      <main id="portfolio-content" className="story-scroll">
        <HomePanel />
        <AboutPanel />
        <SkillsPanel />
        <BackgroundPanel />
        <ProjectsPanel />
        <CertificatesPanel />
        <ContactPanel />
        <footer className="site-footer">
          <span>© {new Date().getFullYear()} Aaron Austin C. Amaro</span>
          <span>React + Three.js interactive node world</span>
        </footer>
      </main>

      <div className="world-corners" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
