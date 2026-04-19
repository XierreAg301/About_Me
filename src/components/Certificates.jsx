import React from 'react';
import { CONFIG } from '../../config.js';

export default function Certificates() {
  if (!CONFIG.certificates || CONFIG.certificates.length === 0) return null;

  return (
    <section id="certificates" className="relative py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-12">
          <span className="font-mono text-matrix-green text-sm">04.</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Certificates</h2>
          <div className="flex-1 h-[1px] bg-gradient-to-r from-matrix-green/30 to-transparent" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CONFIG.certificates.map((cert, index) => (
            <a
              key={index}
              href={cert.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col rounded-xl border border-matrix-border bg-matrix-card/50 overflow-hidden transition-all duration-500 hover:border-matrix-green/40 hover:shadow-card-hover hover:-translate-y-2"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-matrix-darker">
                {cert.imageUrl && (
                  <>
                    <img src={cert.imageUrl} alt={cert.title} referrerPolicy="no-referrer" loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-matrix-dark/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <svg className="w-8 h-8 text-matrix-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span className="font-mono text-matrix-green text-xs tracking-widest uppercase">View Certificate</span>
                    </div>
                  </>
                )}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-matrix-green/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </div>

              <div className="p-4 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-white group-hover:text-matrix-green transition-colors duration-300 line-clamp-2">
                  {cert.title}
                </span>
                <svg className="w-4 h-4 text-matrix-text-muted flex-shrink-0 transition-all duration-300 group-hover:text-matrix-green group-hover:translate-x-1 group-hover:-translate-y-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
