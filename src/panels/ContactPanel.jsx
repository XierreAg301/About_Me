import { CONFIG } from '../../config';
import PanelSection from './PanelSection';
import Icon from '../components/Icon';

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
        <p className="system-label">
          <span className="gem" data-gem="green" aria-hidden="true" /> PRIMARY CHANNEL
        </p>
        <a className="contact-email" href={`mailto:${CONFIG.email}`}>
          <Icon name="mail" size={22} />
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
            <span><Icon name="linkedin" size={16} /> LinkedIn</span>
            <Icon name="arrow-up-right" size={14} />
          </a>
        ) : null}
        {github ? (
          <a href={github.url} target="_blank" rel="noopener noreferrer">
            <span><Icon name="github" size={16} /> GitHub</span>
            <Icon name="arrow-up-right" size={14} />
          </a>
        ) : null}
        <a href={`tel:${CONFIG.phone}`}>
          <span><Icon name="phone" size={16} /> Phone</span>
          <span>{CONFIG.phoneDisplay}</span>
        </a>
        <a href={CONFIG.resumeLink} target="_blank" rel="noopener noreferrer">
          <span><Icon name="file-text" size={16} /> Résumé</span>
          <Icon name="arrow-up-right" size={14} />
        </a>
      </div>

      {secondarySocials.length ? (
        <div className="secondary-socials" aria-label="More social profiles">
          {secondarySocials.map((social) => (
            <a href={social.url} target="_blank" rel="noopener noreferrer" key={social.platform}>
              <Icon name={social.icon} size={15} />
              {social.platform}
            </a>
          ))}
        </div>
      ) : null}
    </PanelSection>
  );
}
