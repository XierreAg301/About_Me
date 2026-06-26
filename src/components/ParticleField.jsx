import { useEffect, useRef, useCallback } from 'react';

// Global event to trigger bursts when transitioning sections
// eslint-disable-next-line react-refresh/only-export-components
export const triggerParticleBurst = () => {
  window.dispatchEvent(new CustomEvent('particle-burst'));
};

export default function ParticleField() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const burstMultiplier = useRef(1);

  const handleMouse = useCallback((e) => {
    mouseRef.current = {
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight,
    };
  }, []);

  useEffect(() => {
    const handleBurst = () => {
      burstMultiplier.current = 8; // Spike speed
    };
    window.addEventListener('particle-burst', handleBurst);
    window.addEventListener('mousemove', handleMouse, { passive: true });
    return () => {
      window.removeEventListener('particle-burst', handleBurst);
      window.removeEventListener('mousemove', handleMouse);
    }
  }, [handleMouse]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;

    const PARTICLE_COUNT = 80;
    let particles = [];
    let smoothMX = 0.5, smoothMY = 0.5;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticle = () => ({
      x: Math.random(),
      y: Math.random(),
      z: Math.random(),
      vx: (Math.random() - 0.5) * 0.0001,
      vy: (Math.random() - 0.5) * 0.0001,
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.5 + Math.random() * 1.5,
      type: Math.random() > 0.7 ? 'square' : 'circle',
    });

    const init = () => {
      particles = Array.from({ length: PARTICLE_COUNT }, createParticle);
    };

    window.addEventListener('resize', resize);
    resize();
    init();

    const draw = (time) => {
      // Decay burst multiplier smoothly
      burstMultiplier.current += (1 - burstMultiplier.current) * 0.05;

      smoothMX += (mouseRef.current.x - smoothMX) * 0.04;
      smoothMY += (mouseRef.current.y - smoothMY) * 0.04;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const sorted = [...particles].sort((a, b) => a.z - b.z);

      sorted.forEach((p) => {
        const parallaxStrength = p.z * 60;
        const px = (p.x + (smoothMX - 0.5) * parallaxStrength / canvas.width) * canvas.width;
        const py = (p.y + (smoothMY - 0.5) * parallaxStrength / canvas.height) * canvas.height;

        const size = 1.2 + p.z * 3.5;
        const pulse = Math.sin(time * 0.001 * p.pulseSpeed + p.pulsePhase) * 0.5 + 0.5;
        const baseAlpha = 0.08 + p.z * 0.30;
        const alpha = baseAlpha * (0.7 + pulse * 0.3);

        const g = Math.floor(180 + p.z * 75);
        const b = Math.floor(p.z * 60);
        ctx.fillStyle = `rgba(0,${g},${b},${alpha})`;

        if (p.type === 'square' && p.z > 0.5) {
          ctx.fillRect(px - size / 2, py - size / 2, size, size);
        } else {
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fill();
        }

        if (p.z > 0.7) {
          const glowAlpha = (p.z - 0.7) * 0.3 * pulse;
          const grad = ctx.createRadialGradient(px, py, 0, px, py, size * 6);
          grad.addColorStop(0, `rgba(0,255,65,${glowAlpha})`);
          grad.addColorStop(1, 'rgba(0,255,65,0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(px, py, size * 6, 0, Math.PI * 2);
          ctx.fill();
        }

        sorted.forEach((other) => {
          if (other === p) return;
          if (Math.abs(other.z - p.z) > 0.2) return;
          const dx = (p.x - other.x) * canvas.width;
          const dy = (p.y - other.y) * canvas.height;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120 * p.z) {
            const lineAlpha = (1 - dist / (120 * p.z)) * alpha * 0.5;
            ctx.strokeStyle = `rgba(0,255,65,${lineAlpha})`;
            ctx.lineWidth = 0.5 * p.z;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(
              (other.x + (smoothMX - 0.5) * other.z * 60 / canvas.width) * canvas.width,
              (other.y + (smoothMY - 0.5) * other.z * 60 / canvas.height) * canvas.height
            );
            ctx.stroke();
          }
        });

        // Apply burst speed
        p.x += p.vx * burstMultiplier.current;
        p.y += p.vy * burstMultiplier.current;
        
        if (p.x < -0.05) p.x = 1.05;
        if (p.x > 1.05) p.x = -0.05;
        if (p.y < -0.05) p.y = 1.05;
        if (p.y > 1.05) p.y = -0.05;
      });

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-1 pointer-events-none"
      style={{ opacity: 1 }}
    />
  );
}
