import React, { useEffect, useState } from 'react';
import { DialogueNode, ChoiceOption } from '../types/game';
import { sound } from '../utils/audio';
import { Eye, MessageCircle, Sparkles } from 'lucide-react';
import { CharacterPortrait } from './CharacterPortrait';

interface DialogueBoxProps {
  dialogue: DialogueNode;
  onChoiceSelect: (choice: ChoiceOption) => void;
  onNext: () => void;
  onSkipRegulation?: () => void;
  onClose?: () => void;
  isCompassActive: boolean;
}

export const DialogueBox: React.FC<DialogueBoxProps> = ({
  dialogue,
  onChoiceSelect,
  onNext,
  onSkipRegulation,
  onClose,
  isCompassActive,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  // Typewriter effect
  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    let index = 0;
    const fullText = dialogue.text;

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
  }, [dialogue]);

  // Handle immediate text skip or exit
  const handleExitOrSkip = () => {
    if (isTyping) {
      setDisplayedText(dialogue.text);
      setIsTyping(false);
    } else if (onClose) {
      onClose();
    } else {
      onNext();
    }
  };

  // Keyboard navigation for dialogue
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
          onChoiceSelect(dialogue.choices[num - 1]);
          return;
        }

        if (e.code === 'Space') {
          if (isTyping) {
            e.preventDefault();
            setDisplayedText(dialogue.text);
            setIsTyping(false);
          }
        }
      } else {
        if (e.code === 'Space') {
          e.preventDefault();
          if (isTyping) {
            // Finish typing immediately
            setDisplayedText(dialogue.text);
            setIsTyping(false);
          } else {
            onNext();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dialogue, isTyping, onChoiceSelect, onNext, onClose]);

  // Character portraits rendering
  const renderPortrait = (type: string) => {
    switch (type) {
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

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-3 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-xl bg-slate-950/95 border-2 border-amber-400/90 rounded-2xl p-4 sm:p-5 shadow-[0_12px_45px_rgba(0,0,0,0.85)] backdrop-blur-md text-slate-100 flex flex-col gap-3 font-pixel animate-in fade-in zoom-in-95 duration-150">
        {/* Header: Speaker & Role */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="font-pixel text-[11px] sm:text-xs text-amber-300 font-bold tracking-wider">
              {dialogue.speaker}
            </span>
            <span className="font-pixel text-[8px] sm:text-[9px] bg-slate-800/90 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
              {dialogue.speakerRole}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {dialogue.emotionAura && (
              <div className="flex items-center gap-1 text-[8px] sm:text-[9px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-pixel">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>AURA: {dialogue.emotionAura.toUpperCase()}</span>
              </div>
            )}
            <button
              id="dialogue-header-close-btn"
              onClick={handleExitOrSkip}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-500/50 text-[8px] sm:text-[9px] font-pixel transition flex items-center gap-1"
              title="Tutup / Lewati Dialog (ESC)"
            >
              <span>{isTyping ? 'LEWATI' : 'TUTUP [ESC]'}</span>
              <span className="font-bold">✕</span>
            </button>
          </div>
        </div>

        {/* Middle: Portrait + Dialogue text */}
        <div className="flex gap-3 items-start">
          <div className="shrink-0">{renderPortrait(dialogue.portrait)}</div>

          <div className="flex-1 flex flex-col gap-2">
            {/* Thought bubble if resonance is active */}
            {dialogue.thoughtBubble && isCompassActive && (
              <div className="bg-indigo-950/90 border border-indigo-500/50 rounded-lg p-2 text-indigo-200 flex items-start gap-2 shadow-inner">
                <Eye className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-pixel text-[8px] sm:text-[9px] text-indigo-300 block uppercase tracking-wider">
                    Suara Hati Terdalam (Kompas):
                  </span>
                  <p className="font-pixel text-[9px] sm:text-[10px] leading-relaxed italic text-indigo-100">
                    "{dialogue.thoughtBubble}"
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
                  setDisplayedText(dialogue.text);
                  setIsTyping(false);
                }}
                className="self-end text-[8px] font-pixel text-amber-400 hover:text-amber-300 bg-slate-900/80 px-2 py-0.5 rounded border border-amber-500/30 transition flex items-center gap-1 cursor-pointer"
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
              <span className="font-pixel text-[8px] sm:text-[9px] text-amber-400 font-semibold flex items-center gap-1.5">
                <MessageCircle className="w-3 h-3 text-amber-400" />
                Pilih Responmu (1-{dialogue.choices.length} atau klik):
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {dialogue.choices.map((choice, index) => (
                  <button
                    key={choice.id}
                    id={`choice-${choice.id}`}
                    onClick={() => onChoiceSelect(choice)}
                    className="w-full text-left px-2.5 py-2 rounded-lg bg-slate-900/90 hover:bg-amber-950/60 hover:border-amber-400 border border-slate-700 font-pixel text-[9px] sm:text-[10px] transition flex items-start gap-2 text-slate-200 hover:text-amber-200 cursor-pointer"
                  >
                    <span className="bg-slate-800 text-amber-300 border border-slate-600 rounded px-1.5 py-0.5 text-[9px] font-pixel shrink-0">
                      {index + 1}
                    </span>
                    <span className="flex-1 leading-relaxed">{choice.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex justify-end items-center gap-2">
              {isRegulationTrigger && !isTyping && onSkipRegulation && (
                <button
                  id="dialogue-skip-regulation-btn"
                  onClick={onSkipRegulation}
                  className="px-2.5 py-1.5 rounded-lg font-pixel text-[8px] sm:text-[9px] text-slate-400 hover:text-slate-200 hover:bg-slate-850 transition border border-slate-700 cursor-pointer"
                  title="Lewati latihan dan langsung lanjut ke percakapan berikutnya"
                >
                  Lewati Latihan ▶
                </button>
              )}
              <button
                id="dialogue-next-btn"
                onClick={() => {
                  if (isTyping) {
                    setDisplayedText(dialogue.text);
                    setIsTyping(false);
                  } else {
                    onNext();
                  }
                }}
                className={`px-3.5 py-1.5 rounded-lg font-pixel font-bold text-[9px] sm:text-[10px] flex items-center gap-1.5 shadow transition cursor-pointer ${
                  isEndingDialogue && !isTyping
                    ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 border border-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.45)]'
                    : isRegulationTrigger && !isTyping
                    ? 'bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 border border-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.45)]'
                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                }`}
              >
                <span>
                  {isTyping
                    ? 'LEWATI EFEK'
                    : isEndingDialogue
                    ? 'SELESAIKAN & LIHAT SERTIFIKAT [SPASI]'
                    : isRegulationTrigger
                    ? 'MULAI LATIHAN BERSAMA KIKI [SPASI]'
                    : 'LANJUT [SPASI]'}
                </span>
                <span className="text-xs">
                  {isEndingDialogue && !isTyping ? '🏆' : isRegulationTrigger && !isTyping ? '🧘' : '▶'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
