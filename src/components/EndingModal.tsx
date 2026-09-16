import React, { useState } from 'react';
import { Award, RotateCcw, Sparkles, Heart, CheckCircle, Download, Compass, X } from 'lucide-react';
import { PlayerStats } from '../types/game';

interface EndingModalProps {
  isOpen: boolean;
  onRestart: () => void;
  onFreeRoam: () => void;
  stats: PlayerStats;
  branchTag?: string;
  endingType: 'perfect' | 'resilient';
}

export const EndingModal: React.FC<EndingModalProps> = ({
  isOpen,
  onRestart,
  onFreeRoam,
  stats,
  branchTag,
  endingType,
}) => {
  const [studentName, setStudentName] = useState('Petualang Cilik');

  if (!isOpen) return null;

  const isPerfect = endingType === 'perfect';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-3 overflow-y-auto">
      <div className="bg-slate-900 border-2 border-amber-400 rounded-2xl max-w-xl w-full p-6 text-center shadow-2xl text-slate-100 relative my-auto">
        {/* Close / Free Roam Quick Dismiss Button */}
        <button
          id="close-ending-modal-btn"
          onClick={onFreeRoam}
          title="Tutup & Masuk Mode Jelajah Bebas"
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-100 border border-slate-700 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Glow decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-amber-500/20 blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold mb-3 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Misi Selesai: Harmoni Lembah Pulih 100%!</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-amber-300 mb-2">
          {isPerfect
            ? '🏆 Akhir Kisah: Harmoni Sejati Lembah Nada Rasa'
            : '🌟 Akhir Kisah: Langkah Awal Saling Memahami'}
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 mb-5 leading-relaxed max-w-lg mx-auto">
          {isPerfect
            ? 'Kabut abu-abu lenyap total! Air mancur kembali memancar jernih, bunga bermekaran, dan lonceng jam kuno berdenting hangat mempersatukan warga desa.'
            : 'Warga desa mulai meletakkan prasangka mereka dan berani berbicara dengan jujur. Lembah kembali hidup dalam kedamaian!'}
        </p>

        {/* Certificate Card */}
        <div
          id="certificate-box"
          className="bg-amber-950/20 border-2 border-amber-400/80 rounded-xl p-5 mb-5 text-left relative overflow-hidden shadow-inner"
        >
          <div className="text-center border-b border-amber-400/30 pb-3 mb-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400/90 block">
              Kementerian Kebijaksanaan Lembah Nada Rasa
            </span>
            <h3 className="text-lg font-bold text-amber-300">
              SERTIFIKAT KELULUSAN DUTA EMPATI KELAS 4 SD
            </h3>
          </div>

          <div className="space-y-2 text-xs text-slate-200">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-semibold">
                Diberikan dengan bangga kepada:
              </label>
              <input
                type="text"
                id="student-name-input"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full bg-slate-900/80 border border-amber-400/60 rounded px-3 py-1.5 text-sm font-bold text-amber-200 focus:outline-none focus:ring-1 focus:ring-amber-400"
                placeholder="Ketik namamu di sini..."
              />
            </div>

            <div className="pt-2 text-[11px] text-slate-300 leading-relaxed">
              Telah berhasil menguasai 5 Pilar Pembelajaran Sosial Emosional (PSE):
              <ul className="grid grid-cols-2 gap-1.5 mt-2 font-semibold text-amber-200/90">
                <li className="flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Kesadaran Diri (Self-Awareness)
                </li>
                <li className="flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Pengelolaan Diri (Napas 4-4-4)
                </li>
                <li className="flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Kesadaran Sosial & Empati
                </li>
                <li className="flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Keputusan Bertanggung Jawab
                </li>
              </ul>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-700/60 text-[11px]">
              <div>
                <span className="text-slate-400 block">Total Poin Empati:</span>
                <span className="font-bold text-amber-400 text-sm">{stats.empathyScore} Poin</span>
              </div>
              <div>
                <span className="text-slate-400 block">Jalur Keputusan:</span>
                <span className="font-semibold text-cyan-300">
                  {branchTag === 'empathy_first'
                    ? 'Validasi Hati Kakek Ranu'
                    : 'Solusi Logis & Kerjasama'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {/* Free Roam / Jelajah Bebas */}
          <button
            id="free-roam-btn"
            onClick={onFreeRoam}
            className="px-4 sm:px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-950/60 transition border border-emerald-400/40 hover:scale-105 active:scale-95"
          >
            <Compass className="w-4 h-4 text-emerald-200" />
            <span>Mode Jelajah Bebas (Free Roam)</span>
          </button>

          {/* Restart / Mainkan Lagi */}
          <button
            id="restart-game-btn"
            onClick={onRestart}
            className="px-4 sm:px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow transition hover:scale-105 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Coba Bermain Lagi</span>
          </button>

          {/* Print Certificate */}
          <button
            id="print-cert-btn"
            onClick={() => window.print()}
            className="px-3.5 sm:px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm flex items-center gap-2 transition hover:scale-105 active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Cetak Sertifikat</span>
          </button>
        </div>

        <p className="mt-4 text-[11px] text-slate-400">
          💡 <span className="text-emerald-300 font-medium">Mode Jelajah Bebas</span> memungkinkanmu mengelilingi seluruh penjuru desa, bertegur sapa dengan warga, dan menikmati keindahan lembah yang telah pulih.
        </p>
      </div>
    </div>
  );
};
