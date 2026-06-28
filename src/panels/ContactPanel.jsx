import { CONFIG } from '../../config';
import PanelSection from './PanelSection';

export default function ContactPanel() {
  const linkedIn = CONFIG.socials.find((social) => social.icon === 'linkedin');
  const github = CONFIG.socials.find((social) => social.icon === 'github');
  const secondarySocials = CONFIG.socials.filter(
    (social) => !['linkedin', 'github'].includes(social.icon)
  );

  return (
    <PanelSection
      id="contact"
      title="Let’s build something useful."
      intro={CONFIG.availability}
      className="contact-panel"
    >
      <div className="contact-primary system-card">
        <p className="system-label">PRIMARY CHANNEL</p>
        <a className="contact-email" href={`mailto:${CONFIG.email}`}>
          {CONFIG.email}
        </a>
        <p>
          Send the problem, role, or collaboration idea. A clear first message is
          enough to open the channel.
        </p>
      </div>

      <div className="contact-grid">
        {linkedIn ? (
          <a href={linkedIn.url} target="_blank" rel="noopener noreferrer">
            <span>LinkedIn</span><span aria-hidden="true">↗</span>
          </a>
        ) : null}
        {github ? (
          <a href={github.url} target="_blank" rel="noopener noreferrer">
            <span>GitHub</span><span aria-hidden="true">↗</span>
          </a>
        ) : null}
        <a href={`tel:${CONFIG.phone}`}>
          <span>Phone</span><span>{CONFIG.phoneDisplay}</span>
        </a>
        <a href={CONFIG.resumeLink} target="_blank" rel="noopener noreferrer">
          <span>Résumé</span><span aria-hidden="true">↗</span>
        </a>
      </div>

      {secondarySocials.length ? (
        <div className="secondary-socials" aria-label="More social profiles">
          {secondarySocials.map((social) => (
            <a href={social.url} target="_blank" rel="noopener noreferrer" key={social.platform}>
              {social.platform}
            </a>
          ))}
        </div>
      ) : null}
    </PanelSection>
  );
}
