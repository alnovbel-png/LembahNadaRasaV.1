import React, { useState, useEffect } from 'react';
import { useLanguage } from '../game/localization';

export interface PrologueLoadingScreenProps {
  isOpen: boolean;
  onComplete: () => void;
  playerName?: string;
  playerAvatar?: 'boy' | 'girl';
}

/* Custom Hand-Crafted Enchanted Compass and Clockwork Crest */
const EnchantedStoryCompassSvg: React.FC<{ className?: string }> = ({ className = 'w-20 h-20' }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className} aria-hidden="true">
    {/* Outer Glow Halo */}
    <circle cx="50" cy="50" r="46" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" className="animate-spin" style={{ animationDuration: '24s' }} />
    <circle cx="50" cy="50" r="41" stroke="#fbbf24" strokeWidth="2.5" opacity="0.8" />
    <circle cx="50" cy="50" r="38" fill="#1e1b4b" stroke="#d97706" strokeWidth="1.5" />

    {/* Cardinal Star Marks */}
    <path d="M50 14L53 23L50 25L47 23Z" fill="#fbbf24" />
    <path d="M50 86L53 77L50 75L47 77Z" fill="#fbbf24" />
    <path d="M14 50L23 47L25 50L23 53Z" fill="#fbbf24" />
    <path d="M86 50L77 47L75 50L77 53Z" fill="#fbbf24" />

    {/* Runic Clockwork Gear Teeth */}
    <g stroke="#f59e0b" strokeWidth="1" opacity="0.5">
      <line x1="50" y1="12" x2="50" y2="16" />
      <line x1="50" y1="84" x2="50" y2="88" />
      <line x1="12" y1="50" x2="16" y2="50" />
      <line x1="84" y1="50" x2="88" y2="50" />
      <line x1="23" y1="23" x2="26" y2="26" />
      <line x1="77" y1="77" x2="74" y2="74" />
      <line x1="77" y1="23" x2="74" y2="26" />
      <line x1="23" y1="77" x2="26" y2="74" />
    </g>

    {/* Inner Mystic Dial */}
    <circle cx="50" cy="50" r="26" fill="#0f172a" stroke="#fbbf24" strokeWidth="1.5" />

    {/* Swaying Compass Needle */}
    <g className="origin-center animate-pulse" style={{ transformOrigin: '50px 50px' }}>
      {/* North Gold Pointer */}
      <polygon points="50,23 55,50 50,47 45,50" fill="#f59e0b" stroke="#fef3c7" strokeWidth="0.8" />
      {/* South Twilight Pointer */}
      <polygon points="50,77 55,50 50,53 45,50" fill="#38bdf8" stroke="#bae6fd" strokeWidth="0.8" />
    </g>

    {/* Center Heart Gem Crystal */}
    <circle cx="50" cy="50" r="5" fill="#f43f5e" stroke="#ffe4e6" strokeWidth="1" />
    <circle cx="49" cy="49" r="1.5" fill="#ffffff" />
  </svg>
);

/* Custom Sparkle Star SVG */
const SparkleStarSvg: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 2L14.2 9.8L22 12L14.2 14.2L12 22L9.8 14.2L2 12L9.8 9.8L12 2Z" />
  </svg>
);

/* Custom Scroll Bookmark SVG */
const ScrollBookmarkSvg: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" fill="#78350f" stroke="#fbbf24" />
    <path d="M6 6h10" stroke="#fef3c7" />
    <path d="M6 10h10" stroke="#fef3c7" />
  </svg>
);

export const PrologueLoadingScreen: React.FC<PrologueLoadingScreenProps> = ({
  isOpen,
  onComplete,
  playerName = 'Petualang',
  playerAvatar = 'boy',
}) => {
  const { lang } = useLanguage();
  const [progress, setProgress] = useState<number>(0);
  const [phaseText, setPhaseText] = useState<string>('Membuka gerbang lembah...');

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      return;
    }

    setProgress(0);

    const phases = lang === 'en'
      ? [
          'Opening the valley gates...',
          'Attuning the Compass of Hearts...',
          'Uncovering the story prologue...',
          'Ready to enter the story...'
        ]
      : [
          'Membuka gerbang lembah...',
          'Menyelaraskan Pusaka Kompas Hati...',
          'Menyingkap kisah prolog cerita...',
          'Siap memasuki petualangan...'
        ];

    const startTime = Date.now();
    const duration = 2100; // 2.1 seconds for smooth cinematic pace

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      const phaseIdx = Math.min(phases.length - 1, Math.floor((pct / 100) * phases.length));
      setPhaseText(phases[phaseIdx]);

      if (pct >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          onComplete();
        }, 320);
      }
    }, 45);

    return () => {
      clearInterval(timer);
    };
  }, [isOpen, onComplete, lang]);

  if (!isOpen) return null;

  return (
    <div
      id="prologue-loading-screen"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/95 backdrop-blur-md select-none animate-fade-in"
      style={{
        backgroundImage: 'radial-gradient(circle at 50% 40%, rgba(30, 27, 75, 0.75) 0%, rgba(2, 6, 23, 0.98) 100%)',
      }}
    >
      {/* Ambient Celestial Glow Rings */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-30">
        <div className="w-[500px] h-[500px] rounded-full border border-amber-500/20 animate-spin" style={{ animationDuration: '40s' }} />
        <div className="w-[700px] h-[700px] rounded-full border border-sky-400/10 animate-spin" style={{ animationDuration: '60s', animationDirection: 'reverse' }} />
      </div>

      {/* Main Loading Card Plaque */}
      <div
        className="relative z-10 w-full max-w-lg bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 border-2 sm:border-3 border-amber-500/70 rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(245,158,11,0.25)] flex flex-col items-center text-center animate-scale-up"
      >
        {/* Top Story Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-pixel text-[10px] sm:text-xs font-bold tracking-wider uppercase shadow-sm">
          <SparkleStarSvg className="w-3 h-3 text-amber-400" />
          <span>{lang === 'en' ? 'STORY PROLOGUE' : 'PROLOG CERITA'}</span>
          <SparkleStarSvg className="w-3 h-3 text-amber-400" />
        </div>

        {/* Compass Visual Icon */}
        <div className="my-2 sm:my-3 relative">
          <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-xl scale-125 animate-pulse" />
          <EnchantedStoryCompassSvg className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-[0_4px_12px_rgba(245,158,11,0.5)]" />
        </div>

        {/* Narrative Title & Subtitle */}
        <h2 className="font-pixel text-base sm:text-xl font-black text-amber-200 tracking-wide drop-shadow-sm">
          {lang === 'en' ? 'Entering Harmony Valley' : 'Menuju Lembah Harmoni'}
        </h2>

        <p
          style={{ fontFamily: "'Galindo', cursive, sans-serif" }}
          className="text-xs sm:text-sm text-amber-100/90 mt-1 sm:mt-1.5 max-w-md leading-relaxed"
        >
          {lang === 'en'
            ? `Follow the trail of the ancient Clock Tower alongside ${playerName} and unlock the secret of the Compass of Hearts.`
            : `Menyusuri jejak Menara Jam bersama ${playerName} dan mengungkap pusaka Kompas Hati di tengah kabut kelabu.`}
        </p>

        {/* Progress Bar Container */}
        <div className="w-full mt-3.5 sm:mt-4 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-pixel font-bold text-amber-300 px-1">
            <span className="flex items-center gap-1 text-amber-200/90">
              <ScrollBookmarkSvg className="w-3.5 h-3.5 text-amber-400" />
              <span>{phaseText}</span>
            </span>
            <span className="font-mono text-amber-300">{progress}%</span>
          </div>

          <div className="w-full h-3 sm:h-3.5 bg-slate-950/80 rounded-full p-0.5 border border-amber-600/60 shadow-inner overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 transition-all duration-100 shadow-[0_0_12px_rgba(251,191,36,0.8)] relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              {/* Animated Light Sweep Effect */}
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse"
                style={{ animationDuration: '1.2s' }}
              />
            </div>
          </div>
        </div>

        {/* Helpful Tip Footer */}
        <div className="mt-3 sm:mt-4 p-2 sm:p-2.5 rounded-xl bg-amber-950/40 border border-amber-600/30 text-amber-200/80 font-pixel text-[10px] sm:text-[11px] flex items-center gap-2 text-left w-full">
          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 shadow-[0_0_6px_#fbbf24]" />
          <p className="leading-tight">
            {lang === 'en'
              ? 'Wisdom Tip: Pay attention to the colors of the valley and listen deeply with empathy.'
              : 'Petunjuk Bijak: Perhatikan warna kabut di sekitarmu dan dengarkan kata hati warga desa dengan penuh empati.'}
          </p>
        </div>

        {/* Skip or Fast-forward Button */}
        {progress >= 30 && (
          <button
            type="button"
            onClick={onComplete}
            className="mt-3 px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-slate-950 font-pixel text-xs font-black shadow-md border border-amber-300 transition-all cursor-pointer"
          >
            {lang === 'en' ? 'Start Story Now' : 'Mulai Cerita Sekarang'}
          </button>
        )}
      </div>
    </div>
  );
};
