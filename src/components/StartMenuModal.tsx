import React, { useEffect } from 'react';
import {
  Play,
  Compass,
  Gamepad2,
  Volume2,
  VolumeX,
  Sparkles,
  Sliders,
  Heart,
  Wind,
  Smile,
  ShieldCheck,
} from 'lucide-react';
import { useAudioSettings } from '../utils/audio';

interface StartMenuModalProps {
  isOpen: boolean;
  onStartGame: () => void;
  onOpenControls: () => void;
  onOpenAudioSettings: () => void;
  isSettingsOpen?: boolean;
}

export const StartMenuModal: React.FC<StartMenuModalProps> = ({
  isOpen,
  onStartGame,
  onOpenControls,
  onOpenAudioSettings,
  isSettingsOpen = false,
}) => {
  const { isMuted, toggleMute } = useAudioSettings();

  // Keyboard shortcut: Press Space or Enter to start directly (only if Settings modal is not open in front)
  useEffect(() => {
    if (!isOpen || isSettingsOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onStartGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSettingsOpen, onStartGame]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Animated Background Ambience Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="w-[320px] sm:w-[500px] h-[320px] sm:h-[500px] bg-amber-500/10 rounded-full blur-[90px] animate-pulse" />
        <div className="w-[280px] sm:w-[420px] h-[280px] sm:h-[420px] bg-emerald-500/10 rounded-full blur-[80px] translate-x-20 -translate-y-20" />
      </div>

      {/* Main Start Menu Card */}
      <div className="relative w-full max-w-xl bg-slate-900/95 border-2 border-amber-500/80 rounded-2xl sm:rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.2)] p-4 sm:p-6 md:p-8 flex flex-col items-center text-center my-auto">
        {/* Top Header Bar: Sound & Offline Utilities */}
        <div className="w-full flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
          <div className="flex items-center gap-1.5 text-amber-400/90 text-xs font-pixel">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span>EDISI PETUALANGAN RESMI</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              title={isMuted ? 'Nyalakan Audio' : 'Matikan Audio'}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-300 border border-slate-700/80 transition flex items-center gap-1.5 text-xs font-sans"
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-red-400" />
                  <span className="hidden sm:inline text-[11px]">Bisu</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline text-[11px]">Suara ON</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Game Title & Badge */}
        <div className="my-2 sm:my-4 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 via-amber-400/25 to-amber-500/20 border border-amber-400/50 rounded-full px-3 sm:px-4 py-1 mb-2.5 shadow-sm">
            <Compass className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '10s' }} />
            <span className="font-pixel text-[9px] sm:text-[10px] text-amber-300 tracking-wider font-bold">
              GAME RPG SOSIAL-EMOSIONAL & MINDFULNESS
            </span>
          </div>

          <h1 className="font-pixel text-2xl sm:text-3xl md:text-4xl text-amber-400 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] tracking-wide leading-tight mt-1">
            LEMBAH NADA RASA
          </h1>

          <p
            style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
            className="text-xs sm:text-sm text-slate-300 font-medium tracking-wide mt-1"
          >
            Kisah Petualangan Kompas Hati & Pemulihan Harmoni Diri
          </p>
        </div>

        {/* Story Synopsis Box */}
        <div className="w-full bg-slate-950/80 border border-amber-500/40 rounded-xl p-3 sm:p-4 my-2 sm:my-3 text-left shadow-inner">
          <p
            style={{ fontFamily: "'Pixelify Sans', sans-serif", fontSize: '12px' }}
            className="text-slate-200 leading-relaxed"
          >
            Sebuah kabut kelabu menyelimuti Lembah Nada Rasa, membuat para penghuni kehilangan kepekaan perasaan mereka. Sebagai penjelajah muda, kamu menemukan <strong className="text-amber-300 font-semibold">Pusaka Kompas Hati</strong> yang mampu membaca resonansi batin.
          </p>
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 font-sans">
            <span
              style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
              className="flex items-center gap-1 text-emerald-300"
            >
              <Heart className="w-3 h-3 text-red-400 fill-red-400/30" /> Resonansi Empati
            </span>
            <span
              style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
              className="flex items-center gap-1 text-sky-300"
            >
              <Wind className="w-3 h-3 text-sky-400" /> Regulasi Napas
            </span>
            <span
              style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
              className="flex items-center gap-1 text-amber-300"
            >
              <Smile className="w-3 h-3 text-amber-400" /> Growth Mindset
            </span>
          </div>
        </div>

        {/* Main CTA: Mulai Petualangan */}
        <div className="w-full mt-3 sm:mt-4 flex flex-col gap-2.5">
          <button
            id="btn-start-adventure"
            onClick={onStartGame}
            className="w-full py-3 sm:py-3.5 px-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-sm sm:text-base shadow-[0_0_25px_rgba(245,158,11,0.5)] active:scale-[0.98] transition flex items-center justify-center gap-2 group cursor-pointer"
          >
            <Play className="w-5 h-5 fill-slate-950 group-hover:scale-110 transition-transform" />
            <span className="font-pixel text-xs sm:text-sm tracking-wider">MULAI PETUALANGAN</span>
            <Sparkles className="w-4 h-4 text-slate-950 animate-pulse" />
          </button>

          <p className="text-[10px] sm:text-[11px] text-slate-400 font-sans">
            Tekan tombol di atas atau tekan <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-amber-300 font-mono text-[10px]">[ENTER]</kbd> / <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-amber-300 font-mono text-[10px]">[SPASI]</kbd> untuk masuk ke cerita
          </p>
        </div>

        {/* Secondary Navigation Options */}
        <div className="w-full grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800">
          <button
            onClick={onOpenControls}
            className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-amber-300 border border-slate-700 transition flex items-center justify-center gap-1.5 text-xs font-sans font-medium"
          >
            <Gamepad2 className="w-4 h-4 text-emerald-400" />
            <span style={{ fontFamily: "'Pixelify Sans', sans-serif" }}>Cara Bermain</span>
          </button>

          <button
            onClick={onOpenAudioSettings}
            className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-amber-300 border border-slate-700 transition flex items-center justify-center gap-1.5 text-xs font-sans font-medium"
          >
            <Sliders className="w-4 h-4 text-sky-400" />
            <span style={{ fontFamily: "'Pixelify Sans', sans-serif" }}>Audio & Opsi</span>
          </button>
        </div>

        {/* Footer info note */}
        <div className="mt-3 text-[10px] text-slate-400 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span style={{ fontFamily: "'Pixelify Sans', sans-serif" }}>
            Game berjalan 100% di browser secara lokal & aman untuk semua usia
          </span>
        </div>
      </div>
    </div>
  );
};
