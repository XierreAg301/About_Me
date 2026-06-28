import { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  PORTFOLIO_CONNECTIONS,
  PORTFOLIO_SECTIONS,
  SECTION_BY_ID,
} from '../app/portfolioSections';
import usePortfolioNavigation from '../app/usePortfolioNavigation';

function CameraRig({ activeSection }) {
  const { camera } = useThree();
  const lookAt = useRef(new THREE.Vector3());
  const desiredPosition = useMemo(() => new THREE.Vector3(), []);
  const desiredLookAt = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const active = SECTION_BY_ID.get(activeSection) || PORTFOLIO_SECTIONS[0];
    desiredPosition.set(active.position[0] * 0.01, active.position[1] * 0.008, 7.6);
    desiredLookAt.set(active.position[0] * 0.012, active.position[1] * 0.01, 0);
    camera.position.lerp(desiredPosition, 0.035);
    lookAt.current.lerp(desiredLookAt, 0.04);
    camera.lookAt(lookAt.current);
  });

  return null;
}

function ConnectionLines() {
  const geometry = useMemo(() => {
    const vertices = [];
    PORTFOLIO_CONNECTIONS.forEach(([sourceId, targetId]) => {
      vertices.push(
        ...SECTION_BY_ID.get(sourceId).position,
        ...SECTION_BY_ID.get(targetId).position
      );
    });
    const nextGeometry = new THREE.BufferGeometry();
    nextGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    return nextGeometry;
  }, []);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial
        color="#596aff"
        transparent
        opacity={0.42}
        depthWrite={false}
      />
    </lineSegments>
  );
}

function NetworkNode({
  section,
  active,
  geometry,
  idleMaterial,
  activeMaterial,
  hoverMaterial,
  onSelect,
}) {
  const meshRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const pulse = active ? Math.sin(clock.elapsedTime * 2.2) * 0.06 : 0;
    const base = section.priority === 'featured' ? 1.42 : 1;
    meshRef.current.scale.setScalar(base + pulse);
    meshRef.current.rotation.y += active ? 0.006 : 0.002;
  });

  return (
    <group position={section.position}>
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={active ? activeMaterial : hovered ? hoverMaterial : idleMaterial}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(section.id);
        }}
        onPointerEnter={(event) => {
          event.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerLeave={() => {
          setHovered(false);
          document.body.style.cursor = '';
        }}
      />
      <mesh rotation={[Math.PI / 2, 0, 0]} scale={active ? 1.35 : 1}>
        <torusGeometry args={[0.42, 0.018, 8, 48]} />
        <meshBasicMaterial
          color={active ? '#30e8ff' : '#8057ff'}
          transparent
          opacity={active ? 0.9 : 0.32}
        />
      </mesh>
    </group>
  );
}

function ParticleDepth({ isMobile }) {
  const points = useRef(null);
  const positions = useMemo(() => {
    const count = isMobile ? 90 : 180;
    const values = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      const offset = index * 3;
      values[offset] = (Math.random() - 0.5) * 12;
      values[offset + 1] = (Math.random() - 0.5) * 9;
      values[offset + 2] = -1 - Math.random() * 5;
    }
    return values;
  }, [isMobile]);

  useFrame(() => {
    if (points.current) points.current.rotation.z += 0.00025;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={positions.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#77cfff"
        size={0.018}
        transparent
        opacity={0.5}
        depthWrite={false}
      />
    </points>
  );
}

function WorldScene({ isMobile }) {
  const { activeSection, navigateTo } = usePortfolioNavigation();
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(0.28, 1), []);
  const idleMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#342d76',
    emissive: '#221c68',
    emissiveIntensity: 0.9,
    roughness: 0.28,
    metalness: 0.55,
  }), []);
  const activeMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#8af5ff',
    emissive: '#20cce6',
    emissiveIntensity: 1.8,
    roughness: 0.16,
    metalness: 0.4,
  }), []);
  const hoverMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#a681ff',
    emissive: '#6b3fff',
    emissiveIntensity: 1.3,
    roughness: 0.2,
    metalness: 0.45,
  }), []);

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[2, 4, 6]} intensity={1.35} color="#a9efff" />
      <pointLight position={[-3, -2, 3]} intensity={5} color="#754bff" distance={9} />
      <ParticleDepth isMobile={isMobile} />
      <ConnectionLines />
      {PORTFOLIO_SECTIONS.map((section) => (
        <NetworkNode
          key={section.id}
          section={section}
          active={activeSection === section.id}
          geometry={geometry}
          idleMaterial={idleMaterial}
          activeMaterial={activeMaterial}
          hoverMaterial={hoverMaterial}
          onSelect={(id) => navigateTo(id, { source: 'canvas' })}
        />
      ))}
      <CameraRig activeSection={activeSection} />
    </>
  );
}

export default function PortfolioWorld({ isMobile, onContextLost }) {
  return (
    <div className="world-canvas" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 7.6], fov: 45, near: 0.1, far: 40 }}
        dpr={isMobile ? 1 : [1, 1.5]}
        performance={{ min: 0.5 }}
        gl={{
          alpha: true,
          antialias: !isMobile,
          powerPreference: 'high-performance',
        }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', (event) => {
            event.preventDefault();
            onContextLost?.();
          }, { once: true });
        }}
      >
        <WorldScene isMobile={isMobile} />
      </Canvas>
    </div>
  );
}
