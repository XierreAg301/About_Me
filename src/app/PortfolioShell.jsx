import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PORTFOLIO_SECTIONS, SECTION_BY_ID } from './portfolioSections';
import usePortfolioNavigation from './usePortfolioNavigation';
import PortfolioWorldStage from '../experience/PortfolioWorldStage';
import { createRandomWorldNodes } from '../experience/worldNodes';
import HomePanel from '../panels/HomePanel';
import AboutPanel from '../panels/AboutPanel';
import SkillsPanel from '../panels/SkillsPanel';
import BackgroundPanel from '../panels/BackgroundPanel';
import ProjectsPanel from '../panels/ProjectsPanel';
import CertificatesPanel from '../panels/CertificatesPanel';
import ContactPanel from '../panels/ContactPanel';

const SPACE_BACKGROUND_URL = `${import.meta.env.BASE_URL}textures/nasa-deep-star-map-2020.jpg`;
const TARGETING_DURATION = 1900;
const DESCENT_DURATION = 3200;
const ARRIVAL_DURATION = 900;

function GlobeControls({
  nodes,
  onNodeSelect,
  onRotate,
}) {
  return (
    <>
      <div className="orbital-field-id" aria-hidden="true">
        <span>05 LIVE SIGNALS</span>
        <i />
        <span>POSITIONS RANDOMIZED</span>
      </div>

      <nav
        id="portfolio-globe-nav"
        className="orbital-country-list"
        aria-label="Global portfolio entry nodes"
        tabIndex="-1"
      >
        {nodes.map((node, index) => (
          <button
            type="button"
            key={`${node.id}-${node.code}`}
            onClick={() => onNodeSelect(node)}
            style={{ '--node-color': node.color }}
          >
            <small>{String(index + 1).padStart(2, '0')}</small>
            <span>
              <strong>{node.country}</strong>
              <em>{node.code} / {node.label}</em>
            </span>
          </button>
        ))}
      </nav>

      <div className="orbital-gesture-controls" aria-label="Globe rotation controls">
        <button
          type="button"
          aria-label="Rotate globe left"
          onClick={() => onRotate(-1)}
        >
          ←
        </button>
        <p>Drag to rotate · select a signal</p>
        <button
          type="button"
          aria-label="Rotate globe right"
          onClick={() => onRotate(1)}
        >
          →
        </button>
      </div>
    </>
  );
}

function TransitionReadout({ phase, selectedNode, onSkip }) {
  return (
    <>
      {phase === 'targeting' ? (
        <section className="orbital-transition-readout" aria-live="polite">
          <strong>{selectedNode?.country ?? 'UNKNOWN VECTOR'}</strong>
          <span>
            {selectedNode
              ? `${selectedNode.latitude.toFixed(4)} / ${selectedNode.longitude.toFixed(4)}`
              : 'CALCULATING'}
          </span>
          <i aria-hidden="true" />
        </section>
      ) : null}
      <button
        type="button"
        className="orbital-transition-skip"
        onClick={onSkip}
        aria-keyshortcuts="Escape Space"
      >
        <span aria-hidden="true">→</span>
        Skip transition
      </button>
    </>
  );
}

function CinematicTransitionFx({ phase }) {
  return (
    <div
      className="orbital-cinematic-fx"
      data-stage={phase}
      aria-hidden="true"
    >
      <i className="orbital-cinematic-atmosphere" />
      <i className="orbital-cinematic-velocity" />
      <i className="orbital-cinematic-flash" />
      <i className="orbital-cinematic-blackout" />
    </div>
  );
}

function NetworkNodeMap({ activeSection, onSelect }) {
  return (
    <nav className="orbital-node-map" aria-label="Portfolio node constellation">
      {PORTFOLIO_SECTIONS.map((section) => (
        <button
          type="button"
          key={section.id}
          data-active={section.id === activeSection}
          style={{
            '--map-x': `${section.mapPosition[0]}%`,
            '--map-y': `${section.mapPosition[1]}%`,
            '--map-color': section.color,
          }}
          onClick={() => onSelect(section.id)}
          aria-current={section.id === activeSection ? 'location' : undefined}
        >
          <i aria-hidden="true" />
          <span>{section.label}</span>
        </button>
      ))}
    </nav>
  );
}

function NodeDecoder({ activeSection, onClose }) {
  const activeMeta = SECTION_BY_ID.get(activeSection) ?? PORTFOLIO_SECTIONS[0];
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeSection]);

  return (
    <aside className="orbital-decoder" aria-label={`${activeMeta.label} node record`}>
      <header>
        <div>
          <small>DECIPHERED NODE</small>
          <strong>{activeMeta.index} / {activeMeta.nodeType}</strong>
        </div>
        <button type="button" onClick={onClose}>
          Collapse record
        </button>
      </header>

      <div ref={scrollRef} className="orbital-decoder-scroll">
        {activeSection === 'hero' ? <HomePanel /> : null}
        <AboutPanel />
        <SkillsPanel />
        <BackgroundPanel />
        <ProjectsPanel />
        <CertificatesPanel />
        <ContactPanel />
      </div>
    </aside>
  );
}

function NetworkChrome({
  activeSection,
  decoderOpen,
  onNodeSelect,
  onToggleDecoder,
  onReturnToOrbit,
}) {
  const activeMeta = SECTION_BY_ID.get(activeSection) ?? PORTFOLIO_SECTIONS[0];

  return (
    <>
      <header className="orbital-network-header">
        <a
          href="#hero"
          onClick={(event) => {
            event.preventDefault();
            onNodeSelect('hero');
          }}
        >
          <span>AA</span>
          <strong>ORBITAL FORENSICS</strong>
        </a>
        <p>{activeMeta.index} / {activeMeta.shortLabel}</p>
        <button type="button" onClick={onReturnToOrbit}>
          Return to orbit
        </button>
      </header>

      <section className="orbital-node-readout" aria-live="polite">
        <p>{activeMeta.index} / ACTIVE NODE</p>
        <h2>{activeMeta.label}</h2>
        <span>{activeMeta.signal}</span>
        <button type="button" onClick={onToggleDecoder}>
          {decoderOpen ? 'Hide record' : 'Decipher node'}
        </button>
      </section>

      <NetworkNodeMap
        activeSection={activeSection}
        onSelect={onNodeSelect}
      />
    </>
  );
}

export default function PortfolioShell() {
  const {
    activeSection,
    navigateTo,
    reducedMotion,
  } = usePortfolioNavigation();
  const [worldNodes] = useState(createRandomWorldNodes);
  const [selectedWorldNode, setSelectedWorldNode] = useState(null);
  const [phase, setPhase] = useState(
    () => (typeof window !== 'undefined' && window.location.hash ? 'network' : 'globe')
  );
  const [decoderOpen, setDecoderOpen] = useState(
    () => typeof window !== 'undefined' && Boolean(window.location.hash)
  );
  const [rotationCommand, setRotationCommand] = useState(null);

  const activeMeta = SECTION_BY_ID.get(activeSection) ?? PORTFOLIO_SECTIONS[0];
  const phaseIsTransition = (
    phase === 'targeting'
    || phase === 'descent'
    || phase === 'arrival'
  );

  useEffect(() => {
    document.title = 'Aaron Austin C. Amaro | Orbital Portfolio';
  }, []);

  useEffect(() => {
    if (phase !== 'targeting') return undefined;
    const timeout = window.setTimeout(
      () => setPhase(reducedMotion ? 'network' : 'descent'),
      reducedMotion ? 80 : TARGETING_DURATION
    );
    return () => window.clearTimeout(timeout);
  }, [phase, reducedMotion]);

  useEffect(() => {
    if (phase !== 'descent') return undefined;
    const timeout = window.setTimeout(() => {
      setPhase('arrival');
      setDecoderOpen(false);
      navigateTo('hero', { history: 'replace', focusPanel: false });
    }, DESCENT_DURATION);
    return () => window.clearTimeout(timeout);
  }, [navigateTo, phase]);

  useEffect(() => {
    if (phase !== 'arrival') return undefined;
    const timeout = window.setTimeout(() => setPhase('network'), ARRIVAL_DURATION);
    return () => window.clearTimeout(timeout);
  }, [phase]);

  const selectWorldNode = useCallback((node) => {
    if (phase !== 'globe') return;
    setSelectedWorldNode(node);
    setPhase('targeting');
  }, [phase]);

  const enterNetwork = useCallback(() => {
    setPhase('network');
    setDecoderOpen(false);
    navigateTo('hero', { history: 'replace', focusPanel: false });
  }, [navigateTo]);

  useEffect(() => {
    if (!phaseIsTransition) return undefined;
    const handleTransitionKey = (event) => {
      if (event.key !== 'Escape' && event.code !== 'Space') return;
      event.preventDefault();
      enterNetwork();
    };
    window.addEventListener('keydown', handleTransitionKey);
    return () => window.removeEventListener('keydown', handleTransitionKey);
  }, [enterNetwork, phaseIsTransition]);

  const selectMapNode = useCallback((sectionId) => {
    navigateTo(sectionId, { source: 'node-map', focusPanel: false });
    setDecoderOpen(true);
  }, [navigateTo]);

  const returnToOrbit = useCallback(() => {
    setDecoderOpen(false);
    setSelectedWorldNode(null);
    setPhase('globe');
    navigateTo('hero', { history: 'replace', focusPanel: false });
  }, [navigateTo]);

  const nudgeRotation = useCallback((direction) => {
    setRotationCommand({ direction, id: performance.now() });
  }, []);

  const shellClassName = useMemo(
    () => `portfolio-shell orbital-shell orbital-phase-${phase}`,
    [phase]
  );

  return (
    <div
      className={shellClassName}
      data-phase={phase}
      data-decoder-open={decoderOpen}
    >
      <a className="skip-link" href={phase === 'network' ? '#orbital-record' : '#portfolio-globe-nav'}>
        Skip immersive navigation
      </a>

      <div
        className="orbital-space-background"
        style={{ '--space-background': `url("${SPACE_BACKGROUND_URL}")` }}
        aria-hidden="true"
      />

      <PortfolioWorldStage
        phase={phase}
        worldNodes={worldNodes}
        selectedWorldNode={selectedWorldNode}
        rotationCommand={rotationCommand}
        onWorldNodeSelect={selectWorldNode}
        onMapNodeSelect={selectMapNode}
      />

      {phase === 'globe' ? (
        <GlobeControls
          nodes={worldNodes}
          onNodeSelect={selectWorldNode}
          onRotate={nudgeRotation}
        />
      ) : null}

      {phaseIsTransition ? (
        <>
          <CinematicTransitionFx phase={phase} />
          <TransitionReadout
            phase={phase}
            selectedNode={selectedWorldNode}
            onSkip={enterNetwork}
          />
        </>
      ) : null}

      {phase === 'network' ? (
        <>
          <NetworkChrome
            activeSection={activeSection}
            decoderOpen={decoderOpen}
            onNodeSelect={selectMapNode}
            onToggleDecoder={() => setDecoderOpen((open) => !open)}
            onReturnToOrbit={returnToOrbit}
          />
          {decoderOpen ? (
            <div id="orbital-record">
              <NodeDecoder
                activeSection={activeSection}
                onClose={() => setDecoderOpen(false)}
              />
            </div>
          ) : null}
        </>
      ) : null}

      <div className="orbital-frame" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>

      <div className="sr-only" aria-live="polite">
        {phase === 'globe'
          ? 'Five global signals available.'
          : phaseIsTransition
            ? `Traveling to ${selectedWorldNode?.country ?? 'selected node'}.`
            : `${activeMeta.label} portfolio node selected.`}
      </div>
    </div>
  );
}
