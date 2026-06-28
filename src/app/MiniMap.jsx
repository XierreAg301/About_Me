import { PORTFOLIO_CONNECTIONS, SECTION_BY_ID } from './portfolioSections';
import NodeNavigator from '../experience/NodeNavigator';
import usePortfolioNavigation from './usePortfolioNavigation';

/**
 * Persistent mini-map. The full-screen node map was reduced to this compact HUD
 * tile in the corner: it shows the connected network, highlights the section in
 * view as a scroll progress indicator, and lets visitors jump between sections.
 */
export default function MiniMap() {
  const { activeSection } = usePortfolioNavigation();
  const activeMeta = SECTION_BY_ID.get(activeSection);

  return (
    <aside className="mini-map" aria-label="Portfolio network map">
      <div className="mini-map-head">
        <span className="mini-map-title">NODE MAP</span>
        <span className="mini-map-active">
          {activeMeta?.index} / {activeMeta?.shortLabel}
        </span>
      </div>
      <div className="mini-map-grid">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="mini-link" x1="0" x2="1">
              <stop offset="0" stopColor="#f3b73d" stopOpacity=".15" />
              <stop offset=".5" stopColor="#9270ff" stopOpacity=".6" />
              <stop offset="1" stopColor="#f3b73d" stopOpacity=".15" />
            </linearGradient>
          </defs>
          {PORTFOLIO_CONNECTIONS.map(([sourceId, targetId]) => {
            const source = SECTION_BY_ID.get(sourceId).mapPosition;
            const target = SECTION_BY_ID.get(targetId).mapPosition;
            return (
              <line
                key={`${sourceId}-${targetId}`}
                x1={source[0]}
                y1={source[1]}
                x2={target[0]}
                y2={target[1]}
                stroke="url(#mini-link)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>
        <NodeNavigator />
      </div>
      <p id="map-instructions" className="mini-map-hint">
        Select a node or scroll to travel the network.
      </p>
    </aside>
  );
}
