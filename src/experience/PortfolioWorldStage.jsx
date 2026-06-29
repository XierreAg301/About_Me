import { lazy, Suspense, useEffect, useState } from 'react';
import useWebGLSupport from '../hooks/useWebGLSupport';
import SceneErrorBoundary from './SceneErrorBoundary';
import StaticNodeMap from './StaticNodeMap';

const PortfolioWorld = lazy(() => import('./PortfolioWorld'));

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

/**
 * The 3D network now lives entirely behind the content as a fixed cinematic
 * backdrop. It is decorative (the mini-map drives navigation), so it is hidden
 * from assistive tech and never captures pointer/scroll. As the visitor scrolls
 * the camera flies from the wide network view onto the active node.
 */
function OrbitalLoading() {
  return (
    <div className="orbital-loading" role="status" aria-live="polite">
      <span />
      <p>Calibrating orbital assets</p>
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
}) {
  const webGLSupported = useWebGLSupport();
  const [sceneFailed, setSceneFailed] = useState(false);
  const isMobile = useMobileViewport();
  const useStaticMap = webGLSupported === false || sceneFailed;
  const fallbackReason = webGLSupported === null
    ? 'checking'
    : sceneFailed
        ? 'scene-error'
        : 'no-webgl';

  return (
    <div
      className="world-stage orbital-world-stage"
      data-phase={phase}
    >
      <div className="world-viewport">
        {webGLSupported === null ? (
          <OrbitalLoading />
        ) : useStaticMap ? (
          <StaticNodeMap reason={fallbackReason} />
        ) : (
          <SceneErrorBoundary
            onError={() => setSceneFailed(true)}
            fallback={<StaticNodeMap reason="scene-error" />}
          >
            <Suspense fallback={<OrbitalLoading />}>
              <PortfolioWorld
                isMobile={isMobile}
                phase={phase}
                worldNodes={worldNodes}
                selectedWorldNode={selectedWorldNode}
                rotationCommand={rotationCommand}
                onWorldNodeSelect={onWorldNodeSelect}
                onMapNodeSelect={onMapNodeSelect}
                onContextLost={() => setSceneFailed(true)}
              />
            </Suspense>
          </SceneErrorBoundary>
        )}
      </div>
    </div>
  );
}
