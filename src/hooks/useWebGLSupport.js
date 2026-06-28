import { useEffect, useState } from 'react';

function detectWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext
      && (canvas.getContext('webgl2') || canvas.getContext('webgl'))
    );
  } catch {
    return false;
  }
}

export default function useWebGLSupport() {
  const [supported, setSupported] = useState(null);

  useEffect(() => {
    setSupported(detectWebGL());
  }, []);

  return supported;
}
