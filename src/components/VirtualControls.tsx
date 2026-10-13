import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useIsMobileOrTablet, useIsPortrait } from '../utils/device';
import { useLanguage } from '../game/localization';

/* =========================================================================
   CUSTOM HAND-CRAFTED SVG ICONS (NO EXTERNAL LIBRARIES, WARM FANTASY PALETTE)
   ========================================================================= */

const IconCompass = ({ className = "w-4 h-4", active = false }: { className?: string; active?: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" className={active ? "text-amber-200" : "text-amber-400"} />
    <path d="M12 3.5V5.5M12 18.5V20.5M3.5 12H5.5M18.5 12H20.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12 6L14.2 11.5L12 12.5L9.8 11.5Z" fill="#ef4444" />
    <path d="M12 18L14.2 12.5L12 11.5L9.8 12.5Z" fill="#38bdf8" />
    <circle cx="12" cy="12" r="1.8" fill="#fef08a" stroke="currentColor" strokeWidth="0.8" />
  </svg>
);

const IconSparkles = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M12 2.5L13.8 8.8L20 10.5L13.8 12.2L12 18.5L10.2 12.2L4 10.5L10.2 8.8Z" fill="currentColor" />
    <path d="M19 2.5L19.7 5.2L22.5 6L19.7 6.8L19 9.5L18.3 6.8L15.5 6L18.3 5.2Z" fill="currentColor" opacity="0.85" />
    <path d="M5.5 16.5L6.1 18.7L8.5 19.3L6.1 19.9L5.5 22L4.9 19.9L2.5 19.3L4.9 18.7Z" fill="currentColor" opacity="0.75" />
  </svg>
);

const IconMap = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M3 6L9 3L15 6L21 3V18L15 21L9 18L3 21V6Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 3V18M15 6V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
    <circle cx="9" cy="10" r="1.2" fill="#ef4444" />
    <circle cx="15" cy="14" r="1.2" fill="#10b981" />
  </svg>
);

const IconInfoHub = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="12" cy="7.8" r="1.3" fill="currentColor" />
    <path d="M11 11H12.5V16.5H14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconWind = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M3 8H14.5C16.4 8 18 6.4 18 4.5C18 2.6 16.4 1 14.5 1C12.6 1 11 2.6 11 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M2 13H18.5C20.4 13 22 14.6 22 16.5C22 18.4 20.4 20 18.5 20C16.6 20 15 18.4 15 16.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M4 18H10.5C11.9 18 13 19.1 13 20.5C13 21.9 11.9 23 10.5 23C9.1 23 8 21.9 8 20.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const IconBook = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M4 19.5V5C4 3.9 4.9 3 6 3H20V19H6C4.9 19 4 19.9 4 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 19.5C4 20.3 4.7 21 5.5 21H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M8.5 7H16.5M8.5 11H13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12 3V8.5L13.8 7.2L15.5 8.5V3" fill="#f59e0b" />
  </svg>
);

const IconAward = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <circle cx="12" cy="9" r="6" stroke="currentColor" strokeWidth="1.8" />
    <path d="M12 6.5L13 8.6L15.2 8.9L13.6 10.5L14 12.8L12 11.7L10 12.8L10.4 10.5L8.8 8.9L11 8.6Z" fill="currentColor" />
    <path d="M8.2 14.5L6.5 21L12 18.5L17.5 21L15.8 14.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const IconSliders = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M4 7H20M4 17H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="9" cy="7" r="2.4" fill="#0f172a" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="15" cy="17" r="2.4" fill="#0f172a" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

const IconHelp = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" />
    <path d="M9.5 9C9.5 7.6 10.6 6.5 12 6.5C13.4 6.5 14.5 7.6 14.5 9C14.5 10.5 13 11.2 12 12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="12" cy="16.5" r="1.2" fill="currentColor" />
  </svg>
);

const IconHome = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M3 10.5L12 3L21 10.5V20C21 20.6 20.6 21 20 21H15V14H9V21H4C3.4 21 3 20.6 3 20V10.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconGlobe = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" />
    <path d="M2.5 12H21.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 2.5C14.4 6.2 15.8 9.2 15.8 12C15.8 14.8 14.4 17.8 12 21.5C9.6 17.8 8.2 14.8 8.2 12C8.2 9.2 9.6 6.2 12 2.5Z" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const IconMenu = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M4 6.5H20M4 12H20M4 17.5H20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

const IconClose = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

/* =========================================================================
   TYPES & HELPERS
   ========================================================================= */

interface VirtualControlsProps {
  onDirectionPress: (dir: 'up' | 'down' | 'left' | 'right', pressed: boolean) => void;
  onJoystickMove?: (vector: { x: number; y: number } | null) => void;
  onActionPress: () => void;
  onCompassToggle: () => void;
  isCompassActive: boolean;
  onOpenJournal?: () => void;
  onOpenSettings: (tab?: string) => void;
  onOpenTutorial?: () => void;
  isDialogueOpen?: boolean;
  isSettingsOpen?: boolean;
  onToggleMiniMap?: () => void;
  isMiniMapOpen?: boolean;
  onOpenEnding?: () => void;
  isGameCompleted?: boolean;
  onOpenRegulation?: () => void;
  onOpenStartMenu?: () => void;
  onOpenPauseMenu?: () => void;
  empathyScore?: number;
  onOpenPSEScore?: () => void;
  onOpenInfoHub?: (tab?: 'quests' | 'regulation' | 'achievements' | 'journal') => void;
  isPauseOpen?: boolean;
}

export function getPSEPerformanceTier(score: number, lang: 'id' | 'en'): string {
  if (score >= 250) return lang === 'en' ? 'Master of Harmony' : 'Duta Harmoni';
  if (score >= 150) return lang === 'en' ? 'Empathetic Heart' : 'Empati Bijak';
  if (score >= 60) return lang === 'en' ? 'Mindful Observer' : 'Peka Rasa';
  return lang === 'en' ? 'Young Explorer' : 'Penjelajah Belia';
}

/* =========================================================================
   COMPONENT
   ========================================================================= */

export const VirtualControls: React.FC<VirtualControlsProps> = ({
  onDirectionPress,
  onJoystickMove,
  onActionPress,
  onCompassToggle,
  isCompassActive,
  onOpenJournal,
  onOpenSettings,
  onOpenTutorial,
  isDialogueOpen = false,
  isSettingsOpen = false,
  onToggleMiniMap,
  isMiniMapOpen = false,
  onOpenEnding,
  isGameCompleted = false,
  onOpenRegulation,
  onOpenStartMenu,
  onOpenPauseMenu,
  empathyScore = 0,
  onOpenPSEScore,
  onOpenInfoHub,
  isPauseOpen = false,
}) => {
  const { lang, toggleLang, ui } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobileOrTablet = useIsMobileOrTablet();
  const isPortrait = useIsPortrait();

  // Joystick state & refs
  const joystickTouchZoneRef = useRef<HTMLDivElement | null>(null);
  const joystickBaseRef = useRef<HTMLDivElement | null>(null);
  const activeTouchIdRef = useRef<number | null>(null);
  const centerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [knobOffset, setKnobOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const isMouseDownRef = useRef(false);

  // Active direction state for instant tactile visual feedback on the arrows
  const [activeDirections, setActiveDirections] = useState<{
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
  }>({ up: false, down: false, left: false, right: false });

  // Joystick dimensions responsive to device orientation
  const MAX_RADIUS = isPortrait ? 36 : 30; // Maximum stick displacement in px
  const DEADZONE = 0.12;

  // Process coordinates relative to joystick center
  const processPosition = useCallback(
    (clientX: number, clientY: number) => {
      const dx = clientX - centerRef.current.x;
      const dy = clientY - centerRef.current.y;
      const dist = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);
      const clampedDist = Math.min(dist, MAX_RADIUS);

      const kx = Math.cos(angle) * clampedDist;
      const ky = Math.sin(angle) * clampedDist;
      setKnobOffset({ x: kx, y: ky });

      const normDist = clampedDist / MAX_RADIUS;
      if (normDist < DEADZONE) {
        onJoystickMove?.(null);
        onDirectionPress('up', false);
        onDirectionPress('down', false);
        onDirectionPress('left', false);
        onDirectionPress('right', false);
        setActiveDirections({ up: false, down: false, left: false, right: false });
      } else {
        const vx = Math.cos(angle) * normDist;
        const vy = Math.sin(angle) * normDist;
        onJoystickMove?.({ x: vx, y: vy });

        // Direction mapping for legacy handlers
        const threshold = 0.35;
        const right = vx > threshold;
        const left = vx < -threshold;
        const down = vy > threshold;
        const up = vy < -threshold;

        onDirectionPress('right', right);
        onDirectionPress('left', left);
        onDirectionPress('down', down);
        onDirectionPress('up', up);
        setActiveDirections({ up, down, left, right });
      }
    },
    [MAX_RADIUS, onJoystickMove, onDirectionPress]
  );

  const resetJoystick = useCallback(() => {
    activeTouchIdRef.current = null;
    isMouseDownRef.current = false;
    setIsDragging(false);
    setKnobOffset({ x: 0, y: 0 });
    setActiveDirections({ up: false, down: false, left: false, right: false });
    onJoystickMove?.(null);
    onDirectionPress('up', false);
    onDirectionPress('down', false);
    onDirectionPress('left', false);
    onDirectionPress('right', false);
  }, [onJoystickMove, onDirectionPress]);

  // Touch handlers for joystick with generous touch boundary
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (activeTouchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    if (!touch || !joystickBaseRef.current) return;

    activeTouchIdRef.current = touch.identifier;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    centerRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    setIsDragging(true);
    processPosition(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (activeTouchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === activeTouchIdRef.current) {
        processPosition(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (activeTouchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === activeTouchIdRef.current) {
        resetJoystick();
        break;
      }
    }
  };

  // Mouse handlers for desktop browser / emulation testing
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!joystickBaseRef.current) return;
    isMouseDownRef.current = true;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    centerRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    setIsDragging(true);
    processPosition(e.clientX, e.clientY);
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isMouseDownRef.current) return;
      processPosition(e.clientX, e.clientY);
    };

    const handleGlobalMouseUp = () => {
      if (isMouseDownRef.current) {
        resetJoystick();
      }
    };

    const handleGlobalTouchEnd = (e: TouchEvent) => {
      if (activeTouchIdRef.current !== null) {
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === activeTouchIdRef.current) {
            resetJoystick();
            break;
          }
        }
      }
    };

    const handleOrientationChange = () => {
      resetJoystick();
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalTouchEnd);
    window.addEventListener('touchcancel', handleGlobalTouchEnd);
    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalTouchEnd);
      window.removeEventListener('touchcancel', handleGlobalTouchEnd);
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [processPosition, resetJoystick]);

  useEffect(() => {
    if (isSettingsOpen || isPauseOpen) {
      resetJoystick();
      setIsMenuOpen(false);
    }
  }, [isSettingsOpen, isPauseOpen, resetJoystick]);

  return (
    <>
      {/* =========================================================================
          TOP HUD BAR (MOBILE & DESKTOP TOOLBAR)
          ========================================================================= */}
      <header
        className={`fixed top-2 sm:top-3 left-2 sm:left-4 right-2 sm:right-4 flex items-center justify-between z-30 pointer-events-none gap-1.5 sm:gap-2 transition-opacity duration-200 ${
          isSettingsOpen || isPauseOpen ? 'opacity-20 pointer-events-none select-none' : ''
        }`}
      >
        {/* Left Side: Brand Pause Button & SEL Score Badge */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto shrink-0">
          {/* Brand / Title Badge - Interactive Pause Menu Button */}
          <div
            id="header-brand-pause-button"
            role="button"
            tabIndex={0}
            onClick={() => {
              if (!isSettingsOpen && !isPauseOpen) {
                onOpenPauseMenu?.();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (!isSettingsOpen && !isPauseOpen) onOpenPauseMenu?.();
              }
            }}
            title={ui.openPauseMenu}
            aria-label={ui.openPauseMenu}
            className={`group bg-slate-950/95 hover:bg-slate-900 border border-slate-800 hover:border-amber-400/80 rounded-xl px-2.5 sm:px-3 py-1 sm:py-1.5 shadow-xl hover:shadow-[0_0_20px_rgba(245,158,11,0.25)] backdrop-blur-md flex items-center gap-1.5 shrink-0 transition-transform duration-75 cursor-pointer select-none active:scale-95 touch-manipulation ${
              isSettingsOpen || isPauseOpen ? 'pointer-events-none opacity-40' : 'pointer-events-auto'
            }`}
          >
            <span className="text-xs sm:text-sm transition-transform duration-200 group-hover:rotate-12">🧭</span>
            <span
              className="text-amber-400 group-hover:text-amber-300 font-bold tracking-tight whitespace-nowrap"
              style={{
                fontFamily: "'Pixelify Sans', cursive, sans-serif",
                fontWeight: 'bold',
                fontSize: '14px',
              }}
            >
              {ui.brandTitle}
            </span>
          </div>

          {/* Social-Emotional Performance Score Badge - In landscape mobile, placed inline for zero vertical obstruction */}
          <div
            id="header-pse-score-badge"
            onClick={() => {
              if (onOpenPSEScore) onOpenPSEScore();
              else onOpenInfoHub?.('quests');
            }}
            title={
              lang === 'en'
                ? `Social-Emotional Score: ${empathyScore} Points • Click to view SEL Score details`
                : `Skor Sosial Emosional: ${empathyScore} Poin • Klik untuk melihat rincian skor PSE`
            }
            className={`bg-slate-950/95 border border-pink-500/70 hover:border-pink-400 hover:bg-slate-900 rounded-xl px-2 sm:px-2.5 py-1 sm:py-1.5 shadow-xl hover:shadow-[0_0_16px_rgba(236,72,153,0.35)] backdrop-blur-md flex items-center gap-1.5 shrink-0 transition-all duration-75 select-none pointer-events-auto cursor-pointer active:scale-95 ${
              isPortrait
                ? 'absolute left-0 top-[38px] sm:top-[44px]'
                : 'relative'
            }`}
          >
            <span className="text-xs sm:text-sm animate-pulse">💖</span>
            <div className="flex flex-col items-center justify-center leading-none">
              <span
                className="text-pink-300 font-bold tracking-tight whitespace-nowrap hidden sm:inline"
                style={{
                  fontFamily: 'Galindo, cursive, sans-serif',
                  fontSize: '10px',
                }}
              >
                {lang === 'en' ? 'SEL Score' : 'Skor PSE'}
              </span>
              <span
                className="font-pixel text-amber-300 font-extrabold tracking-tight text-center leading-none"
                style={{ fontSize: isPortrait ? '16px' : '15px' }}
              >
                {empathyScore}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Unified Menu Button on Mobile, Full Toolbar on Desktop */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto shrink-0">
          {/* MOBILE ONLY: Single Unified MENU Button */}
          <div className="flex items-center gap-1.5 lg:hidden">
            <button
              id="top-unified-menu-btn"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Menu"
              className="px-2.5 py-1 sm:py-1.5 rounded-xl bg-slate-950/95 border border-amber-400/80 hover:border-amber-300 hover:bg-slate-900 active:bg-amber-500/20 text-amber-300 shadow-lg flex items-center gap-1.5 text-xs font-bold cursor-pointer active:scale-95 transition-transform duration-75"
            >
              <IconMenu className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              <span className="font-pixel text-[8px] sm:text-[9px] tracking-tight">MENU</span>
            </button>
          </div>

          {/* DESKTOP ONLY: Full Toolbar for large screens */}
          <div className="hidden lg:flex items-center gap-1.5 sm:gap-2">
            {/* Tombol Resonansi Kompas Hati */}
            <button
              id="toggle-resonance-btn"
              onClick={onCompassToggle}
              disabled={isSettingsOpen || isPauseOpen}
              title={ui.toggleResonance}
              className={`group relative px-2.5 py-1.5 group-hover:px-3 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-200 flex items-center justify-center gap-0 group-hover:gap-1.5 text-xs font-semibold cursor-pointer active:scale-95 ${
                isCompassActive
                  ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.7)] font-bold ring-2 ring-amber-300/60'
                  : 'bg-slate-950/90 text-amber-300 border-amber-500/40 hover:bg-slate-900'
              }`}
            >
              {isCompassActive && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 pointer-events-none">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
                </span>
              )}
              {isCompassActive ? (
                <IconSparkles className="w-4 h-4 text-slate-950 animate-pulse shrink-0" />
              ) : (
                <IconCompass className="w-4 h-4 shrink-0" />
              )}
              <span
                className="max-w-0 overflow-hidden opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-200 whitespace-nowrap font-bold inline-block"
                style={{
                  fontFamily: 'Galindo, cursive, sans-serif',
                  fontWeight: 'bold',
                  fontSize: '12px',
                }}
              >
                {isCompassActive ? ui.activeResonance : ui.heartCompass}
              </span>
              <span className="max-w-0 overflow-hidden opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-200 hidden xl:inline text-[10px] text-slate-400 font-mono">
                C
              </span>
            </button>

            {onToggleMiniMap && (
              <button
                id="top-map-toggle-btn"
                onClick={onToggleMiniMap}
                title={isMiniMapOpen ? (lang === 'en' ? 'Hide Mini Map' : 'Sembunyikan Peta Mini') : (lang === 'en' ? 'Open Mini Map' : 'Buka Peta Mini')}
                className={`group px-2.5 py-1.5 group-hover:px-3 rounded-xl border shadow-md flex items-center justify-center gap-0 group-hover:gap-1.5 text-xs font-semibold cursor-pointer active:scale-95 transition-all duration-200 ${
                  isMiniMapOpen
                    ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-[0_0_14px_rgba(245,158,11,0.6)]'
                    : 'bg-slate-950/90 border-slate-700 hover:border-amber-400/60 hover:bg-slate-900 text-slate-300'
                }`}
              >
                <IconMap className="w-4 h-4 text-amber-400 rounded-sm shrink-0" />
                <span
                  className="max-w-0 overflow-hidden opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-200 whitespace-nowrap inline-block"
                  style={{ fontFamily: 'Galindo, cursive, sans-serif' }}
                >
                  {ui.map}
                </span>
                <span className="max-w-0 overflow-hidden opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-200 text-[10px] text-slate-400 font-mono">
                  M
                </span>
              </button>
            )}

            {/* UNIFIED PUSAT INFORMASI */}
            {onOpenInfoHub ? (
              <button
                id="top-info-hub-btn"
                onClick={() => onOpenInfoHub('quests')}
                title={
                  lang === 'en'
                    ? 'Adventurer Info Center: Quests, Regulation, Badges, Journal'
                    : 'Pusat Informasi: Progres Misi, Regulasi, Lencana dan Jurnal'
                }
                className="group px-2.5 py-1.5 group-hover:px-3 rounded-xl bg-gradient-to-r from-amber-950/90 via-slate-950 to-pink-950/90 border-2 border-amber-400/80 hover:border-amber-300 hover:bg-slate-900 text-amber-300 hover:text-white shadow-[0_0_16px_rgba(245,158,11,0.3)] flex items-center justify-center gap-0 group-hover:gap-1.5 text-xs font-bold cursor-pointer active:scale-95 transition-all duration-200"
              >
                <IconInfoHub className="w-4 h-4 text-amber-300 shrink-0" />
                <span
                  className="max-w-0 overflow-hidden opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-200 whitespace-nowrap inline-block"
                  style={{ fontFamily: 'Galindo, cursive, sans-serif' }}
                >
                  {lang === 'en' ? 'Info and Progress' : 'Pusat Informasi'}
                </span>
                <span className="max-w-0 overflow-hidden opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-200 text-[10px] text-amber-400/90 font-mono bg-slate-950 px-1 py-0.5 rounded border border-amber-500/30">
                  I
                </span>
              </button>
            ) : (
              <>
                {onOpenRegulation && (
                  <button
                    id="top-regulation-btn"
                    onClick={onOpenRegulation}
                    title={lang === 'en' ? 'Open Emotion Regulation Studio' : 'Buka Studio Regulasi Emosi dan Relaksasi'}
                    className="group px-2.5 py-1.5 group-hover:px-3 rounded-xl bg-cyan-950/90 border border-cyan-400/60 hover:border-cyan-300 hover:bg-cyan-900/90 text-cyan-300 shadow-md flex items-center justify-center gap-0 group-hover:gap-1.5 text-xs font-semibold cursor-pointer active:scale-95 transition-all duration-200"
                  >
                    <IconWind className="w-4 h-4 text-cyan-300 shrink-0" />
                    <span
                      className="max-w-0 overflow-hidden opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-200 whitespace-nowrap inline-block"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      {ui.regulation}
                    </span>
                    <span className="max-w-0 overflow-hidden opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-200 text-[10px] text-cyan-400/80 font-mono">
                      R
                    </span>
                  </button>
                )}

                {onOpenJournal && (
                  <button
                    id="top-journal-btn"
                    onClick={onOpenJournal}
                    title={lang === 'en' ? 'Open Heart Compass Journal and Bag' : 'Buka Jurnal Kompas Hati dan Tas'}
                    className="group px-2.5 py-1.5 group-hover:px-3 rounded-xl bg-slate-950/90 border border-amber-500/50 hover:border-amber-400 hover:bg-slate-900 text-amber-300 shadow-md flex items-center justify-center gap-0 group-hover:gap-1.5 text-xs font-semibold cursor-pointer active:scale-95 transition-all duration-200"
                  >
                    <IconBook className="w-4 h-4 text-amber-400 shrink-0" />
                    <span
                      className="max-w-0 overflow-hidden opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-200 whitespace-nowrap inline-block"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      {ui.journal}
                    </span>
                    <span className="max-w-0 overflow-hidden opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-200 text-[10px] text-amber-400/80 font-mono">
                      J
                    </span>
                  </button>
                )}
              </>
            )}

            {isGameCompleted && onOpenEnding && (
              <button
                id="top-ending-btn"
                onClick={onOpenEnding}
                title={lang === 'en' ? 'Open Graduation Certificate' : 'Buka Sertifikat Kelulusan'}
                className="group px-2.5 py-1.5 group-hover:px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-300 shadow-[0_0_14px_rgba(245,158,11,0.6)] font-bold flex items-center justify-center gap-0 group-hover:gap-1.5 text-xs cursor-pointer active:scale-95 transition-all duration-200"
              >
                <IconAward className="w-4 h-4 text-slate-950 shrink-0" />
                <span className="max-w-0 overflow-hidden opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-200 whitespace-nowrap inline-block">
                  {ui.certificate}
                </span>
              </button>
            )}

            {/* PENGATURAN */}
            <button
              id="top-settings-btn"
              onClick={() => onOpenSettings()}
              title={lang === 'en' ? 'Game Settings: Audio and Controls' : 'Pengaturan Game: Audio dan Kontrol'}
              className="group px-2.5 py-1.5 group-hover:px-3 rounded-xl bg-slate-950/95 border border-amber-400/80 hover:bg-slate-900 hover:border-amber-300 text-amber-300 shadow-md flex items-center justify-center gap-0 group-hover:gap-1.5 text-xs font-bold cursor-pointer active:scale-95 transition-all duration-200"
            >
              <IconSliders className="w-4 h-4 text-amber-400 shrink-0" />
              <span
                className="max-w-0 overflow-hidden opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-200 whitespace-nowrap inline-block"
                style={{ fontFamily: 'Galindo, cursive, sans-serif' }}
              >
                {ui.settings}
              </span>
              <span className="max-w-0 overflow-hidden opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-200 text-[10px] text-slate-400 font-mono">
                O
              </span>
            </button>

            {/* Language Switcher Button */}
            <button
              id="top-language-toggle-btn"
              onClick={toggleLang}
              title={lang === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
              className="group px-2.5 py-1.5 group-hover:px-3 rounded-xl bg-slate-950/90 border border-amber-500/60 hover:border-amber-300 hover:bg-slate-900 active:scale-95 text-amber-300 shadow-lg backdrop-blur-md transition-all duration-200 flex items-center justify-center gap-0 group-hover:gap-1 text-xs font-semibold cursor-pointer touch-manipulation"
            >
              <IconGlobe className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="max-w-0 overflow-hidden opacity-0 group-hover:max-w-[40px] group-hover:opacity-100 transition-all duration-200 whitespace-nowrap font-pixel text-[8px] sm:text-[9px] font-bold">
                {lang === 'id' ? 'ID' : 'EN'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          UNIFIED MOBILE MENU SHEET (EXPANDS INTO RESPONSIVE 2-COL IN LANDSCAPE)
          ========================================================================= */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150 pointer-events-auto select-none"
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            className={`bg-slate-900/98 border border-amber-500/60 rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md md:max-w-lg overflow-hidden text-slate-100 flex flex-col max-h-[94vh] modal-glow-frame ${
              !isPortrait ? 'max-w-[540px]' : ''
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Menu Header */}
            <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/90">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-sm">
                  🎒
                </div>
                <div>
                  <h3 className="font-pixel text-[9px] sm:text-[10px] text-amber-300 font-bold">
                    Menu Petualangan
                  </h3>
                  <p className="text-[9px] sm:text-[10px] text-slate-400">
                    Ezzel • Lembah Nada Rasa
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-800 hover:bg-rose-950/60 hover:border hover:border-rose-500/50 hover:scale-105 active:bg-slate-700 text-slate-300 flex items-center justify-center transition-all cursor-pointer"
                aria-label="Tutup Menu"
              >
                <IconClose className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Menu Content Container (Adaptive Grid for mobile landscape) */}
            <div className="p-3 sm:p-3.5 space-y-2 overflow-y-auto custom-scrollbar flex-1">
              {/* Card Skor Sosial Emosional (PSE) & Performa */}
              <div
                onClick={() => {
                  if (onOpenPSEScore) {
                    onOpenPSEScore();
                    setIsMenuOpen(false);
                  } else if (onOpenInfoHub) {
                    onOpenInfoHub('quests');
                    setIsMenuOpen(false);
                  }
                }}
                className={`p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-pink-950/70 via-slate-900 to-amber-950/60 border border-pink-500/50 shadow-md flex items-center justify-between ${
                  onOpenPSEScore || onOpenInfoHub ? 'cursor-pointer hover:border-pink-400 active:scale-95 transition-all' : ''
                }`}
              >
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-pink-500/20 border border-pink-400/50 flex items-center justify-center text-lg sm:text-xl shadow-[0_0_12px_rgba(236,72,153,0.3)] shrink-0">
                    💖
                  </div>
                  <div>
                    <div className="text-[9px] sm:text-[10px] text-pink-300 font-pixel font-bold">
                      {lang === 'en' ? 'SEL PERFORMANCE SCORE' : 'SKOR SOSIAL EMOSIONAL'}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-pixel text-sm sm:text-base font-black text-amber-300">
                        {empathyScore} <span className="text-[9px] text-pink-200 font-sans font-normal">{lang === 'en' ? 'Points' : 'Poin'}</span>
                      </span>
                      <span className="text-[8.5px] sm:text-[9px] font-pixel text-emerald-300 font-bold">
                        {getPSEPerformanceTier(empathyScore, lang)}
                      </span>
                    </div>
                    <div className="text-[9px] text-slate-400 font-sans mt-0.5">
                      {lang === 'en'
                        ? 'Bantuan kompas -5 • Jawaban mandiri skor utuh'
                        : 'Bantuan kompas -5 • Jawaban mandiri skor utuh'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons: 2 Columns in Landscape for Compact Ergonomics */}
              <div className={`gap-2 ${!isPortrait ? 'grid grid-cols-2' : 'flex flex-col'}`}>
                {/* Option 1: Peta Mini Lembah */}
                {onToggleMiniMap && (
                  <button
                    onClick={() => {
                      onToggleMiniMap();
                      setIsMenuOpen(false);
                    }}
                    className="w-full p-2 sm:p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 active:bg-slate-700 border border-slate-700 hover:border-amber-400/80 active:scale-95 shadow-md flex items-center justify-between text-left transition-transform duration-75 cursor-pointer touch-manipulation"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
                        <IconMap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-amber-200 flex items-center gap-1.5">
                          <span>{lang === 'en' ? 'Valley Map' : 'Peta Lembah'}</span>
                          {isMiniMapOpen && (
                            <span className="text-[8.5px] bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded font-bold shadow-xs">
                              {lang === 'en' ? 'Active' : 'Aktif'}
                            </span>
                          )}
                        </div>
                        <div className="text-[9.5px] text-slate-400 line-clamp-1">
                          {lang === 'en' ? 'View villagers and valley locations' : 'Lihat lokasi warga dan jembatan'}
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                      M
                    </span>
                  </button>
                )}

                {/* Option 2: Pusat Informasi & Progres */}
                {onOpenInfoHub ? (
                  <button
                    onClick={() => {
                      onOpenInfoHub('quests');
                      setIsMenuOpen(false);
                    }}
                    className="w-full p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-amber-950/80 via-slate-800 to-pink-950/80 hover:bg-slate-750 active:bg-slate-700 border-2 border-amber-400/80 hover:border-amber-300 active:scale-95 shadow-md flex items-center justify-between text-left transition-transform duration-75 cursor-pointer touch-manipulation"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-amber-300 shrink-0">
                        <IconInfoHub className="w-4 h-4 text-amber-300" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-amber-200">
                          {lang === 'en' ? 'Adventurer Info Center' : 'Pusat Informasi dan Progres'}
                        </div>
                        <div className="text-[9.5px] text-slate-300 line-clamp-1">
                          {lang === 'en'
                            ? 'Quests, regulation, badges and journal'
                            : 'Misi, regulasi emosi, lencana dan jurnal'}
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] text-amber-400 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                      I
                    </span>
                  </button>
                ) : (
                  <>
                    {onOpenRegulation && (
                      <button
                        onClick={() => {
                          onOpenRegulation();
                          setIsMenuOpen(false);
                        }}
                        className="w-full p-2 sm:p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 active:bg-slate-700 border border-cyan-500/40 hover:border-cyan-300 active:scale-95 shadow-md flex items-center justify-between text-left transition-transform duration-75 cursor-pointer touch-manipulation"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">
                            <IconWind className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-xs text-cyan-200">
                              {lang === 'en' ? 'Emotion Regulation' : 'Studio Regulasi Emosi'}
                            </div>
                            <div className="text-[9.5px] text-slate-400 line-clamp-1">
                              {lang === 'en' ? 'Breathing and grounding' : 'Latihan napas balon dan relaksasi'}
                            </div>
                          </div>
                        </div>
                        <span className="text-[9px] text-cyan-400/80 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                          R
                        </span>
                      </button>
                    )}

                    {onOpenJournal && (
                      <button
                        onClick={() => {
                          onOpenJournal();
                          setIsMenuOpen(false);
                        }}
                        className="w-full p-2 sm:p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 active:bg-slate-700 border border-amber-500/40 hover:border-amber-400 active:scale-95 shadow-md flex items-center justify-between text-left transition-transform duration-75 cursor-pointer touch-manipulation"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
                            <IconBook className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-xs text-amber-200">
                              {lang === 'en' ? 'Journal and Bag' : 'Jurnal dan Tas Petualang'}
                            </div>
                            <div className="text-[9.5px] text-slate-400 line-clamp-1">
                              {lang === 'en' ? 'Village lore and items' : 'Lore cerita desa dan barang'}
                            </div>
                          </div>
                        </div>
                        <span className="text-[9px] text-amber-400/80 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                          J
                        </span>
                      </button>
                    )}
                  </>
                )}

                {/* Option 3: Sertifikat Kelulusan (jika tamat) */}
                {isGameCompleted && onOpenEnding && (
                  <button
                    onClick={() => {
                      onOpenEnding();
                      setIsMenuOpen(false);
                    }}
                    className="w-full p-2 sm:p-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 active:bg-amber-500/40 border border-amber-400 hover:border-amber-300 active:scale-95 shadow-md flex items-center justify-between text-left transition-transform duration-75 cursor-pointer touch-manipulation"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs shrink-0">
                        <IconAward className="w-4 h-4 text-slate-950" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-amber-300">
                          {lang === 'en' ? 'Graduation Certificate' : 'Sertifikat Kelulusan'}
                        </div>
                        <div className="text-[9.5px] text-amber-200/80 line-clamp-1">
                          {lang === 'en' ? 'Golden Empathy Charter' : 'Piagam Duta Empati Ezzel'}
                        </div>
                      </div>
                    </div>
                    <span className="text-[8px] bg-amber-400 text-slate-950 font-bold px-1.5 py-0.5 rounded shadow">
                      LULUS
                    </span>
                  </button>
                )}

                {/* Option 4: Pengaturan Game */}
                <button
                  onClick={() => {
                    onOpenSettings();
                    setIsMenuOpen(false);
                  }}
                  className="w-full p-2 sm:p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 active:bg-slate-700 border border-slate-700 hover:border-amber-400/70 active:scale-95 shadow-md flex items-center justify-between text-left transition-transform duration-75 cursor-pointer touch-manipulation"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-slate-200 shrink-0">
                      <IconSliders className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-slate-200">
                        {lang === 'en' ? 'Settings Audio and Controls' : 'Pengaturan Audio dan Kontrol'}
                      </div>
                      <div className="text-[9.5px] text-slate-400 line-clamp-1">
                        {lang === 'en' ? 'Sound volume and controls guide' : 'Volume suara dan panduan tombol'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                    O
                  </span>
                </button>

                {/* Option 5: Tutorial Cara Bermain */}
                {onOpenTutorial && (
                  <button
                    onClick={() => {
                      onOpenTutorial();
                      setIsMenuOpen(false);
                    }}
                    className="w-full p-2 sm:p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 active:bg-slate-700 border border-emerald-500/40 hover:border-emerald-300 active:scale-95 shadow-md flex items-center justify-between text-left transition-transform duration-75 cursor-pointer touch-manipulation"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0">
                        <IconHelp className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-emerald-200">
                          {lang === 'en' ? 'How to Play Tutorial' : 'Tutorial Cara Bermain'}
                        </div>
                        <div className="text-[9.5px] text-slate-400 line-clamp-1">
                          {lang === 'en' ? 'Controls, compass and mechanics' : 'Panduan kontrol dan kompas'}
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] text-emerald-400 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                      H
                    </span>
                  </button>
                )}

                {/* Option 6: Menu Awal / Title Screen */}
                {onOpenStartMenu && (
                  <button
                    onClick={() => {
                      onOpenStartMenu();
                      setIsMenuOpen(false);
                    }}
                    className="w-full p-2 sm:p-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 active:bg-slate-750 border border-amber-500/40 hover:border-amber-400 active:scale-95 shadow-md flex items-center justify-between text-left transition-transform duration-75 cursor-pointer touch-manipulation"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
                        <IconHome className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-amber-300">
                          {ui.titleScreen}
                        </div>
                        <div className="text-[9.5px] text-slate-400 line-clamp-1">
                          {ui.titleScreenDesc}
                        </div>
                      </div>
                    </div>
                    <span className="text-[8px] text-amber-400 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                      TITLE
                    </span>
                  </button>
                )}

                {/* Option 7: Ganti Bahasa */}
                <button
                  onClick={() => {
                    toggleLang();
                  }}
                  className="w-full p-2 sm:p-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 active:bg-slate-750 border border-amber-500/40 hover:border-amber-400 active:scale-95 shadow-md flex items-center justify-between text-left transition-transform duration-75 cursor-pointer touch-manipulation"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
                      <IconGlobe className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-amber-300">
                        {lang === 'id' ? 'Bahasa Indonesia' : 'English Language'}
                      </div>
                      <div className="text-[9.5px] text-slate-400 line-clamp-1">
                        {lang === 'id' ? 'Sentuh untuk beralih ke English' : 'Tap to switch to Bahasa Indonesia'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[8px] text-amber-400 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                    {lang.toUpperCase()}
                  </span>
                </button>
              </div>
            </div>

            {/* Menu Footer */}
            <div className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[9px] sm:text-[10px] text-slate-400">
              <span>{ui.mainCharacterLabel} <strong className="text-emerald-400">Ezzel</strong></span>
              <span>{ui.compassLabel} <strong className="text-amber-400">{isCompassActive ? ui.compassActive : ui.compassStandby}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIRTUAL ANALOG JOYSTICK (MOBILE & TABLET ERGONOMIC TOUCH CONTROLLER)
          ========================================================================= */}
      {!isDialogueOpen && !isSettingsOpen && !isPauseOpen && isMobileOrTablet && (
        <div
          ref={joystickTouchZoneRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          onMouseDown={handleMouseDown}
          className={`fixed z-30 pointer-events-auto select-none touch-none flex items-center justify-center ${
            isPortrait
              ? 'bottom-3 left-3 sm:bottom-5 sm:left-5 w-36 h-36'
              : 'bottom-2 left-2 sm:bottom-3 sm:left-4 w-32 h-32'
          }`}
          style={{ touchAction: 'none' }}
        >
          {/* Circular Joystick Base Plate */}
          <div
            ref={joystickBaseRef}
            className={`relative rounded-full bg-slate-950/85 border-2 transition-colors duration-150 backdrop-blur-md flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.7)] ${
              isPortrait ? 'w-26 h-26 sm:w-28 sm:h-28' : 'w-22 h-22 sm:w-24 sm:h-24'
            } ${
              isDragging
                ? 'border-amber-400/90 shadow-[0_0_20px_rgba(245,158,11,0.35)]'
                : 'border-slate-700/80'
            }`}
          >
            {/* Dynamic Directional Indicator Arrows (Light up when active) */}
            <span
              className={`absolute top-1 font-pixel transition-all duration-75 select-none ${
                isPortrait ? 'text-[8px]' : 'text-[7px]'
              } ${
                activeDirections.up
                  ? 'text-amber-300 scale-125 drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]'
                  : 'text-slate-600/70'
              }`}
            >
              ▲
            </span>
            <span
              className={`absolute bottom-1 font-pixel transition-all duration-75 select-none ${
                isPortrait ? 'text-[8px]' : 'text-[7px]'
              } ${
                activeDirections.down
                  ? 'text-amber-300 scale-125 drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]'
                  : 'text-slate-600/70'
              }`}
            >
              ▼
            </span>
            <span
              className={`absolute left-1.5 font-pixel transition-all duration-75 select-none ${
                isPortrait ? 'text-[8px]' : 'text-[7px]'
              } ${
                activeDirections.left
                  ? 'text-amber-300 scale-125 drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]'
                  : 'text-slate-600/70'
              }`}
            >
              ◀
            </span>
            <span
              className={`absolute right-1.5 font-pixel transition-all duration-75 select-none ${
                isPortrait ? 'text-[8px]' : 'text-[7px]'
              } ${
                activeDirections.right
                  ? 'text-amber-300 scale-125 drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]'
                  : 'text-slate-600/70'
              }`}
            >
              ▶
            </span>

            {/* Inner Ring Guide Line */}
            <div
              className={`rounded-full border border-slate-700/40 pointer-events-none ${
                isPortrait ? 'w-16 h-16' : 'w-13 h-13'
              }`}
            />

            {/* Movable Thumbstick Knob with 3D tactile grip */}
            <div
              className={`absolute rounded-full border-2 flex items-center justify-center transition-transform ${
                isPortrait ? 'w-12 h-12' : 'w-10 h-10'
              } ${
                isDragging ? 'duration-0 scale-105' : 'duration-150 ease-out'
              } ${
                isDragging
                  ? 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 border-amber-200 shadow-[0_0_16px_rgba(245,158,11,0.75)]'
                  : 'bg-gradient-to-br from-slate-700 to-slate-900 border-slate-500 shadow-md'
              }`}
              style={{
                transform: `translate(${knobOffset.x}px, ${knobOffset.y}px)`,
                pointerEvents: 'none',
              }}
            >
              {/* Tactile 4-Dot Rubber Grip Texture */}
              <div className="grid grid-cols-2 gap-1 pointer-events-none">
                <span className={`w-1.5 h-1.5 rounded-full ${isDragging ? 'bg-amber-950/70' : 'bg-slate-400/60'}`} />
                <span className={`w-1.5 h-1.5 rounded-full ${isDragging ? 'bg-amber-950/70' : 'bg-slate-400/60'}`} />
                <span className={`w-1.5 h-1.5 rounded-full ${isDragging ? 'bg-amber-950/70' : 'bg-slate-400/60'}`} />
                <span className={`w-1.5 h-1.5 rounded-full ${isDragging ? 'bg-amber-950/70' : 'bg-slate-400/60'}`} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ERGONOMIC ACTION BUTTON CLUSTER (ARC LAYOUT FOR NATURAL THUMB REACH)
          ========================================================================= */}
      {!isDialogueOpen && !isSettingsOpen && !isPauseOpen && isMobileOrTablet && (
        <div
          className={`fixed z-30 flex items-end pointer-events-auto select-none touch-none ${
            isPortrait
              ? 'bottom-3 right-3 sm:bottom-5 sm:right-5 gap-2'
              : 'bottom-2 right-2 sm:bottom-3 sm:right-4 gap-1.5'
          }`}
          style={{ touchAction: 'none' }}
        >
          {/* Button B: Resonance Compass (Staggered slightly higher for natural thumb sweep) */}
          <button
            id="btn-compass-mobile"
            onTouchStart={(e) => {
              e.preventDefault();
              onCompassToggle();
            }}
            onClick={(e) => {
              e.stopPropagation();
              onCompassToggle();
            }}
            aria-label="Kompas Hati"
            className={`relative rounded-full border-2 flex flex-col items-center justify-center font-bold shadow-lg transition-transform duration-75 active:scale-90 cursor-pointer touch-manipulation mb-2.5 sm:mb-3 ${
              isPortrait ? 'w-12 h-12 sm:w-13 sm:h-13' : 'w-10 h-10 sm:w-11 sm:h-11'
            } ${
              isCompassActive
                ? 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 border-amber-200 shadow-[0_0_24px_rgba(245,158,11,0.85)] ring-2 ring-amber-300/70'
                : 'bg-slate-950/90 text-amber-300 border-amber-400/70 hover:border-amber-300 hover:bg-slate-900 shadow-[0_0_14px_rgba(245,158,11,0.5)]'
            }`}
          >
            {isCompassActive && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 pointer-events-none">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
              </span>
            )}
            {isCompassActive ? (
              <IconSparkles className={`${isPortrait ? 'w-4.5 h-4.5' : 'w-4 h-4'} text-slate-950 animate-pulse`} />
            ) : (
              <IconCompass className={`${isPortrait ? 'w-4.5 h-4.5' : 'w-4 h-4'}`} active={isCompassActive} />
            )}
            <span
              className={`font-pixel tracking-tighter leading-none mt-0.5 ${
                isPortrait ? 'text-[7px]' : 'text-[6.5px]'
              }`}
            >
              {isCompassActive ? ui.btnCompassActive : ui.btnCompassStandby}
            </span>
          </button>

          {/* Button A: Main Action / Talk / Interact (Heroic Emerald Crystal Button) */}
          <button
            id="btn-action-mobile"
            onTouchStart={(e) => {
              e.preventDefault();
              onActionPress();
            }}
            onClick={(e) => {
              e.stopPropagation();
              onActionPress();
            }}
            aria-label="Aksi atau Bicara"
            className={`rounded-full bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white shadow-[0_4px_18px_rgba(16,185,129,0.7),inset_0_1px_2px_rgba(255,255,255,0.4)] border-2 border-emerald-300 flex flex-col items-center justify-center font-bold active:scale-90 transition-transform duration-75 cursor-pointer touch-manipulation ${
              isPortrait ? 'w-14 h-14 sm:w-15 sm:h-15' : 'w-12 h-12 sm:w-13 sm:h-13'
            }`}
          >
            <span
              className={`font-black tracking-tight leading-none ${
                isPortrait ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
              }`}
              style={{ fontFamily: 'Galindo, cursive, sans-serif' }}
            >
              A
            </span>
            <span
              className={`font-pixel tracking-tighter leading-none mt-0.5 text-emerald-100 ${
                isPortrait ? 'text-[7.5px]' : 'text-[7px]'
              }`}
            >
              {ui.btnAction}
            </span>
          </button>
        </div>
      )}
    </>
  );
};
