import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sound } from '../../utils/audio';
import { Zap, Sparkles, CheckCircle2, RotateCcw, ArrowLeft, ArrowRight, Heart } from 'lucide-react';
import { CharacterPortrait } from '../CharacterPortrait';

interface ShakeoutAlternatingGameProps {
  targetName: string;
  onSuccess: () => void;
}

interface TensionVine {
  id: number;
  label: string;
  isSnapped: boolean;
  color: string;
  angle: number; // degrees
}

export const ShakeoutAlternatingGame: React.FC<ShakeoutAlternatingGameProps> = ({
  targetName,
  onSuccess,
}) => {
  // Alternating state: 'left' or 'right'
  const [nextExpectedSide, setNextExpectedSide] = useState<'left' | 'right'>('left');
  const [lastPressedSide, setLastPressedSide] = useState<'left' | 'right' | null>(null);

  // Wiggle charge meter for snapping current vine (0 to 100)
  const [wiggleCharge, setWiggleCharge] = useState(0);

  // Character animation shake tick
  const [characterShake, setCharacterShake] = useState(false);

  // 5 Tension Vines around the character
  const [vines, setVines] = useState<TensionVine[]>([
    { id: 1, label: 'Sulur Bahu & Leher', isSnapped: false, color: '#a855f7', angle: -35 },
    { id: 2, label: 'Sulur Punggung', isSnapped: false, color: '#9333ea', angle: 35 },
    { id: 3, label: 'Sulur Lengan Kiri', isSnapped: false, color: '#c084fc', angle: -75 },
    { id: 4, label: 'Sulur Lengan Kanan', isSnapped: false, color: '#c084fc', angle: 75 },
    { id: 5, label: 'Sulur Pinggang & Kaki', isSnapped: false, color: '#7e22ce', angle: 0 },
  ]);

  const snappedCount = vines.filter((v) => v.isSnapped).length;
  const isAllFree = snappedCount === 5;
  const tensionPercent = Math.max(0, 100 - snappedCount * 20);

  // Swipe gesture tracking
  const touchStartXRef = useRef<number | null>(null);

  // Reset Game
  const resetGame = useCallback(() => {
    setNextExpectedSide('left');
    setLastPressedSide(null);
    setWiggleCharge(0);
    setVines((prev) => prev.map((v) => ({ ...v, isSnapped: false })));
  }, []);

  // Handle alternating key hit
  const handleHitSide = useCallback(
    (side: 'left' | 'right') => {
      if (isAllFree) return;

      setCharacterShake(true);
      setTimeout(() => setCharacterShake(false), 120);

      if (side === nextExpectedSide) {
        // Correct alternating hit!
        sound.playTensionPop();
        setLastPressedSide(side);
        setNextExpectedSide(side === 'left' ? 'right' : 'left');

        setWiggleCharge((prev) => {
          const next = prev + 25; // 4 alternating hits per vine
          if (next >= 100) {
            // SNAP A VINE!
            sound.playVineSnap();
            setVines((prevVines) => {
              const unsnappedIndex = prevVines.findIndex((v) => !v.isSnapped);
              if (unsnappedIndex !== -1) {
                const updated = [...prevVines];
                updated[unsnappedIndex] = { ...updated[unsnappedIndex], isSnapped: true };
                if (updated.every((v) => v.isSnapped)) {
                  sound.playSuccessFanfare();
                }
                return updated;
              }
              return prevVines;
            });
            return 0;
          }
          return next;
        });
      } else {
        // Repeated same side (stumble)
        sound.playBlocked();
      }
    },
    [isAllFree, nextExpectedSide]
  );

  // Keyboard controls: Left (A, ArrowLeft) and Right (D, ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
        e.preventDefault();
        handleHitSide('left');
      } else if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
        e.preventDefault();
        handleHitSide('right');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleHitSide]);

  // Touch Swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      touchStartXRef.current = e.touches[0].clientX;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current !== null && e.changedTouches[0]) {
      const diffX = e.changedTouches[0].clientX - touchStartXRef.current;
      if (Math.abs(diffX) > 25) {
        if (diffX < 0) {
          handleHitSide('left');
        } else {
          handleHitSide('right');
        }
      }
    }
    touchStartXRef.current = null;
  };

  const targetSprite = targetName.includes('Kiki')
    ? 'squirrel'
    : targetName.includes('Ranu')
    ? 'old_man'
    : targetName.includes('Bimo')
    ? 'boy_glasses'
    : 'player';

  return (
    <div className="space-y-3 select-none text-center">
      {/* Educational Banner */}
      <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-2.5 text-xs text-purple-200">
        ⚡ <strong>Lepas Tegangan (Alternating Shake-Out)</strong>: Ketuk tombol <strong>KIRI</strong> dan <strong>KANAN</strong> bergantian secepat mungkin! Putuskan semua sulur ketegangan yang mengikat {targetName}.
      </div>

      {/* Tension Gauge Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 max-w-md mx-auto space-y-1.5 font-pixel">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-400">Tingkat Ketegangan Otot:</span>
          <span
            className={
              tensionPercent > 50
                ? 'text-rose-400 animate-pulse'
                : tensionPercent > 0
                ? 'text-amber-400'
                : 'text-emerald-400'
            }
          >
            {tensionPercent}% {tensionPercent === 0 && '✨ LELAS SEUTUHNYA'}
          </span>
        </div>

        {/* Outer Bar */}
        <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden border border-slate-700 p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              tensionPercent > 50
                ? 'bg-gradient-to-r from-rose-500 to-red-500 shadow-[0_0_12px_rgba(239,68,68,0.7)]'
                : tensionPercent > 0
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_12px_rgba(245,158,11,0.7)]'
                : 'bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.7)]'
            }`}
            style={{ width: `${tensionPercent}%` }}
          />
        </div>
      </div>

      {/* Main Character Arena Wrapped in Tension Vines */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative w-full h-[220px] sm:h-[240px] bg-slate-950 rounded-2xl border-2 border-purple-500/40 flex flex-col items-center justify-center overflow-hidden shadow-2xl p-4"
      >
        {/* Background Energy Glow */}
        <div
          className={`absolute w-48 h-48 rounded-full blur-3xl pointer-events-none transition-all duration-300 ${
            isAllFree ? 'bg-emerald-500/20' : 'bg-purple-600/15'
          }`}
        />

        {/* Character Avatar with Shaking animation */}
        <div
          className={`relative z-10 transition-transform duration-100 flex items-center justify-center ${
            characterShake
              ? 'scale-110 -rotate-6 translate-x-1'
              : isAllFree
              ? 'animate-bounce scale-110'
              : 'hover:scale-105'
          }`}
        >
          {/* Character Portrait */}
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-900 border-2 border-purple-400/60 shadow-[0_0_25px_rgba(168,85,247,0.5)] flex items-center justify-center overflow-hidden">
              <CharacterPortrait sprite={targetSprite} size="dialogue" />
            </div>

            {/* Tension Vines Overlay (Sulur-Sulur Berduri Ungu) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
              {vines.map((vine) => {
                if (vine.isSnapped) return null;

                // Render thorny tension vine wrapping the character
                return (
                  <g key={vine.id} className="animate-pulse">
                    <path
                      d={
                        vine.id === 1
                          ? 'M 10 25 Q 50 15 90 25'
                          : vine.id === 2
                          ? 'M 15 45 Q 50 40 85 45'
                          : vine.id === 3
                          ? 'M 12 70 Q 50 60 88 70'
                          : vine.id === 4
                          ? 'M 25 15 Q 40 50 30 85'
                          : 'M 75 15 Q 60 50 70 85'
                      }
                      fill="none"
                      stroke={vine.color}
                      strokeWidth="5"
                      strokeDasharray="4 2"
                      strokeLinecap="round"
                      className="filter drop-shadow-[0_0_8px_rgba(168,85,247,0.9)]"
                    />
                    {/* Thorns */}
                    <circle cx="35" cy="30" r="3" fill="#ec4899" />
                    <circle cx="65" cy="40" r="3" fill="#ec4899" />
                  </g>
                );
              })}
            </svg>

            {/* Character Mood Status Tag */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/95 font-pixel text-[8px] sm:text-[9px] px-2 py-0.5 rounded-full border border-purple-400 text-purple-200 shadow z-30">
              {isAllFree
                ? '😄 Bugar & Bebas!'
                : tensionPercent > 50
                ? '😖 Otot Sangat Tegang'
                : '🙂 Mulai Terasa Ringan'}
            </div>
          </div>
        </div>

        {/* Wiggle Charge Meter between snaps */}
        {!isAllFree && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-48 space-y-1 font-pixel text-[8px] text-slate-400 text-center z-20">
            <div className="flex justify-between">
              <span>Energi Goyang:</span>
              <span className="text-amber-300 font-bold">{wiggleCharge}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden border border-slate-700">
              <div
                className="bg-amber-400 h-full transition-all duration-75"
                style={{ width: `${wiggleCharge}%` }}
              />
            </div>
          </div>
        )}

        {/* Free Banner on Victory */}
        {isAllFree && (
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex flex-col items-center justify-center p-4 z-40 animate-scale-up font-pixel">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-3xl mb-1 shadow-[0_0_25px_rgba(16,185,129,0.8)] animate-bounce">
              ⚡
            </div>
            <h3 className="text-sm font-bold text-emerald-300 mb-0.5">
              SEMUA SULUR KETEGANGAN PUTUS!
            </h3>
            <p className="text-[10px] text-slate-200 max-w-xs">
              Hormon stres di otot bahu dan tangan telah terbuang tuntas. Tubuh {targetName} kini bugar dan siap berpetualang kembali!
            </p>
          </div>
        )}
      </div>

      {/* Alternating Action Buttons: KIRI and KANAN */}
      {!isAllFree ? (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
            {/* Button KIRI */}
            <button
              id="btn-shake-left"
              onClick={() => handleHitSide('left')}
              className={`py-3.5 px-4 rounded-2xl font-pixel font-bold text-xs sm:text-sm border-2 flex items-center justify-center gap-2 transition-all active:scale-90 cursor-pointer shadow-lg ${
                nextExpectedSide === 'left'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-yellow-300 shadow-[0_0_25px_rgba(168,85,247,0.7)] scale-105 ring-2 ring-yellow-400/50 animate-pulse'
                  : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-600'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>[A] KIRI</span>
            </button>

            {/* Button KANAN */}
            <button
              id="btn-shake-right"
              onClick={() => handleHitSide('right')}
              className={`py-3.5 px-4 rounded-2xl font-pixel font-bold text-xs sm:text-sm border-2 flex items-center justify-center gap-2 transition-all active:scale-90 cursor-pointer shadow-lg ${
                nextExpectedSide === 'right'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border-yellow-300 shadow-[0_0_25px_rgba(168,85,247,0.7)] scale-105 ring-2 ring-yellow-400/50 animate-pulse'
                  : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-600'
              }`}
            >
              <span>KANAN [D]</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <p className="font-pixel text-[9.5px] text-slate-400">
            Tekan tombol <strong>KIRI</strong> lalu <strong>KANAN</strong> secara bergantian (Keyboard: <strong>[A]</strong> & <strong>[D]</strong> atau panah <strong>←</strong> & <strong>→</strong>)
          </p>
        </div>
      ) : (
        <div className="pt-1 flex flex-col items-center gap-2">
          <button
            id="complete-shakeout-btn"
            onClick={onSuccess}
            className="w-full sm:w-80 py-3 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-pixel font-black text-xs sm:text-sm shadow-[0_0_30px_rgba(16,185,129,0.85)] flex items-center justify-center gap-2 animate-bounce transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>TERAPKAN TUBUH RILEKS KE KARAKTER!</span>
          </button>

          <button
            onClick={resetGame}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] font-pixel flex items-center gap-1 border border-slate-700 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Latihan Goyang Lagi</span>
          </button>
        </div>
      )}

      {/* Vines List Status */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
        {vines.map((vine) => (
          <div
            key={vine.id}
            className={`px-2 py-0.5 rounded-full font-pixel text-[8px] flex items-center gap-1 border transition-all ${
              vine.isSnapped
                ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300'
                : 'bg-slate-900 border-purple-500/40 text-purple-300'
            }`}
          >
            <span>{vine.isSnapped ? '✓' : '⚡'}</span>
            <span>{vine.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
