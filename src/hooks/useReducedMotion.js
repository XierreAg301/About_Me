import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

export default function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(QUERY).matches
  );

  useEffect(() => {
    const media = window.matchMedia(QUERY);
    const updatePreference = () => setReducedMotion(media.matches);
    updatePreference();
    media.addEventListener('change', updatePreference);
    return () => media.removeEventListener('change', updatePreference);
  }, []);

  return reducedMotion;
}
