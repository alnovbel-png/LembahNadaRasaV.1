import React, { useState, useEffect, useCallback } from 'react';
import { sound } from '../utils/audio';

interface PauseMenuModalProps {
  isOpen: boolean;
  onResume: () => void;
  onOpenSettings: () => void;
  onOpenMainMenu: () => void;
}

export const PauseMenuModal: React.FC<PauseMenuModalProps> = ({
  isOpen,
  onResume,
  onOpenSettings,
  onOpenMainMenu,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);

  // Menu items list
  const menuItems = [
    { id: 'resume', label: 'Resume', action: onResume },
    { id: 'settings', label: 'Pengaturan', action: onOpenSettings },
    { id: 'main-menu', label: 'Main Menu', action: onOpenMainMenu },
    { id: 'quit', label: 'Quit Game', action: () => setShowExitConfirm(true) },
  ];

  const handleSelect = useCallback(
    (index: number) => {
      sound.playMenuSelect();
      menuItems[index].action();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onResume, onOpenSettings, onOpenMainMenu]
  );

  // Keyboard navigation inside Pause Menu
  useEffect(() => {
    if (!isOpen) {
      setShowExitConfirm(false);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (showExitConfirm) {
        if (e.key === 'Escape') {
          e.preventDefault();
          sound.playVoiceBlip();
          setShowExitConfirm(false);
        }
        return;
      }

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        sound.playVoiceBlip();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : menuItems.length - 1));
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        sound.playVoiceBlip();
        setSelectedIndex((prev) => (prev < menuItems.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleSelect(selectedIndex);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        sound.playMenuSelect();
        onResume();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, showExitConfirm, handleSelect, onResume, menuItems.length]);

  if (!isOpen) return null;

  return (
    <div
      id="pause-menu-backdrop"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in select-none"
    >
      {/* Dark Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.85)_100%)]" />

      {/* Main Pause Plaque Container */}
      <div className="relative w-full max-w-[340px] sm:max-w-[390px] bg-[#120f12] border-2 border-[#5a422e] rounded-md shadow-[0_0_60px_rgba(0,0,0,0.95),0_0_35px_rgba(255,46,81,0.22)] p-6 sm:p-8 text-center overflow-hidden z-10">
        {/* Subtle Decorative Inner Ring */}
        <div className="absolute inset-1.5 border border-[#3b2719] rounded-sm pointer-events-none" />

        {/* Corner Rivet / Stud Flourishes */}
        <span className="absolute top-2 left-2 text-[10px] text-[#8c6742] pointer-events-none">✦</span>
        <span className="absolute top-2 right-2 text-[10px] text-[#8c6742] pointer-events-none">✦</span>
        <span className="absolute bottom-2 left-2 text-[10px] text-[#8c6742] pointer-events-none">✦</span>
        <span className="absolute bottom-2 right-2 text-[10px] text-[#8c6742] pointer-events-none">✦</span>

        {!showExitConfirm ? (
          <>
            {/* Header: PAUSE */}
            <h1
              className="font-pixelify text-4xl sm:text-5xl font-extrabold text-[#ff2e51] tracking-[0.25em] uppercase drop-shadow-[0_2px_14px_rgba(255,46,81,0.65)] select-none pl-2"
            >
              PAUSE
            </h1>

            {/* Ornamental Divider with Center Star */}
            <div className="flex items-center justify-center gap-2.5 my-5 sm:my-6 px-2">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#8a6745] to-[#8a6745]" />
              <span className="text-[#e2a862] text-xs leading-none">✦</span>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#8a6745] to-[#8a6745]" />
            </div>

            {/* Menu Items List */}
            <div className="flex flex-col items-center gap-3.5 sm:gap-4 my-2">
              {/* 1. Resume */}
              <button
                id="pause-btn-resume"
                type="button"
                onClick={() => {
                  sound.playMenuSelect();
                  onResume();
                }}
                onMouseEnter={() => {
                  setSelectedIndex(0);
                  sound.playVoiceBlip();
                }}
                className={`font-pixelify text-xl sm:text-2xl font-bold tracking-wide transition-all duration-150 cursor-pointer ${
                  selectedIndex === 0
                    ? 'text-white scale-110 drop-shadow-[0_0_12px_rgba(255,255,255,0.7)]'
                    : 'text-[#e9ded1] hover:text-white'
                }`}
              >
                Resume
              </button>

              {/* 2. Pengaturan (Options) */}
              <button
                id="pause-btn-settings"
                type="button"
                onClick={() => {
                  sound.playMenuSelect();
                  onOpenSettings();
                }}
                onMouseEnter={() => {
                  setSelectedIndex(1);
                  sound.playVoiceBlip();
                }}
                className={`font-pixelify text-lg sm:text-xl font-bold tracking-wide transition-all duration-150 cursor-pointer ${
                  selectedIndex === 1
                    ? 'text-white scale-110 drop-shadow-[0_0_12px_rgba(255,255,255,0.7)]'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                Pengaturan
              </button>

              {/* Aesthetic Gap */}
              <div className="h-2 sm:h-3" />

              {/* 3. Main Menu */}
              <button
                id="pause-btn-main-menu"
                type="button"
                onClick={() => {
                  sound.playMenuSelect();
                  onOpenMainMenu();
                }}
                onMouseEnter={() => {
                  setSelectedIndex(2);
                  sound.playVoiceBlip();
                }}
                className={`font-pixelify text-lg sm:text-xl font-bold tracking-wide transition-all duration-150 cursor-pointer ${
                  selectedIndex === 2
                    ? 'text-white scale-110 drop-shadow-[0_0_12px_rgba(255,255,255,0.7)]'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                Main Menu
              </button>

              {/* 4. Quit Game */}
              <button
                id="pause-btn-quit"
                type="button"
                onClick={() => {
                  sound.playMenuSelect();
                  setShowExitConfirm(true);
                }}
                onMouseEnter={() => {
                  setSelectedIndex(3);
                  sound.playVoiceBlip();
                }}
                className={`font-pixelify text-lg sm:text-xl font-bold tracking-wide transition-all duration-150 cursor-pointer ${
                  selectedIndex === 3
                    ? 'text-rose-400 scale-110 drop-shadow-[0_0_12px_rgba(244,63,94,0.7)]'
                    : 'text-stone-400 hover:text-rose-300'
                }`}
              >
                Quit Game
              </button>
            </div>

            {/* Glowing Bottom Crimson Emblem */}
            <div className="mt-6 flex justify-center items-center">
              <span className="text-[#ff2e51] text-base leading-none animate-pulse drop-shadow-[0_0_10px_rgba(255,46,81,0.9)]">
                ✦
              </span>
            </div>
          </>
        ) : (
          /* Quit Game Confirmation Screen */
          <div className="py-2 animate-fade-in space-y-4">
            <h2 className="font-pixel text-sm sm:text-base text-rose-400 font-bold tracking-wider">
              TUTUP PERMAINAN?
            </h2>
            <p className="text-xs text-stone-300 leading-relaxed font-sans px-2">
              Progres petualangan Ezzel tersimpan secara otomatis. Kamu dapat kembali ke Menu Utama atau menutup peramban ini kapan saja.
            </p>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                id="pause-confirm-main-menu-btn"
                type="button"
                onClick={() => {
                  sound.playMenuSelect();
                  onOpenMainMenu();
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-amber-500/80 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 font-pixel text-[11px] cursor-pointer transition active:scale-95 shadow-md"
              >
                KEMBALI KE MAIN MENU
              </button>

              <button
                id="pause-confirm-close-tab-btn"
                type="button"
                onClick={() => {
                  sound.playMenuSelect();
                  try {
                    window.close();
                  } catch {}
                  onOpenMainMenu();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-pixel text-[11px] cursor-pointer shadow-md transition active:scale-95"
              >
                KELUAR PERMAINAN
              </button>

              <button
                id="pause-confirm-cancel-btn"
                type="button"
                onClick={() => {
                  sound.playVoiceBlip();
                  setShowExitConfirm(false);
                }}
                className="w-full py-2 px-4 rounded-xl border border-stone-700 bg-stone-900/60 hover:bg-stone-800 text-stone-300 text-xs font-semibold cursor-pointer transition active:scale-95"
              >
                Batal / Lanjutkan Main
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
