import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import useWebGLSupport from '../hooks/useWebGLSupport';
import SceneErrorBoundary from './SceneErrorBoundary';
import StaticNodeMap from './StaticNodeMap';

const PortfolioWorld = lazy(() => import('./PortfolioWorld'));
const loadPortfolioNodeWorld = () => import('./PortfolioNodeWorld');
const PortfolioNodeWorld = lazy(loadPortfolioNodeWorld);

function useMobileViewport() {
  const [mobile, setMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
  );

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const update = () => setMobile(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return mobile;
}

function OrbitalLoading({ phase }) {
  return (
    <div className="orbital-loading" role="status" aria-live="polite">
      <div className="orbital-loading-track" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <p>{phase === 'network' ? 'Indexing artifact nodes' : 'Calibrating orbital assets'}</p>
    </div>
  );
}

export default function PortfolioWorldStage({
  phase,
  worldNodes,
  selectedWorldNode,
  rotationCommand,
  onWorldNodeSelect,
  onMapNodeSelect,
  activeSection,
  networkView,
}) {
  const webGLSupported = useWebGLSupport();
  const [sceneFailed, setSceneFailed] = useState(false);
  const isMobile = useMobileViewport();
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const handleContextLost = useCallback((sourcePhase) => {
    if (phaseRef.current === sourcePhase) setSceneFailed(true);
  }, []);

  useEffect(() => {
    setSceneFailed(false);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'globe') loadPortfolioNodeWorld();
  }, [phase]);

  const useStaticMap = webGLSupported === false || sceneFailed;
  const showArtifactWorld = phase === 'arrival' || phase === 'network';
  const fallbackReason = webGLSupported === null
    ? 'checking'
    : sceneFailed
        ? 'scene-error'
        : 'no-webgl';
  const fallback = (
    <StaticNodeMap
      reason={fallbackReason}
      phase={showArtifactWorld ? 'network' : phase}
      activeSection={activeSection}
      viewMode={networkView}
    />
  );

  return (
    <div className="world-stage orbital-world-stage" data-phase={phase}>
      <div className="world-viewport">
        {webGLSupported === null ? (
          <OrbitalLoading phase={phase} />
        ) : useStaticMap ? fallback : (
          <SceneErrorBoundary
            onError={() => setSceneFailed(true)}
            fallback={fallback}
          >
            <Suspense fallback={<OrbitalLoading phase={phase} />}>
              {showArtifactWorld ? (
                <PortfolioNodeWorld
                  phase={phase}
                  activeSection={activeSection}
                  viewMode={networkView}
                  isMobile={isMobile}
                  onNodeSelect={onMapNodeSelect}
                  onContextLost={() => handleContextLost('network')}
                />
              ) : (
                <PortfolioWorld
                  isMobile={isMobile}
                  phase={phase}
                  worldNodes={worldNodes}
                  selectedWorldNode={selectedWorldNode}
                  rotationCommand={rotationCommand}
                  onWorldNodeSelect={onWorldNodeSelect}
                  onMapNodeSelect={onMapNodeSelect}
                  onContextLost={() => handleContextLost(phase)}
                />
              )}
            </Suspense>
          </SceneErrorBoundary>
        )}
      </div>
    </div>
  );
}
