import React, { useState, useEffect, useCallback } from 'react';
import { sound } from '../utils/audio';
import { useLanguage } from '../game/localization';

interface PauseMenuModalProps {
  isOpen: boolean;
  onResume: () => void;
  onOpenSettings: () => void;
  onOpenMainMenu: () => void;
  onOpenTutorial?: () => void;
}

export const PauseMenuModal: React.FC<PauseMenuModalProps> = ({
  isOpen,
  onResume,
  onOpenSettings,
  onOpenMainMenu,
  onOpenTutorial,
}) => {
  const { lang, ui } = useLanguage();
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);

  // Menu items list
  const menuItems = [
    { id: 'resume', label: 'Lanjutkan Permainan', action: onResume },
    ...(onOpenTutorial
      ? [
          {
            id: 'tutorial',
            label: 'Tutorial Cara Bermain',
            action: onOpenTutorial,
          },
        ]
      : []),
    { id: 'settings', label: 'Pengaturan', action: onOpenSettings },
    { id: 'main-menu', label: 'Menu Utama', action: onOpenMainMenu },
    { id: 'quit', label: 'Tutup Game', action: () => setShowExitConfirm(true) },
  ];

  const handleSelect = useCallback(
    (index: number) => {
      sound.playMenuSelect();
      menuItems[index]?.action();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onResume, onOpenSettings, onOpenMainMenu, onOpenTutorial]
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
            {/* Header: JEDA */}
            <h1
              className="font-pixelify text-4xl sm:text-5xl font-extrabold text-[#ff2e51] tracking-[0.25em] uppercase drop-shadow-[0_2px_14px_rgba(255,46,81,0.65)] select-none pl-2"
            >
              JEDA
            </h1>

            {/* Ornamental Divider with Center Star */}
            <div className="flex items-center justify-center gap-2.5 my-5 sm:my-6 px-2">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#8a6745] to-[#8a6745]" />
              <span className="text-[#e2a862] text-xs leading-none">✦</span>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#8a6745] to-[#8a6745]" />
            </div>

            {/* Menu Items List */}
            <div className="flex flex-col items-center gap-3 sm:gap-3.5 my-2 w-full">
              {menuItems.map((item, index) => {
                const isSelected = selectedIndex === index;
                const isQuit = item.id === 'quit';
                const isResume = item.id === 'resume';

                return (
                  <button
                    key={item.id}
                    id={`pause-btn-${item.id}`}
                    type="button"
                    onClick={() => handleSelect(index)}
                    onMouseEnter={() => {
                      if (selectedIndex !== index) {
                        setSelectedIndex(index);
                        sound.playVoiceBlip();
                      }
                    }}
                    className={`font-pixelify tracking-wide transition-transform duration-75 cursor-pointer select-none active:scale-95 ${
                      isResume
                        ? 'text-xl sm:text-2xl font-bold'
                        : 'text-lg sm:text-xl font-bold'
                    } ${
                      isSelected
                        ? isQuit
                          ? 'text-rose-400 scale-105 drop-shadow-[0_0_12px_rgba(244,63,94,0.7)]'
                          : 'text-white scale-105 drop-shadow-[0_0_12px_rgba(255,255,255,0.7)]'
                        : isQuit
                        ? 'text-stone-400 hover:text-rose-300'
                        : 'text-stone-300 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
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
              {lang === 'en' ? 'QUIT GAME?' : 'TUTUP PERMAINAN?'}
            </h2>
            <p className="text-xs text-stone-300 leading-relaxed font-sans px-2">
              {lang === 'en'
                ? "Ezzel's adventure progress is saved automatically. You can return to the Main Menu or close the browser tab at any time."
                : 'Progres petualangan Ezzel tersimpan secara otomatis. Kamu dapat kembali ke Menu Utama atau menutup peramban ini kapan saja.'}
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
                {lang === 'en' ? 'RETURN TO MAIN MENU' : 'KEMBALI KE MAIN MENU'}
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
                {lang === 'en' ? 'QUIT GAME' : 'KELUAR PERMAINAN'}
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
                {lang === 'en' ? 'Cancel / Resume Playing' : 'Batal / Lanjutkan Main'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
