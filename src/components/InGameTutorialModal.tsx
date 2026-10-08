import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Compass,
  Sparkles,
  Footprints,
  MessageCircle,
  Heart,
  Wind,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  Gamepad2,
  HelpCircle,
  Lightbulb,
  MousePointer,
  Smartphone,
  Layers,
  MapPin,
  Smile,
  ShieldCheck,
  Eye,
  Award,
} from 'lucide-react';
import { sound } from '../utils/audio';
import { useLanguage } from '../game/localization';

export interface InGameTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStep?: number; // 1 to 5
  onNavigateToFirstQuest?: () => void;
}

export const InGameTutorialModal: React.FC<InGameTutorialModalProps> = ({
  isOpen,
  onClose,
  initialStep = 1,
  onNavigateToFirstQuest,
}) => {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<'steps' | 'controls'>('steps');
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(false);
  const [testedKey, setTestedKey] = useState<string | null>(null);

  // Sync initial step when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(Math.max(1, Math.min(5, initialStep)));
      setActiveTab('steps');
      const seen = localStorage.getItem('lembah_tutorial_autoshown');
      setDontShowAgain(seen === 'true');
    }
  }, [isOpen, initialStep]);

  // Handle keyboard navigation inside the tutorial
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Test interactive key feedback
      const keyUpper = e.key.toUpperCase();
      if (['W', 'A', 'S', 'D', 'C', 'R', 'M', 'J', 'O', ' '].includes(keyUpper) || e.key.startsWith('Arrow')) {
        setTestedKey(e.key === ' ' ? 'SPACE' : keyUpper);
        setTimeout(() => setTestedKey(null), 800);
      }

      if (e.key === 'Escape') {
        sound.playMenuSelect();
        handleClose();
      } else if (e.key === 'ArrowRight' && activeTab === 'steps') {
        if (currentStep < 5) {
          sound.playVoiceBlip();
          setCurrentStep((prev) => prev + 1);
        }
      } else if (e.key === 'ArrowLeft' && activeTab === 'steps') {
        if (currentStep > 1) {
          sound.playVoiceBlip();
          setCurrentStep((prev) => prev - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeTab, currentStep]);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('lembah_tutorial_autoshown', 'true');
    }
    sound.playMenuSelect();
    onClose();
  };

  const handleNextStep = () => {
    if (currentStep < 5) {
      sound.playVoiceBlip();
      setCurrentStep((prev) => prev + 1);
    } else {
      sound.playSecretFound();
      handleClose();
      if (onNavigateToFirstQuest) {
        onNavigateToFirstQuest();
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      sound.playVoiceBlip();
      setCurrentStep((prev) => prev - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="in-game-tutorial-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-4 select-none animate-backdrop-fade-in"
      onClick={handleClose}
    >
      <div
        className="relative bg-slate-900 border-2 border-amber-400/90 rounded-2xl sm:rounded-3xl max-w-2xl sm:max-w-3xl w-full max-h-[92vh] flex flex-col shadow-[0_0_50px_rgba(245,158,11,0.25)] text-slate-100 overflow-hidden modal-glow-frame animate-fade-in-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-5 py-3.5 sm:py-4 bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/70 border-b border-amber-500/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/30 shrink-0">
              <HelpCircle className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/40">
                  {lang === 'en' ? 'GAMEPLAY GUIDE' : 'PANDUAN LENGKAP CARA BERMAIN'}
                </span>
                <span className="text-[10px] font-pixel text-emerald-400 hidden sm:inline">
                  • {lang === 'en' ? 'SEL Adventure' : 'Petualangan PSE'}
                </span>
              </div>
              <h2
                style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
                className="text-base sm:text-xl font-bold text-amber-200 tracking-wide mt-0.5"
              >
                {lang === 'en' ? 'Valley of Harmony: How to Play' : 'Tutorial Petualang Lembah Nada Rasa'}
              </h2>
            </div>
          </div>

          <button
            id="btn-close-tutorial-modal"
            onClick={handleClose}
            aria-label="Tutup Tutorial"
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition active:scale-95 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection Bar */}
        <div className="flex items-center bg-slate-950/90 border-b border-slate-800 px-3 sm:px-5 py-2 gap-1.5 sm:gap-2 shrink-0 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => {
              sound.playVoiceBlip();
              setActiveTab('steps');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'steps'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700'
            }`}
          >
            <Footprints className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? '5 Core Steps' : '5 Langkah Petualang'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-900/60 text-amber-200 ml-1">
              {currentStep}/5
            </span>
          </button>

          <button
            onClick={() => {
              sound.playVoiceBlip();
              setActiveTab('controls');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'controls'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Controls Cheat Sheet' : 'Pintasan Tombol Cepat'}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
          {/* TAB 1: 5 CORE STEPS */}
          {activeTab === 'steps' && (
            <div className="space-y-4">
              {/* Step Navigation Pill Indicators */}
              <div className="flex items-center justify-between gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-amber-300">
                  {lang === 'en' ? `Step ${currentStep} of 5:` : `Langkah ${currentStep} dari 5:`}
                </span>
                <div className="flex items-center gap-1 sm:gap-2">
                  {[1, 2, 3, 4, 5].map((stepNum) => (
                    <button
                      key={stepNum}
                      onClick={() => {
                        sound.playVoiceBlip();
                        setCurrentStep(stepNum);
                      }}
                      className={`h-7 px-2.5 sm:px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                        currentStep === stepNum
                          ? 'bg-amber-400 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.5)] scale-105'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                      }`}
                    >
                      <span>{stepNum}</span>
                      <span className="hidden md:inline text-[10px]">
                        {stepNum === 1
                          ? (lang === 'en' ? 'Move' : 'Jalan')
                          : stepNum === 2
                          ? (lang === 'en' ? 'Interact' : 'Bicara')
                          : stepNum === 3
                          ? (lang === 'en' ? 'Compass' : 'Kompas')
                          : stepNum === 4
                          ? (lang === 'en' ? 'Calm' : 'Regulasi')
                          : (lang === 'en' ? 'Mission' : 'Misi')}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* STEP 1: BERGERAK & MENJELAJAH */}
              {currentStep === 1 && (
                <div className="bg-slate-950/70 border border-amber-500/30 rounded-2xl p-4 sm:p-5 space-y-4 animate-fade-in">
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-amber-500/20 border border-amber-400/40 rounded-xl text-amber-300 shrink-0">
                      <Footprints className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base sm:text-lg text-amber-200">
                        {lang === 'en' ? '1. Move & Explore the Valley' : '1. Bergerak & Menjelajahi Lembah'}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                        {lang === 'en'
                          ? 'Guide your character (Ezzel / Ezzy) across the village plaza, riverside bridge, pine forest, and clock tower!'
                          : 'Kendalikan karaktermu (Ezzel / Ezzy) menyusuri plaza desa, jembatan sungai, hutan pinus, hingga puncak menara jam!'}
                      </p>
                    </div>
                  </div>

                  {/* 3 Movement Options Display */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    {/* Keyboard Controls */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-300 mb-2">
                          <Gamepad2 className="w-4 h-4 text-amber-400" />
                          <span>Keyboard (PC / Laptop)</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mb-3">
                          {lang === 'en' ? 'Use WASD keys or arrow keys:' : 'Gunakan tombol WASD atau tombol panah:'}
                        </p>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="px-2.5 py-1 bg-slate-800 border-2 border-slate-600 rounded text-xs font-mono font-bold text-amber-300 shadow">
                          W / ↑
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="px-2.5 py-1 bg-slate-800 border-2 border-slate-600 rounded text-xs font-mono font-bold text-amber-300 shadow">
                            A / ←
                          </div>
                          <div className="px-2.5 py-1 bg-slate-800 border-2 border-slate-600 rounded text-xs font-mono font-bold text-amber-300 shadow">
                            S / ↓
                          </div>
                          <div className="px-2.5 py-1 bg-slate-800 border-2 border-slate-600 rounded text-xs font-mono font-bold text-amber-300 shadow">
                            D / →
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Point & Click */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 mb-2">
                          <MousePointer className="w-4 h-4 text-cyan-400" />
                          <span>Klik Lantai (Pathfinding)</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mb-2">
                          {lang === 'en'
                            ? 'Click or tap anywhere on the ground. Character will auto-walk around obstacles!'
                            : 'Klik atau ketuk di lantai mana saja. Karakter akan otomatis berjalan menghindari rintangan!'}
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-cyan-950/50 border border-cyan-800/60 text-center text-[10.5px] text-cyan-200 font-medium">
                        ✨ {lang === 'en' ? 'Smart Auto-Pathfinding' : 'Navigasi Otomatis Pintar'}
                      </div>
                    </div>

                    {/* Mobile Joystick */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 mb-2">
                          <Smartphone className="w-4 h-4 text-emerald-400" />
                          <span>Joystick Layar Sentuh (HP)</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mb-2">
                          {lang === 'en'
                            ? 'Touch and drag the analog thumbstick at the bottom-left corner on mobile/tablet.'
                            : 'Sentuh dan geser analog virtual di sudut kiri bawah layar HP atau tablet.'}
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-emerald-950/50 border border-emerald-800/60 text-center text-[10.5px] text-emerald-200 font-medium">
                        🕹️ {lang === 'en' ? 'Analog 360° Joystick' : 'Joystick Analog 360°'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: MENEMUKAN & BERINTERAKSI DENGAN WARGA */}
              {currentStep === 2 && (
                <div className="bg-slate-950/70 border border-amber-500/30 rounded-2xl p-4 sm:p-5 space-y-4 animate-fade-in">
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-rose-500/20 border border-rose-400/40 rounded-xl text-rose-300 shrink-0">
                      <MessageCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base sm:text-lg text-amber-200">
                        {lang === 'en' ? '2. Meet Villagers & Start Conversations' : '2. Menemui & Mengobrol dengan Warga Desa'}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                        {lang === 'en'
                          ? '13 unique villagers live in the Valley! When someone is upset or carrying a clock part, a speech bubble appears above their head.'
                          : 'Terdapat 13 warga unik di Lembah! Ketika seorang warga sedang mengalami emosi berat atau memegang komponen jam, balon dialog akan muncul di atas kepalanya.'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {/* Cara Bicara */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
                      <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>{lang === 'en' ? 'How to Talk:' : 'Cara Berinteraksi:'}</span>
                      </div>
                      <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
                        <li>
                          {lang === 'en'
                            ? 'Walk close to a villager until interaction icon appears.'
                            : 'Dekati warga sampai tombol interaksi muncul.'}
                        </li>
                        <li>
                          {lang === 'en'
                            ? 'Press '
                            : 'Tekan '}
                          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-amber-300 font-mono font-bold">
                            SPASI
                          </kbd>{' '}
                          {lang === 'en' ? 'or click/tap on the villager.' : 'atau klik/sentuh warga secara langsung.'}
                        </li>
                        <li>
                          {lang === 'en'
                            ? 'On mobile: Tap the round '
                            : 'Pada HP: Ketuk tombol bulat '}
                          <span className="font-bold text-amber-300">[Aksi / Bicara]</span>{' '}
                          {lang === 'en' ? 'button on the right.' : 'di kanan bawah layar.'}
                        </li>
                      </ul>
                    </div>

                    {/* Mengenal Aura Emosi */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
                      <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <Heart className="w-4 h-4 text-rose-400" />
                        <span>{lang === 'en' ? 'Emotion Auras above Villagers:' : 'Aura Emosi di Atas Warga:'}</span>
                      </div>
                      <div className="space-y-1.5 text-[11px]">
                        <div className="flex items-center gap-2 p-1.5 rounded bg-rose-950/40 border border-rose-800/40 text-rose-200">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
                          <span><strong>Merah Berapi:</strong> Marah, jengkel, atau frustrasi</span>
                        </div>
                        <div className="flex items-center gap-2 p-1.5 rounded bg-sky-950/40 border border-sky-800/40 text-sky-200">
                          <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse shrink-0" />
                          <span><strong>Biru Bergetar:</strong> Panik, cemas, atau sedih sendirian</span>
                        </div>
                        <div className="flex items-center gap-2 p-1.5 rounded bg-emerald-950/40 border border-emerald-800/40 text-emerald-200">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                          <span><strong>Hijau Bersinar:</strong> Tenang, gembira, dan beresolusi</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: MENGGUNAKAN KOMPAS RESONANSI HATI */}
              {currentStep === 3 && (
                <div className="bg-slate-950/70 border border-amber-500/30 rounded-2xl p-4 sm:p-5 space-y-4 animate-fade-in">
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-amber-500/20 border border-amber-400/40 rounded-xl text-amber-300 shrink-0">
                      <Compass className="w-6 h-6 animate-spin-slow" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base sm:text-lg text-amber-200">
                        {lang === 'en' ? '3. Activate Heart Resonance Compass' : '3. Aktifkan Kompas Resonansi Hati'}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                        {lang === 'en'
                          ? 'The ancient Heart Compass reveals hidden emotions behind harsh words using the Emotional Iceberg concept!'
                          : 'Kompas Resonansi Hati adalah pusaka ajaib yang mengungkap emosi tersembunyi di balik kata-kata kasar warga menggunakan Konsep Gunung Es Emosi!'}
                      </p>
                    </div>
                  </div>

                  {/* Iceberg Concept Diagram Card */}
                  <div className="bg-gradient-to-r from-blue-950/60 via-slate-900 to-amber-950/50 border border-blue-500/30 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-blue-400" />
                        <span>Gunung Es Emosi (Iceberg Theory)</span>
                      </span>
                      <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40">
                        Tombol [C]
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-700/80">
                        <div className="text-rose-400 font-bold mb-1 flex items-center gap-1">
                          <span>🌊</span>
                          <span>Emosi Permukaan (Tampak Luar)</span>
                        </div>
                        <p className="text-slate-400 text-[11px] leading-relaxed">
                          Teriakan, membentak, panik teriak-teriak, atau mengurung diri. Banyak orang salah paham karena hanya melihat permukaan ini.
                        </p>
                      </div>

                      <div className="bg-slate-900/90 p-3 rounded-lg border border-emerald-500/40">
                        <div className="text-emerald-300 font-bold mb-1 flex items-center gap-1">
                          <span>🧭</span>
                          <span>Suara Hati Terdalam (Terbaca Kompas)</span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          Rasa takut disalahkan, lelah bekerja keras sendirian, butuh dihargai, atau rindu teman. Responi suara hati terdalam ini untuk meraih <strong>+10 s/d +20 Poin Empati</strong>!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: STUDIO REGULASI EMOSI */}
              {currentStep === 4 && (
                <div className="bg-slate-950/70 border border-amber-500/30 rounded-2xl p-4 sm:p-5 space-y-4 animate-fade-in">
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-cyan-500/20 border border-cyan-400/40 rounded-xl text-cyan-300 shrink-0">
                      <Wind className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base sm:text-lg text-amber-200">
                        {lang === 'en' ? '4. Emotion Regulation Studio (4 Calming Modes)' : '4. Studio Regulasi Emosi (4 Teknik Menenangkan Diri)'}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                        {lang === 'en'
                          ? 'When a villager is overwhelmed, guide them through an interactive relaxation exercise before solving problems!'
                          : 'Ketika warga mengalami banjir emosi, ajak mereka melakukan latihan relaksasi interaktif sebelum mencari solusi bersama!'}
                      </p>
                    </div>
                  </div>

                  {/* 4 Regulation Modes Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                    <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 space-y-1">
                      <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                        <span>🌬️</span>
                        <span>Napas Kotak Balon (4-4-4)</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Tarik napas 4 detik saat balon mengembang, tahan 4 detik, lalu hembuskan perlahan 4 detik. Menurunkan detak jantung seketika.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 space-y-1">
                      <div className="font-bold text-amber-300 flex items-center gap-1.5">
                        <span>👁️</span>
                        <span>Grounding Panca Indra 5-4-3-2-1</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Mengamati 5 benda di sekitar, 4 sentuhan, 3 suara, 2 aroma, dan 1 rasa untuk menghentikan serangan cemas.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 space-y-1">
                      <div className="font-bold text-rose-300 flex items-center gap-1.5">
                        <span>🛑</span>
                        <span>Jeda Darurat STOP</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        <strong>S</strong>top sejenak, <strong>T</strong>arik napas, <strong>O</strong>bservasi emosi, <strong>P</strong>roceed melangkah bijak.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-1">
                      <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                        <span>⚡</span>
                        <span>Goyang Lepas Beban (Shakeout)</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Ketuk layar mengikuti ritme untuk mengibaskan ketegangan otot bahu dan lengan yang kaku saat cemas.
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>💡 Kamu bisa berlatih kapan saja dengan menekan tombol <strong>[R]</strong> di bilah atas layar.</span>
                    <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-amber-300 font-bold shrink-0">[R]</span>
                  </div>
                </div>
              )}

              {/* STEP 5: MISI 12 KOMPONEN JAM & MEMULIHKAN ALAM */}
              {currentStep === 5 && (
                <div className="bg-slate-950/70 border border-amber-500/30 rounded-2xl p-4 sm:p-5 space-y-4 animate-fade-in">
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-emerald-300 shrink-0">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base sm:text-lg text-amber-200">
                        {lang === 'en' ? '5. Collect 12 Clock Pieces & Restore Colors 100%' : '5. Kumpulkan 12 Komponen Jam & Pulihkan Warna Alam'}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                        {lang === 'en'
                          ? 'Each reconciled friend gives you a lost component of Ki Waskita’s Clock Tower. Watch the gray fog fade away as colors return!'
                          : 'Setiap warga yang terbantu akan menyerahkan komponen Menara Jam Ki Waskita. Saksikan kabut kelabu lenyap dan warna-warni alam kembali mekar bercahaya!'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
                      <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-rose-400" />
                        <span>Alat Navigasi Petualangan:</span>
                      </div>
                      <ul className="text-[11px] text-slate-300 space-y-1.5 list-disc list-inside">
                        <li>
                          <strong>Banner Misi (Atas Layar):</strong> Menampilkan target aktif dan tombol <em>"Tuntun"</em> untuk berjalan otomatis ke lokasi.
                        </li>
                        <li>
                          <strong>Peta Lembah [M]:</strong> Melihat posisi 13 warga dan 4 zona utama secara langsung.
                        </li>
                        <li>
                          <strong>Panduan Warga (People Guide):</strong> Membaca profil, peran, kutipan, dan tips dialog ke-13 teman desa.
                        </li>
                      </ul>
                    </div>

                    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
                      <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-emerald-400" />
                        <span>Tujuan Akhir & Kelulusan:</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Setelah 12 komponen jam terkumpul lengkap, temui <strong>Nenek Wilis</strong> di Puncak Menara Jam untuk merakit jam dan mengaktifkan dentingan melodi harmoni! Kamu akan menerima <strong>Sertifikat Piagam Duta Empati Emas</strong>!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CONTROLS CHEAT SHEET */}
          {activeTab === 'controls' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-slate-950/80 p-3 sm:p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4 text-amber-400" />
                    <span>Daftar Pintasan Tombol Keyboard & Mouse (PC / Laptop)</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Uji coba menekan tombol keyboard di perangkatmu:
                  </p>
                </div>
                {testedKey && (
                  <div className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-mono font-bold text-xs animate-bounce shadow">
                    Tekan: {testedKey}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                  <span className="text-slate-300">Bergerak / Melangkah</span>
                  <span className="font-mono bg-slate-800 px-2.5 py-0.5 rounded text-amber-300 border border-slate-700 font-bold">
                    W / A / S / D  atau  ↑ / ← / ↓ / →
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                  <span className="text-slate-300">Bicara / Interaksi / Lanjut Dialog</span>
                  <span className="font-mono bg-slate-800 px-2.5 py-0.5 rounded text-amber-300 border border-slate-700 font-bold">
                    SPASI / ENTER / [E]
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                  <span className="text-slate-300">Nyalakan / Matikan Kompas Hati</span>
                  <span className="font-mono bg-slate-800 px-2.5 py-0.5 rounded text-amber-300 border border-slate-700 font-bold">
                    [C]
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                  <span className="text-slate-300">Studio Regulasi Emosi (Latihan Mandiri)</span>
                  <span className="font-mono bg-slate-800 px-2.5 py-0.5 rounded text-cyan-300 border border-slate-700 font-bold">
                    [R]
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                  <span className="text-slate-300">Buka / Tutup Peta Lembah</span>
                  <span className="font-mono bg-slate-800 px-2.5 py-0.5 rounded text-amber-300 border border-slate-700 font-bold">
                    [M]
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                  <span className="text-slate-300">Buka Jurnal Petualang & Tas</span>
                  <span className="font-mono bg-slate-800 px-2.5 py-0.5 rounded text-amber-300 border border-slate-700 font-bold">
                    [J]
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                  <span className="text-slate-300">Buka Menu Pengaturan & Audio</span>
                  <span className="font-mono bg-slate-800 px-2.5 py-0.5 rounded text-amber-300 border border-slate-700 font-bold">
                    [O]
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                  <span className="text-slate-300">Buka Tutorial Cara Bermain Ini</span>
                  <span className="font-mono bg-slate-800 px-2.5 py-0.5 rounded text-emerald-300 border border-slate-700 font-bold">
                    [H]  atau  [?]
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                  <span className="text-slate-300">Tutup Jendela / Menu Pause</span>
                  <span className="font-mono bg-slate-800 px-2.5 py-0.5 rounded text-rose-300 border border-slate-700 font-bold">
                    [ESC]
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                  <span className="text-slate-300">Jalan Otomatis ke Titik</span>
                  <span className="font-mono bg-slate-800 px-2.5 py-0.5 rounded text-amber-300 border border-slate-700 font-bold">
                    Klik Kiri Mouse di Lantai
                  </span>
                </div>
              </div>

              {/* Mobile Touch Quick Reference */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-amber-300 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Kontrol Pada Layar Sentuh HP & Tablet</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-300">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <strong>Gerak:</strong> Tarik Analog di sudut kiri bawah layar atau ketuk lantai.
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <strong>Bicara:</strong> Ketuk tombol bulat [Bicara / Aksi] di kanan bawah layar.
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <strong>Menu:</strong> Ketuk tombol ikon Kompas, Jurnal, Peta, atau Pengaturan di bilah atas.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="px-4 sm:px-6 py-3 bg-slate-950/95 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Checkbox: Don't show again automatically */}
          <label className="flex items-center gap-2 text-[11px] text-slate-400 cursor-pointer self-start sm:self-auto hover:text-slate-200 transition">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => {
                setDontShowAgain(e.target.checked);
                localStorage.setItem('lembah_tutorial_autoshown', e.target.checked ? 'true' : 'false');
              }}
              className="w-3.5 h-3.5 rounded bg-slate-800 border-slate-600 text-amber-500 focus:ring-amber-400"
            />
            <span>{lang === 'en' ? "Don't auto-open on new adventure" : 'Jangan buka otomatis saat petualangan baru dimulai'}</span>
          </label>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {activeTab === 'steps' && currentStep > 1 && (
              <button
                onClick={handlePrevStep}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95 border border-slate-700"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Previous' : 'Sebelumnya'}</span>
              </button>
            )}

            {activeTab === 'steps' && currentStep < 5 && (
              <button
                onClick={handleNextStep}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer border border-amber-300/80"
              >
                <span>{lang === 'en' ? 'Next Step' : 'Langkah Selanjutnya'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {(activeTab !== 'steps' || currentStep === 5) && (
              <button
                id="btn-finish-tutorial"
                onClick={handleNextStep}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-slate-950 font-extrabold text-xs shadow-lg transition flex items-center gap-1.5 cursor-pointer border border-emerald-300"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{lang === 'en' ? 'Ready to Play!' : 'Saya Paham & Siap Bermain!'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
