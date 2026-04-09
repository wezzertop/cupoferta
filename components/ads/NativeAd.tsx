'use client';

import { useEffect, useRef } from 'react';

export function NativeAd() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Solo ejecutar en el cliente y si el contenedor existe
    if (typeof window !== 'undefined' && containerRef.current) {
      // ── ANTIGRAVITY SECURITY FIX ──
      // Desactivamos anuncios nativos en móviles para proteger la UX de redirecciones forzadas
      if (window.innerWidth < 768) {
        console.log('[Ads] NativeAd disabled on mobile');
        return;
      }

      // Evitar duplicados si ya hay un script en el contenedor
      if (containerRef.current.querySelector('script[src*="fc8a8cf35db735c9df6dc87b1ce5c70f"]')) {
        return;
      }

      const script = document.createElement('script');
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = 'https://crateworkshop.com/fc8a8cf35db735c9df6dc87b1ce5c70f/invoke.js';
      
      // Insertar el script en el contenedor
      containerRef.current.appendChild(script);
    }
  }, []);

  return (
    <div ref={containerRef} className="w-full flex justify-center items-center overflow-hidden min-h-[250px]">
      {/* El script inyectará el anuncio dentro de este div por su ID */}
      <div id="container-fc8a8cf35db735c9df6dc87b1ce5c70f"></div>
    </div>
  );
}
