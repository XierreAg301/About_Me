import React, { useState } from 'react';
import { CONFIG } from '../../config.js';

function ProjectCard({ project, index }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative p-6 rounded-xl border border-matrix-border bg-matrix-card/50 backdrop-blur-sm transition-all duration-500 hover:border-matrix-green/40 hover:bg-matrix-card hover:shadow-card-hover hover:-translate-y-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        {/* Folder icon */}
        <div className="w-12 h-12 rounded-lg bg-matrix-green/10 border border-matrix-green/20 flex items-center justify-center text-matrix-green transition-colors duration-300 group-hover:bg-matrix-green/20 group-hover:border-matrix-green/40">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        </div>

        {/* Featured badge */}
        {project.featured && (
          <span className="font-mono text-xs text-matrix-green/60 border border-matrix-green/20 px-2 py-0.5 rounded-full">
            Featured
          </span>
        )}
      </div>

      {/* Title & Role */}
      <h3 className="text-lg font-bold text-white mb-1 group-hover:text-matrix-green transition-colors duration-300">
        {project.title}
      </h3>
      <p className="text-matrix-green/70 font-mono text-xs mb-1">{project.role}</p>
      <p className="text-matrix-text-dim font-mono text-xs mb-4">{project.date}</p>

      {/* Description */}
      <ul className="space-y-2 mb-6">
        {project.description.slice(0, 2).map((desc, i) => (
          <li key={i} className="flex gap-2 text-sm text-matrix-text-muted leading-relaxed">
            <span className="text-matrix-green mt-1 flex-shrink-0 text-xs">▹</span>
            <span className="line-clamp-2">{desc}</span>
          </li>
        ))}
      </ul>

      {/* Tech tags */}
      <div className="flex flex-wrap gap-1.5 mt-auto">
        {project.technologies.map((tech, i) => (
          <span key={i} className="text-matrix-green/70 font-mono text-[11px]">
            {tech}{i < project.technologies.length - 1 && <span className="text-matrix-text-dim ml-1.5">·</span>}
          </span>
        ))}
      </div>

      {/* Scan line animation on hover */}
      {isHovered && (
        <div
          className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-matrix-green/30 to-transparent pointer-events-none"
          style={{ animation: 'scanLine 2s linear infinite' }}
        />
      )}

      {/* Corner brackets */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-matrix-green/0 group-hover:border-matrix-green/30 transition-colors duration-500" />
      <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-matrix-green/0 group-hover:border-matrix-green/30 transition-colors duration-500" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-matrix-green/0 group-hover:border-matrix-green/30 transition-colors duration-500" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-matrix-green/0 group-hover:border-matrix-green/30 transition-colors duration-500" />
    </div>
  );
}

export default function Projects() {
  return (
    <section id="projects" className="relative py-24">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section header */}
        <div className="flex items-center gap-4 mb-4">
          <span className="font-mono text-matrix-green text-sm">03.</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Projects</h2>
          <div className="flex-1 h-[1px] bg-gradient-to-r from-matrix-green/30 to-transparent" />
        </div>

        <p className="text-matrix-text-muted mb-12 max-w-2xl">
          A selection of projects I've built — from automated systems and game engines to API integrations and cloud architectures.
        </p>

        {/* Project grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CONFIG.projects.map((project, index) => (
            <ProjectCard key={index} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
