import React from 'react';
import { CharacterPortrait } from './CharacterPortrait';

export interface MissionStepData {
  step: number;
  total: number;
  badge: string;
  title: string;
  speaker: string;
  portrait: string;
  hint: string;
  locationName: string;
  targetCoords: { x: number; y: number };
  isCompleted: boolean;
}

interface MissionNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  mission: MissionStepData;
  onNavigateToTarget: (tileX: number, tileY: number) => void;
  isNewUnlock?: boolean;
}

// Custom hand-drawn pixel SVGs (No prebuilt icon libraries, harmonious palette)
const CustomCloseIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg viewBox="0 0 16 16" fill="none" className={className} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M4 4L12 12M12 4L4 12" />
  </svg>
);

const CustomCheckIcon: React.FC<{ className?: string }> = ({ className = 'w-2.5 h-2.5' }) => (
  <svg viewBox="0 0 16 16" fill="none" className={className}>
    <circle cx="8" cy="8" r="6.5" fill="#059669" stroke="#047857" strokeWidth="1.5" />
    <path d="M5 8.2L7 10.2L11 5.8" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CustomLockIcon: React.FC<{ className?: string }> = ({ className = 'w-2 h-2' }) => (
  <svg viewBox="0 0 16 16" fill="none" className={className}>
    <path d="M5 7V5C5 3.34 6.34 2 8 2C9.66 2 11 3.34 11 5V7" stroke="#78350f" strokeWidth="1.5" strokeLinecap="round" />
    <rect x="4" y="6.5" width="8" height="6.5" rx="1.5" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
    <circle cx="8" cy="9.5" r="1" fill="#fef3c7" />
  </svg>
);

export const MissionNotificationModal: React.FC<MissionNotificationModalProps> = ({
  isOpen,
  onClose,
  mission,
  onNavigateToTarget,
  isNewUnlock = false,
}) => {
  if (!isOpen) return null;

  const steps = [
    { num: 1, title: 'Pegas Jam', char: 'Kiki' },
    { num: 2, title: 'Poros Jam', char: 'Kakek Ranu' },
    { num: 3, title: 'Roda Gigi', char: 'Bimo' },
    { num: 4, title: '12 Komponen Jam', char: 'Kumpulkan 12 Komponen' },
  ];

  // Target character configuration for missions 1 to 5
  const getTargetInfo = () => {
    switch (mission.step) {
      case 1:
        return {
          sprite: mission.portrait || 'squirrel',
          name: mission.speaker || 'Kiki Si Tupai',
        };
      case 2:
        return {
          sprite: mission.portrait || 'old_man',
          name: mission.speaker || 'Kakek Ranu',
        };
      case 3:
        return {
          sprite: mission.portrait || 'boy_glasses',
          name: mission.speaker || 'Bimo',
        };
      case 4:
        return {
          sprite: mission.portrait || 'girl_counselor',
          name: mission.speaker || 'Warga Desa (12 Komponen Jam)',
        };
      case 5:
      default:
        return {
          sprite: mission.portrait || 'player',
          name: mission.speaker || 'Ezsel & Warga Desa',
        };
    }
  };

  const targetCharacter = getTargetInfo();

  return (
    <div
      id="mission-notification-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in mission-modal-overlay"
      onClick={onClose}
    >
      <div
        id="mission-notification-card"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-gradient-to-b from-amber-300 via-amber-200 to-amber-100 border-2 sm:border-4 border-amber-600 rounded-2xl sm:rounded-3xl p-2.5 sm:p-5 shadow-[0_16px_48px_rgba(245,158,11,0.6),0_0_0_3px_rgba(255,255,255,0.95)] text-slate-950 font-pixel flex flex-col gap-2 sm:gap-3 relative animate-scale-up select-none max-h-[92vh] overflow-y-auto mission-modal-card"
      >
        {/* Dedicated Top Row: Badges on left, Exit button on right */}
        <div className="flex items-center justify-between gap-2 pb-1 sm:pb-2 border-b border-amber-500/30 mission-modal-top-row">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
            <span className="bg-rose-600 text-white font-black text-[9px] sm:text-xs px-2 sm:px-2.5 py-0.5 rounded-full border border-rose-300 shadow-sm uppercase tracking-wider whitespace-nowrap mission-badge-tag">
              {isNewUnlock ? 'MISI BARU' : 'PANDUAN MISI'}
            </span>
            <span
              style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
              className="text-[9.5px] sm:text-[11px] font-bold text-amber-950 bg-amber-400/80 px-2 sm:px-2.5 py-0.5 rounded-full border border-amber-600/40 whitespace-nowrap mission-badge-step"
            >
              Langkah {mission.step} dari {mission.total}
            </span>
          </div>

          <button
            id="close-mission-modal-btn"
            onClick={onClose}
            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-950 text-amber-300 hover:text-white hover:bg-rose-700 active:scale-90 flex items-center justify-center border-2 border-amber-400 shadow-md transition-all cursor-pointer shrink-0 mission-modal-close-btn"
            title="Tutup (ESC)"
          >
            <CustomCloseIcon className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Title & Location */}
        <div className="mission-modal-header-info">
          <h2
            style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
            className="text-xs sm:text-lg md:text-xl font-black text-slate-950 tracking-wide leading-tight mission-modal-title"
          >
            {mission.title}
          </h2>
          <div className="text-[9.5px] sm:text-xs text-amber-900 font-semibold mt-0.5 mission-modal-location">
            <span>Lokasi: <strong>{mission.locationName}</strong></span>
          </div>
        </div>

        {/* Sequential Mission Flow Stepper */}
        <div className="bg-amber-400/40 border-2 border-amber-500/60 rounded-xl sm:rounded-2xl p-1 sm:p-2.5 mission-modal-stepper-box">
          <div className="flex items-center justify-between text-[7.5px] sm:text-[9px] font-bold text-amber-950 mb-1 uppercase tracking-wider mission-modal-stepper-heading">
            <span>Alur Wajib Berurutan:</span>
            <span className="text-[7px] sm:text-[9px] text-amber-900 bg-amber-300/80 px-1.5 py-0.2 rounded font-sans">
              Selesaikan 1 per 1
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1 sm:gap-1.5 mission-modal-steps-grid">
            {steps.map((s) => {
              const isDone = s.num < mission.step;
              const isCurrent = s.num === mission.step;

              return (
                <div
                  key={s.num}
                  className={`flex flex-col items-center justify-center p-1 sm:p-1.5 rounded-lg border text-center transition-all mission-modal-step-item ${
                    isDone
                      ? 'bg-emerald-600/20 border-emerald-600 text-emerald-950'
                      : isCurrent
                      ? 'bg-amber-500 text-slate-950 font-black border-2 border-slate-950 shadow-sm scale-102'
                      : 'bg-amber-200/40 border-amber-400/50 text-amber-900/50 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {isDone ? (
                      <CustomCheckIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                    ) : isCurrent ? (
                      <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-slate-950 text-amber-300 text-[7px] sm:text-[8px] flex items-center justify-center font-bold">
                        {s.num}
                      </span>
                    ) : (
                      <CustomLockIcon className="w-2 h-2 sm:w-2.5 sm:h-2.5 shrink-0" />
                    )}
                    <span className="text-[7px] sm:text-[9px] font-black">
                      M{s.num}
                    </span>
                  </div>
                  <span className="text-[6.5px] sm:text-[8px] truncate max-w-full font-sans mt-0.5 font-medium leading-tight">
                    {s.char}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Box: Character & Instructions */}
        <div className="bg-white/95 border-2 border-amber-500 rounded-xl sm:rounded-2xl p-2 sm:p-3.5 shadow-inner flex items-start gap-2 sm:gap-4 mission-modal-content-box">
          <div className="shrink-0 flex flex-col items-center gap-1 min-w-[52px] sm:min-w-[80px] max-w-[68px] sm:max-w-[84px] mission-modal-char-col">
            <div className="p-0.5 sm:p-1 rounded-xl bg-amber-100 border-2 border-amber-400 shadow-sm flex items-center justify-center mission-modal-char-avatar">
              <CharacterPortrait
                sprite={targetCharacter.sprite}
                size="sm"
                isResolved={mission.step >= 4 && mission.isCompleted}
              />
            </div>
            <span
              style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
              className="text-[9px] sm:text-xs font-bold text-slate-900 text-center leading-tight mission-modal-char-name"
            >
              {targetCharacter.name}
            </span>
          </div>

          <div className="flex-1 flex flex-col gap-1 sm:gap-1.5 min-w-0 mission-modal-text-col">
            <span className="text-[7.5px] sm:text-[9px] font-bold text-rose-700 uppercase tracking-wide">
              {mission.step <= 4 ? `Target ${mission.step}:` : 'Status:'}
            </span>
            <p
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              className="text-slate-900 font-semibold text-[11px] sm:text-[12px] leading-snug sm:leading-relaxed break-words mission-modal-hint-text"
            >
              {mission.hint}
            </p>
            <div className="text-[7.5px] sm:text-[9px] text-amber-800 bg-amber-50 rounded-lg p-1 sm:p-1.5 border border-amber-200 flex items-center gap-1 mt-0.5 mission-modal-tip-box">
              <span className="text-amber-700 font-bold shrink-0">Tips:</span>
              <span
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 'bold' }}
                className="text-[10px] sm:text-[11px] leading-snug"
              >
                {mission.step <= 4 ? (
                  <>Ikuti panah kuning menuju {targetCharacter.name}.</>
                ) : (
                  <>Desa sudah pulih! Ayo sapa semua temanmu.</>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Equal size & tidy symmetrical layout */}
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2.5 pt-0.5 sm:pt-1 w-full mission-modal-actions-row">
          <button
            id="navigate-to-mission-btn"
            onClick={() => {
              onClose();
              onNavigateToTarget(mission.targetCoords.x, mission.targetCoords.y);
            }}
            className="w-full py-1.5 sm:py-2.5 px-2 sm:px-4 min-h-[34px] sm:min-h-[44px] rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-600 hover:from-emerald-500 hover:to-green-500 active:scale-[0.98] text-white font-bold border-2 border-emerald-300 shadow-[0_4px_16px_rgba(16,185,129,0.35)] flex items-center justify-center cursor-pointer transition-all text-center mission-modal-btn"
          >
            <span className="text-[10px] sm:text-xs tracking-wide">Tuntun Karakter</span>
          </button>

          <button
            id="explore-myself-btn"
            onClick={onClose}
            className="w-full py-1.5 sm:py-2.5 px-2 sm:px-4 min-h-[34px] sm:min-h-[44px] rounded-xl sm:rounded-2xl bg-slate-950 hover:bg-slate-900 active:scale-[0.98] text-amber-300 font-bold border-2 border-amber-400 shadow-md flex items-center justify-center cursor-pointer transition-all text-center mission-modal-btn"
          >
            <span className="text-[10px] sm:text-xs tracking-wide">Saya Cari Sendiri</span>
          </button>
        </div>
      </div>
    </div>
  );
};
