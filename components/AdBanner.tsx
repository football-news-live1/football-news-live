'use client';

import { useEffect, useState } from 'react';

interface AdBannerProps {
  slot: 'header' | 'sidebar' | 'in-feed' | 'match-top' | 'match-bottom' | 'match-sidebar' | 'social-bar' | 'popup';
  index?: number;
}

const ADSTERRA_KEYS = {
  '300x250': { key: 'f76c72acd4caee569bb791c097b9370c', width: 300, height: 250 },
  '320x50': { key: '272197337e0a8c8be73158458e01bff2', width: 320, height: 50 },
  '728x90': { key: '25a86e09eca788c146e5cacf12bf9f43', width: 728, height: 90 },
  '160x300': { key: '72edf621ede50d11930e3027053048ae', width: 160, height: 300 },
  '468x60': { key: 'a22b63ea13ae4def4df2082e0b6f1b6b', width: 468, height: 60 },
  '160x600': { key: 'fc02000e1bc4d74499476acf46488137', width: 160, height: 600 },
};

const slotConfig: Record<AdBannerProps['slot'], { id: string; desktopFormat: keyof typeof ADSTERRA_KEYS; mobileFormat: keyof typeof ADSTERRA_KEYS }> = {
  'header': { id: 'ad-header', desktopFormat: '728x90', mobileFormat: '320x50' },
  'sidebar': { id: 'ad-sidebar', desktopFormat: '300x250', mobileFormat: '300x250' },
  'in-feed': { id: 'ad-in-feed', desktopFormat: '728x90', mobileFormat: '300x250' },
  'match-top': { id: 'ad-match-top', desktopFormat: '728x90', mobileFormat: '320x50' },
  'match-bottom': { id: 'ad-match-bottom', desktopFormat: '728x90', mobileFormat: '300x250' },
  'match-sidebar': { id: 'ad-match-sidebar', desktopFormat: '300x250', mobileFormat: '300x250' },
  'social-bar': { id: 'ad-social-bar', desktopFormat: '320x50', mobileFormat: '320x50' },
  'popup': { id: 'ad-popup', desktopFormat: '300x250', mobileFormat: '300x250' },
};

export default function AdBanner({ slot, index }: AdBannerProps) {
  const config = slotConfig[slot];
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsMobile(window.innerWidth < 768);
    
    // Some basic debounced resize listener just in case
    let timeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => setIsMobile(window.innerWidth < 768), 100);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const adId = index !== undefined ? `${config.id}-${index}` : config.id;

  // Render safe popunder container block specifically for interstitial
  if (slot === 'social-bar') {
    return null;
  }

  // Prevent hydration mismatch by blocking render until mounted
  if (!mounted) {
    const desktopData = ADSTERRA_KEYS[config.desktopFormat];
    return (
      <div className="w-full ad-container my-2 flex flex-col items-center justify-center">
        <p className="text-gray-600 text-[10px] text-center mb-1 uppercase tracking-widest">Advertisement</p>
        <div id={adId} className="ad-placeholder w-full flex justify-center bg-secondary/30 rounded" style={{ minHeight: `${desktopData.height}px` }} />
      </div>
    );
  }

  const formatKey = isMobile ? config.mobileFormat : config.desktopFormat;
  const adData = ADSTERRA_KEYS[formatKey];

  if (!adData) return null;

  // We utilize an iframe srcDoc because Adsterra scripts heavily rely on `document.write`. 
  // Document.write entirely wipes out React single-page-applications when called asynchronously.
  // The iframe naturally isolates the execution and renders the contents perfectly inline.
  const srcDoc = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; overflow: hidden; }
      </style>
    </head>
    <body style="background: transparent;">
      <script type="text/javascript">
        atOptions = {
          'key' : '${adData.key}',
          'format' : 'iframe',
          'height' : ${adData.height},
          'width' : ${adData.width},
          'params' : {}
        };
      </script>
      <script type="text/javascript" src="https://www.highperformanceformat.com/${adData.key}/invoke.js"></script>
    </body>
    </html>
  `;

  return (
    <div className="w-full ad-container my-2 flex flex-col items-center justify-center">
      <p className="text-gray-600 text-[10px] text-center mb-1 uppercase tracking-widest">Advertisement</p>
      <div 
        id={adId} 
        className="ad-placeholder w-full flex justify-center" 
        style={{ minHeight: `${adData.height}px` }}
      >
        <iframe
          srcDoc={srcDoc}
          width={adData.width}
          height={adData.height}
          frameBorder="0"
          scrolling="no"
          style={{ border: 'none', overflow: 'hidden', background: 'transparent' }}
          title={'Advertisement ' + formatKey}
          sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-same-origin"
        />
      </div>
    </div>
  );
}
