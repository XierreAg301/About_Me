import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PORTFOLIO_SECTIONS, SECTION_BY_ID } from './portfolioSections';
import { nodePresentationFor } from './nodePresentation';
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
const PANEL_BY_SECTION = {
  hero: HomePanel,
  about: AboutPanel,
  skills: SkillsPanel,
  background: BackgroundPanel,
  projects: ProjectsPanel,
  certificates: CertificatesPanel,
  contact: ContactPanel,
};

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

function SectionPage({
  activeSection,
  onBackToMap,
  onNodeSelect,
  onReturnToOrbit,
}) {
  const activeMeta = SECTION_BY_ID.get(activeSection) ?? PORTFOLIO_SECTIONS[0];
  const scrollRef = useRef(null);
  const ActivePanel = PANEL_BY_SECTION[activeMeta.id] ?? HomePanel;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeSection]);

  return (
    <main
      className="orbital-section-page"
      data-section-index={activeMeta.index}
      aria-label={`${activeMeta.label} page`}
    >
      <header className="orbital-section-header">
        <button className="orbital-section-brand" type="button" onClick={onBackToMap}>
          <span>AA</span>
          <strong>AARON AMARO</strong>
        </button>

        <nav aria-label="Portfolio pages">
          {PORTFOLIO_SECTIONS.map((section) => (
            <button
              type="button"
              key={section.id}
              aria-current={section.id === activeSection ? 'page' : undefined}
              onClick={() => onNodeSelect(section.id)}
            >
              {section.label}
            </button>
          ))}
        </nav>

        <div className="orbital-section-actions">
          <button type="button" onClick={onBackToMap}>Network map</button>
          <button type="button" onClick={onReturnToOrbit}>Orbit</button>
        </div>
      </header>

      <div ref={scrollRef} className="orbital-section-scroll">
        <div className="orbital-section-copy" key={activeMeta.id}>
          <p className="orbital-section-kicker">
            <span>{activeMeta.index}</span>
            {nodePresentationFor(activeMeta.id).artifact}
          </p>
          <ActivePanel />
        </div>
      </div>

      <p className="orbital-page-instructions" aria-hidden="true">
        Scroll to move between pages
      </p>
    </main>
  );
}

function NetworkChrome({
  activeSection,
  onNodeSelect,
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

      <section
        id="orbital-map-overview"
        className="orbital-map-overview"
        tabIndex="-1"
      >
        <p>Interactive portfolio / 2026</p>
        <h1>Choose a signal.</h1>
        <span>The map is the index. Select any object, or scroll to begin with Home.</span>
        <nav aria-label="Portfolio node index">
          {PORTFOLIO_SECTIONS.map((section) => (
            <button
              type="button"
              key={section.id}
              onClick={() => onNodeSelect(section.id)}
            >
              <small>{section.index}</small>
              <strong>{section.label}</strong>
            </button>
          ))}
        </nav>
      </section>

      <p className="orbital-map-instructions" aria-hidden="true">
        Scroll to enter Home · select an object to open its page
      </p>
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
  const [networkView, setNetworkView] = useState(
    () => (typeof window !== 'undefined' && window.location.hash ? 'page' : 'map')
  );
  const [rotationCommand, setRotationCommand] = useState(null);
  const wheelLockRef = useRef(false);

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
      setNetworkView('map');
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
    setNetworkView('map');
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
    setNetworkView('page');
  }, [navigateTo]);

  const cycleMapNode = useCallback((direction) => {
    const currentIndex = PORTFOLIO_SECTIONS.findIndex(({ id }) => id === activeSection);
    const nextIndex = Math.min(
      PORTFOLIO_SECTIONS.length - 1,
      Math.max(0, currentIndex + direction)
    );
    if (nextIndex === currentIndex) return false;
    navigateTo(PORTFOLIO_SECTIONS[nextIndex].id, {
      source: 'node-scan',
      history: 'replace',
      focusPanel: false,
    });
    return true;
  }, [activeSection, navigateTo]);

  useEffect(() => {
    if (phase !== 'network') return undefined;
    const handleWheel = (event) => {
      if (wheelLockRef.current || Math.abs(event.deltaY) < 12) return;
      const direction = event.deltaY > 0 ? 1 : -1;

      if (networkView === 'map') {
        if (direction < 0) return;
        event.preventDefault();
        navigateTo('hero', {
          source: 'map-scroll',
          history: 'replace',
          focusPanel: false,
        });
        setNetworkView('page');
      } else {
        const scrollArea = document.querySelector('.orbital-section-scroll');
        const canScrollDown = scrollArea
          && scrollArea.scrollTop + scrollArea.clientHeight < scrollArea.scrollHeight - 2;
        const canScrollUp = scrollArea && scrollArea.scrollTop > 2;
        if ((direction > 0 && canScrollDown) || (direction < 0 && canScrollUp)) return;

        event.preventDefault();
        const currentIndex = PORTFOLIO_SECTIONS.findIndex(({ id }) => id === activeSection);
        if (direction < 0 && currentIndex === 0) {
          setNetworkView('map');
          navigateTo('hero', { history: 'replace', focusPanel: false });
        } else if (!cycleMapNode(direction)) {
          return;
        }
      }

      wheelLockRef.current = true;
      window.setTimeout(() => {
        wheelLockRef.current = false;
      }, 760);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [activeSection, cycleMapNode, navigateTo, networkView, phase]);

  useEffect(() => {
    if (phase !== 'network') return undefined;
    const handleMapKeys = (event) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.matches('input, textarea, select')) return;

      if (event.key === 'Escape' && networkView === 'page') {
        event.preventDefault();
        setNetworkView('map');
        navigateTo('hero', { history: 'replace', focusPanel: false });
      } else if (networkView === 'map' && event.key === 'ArrowDown') {
        event.preventDefault();
        selectMapNode(activeSection);
      } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        cycleMapNode(1);
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        cycleMapNode(-1);
      } else if (networkView === 'map' && event.key === 'Enter' && !target?.closest?.('button, a')) {
        event.preventDefault();
        selectMapNode(activeSection);
      }
    };
    window.addEventListener('keydown', handleMapKeys);
    return () => window.removeEventListener('keydown', handleMapKeys);
  }, [activeSection, cycleMapNode, navigateTo, networkView, phase, selectMapNode]);

  const returnToOrbit = useCallback(() => {
    setNetworkView('map');
    setSelectedWorldNode(null);
    setPhase('globe');
    navigateTo('hero', { history: 'replace', focusPanel: false });
  }, [navigateTo]);

  const returnToMap = useCallback(() => {
    setNetworkView('map');
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
      data-network-view={networkView}
      style={{ '--active-node-accent': nodePresentationFor(activeSection).accent }}
    >
      <a
        className="skip-link"
        href={phase === 'network'
          ? networkView === 'page' ? `#${activeSection}` : '#orbital-map-overview'
          : '#portfolio-globe-nav'}
      >
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
        activeSection={activeSection}
        networkView={networkView}
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
          {networkView === 'map' ? (
            <NetworkChrome
              activeSection={activeSection}
              onNodeSelect={selectMapNode}
              onReturnToOrbit={returnToOrbit}
            />
          ) : (
            <SectionPage
              activeSection={activeSection}
              onBackToMap={returnToMap}
              onNodeSelect={selectMapNode}
              onReturnToOrbit={returnToOrbit}
            />
          )}
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
