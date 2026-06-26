import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

function lerp(a, b, t) { return a + (b - a) * t; }

function OrbitingGeo({ scrollRef }) {
  const ref = useRef();
  const data = useMemo(() => ({
    radius: 7 + Math.random() * 8,
    height: (Math.random() - 0.5) * 14,
    speed: 0.08 + Math.random() * 0.2,
    phase: Math.random() * Math.PI * 2,
    size: 0.15 + Math.random() * 0.4,
    geo: Math.random() > 0.5 ? 'octahedron' : Math.random() > 0.5 ? 'torus' : 'icosahedron',
  }), []);

  useFrame((state) => {
    if (!ref.current) return;
    const s = scrollRef.current;
    const angle = state.clock.elapsedTime * data.speed + data.phase;
    ref.current.position.x = Math.cos(angle) * data.radius;
    ref.current.position.z = Math.sin(angle) * data.radius;
    ref.current.position.y = data.height + s * 6;
    ref.current.rotation.x = angle * 0.7;
    ref.current.rotation.y = angle;
    ref.current.material.opacity = lerp(0.03, 0.12, 0.5 + Math.sin(angle) * 0.5);
  });

  return (
    <mesh ref={ref}>
      {data.geo === 'octahedron' && <octahedronGeometry args={[data.size, 0]} />}
      {data.geo === 'torus' && <torusGeometry args={[data.size * 0.7, data.size * 0.3, 4, 8]} />}
      {data.geo === 'icosahedron' && <icosahedronGeometry args={[data.size, 0]} />}
      <meshBasicMaterial color="#00ff41" transparent opacity={0.06} depthWrite={false} wireframe />
    </mesh>
  );
}

function Scene({ scrollRef }) {
  return (
    <group>
      {Array.from({ length: 20 }, (_, i) => (
        <OrbitingGeo key={i} index={i} total={20} scrollRef={scrollRef} />
      ))}
    </group>
  );
}

export default function Timeline3DAccent({ scrollRef }) {
  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      <Canvas
        dpr={[0.5, 1]}
        gl={{ antialias: false, alpha: true }}
        camera={{ position: [0, 0, 14], fov: 45, near: 0.1, far: 40 }}
      >
        <Scene scrollRef={scrollRef} />
      </Canvas>
    </div>
  );
}
