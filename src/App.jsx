import { useEffect, useState, useRef, useCallback, lazy, Suspense } from 'react';
import Background3D from './components/Background3D';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Certificates from './components/Certificates';
import Footer from './components/Footer';

// Lazy-load the cinematic intro so its video/markup stay out of the initial bundle.
const IntroPortal = lazy(() => import('./components/IntroPortal'));
const INTRO_SEEN_KEY = 'intro_seen_v1';

const sections = [
  { id: 'hero', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'certificates', label: 'Certs' },
  { id: 'contact', label: 'Contact' },
];

function SectionDock({ activeSection }) {
  const handleClick = (e, id) => {
    e.preventDefault();
    const el = id === 'hero' ? document.body : document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <div className="fixed right-5 top-1/2 -translate-y-1/2 z-[200] hidden lg:flex flex-col items-center gap-3">
      {sections.map((s) => {
        const isActive = activeSection === s.id;
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            onClick={(e) => handleClick(e, s.id)}
            className="group relative flex items-center gap-2"
            aria-label={s.label}
          >
            <span className={`font-mono text-[10px] tracking-widest uppercase transition-all duration-300 ${
              isActive ? 'text-matrix-green opacity-100 translate-x-0' : 'text-white/0 opacity-0 translate-x-4'
            } group-hover:text-matrix-green/70 group-hover:opacity-100 group-hover:translate-x-0`}>
              {s.label}
            </span>
            <span className={`w-2.5 h-2.5 rounded-full border transition-all duration-500 ${
              isActive
                ? 'bg-matrix-green border-matrix-green shadow-[0_0_12px_rgba(0,255,65,0.6)] scale-125'
                : 'bg-transparent border-matrix-green/30 group-hover:border-matrix-green/60 group-hover:scale-110'
            }`} />
          </a>
        );
      })}
    </div>
  );
}

export default function App() {
  const [, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('hero');
  const [showIntro, setShowIntro] = useState(
    () => typeof window !== 'undefined' && !sessionStorage.getItem(INTRO_SEEN_KEY)
  );

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
    try { sessionStorage.setItem(INTRO_SEEN_KEY, '1'); } catch { /* storage may be unavailable */ }
  }, []);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const scrollRef = useRef(0);
  const curtainRef = useRef(null);

  useEffect(() => {
    document.title = 'Aaron Austin C. Amaro | Full Stack Developer';

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.reveal-element').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let currentSection = 'hero';

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            if (sectionId && sectionId !== currentSection) {
              currentSection = sectionId;
              setActiveSection(sectionId || 'hero');

              if (curtainRef.current) {
                curtainRef.current.classList.remove('stream-animate');
                void curtainRef.current.offsetWidth;
                curtainRef.current.classList.add('stream-animate');
              }

              const contentContainer = document.getElementById('main-content-wrapper');
              if (contentContainer) {
                contentContainer.classList.remove('decrypt-animate');
                void contentContainer.offsetWidth;
                contentContainer.classList.add('decrypt-animate');
              }
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    document.querySelectorAll('section').forEach((el) => sectionObserver.observe(el));
    return () => sectionObserver.disconnect();
  }, []);

  const onMouse = useCallback((e) => {
    mouseRef.current = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight };
  }, []);

  useEffect(() => {
    let ticking = false;
    const updateProgress = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const next = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      scrollRef.current = next;
      setScrollProgress(Math.min(1, Math.max(0, next)));
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateProgress);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mousemove', onMouse, { passive: true });
    updateProgress();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', onMouse);
    };
  }, [onMouse]);

  return (
    <div className="relative min-h-screen bg-matrix-black text-matrix-text overflow-x-hidden">

      {showIntro && (
        <Suspense fallback={<div className="fixed inset-0 z-[300] bg-matrix-black" />}>
          <IntroPortal onComplete={handleIntroComplete} />
        </Suspense>
      )}

      <Background3D mouseRef={mouseRef} scrollRef={scrollRef} />

      {/* Ambient depth glow orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-matrix-green/4 blur-[140px]" />
        <div className="absolute bottom-1/3 -right-20 w-64 h-64 rounded-full bg-matrix-cyan/3 blur-[100px]" />
        <div className="absolute top-2/3 left-1/3 w-48 h-48 rounded-full bg-matrix-green/3 blur-[80px]" />
      </div>

      <Navbar />

      {/* Section indicator dock */}
      <SectionDock activeSection={activeSection} />

      <div className="relative z-10">
        <div id="main-content-wrapper" className="w-full h-full">
          <Hero />
          <About />
          <Projects />
          <Certificates />
          <Footer />
        </div>
      </div>

      <div ref={curtainRef} className="data-stream-overlay" aria-hidden="true">
        <div className="data-stream-log text-right">
          <div>[SYS] Fetching data block...</div>
          <div className="animate-pulse opacity-50">&gt; decrypting_payload</div>
        </div>
      </div>
    </div>
  );
}
