import React, { useState, useEffect } from 'react';
import {
  X,
  Gamepad2,
  Compass,
  Heart,
  Sparkles,
  Footprints,
  MousePointerClick,
  MessageSquare,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Check,
  Play,
  RotateCcw,
  Clock,
  Wind,
  ShieldCheck,
  Eye,
  Smile,
} from 'lucide-react';
import { sound } from '../utils/audio';
import { useLanguage } from '../game/localization';

export interface GameTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteTutorial?: () => void;
  isInitialGameStart?: boolean;
}

export const GameTutorialModal: React.FC<GameTutorialModalProps> = ({
  isOpen,
  onClose,
  onCompleteTutorial,
  isInitialGameStart = false,
}) => {
  const { lang, ui } = useLanguage();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [alwaysShowOnStart, setAlwaysShowOnStart] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lembah_show_tutorial_on_start');
      return saved === null ? true : saved === 'true';
    }
    return true;
  });

  const totalSteps = 4;

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  // Keyboard navigation inside tutorial
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        sound.playMenuSelect();
        handleFinish();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        if (currentStep < totalSteps - 1) {
          sound.playMenuSelect();
          setCurrentStep((prev) => prev + 1);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        if (currentStep > 0) {
          sound.playMenuSelect();
          setCurrentStep((prev) => prev - 1);
        }
      } else if (e.key === 'Enter' || e.key === ' ') {
        if (currentStep === totalSteps - 1) {
          handleFinish();
        } else {
          sound.playMenuSelect();
          setCurrentStep((prev) => prev + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep, totalSteps]);

  const handleToggleAlwaysShow = () => {
    sound.playMenuSelect();
    setAlwaysShowOnStart((prev) => {
      const next = !prev;
      localStorage.setItem('lembah_show_tutorial_on_start', String(next));
      return next;
    });
  };

  const handleFinish = () => {
    sound.unlockAudio();
    sound.playSecretFound();
    if (onCompleteTutorial) {
      onCompleteTutorial();
    } else {
      onClose();
    }
  };

  const handleClose = () => {
    sound.playMenuSelect();
    if (onCompleteTutorial) {
      onCompleteTutorial();
    } else {
      onClose();
    }
  };

  const handleNext = () => {
    sound.playMenuSelect();
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    sound.playMenuSelect();
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-4 animate-backdrop-fade-in select-none">
      <div className="bg-slate-900 border-2 sm:border-3 border-amber-400/90 rounded-2xl sm:rounded-3xl max-w-2xl sm:max-w-3xl w-full max-h-[92vh] flex flex-col shadow-[0_0_50px_rgba(245,158,11,0.3)] text-slate-100 overflow-hidden modal-glow-frame animate-fade-in-slide-up relative">
        {/* Top Header Banner */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 border-b border-amber-500/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-300 shadow-sm animate-pulse">
              <Gamepad2 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-pixel text-amber-400 uppercase tracking-widest">
                  {lang === 'en' ? 'PUPIL ADVENTURE GUIDE' : 'PANDUAN PETUALANG CILIK'}
                </span>
                <span className="text-[9px] font-pixel px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40">
                  {lang === 'en' ? `Step ${currentStep + 1} of ${totalSteps}` : `Langkah ${currentStep + 1} dari ${totalSteps}`}
                </span>
              </div>
              <h2
                style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
                className="font-bold text-base sm:text-lg text-amber-200 tracking-wide mt-0.5"
              >
                {lang === 'en' ? 'How to Play & Game Controls' : 'Panduan Kontrol & Cara Bermain'}
              </h2>
            </div>
          </div>

          <button
            id="btn-close-tutorial-modal"
            onClick={handleClose}
            aria-label={lang === 'en' ? 'Close tutorial' : 'Tutup tutorial'}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-rose-950/50 hover:scale-110 transition cursor-pointer"
            title={lang === 'en' ? 'Skip tutorial' : 'Lewati tutorial'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Tabs Navigation */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 p-2.5 sm:p-3 bg-slate-950/90 border-b border-slate-800 shrink-0 text-xs">
          {/* Tab 1 */}
          <button
            onClick={() => {
              sound.playMenuSelect();
              setCurrentStep(0);
            }}
            className={`py-2 px-1 rounded-xl font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer ${
              currentStep === 0
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30 ring-2 ring-amber-400/50'
                : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Footprints className="w-4 h-4 shrink-0" />
            <span className="truncate text-[10px] sm:text-xs">
              {lang === 'en' ? '1. Movement' : '1. Pergerakan'}
            </span>
          </button>

          {/* Tab 2 */}
          <button
            onClick={() => {
              sound.playMenuSelect();
              setCurrentStep(1);
            }}
            className={`py-2 px-1 rounded-xl font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer ${
              currentStep === 1
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30 ring-2 ring-amber-400/50'
                : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span className="truncate text-[10px] sm:text-xs">
              {lang === 'en' ? '2. Interact' : '2. Interaksi'}
            </span>
          </button>

          {/* Tab 3 */}
          <button
            onClick={() => {
              sound.playMenuSelect();
              setCurrentStep(2);
            }}
            className={`py-2 px-1 rounded-xl font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer ${
              currentStep === 2
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30 ring-2 ring-amber-400/50'
                : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Compass className="w-4 h-4 shrink-0" />
            <span className="truncate text-[10px] sm:text-xs">
              {lang === 'en' ? '3. Compass' : '3. Kompas Hati'}
            </span>
          </button>

          {/* Tab 4 */}
          <button
            onClick={() => {
              sound.playMenuSelect();
              setCurrentStep(3);
            }}
            className={`py-2 px-1 rounded-xl font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer ${
              currentStep === 3
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30 ring-2 ring-amber-400/50'
                : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Clock className="w-4 h-4 shrink-0" />
            <span className="truncate text-[10px] sm:text-xs">
              {lang === 'en' ? '4. Missions' : '4. Misi Jam'}
            </span>
          </button>
        </div>

        {/* Modal Body / Carousel Content with Custom Scrollbar */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
          {/* STEP 1: CARA BERGERAK & NAVIGASI */}
          {currentStep === 0 && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-gradient-to-r from-amber-500/10 via-slate-800 to-amber-500/10 border border-amber-400/30 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="text-xl">🏃</span>
                  <h3 className="font-bold text-base sm:text-lg text-amber-200">
                    {lang === 'en'
                      ? 'Character Movement & World Navigation'
                      : 'Cara Berjalan & Menjelajahi Desa'}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {lang === 'en'
                    ? 'You can control your adventurer (Ezzel or Ezzy) freely across the village using Keyboard, Mouse Click, or Virtual Joystick on touchscreen devices.'
                    : 'Kamu dapat mengendalikan pahlawanmu (Ezzel atau Ezzy) menjelajahi seluruh sudut desa menggunakan Keyboard, Klik Mouse pada layar, atau Virtual Joystick di HP/Tablet.'}
                </p>
              </div>

              {/* Grid 3 Movement Methods */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Method 1: Keyboard WASD */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-2.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Gamepad2 className="w-4 h-4 text-amber-400" />
                        {lang === 'en' ? 'Keyboard' : 'Tombol Keyboard'}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                        WASD / Panah
                      </span>
                    </div>

                    {/* Pixel Keycaps illustration */}
                    <div className="flex flex-col items-center gap-1 py-1">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 border-2 border-amber-400/80 shadow-[0_2px_0_#b45309] flex items-center justify-center font-pixel text-xs text-amber-300 font-bold">
                        W
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 border-2 border-amber-400/80 shadow-[0_2px_0_#b45309] flex items-center justify-center font-pixel text-xs text-amber-300 font-bold">
                          A
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-slate-800 border-2 border-amber-400/80 shadow-[0_2px_0_#b45309] flex items-center justify-center font-pixel text-xs text-amber-300 font-bold">
                          S
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-slate-800 border-2 border-amber-400/80 shadow-[0_2px_0_#b45309] flex items-center justify-center font-pixel text-xs text-amber-300 font-bold">
                          D
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed text-center">
                    {lang === 'en'
                      ? 'Press [W][A][S][D] or Arrow Keys to move in 4 directions.'
                      : 'Tekan [W] Maju, [A] Kiri, [S] Mundur, [D] Kanan, atau tombol Panah.'}
                  </p>
                </div>

                {/* Method 2: Click to Walk / Pathfinding */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-2.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                        <MousePointerClick className="w-4 h-4 text-cyan-400" />
                        {lang === 'en' ? 'Click-to-Move' : 'Klik / Ketuk'}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                        Otomatis
                      </span>
                    </div>

                    {/* Click illustration */}
                    <div className="h-16 bg-slate-900/80 rounded-xl border border-dashed border-cyan-500/40 flex flex-col items-center justify-center text-cyan-300 gap-1 py-1">
                      <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center animate-bounce">
                        <MousePointerClick className="w-4 h-4 text-cyan-300" />
                      </div>
                      <span className="text-[10px] font-pixel text-cyan-200">
                        {lang === 'en' ? 'Smart Path' : 'Cari Jalan Otomatis'}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed text-center">
                    {lang === 'en'
                      ? 'Click or tap anywhere on the path. Character walks automatically avoiding obstacles.'
                      : 'Klik lantai/tanah di mana saja. Karakter akan berjalan otomatis menghindari pohon.'}
                  </p>
                </div>

                {/* Method 3: Mobile Touch Joystick */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-2.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        {lang === 'en' ? 'Virtual Stick' : 'Joystick HP/Tablet'}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                        Touchscreen
                      </span>
                    </div>

                    {/* Joystick illustration */}
                    <div className="h-16 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full border-2 border-emerald-500/40 bg-emerald-950/40 flex items-center justify-center relative">
                        <div className="w-6 h-6 rounded-full bg-emerald-500 border border-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse" />
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed text-center">
                    {lang === 'en'
                      ? 'On mobile or tablet, slide the virtual analog joystick on the bottom-left of screen.'
                      : 'Di layar sentuh HP/Tablet, geser analog joystick di pojok kiri bawah dengan jempol.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: INTERAKSI & BERBICARA DENGAN WARGA */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-gradient-to-r from-amber-500/10 via-slate-800 to-amber-500/10 border border-amber-400/30 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="text-xl">💬</span>
                  <h3 className="font-bold text-base sm:text-lg text-amber-200">
                    {lang === 'en'
                      ? 'Interacting & Conversing with Villagers'
                      : 'Cara Berbicara & Membantu Warga'}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {lang === 'en'
                    ? 'When you approach a villager, a speech bubble or action prompt will appear. Dialogue choices directly affect your empathy score and help heal misunderstanding!'
                    : 'Ketika kamu mendekati warga desa, ikon balon dialog akan muncul. Pilihan katamu akan memengaruhi respon emosi mereka dan skor empati petualanganmu!'}
                </p>
              </div>

              {/* 3 Step Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/50 flex items-center justify-center font-pixel text-xs text-amber-300 font-bold">
                    [E]
                  </div>
                  <h4 className="font-bold text-xs text-amber-200">
                    {lang === 'en' ? '1. Approach & Talk' : '1. Dekati & Bicara'}
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {lang === 'en'
                      ? 'Walk close to a resident, then press [E] on keyboard or tap directly on the character.'
                      : 'Dekati karakter warga, lalu tekan tombol [E] atau klik langsung pada karakter tersebut.'}
                  </p>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center font-pixel text-[10px] text-cyan-300 font-bold">
                    [SPACE]
                  </div>
                  <h4 className="font-bold text-xs text-cyan-200">
                    {lang === 'en' ? '2. Continue Story' : '2. Lanjut Membaca'}
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {lang === 'en'
                      ? 'Press [Spacebar] or click anywhere in the dialogue box to proceed through the conversation.'
                      : 'Tekan [Spasi] atau klik di dalam kotak dialog untuk melanjutkan percakapan kalimat demi kalimat.'}
                  </p>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center font-pixel text-xs text-emerald-300 font-bold">
                    1 - 5
                  </div>
                  <h4 className="font-bold text-xs text-emerald-200">
                    {lang === 'en' ? '3. Choose Response' : '3. Pilih Respon'}
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {lang === 'en'
                      ? 'Select empathetic choices using number keys [1] - [5] or click the response cards.'
                      : 'Pilih kalimat respon yang paling menenangkan dengan menekan angka [1] - [5] atau klik kartu pilihan.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: KOMPAS RESONANSI HATI & REGULASI EMOSI */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-gradient-to-r from-amber-500/10 via-slate-800 to-amber-500/10 border border-amber-400/30 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="text-xl">🧭</span>
                  <h3 className="font-bold text-base sm:text-lg text-amber-200">
                    {lang === 'en'
                      ? 'Compass of Heart Resonance & Emotion Regulation'
                      : 'Kompas Resonansi Hati & Regulasi Emosi'}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {lang === 'en'
                    ? 'This game introduces Social Emotional Learning (SEL). Empathy begins when you look beneath surface behaviors to see what someone truly feels inside.'
                    : 'Game ini mengajarkan Pembelajaran Sosial Emosional (PSE). Empati sejati bermula saat kita tidak terpancing emosi luar, melainkan memahami perasaan di lubuk hati.'}
                </p>
              </div>

              {/* 2 Feature Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Feature 1: Compass */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-amber-400" />
                      {lang === 'en' ? 'Compass of Heart [C]' : 'Kompas Resonansi Hati [C]'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40 font-pixel">
                      Pusaka Ajaib
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200">
                      <strong className="block text-red-300 text-[11px] mb-0.5">
                        🔴 Emosi Luar (Surface Emotion):
                      </strong>
                      <span>Perilaku tampak seperti membentak, cemberut, atau menarik diri.</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-teal-950/40 border border-teal-500/40 text-teal-200">
                      <strong className="block text-teal-300 text-[11px] mb-0.5">
                        💙 Emosi Dalam (Core Emotion):
                      </strong>
                      <span>Perasaan sejati seperti takut gagal, lelah, kesepian, atau butuh dihargai.</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 italic">
                    {lang === 'en'
                      ? 'Press [C] or click the compass icon on bottom toolbar anytime.'
                      : 'Tekan tombol [C] atau klik ikon kompas di toolbar bawah kapan saja.'}
                  </p>
                </div>

                {/* Feature 2: Emotion Regulation Studio */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Wind className="w-4 h-4 text-emerald-400" />
                      {lang === 'en' ? 'Calming Studio [R]' : 'Studio Regulasi Emosi [R]'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-pixel">
                      Mindfulness
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span>🎈</span>
                      <div>
                        <strong className="text-amber-200">Napas Balon (4-4-6):</strong>
                        <span className="text-[11px] text-slate-400 block">Tarik napas dalam, tahan, lalu hembuskan perlahan.</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span>👁️</span>
                      <div>
                        <strong className="text-cyan-200">Grounding 5-4-3-2-1:</strong>
                        <span className="text-[11px] text-slate-400 block">Fokuskan panca indra ke lingkungan sekitar.</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span>🛑</span>
                      <div>
                        <strong className="text-rose-200">Metode S.T.O.P:</strong>
                        <span className="text-[11px] text-slate-400 block">Berhenti sejenak, ambil napas jeda, lalu respon bijak.</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 italic">
                    {lang === 'en'
                      ? 'Press [R] to practice mindful calming exercises anytime.'
                      : 'Tekan tombol [R] untuk melatih pernapasan ketenangan kapan saja.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: MISI 12 KOMPONEN JAM & RESTORASI WARNA */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-gradient-to-r from-amber-500/10 via-slate-800 to-amber-500/10 border border-amber-400/30 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="text-xl">🏆</span>
                  <h3 className="font-bold text-base sm:text-lg text-amber-200">
                    {lang === 'en'
                      ? 'Main Objective: Restore 12 Clock Components'
                      : 'Tujuan Utama: Kumpulkan 12 Komponen Jam'}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {lang === 'en'
                    ? 'The valley turned gray when the clock stopped. Gather all 12 components from the 12 villagers, assemble the tower with Elder Wilis, and bring back the vibrant rainbow colors!'
                    : 'Seluruh desa kehilangan warnanya saat jam berhenti. Kumpulkan ke-12 komponen dari para warga, rakit kembali menara jam bersama Nenek Wilis, dan kembalikan warna pelangi desa 100%!'}
                </p>
              </div>

              {/* 3 Quick Helper Banners */}
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
                  <span className="text-lg">📌</span>
                  <div>
                    <strong className="text-amber-300 block">Tab Misi di Bagian Atas Layar:</strong>
                    <span className="text-slate-300 text-[11px]">
                      Lihat petunjuk langkah aktif di tab atas layar. Tekan tombol <strong>[Tuntun 🏃]</strong> agar karaktermu dibimbing otomatis berjalan ke target misi berikutnya tanpa tersesat!
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
                  <span className="text-lg">🗺️</span>
                  <div>
                    <strong className="text-cyan-300 block">Peta Mini Desa [M]:</strong>
                    <span className="text-slate-300 text-[11px]">
                      Tekan tombol [M] untuk melihat posisi warga, zona yang sudah pulih warnanya, dan lokasi menara jam.
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
                  <span className="text-lg">📖</span>
                  <div>
                    <strong className="text-emerald-300 block">Buku Jurnal Kompas [J] & Unduh PDF:</strong>
                    <span className="text-slate-300 text-[11px]">
                      Tekan [J] untuk membaca kisah lore lengkap, melihat tas komponen jam, lencana, serta mengunduh Buku Panduan Resmi dalam format PDF di menu Pengaturan.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Controls & Pagination */}
        <div className="px-5 py-3.5 bg-slate-950/95 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Left: Always show toggle checkbox */}
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 hover:text-white transition">
            <input
              type="checkbox"
              checked={alwaysShowOnStart}
              onChange={handleToggleAlwaysShow}
              className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
            />
            <span className="text-[11px]">
              {lang === 'en'
                ? 'Show tutorial on new game start'
                : 'Tampilkan panduan ini setiap mulai game baru'}
            </span>
          </label>

          {/* Right: Prev, Step Dots, Next / Start Button */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {currentStep > 0 && (
              <button
                type="button"
                id="btn-tutorial-prev"
                onClick={handlePrev}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-300" />
                <span>{lang === 'en' ? 'Back' : 'Sebelumnya'}</span>
              </button>
            )}

            {currentStep < totalSteps - 1 ? (
              <button
                type="button"
                id="btn-tutorial-next"
                onClick={handleNext}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-md transition cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <span>{lang === 'en' ? 'Next' : 'Selanjutnya'}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
              </button>
            ) : (
              <button
                type="button"
                id="btn-tutorial-finish"
                onClick={handleFinish}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-black shadow-[0_0_18px_rgba(16,185,129,0.5)] transition-all cursor-pointer flex items-center gap-2 active:scale-95 animate-pulse"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950 text-slate-950 shrink-0" />
                <span>
                  {isInitialGameStart
                    ? (lang === 'en' ? 'Start Adventure Now! 🚀' : 'Mulai Petualangan Sekarang! 🚀')
                    : (lang === 'en' ? 'I Understand, Let’s Play! 🚀' : 'Saya Mengerti, Ayo Main! 🚀')}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
