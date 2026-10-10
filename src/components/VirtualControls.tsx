import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Compass, BookOpen, Map as MapIcon, Sliders, Award, Wind, Menu, X, Home, Sparkles, Globe, HelpCircle } from 'lucide-react';
import { useIsMobileOrTablet } from '../utils/device';
import { useLanguage } from '../game/localization';

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
}

export function getPSEPerformanceTier(score: number, lang: 'id' | 'en'): string {
  if (score >= 250) return lang === 'en' ? 'Master of Harmony 🌟' : 'Duta Harmoni 🌟';
  if (score >= 150) return lang === 'en' ? 'Empathetic Heart 💖' : 'Empati Bijak 💖';
  if (score >= 60) return lang === 'en' ? 'Mindful Observer 🌱' : 'Peka Rasa 🌱';
  return lang === 'en' ? 'Young Explorer 🧭' : 'Penjelajah Belia 🧭';
}

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
}) => {
  const { lang, toggleLang, ui } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobileOrTablet = useIsMobileOrTablet();

  // Joystick state & refs
  const joystickBaseRef = useRef<HTMLDivElement | null>(null);
  const activeTouchIdRef = useRef<number | null>(null);
  const centerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [knobOffset, setKnobOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const isMouseDownRef = useRef(false);

  const MAX_RADIUS = 36; // maximum stick displacement in px
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
      } else {
        const vx = Math.cos(angle) * normDist;
        const vy = Math.sin(angle) * normDist;
        onJoystickMove?.({ x: vx, y: vy });

        // Direction mapping for legacy handlers
        const threshold = 0.35;
        onDirectionPress('right', vx > threshold);
        onDirectionPress('left', vx < -threshold);
        onDirectionPress('down', vy > threshold);
        onDirectionPress('up', vy < -threshold);
      }
    },
    [onJoystickMove, onDirectionPress]
  );

  const resetJoystick = useCallback(() => {
    activeTouchIdRef.current = null;
    isMouseDownRef.current = false;
    setIsDragging(false);
    setKnobOffset({ x: 0, y: 0 });
    onJoystickMove?.(null);
    onDirectionPress('up', false);
    onDirectionPress('down', false);
    onDirectionPress('left', false);
    onDirectionPress('right', false);
  }, [onJoystickMove, onDirectionPress]);

  // Touch handlers for joystick
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
    if (isSettingsOpen) {
      resetJoystick();
      setIsMenuOpen(false);
    }
  }, [isSettingsOpen, resetJoystick]);

  return (
    <>
      {/* Top Bar Controls - Fits neatly on all screen sizes and mobile orientations */}
      <header className={`fixed top-2 sm:top-3 left-2 sm:left-4 right-2 sm:right-4 flex items-center justify-between z-30 pointer-events-none gap-1.5 sm:gap-2 transition-opacity duration-200 ${isSettingsOpen ? 'opacity-20 pointer-events-none select-none' : ''}`}>
        {/* Left: Brand / Title Badge - Interactive Pause Menu Button */}
        <div
          id="header-brand-pause-button"
          role="button"
          tabIndex={0}
          onClick={() => {
            if (!isSettingsOpen) {
              onOpenPauseMenu?.();
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (!isSettingsOpen) onOpenPauseMenu?.();
            }
          }}
          title={ui.openPauseMenu}
          aria-label={ui.openPauseMenu}
          className={`group bg-slate-950/95 hover:bg-slate-900 border border-slate-800 hover:border-amber-400/80 rounded-xl px-2.5 sm:px-3 py-1 sm:py-1.5 shadow-xl hover:shadow-[0_0_20px_rgba(245,158,11,0.25)] backdrop-blur-md flex items-center gap-1.5 shrink-0 transition-transform duration-75 cursor-pointer select-none active:scale-95 touch-manipulation ${
            isSettingsOpen ? 'pointer-events-none opacity-40' : 'pointer-events-auto'
          }`}
        >
          <span className="text-xs sm:text-sm transition-transform duration-200 group-hover:rotate-12">🧭</span>
          <span
            className="text-amber-400 group-hover:text-amber-300 font-bold tracking-tight whitespace-nowrap"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 'bold',
              fontSize: '15px',
            }}
          >
            {ui.brandTitle}
          </span>
        </div>

        {/* Center-Left: Social-Emotional Performance Score (Skor PSE) Badge - Clickable to open PSE Score Modal */}
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
          className="bg-slate-950/95 border border-pink-500/70 hover:border-pink-400 hover:bg-slate-900 rounded-xl px-2 sm:px-2.5 py-1 sm:py-1.5 shadow-xl hover:shadow-[0_0_16px_rgba(236,72,153,0.35)] backdrop-blur-md flex items-center gap-1.5 shrink-0 transition-all duration-75 select-none pointer-events-auto cursor-pointer active:scale-95"
        >
          <span className="text-xs sm:text-sm animate-pulse">💖</span>
          <div className="flex flex-col leading-none">
            <span
              className="text-pink-300 font-bold tracking-tight whitespace-nowrap"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '12.5px',
                lineHeight: '14px',
              }}
            >
              {lang === 'en' ? 'SEL Score' : 'Skor PSE'}
            </span>
            <span className="font-pixel text-[9px] sm:text-[11px] text-amber-300 font-extrabold tracking-tight text-center">
              {empathyScore}
            </span>
          </div>
        </div>

        {/* Center: Compass Toggle Button with Sparkle Feedback (Hidden on Mobile, Visible on Desktop/Tablet) */}
        <div className={`${isSettingsOpen ? 'pointer-events-none' : 'pointer-events-auto'} hidden md:block`}>
          <button
            id="toggle-resonance-btn"
            onClick={onCompassToggle}
            disabled={isSettingsOpen}
            title={ui.toggleResonance}
            className={`relative px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl border shadow-lg backdrop-blur-md transition hidden md:flex items-center gap-1.5 text-xs font-semibold cursor-pointer active:scale-95 ${
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
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950 animate-pulse" />
            ) : (
              <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
            <span
              className="whitespace-nowrap font-bold"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 'bold',
                fontSize: '12px',
              }}
            >
              {isCompassActive ? ui.activeResonance : ui.heartCompass}
            </span>
            <span className="hidden xl:inline text-[10px] text-slate-400 font-mono">
              [C]
            </span>
          </button>
        </div>

        {/* Right: Unified Single Button on Mobile (and Desktop buttons on large screens) */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto shrink-0">
          {/* SINGLE UNIFIED BUTTON FOR MOBILE (Vertical & Horizontal mode) */}
          <div className="flex items-center gap-1.5 lg:hidden">
            <button
              id="top-unified-menu-btn"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Menu"
              className="px-2.5 py-1 sm:py-1.5 rounded-xl bg-slate-950/95 border border-amber-400/80 hover:border-amber-300 hover:bg-slate-900 active:bg-amber-500/20 text-amber-300 shadow-lg flex items-center gap-1.5 text-xs font-bold cursor-pointer active:scale-95 transition-transform duration-75"
            >
              <Menu className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              <span className="font-pixel text-[8px] sm:text-[9px] tracking-tight">MENU</span>
            </button>
          </div>

          {/* Desktop Toolbar (lg+ screens) */}
          <div className="hidden lg:flex items-center gap-1.5 sm:gap-2">
            {onToggleMiniMap && (
              <button
                id="top-map-toggle-btn"
                onClick={onToggleMiniMap}
                title={isMiniMapOpen ? (lang === 'en' ? 'Hide Mini Map [M]' : 'Sembunyikan Peta Mini [M]') : (lang === 'en' ? 'Open Mini Map [M]' : 'Buka Peta Mini [M]')}
                className={`px-2.5 py-1.5 rounded-xl border shadow-md flex items-center gap-1.5 text-xs font-semibold cursor-pointer active:scale-95 transition-transform duration-75 ${
                  isMiniMapOpen
                    ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-[0_0_14px_rgba(245,158,11,0.6)]'
                    : 'bg-slate-950/90 border-slate-700 hover:border-amber-400/60 hover:bg-slate-900 text-slate-300'
                }`}
              >
                <MapIcon
                  style={{ backgroundColor: '#000000' }}
                  className="w-4 h-4 text-amber-400 rounded-sm"
                />
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{ui.map}</span>
                <span className="text-[10px] text-slate-400 font-mono">[M]</span>
              </button>
            )}

            {/* UNIFIED PUSAT INFORMASI (Misi, regulasi, pencapaian, dan jurnal) */}
            {onOpenInfoHub ? (
              <button
                id="top-info-hub-btn"
                onClick={() => onOpenInfoHub('quests')}
                title={
                  lang === 'en'
                    ? 'Adventurer Info Center: Quests, Regulation, Badges, Journal [I]'
                    : 'Pusat Informasi: Progres Misi, Regulasi, Lencana & Jurnal [I]'
                }
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-950/90 via-slate-950 to-pink-950/90 border-2 border-amber-400/80 hover:border-amber-300 hover:bg-slate-900 text-amber-300 hover:text-white shadow-[0_0_16px_rgba(245,158,11,0.3)] flex items-center gap-1.5 text-xs font-bold cursor-pointer active:scale-95 transition-all duration-75"
              >
                <span className="text-sm">📜</span>
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {lang === 'en' ? 'Info & Progress' : 'Pusat Informasi'}
                </span>
                <span className="text-[10px] text-amber-400/90 font-mono bg-slate-950 px-1 py-0.5 rounded border border-amber-500/30">
                  [I]
                </span>
              </button>
            ) : (
              <>
                {onOpenRegulation && (
                  <button
                    id="top-regulation-btn"
                    onClick={onOpenRegulation}
                    title={lang === 'en' ? 'Open Emotion Regulation Studio [R]' : 'Buka Studio Regulasi Emosi & Relaksasi [R]'}
                    className="px-2.5 py-1.5 rounded-xl bg-cyan-950/90 border border-cyan-400/60 hover:border-cyan-300 hover:bg-cyan-900/90 text-cyan-300 shadow-md flex items-center gap-1.5 text-xs font-semibold cursor-pointer active:scale-95 transition-transform duration-75"
                  >
                    <Wind className="w-4 h-4 text-cyan-300" />
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{ui.regulation}</span>
                    <span className="text-[10px] text-cyan-400/80 font-mono">[R]</span>
                  </button>
                )}

                {onOpenJournal && (
                  <button
                    id="top-journal-btn"
                    onClick={onOpenJournal}
                    title={lang === 'en' ? 'Open Heart Compass Journal & Bag [J]' : 'Buka Jurnal Kompas Hati & Tas [J]'}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-950/90 border border-amber-500/50 hover:border-amber-400 hover:bg-slate-900 text-amber-300 shadow-md flex items-center gap-1.5 text-xs font-semibold cursor-pointer active:scale-95 transition-transform duration-75"
                  >
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{ui.journal}</span>
                    <span className="text-[10px] text-amber-400/80 font-mono">[J]</span>
                  </button>
                )}
              </>
            )}

            {isGameCompleted && onOpenEnding && (
              <button
                id="top-ending-btn"
                onClick={onOpenEnding}
                title={lang === 'en' ? 'Open Graduation Certificate & Epilogue' : 'Buka Sertifikat Kelulusan & Menu Akhir Kisah'}
                className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-300 shadow-[0_0_14px_rgba(245,158,11,0.6)] font-bold flex items-center gap-1.5 text-xs cursor-pointer active:scale-95 transition-transform duration-75"
              >
                <Award className="w-4 h-4 text-slate-950" />
                <span>{ui.certificate}</span>
              </button>
            )}

            {/* PENGATURAN (Audio & Kontrol Permainan) */}
            <button
              id="top-settings-btn"
              onClick={() => onOpenSettings()}
              title={lang === 'en' ? 'Game Settings: Audio & Controls [O]' : 'Pengaturan Game: Audio & Kontrol Permainan [O]'}
              className="px-3 py-1.5 rounded-xl bg-slate-950/95 border border-amber-400/80 hover:bg-slate-900 hover:border-amber-300 text-amber-300 shadow-md flex items-center gap-1.5 text-xs font-bold cursor-pointer active:scale-95 transition-transform duration-75"
            >
              <Sliders className="w-4 h-4 text-amber-400" />
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{ui.settings}</span>
              <span className="text-[10px] text-slate-400 font-mono">[O]</span>
            </button>

            {/* Language Switcher Button */}
            <button
              id="top-language-toggle-btn"
              onClick={toggleLang}
              title={lang === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
              className="px-2.5 py-1.5 rounded-xl bg-slate-950/90 border border-amber-500/60 hover:border-amber-300 hover:bg-slate-900 active:scale-95 text-amber-300 shadow-lg backdrop-blur-md transition-transform duration-75 flex items-center gap-1 text-xs font-semibold cursor-pointer touch-manipulation"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-pixel text-[8px] sm:text-[9px] font-bold">
                {lang === 'id' ? 'ID' : 'EN'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Unified Mobile Menu Sheet (Opens from top right) */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150 pointer-events-auto"
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            className="bg-slate-900/98 border border-amber-500/60 rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md overflow-hidden text-slate-100 flex flex-col max-h-[90vh] mt-10 sm:mt-0 modal-glow-frame"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Menu Header */}
            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/90">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-sm hover:scale-110 transition-transform">
                  🎒
                </div>
                <div>
                  <h3 className="font-pixel text-[10px] text-amber-300 font-bold">
                    Menu Petualangan
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Ezzel • Lembah Nada Rasa
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-rose-950/60 hover:border hover:border-rose-500/50 hover:scale-110 hover:shadow-[0_0_10px_rgba(244,63,94,0.4)] active:bg-slate-600 text-slate-300 flex items-center justify-center transition-all cursor-pointer"
                aria-label="Tutup Menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Menu Action Cards */}
            <div className="p-3.5 space-y-2 overflow-y-auto">
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
                className={`p-3 rounded-2xl bg-gradient-to-r from-pink-950/70 via-slate-900 to-amber-950/60 border border-pink-500/50 shadow-md flex items-center justify-between ${
                  onOpenPSEScore || onOpenInfoHub ? 'cursor-pointer hover:border-pink-400 active:scale-95 transition-all' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-400/50 flex items-center justify-center text-xl shadow-[0_0_12px_rgba(236,72,153,0.3)]">
                    💖
                  </div>
                  <div>
                    <div className="text-[10px] text-pink-300 font-pixel font-bold">
                      {lang === 'en' ? 'SEL PERFORMANCE SCORE' : 'SKOR SOSIAL EMOSIONAL'}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-pixel text-base font-black text-amber-300">
                        {empathyScore} <span className="text-[10px] text-pink-200 font-sans font-normal">{lang === 'en' ? 'Points' : 'Poin'}</span>
                      </span>
                      <span className="text-[9px] font-pixel text-emerald-300 font-bold">
                        {getPSEPerformanceTier(empathyScore, lang)}
                      </span>
                    </div>
                    <div className="text-[9.5px] text-slate-400 font-sans mt-0.5">
                      {lang === 'en'
                        ? '• Compass use: -5 • Direct answer: Full Score'
                        : '• Bantuan kompas: -5 • Jawaban mandiri: Skor Utuh'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Option 1: Peta Mini Lembah */}
              {onToggleMiniMap && (
                <button
                  onClick={() => {
                    onToggleMiniMap();
                    setIsMenuOpen(false);
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 active:bg-slate-700 border border-slate-700 hover:border-amber-400/80 active:scale-95 shadow-md flex items-center justify-between text-left transition-transform duration-75 cursor-pointer touch-manipulation"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                      <MapIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-amber-200 flex items-center gap-1.5">
                        <span>{lang === 'en' ? 'Valley Map' : 'Peta Lembah'}</span>
                        {isMiniMapOpen && (
                          <span className="text-[9px] bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded font-bold shadow-[0_0_8px_rgba(245,158,11,0.5)]">
                            {lang === 'en' ? 'Active' : 'Aktif'}
                          </span>
                        )}
                      </div>
                      <div className="text-[10.5px] text-slate-400">
                        {lang === 'en' ? 'View villagers, bridges, and clocktower' : 'Lihat lokasi warga, jembatan, dan menara jam'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                    [M]
                  </span>
                </button>
              )}

              {/* Pusat Informasi & Progres (Pengganti tombol regulasi, jurnal, misi objektif, dan pencapaian) */}
              {onOpenInfoHub ? (
                <button
                  onClick={() => {
                    onOpenInfoHub('quests');
                    setIsMenuOpen(false);
                  }}
                  className="w-full p-2.5 rounded-xl bg-gradient-to-r from-amber-950/80 via-slate-800 to-pink-950/80 hover:bg-slate-750 active:bg-slate-700 border-2 border-amber-400/80 hover:border-amber-300 active:scale-95 shadow-md flex items-center justify-between text-left transition-transform duration-75 cursor-pointer touch-manipulation"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-xl text-amber-300">
                      📜
                    </div>
                    <div>
                      <div className="font-bold text-xs text-amber-200">
                        {lang === 'en' ? 'Adventurer Info Center' : 'Pusat Informasi & Progres'}
                      </div>
                      <div className="text-[10.5px] text-slate-300">
                        {lang === 'en'
                          ? 'SEL score details, quest progress, regulation, badges & journal'
                          : 'Keterangan skor PSE, progres misi, regulasi, lencana & jurnal'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-amber-400 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                    [I]
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
                      className="w-full p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 active:bg-slate-700 border border-cyan-500/40 hover:border-cyan-300 active:scale-95 shadow-md flex items-center justify-between text-left transition-transform duration-75 cursor-pointer touch-manipulation"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                          <Wind className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-cyan-200">
                            {lang === 'en' ? 'Emotion Regulation Studio' : 'Studio Regulasi Emosi'}
                          </div>
                          <div className="text-[10.5px] text-slate-400">
                            {lang === 'en' ? 'Balloon breathing, 4-7-8 relaxation & grounding' : 'Latihan napas balon, relaksasi 4-7-8 & grounding'}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-cyan-400/80 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                        [R]
                      </span>
                    </button>
                  )}

                  {onOpenJournal && (
                    <button
                      onClick={() => {
                        onOpenJournal();
                        setIsMenuOpen(false);
                      }}
                      className="w-full p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 active:bg-slate-700 border border-amber-500/40 hover:border-amber-400 active:scale-95 shadow-md flex items-center justify-between text-left transition-transform duration-75 cursor-pointer touch-manipulation"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-amber-200">
                            {lang === 'en' ? 'Journal & Adventurer Bag' : 'Jurnal & Tas Petualang'}
                          </div>
                          <div className="text-[10.5px] text-slate-400">
                            {lang === 'en' ? 'Village lore, sacred items & empathy insights' : 'Lore cerita desa, barang pusaka & wawasan empati'}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-amber-400/80 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                        [J]
                      </span>
                    </button>
                  )}
                </>
              )}

              {/* Option 4: Sertifikat Kelulusan (jika tamat) */}
              {isGameCompleted && onOpenEnding && (
                <button
                  onClick={() => {
                    onOpenEnding();
                    setIsMenuOpen(false);
                  }}
                  className="w-full p-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 active:bg-amber-500/40 border border-amber-400 hover:border-amber-300 active:scale-95 shadow-md flex items-center justify-between text-left transition-transform duration-75 cursor-pointer touch-manipulation"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                      <Award className="w-5 h-5 text-slate-950" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-amber-300">
                        {lang === 'en' ? 'SEL Graduation Certificate' : 'Sertifikat Kelulusan PSE'}
                      </div>
                      <div className="text-[10.5px] text-amber-200/80">
                        {lang === 'en' ? "Ezzel's Golden Empathy Ambassador Charter" : 'Piagam Duta Empati Emas Ezzel'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] bg-amber-400 text-slate-950 font-bold px-1.5 py-0.5 rounded shadow">
                    {lang === 'en' ? 'GRAD' : 'LULUS'}
                  </span>
                </button>
              )}

              {/* Option 5: Pengaturan Game (Audio & Kontrol Permainan Saja) */}
              <button
                onClick={() => {
                  onOpenSettings();
                  setIsMenuOpen(false);
                }}
                className="w-full p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 active:bg-slate-700 border border-slate-700 hover:border-amber-400/70 active:scale-95 shadow-md flex items-center justify-between text-left transition-transform duration-75 cursor-pointer touch-manipulation"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-700 flex items-center justify-center text-slate-200">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-slate-200">
                      {lang === 'en' ? 'Settings (Audio & Controls)' : 'Pengaturan (Audio & Kontrol)'}
                    </div>
                    <div className="text-[10.5px] text-slate-400">
                      {lang === 'en' ? 'Sound effects, music volume & control keys guide' : 'Volume efek suara, musik latar & panduan kontrol permainan'}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                  [O]
                </span>
              </button>

              {/* Option 5b: Tutorial Cara Bermain */}
              {onOpenTutorial && (
                <button
                  onClick={() => {
                    onOpenTutorial();
                    setIsMenuOpen(false);
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 active:bg-slate-700 border border-emerald-500/40 hover:border-emerald-300 active:scale-95 shadow-md flex items-center justify-between text-left transition-transform duration-75 cursor-pointer touch-manipulation"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-emerald-200">
                        {lang === 'en' ? 'How to Play Tutorial' : 'Tutorial Cara Bermain'}
                      </div>
                      <div className="text-[10.5px] text-slate-400">
                        {ui.tutorialDesc}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                    [H]
                  </span>
                </button>
              )}

              {/* Option 6: Menu Awal / Opening Start */}
              {onOpenStartMenu && (
                <button
                  onClick={() => {
                    onOpenStartMenu();
                    setIsMenuOpen(false);
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 active:bg-slate-750 border border-amber-500/40 hover:border-amber-400 active:scale-95 shadow-md flex items-center justify-between text-left transition-transform duration-75 cursor-pointer touch-manipulation"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                      <Home className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-amber-300">
                        {ui.titleScreen}
                      </div>
                      <div className="text-[10.5px] text-slate-400">
                        {ui.titleScreenDesc}
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] text-amber-400 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                    TITLE
                  </span>
                </button>
              )}

              {/* Option 7: Ganti Bahasa / Language Switcher */}
              <button
                onClick={() => {
                  toggleLang();
                }}
                className="w-full p-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 active:bg-slate-750 border border-amber-500/40 hover:border-amber-400 active:scale-95 shadow-md flex items-center justify-between text-left transition-transform duration-75 cursor-pointer touch-manipulation"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-amber-300">
                      {lang === 'id' ? 'Bahasa: Indonesia 🇮🇩' : 'Language: English 🇬🇧'}
                    </div>
                    <div className="text-[10.5px] text-slate-400">
                      {lang === 'id' ? 'Klik untuk beralih ke Bahasa Inggris' : 'Click to switch to Bahasa Indonesia'}
                    </div>
                  </div>
                </div>
                <span className="text-[9px] text-amber-400 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                  {lang.toUpperCase()}
                </span>
              </button>
            </div>

            {/* Menu Footer */}
            <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span>{ui.mainCharacterLabel} <strong className="text-emerald-400">Ezzel</strong></span>
              <span>{ui.compassLabel} <strong className="text-amber-400">{isCompassActive ? ui.compassActive : ui.compassStandby}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* VIRTUAL ANALOG JOYSTICK (Mobile and Tablet mode only) */}
      {!isDialogueOpen && !isSettingsOpen && isMobileOrTablet && (
        <div className="fixed bottom-3 sm:bottom-5 left-3 sm:left-5 z-30 pointer-events-auto select-none touch-none">
          <div
            ref={joystickBaseRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            onMouseDown={handleMouseDown}
            className={`relative w-26 h-26 sm:w-28 sm:h-28 rounded-full bg-slate-950/80 border-2 transition-colors duration-150 backdrop-blur-md flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.6)] ${
              isDragging ? 'border-amber-400/80 shadow-[0_0_16px_rgba(245,158,11,0.3)]' : 'border-slate-700/70'
            }`}
            style={{ touchAction: 'none' }}
          >
            {/* Outer Directional Indicator Notches */}
            <span className="absolute top-1 text-[8px] font-pixel text-slate-500/70">▲</span>
            <span className="absolute bottom-1 text-[8px] font-pixel text-slate-500/70">▼</span>
            <span className="absolute left-1.5 text-[8px] font-pixel text-slate-500/70">◀</span>
            <span className="absolute right-1.5 text-[8px] font-pixel text-slate-500/70">▶</span>

            {/* Inner Ring Guide */}
            <div className="w-16 h-16 rounded-full border border-slate-700/40 pointer-events-none" />

            {/* Movable Thumbstick Knob */}
            <div
              className={`absolute w-12 h-12 rounded-full border-2 flex items-center justify-center transition-transform ${
                isDragging ? 'duration-0 scale-105' : 'duration-150 ease-out'
              } ${
                isDragging
                  ? 'bg-gradient-to-br from-amber-400 to-amber-600 border-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.7)]'
                  : 'bg-gradient-to-br from-slate-700 to-slate-900 border-slate-500 shadow-md'
              }`}
              style={{
                transform: `translate(${knobOffset.x}px, ${knobOffset.y}px)`,
                pointerEvents: 'none',
              }}
            >
              {/* Tactile Grip Texture on Knob */}
              <div className="grid grid-cols-2 gap-1 pointer-events-none">
                <span className={`w-1.5 h-1.5 rounded-full ${isDragging ? 'bg-amber-950/60' : 'bg-slate-400/60'}`} />
                <span className={`w-1.5 h-1.5 rounded-full ${isDragging ? 'bg-amber-950/60' : 'bg-slate-400/60'}`} />
                <span className={`w-1.5 h-1.5 rounded-full ${isDragging ? 'bg-amber-950/60' : 'bg-slate-400/60'}`} />
                <span className={`w-1.5 h-1.5 rounded-full ${isDragging ? 'bg-amber-950/60' : 'bg-slate-400/60'}`} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* On-Screen Action Buttons: Hati & Aksi (Mobile and Tablet mode only) */}
      {!isDialogueOpen && !isSettingsOpen && isMobileOrTablet && (
        <div className="fixed bottom-3 sm:bottom-5 right-3 sm:right-5 z-30 flex items-center gap-2.5 sm:gap-3 pointer-events-auto select-none touch-none">
          {/* Button B: Resonance Compass with Sparkle indicator */}
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
            className={`relative w-12 h-12 sm:w-13 sm:h-13 rounded-full border-2 flex flex-col items-center justify-center text-xs font-bold shadow-lg transition-transform duration-75 active:scale-90 cursor-pointer touch-manipulation ${
              isCompassActive
                ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-[0_0_24px_rgba(245,158,11,0.85)] ring-2 ring-amber-300/70'
                : 'bg-slate-950/90 text-amber-300 border-amber-400/70 hover:border-amber-300 hover:bg-slate-900 shadow-[0_0_18px_rgba(245,158,11,0.6)]'
            }`}
          >
            {isCompassActive && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3 pointer-events-none">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400" />
              </span>
            )}
            {isCompassActive ? (
              <Sparkles className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-slate-950 animate-pulse" />
            ) : (
              <Compass className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            )}
            <span className="text-[7.5px] font-pixel tracking-tighter">
              {isCompassActive ? ui.btnCompassActive : ui.btnCompassStandby}
            </span>
          </button>

          {/* Button A: Interact / Speak */}
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
            aria-label="Aksi / Berbicara"
            className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.7)] active:text-slate-950 border-2 border-emerald-300 flex flex-col items-center justify-center text-xs font-bold active:scale-90 transition-transform duration-75 cursor-pointer touch-manipulation"
          >
            <span className="text-sm sm:text-base font-black">A</span>
            <span className="text-[7.5px] font-pixel tracking-tighter">{ui.btnAction}</span>
          </button>
        </div>
      )}
    </>
  );
};
