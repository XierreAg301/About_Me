import { useState, useRef, useCallback, useEffect } from 'react';
import { CONFIG } from '../../config.js';
import Timeline3DAccent from './Timeline3DAccent';

function lerp(a, b, t) { return a + (b - a) * t; }

function TimelineCard({ project, index, isExpanded, onToggle }) {
  const cardRef = useRef(null);
  const animRef = useRef(null);
  const targetRef = useRef({ rx: 0, ry: 0, glow: 0 });
  const currentRef = useRef({ rx: 0, ry: 0, glow: 0 });

  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const dy = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    targetRef.current = { rx: -dy * 6, ry: dx * 6, glow: 1 };
  }, []);

  const handleMouseLeave = useCallback(() => {
    targetRef.current = { rx: 0, ry: 0, glow: 0 };
  }, []);

  useEffect(() => {
    const tick = () => {
      const c = currentRef.current;
      const t = targetRef.current;
      c.rx = lerp(c.rx, t.rx, 0.1);
      c.ry = lerp(c.ry, t.ry, 0.1);
      c.glow = lerp(c.glow, t.glow, 0.08);

      if (cardRef.current) {
        const el = cardRef.current;
        el.style.transform = isExpanded
          ? 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1.01)'
          : `perspective(800px) rotateX(${c.rx}deg) rotateY(${c.ry}deg) translateZ(${c.glow * 6}px)`;
        const g = el.querySelector('.card-glare');
        if (g) {
          g.style.background = `radial-gradient(circle at ${50 + c.ry * 4}% ${50 - c.rx * 4}%, rgba(0,255,65,0.06) 0%, transparent 65%)`;
          g.style.opacity = c.glow;
        }
      }
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [isExpanded]);

  const handleClick = useCallback(() => {
    onToggle(index);
  }, [onToggle, index]);

  return (
    <div
      ref={cardRef}
      className={`group relative cursor-pointer transition-shadow duration-500 ${
        isExpanded ? 'shadow-[0_0_40px_rgba(0,255,65,0.12)]' : ''
      }`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
    >
      {/* Outer border glow */}
      <div
        className={`absolute inset-0 rounded-2xl border transition-all duration-500 pointer-events-none ${
          isExpanded
            ? 'border-matrix-green/40 shadow-[0_0_20px_rgba(0,255,65,0.15)]'
            : 'border-matrix-border group-hover:border-matrix-green/20'
        }`}
      />

      {/* Card body */}
      <div className={`relative rounded-2xl bg-matrix-card/50 backdrop-blur-sm overflow-hidden transition-all duration-500 ${
        isExpanded
          ? 'bg-matrix-card/70 shadow-[inset_0_1px_0_rgba(0,255,65,0.05)]'
          : 'group-hover:bg-matrix-card/65'
      }`}>
        <div className="card-glare absolute inset-0 rounded-2xl pointer-events-none" style={{ opacity: 0 }} />

        {/* Corner accent */}
        <div className="absolute top-0 right-0 w-10 h-10 pointer-events-none">
          <div className={`absolute top-0 right-0 w-6 h-[2px] transition-all duration-500 ${
            isExpanded ? 'bg-matrix-green/50' : 'bg-matrix-green/20 group-hover:bg-matrix-green/40'
          }`} />
          <div className={`absolute top-0 right-0 h-6 w-[2px] transition-all duration-500 ${
            isExpanded ? 'bg-matrix-green/50' : 'bg-matrix-green/20 group-hover:bg-matrix-green/40'
          }`} />
        </div>

        {/* Content */}
        <div className="p-5 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-[10px] tracking-[0.15em] text-matrix-green/50 bg-matrix-green/5 px-2 py-0.5 rounded">
                  {project.date}
                </span>
                <span className="font-mono text-[10px] tracking-[0.15em] text-matrix-cyan/60">
                  {project.role}
                </span>
              </div>
              <h3 className={`text-lg sm:text-xl font-bold transition-colors duration-300 ${
                isExpanded ? 'text-matrix-green' : 'text-white group-hover:text-matrix-green/90'
              }`}>
                {project.title}
              </h3>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex flex-wrap gap-1">
                {project.technologies.slice(0, 3).map((tech, i) => (
                  <span
                    key={i}
                    className={`px-2 py-0.5 rounded-md font-mono text-[10px] whitespace-nowrap transition-all duration-300 ${
                      isExpanded
                        ? 'bg-matrix-green/10 border-matrix-green/30 text-matrix-green'
                        : 'bg-matrix-green/5 border-matrix-green/15 text-matrix-green/60 group-hover:text-matrix-green/80'
                    } border`}
                  >
                    {tech}
                  </span>
                ))}
                {project.technologies.length > 3 && (
                  <span className="px-2 py-0.5 rounded-md font-mono text-[10px] text-matrix-green/40 border border-matrix-green/10">
                    +{project.technologies.length - 3}
                  </span>
                )}
              </div>

              {/* Expand indicator */}
              <svg
                className={`w-4 h-4 flex-shrink-0 transition-all duration-400 ${
                  isExpanded ? 'text-matrix-green rotate-180' : 'text-white/30 group-hover:text-matrix-green/70'
                }`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Expandable detail */}
          <div
            className={`grid transition-all duration-400 ease-out ${
              isExpanded ? 'grid-rows-[1fr] opacity-100 mt-5' : 'grid-rows-[0fr] opacity-0 mt-0'
            }`}
          >
            <div className="overflow-hidden">
              <div className="pt-4 border-t border-matrix-border">
                {/* Screenshots (render only when images are provided in config) */}
                {Array.isArray(project.images) && project.images.length > 0 && (
                  <div className={`grid gap-3 mb-4 ${project.images.length > 1 ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
                    {project.images.map((img, i) => (
                      <a
                        key={i}
                        href={img}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="group/img relative block aspect-[16/10] overflow-hidden rounded-lg border border-matrix-border bg-matrix-darker
                                 hover:border-matrix-green/40 hover:shadow-[0_4px_20px_rgba(0,255,65,0.15)] transition-all"
                      >
                        <img
                          src={img}
                          alt={`${project.title} screenshot ${i + 1}`}
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105"
                        />
                        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded font-mono text-[9px] tracking-wide bg-matrix-dark/80 text-matrix-green/80 opacity-0 group-hover/img:opacity-100 transition-opacity">
                          OPEN ↗
                        </span>
                      </a>
                    ))}
                  </div>
                )}

                {/* Full tech list */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.technologies.map((tech, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-matrix-green/8 border border-matrix-green/20 text-matrix-green/80 font-mono text-[10px]">
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Description */}
                <ul className="space-y-2.5">
                  {project.description.map((desc, i) => (
                    <li key={i} className="flex gap-3 text-sm text-white/75 leading-relaxed">
                      <span className="text-matrix-green mt-0.5 flex-shrink-0 text-xs">▹</span>
                      <span>{desc}</span>
                    </li>
                  ))}
                </ul>

                {/* Project links (render only when URLs are provided in config) */}
                {(project.repoUrl || project.demoUrl) && (
                  <div className="flex flex-wrap gap-3 mt-5">
                    {project.demoUrl && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono text-[11px] tracking-wide
                                 bg-matrix-green/10 border border-matrix-green/30 text-matrix-green
                                 hover:bg-matrix-green/20 hover:shadow-[0_0_12px_rgba(0,255,65,0.25)] transition-all"
                      >
                        <span aria-hidden="true">▶</span> Live Demo
                      </a>
                    )}
                    {project.repoUrl && (
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono text-[11px] tracking-wide
                                 bg-matrix-card/60 border border-matrix-border text-white/70
                                 hover:text-matrix-green hover:border-matrix-green/30 transition-all"
                      >
                        <span aria-hidden="true">&lt;/&gt;</span> Source
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Projects() {
  const [expandedIndex, setExpandedIndex] = useState(-1);
  const sectionRef = useRef(null);
  const scrollRef = useRef(0);
  const projects = CONFIG.projects;

  const handleToggle = useCallback((index) => {
    setExpandedIndex((prev) => (prev === index ? -1 : index));
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          const rect = section.getBoundingClientRect();
          const sectionHeight = rect.height;
          const viewMid = window.innerHeight / 2;
          const localScroll = (viewMid - rect.top) / sectionHeight;
          scrollRef.current = Math.max(0, Math.min(1, localScroll));
          ticking = false;
        });
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="relative py-16 sm:py-24 px-4 sm:px-6 min-h-screen"
    >
      {/* 3D Accent background */}
      <Timeline3DAccent scrollRef={scrollRef} />

      <div className="relative z-10 max-w-4xl mx-auto px-2 sm:px-6 w-full">

        {/* Section header */}
        <div className="reveal-element flex items-center gap-4 mb-14">
          <span className="font-mono text-matrix-green/40 text-sm tracking-widest">02.</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Projects &amp; Achievements</h2>
          <div className="flex-1 h-[1px] bg-gradient-to-r from-matrix-green/30 to-transparent" />
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline rail */}
          <div className="absolute left-[15px] sm:left-[25px] top-4 bottom-4 w-[2px] rounded-full bg-gradient-to-b from-matrix-green/40 via-matrix-green/20 to-matrix-green/5" />

          <div className="space-y-10 sm:space-y-14">
            {projects.map((project, index) => {
              const isExpanded = expandedIndex === index;
              return (
                <div key={index} className="reveal-element relative pl-10 sm:pl-16">
                  {/* Timeline node */}
                  <div
                    className={`absolute left-[9px] sm:left-[19px] top-6 w-[14px] h-[14px] rounded-full border-2 transition-all duration-500 z-10 ${
                      isExpanded
                        ? 'bg-matrix-green border-matrix-green shadow-[0_0_16px_rgba(0,255,65,0.7)] scale-125'
                        : 'bg-matrix-black border-matrix-green/40 group-hover:border-matrix-green/70 group-hover:shadow-[0_0_8px_rgba(0,255,65,0.3)]'
                    }`}
                  />
                  {/* Node outer ring */}
                  <div
                    className={`absolute left-[5px] sm:left-[15px] top-[22px] w-[22px] h-[22px] rounded-full border transition-all duration-700 pointer-events-none ${
                      isExpanded
                        ? 'border-matrix-green/30 scale-150 opacity-100'
                        : 'border-matrix-green/10 opacity-0 scale-100'
                    }`}
                    style={{ animation: isExpanded ? 'node-ring-pulse 2s ease-out infinite' : 'none' }}
                  />

                  {/* Connector to card */}
                  <div
                    className={`absolute left-[15px] sm:left-[25px] top-[25px] w-[20px] sm:w-[30px] h-[2px] transition-all duration-500 ${
                      isExpanded
                        ? 'bg-gradient-to-r from-matrix-green to-matrix-green/20'
                        : 'bg-gradient-to-r from-matrix-green/20 to-transparent'
                    }`}
                  />

                  <TimelineCard
                    project={project}
                    index={index}
                    isExpanded={isExpanded}
                    onToggle={handleToggle}
                    totalProjects={projects.length}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
