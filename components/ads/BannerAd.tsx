'use client';

import { useEffect, useRef } from 'react';

export function BannerAd() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Solo ejecutar en el cliente y si el contenedor existe
    if (typeof window !== 'undefined' && containerRef.current) {
      // ── ANTIGRAVITY SECURITY FIX ──
      // Desactivamos anuncios en móviles reales (< 768px) para evitar redirecciones maliciosas
      // que reportaron los usuarios en dispositivos móviles.
      if (window.innerWidth < 768) {
        console.log('[Ads] BannerAd disabled on mobile to prevent redirects');
        return;
      }

      // Evitar duplicados si ya hay contenido
      if (containerRef.current.hasChildNodes()) {
        return;
      }

      const scriptConfig = document.createElement('script');
      scriptConfig.type = 'text/javascript';
      scriptConfig.innerHTML = `
        atOptions = {
          'key' : 'f793fd7b10baae1fe357b24bc9a3c577',
          'format' : 'iframe',
          'height' : 60,
          'width' : 468,
          'params' : {}
        };
      `;

      const scriptInvoke = document.createElement('script');
      scriptInvoke.type = 'text/javascript';
      scriptInvoke.src = 'https://crateworkshop.com/f793fd7b10baae1fe357b24bc9a3c577/invoke.js';

      containerRef.current.appendChild(scriptConfig);
      containerRef.current.appendChild(scriptInvoke);
    }
  }, []);

  return (
    <div className="flex justify-center items-center w-full overflow-hidden">
      <div ref={containerRef} className="max-w-full" />
    </div>
  );
}
