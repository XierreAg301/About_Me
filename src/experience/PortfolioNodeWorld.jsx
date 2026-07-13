import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import {
  PORTFOLIO_CONNECTIONS,
  PORTFOLIO_SECTIONS,
  SECTION_BY_ID,
} from '../app/portfolioSections';
import { nodePresentationFor } from '../app/nodePresentation';
import usePortfolioNavigation from '../app/usePortfolioNavigation';

const BASE_URL = import.meta.env.BASE_URL;
const ARTIFACT_URLS = [
  `${BASE_URL}models/aurora-orbs/orbital-maze.glb?v=1`,
  `${BASE_URL}models/aurora-orbs/paneled-core.glb?v=1`,
  `${BASE_URL}models/aurora-orbs/stacked-rings.glb?v=1`,
  `${BASE_URL}models/aurora-orbs/shield-orb.glb?v=1`,
  `${BASE_URL}models/aurora-orbs/geodesic-core.glb?v=1`,
];

const NODE_ROTATIONS = {
  hero: [0.1, -0.35, -0.12],
  about: [-0.22, 0.5, 0.1],
  skills: [0.18, -0.2, 0.18],
  background: [0.06, 0.75, -0.16],
  projects: [-0.12, -0.3, 0.08],
  certificates: [0.24, -0.65, -0.1],
  contact: [-0.1, 0.3, 0.2],
};

const NODE_TARGET_SIZE = {
  hero: 2.25,
  about: 2.1,
  skills: 2.05,
  background: 2.1,
  projects: 2.2,
  certificates: 2.05,
  contact: 2.05,
};

function smoothFactor(speed, delta) {
  return 1 - Math.exp(-speed * delta);
}

function prepareArtifact(source, targetSize, tint) {
  const clonedScene = source.clone(true);
  const tintColor = new THREE.Color(tint);

  clonedScene.traverse((child) => {
    if (!child.isMesh) return;
    child.castShadow = false;
    child.receiveShadow = false;
    child.frustumCulled = true;

    if (Array.isArray(child.material)) {
      child.material = child.material.map((material) => material.clone());
    } else if (child.material) {
      child.material = child.material.clone();
    }

    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.filter(Boolean).forEach((material) => {
      if (material.color) material.color.lerp(tintColor, 0.24);
      if ('metalness' in material) material.metalness = Math.max(material.metalness, 0.56);
      if ('roughness' in material) material.roughness = Math.min(material.roughness, 0.5);
      if (material.emissive) {
        material.emissive.copy(tintColor);
        material.emissiveIntensity = 0.07;
      }
    });
  });

  const bounds = new THREE.Box3().setFromObject(clonedScene);
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  const longestSide = Math.max(size.x, size.y, size.z) || 1;
  clonedScene.position.sub(center);
  clonedScene.scale.setScalar(targetSize / longestSide);

  const root = new THREE.Group();
  root.add(clonedScene);
  return root;
}

function ArtifactNode({
  asset,
  section,
  active,
  viewMode,
  reducedMotion,
  onSelect,
}) {
  const nodeRef = useRef(null);
  const haloRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const presentation = nodePresentationFor(section.id);
  const modelTint = viewMode === 'page' ? '#e9964f' : presentation.accent;
  const model = useMemo(
    () => prepareArtifact(asset.scene, NODE_TARGET_SIZE[section.id], modelTint),
    [asset.scene, modelTint, section.id]
  );
  const mixer = useMemo(
    () => (asset.animations.length ? new THREE.AnimationMixer(model) : null),
    [asset.animations.length, model]
  );

  useEffect(() => {
    if (!mixer || reducedMotion) return undefined;
    const actions = asset.animations.map((clip) => mixer.clipAction(clip, model));
    actions.forEach((action) => action.play());
    return () => {
      actions.forEach((action) => action.stop());
      mixer.stopAllAction();
    };
  }, [asset.animations, mixer, model, reducedMotion]);

  useEffect(() => {
    if (!hovered) return undefined;
    const previousCursor = document.body.style.cursor;
    document.body.style.cursor = 'pointer';
    return () => {
      document.body.style.cursor = previousCursor;
    };
  }, [hovered]);

  useFrame(({ clock }, delta) => {
    const node = nodeRef.current;
    if (!node) return;

    if (mixer && !reducedMotion) mixer.update(delta);
    const baseScale = viewMode === 'map'
      ? hovered ? 0.56 : 0.43
      : active ? 1.56 : 0.001;
    const targetScale = new THREE.Vector3(baseScale, baseScale, baseScale);
    node.scale.lerp(targetScale, smoothFactor(4.2, delta));

    if (!reducedMotion) {
      const phase = Number(section.index) * 0.83;
      node.position.y = section.position[1] + Math.sin(clock.elapsedTime * 0.52 + phase) * 0.08;
      node.rotation.y += delta * (active ? 0.1 : 0.035);
      if (haloRef.current) {
        haloRef.current.rotation.z -= delta * (active ? 0.28 : 0.08);
        const pulse = active ? 1 + Math.sin(clock.elapsedTime * 2.2) * 0.06 : 1;
        haloRef.current.scale.setScalar(pulse);
      }
    }
  });

  return (
    <group
      ref={nodeRef}
      name={`artifact-${section.id}`}
      position={section.position}
      rotation={NODE_ROTATIONS[section.id]}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(section.id);
      }}
      onPointerEnter={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
    >
      <primitive object={model} />
      <group ref={haloRef} rotation={[Math.PI / 2.35, 0.15, 0]}>
        <mesh>
          <torusGeometry args={[0.72, 0.008, 8, 96]} />
          <meshBasicMaterial
            color={viewMode === 'page' ? '#e9964f' : presentation.accent}
            transparent
            opacity={viewMode === 'map' ? active ? 0.7 : 0.14 : active ? 0.45 : 0}
            depthWrite={false}
          />
        </mesh>
        {active ? (
          <mesh rotation={[0.15, 0.32, 0]}>
            <torusGeometry args={[0.91, 0.004, 8, 96]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.48} depthWrite={false} />
          </mesh>
        ) : null}
      </group>
      <pointLight
        color={viewMode === 'page' ? '#e9964f' : presentation.accent}
        intensity={viewMode === 'page' ? active ? 1.8 : 0 : active ? 1.1 : 0.12}
        distance={active ? 5.5 : 2.5}
        decay={2}
      />
      <mesh visible>
        <sphereGeometry args={[0.9, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

function SceneSurface({ viewMode }) {
  const { scene } = useThree();
  const target = useMemo(
    () => new THREE.Color(viewMode === 'page' ? '#f2f1ee' : '#020204'),
    [viewMode]
  );

  useEffect(() => {
    if (!(scene.background instanceof THREE.Color)) {
      scene.background = new THREE.Color('#020204');
    }
  }, [scene]);

  useFrame((_, delta) => {
    if (scene.background instanceof THREE.Color) {
      scene.background.lerp(target, smoothFactor(3.1, delta));
    }
  });

  return null;
}

function ConnectionField({ activeSection }) {
  const activeColor = nodePresentationFor(activeSection).accent;
  const { passivePositions, activePositions } = useMemo(() => {
    const passive = [];
    const highlighted = [];

    PORTFOLIO_CONNECTIONS.forEach(([sourceId, targetId]) => {
      const source = SECTION_BY_ID.get(sourceId);
      const target = SECTION_BY_ID.get(targetId);
      const values = [...source.position, ...target.position];
      passive.push(...values);
      if (sourceId === activeSection || targetId === activeSection) highlighted.push(...values);
    });

    return {
      passivePositions: new Float32Array(passive),
      activePositions: new Float32Array(highlighted),
    };
  }, [activeSection]);

  return (
    <group>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={passivePositions}
            count={passivePositions.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#484252" transparent opacity={0.18} depthWrite={false} />
      </lineSegments>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={activePositions}
            count={activePositions.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={activeColor} transparent opacity={0.64} depthWrite={false} />
      </lineSegments>
    </group>
  );
}

function DataDust({ reducedMotion }) {
  const pointsRef = useRef(null);
  const positions = useMemo(() => {
    const values = new Float32Array(210 * 3);
    let seed = 31;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    for (let index = 0; index < values.length; index += 3) {
      values[index] = (random() - 0.5) * 16;
      values[index + 1] = (random() - 0.5) * 9;
      values[index + 2] = -1.5 + random() * 4;
    }
    return values;
  }, []);

  useFrame((_, delta) => {
    if (!reducedMotion && pointsRef.current) pointsRef.current.rotation.z += delta * 0.004;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={positions.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#6f657d"
        size={0.014}
        transparent
        opacity={0.28}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function ArtifactContactShadow({ activeSection, isMobile }) {
  const active = SECTION_BY_ID.get(activeSection) ?? PORTFOLIO_SECTIONS[0];

  return (
    <mesh
      position={[active.position[0], active.position[1] - 1.22, active.position[2] - 0.55]}
      scale={[isMobile ? 0.9 : 1.18, 0.2, 1]}
      renderOrder={-1}
    >
      <circleGeometry args={[0.9, 64]} />
      <meshBasicMaterial
        color="#3d342d"
        transparent
        opacity={0.09}
        depthWrite={false}
      />
    </mesh>
  );
}

function CameraRig({ activeSection, viewMode, isMobile, reducedMotion }) {
  const { camera } = useThree();
  const lookAt = useRef(new THREE.Vector3(0, 0, 0));
  const active = SECTION_BY_ID.get(activeSection) ?? PORTFOLIO_SECTIONS[0];

  useFrame(({ pointer }, delta) => {
    if (viewMode === 'map') {
      const mapCenterX = isMobile ? 0 : 0.6;
      const destination = new THREE.Vector3(
        mapCenterX,
        isMobile ? 0.4 : 0,
        isMobile ? 12.4 : 10.2
      );
      const factor = reducedMotion ? 1 : smoothFactor(1.35, delta);
      camera.position.lerp(destination, factor);
      lookAt.current.lerp(new THREE.Vector3(mapCenterX, 0, 0), factor);
      camera.lookAt(lookAt.current);
      return;
    }

    const activeX = isMobile ? active.position[0] * 0.82 : active.position[0] + 0.45;
    const activeY = isMobile ? active.position[1] * 0.82 + 0.35 : active.position[1];
    const framingOffset = isMobile ? 0 : -2.05;
    const verticalOffset = isMobile ? -2.15 : 0;
    const pointerX = reducedMotion || isMobile ? 0 : pointer.x * 0.12;
    const pointerY = reducedMotion || isMobile ? 0 : pointer.y * 0.08;
    const destination = new THREE.Vector3(
      activeX + framingOffset + pointerX,
      activeY + verticalOffset + pointerY,
      isMobile ? 8.8 : 6.8
    );
    const focus = new THREE.Vector3(
      activeX + framingOffset,
      activeY + verticalOffset,
      0
    );
    const factor = reducedMotion ? 1 : smoothFactor(1.45, delta);
    camera.position.lerp(destination, factor);
    lookAt.current.lerp(focus, factor);
    camera.lookAt(lookAt.current);
  });

  return null;
}

function ArtifactConstellation({ assets, activeSection, viewMode, isMobile, onNodeSelect }) {
  const { reducedMotion } = usePortfolioNavigation();
  const pageMode = viewMode === 'page';

  return (
    <>
      <SceneSurface viewMode={viewMode} />
      <ambientLight color="#ffffff" intensity={pageMode ? 2.3 : 0.5} />
      <directionalLight color="#ffffff" intensity={pageMode ? 4.2 : 2.3} position={[-4, 7, 8]} />
      <directionalLight color={pageMode ? '#e9964f' : '#a25cff'} intensity={pageMode ? 2.1 : 1.75} position={[6, -3, 4]} />
      {!pageMode ? (
        <>
          <pointLight color="#ff3cac" intensity={2.4} distance={13} position={[0, 2, 3]} />
          <pointLight color="#3c8dff" intensity={2.2} distance={13} position={[2, -2, 4]} />
        </>
      ) : null}

      <group
        scale={isMobile ? viewMode === 'map' ? 0.74 : 0.82 : viewMode === 'map' ? 0.9 : 1}
        position={isMobile
          ? [0, viewMode === 'map' ? 0.1 : 0.35, 0]
          : [viewMode === 'map' ? 1.55 : 0.45, 0, 0]}
      >
        {viewMode === 'map' ? <ConnectionField activeSection={activeSection} /> : null}
        {pageMode ? (
          <ArtifactContactShadow activeSection={activeSection} isMobile={isMobile} />
        ) : null}
        {PORTFOLIO_SECTIONS.map((section) => (
          <ArtifactNode
            key={section.id}
            asset={assets[nodePresentationFor(section.id).modelIndex]}
            section={section}
            active={section.id === activeSection}
            viewMode={viewMode}
            reducedMotion={reducedMotion}
            onSelect={onNodeSelect}
          />
        ))}
      </group>

      {viewMode === 'map' ? <DataDust reducedMotion={reducedMotion} /> : null}
      <CameraRig
        activeSection={activeSection}
        viewMode={viewMode}
        isMobile={isMobile}
        reducedMotion={reducedMotion}
      />
    </>
  );
}

export default function PortfolioNodeWorld({
  phase = 'network',
  activeSection,
  viewMode = 'map',
  isMobile,
  onNodeSelect,
  onContextLost,
}) {
  const assets = useLoader(GLTFLoader, ARTIFACT_URLS);

  return (
    <div
      className="orbital-world-canvas orbital-artifact-canvas"
      data-phase={phase}
      data-view={viewMode}
    >
      <Canvas
        camera={{ position: [0, 0, isMobile ? 10 : 8.5], fov: isMobile ? 48 : 42, near: 0.1, far: 40 }}
        dpr={isMobile ? 1 : [1, 1.55]}
        gl={{
          alpha: false,
          antialias: !isMobile,
          powerPreference: 'high-performance',
          outputColorSpace: THREE.SRGBColorSpace,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.12,
        }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', onContextLost, { once: true });
        }}
      >
        <ArtifactConstellation
          assets={assets}
          activeSection={activeSection}
          viewMode={viewMode}
          isMobile={isMobile}
          onNodeSelect={onNodeSelect}
        />
      </Canvas>
    </div>
  );
}

useLoader.preload(GLTFLoader, ARTIFACT_URLS);
