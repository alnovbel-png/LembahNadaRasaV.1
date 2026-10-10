import React, { useEffect } from 'react';
import { X, Compass, Sparkles } from 'lucide-react';
import { PlayerStats } from '../types/game';
import { useLanguage } from '../game/localization';

export interface PSEScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats?: PlayerStats;
  playerName?: string;
}

export function getPSETierDetails(score: number, lang: 'id' | 'en') {
  if (score >= 250) {
    return {
      tier: lang === 'en' ? 'Master of Harmony' : 'Duta Harmoni',
      badge: '🌟',
      color: 'text-amber-300 border-amber-400 bg-amber-950/80',
      description:
        lang === 'en'
          ? 'Exceptional emotional maturity. Capable of deep active listening, self-regulation, and creating peaceful consensus in any conflict.'
          : 'Kematangan emosional luar biasa. Mampu mendengarkan aktif dengan tulus, menguasai regulasi diri yang tenang, serta membangun kesepakatan damai di tengah konflik warga.',
    };
  }
  if (score >= 150) {
    return {
      tier: lang === 'en' ? 'Empathetic Heart' : 'Empati Bijak',
      badge: '💖',
      color: 'text-pink-300 border-pink-400 bg-pink-950/80',
      description:
        lang === 'en'
          ? 'Deeply aware of feelings beneath the surface. Values independent understanding and offers soothing compassion.'
          : 'Peka terhadap emosi di balik kata-kata kasar warga. Menghargai pemahaman mandiri dan selalu mengedepankan kata-kata yang menyejukkan hati.',
    };
  }
  if (score >= 60) {
    return {
      tier: lang === 'en' ? 'Mindful Observer' : 'Peka Rasa',
      badge: '🌱',
      color: 'text-emerald-300 border-emerald-400 bg-emerald-950/80',
      description:
        lang === 'en'
          ? 'Growing in emotional literacy. Beginning to see beneath harsh outbursts and notice others’ unspoken vulnerabilities.'
          : 'Mulai memahami literasi emosi. Mampu melihat bahwa teriakan atau amarah warga seringkali berakar dari kelelahan, rasa takut, atau butuh didengarkan.',
    };
  }
  return {
    tier: lang === 'en' ? 'Young Explorer' : 'Penjelajah Belia',
    badge: '🧭',
    color: 'text-cyan-300 border-cyan-400 bg-cyan-950/80',
    description:
      lang === 'en'
        ? 'Embarking on the journey of social-emotional learning. Every dialogue and regulation exercise nurtures your inner heart strength.'
        : 'Langkah awal perjalanan sosial-emosional. Setiap dialog bijak dan latihan menenangkan diri akan mengasah kepekaan kalbumu.',
  };
}

export const PSEScoreModal: React.FC<PSEScoreModalProps> = ({
  isOpen,
  onClose,
  stats = {
    empathyScore: 20,
    resonanceUses: 0,
    calmTechniquesMastered: 0,
    secretsFound: 0,
    unlockedBadges: [],
  },
  playerName = 'Ezzel',
}) => {
  const { lang } = useLanguage();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const empathyScore = stats.empathyScore || 0;
  const tierInfo = getPSETierDetails(empathyScore, lang);

  return (
    <div
      id="pse-score-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150 select-none"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border-2 border-pink-500/80 rounded-2xl sm:rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.95),0_0_25px_rgba(236,72,153,0.35)] w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden text-slate-100 modal-glow-frame"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 bg-gradient-to-r from-pink-950/90 via-slate-950 to-slate-950 border-b border-pink-500/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-pink-500/20 border-2 border-pink-400/60 flex items-center justify-center text-xl sm:text-2xl shadow-inner">
              💖
            </div>
            <div>
              <h2 className="font-pixel text-xs sm:text-sm md:text-base font-bold text-pink-300 tracking-wide flex items-center gap-2">
                <span>{lang === 'en' ? 'SEL Score & Performance' : 'Rincian & Keterangan Skor PSE'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-200 border border-pink-400/40 font-normal">
                  {playerName}
                </span>
              </h2>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-sans">
                {lang === 'en'
                  ? 'Social-Emotional Learning Empathy Rating & Mechanics'
                  : 'Tingkat Kemampuan Empati Pembelajaran Sosial Emosional (PSE)'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Tutup"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-800 hover:bg-rose-950/80 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-400 flex items-center justify-center transition-all cursor-pointer active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 custom-scrollbar">
          {/* HERO SCORE CARD */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-pink-950/60 via-slate-900 to-purple-950/60 border-2 border-pink-500/50 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-pink-500/20 border-2 border-pink-400 flex items-center justify-center text-3xl sm:text-4xl shadow-[0_0_20px_rgba(236,72,153,0.4)] shrink-0">
                {tierInfo.badge}
              </div>
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="font-pixel text-[10px] text-pink-300 uppercase tracking-wider font-bold">
                    {lang === 'en' ? 'Current SEL Performance Tier' : 'Tingkat Kemampuan PSE Saat Ini'}
                  </span>
                </div>
                <h3 className="font-pixel text-lg sm:text-xl font-black text-amber-300">
                  {tierInfo.tier}
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-lg leading-relaxed">
                  {tierInfo.description}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-pink-500/40 text-center shrink-0 min-w-[140px]">
              <span className="text-[10px] text-pink-200 font-pixel block">
                {lang === 'en' ? 'Total SEL Score' : 'Total Skor PSE'}
              </span>
              <span className="font-pixel text-2xl sm:text-3xl font-extrabold text-amber-300 block">
                {empathyScore}
              </span>
              <span className="text-[9px] text-slate-400 font-pixel">
                {lang === 'en' ? 'Empathy Points' : 'Poin Empati'}
              </span>
            </div>
          </div>

          {/* RINCIAN MEKANIK PEROLEHAN SKOR & PENGURANGAN KOMPAS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Aturan Skor Respon Dialog Mandiri vs Kompas */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-amber-500/40 space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-pixel font-bold text-xs">
                <Compass className="w-4 h-4 text-amber-400" />
                <span>{lang === 'en' ? 'Dialogue Response Scoring Rules' : 'Aturan Skor Respon Dialog'}</span>
              </div>
              <ul className="text-slate-300 space-y-1.5 text-[11px] leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold shrink-0">✓</span>
                  <span>
                    <strong>{lang === 'en' ? 'Independent Response:' : 'Respon Mandiri:'}</strong>{' '}
                    {lang === 'en'
                      ? 'Choosing wisely without compass assistance awards the full dialogue score (+10 to +20 points).'
                      : 'Memilih respon tanpa kompas memberikan skor utuh dari dialog tersebut (+10 s/d +20 poin).'}
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-rose-400 font-bold shrink-0">🧭</span>
                  <span>
                    <strong>{lang === 'en' ? 'With Compass Active:' : 'Dengan Bantuan Kompas:'}</strong>{' '}
                    {lang === 'en'
                      ? 'Compass marks incorrect options only. Applying this assistance deducts -5 points from your response reward.'
                      : 'Kompas menandai opsi yang salah saja. Memilih respon saat kompas aktif dipotong -5 poin karena menggunakan bantuan.'}
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-cyan-400 font-bold shrink-0">🗺️</span>
                  <span>
                    <strong>{lang === 'en' ? 'World Exploration:' : 'Melihat Sekitar di Peta:'}</strong>{' '}
                    {lang === 'en'
                      ? 'Using the compass to explore the village and find directions is 100% free with no score deduction.'
                      : 'Menyalakan kompas untuk melihat arah dan menjelajah desa sepenuhnya gratis tanpa pengurangan skor.'}
                  </span>
                </li>
              </ul>
            </div>

            {/* Log Pemotongan & Penggunaan Kompas */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-pink-500/40 space-y-2">
              <div className="flex items-center gap-2 text-pink-300 font-pixel font-bold text-xs">
                <Sparkles className="w-4 h-4 text-pink-400" />
                <span>{lang === 'en' ? 'Compass Assistance History' : 'Riwayat Bantuan Kompas'}</span>
              </div>
              <div className="space-y-2 text-[11px] text-slate-300">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span>{lang === 'en' ? 'Assisted Responses Chosen:' : 'Respon Terbantu Kompas:'}</span>
                  <strong className="text-amber-400 font-pixel text-sm">{stats.resonanceUses}x</strong>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span>{lang === 'en' ? 'Total Assistance Deduction:' : 'Total Potongan Skor Kompas:'}</span>
                  <strong className="text-rose-400 font-pixel text-sm">-{stats.resonanceUses * 5} Poin</strong>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span>{lang === 'en' ? 'Calm Sessions Mastered:' : 'Sesi Relaksasi Mandiri:'}</span>
                  <strong className="text-cyan-300 font-pixel text-sm">+{stats.calmTechniquesMastered * 25} Poin</strong>
                </div>
              </div>
            </div>
          </div>

          {/* 5 PILAR KOMPETENSI SOSIAL EMOSIONAL (CASEL) */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <h4 className="font-pixel text-xs text-amber-300 font-bold flex items-center gap-1.5">
              <span>🏛️</span>
              <span>{lang === 'en' ? '5 Pillars of CASEL Competencies' : '5 Pilar Kompetensi Sosial-Emosional (CASEL)'}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-slate-300 text-[11px]">
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <strong className="text-amber-300 block mb-0.5">1. Kesadaran Diri</strong>
                <p className="text-slate-400 text-[10px] leading-relaxed">
                  Mengenali emosi sendiri (marah, sedih, cemas) dan memahami apa yang memicunya.
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <strong className="text-cyan-300 block mb-0.5">2. Manajemen Diri</strong>
                <p className="text-slate-400 text-[10px] leading-relaxed">
                  Mampu menenangkan diri melalui teknik relaksasi sebelum merespon atau bertindak gegabah.
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <strong className="text-emerald-300 block mb-0.5">3. Kesadaran Sosial</strong>
                <p className="text-slate-400 text-[10px] leading-relaxed">
                  Empati mendalam untuk memahami perspektif dan beban perasaan yang dialami orang lain.
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <strong className="text-pink-300 block mb-0.5">4. Keterampilan Relasi</strong>
                <p className="text-slate-400 text-[10px] leading-relaxed">
                  Mendengarkan aktif, berkomunikasi dengan penuh kelembutan, dan menyelesaikan konflik bersama.
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 sm:col-span-2 md:col-span-2">
                <strong className="text-purple-300 block mb-0.5">5. Pengambilan Keputusan Bertanggung Jawab</strong>
                <p className="text-slate-400 text-[10px] leading-relaxed">
                  Memilih solusi yang adil, tidak egois, dan menjaga keharmonisan bersama di masyarakat.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
