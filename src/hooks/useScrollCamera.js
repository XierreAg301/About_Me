import { useRef, useCallback, useEffect } from 'react';

export default function useScrollCamera() {
  const scrollRef = useRef(0);
  const smoothRef = useRef(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const targetMouseRef = useRef({ x: 0.5, y: 0.5 });

  const onScroll = useCallback(() => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollRef.current = max > 0 ? window.scrollY / max : 0;
  }, []);

  const onMouse = useCallback((e) => {
    targetMouseRef.current = {
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight,
    };
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mousemove', onMouse, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', onMouse);
    };
  }, [onScroll, onMouse]);

  const tick = useCallback((dt) => {
    const lerp = (a, b, f) => a + (b - a) * f;
    smoothRef.current = lerp(smoothRef.current, scrollRef.current, Math.min(dt * 4, 1));
    mouseRef.current.x = lerp(mouseRef.current.x, targetMouseRef.current.x, Math.min(dt * 6, 1));
    mouseRef.current.y = lerp(mouseRef.current.y, targetMouseRef.current.y, Math.min(dt * 6, 1));
    return {
      scroll: smoothRef.current,
      mouse: { x: mouseRef.current.x, y: mouseRef.current.y },
    };
  }, []);

  return tick;
}
