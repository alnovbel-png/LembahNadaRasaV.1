import React, { useEffect, useState } from 'react';
import { DialogueNode, ChoiceOption } from '../types/game';
import { sound } from '../utils/audio';
import { Eye, MessageCircle, Sparkles } from 'lucide-react';

interface DialogueBoxProps {
  dialogue: DialogueNode;
  onChoiceSelect: (choice: ChoiceOption) => void;
  onNext: () => void;
  isCompassActive: boolean;
}

export const DialogueBox: React.FC<DialogueBoxProps> = ({
  dialogue,
  onChoiceSelect,
  onNext,
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

  // Keyboard navigation for dialogue
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (dialogue.choices && dialogue.choices.length > 0) {
        // Number keys 1, 2, 3
        const num = parseInt(e.key);
        if (num >= 1 && num <= dialogue.choices.length) {
          onChoiceSelect(dialogue.choices[num - 1]);
        }
      } else {
        if (e.code === 'Space' || e.key === 'Enter') {
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
  }, [dialogue, isTyping, onChoiceSelect, onNext]);

  // Character portraits rendering
  const renderPortrait = (type: string) => {
    switch (type) {
      case 'squirrel':
        return (
          <div className="w-16 h-16 bg-amber-800 rounded-lg flex items-center justify-center text-2xl border-2 border-amber-500 shadow-md">
            🐿️
          </div>
        );
      case 'old_man':
        return (
          <div className="w-16 h-16 bg-blue-900 rounded-lg flex items-center justify-center text-2xl border-2 border-blue-400 shadow-md">
            👴🏻
          </div>
        );
      case 'boy_glasses':
        return (
          <div className="w-16 h-16 bg-yellow-900 rounded-lg flex items-center justify-center text-2xl border-2 border-yellow-400 shadow-md">
            👦🏻
          </div>
        );
      case 'chicken_glasses':
        return (
          <div className="w-16 h-16 bg-rose-900 rounded-lg flex items-center justify-center text-2xl border-2 border-rose-400 shadow-md">
            🐔
          </div>
        );
      case 'grandmother':
      case 'spirit_elder':
        return (
          <div className="w-16 h-16 bg-purple-900 rounded-lg flex items-center justify-center text-2xl border-2 border-purple-400 shadow-md">
            👵🏼
          </div>
        );
      case 'compass_item':
        return (
          <div className="w-16 h-16 bg-amber-950 rounded-lg flex items-center justify-center text-2xl border-2 border-amber-300 shadow-md animate-pulse">
            🧭
          </div>
        );
      case 'girl_counselor':
        return (
          <div className="w-16 h-16 bg-teal-900 rounded-lg flex items-center justify-center text-2xl border-2 border-teal-400 shadow-md">
            👩🏻‍🏫
          </div>
        );
      case 'zen_master':
        return (
          <div className="w-16 h-16 bg-emerald-950 rounded-lg flex items-center justify-center text-2xl border-2 border-emerald-400 shadow-md">
            🧘🏻‍♂️
          </div>
        );
      case 'cat_librarian':
        return (
          <div className="w-16 h-16 bg-orange-950 rounded-lg flex items-center justify-center text-2xl border-2 border-orange-400 shadow-md">
            🐱
          </div>
        );
      case 'farmer':
        return (
          <div className="w-16 h-16 bg-amber-950 rounded-lg flex items-center justify-center text-2xl border-2 border-amber-400 shadow-md">
            👨‍🌾
          </div>
        );
      case 'wandering_scout':
        return (
          <div className="w-16 h-16 bg-emerald-950 rounded-lg flex items-center justify-center text-2xl border-2 border-emerald-400 shadow-md">
            🏕️
          </div>
        );
      case 'woodcutter':
        return (
          <div className="w-16 h-16 bg-red-950 rounded-lg flex items-center justify-center text-2xl border-2 border-red-500 shadow-md">
            🪓
          </div>
        );
      case 'fruit_farmer':
        return (
          <div className="w-16 h-16 bg-lime-950 rounded-lg flex items-center justify-center text-2xl border-2 border-lime-400 shadow-md">
            🍎
          </div>
        );
      case 'fisherman':
        return (
          <div className="w-16 h-16 bg-sky-950 rounded-lg flex items-center justify-center text-2xl border-2 border-sky-400 shadow-md">
            🎣
          </div>
        );
      case 'player':
        return (
          <div className="w-16 h-16 bg-emerald-900 rounded-lg flex items-center justify-center text-2xl border-2 border-emerald-400 shadow-md">
            🎒
          </div>
        );
      default:
        return (
          <div className="w-16 h-16 bg-slate-800 rounded-lg flex items-center justify-center text-2xl border-2 border-slate-600 shadow-md">
            📜
          </div>
        );
    }
  };

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

          {dialogue.emotionAura && (
            <div className="flex items-center gap-1 text-[8px] sm:text-[9px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-pixel">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>AURA: {dialogue.emotionAura.toUpperCase()}</span>
            </div>
          )}
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
          </div>
        </div>

        {/* Choices or Next Button */}
        <div className="mt-1 pt-2 border-t border-slate-800/80">
          {dialogue.choices && dialogue.choices.length > 0 ? (
            <div className="flex flex-col gap-2">
              <span className="font-pixel text-[8px] sm:text-[9px] text-amber-400 font-semibold flex items-center gap-1.5">
                <MessageCircle className="w-3 h-3 text-amber-400" />
                Pilih Responmu (1-3 atau klik):
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {dialogue.choices.map((choice, index) => (
                  <button
                    key={choice.id}
                    id={`choice-${choice.id}`}
                    onClick={() => onChoiceSelect(choice)}
                    className="w-full text-left px-2.5 py-2 rounded-lg bg-slate-900/90 hover:bg-amber-950/60 hover:border-amber-400 border border-slate-700 font-pixel text-[9px] sm:text-[10px] transition flex items-start gap-2 text-slate-200 hover:text-amber-200"
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
            <div className="flex justify-end">
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
                className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-pixel font-bold text-[9px] sm:text-[10px] flex items-center gap-1.5 shadow transition"
              >
                <span>{isTyping ? 'LEWATI EFEK' : 'LANJUT [SPASI]'}</span>
                <span className="text-xs">▶</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
