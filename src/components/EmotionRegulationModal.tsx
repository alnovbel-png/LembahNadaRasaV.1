import React, { useState, useEffect } from 'react';
import { sound } from '../utils/audio';
import {
  Wind,
  Eye,
  Hand,
  Volume2,
  Flower2,
  Heart,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  Zap,
  RotateCcw,
  X,
  Play,
  Pause,
  ChevronRight,
  Smile,
} from 'lucide-react';

export type RegulationMode = 'breathing' | 'grounding' | 'stop' | 'shakeout';

interface EmotionRegulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (mode: RegulationMode) => void;
  targetName?: string;
  initialMode?: RegulationMode;
}

export const EmotionRegulationModal: React.FC<EmotionRegulationModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  targetName = 'Pemain',
  initialMode = 'breathing',
}) => {
  const [activeMode, setActiveMode] = useState<RegulationMode>(initialMode);
  const isSelfPractice = targetName === 'Pemain' || targetName === 'Karakter Utama';

  // Mode 1: Breathing 4-4-4 State
  const [breathePhase, setBreathePhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breatheCycle, setBreatheCycle] = useState<number>(1);
  const totalBreatheCycles = 3;
  const [breatheSeconds, setBreatheSeconds] = useState<number>(4);
  const [isBreathePaused, setIsBreathePaused] = useState<boolean>(false);
  const [isBreatheFinished, setIsBreatheFinished] = useState<boolean>(false);

  // Mode 2: Grounding 5-4-3-2-1 State
  const [groundingStep, setGroundingStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [checkedSight, setCheckedSight] = useState<string[]>([]);
  const [checkedTouch, setCheckedTouch] = useState<string[]>([]);
  const [checkedSound, setCheckedSound] = useState<string[]>([]);
  const [checkedSmell, setCheckedSmell] = useState<string[]>([]);
  const [hasCheckedTaste, setHasCheckedTaste] = useState<boolean>(false);
  const [isGroundingFinished, setIsGroundingFinished] = useState<boolean>(false);

  // Mode 3: STOP State
  const [stopStep, setStopStep] = useState<'stop' | 'take' | 'observe' | 'proceed'>('stop');
  const [isStopBraked, setIsStopBraked] = useState<boolean>(false);
  const [breathHoldProgress, setBreathHoldProgress] = useState<number>(0);
  const [isHoldingBreath, setIsHoldingBreath] = useState<boolean>(false);
  const [observedFeeling, setObservedFeeling] = useState<string | null>(null);
  const [selectedProceedAction, setSelectedProceedAction] = useState<string | null>(null);
  const [isStopFinished, setIsStopFinished] = useState<boolean>(false);

  // Mode 4: Shake-Out State
  const [shakeTension, setShakeTension] = useState<number>(100);
  const [shakeCount, setShakeCount] = useState<number>(0);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [isShakeFinished, setIsShakeFinished] = useState<boolean>(false);

  // Sync initial mode
  useEffect(() => {
    if (isOpen) {
      setActiveMode(initialMode);
      // Reset modes states
      setBreatheCycle(1);
      setBreatheSeconds(4);
      setBreathePhase('inhale');
      setIsBreatheFinished(false);
      setIsBreathePaused(false);

      setGroundingStep(1);
      setCheckedSight([]);
      setCheckedTouch([]);
      setCheckedSound([]);
      setCheckedSmell([]);
      setHasCheckedTaste(false);
      setIsGroundingFinished(false);

      setStopStep('stop');
      setIsStopBraked(false);
      setBreathHoldProgress(0);
      setObservedFeeling(null);
      setSelectedProceedAction(null);
      setIsStopFinished(false);

      setShakeTension(100);
      setShakeCount(0);
      setIsShakeFinished(false);
    }
  }, [isOpen, initialMode]);

  // Mode 1: Breathing loop
  useEffect(() => {
    if (!isOpen || activeMode !== 'breathing' || isBreatheFinished || isBreathePaused) return;

    if (breathePhase === 'inhale' && breatheSeconds === 4) {
      sound.playBreatheIn();
    } else if (breathePhase === 'exhale' && breatheSeconds === 4) {
      sound.playBreatheOut();
    }

    const timer = window.setInterval(() => {
      setBreatheSeconds((prev) => {
        if (prev <= 1) {
          if (breathePhase === 'inhale') {
            setBreathePhase('hold');
            return 4;
          } else if (breathePhase === 'hold') {
            setBreathePhase('exhale');
            return 4;
          } else {
            // Exhale finished
            if (breatheCycle >= totalBreatheCycles) {
              setIsBreatheFinished(true);
              sound.playSuccessFanfare();
              return 0;
            } else {
              setBreatheCycle((c) => c + 1);
              setBreathePhase('inhale');
              return 4;
            }
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, activeMode, breathePhase, breatheCycle, breatheSeconds, isBreatheFinished, isBreathePaused]);

  // Mode 3: STOP Breath Hold Timer
  useEffect(() => {
    if (!isHoldingBreath || stopStep !== 'take') return;
    const interval = window.setInterval(() => {
      setBreathHoldProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsHoldingBreath(false);
          sound.playSensoryChime(587.33);
          setStopStep('observe');
          return 100;
        }
        return prev + 5;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isHoldingBreath, stopStep]);

  if (!isOpen) return null;

  // Final confirmation handler
  const handleFinish = (mode: RegulationMode) => {
    sound.playSuccessFanfare();
    onComplete(mode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-backdrop-fade-in">
      <div className="bg-slate-900 border-2 border-cyan-400/50 rounded-2xl p-4 sm:p-6 max-w-xl w-full text-slate-100 relative overflow-hidden shadow-2xl my-auto modal-glow-frame animate-fade-in-slide-up">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-cyan-500/15 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3 relative z-10 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-bold tracking-wider text-xs uppercase mb-1">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span style={{ fontFamily: "'Pixelify Sans', sans-serif" }}>Studio Regulasi Emosi & Ketenangan</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              {isSelfPractice ? (
                <>
                  <span style={{ fontFamily: "'Pixelify Sans', sans-serif" }}>Latihan Regulasi Mandiri (Karakter Utama)</span>
                  <span
                    style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
                    className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-semibold"
                  >
                    Fokus & Ketenangan
                  </span>
                </>
              ) : (
                <>
                  <span style={{ fontFamily: "'Pixelify Sans', sans-serif" }}>Bantu {targetName} Menenangkan Diri</span>
                  <span
                    style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
                    className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-semibold"
                  >
                    Dukungan Sahabat
                  </span>
                </>
              )}
            </h2>
          </div>

          <button
            id="close-regulation-modal-btn"
            onClick={onClose}
            title="Tutup [Esc]"
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-950/60 hover:border-rose-500/50 hover:scale-110 hover:shadow-[0_0_10px_rgba(244,63,94,0.4)] text-slate-400 hover:text-slate-100 border border-slate-700 transition-all duration-200 shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-4 relative z-10">
          {/* Tab 1: Napas Balon */}
          <button
            id="tab-mode-breathing"
            onClick={() => setActiveMode('breathing')}
            className={`p-2 rounded-xl text-left border transition-all duration-200 hover:scale-105 cursor-pointer flex flex-col gap-0.5 ${
              activeMode === 'breathing'
                ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-950/50 ring-1 ring-cyan-400/50 shadow-[0_0_14px_rgba(6,182,212,0.35)]'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:border-cyan-400/40 hover:text-slate-200 hover:shadow-[0_0_10px_rgba(6,182,212,0.2)]'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <Wind className="w-3.5 h-3.5 text-cyan-400" />
              <span style={{ fontFamily: "'Pixelify Sans', sans-serif" }}>Napas 4-4-4</span>
            </div>
            <span style={{ fontFamily: "'Pixelify Sans', sans-serif" }} className="text-[10px] text-slate-400 leading-tight">Irama Balon Tenang</span>
          </button>

          {/* Tab 2: Grounding 5-4-3-2-1 */}
          <button
            id="tab-mode-grounding"
            onClick={() => setActiveMode('grounding')}
            className={`p-2 rounded-xl text-left border transition-all duration-200 hover:scale-105 cursor-pointer flex flex-col gap-0.5 ${
              activeMode === 'grounding'
                ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200 shadow-md shadow-emerald-950/50 ring-1 ring-emerald-400/50 shadow-[0_0_14px_rgba(16,185,129,0.35)]'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:border-emerald-400/40 hover:text-slate-200 hover:shadow-[0_0_10px_rgba(16,185,129,0.2)]'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span style={{ fontFamily: "'Pixelify Sans', sans-serif" }}>Panca Indera</span>
            </div>
            <span style={{ fontFamily: "'Pixelify Sans', sans-serif" }} className="text-[10px] text-slate-400 leading-tight">Grounding 5-4-3-2-1</span>
          </button>

          {/* Tab 3: Rem Otak S-T-O-P */}
          <button
            id="tab-mode-stop"
            onClick={() => setActiveMode('stop')}
            className={`p-2 rounded-xl text-left border transition-all duration-200 hover:scale-105 cursor-pointer flex flex-col gap-0.5 ${
              activeMode === 'stop'
                ? 'bg-amber-950/80 border-amber-400 text-amber-200 shadow-md shadow-amber-950/50 ring-1 ring-amber-400/50 shadow-[0_0_14px_rgba(245,158,11,0.35)]'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:border-amber-400/40 hover:text-slate-200 hover:shadow-[0_0_10px_rgba(245,158,11,0.2)]'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span style={{ fontFamily: "'Pixelify Sans', sans-serif" }}>Rem S-T-O-P</span>
            </div>
            <span style={{ fontFamily: "'Pixelify Sans', sans-serif" }} className="text-[10px] text-slate-400 leading-tight">Cegah Reaksi Impulsif</span>
          </button>

          {/* Tab 4: Goyang Lepas Ketegangan */}
          <button
            id="tab-mode-shakeout"
            onClick={() => setActiveMode('shakeout')}
            className={`p-2 rounded-xl text-left border transition-all duration-200 hover:scale-105 cursor-pointer flex flex-col gap-0.5 ${
              activeMode === 'shakeout'
                ? 'bg-purple-950/80 border-purple-400 text-purple-200 shadow-md shadow-purple-950/50 ring-1 ring-purple-400/50 shadow-[0_0_14px_rgba(168,85,247,0.35)]'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:border-purple-400/40 hover:text-slate-200 hover:shadow-[0_0_10px_rgba(168,85,247,0.2)]'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span style={{ fontFamily: "'Pixelify Sans', sans-serif" }}>Lepas Tegangan</span>
            </div>
            <span style={{ fontFamily: "'Pixelify Sans', sans-serif" }} className="text-[10px] text-slate-400 leading-tight">Goyang Otot Kinestetik</span>
          </button>
        </div>

        {/* MODE 1: NAPAS BALON 4-4-4 */}
        {activeMode === 'breathing' && (
          <div className="space-y-4 text-center">
            <p style={{ fontFamily: "'Pixelify Sans', sans-serif" }} className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
              Tarik napas teratur merangsang <strong>saraf vagus</strong> untuk memperlambat denyut jantung dan mengirim sinyal rasa aman ke otak.
            </p>

            {/* Interactive Breathing Sphere */}
            <div className="relative flex items-center justify-center h-44 sm:h-48 my-2">
              <div
                className={`rounded-full flex items-center justify-center transition-all duration-1000 hover:scale-105 cursor-pointer ${
                  breathePhase === 'inhale'
                    ? 'w-36 h-36 sm:w-40 sm:h-40 bg-gradient-to-tr from-cyan-500 to-emerald-400 scale-100 shadow-[0_0_40px_rgba(6,182,212,0.6)] hover:shadow-[0_0_55px_rgba(6,182,212,0.85)]'
                    : breathePhase === 'hold'
                    ? 'w-36 h-36 sm:w-40 sm:h-40 bg-gradient-to-tr from-amber-400 to-yellow-300 scale-105 shadow-[0_0_50px_rgba(245,158,11,0.7)] hover:shadow-[0_0_65px_rgba(245,158,11,0.95)]'
                    : 'w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-500 scale-90 shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_35px_rgba(59,130,246,0.8)]'
                }`}
              >
                <div className="text-center text-slate-950 font-black">
                  <span className="text-3xl font-mono">{breatheSeconds}</span>
                  <span className="block text-[9px] uppercase font-bold tracking-widest mt-0.5">Detik</span>
                </div>
              </div>

              {/* Phase text label */}
              <div className="absolute -bottom-2 bg-slate-950/90 px-4 py-1.5 rounded-full border border-slate-700 hover:border-cyan-400 hover:scale-105 hover:shadow-[0_0_14px_rgba(6,182,212,0.4)] text-xs font-semibold shadow-lg transition-all duration-200">
                {breathePhase === 'inhale' && (
                  <span style={{ fontFamily: "'Pixelify Sans', sans-serif" }} className="text-cyan-300">Tarik Napas Dalam (Perut Mengembang)...</span>
                )}
                {breathePhase === 'hold' && (
                  <span style={{ fontFamily: "'Pixelify Sans', sans-serif" }} className="text-amber-300">Tahan Napas Sejenak (Simpan Ketenangan)...</span>
                )}
                {breathePhase === 'exhale' && (
                  <span style={{ fontFamily: "'Pixelify Sans', sans-serif" }} className="text-blue-300">Hembuskan Lembut Lewat Mulut (Lepaskan Beban)...</span>
                )}
              </div>
            </div>

            {/* Progress indicators */}
            <div className="flex items-center justify-center gap-2 pt-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200 hover:scale-105 cursor-default ${
                    step < breatheCycle || (step === breatheCycle && isBreatheFinished)
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:shadow-[0_0_12px_rgba(16,185,129,0.35)]'
                      : step === breatheCycle
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:shadow-[0_0_12px_rgba(245,158,11,0.35)]'
                      : 'bg-slate-800 text-slate-500 hover:border-slate-600'
                  }`}
                >
                  <Heart className="w-3 h-3" />
                  <span style={{ fontFamily: "'Pixelify Sans', sans-serif" }}>Putaran {step}</span>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-center gap-2 pt-1">
              {!isBreatheFinished ? (
                <>
                  <button
                    onClick={() => setIsBreathePaused((p) => !p)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 hover:border-slate-500 hover:scale-105 hover:shadow-[0_0_12px_rgba(100,116,139,0.4)] active:scale-95 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-all duration-200 cursor-pointer"
                  >
                    {isBreathePaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
                    <span style={{ fontFamily: "'Pixelify Sans', sans-serif" }}>{isBreathePaused ? 'Lanjutkan' : 'Jeda'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsBreatheFinished(true);
                      sound.playSuccessFanfare();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 hover:scale-105 hover:shadow-[0_0_18px_rgba(6,182,212,0.6)] active:scale-95 text-white text-xs font-semibold flex items-center gap-1 transition-all duration-200 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span style={{ fontFamily: "'Pixelify Sans', sans-serif" }}>Selesaikan Latihan</span>
                  </button>
                </>
              ) : (
                <button
                  id="complete-breathing-btn"
                  onClick={() => handleFinish('breathing')}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 hover:scale-110 hover:shadow-[0_0_25px_rgba(16,185,129,0.85)] active:scale-95 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-950/60 animate-bounce transition-all duration-200 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span style={{ fontFamily: "'Pixelify Sans', sans-serif" }}>Terapkan Ketenangan ke Karakter!</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* MODE 2: GROUNDING 5-4-3-2-1 PANCA INDERA */}
        {activeMode === 'grounding' && (
          <div className="space-y-3">
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-2.5 text-xs text-emerald-200">
              💡 <strong>Grounding Panca Indera</strong>: Menghubungkan kembali pikiran dengan dunia nyata di sekitar saat cemas atau marah melanda.
            </div>

            {/* Step Selector Breadcrumb */}
            <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
              <span style={{ fontFamily: "'Pixelify Sans', sans-serif" }} className="font-bold text-emerald-300">
                Langkah {groundingStep} dari 5:{' '}
                {groundingStep === 1 && '👁️ 5 Hal yang Dilihat'}
                {groundingStep === 2 && '✋ 4 Hal yang Disentuh'}
                {groundingStep === 3 && '👂 3 Suara yang Didengar'}
                {groundingStep === 4 && '👃 2 Aroma yang Dihirup'}
                {groundingStep === 5 && '👅 1 Rasa Syukur / Manis'}
              </span>
              <span style={{ fontFamily: "'Pixelify Sans', sans-serif" }} className="text-[11px] text-slate-400">Sentuh kartu untuk fokus</span>
            </div>

            {/* Step 1: 5 Hal yang Dilihat */}
            {groundingStep === 1 && (
              <div className="space-y-2">
                <p style={{ fontFamily: "'Pixelify Sans', sans-serif" }} className="text-xs text-slate-300">
                  Amati sekeliling desa! Klik <strong>5 objek</strong> berikut yang menarik perhatian matamu:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'sight_butterfly', label: '🦋 Kupu-kupu Biru Lembah' },
                    { id: 'sight_leaf', label: '🍃 Daun Berguguran di Angin' },
                    { id: 'sight_cloud', label: '☁️ Awan Putih Alun-Alun' },
                    { id: 'sight_compass', label: '🧭 Kilau Pusaka Kompas Hati' },
                    { id: 'sight_flower', label: '🌸 Bunga Liar di Tepi Jalan' },
                  ].map((item) => {
                    const isChecked = checkedSight.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (!isChecked) {
                            sound.playSensoryChime(523.25);
                            setCheckedSight((prev) => [...prev, item.id]);
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer flex items-center justify-between ${
                          isChecked
                            ? 'bg-emerald-900/60 border-emerald-400 text-emerald-200 shadow-[0_0_14px_rgba(16,185,129,0.35)]'
                            : 'bg-slate-800 hover:bg-slate-700/80 hover:border-emerald-400/50 hover:shadow-[0_0_12px_rgba(16,185,129,0.25)] border-slate-700 text-slate-300'
                        }`}
                      >
                        <span style={{ fontFamily: "'Pixelify Sans', sans-serif" }}>{item.label}</span>
                        {isChecked ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <div className="w-4 h-4 rounded-full border border-slate-600" />}
                      </button>
                    );
                  })}
                </div>
                {checkedSight.length === 5 && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setGroundingStep(2)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 hover:scale-105 hover:shadow-[0_0_18px_rgba(16,185,129,0.6)] active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all duration-200 cursor-pointer"
                    >
                      <span style={{ fontFamily: "'Pixelify Sans', sans-serif" }}>Lanjut: 4 Hal yang Disentuh</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: 4 Hal yang Disentuh */}
            {groundingStep === 2 && (
              <div className="space-y-2">
                <p style={{ fontFamily: "'Pixelify Sans', sans-serif" }} className="text-xs text-slate-300">
                  Rasakan sensasi fisik di tubuhmu! Klik <strong>4 sentuhan</strong> berikut:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'touch_wind', label: '💨 Hembusan Angin Sejuk di Pipi' },
                    { id: 'touch_ground', label: '🪨 Telapak Kaki Menjejak Batu Kokoh' },
                    { id: 'touch_cloth', label: '🧥 Kehangatan Kain Pakaian Petualang' },
                    { id: 'touch_hands', label: '🤲 Kedua Telapak Tangan Menyentuh Hangat' },
                  ].map((item) => {
                    const isChecked = checkedTouch.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (!isChecked) {
                            sound.playSensoryChime(587.33);
                            setCheckedTouch((prev) => [...prev, item.id]);
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer flex items-center justify-between ${
                          isChecked
                            ? 'bg-emerald-900/60 border-emerald-400 text-emerald-200 shadow-[0_0_14px_rgba(16,185,129,0.35)]'
                            : 'bg-slate-800 hover:bg-slate-700/80 hover:border-emerald-400/50 hover:shadow-[0_0_12px_rgba(16,185,129,0.25)] border-slate-700 text-slate-300'
                        }`}
                      >
                        <span style={{ fontFamily: "'Pixelify Sans', sans-serif" }}>{item.label}</span>
                        {isChecked ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <div className="w-4 h-4 rounded-full border border-slate-600" />}
                      </button>
                    );
                  })}
                </div>
                {checkedTouch.length === 4 && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setGroundingStep(3)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 hover:scale-105 hover:shadow-[0_0_18px_rgba(16,185,129,0.6)] active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all duration-200 cursor-pointer"
                    >
                      <span style={{ fontFamily: "'Pixelify Sans', sans-serif" }}>Lanjut: 3 Suara yang Didengar</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: 3 Suara yang Didengar */}
            {groundingStep === 3 && (
              <div className="space-y-2">
                <p style={{ fontFamily: "'Pixelify Sans', sans-serif" }} className="text-xs text-slate-300">
                  Dengarkan baik-baik irama desa! Klik <strong>3 suara</strong> alam ini:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'sound_water', label: '💧 Gemericik Air Mancur Alun-Alun', freq: 659.25 },
                    { id: 'sound_bird', label: '🐦 Kicau Burung Pagi di Dahan', freq: 783.99 },
                    { id: 'sound_leaves', label: '🍃 Desir Daun Pohon Purba', freq: 523.25 },
                  ].map((item) => {
                    const isChecked = checkedSound.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          sound.playSensoryChime(item.freq);
                          if (!isChecked) {
                            setCheckedSound((prev) => [...prev, item.id]);
                          }
                        }}
                        className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer flex items-center justify-between ${
                          isChecked
                            ? 'bg-emerald-900/60 border-emerald-400 text-emerald-200 shadow-[0_0_16px_rgba(6,182,212,0.45)]'
                            : 'bg-slate-800 hover:bg-slate-700/80 hover:border-cyan-400/50 hover:shadow-[0_0_14px_rgba(6,182,212,0.25)] border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Volume2 className="w-4 h-4 text-cyan-400 shrink-0" />
                          <span style={{ fontFamily: "'Pixelify Sans', sans-serif" }}>{item.label}</span>
                        </div>
                        {isChecked && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
                {checkedSound.length === 3 && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setGroundingStep(4)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 hover:scale-105 hover:shadow-[0_0_18px_rgba(16,185,129,0.6)] active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all duration-200 cursor-pointer"
                    >
                      <span style={{ fontFamily: "'Pixelify Sans', sans-serif" }}>Lanjut: 2 Aroma Segar</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: 2 Aroma Segar */}
            {groundingStep === 4 && (
              <div className="space-y-2">
                <p style={{ fontFamily: "'Pixelify Sans', sans-serif" }} className="text-xs text-slate-300">
                  Tarik napas perlahan lewat hidung. Rasakan <strong>2 aroma</strong> segar berikut:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'smell_rain', label: '🌧️ Aroma Tanah Basah Segar (Petrichor)' },
                    { id: 'smell_apple', label: '🍎 Wangi Manis Buah Apel dari Kebun' },
                  ].map((item) => {
                    const isChecked = checkedSmell.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (!isChecked) {
                            sound.playSensoryChime(698.46);
                            setCheckedSmell((prev) => [...prev, item.id]);
                          }
                        }}
                        className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer flex items-center justify-between ${
                          isChecked
                            ? 'bg-emerald-900/60 border-emerald-400 text-emerald-200 shadow-[0_0_14px_rgba(16,185,129,0.35)]'
                            : 'bg-slate-800 hover:bg-slate-700/80 hover:border-emerald-400/50 hover:shadow-[0_0_12px_rgba(16,185,129,0.25)] border-slate-700 text-slate-300'
                        }`}
                      >
                        <span style={{ fontFamily: "'Pixelify Sans', sans-serif" }}>{item.label}</span>
                        {isChecked ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <div className="w-4 h-4 rounded-full border border-slate-600" />}
                      </button>
                    );
                  })}
                </div>
                {checkedSmell.length === 2 && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setGroundingStep(5)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 hover:scale-105 hover:shadow-[0_0_18px_rgba(16,185,129,0.6)] active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all duration-200 cursor-pointer"
                    >
                      <span style={{ fontFamily: "'Pixelify Sans', sans-serif" }}>Lanjut: 1 Rasa Syukur</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 5: 1 Rasa Syukur / Manis */}
            {groundingStep === 5 && (
              <div className="space-y-3 text-center py-2">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 mx-auto flex items-center justify-center text-2xl hover:scale-110 hover:shadow-[0_0_20px_rgba(16,185,129,0.6)] transition-all duration-300 cursor-default">
                  🍵
                </div>
                <h4 style={{ fontFamily: "'Pixelify Sans', sans-serif" }} className="text-sm font-bold text-emerald-300">
                  1 Rasa Syukur & Kesejukan di Lidah
                </h4>
                <p style={{ fontFamily: "'Pixelify Sans', sans-serif" }} className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Teguk air segar, dan ingat satu hal yang membuatmu bersyukur hari ini: memiliki teman yang saling mendukung dan kesempatan untuk terus belajar.
                </p>

                {!hasCheckedTaste ? (
                  <button
                    onClick={() => {
                      setHasCheckedTaste(true);
                      setIsGroundingFinished(true);
                      sound.playSuccessFanfare();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 hover:scale-105 hover:shadow-[0_0_20px_rgba(16,185,129,0.7)] active:scale-95 text-white font-bold text-xs sm:text-sm shadow-lg transition-all duration-200 cursor-pointer"
                  >
                    <span style={{ fontFamily: "'Pixelify Sans', sans-serif" }}>Teguk Air & Rasakan Syukur ✨</span>
                  </button>
                ) : (
                  <div className="space-y-3 pt-2">
                    <div className="text-xs text-emerald-400 font-bold flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span style={{ fontFamily: "'Pixelify Sans', sans-serif" }}>Kelima Indera Telah Selaras! Pikiran Kembali Jernih & Terkendali.</span>
                    </div>
                    <button
                      id="complete-grounding-btn"
                      onClick={() => handleFinish('grounding')}
                      className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 hover:scale-110 hover:shadow-[0_0_25px_rgba(16,185,129,0.85)] active:scale-95 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-950/60 mx-auto animate-bounce transition-all duration-200 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span style={{ fontFamily: "'Pixelify Sans', sans-serif" }}>Terapkan Ketenangan Grounding!</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* MODE 3: REM OTAK S-T-O-P */}
        {activeMode === 'stop' && (
          <div className="space-y-3">
            <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-2.5 text-xs text-amber-200">
              🛑 <strong>Metode S-T-O-P</strong>: Rem darurat otak untuk menghentikan reaksi impulsif sebelum kita mengucapkan atau melakukan hal yang disesali.
            </div>

            {/* Step Indicators */}
            <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-bold">
              <div
                style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
                className={`p-1.5 rounded-lg border transition-all duration-200 hover:scale-105 cursor-default ${
                  stopStep === 'stop'
                    ? 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                    : isStopBraked
                    ? 'bg-slate-800 text-emerald-400'
                    : 'bg-slate-800/50 text-slate-500'
                }`}
              >
                S - STOP
              </div>
              <div
                style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
                className={`p-1.5 rounded-lg border transition-all duration-200 hover:scale-105 cursor-default ${
                  stopStep === 'take'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                    : breathHoldProgress >= 100
                    ? 'bg-slate-800 text-emerald-400'
                    : 'bg-slate-800/50 text-slate-500'
                }`}
              >
                T - TAKE BREATH
              </div>
              <div
                style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
                className={`p-1.5 rounded-lg border transition-all duration-200 hover:scale-105 cursor-default ${
                  stopStep === 'observe'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                    : observedFeeling
                    ? 'bg-slate-800 text-emerald-400'
                    : 'bg-slate-800/50 text-slate-500'
                }`}
              >
                O - OBSERVE
              </div>
              <div
                style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
                className={`p-1.5 rounded-lg border transition-all duration-200 hover:scale-105 cursor-default ${
                  stopStep === 'proceed'
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                    : selectedProceedAction
                    ? 'bg-slate-800 text-emerald-400'
                    : 'bg-slate-800/50 text-slate-500'
                }`}
              >
                P - PROCEED
              </div>
            </div>

            {/* S: STOP */}
            {stopStep === 'stop' && (
              <div className="text-center py-4 space-y-3">
                <p style={{ fontFamily: "'Pixelify Sans', sans-serif" }} className="text-xs text-slate-300 max-w-sm mx-auto">
                  Saat emosi meluap, jangan langsung bertindak! Tekan <strong>Rem Darurat</strong> untuk memberi jeda pada otak.
                </p>
                <button
                  onClick={() => {
                    sound.playStopBrake();
                    setIsStopBraked(true);
                    setStopStep('take');
                  }}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-black text-lg border-4 border-rose-300 shadow-[0_0_30px_rgba(244,63,94,0.6)] hover:shadow-[0_0_45px_rgba(244,63,94,0.95)] hover:scale-110 mx-auto flex flex-col items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer"
                >
                  <ShieldAlert className="w-8 h-8" />
                  <span style={{ fontFamily: "'Pixelify Sans', sans-serif" }} className="text-xs font-bold tracking-widest mt-1">STOP!</span>
                </button>
                <span style={{ fontFamily: "'Pixelify Sans', sans-serif" }} className="block text-[11px] text-rose-300 font-medium">
                  Klik untuk menginjak rem emosi
                </span>
              </div>
            )}

            {/* T: TAKE A BREATH */}
            {stopStep === 'take' && (
              <div className="text-center py-4 space-y-3">
                <p style={{ fontFamily: "'Pixelify Sans', sans-serif" }} className="text-xs text-slate-300 max-w-sm mx-auto">
                  Tahan tombol di bawah selama 2 detik untuk mengisi paru-paru dengan oksigen segar:
                </p>
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto flex items-center justify-center">
                  <div
                    className="w-full h-full rounded-full border-4 border-cyan-400/40 flex items-center justify-center transition hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                    style={{
                      background: `conic-gradient(#22d3ee ${breathHoldProgress}%, transparent 0)`,
                    }}
                  >
                    <button
                      onMouseDown={() => setIsHoldingBreath(true)}
                      onMouseUp={() => setIsHoldingBreath(false)}
                      onTouchStart={() => setIsHoldingBreath(true)}
                      onTouchEnd={() => setIsHoldingBreath(false)}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-900 border-2 border-cyan-300 text-cyan-200 text-xs font-bold flex flex-col items-center justify-center hover:scale-105 hover:shadow-[0_0_25px_rgba(6,182,212,0.8)] active:scale-95 transition-all duration-200 cursor-pointer"
                    >
                      <Wind className="w-6 h-6 mb-1 text-cyan-400" />
                      <span style={{ fontFamily: "'Pixelify Sans', sans-serif" }}>{breathHoldProgress > 0 ? `${breathHoldProgress}%` : 'Tahan & Napas'}</span>
                    </button>
                  </div>
                </div>
                <span style={{ fontFamily: "'Pixelify Sans', sans-serif" }} className="block text-[11px] text-cyan-300">
                  Tahan tombol sampai 100% penuh
                </span>
              </div>
            )}

            {/* O: OBSERVE */}
            {stopStep === 'observe' && (
              <div className="space-y-3">
                <p style={{ fontFamily: "'Pixelify Sans', sans-serif" }} className="text-xs text-slate-300">
                  Amati tubuhmu tanpa menghakimi. Apa yang paling kamu rasakan saat ini?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'feeling_heart', label: '💓 Dada Berdebar Cepat', note: 'Wajar, hormon adrenalin sedang aktif.' },
                    { id: 'feeling_muscle', label: '✊ Tangan Mengepal Tegang', note: 'Tubuh bersiap siaga, kendurkan perlahan.' },
                    { id: 'feeling_mind', label: '🌀 Pikiran Riuh Berputar', note: 'Tarik napas, pikiran itu seperti awan lewat.' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        sound.playSensoryChime(523.25);
                        setObservedFeeling(item.id);
                        setTimeout(() => setStopStep('proceed'), 600);
                      }}
                      className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer ${
                        observedFeeling === item.id
                          ? 'bg-amber-900/70 border-amber-400 text-amber-200 shadow-[0_0_16px_rgba(245,158,11,0.4)]'
                          : 'bg-slate-800 hover:bg-slate-700 hover:border-amber-400/50 hover:shadow-[0_0_14px_rgba(245,158,11,0.25)] border-slate-700 text-slate-300'
                      }`}
                    >
                      <div style={{ fontFamily: "'Pixelify Sans', sans-serif" }} className="font-bold mb-1">{item.label}</div>
                      <div style={{ fontFamily: "'Pixelify Sans', sans-serif" }} className="text-[10px] text-slate-400 font-normal leading-tight">{item.note}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* P: PROCEED */}
            {stopStep === 'proceed' && (
              <div className="space-y-3">
                <p style={{ fontFamily: "'Pixelify Sans', sans-serif" }} className="text-xs text-slate-300">
                  Langkah terakhir: <strong>Pilihlah Respons Bijak</strong> untuk menyelesaikan situasi:
                </p>
                <div className="space-y-2">
                  {[
                    { id: 'act_break', label: '⏸️ "Beri saya jeda waktu 2 menit untuk menenangkan diri."', detail: 'Menghindari perkataan kasar saat amarah memuncak.' },
                    { id: 'act_assertive', label: '🗣️ "Saya merasa kecewa, bisakah kita bicarakan ini baik-baik?"', detail: 'Komunikasi asertif yang jujur dan santun.' },
                    { id: 'act_help', label: '🤝 "Ayo kita cari solusi bersama atau minta nasihat guru/orang tua."', detail: 'Fokus pada penyelesaian masalah konstruktif.' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        sound.playSuccessFanfare();
                        setSelectedProceedAction(item.id);
                        setIsStopFinished(true);
                      }}
                      className={`w-full p-2.5 sm:p-3 rounded-xl border text-left text-xs font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer ${
                        selectedProceedAction === item.id
                          ? 'bg-emerald-900/80 border-emerald-400 text-emerald-200 shadow-[0_0_16px_rgba(16,185,129,0.4)]'
                          : 'bg-slate-800 hover:bg-slate-700/80 hover:border-emerald-400/50 hover:shadow-[0_0_12px_rgba(16,185,129,0.25)] border-slate-700 text-slate-300'
                      }`}
                    >
                      <div style={{ fontFamily: "'Pixelify Sans', sans-serif" }} className="font-bold">{item.label}</div>
                      <div style={{ fontFamily: "'Pixelify Sans', sans-serif" }} className="text-[10px] text-slate-400 font-normal mt-0.5">{item.detail}</div>
                    </button>
                  ))}
                </div>

                {isStopFinished && (
                  <div className="pt-2 text-center">
                    <button
                      id="complete-stop-btn"
                      onClick={() => handleFinish('stop')}
                      className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 hover:scale-110 hover:shadow-[0_0_25px_rgba(16,185,129,0.85)] active:scale-95 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-950/60 mx-auto animate-bounce transition-all duration-200 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span style={{ fontFamily: "'Pixelify Sans', sans-serif" }}>Terapkan Keputusan Bijak S-T-O-P!</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* MODE 4: GOYANG LEPAS KETEGANGAN (SHAKE-OUT KINESTETIK) */}
        {activeMode === 'shakeout' && (
          <div className="space-y-4 text-center">
            <p style={{ fontFamily: "'Pixelify Sans', sans-serif" }} className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
              Saat stres, tubuh menyimpan kelebihan hormon kortisol di otot bahu dan tangan. Goyangkan badan secara ritmis untuk melepaskan ketegangan fisik!
            </p>

            {/* Animated Character Avatar & Tension Gauge */}
            <div className="flex flex-col items-center justify-center my-2 space-y-2">
              <div
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-800 border-2 flex items-center justify-center text-4xl shadow-lg transition-transform hover:scale-110 ${
                  isShaking ? 'scale-110 -rotate-6 border-purple-400 bg-purple-950/60' : 'border-slate-700'
                }`}
              >
                {shakeTension > 50 ? '😖' : shakeTension > 15 ? '🙂' : '😄'}
              </div>

              <div className="w-full max-w-xs space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span style={{ fontFamily: "'Pixelify Sans', sans-serif" }} className="text-slate-400">Tingkat Ketegangan Otot:</span>
                  <span style={{ fontFamily: "'Pixelify Sans', sans-serif" }} className={shakeTension > 50 ? 'text-rose-400' : 'text-emerald-400'}>
                    {shakeTension}%
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className={`h-full transition-all duration-300 ${
                      shakeTension > 50 ? 'bg-rose-500' : shakeTension > 20 ? 'bg-amber-500' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${shakeTension}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Shake Button */}
            {!isShakeFinished ? (
              <div className="space-y-2">
                <button
                  id="shake-button"
                  onClick={() => {
                    sound.playTensionPop();
                    setIsShaking(true);
                    setTimeout(() => setIsShaking(false), 150);

                    setShakeCount((c) => c + 1);
                    setShakeTension((prev) => {
                      const next = Math.max(0, prev - 12);
                      if (next === 0) {
                        setIsShakeFinished(true);
                        sound.playSuccessFanfare();
                      }
                      return next;
                    });
                  }}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 hover:scale-105 hover:shadow-[0_0_25px_rgba(168,85,247,0.75)] text-white font-bold text-sm shadow-xl shadow-purple-950/60 border border-purple-300/40 active:scale-95 transition-all duration-200 flex items-center gap-2 mx-auto cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-yellow-300" />
                  <span style={{ fontFamily: "'Pixelify Sans', sans-serif" }}>Goyangkan Tangan & Bahu! ({Math.round((100 - shakeTension) / 12)} / 9)</span>
                </button>
                <span style={{ fontFamily: "'Pixelify Sans', sans-serif" }} className="block text-[11px] text-slate-400">
                  Ketuk tombol berulang-ulang untuk meluruhkan ketegangan otot
                </span>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                <div className="text-xs text-emerald-400 font-bold flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span style={{ fontFamily: "'Pixelify Sans', sans-serif" }}>Seluruh Otot Terasa Ringan, Lemas, dan Berenergi Positif!</span>
                </div>
                <button
                  id="complete-shakeout-btn"
                  onClick={() => handleFinish('shakeout')}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 hover:scale-110 hover:shadow-[0_0_25px_rgba(16,185,129,0.85)] active:scale-95 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-950/60 mx-auto animate-bounce transition-all duration-200 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span style={{ fontFamily: "'Pixelify Sans', sans-serif" }}>Terapkan Tubuh Rileks ke Karakter!</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span style={{ fontFamily: "'Pixelify Sans', sans-serif" }}>🧠 Berbasis Sains Pembelajaran Sosial Emosional (PSE)</span>
          <span style={{ fontFamily: "'Pixelify Sans', sans-serif" }} className="text-cyan-400 font-medium">Bisa diakses kapan saja dengan tombol [R]</span>
        </div>
      </div>
    </div>
  );
};
