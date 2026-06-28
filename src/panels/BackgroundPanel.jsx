import { useState } from 'react';
import { CONFIG } from '../../config';
import PanelSection from './PanelSection';

export default function BackgroundPanel() {
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <PanelSection
      id="background"
      title="A foundation built through practice."
      intro="Formal study and project work have progressed together, each year adding a new layer to how I design and deliver systems."
    >
      <div className="education-card system-card">
        <div className="education-mark">
          {!logoFailed && CONFIG.universityLogo ? (
            <img
              src={CONFIG.universityLogo}
              alt=""
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <span aria-hidden="true">UCC</span>
          )}
        </div>
        <div>
          <p className="system-label">CURRENT EDUCATION</p>
          {CONFIG.education.map((item) => (
            <div key={item.degree}>
              <h3>{item.degree}</h3>
              <p>{item.school}</p>
            </div>
          ))}
        </div>
      </div>

      <ol className="journey-list">
        {CONFIG.journey.map((item) => (
          <li key={item.year}>
            <div className="journey-year">{item.year}</div>
            <div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </PanelSection>
  );
}
