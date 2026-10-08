import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  Sparkles,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  Heart,
  Clock,
  Compass,
  X,
  ChevronRight,
  Lightbulb,
} from 'lucide-react';
import { sound } from '../utils/audio';
import { useLanguage } from '../game/localization';

export interface QuizQuestion {
  id: number;
  questionId: string;
  questionEn: string;
  questionIdNumber: number;
  options: {
    key: 'A' | 'B' | 'C';
    textId: string;
    textEn: string;
  }[];
  correctKey: 'A' | 'B' | 'C';
  explanationId: string;
  explanationEn: string;
  badgeHintId: string;
  badgeHintEn: string;
}

export const ENDING_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    questionIdNumber: 1,
    questionId:
      'Apa yang menyebabkan Menara Jam Harmoni berhenti berdetak sehingga Lembah Nada Rasa tertutup oleh Kabut Abu-Abu Prasangka?',
    questionEn:
      'What caused the Clock Tower of Harmony to stop ticking, covering Melody Valley in the Gray Fog of Prejudice?',
    options: [
      {
        key: 'A',
        textId:
          'Jam tersebut kehabisan tenaga karena mesinnya sudah terlalu tua dan rusak dimakan usia.',
        textEn:
          'The clock ran out of power because its gears grew too old and rusted.',
      },
      {
        key: 'B',
        textId:
          'Warga desa mulai merenggang, saling menyalahkan, dan enggan mendengarkan satu sama lain saat terjadi kesalahpahaman.',
        textEn:
          'The villagers grew distant, blamed one another, and refused to listen during misunderstandings.',
      },
      {
        key: 'C',
        textId:
          'Nenek Wilis sengaja mematikan mesin jam tersebut agar para warga desa bisa beristirahat dengan tenang.',
        textEn:
          'Grandma Wilis intentionally stopped the clock mechanism so the villagers could rest peacefully.',
      },
    ],
    correctKey: 'B',
    explanationId:
      'Menara Jam Harmoni hidup dari resonansi kehangatan hati dan kerukunan warga. Ketika warga saling berprasangka dan enggan mendengarkan, detak jam terhenti dan kabut kelabu menyelimuti desa.',
    explanationEn:
      'The Clock Tower of Harmony is powered by villagers’ warmth and mutual resonance. When residents grew estranged and stopped listening, the clock stopped ticking and gray fog settled over the valley.',
    badgeHintId: 'Pelajaran: Komunikasi & Saling Mendengarkan',
    badgeHintEn: 'Lesson: Communication & Active Listening',
  },
  {
    id: 2,
    questionIdNumber: 2,
    questionId:
      'Berdasarkan konsep "Gunung Es Emosi" pada Kompas Resonansi Hati, apa yang dimaksud dengan "Emosi Dalam"?',
    questionEn:
      'Based on the "Emotional Iceberg" concept in the Heart Resonance Compass, what is meant by "Deep Emotions"?',
    options: [
      {
        key: 'A',
        textId:
          'Perilaku yang tampak dari luar dan bisa dilihat orang lain, seperti berteriak, cemberut, membentak, atau bersikap ketus.',
        textEn:
          'Outward behaviors visible to others, such as shouting, scowling, snapping, or being rude.',
      },
      {
        key: 'B',
        textId:
          'Perasaan marah yang diungkapkan langsung kepada orang lain agar mereka tahu kita sedang kesal.',
        textEn:
          'Angry feelings expressed directly to others so they know we are upset.',
      },
      {
        key: 'C',
        textId:
          'Perasaan sejati yang tersembunyi di lubuk hati, seperti rasa takut gagal, kesepian, kelelahan, atau rindu dihargai.',
        textEn:
          'Genuine feelings hidden deep inside, such as fear of failure, loneliness, exhaustion, or longing to be valued.',
      },
    ],
    correctKey: 'C',
    explanationId:
      'Di bawah permukaan gunung es emosi, kata-kata kasar atau kemarahan tampak luar sebenarnya bersumber dari perasaan rentan di dalam lubuk hati: rasa takut diabaikan, kelelahan, dan kerinduan untuk dimengerti.',
    explanationEn:
      'Beneath the surface of the emotional iceberg, harsh words or outward anger are rooted in vulnerable inner emotions: fear of being ignored, exhaustion, and longing to be appreciated.',
    badgeHintId: 'Pelajaran: Konsep Gunung Es Emosi (Iceberg)',
    badgeHintEn: 'Lesson: Emotional Iceberg Concept',
  },
  {
    id: 3,
    questionIdNumber: 3,
    questionId:
      'Siapakah nama tokoh yang bekerja merawat jembatan kayu desa selama lebih dari empat puluh tahun dan sempat merasa kecewa karena usahanya diabaikan?',
    questionEn:
      'Who is the character that maintained the village wooden bridge for over forty years and felt disappointed because his labor was ignored?',
    options: [
      {
        key: 'A',
        textId: 'Kakek Ranu si Tukang Kayu Sepuh.',
        textEn: 'Grandpa Ranu, the Master Carpenter.',
      },
      {
        key: 'B',
        textId: 'Pak Joko si Petani Kebun Harapan.',
        textEn: 'Pak Joko, the Hope Orchard Farmer.',
      },
      {
        key: 'C',
        textId: 'Bung Jala si Pemancing Sabar.',
        textEn: 'Bung Jala, the Patient Angler.',
      },
    ],
    correctKey: 'A',
    explanationId:
      'Kakek Ranu adalah tukang kayu sepuh yang dengan telaten merawat jembatan kayu penghubung desa selama 40 tahun lebih. Beliau merasa sedih ketika warga tergesa-gesa melintas tanpa mempedulikan dedikasinya.',
    explanationEn:
      'Grandpa Ranu is the master carpenter who dedicated over 40 years to maintaining the village bridge. He felt hurt when villagers hurried across without appreciating his care.',
    badgeHintId: 'Pelajaran: Menghargai Pengorbanan & Dedikasi Sesama',
    badgeHintEn: 'Lesson: Appreciating Others’ Dedication',
  },
  {
    id: 4,
    questionIdNumber: 4,
    questionId:
      'Apa syarat utamanya agar warga desa mau menyerahkan 12 komponen jam yang tercecer kepada pahlawan cilik?',
    questionEn:
      'What is the primary requirement for villagers to entrust the 12 scattered clock components to the little hero?',
    options: [
      {
        key: 'A',
        textId:
          'Pahlawan harus bisa membelinya dari para warga menggunakan koin emas.',
        textEn:
          'The hero must purchase them from villagers using gold coins.',
      },
      {
        key: 'B',
        textId:
          'Pahlawan harus berlari mengelilingi Alun-Alun Nada Rasa dengan cepat.',
        textEn:
          'The hero must sprint around Melody Plaza swiftly.',
      },
      {
        key: 'C',
        textId:
          'Pahlawan harus berhasil memahami emosi warga tersebut, memvalidasi luka hatinya, dan memberikan respon empati yang tepat.',
        textEn:
          'The hero must understand the villager’s feelings, validate their emotional wounds, and respond with genuine empathy.',
      },
    ],
    correctKey: 'C',
    explanationId:
      'Warga tidak membutuhkan koin emas atau perlombaan fisik. Mereka membutuhkan pahlawan yang mau mendengarkan tanpa menghakimi, memvalidasi perasaan mereka, dan membantu mereka berdamai dengan luka hati.',
    explanationEn:
      'Villagers do not seek gold coins or athletic speed. They need a hero who listens without judgment, validates their feelings, and helps them heal emotional distress with empathy.',
    badgeHintId: 'Pelajaran: Validasi Perasaan & Respon Empati',
    badgeHintEn: 'Lesson: Validation & Empathetic Responses',
  },
  {
    id: 5,
    questionIdNumber: 5,
    questionId:
      'Apa makna terdalam dari kutipan Nenek Wilis: "Harmoni bukanlah ketiadaan perbedaan nada, melainkan kerelaan untuk saling mendengarkan dalam simfoni"?',
    questionEn:
      'What is the deepest meaning of Grandma Wilis’s quote: "Harmony is not the absence of different notes, but the willingness to listen to each other in a symphony"?',
    options: [
      {
        key: 'A',
        textId:
          'Kerukunan terwujud bukan karena tidak ada perbedaan, melainkan karena kita mau saling mendengarkan.',
        textEn:
          'Peace is achieved not because differences disappear, but because we are willing to listen to each other.',
      },
      {
        key: 'B',
        textId:
          'Kerukunan baru bisa terjadi jika semua orang di desa memiliki pendapat yang selalu sama.',
        textEn:
          'Peace can only happen if everyone in the village shares identical opinions.',
      },
      {
        key: 'C',
        textId:
          'Kita harus selalu bernyanyi bersama di alun-alun desa agar terhindar dari pertengkaran.',
        textEn:
          'We must always sing together in the village plaza to prevent disagreements.',
      },
    ],
    correctKey: 'A',
    explanationId:
      'Setiap instrumen musik menghasilkan nada yang berbeda. Namun ketika semua pemain musik saling menyelaraskan tempo dan saling mendengarkan, perbedaan nada tersebut bersatu menjadi simfoni harmoni yang megah dan menyentuh kalbu.',
    explanationEn:
      'Every instrument produces distinct notes. When musicians listen to one another and synchronize their rhythm, diversity blends into a magnificent, touching symphony of harmony.',
    badgeHintId: 'Pelajaran: Makna Sejati Harmoni Sosial-Emosional',
    badgeHintEn: 'Lesson: The True Meaning of Harmony',
  },
];

export interface EndingQuizModalProps {
  isOpen: boolean;
  onProceedToEnding: () => void;
  onClose?: () => void;
  onFreeRoam?: () => void;
  playerName?: string;
}

export const EndingQuizModal: React.FC<EndingQuizModalProps> = ({
  isOpen,
  onProceedToEnding,
  onClose,
  onFreeRoam,
  playerName = 'Ezzel',
}) => {
  const { lang } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, 'A' | 'B' | 'C' | null>>({
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
  });
  const [showFeedback, setShowFeedback] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
  });
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setIsCompleted(false);
      setUserAnswers({ 1: null, 2: null, 3: null, 4: null, 5: null });
      setShowFeedback({ 1: false, 2: false, 3: false, 4: false, 5: false });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentQ = ENDING_QUIZ_QUESTIONS[currentIndex];
  const totalQuestions = ENDING_QUIZ_QUESTIONS.length;
  const currentAnswer = userAnswers[currentQ.id];
  const isCurrentFeedbackVisible = showFeedback[currentQ.id];
  const isCurrentCorrect = currentAnswer === currentQ.correctKey;

  // Calculate score
  const correctCount = ENDING_QUIZ_QUESTIONS.reduce((acc, q) => {
    return userAnswers[q.id] === q.correctKey ? acc + 1 : acc;
  }, 0);
  const scorePercent = Math.round((correctCount / totalQuestions) * 100);

  const handleSelectOption = (key: 'A' | 'B' | 'C') => {
    setUserAnswers((prev) => ({ ...prev, [currentQ.id]: key }));
    setShowFeedback((prev) => ({ ...prev, [currentQ.id]: true }));

    if (key === currentQ.correctKey) {
      sound.playSecretFound();
    } else {
      sound.playMenuSelect();
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      sound.playVoiceBlip();
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Completed all 5 questions
      sound.playSuccessFanfare();
      setIsCompleted(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      sound.playVoiceBlip();
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleRestartQuiz = () => {
    sound.playMenuSelect();
    setCurrentIndex(0);
    setIsCompleted(false);
    setUserAnswers({ 1: null, 2: null, 3: null, 4: null, 5: null });
    setShowFeedback({ 1: false, 2: false, 3: false, 4: false, 5: false });
  };

  const handleFinishAndOpenEnding = () => {
    sound.playAllBadgesFanfare();
    onProceedToEnding();
  };

  return (
    <div
      id="ending-quiz-modal"
      className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-md text-slate-100 select-none overflow-y-auto animate-backdrop-fade-in"
    >
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* TOP HEADER BAR */}
      <header className="relative z-10 w-full px-4 sm:px-8 py-3.5 sm:py-4 bg-slate-900/90 border-b-2 border-amber-500/50 flex items-center justify-between shadow-lg shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/30 shrink-0">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/40">
                {lang === 'en' ? 'FINAL MASTERY EVALUATION' : 'UJIAN AKHIR PEMAHAMAN CERITA'}
              </span>
              <span className="text-[10px] font-pixel text-emerald-400 hidden md:inline">
                • {lang === 'en' ? 'Melody Valley SEL Core Test' : 'Tes Inti Filosofi & Pesan Moral Lembah'}
              </span>
            </div>
            <h1
              style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
              className="text-base sm:text-xl font-bold text-amber-200 tracking-wide mt-0.5"
            >
              {lang === 'en'
                ? 'Empathy Ambassador Final Quiz'
                : 'Ujian Pemahaman: Duta Empati Lembah Nada Rasa'}
            </h1>
          </div>
        </div>

        {/* Top Right Status & Close */}
        <div className="flex items-center gap-3">
          {!isCompleted && (
            <div className="hidden sm:flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-mono">
              <span className="text-slate-400">{lang === 'en' ? 'Progress:' : 'Progres:'}</span>
              <span className="text-amber-300 font-bold">
                {currentIndex + 1} / {totalQuestions}
              </span>
            </div>
          )}

          {onClose && (
            <button
              onClick={onClose}
              title={lang === 'en' ? 'Close' : 'Tutup'}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition active:scale-95 cursor-pointer border border-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* MAIN CONTENT CONTAINER */}
      <main className="relative z-10 flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col justify-center">
        {!isCompleted ? (
          /* ================================================================= */
          /* QUESTION VIEW */
          /* ================================================================= */
          <div className="space-y-5 animate-fade-in">
            {/* Step Indicator Bar */}
            <div className="flex items-center justify-between gap-2 bg-slate-900/80 border border-slate-800 p-2.5 sm:p-3 rounded-2xl">
              <div className="flex items-center gap-1 sm:gap-2">
                {ENDING_QUIZ_QUESTIONS.map((q, idx) => {
                  const ans = userAnswers[q.id];
                  const isCurrent = idx === currentIndex;
                  const isDone = ans !== null;

                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        sound.playVoiceBlip();
                        setCurrentIndex(idx);
                      }}
                      className={`h-8 sm:h-9 px-3 sm:px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        isCurrent
                          ? 'bg-amber-400 text-slate-950 font-extrabold shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-105'
                          : isDone
                          ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700'
                      }`}
                    >
                      <span>{q.questionIdNumber}</span>
                      {isDone && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>

              <div className="text-right">
                <span className="text-[10px] sm:text-xs text-amber-300 font-pixel font-bold">
                  {lang === 'en' ? currentQ.badgeHintEn : currentQ.badgeHintId}
                </span>
              </div>
            </div>

            {/* Question Card Box */}
            <div className="bg-slate-900/90 border-2 border-amber-500/70 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-[0_0_40px_rgba(245,158,11,0.2)] modal-glow-frame space-y-5">
              {/* Question Header */}
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 font-bold font-pixel text-base sm:text-lg shrink-0">
                  {currentQ.questionIdNumber}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                    {lang === 'en'
                      ? `QUESTION ${currentIndex + 1} OF ${totalQuestions}`
                      : `PERTANYAAN ${currentIndex + 1} DARI ${totalQuestions}`}
                  </span>
                  <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-100 mt-1 leading-relaxed">
                    {lang === 'en' ? currentQ.questionEn : currentQ.questionId}
                  </h2>
                </div>
              </div>

              {/* 3 Options (A, B, C) */}
              <div className="space-y-3 pt-1">
                {currentQ.options.map((option) => {
                  const isSelected = currentAnswer === option.key;
                  const isCorrect = option.key === currentQ.correctKey;
                  const showResultState = isCurrentFeedbackVisible;

                  let cardStyle =
                    'bg-slate-950/70 border-slate-700 hover:border-amber-400 text-slate-200 hover:bg-slate-900';
                  let badgeStyle = 'bg-slate-800 text-amber-300 border-slate-600';

                  if (isSelected && !showResultState) {
                    cardStyle =
                      'bg-amber-950/40 border-amber-400 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.3)]';
                    badgeStyle = 'bg-amber-400 text-slate-950 font-extrabold';
                  } else if (showResultState) {
                    if (isCorrect) {
                      cardStyle =
                        'bg-emerald-950/50 border-emerald-400 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.35)]';
                      badgeStyle = 'bg-emerald-500 text-slate-950 font-extrabold';
                    } else if (isSelected && !isCorrect) {
                      cardStyle =
                        'bg-rose-950/40 border-rose-500/80 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.3)]';
                      badgeStyle = 'bg-rose-500 text-slate-950 font-extrabold';
                    } else {
                      cardStyle = 'bg-slate-950/40 border-slate-800/80 text-slate-500 opacity-60';
                      badgeStyle = 'bg-slate-900 text-slate-500 border-slate-800';
                    }
                  }

                  return (
                    <button
                      key={option.key}
                      onClick={() => handleSelectOption(option.key)}
                      className={`w-full p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 text-left transition-transform duration-75 transition-colors duration-75 flex items-start gap-3.5 cursor-pointer active:scale-[0.98] group touch-manipulation ${cardStyle}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-pixel font-bold text-sm shrink-0 border transition ${badgeStyle}`}
                      >
                        {option.key}
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className="text-xs sm:text-sm font-medium leading-relaxed">
                          {lang === 'en' ? option.textEn : option.textId}
                        </p>
                      </div>

                      {showResultState && isCorrect && (
                        <div className="shrink-0 p-1 text-emerald-400 flex items-center gap-1 text-[11px] font-bold">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="hidden sm:inline">
                            {lang === 'en' ? 'Correct Key' : 'Kunci Jawaban'}
                          </span>
                        </div>
                      )}
                      {showResultState && isSelected && !isCorrect && (
                        <div className="shrink-0 p-1 text-rose-400 flex items-center gap-1 text-[11px] font-bold">
                          <XCircle className="w-5 h-5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanatory Educational Feedback Box */}
              {isCurrentFeedbackVisible && (
                <div
                  className={`p-4 rounded-xl border animate-fade-in flex items-start gap-3 ${
                    isCurrentCorrect
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                      : 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-slate-900/80 shrink-0 text-amber-400 mt-0.5">
                    <Lightbulb className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs uppercase tracking-wide">
                        {isCurrentCorrect
                          ? (lang === 'en' ? '✨ TEPAT SEKALI! KUNCI JAWABAN BENAR' : '✨ TEPAT SEKALI! JAWABAN BENAR')
                          : (lang === 'en' ? '💡 KUNCI JAWABAN YANG TEPAT:' : '💡 KUNCI JAWABAN YANG TEPAT:')}
                      </span>
                      <span className="font-pixel font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 text-xs">
                        {currentQ.correctKey}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-200">
                      {lang === 'en' ? currentQ.explanationEn : currentQ.explanationId}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons Footer */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className={`px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer border ${
                  currentIndex === 0
                    ? 'opacity-30 cursor-not-allowed border-slate-800 bg-slate-900 text-slate-500'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 active:scale-95'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{lang === 'en' ? 'Previous Question' : 'Pertanyaan Sebelumnya'}</span>
              </button>

              <button
                id="btn-quiz-next"
                onClick={handleNext}
                disabled={currentAnswer === null}
                className={`px-5 sm:px-6 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition flex items-center gap-2 shadow-lg cursor-pointer ${
                  currentAnswer === null
                    ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500 border border-slate-700'
                    : currentIndex === totalQuestions - 1
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 border border-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.5)] active:scale-95'
                    : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-slate-950 border border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.5)] active:scale-95'
                }`}
              >
                <span>
                  {currentIndex === totalQuestions - 1
                    ? (lang === 'en' ? 'View Final Results 🏆' : 'Lihat Hasil Ujian Akhir 🏆')
                    : (lang === 'en' ? 'Next Question' : 'Pertanyaan Selanjutnya')}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* ================================================================= */
          /* FINAL RESULT SCREEN */
          /* ================================================================= */
          <div className="bg-slate-900/95 border-2 border-amber-400/90 rounded-3xl p-6 sm:p-9 shadow-[0_0_50px_rgba(245,158,11,0.3)] modal-glow-frame text-center space-y-6 max-w-2xl mx-auto animate-fade-in-slide-up">
            {/* Celebration Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/50 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>
                {lang === 'en'
                  ? 'Core Game Understanding Evaluated'
                  : 'Hasil Evaluasi Pemahaman Lembah Nada Rasa'}
              </span>
            </div>

            {/* Main Trophy & Title */}
            <div>
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 shadow-[0_0_30px_rgba(245,158,11,0.6)] mb-4">
                <Award className="w-12 h-12 sm:w-14 sm:h-14 stroke-[2.5]" />
              </div>

              <h2
                style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
                className="text-2xl sm:text-3xl font-black text-amber-300 tracking-wide"
              >
                {correctCount === 5
                  ? (lang === 'en' ? 'Lulus Sempurna: Duta Empati Emas!' : 'Lulus Sempurna: Duta Empati Emas!')
                  : (lang === 'en' ? 'Lulus Evaluasi: Pemahaman Harmoni Baik!' : 'Lulus Evaluasi: Pemahaman Harmoni Baik!')}
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
                {lang === 'en'
                  ? `Congratulations ${playerName}! You scored ${correctCount} of 5 correct (${scorePercent}%). You deeply understand the heart and soul of Melody Valley!`
                  : `Selamat ${playerName}! Kamu menjawab ${correctCount} dari 5 pertanyaan dengan benar (${scorePercent}%). Kamu telah memahami seluruh esensi cerita, filosofi Gunung Es Emosi, dan pesan moral Lembah Nada Rasa!`}
              </p>
            </div>

            {/* Scorecard Summary Pill */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-lg mx-auto text-xs">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">{lang === 'en' ? 'Total Questions' : 'Total Soal'}</span>
                <span className="font-pixel font-bold text-base text-slate-200">5</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-emerald-400 block">{lang === 'en' ? 'Correct' : 'Benar'}</span>
                <span className="font-pixel font-bold text-base text-emerald-400">{correctCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-amber-400 block">{lang === 'en' ? 'Score' : 'Skor Akhir'}</span>
                <span className="font-pixel font-bold text-base text-amber-300">{scorePercent}%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-cyan-400 block">{lang === 'en' ? 'Status' : 'Predikat'}</span>
                <span className="font-pixel font-bold text-base text-cyan-300">
                  {correctCount >= 4 ? 'A+' : 'LULUS'}
                </span>
              </div>
            </div>

            {/* 5 Core Takeaway Summary List */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-left space-y-2 text-xs">
              <span className="font-bold text-amber-300 text-[11px] uppercase tracking-wider block">
                {lang === 'en' ? '5 Core Lessons Mastered:' : '5 Nilai Luhur yang Berhasil Kamu Pelajari:'}
              </span>
              <ul className="space-y-1.5 text-slate-300 text-[11.5px] leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Komunikasi Mengalahkan Prasangka:</strong> Mendengarkan satu sama lain adalah kunci menjaga Menara Jam Harmoni tetap berdetak.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Gunung Es Emosi:</strong> Di balik kata-kata kasar dan amarah luar, ada rasa takut, sepi, atau rindu dihargai yang butuh dipahami.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Menghargai Sesama:</strong> Jangan abaikan kerja keras orang-orang di sekitarmu seperti Kakek Ranu yang merawat jembatan desa.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Kekuatan Validasi & Empati:</strong> Warga menyerahkan komponen jam karena merasa didengarkan dan dimengerti dengan tulus.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Harmoni Sejati Nenek Wilis:</strong> Kerukunan bukan berarti semua harus seragam, melainkan kerelaan saling mendengarkan dalam simfoni kehidupan.
                  </span>
                </li>
              </ul>
            </div>

            {/* Final Action CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={handleRestartQuiz}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-pixel font-bold text-xs border border-slate-700 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-slate-400" />
                <span>{lang === 'en' ? 'Retake Quiz' : 'Ulangi Ujian'}</span>
              </button>

              <button
                id="btn-quiz-proceed-ending"
                onClick={handleFinishAndOpenEnding}
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-pixel font-extrabold text-xs sm:text-sm shadow-[0_0_25px_rgba(245,158,11,0.6)] border border-amber-300 transition active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Award className="w-5 h-5 text-slate-950" />
                <span>{lang === 'en' ? 'Claim Certificate & View Ending 🏆' : 'Klaim Piagam Harmoni & Akhir Cerita 🏆'}</span>
              </button>

              {onFreeRoam && (
                <button
                  onClick={onFreeRoam}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-emerald-300 font-pixel font-bold text-xs border border-emerald-500/40 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <span>{lang === 'en' ? 'Free Roam Mode' : 'Mode Jelajah Bebas'}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
