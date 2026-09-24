import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sound } from '../../utils/audio';
import { ShieldAlert, Sparkles, CheckCircle2, RotateCcw, Clock, Snowflake, Award } from 'lucide-react';

interface StopTracingGameProps {
  targetName: string;
  onSuccess: () => void;
}

// Checkpoint node for letter tracing
interface TraceNode {
  id: number;
  x: number; // percentage
  y: number; // percentage
}

interface LetterConfig {
  letter: 'S' | 'T' | 'O' | 'P';
  title: string;
  subtitle: string;
  description: string;
  nodes: TraceNode[];
}

const LETTERS: LetterConfig[] = [
  {
    letter: 'S',
    title: 'S - STOP!',
    subtitle: 'Berhenti Sejenak',
    description: 'Injak rem emosi! Hentikan ucapan atau tindakan impulsif sebelum menyakiti orang lain.',
    nodes: [
      { id: 1, x: 75, y: 22 },
      { id: 2, x: 30, y: 24 },
      { id: 3, x: 45, y: 48 },
      { id: 4, x: 72, y: 72 },
      { id: 5, x: 26, y: 78 },
    ],
  },
  {
    letter: 'T',
    title: 'T - TAKE A BREATH',
    subtitle: 'Ambil Napas Dalam',
    description: 'Tarik satu napas panjang menenangkan untuk mengalirkan oksigen segar ke otak logika.',
    nodes: [
      { id: 1, x: 22, y: 25 },
      { id: 2, x: 50, y: 25 },
      { id: 3, x: 78, y: 25 },
      { id: 4, x: 50, y: 55 },
      { id: 5, x: 50, y: 80 },
    ],
  },
  {
    letter: 'O',
    title: 'O - OBSERVE',
    subtitle: 'Amati Perasaan',
    description: 'Sadari apa yang terjadi di tubuh: apakah dada berdebar, tangan mengepal, atau pikiran riuh.',
    nodes: [
      { id: 1, x: 50, y: 20 },
      { id: 2, x: 25, y: 48 },
      { id: 3, x: 50, y: 80 },
      { id: 4, x: 75, y: 48 },
      { id: 5, x: 50, y: 24 },
    ],
  },
  {
    letter: 'P',
    title: 'P - PROCEED',
    subtitle: 'Pilih Respon Bijak',
    description: 'Lanjutkan dengan tindakan yang bijak, asertif, dan berorientasi pada solusi damai.',
    nodes: [
      { id: 1, x: 30, y: 80 },
      { id: 2, x: 30, y: 22 },
      { id: 3, x: 72, y: 24 },
      { id: 4, x: 72, y: 50 },
      { id: 5, x: 32, y: 50 },
    ],
  },
];

export const StopTracingGame: React.FC<StopTracingGameProps> = ({
  targetName,
  onSuccess,
}) => {
  // Game states: 'bounce' (QTE catch) -> 'tracing' (trace S-T-O-P) -> 'success' | 'timeup'
  const [phase, setPhase] = useState<'bounce' | 'tracing' | 'success' | 'timeup'>('bounce');

  // Bouncing Button coordinates & velocities
  const [btnPos, setBtnPos] = useState({ x: 50, y: 50 });
  const btnVelRef = useRef({ vx: 1.7, vy: 1.4 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Time Freeze state
  const [freezeTimeLeft, setFreezeTimeLeft] = useState(30); // 30s freeze timer
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [tracedNodeIds, setTracedNodeIds] = useState<number[]>([]);
  const [completedLetters, setCompletedLetters] = useState<string[]>([]);

  // Reset Game
  const resetGame = useCallback(() => {
    setPhase('bounce');
    setBtnPos({ x: 45 + Math.random() * 10, y: 45 + Math.random() * 10 });
    btnVelRef.current = {
      vx: (Math.random() > 0.5 ? 1 : -1) * (1.5 + Math.random() * 0.8),
      vy: (Math.random() > 0.5 ? 1 : -1) * (1.3 + Math.random() * 0.8),
    };
    setFreezeTimeLeft(30);
    setCurrentLetterIndex(0);
    setTracedNodeIds([]);
    setCompletedLetters([]);
  }, []);

  // 1. QTE Bouncing Button Physics
  useEffect(() => {
    if (phase !== 'bounce') return;
    let animId: number;

    const loop = () => {
      setBtnPos((prev) => {
        let nx = prev.x + btnVelRef.current.vx * 0.45;
        let ny = prev.y + btnVelRef.current.vy * 0.45;

        // Bounce off bounds (15% to 85%)
        if (nx <= 15) {
          nx = 15;
          btnVelRef.current.vx = Math.abs(btnVelRef.current.vx);
        } else if (nx >= 85) {
          nx = 85;
          btnVelRef.current.vx = -Math.abs(btnVelRef.current.vx);
        }

        if (ny <= 18) {
          ny = 18;
          btnVelRef.current.vy = Math.abs(btnVelRef.current.vy);
        } else if (ny >= 82) {
          ny = 82;
          btnVelRef.current.vy = -Math.abs(btnVelRef.current.vy);
        }

        return { x: nx, y: ny };
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [phase]);

  // 2. Freeze Timer Countdown during tracing
  useEffect(() => {
    if (phase !== 'tracing') return;
    const timer = setInterval(() => {
      setFreezeTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          sound.playQuizWrong();
          setPhase('timeup');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  // Handle QTE Button Smash / Capture
  const handleSmashStopButton = () => {
    if (phase !== 'bounce') return;
    sound.playStopBrake();
    sound.playFreezeGlass();
    setPhase('tracing');
    setFreezeTimeLeft(30);
    setCurrentLetterIndex(0);
    setTracedNodeIds([]);
    setCompletedLetters([]);
  };

  // Tracing node interaction
  const currentLetterConfig = LETTERS[currentLetterIndex];

  const handleTouchOrHoverNode = (nodeId: number) => {
    if (phase !== 'tracing' || !currentLetterConfig) return;

    // Check if node is the next in sequence
    const nextExpectedId = tracedNodeIds.length + 1;
    if (nodeId === nextExpectedId) {
      sound.playSensoryChime(523.25 + nodeId * 80);
      const nextTraced = [...tracedNodeIds, nodeId];
      setTracedNodeIds(nextTraced);

      // Check if letter is fully traced
      if (nextTraced.length === currentLetterConfig.nodes.length) {
        sound.playSecretFound();
        const letter = currentLetterConfig.letter;
        setCompletedLetters((prev) => [...prev, letter]);

        // Next letter or Finish
        if (currentLetterIndex + 1 < LETTERS.length) {
          setTimeout(() => {
            setCurrentLetterIndex((idx) => idx + 1);
            setTracedNodeIds([]);
          }, 650);
        } else {
          // Finished all S-T-O-P!
          setTimeout(() => {
            sound.playSuccessFanfare();
            setPhase('success');
          }, 800);
        }
      }
    }
  };

  // Handle Drag/Move over the canvas to connect checkpoints
  const handleTracingMove = (clientX: number, clientY: number) => {
    if (phase !== 'tracing' || !containerRef.current || !currentLetterConfig) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPct = ((clientX - rect.left) / rect.width) * 100;
    const yPct = ((clientY - rect.top) / rect.height) * 100;

    const nextExpectedId = tracedNodeIds.length + 1;
    const targetNode = currentLetterConfig.nodes.find((n) => n.id === nextExpectedId);
    if (!targetNode) return;

    const dist = Math.hypot(xPct - targetNode.x, yPct - targetNode.y);
    if (dist < 10) {
      handleTouchOrHoverNode(targetNode.id);
    }
  };

  return (
    <div className="space-y-3 select-none">
      {/* Educational Header */}
      <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-2.5 text-xs text-amber-200">
        🛑 <strong>Rem S-T-O-P Cepat (Quick-Time & Tracing)</strong>: Tangkap tombol STOP yang memantul liar! Saat waktu membeku, tebalkan huruf <strong>S, T, O, dan P</strong> untuk mengendalikan impuls emosi.
      </div>

      {/* Main Game Stage */}
      <div
        ref={containerRef}
        onMouseMove={(e) => {
          if (phase === 'tracing' && e.buttons === 1) {
            handleTracingMove(e.clientX, e.clientY);
          }
        }}
        onTouchMove={(e) => {
          if (phase === 'tracing' && e.touches[0]) {
            handleTracingMove(e.touches[0].clientX, e.touches[0].clientY);
          }
        }}
        className={`relative w-full h-[270px] sm:h-[310px] rounded-2xl border-2 transition-all duration-500 overflow-hidden shadow-2xl flex flex-col justify-between p-4 ${
          phase === 'bounce'
            ? 'bg-gradient-to-tr from-slate-950 via-rose-950/40 to-slate-950 border-rose-500/60 shadow-[0_0_25px_rgba(244,63,94,0.3)]'
            : phase === 'tracing'
            ? 'bg-gradient-to-b from-cyan-950 via-slate-950 to-blue-950 border-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.5)] ring-2 ring-cyan-300/40'
            : phase === 'success'
            ? 'bg-gradient-to-tr from-emerald-950 via-teal-950 to-slate-950 border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.5)]'
            : 'bg-slate-950 border-slate-700'
        }`}
      >
        {/* PHASE 1: BOUNCING BUTTON QTE */}
        {phase === 'bounce' && (
          <>
            {/* Top Prompt */}
            <div className="text-center z-10 font-pixel">
              <span className="text-rose-400 text-xs font-bold uppercase tracking-wider block animate-pulse">
                🚨 EMOSI MEMUNCAK! INJAK REM DARURAT!
              </span>
              <p className="text-[10px] text-slate-300 mt-0.5">
                Tombol memantul liar! Kejar dengan kursor dan KLIK tombol STOP secepatnya!
              </p>
            </div>

            {/* Bouncing STOP! Button */}
            <div
              style={{
                left: `${btnPos.x}%`,
                top: `${btnPos.y}%`,
              }}
              onClick={handleSmashStopButton}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30 select-none active:scale-90 transition-transform duration-75"
            >
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-rose-600 via-red-500 to-amber-500 text-white font-pixel font-black border-4 border-rose-200 shadow-[0_0_40px_rgba(239,68,68,0.9),inset_0_0_15px_rgba(255,255,255,0.4)] flex flex-col items-center justify-center hover:scale-110 animate-pulse group">
                <ShieldAlert className="w-8 h-8 sm:w-9 sm:h-9 text-yellow-300 drop-shadow-md group-hover:rotate-12 transition-transform" />
                <span className="text-base sm:text-lg tracking-widest text-yellow-100 font-bold drop-shadow">
                  STOP!
                </span>
                <span className="text-[7.5px] uppercase tracking-tighter text-white/90">
                  KLIK / SMASH!
                </span>
              </div>
            </div>

            {/* Bottom reminder */}
            <div className="text-center z-10 text-[9px] font-pixel text-slate-400">
              Gerakkan kursor/sentuh tombol merah untuk membekukan waktu
            </div>
          </>
        )}

        {/* PHASE 2: TIME FREEZE & S-T-O-P TRACING */}
        {phase === 'tracing' && currentLetterConfig && (
          <div className="flex flex-col h-full justify-between z-10">
            {/* Top Freeze Header */}
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-1.5 font-pixel">
              <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-xs">
                <Snowflake className="w-4 h-4 text-cyan-400 animate-spin" />
                <span>WAKTU MEMBEKU ❄️ TEBALKAN: {currentLetterConfig.title}</span>
              </div>

              <div className="flex items-center gap-1 text-amber-300 font-bold text-xs">
                <Clock className="w-3.5 h-3.5" />
                <span className={freezeTimeLeft <= 8 ? 'text-rose-400 animate-pulse font-black' : ''}>
                  {freezeTimeLeft}s
                </span>
              </div>
            </div>

            {/* Tracing Canvas Area */}
            <div className="relative flex-1 flex items-center justify-center my-1">
              {/* Background Giant Pixel Watermark of current letter */}
              <div className="absolute inset-0 flex items-center justify-center opacity-15 text-8xl font-black font-pixel text-cyan-300 select-none pointer-events-none">
                {currentLetterConfig.letter}
              </div>

              {/* Connecting lines between traced nodes */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {tracedNodeIds.map((id, index) => {
                  if (index === 0) return null;
                  const prevNode = currentLetterConfig.nodes.find((n) => n.id === tracedNodeIds[index - 1]);
                  const currNode = currentLetterConfig.nodes.find((n) => n.id === id);
                  if (!prevNode || !currNode) return null;

                  return (
                    <line
                      key={`line-${id}`}
                      x1={`${prevNode.x}%`}
                      y1={`${prevNode.y}%`}
                      x2={`${currNode.x}%`}
                      y2={`${currNode.y}%`}
                      stroke="#22d3ee"
                      strokeWidth="5"
                      strokeLinecap="round"
                      className="filter drop-shadow-[0_0_8px_rgba(34,211,238,0.9)] animate-pulse"
                    />
                  );
                })}
              </svg>

              {/* Checkpoint Nodes to trace in order 1 -> 2 -> 3 -> 4 -> 5 */}
              {currentLetterConfig.nodes.map((node) => {
                const isTraced = tracedNodeIds.includes(node.id);
                const isNextTarget = node.id === tracedNodeIds.length + 1;

                return (
                  <button
                    key={node.id}
                    onClick={() => handleTouchOrHoverNode(node.id)}
                    onMouseEnter={() => handleTouchOrHoverNode(node.id)}
                    style={{
                      left: `${node.x}%`,
                      top: `${node.y}%`,
                    }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full font-pixel font-black text-xs flex items-center justify-center transition-all duration-200 cursor-pointer ${
                      isTraced
                        ? 'bg-cyan-400 text-slate-950 border-2 border-white shadow-[0_0_20px_rgba(34,211,238,1)] scale-105'
                        : isNextTarget
                        ? 'bg-amber-400 text-slate-950 border-2 border-amber-200 shadow-[0_0_20px_rgba(245,158,11,1)] animate-bounce scale-110 ring-4 ring-amber-400/40'
                        : 'bg-slate-900/90 text-cyan-200 border-2 border-cyan-500/50 hover:border-cyan-300'
                    }`}
                  >
                    {isTraced ? '✓' : node.id}
                  </button>
                );
              })}
            </div>

            {/* Instruction description for current letter */}
            <div className="bg-slate-900/80 rounded-xl p-2 border border-cyan-500/30 font-pixel text-center">
              <span className="text-[10px] text-amber-300 font-bold block">
                {currentLetterConfig.subtitle}:
              </span>
              <p className="text-[9px] text-slate-200 leading-snug">
                {currentLetterConfig.description}
              </p>
            </div>
          </div>
        )}

        {/* PHASE 3: SUCCESS CELEBRATION */}
        {phase === 'success' && (
          <div className="flex flex-col items-center justify-center h-full text-center z-10 animate-scale-up font-pixel">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-3xl mb-2 shadow-[0_0_30px_rgba(16,185,129,0.8)] animate-bounce">
              🛡️
            </div>
            <h3 className="text-sm sm:text-base font-bold text-emerald-300 mb-1">
              REM S-T-O-P SUKSES DITEGAKKAN!
            </h3>
            <p className="text-[10px] text-slate-200 max-w-sm">
              Impuls emosi berhasil diredam. {targetName} kini siap mengambil keputusan yang tenang, bijak, dan penuh kasih.
            </p>
          </div>
        )}

        {/* TIMEOUT OVERLAY */}
        {phase === 'timeup' && (
          <div className="flex flex-col items-center justify-center h-full text-center z-10 animate-fade-in font-pixel">
            <div className="text-3xl mb-2">⏳</div>
            <h3 className="text-sm font-bold text-rose-300 mb-1">
              WAKTU BEKU HABIS
            </h3>
            <p className="text-[10px] text-slate-300 max-w-xs mb-3">
              Impuls sempat lolos! Ayo ulangi dengan mengejar tombol STOP dan menebalkan huruf lebih sigap.
            </p>
            <button
              onClick={resetGame}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Coba Lagi Dari Awal</span>
            </button>
          </div>
        )}
      </div>

      {/* S-T-O-P Letters Badges Progress */}
      <div className="grid grid-cols-4 gap-1.5">
        {LETTERS.map((item, idx) => {
          const isDone = completedLetters.includes(item.letter);
          const isCurrent = idx === currentLetterIndex && phase === 'tracing';

          return (
            <div
              key={item.letter}
              className={`p-1.5 rounded-lg border font-pixel text-center transition-all ${
                isDone
                  ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-sm'
                  : isCurrent
                  ? 'bg-cyan-950/90 border-cyan-400 text-cyan-200 ring-2 ring-cyan-400/50'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              <span className="block font-bold text-xs">{item.letter}</span>
              <span className="text-[7.5px] block truncate">
                {isDone ? '✅ Berhasil' : item.subtitle}
              </span>
            </div>
          );
        })}
      </div>

      {/* Success Final Completion Button */}
      {phase === 'success' && (
        <div className="pt-1 flex justify-center">
          <button
            id="complete-stop-tracing-btn"
            onClick={onSuccess}
            className="w-full sm:w-80 py-3 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-pixel font-black text-xs sm:text-sm shadow-[0_0_30px_rgba(16,185,129,0.85)] flex items-center justify-center gap-2 animate-bounce transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>TERAPKAN KEPUTUSAN BIJAK S-T-O-P!</span>
          </button>
        </div>
      )}
    </div>
  );
};
