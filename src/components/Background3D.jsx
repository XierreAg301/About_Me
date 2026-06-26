import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

const LINES = 14;
const PARTICLE_COUNT = 180;
const RINGS = 5;

function lerp(a, b, t) { return a + (b - a) * t; }

function StreamRibbon({ index, total, mouseRef, scrollRef }) {
  const meshRef = useRef();
  const data = useMemo(() => ({
    angle: (index / total) * Math.PI * 2,
    radius: 13 + Math.random() * 22,
    baseY: (Math.random() - 0.5) * 28,
    height: 40 + Math.random() * 60,
    width: 0.04 + Math.random() * 0.04,
    phase: Math.random() * Math.PI * 2,
    drift: 0.003 + Math.random() * 0.006,
  }), [index, total]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const m = mouseRef.current;
    const s = scrollRef.current;

    data.angle += data.drift * delta * 30;
    const camRotX = (m.y - 0.5) * 0.4;
    const camRotY = (m.x - 0.5) * 0.6 + s * 2;

    const cosA = Math.cos(data.angle + camRotY);
    const sinA = Math.sin(data.angle + camRotY);
    meshRef.current.position.set(
      cosA * data.radius,
      data.baseY + camRotX * 10,
      sinA * data.radius
    );
    meshRef.current.rotation.set(
      camRotX * 0.3 + data.phase,
      data.angle + camRotY + Math.PI * 0.5,
      0
    );

    const brightness = 0.06 + (0.12 - Math.abs(camRotX * 0.3)) * 0.8;
    meshRef.current.material.opacity = brightness;
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[data.width, data.height]} />
      <meshBasicMaterial color="#00ff41" transparent opacity={0.08} depthWrite={false} />
    </mesh>
  );
}

function DriftParticle({ index, mouseRef, scrollRef }) {
  const ref = useRef();
  const data = useMemo(() => ({
    sx: (Math.random() - 0.5) * 38,
    sy: (Math.random() - 0.5) * 32,
    sz: (Math.random() - 0.5) * 28,
    fx: Math.random() * 0.5 + 0.3,
    fy: Math.random() * 0.5 + 0.3,
    fz: Math.random() * 0.3 + 0.1,
    ph: Math.random() * Math.PI * 2,
    size: 0.015 + Math.random() * 0.07,
    color: index % 3 === 0 ? '#00e5ff' : '#00ff41',
  }), [index]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const m = mouseRef.current;
    const s = scrollRef.current;

    ref.current.position.x = data.sx + Math.sin(t * data.fx + data.ph) * 2.5;
    ref.current.position.y = data.sy + Math.cos(t * data.fy + data.ph) * 2;
    ref.current.position.z = data.sz + Math.sin(t * data.fz + data.ph) * 1.5;

    const mouseDist = Math.sqrt((m.x - 0.5) ** 2 + (m.y - 0.5) ** 2);
    ref.current.material.opacity = lerp(0.04, 0.45, mouseDist * s);
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[data.size, 4, 4]} />
      <meshBasicMaterial color={data.color} transparent opacity={0.1} depthWrite={false} />
    </mesh>
  );
}

function OrbitBand({ index, total, mouseRef, scrollRef }) {
  const ref = useRef();
  const data = useMemo(() => ({
    radius: 15 + index * 3,
    tilt: (index / (total - 1)) * Math.PI * 0.35 - 0.18,
    rotSpeed: 0.02 + index * 0.012,
    color: index % 2 === 0 ? '#00ff41' : '#00e5ff',
    dashOffset: index * 0.3,
  }), [index, total]);

  useFrame(() => {
    if (!ref.current) return;
    const m = mouseRef.current;
    const s = scrollRef.current;

    ref.current.rotation.z = data.tilt + (m.y - 0.5) * 0.5;
    ref.current.rotation.x = (m.x - 0.5) * 0.3 + s * 0.4;
    ref.current.rotation.y += data.rotSpeed;
    ref.current.material.opacity = lerp(0.02, 0.09, (1 - index / total) * (0.5 + s * 0.5));
  });

  return (
    <mesh ref={ref}>
      <torusGeometry args={[data.radius, 0.012, 6, 72]} />
      <meshBasicMaterial color={data.color} transparent opacity={0.04} depthWrite={false} />
    </mesh>
  );
}

function Scene({ mouseRef, scrollRef }) {
  return (
    <group>
      {Array.from({ length: LINES }, (_, i) => (
        <StreamRibbon key={`line-${i}`} index={i} total={LINES} mouseRef={mouseRef} scrollRef={scrollRef} />
      ))}
      {Array.from({ length: PARTICLE_COUNT }, (_, i) => (
        <DriftParticle key={`p-${i}`} index={i} mouseRef={mouseRef} scrollRef={scrollRef} />
      ))}
      {Array.from({ length: RINGS }, (_, i) => (
        <OrbitBand key={`ring-${i}`} index={i} total={RINGS} mouseRef={mouseRef} scrollRef={scrollRef} />
      ))}
    </group>
  );
}

export default function Background3D({ mouseRef, scrollRef }) {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        dpr={[0.8, 1.5]}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 20], fov: 55, near: 0.1, far: 80 }}
        performance={{ min: 0.5 }}
      >
        <Scene mouseRef={mouseRef} scrollRef={scrollRef} />
      </Canvas>
    </div>
  );
}
