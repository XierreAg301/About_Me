import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import usePortfolioNavigation from '../app/usePortfolioNavigation';

const MODEL_URL = `${import.meta.env.BASE_URL}models/hacker-earth.glb?v=3`;

function smoothFactor(speed, delta) {
  return 1 - Math.exp(-speed * delta);
}

function CameraRig({ isMobile }) {
  const { activeSection, isPanelOpen } = usePortfolioNavigation();
  const { camera } = useThree();
  const lookAt = useRef(new THREE.Vector3());
  const desiredPosition = useMemo(() => new THREE.Vector3(), []);
  const desiredLookAt = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const sectionIndex = Number.parseInt(
      activeSection === 'hero' ? '0' : activeSection.length.toString(),
      10
    );
    const panelShift = isPanelOpen && !isMobile ? 1.35 : 0;

    desiredPosition.set(
      isMobile ? 0 : -panelShift * 0.22,
      isMobile ? 0.1 : 0.15,
      isMobile ? 10.8 : isPanelOpen ? 8.4 : 9.2
    );
    desiredLookAt.set(
      isMobile ? 0 : panelShift,
      isMobile ? 0.25 : 0,
      sectionIndex * 0.005
    );

    camera.position.lerp(desiredPosition, smoothFactor(3.4, delta));
    lookAt.current.lerp(desiredLookAt, smoothFactor(3.7, delta));
    camera.lookAt(lookAt.current);

    const targetFov = isMobile ? 46 : isPanelOpen ? 41 : 44;
    camera.fov = THREE.MathUtils.lerp(
      camera.fov,
      targetFov,
      smoothFactor(4, delta)
    );
    camera.updateProjectionMatrix();
  });

  return null;
}

function BlenderEarth({ isMobile }) {
  const { activeSection, isPanelOpen } = usePortfolioNavigation();
  const model = useLoader(GLTFLoader, MODEL_URL);
  const groupRef = useRef(null);
  const scene = useMemo(() => model.scene.clone(true), [model.scene]);
  const sectionAngle = useMemo(() => ({
    hero: -0.25,
    about: 0.52,
    skills: 1.24,
    background: 2.04,
    projects: 2.86,
    certificates: 3.68,
    contact: 4.46,
  }), []);

  useEffect(() => {
    scene.traverse((child) => {
      if (!child.isMesh) return;
      child.frustumCulled = true;
      child.castShadow = false;
      child.receiveShadow = false;
    });
  }, [scene]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const targetRotation = sectionAngle[activeSection] ?? sectionAngle.hero;
    const idleRotation = isPanelOpen ? targetRotation : targetRotation + performance.now() * 0.000035;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      idleRotation,
      smoothFactor(isPanelOpen ? 3.2 : 1.2, delta)
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      isPanelOpen ? 0.12 : 0.04,
      smoothFactor(2.5, delta)
    );
  });

  return (
    <group
      ref={groupRef}
      scale={isMobile ? 0.72 : 1}
      position={[isMobile ? 0 : -0.15, isMobile ? 0.35 : -0.1, 0]}
    >
      <primitive object={scene} />
    </group>
  );
}

function StarField({ isMobile }) {
  const pointsRef = useRef(null);
  const count = isMobile ? 380 : 760;
  const positions = useMemo(() => {
    const values = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      const offset = index * 3;
      values[offset] = (Math.random() - 0.5) * 24;
      values[offset + 1] = (Math.random() - 0.5) * 15;
      values[offset + 2] = -5 - Math.random() * 20;
    }
    return values;
  }, [count]);

  useFrame((_, delta) => {
    if (pointsRef.current) pointsRef.current.rotation.y += delta * 0.006;
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
        color="#f2e7d4"
        size={isMobile ? 0.035 : 0.045}
        transparent
        opacity={0.7}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function WorldScene({ isMobile }) {
  return (
    <>
      <color attach="background" args={['#050507']} />
      <fog attach="fog" args={['#050507', 11, 28]} />
      <ambientLight color="#dbe2ef" intensity={1.45} />
      <directionalLight color="#ffffff" intensity={2.4} position={[5, 7, 8]} />
      <directionalLight color="#d81236" intensity={2.1} position={[-5, -2, 4]} />
      <StarField isMobile={isMobile} />
      <BlenderEarth isMobile={isMobile} />
      <gridHelper
        args={[28, 28, '#4a0b16', '#1d1e24']}
        position={[0, -3.35, -1.6]}
      />
      <CameraRig isMobile={isMobile} />
    </>
  );
}

export default function PortfolioWorld({ isMobile, onContextLost }) {
  const { isPanelOpen } = usePortfolioNavigation();

  return (
    <div
      className="world-canvas blender-world-canvas"
      data-panel-open={isPanelOpen}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0.15, isMobile ? 10.8 : 9.2], fov: isMobile ? 46 : 44, near: 0.1, far: 80 }}
        dpr={isMobile ? 1 : [1, 1.5]}
        performance={{ min: 0.55 }}
        gl={{
          alpha: false,
          antialias: !isMobile,
          powerPreference: 'high-performance',
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.22;
          gl.outputColorSpace = THREE.SRGBColorSpace;
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
