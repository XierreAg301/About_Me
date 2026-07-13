import {
  PORTFOLIO_CONNECTIONS,
  PORTFOLIO_SECTIONS,
  SECTION_BY_ID,
} from '../app/portfolioSections';
import { nodePresentationFor } from '../app/nodePresentation';

function StaticGlobe() {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="fallback-earth" cx="38%" cy="28%">
          <stop offset="0" stopColor="#f2f1ea" />
          <stop offset=".28" stopColor="#b9bcc4" />
          <stop offset=".58" stopColor="#9e0e24" />
          <stop offset="1" stopColor="#31040b" />
        </radialGradient>
      </defs>
      <g className="static-globe">
        <circle cx="50" cy="49" r="25" fill="url(#fallback-earth)" />
        <ellipse cx="50" cy="49" rx="25" ry="8" />
        <ellipse cx="50" cy="49" rx="25" ry="16" />
        <ellipse cx="50" cy="49" rx="8" ry="25" />
        <ellipse cx="50" cy="49" rx="16" ry="25" />
      </g>
      <g className="static-orbits">
        <ellipse cx="50" cy="49" rx="38" ry="12" transform="rotate(-12 50 49)" />
        <ellipse cx="50" cy="49" rx="39" ry="15" transform="rotate(48 50 49)" />
        <ellipse cx="50" cy="49" rx="37" ry="11" transform="rotate(112 50 49)" />
      </g>
    </svg>
  );
}

function StaticArtifacts({ activeSection, viewMode }) {
  const pageMode = viewMode === 'page';
  const sections = pageMode
    ? PORTFOLIO_SECTIONS.filter(({ id }) => id === activeSection)
    : PORTFOLIO_SECTIONS;

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none">
      {!pageMode ? <g className="static-artifact-links">
        {PORTFOLIO_CONNECTIONS.map(([sourceId, targetId]) => {
          const source = SECTION_BY_ID.get(sourceId);
          const target = SECTION_BY_ID.get(targetId);
          return (
            <line
              key={`${sourceId}-${targetId}`}
              x1={source.mapPosition[0]}
              y1={source.mapPosition[1]}
              x2={target.mapPosition[0]}
              y2={target.mapPosition[1]}
            />
          );
        })}
      </g> : null}
      <g className="static-artifact-nodes">
        {sections.map((section) => (
          <g
            key={section.id}
            className={section.id === activeSection ? 'is-active' : undefined}
            transform={`translate(${section.mapPosition[0]} ${section.mapPosition[1]})`}
          >
            <circle
              r={section.priority === 'featured' ? 4.2 : 2.9}
              style={{ fill: nodePresentationFor(section.id).accent }}
            />
            <circle className="static-artifact-ring" r={section.priority === 'featured' ? 6.2 : 4.6} />
          </g>
        ))}
      </g>
    </svg>
  );
}

export default function StaticNodeMap({
  reason = 'fallback',
  phase = 'globe',
  activeSection = 'hero',
  viewMode = 'map',
}) {
  const network = phase === 'network';
  return (
    <div
      className={`static-node-map ${network ? 'static-artifact-fallback' : 'static-globe-fallback'}`}
      data-reason={reason}
      data-view={viewMode}
      aria-hidden="true"
    >
      {network ? (
        <StaticArtifacts activeSection={activeSection} viewMode={viewMode} />
      ) : <StaticGlobe />}
    </div>
  );
}
