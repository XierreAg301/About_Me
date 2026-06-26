import { useState, useEffect, useRef, useCallback } from 'react';
import { CONFIG } from '../../config.js';
import HeroProfile3D from './HeroProfile3D';

/* ── Typing Effect ─────────────────────────────────────────── */
function TypingEffect({ texts }) {
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    const currentText = texts[textIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(currentText.substring(0, charIndex + 1));
        setCharIndex(charIndex + 1);
        if (charIndex + 1 === currentText.length) setTimeout(() => setIsDeleting(true), 2000);
      } else {
        setDisplayText(currentText.substring(0, charIndex - 1));
        setCharIndex(charIndex - 1);
        if (charIndex === 0) {
          setIsDeleting(false);
          setTextIndex((textIndex + 1) % texts.length);
        }
      }
    }, isDeleting ? 30 : 80);
    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, textIndex, texts]);

  return (
    <span className="font-mono">
      {displayText}
      <span className="animate-blink text-matrix-green ml-0.5 font-bold">|</span>
    </span>
  );
}

/* ── 3D Tilt Card (Mouse-tracking CSS perspective) ─────────── */
function TiltCard({ children, className = '', intensity = 12 }) {
  const cardRef = useRef(null);
  const animRef = useRef(null);
  const targetRef = useRef({ rx: 0, ry: 0 });
  const currentRef = useRef({ rx: 0, ry: 0 });

  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    targetRef.current = { rx: -dy * intensity, ry: dx * intensity };
  }, [intensity]);

  const handleMouseLeave = useCallback(() => {
    targetRef.current = { rx: 0, ry: 0 };
  }, []);

  useEffect(() => {
    const animate = () => {
      const t = currentRef.current;
      const target = targetRef.current;
      t.rx += (target.rx - t.rx) * 0.12;
      t.ry += (target.ry - t.ry) * 0.12;
      if (cardRef.current) {
        cardRef.current.style.transform = `perspective(900px) rotateX(${t.rx}deg) rotateY(${t.ry}deg) translateZ(0)`;
        const glare = cardRef.current.querySelector('.tilt-glare');
        if (glare) {
          const glareX = 50 + t.ry * 2;
          const glareY = 50 - t.rx * 2;
          glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(0,255,65,0.07) 0%, transparent 65%)`;
        }
      }
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div
      ref={cardRef}
      className={`tilt-card ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
    >
      {children}
      <div className="tilt-glare absolute inset-0 rounded-xl pointer-events-none transition-all duration-200" />
    </div>
  );
}

/* ── Hero ───────────────────────────────────────────────────── */
export default function Hero() {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);
  const highlightedProjects = CONFIG.projects.slice(0, 3);

  // Occasional glitch on the name
  useEffect(() => {
    const trigger = () => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 300);
    };
    const interval = setInterval(trigger, 4000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="hero" className="relative min-h-screen flex items-center pt-20 px-4 sm:px-6">

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 w-full xl:px-12">
        <div className="grid lg:grid-cols-[1fr_520px] gap-8 lg:gap-20 items-center">

          {/* ── Left: Text ── */}
          <div className="order-2 lg:order-1 hero-text-enter">
            <p className="font-mono text-matrix-green text-sm mb-4 tracking-wider opacity-80">
              <span className="text-matrix-green/40">&gt;</span> Hello, World! My name is
            </p>

            {/* Name with glitch effect */}
            <h1 className={`text-3xl sm:text-5xl lg:text-6xl font-bold text-white mb-3 leading-tight hero-name ${glitchActive ? 'glitch-active' : ''}`}>
              {CONFIG.name.split(' ').slice(0, 2).join(' ')}
              <br />
              <span className="text-matrix-green hero-name-accent">
                {CONFIG.name.split(' ').slice(2).join(' ')}
              </span>
            </h1>

            <div className="text-2xl sm:text-3xl lg:text-4xl text-matrix-green mb-5 h-12 sm:h-14">
              <TypingEffect texts={CONFIG.roles} />
            </div>

            <p className="text-white/75 text-base leading-relaxed max-w-lg mb-6">
              {CONFIG.summary.substring(0, 170)}...{' '}
              <a
                href="#about"
                onClick={(e) => { e.preventDefault(); document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="read-more-link"
              >
                read more
              </a>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 hero-buttons">
              <a
                href={CONFIG.resumeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary-3d"
              >
                <span className="relative z-10 font-semibold tracking-wide">See My Resume</span>
                <svg className="relative z-10 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <div className="btn-primary-3d-shine" />
              </a>

              <a
                href="#contact"
                onClick={(e) => { e.preventDefault(); document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="btn-ghost-3d font-mono text-[15px] font-bold"
              >
                Contact Me
              </a>
            </div>

            {/* Status bar */}
            <div className="mt-8 flex items-center gap-3 font-mono text-xs text-white/40">
              <span className="inline-block w-2 h-2 rounded-full bg-matrix-green animate-pulse" />
              <span>Available for new opportunities</span>
            </div>
          </div>

          {/* ── Right: Photo + Projects ── */}
          <div className="order-1 lg:order-2 flex flex-col items-center w-full">

            {/* Profile — 3D hover tilt */}
            <div className="animate-float">
              <TiltCard className="mb-10 relative" intensity={8}>
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 z-10 shrink-0">
                <HeroProfile3D />
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-matrix-green/30 shadow-[0_0_40px_rgba(0,255,65,0.2)] relative z-[1]">
                  {CONFIG.avatar ? (
                    <img
                      src={CONFIG.avatar}
                      alt={CONFIG.name}
                      referrerPolicy="no-referrer"
                      className={`w-full h-full object-cover transition-all duration-700 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
                      onLoad={() => setImageLoaded(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-matrix-card">
                      <span className="text-matrix-green font-mono text-6xl">A</span>
                    </div>
                  )}
                </div>
              </div>
              </TiltCard>
            </div>

            {/* Project Highlights */}
            <div className="w-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-[1px] w-12 bg-matrix-green/50" />
                <h3 className="font-mono text-sm uppercase tracking-[0.2em] text-matrix-green/80 whitespace-nowrap">Project Highlights</h3>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-matrix-green/50 to-transparent" />
              </div>

              <div className="relative pl-10 space-y-3 game-selection-container">
                <div className="absolute left-[10px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-matrix-green/40 via-matrix-green/20 to-transparent" />
                {highlightedProjects.map((project, i) => (
                  <div key={project.title} className={`game-card-wrapper ${i % 2 === 0 ? 'animate-float-delayed' : 'animate-float-slow'}`}>
                    <TiltCard
                    intensity={5}
                    className="group block relative border border-transparent hover:border-matrix-green/30 p-4 rounded-xl bg-matrix-card/20 hover:bg-matrix-card/50 cursor-pointer"
                  >
                    <a
                      href="#projects"
                      onClick={(e) => { e.preventDefault(); document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' }); }}
                      className="block"
                    >
                      <div className="absolute top-[28px] left-[-35px] w-3 h-3 rounded-full bg-matrix-card border-[2px] border-matrix-green/70 group-hover:bg-matrix-green group-hover:shadow-matrix-glow transition-all duration-300" />
                      <p className="text-lg font-bold text-white leading-snug group-hover:text-matrix-green transition-colors">{project.title}</p>
                      <p className="font-mono text-sm text-white/70 mt-1 group-hover:text-matrix-green/80 transition-colors">{project.role}</p>
                    </a>
                    </TiltCard>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
