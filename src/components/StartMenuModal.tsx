import React, { useEffect, useState } from 'react';
import {
  Compass,
  Gamepad2,
  Volume2,
  VolumeX,
  Sliders,
  Heart,
  Wind,
  Smile,
  ShieldCheck,
  User,
  Check,
} from 'lucide-react';
import { useAudioSettings } from '../utils/audio';
import { CharacterPortrait } from './CharacterPortrait';

interface StartMenuModalProps {
  isOpen: boolean;
  onStartGame: (name: string, avatar: 'boy' | 'girl') => void;
  onOpenControls: () => void;
  onOpenAudioSettings: () => void;
  isSettingsOpen?: boolean;
  initialPlayerName?: string;
  initialPlayerAvatar?: 'boy' | 'girl';
}

export const StartMenuModal: React.FC<StartMenuModalProps> = ({
  isOpen,
  onStartGame,
  onOpenControls,
  onOpenAudioSettings,
  isSettingsOpen = false,
  initialPlayerName = 'Ezzel',
  initialPlayerAvatar = 'boy',
}) => {
  const { isMuted, toggleMute } = useAudioSettings();
  const [playerName, setPlayerName] = useState(initialPlayerName);
  const [playerAvatar, setPlayerAvatar] = useState<'boy' | 'girl'>(initialPlayerAvatar);

  // Sync state if initial props change
  useEffect(() => {
    setPlayerName(initialPlayerName === 'Ezsela' ? 'Ezzy' : initialPlayerName);
    setPlayerAvatar(initialPlayerAvatar);
  }, [initialPlayerName, initialPlayerAvatar]);

  const handleStart = () => {
    const finalName = playerName.trim() || (playerAvatar === 'girl' ? 'Ezzy' : 'Ezzel');
    onStartGame(finalName, playerAvatar);
  };

  // Keyboard shortcut: Press Enter to start directly (only if Settings modal is not open in front)
  useEffect(() => {
    if (!isOpen || isSettingsOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is actively typing in the input box unless it's Enter
      if (e.key === 'Enter') {
        e.preventDefault();
        handleStart();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSettingsOpen, playerName, playerAvatar]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-3 sm:p-4 md:p-6 overflow-y-auto animate-backdrop-fade-in">
      {/* Animated Background Ambience Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="w-[320px] sm:w-[500px] h-[320px] sm:h-[500px] bg-amber-500/10 rounded-full blur-[90px] animate-pulse" />
        <div className="w-[280px] sm:w-[420px] h-[280px] sm:h-[420px] bg-emerald-500/10 rounded-full blur-[80px] translate-x-20 -translate-y-20" />
      </div>

      {/* Main Start Menu Card */}
      <div className="relative w-full max-w-lg md:max-w-4xl lg:max-w-5xl bg-slate-900/95 border-2 border-amber-500/80 rounded-2xl sm:rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.25)] p-4 sm:p-6 md:p-7 lg:p-8 flex flex-col items-center text-center my-auto modal-glow-frame animate-fade-in-slide-up max-h-[96vh] md:max-h-[92vh] overflow-y-auto">
        {/* Top Header Bar: Sound & Offline Utilities */}
        <div className="w-full flex items-center justify-between pb-2.5 mb-3 sm:pb-3 sm:mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-amber-400/90 text-[10px] sm:text-xs font-pixel">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span className="tracking-wide">EDISI RESMI ANAK-ANAK</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              title={isMuted ? 'Nyalakan Audio' : 'Matikan Audio'}
              className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-300 border border-slate-700/80 transition flex items-center gap-1.5 text-xs font-sans cursor-pointer"
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-[11px]">Bisu</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px]">Suara ON</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Main Body Grid: 2 Columns on md+, Single Column on Mobile */}
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 md:gap-7 lg:gap-8 items-stretch text-left">
          {/* LEFT COLUMN: Title, Synopsis, and Secondary Controls (5 cols on md) */}
          <div className="md:col-span-5 flex flex-col justify-between gap-3 sm:gap-4 text-center md:text-left">
            <div>
              {/* Game Title & Badge */}
              <div className="flex flex-col items-center mb-3 sm:mb-4">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 via-amber-400/25 to-amber-500/20 border border-amber-400/50 rounded-full px-3.5 py-1 sm:py-1.5 mb-2.5 sm:mb-3 shadow-sm">
                  <Compass className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '10s' }} />
                  <span className="font-pixel text-[9px] text-amber-300 tracking-wider font-bold">
                    RPG SOSIAL-EMOSIONAL & MINDFULNESS
                  </span>
                </div>

                <h1 className="font-pixel text-2xl sm:text-3xl md:text-4xl text-amber-400 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] tracking-wide leading-snug text-center">
                  LEMBAH NADA RASA
                </h1>
              </div>

              {/* Story Synopsis Box */}
              <div className="w-full bg-slate-950/80 border border-amber-500/30 rounded-2xl p-3.5 sm:p-4 md:p-4.5 my-2 sm:my-3 text-left shadow-inner">
                <p
                  style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
                  className="text-slate-200 leading-relaxed text-xs sm:text-[13px]"
                >
                  Sebuah kabut kelabu menyelimuti Lembah Nada Rasa. Sebagai penjelajah muda, kamu menemukan <strong className="text-amber-300 font-semibold">Pusaka Kompas Hati</strong> untuk memulihkan kepekaan rasa para warga desa.
                </p>
                <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-xs text-slate-400 font-sans">
                  <span
                    style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
                    className="flex items-center gap-1.5 text-emerald-300"
                  >
                    <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400/30" /> Empati
                  </span>
                  <span
                    style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
                    className="flex items-center gap-1.5 text-sky-300"
                  >
                    <Wind className="w-3.5 h-3.5 text-sky-400" /> Regulasi Napas
                  </span>
                  <span
                    style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
                    className="flex items-center gap-1.5 text-amber-300"
                  >
                    <Smile className="w-3.5 h-3.5 text-amber-400" /> Kenal Emosi
                  </span>
                </div>
              </div>
            </div>

            {/* Secondary Navigation Options & Safe Note */}
            <div className="flex flex-col gap-2 mt-auto pt-2">
              <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                <button
                  type="button"
                  onClick={onOpenControls}
                  className="px-3 py-2 sm:py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-amber-300 border border-slate-700 transition flex items-center justify-center gap-1.5 text-xs font-sans font-medium cursor-pointer"
                >
                  <Gamepad2 className="w-4 h-4 text-emerald-400" />
                  <span style={{ fontFamily: "'Pixelify Sans', sans-serif" }}>Cara Main</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenAudioSettings}
                  className="px-3 py-2 sm:py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-amber-300 border border-slate-700 transition flex items-center justify-center gap-1.5 text-xs font-sans font-medium cursor-pointer"
                >
                  <Sliders className="w-4 h-4 text-sky-400" />
                  <span style={{ fontFamily: "'Pixelify Sans', sans-serif" }}>Audio & Opsi</span>
                </button>
              </div>

              {/* Footer info note */}
              <div className="text-[9px] sm:text-[10px] text-slate-400 flex items-center justify-center md:justify-start gap-1.5 pt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span style={{ fontFamily: "'Pixelify Sans', sans-serif" }}>
                  100% di browser & aman untuk anak-anak
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Character Customization & Main Start CTA (7 cols on md) */}
          <div className="md:col-span-7 flex flex-col justify-between gap-3 text-left">
            {/* CHARACTER CUSTOMIZATION SECTION */}
            <div className="w-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-400/70 rounded-2xl p-3.5 sm:p-4 md:p-5 text-left shadow-lg">
              <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-800">
                <span className="font-pixel text-[12px] text-amber-300 font-bold flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  PILIH KARAKTER & NAMA PANGGILAN
                </span>
                <span className="text-[9px] sm:text-[10px] font-pixel text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40 text-center">
                  Kustomisasi Bebas
                </span>
              </div>

              {/* 1. Character Avatar Selection (Boy / Girl) */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-3">
                {/* BOY AVATAR */}
                <button
                  type="button"
                  id="avatar-select-boy"
                  onClick={() => {
                    setPlayerAvatar('boy');
                    if (playerName === 'Ezzy' || playerName === 'Ezsela' || !playerName.trim()) {
                      setPlayerName('Ezzel');
                    }
                  }}
                  className={`p-2 sm:p-2.5 rounded-2xl border-2 transition-all flex flex-col items-center gap-1.5 cursor-pointer text-center relative ${
                    playerAvatar === 'boy'
                      ? 'bg-emerald-950/60 border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.35)] scale-[1.01]'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-600 opacity-70 hover:opacity-100'
                  }`}
                >
                  {playerAvatar === 'boy' && (
                    <div className="absolute top-1.5 right-1.5 bg-emerald-400 text-slate-950 rounded-full p-0.5">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                  <CharacterPortrait sprite="player_boy" size="dialogue" />
                  <div className="flex flex-col items-center mt-0.5">
                    <span className="font-pixel text-[11px] font-bold text-emerald-300">
                      Petualang Laki-Laki
                    </span>
                    <span className="font-pixel text-[9px] text-slate-400">
                      Avatar: Ezzel
                    </span>
                  </div>
                </button>

                {/* GIRL AVATAR */}
                <button
                  type="button"
                  id="avatar-select-girl"
                  onClick={() => {
                    setPlayerAvatar('girl');
                    if (playerName === 'Ezzel' || !playerName.trim()) {
                      setPlayerName('Ezzy');
                    }
                  }}
                  className={`p-2 sm:p-2.5 rounded-2xl border-2 transition-all flex flex-col items-center gap-1.5 cursor-pointer text-center relative ${
                    playerAvatar === 'girl'
                      ? 'bg-rose-950/60 border-pink-400 shadow-[0_0_15px_rgba(244,114,182,0.35)] scale-[1.01]'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-600 opacity-70 hover:opacity-100'
                  }`}
                >
                  {playerAvatar === 'girl' && (
                    <div className="absolute top-1.5 right-1.5 bg-pink-400 text-slate-950 rounded-full p-0.5">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                  <CharacterPortrait sprite="player_girl" size="dialogue" />
                  <div className="flex flex-col items-center mt-0.5">
                    <span className="font-pixel text-[11px] font-bold text-pink-300">
                      Petualang Perempuan
                    </span>
                    <span className="font-pixel text-[9px] text-slate-400">
                      Avatar: Ezzy
                    </span>
                  </div>
                </button>
              </div>

              {/* 2. Player Nickname Input */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="player-nickname-input"
                  className="font-pixel text-[10px] sm:text-[11px] text-slate-300 flex items-center justify-between"
                >
                  <span>Nama Panggilan Karakter:</span>
                  <span className="text-[9px] text-amber-400">Maks. 14 Karakter</span>
                </label>
                <div className="w-full max-w-full flex gap-1.5 sm:gap-2 items-center">
                  <input
                    id="player-nickname-input"
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value.slice(0, 14))}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleStart();
                      }
                    }}
                    onKeyUp={(e) => {
                      e.stopPropagation();
                    }}
                    placeholder={playerAvatar === 'girl' ? 'Nama (misal: Ezzy)' : 'Nama (misal: Ezzel)'}
                    maxLength={14}
                    className="min-w-0 flex-1 w-full bg-slate-950 border-2 border-amber-500/60 focus:border-amber-400 text-amber-200 px-2 sm:px-3 py-1 sm:py-2 h-8 sm:h-9 md:h-10 rounded-lg sm:rounded-xl font-pixel text-[10.5px] sm:text-xs md:text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-amber-400/40 shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setPlayerName(playerAvatar === 'girl' ? 'Ezzy' : 'Ezzel')}
                    className="shrink-0 px-2 sm:px-2.5 py-1 sm:py-1.5 h-8 sm:h-9 md:h-10 rounded-lg sm:rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 font-pixel text-[8px] sm:text-[9.5px] border border-slate-700 transition cursor-pointer flex items-center justify-center whitespace-nowrap"
                    title="Gunakan nama default"
                  >
                    Reset
                  </button>
                </div>
                <p
                  style={{ fontSize: '8px' }}
                  className="font-pixel text-[8px] text-slate-400 leading-tight mt-1"
                >
                  💡 Nama <span className="text-amber-300 font-bold">{playerName.trim() || (playerAvatar === 'girl' ? 'Ezzy' : 'Ezzel')}</span> otomatis tertera di dialog warga dan sertifikat!
                </p>
              </div>
            </div>

            {/* Main CTA: Mulai Petualangan */}
            <div className="w-full flex flex-col gap-1.5 mt-2">
              <button
                id="btn-start-adventure"
                onClick={handleStart}
                className="w-full py-3 sm:py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-[0_0_25px_rgba(245,158,11,0.5)] active:scale-[0.98] transition flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span className="font-pixel text-xs sm:text-sm tracking-wider">
                  MULAI SEBAGAI {playerName.trim().toUpperCase() || (playerAvatar === 'girl' ? 'EZZY' : 'EZZEL')}
                </span>
              </button>

              <p
                style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
                className="text-[9px] sm:text-[10px] text-slate-400 text-center"
              >
                Tekan tombol di atas atau tekan <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-amber-300 font-mono text-[9px]">[ENTER]</kbd> untuk masuk
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
