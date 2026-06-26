import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const CARD_WIDTH = 1.8;
const CARD_HEIGHT = 1.1;

function cardTexture(text, color) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 144;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(10,12,12,0.92)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
  ctx.fillStyle = color;
  ctx.font = 'bold 18px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 - 8);
  ctx.font = '11px monospace';
  ctx.fillStyle = color.replace(')', ',0.5)');
  ctx.fillText('CLICK TO VIEW', canvas.width / 2, canvas.height / 2 + 20);
  return new THREE.CanvasTexture(canvas);
}

function OrbitCard({ index, total, activeIndex, setActive, setHovered, hoveredIndex }) {
  const meshRef = useRef();
  const groupRef = useRef();
  const angle = (index / total) * Math.PI * 2;
  const radius = 4.5;
  const yOff = (index % 3) * 0.6 - 0.6;
  const isActive = activeIndex === index;
  const isHovered = hoveredIndex === index;

  const tex = useMemo(
    () => cardTexture(`0${index + 1}`, isActive ? '#00ff41' : '#00ff41'),
    [index, isActive]
  );

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    const orbitSpeed = 0.15;
    groupRef.current.position.x = Math.cos(angle + t * orbitSpeed) * radius;
    groupRef.current.position.z = Math.sin(angle + t * orbitSpeed) * radius;
    groupRef.current.position.y = yOff;
    groupRef.current.rotation.y = t * orbitSpeed + Math.PI;
    groupRef.current.rotation.x = Math.sin(t * 0.3 + index) * 0.1;

    const targetScale = isActive || isHovered ? 1.25 : 1;
    groupRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.08
    );
  });

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); setActive(index === activeIndex ? -1 : index); }}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; setHovered(index); }}
        onPointerOut={() => { document.body.style.cursor = ''; setHovered(-1); }}
      >
        <planeGeometry args={[CARD_WIDTH, CARD_HEIGHT]} />
        <meshBasicMaterial map={tex} transparent side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {(isActive || isHovered) && (
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[CARD_WIDTH + 0.08, CARD_HEIGHT + 0.08]} />
          <meshBasicMaterial color={isActive ? '#00ff41' : '#00e5ff'} transparent opacity={0.25} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

export default function ProjectGallery3D({ projects, activeIndex, setActive }) {
  const [hoveredIndex, setHovered] = useState(-1);

  return (
    <div className="relative w-full" style={{ height: 420 }}>
      <Canvas
        dpr={[0.8, 1.5]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 3, 9], fov: 50, near: 0.1, far: 40 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[0, 5, 0]} intensity={0.6} color="#00ff41" />
        {projects.map((project, i) => (
          <OrbitCard
            key={i}
            index={i}
            total={projects.length}
            project={project}
            activeIndex={activeIndex}
            setActive={setActive}
            setHovered={setHovered}
            hoveredIndex={hoveredIndex}
          />
        ))}
      </Canvas>
    </div>
  );
}
