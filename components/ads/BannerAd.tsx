'use client';

import { useEffect, useRef } from 'react';

export function BannerAd() {
  const adHtml = `
    <html>
      <head>
        <style>body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; overflow: hidden; }</style>
      </head>
      <body>
        <script type="text/javascript">
          atOptions = {
            'key' : 'f793fd7b10baae1fe357b24bc9a3c577',
            'format' : 'iframe',
            'height' : 60,
            'width' : 468,
            'params' : {}
          };
        </script>
        <script type="text/javascript" src="https://crateworkshop.com/f793fd7b10baae1fe357b24bc9a3c577/invoke.js"></script>
      </body>
    </html>
  `;

  return (
    <div className="flex justify-center items-center w-full overflow-hidden min-h-[60px]">
      <iframe
        title="Advertisement"
        srcDoc={adHtml}
        width="468"
        height="60"
        style={{ border: 'none', overflow: 'hidden' }}
        /* 
           SANDBOX:
           - allow-scripts: permite que el anuncio funcione.
           - allow-forms: permite formularios dentro del anuncio.
           - allow-popups: permite que al hacer clic se abra la página del anunciante.
           - allow-popups-to-escape-sandbox: permite que el popup no sea sandboxed.
           - SIN allow-top-navigation: ESTO EVITA QUE EL ANUNCIO REDIRIJA NUESTRA APP.
        */
        sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
        scrolling="no"
      />
    </div>
  );
}
