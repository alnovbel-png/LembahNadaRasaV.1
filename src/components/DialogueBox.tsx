import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { DialogueNode, ChoiceOption } from '../types/game';
import { sound } from '../utils/audio';
import { CharacterPortrait } from './CharacterPortrait';
import { useLanguage } from '../game/localization';

interface DialogueBoxProps {
  dialogue: DialogueNode;
  onChoiceSelect: (choice: ChoiceOption) => void;
  onNext: () => void;
  onSkipRegulation?: () => void;
  onClose?: () => void;
  isCompassActive: boolean;
  onToggleCompass?: () => void;
  playerName?: string;
  playerAvatar?: 'boy' | 'girl' | 'kiko';
}

// Handcrafted SVG pixel icons - No external icon packages, harmonious warm palette
const IconEye: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg viewBox="0 0 16 16" fill="none" className={className}>
    <path d="M1 8C2.5 4.5 5.5 3 8 3C10.5 3 13.5 4.5 15 8C13.5 11.5 10.5 13 8 13C5.5 13 2.5 11.5 1 8Z" stroke="#818cf8" strokeWidth="1.5" strokeLinejoin="round" />
    <circle cx="8" cy="8" r="2.5" fill="#4338ca" stroke="#c7d2fe" strokeWidth="1" />
    <circle cx="9" cy="7" r="0.8" fill="#ffffff" />
  </svg>
);

const IconMessage: React.FC<{ className?: string }> = ({ className = 'w-3 h-3' }) => (
  <svg viewBox="0 0 16 16" fill="none" className={className}>
    <path d="M2 3.5C2 2.67 2.67 2 3.5 2H12.5C13.33 2 14 2.67 14 3.5V9.5C14 10.33 13.33 11 12.5 11H5L2 14V3.5Z" fill="#f59e0b" stroke="#78350f" strokeWidth="1.2" strokeLinejoin="round" />
    <circle cx="5.5" cy="6.5" r="0.8" fill="#78350f" />
    <circle cx="8" cy="6.5" r="0.8" fill="#78350f" />
    <circle cx="10.5" cy="6.5" r="0.8" fill="#78350f" />
  </svg>
);

const IconSparkles: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-3.5 h-3.5', style }) => (
  <svg viewBox="0 0 16 16" fill="none" className={className} style={style}>
    <path d="M8 1L9.2 5.8L14 7L9.2 8.2L8 13L6.8 8.2L2 7L6.8 5.8L8 1Z" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" />
    <circle cx="13" cy="3" r="1.2" fill="#fef08a" />
    <circle cx="3" cy="12" r="1" fill="#fef08a" />
  </svg>
);

const IconCheckCircle: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 16 16" fill="none" className={className}>
    <circle cx="8" cy="8" r="7" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
    <path d="M4.5 8.2L7 10.7L11.5 5.5" stroke="#022c22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconAlert: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 16 16" fill="none" className={className}>
    <path d="M8 1.5L14.5 13H1.5L8 1.5Z" fill="#eab308" stroke="#713f12" strokeWidth="1.5" strokeLinejoin="round" />
    <line x1="8" y1="6" x2="8" y2="9.5" stroke="#451a03" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="8" cy="11.5" r="0.8" fill="#451a03" />
  </svg>
);

const IconUser: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 16 16" fill="none" className={className}>
    <circle cx="8" cy="5" r="3" fill="#38bdf8" stroke="#0369a1" strokeWidth="1.2" />
    <path d="M2.5 13.5C2.5 11 5 9.5 8 9.5C11 9.5 13.5 11 13.5 13.5" stroke="#0369a1" strokeWidth="1.5" strokeLinecap="round" fill="#7dd3fc" />
  </svg>
);

const IconCompassBadge: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 16 16" fill="none" className={className}>
    <circle cx="8" cy="8" r="6.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
    <polygon points="8,3 10,7.5 8,7" fill="#dc2626" />
    <polygon points="8,13 6,8.5 8,9" fill="#2563eb" />
    <polygon points="8,7 10,7.5 8,9 6,8.5" fill="#eab308" />
  </svg>
);

const IconTarget: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 16 16" fill="none" className={className}>
    <circle cx="8" cy="8" r="6.5" stroke="#059669" strokeWidth="1.5" fill="#a7f3d0" />
    <circle cx="8" cy="8" r="3.5" stroke="#047857" strokeWidth="1.2" fill="#34d399" />
    <circle cx="8" cy="8" r="1.2" fill="#064e3b" />
  </svg>
);

export const isChoiceIncorrect = (choice: ChoiceOption): boolean => {
  if (typeof choice.impactScore === 'number' && choice.impactScore < 0) return true;
  if (!choice.resultDialogueId) return false;
  const res = choice.resultDialogueId.toLowerCase();
  return (
    res.includes('wrong') ||
    res.includes('dismiss') ||
    res.includes('rebuke') ||
    res.includes('shame') ||
    res.includes('fixed_feedback')
  );
};

export const DialogueBox: React.FC<DialogueBoxProps> = ({
  dialogue,
  onChoiceSelect,
  onNext,
  onSkipRegulation,
  onClose,
  isCompassActive,
  onToggleCompass,
  playerName = 'Ezzel',
  playerAvatar = 'boy',
}) => {
  const { lang, ui } = useLanguage();
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showChoices, setShowChoices] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'wrong' | 'correct'>('idle');
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);

  // Helper to replace generic protagonist names with user's nickname
  const formatName = (str: string) => {
    if (!str) return str;
    const name = (playerName && playerName.trim()) || (playerAvatar === 'girl' ? 'Ezzy' : 'Ezzel');
    return str
      .replace(/\bEzzel\b/g, name)
      .replace(/\bEzsel\b/g, name)
      .replace(/\bEzzy\b/g, name)
      .replace(/\bAris\b/g, name)
      .replace(/\bKayla\b/g, name)
      .replace(/\bezzel\b/g, name.toLowerCase())
      .replace(/\bezsel\b/g, name.toLowerCase());
  };

  const processedSpeaker = formatName(dialogue.speaker);
  const processedRole = formatName(dialogue.speakerRole);
  const processedFullText = formatName(dialogue.text);
  const processedThought = dialogue.thoughtBubble ? formatName(dialogue.thoughtBubble) : undefined;

  // Special Story Narrator Prologue
  const sentences = useMemo(() => {
    const text = processedFullText.trim();
    if (!text) return [];
    const matches = text.match(/[^.!?]+(?:[.!?]+["'”’\)]*|$)/g);
    if (!matches) return [text];
    const cleaned = matches.map((s) => s.trim()).filter((s) => s.length > 0);
    return cleaned.length > 0 ? cleaned : [text];
  }, [processedFullText]);

  const [sentenceIndex, setSentenceIndex] = useState(0);

  // Special Story Narrator Prologue check
  const isNarratorPrologue = Boolean(
    dialogue.id === 'intro_start' ||
    dialogue.speaker?.includes('Narator') ||
    dialogue.speaker?.includes('Narrator')
  );

  // Reset sentence index and choices view whenever dialogue.id changes
  useEffect(() => {
    setSentenceIndex(0);
    setShowChoices(false);
  }, [dialogue.id]);

  const currentSentence = sentences[sentenceIndex] || processedFullText;
  const isLastSentence = sentenceIndex >= sentences.length - 1;

  // Track wrong answers for the current dialogue session to highlight them
  const wrongChoiceIdsRef = useRef<Record<string, string[]>>({});
  const typewriterIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const typingFinishedTimeRef = useRef<number>(0);

  const isWrongFeedback = Boolean(
    dialogue.isWrongFeedback ||
    dialogue.id.includes('wrong') ||
    dialogue.id.includes('dismiss') ||
    dialogue.id.includes('rebuke') ||
    dialogue.id.includes('shame') ||
    dialogue.id.includes('fixed_feedback') ||
    (dialogue.nextId && (
      dialogue.nextId.includes('_intro') ||
      dialogue.nextId.includes('_question') ||
      dialogue.nextId.includes('_practice')
    ) && (
      dialogue.id.includes('wrong') ||
      dialogue.id.includes('rebuke') ||
      dialogue.id.includes('shame') ||
      dialogue.id.includes('dismiss') ||
      dialogue.id.includes('fixed')
    ))
  );

  // Instantly finish typewriter effect to allow player to read current sentence immediately
  const finishTypingInstantly = useCallback(() => {
    if (typewriterIntervalRef.current) {
      clearInterval(typewriterIntervalRef.current);
      typewriterIntervalRef.current = null;
    }
    setDisplayedText(currentSentence);
    setIsTyping(false);
    typingFinishedTimeRef.current = Date.now();
  }, [currentSentence]);

  // Handle advancing to next sentence or next dialogue node
  const handleNextSentence = useCallback(() => {
    if (isTyping) {
      finishTypingInstantly();
      return;
    }
    if (sentenceIndex < sentences.length - 1) {
      sound.playMenuSelect();
      setSentenceIndex((prev) => prev + 1);
    } else {
      if (isWrongFeedback) {
        onNext();
      } else if (dialogue.choices && dialogue.choices.length > 0) {
        sound.playMenuSelect();
        setShowChoices(true);
      } else {
        onNext();
      }
    }
  }, [
    isTyping,
    finishTypingInstantly,
    sentenceIndex,
    sentences.length,
    isWrongFeedback,
    dialogue.choices,
    onNext,
  ]);

  // Typewriter effect (teks bergulir per kalimat)
  useEffect(() => {
    if (typewriterIntervalRef.current) {
      clearInterval(typewriterIntervalRef.current);
      typewriterIntervalRef.current = null;
    }

    if (isNarratorPrologue) {
      setIsTyping(false);
      setDisplayedText(currentSentence);
      return;
    }

    setDisplayedText('');
    setIsTyping(true);
    setFeedbackStatus('idle');
    setSelectedChoiceId(null);
    typingFinishedTimeRef.current = 0;

    let index = 0;
    const fullText = currentSentence;

    typewriterIntervalRef.current = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText(fullText.slice(0, index + 1));
        if (index % 3 === 0) {
          sound.playVoiceBlip(dialogue.speaker.includes('Kiki'));
        }
        index++;
      } else {
        setIsTyping(false);
        typingFinishedTimeRef.current = Date.now();
        if (typewriterIntervalRef.current) {
          clearInterval(typewriterIntervalRef.current);
          typewriterIntervalRef.current = null;
        }
      }
    }, 18);

    return () => {
      if (typewriterIntervalRef.current) {
        clearInterval(typewriterIntervalRef.current);
        typewriterIntervalRef.current = null;
      }
    };
  }, [dialogue.id, sentenceIndex, currentSentence, isNarratorPrologue]);

  // Handle immediate text skip or exit
  const handleExitOrSkip = () => {
    if (isWrongFeedback) {
      onNext();
    } else if (isTyping) {
      finishTypingInstantly();
    } else if (onClose) {
      onClose();
    } else {
      onNext();
    }
  };

  // Choice selection with rich visual and audio quiz feedback
  const handleChoiceClick = (choice: ChoiceOption) => {
    if (feedbackStatus !== 'idle') return;
    setSelectedChoiceId(choice.id);

    const isWrong = isChoiceIncorrect(choice);

    if (isWrong) {
      if (!wrongChoiceIdsRef.current[dialogue.id]) {
        wrongChoiceIdsRef.current[dialogue.id] = [];
      }
      if (!wrongChoiceIdsRef.current[dialogue.id].includes(choice.id)) {
        wrongChoiceIdsRef.current[dialogue.id].push(choice.id);
      }

      setFeedbackStatus('wrong');
      sound.playQuizWrong();

      setTimeout(() => {
        setFeedbackStatus('idle');
        setSelectedChoiceId(null);
        onChoiceSelect(choice);
      }, 1600);
    } else {
      setFeedbackStatus('correct');
      sound.playApplause();

      setTimeout(() => {
        setFeedbackStatus('idle');
        setSelectedChoiceId(null);
        onChoiceSelect(choice);
      }, 1800);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        handleExitOrSkip();
        return;
      }

      if ((e.key === 'c' || e.key === 'C' || e.code === 'KeyC') && onToggleCompass) {
        e.preventDefault();
        onToggleCompass();
        return;
      }

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (isTyping) {
          finishTypingInstantly();
        } else if (!showChoices) {
          handleNextSentence();
        }
        return;
      }

      if (showChoices && dialogue.choices && dialogue.choices.length > 0) {
        const num = parseInt(e.key, 10);
        if (!isNaN(num) && num >= 1 && num <= dialogue.choices.length) {
          e.preventDefault();
          handleChoiceClick(dialogue.choices[num - 1]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isTyping,
    showChoices,
    finishTypingInstantly,
    handleNextSentence,
    dialogue,
    dialogue.choices,
    onClose,
    feedbackStatus,
    onToggleCompass,
    isNarratorPrologue,
  ]);

  // Character portraits rendering
  const renderPortrait = (type: string) => {
    switch (type) {
      case 'player':
      case 'ezzel':
      case 'aris':
      case 'kayla':
        return (
          <CharacterPortrait
            sprite={
              playerAvatar === 'kiko'
                ? 'kiki'
                : playerAvatar === 'girl'
                ? 'player_girl'
                : 'player_boy'
            }
            size="dialogue"
          />
        );
      case 'celebration':
        return (
          <div className="w-16 h-16 bg-amber-950/90 rounded-lg flex items-center justify-center text-3xl border-2 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]">
            🏆
          </div>
        );
      case 'clock_tower':
      case 'tower':
        return (
          <div className="w-16 h-16 bg-amber-950/90 rounded-lg flex items-center justify-center text-3xl border-2 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-pulse">
            🕰️
          </div>
        );
      case 'signpost':
        return (
          <div className="w-16 h-16 bg-[#18231c] rounded-lg flex items-center justify-center border-2 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.35)] overflow-hidden relative">
            <svg
              viewBox="0 0 32 32"
              className="w-14 h-14"
              style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
            >
              <ellipse cx="16" cy="28" rx="9" ry="3" fill="rgba(0,0,0,0.5)" />
              <rect x="12" y="26" width="8" height="3" fill="#475569" />
              <rect x="14" y="25" width="4" height="2" fill="#64748b" />
              <rect x="14" y="7" width="4" height="20" fill="#78350f" />
              <rect x="14" y="7" width="1" height="20" fill="#451a03" />
              <rect x="17" y="7" width="1" height="20" fill="#b45309" />
              <polygon points="13,7 19,7 16,4" fill="#92400e" />
              <rect x="15" y="3" width="2" height="2" fill="#0f172a" />
              <polygon points="5,10 9,7 21,7 21,13 9,13" fill="#d97706" />
              <polygon points="5,10 9,7 21,7 21,8 9,8" fill="#fde047" />
              <polygon points="5,10 9,12 21,12 21,13 9,13" fill="#78350f" />
              <rect x="14" y="9" width="4" height="2" fill="#0f172a" />
              <rect x="8" y="9" width="3" height="2" fill="#15803d" />
              <polygon points="11,15 23,15 27,18 23,21 11,21" fill="#b45309" />
              <polygon points="11,15 23,15 27,18 23,16 11,16" fill="#f59e0b" />
              <polygon points="11,20 23,20 27,18 23,21 11,21" fill="#451a03" />
              <rect x="14" y="17" width="4" height="2" fill="#0f172a" />
              <rect x="20" y="17" width="3" height="2" fill="#eab308" />
              <path d="M 18,6 L 24,6 L 24,9" stroke="#0f172a" strokeWidth="1" fill="none" />
              <rect x="23" y="9" width="3" height="4" fill="#fef08a" />
              <rect x="22" y="8" width="5" height="1" fill="#78350f" />
              <rect x="22" y="13" width="5" height="1" fill="#78350f" />
            </svg>
          </div>
        );
      default:
        return (
          <CharacterPortrait
            sprite={type}
            size="dialogue"
            isResolved={
              dialogue.id?.includes('resolved') ||
              Boolean(dialogue.speakerRole?.includes('Telah Pulih'))
            }
          />
        );
    }
  };

  const isEndingDialogue =
    dialogue.id === 'ending_summary_perfect' ||
    dialogue.id === 'ending_summary_resilient';

  const isRegulationTrigger = Boolean(
    dialogue.triggerRegulationMode || dialogue.triggerBreathing
  );

  const isMissionNotice = Boolean(
    dialogue.speaker?.includes('Misi') ||
    dialogue.id?.includes('locked') ||
    dialogue.id?.includes('quest') ||
    dialogue.id?.includes('remind') ||
    dialogue.speakerRole?.includes('Penunjuk Misi')
  );

  const isIntroPrologue = Boolean(
    dialogue.id === 'intro_start' ||
    dialogue.id === 'intro_start_2' ||
    dialogue.id === 'intro_start_3' ||
    dialogue.id === 'kiki_wait' ||
    dialogue.id?.startsWith('intro_start')
  );

  const introStep =
    dialogue.id === 'intro_start_2'
      ? {
          step: 2,
          total: 4,
          icon: IconUser,
          badgeId: `PANGGILAN PETUALANG • ${formatName('Ezzel')}`,
          badgeEn: `CALL OF ADVENTURE • ${formatName('Ezzel')}`,
          color: 'cyan' as const,
        }
      : dialogue.id === 'intro_start_3'
      ? {
          step: 3,
          total: 4,
          icon: IconCompassBadge,
          badgeId: 'PUSAKA LEMBAH • PESAN KOMPAS HATI',
          badgeEn: 'VALLEY RELIC • HEART COMPASS MESSAGE',
          color: 'yellow' as const,
        }
      : dialogue.id === 'kiki_wait'
      ? {
          step: 4,
          total: 4,
          icon: IconTarget,
          badgeId: 'PETUNJUK AWAL • MISI PERTAMA',
          badgeEn: 'FIRST CLUE • INITIAL GUIDANCE',
          color: 'emerald' as const,
        }
      : null;

  // Standalone cinematic presentation for Story Narrator
  if (isNarratorPrologue) {
    const narratorSentence = sentences[sentenceIndex] || processedFullText;

    return (
      <div className="dialogue-modal-backdrop narrator-backdrop fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md backdrop-filter transition-all duration-500 animate-fade-in pointer-events-auto">
        <div className="dialogue-card-container narrator-modal-box w-[92%] sm:w-[86%] max-w-md sm:max-w-lg bg-gradient-to-b from-slate-950/92 via-slate-900/90 to-amber-950/35 border border-amber-400/35 rounded-2xl p-4 sm:p-6 shadow-[0_12px_45px_rgba(0,0,0,0.85),0_0_35px_rgba(245,158,11,0.15)] flex flex-col items-center text-center gap-3 sm:gap-4 relative overflow-hidden animate-fade-in">
          <div className="absolute -top-12 -left-12 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Prologue header tag */}
          <div className="dialogue-top-banner flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 font-pixel text-[8px] sm:text-[9.5px] tracking-wider shadow-xs">
            <IconSparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>PROLOG CERITA</span>
            <span className="text-amber-500">•</span>
            <span className="text-amber-200">
              {sentenceIndex + 1} / {sentences.length}
            </span>
          </div>

          {/* Smooth Fade-in Sentence Text */}
          <div
            key={sentenceIndex}
            className="min-h-[50px] sm:min-h-[76px] flex items-center justify-center animate-fade-in duration-500 px-2 sm:px-3 select-text"
          >
            <p
              style={{
                fontFamily: 'Galindo, cursive, sans-serif',
                fontSize: '15px',
                lineHeight: '1.4',
                textAlign: 'justify',
              }}
              className="text-[12.5px] sm:text-[15px] leading-relaxed text-amber-50 font-medium tracking-wide text-justify"
            >
              "{narratorSentence}"
            </p>
          </div>

          {/* Sentence progress dots */}
          <div className="flex items-center gap-1.5 py-0.5">
            {sentences.map((_, idx) => (
              <span
                key={idx}
                className={`transition-all duration-300 rounded-full ${
                  idx === sentenceIndex
                    ? 'w-5 h-1.5 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                    : idx < sentenceIndex
                    ? 'w-1.5 h-1.5 bg-amber-400/60'
                    : 'w-1.5 h-1.5 bg-slate-700'
                }`}
              />
            ))}
          </div>

          {/* Minimalist Continue action bar */}
          <div className="dialogue-bottom-bar flex items-center justify-between w-full pt-1.5 sm:pt-2 border-t border-slate-800/80">
            <span className="text-[7.5px] sm:text-[9px] text-slate-500 font-pixel">
              Tekan Spasi atau Enter
            </span>
            <button
              id="narrator-continue-btn"
              onClick={handleNextSentence}
              className="dialogue-action-btn px-3.5 sm:px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-pixel text-[8.5px] sm:text-[10px] font-bold shadow-[0_3px_15px_rgba(245,158,11,0.4)] active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer hover:shadow-[0_4px_20px_rgba(245,158,11,0.6)]"
            >
              <span>Lanjut</span>
              <span className="text-[10px] leading-none">➔</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Dynamic styling based on quiz feedback status & intro focus mode
  let dialogBoxStyle =
    'bg-slate-950/95 border-2 border-amber-400/90 hover:border-amber-300 shadow-[0_12px_45px_rgba(0,0,0,0.85)] hover:shadow-[0_12px_55px_rgba(245,158,11,0.25)] text-slate-100';

  if (feedbackStatus === 'wrong') {
    dialogBoxStyle =
      'bg-red-950/95 border-4 border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.95),0_0_0_2px_rgba(254,202,202,0.8)] animate-shake text-rose-100';
  } else if (feedbackStatus === 'correct') {
    dialogBoxStyle =
      'bg-emerald-950/95 border-4 border-emerald-400 shadow-[0_0_55px_rgba(52,211,153,0.95),0_0_0_2px_rgba(167,243,208,0.8)] text-emerald-100';
  } else if (introStep) {
    if (introStep.color === 'cyan') {
      dialogBoxStyle =
        'bg-gradient-to-b from-slate-950 via-slate-900 to-cyan-950/95 border-3 sm:border-4 border-cyan-400 shadow-[0_0_65px_rgba(6,182,212,0.55),0_0_0_2px_rgba(103,232,249,0.6)] text-cyan-50';
    } else if (introStep.color === 'yellow') {
      dialogBoxStyle =
        'bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950/95 border-3 sm:border-4 border-yellow-300 shadow-[0_0_75px_rgba(234,179,8,0.65),0_0_0_2px_rgba(253,224,71,0.7)] text-amber-50';
    } else {
      dialogBoxStyle =
        'bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950/95 border-3 sm:border-4 border-emerald-400 shadow-[0_0_65px_rgba(16,185,129,0.55),0_0_0_2px_rgba(110,231,183,0.6)] text-emerald-50';
    }
  } else if (isMissionNotice) {
    dialogBoxStyle =
      'bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950/90 border-3 border-amber-400 shadow-[0_12px_45px_rgba(245,158,11,0.4),0_0_0_2px_rgba(254,240,138,0.6)] text-slate-100';
  }

  return (
    <div
      id="dialogue-backdrop-root"
      className={`dialogue-modal-backdrop fixed inset-0 z-40 flex items-center justify-center p-2.5 sm:p-4 pointer-events-none transition-all duration-500 ${
        isIntroPrologue ? 'bg-slate-950/75 backdrop-blur-md backdrop-filter' : 'bg-transparent'
      }`}
    >
      <div
        id="dialogue-main-card"
        className={`dialogue-card-container pointer-events-auto w-full max-w-xl rounded-2xl p-3 sm:p-5 backdrop-blur-md flex flex-col gap-2.5 sm:gap-3 font-pixel transition-all duration-300 animate-fade-in-slide-up relative overflow-hidden ${
          isIntroPrologue ? 'scale-[1.01] sm:scale-105 ring-2 ring-white/10' : ''
        } ${dialogBoxStyle}`}
      >
        {/* Floating Celebration Overlay */}
        {feedbackStatus === 'correct' && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-30">
            <div className="flex gap-4 text-3xl sm:text-4xl animate-applause-float">
              <span>👏</span>
              <span>✨</span>
              <span>💖</span>
              <span>🌟</span>
              <span>👏</span>
            </div>
          </div>
        )}




        {/* Header: Speaker & Role */}
        <div className="dialogue-header flex items-center justify-between border-b border-slate-800 pb-1.5 sm:pb-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span
              className={`font-pixel text-[10px] sm:text-xs font-bold tracking-wider ${
                feedbackStatus === 'wrong'
                  ? 'text-rose-300'
                  : feedbackStatus === 'correct'
                  ? 'text-emerald-300'
                  : isMissionNotice
                  ? 'text-amber-400'
                  : 'text-amber-300'
              }`}
            >
              {processedSpeaker}
            </span>
            <span className="font-pixel text-[7.5px] sm:text-[9px] bg-slate-800/90 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
              {processedRole}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {dialogue.emotionAura && (
              <div className="flex items-center gap-1 text-[7.5px] sm:text-[9px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-pixel hover:scale-105 hover:shadow-[0_0_10px_rgba(245,158,11,0.35)] transition-all">
                <IconSparkles className="w-3 h-3 text-amber-400" />
                <span>AURA: {dialogue.emotionAura.toUpperCase()}</span>
              </div>
            )}
            <button
              id="dialogue-header-close-btn"
              onClick={handleExitOrSkip}
              disabled={feedbackStatus !== 'idle'}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-500/50 text-[7.5px] sm:text-[9px] font-pixel transition-all duration-200 hover:scale-105 hover:shadow-[0_0_12px_rgba(244,63,94,0.45)] active:scale-95 flex items-center gap-1 cursor-pointer disabled:opacity-40"
              title="Tutup / Lewati Dialog (ESC)"
            >
              <span>{isTyping ? ui.skip : ui.closeEsc}</span>
              <span className="font-bold">✕</span>
            </button>
          </div>
        </div>

        {/* Middle: Portrait + Dialogue text */}
        <div className="dialogue-middle-row flex gap-2.5 sm:gap-3 items-start">
          <div className="dialogue-portrait-wrapper shrink-0 transition-transform duration-200 hover:scale-105">
            {renderPortrait(dialogue.portrait)}
          </div>

          <div className="flex-1 flex flex-col gap-1.5 sm:gap-2 min-w-0">
            {/* Thought bubble if resonance is active */}
            {processedThought && isCompassActive && (
              <div className="bg-indigo-950/90 border border-indigo-500/50 rounded-lg p-1.5 sm:p-2 text-indigo-200 flex items-start gap-1.5 sm:gap-2 shadow-inner hover:scale-[1.015] hover:shadow-[0_0_14px_rgba(99,102,241,0.35)] transition-all duration-200">
                <IconEye className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-pixel text-[8.5px] sm:text-[10px] leading-relaxed italic text-indigo-100 break-words">
                    "{processedThought}"
                  </p>
                </div>
              </div>
            )}

            {/* Sentence Progress Indicator when there are multiple sentences */}
            {sentences.length > 1 && (
              <div className="flex items-center justify-end text-[7.5px] sm:text-[8.5px] font-pixel text-slate-400 pb-0.5">
                <div className="flex items-center gap-1">
                  {sentences.map((_, idx) => (
                    <span
                      key={idx}
                      className={`transition-all duration-300 rounded-full ${
                        idx === sentenceIndex
                          ? 'w-4 h-1.5 bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]'
                          : idx < sentenceIndex
                          ? 'w-1.5 h-1.5 bg-amber-400/60'
                          : 'w-1.5 h-1.5 bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Spoken Text with Galindo */}
            <p
              id="dialogue-speech-text"
              style={{
                fontFamily: 'Galindo, cursive, sans-serif',
                fontSize: '15px',
                lineHeight: '1.4',
                textAlign: 'justify',
              }}
              className="text-slate-100 min-h-[40px] sm:min-h-[46px] tracking-normal break-words select-text leading-snug sm:leading-normal text-justify"
            >
              {displayedText}
              {isTyping && <span className="inline-block w-2 h-3.5 bg-amber-400 ml-1.5 animate-pulse align-middle" />}
            </p>

            {isTyping && (
              <button
                id="dialogue-fast-forward-btn"
                onClick={finishTypingInstantly}
                className="self-end text-[7.5px] sm:text-[8px] font-pixel text-amber-400 hover:text-amber-200 bg-slate-900/80 hover:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30 hover:border-amber-400 hover:scale-105 hover:shadow-[0_0_12px_rgba(245,158,11,0.4)] active:scale-95 transition-all duration-200 flex items-center gap-1 cursor-pointer"
              >
                <span>{ui.showAllText}</span>
              </button>
            )}
          </div>
        </div>

        {/* Choices or Next Button */}
        <div className="dialogue-bottom-bar mt-1 pt-1.5 sm:pt-2 border-t border-slate-800/80">
          {dialogue.choices && dialogue.choices.length > 0 ? (
            showChoices ? (
              <div className="flex flex-col gap-1.5 sm:gap-2 animate-fade-in-slide-up">
                <div className="flex items-center justify-between">
                  <span
                    className={`font-pixel text-[8px] sm:text-[9px] font-semibold flex items-center gap-1.5 ${
                      feedbackStatus === 'wrong'
                        ? 'text-rose-300'
                        : feedbackStatus === 'correct'
                        ? 'text-emerald-300'
                        : 'text-amber-400'
                    }`}
                  >
                    <IconMessage className="w-3 h-3" />
                    {(wrongChoiceIdsRef.current[dialogue.id]?.length ?? 0) > 0
                      ? `Coba pilih respons lain yang lebih bijak (1-${dialogue.choices.length} atau klik):`
                      : `Pilih Responsmu (1-${dialogue.choices.length} atau klik):`}
                  </span>
                  <button
                    onClick={() => setShowChoices(false)}
                    className="text-[7.5px] sm:text-[9px] font-pixel text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
                    title="Kembali membaca ucapan karakter"
                  >
                    {ui.reReadText}
                  </button>
                </div>

                <div className="dialogue-choices-grid grid grid-cols-1 gap-1 sm:gap-1.5">
                  {dialogue.choices.map((choice, index) => {
                    const isSelected = selectedChoiceId === choice.id;
                    const isPreviouslyWrong = (wrongChoiceIdsRef.current[dialogue.id] || []).includes(choice.id);
                    const isWrongOption = isChoiceIncorrect(choice);
                    const isCompassFlaggedWrong = isCompassActive && isWrongOption;

                    let btnStyle =
                      'bg-slate-900/90 hover:bg-amber-950/70 border border-slate-700 hover:border-amber-400 text-slate-200 hover:text-amber-100';

                    if (isSelected && feedbackStatus === 'wrong') {
                      btnStyle =
                        'bg-red-900/80 border-2 border-red-400 text-white shadow-[0_0_16px_rgba(239,68,68,0.7)] scale-[1.02]';
                    } else if (isSelected && feedbackStatus === 'correct') {
                      btnStyle =
                        'bg-emerald-900/80 border-2 border-emerald-400 text-white shadow-[0_0_16px_rgba(16,185,129,0.7)] scale-[1.02]';
                    } else if (isPreviouslyWrong) {
                      btnStyle =
                        'bg-slate-950/70 border border-red-900/60 text-slate-400 hover:text-rose-200 hover:border-red-500/50';
                    } else if (isCompassFlaggedWrong) {
                      btnStyle =
                        'bg-gradient-to-r from-rose-950/60 via-slate-900/90 to-rose-950/40 border-2 border-rose-500/80 text-rose-200 shadow-[0_0_14px_rgba(244,63,94,0.3)] hover:border-rose-400 hover:text-rose-100';
                    }

                    return (
                      <button
                        key={choice.id}
                        id={`choice-${choice.id}`}
                        onClick={() => handleChoiceClick(choice)}
                        disabled={feedbackStatus !== 'idle'}
                        className={`dialogue-choice-btn w-full text-left px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-lg font-pixel text-[8.5px] sm:text-[10px] transition-transform duration-75 flex items-center gap-2 cursor-pointer active:scale-[0.97] group disabled:cursor-not-allowed ${btnStyle}`}
                      >
                        <span
                          className={`rounded px-1.5 py-0.5 text-[8.5px] font-pixel shrink-0 transition-colors ${
                            isSelected && feedbackStatus === 'wrong'
                              ? 'bg-red-500 text-white border border-red-300'
                              : isSelected && feedbackStatus === 'correct'
                              ? 'bg-emerald-400 text-slate-950 border border-emerald-200'
                              : isPreviouslyWrong
                              ? 'bg-red-950/90 text-rose-300 border border-red-800'
                              : isCompassFlaggedWrong
                              ? 'bg-rose-600 text-white font-bold border border-rose-300 shadow-sm'
                              : 'bg-slate-800 text-amber-300 border border-slate-600 group-hover:bg-amber-500 group-hover:text-slate-950 group-hover:border-amber-300'
                          }`}
                        >
                          {index + 1}
                        </span>
                        <span
                          style={{
                            fontFamily: 'Galindo, cursive, sans-serif',
                            fontSize: '15px',
                            lineHeight: '1.4',
                            textAlign: 'justify',
                          }}
                          className="flex-1 text-justify"
                        >
                          {formatName(choice.text)}
                        </span>
                        {isCompassFlaggedWrong && (
                          <span
                            title="Peringatan Kompas Hati: Opsi respons ini salah atau kurang bijak"
                            className="text-[7px] sm:text-[8px] font-pixel bg-rose-500/20 text-rose-300 border border-rose-400/80 px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0 ml-1 animate-pulse"
                          >
                            <IconAlert className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                            <span>Respons Kurang Tepat</span>
                          </span>
                        )}
                        {isPreviouslyWrong && !isCompassFlaggedWrong && (
                          <span className="text-[7px] sm:text-[8px] bg-red-950/90 text-rose-300 border border-red-600/60 px-1.5 py-0.5 rounded font-bold shrink-0 ml-1">
                            Kurang Tepat
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              isTyping ? (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                  <div className="flex items-center gap-1.5 text-slate-400 font-pixel text-[8px] sm:text-[9px]">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
                    <span>Mendengarkan ucapan karakter...</span>
                  </div>
                  <button
                    id="dialogue-finish-typing-btn"
                    onClick={finishTypingInstantly}
                    className="dialogue-action-btn w-full sm:w-auto px-3 py-1.5 rounded-lg font-pixel text-[8.5px] sm:text-[9px] bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 flex items-center justify-center gap-1.5 transition-transform duration-75 active:scale-95 cursor-pointer shrink-0 touch-manipulation"
                  >
                    <span>⚡ Lewati Animasi Teks</span>
                  </button>
                </div>
              ) : !isLastSentence ? (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-2 bg-slate-900/80 border border-amber-500/40 rounded-xl p-1.5 sm:p-2.5 animate-fade-in shadow-xs">
                  <div className="flex items-center gap-1.5 text-slate-300 font-pixel text-[8px] sm:text-[9px]">
                    <span>
                      Klik Lanjut untuk membaca kalimat berikutnya
                    </span>
                  </div>
                  <button
                    id="dialogue-next-sentence-btn"
                    onClick={handleNextSentence}
                    className="dialogue-action-btn w-full sm:w-auto px-4 py-1.5 rounded-xl font-pixel font-bold text-[8.5px] sm:text-[10px] bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.5)] flex items-center justify-center gap-1.5 transition-transform duration-75 hover:scale-105 active:scale-95 cursor-pointer shrink-0"
                  >
                    <span>LANJUTKAN</span>
                    <span className="text-xs">▶</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-2 bg-amber-950/30 border border-amber-500/40 rounded-xl p-1.5 sm:p-2.5 animate-fade-in">
                  <div className="flex items-center gap-1.5 text-amber-200 font-pixel text-[8px] sm:text-[9px]">
                    <IconMessage className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Teks selesai dibaca. Klik tombol untuk menentukan respons tanggapanmu:</span>
                  </div>
                  <button
                    id="dialogue-show-choices-btn"
                    onClick={() => {
                      sound.playMenuSelect();
                      setShowChoices(true);
                    }}
                    className="dialogue-action-btn w-full sm:w-auto px-4 py-2 rounded-xl font-pixel font-bold text-[8.5px] sm:text-[10px] bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 shadow-[0_0_18px_rgba(245,158,11,0.6)] flex items-center justify-center gap-2 transition-transform duration-75 hover:scale-105 active:scale-95 cursor-pointer shrink-0"
                  >
                    <span>KLIK PILIH RESPONS</span>
                    <span className="text-xs">💬 ▶</span>
                  </button>
                </div>
              )
            )
          ) : (
            <div className="flex justify-between items-center gap-2">
              {sentences.length > 1 ? (
                <div className="flex items-center gap-1.5 text-slate-400 font-pixel text-[8px] sm:text-[9px]">
                  <span className="text-amber-300 font-bold">
                    {sentenceIndex + 1}/{sentences.length}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span>
                    {!isLastSentence
                      ? 'Ada kalimat berikutnya'
                      : 'Akhir percakapan'}
                  </span>
                </div>
              ) : <div />}

              <div className="flex items-center gap-2">
                {isRegulationTrigger && !isTyping && onSkipRegulation && (
                  <button
                    id="dialogue-skip-regulation-btn"
                    onClick={onSkipRegulation}
                    className="dialogue-action-btn px-2.5 py-1.5 rounded-lg font-pixel text-[7.5px] sm:text-[9px] text-slate-400 hover:text-slate-200 hover:bg-slate-800 hover:scale-105 hover:shadow-[0_0_10px_rgba(148,163,184,0.3)] transition-transform duration-75 border border-slate-700 cursor-pointer active:scale-95 touch-manipulation"
                    title="Lewati latihan dan langsung lanjut ke percakapan berikutnya"
                  >
                    Lewati Latihan ▶
                  </button>
                )}
                <button
                  id="dialogue-next-btn"
                  onClick={handleNextSentence}
                  className={`dialogue-action-btn px-3.5 py-1.5 rounded-lg font-pixel font-bold text-[8.5px] sm:text-[10px] flex items-center gap-1.5 shadow transition-transform duration-75 hover:scale-105 active:scale-95 cursor-pointer ${
                    isEndingDialogue && !isTyping && isLastSentence
                      ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 border border-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.55)] hover:shadow-[0_0_30px_rgba(245,158,11,0.85)]'
                      : isRegulationTrigger && !isTyping && isLastSentence
                      ? 'bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 border border-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.55)] hover:shadow-[0_0_30px_rgba(6,182,212,0.85)]'
                      : isWrongFeedback && isLastSentence
                      ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 border border-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.65)] hover:shadow-[0_0_30px_rgba(245,158,11,0.85)]'
                      : 'bg-amber-400 hover:bg-amber-300 text-slate-950 hover:shadow-[0_0_20px_rgba(245,158,11,0.65)]'
                  }`}
                >
                  <span>
                    {isWrongFeedback && isLastSentence
                      ? 'COBA PILIH LAGI'
                      : isTyping
                      ? 'LEWATI EFEK'
                      : !isLastSentence
                      ? 'LANJUT'
                      : isEndingDialogue
                      ? 'SELESAIKAN & LIHAT SERTIFIKAT'
                      : isRegulationTrigger
                      ? 'MULAI LATIHAN BERSAMA KIKI'
                      : 'LANJUT'}
                  </span>
                  <span className="text-xs">
                    {isEndingDialogue && !isTyping && isLastSentence
                      ? '🏆'
                      : isRegulationTrigger && !isTyping && isLastSentence
                      ? '🧘'
                      : isWrongFeedback && isLastSentence
                      ? '↩'
                      : '▶'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
