import React from 'react';
import { CheckCircle2, Lock, X } from 'lucide-react';
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

export const MissionNotificationModal: React.FC<MissionNotificationModalProps> = ({
  isOpen,
  onClose,
  mission,
  onNavigateToTarget,
  isNewUnlock = false,
}) => {
  if (!isOpen) return null;

  const steps = [
    { num: 1, title: 'Alun-Alun', char: 'Kiki' },
    { num: 2, title: 'Jembatan', char: 'Kakek Ranu' },
    { num: 3, title: 'Hutan Sunyi', char: 'Bimo' },
    { num: 4, title: 'Menara Jam', char: 'Sosok Kabut' },
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
          sprite: mission.portrait || 'spirit_elder',
          name: mission.speaker || 'Sosok Kabut',
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        id="mission-notification-card"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-gradient-to-b from-amber-300 via-amber-200 to-amber-100 border-3 sm:border-4 border-amber-600 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-[0_16px_48px_rgba(245,158,11,0.6),0_0_0_3px_rgba(255,255,255,0.95)] text-slate-950 font-pixel flex flex-col gap-2.5 sm:gap-3 relative animate-scale-up select-none max-h-[92vh] overflow-y-auto"
      >
        {/* Dedicated Top Row: Badges on left, Exit button on right (No overlapping!) */}
        <div className="flex items-center justify-between gap-2 pb-1.5 sm:pb-2 border-b border-amber-500/30">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
            <span className="bg-rose-600 text-white font-black text-[9px] sm:text-xs px-2 sm:px-2.5 py-0.5 rounded-full border border-rose-300 shadow-sm uppercase tracking-wider whitespace-nowrap">
              {isNewUnlock ? 'MISI BARU' : 'PANDUAN MISI'}
            </span>
            <span
              style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
              className="text-[10px] sm:text-[11px] font-bold text-amber-950 bg-amber-400/80 px-2 sm:px-2.5 py-0.5 rounded-full border border-amber-600/40 whitespace-nowrap"
            >
              Langkah {mission.step} dari {mission.total}
            </span>
          </div>

          <button
            id="close-mission-modal-btn"
            onClick={onClose}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-950 text-amber-300 hover:text-white hover:bg-rose-700 active:scale-90 flex items-center justify-center border-2 border-amber-400 shadow-md transition-all cursor-pointer shrink-0"
            title="Tutup (ESC)"
          >
            <X className="w-4 h-4 font-bold" />
          </button>
        </div>

        {/* Title & Location (Text-only, clean) */}
        <div>
          <h2
            style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
            className="text-sm sm:text-lg md:text-xl font-black text-slate-950 tracking-wide leading-tight"
          >
            {mission.title}
          </h2>
          <div className="text-[10px] sm:text-xs text-amber-900 font-semibold mt-0.5">
            <span>Lokasi: <strong>{mission.locationName}</strong></span>
          </div>
        </div>

        {/* Sequential Mission Flow Stepper (Alur Berurutan) */}
        <div className="bg-amber-400/40 border-2 border-amber-500/60 rounded-xl sm:rounded-2xl p-1.5 sm:p-2.5">
          <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-bold text-amber-950 mb-1 uppercase tracking-wider">
            <span>Alur Wajib Berurutan:</span>
            <span className="text-[7px] sm:text-[9px] text-amber-900 bg-amber-300/80 px-1.5 py-0.2 rounded font-sans">
              Selesaikan 1 per 1
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1 sm:gap-1.5">
            {steps.map((s) => {
              const isDone = s.num < mission.step;
              const isCurrent = s.num === mission.step;

              return (
                <div
                  key={s.num}
                  className={`flex flex-col items-center justify-center p-1 sm:p-1.5 rounded-lg border text-center transition-all ${
                    isDone
                      ? 'bg-emerald-600/20 border-emerald-600 text-emerald-950'
                      : isCurrent
                      ? 'bg-amber-500 text-slate-950 font-black border-2 border-slate-950 shadow-sm scale-102'
                      : 'bg-amber-200/40 border-amber-400/50 text-amber-900/50 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {isDone ? (
                      <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-700 shrink-0" />
                    ) : isCurrent ? (
                      <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-slate-950 text-amber-300 text-[7px] sm:text-[8px] flex items-center justify-center font-bold">
                        {s.num}
                      </span>
                    ) : (
                      <Lock className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-amber-900/50 shrink-0" />
                    )}
                    <span className="text-[7px] sm:text-[9px] font-black">
                      Misi {s.num}
                    </span>
                  </div>
                  <span className="text-[7px] sm:text-[8px] truncate max-w-full font-sans mt-0.5 font-medium leading-tight">
                    {s.char}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Box: Character & Instructions */}
        <div className="bg-white/95 border-2 border-amber-500 rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 shadow-inner flex items-start gap-2.5 sm:gap-4">
          <div className="shrink-0 flex flex-col items-center gap-1 min-w-[60px] sm:min-w-[80px] max-w-[76px] sm:max-w-[84px]">
            <div className="p-1 rounded-xl bg-amber-100 border-2 border-amber-400 shadow-sm flex items-center justify-center">
              <CharacterPortrait
                sprite={targetCharacter.sprite}
                size="sm"
                isResolved={mission.step >= 4 && mission.isCompleted}
              />
            </div>
            <span
              style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
              className="text-[10px] sm:text-xs font-bold text-slate-900 text-center leading-tight"
            >
              {targetCharacter.name}
            </span>
          </div>

          <div className="flex-1 flex flex-col gap-1 sm:gap-1.5 min-w-0">
            <span className="text-[8px] sm:text-[9px] font-bold text-rose-700 uppercase tracking-wide">
              {mission.step <= 4 ? `Target Misi ${mission.step}:` : 'Status Misi:'}
            </span>
            <p
              style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
              className="text-[10px] sm:text-[13px] text-slate-900 font-semibold leading-snug sm:leading-relaxed break-words"
            >
              {mission.hint}
            </p>
            <div className="text-[8px] sm:text-[9px] text-amber-800 bg-amber-50 rounded-lg p-1 sm:p-1.5 border border-amber-200 flex items-center gap-1 mt-0.5">
              <span className="text-amber-700 font-bold shrink-0">Petunjuk:</span>
              <span className="text-[8px] sm:text-[9px] leading-snug">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 pt-1 w-full">
          <button
            id="navigate-to-mission-btn"
            onClick={() => {
              onClose();
              onNavigateToTarget(mission.targetCoords.x, mission.targetCoords.y);
            }}
            className="w-full py-2.5 px-3 sm:px-4 min-h-[42px] sm:min-h-[44px] rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-600 hover:from-emerald-500 hover:to-green-500 active:scale-[0.98] text-white font-bold border-2 border-emerald-300 shadow-[0_4px_16px_rgba(16,185,129,0.35)] flex items-center justify-center cursor-pointer transition-all text-center"
          >
            <span className="text-[11px] sm:text-xs tracking-wide">Tuntun Karakter</span>
          </button>

          <button
            id="explore-myself-btn"
            onClick={onClose}
            className="w-full py-2.5 px-3 sm:px-4 min-h-[42px] sm:min-h-[44px] rounded-xl sm:rounded-2xl bg-slate-950 hover:bg-slate-900 active:scale-[0.98] text-amber-300 font-bold border-2 border-amber-400 shadow-md flex items-center justify-center cursor-pointer transition-all text-center"
          >
            <span className="text-[11px] sm:text-xs tracking-wide">Saya Cari Sendiri</span>
          </button>
        </div>
      </div>
    </div>
  );
};
