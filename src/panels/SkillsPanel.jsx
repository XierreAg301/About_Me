import { CONFIG } from '../../config';
import PanelSection from './PanelSection';

export default function SkillsPanel() {
  return (
    <PanelSection
      id="skills"
      title="Capabilities, grouped by purpose."
      intro="The stack is broad because the systems are connected. These clusters describe where each technology does useful work."
    >
      <div className="skill-grid">
        {CONFIG.skillClusters.map((cluster, index) => (
          <article className="skill-cluster system-card" key={cluster.name}>
            <p className="cluster-index">{String(index + 1).padStart(2, '0')}</p>
            <h3>{cluster.name}</h3>
            <p>{cluster.description}</p>
            <ul aria-label={`${cluster.name} technologies`}>
              {cluster.skills.map((skill) => <li key={skill}>{skill}</li>)}
            </ul>
          </article>
        ))}
      </div>
    </PanelSection>
  );
}
