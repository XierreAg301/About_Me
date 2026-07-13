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
import countriesUrl from 'world-atlas/countries-50m.json?url';
import * as THREE from 'three';
import {
  PORTFOLIO_CONNECTIONS,
  PORTFOLIO_SECTIONS,
  SECTION_BY_ID,
} from '../app/portfolioSections';
import usePortfolioNavigation from '../app/usePortfolioNavigation';

const BASE_URL = import.meta.env.BASE_URL;
const GLOBE_URL = `${BASE_URL}models/digital-globe.glb?v=3`;
const STATION_URL = `${BASE_URL}models/space-station-web.glb?v=2`;
const NODE_URL = `${BASE_URL}models/orbital-node.glb?v=1`;
const EARTH_URL = `${BASE_URL}textures/nasa-black-marble-2016.jpg`;
const TARGETING_SECONDS = 1.9;
const DESCENT_SECONDS = 3.2;
const ARRIVAL_SECONDS = 0.9;
const ENABLE_DESCENT_CLOUDS = true;
const ENABLE_DESCENT_VELOCITY = false;
const DESCENT_CLOUD_URLS = [
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
  const [topology, setTopology] = useState(null);

  useEffect(() => {
    let active = true;
    fetch(countriesUrl)
      .then((response) => {
        if (!response.ok) throw new Error(`Country topology failed: ${response.status}`);
        return response.json();
      })
      .then((value) => {
        if (active) setTopology(value);
      })
      .catch(() => {
        if (active) setTopology(null);
      });
    return () => {
      active = false;
    };
  }, []);

  const { coastlinePositions, borderPositions } = useMemo(() => {
    if (!topology) {
      return {
        coastlinePositions: null,
        borderPositions: null,
      };
    }

    const toPositions = (mesh, radius) => {
      const values = [];
      mesh.coordinates.forEach((line) => {
        for (let index = 1; index < line.length; index += 1) {
          const start = coordinateToVector(
            line[index - 1][1],
            line[index - 1][0],
            radius
          );
          const end = coordinateToVector(
            line[index][1],
            line[index][0],
            radius
          );
          values.push(start.x, start.y, start.z, end.x, end.y, end.z);
        }
      });
      return new Float32Array(values);
    };

    const coastlines = topoMesh(
      topology,
      topology.objects.countries,
      (left, right) => left === right
    );
    const internalBorders = topoMesh(
      topology,
      topology.objects.countries,
      (left, right) => left !== right
    );

    return {
      coastlinePositions: toPositions(coastlines, 2.042),
      borderPositions: toPositions(internalBorders, 2.043),
    };
  }, [topology]);

  if (!coastlinePositions || !borderPositions) return null;

  return (
    <group>
      <lineSegments renderOrder={8} raycast={() => null}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={borderPositions}
            count={borderPositions.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#b7cfcc"
          transparent
          opacity={0.24}
          depthTest
          depthWrite={false}
          toneMapped={false}
        />
      </lineSegments>
      <lineSegments renderOrder={9} raycast={() => null}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={coastlinePositions}
            count={coastlinePositions.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#edf8f5"
          transparent
          opacity={0.54}
          depthTest
          depthWrite={false}
          toneMapped={false}
        />
      </lineSegments>
    </group>
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

    if (phase === 'globe') {
      desiredPosition.set(0, 0.08, isMobile ? 8.1 : 7.8);
      desiredLookAt.set(0, 0, 0);
    } else if (phase === 'targeting') {
      const progress = easeInOutCubic(Math.min(1, elapsed / TARGETING_SECONDS));
      desiredPosition.set(0, 0.04, THREE.MathUtils.lerp(
        isMobile ? 8.1 : 7.8,
        isMobile ? 6.1 : 5.2,
        progress
      ));
      desiredLookAt.set(0, 0, 0);
      targetFov = THREE.MathUtils.lerp(isMobile ? 47 : 42, 34, progress);
    } else if (phase === 'descent') {
      const progress = easeInOutCubic(Math.min(1, elapsed / DESCENT_SECONDS));
      desiredPosition.set(
        0,
        -progress * 0.34,
        THREE.MathUtils.lerp(isMobile ? 6.1 : 5.2, isMobile ? 2.65 : 2.35, progress)
      );
      desiredLookAt.set(0, -progress * 0.24, -progress * 0.46);
      targetFov = THREE.MathUtils.lerp(34, 70, progress);
    } else if (phase === 'arrival') {
      const progress = easeInOutCubic(Math.min(1, elapsed / ARRIVAL_SECONDS));
      desiredPosition.set(
        isMobile ? 0 : THREE.MathUtils.lerp(0, 0.4, progress),
        THREE.MathUtils.lerp(0, 0.18, progress),
        THREE.MathUtils.lerp(isMobile ? 13.8 : 13.2, isMobile ? 11.4 : 10.3, progress)
      );
      desiredLookAt.set(isMobile ? 0 : -0.45 * progress, 0, 0);
      targetFov = THREE.MathUtils.lerp(62, isMobile ? 48 : 43, progress);
    } else {
      desiredPosition.set(isMobile ? 0 : 0.4, 0.18, isMobile ? 11.4 : 10.3);
      desiredLookAt.set(isMobile ? 0 : -0.45, 0, 0);
      targetFov = isMobile ? 48 : 43;
    }

    camera.position.lerp(desiredPosition, smoothFactor(phase === 'descent' ? 6.2 : 4.2, delta));
    lookAt.current.lerp(desiredLookAt, smoothFactor(4.8, delta));
    camera.lookAt(lookAt.current);
    camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, smoothFactor(4, delta));
    camera.updateProjectionMatrix();
  });

  return null;
}

function WorldBeacons({
  nodes,
  template,
  selectedNode,
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

  return nodes.map((node, index) => {
    if (phase !== 'globe' && node.id !== selectedNode?.id) return null;
    return (
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
    );
  });
}

function StationOrbit({ station, phase, isMobile }) {
  const orbitRef = useRef(null);
  const stationObject = useMemo(() => cloneAsset(station), [station]);

  useFrame((_, delta) => {
    if (!orbitRef.current) return;
    orbitRef.current.rotation.y += delta * 0.055;
    orbitRef.current.rotation.z += delta * 0.008;
  });

  if (phase !== 'globe') return null;

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
  earthTexture,
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
      child.raycast = () => null;
      if (child.name === 'GridSphere') {
        child.material = new THREE.MeshBasicMaterial({
          color: '#7fa9a8',
          transparent: true,
          opacity: 0.08,
          wireframe: true,
          depthWrite: false,
        });
      }
      if (child.name === 'MapSphere') {
        child.material = new THREE.MeshStandardMaterial({
          map: earthTexture,
          color: '#9bbfbd',
          emissive: '#ffffff',
          emissiveMap: earthTexture,
          emissiveIntensity: 0.64,
          metalness: 0.08,
          roughness: 0.82,
          transparent: false,
          depthWrite: true,
        });
      }
      if (child.name === 'OceanSphere') {
        child.visible = false;
      }
    });
    return clone;
  }, [earthTexture, globe]);

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
    event.stopPropagation();
    const deltaX = event.clientX - dragOrigin.current.x;
    const deltaY = event.clientY - dragOrigin.current.y;
    manualRotation.current.y = dragOrigin.current.rotationY + deltaX * 0.007;
    manualRotation.current.x = THREE.MathUtils.clamp(
      dragOrigin.current.rotationX + deltaY * 0.005,
      -0.82,
      0.82
    );
    if (globeRef.current) {
      globeRef.current.rotation.x = manualRotation.current.x;
      globeRef.current.rotation.y = manualRotation.current.y;
    }
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
      if (dragging.current) {
        globeRef.current.rotation.x = manualRotation.current.x;
        globeRef.current.rotation.y = manualRotation.current.y;
      } else {
        manualRotation.current.y += delta * 0.014;
        globeRef.current.rotation.x = lerpAngle(
          globeRef.current.rotation.x,
          manualRotation.current.x,
          smoothFactor(9, delta)
        );
        globeRef.current.rotation.y = lerpAngle(
          globeRef.current.rotation.y,
          manualRotation.current.y,
          smoothFactor(9, delta)
        );
      }
    }

    const baseScale = isMobile ? 0.77 : 1;
    if (phase === 'descent') {
      const progress = easeInOutCubic(Math.min(1, elapsed / DESCENT_SECONDS));
      globeRef.current.visible = progress < 0.62;
      globeRef.current.scale.setScalar(baseScale * THREE.MathUtils.lerp(1.12, 2.85, progress));
      globeRef.current.position.y = -progress * 0.72;
    } else {
      globeRef.current.visible = true;
      const targetScale = baseScale * (phase === 'targeting' ? 1.12 : 1);
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

  if (phase === 'arrival' || phase === 'network') return null;

  return (
    <group ref={globeRef}>
      <primitive object={globeObject} />
      <CountryBorders />
      <mesh
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={releasePointer}
        onPointerCancel={releasePointer}
      >
        <sphereGeometry args={[GLOBE_RADIUS, 32, 18]} />
        <meshBasicMaterial
          transparent
          opacity={0}
          depthWrite={false}
          colorWrite={false}
        />
      </mesh>
      <WorldBeacons
        nodes={nodes}
        template={nodeTemplate}
        selectedNode={selectedNode}
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
    { position: [-2.7, 1.05, 0.3], scale: [2.35, 1.35, 1], delay: 0.08, drift: 0.38 },
    { position: [2.6, -0.85, 0.5], scale: [2.55, 1.45, 1], delay: 0.2, drift: -0.34 },
    { position: [-1.15, -1.35, 0.75], scale: [2.7, 1.5, 1], delay: 0.34, drift: 0.24 },
    { position: [1.25, 1.25, 0.9], scale: [2.65, 1.5, 1], delay: 0.48, drift: -0.22 },
  ], []);

  useFrame(() => {
    if (phase !== 'descent') return;
    const raw = reducedMotion
      ? 1
      : Math.min(1, (performance.now() - phaseStart.current) / (DESCENT_SECONDS * 1000));
    setup.forEach((item, index) => {
      const sprite = sprites.current[index];
      const material = materials.current[index];
      if (!sprite || !material) return;
      const local = THREE.MathUtils.clamp((raw - item.delay) / (1 - item.delay), 0, 1);
      const progress = easeInOutCubic(local);
      sprite.position.set(
        item.position[0] + Math.sin(progress * Math.PI) * item.drift,
        item.position[1] + (index % 2 === 0 ? 0.16 : -0.16) * progress,
        item.position[2] + progress * 4.2
      );
      const scale = 1 + progress * 1.45;
      sprite.scale.set(item.scale[0] * scale, item.scale[1] * scale, 1);
      material.opacity = Math.sin(local * Math.PI) * 0.34;
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
        map={textures[index % textures.length]}
        transparent
        opacity={0}
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </sprite>
  ));
}

function DescentVelocity({ phase, reducedMotion }) {
  const geometryRef = useRef(null);
  const materialRef = useRef(null);
  const phaseStart = usePhaseStart(phase);
  const positions = useMemo(() => {
    const values = new Float32Array(72 * 6);
    let seed = 8173;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    for (let index = 0; index < 72; index += 1) {
      const angle = random() * Math.PI * 2;
      const radius = 0.85 + random() * 4.8;
      const z = -3.5 + random() * 7;
      const length = 0.35 + random() * 1.15;
      const offset = index * 6;
      values[offset] = Math.cos(angle) * radius;
      values[offset + 1] = Math.sin(angle) * radius;
      values[offset + 2] = z;
      values[offset + 3] = Math.cos(angle) * radius;
      values[offset + 4] = Math.sin(angle) * radius;
      values[offset + 5] = z + length;
    }
    return values;
  }, []);

  useFrame((_, delta) => {
    if (phase !== 'descent' || !geometryRef.current || !materialRef.current) return;
    const progress = reducedMotion
      ? 1
      : Math.min(1, (performance.now() - phaseStart.current) / (DESCENT_SECONDS * 1000));
    const attribute = geometryRef.current.attributes.position;
    for (let index = 0; index < attribute.count; index += 2) {
      let startZ = attribute.getZ(index) + delta * (5 + progress * 13);
      let endZ = attribute.getZ(index + 1) + delta * (5 + progress * 13);
      if (startZ > 5.2) {
        const length = endZ - startZ;
        startZ = -4.2;
        endZ = startZ + length;
      }
      attribute.setZ(index, startZ);
      attribute.setZ(index + 1, endZ);
    }
    attribute.needsUpdate = true;
    materialRef.current.opacity = Math.sin(progress * Math.PI) * 0.52;
  });

  if (phase !== 'descent') return null;

  return (
    <lineSegments renderOrder={18}>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={positions.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        ref={materialRef}
        color="#d8f4ef"
        transparent
        opacity={0}
        depthTest={false}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </lineSegments>
  );
}

function NetworkConstellation({ nodeTemplate, phase, onNodeSelect }) {
  const { activeSection, reducedMotion } = usePortfolioNavigation();
  const groupRef = useRef(null);
  const lineMaterialRef = useRef(null);
  const nodeRefs = useRef([]);
  const phaseStart = usePhaseStart(phase);
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
    if (!groupRef.current || (phase !== 'arrival' && phase !== 'network')) return;
    const activePosition = activeMeta.position;
    const targetX = -activePosition[0] - (state.size.width > 980 ? 1.25 : 0);
    const targetY = -activePosition[1];
    const arrivalProgress = phase === 'arrival'
      ? easeInOutCubic(Math.min(
        1,
        (performance.now() - phaseStart.current) / (ARRIVAL_SECONDS * 1000)
      ))
      : 1;

    if (phase === 'arrival') {
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(0.12, 1, arrivalProgress));
      groupRef.current.position.z = THREE.MathUtils.lerp(-8, 0, arrivalProgress);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(-0.34, 0, arrivalProgress);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(0.16, 0, arrivalProgress);
    } else {
      groupRef.current.scale.setScalar(1);
      groupRef.current.position.z = 0;
      groupRef.current.rotation.z = 0;
    }
    if (lineMaterialRef.current) {
      lineMaterialRef.current.opacity = arrivalProgress * 0.32;
    }
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
    if (!reducedMotion && phase === 'network') {
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

  if (phase !== 'arrival' && phase !== 'network') return null;

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
          ref={lineMaterialRef}
          color="#91aaa7"
          transparent
          opacity={phase === 'arrival' ? 0 : 0.32}
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
  const earthTexture = useLoader(THREE.TextureLoader, EARTH_URL);
  const descentTextures = useLoader(THREE.TextureLoader, DESCENT_CLOUD_URLS);

  useEffect(() => {
    earthTexture.colorSpace = THREE.SRGBColorSpace;
    earthTexture.flipY = false;
    earthTexture.wrapS = THREE.RepeatWrapping;
    earthTexture.anisotropy = 4;
    earthTexture.needsUpdate = true;
    descentTextures.forEach((texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.needsUpdate = true;
    });
  }, [descentTextures, earthTexture]);

  const nodeTemplate = nodeModel.scene.getObjectByName('OrbitalNode');

  return (
    <>
      <fog attach="fog" args={['#030507', 14, 30]} />
      <hemisphereLight args={['#d8e5e1', '#020304', 0.72]} />
      <directionalLight color="#f5efe8" intensity={1.45} position={[4, 6, 7]} />
      <directionalLight color="#d7793c" intensity={0.5} position={[-4, -2, 3]} />
      <InteractiveGlobe
        globe={globeModel.scene}
        earthTexture={earthTexture}
        nodeTemplate={nodeTemplate}
        nodes={worldNodes}
        selectedNode={selectedWorldNode}
        phase={phase}
        rotationCommand={rotationCommand}
        isMobile={isMobile}
        onNodeSelect={onWorldNodeSelect}
      />
      <StationOrbit
        station={stationModel.scene}
        phase={phase}
        isMobile={isMobile}
      />
      {ENABLE_DESCENT_CLOUDS ? (
        <DescentClouds
          textures={descentTextures}
          phase={phase}
          reducedMotion={reducedMotion}
        />
      ) : null}
      {ENABLE_DESCENT_VELOCITY ? (
          <DescentVelocity phase={phase} reducedMotion={reducedMotion} />
      ) : null}
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
          alpha: true,
          antialias: !isMobile,
          powerPreference: 'high-performance',
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x030507, 0);
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
