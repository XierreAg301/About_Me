export default function StaticNodeMap({ reason = 'fallback' }) {
  return (
    <div className="static-node-map static-globe-fallback" data-reason={reason} aria-hidden="true">
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
    </div>
  );
}
