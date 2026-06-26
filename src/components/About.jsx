import React, { useState, useEffect, useRef } from 'react';
import { CONFIG } from '../../config.js';

const SKILL_CATEGORIES = {
  'Frontend': ['JavaScript', 'TypeScript', 'React', 'Next.js', 'HTML & CSS', 'Tailwind CSS'],
  'Backend':  ['Node.js', 'PHP', 'Laravel', 'Java', 'Python', 'C#', 'REST APIs'],
  'Platforms': ['Git', 'PostgreSQL', 'Firebase', 'Supabase', 'Google Cloud'],
  'Creative': ['Unity', 'p5.js', 'Cybersecurity'],
};

function AnimatedCounter({ target, label, suffix }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const duration = 1200;
          const step = (timestamp) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            setCount(Math.floor(progress * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          obs.unobserve(el);
        }
      },
      { threshold: 0.6 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-center">
      <p className="text-2xl sm:text-3xl font-bold font-mono text-matrix-green tabular-nums">
        {count}{suffix}
      </p>
      <p className="text-xs text-white/50 tracking-widest uppercase mt-1">{label}</p>
    </div>
  );
}

const TERMINAL_COMMANDS = [
  { cmd: 'whoami', out: 'Full Stack Developer & Cybersecurity Specialist' },
  { cmd: 'uname -r', out: 'Computer Science · University Of Caloocan City' },
  { cmd: 'uptime', out: 'Building software since 2022' },
  { cmd: 'cat skills.txt | head -5', out: 'React · Node.js · PHP · Python · C#' },
  { cmd: 'ls projects/', out: '4 repositories and counting...' },
];

function InteractiveTerminal() {
  const [lines, setLines] = useState([]);
  const [cmdIndex, setCmdIndex] = useState(0);
  const [typing, setTyping] = useState('');
  const [phase, setPhase] = useState('typingCmd'); // typingCmd | showOut | waiting
  const timerRef = useRef(null);

  useEffect(() => {
    if (cmdIndex >= TERMINAL_COMMANDS.length) {
      setLines((prev) => [...prev, { type: 'cmd', text: '' }, { type: 'prompt' }]);
      return;
    }
    const entry = TERMINAL_COMMANDS[cmdIndex];

    const tick = () => {
      if (phase === 'typingCmd') {
        setTyping((prev) => {
          const next = prev + entry.cmd.charAt(prev.length);
          if (next.length >= entry.cmd.length) {
            setPhase('waitReturn');
            return next;
          }
          return next;
        });
      } else if (phase === 'waitReturn') {
        setLines((prev) => [...prev, { type: 'cmd', text: `$ ${entry.cmd}` }]);
        setTyping('');
        setPhase('showOut');
      } else if (phase === 'showOut') {
        setLines((prev) => [...prev, { type: 'out', text: entry.out }]);
        setPhase('nextCmd');
      } else if (phase === 'nextCmd') {
        setPhase('typingCmd');
        setCmdIndex((prev) => prev + 1);
      }
    };

    const delay = phase === 'waitReturn' ? 200 : phase === 'showOut' ? 100 : phase === 'nextCmd' ? 600 : 35;
    timerRef.current = setTimeout(tick, delay);
    return () => clearTimeout(timerRef.current);
  }, [cmdIndex, phase, typing]);

  return (
    <div className="terminal-3d p-4 sm:p-5 rounded-xl bg-matrix-darker border border-matrix-border font-mono text-[11px] sm:text-xs">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-matrix-border">
        <div className="w-3 h-3 rounded-full bg-red-500/70" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
        <div className="w-3 h-3 rounded-full bg-green-500/70" />
        <span className="ml-2 text-white/30 text-[10px] tracking-wider">neural-terminal — aaron@matrix</span>
      </div>
      <div className="space-y-1 min-h-[120px]">
        {lines.map((line, i) => {
          if (line.type === 'cmd') {
            return <p key={i} className="text-matrix-green">{line.text}</p>;
          }
          if (line.type === 'out') {
            return <p key={i} className="text-white/70 pl-2">{line.text}</p>;
          }
          if (line.type === 'prompt') {
            return (
              <p key={i} className="text-matrix-green">
                <span className="text-blue-400">~</span>$ <span className="animate-blink inline-block w-2 h-4 bg-matrix-green ml-0.5 align-middle" />
              </p>
            );
          }
          return null;
        })}
        {phase === 'typingCmd' && (
          <p className="text-matrix-green">
            <span className="text-blue-400">~</span>$ {typing}
            <span className="animate-blink inline-block w-[6px] h-[14px] bg-matrix-green ml-0.5 align-middle" />
          </p>
        )}
        {lines.length === 0 && phase === 'typingCmd' && (
          <p className="text-matrix-green">
            <span className="text-blue-400">~</span>$ {typing}
            <span className="animate-blink inline-block w-[6px] h-[14px] bg-matrix-green ml-0.5 align-middle" />
          </p>
        )}
      </div>
    </div>
  );
}

export default function About() {
  const summary = CONFIG.summary;
  return (
    <section id="about" className="relative py-16 sm:py-24 px-4 sm:px-6 min-h-screen flex items-center">
      <div className="max-w-6xl mx-auto px-2 sm:px-6 w-full">

        {/* ── Section Header ── */}
        <div className="reveal-element flex items-center gap-4 mb-10">
          <span className="font-mono text-matrix-green/40 text-sm tracking-widest">01.</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">About Me</h2>
          <div className="flex-1 h-[1px] bg-gradient-to-r from-matrix-green/30 to-transparent" />
        </div>

        {/* ── Stats Banner ── */}
        <div className="reveal-element grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-12">
          {[
            { target: CONFIG.projects.length, label: 'Projects Built', suffix: '' },
            { target: CONFIG.skills.length, label: 'Technologies', suffix: '+' },
            { target: CONFIG.certificates.length, label: 'Certifications', suffix: '' },
            { target: 3, label: 'Focus Areas', suffix: '' },
          ].map((stat, i) => (
            <div
              key={i}
              className="group relative p-4 rounded-xl border border-matrix-border bg-matrix-card/40 backdrop-blur-sm
                         transition-all duration-300 hover:border-matrix-green/30 hover:bg-matrix-card/60 hover:-translate-y-1
                         hover:shadow-[0_8px_30px_rgba(0,255,65,0.08)]"
            >
              <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute top-0 right-0 w-4 h-[1px] bg-matrix-green/30" />
                <div className="absolute top-0 right-0 h-4 w-[1px] bg-matrix-green/30" />
              </div>
              <AnimatedCounter target={stat.target} label={stat.label} suffix={stat.suffix} />
            </div>
          ))}
        </div>

        {/* ── Main Content: Bio + Skills ── */}
        <div className="grid lg:grid-cols-[5fr_4fr] gap-10 lg:gap-16">

          {/* ── Left Column: Bio + Timeline ── */}
          <div className="space-y-8">

            {/* Bio card */}
            <div className="reveal-element relative p-5 sm:p-6 rounded-xl border border-matrix-border bg-matrix-card/30 backdrop-blur-sm
                          transition-all duration-300 hover:border-matrix-green/20 hover:bg-matrix-card/50
                          hover:shadow-[0_0_40px_rgba(0,255,65,0.06)]">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-matrix-green animate-pulse" />
                <h3 className="font-mono text-matrix-green text-xs tracking-[0.2em] uppercase">Who I Am</h3>
              </div>
              <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                {summary.split('. ').map((sentence, i, arr) => (
                  <React.Fragment key={i}>
                    <span>{sentence}{i < arr.length - 1 ? '.' : ''}</span>
                    {i < arr.length - 1 && (
                      <>
                        <br /><br />
                      </>
                    )}
                  </React.Fragment>
                ))}
              </p>
            </div>

            {/* Journey mini-timeline */}
            <div className="reveal-element">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-2 h-2 rounded-full bg-matrix-green" />
                <h3 className="font-mono text-matrix-green text-xs tracking-[0.2em] uppercase">The Journey</h3>
              </div>
              <div className="relative pl-6 border-l border-matrix-green/20 space-y-5">
                {[
                  { year: '2022', title: 'Started Computer Science', desc: 'Began BSCS at University of Caloocan City' },
                  { year: '2023', title: 'Full Stack Foundation', desc: 'Mastered React, Node.js, and cloud platforms' },
                  { year: '2024', title: 'Cybersecurity & AI', desc: 'Expanded into security, AI agent development' },
                  { year: '2025', title: 'Production Systems', desc: 'Built procurement & emergency systems at scale' },
                ].map((item, i) => (
                  <div key={i} className="group relative">
                    <div className="absolute -left-[29px] top-1 w-3 h-3 rounded-full border-2 border-matrix-green/40 bg-matrix-black
                                  group-hover:border-matrix-green group-hover:bg-matrix-green/20 group-hover:shadow-[0_0_10px_rgba(0,255,65,0.5)]
                                  transition-all duration-300" />
                    <span className="font-mono text-[10px] text-matrix-green/40 tracking-widest">{item.year}</span>
                    <h4 className="text-sm font-semibold text-white mt-0.5 group-hover:text-matrix-green transition-colors">{item.title}</h4>
                    <p className="text-xs text-white/50 mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Education / Background */}
            <div id="background" className="reveal-element scroll-mt-24">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-matrix-cyan" />
                <h3 className="font-mono text-matrix-cyan/80 text-xs tracking-[0.2em] uppercase">Education</h3>
              </div>
              {CONFIG.education.map((ed, i) => (
                <div
                  key={i}
                  className="group flex items-center gap-4 p-4 rounded-xl border border-matrix-border bg-matrix-card/40
                           transition-all duration-300 hover:border-matrix-green/20 hover:bg-matrix-card/60 hover:-translate-y-0.5
                           hover:shadow-[0_4px_20px_rgba(0,255,65,0.06)]"
                >
                  <div className="w-10 h-10 rounded-full bg-matrix-green/5 border border-matrix-green/20 flex items-center justify-center flex-shrink-0 overflow-hidden
                                group-hover:border-matrix-green/40 group-hover:shadow-[0_0_12px_rgba(0,255,65,0.2)] transition-all">
                    {CONFIG.universityLogo ? (
                      <img src={CONFIG.universityLogo} alt={ed.school} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-4 h-4 text-matrix-green" fill="currentColor" viewBox="0 0 576 512">
                        <path d="M48 195.8l209.2 86.1c9.8 4 20.2 6.1 30.8 6.1s21-2.1 30.8-6.1l242.4-99.8c9-3.7 14.8-12.4 14.8-22.1s-5.8-18.4-14.8-22.1L318.8 38.1C309 34.1 298.6 32 288 32s-21 2.1-30.8 6.1L14.8 137.9C5.8 141.6 0 150.3 0 160L0 456c0 13.3 10.7 24 24 24s24-10.7 24-24l0-260.2zm48 71.7L96 384c0 53 86 96 192 96s192-43 192-96l0-116.6-142.9 58.9c-15.6 6.4-32.2 9.7-49.1 9.7s-33.5-3.3-49.1-9.7L96 267.4z"/>
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{ed.degree}</p>
                    <p className="text-white/50 text-xs mt-0.5">{ed.school}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right Column: Skills + Terminal ── */}
          <div className="space-y-8">
            {/* Categorized skills */}
            <div id="skills" className="reveal-element space-y-5 scroll-mt-24">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-matrix-green" />
                <h3 className="font-mono text-matrix-green text-xs tracking-[0.2em] uppercase">Tech Stack</h3>
              </div>
              {Object.entries(SKILL_CATEGORIES).map(([category, skillList], ci) => {
                const owned = CONFIG.skills.filter((s) => skillList.includes(s));
                if (owned.length === 0) return null;
                return (
                  <div key={category} style={{ animationDelay: `${ci * 80}ms` }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] text-white/40 tracking-wider">{category}</span>
                      <span className="font-mono text-[10px] text-matrix-green/50">{owned.length}/{skillList.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {owned.map((skill, i) => (
                        <span
                          key={skill}
                          className="skill-chip-3d tech-tag cursor-default"
                          style={{ '--delay': `${(ci * owned.length + i) * 20}ms` }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    {owned.length > 0 && (
                      <div className="mt-2 h-[2px] rounded-full bg-matrix-border overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-matrix-green/60 to-matrix-cyan/40 transition-all duration-1000"
                          style={{ width: `${(owned.length / skillList.length) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Interactive Terminal */}
            <div className="reveal-element">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-matrix-cyan animate-pulse" />
                <h3 className="font-mono text-matrix-cyan/80 text-xs tracking-[0.2em] uppercase">Live Terminal</h3>
              </div>
              <InteractiveTerminal />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
