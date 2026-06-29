import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { mesh as topoMesh } from 'topojson-client';
import countries from 'world-atlas/countries-110m.json';
import * as THREE from 'three';
import {
  PORTFOLIO_CONNECTIONS,
  PORTFOLIO_SECTIONS,
  SECTION_BY_ID,
} from '../app/portfolioSections';
import usePortfolioNavigation from '../app/usePortfolioNavigation';

const BASE_URL = import.meta.env.BASE_URL;
const GLOBE_URL = `${BASE_URL}models/digital-globe.glb?v=3`;
const STATION_URL = `${BASE_URL}models/space-station-web.glb?v=1`;
const NODE_URL = `${BASE_URL}models/orbital-node.glb?v=1`;
const CLOUD_URLS = [
  `${BASE_URL}textures/cloud-field-6.png`,
  `${BASE_URL}textures/cloud-descent-01.png`,
  `${BASE_URL}textures/cloud-descent-02.png`,
  `${BASE_URL}textures/cloud-descent-03.png`,
];
const GLOBE_RADIUS = 2.08;
const UP = new THREE.Vector3(0, 1, 0);

function smoothFactor(speed, delta) {
  return 1 - Math.exp(-speed * delta);
}

function easeInOutCubic(value) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - ((-2 * value + 2) ** 3) / 2;
}

function lerpAngle(current, target, amount) {
  const delta = Math.atan2(
    Math.sin(target - current),
    Math.cos(target - current)
  );
  return current + delta * amount;
}

function coordinateToVector(latitude, longitude, radius = GLOBE_RADIUS) {
  const lat = THREE.MathUtils.degToRad(latitude);
  const lon = THREE.MathUtils.degToRad(longitude);
  const cosLat = Math.cos(lat);
  return new THREE.Vector3(
    radius * cosLat * Math.cos(lon),
    radius * Math.sin(lat),
    -radius * cosLat * Math.sin(lon)
  );
}

function coordinateRotation(node) {
  return {
    x: THREE.MathUtils.degToRad(node.latitude),
    y: -Math.PI / 2 - THREE.MathUtils.degToRad(node.longitude),
  };
}

function cloneAsset(source, cloneMaterials = false) {
  const clone = source.clone(true);
  clone.traverse((child) => {
    if (!child.isMesh) return;
    child.castShadow = false;
    child.receiveShadow = false;
    child.frustumCulled = true;
    if (cloneMaterials) child.material = child.material.clone();
  });
  return clone;
}

function CountryBorders() {
  const positions = useMemo(() => {
    const borderMesh = topoMesh(
      countries,
      countries.objects.countries
    );
    const values = [];
    borderMesh.coordinates.forEach((line) => {
      for (let index = 1; index < line.length; index += 1) {
        const start = coordinateToVector(line[index - 1][1], line[index - 1][0], 2.052);
        const end = coordinateToVector(line[index][1], line[index][0], 2.052);
        values.push(start.x, start.y, start.z, end.x, end.y, end.z);
      }
    });
    return new Float32Array(values);
  }, []);

  return (
    <lineSegments renderOrder={8}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={positions.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color="#dbe9e5"
        transparent
        opacity={0.46}
        depthTest
        depthWrite={false}
        toneMapped={false}
      />
    </lineSegments>
  );
}

function usePhaseStart(phase) {
  const phaseStart = useRef(performance.now());
  useEffect(() => {
    phaseStart.current = performance.now();
  }, [phase]);
  return phaseStart;
}

function CameraDirector({ phase, isMobile }) {
  const { camera } = useThree();
  const phaseStart = usePhaseStart(phase);
  const desiredPosition = useMemo(() => new THREE.Vector3(), []);
  const desiredLookAt = useMemo(() => new THREE.Vector3(), []);
  const lookAt = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    const elapsed = (performance.now() - phaseStart.current) / 1000;
    let targetFov = isMobile ? 47 : 42;

    if (phase === 'intro') {
      desiredPosition.set(0, isMobile ? 0.15 : 0.2, isMobile ? 8.5 : 8.2);
      desiredLookAt.set(0, 0, 0);
      targetFov = isMobile ? 48 : 42;
    } else if (phase === 'globe') {
      desiredPosition.set(0, 0.08, isMobile ? 8.1 : 7.8);
      desiredLookAt.set(0, 0, 0);
    } else if (phase === 'targeting') {
      const progress = easeInOutCubic(Math.min(1, elapsed / 1.35));
      desiredPosition.set(0, 0.04, THREE.MathUtils.lerp(
        isMobile ? 8.1 : 7.8,
        isMobile ? 6.6 : 5.9,
        progress
      ));
      desiredLookAt.set(0, 0, 0);
      targetFov = THREE.MathUtils.lerp(42, 36, progress);
    } else if (phase === 'descent') {
      const progress = easeInOutCubic(Math.min(1, elapsed / 2.35));
      desiredPosition.set(0, -progress * 0.55, THREE.MathUtils.lerp(5.9, 3.6, progress));
      desiredLookAt.set(0, -progress * 0.8, -progress * 0.6);
      targetFov = THREE.MathUtils.lerp(36, 62, progress);
    } else {
      desiredPosition.set(isMobile ? 0 : 0.4, 0.18, isMobile ? 11.4 : 10.3);
      desiredLookAt.set(isMobile ? 0 : -0.45, 0, 0);
      targetFov = isMobile ? 48 : 43;
    }

    camera.position.lerp(desiredPosition, smoothFactor(phase === 'descent' ? 5 : 3.4, delta));
    lookAt.current.lerp(desiredLookAt, smoothFactor(4, delta));
    camera.lookAt(lookAt.current);
    camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, smoothFactor(4, delta));
    camera.updateProjectionMatrix();
  });

  return null;
}

function StarField({ isMobile, phase }) {
  const pointsRef = useRef(null);
  const count = isMobile ? 320 : 720;
  const positions = useMemo(() => {
    const values = new Float32Array(count * 3);
    let seed = 7127;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    for (let index = 0; index < count; index += 1) {
      const offset = index * 3;
      values[offset] = (random() - 0.5) * 24;
      values[offset + 1] = (random() - 0.5) * 15;
      values[offset + 2] = -4 - random() * 22;
    }
    return values;
  }, [count]);

  useFrame((_, delta) => {
    if (pointsRef.current && phase !== 'descent') {
      pointsRef.current.rotation.y += delta * 0.005;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#dbe8e5"
        size={isMobile ? 0.025 : 0.032}
        transparent
        opacity={phase === 'network' ? 0.56 : 0.34}
        depthWrite={false}
      />
    </points>
  );
}

function WorldBeacons({
  nodes,
  template,
  phase,
  onSelect,
}) {
  const [hoveredNode, setHoveredNode] = useState(null);
  const refs = useRef([]);
  const objects = useMemo(
    () => nodes.map(() => cloneAsset(template, true)),
    [nodes, template]
  );
  const placements = useMemo(
    () => nodes.map((node) => {
      const position = coordinateToVector(node.latitude, node.longitude, GLOBE_RADIUS + 0.09);
      return {
        position,
        quaternion: new THREE.Quaternion().setFromUnitVectors(
          UP,
          position.clone().normalize()
        ),
      };
    }),
    [nodes]
  );

  useEffect(() => {
    document.body.style.cursor = hoveredNode ? 'pointer' : '';
    return () => {
      document.body.style.cursor = '';
    };
  }, [hoveredNode]);

  useFrame(({ clock }, delta) => {
    refs.current.forEach((group, index) => {
      if (!group) return;
      const hovered = hoveredNode === nodes[index].id;
      const pulse = 1 + Math.sin(clock.elapsedTime * 3 + index) * 0.08;
      const targetScale = (hovered ? 0.34 : 0.24) * pulse;
      const nextScale = THREE.MathUtils.lerp(
        group.scale.x,
        targetScale,
        smoothFactor(8, delta)
      );
      group.scale.setScalar(nextScale);
    });
  });

  if (phase === 'intro') return null;

  return nodes.map((node, index) => (
    <group
      key={`${node.id}-${node.code}`}
      ref={(element) => {
        refs.current[index] = element;
      }}
      position={placements[index].position}
      quaternion={placements[index].quaternion}
      scale={0.24}
      onPointerOver={(event) => {
        if (phase !== 'globe') return;
        event.stopPropagation();
        setHoveredNode(node.id);
      }}
      onPointerOut={() => setHoveredNode(null)}
      onClick={(event) => {
        if (phase !== 'globe' || event.delta > 6) return;
        event.stopPropagation();
        onSelect(node);
      }}
    >
      <primitive object={objects[index]} />
    </group>
  ));
}

function CloudHalo({ texture, phase, isMobile }) {
  const groupRef = useRef(null);
  const opacity = phase === 'intro' ? 0.4 : phase === 'globe' ? 0.22 : 0.32;
  const clouds = useMemo(() => [
    { position: [-2.5, 1.5, 0.3], scale: [2.6, 1.55, 1], rotation: 0.12 },
    { position: [2.35, 0.82, -0.6], scale: [2.2, 1.35, 1], rotation: -0.26 },
    { position: [-1.8, -1.65, -0.25], scale: [2.45, 1.45, 1], rotation: -0.08 },
    { position: [1.95, -1.5, 0.2], scale: [2.7, 1.5, 1], rotation: 0.28 },
  ], []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.09) * 0.035;
  });

  if (phase === 'descent' || phase === 'network') return null;

  return (
    <group ref={groupRef} scale={isMobile ? 0.82 : 1}>
      {clouds.map((cloud, index) => (
        <sprite
          key={index}
          position={cloud.position}
          scale={cloud.scale}
          rotation={[0, 0, cloud.rotation]}
        >
          <spriteMaterial
            map={texture}
            transparent
            opacity={opacity}
            depthWrite={false}
            toneMapped={false}
          />
        </sprite>
      ))}
    </group>
  );
}

function StationOrbit({ station, phase, isMobile }) {
  const orbitRef = useRef(null);
  const stationObject = useMemo(() => cloneAsset(station), [station]);

  useFrame((_, delta) => {
    if (!orbitRef.current) return;
    orbitRef.current.rotation.y += delta * (phase === 'intro' ? 0.13 : 0.08);
    orbitRef.current.rotation.z += delta * 0.012;
  });

  if (phase === 'descent' || phase === 'network') return null;

  return (
    <group ref={orbitRef} rotation={[0.18, 0, -0.22]}>
      <primitive
        object={stationObject}
        position={[3.45, 1.1, 0]}
        rotation={[0.3, -0.6, 0.2]}
        scale={isMobile ? 0.42 : 0.56}
      />
    </group>
  );
}

function InteractiveGlobe({
  globe,
  nodeTemplate,
  nodes,
  selectedNode,
  phase,
  rotationCommand,
  isMobile,
  onNodeSelect,
}) {
  const globeRef = useRef(null);
  const dragging = useRef(false);
  const dragOrigin = useRef({ x: 0, y: 0, rotationX: 0, rotationY: 0 });
  const manualRotation = useRef({ x: 0.08, y: -0.72 });
  const phaseStart = usePhaseStart(phase);
  const globeObject = useMemo(() => {
    const clone = cloneAsset(globe, true);
    clone.traverse((child) => {
      if (!child.isMesh) return;
      if (child.name === 'GridSphere') {
        child.material = new THREE.MeshBasicMaterial({
          color: '#7fa9a8',
          transparent: true,
          opacity: 0.14,
          wireframe: true,
          depthWrite: false,
        });
      }
      if (child.name === 'MapSphere') {
        child.material.transparent = true;
        child.material.opacity = 0.96;
        child.material.emissiveIntensity = 0.78;
      }
      if (child.name === 'OceanSphere') {
        child.material.transparent = true;
        child.material.opacity = 0.94;
      }
    });
    return clone;
  }, [globe]);

  useEffect(() => {
    if (!rotationCommand) return;
    manualRotation.current.y += rotationCommand.direction * 0.48;
  }, [rotationCommand]);

  const handlePointerDown = useCallback((event) => {
    if (phase !== 'globe') return;
    event.stopPropagation();
    dragging.current = true;
    dragOrigin.current = {
      x: event.clientX,
      y: event.clientY,
      rotationX: manualRotation.current.x,
      rotationY: manualRotation.current.y,
    };
    event.target.setPointerCapture?.(event.pointerId);
  }, [phase]);

  const handlePointerMove = useCallback((event) => {
    if (!dragging.current || phase !== 'globe') return;
    const deltaX = event.clientX - dragOrigin.current.x;
    const deltaY = event.clientY - dragOrigin.current.y;
    manualRotation.current.y = dragOrigin.current.rotationY + deltaX * 0.007;
    manualRotation.current.x = THREE.MathUtils.clamp(
      dragOrigin.current.rotationX + deltaY * 0.005,
      -0.82,
      0.82
    );
  }, [phase]);

  const releasePointer = useCallback((event) => {
    dragging.current = false;
    event.target.releasePointerCapture?.(event.pointerId);
  }, []);

  useFrame((_, delta) => {
    if (!globeRef.current) return;
    const elapsed = (performance.now() - phaseStart.current) / 1000;

    if ((phase === 'targeting' || phase === 'descent') && selectedNode) {
      const target = coordinateRotation(selectedNode);
      globeRef.current.rotation.x = lerpAngle(
        globeRef.current.rotation.x,
        target.x,
        smoothFactor(3.6, delta)
      );
      globeRef.current.rotation.y = lerpAngle(
        globeRef.current.rotation.y,
        target.y,
        smoothFactor(3.6, delta)
      );
    } else {
      if (!dragging.current) {
        manualRotation.current.y += delta * (phase === 'intro' ? 0.04 : 0.018);
      }
      globeRef.current.rotation.x = lerpAngle(
        globeRef.current.rotation.x,
        manualRotation.current.x,
        smoothFactor(6, delta)
      );
      globeRef.current.rotation.y = lerpAngle(
        globeRef.current.rotation.y,
        manualRotation.current.y,
        smoothFactor(6, delta)
      );
    }

    const baseScale = isMobile ? 0.77 : 1;
    if (phase === 'descent') {
      const progress = easeInOutCubic(Math.min(1, elapsed / 2.35));
      globeRef.current.scale.setScalar(baseScale * THREE.MathUtils.lerp(1.16, 2.4, progress));
      globeRef.current.position.y = -progress * 0.9;
    } else {
      const targetScale = baseScale * (phase === 'targeting' ? 1.16 : phase === 'intro' ? 0.9 : 1);
      const nextScale = THREE.MathUtils.lerp(
        globeRef.current.scale.x,
        targetScale,
        smoothFactor(4, delta)
      );
      globeRef.current.scale.setScalar(nextScale);
      globeRef.current.position.y = THREE.MathUtils.lerp(
        globeRef.current.position.y,
        isMobile ? 0.15 : 0,
        smoothFactor(4, delta)
      );
    }
  });

  if (phase === 'network') return null;

  return (
    <group
      ref={globeRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={releasePointer}
      onPointerCancel={releasePointer}
    >
      <primitive object={globeObject} />
      <CountryBorders />
      <WorldBeacons
        nodes={nodes}
        template={nodeTemplate}
        phase={phase}
        onSelect={onNodeSelect}
      />
    </group>
  );
}

function DescentClouds({ textures, phase, reducedMotion }) {
  const sprites = useRef([]);
  const materials = useRef([]);
  const phaseStart = usePhaseStart(phase);
  const setup = useMemo(() => [
    { position: [-2.3, 1.4, 1.7], scale: [3.8, 2.5, 1], delay: 0 },
    { position: [2.1, -0.9, 2.45], scale: [4.3, 2.8, 1], delay: 0.12 },
    { position: [-0.5, 0.15, 3.05], scale: [4.8, 3.1, 1], delay: 0.24 },
  ], []);

  useFrame(() => {
    if (phase !== 'descent') return;
    const raw = reducedMotion
      ? 1
      : Math.min(1, (performance.now() - phaseStart.current) / 2350);
    setup.forEach((item, index) => {
      const sprite = sprites.current[index];
      const material = materials.current[index];
      if (!sprite || !material) return;
      const local = THREE.MathUtils.clamp((raw - item.delay) / (1 - item.delay), 0, 1);
      const progress = easeInOutCubic(local);
      sprite.position.set(
        item.position[0] + Math.sin(progress * Math.PI) * (index - 1) * 0.5,
        item.position[1] + (0.5 - index * 0.2) * progress,
        item.position[2] + progress * 4.8
      );
      const scale = 1 + progress * 2.8;
      sprite.scale.set(item.scale[0] * scale, item.scale[1] * scale, 1);
      material.opacity = Math.sin(local * Math.PI) * 0.92;
    });
  });

  if (phase !== 'descent') return null;

  return setup.map((item, index) => (
    <sprite
      key={index}
      ref={(element) => {
        sprites.current[index] = element;
      }}
      position={item.position}
      scale={item.scale}
      renderOrder={20 + index}
    >
      <spriteMaterial
        ref={(material) => {
          materials.current[index] = material;
        }}
        map={textures[index]}
        transparent
        opacity={0}
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </sprite>
  ));
}

function NetworkConstellation({ nodeTemplate, phase, onNodeSelect }) {
  const { activeSection, reducedMotion } = usePortfolioNavigation();
  const groupRef = useRef(null);
  const nodeRefs = useRef([]);
  const [hovered, setHovered] = useState(null);
  const objects = useMemo(
    () => PORTFOLIO_SECTIONS.map(() => cloneAsset(nodeTemplate, true)),
    [nodeTemplate]
  );
  const activeMeta = SECTION_BY_ID.get(activeSection) ?? PORTFOLIO_SECTIONS[0];

  const linePositions = useMemo(() => {
    const values = [];
    PORTFOLIO_CONNECTIONS.forEach(([sourceId, targetId]) => {
      const source = SECTION_BY_ID.get(sourceId).position;
      const target = SECTION_BY_ID.get(targetId).position;
      values.push(...source, ...target);
    });
    return new Float32Array(values);
  }, []);

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : '';
    return () => {
      document.body.style.cursor = '';
    };
  }, [hovered]);

  useFrame((state, delta) => {
    if (!groupRef.current || phase !== 'network') return;
    const activePosition = activeMeta.position;
    const targetX = -activePosition[0] - (state.size.width > 980 ? 1.25 : 0);
    const targetY = -activePosition[1];
    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      targetX,
      smoothFactor(2.8, delta)
    );
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      targetY,
      smoothFactor(2.8, delta)
    );
    if (!reducedMotion) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        state.pointer.x * 0.055,
        smoothFactor(2, delta)
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        -state.pointer.y * 0.035,
        smoothFactor(2, delta)
      );
    }

    nodeRefs.current.forEach((node, index) => {
      if (!node) return;
      const section = PORTFOLIO_SECTIONS[index];
      const selected = section.id === activeSection;
      const hoveredNode = section.id === hovered;
      const targetScale = selected ? 0.92 : hoveredNode ? 0.66 : 0.48;
      const nextScale = THREE.MathUtils.lerp(
        node.scale.x,
        targetScale,
        smoothFactor(7, delta)
      );
      node.scale.setScalar(nextScale);
      node.rotation.y += delta * (selected ? 0.55 : 0.18);
    });
  });

  if (phase !== 'network') return null;

  return (
    <group ref={groupRef}>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={linePositions}
            count={linePositions.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#91aaa7"
          transparent
          opacity={0.32}
          depthWrite={false}
        />
      </lineSegments>

      {PORTFOLIO_SECTIONS.map((section, index) => (
        <group
          key={section.id}
          ref={(element) => {
            nodeRefs.current[index] = element;
          }}
          position={section.position}
          scale={section.id === activeSection ? 0.92 : 0.48}
          onPointerOver={(event) => {
            event.stopPropagation();
            setHovered(section.id);
          }}
          onPointerOut={() => setHovered(null)}
          onClick={(event) => {
            if (event.delta > 6) return;
            event.stopPropagation();
            onNodeSelect(section.id);
          }}
        >
          <primitive object={objects[index]} />
        </group>
      ))}
    </group>
  );
}

function WorldScene({
  phase,
  worldNodes,
  selectedWorldNode,
  rotationCommand,
  isMobile,
  onWorldNodeSelect,
  onMapNodeSelect,
}) {
  const { reducedMotion } = usePortfolioNavigation();
  const [globeModel, stationModel, nodeModel] = useLoader(
    GLTFLoader,
    [GLOBE_URL, STATION_URL, NODE_URL]
  );
  const textures = useLoader(THREE.TextureLoader, CLOUD_URLS);
  const cloudFieldTexture = textures[0];
  const descentTextures = textures.slice(1);

  useEffect(() => {
    textures.forEach((texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
    });
  }, [textures]);

  const nodeTemplate = nodeModel.scene.getObjectByName('OrbitalNode');

  return (
    <>
      <color attach="background" args={['#000000']} />
      <fog attach="fog" args={['#000000', 12, 28]} />
      <hemisphereLight args={['#d8e5e1', '#020304', 0.72]} />
      <directionalLight color="#f5efe8" intensity={1.45} position={[4, 6, 7]} />
      <directionalLight color="#d7793c" intensity={0.5} position={[-4, -2, 3]} />
      <StarField isMobile={isMobile} phase={phase} />
      <InteractiveGlobe
        globe={globeModel.scene}
        nodeTemplate={nodeTemplate}
        nodes={worldNodes}
        selectedNode={selectedWorldNode}
        phase={phase}
        rotationCommand={rotationCommand}
        isMobile={isMobile}
        onNodeSelect={onWorldNodeSelect}
      />
      <CloudHalo texture={cloudFieldTexture} phase={phase} isMobile={isMobile} />
      <StationOrbit
        station={stationModel.scene}
        phase={phase}
        isMobile={isMobile}
      />
      <DescentClouds
        textures={descentTextures}
        phase={phase}
        reducedMotion={reducedMotion}
      />
      <NetworkConstellation
        nodeTemplate={nodeTemplate}
        phase={phase}
        onNodeSelect={onMapNodeSelect}
      />
      <CameraDirector phase={phase} isMobile={isMobile} />
    </>
  );
}

export default function PortfolioWorld({
  isMobile,
  phase,
  worldNodes,
  selectedWorldNode,
  rotationCommand,
  onWorldNodeSelect,
  onMapNodeSelect,
  onContextLost,
}) {
  return (
    <div
      className="world-canvas orbital-world-canvas"
      data-phase={phase}
      aria-hidden="true"
    >
      <Canvas
        camera={{
          position: [0, 0.2, isMobile ? 8.5 : 8.2],
          fov: isMobile ? 48 : 42,
          near: 0.1,
          far: 80,
        }}
        dpr={isMobile ? 1 : [1, 1.4]}
        performance={{ min: 0.55 }}
        gl={{
          alpha: false,
          antialias: !isMobile,
          powerPreference: 'high-performance',
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 0.94;
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.domElement.addEventListener('webglcontextlost', (event) => {
            event.preventDefault();
            onContextLost?.();
          }, { once: true });
        }}
      >
        <WorldScene
          phase={phase}
          worldNodes={worldNodes}
          selectedWorldNode={selectedWorldNode}
          rotationCommand={rotationCommand}
          isMobile={isMobile}
          onWorldNodeSelect={onWorldNodeSelect}
          onMapNodeSelect={onMapNodeSelect}
        />
      </Canvas>
    </div>
  );
}
