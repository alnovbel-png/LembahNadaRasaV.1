import React, { useEffect, useState } from 'react';
import { DialogueNode, ChoiceOption } from '../types/game';
import { sound } from '../utils/audio';
import { Eye, MessageCircle, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';
import { CharacterPortrait } from './CharacterPortrait';

interface DialogueBoxProps {
  dialogue: DialogueNode;
  onChoiceSelect: (choice: ChoiceOption) => void;
  onNext: () => void;
  onSkipRegulation?: () => void;
  onClose?: () => void;
  isCompassActive: boolean;
  playerName?: string;
  playerAvatar?: 'boy' | 'girl';
}

export const DialogueBox: React.FC<DialogueBoxProps> = ({
  dialogue,
  onChoiceSelect,
  onNext,
  onSkipRegulation,
  onClose,
  isCompassActive,
  playerName = 'Ezzel',
  playerAvatar = 'boy',
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'wrong' | 'correct'>('idle');
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);

  // Helper to replace generic protagonist names with user's nickname
  const formatName = (str: string) => {
    if (!str) return str;
    const name = (playerName && playerName.trim()) || 'Ezzel';
    return str
      .replace(/\bEzzel\b/g, name)
      .replace(/\bEzsel\b/g, name)
      .replace(/\bezzel\b/g, name.toLowerCase())
      .replace(/\bezsel\b/g, name.toLowerCase());
  };

  const processedSpeaker = formatName(dialogue.speaker);
  const processedRole = formatName(dialogue.speakerRole);
  const processedFullText = formatName(dialogue.text);
  const processedThought = dialogue.thoughtBubble ? formatName(dialogue.thoughtBubble) : undefined;

  // Typewriter effect
  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    setFeedbackStatus('idle');
    setSelectedChoiceId(null);
    let index = 0;
    const fullText = processedFullText;

    const interval = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText(fullText.slice(0, index + 1));
        if (index % 3 === 0) {
          sound.playVoiceBlip(dialogue.speaker.includes('Kiki'));
        }
        index++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 18);

    return () => clearInterval(interval);
  }, [dialogue, processedFullText]);

  // Handle immediate text skip or exit
  const handleExitOrSkip = () => {
    if (isTyping) {
      setDisplayedText(processedFullText);
      setIsTyping(false);
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

    const isWrong = choice.impactScore <= 0 || choice.resultDialogueId.includes('wrong');

    if (isWrong) {
      // 1. Incorrect response: Red dialog box, error buzzer, device vibration
      setFeedbackStatus('wrong');
      sound.playQuizWrong();
      setTimeout(() => {
        onChoiceSelect(choice);
        setFeedbackStatus('idle');
        setSelectedChoiceId(null);
      }, 1200);
    } else {
      // 2. Correct response: Green dialog box, cheerful applause fanfare, device vibration & floating stars
      setFeedbackStatus('correct');
      sound.playApplause();
      setTimeout(() => {
        onChoiceSelect(choice);
        setFeedbackStatus('idle');
        setSelectedChoiceId(null);
      }, 1500);
    }
  };

  // Keyboard navigation for dialogue
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (feedbackStatus !== 'idle') return;

      // Escape closes or exits dialogue immediately
      if (e.key === 'Escape') {
        e.preventDefault();
        if (onClose) {
          onClose();
        } else {
          onNext();
        }
        return;
      }

      if (dialogue.choices && dialogue.choices.length > 0) {
        // Number keys 1, 2, 3, 4, 5
        const num = parseInt(e.key);
        if (num >= 1 && num <= dialogue.choices.length) {
          handleChoiceClick(dialogue.choices[num - 1]);
          return;
        }

        if (e.code === 'Space') {
          if (isTyping) {
            e.preventDefault();
            setDisplayedText(processedFullText);
            setIsTyping(false);
          }
        }
      } else {
        if (e.code === 'Space') {
          e.preventDefault();
          if (isTyping) {
            // Finish typing immediately
            setDisplayedText(processedFullText);
            setIsTyping(false);
          } else {
            onNext();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dialogue, isTyping, processedFullText, onNext, onClose, feedbackStatus]);

  // Character portraits rendering
  const renderPortrait = (type: string) => {
    switch (type) {
      case 'player':
      case 'ezzel':
        return (
          <CharacterPortrait
            sprite={playerAvatar === 'girl' ? 'player_girl' : 'player'}
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
              {/* Ground shadow & stone ring */}
              <ellipse cx="16" cy="28" rx="9" ry="3" fill="rgba(0,0,0,0.5)" />
              <rect x="12" y="26" width="8" height="3" fill="#475569" />
              <rect x="14" y="25" width="4" height="2" fill="#64748b" />

              {/* Wooden post */}
              <rect x="14" y="7" width="4" height="20" fill="#78350f" />
              <rect x="14" y="7" width="1" height="20" fill="#451a03" />
              <rect x="17" y="7" width="1" height="20" fill="#b45309" />
              {/* Post top pyramid cap & iron pin */}
              <polygon points="13,7 19,7 16,4" fill="#92400e" />
              <rect x="15" y="3" width="2" height="2" fill="#0f172a" />

              {/* Upper wooden arrow sign (pointing left) */}
              <polygon points="5,10 9,7 21,7 21,13 9,13" fill="#d97706" />
              <polygon points="5,10 9,7 21,7 21,8 9,8" fill="#fde047" />
              <polygon points="5,10 9,12 21,12 21,13 9,13" fill="#78350f" />
              {/* Iron bolts & carved symbol */}
              <rect x="14" y="9" width="4" height="2" fill="#0f172a" />
              <rect x="8" y="9" width="3" height="2" fill="#15803d" />

              {/* Lower wooden arrow sign (pointing right) */}
              <polygon points="11,15 23,15 27,18 23,21 11,21" fill="#b45309" />
              <polygon points="11,15 23,15 27,18 23,16 11,16" fill="#f59e0b" />
              <polygon points="11,20 23,20 27,18 23,21 11,21" fill="#451a03" />
              {/* Iron bolts & carved symbol */}
              <rect x="14" y="17" width="4" height="2" fill="#0f172a" />
              <rect x="20" y="17" width="3" height="2" fill="#eab308" />

              {/* Hanging mini lantern on scroll bracket */}
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

  const isMissionNotice = Boolean(
    dialogue.speaker?.includes('Misi') ||
    dialogue.id?.includes('locked') ||
    dialogue.id?.includes('quest') ||
    dialogue.id?.includes('remind') ||
    dialogue.speakerRole?.includes('Penunjuk Misi')
  );

  // Dynamic styling based on quiz feedback status
  let dialogBoxStyle =
    'bg-slate-950/95 border-2 border-amber-400/90 hover:border-amber-300 shadow-[0_12px_45px_rgba(0,0,0,0.85)] hover:shadow-[0_12px_55px_rgba(245,158,11,0.25)] text-slate-100';

  if (feedbackStatus === 'wrong') {
    dialogBoxStyle =
      'bg-red-950/95 border-4 border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.95),0_0_0_2px_rgba(254,202,202,0.8)] animate-shake text-rose-100';
  } else if (feedbackStatus === 'correct') {
    dialogBoxStyle =
      'bg-emerald-950/95 border-4 border-emerald-400 shadow-[0_0_55px_rgba(52,211,153,0.95),0_0_0_2px_rgba(167,243,208,0.8)] text-emerald-100';
  } else if (isMissionNotice) {
    dialogBoxStyle =
      'bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950/90 border-3 border-amber-400 shadow-[0_12px_45px_rgba(245,158,11,0.4),0_0_0_2px_rgba(254,240,138,0.6)] text-slate-100';
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-3 pointer-events-none">
      <div
        className={`pointer-events-auto w-full max-w-xl rounded-2xl p-4 sm:p-5 backdrop-blur-md flex flex-col gap-3 font-pixel transition-all duration-300 animate-fade-in-slide-up relative overflow-hidden ${dialogBoxStyle}`}
      >
        {/* Floating Applause & Celebration Overlay */}
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

        {/* Quiz Feedback Banner: Wrong Answer */}
        {feedbackStatus === 'wrong' && (
          <div className="bg-red-600 text-white px-3 py-1.5 rounded-xl font-pixel text-[9px] sm:text-[10px] font-bold flex items-center justify-between shadow-lg border border-red-300 animate-pulse">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-yellow-300 shrink-0" />
              <span>JAWABAN KURANG TEPAT — MARI COBA PIKIRKAN LAGI</span>
            </div>
            <span className="text-[8px] bg-red-950 text-rose-200 px-2 py-0.5 rounded font-bold">
              Perhatikan Perasaannya
            </span>
          </div>
        )}

        {/* Quiz Feedback Banner: Correct Answer & Applause */}
        {feedbackStatus === 'correct' && (
          <div className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 text-slate-950 px-3 py-1.5 rounded-xl font-pixel text-[9px] sm:text-[10px] font-black flex items-center justify-between shadow-lg border border-emerald-200">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-slate-950 shrink-0 animate-bounce" />
              <span>HEBAT SEKALI! JAWABAN BIJAK & PENUH EMPATI! 🎉</span>
            </div>
            <span className="text-[8px] bg-emerald-950 text-emerald-200 px-2 py-0.5 rounded font-bold">
              +Poin Empati 👏
            </span>
          </div>
        )}

        {/* Mission Notice Banner for Children (when not showing quiz feedback) */}
        {isMissionNotice && feedbackStatus === 'idle' && (
          <div className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-slate-950 px-3 py-1.5 rounded-xl font-pixel text-[9px] sm:text-[10px] font-black flex items-center justify-between shadow-md border border-amber-500">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-slate-950 animate-bounce" />
              <span>PANDUAN ALUR MISI BERURUTAN</span>
            </div>
            <span className="text-[8px] bg-slate-950 text-amber-300 px-2 py-0.5 rounded font-bold">
              Wajib Selesaikan 1 per 1
            </span>
          </div>
        )}

        {/* Header: Speaker & Role */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <span
              className={`font-pixel text-[11px] sm:text-xs font-bold tracking-wider ${
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
            <span className="font-pixel text-[8px] sm:text-[9px] bg-slate-800/90 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
              {processedRole}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {dialogue.emotionAura && (
              <div className="flex items-center gap-1 text-[8px] sm:text-[9px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-pixel hover:scale-105 hover:shadow-[0_0_10px_rgba(245,158,11,0.35)] transition-all">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>AURA: {dialogue.emotionAura.toUpperCase()}</span>
              </div>
            )}
            <button
              id="dialogue-header-close-btn"
              onClick={handleExitOrSkip}
              disabled={feedbackStatus !== 'idle'}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-500/50 text-[8px] sm:text-[9px] font-pixel transition-all duration-200 hover:scale-105 hover:shadow-[0_0_12px_rgba(244,63,94,0.45)] active:scale-95 flex items-center gap-1 cursor-pointer disabled:opacity-40"
              title="Tutup / Lewati Dialog (ESC)"
            >
              <span>{isTyping ? 'LEWATI' : 'TUTUP [ESC]'}</span>
              <span className="font-bold">✕</span>
            </button>
          </div>
        </div>

        {/* Middle: Portrait + Dialogue text */}
        <div className="flex gap-3 items-start">
          <div className="shrink-0 transition-transform duration-200 hover:scale-105 hover:rotate-1">
            {renderPortrait(dialogue.portrait)}
          </div>

          <div className="flex-1 flex flex-col gap-2">
            {/* Thought bubble if resonance is active */}
            {processedThought && isCompassActive && (
              <div className="bg-indigo-950/90 border border-indigo-500/50 rounded-lg p-2 text-indigo-200 flex items-start gap-2 shadow-inner hover:scale-[1.015] hover:shadow-[0_0_14px_rgba(99,102,241,0.35)] transition-all duration-200">
                <Eye className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-pixel text-[8px] sm:text-[9px] text-indigo-300 block uppercase tracking-wider">
                    Suara Hati Terdalam (Kompas):
                  </span>
                  <p className="font-pixel text-[9px] sm:text-[10px] leading-relaxed italic text-indigo-100">
                    "{processedThought}"
                  </p>
                </div>
              </div>
            )}

            {/* Spoken Text with retro pixel font */}
            <p className="font-pixel text-[10px] sm:text-[11px] leading-[1.8] text-slate-100 min-h-[48px] tracking-wide break-words">
              {displayedText}
              {isTyping && <span className="inline-block w-2 h-3 bg-amber-400 ml-1 animate-pulse" />}
            </p>

            {isTyping && (
              <button
                id="dialogue-fast-forward-btn"
                onClick={() => {
                  setDisplayedText(processedFullText);
                  setIsTyping(false);
                }}
                className="self-end text-[8px] font-pixel text-amber-400 hover:text-amber-200 bg-slate-900/80 hover:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30 hover:border-amber-400 hover:scale-105 hover:shadow-[0_0_12px_rgba(245,158,11,0.4)] active:scale-95 transition-all duration-200 flex items-center gap-1 cursor-pointer"
              >
                <span>⚡ Tampilkan Semua Teks [Spasi]</span>
              </button>
            )}
          </div>
        </div>

        {/* Choices or Next Button */}
        <div className="mt-1 pt-2 border-t border-slate-800/80">
          {dialogue.choices && dialogue.choices.length > 0 ? (
            <div className="flex flex-col gap-2">
              <span
                className={`font-pixel text-[8px] sm:text-[9px] font-semibold flex items-center gap-1.5 ${
                  feedbackStatus === 'wrong'
                    ? 'text-rose-300'
                    : feedbackStatus === 'correct'
                    ? 'text-emerald-300'
                    : 'text-amber-400'
                }`}
              >
                <MessageCircle className="w-3 h-3" />
                Pilih Responmu (1-{dialogue.choices.length} atau klik):
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {dialogue.choices.map((choice, index) => {
                  const isSelected = selectedChoiceId === choice.id;
                  let btnStyle =
                    'bg-slate-900/90 hover:bg-amber-950/70 border border-slate-700 hover:border-amber-400 text-slate-200 hover:text-amber-100';

                  if (isSelected && feedbackStatus === 'wrong') {
                    btnStyle =
                      'bg-red-900/80 border-2 border-red-400 text-white shadow-[0_0_16px_rgba(239,68,68,0.7)] scale-[1.02]';
                  } else if (isSelected && feedbackStatus === 'correct') {
                    btnStyle =
                      'bg-emerald-900/80 border-2 border-emerald-400 text-white shadow-[0_0_16px_rgba(16,185,129,0.7)] scale-[1.02]';
                  }

                  return (
                    <button
                      key={choice.id}
                      id={`choice-${choice.id}`}
                      onClick={() => handleChoiceClick(choice)}
                      disabled={feedbackStatus !== 'idle'}
                      className={`w-full text-left px-2.5 py-2 rounded-lg font-pixel text-[9px] sm:text-[10px] transition-all duration-200 ease-out flex items-start gap-2 cursor-pointer active:scale-[0.98] group disabled:cursor-not-allowed ${btnStyle}`}
                    >
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-pixel shrink-0 transition-colors ${
                          isSelected && feedbackStatus === 'wrong'
                            ? 'bg-red-500 text-white border border-red-300'
                            : isSelected && feedbackStatus === 'correct'
                            ? 'bg-emerald-400 text-slate-950 border border-emerald-200'
                            : 'bg-slate-800 text-amber-300 border border-slate-600 group-hover:bg-amber-500 group-hover:text-slate-950 group-hover:border-amber-300'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span className="flex-1 leading-relaxed">
                        {formatName(choice.text)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex justify-end items-center gap-2">
              {isRegulationTrigger && !isTyping && onSkipRegulation && (
                <button
                  id="dialogue-skip-regulation-btn"
                  onClick={onSkipRegulation}
                  className="px-2.5 py-1.5 rounded-lg font-pixel text-[8px] sm:text-[9px] text-slate-400 hover:text-slate-200 hover:bg-slate-850 hover:scale-105 hover:shadow-[0_0_10px_rgba(148,163,184,0.3)] transition-all duration-200 border border-slate-700 cursor-pointer active:scale-95"
                  title="Lewati latihan dan langsung lanjut ke percakapan berikutnya"
                >
                  Lewati Latihan ▶
                </button>
              )}
              <button
                id="dialogue-next-btn"
                onClick={() => {
                  if (isTyping) {
                    setDisplayedText(processedFullText);
                    setIsTyping(false);
                  } else {
                    onNext();
                  }
                }}
                className={`px-3.5 py-1.5 rounded-lg font-pixel font-bold text-[9px] sm:text-[10px] flex items-center gap-1.5 shadow transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
                  isEndingDialogue && !isTyping
                    ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 border border-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.55)] hover:shadow-[0_0_30px_rgba(245,158,11,0.85)]'
                    : isRegulationTrigger && !isTyping
                    ? 'bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 border border-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.55)] hover:shadow-[0_0_30px_rgba(6,182,212,0.85)]'
                    : isWrongFeedback && !isTyping
                    ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 border border-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.65)] hover:shadow-[0_0_30px_rgba(245,158,11,0.85)]'
                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950 hover:shadow-[0_0_20px_rgba(245,158,11,0.65)]'
                }`}
              >
                <span>
                  {isTyping
                    ? 'LEWATI EFEK'
                    : isEndingDialogue
                    ? 'SELESAIKAN & LIHAT SERTIFIKAT [SPASI]'
                    : isRegulationTrigger
                    ? 'MULAI LATIHAN BERSAMA KIKI [SPASI]'
                    : isWrongFeedback
                    ? 'KEMBALI KE DIALOG AWAL [SPASI]'
                    : 'LANJUT [SPASI]'}
                </span>
                <span className="text-xs">
                  {isEndingDialogue && !isTyping
                    ? '🏆'
                    : isRegulationTrigger && !isTyping
                    ? '🧘'
                    : isWrongFeedback && !isTyping
                    ? '↩'
                    : '▶'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
