import React from 'react';
import { CONFIG } from '../../config.js';

export default function Experience() {
  return (
    <section id="experience" className="relative py-24">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section header */}
        <div className="flex items-center gap-4 mb-12">
          <span className="font-mono text-matrix-green text-sm">02.</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Experience</h2>
          <div className="flex-1 h-[1px] bg-gradient-to-r from-matrix-green/30 to-transparent" />
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-0 md:left-[180px] top-0 bottom-0 w-[1px] bg-gradient-to-b from-matrix-green/40 via-matrix-green/20 to-transparent" />

          <div className="space-y-12">
            {CONFIG.projects.map((project, index) => (
              <div
                key={index}
                className="group relative grid md:grid-cols-[180px_1fr] gap-4 md:gap-8"
              >
                {/* Date column */}
                <div className="relative font-mono text-sm text-matrix-text-muted pt-1 md:text-right">
                  <span className="relative z-10">{project.date}</span>
                  {/* Timeline dot */}
                  <div className="absolute right-0 md:-right-[12.5px] top-2 w-[8px] h-[8px] rounded-full bg-matrix-dark border-2 border-matrix-green/50 group-hover:border-matrix-green group-hover:shadow-matrix-glow transition-all duration-300 hidden md:block" />
                  {/* Glow on active */}
                  <div className="absolute right-0 md:-right-[16.5px] top-0 w-[16px] h-[16px] rounded-full bg-matrix-green/0 group-hover:bg-matrix-green/20 transition-all duration-500 hidden md:block" />
                </div>

                {/* Content card */}
                <div className="relative p-6 rounded-xl border border-matrix-border bg-matrix-card/50 backdrop-blur-sm transition-all duration-500 hover:border-matrix-green/30 hover:bg-matrix-card hover:shadow-card-hover group-hover:-translate-y-1 ml-6 md:ml-0">
                  {/* Role & Title */}
                  <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-matrix-green transition-colors duration-300">
                    {project.role}
                  </h3>
                  <p className="text-matrix-green/80 font-mono text-sm mb-4 flex items-center gap-2">
                    {project.title}
                    <svg className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </p>

                  {/* Description bullets */}
                  <ul className="space-y-2 mb-4">
                    {project.description.map((desc, i) => (
                      <li key={i} className="flex gap-3 text-sm text-matrix-text-muted leading-relaxed">
                        <span className="text-matrix-green mt-1.5 flex-shrink-0">▹</span>
                        {desc}
                      </li>
                    ))}
                  </ul>

                  {/* Tech tags */}
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, i) => (
                      <span key={i} className="tech-tag text-[11px]">
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Corner decoration */}
                  <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-matrix-green/0 group-hover:border-matrix-green/30 transition-colors duration-500 rounded-tr-xl" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-matrix-green/0 group-hover:border-matrix-green/30 transition-colors duration-500 rounded-bl-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
