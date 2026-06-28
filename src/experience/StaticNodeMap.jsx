import {
  PORTFOLIO_CONNECTIONS,
  PORTFOLIO_SECTIONS,
  SECTION_BY_ID,
} from '../app/portfolioSections';

/**
 * Decorative fallback backdrop shown when WebGL is unavailable or reduced
 * motion is requested. Navigation is handled by the persistent mini-map, so
 * this layer is purely visual (no interactive nodes).
 */
export default function StaticNodeMap({ reason = 'fallback' }) {
  return (
    <div className="static-node-map" data-reason={reason} aria-hidden="true">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="static-link" x1="0" x2="1">
            <stop offset="0" stopColor="#f3b73d" stopOpacity=".12" />
            <stop offset=".5" stopColor="#9270ff" stopOpacity=".55" />
            <stop offset="1" stopColor="#f3b73d" stopOpacity=".12" />
          </linearGradient>
        </defs>
        <g className="static-globe">
          <circle cx="50" cy="50" r="18" />
          <ellipse cx="50" cy="50" rx="18" ry="6" />
          <ellipse cx="50" cy="50" rx="18" ry="11.5" />
          <ellipse cx="50" cy="50" rx="6" ry="18" />
          <ellipse cx="50" cy="50" rx="11.5" ry="18" />
        </g>
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
        {PORTFOLIO_SECTIONS.map((section) => (
          <circle
            key={section.id}
            cx={section.mapPosition[0]}
            cy={section.mapPosition[1]}
            r={section.priority === 'featured' ? 1.6 : 1}
            fill={section.color}
            opacity="0.85"
          />
        ))}
      </svg>
    </div>
  );
}
