import { useEffect, useRef, useState, useCallback } from 'react';
import { CONFIG } from '../../config.js';

const INTRO_VIDEO_URL = `${import.meta.env.BASE_URL}media/intro.mp4`;
const TAKEOVER_AT_SECONDS = 6.45;
const END_CARD_HOLD_MS = 4300;
const SAFETY_TIMEOUT_MS = 18000;

const BOOT_LINES = [
  'establishing encrypted uplink...',
  'spoofing trace route...',
  'injecting portfolio shell...',
  `operator: ${CONFIG.name.toUpperCase()}`,
  'press enter to initiate',
];

export default function IntroPortal({ onComplete }) {
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const [phase, setPhase] = useState('boot'); // boot | playing
  const [bootText, setBootText] = useState('');
  const [bootReady, setBootReady] = useState(false);
  const [endCardVisible, setEndCardVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  const videoRef = useRef(null);
  const doneRef = useRef(false);
  const endCardTimerRef = useRef(null);

  const showStatic = prefersReduced || videoFailed;
  const wordmark = CONFIG.name.replace(' C. ', ' ').toUpperCase();
  const fullBootText = BOOT_LINES.map((line, index) => `${index === BOOT_LINES.length - 1 ? '>' : '$'} ${line}`).join('\n');

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    if (endCardTimerRef.current) window.clearTimeout(endCardTimerRef.current);
    setLeaving(true);
    window.setTimeout(() => onComplete?.(), 600);
  }, [onComplete]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => () => {
    if (endCardTimerRef.current) window.clearTimeout(endCardTimerRef.current);
  }, []);

  useEffect(() => {
    if (prefersReduced) {
      setBootText(fullBootText);
      setBootReady(true);
      return;
    }

    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setBootText(fullBootText.slice(0, index));
      if (index >= fullBootText.length) {
        window.clearInterval(timer);
        setBootReady(true);
      }
    }, 18);

    return () => window.clearInterval(timer);
  }, [fullBootText, prefersReduced]);

  const startIntro = useCallback(() => {
    if (phase !== 'boot' || !bootReady) return;
    if (showStatic) {
      finish();
      return;
    }

    setPhase('playing');
    setEndCardVisible(false);

    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.muted = false;
    video.volume = 0.85;
    const playAttempt = video.play();
    if (playAttempt && typeof playAttempt.catch === 'function') {
      playAttempt.catch(() => {
        video.muted = true;
        video.play().catch(() => setVideoFailed(true));
      });
    }
  }, [bootReady, finish, phase, showStatic]);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || endCardVisible) return;
    if (video.currentTime >= TAKEOVER_AT_SECONDS) {
      setEndCardVisible(true);
      endCardTimerRef.current = window.setTimeout(finish, END_CARD_HOLD_MS);
    }
  }, [endCardVisible, finish]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const timer = window.setTimeout(finish, SAFETY_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [finish, phase]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') finish();
      if (event.key === 'Enter') startIntro();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [finish, startIntro]);

  return (
    <div
      className={`fixed inset-0 z-[300] overflow-hidden bg-black transition-opacity duration-500 ${
        leaving ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={`Intro - ${CONFIG.name}`}
      onClick={phase === 'boot' ? startIntro : undefined}
    >
      {!showStatic && (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-out"
          style={{ opacity: phase === 'playing' && !endCardVisible ? 1 : 0 }}
          src={INTRO_VIDEO_URL}
          muted
          playsInline
          preload="auto"
          onTimeUpdate={handleTimeUpdate}
          onEnded={finish}
          onError={() => setVideoFailed(true)}
        />
      )}

      {showStatic && (
        <div className="absolute inset-0 bg-matrix-gradient">
          <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(rgba(0,255,65,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.6)_1px,transparent_1px)] bg-[length:44px_44px]" />
        </div>
      )}

      {phase === 'boot' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,65,0.22),transparent_35%),linear-gradient(rgba(0,255,65,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.08)_1px,transparent_1px)] bg-[length:100%_100%,42px_42px,42px_42px]" />
          <div className="relative z-10 w-[min(86vw,760px)] border border-matrix-green/30 bg-black/72 p-6 font-mono shadow-[0_0_48px_rgba(0,255,65,0.13)] backdrop-blur-sm sm:p-8">
            <div className="mb-5 flex items-center justify-between border-b border-matrix-green/15 pb-3 text-[10px] uppercase tracking-[0.28em] text-matrix-green/55">
              <span>root@aaron-portfolio</span>
              <span>secure shell</span>
            </div>
            <pre className="min-h-[9rem] whitespace-pre-wrap text-sm leading-relaxed text-matrix-green sm:text-base">
              {bootText}
              {!bootReady && <span className="animate-pulse">_</span>}
              {bootReady && <span className="animate-pulse"> _</span>}
            </pre>
            {bootReady && (
              <button
                onClick={(event) => { event.stopPropagation(); startIntro(); }}
                autoFocus
                className="mt-7 inline-flex items-center gap-3 rounded-md border border-matrix-green/45 bg-matrix-green/10 px-5 py-3 text-xs uppercase tracking-[0.3em] text-matrix-green transition-all hover:bg-matrix-green/20 hover:shadow-[0_0_24px_rgba(0,255,65,0.26)] focus:outline-none focus:ring-2 focus:ring-matrix-green/60 sm:text-sm"
              >
                Initiate <span aria-hidden="true">&gt;</span>
              </button>
            )}
          </div>
        </div>
      )}

      {endCardVisible && (
        <div className="intro-end-card pointer-events-none absolute inset-0">
          <div className="intro-end-takeover absolute inset-0" />
          <div className="intro-end-halo absolute left-1/2 top-1/2 h-[46vmax] w-[46vmax] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl" />
          <div className="intro-end-scan absolute inset-0" />

          <div className="intro-end-lockup absolute left-1/2 top-1/2 flex w-[min(82vw,780px)] -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-6 sm:gap-8">
            <div
              className="intro-end-logo relative flex aspect-square w-[clamp(4.6rem,12vw,7.4rem)] shrink-0 items-center justify-center rounded-full border border-[#e4c55a]/70 bg-black/35 shadow-[0_0_34px_rgba(245,91,58,0.34)]"
              aria-hidden="true"
            >
              <div className="absolute inset-[-0.5rem] rounded-full border border-[#ef514b]/30" />
              <div className="absolute inset-[-0.85rem] rounded-full border border-[#e4c55a]/18" />
              <span className="bg-gradient-to-r from-[#ffe16b] via-[#9fea71] to-[#ff6f9f] bg-clip-text font-mono text-[clamp(2.25rem,5.4vw,4rem)] font-black leading-none text-transparent">
                AA
              </span>
            </div>

            <div className="min-w-0">
              <div className="intro-end-wordmark bg-gradient-to-r from-[#ffe16b] via-[#ff9a71] to-[#ff4f92] bg-clip-text font-mono text-[clamp(1.45rem,4.6vw,3.55rem)] font-black leading-none text-transparent">
                {wordmark}
              </div>
              <div className="intro-end-tagline mt-3 font-mono text-[clamp(0.68rem,1.6vw,1rem)] uppercase tracking-[0.34em] text-[#d8c5bd]/72">
                Systems / Security / AI
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={(event) => { event.stopPropagation(); finish(); }}
        aria-label="Skip intro"
        className="absolute bottom-5 right-5 z-20 inline-flex items-center gap-2 rounded-md border border-matrix-green/30 bg-black/45 px-4 py-2 font-mono text-[11px] tracking-[0.25em] text-white/70 uppercase backdrop-blur-sm transition-all hover:border-matrix-green/60 hover:text-matrix-green focus:outline-none focus:ring-2 focus:ring-matrix-green/60"
      >
        Skip <span aria-hidden="true">&gt;&gt;</span>
      </button>

      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_180px_60px_rgba(0,0,0,0.85)]" />
    </div>
  );
}
