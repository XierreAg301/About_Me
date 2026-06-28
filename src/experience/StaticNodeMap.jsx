import {
  PORTFOLIO_CONNECTIONS,
  SECTION_BY_ID,
} from '../app/portfolioSections';
import NodeNavigator from './NodeNavigator';

export default function StaticNodeMap({ reason = 'fallback' }) {
  return (
    <div className="static-node-map" data-reason={reason}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="static-link" x1="0" x2="1">
            <stop offset="0" stopColor="#30e8ff" stopOpacity=".12" />
            <stop offset=".5" stopColor="#8057ff" stopOpacity=".55" />
            <stop offset="1" stopColor="#30e8ff" stopOpacity=".12" />
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
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>
      <NodeNavigator />
    </div>
  );
}
