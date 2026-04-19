import React, { useEffect } from 'react';
import MatrixRain from './components/MatrixRain';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Certificates from './components/Certificates';
import Footer from './components/Footer';

export default function App() {
  useEffect(() => {
    document.title = 'Aaron Austin C. Amaro | Full Stack Developer';

    // Scroll reveal observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.reveal-element').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative min-h-screen bg-matrix-black text-matrix-text overflow-x-hidden">
      {/* Matrix rain background */}
      <MatrixRain />

      {/* Ambient glow orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-matrix-green/5 blur-[120px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-cyan-500/3 blur-[120px]" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Certificates />
        <Footer />
      </div>
    </div>
  );
}
