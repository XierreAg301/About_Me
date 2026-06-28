import { CONFIG } from '../../config';
import PanelSection from './PanelSection';
import Icon from '../components/Icon';

const CLUSTER_ICON = {
  Frontend: 'code',
  Backend: 'server',
  'AI / Agents': 'cpu',
  Cybersecurity: 'shield',
  'Cloud / Data': 'cloud',
  'Creative / Game Development': 'gamepad',
};

const CLUSTER_GEM = ['gold', 'red', 'violet', 'green', 'gold', 'red'];

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
            <div className="cluster-head">
              <span className="cluster-icon" aria-hidden="true">
                <Icon name={CLUSTER_ICON[cluster.name] || 'layers'} size={18} />
              </span>
              <h3>
                <span className="gem" data-gem={CLUSTER_GEM[index % CLUSTER_GEM.length]} aria-hidden="true" />
                {cluster.name}
              </h3>
            </div>
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
