'use client';

import { useEffect, useRef } from 'react';

export function NativeAd() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && containerRef.current) {
      if (document.getElementById('native-ad-script')) return; // Evitar duplicados

      const script = document.createElement('script');
      script.id = 'native-ad-script';
      script.async = true;
      script.dataset.cfasync = 'false';
      script.src = 'https://crateworkshop.com/fc8a8cf35db735c9df6dc87b1ce5c70f/invoke.js';
      
      // Adjuntar el script al DOM
      document.body.appendChild(script);

      return () => {
        const existingScript = document.getElementById('native-ad-script');
        if (existingScript) existingScript.remove();
      };
    }
  }, []);

  return (
    <div className="w-full flex justify-center items-center overflow-hidden min-h-[250px]">
      <div id="container-fc8a8cf35db735c9df6dc87b1ce5c70f"></div>
    </div>
  );
}
