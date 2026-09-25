import React from 'react';
import { sound } from '../../utils/audio';
import {
  Wind,
  Eye,
  ShieldAlert,
  Zap,
  Sparkles,
  X,
  Play,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

export type RegulationMode = 'breathing' | 'grounding' | 'stop' | 'shakeout';

interface RegulationMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode: (mode: RegulationMode) => void;
  targetName?: string;
}

interface RegulationItem {
  id: RegulationMode;
  number: number;
  title: string;
  subtitle: string;
  category: string;
  description: string;
  mechanics: string;
  icon: React.ReactNode;
  borderTheme: string;
  bgGlow: string;
  btnTheme: string;
  badgeTheme: string;
  duration: string;
}

export const RegulationMenuModal: React.FC<RegulationMenuModalProps> = ({
  isOpen,
  onClose,
  onSelectMode,
  targetName = 'Pemain',
}) => {
  if (!isOpen) return null;

  const isSelfPractice = targetName === 'Pemain' || targetName === 'Karakter Utama';

  const menuItems: RegulationItem[] = [
    {
      id: 'breathing',
      number: 1,
      title: 'Irama Balon Tenang',
      subtitle: 'Napas Berirama 4-4-4',
      category: 'Ritme & Keseimbangan Napas',
      description:
        'Tahan napas tepat 4 detik agar balon menyentuh cincin target, jaga kursor di zona hijau yang bergetar 4 detik, lalu hembuskan perlahan.',
      mechanics: 'Rhythmic Hold · Stabilizer Track · Deflation Timing',
      duration: '4 Detik per Fase',
      icon: <Wind className="w-6 h-6 text-cyan-300" />,
      borderTheme: 'border-cyan-500/40 hover:border-cyan-400',
      bgGlow: 'from-cyan-950/60 to-slate-900',
      btnTheme:
        'bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 text-slate-950 shadow-[0_0_18px_rgba(6,182,212,0.5)]',
      badgeTheme: 'text-cyan-300 bg-cyan-950/80 border-cyan-500/40',
    },
    {
      id: 'grounding',
      number: 2,
      title: 'Kaca Pembesar Indra',
      subtitle: 'Grounding 5-4-3-2-1',
      category: 'Pencarian Objek Bergerak (Hidden Object)',
      description:
        'Kendalikan lensa kaca pembesar untuk menembus kabut kepanikan dan tangkap 5 objek alam yang bergerak cepat sebelum waktu habis.',
      mechanics: 'Spotlight Cursor · Moving Objects · 45s Countdown',
      duration: '5 Objek Tersembunyi',
      icon: <Eye className="w-6 h-6 text-emerald-300" />,
      borderTheme: 'border-emerald-500/40 hover:border-emerald-400',
      bgGlow: 'from-emerald-950/60 to-slate-900',
      btnTheme:
        'bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 shadow-[0_0_18px_rgba(16,185,129,0.5)]',
      badgeTheme: 'text-emerald-300 bg-emerald-950/80 border-emerald-500/40',
    },
    {
      id: 'stop',
      number: 3,
      title: 'Rem Reaksi S-T-O-P',
      subtitle: 'Cegah Respon Impulsif',
      category: 'Quick Time Event & Tracing',
      description:
        'Kejar dan smash tombol STOP merah yang memantul liar di layar! Bekukan waktu lalu tebalkan huruf S, T, O, dan P secara berurutan.',
      mechanics: 'Smash Bouncing Button · Time-Freeze · Letter Tracing',
      duration: '4 Huruf Berurutan',
      icon: <ShieldAlert className="w-6 h-6 text-rose-300" />,
      borderTheme: 'border-rose-500/40 hover:border-rose-400',
      bgGlow: 'from-rose-950/60 to-slate-900',
      btnTheme:
        'bg-gradient-to-r from-rose-500 to-amber-400 hover:from-rose-400 hover:to-amber-300 text-slate-950 shadow-[0_0_18px_rgba(244,63,94,0.5)]',
      badgeTheme: 'text-rose-300 bg-rose-950/80 border-rose-500/40',
    },
    {
      id: 'shakeout',
      number: 4,
      title: 'Pembebas Sulur Ketegangan',
      subtitle: 'Goyang Otot Kinestetik',
      category: 'Alternating Button Mash (L & R)',
      description:
        'Tekan tombol Kiri dan Kanan (A/D) secara bergantian secepat mungkin layaknya membebaskan diri dari efek stun untuk memutuskan 5 sulur stres Kiki.',
      mechanics: 'Rapid L/R Alternation · Tension Vine Break · Kinesthetic',
      duration: '5 Sulur Berduri',
      icon: <Zap className="w-6 h-6 text-purple-300" />,
      borderTheme: 'border-purple-500/40 hover:border-purple-400',
      bgGlow: 'from-purple-950/60 to-slate-900',
      btnTheme:
        'bg-gradient-to-r from-purple-400 to-fuchsia-400 hover:from-purple-300 hover:to-fuchsia-300 text-slate-950 shadow-[0_0_18px_rgba(168,85,247,0.5)]',
      badgeTheme: 'text-purple-300 bg-purple-950/80 border-purple-500/40',
    },
  ];

  const handleChoose = (mode: RegulationMode) => {
    sound.playMenuSelect();
    onSelectMode(mode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-3 sm:p-5 overflow-y-auto animate-backdrop-fade-in">
      <div className="bg-slate-900 border-2 border-amber-400/50 rounded-3xl p-4 sm:p-6 max-w-4xl w-full text-slate-100 relative overflow-hidden shadow-2xl my-auto animate-fade-in-slide-up">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-28 bg-amber-500/15 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 mb-4 relative z-10 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-pixel font-bold tracking-wider text-[10px] sm:text-xs uppercase mb-1">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
              <span>Menu Mini-Game Regulasi Emosi & Ketenangan</span>
            </div>
            <h2 className="text-base sm:text-xl font-pixel font-bold text-white flex flex-wrap items-center gap-2">
              <span>Pilih Teknik Regulasi Ketenangan</span>
              <span
                className="text-[10px] sm:text-xs font-normal text-slate-400"
                style={{ fontFamily: "'Geist Pixel'" }}
              >
                · {isSelfPractice ? 'Latihan Mandiri Pemain' : `Membantu: ${targetName}`}
              </span>
            </h2>
            <p
              className="text-[10px] sm:text-xs text-slate-300 mt-1 font-pixel leading-relaxed"
              style={{ fontFamily: "'Geist Pixel'" }}
            >
              Setiap teknik menyajikan mini-game interaktif tersendiri yang akan ditampilkan secara <strong>fullscreen</strong> dengan rasio dan mekanik aksi dinamis.
            </p>
          </div>

          <button
            id="close-regulation-menu-btn"
            onClick={onClose}
            title="Tutup Menu [Esc]"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-950/80 hover:border-rose-500/50 hover:scale-110 text-slate-400 hover:text-slate-100 border border-slate-700 transition-all duration-200 shrink-0 cursor-pointer active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Grid of 4 Distinct Mini-Game Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 relative z-10 mb-4">
          {menuItems.map((item) => {
            const isBreathing = item.id === 'breathing';
            const isGrounding = item.id === 'grounding';
            const isStop = item.id === 'stop';
            const isShakeout = item.id === 'shakeout';

            return (
              <div
                key={item.id}
                className={`rounded-2xl border-2 bg-gradient-to-br ${item.bgGlow} p-4 flex flex-col justify-between transition-all duration-200 hover:scale-[1.015] hover:shadow-xl relative overflow-hidden group ${item.borderTheme}`}
              >
                <div>
                  {/* Header: Number, Icon, Title, Badge */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-900/90 border border-slate-700 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                        {item.icon}
                      </div>
                      <div>
                        <span className="text-[9px] font-pixel text-slate-400 block uppercase tracking-wider">
                          Mini-Game {item.number}
                        </span>
                        <h3
                          className="font-pixel text-xs sm:text-sm font-bold text-white group-hover:text-amber-200 transition-colors"
                          style={{
                            textAlign: isBreathing || isGrounding ? 'left' : undefined,
                            fontSize: isBreathing ? '14px' : isStop || isShakeout ? '12px' : undefined,
                          }}
                        >
                          {item.title}
                        </h3>
                      </div>
                    </div>

                    <span
                      className={`text-[8.5px] font-pixel px-2 py-0.5 rounded-md border font-semibold shrink-0 ${item.badgeTheme}`}
                    >
                      {item.subtitle}
                    </span>
                  </div>

                  {/* Description */}
                  <p
                    className="font-pixel text-[10px] text-slate-300 leading-relaxed mb-3"
                    style={{
                      fontFamily: isBreathing || isGrounding || isStop || isShakeout ? "'Geist Pixel'" : undefined,
                      fontSize: isBreathing || isGrounding ? '12px' : isStop || isShakeout ? '11px' : undefined,
                      lineHeight: isBreathing
                        ? '15.25px'
                        : isGrounding
                        ? '14.25px'
                        : isStop
                        ? '13.25px'
                        : isShakeout
                        ? '14.25px'
                        : undefined,
                    }}
                  >
                    {item.description}
                  </p>

                  {/* Mechanics Metadata */}
                  <div className="text-[8.5px] font-pixel text-slate-400 bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 mb-3 flex items-center justify-between">
                    <span
                      className="truncate"
                      style={{
                        fontSize: isBreathing || isGrounding ? '8.5px' : isStop || isShakeout ? '7.5px' : undefined,
                        fontFamily: isBreathing || isGrounding || isStop || isShakeout ? "'Geist Pixel'" : undefined,
                      }}
                    >
                      {item.mechanics}
                    </span>
                    <span
                      className="text-amber-300 font-bold shrink-0 ml-2"
                      style={{
                        fontSize: '7.5px',
                      }}
                    >
                      {item.duration}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  id={`btn-play-mini-game-${item.id}`}
                  onClick={() => handleChoose(item.id)}
                  className={`w-full py-2.5 px-4 rounded-xl font-pixel font-bold text-[10px] sm:text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 ${item.btnTheme}`}
                  style={{
                    lineHeight: isStop ? '17px' : undefined,
                  }}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span
                    style={{
                      textAlign: isBreathing || isGrounding || isStop || isShakeout ? 'left' : undefined,
                      fontSize: isBreathing || isGrounding ? '10px' : isStop ? '11px' : isShakeout ? '12px' : undefined,
                    }}
                  >
                    MAINKAN MINI-GAME SECARA FULLSCREEN
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-slate-800/80 text-[10px] font-pixel text-slate-400 relative z-10">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span style={{ fontFamily: "'Geist Pixel'" }}>
              Menyelesaikan mini-game memberikan +25 Skor Empati dan Penguasaan Teknik Ketenangan.
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700 text-[10px]"
          >
            Kembali ke Petualangan Desa
          </button>
        </div>
      </div>
    </div>
  );
};
