import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sound } from '../../utils/audio';
import { Eye, Search, Sparkles, CheckCircle2, RotateCcw, Clock, ShieldCheck } from 'lucide-react';

interface HiddenObject {
  id: string;
  name: string;
  emoji: string;
  senseLabel: string;
  x: number; // percentage
  y: number; // percentage
  vx: number; // velocity x
  vy: number; // velocity y
  scale: number;
  freq: number;
  isCaught: boolean;
}

interface GroundingHiddenObjectGameProps {
  targetName: string;
  onSuccess: () => void;
}

export const GroundingHiddenObjectGame: React.FC<GroundingHiddenObjectGameProps> = ({
  targetName,
  onSuccess,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [lensPos, setLensPos] = useState({ x: 50, y: 50 }); // percentage
  const [isInsideContainer, setIsInsideContainer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45); // 45 seconds
  const [isGameOver, setIsGameOver] = useState(false);
  const [isGameWon, setIsGameWon] = useState(false);

  // Sparkle burst effects on object capture
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number; text: string }>>([]);

  // Moving objects state
  const [objects, setObjects] = useState<HiddenObject[]>([
    {
      id: 'obj_butterfly',
      name: 'Kupu-kupu Biru',
      emoji: '🦋',
      senseLabel: '👁️ Dilihat: Kupu-kupu Biru Lembah',
      x: 20,
      y: 35,
      vx: 0.35,
      vy: 0.25,
      scale: 1.2,
      freq: 523.25,
      isCaught: false,
    },
    {
      id: 'obj_leaf',
      name: 'Daun Emas Melayang',
      emoji: '🍃',
      senseLabel: '✋ Disentuh: Daun Emas Gugur',
      x: 75,
      y: 25,
      vx: -0.28,
      vy: 0.18,
      scale: 1.1,
      freq: 659.25,
      isCaught: false,
    },
    {
      id: 'obj_crystal',
      name: 'Kristal Kompas',
      emoji: '💎',
      senseLabel: '👂 Didengar: Gemerincing Kristal',
      x: 45,
      y: 70,
      vx: 0.15,
      vy: -0.2,
      scale: 1.15,
      freq: 783.99,
      isCaught: false,
    },
    {
      id: 'obj_flower',
      name: 'Bunga Harum',
      emoji: '🌸',
      senseLabel: '👃 Dihirup: Wangi Bunga Lavender',
      x: 80,
      y: 65,
      vx: -0.2,
      vy: -0.15,
      scale: 1.1,
      freq: 880.0,
      isCaught: false,
    },
    {
      id: 'obj_dewdrop',
      name: 'Tetes Embun Air',
      emoji: '💧',
      senseLabel: '👅 Dirasa: Embun Air Kesejukan',
      x: 30,
      y: 80,
      vx: 0.22,
      vy: 0.12,
      scale: 1.15,
      freq: 1046.5,
      isCaught: false,
    },
  ]);

  const caughtCount = objects.filter((o) => o.isCaught).length;

  // Reset Game
  const resetGame = useCallback(() => {
    setTimeLeft(45);
    setIsGameOver(false);
    setIsGameWon(false);
    setSparkles([]);
    setObjects((prev) =>
      prev.map((obj) => ({
        ...obj,
        isCaught: false,
        x: 15 + Math.random() * 70,
        y: 20 + Math.random() * 60,
      }))
    );
  }, []);

  // Timer countdown
  useEffect(() => {
    if (isGameWon || isGameOver) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          sound.playQuizWrong();
          setIsGameOver(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isGameWon, isGameOver]);

  // Object movement animation loop
  useEffect(() => {
    if (isGameWon || isGameOver) return;
    let animId: number;

    const updatePhysics = () => {
      setObjects((prevObjs) =>
        prevObjs.map((obj) => {
          if (obj.isCaught) return obj;

          let nx = obj.x + obj.vx;
          let ny = obj.y + obj.vy;
          let nvx = obj.vx;
          let nvy = obj.vy;

          // Bounce off boundary walls (10% to 90%)
          if (nx < 8) {
            nx = 8;
            nvx = Math.abs(nvx);
          } else if (nx > 92) {
            nx = 92;
            nvx = -Math.abs(nvx);
          }

          if (ny < 12) {
            ny = 12;
            nvy = Math.abs(nvy);
          } else if (ny > 88) {
            ny = 88;
            nvy = -Math.abs(nvy);
          }

          return { ...obj, x: nx, y: ny, vx: nvx, vy: nvy };
        })
      );

      animId = requestAnimationFrame(updatePhysics);
    };

    animId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animId);
  }, [isGameWon, isGameOver]);

  // Handle Mouse/Touch Move to move the Magnifying Glass Lens
  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    setLensPos({ x, y });
    setIsInsideContainer(true);
  };

  // Catch an object when clicked
  const handleCatchObject = (id: string, objX: number, objY: number, freq: number, name: string) => {
    if (isGameWon || isGameOver) return;

    sound.playSensoryChime(freq);

    // Add sparkle burst
    const newSparkle = {
      id: Date.now() + Math.random(),
      x: objX,
      y: objY,
      text: `✨ ${name} Ditemukan!`,
    };
    setSparkles((s) => [...s, newSparkle]);
    setTimeout(() => {
      setSparkles((s) => s.filter((item) => item.id !== newSparkle.id));
    }, 1200);

    setObjects((prev) => {
      const next = prev.map((o) => (o.id === id ? { ...o, isCaught: true } : o));
      const allDone = next.every((o) => o.isCaught);
      if (allDone) {
        setIsGameWon(true);
        sound.playSuccessFanfare();
      }
      return next;
    });
  };

  // Background blur and wobble decreases as more objects are caught
  // 0 caught -> blur 7px, heavy shake
  // 5 caught -> blur 0px, serene clarity
  const blurAmount = Math.max(0, (5 - caughtCount) * 1.4);
  const isShaking = caughtCount < 3;

  return (
    <div className="space-y-3 select-none">
      {/* Educational Banner */}
      <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-2.5 text-xs text-emerald-200">
        🔍 <strong>Pencarian Panca Indera Dinamis</strong>: Gerakkan <strong>Kaca Pembesar</strong> untuk menembus kabut kepanikan! Tangkap 5 objek alam yang bergerak sebelum waktu habis.
      </div>

      {/* Top Status: Timer & Caught Count */}
      <div className="flex items-center justify-between text-xs bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 font-pixel">
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            <span>Fokus Indera: {caughtCount}/5 Objek</span>
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300 text-[10px]">
            {caughtCount === 5 ? 'Lembah Telah Jernih Seutuhnya!' : 'Arahkan lensa ke objek bergerak'}
          </span>
        </div>

        <div className="flex items-center gap-1 text-amber-300 font-bold">
          <Clock className="w-3.5 h-3.5" />
          <span className={timeLeft <= 10 ? 'text-rose-400 animate-pulse' : ''}>{timeLeft}s</span>
        </div>
      </div>

      {/* Main Dynamic Stage with Magnifying Glass Spotlight */}
      <div
        ref={containerRef}
        onMouseMove={handlePointerMove}
        onTouchMove={handlePointerMove}
        onMouseEnter={() => setIsInsideContainer(true)}
        className="relative w-full h-[260px] sm:h-[300px] bg-slate-950 rounded-2xl border-2 border-emerald-500/40 overflow-hidden shadow-2xl cursor-crosshair group touch-none"
      >
        {/* Background Layer: Village Scenery with Blur & Wobble */}
        <div
          style={{
            filter: `blur(${blurAmount}px)`,
          }}
          className={`absolute inset-0 bg-gradient-to-b from-sky-950 via-teal-950 to-slate-950 transition-all duration-500 flex flex-col justify-between p-4 ${
            isShaking ? 'animate-wiggle' : ''
          }`}
        >
          {/* Scenic pixel silhouettes (Hills, Trees, Fountain) */}
          <div className="flex justify-between items-start opacity-40">
            <div className="text-2xl">🌲🌲</div>
            <div className="text-3xl text-amber-300/40">⛲</div>
            <div className="text-2xl">🏡🌳</div>
          </div>

          <div className="text-center opacity-30 text-[10px] font-pixel text-slate-400">
            {caughtCount === 0 && 'Kabut kecemasan mengaburkan pandangan... Gunakan kaca pembesar!'}
            {caughtCount > 0 && caughtCount < 5 && 'Kabut mulai memudar, pandangan semakin jernih...'}
            {caughtCount === 5 && 'Pandangan jernih sempurna! Lembah damai dan tenang.'}
          </div>

          <div className="flex justify-around items-end opacity-50 text-xl">
            <span>🌿</span>
            <span>🌸</span>
            <span>🍄</span>
            <span>🌾</span>
            <span>🌻</span>
          </div>
        </div>

        {/* Ambient Fog Particles */}
        {caughtCount < 5 && (
          <div className="absolute inset-0 bg-slate-900/30 pointer-events-none backdrop-blur-[1px]" />
        )}

        {/* Dynamic Moving Hidden Objects */}
        {objects.map((obj) => {
          if (obj.isCaught) return null;

          // Distance from lens center
          const distToLens = Math.hypot(obj.x - lensPos.x, obj.y - lensPos.y);
          const isUnderLens = distToLens < 18;

          return (
            <div
              key={obj.id}
              onClick={() => handleCatchObject(obj.id, obj.x, obj.y, obj.freq, obj.name)}
              style={{
                left: `${obj.x}%`,
                top: `${obj.y}%`,
                transform: `translate(-50%, -50%) scale(${isUnderLens ? obj.scale * 1.35 : obj.scale})`,
              }}
              title={`Klik untuk menangkap ${obj.name}!`}
              className={`absolute cursor-pointer transition-transform duration-100 p-2 rounded-full select-none z-20 hover:scale-150 ${
                isUnderLens
                  ? 'drop-shadow-[0_0_16px_rgba(245,158,11,1)] animate-bounce ring-2 ring-amber-300/80 bg-amber-400/20'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <span className="text-2xl sm:text-3xl filter drop-shadow-md">{obj.emoji}</span>
              {isUnderLens && (
                <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-950/90 text-amber-300 font-pixel text-[8px] px-1.5 py-0.5 rounded border border-amber-400 shadow">
                  Klik! 👆
                </span>
              )}
            </div>
          );
        })}

        {/* Floating Sparkle Bursts */}
        {sparkles.map((sp) => (
          <div
            key={sp.id}
            style={{ left: `${sp.x}%`, top: `${sp.y}%` }}
            className="absolute z-40 -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-scale-up"
          >
            <div className="bg-emerald-500 text-slate-950 font-pixel font-black text-[9px] px-2 py-1 rounded-full shadow-lg border border-emerald-200 whitespace-nowrap flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-yellow-200" />
              <span>{sp.text}</span>
            </div>
          </div>
        ))}

        {/* The Magnifying Glass Lens Cursor Spotlight */}
        {isInsideContainer && (
          <div
            style={{
              left: `${lensPos.x}%`,
              top: `${lensPos.y}%`,
            }}
            className="absolute z-30 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-75"
          >
            {/* Outer Lens Frame Ring */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.6),inset_0_0_20px_rgba(255,255,255,0.4)] bg-transparent overflow-hidden flex items-center justify-center">
              {/* Glass Glare Sheen */}
              <div className="absolute top-2 left-3 w-10 h-20 bg-white/20 rounded-full rotate-30 blur-xs" />
              {/* Reticle / Focus Crosshair */}
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow" />
              <div className="absolute top-2 bottom-2 w-px bg-amber-400/20" />
              <div className="absolute left-2 right-2 h-px bg-amber-400/20" />
            </div>

            {/* Lens Handle */}
            <div className="absolute bottom-0 right-0 w-8 h-3 bg-amber-600 rounded-full rotate-45 translate-x-3 translate-y-3 border border-amber-300 shadow-md" />
          </div>
        )}

        {/* Clear Village Celebration Overlay on Win */}
        {isGameWon && (
          <div className="absolute inset-0 z-40 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-3xl mb-2 shadow-[0_0_25px_rgba(16,185,129,0.7)] animate-bounce">
              ✨
            </div>
            <h3 className="font-pixel text-sm sm:text-base font-bold text-emerald-300 mb-1">
              PANCA INDERA SELARAS PARIPURNA!
            </h3>
            <p className="font-pixel text-[10px] text-slate-200 max-w-sm">
              Semua 5 objek telah ditemukan. Pikiran {targetName} kembali jernih, tenang, dan terhubung utuh dengan dunia nyata.
            </p>
          </div>
        )}

        {/* Game Over Timeout Overlay */}
        {isGameOver && (
          <div className="absolute inset-0 z-40 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center animate-fade-in">
            <div className="text-3xl mb-2">⏳</div>
            <h3 className="font-pixel text-sm font-bold text-rose-300 mb-1">
              WAKTU PENCARIAN HABIS
            </h3>
            <p className="font-pixel text-[10px] text-slate-300 max-w-xs mb-3">
              Kabut masih agak tebal. Yuk ulangi pencarian dengan tenang, gerakkan kaca pembesar untuk menemukan objek yang tersisa!
            </p>
            <button
              onClick={resetGame}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-pixel font-bold text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Coba Cari Lagi</span>
            </button>
          </div>
        )}
      </div>

      {/* Target Item Checklist Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
        {objects.map((obj) => (
          <div
            key={obj.id}
            className={`p-1.5 rounded-lg border font-pixel text-[9px] flex items-center gap-1.5 transition-all ${
              obj.isCaught
                ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <span className="text-sm shrink-0">{obj.emoji}</span>
            <div className="truncate">
              <span className="block font-bold">{obj.name}</span>
              <span className="text-[7.5px] text-slate-400 block truncate">
                {obj.isCaught ? '✅ Ditemukan' : '🔍 Cari di kabut'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Final Completion Action Button */}
      {isGameWon && (
        <div className="pt-1 flex justify-center">
          <button
            id="complete-dynamic-grounding-btn"
            onClick={onSuccess}
            className="w-full sm:w-80 py-3 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-pixel font-black text-xs sm:text-sm shadow-[0_0_30px_rgba(16,185,129,0.85)] flex items-center justify-center gap-2 animate-bounce transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>TERAPKAN KETENANGAN GROUNDING!</span>
          </button>
        </div>
      )}
    </div>
  );
};
