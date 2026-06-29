import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CONFIG } from '../../config';
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

const CLOUD_DESCENT_URLS = [
  `${import.meta.env.BASE_URL}textures/cloud-descent-01.png`,
  `${import.meta.env.BASE_URL}textures/cloud-descent-02.png`,
  `${import.meta.env.BASE_URL}textures/cloud-descent-03.png`,
];

function IntroCopy({ onEnter }) {
  return (
    <section className="orbital-intro-copy" aria-labelledby="orbital-title">
      <p>ORBITAL PORTFOLIO / 2026</p>
      <h1 id="orbital-title">{CONFIG.name}</h1>
      <span>{CONFIG.title}</span>
      <button id="orbital-entry-button" type="button" onClick={onEnter}>
        Enter the signal field
      </button>
    </section>
  );
}

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
      {phase === 'descent' && (
        <div className="orbital-descent-clouds" aria-hidden="true">
          {CLOUD_DESCENT_URLS.map((url, index) => (
            <span
              key={url}
              style={{
                '--cloud-image': `url("${url}")`,
                '--cloud-index': index,
              }}
            />
          ))}
        </div>
      )}
      <section className="orbital-transition-readout" aria-live="polite">
        <p>{phase === 'targeting' ? 'ACQUIRING SIGNAL' : 'ATMOSPHERIC ENTRY'}</p>
        <strong>{selectedNode?.country ?? 'UNKNOWN VECTOR'}</strong>
        <span>
          {selectedNode
            ? `${selectedNode.latitude.toFixed(4)} / ${selectedNode.longitude.toFixed(4)}`
            : 'CALCULATING'}
        </span>
        <i aria-hidden="true" />
        <button type="button" onClick={onSkip}>
          Skip transition
        </button>
      </section>
    </>
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
    () => (typeof window !== 'undefined' && window.location.hash ? 'network' : 'intro')
  );
  const [decoderOpen, setDecoderOpen] = useState(
    () => typeof window !== 'undefined' && Boolean(window.location.hash)
  );
  const [rotationCommand, setRotationCommand] = useState(null);

  const activeMeta = SECTION_BY_ID.get(activeSection) ?? PORTFOLIO_SECTIONS[0];
  const phaseIsTransition = phase === 'targeting' || phase === 'descent';

  useEffect(() => {
    document.title = 'Aaron Austin C. Amaro | Orbital Portfolio';
  }, []);

  useEffect(() => {
    if (phase !== 'targeting') return undefined;
    const timeout = window.setTimeout(
      () => setPhase(reducedMotion ? 'network' : 'descent'),
      reducedMotion ? 80 : 1350
    );
    return () => window.clearTimeout(timeout);
  }, [phase, reducedMotion]);

  useEffect(() => {
    if (phase !== 'descent') return undefined;
    const timeout = window.setTimeout(() => {
      setPhase('network');
      setDecoderOpen(false);
      navigateTo('hero', { history: 'replace', focusPanel: false });
    }, 2350);
    return () => window.clearTimeout(timeout);
  }, [navigateTo, phase]);

  const enterSignalField = useCallback(() => {
    setPhase('globe');
    window.requestAnimationFrame(() => {
      document.getElementById('portfolio-globe-nav')?.focus({ preventScroll: true });
    });
  }, []);

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

      <PortfolioWorldStage
        phase={phase}
        worldNodes={worldNodes}
        selectedWorldNode={selectedWorldNode}
        rotationCommand={rotationCommand}
        onWorldNodeSelect={selectWorldNode}
        onMapNodeSelect={selectMapNode}
      />

      {phase === 'intro' ? <IntroCopy onEnter={enterSignalField} /> : null}

      {phase === 'globe' ? (
        <div id="portfolio-globe-nav" tabIndex="-1">
          <GlobeControls
            nodes={worldNodes}
            onNodeSelect={selectWorldNode}
            onRotate={nudgeRotation}
          />
        </div>
      ) : null}

      {phaseIsTransition ? (
        <TransitionReadout
          phase={phase}
          selectedNode={selectedWorldNode}
          onSkip={enterNetwork}
        />
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
        {phase === 'intro'
          ? 'Orbital portfolio ready.'
          : phase === 'globe'
            ? 'Five global signals available.'
            : phaseIsTransition
              ? `Traveling to ${selectedWorldNode?.country ?? 'selected node'}.`
              : `${activeMeta.label} portfolio node selected.`}
      </div>
    </div>
  );
}
