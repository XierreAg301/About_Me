import { lazy, Suspense, useEffect, useState } from 'react';
import usePortfolioNavigation from '../app/usePortfolioNavigation';
import useWebGLSupport from '../hooks/useWebGLSupport';
import NodeNavigator from './NodeNavigator';
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

export default function PortfolioWorldStage() {
  const webGLSupported = useWebGLSupport();
  const { reducedMotion } = usePortfolioNavigation();
  const [sceneFailed, setSceneFailed] = useState(false);
  const isMobile = useMobileViewport();
  const useStaticMap = reducedMotion || webGLSupported !== true || sceneFailed;
  const fallbackReason = webGLSupported === null
    ? 'checking'
    : reducedMotion
      ? 'reduced-motion'
      : sceneFailed
        ? 'scene-error'
        : 'no-webgl';

  return (
    <aside className="world-stage" aria-label="Interactive portfolio map">
      <div className="world-stage-header">
        <div>
          <p className="system-label">PORTFOLIO WORLD / NODE MAP</p>
          <p id="map-instructions">
            Use arrow keys to move between nodes, Enter to open, and Escape to return.
          </p>
        </div>
        <span className="world-mode" aria-live="polite">
          {webGLSupported === null ? 'SCANNING' : useStaticMap ? 'STATIC LINK' : 'WEBGL LINK'}
        </span>
      </div>

      <div className="world-viewport">
        {useStaticMap ? (
          <StaticNodeMap reason={fallbackReason} />
        ) : (
          <SceneErrorBoundary
            onError={() => setSceneFailed(true)}
            fallback={<StaticNodeMap reason="scene-error" />}
          >
            <Suspense fallback={<StaticNodeMap reason="loading" />}>
              <PortfolioWorld
                isMobile={isMobile}
                onContextLost={() => setSceneFailed(true)}
              />
              <NodeNavigator />
            </Suspense>
          </SceneErrorBoundary>
        )}
      </div>
    </aside>
  );
}
