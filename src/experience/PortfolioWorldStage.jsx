import { lazy, Suspense, useEffect, useState } from 'react';
import usePortfolioNavigation from '../app/usePortfolioNavigation';
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
export default function PortfolioWorldStage() {
  const webGLSupported = useWebGLSupport();
  const { isPanelOpen, reducedMotion } = usePortfolioNavigation();
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
    <div
      className="world-stage"
      data-panel-open={isPanelOpen}
      aria-hidden="true"
    >
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
            </Suspense>
          </SceneErrorBoundary>
        )}
      </div>
    </div>
  );
}
