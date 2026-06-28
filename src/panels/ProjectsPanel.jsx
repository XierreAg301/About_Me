import { useState } from 'react';
import { CONFIG } from '../../config';
import PanelSection from './PanelSection';

function assetUrl(url) {
  if (!url?.startsWith('/')) return url;
  return `${import.meta.env.BASE_URL}${url.slice(1)}`;
}

function ProjectImageLink({ image, projectTitle, imageIndex }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  const source = assetUrl(image);
  return (
    <a href={source} target="_blank" rel="noopener noreferrer">
      <img
        src={source}
        alt={`${projectTitle} screenshot ${imageIndex + 1}`}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </a>
  );
}

export default function ProjectsPanel() {
  const projects = [...CONFIG.projects].sort((left, right) =>
    Number(right.featured) - Number(left.featured)
  );

  return (
    <PanelSection
      id="projects"
      title="Selected missions and system outcomes."
      intro="Each project is a record of the role I held, the technical decisions I owned, and the working result."
      className="projects-panel"
    >
      <div className="project-list">
        {projects.map((project, index) => (
          <article
            className={`project-card ${project.featured ? 'project-card-featured' : ''}`}
            key={project.title}
          >
            <div className="project-rail" aria-hidden="true">
              <span>{String(index + 1).padStart(2, '0')}</span>
            </div>
            <div className="project-content">
              <div className="project-meta">
                <span>{project.featured ? 'PRIORITY MISSION' : 'MISSION ARCHIVE'}</span>
                <time>{project.date}</time>
              </div>
              <h3>{project.title}</h3>
              <p className="project-role">{project.role}</p>

              <ul className="technology-list" aria-label={`${project.title} technologies`}>
                {project.technologies.map((technology) => (
                  <li key={technology}>{technology}</li>
                ))}
              </ul>

              <div className="project-details">
                <div>
                  <p className="detail-label">CONTRIBUTION</p>
                  <ul>
                    {project.description.map((detail) => <li key={detail}>{detail}</li>)}
                  </ul>
                </div>
                <div className="outcome-block">
                  <p className="detail-label">OUTCOME</p>
                  <p>{project.outcome}</p>
                </div>
              </div>

              {project.images?.length ? (
                <div className="project-media">
                  {project.images.map((image, imageIndex) => (
                    <ProjectImageLink
                      image={image}
                      projectTitle={project.title}
                      imageIndex={imageIndex}
                      key={image}
                    />
                  ))}
                </div>
              ) : null}

              {project.demoUrl || project.repoUrl ? (
                <div className="project-links">
                  {project.demoUrl ? (
                    <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                      Live deployment
                    </a>
                  ) : null}
                  {project.repoUrl ? (
                    <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                      Source repository
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </PanelSection>
  );
}
