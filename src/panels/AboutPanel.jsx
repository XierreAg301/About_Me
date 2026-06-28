import { CONFIG } from '../../config';
import usePortfolioNavigation from '../app/usePortfolioNavigation';
import PanelSection from './PanelSection';
import Icon from '../components/Icon';

export default function AboutPanel() {
  const { navigateTo } = usePortfolioNavigation();

  return (
    <PanelSection
      id="about"
      title="Engineering with systems in mind."
      intro="I work where backend development, cybersecurity, intelligent automation, and creative coding overlap."
    >
      <div className="prose-grid">
        <div className="prose-copy">
          <p>{CONFIG.summary}</p>
          <p>
            My strongest work turns interconnected requirements into software people can
            understand and operate—from role-based business workflows to cloud-backed
            emergency tools and procedural game systems.
          </p>
          <p>
            I am building depth through real projects while completing my Computer Science
            degree, with an emphasis on dependable architecture and clear user experiences.
          </p>
        </div>

        <aside className="system-card about-routing" aria-label="Explore related sections">
          <p className="system-label">
            <span className="gem" aria-hidden="true" /> ROUTING OPTIONS
          </p>
          <button type="button" onClick={() => navigateTo('skills', { source: 'panel' })}>
            <span>Technical systems</span>
            <span className="route-target" aria-hidden="true">02 <Icon name="arrow-up-right" size={14} /></span>
          </button>
          <button type="button" onClick={() => navigateTo('background', { source: 'panel' })}>
            <span>Education and journey</span>
            <span className="route-target" aria-hidden="true">03 <Icon name="arrow-up-right" size={14} /></span>
          </button>
        </aside>
      </div>
    </PanelSection>
  );
}
