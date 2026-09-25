import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sound } from '../../utils/audio';
import { Wind, RotateCcw, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

interface RhythmicBreathingGameProps {
  targetName: string;
  onSuccess: () => void;
}

type Phase = 'ready' | 'inhale' | 'hold' | 'exhale' | 'success' | 'miss';

export const RhythmicBreathingGame: React.FC<RhythmicBreathingGameProps> = ({
  targetName,
  onSuccess,
}) => {
  const [phase, setPhase] = useState<Phase>('ready');
  const [inhaleProgress, setInhaleProgress] = useState(0); // 0 to 100
  const [holdStabilityProgress, setHoldStabilityProgress] = useState(0); // 0 to 100
  const [exhaleProgress, setExhaleProgress] = useState(0); // 0 to 100
  const [missReason, setMissReason] = useState<string>('');
  const [isHoldingButton, setIsHoldingButton] = useState(false);

  // Sweet spot for Phase 2: Hold (Zone hijau bergetar lembut)
  const [greenZonePos, setGreenZonePos] = useState(50); // % along track
  const [cursorPos, setCursorPos] = useState(50);
  const [isInGreenZone, setIsInGreenZone] = useState(true);

  // Synchronized refs for game loop & event handlers
  const phaseRef = useRef<Phase>('ready');
  phaseRef.current = phase;

  const cursorPosRef = useRef<number>(50);
  cursorPosRef.current = cursorPos;

  const holdStartTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const trackContainerRef = useRef<HTMLDivElement | null>(null);

  // Reset to ready
  const resetGame = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setPhase('ready');
    setInhaleProgress(0);
    setHoldStabilityProgress(0);
    setExhaleProgress(0);
    setIsHoldingButton(false);
    holdStartTimeRef.current = null;
  }, []);

  // Handle Miss / Fail with quick deflation
  const triggerMiss = useCallback((reason: string) => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    sound.playQuizWrong();
    setMissReason(reason);
    setPhase('miss');
    setIsHoldingButton(false);
    holdStartTimeRef.current = null;
  }, []);

  // PHASE 3: EXHALE (Smooth deflation over 4 seconds)
  const startExhalePhase = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    sound.playBreatheOut();
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(100, (elapsed / 4.0) * 100);
      setExhaleProgress(progress);

      if (progress >= 100 || elapsed >= 4.0) {
        sound.playSuccessFanfare();
        setPhase('success');
        return;
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
  }, []);

  // PHASE 2: HOLD (Keep cursor inside oscillating green zone for 4s of stability)
  const startHoldPhase = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    const startTime = performance.now();
    let accumulatedStable = 0;
    let lastTime = startTime;

    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      // Gentle, calm oscillation of green zone (between 26% and 74%)
      const osc = Math.sin(now * 0.0016) * 24;
      const targetCenter = 50 + osc;
      setGreenZonePos(targetCenter);

      // Check if player cursor is within green zone (± 16%)
      const curPos = cursorPosRef.current;
      const inside = Math.abs(curPos - targetCenter) <= 16;
      setIsInGreenZone(inside);

      if (inside) {
        accumulatedStable += dt;
      } else {
        // Gentle decay if player deviates outside, never drops below 0
        accumulatedStable = Math.max(0, accumulatedStable - dt * 0.25);
      }

      const pct = Math.min(100, (accumulatedStable / 4.0) * 100);
      setHoldStabilityProgress(pct);

      if (pct >= 100) {
        sound.playSensoryChime(783.99);
        setPhase('exhale');
        setExhaleProgress(0);
        startExhalePhase();
        return;
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
  }, [startExhalePhase]);

  // PHASE 1: INHALE (Hold for 4 seconds)
  const handleInhaleStart = useCallback(() => {
    if (phaseRef.current !== 'ready' && phaseRef.current !== 'miss') return;
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    setPhase('inhale');
    setIsHoldingButton(true);
    setInhaleProgress(0);
    sound.playBreatheIn();

    const start = performance.now();
    holdStartTimeRef.current = start;

    const tick = (now: number) => {
      const elapsed = (now - start) / 1000;
      const progress = Math.min(100, (elapsed / 4.0) * 100);
      setInhaleProgress(progress);

      if (progress >= 100 || elapsed >= 4.0) {
        // Inhale success! Auto transition to HOLD
        sound.playSensoryChime(659.25);
        setInhaleProgress(100);
        setIsHoldingButton(false);
        setPhase('hold');
        setHoldStabilityProgress(0);
        startHoldPhase();
        return;
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
  }, [startHoldPhase]);

  const handleInhaleRelease = useCallback(() => {
    if (phaseRef.current !== 'inhale') return;
    setIsHoldingButton(false);
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    const elapsed = holdStartTimeRef.current ? (performance.now() - holdStartTimeRef.current) / 1000 : 0;
    if (elapsed < 3.2) {
      triggerMiss('Tombol dilepas terlalu cepat! Tahan balon sampai mengembang penuh 4 detik.');
    } else {
      sound.playSensoryChime(659.25);
      setInhaleProgress(100);
      setPhase('hold');
      setHoldStabilityProgress(0);
      startHoldPhase();
    }
  }, [triggerMiss, startHoldPhase]);

  // Stable callbacks for window keyboard listeners
  const startInhaleRef = useRef(handleInhaleStart);
  startInhaleRef.current = handleInhaleStart;
  const releaseInhaleRef = useRef(handleInhaleRelease);
  releaseInhaleRef.current = handleInhaleRelease;

  // Keyboard integration: Attached once on mount so it NEVER cancels animation frames on phase change!
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (phaseRef.current === 'ready' || phaseRef.current === 'miss') {
          startInhaleRef.current();
        }
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        if (phaseRef.current === 'hold') {
          e.preventDefault();
          setCursorPos((prev) => {
            const next = Math.max(5, prev - 4);
            cursorPosRef.current = next;
            return next;
          });
        }
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        if (phaseRef.current === 'hold') {
          e.preventDefault();
          setCursorPos((prev) => {
            const next = Math.min(95, prev + 4);
            cursorPosRef.current = next;
            return next;
          });
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (phaseRef.current === 'inhale') {
          releaseInhaleRef.current();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, []);

  // Track cursor movement on stabilization bar
  const handleTrackMove = (clientX: number) => {
    if (!trackContainerRef.current) return;
    const rect = trackContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const pct = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setCursorPos(pct);
    cursorPosRef.current = pct;
  };

  // Balloon scale calculation
  let balloonScale = 0.4;
  if (phase === 'inhale') {
    balloonScale = 0.4 + (inhaleProgress / 100) * 0.6; // grows 0.4 to 1.0
  } else if (phase === 'hold') {
    balloonScale = 1.0 + Math.sin(Date.now() * 0.005) * 0.03; // gently pulsating
  } else if (phase === 'exhale') {
    balloonScale = 1.0 - (exhaleProgress / 100) * 0.55; // deflates 1.0 to 0.45
  } else if (phase === 'success') {
    balloonScale = 0.65;
  } else if (phase === 'miss') {
    balloonScale = 0.3; // deflated
  }

  return (
    <div className="space-y-3 text-center select-none">
      {/* Educational Header */}
      <div className="bg-cyan-950/40 border border-cyan-500/30 rounded-xl p-2.5 text-xs text-cyan-200 max-w-md mx-auto">
        🎈 <strong>Irama Balon Tenang (4-4-4)</strong>: Tahan tombol 4 detik untuk mengisi balon, seimbangkan napas di zona hijau 4 detik, lalu hembuskan perlahan!
      </div>

      {/* Main Interactive Stage */}
      <div className="relative flex flex-col items-center justify-center min-h-[220px] bg-slate-950/80 rounded-2xl border-2 border-slate-800 p-4 overflow-hidden shadow-inner">
        {/* Target Ring (Cincin Sasaran) */}
        <div
          className={`absolute w-44 h-44 rounded-full border-3 border-dashed transition-all duration-300 flex items-center justify-center ${
            phase === 'inhale' && inhaleProgress >= 90
              ? 'border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.6)] animate-pulse'
              : phase === 'hold'
              ? 'border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.7)]'
              : 'border-cyan-400/40'
          }`}
        >
          <span className="absolute -top-3 bg-slate-900 px-2 py-0.5 rounded text-[8px] font-pixel text-cyan-300 border border-cyan-500/40">
            CINCIN TARGET 100%
          </span>
        </div>

        {/* Dynamic Balloon */}
        <div
          style={{ transform: `scale(${balloonScale})` }}
          className={`relative z-10 transition-transform duration-100 ease-out flex items-center justify-center ${
            phase === 'miss' ? 'animate-wiggle' : ''
          }`}
        >
          {/* Balloon SVG */}
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* Balloon Body */}
            <div
              className={`w-32 h-36 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] shadow-2xl transition-colors duration-300 flex items-center justify-center relative overflow-hidden ${
                phase === 'inhale'
                  ? 'bg-gradient-to-tr from-cyan-500 via-sky-400 to-amber-300 shadow-[0_0_35px_rgba(6,182,212,0.7)]'
                  : phase === 'hold'
                  ? 'bg-gradient-to-tr from-amber-400 via-emerald-400 to-cyan-300 shadow-[0_0_40px_rgba(245,158,11,0.85)]'
                  : phase === 'exhale'
                  ? 'bg-gradient-to-tr from-blue-500 to-indigo-500 shadow-[0_0_25px_rgba(59,130,246,0.6)]'
                  : phase === 'success'
                  ? 'bg-gradient-to-tr from-emerald-400 to-teal-300 shadow-[0_0_35px_rgba(16,185,129,0.8)]'
                  : 'bg-gradient-to-tr from-slate-700 to-slate-600'
              }`}
            >
              {/* Highlight / Gloss Reflection */}
              <div className="absolute top-3 left-4 w-6 h-12 bg-white/40 rounded-full rotate-25 blur-xs" />
              <div className="absolute top-4 left-6 w-2 h-4 bg-white/60 rounded-full rotate-25" />

              {/* Status / Face inside balloon */}
              <div className="text-center z-10">
                <span className="text-2xl drop-shadow-md">
                  {phase === 'inhale' ? '😮' : phase === 'hold' ? '😌' : phase === 'exhale' ? '🌬️' : phase === 'success' ? '😄' : '💨'}
                </span>
                <span className="block font-pixel text-[9px] text-slate-950 font-bold uppercase tracking-wider mt-1 drop-shadow-xs">
                  {phase === 'inhale'
                    ? `${Math.round(inhaleProgress)}%`
                    : phase === 'hold'
                    ? `${Math.round(holdStabilityProgress)}%`
                    : phase === 'exhale'
                    ? `${(4 - (exhaleProgress / 100) * 4).toFixed(1)}s`
                    : phase === 'success'
                    ? 'LEGA!'
                    : 'KEMPES'}
                </span>
              </div>
            </div>

            {/* Balloon Knot & String */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <div className="w-3.5 h-2 bg-cyan-600 rounded-b-xs" />
              <div className="w-0.5 h-6 bg-slate-400/80 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Dynamic Instructional Phase Banner */}
        <div className="mt-4 z-20">
          {phase === 'ready' && (
            <div className="space-y-1">
              <span className="font-pixel text-xs text-amber-300 font-bold block animate-pulse">
                LANGKAH 1: TARIK NAPAS
              </span>
              <p className="font-pixel text-[10px] text-slate-300">
                Tekan dan Tahan tombol di bawah tepat 4 detik hingga balon menyentuh cincin!
              </p>
            </div>
          )}

          {phase === 'inhale' && (
            <div className="space-y-1 animate-fade-in">
              <span className="font-pixel text-xs text-cyan-300 font-bold block">
                💨 Tarik Napas Perlahan... ({Math.round(inhaleProgress)}%)
              </span>
              <p className="font-pixel text-[10px] text-slate-400">
                Tahan terus tombol sampai balon mengembang pas menyentuh cincin target!
              </p>
            </div>
          )}

          {phase === 'hold' && (
            <div className="space-y-1 animate-fade-in w-full max-w-xs mx-auto">
              <span className="font-pixel text-xs text-amber-300 font-bold block flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                LANGKAH 2: TAHAN NAPAS ({Math.round(holdStabilityProgress)}%)
              </span>
              <p className="font-pixel text-[9px] text-slate-300">
                Gerakkan jari/mouse atau tekan [←/→] agar kursor tetap di dalam zona hijau!
              </p>

              {/* Stabilization Balance Track */}
              <div
                ref={trackContainerRef}
                onMouseMove={(e) => handleTrackMove(e.clientX)}
                onTouchMove={(e) => {
                  if (e.touches[0]) handleTrackMove(e.touches[0].clientX);
                }}
                className="relative w-full h-8 bg-slate-900 border-2 border-slate-700 rounded-full overflow-hidden mt-2 cursor-pointer shadow-inner touch-none"
              >
                {/* Vibrating Green Zone */}
                <div
                  style={{
                    left: `${greenZonePos - 16}%`,
                    width: '32%',
                  }}
                  className={`absolute top-0 bottom-0 bg-emerald-500/40 border-x-2 border-emerald-300 flex items-center justify-center transition-all duration-75 ${
                    isInGreenZone ? 'shadow-[0_0_20px_rgba(16,185,129,0.85)] bg-emerald-500/60' : ''
                  }`}
                >
                  <span className="text-[7.5px] font-pixel text-emerald-200 uppercase font-bold tracking-tight">
                    ZONA TENANG
                  </span>
                </div>

                {/* Player Cursor Indicator */}
                <div
                  style={{ left: `${cursorPos}%` }}
                  className={`absolute top-0 bottom-0 w-3.5 -ml-1.5 rounded-full transition-all duration-75 shadow-md ${
                    isInGreenZone ? 'bg-amber-300 border-2 border-white' : 'bg-rose-500 border-2 border-white'
                  }`}
                />
              </div>

              {/* Hold Progress Bar */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1.5 border border-slate-700 relative">
                <div
                  className="bg-emerald-400 h-full transition-all duration-75"
                  style={{ width: `${holdStabilityProgress}%` }}
                />
              </div>
            </div>
          )}

          {phase === 'exhale' && (
            <div className="space-y-1 animate-fade-in">
              <span className="font-pixel text-xs text-blue-300 font-bold block">
                🌬️ LANGKAH 3: HEMBUSKAN NAPAS LEMBUT (4 Detik)
              </span>
              <p className="font-pixel text-[10px] text-slate-300">
                Lepaskan napas perlahan... Tubuh dan pikiranmu kembali rileks seutuhnya!
              </p>
              <div className="w-48 mx-auto bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5 border border-slate-700">
                <div
                  className="bg-blue-400 h-full transition-all duration-100"
                  style={{ width: `${exhaleProgress}%` }}
                />
              </div>
            </div>
          )}

          {phase === 'success' && (
            <div className="space-y-1 animate-scale-up">
              <span className="font-pixel text-xs text-emerald-300 font-bold block flex items-center justify-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                HEBAT! IRAMA NAPAS PARIPURNA 4-4-4 BERHASIL! 🎉
              </span>
              <p className="font-pixel text-[10px] text-slate-300">
                Detak jantung telah melambat dan oksigen segar menenangkan otak {targetName}.
              </p>
            </div>
          )}

          {phase === 'miss' && (
            <div className="space-y-1 animate-shake">
              <span className="font-pixel text-xs text-rose-300 font-bold block">
                Balon Kempes! 💨
              </span>
              <p className="font-pixel text-[10px] text-rose-200">
                {missReason || 'Ritme napas meleset. Yuk atur napas lagi tanpa tergesa-gesa!'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Controls */}
      <div className="pt-2 flex flex-col items-center gap-2">
        {phase === 'ready' || phase === 'miss' || phase === 'inhale' ? (
          <div className="w-full flex flex-col items-center gap-2">
            <button
              id="btn-rhythmic-inhale-hold"
              onPointerDown={(e) => {
                try {
                  e.currentTarget.setPointerCapture(e.pointerId);
                } catch {}
                handleInhaleStart();
              }}
              onPointerUp={(e) => {
                try {
                  e.currentTarget.releasePointerCapture(e.pointerId);
                } catch {}
                handleInhaleRelease();
              }}
              onPointerCancel={() => {
                handleInhaleRelease();
              }}
              className={`w-full sm:w-84 py-3.5 px-6 rounded-2xl font-pixel font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer select-none touch-none ${
                phase === 'inhale'
                  ? 'bg-amber-400 text-slate-950 scale-105 shadow-[0_0_35px_rgba(245,158,11,0.9)] ring-2 ring-amber-300'
                  : 'bg-gradient-to-r from-cyan-500 via-sky-400 to-amber-400 hover:from-cyan-400 hover:to-amber-300 active:scale-95 text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.6)] hover:shadow-[0_0_35px_rgba(6,182,212,0.85)]'
              }`}
            >
              <Wind className={`w-4 h-4 text-slate-950 ${phase === 'inhale' ? 'animate-spin' : ''}`} />
              {phase === 'inhale' ? (
                <span>TAHAN TERUS... ({Math.round(inhaleProgress)}%)</span>
              ) : (
                <span>TEKAN & TAHAN UNTUK TARIK NAPAS (4s) [SPASI]</span>
              )}
            </button>

            {/* Inhale Progress Bar */}
            {phase === 'inhale' && (
              <div className="w-full sm:w-84 bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="bg-amber-400 h-full transition-all duration-75"
                  style={{ width: `${inhaleProgress}%` }}
                />
              </div>
            )}
          </div>
        ) : phase === 'hold' ? (
          <div className="w-full max-w-sm flex flex-col items-center gap-1.5">
            <div className="text-[11px] font-pixel text-slate-200 flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-700">
              <span className={`w-2.5 h-2.5 rounded-full ${isInGreenZone ? 'bg-emerald-400 animate-ping' : 'bg-rose-500 animate-pulse'}`} />
              <span className={isInGreenZone ? 'text-emerald-300 font-bold' : 'text-amber-300'}>
                {isInGreenZone ? 'Napas Stabil di Zona Tenang!' : 'Arahkan kursor ke Zona Hijau!'}
              </span>
              <span className="font-bold text-white ml-auto">({Math.round(holdStabilityProgress)}%)</span>
            </div>
            <span className="text-[9px] font-pixel text-slate-400">
              Tips: Gerakkan mouse / sentuh bilah atau gunakan tombol [← / →] atau [A / D]
            </span>
          </div>
        ) : phase === 'success' ? (
          <button
            id="complete-rhythmic-breathing-btn"
            onClick={onSuccess}
            className="w-full sm:w-80 py-3 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-pixel font-black text-xs sm:text-sm shadow-[0_0_30px_rgba(16,185,129,0.85)] flex items-center justify-center gap-2 animate-bounce transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>TERAPKAN KETENANGAN NAPAS!</span>
          </button>
        ) : null}

        {phase === 'miss' && (
          <button
            onClick={resetGame}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-pixel text-xs flex items-center gap-1.5 border border-slate-700 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Mulai Ulang Siklus Balon</span>
          </button>
        )}
      </div>
    </div>
  );
};
