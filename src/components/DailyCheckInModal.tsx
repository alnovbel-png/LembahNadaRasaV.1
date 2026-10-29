import React, { useState } from 'react';
import { sound } from '../utils/audio';

interface DailyCheckInModalProps {
  isOpen: boolean;
  playerName: string;
  onSubmit: (feeling: string, note?: string) => void;
  onSkip?: () => void;
}

interface FeelingOption {
  id: string;
  labelId: string;
  labelEn: string;
  description: string;
  colorBorder: string;
  colorBg: string;
  colorText: string;
  colorAura: string;
  iconSvg: React.ReactNode;
}

export const DailyCheckInModal: React.FC<DailyCheckInModalProps> = ({
  isOpen,
  playerName,
  onSubmit,
  onSkip,
}) => {
  const [selectedFeeling, setSelectedFeeling] = useState<string>('gembira');
  const [note, setNote] = useState<string>('');

  if (!isOpen) return null;

  const feelings: FeelingOption[] = [
    {
      id: 'gembira',
      labelId: 'Gembira & Bersemangat',
      labelEn: 'Joyful & Energized',
      description: 'Hati terasa ceria, penuh energi positif untuk menyambut hari.',
      colorBorder: 'border-amber-400',
      colorBg: 'bg-amber-950/40 hover:bg-amber-900/50',
      colorText: 'text-amber-200',
      colorAura: 'shadow-[0_0_18px_rgba(245,158,11,0.35)]',
      iconSvg: (
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-amber-300 shrink-0" aria-hidden="true">
          <circle cx="12" cy="12" r="5" fill="#f59e0b" />
          <line x1="12" y1="2" x2="12" y2="4.5" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
          <line x1="12" y1="19.5" x2="12" y2="22" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
          <line x1="2" y1="12" x2="4.5" y2="12" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
          <line x1="19.5" y1="12" x2="22" y2="12" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
          <line x1="4.9" y1="4.9" x2="6.7" y2="6.7" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
          <line x1="17.3" y1="17.3" x2="19.1" y2="19.1" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
          <line x1="4.9" y1="19.1" x2="6.7" y2="17.3" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
          <line x1="17.3" y1="6.7" x2="19.1" y2="4.9" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: 'tenang',
      labelId: 'Tenang & Damai',
      labelEn: 'Calm & Peaceful',
      description: 'Pikiran jernih, bernapas lega, dan merasa rileks.',
      colorBorder: 'border-emerald-400',
      colorBg: 'bg-emerald-950/40 hover:bg-emerald-900/50',
      colorText: 'text-emerald-200',
      colorAura: 'shadow-[0_0_18px_rgba(16,185,129,0.35)]',
      iconSvg: (
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-emerald-300 shrink-0" aria-hidden="true">
          <path
            d="M12 2C6.5 2 3 7 3 12C3 17 6.5 22 12 22C17.5 22 21 17 21 12C21 7 17.5 2 12 2Z"
            fill="#065f46"
            stroke="#10b981"
            strokeWidth="1.5"
          />
          <path
            d="M12 5V19M12 12C14.5 9.5 17 9 17 9M12 15C14 13.5 16 13 16 13M12 9C9.5 7.5 7 7 7 7M12 14C10 12.5 8 12 8 12"
            stroke="#6ee7b7"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      id: 'cemas',
      labelId: 'Cemas atau Khawatir',
      labelEn: 'Anxious or Worried',
      description: 'Ada hal yang membuat deg-degan atau pikiran terasa penuh.',
      colorBorder: 'border-sky-400',
      colorBg: 'bg-sky-950/40 hover:bg-sky-900/50',
      colorText: 'text-sky-200',
      colorAura: 'shadow-[0_0_18px_rgba(56,189,248,0.35)]',
      iconSvg: (
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-sky-300 shrink-0" aria-hidden="true">
          <path
            d="M6 15C4.3 15 3 13.7 3 12C3 10.5 4.1 9.3 5.5 9.1C6 6.7 8.3 5 11 5C14 5 16.4 7.2 16.9 10C18.6 10.3 20 11.7 20 13.5C20 15.4 18.4 17 16.5 17H6"
            stroke="#38bdf8"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line x1="8" y1="19" x2="7" y2="21" stroke="#7dd3fc" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="12" y1="19" x2="11" y2="21" stroke="#7dd3fc" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="16" y1="19" x2="15" y2="21" stroke="#7dd3fc" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: 'sedih',
      labelId: 'Sedih atau Kecewa',
      labelEn: 'Sad or Down',
      description: 'Hati terasa berat atau merasa sedikit sepi hari ini.',
      colorBorder: 'border-indigo-400',
      colorBg: 'bg-indigo-950/40 hover:bg-indigo-900/50',
      colorText: 'text-indigo-200',
      colorAura: 'shadow-[0_0_18px_rgba(129,140,248,0.35)]',
      iconSvg: (
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-indigo-300 shrink-0" aria-hidden="true">
          <path
            d="M12 3C7 3 3 7 3 12C3 17 7 21 12 21C17 21 21 17 21 12C21 11.2 20.9 10.5 20.7 9.8C19.7 11.2 18 12 16.2 12C13 12 10.5 9.5 10.5 6.3C10.5 4.8 11.1 3.5 12 2.6C12 2.8 12 3 12 3Z"
            fill="#312e81"
            stroke="#818cf8"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle cx="15.5" cy="15.5" r="1.2" fill="#c7d2fe" />
          <circle cx="9.5" cy="15.5" r="1.2" fill="#c7d2fe" />
        </svg>
      ),
    },
    {
      id: 'lelah',
      labelId: 'Lelah & Butuh Jeda',
      labelEn: 'Tired & In Need of Rest',
      description: 'Energi sedang rendah dan membutuhkan ketenangan.',
      colorBorder: 'border-violet-400',
      colorBg: 'bg-violet-950/40 hover:bg-violet-900/50',
      colorText: 'text-violet-200',
      colorAura: 'shadow-[0_0_18px_rgba(167,139,250,0.35)]',
      iconSvg: (
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-violet-300 shrink-0" aria-hidden="true">
          <path
            d="M19 8H13L18 3H12"
            stroke="#a78bfa"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M11 15H7L10 11H6"
            stroke="#c4b5fd"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="8" cy="19" r="1.5" fill="#a78bfa" />
          <circle cx="16" cy="16" r="2" fill="#8b5cf6" />
        </svg>
      ),
    },
    {
      id: 'penasaran',
      labelId: 'Penasaran & Siap Belajar',
      labelEn: 'Curious & Inquisitive',
      description: 'Ingin menemukan hal-hal baru dan menjelajahi lembah.',
      colorBorder: 'border-teal-400',
      colorBg: 'bg-teal-950/40 hover:bg-teal-900/50',
      colorText: 'text-teal-200',
      colorAura: 'shadow-[0_0_18px_rgba(45,212,191,0.35)]',
      iconSvg: (
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-teal-300 shrink-0" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="#14b8a6" strokeWidth="1.6" />
          <polygon points="12,6 15,12 12,18 9,12" fill="#2dd4bf" />
          <circle cx="12" cy="12" r="1.8" fill="#042f2e" stroke="#5eead4" strokeWidth="1" />
        </svg>
      ),
    },
  ];

  const handleSelectFeeling = (id: string) => {
    sound.playMenuSelect();
    setSelectedFeeling(id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playCompassChime();
    const currentFeelingObj = feelings.find((f) => f.id === selectedFeeling);
    const feelingTitle = currentFeelingObj
      ? `${currentFeelingObj.labelId} (${currentFeelingObj.labelEn})`
      : selectedFeeling;
    onSubmit(feelingTitle, note.trim() || undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="bg-slate-900 border-2 border-amber-400/80 rounded-2xl w-full max-w-lg md:max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden modal-glow-frame text-slate-100 animate-in zoom-in-95 duration-150">
        {/* Header Bar */}
        <div className="px-5 py-4 bg-slate-950/95 border-b border-amber-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/30 to-amber-700/30 border border-amber-400/60 flex items-center justify-center shadow-md">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-amber-300" aria-hidden="true">
                <path
                  d="M4 19.5V5C4 3.9 4.9 3 6 3H20V19H6C4.9 19 4 19.9 4 21"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M4 19.5C4 20.3 4.7 21 5.5 21H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M8.5 7H16.5M8.5 11H13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M12 3V8.5L13.8 7.2L15.5 8.5V3" fill="#f59e0b" />
              </svg>
            </div>
            <div>
              <h2
                className="text-amber-300 font-bold text-sm sm:text-base leading-tight tracking-tight"
                style={{ fontFamily: 'Galindo, cursive, sans-serif' }}
              >
                Pemeriksaan Rasa Hati
              </h2>
              <p className="text-[11px] text-amber-200/70 font-sans">
                Langkah Awal Petualangan • Lembah Nada Rasa
              </p>
            </div>
          </div>

          {onSkip && (
            <button
              onClick={onSkip}
              className="text-slate-400 hover:text-slate-200 text-xs px-2.5 py-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              title="Lewati untuk sekarang"
            >
              Lewati
            </button>
          )}
        </div>

        {/* Scrollable Content Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto custom-scrollbar flex-1 space-y-4">
          {/* Main Question Banner */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border border-amber-500/40 text-center space-y-1 shadow-sm">
            <span className="text-[10px] font-pixel text-amber-400 uppercase tracking-widest block">
              Refleksi Emosi Diri
            </span>
            <h3
              className="text-base sm:text-lg font-bold text-amber-100"
              style={{ fontFamily: 'Galindo, cursive, sans-serif' }}
            >
              How are you feeling today, {playerName}?
            </h3>
            <p className="text-xs text-amber-200/80 italic font-sans">
              Bagaimana perasaan hatimu hari ini sebelum melangkah ke lembah?
            </p>
          </div>

          {/* Emotion Cards Selection Grid */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <span>Pilih emosi yang paling menggambarkan kondisimu:</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {feelings.map((f) => {
                const isSelected = selectedFeeling === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleSelectFeeling(f.id)}
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer relative ${
                      isSelected
                        ? `${f.colorBg} ${f.colorBorder} border-2 ${f.colorAura} ring-1 ring-amber-300/40`
                        : 'bg-slate-950/60 border-slate-800/90 hover:border-slate-700 opacity-80 hover:opacity-100'
                    }`}
                  >
                    {f.iconSvg}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <strong className={`text-xs block font-bold ${isSelected ? f.colorText : 'text-slate-200'}`}>
                          {f.labelId}
                        </strong>
                        {isSelected && (
                          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-amber-400 shrink-0 ml-1">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5 leading-snug">
                        {f.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Reflection Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Catatan Hati (Opsional):</span>
              <span className="text-[10px] text-slate-400 font-normal">Akan disimpan di Jurnal Pribadimu</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ceritakan sedikit apa yang sedang kamu rasakan atau harapkan hari ini..."
              rows={2}
              maxLength={240}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 focus:outline-none text-xs text-slate-200 placeholder-slate-500 transition resize-none"
            />
          </div>

          {/* Information Notice */}
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/20 flex items-center gap-2 text-[11px] text-amber-300/80">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
              <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="12" cy="16" r="1.2" fill="currentColor" />
            </svg>
            <span>
              Jawabanmu tersimpan di dalam buku jurnal player stats untuk mencatat pertumbuhan emosionalmu.
            </span>
          </div>

          {/* Submit Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            {onSkip && (
              <button
                type="button"
                onClick={onSkip}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-pixel text-xs font-semibold transition cursor-pointer active:scale-95"
              >
                Lewati
              </button>
            )}
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 active:scale-95 text-slate-950 font-pixel text-xs font-black shadow-lg shadow-amber-500/25 transition cursor-pointer flex items-center gap-2"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-slate-950 stroke-current stroke-[2.5]" aria-hidden="true">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Simpan & Masuk ke Permainan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
