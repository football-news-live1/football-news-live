'use client';

import { useEffect, useRef } from 'react';

interface AdBannerProps {
  slot: 'header' | 'sidebar' | 'in-feed' | 'match-top' | 'match-bottom' | 'match-sidebar' | 'social-bar' | 'popup';
  index?: number;
}

const slotConfig: Record<AdBannerProps['slot'], { id: string; label: string; desktopSize: string; mobileSize: string; delay?: number }> = {
  'header': {
    id: 'ad-header-banner',
    label: 'Advertisement',
    desktopSize: '728x90',
    mobileSize: '320x50',
  },
  'sidebar': {
    id: 'ad-sidebar',
    label: 'Advertisement',
    desktopSize: '300x250',
    mobileSize: '300x250',
  },
  'in-feed': {
    id: 'ad-in-feed',
    label: 'Advertisement',
    desktopSize: '728x90',
    mobileSize: '300x250',
  },
  'match-top': {
    id: 'ad-match-top',
    label: 'Advertisement',
    desktopSize: '728x90',
    mobileSize: '320x50',
  },
  'match-bottom': {
    id: 'ad-match-bottom',
    label: 'Advertisement',
    desktopSize: '728x90',
    mobileSize: '300x250',
  },
  'match-sidebar': {
    id: 'ad-match-sidebar',
    label: 'Advertisement',
    desktopSize: '300x250',
    mobileSize: '300x250',
  },
  'social-bar': {
    id: 'ad-social-bar',
    label: '',
    desktopSize: '0x0',
    mobileSize: '0x0',
    delay: 5000,
  },
  'popup': {
    id: 'ad-popup',
    label: 'Advertisement',
    desktopSize: '300x250',
    mobileSize: '300x250',
  },
};

export default function AdBanner({ slot, index }: AdBannerProps) {
  const config = slotConfig[slot];
  const adRef = useRef<HTMLDivElement>(null);
  const adId = index !== undefined ? `${config.id}-${index}` : config.id;

  useEffect(() => {
    const loadAd = () => {
      if (!adRef.current) return;

      // ============================================================
      // AD INTEGRATION ZONE
      // ============================================================
      // To add your ad code, find the slot you want to fill below
      // and paste the ad network's script/code inside the div.
      //
      // ADSTERRA Example:
      //   const script = document.createElement('script');
      //   script.src = 'https://www.highperformanceformat.com/YOUR_KEY/invoke.js';
      //   script.setAttribute('key', 'YOUR_AD_KEY');
      //   adRef.current.appendChild(script);
      //
      // MONETAG Example:
      //   const script = document.createElement('script');
      //   script.src = 'https://alwingulla.com/88/tag.min.js';
      //   script.dataset.zone = 'YOUR_ZONE_ID';
      //   adRef.current.appendChild(script);
      //
      // GOOGLE ADSENSE Example:
      //   const ins = document.createElement('ins');
      //   ins.className = 'adsbygoogle';
      //   ins.dataset.adClient = 'ca-pub-YOUR_ID';
      //   ins.dataset.adSlot = 'YOUR_SLOT_ID';
      //   adRef.current.appendChild(ins);
      //   (window as any).adsbygoogle?.push({});
      // ============================================================

      // Placeholder display (remove when real ads are added)
      // The div#${adId} is ready for your ad code
    };

    if (config.delay) {
      const timer = setTimeout(loadAd, config.delay);
      return () => clearTimeout(timer);
    } else {
      loadAd();
    }
  }, [config.delay, adId]);

  // Social bar / interstitial - invisible container
  if (slot === 'social-bar') {
    return <div id={adId} ref={adRef} aria-hidden="true" className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none" />;
  }

  // Sidebar ad
  if (slot === 'sidebar' || slot === 'match-sidebar') {
    return (
      <div className="w-full">
        <p className="text-gray-600 text-[10px] text-center mb-1 uppercase tracking-widest">Advertisement</p>
        <div
          id={adId}
          ref={adRef}
          className="ad-placeholder w-full"
          style={{ minHeight: '250px' }}
          role="complementary"
          aria-label="Advertisement"
        >
          <span className="text-xs text-gray-600">300×250</span>
          <span className="text-[10px] text-gray-700 mt-1">Ad space available</span>
        </div>
      </div>
    );
  }

  // Header, in-feed, match top/bottom ads
  return (
    <div className="w-full my-1">
      <p className="text-gray-600 text-[10px] text-center mb-1 uppercase tracking-widest">Advertisement</p>
      <div
        id={adId}
        ref={adRef}
        className="ad-placeholder w-full rounded"
        style={{ minHeight: slot === 'header' ? '50px' : '90px' }}
        role="complementary"
        aria-label="Advertisement"
      >
        <span className="text-xs text-gray-600 hide-mobile">{config.desktopSize}</span>
        <span className="text-xs text-gray-600 hide-desktop">{config.mobileSize}</span>
        <span className="text-[10px] text-gray-700 mt-1">Ad space available</span>
      </div>
    </div>
  );
}
