import React, { useState } from 'react';
import { sound } from '../../utils/audio';
import {
  Wind,
  Eye,
  ShieldAlert,
  Zap,
  Sparkles,
  ArrowLeft,
  X,
  RotateCcw,
  CheckCircle2,
  Award,
  ListOrdered,
} from 'lucide-react';
import { RegulationMode } from './RegulationMenuModal';
import { RhythmicBreathingGame } from './RhythmicBreathingGame';
import { GroundingHiddenObjectGame } from './GroundingHiddenObjectGame';
import { StopTracingGame } from './StopTracingGame';
import { ShakeoutAlternatingGame } from './ShakeoutAlternatingGame';

interface FullscreenRegulationGameProps {
  isOpen: boolean;
  mode: RegulationMode;
  targetName?: string;
  onBackToMenu: () => void;
  onClose: () => void;
  onComplete: (mode: RegulationMode) => void;
}

export const FullscreenRegulationGame: React.FC<FullscreenRegulationGameProps> = ({
  isOpen,
  mode,
  targetName = 'Kiki',
  onBackToMenu,
  onClose,
  onComplete,
}) => {
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [replayKey, setReplayKey] = useState(0);

  if (!isOpen) return null;

  const isSelfPractice = targetName === 'Pemain' || targetName === 'Karakter Utama';

  const handleGameSuccess = () => {
    sound.playSuccessFanfare();
    setIsSuccessModalOpen(true);
  };

  const handleReplay = () => {
    sound.playMenuSelect();
    setIsSuccessModalOpen(false);
    setReplayKey((k) => k + 1);
  };

  const handleFinishAndProceed = () => {
    sound.playMenuSelect();
    setIsSuccessModalOpen(false);
    onComplete(mode);
  };

  // Header meta by mode
  const modeMeta = {
    breathing: {
      number: 1,
      title: 'Irama Balon Tenang (4-4-4)',
      subtitle: 'Mekanik Ritme Pernapasan & Keseimbangan',
      icon: <Wind className="w-5 h-5 text-cyan-300" />,
      themeColor: 'cyan',
      themeBorder: 'border-cyan-500/40',
      successMessage:
        'Detak jantung melambat, ritme pernapasan 4-4-4 berhasil menstabilkan sistem saraf dan mengembalikan kejernihan berpikir.',
    },
    grounding: {
      number: 2,
      title: 'Kaca Pembesar Panca Indera (5-4-3-2-1)',
      subtitle: 'Mekanik Dynamic Hidden Object Search',
      icon: <Eye className="w-5 h-5 text-emerald-300" />,
      themeColor: 'emerald',
      themeBorder: 'border-emerald-500/40',
      successMessage:
        'Kelima objek panca indera berhasil ditangkap menembus kabut! Pikiran kembali fokus pada saat ini dan bebas dari cemas berlebih.',
    },
    stop: {
      number: 3,
      title: 'Rem Reaksi & Tracing S-T-O-P',
      subtitle: 'Mekanik Quick Time Event & Time Freeze',
      icon: <ShieldAlert className="w-5 h-5 text-rose-300" />,
      themeColor: 'rose',
      themeBorder: 'border-rose-500/40',
      successMessage:
        'Rem STOP berhasil diinjak tepat waktu! Pembekuan waktu dan tracing S-T-O-P berhasil meredam reaksi impulsif sebelum menyakiti orang lain.',
    },
    shakeout: {
      number: 4,
      title: 'Pembebas Sulur Ketegangan',
      subtitle: 'Mekanik Alternating Button Mash (L & R)',
      icon: <Zap className="w-5 h-5 text-purple-300" />,
      themeColor: 'purple',
      themeBorder: 'border-purple-500/40',
      successMessage:
        'Semua 5 sulur ketegangan otot berhasil diputus! Hormon stres terbuang dan tubuh Kiki kembali rileks bebas dari kaku.',
    },
  }[mode];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/98 backdrop-blur-xl text-slate-100 flex flex-col overflow-y-auto animate-backdrop-fade-in select-none">
      {/* Top Fullscreen Header Bar */}
      <header className="w-full bg-slate-900/90 border-b border-slate-800 px-4 py-3 sm:px-6 flex items-center justify-between shrink-0 shadow-lg relative z-20">
        <div className="flex items-center gap-3">
          <button
            id="fullscreen-back-to-menu-btn"
            onClick={onBackToMenu}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 hover:text-amber-300 text-slate-300 font-pixel text-[10px] sm:text-xs border border-slate-700 transition-all cursor-pointer active:scale-95 shadow"
            title="Kembali ke Menu Pilihan Mini-Game"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kembali ke Menu Mini-Game</span>
            <span className="sm:hidden">Menu</span>
          </button>

          <div className="h-5 w-px bg-slate-700 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-center shrink-0">
              {modeMeta.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-pixel text-amber-400 font-bold uppercase tracking-wider">
                  MINI-GAME {modeMeta.number}
                </span>
                <span className="text-slate-500 hidden sm:inline">·</span>
                <span className="text-[9px] font-pixel text-slate-400 hidden sm:inline">
                  {modeMeta.subtitle}
                </span>
              </div>
              <h1 className="font-pixel text-xs sm:text-sm font-bold text-white tracking-wide">
                {modeMeta.title}
              </h1>
            </div>
          </div>
        </div>

        {/* Right Info: Target & Exit */}
        <div className="flex items-center gap-2.5">
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700 text-[10px] font-pixel text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {isSelfPractice ? 'Latihan Mandiri (Pemain)' : `Membantu: ${targetName}`}
            </span>
          </div>

          <button
            id="fullscreen-close-game-btn"
            onClick={onClose}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950 hover:border-rose-500/50 hover:text-rose-200 text-slate-400 border border-slate-700 font-pixel text-[10px] transition-all cursor-pointer flex items-center gap-1 active:scale-95"
            title="Keluar ke Petualangan [Esc]"
          >
            <span className="hidden sm:inline">Keluar</span>
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Fullscreen Stage Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto flex flex-col justify-center items-center p-3 sm:p-6 relative z-10">
        <div
          key={replayKey}
          className={`w-full bg-slate-900/80 border-2 ${modeMeta.themeBorder} rounded-3xl p-4 sm:p-6 shadow-[0_0_50px_rgba(0,0,0,0.85)] relative overflow-hidden my-auto animate-fade-in-slide-up`}
        >
          {/* Ambient Corner Glow */}
          <div className="absolute top-0 right-0 w-64 h-32 bg-amber-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-32 bg-cyan-500/10 blur-3xl pointer-events-none" />

          {/* Render Active Mini-Game */}
          {mode === 'breathing' && (
            <RhythmicBreathingGame targetName={targetName} onSuccess={handleGameSuccess} />
          )}

          {mode === 'grounding' && (
            <GroundingHiddenObjectGame targetName={targetName} onSuccess={handleGameSuccess} />
          )}

          {mode === 'stop' && (
            <StopTracingGame targetName={targetName} onSuccess={handleGameSuccess} />
          )}

          {mode === 'shakeout' && (
            <ShakeoutAlternatingGame targetName={targetName} onSuccess={handleGameSuccess} />
          )}
        </div>
      </main>

      {/* Victory Celebration Overlay Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-backdrop-fade-in">
          <div className="bg-slate-900 border-2 border-emerald-400/80 rounded-3xl p-6 max-w-md w-full text-center relative overflow-hidden shadow-[0_0_60px_rgba(16,185,129,0.4)] animate-scale-up">
            {/* Top Confetti & Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-emerald-500/20 blur-2xl pointer-events-none" />

            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center mx-auto mb-3 shadow-[0_0_25px_rgba(16,185,129,0.6)] animate-bounce">
              <Award className="w-9 h-9" />
            </div>

            <div className="text-[10px] font-pixel text-emerald-300 uppercase font-bold tracking-widest mb-1">
              MINI-GAME SELESAI DENGAN PARIPURNA! 🎉
            </div>

            <h2 className="text-lg sm:text-xl font-pixel font-black text-white mb-2">
              Ketenangan Berhasil Dipulihkan!
            </h2>

            <p className="text-[11px] font-pixel text-slate-300 leading-relaxed mb-4 px-2">
              {modeMeta.successMessage}
            </p>

            {/* Score & Rewards Box */}
            <div className="grid grid-cols-2 gap-2 bg-slate-950/80 border border-slate-800 rounded-xl p-3 mb-5 font-pixel text-left">
              <div className="flex items-center gap-2">
                <span className="text-xl">💖</span>
                <div>
                  <span className="text-[9px] text-slate-400 block">Skor Empati</span>
                  <span className="text-xs font-bold text-emerald-300">+25 Poin</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🧘</span>
                <div>
                  <span className="text-[9px] text-slate-400 block">Kecakapan</span>
                  <span className="text-xs font-bold text-amber-300">+1 Teknik Dikuasai</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 font-pixel">
              <button
                id="btn-proceed-after-regulation"
                onClick={handleFinishAndProceed}
                className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 text-slate-950 font-bold text-xs sm:text-sm shadow-[0_0_25px_rgba(16,185,129,0.7)] flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>LANJUTKAN PETUALANGAN DESA ▶</span>
              </button>

              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  id="btn-replay-mini-game"
                  onClick={handleReplay}
                  className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-pixel text-[10px] border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Mainkan Lagi</span>
                </button>

                <button
                  id="btn-choose-other-mini-game"
                  onClick={() => {
                    setIsSuccessModalOpen(false);
                    onBackToMenu();
                  }}
                  className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-pixel text-[10px] border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                  <span>Pilih Teknik Lain</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
