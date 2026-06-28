import { useState } from 'react';
import { CONFIG } from '../../config';
import PanelSection from './PanelSection';

function CertificateImage({ certificate }) {
  const [failed, setFailed] = useState(false);
  if (failed || !certificate.imageUrl) {
    return (
      <div className="certificate-fallback" aria-hidden="true">
        <span>VERIFIED</span>
      </div>
    );
  }

  return (
    <img
      src={certificate.imageUrl}
      alt=""
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}

export default function CertificatesPanel() {
  return (
    <PanelSection
      id="certificates"
      title="Credential vault."
      intro="Focused learning that supports the larger engineering story: automation, cybersecurity, and web delivery."
    >
      <div className="certificate-grid">
        {CONFIG.certificates.map((certificate, index) => (
          <a
            className="certificate-card"
            href={certificate.url}
            target="_blank"
            rel="noopener noreferrer"
            key={certificate.title}
          >
            <div className="certificate-image">
              <CertificateImage certificate={certificate} />
            </div>
            <div>
              <p className="system-label">CREDENTIAL {String(index + 1).padStart(2, '0')}</p>
              <h3>{certificate.title}</h3>
              <span className="text-link">Open certificate ↗</span>
            </div>
          </a>
        ))}
      </div>
    </PanelSection>
  );
}
