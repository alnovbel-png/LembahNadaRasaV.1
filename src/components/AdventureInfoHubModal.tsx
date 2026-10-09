import React, { useState, useEffect } from 'react';
import {
  X,
  Target,
  Award,
  BookOpen,
  Wind,
  CheckCircle2,
  Clock,
  Lock,
  Sparkles,
  Compass,
  Heart,
  Eye,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Play,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { GameQuest, ZoneColorStatus, NPC, PlayerStats, Item } from '../types/game';
import { PSE_ACHIEVEMENTS } from '../game/constants';
import { sound } from '../utils/audio';
import { useLanguage, getLocalizedAchievements } from '../game/localization';

export type InfoHubTab = 'pse' | 'quests' | 'regulation' | 'achievements' | 'journal';

export interface AdventureInfoHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: InfoHubTab;
  stats?: PlayerStats;
  quests?: GameQuest[];
  zoneStatus?: ZoneColorStatus;
  npcs?: NPC[];
  items?: Item[];
  playerName?: string;
  clockComponentsCount?: number;
  onStartRegulation?: (mode: 'breathing' | 'grounding' | 'stop' | 'shakeout') => void;
  onNavigateToTile?: (tileX: number, tileY: number) => void;
  onOpenAllBadgesCelebration?: () => void;
  onOpenEndingCertificate?: () => void;
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

export const AdventureInfoHubModal: React.FC<AdventureInfoHubModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'pse',
  stats = {
    empathyScore: 20,
    resonanceUses: 0,
    calmTechniquesMastered: 0,
    secretsFound: 0,
    unlockedBadges: [],
  },
  quests = [],
  zoneStatus = { plaza: false, bridge: false, forest: false, tower: false },
  npcs = [],
  items = [],
  playerName = 'Ezzel',
  clockComponentsCount = 0,
  onStartRegulation,
  onNavigateToTile,
  onOpenAllBadgesCelebration,
  onOpenEndingCertificate,
}) => {
  const { lang, ui } = useLanguage();
  const [activeTab, setActiveTab] = useState<InfoHubTab>(initialTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

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
  const unlockedBadges = stats.unlockedBadges || [];
  const localizedBadges = getLocalizedAchievements(PSE_ACHIEVEMENTS, lang);

  const handleTabClick = (tab: InfoHubTab) => {
    sound.playMenuSelect();
    setActiveTab(tab);
  };

  // Village checklist for clock tower gears
  const villagerChecklist = [
    { id: 'kiki', name: 'Kiki', part: 'Pegas Detak Jam & Surat Damai', icon: '⏱️', location: 'Alun-alun Desa', resolved: zoneStatus.plaza },
    { id: 'kakek_ranu', name: 'Kakek Ranu', part: 'Poros Pengunci Jam', icon: '🗝️', location: 'Jembatan Kayu', resolved: zoneStatus.bridge },
    { id: 'bimo', name: 'Bimo', part: 'Roda Gigi Emas Pusaka', icon: '⚙️', location: 'Hutan Sunyi', resolved: zoneStatus.forest },
    { id: 'kak_citra', name: 'Kak Citra', part: 'Lensa Kaca Prisma Jam', icon: '🔍', location: 'Taman Bunga', resolved: items.some((i) => i.id === 'item_clock_lens') },
    { id: 'kakek_damai', name: 'Kakek Damai', part: 'Bandul Pendulum Harmoni', icon: '🕰️', location: 'Tepi Sungai', resolved: items.some((i) => i.id === 'item_clock_pendulum') },
    { id: 'moka_cat', name: 'Moka', part: 'Lonceng Bel Jam Suci', icon: '🔔', location: 'Perpustakaan Desa', resolved: items.some((i) => i.id === 'item_clock_chime') },
    { id: 'prof_kotek', name: 'Prof. Kotek', part: 'Lencana Telur Emas', icon: '🥚', location: 'Kandang Ayam Plaza', resolved: items.some((i) => i.id === 'item_egg_badge') },
    { id: 'pak_joko', name: 'Pak Joko', part: 'Minyak Pelumas Mesin Jam', icon: '🛢️', location: 'Kebun Harapan', resolved: items.some((i) => i.id === 'item_clock_oil') },
    { id: 'didi_scout', name: 'Didi', part: 'Jarum Penunjuk Menit', icon: '📍', location: 'Jalan Setapak Plaza', resolved: items.some((i) => i.id === 'item_clock_pointer') },
    { id: 'teguh_woodcutter', name: 'Pak Teguh', part: 'Cangkang Kayu Jam Jati', icon: '🪵', location: 'Pondok Hutan', resolved: items.some((i) => i.id === 'item_clock_casing') },
    { id: 'sari_fruit', name: 'Ibu Sari', part: 'Baut Emas Penyeimbang', icon: '🔩', location: 'Kebun Buah Hutan', resolved: items.some((i) => i.id === 'item_clock_screws') },
    { id: 'jala_fisher', name: 'Bung Jala', part: 'Tali Baja Pemutar Jam', icon: '🪢', location: 'Dermaga Sungai', resolved: items.some((i) => i.id === 'item_clock_cord') },
  ];

  const completedQuestsCount = quests.filter((q) => q.isCompleted).length;
  const clockGearsResolvedCount = villagerChecklist.filter((v) => v.resolved).length;
  const overallProgressPercent = Math.min(
    100,
    Math.round(
      (completedQuestsCount / 4) * 40 +
      (clockGearsResolvedCount / 12) * 40 +
      (unlockedBadges.length / 10) * 20
    )
  );

  return (
    <div
      id="adventure-info-hub-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border-2 border-amber-500/80 rounded-2xl sm:rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.95),0_0_20px_rgba(245,158,11,0.3)] w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-100 modal-glow-frame"
        onClick={(e) => e.stopPropagation()}
      >
        {/* =========================================================================
            MODAL HEADER: PUSAT INFORMASI & PETUALANGAN
            ========================================================================= */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 bg-gradient-to-r from-amber-950/90 via-slate-950 to-slate-950 border-b border-amber-500/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-amber-500/20 border-2 border-amber-400/60 flex items-center justify-center text-xl sm:text-2xl shadow-inner">
              📜
            </div>
            <div>
              <h2 className="font-pixel text-xs sm:text-sm md:text-base font-bold text-amber-300 tracking-wide flex items-center gap-2">
                <span>{lang === 'en' ? 'Adventurer Information Center' : 'Pusat Informasi & Petualangan'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/40 font-normal">
                  {playerName}
                </span>
              </h2>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-sans">
                {lang === 'en'
                  ? 'SEL Empathy Performance • Quest Progress • Emotion Regulation • Badges • Journal'
                  : 'Skor Keterangan PSE • Progres Misi • Studio Regulasi • Lencana • Jurnal Hati'}
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

        {/* =========================================================================
            UNIFIED 5-TAB NAVIGATION (PENGGANTI TOMBOL STANDALONE)
            ========================================================================= */}
        <div className="grid grid-cols-5 p-1.5 sm:p-2 bg-slate-950/90 border-b border-slate-800 gap-1 sm:gap-1.5 shrink-0 text-center font-pixel text-[8px] sm:text-[9.5px] md:text-[10.5px]">
          {/* TAB 1: SKOR PSE */}
          <button
            onClick={() => handleTabClick('pse')}
            className={`px-2 py-2 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer font-bold ${
              activeTab === 'pse'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md ring-2 ring-pink-400/50'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-pink-300 border border-slate-800'
            }`}
          >
            <span className="text-sm">💖</span>
            <span className="truncate">{lang === 'en' ? 'SEL Score' : 'Skor PSE'}</span>
          </button>

          {/* TAB 2: PROGRES MISI */}
          <button
            onClick={() => handleTabClick('quests')}
            className={`px-2 py-2 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer font-bold ${
              activeTab === 'quests'
                ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-slate-950 shadow-md ring-2 ring-amber-400/50'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-800'
            }`}
          >
            <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="truncate">{lang === 'en' ? 'Missions' : 'Progres Misi'}</span>
          </button>

          {/* TAB 3: STUDIO REGULASI EMOSI (Pengganti tombol regulasi) */}
          <button
            onClick={() => handleTabClick('regulation')}
            className={`px-2 py-2 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer font-bold ${
              activeTab === 'regulation'
                ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md ring-2 ring-cyan-400/50'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800'
            }`}
          >
            <Wind className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="truncate">{lang === 'en' ? 'Regulation' : 'Regulasi Diri'}</span>
          </button>

          {/* TAB 4: LENCANA & PENCAPAIAN (Pengganti tombol pencapaian) */}
          <button
            onClick={() => handleTabClick('achievements')}
            className={`px-2 py-2 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer font-bold ${
              activeTab === 'achievements'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md ring-2 ring-purple-400/50'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-purple-300 border border-slate-800'
            }`}
          >
            <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="truncate">{lang === 'en' ? 'Badges' : 'Lencana'}</span>
          </button>

          {/* TAB 5: JURNAL HATI & WARGA (Pengganti tombol jurnal) */}
          <button
            onClick={() => handleTabClick('journal')}
            className={`px-2 py-2 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer font-bold ${
              activeTab === 'journal'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md ring-2 ring-emerald-400/50'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 border border-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="truncate">{lang === 'en' ? 'Journal' : 'Jurnal Hati'}</span>
          </button>
        </div>

        {/* =========================================================================
            TAB CONTENT CONTAINER
            ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* =====================================================================
              TAB 1: SKOR PSE & KETERANGAN LENGKAP SOSIAL EMOSIONAL
              ===================================================================== */}
          {activeTab === 'pse' && (
            <div className="space-y-5 animate-in fade-in duration-200">
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
          )}

          {/* =====================================================================
              TAB 2: PROGRES MISI & CERITA DESA
              ===================================================================== */}
          {activeTab === 'quests' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* RINGKASAN TOTAL PROGRES PETUALANGAN */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-emerald-950/70 border border-amber-500/50 space-y-2.5 shadow-lg">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">🏆</span>
                    <div>
                      <h4 className="font-pixel text-xs sm:text-sm font-bold text-amber-300">
                        {lang === 'en' ? 'Overall Adventure Completion' : 'Total Progres Petualangan Lembah'}
                      </h4>
                      <p className="text-[10.5px] text-slate-300">
                        {completedQuestsCount}/4 Misi Selesai • {clockGearsResolvedCount}/12 Komponen Jam • {unlockedBadges.length}/10 Lencana PSE
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-pixel text-lg sm:text-xl font-black text-emerald-400 block">
                      {overallProgressPercent}%
                    </span>
                    <span className="text-[9px] text-slate-400 font-pixel">
                      {overallProgressPercent >= 100 ? (lang === 'en' ? 'COMPLETED' : 'TAMAT 100%') : (lang === 'en' ? 'IN PROGRESS' : 'BERJALAN')}
                    </span>
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="w-full h-3 rounded-full bg-slate-950/90 border border-slate-700/80 overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 transition-all duration-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                    style={{ width: `${Math.max(5, overallProgressPercent)}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-pixel text-sm font-bold text-amber-300">
                    {lang === 'en' ? 'Main Quest Line (Steps 1 - 4)' : 'Alur Misi Utama (Langkah 1 s/d 4)'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {lang === 'en' ? 'Restore colors to the valley and light up the Clock Tower.' : 'Pulihkan warna lembah dan nyalakan kembali Menara Jam Harmoni.'}
                  </p>
                </div>
                <div className="font-pixel text-xs px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/50">
                  ⏱️ {clockComponentsCount}/12 Komponen Jam
                </div>
              </div>

              {/* LIST 4 MISI UTAMA */}
              <div className="space-y-2.5">
                {quests.map((q, idx) => {
                  const questCoords = [
                    { x: 8, y: 14 },
                    { x: 20, y: 15 },
                    { x: 7, y: 5 },
                    { x: 29, y: 8 },
                  ][idx] || { x: 8, y: 14 };

                  return (
                    <div
                      key={q.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        q.isCompleted
                          ? 'bg-slate-950/60 border-emerald-500/40 text-slate-300'
                          : 'bg-slate-900/90 border-amber-500/60 shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          {q.isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                          ) : (
                            <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                          )}
                          <div>
                            <h4 className={`text-sm font-bold ${q.isCompleted ? 'text-emerald-300 line-through' : 'text-amber-200'}`}>
                              {q.title}
                            </h4>
                            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                              {q.description}
                            </p>
                          </div>
                        </div>

                        {!q.isCompleted && onNavigateToTile && (
                          <button
                            onClick={() => {
                              onClose();
                              onNavigateToTile(questCoords.x, questCoords.y);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel text-[9px] font-bold shrink-0 cursor-pointer flex items-center gap-1 active:scale-95"
                          >
                            <span>{lang === 'en' ? 'Guide' : 'Tuntun'}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* CHECKLIST 12 WARGA & KOMPONEN JAM */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <h4 className="font-pixel text-xs text-amber-300 font-bold flex items-center justify-between">
                  <span>⏱️ 12 Komponen Menara Jam dari Warga Desa</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {villagerChecklist.filter((v) => v.resolved).length}/12 Terkumpul
                  </span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  {villagerChecklist.map((v) => (
                    <div
                      key={v.id}
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                        v.resolved
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400'
                      }`}
                    >
                      <span className="text-lg">{v.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <strong className="text-slate-200 text-xs truncate">{v.name}</strong>
                          {v.resolved ? (
                            <span className="text-[9px] text-emerald-400 font-bold">✓ Ada</span>
                          ) : (
                            <span className="text-[9px] text-slate-500">Belum</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">{v.part}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              TAB 3: STUDIO REGULASI EMOSI (Pengganti tombol regulasi)
              ===================================================================== */}
          {activeTab === 'regulation' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-pixel text-sm font-bold text-cyan-300">
                    {lang === 'en' ? 'Emotion Regulation Studio (4 Calming Modes)' : 'Studio Regulasi Emosi (4 Teknik Menenangkan Diri)'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {lang === 'en'
                      ? 'Practice emotional grounding whenever you feel stressed or overwhelmed. Awards +25 SEL Score!'
                      : 'Latih ketenangan batin kapan pun kamu merasa tegang atau emosi meluap. Dapatkan bonus +25 Skor PSE!'}
                  </p>
                </div>
                <div className="font-pixel text-xs px-3 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/50">
                  🌬️ {stats.calmTechniquesMastered}x Dikuasai
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 1. PERNAPASAN BINTANG */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/70 to-slate-900 border border-cyan-500/50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">⭐</span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-pixel">
                      Ritme 4-7-8
                    </span>
                  </div>
                  <h4 className="font-pixel text-sm text-cyan-200 font-bold">
                    {lang === 'en' ? 'Star Breathing Technique' : 'Pernapasan Bintang'}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Tarik napas dalam 4 detik, tahan 7 detik, dan hembuskan perlahan 8 detik untuk memperlambat detak jantung saat panik.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      onStartRegulation?.('breathing');
                    }}
                    className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-pixel text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-md"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{lang === 'en' ? 'Start Star Breathing' : 'Mulai Latihan Napas'}</span>
                  </button>
                </div>

                {/* 2. GROUNDING 5-4-3-2-1 */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-950/70 to-slate-900 border border-teal-500/50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">👁️</span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-500/40 font-pixel">
                      Panca Indra
                    </span>
                  </div>
                  <h4 className="font-pixel text-sm text-teal-200 font-bold">
                    {lang === 'en' ? '5-4-3-2-1 Sensory Grounding' : 'Grounding Panca Indra 5-4-3-2-1'}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Kembalikan kesadaran ke saat ini dengan mencari 5 benda terlihat, 4 sentuhan, 3 suara, 2 aroma, dan 1 rasa syukur.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      onStartRegulation?.('grounding');
                    }}
                    className="w-full py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-pixel text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-md"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{lang === 'en' ? 'Start Sensory Grounding' : 'Mulai Latihan Grounding'}</span>
                  </button>
                </div>

                {/* 3. METODE STOP */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/70 to-slate-900 border border-indigo-500/50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">🛑</span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-500/40 font-pixel">
                      Jeda Sejenak
                    </span>
                  </div>
                  <h4 className="font-pixel text-sm text-indigo-200 font-bold">
                    {lang === 'en' ? 'S.T.O.P. Mindful Pause' : 'Metode S.T.O.P. (Jeda Bijak)'}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>Stop:</strong> Berhenti sejenak. <strong>Take a breath:</strong> Tarik napas. <strong>Observe:</strong> Amati pikiran. <strong>Proceed:</strong> Lanjutkan dengan bijak.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      onStartRegulation?.('stop');
                    }}
                    className="w-full py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-pixel text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-md"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{lang === 'en' ? 'Start S.T.O.P. Method' : 'Mulai Metode S.T.O.P.'}</span>
                  </button>
                </div>

                {/* 4. GOYANG RILEKS SHAKE-OUT */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/70 to-slate-900 border border-amber-500/50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">💃</span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40 font-pixel">
                      Kinetik Tubuh
                    </span>
                  </div>
                  <h4 className="font-pixel text-sm text-amber-200 font-bold">
                    {lang === 'en' ? 'Somatic Shake-Out' : 'Goyang Rileks Shake-Out'}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Kibaskan tangan, bahu, dan kaki untuk melepaskan hormon stres dan ketegangan otot yang menumpuk di tubuh.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      onStartRegulation?.('shakeout');
                    }}
                    className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-md"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{lang === 'en' ? 'Start Shake-Out Exercise' : 'Mulai Goyang Rileks'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              TAB 4: LENCANA & PENCAPAIAN PSE (Pengganti tombol pencapaian)
              ===================================================================== */}
          {activeTab === 'achievements' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-pixel text-sm font-bold text-purple-300">
                    {lang === 'en' ? '10 SEL Competency Badges' : '10 Lencana Kompetensi Sosial-Emosional'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {lang === 'en' ? 'Collect badges by making wise empathetic choices.' : 'Raih lencana melalui pilihan respon berempati dan regulasi diri.'}
                  </p>
                </div>
                <div className="font-pixel text-xs px-3 py-1 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/50">
                  🏅 {unlockedBadges.length}/10 Lencana
                </div>
              </div>

              {/* CELEBRATION / CERTIFICATE BANNER IF COMPLETED */}
              {unlockedBadges.length >= 10 && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-amber-500/20 border-2 border-amber-400 flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl animate-bounce">🏆</span>
                    <div>
                      <h4 className="font-pixel text-xs sm:text-sm font-bold text-amber-300">
                        {lang === 'en' ? '100% Master of Harmony!' : 'Selamat! 10/10 Lencana Terkumpul!'}
                      </h4>
                      <p className="text-[11px] text-slate-300">
                        Kamu telah menguasai seluruh kompetensi sosial-emosional Lembah Nada Rasa!
                      </p>
                    </div>
                  </div>
                  {onOpenEndingCertificate && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenEndingCertificate();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-pixel text-xs font-bold shrink-0 cursor-pointer active:scale-95"
                    >
                      Buka Sertifikat 🎓
                    </button>
                  )}
                </div>
              )}

              {/* GRID 10 LENCANA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {localizedBadges.map((badge) => {
                  const isUnlocked = unlockedBadges.includes(badge.id);

                  return (
                    <div
                      key={badge.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isUnlocked
                          ? 'bg-gradient-to-r from-purple-950/70 via-slate-900 to-indigo-950/70 border-purple-400/80 shadow-md'
                          : 'bg-slate-950/60 border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 border ${
                            isUnlocked
                              ? 'bg-purple-500/20 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                              : 'bg-slate-900 border-slate-700 text-slate-600'
                          }`}
                        >
                          {isUnlocked ? badge.icon : '🔒'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className={`text-xs font-bold ${isUnlocked ? 'text-purple-200' : 'text-slate-500'}`}>
                              {badge.title}
                            </h4>
                            {isUnlocked && (
                              <span className="text-[9px] font-pixel text-amber-300 bg-amber-950/80 border border-amber-500/50 px-1.5 py-0.5 rounded">
                                +20 Poin
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                            {badge.description}
                          </p>
                          <div className="mt-1.5 text-[10px] text-slate-400 flex items-center gap-1">
                            <span className="text-amber-400">💡</span>
                            <span>{badge.concept}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* =====================================================================
              TAB 5: JURNAL HATI & CATATAN WARGA (Pengganti tombol jurnal)
              ===================================================================== */}
          {activeTab === 'journal' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-pixel text-sm font-bold text-emerald-300">
                    {lang === 'en' ? 'Heart Resonance Journal & Inventory' : 'Jurnal Resonansi Hati & Tas Inventaris'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {lang === 'en'
                      ? 'Empathy Iceberg notes of villagers and your collected clock components.'
                      : 'Konsep Gunung Es Emosi warga dan barang pusaka Menara Jam yang terkumpul.'}
                  </p>
                </div>
              </div>

              {/* KONSEP GUNUNG ES EMOSI */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/40 space-y-2.5">
                <h4 className="font-pixel text-xs text-emerald-300 font-bold flex items-center gap-1.5">
                  <span>🏔️</span>
                  <span>Konsep Gunung Es Emosi (Emotional Iceberg)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-rose-500/40 text-slate-300">
                    <strong className="text-rose-400 block mb-1">🌊 Emosi Permukaan (Tampak Luar)</strong>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Teriakan amarah, memalingkan muka, atau keras kepala. Ini hanyalah puncak gunung es yang terlihat di permukaan air laut.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/40 text-slate-300">
                    <strong className="text-emerald-300 block mb-1">🧭 Suara Hati Terdalam (Tersembunyi)</strong>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Rasa takut disalahkan, lelah berjuang sendirian, atau rindu teman. Responi suara hati terdalam ini dengan empati untuk meluluhkan hati warga.
                    </p>
                  </div>
                </div>
              </div>

              {/* TAS BARANG INVENTARIS */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <h4 className="font-pixel text-xs text-amber-300 font-bold flex items-center justify-between">
                  <span>🎒 Tas Inventaris Petualang</span>
                  <span className="text-[10px] text-slate-400 font-normal">{items.length} Barang</span>
                </h4>

                {items.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 font-pixel text-xs">
                    Tas masih kosong. Selesaikan interaksi dengan warga untuk mendapatkan komponen Menara Jam!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                    {items.map((item) => (
                      <div key={item.id} className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/40 flex items-start gap-2.5">
                        <span className="text-2xl shrink-0">{item.icon}</span>
                        <div className="min-w-0 flex-1">
                          <strong className="text-amber-200 text-xs block truncate">{item.name}</strong>
                          <p className="text-[10px] text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                          <span className="text-[9px] text-slate-400 block mt-1">
                            📍 {item.foundLocation}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            MODAL FOOTER
            ========================================================================= */}
        <div className="px-4 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="text-[11px]">
            {lang === 'en' ? 'Tip: Press [J] or [R] anytime to open this hub.' : 'Tips: Tekan tombol [J] atau [R] kapan saja untuk membuka pusat info ini.'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-pixel text-xs font-bold cursor-pointer active:scale-95"
          >
            {lang === 'en' ? 'Close [ESC]' : 'Tutup [ESC]'}
          </button>
        </div>
      </div>
    </div>
  );
};
