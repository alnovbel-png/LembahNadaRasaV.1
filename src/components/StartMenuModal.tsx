import React, { useEffect, useState } from 'react';
import { sound, useAudioSettings } from '../utils/audio';
import { CharacterPortrait } from './CharacterPortrait';
import { useLanguage } from '../game/localization';
import startMenuBg from '../assets/images/start_menu_bg.svg';

export type MenuView = 'main' | 'play';

interface StartMenuModalProps {
  isOpen: boolean;
  onStartGame: (name: string, avatar: 'boy' | 'girl') => void;
  onOpenAudioSettings: () => void;
  onOpenSettings?: () => void;
  isSettingsOpen?: boolean;
  initialPlayerName?: string;
  initialPlayerAvatar?: 'boy' | 'girl';
}

export const StartMenuModal: React.FC<StartMenuModalProps> = ({
  isOpen,
  onStartGame,
  onOpenAudioSettings,
  onOpenSettings,
  isSettingsOpen = false,
  initialPlayerName = 'Ezzel',
  initialPlayerAvatar = 'boy',
}) => {
  const { isMuted, toggleMute } = useAudioSettings();
  const { lang, toggleLang, ui } = useLanguage();
  const [menuView, setMenuView] = useState<MenuView>('main');
  const [selectedMainMenuIndex, setSelectedMainMenuIndex] = useState<number>(0);
  const [playerName, setPlayerName] = useState<string>(initialPlayerName);
  const [playerAvatar, setPlayerAvatar] = useState<'boy' | 'girl'>(initialPlayerAvatar);
  const [showExitModal, setShowExitModal] = useState<boolean>(false);

  // Sync state if initial props change
  useEffect(() => {
    let name = initialPlayerName;
    if (name === 'Ezsela') name = 'Ezzy';
    if (name === 'Kayla') name = 'Ezzy';
    if (name === 'Aris') name = 'Ezzel';
    setPlayerName(name || 'Ezzel');
    setPlayerAvatar(initialPlayerAvatar === 'girl' ? 'girl' : 'boy');
  }, [initialPlayerName, initialPlayerAvatar]);

  // Whenever StartMenuModal is opened, reset to Main Menu view
  useEffect(() => {
    if (isOpen) {
      setMenuView('main');
      setSelectedMainMenuIndex(0);
      setShowExitModal(false);
    }
  }, [isOpen]);

  const getDefaultNameForAvatar = (avatar: 'boy' | 'girl') => {
    return avatar === 'girl' ? 'Ezzy' : 'Ezzel';
  };

  const handleStart = () => {
    const defaultName = getDefaultNameForAvatar(playerAvatar);
    const finalName = playerName.trim() || defaultName;
    sound.unlockAudio();
    sound.playMenuSelect();
    onStartGame(finalName, playerAvatar);
  };

  const handleSelectAvatar = (avatar: 'boy' | 'girl') => {
    sound.playMenuSelect();
    setPlayerAvatar(avatar);
    const curr = playerName.trim();
    if (
      !curr ||
      curr === 'Ezzel' ||
      curr === 'Ezzy' ||
      curr === 'Ezsela' ||
      curr === 'Aris' ||
      curr === 'Kayla' ||
      curr === 'Kiko'
    ) {
      setPlayerName(getDefaultNameForAvatar(avatar));
    }
  };

  // Keyboard navigation & Enter shortcuts
  useEffect(() => {
    if (!isOpen || isSettingsOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (showExitModal) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setShowExitModal(false);
        }
        return;
      }

      const activeEl = document.activeElement;
      const isInputActive = activeEl && activeEl.tagName === 'INPUT';

      if (e.key === 'Escape') {
        if (menuView === 'play') {
          e.preventDefault();
          sound.playMenuSelect();
          setMenuView('main');
        }
        return;
      }

      if (menuView === 'main') {
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
          e.preventDefault();
          sound.playMenuSelect();
          setSelectedMainMenuIndex((prev) => (prev > 0 ? prev - 1 : 2));
        } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
          e.preventDefault();
          sound.playMenuSelect();
          setSelectedMainMenuIndex((prev) => (prev < 2 ? prev + 1 : 0));
        } else if (e.key === 'Enter') {
          e.preventDefault();
          sound.playMenuSelect();
          if (selectedMainMenuIndex === 0) {
            setMenuView('play');
          } else if (selectedMainMenuIndex === 1) {
            if (onOpenSettings) onOpenSettings();
            else onOpenAudioSettings();
          } else if (selectedMainMenuIndex === 2) {
            setShowExitModal(true);
          }
        }
      } else if (menuView === 'play') {
        if (!isInputActive) {
          if (
            e.key === 'ArrowLeft' ||
            e.key === 'a' ||
            e.key === 'A' ||
            e.key === 'ArrowRight' ||
            e.key === 'd' ||
            e.key === 'D'
          ) {
            e.preventDefault();
            handleSelectAvatar(playerAvatar === 'boy' ? 'girl' : 'boy');
          }
        }

        if (e.key === 'Enter') {
          e.preventDefault();
          handleStart();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isOpen,
    isSettingsOpen,
    menuView,
    selectedMainMenuIndex,
    playerAvatar,
    playerName,
    showExitModal,
    onOpenSettings,
    onOpenAudioSettings,
  ]);

  if (!isOpen) return null;

  const currentDisplayNickname = playerName.trim() || getDefaultNameForAvatar(playerAvatar);

  return (
    <div
      id="start-menu-backdrop"
      style={{
        backgroundImage: `radial-gradient(ellipse at center, rgba(10, 13, 24, 0.35) 0%, rgba(10, 13, 24, 0.78) 100%), url(${startMenuBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      className="fixed inset-0 z-50 flex flex-col justify-between bg-[#0a0d18] p-2 sm:p-5 md:p-6 overflow-y-auto animate-backdrop-fade-in select-none start-menu-modal-root"
    >
      {/* 1. TOP BAR */}
      <div className="w-full flex items-center justify-between z-20 max-w-5xl mx-auto px-1 sm:px-2 shrink-0 start-menu-topbar">
        {/* Left: RPG SOSIAL-EMOSIONAL Badge */}
        <div className="inline-flex items-center gap-1.5 bg-[#251b14]/90 border border-amber-600/70 rounded-full px-2 py-0.5 sm:px-3 sm:py-1 shadow-md">
          {/* Handcrafted Compass Icon */}
          <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="#d97706" strokeWidth="1.2" fill="#1e130c" />
            <circle cx="8" cy="8" r="5" stroke="#f59e0b" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
            <polygon points="8,2.5 9.8,7.2 8,6.2 6.2,7.2" fill="#ef4444" />
            <polygon points="8,13.5 9.8,8.8 8,9.8 6.2,8.8" fill="#38bdf8" />
            <circle cx="8" cy="8" r="1.3" fill="#fef08a" />
          </svg>
          <span className="font-pixel text-[7px] sm:text-[9px] text-amber-300 font-bold tracking-wider">
            {ui.genreBadge}
          </span>
        </div>

        {/* Right: Language & Sound Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Language Toggle Button */}
          <button
            type="button"
            id="btn-start-language-toggle"
            onClick={toggleLang}
            title={lang === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
            className="inline-flex items-center gap-1 bg-[#172033]/90 hover:bg-[#202c45] border border-amber-500/70 rounded-full px-2 py-0.5 sm:px-3 sm:py-1 transition-transform duration-75 text-amber-200 cursor-pointer shadow-md active:scale-95 touch-manipulation"
          >
            <span className="text-[10px] sm:text-xs">{lang === 'id' ? '🇮🇩' : '🇬🇧'}</span>
            <span className="font-pixel text-[7px] sm:text-[9px] text-amber-300 font-bold uppercase tracking-wider">
              {lang === 'id' ? 'ID' : 'EN'}
            </span>
          </button>

          {/* Sound Toggle Button */}
          <button
            type="button"
            onClick={toggleMute}
            title={isMuted ? (lang === 'en' ? 'Unmute Audio' : 'Nyalakan Audio') : (lang === 'en' ? 'Mute Audio' : 'Matikan Audio')}
            className="inline-flex items-center gap-1 bg-[#10222a]/90 hover:bg-[#18333e] border border-cyan-700/70 rounded-full px-2 py-0.5 sm:px-3 sm:py-1 transition-transform duration-75 text-cyan-200 cursor-pointer shadow-md active:scale-95 touch-manipulation"
          >
            {isMuted ? (
              <>
                {/* Handcrafted Muted Speaker Icon */}
                <svg className="w-3 h-3 text-red-400 shrink-0" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M3 5.5H5.5L9 2.5V13.5L5.5 10.5H3C2.45 10.5 2 10.05 2 9.5V6.5C2 5.95 2.45 5.5 3 5.5Z" />
                  <line x1="11" y1="5.5" x2="14.5" y2="10.5" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="14.5" y1="5.5" x2="11" y2="10.5" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span className="font-pixel text-[7px] sm:text-[9px] text-red-300">{ui.soundMute}</span>
              </>
            ) : (
              <>
                {/* Handcrafted Sound Speaker Icon */}
                <svg className="w-3 h-3 text-cyan-400 shrink-0" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M3 5.5H5.5L9 2.5V13.5L5.5 10.5H3C2.45 10.5 2 10.05 2 9.5V6.5C2 5.95 2.45 5.5 3 5.5Z" />
                  <path d="M11 5C11.8 5.8 12.3 6.8 12.3 8C12.3 9.2 11.8 10.2 11 11" stroke="#38bdf8" strokeWidth="1.3" strokeLinecap="round" fill="none" />
                  <path d="M12.8 3.5C14 4.8 14.7 6.3 14.7 8C14.7 9.7 14 11.2 12.8 12.5" stroke="#38bdf8" strokeWidth="1.3" strokeLinecap="round" fill="none" />
                </svg>
                <span className="font-pixel text-[7px] sm:text-[9px] text-cyan-200">{ui.soundOn}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. CENTER CONTENT */}
      <div className="w-full flex flex-col items-center justify-center my-auto py-1 sm:py-2 z-10">
        {/* Game Title: Balanced and compact on mobile */}
        <div className="text-center mb-1.5 sm:mb-3.5 start-menu-title flex justify-center">
          <h1
            style={{ height: '73.25px', width: '539px' }}
            className="font-pixel text-xs sm:text-2xl md:text-3xl text-amber-400 drop-shadow-[0_2px_0_#000] tracking-wider leading-snug flex items-center justify-center max-w-full"
          >
            {ui.gameTitle}
          </h1>
        </div>

        {/* VIEW 1: MENU UTAMA */}
        {menuView === 'main' && (
          <div className="w-full max-w-[320px] sm:max-w-[500px] md:max-w-[539px] bg-[#121626]/95 border-2 border-amber-500/90 rounded-2xl sm:rounded-[24px] shadow-[0_0_35px_rgba(245,158,11,0.2)] p-3.5 sm:p-6 flex flex-col gap-2.5 sm:gap-4 animate-fade-in-slide-up start-menu-card">
            {/* Menu Buttons Stack */}
            <div className="flex flex-col gap-2 sm:gap-3 my-0.5">
              {/* 1. PLAY BUTTON */}
              <button
                type="button"
                id="btn-main-play"
                onMouseEnter={() => setSelectedMainMenuIndex(0)}
                onClick={() => {
                  sound.playMenuSelect();
                  setMenuView('play');
                }}
                className={`w-full relative h-11 sm:h-[54px] rounded-xl sm:rounded-2xl border-2 transition-transform duration-75 transition-colors duration-75 flex items-center cursor-pointer text-center group active:scale-[0.98] touch-manipulation start-menu-btn ${
                  selectedMainMenuIndex === 0
                    ? 'bg-gradient-to-r from-[#2c1f14] via-[#352518] to-[#2c1f14] border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)] scale-[1.01]'
                    : 'bg-[#231810]/95 border-amber-600/70 hover:border-amber-400'
                }`}
              >
                {/* Handcrafted Pixel Play Icon */}
                <div className="absolute left-3.5 sm:left-6 flex items-center justify-center pointer-events-none start-menu-btn-icon">
                  <svg className="w-4.5 h-4.5 sm:w-6 sm:h-6 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="5" y="4" width="2" height="16" fill="#f59e0b" />
                    <rect x="7" y="5" width="2" height="14" fill="#fbbf24" />
                    <rect x="9" y="6" width="2" height="12" fill="#fbbf24" />
                    <rect x="11" y="8" width="2" height="8" fill="#fde047" />
                    <rect x="13" y="9" width="2" height="6" fill="#fef08a" />
                    <rect x="15" y="10" width="2" height="4" fill="#ffffff" />
                    <rect x="17" y="11" width="2" height="2" fill="#ffffff" />
                    <rect x="3" y="7" width="1.5" height="1.5" fill="#fde047" opacity="0.8" />
                    <rect x="4" y="16" width="1.5" height="1.5" fill="#fde047" opacity="0.8" />
                    <rect x="19" y="7" width="1.5" height="1.5" fill="#fde047" opacity="0.8" />
                    <rect x="18" y="16" width="1.5" height="1.5" fill="#fde047" opacity="0.8" />
                  </svg>
                </div>

                {/* Centered Text */}
                <div className="w-full flex flex-col items-center justify-center">
                  <span className="font-pixel text-xs sm:text-base md:text-lg text-white font-bold tracking-wider start-menu-btn-title">
                    {ui.play}
                  </span>
                </div>
              </button>

              {/* 2. PENGATURAN BUTTON */}
              <button
                type="button"
                id="btn-main-setting"
                onMouseEnter={() => setSelectedMainMenuIndex(1)}
                onClick={() => {
                  sound.playMenuSelect();
                  if (onOpenSettings) onOpenSettings();
                  else onOpenAudioSettings();
                }}
                className={`w-full relative h-11 sm:h-[54px] rounded-xl sm:rounded-2xl border-2 transition-transform duration-75 transition-colors duration-75 flex items-center cursor-pointer text-center group active:scale-[0.98] touch-manipulation start-menu-btn ${
                  selectedMainMenuIndex === 1
                    ? 'bg-gradient-to-r from-[#192434] via-[#212f45] to-[#192434] border-slate-400 shadow-[0_0_18px_rgba(148,163,184,0.35)] scale-[1.01]'
                    : 'bg-[#182130]/95 border-slate-600/80 hover:border-slate-400'
                }`}
              >
                {/* Handcrafted Settings Gear Icon */}
                <div className="absolute left-3.5 sm:left-6 flex items-center justify-center pointer-events-none start-menu-btn-icon">
                  <svg className="w-4.5 h-4.5 sm:w-6 sm:h-6 text-slate-300 group-hover:text-amber-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </div>

                {/* Centered Text */}
                <div className="w-full flex flex-col items-center justify-center">
                  <span className="font-pixel text-xs sm:text-base md:text-lg text-[#cbd5e1] group-hover:text-white font-bold tracking-wider start-menu-btn-title">
                    {ui.settings}
                  </span>
                </div>
              </button>

              {/* 3. KELUAR BUTTON */}
              <button
                type="button"
                id="btn-main-exit"
                onMouseEnter={() => setSelectedMainMenuIndex(2)}
                onClick={() => {
                  sound.playMenuSelect();
                  setShowExitModal(true);
                }}
                className={`w-full relative h-11 sm:h-[54px] rounded-xl sm:rounded-2xl border-2 transition-transform duration-75 transition-colors duration-75 flex items-center cursor-pointer text-center group active:scale-[0.98] touch-manipulation start-menu-btn ${
                  selectedMainMenuIndex === 2
                    ? 'bg-gradient-to-r from-[#2c1319] via-[#381820] to-[#2c1319] border-red-500 shadow-[0_0_18px_rgba(239,68,68,0.4)] scale-[1.01]'
                    : 'bg-[#241116]/95 border-red-700/80 hover:border-red-500'
                }`}
              >
                {/* Handcrafted Exit Door Icon */}
                <div className="absolute left-3.5 sm:left-6 flex items-center justify-center pointer-events-none start-menu-btn-icon">
                  <svg className="w-4.5 h-4.5 sm:w-6 sm:h-6 text-red-400 group-hover:text-red-300 transition-colors" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </div>

                {/* Centered Text */}
                <div className="w-full flex flex-col items-center justify-center">
                  <span className="font-pixel text-xs sm:text-base md:text-lg text-[#f87171] font-bold tracking-wider start-menu-btn-title">
                    {ui.exit}
                  </span>
                </div>
              </button>
            </div>

            {/* Bottom Card Footer */}
            <div className="w-full pt-2 sm:pt-3 mt-0.5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-1 text-slate-400 text-[8px] sm:text-[11px] font-sans start-menu-footer">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full border border-emerald-400/80 flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <span>{ui.safeBrowserNote}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <span>{lang === 'en' ? 'Press' : 'Tekan'}</span>
                <span className="font-pixel text-amber-400 font-bold text-[7px] sm:text-[9px] bg-amber-950/70 border border-amber-600/60 px-1 py-0.5 rounded">
                  ENTER
                </span>
                <span>{lang === 'en' ? 'to Select' : 'untuk Memilih'}</span>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: PENYIAPAN PETUALANG */}
        {menuView === 'play' && (
          <div className="w-full max-w-[300px] sm:max-w-[460px] md:max-w-[500px] bg-[#121626]/95 border-2 border-amber-500/90 rounded-2xl sm:rounded-[24px] shadow-[0_0_35px_rgba(245,158,11,0.2)] p-2.5 sm:p-5 flex flex-col gap-1.5 sm:gap-3 animate-fade-in-slide-up start-menu-card start-menu-play-card">
            {/* Header */}
            <div className="text-center pt-0.5 pb-0.5 start-menu-play-header">
              <span className="font-pixel text-amber-400 text-[9px] sm:text-sm tracking-wider font-bold">
                {ui.charCustomizationTitle}
              </span>
            </div>

            {/* In mobile landscape, these sections sit side-by-side in start-menu-play-columns */}
            <div className="start-menu-play-columns flex flex-col gap-1.5 sm:gap-3">
              {/* Column 1: Character Selection Cards */}
              <div className="start-menu-play-avatars-col flex flex-col gap-1 sm:gap-1.5">
                <span
                  style={{ lineHeight: '30.5px' }}
                  className="font-pixel text-[8px] sm:text-[11px] text-slate-300"
                >
                  {lang === 'en' ? 'CHOOSE ADVENTURER AVATAR:' : 'PILIH KARAKTER PETUALANG:'}
                </span>

                <div className="grid grid-cols-2 gap-2 sm:gap-4 start-menu-avatar-grid">
                  {/* 1. EZZEL (Petualang Laki-Laki) */}
                  <button
                    type="button"
                    id="avatar-select-ezzel"
                    onClick={() => handleSelectAvatar('boy')}
                    style={{ paddingBottom: '12px', marginTop: '6px' }}
                    className={`p-1.5 sm:p-3 rounded-lg sm:rounded-xl border-2 transition-all flex flex-col items-center justify-between gap-1 cursor-pointer text-center relative start-menu-avatar-btn ${
                      playerAvatar === 'boy'
                        ? 'bg-emerald-950/70 border-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.4)] scale-[1.02]'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-600 opacity-75 hover:opacity-100'
                    }`}
                  >
                    {playerAvatar === 'boy' && (
                      <div className="absolute top-1 right-1 bg-emerald-400 text-slate-950 rounded-full p-0.5 shadow-md">
                        <svg className="w-2.5 h-2.5 text-slate-950 stroke-[3]" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="2.5 7 5.5 10 11.5 3.5" />
                        </svg>
                      </div>
                    )}

                    <div className="w-10 h-10 sm:w-15 sm:h-15 flex items-center justify-center my-0.5 start-menu-avatar-portrait">
                      <CharacterPortrait sprite="player_boy" size="dialogue" className="!w-10 !h-10 sm:!w-14 sm:!h-14" />
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="font-pixel text-[9px] sm:text-sm font-bold text-emerald-300">
                        EZZEL
                      </span>
                      <span className="font-sans text-[8px] sm:text-[10px] text-slate-300">
                        {ui.boyTitle}
                      </span>
                    </div>
                  </button>

                  {/* 2. EZZY (Petualang Perempuan) */}
                  <button
                    type="button"
                    id="avatar-select-ezzy"
                    onClick={() => handleSelectAvatar('girl')}
                    style={{ paddingBottom: '12px', marginTop: '6px' }}
                    className={`p-1.5 sm:p-3 rounded-lg sm:rounded-xl border-2 transition-all flex flex-col items-center justify-between gap-1 cursor-pointer text-center relative start-menu-avatar-btn ${
                      playerAvatar === 'girl'
                        ? 'bg-cyan-950/70 border-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.4)] scale-[1.02]'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-600 opacity-75 hover:opacity-100'
                    }`}
                  >
                    {playerAvatar === 'girl' && (
                      <div className="absolute top-1 right-1 bg-cyan-400 text-slate-950 rounded-full p-0.5 shadow-md">
                        <svg className="w-2.5 h-2.5 text-slate-950 stroke-[3]" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="2.5 7 5.5 10 11.5 3.5" />
                        </svg>
                      </div>
                    )}

                    <div className="w-10 h-10 sm:w-15 sm:h-15 flex items-center justify-center my-0.5 start-menu-avatar-portrait">
                      <CharacterPortrait sprite="player_girl" size="dialogue" className="!w-10 !h-10 sm:!w-14 sm:!h-14" />
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="font-pixel text-[9px] sm:text-sm font-bold text-cyan-300">
                        EZZY
                      </span>
                      <span className="font-sans text-[8px] sm:text-[10px] text-slate-300">
                        {ui.girlTitle}
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Column 2: Nickname Input & Bottom Actions */}
              <div className="start-menu-play-nickname-col flex flex-col gap-1.5 sm:gap-2">
                {/* Nickname Input Section */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="character-nickname-input"
                      style={{ lineHeight: '34px' }}
                      className="font-pixel text-[8px] sm:text-xs text-amber-300 font-bold"
                    >
                      {ui.nicknameLabel}
                    </label>
                    <span className="text-[8px] sm:text-[10px] font-sans text-slate-400">
                      {ui.maxChars}
                    </span>
                  </div>

                  {/* Glowing Neon Cyan Input */}
                  <div className="relative w-full flex items-center">
                    <input
                      id="character-nickname-input"
                      type="text"
                      autoFocus
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value.slice(0, 12))}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleStart();
                        }
                      }}
                      placeholder={lang === 'en' ? 'Type here...' : 'Ketik di sini...'}
                      maxLength={12}
                      className="w-full bg-slate-950/90 border-2 border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.3)] focus:shadow-[0_0_18px_rgba(34,211,238,0.5)] focus:border-cyan-300 rounded-lg sm:rounded-xl px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-cyan-100 font-pixel text-[9px] sm:text-sm focus:outline-none transition-all placeholder:text-slate-600 placeholder:font-sans"
                    />

                    {/* Handcrafted Reset Button */}
                    <button
                      type="button"
                      onClick={() => setPlayerName(getDefaultNameForAvatar(playerAvatar))}
                      title={lang === 'en' ? 'Use default name' : 'Gunakan nama bawaan'}
                      className="absolute right-2 px-1.5 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-300 font-pixel text-[7px] sm:text-[8px] border border-slate-700 transition cursor-pointer flex items-center gap-1"
                    >
                      <svg className="w-2.5 h-2.5 text-slate-300" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2.5 6.5A4.5 4.5 0 1 1 3.8 9.8" />
                        <polyline points="1.5 4 2.5 6.5 5 6.5" />
                      </svg>
                      <span>{ui.reset}</span>
                    </button>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="flex items-center gap-2 pt-0.5 start-menu-play-actions">
                  {/* KEMBALI BUTTON */}
                  <button
                    type="button"
                    id="btn-back-to-main"
                    onClick={() => {
                      sound.playMenuSelect();
                      setMenuView('main');
                    }}
                    className="px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl border-2 border-red-500/80 bg-red-950/40 hover:bg-red-900/60 text-red-300 font-pixel text-[8px] sm:text-xs flex items-center gap-1 cursor-pointer transition-all shadow-[0_0_10px_rgba(239,68,68,0.2)] active:scale-95 shrink-0"
                    title={lang === 'en' ? 'Back to Main Menu' : 'Kembali ke Menu Utama'}
                  >
                    <svg className="w-3 h-3 text-red-400 shrink-0" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="11" y1="7" x2="3" y2="7" />
                      <polyline points="6.5 3.5 3 7 6.5 10.5" />
                    </svg>
                    <span>{lang === 'en' ? 'BACK' : 'KEMBALI'}</span>
                  </button>

                  {/* MULAI PETUALANGAN BUTTON */}
                  <button
                    type="button"
                    id="btn-confirm-start-adventure"
                    onClick={handleStart}
                    className="flex-1 py-1.5 sm:py-2.5 px-3 sm:px-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold shadow-[0_0_20px_rgba(245,158,11,0.45)] active:scale-[0.98] transition-transform duration-75 transition-colors duration-75 flex items-center justify-center gap-1.5 cursor-pointer group touch-manipulation"
                  >
                    <svg className="w-3 h-3 fill-slate-950 text-slate-950 shrink-0" viewBox="0 0 12 12">
                      <polygon points="3,2 10,6 3,10" />
                    </svg>
                    <span className="font-pixel text-[9px] sm:text-xs tracking-wider truncate">
                      {lang === 'en' ? 'START' : 'MULAI'}: {currentDisplayNickname.toUpperCase()}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Card Footer */}
            <div className="w-full pt-1 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-1 text-slate-400 text-[8px] sm:text-[10px] font-sans start-menu-footer">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full border border-emerald-400/80 flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <span>{ui.safeBrowserNote}</span>
              </div>
              <div className="font-pixel text-[7px] sm:text-[9px] text-amber-300/90">
                {lang === 'en' ? 'Press ENTER to Start' : 'Tekan ENTER untuk Mulai'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Subtle bottom spacing */}
      <div className="h-0.5 sm:h-2 shrink-0" />

      {/* MODAL DIALOG KONFIRMASI KELUAR */}
      {showExitModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 animate-fade-in select-none">
          <div className="w-full max-w-[280px] sm:max-w-sm bg-[#121626] border-2 border-red-500/80 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 text-center shadow-[0_0_35px_rgba(239,68,68,0.3)]">
            <h3 className="font-pixel text-xs sm:text-base text-red-400 mb-1">
              {ui.exitConfirmTitle}
            </h3>
            <p className="font-sans text-[10px] sm:text-xs text-slate-300 mb-3.5 leading-relaxed">
              {ui.exitConfirmDesc}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  sound.playMenuSelect();
                  setShowExitModal(false);
                }}
                className="flex-1 py-1.5 sm:py-2.5 px-2.5 rounded-lg sm:rounded-xl border border-amber-500/80 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 font-pixel text-[9px] sm:text-[11px] cursor-pointer transition active:scale-95"
              >
                {ui.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playMenuSelect();
                  setShowExitModal(false);
                  try {
                    window.close();
                  } catch {
                    // Ignore if browser prevents closing tab
                  }
                }}
                className="flex-1 py-1.5 sm:py-2.5 px-2.5 rounded-lg sm:rounded-xl bg-red-600 hover:bg-red-500 text-white font-pixel text-[9px] sm:text-[11px] cursor-pointer shadow-md transition active:scale-95"
              >
                {ui.confirmExit}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
