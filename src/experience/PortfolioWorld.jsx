import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  PORTFOLIO_CONNECTIONS,
  PORTFOLIO_SECTIONS,
  SECTION_BY_ID,
} from '../app/portfolioSections';
import usePortfolioNavigation from '../app/usePortfolioNavigation';

const PORTAL_VERTEX_SHADER = `
  uniform float uTime;
  uniform float uIntensity;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vPosition;

  void main() {
    float ripple = sin(position.y * 8.0 + uTime * 2.1)
      * cos(position.x * 7.0 - uTime * 1.4) * 0.035 * uIntensity;
    vec3 displaced = position + normal * ripple;
    vec4 modelPosition = modelMatrix * vec4(displaced, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-viewPosition.xyz);
    vPosition = displaced;
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const PORTAL_FRAGMENT_SHADER = `
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uIntensity;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vPosition;

  void main() {
    float fresnel = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.5);
    float bands = 0.55 + 0.45 * sin(
      length(vPosition.xy) * 18.0 - uTime * 3.2 + vPosition.z * 7.0
    );
    float core = smoothstep(0.62, 0.05, length(vPosition));
    vec3 color = uColor * (0.8 + fresnel * 2.3 + bands * 0.35 + core * uIntensity);
    float alpha = 0.42 + fresnel * 0.5 + core * 0.22;
    gl_FragColor = vec4(color, alpha);
  }
`;

const STAR_VERTEX_SHADER = `
  uniform float uTime;
  uniform float uFlight;
  attribute float aScale;
  varying float vAlpha;

  void main() {
    vec3 p = position;
    float speed = 0.4 + uFlight * 13.0;
    p.z = mod(p.z + uTime * speed + 26.0, 36.0) - 26.0;
    float tunnel = 1.0 + uFlight * max(0.0, (p.z + 12.0) / 18.0) * 0.8;
    p.xy *= tunnel;

    vec4 viewPosition = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = aScale * (1.2 + uFlight * 2.8) * (34.0 / max(2.0, -viewPosition.z));
    vAlpha = smoothstep(-26.0, -17.0, p.z) * smoothstep(10.0, 3.0, p.z);
  }
`;

const STAR_FRAGMENT_SHADER = `
  varying float vAlpha;

  void main() {
    vec2 point = gl_PointCoord - 0.5;
    float distanceToCenter = length(point);
    float glow = smoothstep(0.5, 0.0, distanceToCenter);
    gl_FragColor = vec4(1.0, 0.92, 0.76, glow * vAlpha);
  }
`;

const NEBULA_VERTEX_SHADER = `
  varying vec3 vWorldPosition;

  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const NEBULA_FRAGMENT_SHADER = `
  uniform float uTime;
  varying vec3 vWorldPosition;

  void main() {
    vec3 direction = normalize(vWorldPosition);
    float aurora = sin(direction.x * 8.0 + uTime * 0.06)
      * cos(direction.y * 7.0 - uTime * 0.04);
    float cloud = smoothstep(-0.65, 0.9, aurora + direction.y * 0.8);
    vec3 voidColor = vec3(0.018, 0.018, 0.024);
    vec3 violet = vec3(0.13, 0.045, 0.30);
    vec3 ember = vec3(0.24, 0.06, 0.07);
    vec3 color = mix(voidColor, violet, cloud * 0.32);
    color = mix(color, ember, max(direction.x, 0.0) * cloud * 0.24);
    gl_FragColor = vec4(color, 1.0);
  }
`;

function smoothFactor(speed, delta) {
  return 1 - Math.exp(-speed * delta);
}

function CameraFlight({ isMobile }) {
  const { activeSection, isPanelOpen } = usePortfolioNavigation();
  const { camera } = useThree();
  const flight = useRef(isPanelOpen ? 1 : 0);
  const lookAt = useRef(new THREE.Vector3());
  const mapPosition = useMemo(() => new THREE.Vector3(), []);
  const entryPosition = useMemo(() => new THREE.Vector3(), []);
  const desiredPosition = useMemo(() => new THREE.Vector3(), []);
  const mapLookAt = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const entryLookAt = useMemo(() => new THREE.Vector3(), []);
  const desiredLookAt = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ pointer }, delta) => {
    const active = SECTION_BY_ID.get(activeSection) || PORTFOLIO_SECTIONS[0];
    const worldX = active.position[0] * (isMobile ? 0.33 : 1);
    const sceneOffsetX = isMobile ? 0 : 0.85;
    const sceneOffsetY = isMobile ? 3 : 0;
    const contentOnRight = Number(active.index) % 2 === 1;
    const cameraSide = contentOnRight ? 1 : -1;
    const targetFlight = isPanelOpen ? 1 : 0;
    const overviewZoom = typeof window === 'undefined'
      ? 0
      : THREE.MathUtils.clamp(
        window.scrollY / Math.max(window.innerHeight * 0.72, 1),
        0,
        1
      );
    flight.current = THREE.MathUtils.lerp(
      flight.current,
      targetFlight,
      smoothFactor(isPanelOpen ? 2.4 : 3.1, delta)
    );

    const progress = flight.current * flight.current * (3 - 2 * flight.current);
    mapPosition.set(
      pointer.x * (isMobile ? 0.08 : 0.42),
      pointer.y * (isMobile ? 0.06 : 0.26),
      THREE.MathUtils.lerp(isMobile ? 13.8 : 13.2, isMobile ? 9.6 : 8.4, overviewZoom)
    );
    mapLookAt.set(sceneOffsetX * 0.55, isMobile ? 0.35 : 0, 0);
    entryPosition.set(
      worldX + sceneOffsetX + cameraSide * (isMobile ? 0.35 : 2.15),
      active.position[1] + sceneOffsetY + 0.25,
      active.position[2] + 3.15
    );
    entryLookAt.set(
      worldX + sceneOffsetX + cameraSide * (isMobile ? 0 : 0.88),
      active.position[1] + sceneOffsetY,
      active.position[2]
    );

    desiredPosition.lerpVectors(mapPosition, entryPosition, progress);
    desiredLookAt.lerpVectors(mapLookAt, entryLookAt, progress);

    camera.position.lerp(desiredPosition, smoothFactor(4.2, delta));
    lookAt.current.lerp(desiredLookAt, smoothFactor(4.6, delta));
    camera.lookAt(lookAt.current);

    const overviewFov = THREE.MathUtils.lerp(52, 44, overviewZoom);
    const nextFov = THREE.MathUtils.lerp(overviewFov, 38, progress);
    if (Math.abs(camera.fov - nextFov) > 0.01) {
      camera.fov = nextFov;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}

function NebulaField() {
  const materialRef = useRef(null);
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
  }), []);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.elapsedTime;
    }
  });

  return (
    <mesh scale={28}>
      <sphereGeometry args={[1, 32, 20]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={NEBULA_VERTEX_SHADER}
        fragmentShader={NEBULA_FRAGMENT_SHADER}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}

function WarpStars({ isMobile }) {
  const materialRef = useRef(null);
  const { isPanelOpen } = usePortfolioNavigation();
  const count = isMobile ? 420 : 920;
  const [positions, scales] = useMemo(() => {
    const nextPositions = new Float32Array(count * 3);
    const nextScales = new Float32Array(count);
    for (let index = 0; index < count; index += 1) {
      const offset = index * 3;
      nextPositions[offset] = (Math.random() - 0.5) * 20;
      nextPositions[offset + 1] = (Math.random() - 0.5) * 12;
      nextPositions[offset + 2] = -26 + Math.random() * 36;
      nextScales[index] = 0.65 + Math.random() * 1.55;
    }
    return [nextPositions, nextScales];
  }, [count]);
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uFlight: { value: 0 },
  }), []);

  useFrame(({ clock }, delta) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value = clock.elapsedTime;
    materialRef.current.uniforms.uFlight.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uFlight.value,
      isPanelOpen ? 1 : 0,
      smoothFactor(2.8, delta)
    );
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScale"
          array={scales}
          count={count}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={STAR_VERTEX_SHADER}
        fragmentShader={STAR_FRAGMENT_SHADER}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function ConnectionNetwork() {
  const materialRef = useRef(null);
  const { isPanelOpen } = usePortfolioNavigation();
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

  useFrame((_, delta) => {
    if (!materialRef.current) return;
    materialRef.current.opacity = THREE.MathUtils.lerp(
      materialRef.current.opacity,
      isPanelOpen ? 0.18 : 0.58,
      smoothFactor(4, delta)
    );
  });

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial
        ref={materialRef}
        color="#cdb98a"
        transparent
        opacity={0.58}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
}

function DataPackets() {
  const pointsRef = useRef(null);
  const { isPanelOpen } = usePortfolioNavigation();
  const packetCount = PORTFOLIO_CONNECTIONS.length * 2;
  const positions = useMemo(() => new Float32Array(packetCount * 3), [packetCount]);
  const phases = useMemo(
    () => Array.from({ length: packetCount }, (_, index) => (index * 0.417) % 1),
    [packetCount]
  );

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const speed = isPanelOpen ? 0.08 : 0.17;
    PORTFOLIO_CONNECTIONS.forEach(([sourceId, targetId], edgeIndex) => {
      const source = SECTION_BY_ID.get(sourceId).position;
      const target = SECTION_BY_ID.get(targetId).position;
      for (let packet = 0; packet < 2; packet += 1) {
        const index = edgeIndex * 2 + packet;
        const offset = index * 3;
        const progress = (clock.elapsedTime * speed + phases[index]) % 1;
        positions[offset] = THREE.MathUtils.lerp(source[0], target[0], progress);
        positions[offset + 1] = THREE.MathUtils.lerp(source[1], target[1], progress);
        positions[offset + 2] = THREE.MathUtils.lerp(source[2], target[2], progress);
      }
    });
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={packetCount}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#ffd98a"
        size={0.075}
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function PortalNode({ section, geometry, onHover }) {
  const groupRef = useRef(null);
  const materialRef = useRef(null);
  const ringOneRef = useRef(null);
  const ringTwoRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const {
    activeSection,
    isPanelOpen,
    navigateTo,
    setFocusedSection,
  } = usePortfolioNavigation();
  const active = isPanelOpen && activeSection === section.id;
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uIntensity: { value: 1 },
    uColor: { value: new THREE.Color(section.color) },
  }), [section.color]);

  useEffect(() => () => {
    document.body.style.cursor = '';
  }, []);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current || !materialRef.current) return;
    const baseScale = section.priority === 'featured' ? 1.2 : 1;
    const targetScale = active ? 2.05 : hovered ? baseScale * 1.28 : baseScale;
    const nextScale = THREE.MathUtils.lerp(
      groupRef.current.scale.x,
      targetScale,
      smoothFactor(active ? 3.2 : 7, delta)
    );
    groupRef.current.scale.setScalar(nextScale);
    groupRef.current.position.y = section.position[1]
      + Math.sin(clock.elapsedTime * 0.85 + Number(section.index)) * 0.045;
    materialRef.current.uniforms.uTime.value = clock.elapsedTime;
    materialRef.current.uniforms.uIntensity.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uIntensity.value,
      active ? 2.4 : hovered ? 1.55 : 1,
      smoothFactor(5, delta)
    );
    if (ringOneRef.current) ringOneRef.current.rotation.z += delta * (active ? 1.1 : 0.24);
    if (ringTwoRef.current) ringTwoRef.current.rotation.x -= delta * (active ? 0.8 : 0.16);
  });

  return (
    <group ref={groupRef} position={section.position}>
      <mesh
        geometry={geometry}
        onClick={(event) => {
          event.stopPropagation();
          navigateTo(section.id, { source: 'canvas' });
        }}
        onPointerEnter={(event) => {
          event.stopPropagation();
          if (isPanelOpen) return;
          setHovered(true);
          setFocusedSection(section.id);
          onHover?.(section);
          document.body.style.cursor = 'pointer';
        }}
        onPointerLeave={() => {
          setHovered(false);
          onHover?.(null);
          document.body.style.cursor = '';
        }}
      >
        <shaderMaterial
          ref={materialRef}
          uniforms={uniforms}
          vertexShader={PORTAL_VERTEX_SHADER}
          fragmentShader={PORTAL_FRAGMENT_SHADER}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh geometry={geometry} scale={1.18}>
        <meshBasicMaterial
          color={section.color}
          wireframe
          transparent
          opacity={active ? 0.52 : 0.2}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={ringOneRef} rotation={[Math.PI / 2.5, 0.25, 0]} scale={1.45}>
        <torusGeometry args={[0.42, 0.014, 8, 64]} />
        <meshBasicMaterial
          color={section.color}
          transparent
          opacity={active ? 0.95 : 0.42}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh ref={ringTwoRef} rotation={[0.6, 0.2, Math.PI / 2]} scale={1.62}>
        <torusGeometry args={[0.42, 0.008, 8, 48]} />
        <meshBasicMaterial
          color={section.color}
          transparent
          opacity={active ? 0.72 : 0.2}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {active ? (
        <pointLight color={section.color} intensity={7} distance={5.5} decay={2} />
      ) : null}
    </group>
  );
}

function OrbitalGrid() {
  const groupRef = useRef(null);
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.z += delta * 0.018;
  });

  return (
    <group ref={groupRef} position={[0, 0, -2]} rotation={[0.9, 0.1, 0]}>
      {[2.4, 4.7, 7.2].map((radius, index) => (
        <mesh key={radius} rotation={[Math.PI / 2, 0, index * 0.45]}>
          <torusGeometry args={[radius, 0.008, 6, 128]} />
          <meshBasicMaterial
            color={index === 1 ? '#754dff' : '#b88a32'}
            transparent
            opacity={0.09}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function HackerGlobe({ isMobile }) {
  const groupRef = useRef(null);
  const scanRingRef = useRef(null);
  const earthTexture = useLoader(
    THREE.TextureLoader,
    `${import.meta.env.BASE_URL}textures/nasa-blue-marble-2048.jpg`
  );
  const radius = 2.15;
  const latitudes = [-1.45, -0.95, -0.48, 0, 0.48, 0.95, 1.45];
  const meridians = [0, Math.PI / 4, Math.PI / 2, (Math.PI * 3) / 4];

  useEffect(() => {
    earthTexture.colorSpace = THREE.SRGBColorSpace;
    earthTexture.anisotropy = 4;
    earthTexture.needsUpdate = true;
  }, [earthTexture]);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.055;
    groupRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.14) * 0.035;
    if (scanRingRef.current) {
      scanRingRef.current.rotation.z -= delta * 0.22;
      scanRingRef.current.rotation.x = 0.35 + Math.sin(clock.elapsedTime * 0.35) * 0.18;
    }
  });

  return (
    <group
      ref={groupRef}
      position={[isMobile ? 0 : 0.45, isMobile ? 0.65 : 0, -0.7]}
      rotation={[0.08, -0.62, 0]}
      scale={isMobile ? 0.7 : 1}
    >
      <mesh>
        <sphereGeometry args={[radius, isMobile ? 32 : 64, isMobile ? 20 : 40]} />
        <meshStandardMaterial
          map={earthTexture}
          color="#d15362"
          emissive="#500713"
          emissiveIntensity={0.52}
          metalness={0.64}
          roughness={0.58}
          transparent
          opacity={0.68}
        />
      </mesh>

      <mesh scale={1.012}>
        <sphereGeometry args={[radius, isMobile ? 22 : 38, isMobile ? 14 : 24]} />
        <meshBasicMaterial
          color="#ffdca0"
          wireframe
          transparent
          opacity={0.2}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {latitudes.map((latitude) => {
        const latitudeRadius = Math.sqrt((radius * radius) - (latitude * latitude));
        return (
          <mesh key={latitude} position={[0, latitude, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[latitudeRadius, 0.007, 5, isMobile ? 48 : 96]} />
            <meshBasicMaterial
              color="#e6364f"
              transparent
              opacity={0.22}
              depthWrite={false}
            />
          </mesh>
        );
      })}

      {meridians.map((rotation) => (
        <mesh key={rotation} rotation={[0, rotation, 0]}>
          <torusGeometry args={[radius, 0.006, 5, isMobile ? 48 : 96]} />
          <meshBasicMaterial
            color="#f3b73d"
            transparent
            opacity={0.16}
            depthWrite={false}
          />
        </mesh>
      ))}

      <mesh ref={scanRingRef} rotation={[0.35, 0.15, 0]} scale={1.28}>
        <torusGeometry args={[radius, 0.016, 6, isMobile ? 72 : 144]} />
        <meshBasicMaterial
          color="#ff5d72"
          transparent
          opacity={0.56}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <pointLight color="#e6364f" intensity={7} distance={9} decay={2} />
    </group>
  );
}

function WorldScene({ isMobile, onNodeHover }) {
  const sceneOffsetX = isMobile ? 0 : 0.85;
  const sceneOffsetY = isMobile ? 3 : 0;
  const sharedGeometry = useMemo(
    () => new THREE.IcosahedronGeometry(0.45, isMobile ? 2 : 3),
    [isMobile]
  );

  return (
    <>
      <color attach="background" args={['#08090c']} />
      <fog attach="fog" args={['#08090c', 13, 32]} />
      <NebulaField />
      <WarpStars isMobile={isMobile} />
      <ambientLight color="#9c2840" intensity={0.48} />
      <directionalLight color="#ffdca0" intensity={1.2} position={[4, 6, 8]} />
      <group position={[sceneOffsetX, sceneOffsetY, 0]}>
        <HackerGlobe isMobile={isMobile} />
        <group scale={[isMobile ? 0.33 : 1, 1, 1]}>
          <OrbitalGrid />
          <ConnectionNetwork />
          <DataPackets />
          {PORTFOLIO_SECTIONS.map((section) => (
            <PortalNode
              key={section.id}
              section={section}
              geometry={sharedGeometry}
              onHover={onNodeHover}
            />
          ))}
        </group>
      </group>
      <CameraFlight isMobile={isMobile} />
    </>
  );
}

export default function PortfolioWorld({ isMobile, onContextLost }) {
  const { isPanelOpen } = usePortfolioNavigation();
  const [hoveredNode, setHoveredNode] = useState(null);

  return (
    <div
      className="world-canvas"
      data-panel-open={isPanelOpen}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 13.2], fov: 52, near: 0.1, far: 80 }}
        dpr={isMobile ? 1 : [1, 1.5]}
        performance={{ min: 0.55 }}
        gl={{
          alpha: false,
          antialias: !isMobile,
          powerPreference: 'high-performance',
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.15;
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.domElement.addEventListener('webglcontextlost', (event) => {
            event.preventDefault();
            onContextLost?.();
          }, { once: true });
        }}
      >
        <WorldScene isMobile={isMobile} onNodeHover={setHoveredNode} />
      </Canvas>

      {!isPanelOpen ? (
        <div
          className="node-display-window"
          data-visible={Boolean(hoveredNode)}
          style={{ '--node-signal': hoveredNode?.color || '#f3b73d' }}
        >
          <div className="node-display-topline">
            <span>NODE / {hoveredNode?.index || '--'}</span>
            <span>LINK STABLE</span>
          </div>
          <strong>{hoveredNode?.label || 'HOVER A NODE'}</strong>
          <span>{hoveredNode?.nodeType || 'PORTFOLIO NETWORK'}</span>
          <p>{hoveredNode?.signal || 'Move across the connected signals to inspect a destination.'}</p>
          <div className="node-display-meter" aria-hidden="true"><i /></div>
        </div>
      ) : null}
    </div>
  );
}
