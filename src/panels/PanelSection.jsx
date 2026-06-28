import usePortfolioNavigation from '../app/usePortfolioNavigation';
import { SECTION_BY_ID } from '../app/portfolioSections';

export default function PanelSection({
  id,
  title,
  intro,
  className = '',
  children,
}) {
  const { activeSection } = usePortfolioNavigation();
  const section = SECTION_BY_ID.get(id);
  const headingId = `${id}-heading`;

  return (
    <section
      id={id}
      tabIndex="-1"
      aria-labelledby={headingId}
      data-active={activeSection === id}
      className={`portfolio-panel ${className}`}
    >
      <div className="panel-heading">
        <p className="system-label">
          <span>{section?.index}</span>
          {section?.shortLabel}
        </p>
        <h2 id={headingId}>{title}</h2>
        {intro ? <p className="panel-intro">{intro}</p> : null}
      </div>
      {children}
    </section>
  );
}
