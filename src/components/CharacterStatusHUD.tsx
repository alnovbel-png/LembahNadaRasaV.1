import React from 'react';
import { CharacterPortrait } from './CharacterPortrait';
import { sound } from '../utils/audio';

export interface CharacterStatusHUDProps {
  playerName?: string;
  playerAvatar?: 'boy' | 'girl' | 'kiko';
  empathyScore?: number;
  missionStep?: number;
  missionProgressPercent?: number;
  clockComponentsCount?: number;
  unlockedBadgesCount?: number;
  calmTechniquesMastered?: number;
  onOpenInfoHub: (tab?: 'pse' | 'quests' | 'regulation' | 'achievements' | 'journal') => void;
  lang?: 'id' | 'en';
}

export const CharacterStatusHUD: React.FC<CharacterStatusHUDProps> = ({
  playerName = 'Ezzel',
  playerAvatar = 'boy',
  empathyScore = 0,
  missionStep = 1,
  missionProgressPercent = 0,
  clockComponentsCount = 0,
  unlockedBadgesCount = 0,
  calmTechniquesMastered = 0,
  onOpenInfoHub,
  lang = 'id',
}) => {
  const spriteKey = playerAvatar === 'girl' ? 'player_girl' : 'player_boy';

  const handleClick = (tab?: 'pse' | 'quests' | 'regulation' | 'achievements' | 'journal') => {
    sound.playMenuSelect();
    onOpenInfoHub(tab);
  };

  // Safe percentages
  const safeMissionPct = Math.min(100, Math.max(0, missionProgressPercent));
  const safeClockPct = Math.min(100, Math.max(0, Math.round((clockComponentsCount / 12) * 100)));
  const safePseMax = 250;
  const safePsePct = Math.min(100, Math.max(8, Math.round((empathyScore / safePseMax) * 100)));

  return (
    <div
      id="rpg-character-status-hud"
      onClick={() => handleClick('pse')}
      title={
        lang === 'en'
          ? 'Click to open Adventurer Information Center (PSE Score, Quests, Regulation, Badges, Journal)'
          : 'Klik untuk membuka Pusat Informasi Petualang (Skor PSE, Progres Misi, Regulasi, Lencana & Jurnal)'
      }
      className="group pointer-events-auto flex items-center gap-1.5 sm:gap-2.5 p-1 sm:p-1.5 rounded-2xl bg-slate-950/90 hover:bg-slate-900/95 border-2 border-[#5c3a26] hover:border-amber-400/80 shadow-[0_4px_20px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.1)] transition-transform duration-75 cursor-pointer select-none active:scale-[0.99] touch-manipulation backdrop-blur-md"
    >
      {/* =========================================================================
          CIRCULAR MEDALLION PORTRAIT FRAME WITH 4 GEMSTONE RIVETS
          ========================================================================= */}
      <div className="relative shrink-0 flex items-center justify-center">
        {/* Outer Ornate Wood & Bronze Ring */}
        <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-b from-[#6b4229] via-[#4a2d1c] to-[#2c190f] p-1 shadow-[0_4px_12px_rgba(0,0,0,0.9),inset_0_2px_4px_rgba(255,215,0,0.3)] border-2 border-[#3d2416] flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
          {/* Inner Dark Recessed Wood Basin */}
          <div className="w-full h-full rounded-full bg-gradient-to-b from-[#1b1009] to-[#0c0704] flex items-center justify-center overflow-hidden border border-[#5a3823] shadow-inner relative">
            <CharacterPortrait
              sprite={spriteKey}
              size="sm"
              className="w-10 h-10 sm:w-13 sm:h-13 scale-110 object-contain pointer-events-none drop-shadow-md"
            />
          </div>

          {/* 4 GEMSTONE STUDS: TOP (12 o'clock) */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-gradient-to-br from-emerald-300 via-teal-500 to-emerald-900 border border-amber-300 shadow-[0_0_6px_rgba(16,185,129,0.8)] z-10" />

          {/* RIGHT (3 o'clock) */}
          <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-gradient-to-br from-emerald-300 via-teal-500 to-emerald-900 border border-amber-300 shadow-[0_0_6px_rgba(16,185,129,0.8)] z-10" />

          {/* BOTTOM (6 o'clock) */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-gradient-to-br from-emerald-300 via-teal-500 to-emerald-900 border border-amber-300 shadow-[0_0_6px_rgba(16,185,129,0.8)] z-10" />

          {/* LEFT (9 o'clock) */}
          <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-gradient-to-br from-emerald-300 via-teal-500 to-emerald-900 border border-amber-300 shadow-[0_0_6px_rgba(16,185,129,0.8)] z-10" />
        </div>
      </div>

      {/* =========================================================================
          RETRO RPG PIXEL ICON CALLIGRAPHY COLUMN (修 / 气 / 命 STYLE THEMED TO PSE)
          ========================================================================= */}
      <div className="hidden sm:flex flex-col justify-between py-0.5 text-[8.5px] font-pixel font-black text-amber-200/90 leading-tight select-none">
        <span className="hover:text-amber-100 transition-colors" title="Misi Utama">
          🎯
        </span>
        <span className="hover:text-pink-200 transition-colors" title="Skor PSE">
          💖
        </span>
        <span className="hover:text-amber-200 transition-colors" title="Menara Jam">
          ⏱️
        </span>
      </div>

      {/* =========================================================================
          STACKED RPG STATUS BARS (WOOD/BRONZE RIVETED CASING + GAUGE FILLS)
          ========================================================================= */}
      <div className="flex flex-col gap-1 min-w-[130px] sm:min-w-[170px] md:min-w-[190px]">
        {/* BAR 1: MISSION PROGRESS PERCENTAGE */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleClick('quests');
          }}
          className="relative h-4 sm:h-5 rounded-md bg-[#180f0a] border-2 border-[#54331d] shadow-[0_2px_4px_rgba(0,0,0,0.8)] overflow-hidden flex items-center hover:border-amber-400 transition-colors"
          title={lang === 'en' ? `Main Mission Step ${missionStep}/4 (${safeMissionPct}%)` : `Misi Utama Langkah ${missionStep}/4 (${safeMissionPct}%)`}
        >
          {/* Metallic End Rivets on Left & Right Caps */}
          <span className="absolute left-0.5 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-amber-600/70 z-10 pointer-events-none" />
          <span className="absolute right-0.5 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-amber-600/70 z-10 pointer-events-none" />

          {/* Progress Fill (Amber/Gold) */}
          <div
            className="h-full bg-gradient-to-r from-amber-700 via-amber-600 to-yellow-500 transition-all duration-300"
            style={{ width: `${safeMissionPct}%` }}
          />

          {/* Bar Label & Value Text */}
          <div className="absolute inset-0 flex items-center justify-between px-2 font-pixel text-[8px] sm:text-[9.5px] font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] z-10">
            <span className="text-amber-200 uppercase tracking-tight text-[7px] sm:text-[8.5px]">
              {lang === 'en' ? `M${missionStep}` : `MISI ${missionStep}`}
            </span>
            <span className="text-yellow-100">{safeMissionPct}%</span>
          </div>
        </div>

        {/* BAR 2: SOCIAL-EMOTIONAL PERFORMANCE (SKOR PSE) */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleClick('pse');
          }}
          className="relative h-4 sm:h-5 rounded-md bg-[#0a1412] border-2 border-[#1e4a3f] shadow-[0_2px_4px_rgba(0,0,0,0.8)] overflow-hidden flex items-center hover:border-teal-300 transition-colors"
          title={lang === 'en' ? `Social-Emotional Score: ${empathyScore} Points` : `Skor Sosial-Emosional (PSE): ${empathyScore} Poin`}
        >
          {/* End Rivets */}
          <span className="absolute left-0.5 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-teal-400/80 z-10 pointer-events-none" />
          <span className="absolute right-0.5 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-teal-400/80 z-10 pointer-events-none" />

          {/* Progress Fill (Jade / Emerald) */}
          <div
            className="h-full bg-gradient-to-r from-emerald-800 via-teal-600 to-emerald-400 transition-all duration-300"
            style={{ width: `${safePsePct}%` }}
          />

          {/* Bar Label & Value Text */}
          <div className="absolute inset-0 flex items-center justify-between px-2 font-pixel text-[8px] sm:text-[9.5px] font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] z-10">
            <span className="text-emerald-200 tracking-tight text-[7px] sm:text-[8.5px]">
              PSE
            </span>
            <span className="text-emerald-100">
              {empathyScore} <span className="text-[7px] font-normal text-emerald-300">PTS</span>
            </span>
          </div>
        </div>

        {/* BAR 3: CLOCK TOWER COMPONENTS & VILLAGERS HELPED */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleClick('quests');
          }}
          className="relative h-4 sm:h-5 rounded-md bg-[#180e08] border-2 border-[#542d17] shadow-[0_2px_4px_rgba(0,0,0,0.8)] overflow-hidden flex items-center hover:border-orange-400 transition-colors"
          title={lang === 'en' ? `Clock Tower Gears: ${clockComponentsCount}/12 Restored` : `Komponen Mesin Jam: ${clockComponentsCount}/12 Terkumpul`}
        >
          {/* End Rivets */}
          <span className="absolute left-0.5 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-orange-500/80 z-10 pointer-events-none" />
          <span className="absolute right-0.5 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-orange-500/80 z-10 pointer-events-none" />

          {/* Progress Fill (Bronze / Amber) */}
          <div
            className="h-full bg-gradient-to-r from-amber-800 via-orange-600 to-amber-500 transition-all duration-300"
            style={{ width: `${safeClockPct}%` }}
          />

          {/* Bar Label & Value Text */}
          <div className="absolute inset-0 flex items-center justify-between px-2 font-pixel text-[8px] sm:text-[9.5px] font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] z-10">
            <span className="text-amber-200 tracking-tight text-[7px] sm:text-[8.5px]">
              {lang === 'en' ? 'HARMONY' : 'HARMONI'}
            </span>
            <span className="text-amber-100">{clockComponentsCount}/12</span>
          </div>
        </div>

        {/* SUB-BADGE ROW (LENCANA & REGULASI QUICK STATS) */}
        <div className="flex items-center justify-between pt-0.5 px-0.5 text-[7px] sm:text-[8px] font-pixel text-slate-300">
          <span
            onClick={(e) => {
              e.stopPropagation();
              handleClick('achievements');
            }}
            className="hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
            title={lang === 'en' ? 'Click to view Badges' : 'Klik untuk melihat Lencana'}
          >
            🏅 {unlockedBadgesCount}/10
          </span>

          <span
            onClick={(e) => {
              e.stopPropagation();
              handleClick('regulation');
            }}
            className="hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
            title={lang === 'en' ? 'Click to open Emotion Regulation Studio' : 'Klik untuk buka Studio Regulasi'}
          >
            🌬️ {calmTechniquesMastered}x {lang === 'en' ? 'Calm' : 'Rileks'}
          </span>

          <span className="text-amber-400/90 font-bold hover:underline cursor-pointer">
            {lang === 'en' ? 'Hub 📜' : 'Info 📜'}
          </span>
        </div>
      </div>
    </div>
  );
};
