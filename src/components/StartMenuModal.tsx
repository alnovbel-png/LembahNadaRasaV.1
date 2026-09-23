import React, { useEffect, useState } from 'react';
import {
  Compass,
  Volume2,
  VolumeX,
  Check,
  Play,
  ArrowLeft,
  RotateCcw,
} from 'lucide-react';
import { sound, useAudioSettings } from '../utils/audio';
import { CharacterPortrait } from './CharacterPortrait';

export type MenuView = 'main' | 'play';

interface StartMenuModalProps {
  isOpen: boolean;
  onStartGame: (name: string, avatar: 'boy' | 'girl') => void;
  onOpenControls: () => void;
  onOpenAudioSettings: () => void;
  onOpenSettings?: () => void;
  isSettingsOpen?: boolean;
  initialPlayerName?: string;
  initialPlayerAvatar?: 'boy' | 'girl';
}

export const StartMenuModal: React.FC<StartMenuModalProps> = ({
  isOpen,
  onStartGame,
  onOpenControls,
  onOpenAudioSettings,
  onOpenSettings,
  isSettingsOpen = false,
  initialPlayerName = 'Ezzel',
  initialPlayerAvatar = 'boy',
}) => {
  const { isMuted, toggleMute } = useAudioSettings();
  const [menuView, setMenuView] = useState<MenuView>('main');
  const [selectedMainMenuIndex, setSelectedMainMenuIndex] = useState<number>(0); // 0: Play, 1: Setting, 2: Keluar
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
    // Auto-update name if currently matching another default name
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

      // If typing in input box, only intercept Enter and Escape
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
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-[#0a0d18]/80 backdrop-blur-[2px] p-3 sm:p-5 md:p-6 overflow-y-auto animate-backdrop-fade-in select-none">
      {/* =================================================================== */}
      {/* 1. TOP BAR: Compact & well-proportioned for 16:9 displays */}
      {/* =================================================================== */}
      <div className="w-full flex items-center justify-between z-20 max-w-5xl mx-auto px-2">
        {/* Left: EDISI RESMI ANAK-ANAK */}
        <div className="font-pixel text-amber-400 text-[10px] sm:text-xs tracking-wider font-bold">
          EDISI RESMI ANAK-ANAK
        </div>

        {/* Center Badge: RPG SOSIAL-EMOSIONAL & MINDFULNESS */}
        <div className="hidden sm:inline-flex items-center gap-1.5 bg-[#251b14]/90 border border-amber-600/70 rounded-full px-3 py-1 shadow-md">
          <Compass className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-pixel text-[8px] sm:text-[9px] text-amber-300 font-bold tracking-wider">
            RPG SOSIAL-EMOSIONAL & MINDFULNESS
          </span>
        </div>

        {/* Right: Sound Toggle Button */}
        <button
          type="button"
          onClick={toggleMute}
          title={isMuted ? 'Nyalakan Audio' : 'Matikan Audio'}
          className="inline-flex items-center gap-1.5 bg-[#10222a]/90 hover:bg-[#18333e] border border-cyan-700/70 rounded-full px-2.5 sm:px-3 py-1 transition text-cyan-200 cursor-pointer shadow-md active:scale-95"
        >
          {isMuted ? (
            <>
              <VolumeX className="w-3 h-3 text-red-400" />
              <span className="font-pixel text-[8px] sm:text-[9px] text-red-300">Suara OFF</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3 h-3 text-cyan-400" />
              <span className="font-pixel text-[8px] sm:text-[9px] text-cyan-200">Suara ON</span>
            </>
          )}
        </button>
      </div>

      {/* =================================================================== */}
      {/* 2. CENTER CONTENT: Sized to preserve generous 16:9 whitespace */}
      {/* =================================================================== */}
      <div className="w-full flex flex-col items-center justify-center my-auto py-2 z-10">
        {/* Game Title: Proportionate size without overwhelming the vertical space */}
        <div className="text-center mb-2.5 sm:mb-3.5">
          <h1 className="font-pixel text-xl sm:text-2xl md:text-3xl text-amber-400 drop-shadow-[0_3px_0_#000] tracking-wider leading-snug">
            LEMBAH NADA RASA
          </h1>
        </div>

        {/* =================================================================== */}
        {/* VIEW 1: MENU UTAMA (16:9 proportion, sleek buttons, clean whitespace) */}
        {/* =================================================================== */}
        {menuView === 'main' && (
          <div className="w-full max-w-[460px] sm:max-w-[500px] md:max-w-[520px] bg-[#121626]/95 border-2 border-amber-500/90 rounded-[22px] sm:rounded-[24px] shadow-[0_0_40px_rgba(245,158,11,0.2)] p-4 sm:p-5 flex flex-col gap-2.5 sm:gap-3 animate-fade-in-slide-up">
            {/* Header: MENU UTAMA */}
            <div className="text-center pt-0.5 pb-0.5">
              <span className="font-pixel text-amber-400 text-xs sm:text-sm tracking-[0.2em] font-bold">
                MENU UTAMA
              </span>
            </div>

            {/* Menu Buttons Stack */}
            <div className="flex flex-col gap-2 sm:gap-2.5 my-0.5">
              {/* 1. PLAY BUTTON */}
              <button
                type="button"
                id="btn-main-play"
                onMouseEnter={() => setSelectedMainMenuIndex(0)}
                onClick={() => {
                  sound.playMenuSelect();
                  setMenuView('play');
                }}
                className={`w-full relative h-[56px] sm:h-[62px] rounded-xl sm:rounded-2xl border-2 transition-all flex items-center cursor-pointer text-center group ${
                  selectedMainMenuIndex === 0
                    ? 'bg-gradient-to-r from-[#2c1f14] via-[#352518] to-[#2c1f14] border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)] scale-[1.01]'
                    : 'bg-[#231810]/95 border-amber-600/70 hover:border-amber-400'
                }`}
              >
                {/* Pixel Play Icon on left */}
                <div className="absolute left-4 sm:left-6 flex items-center justify-center pointer-events-none">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" viewBox="0 0 24 24" fill="currentColor">
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
                  <span className="font-pixel text-sm sm:text-base md:text-lg text-white font-bold tracking-wider">
                    PLAY
                  </span>
                  <span className="font-pixel text-[9px] sm:text-[10px] text-amber-400 tracking-wider mt-0.5">
                    MULAI PETUALANGAN
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
                className={`w-full relative h-[56px] sm:h-[62px] rounded-xl sm:rounded-2xl border-2 transition-all flex items-center cursor-pointer text-center group ${
                  selectedMainMenuIndex === 1
                    ? 'bg-gradient-to-r from-[#192434] via-[#212f45] to-[#192434] border-slate-400 shadow-[0_0_18px_rgba(148,163,184,0.35)] scale-[1.01]'
                    : 'bg-[#182130]/95 border-slate-600/80 hover:border-slate-400'
                }`}
              >
                {/* Pixel Gear Icon on left */}
                <div className="absolute left-4 sm:left-6 flex items-center justify-center pointer-events-none">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.2">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>

                {/* Centered Text */}
                <div className="w-full flex flex-col items-center justify-center">
                  <span className="font-pixel text-sm sm:text-base md:text-lg text-[#cbd5e1] group-hover:text-white font-bold tracking-wider">
                    PENGATURAN
                  </span>
                  <span className="font-pixel text-[9px] sm:text-[10px] text-[#94a3b8] tracking-wider mt-0.5">
                    OPSI GAME & AKSESIBILITAS
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
                className={`w-full relative h-[56px] sm:h-[62px] rounded-xl sm:rounded-2xl border-2 transition-all flex items-center cursor-pointer text-center group ${
                  selectedMainMenuIndex === 2
                    ? 'bg-gradient-to-r from-[#2c1319] via-[#381820] to-[#2c1319] border-red-500 shadow-[0_0_18px_rgba(239,68,68,0.4)] scale-[1.01]'
                    : 'bg-[#241116]/95 border-red-700/80 hover:border-red-500'
                }`}
              >
                {/* Pixel Exit Icon on left */}
                <div className="absolute left-4 sm:left-6 flex items-center justify-center pointer-events-none">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-red-400" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </div>

                {/* Centered Text */}
                <div className="w-full flex flex-col items-center justify-center">
                  <span className="font-pixel text-sm sm:text-base md:text-lg text-[#f87171] font-bold tracking-wider">
                    KELUAR
                  </span>
                  <span className="font-pixel text-[9px] sm:text-[10px] text-[#ef4444]/90 tracking-wider mt-0.5">
                    TUTUP PERMAINAN
                  </span>
                </div>
              </button>
            </div>

            {/* Bottom Card Footer */}
            <div className="w-full pt-2 sm:pt-2.5 mt-0.5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-1.5 text-slate-400 text-[10px] sm:text-[11px] font-sans">
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-full border border-emerald-400/80 flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <span>100% di browser & aman untuk anak-anak</span>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <span>Tekan Tombol</span>
                <span className="font-pixel text-amber-400 font-bold text-[10px]">[ENTER]</span>
                <span>untuk Memilih</span>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* VIEW 2: PENYIAPAN PETUALANG (2 Karakter: Ezzel & Ezzy) */}
        {/* =================================================================== */}
        {menuView === 'play' && (
          <div className="w-full max-w-[460px] sm:max-w-[500px] md:max-w-[520px] bg-[#121626]/95 border-2 border-amber-500/90 rounded-[22px] sm:rounded-[24px] shadow-[0_0_40px_rgba(245,158,11,0.2)] p-4 sm:p-5 flex flex-col gap-2.5 sm:gap-3 animate-fade-in-slide-up">
            {/* Header: PENYIAPAN PETUALANG */}
            <div className="text-center pt-0.5 pb-0.5">
              <span className="font-pixel text-amber-400 text-xs sm:text-sm tracking-[0.2em] font-bold">
                PENYIAPAN PETUALANG
              </span>
            </div>

            {/* Section 1: Nickname Input */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="character-nickname-input"
                  className="font-pixel text-[10px] sm:text-xs text-amber-300 font-bold"
                >
                  NAMA KARAKTER:
                </label>
                <span className="text-[10px] font-sans text-slate-400">
                  Maks. 12 Karakter
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
                  placeholder="Ketik di sini..."
                  maxLength={12}
                  className="w-full bg-slate-950/90 border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)] focus:shadow-[0_0_22px_rgba(34,211,238,0.5)] focus:border-cyan-300 rounded-xl px-3.5 py-2 text-cyan-100 font-pixel text-xs sm:text-sm focus:outline-none transition-all placeholder:text-slate-600 placeholder:font-sans"
                />

                {/* Reset button inside input */}
                <button
                  type="button"
                  onClick={() => setPlayerName(getDefaultNameForAvatar(playerAvatar))}
                  title="Gunakan nama bawaan"
                  className="absolute right-2.5 px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-300 font-pixel text-[8px] border border-slate-700 transition cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Section 2: Character Selection Cards (2 Karakter: Ezzel & Ezzy) */}
            <div className="flex flex-col gap-1.5">
              <span className="font-pixel text-[10px] sm:text-[11px] text-slate-300">
                PILIH KARAKTER PETUALANG:
              </span>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {/* 1. EZZEL (Petualang Laki-Laki) */}
                <button
                  type="button"
                  id="avatar-select-ezzel"
                  onClick={() => handleSelectAvatar('boy')}
                  className={`p-2.5 sm:p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-between gap-1.5 cursor-pointer text-center relative ${
                    playerAvatar === 'boy'
                      ? 'bg-emerald-950/70 border-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.4)] scale-[1.02]'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-600 opacity-75 hover:opacity-100'
                  }`}
                >
                  {playerAvatar === 'boy' && (
                    <div className="absolute top-1.5 right-1.5 bg-emerald-400 text-slate-950 rounded-full p-0.5 shadow-md">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}

                  <div className="w-13 h-13 sm:w-15 sm:h-15 flex items-center justify-center my-0.5">
                    <CharacterPortrait sprite="player_boy" size="dialogue" />
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="font-pixel text-xs sm:text-sm font-bold text-emerald-300">
                      EZZEL
                    </span>
                    <span className="font-sans text-[10px] text-slate-300">
                      Petualang Laki-Laki
                    </span>
                  </div>
                </button>

                {/* 2. EZZY (Petualang Perempuan) */}
                <button
                  type="button"
                  id="avatar-select-ezzy"
                  onClick={() => handleSelectAvatar('girl')}
                  className={`p-2.5 sm:p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-between gap-1.5 cursor-pointer text-center relative ${
                    playerAvatar === 'girl'
                      ? 'bg-cyan-950/70 border-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.4)] scale-[1.02]'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-600 opacity-75 hover:opacity-100'
                  }`}
                >
                  {playerAvatar === 'girl' && (
                    <div className="absolute top-1.5 right-1.5 bg-cyan-400 text-slate-950 rounded-full p-0.5 shadow-md">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}

                  <div className="w-13 h-13 sm:w-15 sm:h-15 flex items-center justify-center my-0.5">
                    <CharacterPortrait sprite="player_girl" size="dialogue" />
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="font-pixel text-xs sm:text-sm font-bold text-cyan-300">
                      EZZY
                    </span>
                    <span className="font-sans text-[10px] text-slate-300">
                      Petualang Perempuan
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Section 3: Bottom Action Buttons (Kembali & Mulai Petualangan) */}
            <div className="flex items-center gap-2.5 pt-1">
              {/* KEMBALI BUTTON (Returns to Main Menu) */}
              <button
                type="button"
                id="btn-back-to-main"
                onClick={() => {
                  sound.playMenuSelect();
                  setMenuView('main');
                }}
                className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border-2 border-red-500/80 bg-red-950/40 hover:bg-red-900/60 text-red-300 font-pixel text-[10px] sm:text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-[0_0_10px_rgba(239,68,68,0.2)] active:scale-95 shrink-0"
                title="Kembali ke Menu Utama"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-red-400" />
                <span>KEMBALI</span>
              </button>

              {/* MULAI PETUALANGAN BUTTON */}
              <button
                type="button"
                id="btn-confirm-start-adventure"
                onClick={handleStart}
                className="flex-1 py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold shadow-[0_0_20px_rgba(245,158,11,0.45)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer group"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950 text-slate-950 shrink-0" />
                <span className="font-pixel text-[11px] sm:text-xs tracking-wider truncate">
                  MULAI: [{currentDisplayNickname.toUpperCase()}]
                </span>
              </button>
            </div>

            {/* Bottom Card Footer */}
            <div className="w-full pt-1.5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-1 text-slate-400 text-[10px] font-sans">
              <div className="flex items-center gap-1">
                <div className="w-3.5 h-3.5 rounded-full border border-emerald-400/80 flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <span>100% di browser & aman untuk anak-anak</span>
              </div>
              <div className="font-pixel text-[9px] text-amber-300/90">
                Tekan [ENTER] untuk Mulai
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Subtle bottom spacing to ensure balance in 16:9 */}
      <div className="h-1 sm:h-2" />

      {/* =================================================================== */}
      {/* 3. MODAL DIALOG KONFIRMASI KELUAR */}
      {/* =================================================================== */}
      {showExitModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in select-none">
          <div className="w-full max-w-sm bg-[#121626] border-2 border-red-500/80 rounded-2xl p-5 text-center shadow-[0_0_35px_rgba(239,68,68,0.3)]">
            <h3 className="font-pixel text-sm sm:text-base text-red-400 mb-1.5">
              TUTUP PERMAINAN?
            </h3>
            <p className="font-sans text-xs text-slate-300 mb-5 leading-relaxed">
              Semua progres petualangan dan pengaturan suara tersimpan secara otomatis di browsermu. Kamu dapat menutup tab peramban ini atau melanjutkan kembali petualangan kapan saja!
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => {
                  sound.playMenuSelect();
                  setShowExitModal(false);
                }}
                className="flex-1 py-2.5 px-3 rounded-xl border border-amber-500/80 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 font-pixel text-[11px] cursor-pointer transition active:scale-95"
              >
                KEMBALI KE MENU
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playMenuSelect();
                  setShowExitModal(false);
                  try {
                    window.close();
                  } catch {
                    // Ignore if browser prevents closing top tab
                  }
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-pixel text-[11px] cursor-pointer shadow-md transition active:scale-95"
              >
                TUTUP TAB
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
