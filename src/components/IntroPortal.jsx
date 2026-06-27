import { useEffect, useRef, useState, useCallback } from 'react';
import { CONFIG } from '../../config.js';

const INTRO_VIDEO_URL = `${import.meta.env.BASE_URL}media/intro.mp4`;
const TRANSITION_VIDEO_URL = `${import.meta.env.BASE_URL}media/light-speed-transition.mp4`;
const TRANSITION_AT_SECONDS = 7;
const FADE_AT_SECONDS = 8.5;
const SAFETY_TIMEOUT_MS = 15000;

const BOOT_TRANSCRIPT = [
  'Microsoft Windows [Version 10.0.26100.4061]',
  '(c) Microsoft Corporation. All rights reserved.',
  '',
  'C:\\Users\\Aaron>portfolio.exe --secure',
  '[OK] Secure uplink established',
  '[OK] Neural viewport calibrated',
  '[OK] Portfolio nodes mapped',
  `[OK] Identity verified: ${CONFIG.name.toUpperCase()}`,
  '',
].join('\n');

export default function IntroPortal({ onComplete }) {
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const [phase, setPhase] = useState('boot');
  const [bootText, setBootText] = useState('');
  const [bootReady, setBootReady] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [transitionFailed, setTransitionFailed] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [startQueued, setStartQueued] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const dialogRef = useRef(null);
  const enterButtonRef = useRef(null);
  const videoRef = useRef(null);
  const transitionVideoRef = useRef(null);
  const transitionStartedRef = useRef(false);
  const leavingRef = useRef(false);
  const doneRef = useRef(false);
  const previousOverflowRef = useRef('');
  const showStatic = prefersReduced || videoFailed;
  const canEnter = bootReady && (videoReady || showStatic);

  const complete = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    onComplete?.();
  }, [onComplete]);

  const beginVisualExit = useCallback((keepAudioPlaying = false) => {
    if (leavingRef.current) return;
    leavingRef.current = true;
    setLeaving(true);
    document.body.style.overflow = previousOverflowRef.current;
    window.requestAnimationFrame(() => {
      document.getElementById('hero')?.focus({ preventScroll: true });
    });

    if (!keepAudioPlaying) {
      window.setTimeout(complete, 700);
    }
  }, [complete]);

  const skipIntro = useCallback(() => {
    videoRef.current?.pause();
    transitionVideoRef.current?.pause();
    beginVisualExit(false);
  }, [beginVisualExit]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    previousOverflowRef.current = previousOverflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    if (prefersReduced) {
      setBootText(BOOT_TRANSCRIPT);
      setBootReady(true);
      return undefined;
    }

    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setBootText(BOOT_TRANSCRIPT.slice(0, index));
      if (index >= BOOT_TRANSCRIPT.length) {
        window.clearInterval(timer);
        setBootReady(true);
      }
    }, 9);

    return () => window.clearInterval(timer);
  }, [prefersReduced]);

  useEffect(() => {
    if (phase === 'boot') {
      enterButtonRef.current?.focus({ preventScroll: true });
    }
  }, [phase]);

  const startIntro = useCallback(() => {
    if (phase !== 'boot') return;
    if (!canEnter) {
      setStartQueued(true);
      return;
    }

    if (showStatic) {
      skipIntro();
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    setPhase('playing');
    transitionStartedRef.current = false;
    video.currentTime = 0;
    video.muted = !soundEnabled;
    video.volume = 0.35;

    const transitionVideo = transitionVideoRef.current;
    if (transitionVideo) {
      transitionVideo.preload = 'auto';
      transitionVideo.load();
    }

    const playAttempt = video.play();
    if (playAttempt && typeof playAttempt.catch === 'function') {
      playAttempt.catch(() => {
        video.muted = true;
        setSoundEnabled(false);
        video.play().catch(() => setVideoFailed(true));
      });
    }
  }, [canEnter, phase, showStatic, skipIntro, soundEnabled]);

  useEffect(() => {
    if (startQueued && canEnter && phase === 'boot') {
      startIntro();
    }
  }, [canEnter, phase, startIntro, startQueued]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((enabled) => {
      const next = !enabled;
      if (videoRef.current) {
        videoRef.current.muted = !next;
        videoRef.current.volume = 0.35;
      }
      return next;
    });
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (
      video.currentTime >= TRANSITION_AT_SECONDS &&
      !transitionStartedRef.current &&
      !transitionFailed
    ) {
      const transitionVideo = transitionVideoRef.current;
      if (transitionVideo) {
        transitionStartedRef.current = true;
        transitionVideo.currentTime = 0;
        transitionVideo
          .play()
          .then(() => setPhase('transition'))
          .catch(() => {
            transitionStartedRef.current = false;
            setTransitionFailed(true);
          });
      }
    }

    if (video.currentTime >= FADE_AT_SECONDS) {
      beginVisualExit(true);
    }
  }, [beginVisualExit, transitionFailed]);

  useEffect(() => {
    if (phase === 'boot') return undefined;
    const timer = window.setTimeout(complete, SAFETY_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [complete, phase]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (leavingRef.current) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        skipIntro();
        return;
      }

      if (event.key === 'Enter' && phase === 'boot') {
        event.preventDefault();
        startIntro();
        return;
      }

      if (event.key.toLowerCase() === 's' && phase === 'boot') {
        event.preventDefault();
        skipIntro();
        return;
      }

      if (event.key.toLowerCase() === 'm' && !showStatic) {
        event.preventDefault();
        toggleSound();
        return;
      }

      if (event.key !== 'Tab') return;
      const focusable = Array.from(
        dialogRef.current?.querySelectorAll('button:not([disabled])') ?? []
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phase, showStatic, skipIntro, startIntro, toggleSound]);

  const handleIntroEnded = useCallback(() => {
    if (!leavingRef.current) {
      beginVisualExit(false);
      return;
    }
    complete();
  }, [beginVisualExit, complete]);

  return (
    <div
      ref={dialogRef}
      className={`intro-portal fixed inset-0 z-[300] overflow-hidden bg-black ${
        leaving ? 'intro-portal-leaving pointer-events-none' : ''
      }`}
      role={leaving ? undefined : 'dialog'}
      aria-modal={leaving ? undefined : 'true'}
      aria-hidden={leaving ? 'true' : undefined}
      aria-label={`Command Prompt portfolio intro for ${CONFIG.name}`}
    >
      <div className="intro-ambient" aria-hidden="true" />

      {!showStatic && (
        <>
          <video
            ref={videoRef}
            className={`intro-video ${phase === 'playing' ? 'is-visible' : ''}`}
            src={INTRO_VIDEO_URL}
            muted={!soundEnabled}
            playsInline
            preload="auto"
            onCanPlay={() => setVideoReady(true)}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleIntroEnded}
            onError={() => setVideoFailed(true)}
          />
          <video
            ref={transitionVideoRef}
            className={`intro-transition-video ${phase === 'transition' ? 'is-visible' : ''}`}
            src={TRANSITION_VIDEO_URL}
            muted
            playsInline
            preload="metadata"
            onError={() => setTransitionFailed(true)}
          />
        </>
      )}

      {phase === 'boot' && (
        <div className="intro-boot">
          <section className="intro-cmd-window" aria-label="Command Prompt">
            <header className="intro-cmd-titlebar" aria-hidden="true">
              <div className="intro-cmd-title">
                <span className="intro-cmd-icon">C:\</span>
                <span>Command Prompt</span>
              </div>
              <div className="intro-cmd-window-controls">
                <span>—</span>
                <span>□</span>
                <span>×</span>
              </div>
            </header>

            <div className="intro-cmd-body">
              <pre className="intro-terminal" aria-hidden="true">
                {bootText}
                {!bootReady && <span className="intro-cursor">_</span>}
              </pre>

              <div className="intro-command-menu">
                <p>
                  <span className="intro-command-path">C:\Users\Aaron&gt;</span>
                  {' '}Select an option:
                </p>
                <button
                  ref={enterButtonRef}
                  type="button"
                  onClick={startIntro}
                  className="intro-command-choice"
                >
                  <kbd>[Enter]</kbd>
                  <span>{startQueued && !canEnter ? 'Preparing cinematic stream...' : 'Play cinematic intro'}</span>
                </button>
                <button
                  type="button"
                  onClick={skipIntro}
                  className="intro-command-choice"
                >
                  <kbd>[S]</kbd>
                  <span>Skip to portfolio</span>
                </button>
                <span className="intro-cursor" aria-hidden="true">_</span>
              </div>
            </div>
          </section>

          <div className="sr-only" aria-live="polite">
            {startQueued && !canEnter
              ? 'Cinematic selected. Preparing media.'
              : 'Choose Play cinematic intro or Skip to portfolio.'}
          </div>
        </div>
      )}

      {!showStatic && (
        <button
          type="button"
          onClick={toggleSound}
          aria-pressed={soundEnabled}
          aria-keyshortcuts="M"
          className="intro-control intro-sound-control"
        >
          [M] Sound {soundEnabled ? 'on' : 'off'}
        </button>
      )}

      <button
        type="button"
        onClick={skipIntro}
        aria-label="Skip intro and open portfolio"
        className="intro-control intro-skip-control"
      >
        [Esc] Skip intro
      </button>
    </div>
  );
}
