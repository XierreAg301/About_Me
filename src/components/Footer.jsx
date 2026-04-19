import React from 'react';
import { CONFIG } from '../../config.js';

export default function Footer() {
  return (
    <footer id="contact" className="relative py-24 border-t border-matrix-border">
      <div className="max-w-6xl mx-auto px-6">
        {/* Big CTA */}
        <div className="text-center mb-16">
          <p className="font-mono text-matrix-green text-sm mb-4">05. What's Next?</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Get In Touch</h2>
          <p className="text-matrix-text-muted max-w-lg mx-auto mb-8 leading-relaxed">
            I'm currently looking for new opportunities. Whether you have a question, a project idea, or just want to say hi — my inbox is always open.
          </p>

          <a
            href={`mailto:${CONFIG.email}`}
            className="group relative inline-flex items-center gap-3 px-10 py-4 font-mono text-sm text-matrix-green border border-matrix-green/30 rounded-lg transition-all duration-300 hover:bg-matrix-green/10 hover:border-matrix-green/60 hover:shadow-matrix-glow overflow-hidden"
          >
            <span className="relative z-10">Say Hello</span>
            <svg className="relative z-10 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-matrix-green/10 to-transparent" />
          </a>
        </div>

        {/* Contact info */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12 text-sm font-mono text-matrix-text-muted">
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-matrix-green/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {CONFIG.email}
          </span>
          <span className="hidden sm:inline text-matrix-text-dim">•</span>
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-matrix-green/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {CONFIG.phoneDisplay}
          </span>
        </div>

        {/* Social links */}
        <div className="flex items-center justify-center gap-6 mb-12">
          {CONFIG.socials.map((social) => (
            <a
              key={social.platform}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-matrix-text-muted hover:text-matrix-green transition-all duration-300 hover:-translate-y-1"
              aria-label={social.platform}
            >
              <span className="font-mono text-xs">{social.platform}</span>
            </a>
          ))}
        </div>

        {/* Copyright */}
        <div className="text-center">
          <p className="font-mono text-xs text-matrix-text-dim">
            <span className="text-matrix-green/30">&lt;</span>
            {' '}Built by{' '}
            <a href={CONFIG.socials.find(s => s.icon === 'github')?.url || '#'} target="_blank" rel="noopener noreferrer" className="text-matrix-text-muted hover:text-matrix-green transition-colors">
              {CONFIG.name}
            </a>
            {' '}
            <span className="text-matrix-green/30">/&gt;</span>
          </p>
          <p className="font-mono text-xs text-matrix-text-dim mt-1">
            &copy; {new Date().getFullYear()} All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
