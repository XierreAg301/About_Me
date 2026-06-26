import { useState, useEffect } from 'react';

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Background', href: '#background' },
  { label: 'Projects', href: '#projects' },
  { label: 'Certificates', href: '#certificates' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [systemTime, setSystemTime] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      // Determine active section
      const sections = navLinks.map(l => l.href.replace('#', ''));
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.getBoundingClientRect().top <= window.innerHeight / 2) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Matrix clock
    const timer = setInterval(() => {
      const now = new Date();
      setSystemTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0').charAt(0)}`);
    }, 100);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(timer);
    };
  }, []);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setMobileOpen(false);
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 font-mono pointer-events-none ${
      scrolled ? 'pt-4 sm:pt-6' : 'pt-6 sm:pt-10'
    }`}>
      {/* Outer wrapper controls the width & hovering aesthetic */}
      <div className={`mx-auto transition-all duration-700 ease-out pointer-events-auto ${
        scrolled ? 'max-w-5xl px-4' : 'max-w-7xl px-6 sm:px-12'
      }`}>
        <div className={`relative flex items-center justify-between rounded-xl overflow-hidden transition-all duration-700 ${
          scrolled 
            ? 'bg-matrix-darker/80 backdrop-blur-md border border-matrix-green/30 shadow-[0_8px_32px_rgba(0,255,65,0.15)] px-6 py-3'
            : 'bg-transparent border border-transparent px-2 py-2'
        }`}>
          
          {/* Animated Matrix scanline behind navbar */}
          {scrolled && (
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(transparent_50%,rgba(0,255,65,0.25)_50%)] bg-[length:100%_4px]" />
          )}

          {/* HUD Connection Status (Top Left HUD Element) */}
          <div className={`absolute -top-3 left-6 px-2 bg-[#050b06] border border-matrix-green/40 text-[9px] text-matrix-green flex items-center gap-2 rounded shadow-matrix transition-opacity duration-500 ${scrolled ? 'opacity-100' : 'opacity-0'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-matrix-green animate-pulse" />
            <span className="tracking-[0.2em]">UPLINK_SECURE</span>
          </div>

          {/* HUD Time Status (Top Right HUD Element) */}
          <div className={`absolute -bottom-3 right-6 px-2 bg-[#050b06] border border-matrix-green/40 text-[9px] text-matrix-green/80 flex items-center gap-2 rounded shadow-matrix transition-opacity duration-500 hidden sm:flex ${scrolled ? 'opacity-100' : 'opacity-0'}`}>
            <span className="tracking-[0.2em]">SYS.T: {systemTime}</span>
          </div>

          {/* Logo area */}
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="relative flex items-center gap-2 text-matrix-green group z-10"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded bg-matrix-green/10 border border-matrix-green/30 group-hover:border-matrix-green group-hover:bg-matrix-green/20 group-hover:shadow-[0_0_15px_rgba(0,255,65,0.4)] transition-all duration-300">
              <span className="font-bold text-sm tracking-tighter">&gt;_</span>
            </div>
            <span className="text-sm tracking-widest font-semibold text-white/80 group-hover:text-white transition-colors uppercase">
              Aaron.A
            </span>
          </a>

          {/* Desktop Links */}
          <ul className="hidden md:flex items-center gap-1 z-10">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.replace('#', '');
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className={`relative flex items-center px-4 py-2 text-xs tracking-widest uppercase transition-all duration-300 group overflow-hidden rounded-md ${
                      isActive 
                        ? 'text-matrix-green bg-matrix-green/10 font-bold' 
                        : 'text-white/50 hover:text-matrix-green hover:bg-matrix-green/5'
                    }`}
                  >
                    {/* Bracket styling for active state */}
                    <span className={`transition-all duration-300 mr-2 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0'}`}>[</span>
                    {link.label}
                    <span className={`transition-all duration-300 ml-2 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 group-hover:opacity-50 group-hover:translate-x-0'}`}>]</span>
                    
                    {/* Bottom active underline */}
                    <span className={`absolute bottom-0 left-0 h-[2px] bg-matrix-green shadow-[0_0_10px_rgba(0,255,65,0.8)] transition-all duration-300 ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-1/2'
                    }`} />
                  </a>
                </li>
              );
            })}
          </ul>

          {/* Mobile burger */}
          <button
            className="md:hidden relative z-10 text-matrix-green p-2 border border-transparent hover:border-matrix-green/30 rounded transition-all"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile HUD Menu */}
      <div
        className={`md:hidden absolute top-full left-4 right-4 mt-2 overflow-hidden transition-all duration-500 rounded-xl pointer-events-auto ${
          mobileOpen ? 'max-h-96 opacity-100 shadow-[0_10px_40px_rgba(0,255,65,0.2)]' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-matrix-darker/95 backdrop-blur-xl border border-matrix-green/30 p-2">
          {navLinks.map((link) => {
            const isActive = activeSection === link.href.replace('#', '');
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`block font-mono text-xs tracking-widest uppercase transition-colors py-4 px-6 rounded hover:bg-matrix-green/10 border-l-2 ${
                  isActive ? 'border-matrix-green text-matrix-green bg-matrix-green/5' : 'border-transparent text-white/60 hover:text-matrix-green'
                }`}
              >
                {isActive ? `> ${link.label}` : link.label}
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
