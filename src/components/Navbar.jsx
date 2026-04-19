import React, { useState, useEffect } from 'react';

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Experience', href: '#experience' },
  { label: 'Projects', href: '#projects' },
  { label: 'Certificates', href: '#certificates' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      // Determine active section
      const sections = navLinks.map(l => l.href.replace('#', ''));
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.getBoundingClientRect().top <= 150) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-matrix-dark/90 backdrop-blur-xl border-b border-matrix-green/10 shadow-matrix'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="font-mono text-matrix-green text-lg tracking-wider hover:text-white transition-colors duration-300 group"
        >
          <span className="text-matrix-green/50 group-hover:text-matrix-green transition-colors">&gt;_</span>
          {' '}aaron
          <span className="animate-blink text-matrix-green">|</span>
        </a>

        {/* Desktop Links */}
        <ul className="hidden md:flex items-center gap-1">
          {navLinks.map((link, i) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`relative px-4 py-2 font-mono text-sm tracking-wide transition-all duration-300 rounded-lg group ${
                  activeSection === link.href.replace('#', '')
                    ? 'text-matrix-green'
                    : 'text-matrix-text-muted hover:text-matrix-green'
                }`}
              >
                <span className="text-matrix-green/50 text-xs mr-1">0{i + 1}.</span>
                {link.label}
                <span
                  className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-matrix-green transition-all duration-300 rounded-full ${
                    activeSection === link.href.replace('#', '') ? 'w-3/4' : 'w-0 group-hover:w-1/2'
                  }`}
                />
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile burger */}
        <button
          className="md:hidden text-matrix-green p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ${
          mobileOpen ? 'max-h-96 border-b border-matrix-green/10' : 'max-h-0'
        }`}
      >
        <div className="bg-matrix-dark/95 backdrop-blur-xl px-6 py-4 space-y-2">
          {navLinks.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="block font-mono text-sm text-matrix-text-muted hover:text-matrix-green transition-colors py-2"
            >
              <span className="text-matrix-green/50 mr-2">0{i + 1}.</span>
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
