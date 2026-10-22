import React, { useState, useEffect } from 'react';
import { sound } from '../utils/audio';

export interface InGameTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStep?: number;
  onNavigateToFirstQuest?: () => void;
}

export const InGameTutorialModal: React.FC<InGameTutorialModalProps> = ({
  isOpen,
  onClose,
  onNavigateToFirstQuest,
}) => {
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(false);
  const [testedKey, setTestedKey] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const seen = localStorage.getItem('lembah_tutorial_autoshown');
      setDontShowAgain(seen === 'true');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const keyUpper = e.key.toUpperCase();
      if (['W', 'A', 'S', 'D', 'C', 'R', 'M', 'J', 'O', ' '].includes(keyUpper) || e.key.startsWith('Arrow')) {
        setTestedKey(e.key === ' ' ? 'SPACE' : keyUpper);
        setTimeout(() => setTestedKey(null), 800);
      }

      if (e.key === 'Escape') {
        sound.playMenuSelect();
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('lembah_tutorial_autoshown', 'true');
    }
    sound.playMenuSelect();
    onClose();
  };

  const handleFinishTutorial = () => {
    sound.playSecretFound();
    handleClose();
    if (onNavigateToFirstQuest) {
      onNavigateToFirstQuest();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="in-game-tutorial-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-4 select-none animate-backdrop-fade-in"
      onClick={handleClose}
    >
      <div
        className="relative bg-slate-900 border-2 border-amber-400/90 rounded-2xl sm:rounded-3xl max-w-2xl sm:max-w-3xl w-full max-h-[92vh] flex flex-col shadow-[0_0_50px_rgba(245,158,11,0.25)] text-slate-100 overflow-hidden modal-glow-frame animate-fade-in-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-5 py-3.5 sm:py-4 bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/70 border-b border-amber-500/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/30 shrink-0">
              {/* Custom Help Question Icon */}
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div>
              <span className="text-sm sm:text-base font-bold text-amber-300 uppercase tracking-wider bg-amber-950/80 px-3 py-1 rounded-lg border border-amber-500/40 inline-block shadow-sm">
                PANDUAN KONTROL DAN BERMAIN
              </span>
            </div>
          </div>

          <button
            id="btn-close-tutorial-modal"
            onClick={handleClose}
            aria-label="Tutup Panduan"
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition active:scale-95 cursor-pointer"
          >
            {/* Custom Close Icon */}
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
          {/* Card 1: Cara Berinteraksi dan Mengobrol */}
          <div className="bg-slate-950/75 border border-amber-500/40 rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-rose-500/20 border border-rose-400/40 rounded-xl text-rose-300 shrink-0">
                {/* Custom Chat Message Icon */}
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-amber-200 flex items-center gap-2">
                  <span>Cara Berinteraksi dan Mengobrol dengan Warga</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                    Utama
                  </span>
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Dekati warga desa yang memiliki tanda balon bicara di atas kepala mereka untuk memulai percakapan dan menyelesaikan misi empati.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
                  <span>1. Dekati Warga</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Berjalan mendekat hingga tombol aksi atau lingkaran interaksi muncul.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0"></span>
                  <span>2. Tekan Tombol Aksi</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Tekan tombol SPASI, ENTER, atau E pada keyboard, atau klik langsung warga.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                  <span>3. Layar Sentuh HP</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Sentuh tombol bulat Bicara atau Aksi di sudut kanan bawah layar.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Keyboard Tester Banner */}
          <div className="bg-slate-950/80 p-3 sm:p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                {/* Custom Gamepad Icon */}
                <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="6" y1="12" x2="10" y2="12" />
                  <line x1="8" y1="10" x2="8" y2="14" />
                  <line x1="15" y1="13" x2="15.01" y2="13" />
                  <line x1="18" y1="11" x2="18.01" y2="11" />
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                </svg>
                <span>Daftar Pintasan Tombol Keyboard dan Mouse</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Uji coba menekan tombol keyboard di perangkat Anda:
              </p>
            </div>
            {testedKey && (
              <div className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-mono font-bold text-xs animate-bounce shadow">
                Tombol: {testedKey}
              </div>
            )}
          </div>

          {/* Keyboard Shortcuts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
              <span className="text-slate-300">Bergerak atau Melangkah</span>
              <span className="font-mono bg-slate-800 px-2.5 py-0.5 rounded text-amber-300 border border-slate-700 font-bold">
                WASD atau Panah Arah
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
              <span className="text-slate-300">Bicara, Interaksi, Lanjut Dialog</span>
              <span className="font-mono bg-slate-800 px-2.5 py-0.5 rounded text-amber-300 border border-slate-700 font-bold">
                SPASI, ENTER, atau E
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
              <span className="text-slate-300">Nyalakan atau Matikan Kompas Hati</span>
              <span className="font-mono bg-slate-800 px-2.5 py-0.5 rounded text-amber-300 border border-slate-700 font-bold">
                Tombol C
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
              <span className="text-slate-300">Studio Regulasi Emosi (Latihan)</span>
              <span className="font-mono bg-slate-800 px-2.5 py-0.5 rounded text-cyan-300 border border-slate-700 font-bold">
                Tombol R
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
              <span className="text-slate-300">Buka atau Tutup Peta Lembah</span>
              <span className="font-mono bg-slate-800 px-2.5 py-0.5 rounded text-amber-300 border border-slate-700 font-bold">
                Tombol M
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
              <span className="text-slate-300">Buka Jurnal Petualang dan Tas</span>
              <span className="font-mono bg-slate-800 px-2.5 py-0.5 rounded text-amber-300 border border-slate-700 font-bold">
                Tombol J
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
              <span className="text-slate-300">Buka Menu Pengaturan dan Audio</span>
              <span className="font-mono bg-slate-800 px-2.5 py-0.5 rounded text-amber-300 border border-slate-700 font-bold">
                Tombol O
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
              <span className="text-slate-300">Buka Panduan Kontrol Ini</span>
              <span className="font-mono bg-slate-800 px-2.5 py-0.5 rounded text-emerald-300 border border-slate-700 font-bold">
                Tombol H
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
              <span className="text-slate-300">Tutup Jendela atau Menu Jeda</span>
              <span className="font-mono bg-slate-800 px-2.5 py-0.5 rounded text-rose-300 border border-slate-700 font-bold">
                Tombol ESC
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
              <span className="text-slate-300">Jalan Otomatis ke Titik</span>
              <span className="font-mono bg-slate-800 px-2.5 py-0.5 rounded text-amber-300 border border-slate-700 font-bold">
                Klik Kiri Mouse di Lantai
              </span>
            </div>
          </div>

          {/* Mobile Touch Quick Reference */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-amber-300 flex items-center gap-2">
              {/* Custom Smartphone Icon */}
              <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
              <span>Kontrol Layar Sentuh HP dan Tablet</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-300">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <strong>Gerak:</strong> Tarik Analog di sudut kiri bawah layar atau ketuk lantai langsung.
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <strong>Bicara:</strong> Ketuk tombol bulat Bicara atau Aksi di sudut kanan bawah layar.
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <strong>Menu:</strong> Sentuh ikon Kompas, Jurnal, Peta, atau Pengaturan di bilah atas layar.
              </div>
            </div>
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <div className="px-4 sm:px-6 py-3 bg-slate-950/95 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Checkbox: Don't show again automatically */}
          <label className="flex items-center gap-2 text-[11px] text-slate-400 cursor-pointer self-start sm:self-auto hover:text-slate-200 transition">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => {
                setDontShowAgain(e.target.checked);
                localStorage.setItem('lembah_tutorial_autoshown', e.target.checked ? 'true' : 'false');
              }}
              className="w-3.5 h-3.5 rounded bg-slate-800 border-slate-600 text-amber-500 focus:ring-amber-400"
            />
            <span>Jangan buka otomatis saat petualangan baru dimulai</span>
          </label>

          {/* Action Button */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              id="btn-finish-tutorial"
              onClick={handleFinishTutorial}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-slate-950 font-extrabold text-xs shadow-lg transition-transform duration-75 flex items-center gap-2 cursor-pointer border border-emerald-300 touch-manipulation"
            >
              {/* Custom Checkmark Icon */}
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <span>Saya Paham dan Siap Bermain!</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
