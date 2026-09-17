import { useState, useEffect } from 'react';

/**
 * Accurately detects whether the current device/viewport is a mobile phone or tablet
 * (touch-based or screen width < 1024px) vs a desktop PC / laptop.
 */
export function isMobileOrTabletDevice(): boolean {
  if (typeof window === 'undefined') return false;

  // 1. Viewports below standard desktop breakpoint (< 1024px: phones, phablets, portrait tablets)
  if (window.innerWidth < 1024) return true;

  // 2. Mobile / Tablet OS or coarse touch screen (e.g. iPad in landscape, Galaxy Tab in landscape >= 1024px)
  const isMobileUA =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Tablet/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isCoarsePointer = window.matchMedia?.('(pointer: coarse)').matches ?? false;
  const isFinePointer = window.matchMedia?.('(pointer: fine)').matches ?? false;

  if (isMobileUA || (isTouchDevice && isCoarsePointer && !isFinePointer)) {
    return true;
  }

  // Standard desktop (laptop/PC with fine pointer/mouse and screen >= 1024px)
  return false;
}

/**
 * React hook that dynamically updates when screen is resized or device rotated.
 */
export function useIsMobileOrTablet(): boolean {
  const [isMobileOrTablet, setIsMobileOrTablet] = useState<boolean>(isMobileOrTabletDevice);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileOrTablet(isMobileOrTabletDevice());
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return isMobileOrTablet;
}

/**
 * React hook that dynamically detects if the viewport is in vertical / portrait orientation
 * (height >= width) across mobile phones, tablets, and desktop windows.
 */
export function useIsPortrait(): boolean {
  const [isPortrait, setIsPortrait] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerHeight >= window.innerWidth;
  });

  useEffect(() => {
    const handleCheck = () => {
      setIsPortrait(window.innerHeight >= window.innerWidth);
    };

    window.addEventListener('resize', handleCheck);
    window.addEventListener('orientationchange', handleCheck);
    return () => {
      window.removeEventListener('resize', handleCheck);
      window.removeEventListener('orientationchange', handleCheck);
    };
  }, []);

  return isPortrait;
}
