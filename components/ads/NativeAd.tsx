'use client';

import { useEffect, useRef } from 'react';

export function NativeAd({ isDarkMode }: { isDarkMode: boolean }) {
  const bgColor = isDarkMode ? '#141414' : 'transparent';
  const adHtml = `
    <html>
      <head>
        <style>
          body { 
            margin: 0; 
            padding: 0; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            min-height: 250px; 
            overflow: hidden; 
            background-color: ${bgColor};
          }
        </style>
      </head>
      <body>
        <script async="async" data-cfasync="false" src="https://crateworkshop.com/fc8a8cf35db735c9df6dc87b1ce5c70f/invoke.js"></script>
        <div id="container-fc8a8cf35db735c9df6dc87b1ce5c70f"></div>
      </body>
    </html>
  `;

  return (
    <div className="w-full flex justify-center items-center overflow-hidden min-h-[250px]">
       <iframe
        title="Native Advertisement"
        srcDoc={adHtml}
        width="100%"
        height="250"
        style={{ border: 'none', overflow: 'hidden' }}
        sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin"
        scrolling="no"
      />
    </div>
  );
}
