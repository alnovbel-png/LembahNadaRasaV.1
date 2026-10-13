import React, { useState, useEffect } from 'react';
import { useLanguage } from '../game/localization';
import { MissionStepData } from './MissionNotificationModal';

export interface MissionLoadingScreenProps {
  isOpen: boolean;
  mission: MissionStepData;
  onComplete: () => void;
  isNewUnlock?: boolean;
}

/* Custom Hand-Crafted Adventure Quest Scroll SVG */
const QuestScrollSvg: React.FC<{ className?: string }> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className} aria-hidden="true">
    {/* Outer Aura Glow */}
    <circle cx="50" cy="50" r="42" fill="#f59e0b" opacity="0.15" className="animate-pulse" />

    {/* Scroll Back Layer */}
    <path
      d="M24 22C24 18 28 15 32 15H72C76 15 80 18 80 22V74C80 78 76 81 72 81H32C28 81 24 78 24 74V22Z"
      fill="#fef3c7"
      stroke="#b45309"
      strokeWidth="2.5"
    />

    {/* Scroll Curled Tops */}
    <path
      d="M20 22C20 17 24 13 29 13H33C28 13 25 17 25 22V74C25 79 28 83 33 83H29C24 83 20 79 20 74V22Z"
      fill="#fde68a"
      stroke="#b45309"
      strokeWidth="2"
    />
    <path
      d="M71 13C76 13 80 17 80 22V74C80 79 76 83 71 83H75C80 83 84 79 84 74V22C84 17 80 13 75 13H71Z"
      fill="#fde68a"
      stroke="#b45309"
      strokeWidth="2"
    />

    {/* Ink Manuscript Lines */}
    <line x1="34" y1="28" x2="68" y2="28" stroke="#92400e" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="34" y1="36" x2="64" y2="36" stroke="#b45309" strokeWidth="2" strokeLinecap="round" />
    <line x1="34" y1="44" x2="66" y2="44" stroke="#b45309" strokeWidth="2" strokeLinecap="round" />
    <line x1="34" y1="52" x2="56" y2="52" stroke="#b45309" strokeWidth="2" strokeLinecap="round" />

    {/* Royal Wax Seal */}
    <circle cx="52" cy="65" r="11" fill="#e11d48" stroke="#9f1239" strokeWidth="2" />
    <circle cx="52" cy="65" r="7.5" fill="#be123c" />
    {/* Inner Star Stamp */}
    <path d="M52 60L53.5 63.5L57 65L53.5 66.5L52 70L50.5 66.5L47 65L50.5 63.5Z" fill="#fef124" />

    {/* Ribbon Tails */}
    <path d="M47 74L44 84L49 81L53 84L51 74" fill="#9f1239" />
  </svg>
);

/* Custom Hand-Crafted Compass Pin Mark SVG */
const CompassPinSvg: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z"
      fill="#e11d48"
      stroke="#881337"
      strokeWidth="1.5"
    />
    <circle cx="12" cy="9" r="3" fill="#ffffff" />
  </svg>
);

export const MissionLoadingScreen: React.FC<MissionLoadingScreenProps> = ({
  isOpen,
  mission,
  onComplete,
  isNewUnlock = true,
}) => {
  const { lang } = useLanguage();
  const [progress, setProgress] = useState<number>(0);
  const [loadingText, setLoadingText] = useState<string>('Menyiapkan catatan petualangan...');

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      return;
    }

    setProgress(0);

    const stepsText = lang === 'en'
      ? [
          'Reviewing adventure records...',
          'Pinning target location on village map...',
          'Aligning mission guidance...',
          'Mission guide ready!'
        ]
      : [
          'Menyiapkan catatan petualangan...',
          'Menandai titik lokasi pada peta desa...',
          'Menyelaraskan petunjuk tujuan...',
          'Panduan misi siap dibuka!'
        ];

    const startTime = Date.now();
    const duration = 1600; // 1.6s for brisk and punchy mobile gameplay

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      const idx = Math.min(stepsText.length - 1, Math.floor((pct / 100) * stepsText.length));
      setLoadingText(stepsText[idx]);

      if (pct >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          onComplete();
        }, 260);
      }
    }, 40);

    return () => {
      clearInterval(timer);
    };
  }, [isOpen, onComplete, lang]);

  if (!isOpen) return null;

  return (
    <div
      id="mission-loading-screen"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/90 backdrop-blur-md select-none animate-fade-in"
      style={{
        backgroundImage: 'radial-gradient(circle at 50% 45%, rgba(69, 26, 3, 0.6) 0%, rgba(2, 6, 23, 0.98) 100%)',
      }}
    >
      <div
        className="relative z-10 w-full max-w-md bg-gradient-to-b from-amber-950/90 via-slate-900 to-slate-950 border-2 sm:border-3 border-amber-500/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_16px_50px_rgba(0,0,0,0.85),0_0_25px_rgba(245,158,11,0.35)] flex flex-col items-center text-center animate-scale-up"
      >
        {/* Top Mission Step Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-600 text-white font-pixel text-[9.5px] sm:text-xs font-black tracking-wider uppercase shadow-sm border border-rose-300">
          <span>
            {isNewUnlock
              ? (lang === 'en' ? 'NEW MISSION UNLOCKED' : 'MISI BARU TERSEDIA')
              : (lang === 'en' ? 'MISSION GUIDANCE' : 'PANDUAN MISI')}
          </span>
        </div>

        {/* Scroll Visual */}
        <div className="my-2 sm:my-3 relative">
          <div className="absolute inset-0 rounded-full bg-amber-500/25 blur-lg scale-110 animate-pulse" />
          <QuestScrollSvg className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-[0_4px_12px_rgba(245,158,11,0.6)]" />
        </div>

        {/* Mission Step & Title */}
        <div className="text-amber-400 font-pixel text-xs sm:text-sm font-bold tracking-wide">
          {lang === 'en'
            ? `Step ${mission.step} of ${mission.total}`
            : `Langkah ${mission.step} dari ${mission.total}`}
        </div>

        <h3 className="font-pixel text-base sm:text-lg font-black text-amber-100 mt-0.5 leading-snug">
          {mission.title || (lang === 'en' ? 'Mystery of the Harmony Clock' : 'Misteri Jam Harmoni')}
        </h3>

        {/* Location & Target Info */}
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-200 font-pixel text-[11px] sm:text-xs">
          <CompassPinSvg className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span className="truncate max-w-[260px]">
            {mission.locationName ? `${mission.locationName} • ${mission.speaker}` : mission.hint}
          </span>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full mt-3.5 sm:mt-4 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-pixel font-bold text-amber-300 px-1">
            <span className="text-amber-200/90">{loadingText}</span>
            <span className="font-mono text-amber-300">{progress}%</span>
          </div>

          <div className="w-full h-3 sm:h-3.5 bg-slate-950/80 rounded-full p-0.5 border border-amber-600/60 shadow-inner overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 transition-all duration-100 shadow-[0_0_10px_rgba(245,158,11,0.8)] relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse"
                style={{ animationDuration: '1s' }}
              />
            </div>
          </div>
        </div>

        {/* Fast Action Button */}
        {progress >= 25 && (
          <button
            type="button"
            onClick={onComplete}
            className="mt-3.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-slate-950 font-pixel text-xs font-black shadow-md border border-amber-300 transition-all cursor-pointer"
          >
            {lang === 'en' ? 'Open Mission Guide' : 'Buka Panduan Misi'}
          </button>
        )}
      </div>
    </div>
  );
};
