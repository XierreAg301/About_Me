import { useEffect, useRef } from 'react';

/**
 * MatrixRain — 3-layer depth system for genuine Z-axis illusion.
 * Layer 0 (far):  small, slow, very faint  — deep background
 * Layer 1 (mid):  medium, medium speed, moderate alpha
 * Layer 2 (near): large, fast, bright      — foreground
 */
export default function MatrixRain({ scrollProgress = 0 }) {
  const canvasRef = useRef(null);
  const scrollProgressRef = useRef(scrollProgress);

  useEffect(() => {
    scrollProgressRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId = 0;
    let lastTime = performance.now();
    let smoothScroll = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initLayers();
    };

    const LAYERS = [
      // far
      { fontSize: 11, spacing: 22, speed: 22, alpha: 0.14, headAlpha: 0.55, drops: [] },
      // mid
      { fontSize: 16, spacing: 30, speed: 38, alpha: 0.22, headAlpha: 0.80, drops: [] },
      // near
      { fontSize: 22, spacing: 42, speed: 60, alpha: 0.35, headAlpha: 1.00, drops: [] },
    ];

    const chars = '01アイウエオカキクケコサシスセソタチツテト#$%@';

    function initLayers() {
      LAYERS.forEach((layer) => {
        const cols = Math.floor(canvas.width / layer.spacing);
        layer.drops = Array.from({ length: cols }, () => ({
          y: Math.random() * -canvas.height,
          speed: layer.speed * (0.7 + Math.random() * 0.6),
          length: 6 + Math.floor(Math.random() * 10),
          chars: Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * chars.length)]),
          mutateTimer: 0,
        }));
      });
    }

    window.addEventListener('resize', resize);
    resize();

    const draw = (time) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      // smooth scroll parallax offset
      const targetScroll = scrollProgressRef.current * 120;
      smoothScroll += (targetScroll - smoothScroll) * 0.06;

      // Clear with semi-transparent black (trail effect)
      ctx.fillStyle = 'rgba(6, 8, 8, 0.13)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      LAYERS.forEach((layer) => {
        ctx.font = `${layer.fontSize}px 'Share Tech Mono', monospace`;

        layer.drops.forEach((drop, i) => {
          // Mutate chars over time
          drop.mutateTimer += dt;
          if (drop.mutateTimer > 0.1) {
            drop.mutateTimer = 0;
            const idx = Math.floor(Math.random() * drop.chars.length);
            drop.chars[idx] = chars[Math.floor(Math.random() * chars.length)];
          }

          const x = i * layer.spacing + 4;
          const scrollOff = smoothScroll * (layer === LAYERS[0] ? 0.3 : layer === LAYERS[1] ? 0.6 : 1.0);

          for (let j = 0; j < drop.length; j++) {
            const y = drop.y - j * layer.fontSize + scrollOff;
            if (y < -layer.fontSize || y > canvas.height + layer.fontSize) continue;

            const fadeRatio = j / drop.length;
            let alpha;
            if (j === 0) {
              // head — brightest
              alpha = layer.headAlpha;
              ctx.fillStyle = j === 0 ? `rgba(210,255,225,${alpha})` : `rgba(0,255,65,${alpha})`;
            } else if (j < 3) {
              alpha = layer.alpha + (1 - fadeRatio) * 0.3;
              ctx.fillStyle = `rgba(0,255,65,${Math.min(alpha, 0.9)})`;
            } else {
              alpha = layer.alpha * (1 - fadeRatio * 0.85);
              ctx.fillStyle = `rgba(0,200,50,${Math.max(alpha, 0.03)})`;
            }

            const char = drop.chars[j % drop.chars.length];
            ctx.fillText(char, x, y);
          }

          drop.y += drop.speed * dt;

          if (drop.y - drop.length * layer.fontSize > canvas.height + 40) {
            drop.y = -Math.random() * canvas.height * 0.5;
            drop.speed = layer.speed * (0.7 + Math.random() * 0.6);
            drop.length = 6 + Math.floor(Math.random() * 10);
          }
        });
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
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.45 }}
    />
  );
}
