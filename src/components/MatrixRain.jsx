import React, { useEffect, useRef } from 'react';

export default function MatrixRain() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = new Array(columns).fill(1);

    // Randomize initial positions
    for (let i = 0; i < drops.length; i++) {
      drops[i] = Math.random() * -100;
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];

        // Head character (bright green)
        const headAlpha = 0.9 + Math.random() * 0.1;
        ctx.fillStyle = `rgba(0, 255, 65, ${headAlpha})`;
        ctx.font = `${fontSize}px 'Share Tech Mono', monospace`;
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);

        // Trail character (dimmer)
        if (drops[i] > 1) {
          const trailChar = chars[Math.floor(Math.random() * chars.length)];
          ctx.fillStyle = `rgba(0, 255, 65, 0.15)`;
          ctx.fillText(trailChar, i * fontSize, (drops[i] - 1) * fontSize);
        }

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 0.5 + Math.random() * 0.5;
      }
    };

    const intervalId = setInterval(draw, 50);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.4 }}
    />
  );
}
