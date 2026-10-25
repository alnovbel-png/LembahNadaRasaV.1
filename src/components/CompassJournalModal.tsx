import React, { useState } from 'react';
import { PSE_ACHIEVEMENTS } from '../game/constants';
import { Item, ZoneColorStatus, PlayerStats } from '../types/game';
import { BookOpen, Compass, Sparkles, X, CheckCircle2, Lock, Award, Trophy, ScrollText } from 'lucide-react';
import { useLanguage, getLocalizedAchievements, getLocalizedItems } from '../game/localization';

interface CompassJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: Item[];
  zoneStatus: ZoneColorStatus;
  stats: PlayerStats;
  onOpenAllBadgesCelebration?: () => void;
}

export const CompassJournalModal: React.FC<CompassJournalModalProps> = ({
  isOpen,
  onClose,
  items,
  zoneStatus,
  stats,
  onOpenAllBadgesCelebration,
}) => {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<'lore' | 'lencana' | 'tas' | 'harmoni'>('lore');

  if (!isOpen) return null;

  // Calculate percentage of village harmony
  const totalZones = 4;
  const coloredZonesCount =
    (zoneStatus.plaza ? 1 : 0) +
    (zoneStatus.bridge ? 1 : 0) +
    (zoneStatus.forest ? 1 : 0) +
    (zoneStatus.tower ? 1 : 0);
  const harmonyPercent = Math.round((coloredZonesCount / totalZones) * 100);

  const unlockedBadges = stats.unlockedBadges ?? [];
  const localizedBadges = getLocalizedAchievements(PSE_ACHIEVEMENTS, lang);
  const localizedItems = getLocalizedItems(items, lang);
  const unlockedBadgesCount = localizedBadges.filter((b) =>
    unlockedBadges.includes(b.id)
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 animate-backdrop-fade-in">
      <div className="bg-slate-900 border-2 border-amber-400/80 hover:border-amber-300 rounded-2xl max-w-2xl sm:max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden modal-glow-frame animate-fade-in-slide-up transition-all duration-300">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-400/40 hover:scale-110 transition-transform">
              <Compass className="w-5 h-5 text-amber-400 animate-spin-slow" />
            </div>
            <div>
              <h2 className="font-bold text-base text-amber-300">
                Jurnal Petualangan & Kisah Lembah
              </h2>
              <p className="text-[11px] text-slate-400">
                Kisah lengkap lembah harmoni, pencapaian lencana PSE, tas petualangan, & harmoni desa
              </p>
            </div>
          </div>
          <button
            id="close-journal-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-rose-950/40 hover:border hover:border-rose-500/50 active:scale-95 transition-transform duration-75 cursor-pointer touch-manipulation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Grid (4 columns) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-950/90 border-b border-slate-800 shrink-0">
          <button
            id="tab-lore"
            onClick={() => setActiveTab('lore')}
            className={`px-3 py-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-transform duration-75 active:scale-95 cursor-pointer touch-manipulation ${
              activeTab === 'lore'
                ? 'border-amber-400/80 text-amber-300 bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:border-amber-400/60 hover:shadow-[0_0_12px_rgba(245,158,11,0.25)]'
            }`}
          >
            <ScrollText className="w-4 h-4 shrink-0 text-amber-400" />
            <span className="truncate">Lore Cerita</span>
          </button>

          <button
            id="tab-lencana"
            onClick={() => setActiveTab('lencana')}
            className={`px-3 py-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-transform duration-75 active:scale-95 cursor-pointer touch-manipulation ${
              activeTab === 'lencana'
                ? 'border-amber-400/80 text-amber-300 bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:border-amber-400/60 hover:shadow-[0_0_12px_rgba(245,158,11,0.25)]'
            }`}
          >
            <Award className="w-4 h-4 shrink-0 text-amber-400" />
            <span className="truncate">{`Lencana (${unlockedBadgesCount}/${PSE_ACHIEVEMENTS.length})`}</span>
          </button>

          <button
            id="tab-tas"
            onClick={() => setActiveTab('tas')}
            className={`px-3 py-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-transform duration-75 active:scale-95 cursor-pointer touch-manipulation ${
              activeTab === 'tas'
                ? 'border-amber-400/80 text-amber-300 bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:border-amber-400/60 hover:shadow-[0_0_12px_rgba(245,158,11,0.25)]'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0 text-amber-400" />
            <span className="truncate">{`Tas (${items.length})`}</span>
          </button>

          <button
            id="tab-harmoni"
            onClick={() => setActiveTab('harmoni')}
            className={`px-3 py-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-transform duration-75 active:scale-95 cursor-pointer touch-manipulation ${
              activeTab === 'harmoni'
                ? 'border-amber-400/80 text-amber-300 bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:border-amber-400/60 hover:shadow-[0_0_12px_rgba(245,158,11,0.25)]'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
            <span className="truncate">{`Harmoni (${harmonyPercent}%)`}</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3 custom-scrollbar pr-3 sm:pr-4">
          {activeTab === 'lore' && (
            <div className="space-y-4 text-slate-200">
              {/* Story Intro Banner */}
              <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border border-amber-500/40 hover:border-amber-400/80 rounded-2xl p-4 shadow-lg hover:shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:scale-[1.01] transition-all duration-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300">
                    <ScrollText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                      Kisah Lengkap Lembah
                    </span>
                    <h3 className="font-bold text-base sm:text-lg text-amber-200">
                      Petualangan Lembah Harmoni Nada Rasa
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Selamat datang di <strong>Lembah Nada Rasa</strong>. Ini adalah kisah tentang sebuah desa yang sempat kehilangan warna-warninya karena warga lupa cara saling mendengarkan, dan bagaimana seorang anak bernama <strong>Ezzel</strong> memulihkannya dengan kekuatan empati dan kasih sayang.
                </p>
              </div>

              {/* Bab 1: Asal Usul */}
              <div className="bg-slate-800/70 border border-slate-700/80 hover:border-amber-400/60 hover:scale-[1.015] hover:shadow-[0_0_15px_rgba(245,158,11,0.25)] rounded-xl p-3.5 space-y-2 transition-all duration-200">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <span>🏛️</span>
                  <h4>Bab 1: Asal Usul Lembah & Menara Jam Harmoni</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Dahulu kala, Lembah Nada Rasa adalah desa yang sangat asri, damai, dan penuh warna. Sungai mengalir jernih, pepohonan hutan pinus berbisik sejuk, dan warga hidup saling tolong-menolong.
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Di puncak bukit timur, berdiri <strong>Menara Jam Harmoni</strong> yang dibangun oleh para sesepuh perintis desa (Ki Waskita). Menara jam ini bukanlah jam biasa: jarum jam dan lonceng perunggunya berdetak selaras dengan kehangatan hati warganya. Selama warga saling peduli dan hidup rukun, warna-warni di seluruh lembah akan terus mekar bersinar.
                </p>
              </div>

              {/* Bab 2: Akar Masalah & Munculnya Kabut Kelabu */}
              <div className="bg-slate-800/70 border border-slate-700/80 hover:border-amber-400/60 hover:scale-[1.015] hover:shadow-[0_0_15px_rgba(245,158,11,0.25)] rounded-xl p-3.5 space-y-2 transition-all duration-200">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <span>🌫️</span>
                  <h4>Bab 2: Akar Masalah Lunturnya Empati & Kabut Kelabu</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Menara Jam Harmoni berdetak menggunakan energi kerukunan dan rasa saling mendengarkan dari warganya. Namun belakangan ini, warga mulai sibuk sendiri hingga empati perlahan memudar. Puncak dari lunturnya empati terjadi saat Kakek Ranu yang sedang kelelahan membentak Bimo. Kejadian tersebut membuat Bimo ketakutan dan merasa sangat bersalah lalu lari bersembunyi ke Hutan Sunyi.
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Melihat kejadian itu, <strong>Nenek Wilis</strong>—sang penjaga Menara Jam—merasa sangat kecewa dengan pudarnya rasa kasih sayang, sehingga kabut kelabu turun menutupi lembah. Akibat terputusnya energi harmoni, Menara Jam kehilangan keseimbangan dan berhenti mendadak hingga tiga komponen intinya terlempar keluar: Kiki panik memungut Pegas Detak Jam, Bimo tanpa sadar membawa Roda Gigi Emas ke hutan, dan Kakek Ranu yang marah menutup jembatan sambil menahan Poros Pengunci Jam.
                </p>
              </div>

              {/* Bab 3: Pusaka Kompas Penunjuk Arah & Panduan Langkah Lembah */}
              <div className="bg-slate-800/70 border border-slate-700/80 hover:border-amber-400/60 hover:scale-[1.015] hover:shadow-[0_0_15px_rgba(245,158,11,0.25)] rounded-xl p-3.5 space-y-2 transition-all duration-200">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <span>🧭</span>
                  <h4>Bab 3: Pusaka Kompas Penunjuk Arah & Panduan Langkah Lembah</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Untuk melindungi sisa mesin waktu, <strong>Nenek Wilis</strong> sengaja melepas dan menitipkan sembilan komponen jam lainnya kepada para sesepuh dan warga desa yang bijak (seperti Kak Citra, Kakek Damai, Pak Joko, dan Didi) sebagai ujian kebijaksanaan. Menara hanya bisa dipulihkan oleh seorang anak yang mampu meredakan krisis utama sekaligus mau belajar mengelola emosi dari warga lainnya.
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Saat <strong>Ezzel</strong> memegang Pusaka <strong>Kompas Penunjuk Arah</strong>, perjalanannya menembus kabut lembah menjadi terpandu dengan pasti. Kompas emas menuntun langkahnya menuju sahabat dan warga desa yang membutuhkan bantuan, sementara Ezzel sendiri menggunakan kepekaan nuraninya untuk mendengarkan dua lapisan emosi manusia:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2 text-[11px]">
                  <div className="bg-slate-900/80 border border-red-500/30 hover:border-red-400 hover:scale-[1.02] hover:shadow-[0_0_12px_rgba(239,68,68,0.3)] transition-all rounded-lg p-2.5">
                    <span className="font-bold text-red-300 block mb-1">
                      🔴 Emosi Luar (Permukaan):
                    </span>
                    Reaksi yang tampak di luar, seperti marah, membentak, atau dingin menutup diri.
                  </div>
                  <div className="bg-slate-900/80 border border-cyan-500/30 hover:border-cyan-400 hover:scale-[1.02] hover:shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all rounded-lg p-2.5">
                    <span className="font-bold text-cyan-300 block mb-1">
                      💙 Emosi Dalam (Lubuk Hati):
                    </span>
                    Perasaan rapuh terdalam, seperti rasa lelah mendalam, takut gagal, atau rindu dipahami.
                  </div>
                </div>
              </div>

              {/* Bab 4: Penyatuan Misi Ezzel & Pemulihan 12 Komponen Jam */}
              <div className="bg-slate-800/70 border border-slate-700/80 hover:border-amber-400/60 hover:scale-[1.015] hover:shadow-[0_0_15px_rgba(245,158,11,0.25)] rounded-xl p-3.5 space-y-2 transition-all duration-200">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <span>⚙️</span>
                  <h4>Bab 4: Penyatuan Misi Ezzel & Pemulihan 12 Komponen Jam</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Kompas Penunjuk Arah membimbing langkah Ezzel untuk menyelesaikan krisis utama terlebih dahulu, membuka jembatan, lalu leluasa berkeliling desa memanen kecakapan sosial emosional dari sembilan warga lainnya:
                </p>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-start gap-2 bg-slate-900/50 hover:bg-slate-900/80 hover:border-amber-400/50 hover:scale-[1.01] hover:shadow-[0_0_10px_rgba(245,158,11,0.2)] p-2.5 rounded-lg border border-slate-700/60 transition-all">
                    <span className="text-base shrink-0">⏱️</span>
                    <div>
                      <strong className="text-amber-200">
                        1. Alun-Alun Desa — Kiki (Pegas Detak Jam):
                      </strong>
                      <p className="text-[11px] mt-0.5 text-slate-300">
                        Kiki panik menjatuhkan surat pos saat menara jam berhenti mendadak. Ezzel mempraktikkan teknik napas bersamanya, menenangkan rasa paniknya dan menerima Pegas Detak Jam.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-slate-900/50 hover:bg-slate-900/80 hover:border-amber-400/50 hover:scale-[1.01] hover:shadow-[0_0_10px_rgba(245,158,11,0.2)] p-2.5 rounded-lg border border-slate-700/60 transition-all">
                    <span className="text-base shrink-0">🗝️</span>
                    <div>
                      <strong className="text-amber-200">
                        2. Jembatan Kayu — Kakek Ranu (Poros Pengunci Jam):
                      </strong>
                      <p className="text-[11px] mt-0.5 text-slate-300">
                        Kakek Ranu menutup jembatan karena kelelahan dan rasa bersalah setelah membentak Bimo. Ezzel memvalidasi rasa lelahnya dengan kelembutan, membuka jembatan dan menerima Poros Pengunci Jam.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-slate-900/50 hover:bg-slate-900/80 hover:border-amber-400/50 hover:scale-[1.01] hover:shadow-[0_0_10px_rgba(245,158,11,0.2)] p-2.5 rounded-lg border border-slate-700/60 transition-all">
                    <span className="text-base shrink-0">⚙️</span>
                    <div>
                      <strong className="text-amber-200">
                        3. Hutan Sunyi — Bimo (Roda Gigi Emas Pusaka Jam):
                      </strong>
                      <p className="text-[11px] mt-0.5 text-slate-300">
                        Bimo bersembunyi di hutan karena ketakutan dan merasa bersalah. Ezzel menyampaikan permohonan maaf Kakek Ranu dan menumbuhkan Growth Mindset. Bimo kembali percaya diri dan menyerahkan Roda Gigi Emas.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-slate-900/50 hover:bg-slate-900/80 hover:border-amber-400/50 hover:scale-[1.01] hover:shadow-[0_0_10px_rgba(245,158,11,0.2)] p-2.5 rounded-lg border border-slate-700/60 transition-all">
                    <span className="text-base shrink-0">💎</span>
                    <div>
                      <strong className="text-amber-200">
                        4. Warga Bijak Desa & Puncak Menara Jam — Nenek Wilis (12/12 Komponen):
                      </strong>
                      <p className="text-[11px] mt-0.5 text-slate-300">
                        Dengan krisis inti selesai dan jembatan terbuka, Ezzel berkeliling desa menemui sembilan warga bijak lainnya untuk memanen kecakapan sosial emosional dan mengumpulkan seluruh 12 komponen jam. Di puncak menara, Nenek Wilis merakit kembali jam harmoni, membunyikan dentang lonceng merdu, dan melenyapkan kabut kelabu selamanya!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bab 5: Tokoh & Mentor Harmoni */}
              <div className="bg-slate-800/70 border border-slate-700/80 hover:border-amber-400/60 hover:scale-[1.015] hover:shadow-[0_0_15px_rgba(245,158,11,0.25)] rounded-xl p-3.5 space-y-2 transition-all duration-200">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <span>🤝</span>
                  <h4>Bab 5: Sahabat & Pembelajaran di Desa</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Selain misi utama, setiap warga di desa menyimpan pelajaran hidup yang berharga:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-slate-900/60 hover:bg-slate-900/90 hover:border-amber-400/50 hover:scale-[1.02] transition-all p-2.5 rounded-lg border border-slate-700/60">
                    <span className="font-bold text-amber-300 block">
                      📚 Kak Citra & Moka si Kucing
                    </span>
                    <span className="text-slate-300">
                      Konselor desa dan kucing ramah yang mengajarkan cara mengenali 4 zona emosi serta mendengarkan dengan telinga dan hati.
                    </span>
                  </div>
                  <div className="bg-slate-900/60 hover:bg-slate-900/90 hover:border-amber-400/50 hover:scale-[1.02] transition-all p-2.5 rounded-lg border border-slate-700/60">
                    <span className="font-bold text-amber-300 block">
                      🪓 Pak Teguh & Ibu Sari
                    </span>
                    <span className="text-slate-300">
                      Penebang kayu yang belajar jeda meredakan amarah dan pedagang buah yang gemar melipatgandakan sukacita dengan bersyukur.
                    </span>
                  </div>
                  <div className="bg-slate-900/60 hover:bg-slate-900/90 hover:border-amber-400/50 hover:scale-[1.02] transition-all p-2.5 rounded-lg border border-slate-700/60">
                    <span className="font-bold text-amber-300 block">
                      🎣 Kakek Damai & Bung Jala
                    </span>
                    <span className="text-slate-300">
                      Mengajarkan lingkaran kendali—membedakan hal yang bisa kita kendalikan sendiri dengan hal yang harus kita ikhlaskan.
                    </span>
                  </div>
                  <div className="bg-slate-900/60 hover:bg-slate-900/90 hover:border-amber-400/50 hover:scale-[1.02] transition-all p-2.5 rounded-lg border border-slate-700/60">
                    <span className="font-bold text-amber-300 block">
                      🌱 Pak Joko, Didi, & Prof. Kotek
                    </span>
                    <span className="text-slate-300">
                      Mengajarkan pola pikir berkembang, senyuman ramah pengelana, dan tawa ceria sebagai penawar lelah jiwa.
                    </span>
                  </div>
                </div>
              </div>

              {/* Bab 6: Pesan Moral Emas */}
              <div className="bg-gradient-to-r from-emerald-950/50 via-slate-900 to-amber-950/50 border border-emerald-500/40 hover:border-emerald-400 hover:scale-[1.015] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] rounded-xl p-4 text-center space-y-1.5 transition-all duration-200">
                <div className="text-xl">✨🕊️✨</div>
                <h4 className="font-bold text-sm text-emerald-300">
                  Pesan Inti: Rahasia Harmoni Sejati
                </h4>
                <blockquote className="text-xs italic text-slate-200 leading-relaxed font-serif max-w-lg mx-auto">
                  “Harmoni bukanlah ketiadaan perbedaan, melainkan kerelaan untuk saling mendengarkan dan memahami perasaan sesama dalam simfoni kasih sayang.”
                </blockquote>
                <p className="text-[10.5px] text-amber-300/80 pt-1">
                  — Nenek Wilis, Penjaga Menara Jam Harmoni
                </p>
              </div>
            </div>
          )}

          {activeTab === 'lencana' && (
            <div className="space-y-3">
              {/* All 10 Badges Celebration Banner */}
              {unlockedBadgesCount === localizedBadges.length ? (
                <div className="bg-gradient-to-r from-amber-950/60 via-amber-900/40 to-slate-900 border-2 border-amber-400 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-2.5">
                    <div className="text-2xl p-1 bg-amber-500/20 rounded-lg border border-amber-400/40">👑</div>
                    <div>
                      <h4 className="font-bold text-amber-300 text-xs sm:text-sm">
                        Seluruh 10 Lencana Terkumpul! (Duta Besar Empati)
                      </h4>
                      <p className="text-[11px] text-amber-200/80">
                        Kamu telah menguasai seluruh dimensi Pembelajaran Sosial Emosional di lembah ini.
                      </p>
                    </div>
                  </div>
                  {onOpenAllBadgesCelebration && (
                    <button
                      id="journal-open-appreciation-btn"
                      onClick={() => {
                        onClose();
                        onOpenAllBadgesCelebration();
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 shadow hover:shadow-[0_0_18px_rgba(245,158,11,0.65)] hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Trophy className="w-3.5 h-3.5" />
                      <span>Buka Dialog Apresiasi</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-amber-950/40 border border-amber-500/40 hover:border-amber-400/70 hover:shadow-[0_0_12px_rgba(245,158,11,0.25)] hover:scale-[1.01] transition-all rounded-xl p-3 text-xs text-amber-200">
                  ⭐ <strong>Lencana Wawasan PSE</strong>: Bicaralah dengan mentor opsional di desa (Kak Citra di Alun-alun, Kakek Damai di tepi sungai, dan Moka si Kucing di Hutan) untuk mengumpulkan pengetahuan dan membuka semua pencapaian!
                </div>
              )}

              <div className="grid grid-cols-1 gap-2.5">
                {localizedBadges.map((badge) => {
                  const isUnlocked = unlockedBadges.includes(badge.id);
                  return (
                    <div
                      key={badge.id}
                      className={`p-3.5 rounded-xl border transition-all duration-200 hover:scale-[1.02] flex items-start gap-3.5 cursor-default ${
                        isUnlocked
                          ? 'bg-amber-950/20 border-amber-500/60 hover:border-amber-400 hover:shadow-[0_0_18px_rgba(245,158,11,0.35)]'
                          : 'bg-slate-800/30 border-slate-700/60 hover:border-slate-500 hover:shadow-[0_0_12px_rgba(100,116,139,0.2)] opacity-75'
                      }`}
                    >
                      <div
                        className={`text-2xl sm:text-3xl p-2 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                          isUnlocked
                            ? 'bg-amber-500/20 border border-amber-400/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                            : 'bg-slate-800 border border-slate-700 grayscale'
                        }`}
                      >
                        {badge.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4
                            className={`font-bold text-sm truncate ${
                              isUnlocked ? 'text-amber-300' : 'text-slate-300'
                            }`}
                          >
                            {badge.title}
                          </h4>
                          {isUnlocked ? (
                            <span className="font-pixel text-[8px] px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 shrink-0 flex items-center gap-1 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                              <CheckCircle2 className="w-3 h-3" /> TERBUKA
                            </span>
                          ) : (
                            <span className="font-pixel text-[8px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0 flex items-center gap-1">
                              <Lock className="w-3 h-3" /> TERKUNCI
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed mb-1">
                          {badge.description}
                        </p>

                        <div className="flex items-center gap-2 text-[10px] text-amber-400/80">
                          <span>Mentor: {badge.mentor}</span>
                          <span>•</span>
                          <span className="italic">{badge.concept}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'tas' && (
            <div className="space-y-3">
              {/* Clock Tower Components Restoration Header */}
              {(() => {
                const clockItems = localizedItems.filter(
                  (it) =>
                    it.id.startsWith('item_clock_') ||
                    it.id === 'item_letter' ||
                    it.id === 'item_secret_key' ||
                    it.id === 'item_bridge_pass' ||
                    it.id === 'item_gold_gear' ||
                    it.id === 'item_egg_badge'
                );
                return (
                  <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-cyan-950/60 border border-amber-500/40 rounded-xl p-3 shadow-md flex flex-col sm:flex-row items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="text-2xl p-1.5 bg-amber-500/20 rounded-lg border border-amber-400/40">
                        ⚙️
                      </div>
                      <div>
                        <h4 className="font-bold text-amber-300 text-xs sm:text-sm font-pixel">
                          {`Komponen Menara Jam: ${clockItems.length}/12 Terkumpul`}
                        </h4>
                        <p className="text-[10.5px] text-slate-300">
                          Setiap warga desa memegang satu komponen Menara Jam. Pahami emosi tiap NPC dan berikan respons yang benar untuk memulihkannya!
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-1 font-pixel text-xs text-amber-300 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-amber-400/40">
                      <span>{clockItems.length}</span>
                      <span className="text-slate-500">/</span>
                      <span>12</span>
                    </div>
                  </div>
                );
              })()}

              {localizedItems.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  Tas petualanganmu masih kosong. Selesaikan misi atau temukan rahasia desa!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {localizedItems.map((it) => {
                    const isClockComponent =
                      it.id.startsWith('item_clock_') ||
                      it.id === 'item_letter' ||
                      it.id === 'item_secret_key' ||
                      it.id === 'item_bridge_pass' ||
                      it.id === 'item_gold_gear' ||
                      it.id === 'item_egg_badge';
                    return (
                      <div
                        key={it.id}
                        className={`rounded-xl p-3 flex gap-2.5 items-start transition-all duration-200 cursor-default ${
                          isClockComponent
                            ? 'bg-amber-950/30 border-2 border-amber-500/60 hover:border-amber-400 hover:scale-[1.025] hover:shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                            : 'bg-slate-800/80 border border-slate-700 hover:border-slate-500 hover:scale-[1.01] rounded-xl'
                        }`}
                      >
                        <span className="text-2xl shrink-0 p-1 bg-slate-900 rounded-lg border border-slate-700 shadow-inner">
                          {it.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="font-bold text-xs text-amber-300 truncate">{it.name}</h4>
                            {isClockComponent && (
                              <span className="text-[9px] font-pixel text-amber-300 bg-amber-500/20 border border-amber-400/40 rounded px-1 shrink-0">
                                ⚙️ KOMPONEN
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                            {it.description}
                          </p>
                          {it.foundLocation && (
                            <span className="text-[9.5px] text-slate-400 mt-1 block italic">
                              📍 {it.foundLocation}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'harmoni' && (
            <div className="space-y-4">
              {/* Progress bar */}
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 hover:border-amber-400/50 hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:scale-[1.01] transition-all duration-200">
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-300">Tingkat Pemulihan Warna Desa:</span>
                  <span className="text-amber-400 font-pixel">{harmonyPercent}%</span>
                </div>
                <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 via-amber-400 to-emerald-400 transition-all duration-700 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                    style={{ width: `${harmonyPercent}%` }}
                  />
                </div>
              </div>

              {/* Zones status list */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-700 hover:border-emerald-500/50 hover:scale-[1.015] hover:shadow-[0_0_12px_rgba(16,185,129,0.25)] transition-all duration-200">
                  <span>Alun-alun & Air Mancur Desa (Kiki)</span>
                  {zoneStatus.plaza ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Berwarna & Hidup
                    </span>
                  ) : (
                    <span className="text-slate-500 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" /> Abu-abu
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-700 hover:border-emerald-500/50 hover:scale-[1.015] hover:shadow-[0_0_12px_rgba(16,185,129,0.25)] transition-all duration-200">
                  <span>Jembatan Kayu Sungai (Kakek Ranu)</span>
                  {zoneStatus.bridge ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mengalir Jernih
                    </span>
                  ) : (
                    <span className="text-slate-500 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" /> Terkunci & Keruh
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-700 hover:border-emerald-500/50 hover:scale-[1.015] hover:shadow-[0_0_12px_rgba(16,185,129,0.25)] transition-all duration-200">
                  <span>Hutan Sunyi & Pohon Sahabat (Bimo)</span>
                  {zoneStatus.forest ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Asri & Mekar
                    </span>
                  ) : (
                    <span className="text-slate-500 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" /> Redup & Gelap
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-700 hover:border-emerald-500/50 hover:scale-[1.015] hover:shadow-[0_0_12px_rgba(16,185,129,0.25)] transition-all duration-200">
                  <span>Menara Jam Kuno (Nenek Wilis)</span>
                  {zoneStatus.tower ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Berdenting Merdu
                    </span>
                  ) : (
                    <span className="text-slate-500 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" /> Terselimut Kabut
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3.5 bg-gradient-to-r from-pink-950/40 via-slate-900/80 to-purple-950/40 border border-pink-500/40 hover:border-pink-400/70 hover:shadow-[0_0_16px_rgba(236,72,153,0.3)] transition-transform duration-75 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-pixel text-pink-300 font-bold text-[10px]">
                    <span className="text-sm animate-pulse">💖</span>
                    <span>Performa Skor Sosial Emosional (PSE)</span>
                  </span>
                  <span className="font-pixel text-sm font-black text-amber-300">
                    {stats.empathyScore} <span className="text-[10px] text-pink-300 font-normal">Poin</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Setiap pilihan dialog memiliki bobot nilai empati murni berdasarkan ketulusan responsmu. Kompas berfungsi murni sebagai penunjuk arah sasaran misi di desa, bebas dinyalakan kapan pun tanpa mempengaruhi perolehan skor empati.
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10.5px] text-slate-400">
                  <span>
                    🧭 Status Kompas Penunjuk Arah:{' '}
                    <strong className="text-amber-400 font-pixel">Siaga Menuntun</strong>
                  </span>
                  <span>
                    💖 Skor Empati Murni:{' '}
                    <strong className="text-emerald-400 font-pixel">{stats.empathyScore} Poin</strong>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 text-center text-[11px] text-slate-400">
          Gunakan tombol Tutup atau tekan ESC untuk kembali berpetualang.
        </div>
      </div>
    </div>
  );
};
