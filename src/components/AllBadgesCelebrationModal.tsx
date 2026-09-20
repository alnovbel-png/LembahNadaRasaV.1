import React, { useState, useEffect } from 'react';
import {
  Award,
  Sparkles,
  Heart,
  CheckCircle2,
  Download,
  Compass,
  X,
  Trophy,
  Star,
  MessageSquareQuote,
  ShieldCheck,
  ChevronRight,
  Volume2,
  BookOpen,
} from 'lucide-react';
import { PlayerStats } from '../types/game';
import { PSE_ACHIEVEMENTS } from '../game/constants';
import { sound } from '../utils/audio';

interface AllBadgesCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
  onOpenJournal?: () => void;
  onFreeRoam?: () => void;
}

export const AllBadgesCelebrationModal: React.FC<AllBadgesCelebrationModalProps> = ({
  isOpen,
  onClose,
  stats,
  onOpenJournal,
  onFreeRoam,
}) => {
  const [activeTab, setActiveTab] = useState<'dialogue' | 'gallery' | 'certificate'>('dialogue');
  const [studentName, setStudentName] = useState('Ezzel');

  // Trigger celebration audio and sound when opened
  useEffect(() => {
    if (isOpen) {
      sound.playAllBadgesFanfare();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalBadges = PSE_ACHIEVEMENTS.length;
  const unlockedBadges = stats.unlockedBadges ?? [];
  const unlockedCount = PSE_ACHIEVEMENTS.filter((b) => unlockedBadges.includes(b.id)).length;

  const mentorAppreciations = [
    {
      mentor: 'Kak Citra (Konselor Cilik)',
      role: 'Pakar 4 Zona Emosi',
      avatar: '🌸',
      quote:
        '“Ezzel telah memahami bahwa tidak ada emosi yang salah. Mengetahui kapan berada di Zona Kuning atau Merah dan tahu cara kembali ke Zona Hijau adalah lentera kehidupan yang sangat berharga!”',
    },
    {
      mentor: 'Kakek Damai (Praktisi Mindful)',
      role: 'Penjaga Lingkaran Kendali',
      avatar: '🧘🏻‍♂️',
      quote:
        '“Ketenangan batin bukan berarti ketiadaan badai, tetapi keteguhan membedakan mana yang bisa kita ubah dan mana yang harus kita ikhlaskan. Ezzel memegang kendali dirinya dengan sangat bijaksana.”',
    },
    {
      mentor: 'Moka si Kucing Pustakawan',
      role: 'Sahabat Pendengar Sejati',
      avatar: '🐱',
      quote:
        '“Miaww! Mendengarkan tanpa memotong dan memvalidasi perasaan teman adalah hadiah persahabatan terindah. Ezzel mendengarkan dengan telinga dan mata hatinya.”',
    },
    {
      mentor: 'Profesor Kotek (Ayam Cendekia)',
      role: 'Doktor Humor & Endorfin',
      avatar: '🐔',
      quote:
        '“Kuk-ku-ru-yuk! Tawa riang dan pikiran positif melepaskan hormon endorfin alami yang meredam stres. Terima kasih telah menyebarkan tawa ceria ke setiap sudut desa!”',
    },
    {
      mentor: 'Pak Joko & Pak Teguh',
      role: 'Petani Harapan & Penebang Sabar',
      avatar: '🌱',
      quote:
        '“Setiap usaha bertahap pasti membuahkan hasil, dan jeda hening mampu memadamkan api amarah sebelum membakar persahabatan. Ezzel adalah teladan bagi pemuda desa!”',
    },
    {
      mentor: 'Ibu Sari, Bung Jala, & Didi',
      role: 'Duta Syukur, Kesabaran, & Keramahan',
      avatar: '🍎',
      quote:
        '“Sebuah senyuman ramah meruntuhkan dinding kecanggungan, dan rasa syukur melipatgandakan sukacita. Lembah Nada Rasa sungguh beruntung memilikimu!”',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-backdrop-fade-in">
      <div className="bg-slate-900 border-2 border-amber-400/90 rounded-2xl max-w-2xl w-full p-4 sm:p-6 text-slate-100 shadow-[0_0_50px_rgba(245,158,11,0.25)] relative my-auto max-h-[92vh] flex flex-col modal-glow-frame animate-fade-in-slide-up">
        {/* Glow ambient background decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-amber-500/20 blur-3xl pointer-events-none" />

        {/* Top Dismiss Button */}
        <button
          id="close-all-badges-modal-btn"
          onClick={onClose}
          title="Tutup Apresiasi"
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800/90 hover:bg-rose-950/60 hover:border-rose-500/50 hover:scale-110 hover:shadow-[0_0_10px_rgba(244,63,94,0.4)] text-slate-400 hover:text-slate-100 border border-slate-700 transition-all duration-200 z-10 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header Badge */}
        <div className="text-center pt-1 pb-3 shrink-0">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/50 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-2 shadow-sm animate-pulse">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Pencapaian Agung: 10/10 Lencana Wawasan PSE Terkumpul!</span>
          </div>

          <h2
            style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
            className="text-xl sm:text-2xl md:text-3xl font-black text-amber-300 tracking-wide"
          >
            DUTA BESAR EMPATI PARIPURNA
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-lg mx-auto">
            Selamat! Kamu telah berhasil menuntaskan seluruh pembelajaran emosi dan interaksi sosial di Lembah Nada Rasa.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 gap-1.5 pb-2 shrink-0 overflow-x-auto text-xs font-bold">
          <button
            id="tab-all-badges-dialogue-btn"
            onClick={() => setActiveTab('dialogue')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-200 hover:scale-105 cursor-pointer ${
              activeTab === 'dialogue'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/20 ring-1 ring-amber-400/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 hover:shadow-[0_0_10px_rgba(245,158,11,0.15)]'
            }`}
          >
            <MessageSquareQuote className="w-4 h-4 text-amber-400" />
            <span>Dialog Apresiasi Para Tokoh</span>
          </button>

          <button
            id="tab-all-badges-gallery-btn"
            onClick={() => setActiveTab('gallery')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-200 hover:scale-105 cursor-pointer ${
              activeTab === 'gallery'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/20 ring-1 ring-amber-400/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 hover:shadow-[0_0_10px_rgba(245,158,11,0.15)]'
            }`}
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Koleksi 10 Lencana ({unlockedCount}/{totalBadges})</span>
          </button>

          <button
            id="tab-all-badges-certificate-btn"
            onClick={() => setActiveTab('certificate')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-200 hover:scale-105 cursor-pointer ${
              activeTab === 'certificate'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/20 ring-1 ring-amber-400/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 hover:shadow-[0_0_10px_rgba(245,158,11,0.15)]'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Piagam Apresiasi Emas</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 text-slate-200">
          {/* TAB 1: DIALOG APRESIASI RESMI */}
          {activeTab === 'dialogue' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Grand Appreciation Dialogue Card from Nenek Wilis */}
              <div className="bg-gradient-to-br from-amber-950/40 to-slate-950/80 border-2 border-amber-500/60 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-lg">
                <div className="flex items-start gap-3.5 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                    👵🏼
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm sm:text-base text-amber-300">
                        Nenek Wilis (Tetua Lembah Nada Rasa)
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-semibold border border-amber-500/40">
                        Pesan Kehormatan
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-200/80 italic mt-0.5">
                      “Kompas Nada Rasa berdenting dalam harmoni nada sempurna...”
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-3.5 text-xs sm:text-sm text-slate-100 leading-relaxed space-y-2">
                  <p>
                    <strong className="text-amber-300">“Wahai Ezzel yang berhati mulia...”</strong>
                  </p>
                  <p>
                    Hari ini, lonceng menara kuno berdenting dengan nada termerdu yang pernah terdengar sepanjang sejarah lembah ini! Seluruh kabut kelabu telah sirna, dan bunga persahabatan mekar di setiap pekarangan.
                  </p>
                  <p>
                    Namun pencapaian terbesarmu bukanlah sekadar mengembalikan warna desa—tetapi bagaimana kamu <strong>mengumpulkan seluruh 10 Lencana Kebijaksanaan Pembelajaran Sosial Emosional (PSE)</strong>.
                  </p>
                  <p className="text-amber-200 font-medium">
                    Kamu telah membuktikan bahwa keberanian untuk mengenali diri, mengelola amarah dengan tenang, mendengarkan cerita sesama tanpa menghakimi, menumbuhkan pola pikir berkembang, dan bersyukur adalah kunci utama harmoni sejati manusia.
                  </p>
                </div>
              </div>

              {/* Mentor Voices Showcase */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300 px-1">
                  <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
                  <span>Kutipan Apresiasi dari Para Mentor Lembah Nada Rasa:</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {mentorAppreciations.map((m, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs flex flex-col justify-between hover:border-amber-500/40 transition"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-lg">{m.avatar}</span>
                        <div>
                          <h4 className="font-bold text-slate-200 leading-tight text-[11px]">
                            {m.mentor}
                          </h4>
                          <span className="text-[10px] text-amber-400/90">{m.role}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-300/90 italic leading-relaxed">
                        {m.quote}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Action to Certificates or Gallery */}
              <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-200 text-center sm:text-left">
                  <div className="font-bold text-amber-300">Ingin melihat rincian 10 lencana atau mencetak piagam?</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Gelar dan piagam apresiasi resmi siap kamu simpan dan tunjukkan kepada guru atau orang tua.
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('gallery')}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/50 transition cursor-pointer flex items-center gap-1"
                  >
                    <span>Buka Galeri Lencana</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setActiveTab('certificate')}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition cursor-pointer flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Piagam Emas</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KOLEKSI 10 LENCANA (ACHIEVEMENT GALLERY) */}
          {activeTab === 'gallery' && (
            <div className="space-y-3.5 animate-fadeIn">
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Status Penguasaan Wawasan:</span>
                  <span className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    10 dari 10 Lencana Terbuka Sempurna (100%)
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block font-medium">Skor Empati:</span>
                  <span className="text-sm font-bold text-rose-400 flex items-center gap-1 justify-end">
                    <Heart className="w-4 h-4 fill-rose-400" />
                    {stats.empathyScore} Poin
                  </span>
                </div>
              </div>

              {/* Badges Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PSE_ACHIEVEMENTS.map((badge) => {
                  const isUnlocked = unlockedBadges.includes(badge.id);
                  return (
                    <div
                      key={badge.id}
                      className="p-3 rounded-xl border bg-amber-950/20 border-amber-500/50 shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl p-1.5 rounded-lg bg-amber-500/20 border border-amber-400/40">
                              {badge.icon}
                            </span>
                            <div>
                              <h4 className="text-xs font-bold text-amber-300 leading-tight">
                                {badge.title}
                              </h4>
                              <div className="text-[10px] text-slate-400">
                                Mentor: {badge.mentor}
                              </div>
                            </div>
                          </div>
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                            {isUnlocked ? 'Tercapai ✨' : 'Terbuka'}
                          </span>
                        </div>

                        <div className="text-[10px] font-semibold text-emerald-400 mb-1">
                          Konsep: {badge.concept}
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {badge.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: PIAGAM APRESIASI RESMI (PRINTABLE CERTIFICATE) */}
          {activeTab === 'certificate' && (
            <div className="space-y-4 animate-fadeIn">
              <div
                id="grandmaster-certificate"
                className="bg-amber-950/20 border-2 border-amber-400/90 rounded-2xl p-5 text-left relative overflow-hidden shadow-inner space-y-3"
              >
                {/* Official seal watermark */}
                <div className="absolute top-2 right-2 opacity-10 pointer-events-none text-8xl">
                  👑
                </div>

                <div className="text-center border-b border-amber-400/30 pb-3">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-amber-400 block mb-0.5">
                    Kementerian Kebijaksanaan Lembah Nada Rasa & Kurikulum Merdeka PSE
                  </span>
                  <h3
                    style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
                    className="text-lg sm:text-xl font-bold text-amber-300 tracking-wide"
                  >
                    PIAGAM KEHORMATAN DUTA BESAR EMPATI PARIPURNA
                  </h3>
                  <p className="text-[10px] text-slate-300 italic mt-0.5">
                    Nomor Piagam: PSE-10BADGES-HARMONI-2026
                  </p>
                </div>

                <div className="space-y-2 text-xs text-slate-200">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1 font-semibold">
                      Dianugerahkan dengan penuh rasa bangga dan terima kasih kepada:
                    </label>
                    <input
                      type="text"
                      id="grandmaster-name-input"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full bg-slate-900/90 border border-amber-400/60 rounded-lg px-3 py-1.5 text-sm font-bold text-amber-200 focus:outline-none focus:ring-1 focus:ring-amber-400"
                      placeholder="Ketik namamu..."
                    />
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
                    Telah menyelesaikan seluruh penjelajahan emosi dan menuntaskan <strong>10 Lencana Kebijaksanaan Pembelajaran Sosial Emosional (PSE)</strong> secara paripurna:
                  </p>

                  <div className="grid grid-cols-2 gap-1.5 text-[10px] font-semibold text-amber-200/90 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>4 Zona Regulasi Emosi</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>Lingkaran Kendali Diri</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>Mendengarkan Aktif & Validasi</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>Pelepasan Hormon Endorfin</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>Tiga Kata Ajaib Persahabatan</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>Pola Pikir Berkembang (Growth)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>Duta Sapaan Ramah Desa</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>Manajemen Amarah & Time-out</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>Rasa Syukur & Kedermawanan</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>Kesabaran & Ketenangan Batin</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-amber-400/30 text-[10px]">
                    <div>
                      <span className="text-slate-400 block">Total Poin Empati:</span>
                      <span className="font-bold text-amber-300 text-xs">{stats.empathyScore} Poin</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block">Tanda Tangan Tetua:</span>
                      <span className="font-bold text-emerald-400 text-xs font-serif">Nenek Wilis & Para Mentor</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Certificate Actions */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                <button
                  id="print-all-badges-certificate-btn"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Cetak / Simpan Piagam Apresiasi</span>
                </button>

                <button
                  id="replay-fanfare-btn"
                  onClick={() => sound.playAllBadgesFanfare()}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Putar Ulang Fanfare</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Harmoni Lembah Pulih 100% dengan Wawasan Lengkap</span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenJournal && (
              <button
                id="modal-open-journal-btn"
                onClick={() => {
                  onClose();
                  onOpenJournal();
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 hover:border-amber-400/50 hover:scale-105 hover:shadow-[0_0_12px_rgba(245,158,11,0.25)] text-slate-300 text-xs font-semibold border border-slate-700 transition-all duration-200 cursor-pointer flex items-center gap-1"
              >
                <BookOpen className="w-3 h-3 text-cyan-400" />
                <span>Lihat di Jurnal</span>
              </button>
            )}

            {onFreeRoam && (
              <button
                id="modal-free-roam-btn"
                onClick={() => {
                  onClose();
                  onFreeRoam();
                }}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 hover:scale-105 hover:shadow-[0_0_16px_rgba(16,185,129,0.5)] active:scale-95 text-white text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1 shadow-sm"
              >
                <Compass className="w-3 h-3 text-emerald-200" />
                <span>Jelajah Bebas</span>
              </button>
            )}

            <button
              id="modal-close-dismiss-btn"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 hover:scale-105 hover:shadow-[0_0_18px_rgba(245,158,11,0.65)] active:scale-95 text-slate-950 text-xs font-bold transition-all duration-200 cursor-pointer shadow"
            >
              Lanjutkan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
