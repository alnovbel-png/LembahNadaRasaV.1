import React, { useState } from 'react';
import { PSE_ACHIEVEMENTS } from '../game/constants';
import { Item, ZoneColorStatus, PlayerStats } from '../types/game';
import { BookOpen, Compass, Sparkles, X, CheckCircle2, Lock, Award, Trophy, ScrollText } from 'lucide-react';

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
  const unlockedBadgesCount = PSE_ACHIEVEMENTS.filter((b) =>
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
                Jurnal Kompas Hati & Lore Cerita
              </h2>
              <p className="text-[11px] text-slate-400">
                Kisah lengkap lembah harmoni, pencapaian lencana PSE, tas petualangan, & harmoni desa
              </p>
            </div>
          </div>
          <button
            id="close-journal-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-rose-950/40 hover:border hover:border-rose-500/50 hover:scale-110 hover:shadow-[0_0_12px_rgba(244,63,94,0.45)] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Grid (4 columns) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-950/90 border-b border-slate-800 shrink-0">
          <button
            id="tab-lore"
            onClick={() => setActiveTab('lore')}
            className={`px-3 py-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
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
            className={`px-3 py-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
              activeTab === 'lencana'
                ? 'border-amber-400/80 text-amber-300 bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:border-amber-400/60 hover:shadow-[0_0_12px_rgba(245,158,11,0.25)]'
            }`}
          >
            <Award className="w-4 h-4 shrink-0 text-amber-400" />
            <span className="truncate">Lencana ({unlockedBadgesCount}/{PSE_ACHIEVEMENTS.length})</span>
          </button>

          <button
            id="tab-tas"
            onClick={() => setActiveTab('tas')}
            className={`px-3 py-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
              activeTab === 'tas'
                ? 'border-amber-400/80 text-amber-300 bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:border-amber-400/60 hover:shadow-[0_0_12px_rgba(245,158,11,0.25)]'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0 text-amber-400" />
            <span className="truncate">Tas ({items.length})</span>
          </button>

          <button
            id="tab-harmoni"
            onClick={() => setActiveTab('harmoni')}
            className={`px-3 py-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
              activeTab === 'harmoni'
                ? 'border-amber-400/80 text-amber-300 bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:border-amber-400/60 hover:shadow-[0_0_12px_rgba(245,158,11,0.25)]'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
            <span className="truncate">Harmoni ({harmonyPercent}%)</span>
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

              {/* Bab 2: Pudarnya Warna */}
              <div className="bg-slate-800/70 border border-slate-700/80 hover:border-amber-400/60 hover:scale-[1.015] hover:shadow-[0_0_15px_rgba(245,158,11,0.25)] rounded-xl p-3.5 space-y-2 transition-all duration-200">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <span>🌫️</span>
                  <h4>Bab 2: Munculnya Kabut Prasangka & Pudarnya Warna</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Lama-kelamaan, kesibukan dan perbedaan pendapat membuat warga mulai berubah. Ketika terjadi masalah kecil, mereka lebih memilih saling menyalahkan daripada duduk bersama untuk saling mendengarkan. Ego dan prasangka buruk pun mulai tumbuh.
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Melihat hal itu, <strong>Nenek Wilis</strong>—sang penjaga Menara Jam yang bijaksana—merasa sangat sedih. Roda gigi jam berhenti berputar, dan seketika <strong>Kabut Abu-Abu Prasangka</strong> turun menyelimuti seluruh desa. Alam ikut meredup: rumput hijau, air sungai, bunga-bunga, dan rumah warga mendadak kehilangan warnanya, menjadi kelabu dan dingin.
                </p>
              </div>

              {/* Bab 3: Kompas Resonansi Hati */}
              <div className="bg-slate-800/70 border border-slate-700/80 hover:border-amber-400/60 hover:scale-[1.015] hover:shadow-[0_0_15px_rgba(245,158,11,0.25)] rounded-xl p-3.5 space-y-2 transition-all duration-200">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <span>🧭</span>
                  <h4>Bab 3: Pusaka Ajaib Kompas Resonansi Hati</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Di tengah desa yang suram, pahlawan cilik kita, <strong>Ezzel</strong>, menemukan sebuah benda ajaib yang bersinar di dekat Air Mancur Alun-Alun: <strong>Kompas Resonansi Hati</strong>.
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Kompas ini membuka rahasia besar tentang hati manusia. Setiap orang memiliki <strong>dua lapisan emosi</strong>:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2 text-[11px]">
                  <div className="bg-slate-900/80 border border-red-500/30 hover:border-red-400 hover:scale-[1.02] hover:shadow-[0_0_12px_rgba(239,68,68,0.3)] transition-all rounded-lg p-2.5">
                    <span className="font-bold text-red-300 block mb-1">🔴 Emosi Luar (Permukaan):</span>
                    Emosi yang tampak di mata luar, seperti marah, cemberut, membentak, atau dingin menutup diri.
                  </div>
                  <div className="bg-slate-900/80 border border-cyan-500/30 hover:border-cyan-400 hover:scale-[1.02] hover:shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all rounded-lg p-2.5">
                    <span className="font-bold text-cyan-300 block mb-1">💙 Emosi Dalam (Lubuk Hati):</span>
                    Perasaan sejati yang tersembunyi, seperti rasa takut gagal, sedih, lelah, kesepian, atau rindu dihargai.
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Dengan kompas ini, Ezzel belajar tidak membalas amarah dengan amarah, melainkan dengan pemahaman dan kelembutan hati.
                </p>
              </div>

              {/* Bab 4: Penjelajahan 4 Zona */}
              <div className="bg-slate-800/70 border border-slate-700/80 hover:border-amber-400/60 hover:scale-[1.015] hover:shadow-[0_0_15px_rgba(245,158,11,0.25)] rounded-xl p-3.5 space-y-2 transition-all duration-200">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <span>🗺️</span>
                  <h4>Bab 4: Memulihkan 4 Sudut Lembah</h4>
                </div>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-start gap-2 bg-slate-900/50 hover:bg-slate-900/80 hover:border-amber-400/50 hover:scale-[1.01] hover:shadow-[0_0_10px_rgba(245,158,11,0.2)] p-2.5 rounded-lg border border-slate-700/60 transition-all">
                    <span className="text-base shrink-0">🐿️</span>
                    <div>
                      <strong className="text-amber-200">1. Alun-Alun Desa & Kiki si Tupai Pos:</strong>
                      <p className="text-[11px] mt-0.5 text-slate-300">
                        Kiki panik karena surat-surat warga berhamburan tertiup angin kencang. Ezzel mengajak Kiki mempraktikkan teknik bernapas sadar (STOP). Setelah tenang, surat berhasil dikumpulkan, dan alun-alun kembali mekar ceria!
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-slate-900/50 hover:bg-slate-900/80 hover:border-amber-400/50 hover:scale-[1.01] hover:shadow-[0_0_10px_rgba(245,158,11,0.2)] p-2.5 rounded-lg border border-slate-700/60 transition-all">
                    <span className="text-base shrink-0">🪵</span>
                    <div>
                      <strong className="text-amber-200">2. Jembatan Kayu & Kakek Ranu:</strong>
                      <p className="text-[11px] mt-0.5 text-slate-300">
                        Kakek Ranu mengunci jembatan karena marah hasil karyanya tak dihargai warga. Ezzel mendengarkan dengan penuh hormat dan mengakui jasa sang kakek. Hati Kakek Ranu luluh, jembatan dibuka kembali, dan air sungai mengalir jernih!
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-slate-900/50 hover:bg-slate-900/80 hover:border-amber-400/50 hover:scale-[1.01] hover:shadow-[0_0_10px_rgba(245,158,11,0.2)] p-2.5 rounded-lg border border-slate-700/60 transition-all">
                    <span className="text-base shrink-0">🌲</span>
                    <div>
                      <strong className="text-amber-200">3. Hutan Sunyi & Sahabat Bimo:</strong>
                      <p className="text-[11px] mt-0.5 text-slate-300">
                        Bimo menyendiri di bawah pohon purba karena takut dijauhi teman-temannya. Ezzel membuktikan bahwa ia tulus ingin berteman tanpa syarat. Rasa percaya diri Bimo pulih, dan hutan kembali rimbun bernyanyi!
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-slate-900/50 hover:bg-slate-900/80 hover:border-amber-400/50 hover:scale-[1.01] hover:shadow-[0_0_10px_rgba(245,158,11,0.2)] p-2.5 rounded-lg border border-slate-700/60 transition-all">
                    <span className="text-base shrink-0">🔔</span>
                    <div>
                      <strong className="text-amber-200">4. Puncak Menara Jam & Nenek Wilis:</strong>
                      <p className="text-[11px] mt-0.5 text-slate-300">
                        Ezzel membawa Roda Gigi Harmoni ke puncak menara dan berbicara kepada Nenek Wilis. Melihat ketulusan anak-anak yang telah belajar berempati, kabut abu-abu terangkat selamanya, lonceng berdentang merdu, dan harmoni lembah pulih seutuhnya!
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
                    <span className="font-bold text-amber-300 block">📚 Kak Citra & Moka si Kucing</span>
                    <span className="text-slate-300">Konselor desa dan kucing ramah yang mengajarkan cara mengenali 4 zona emosi serta mendengarkan dengan telinga dan hati.</span>
                  </div>
                  <div className="bg-slate-900/60 hover:bg-slate-900/90 hover:border-amber-400/50 hover:scale-[1.02] transition-all p-2.5 rounded-lg border border-slate-700/60">
                    <span className="font-bold text-amber-300 block">🪓 Pak Teguh & Ibu Sari</span>
                    <span className="text-slate-300">Penebang kayu yang belajar jeda meredakan amarah dan pedagang buah yang gemar melipatgandakan sukacita dengan bersyukur.</span>
                  </div>
                  <div className="bg-slate-900/60 hover:bg-slate-900/90 hover:border-amber-400/50 hover:scale-[1.02] transition-all p-2.5 rounded-lg border border-slate-700/60">
                    <span className="font-bold text-amber-300 block">🎣 Kakek Damai & Bung Jala</span>
                    <span className="text-slate-300">Mengajarkan lingkaran kendali—membedakan hal yang bisa kita kendalikan sendiri dengan hal yang harus kita ikhlaskan.</span>
                  </div>
                  <div className="bg-slate-900/60 hover:bg-slate-900/90 hover:border-amber-400/50 hover:scale-[1.02] transition-all p-2.5 rounded-lg border border-slate-700/60">
                    <span className="font-bold text-amber-300 block">🌱 Pak Joko, Didi, & Prof. Kotek</span>
                    <span className="text-slate-300">Mengajarkan pola pikir berkembang (pantang menyerah), senyuman ramah pengelana, dan tawa ceria sebagai penawar lelah jiwa.</span>
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
                  &ldquo;Harmoni bukanlah ketiadaan perbedaan, melainkan kerelaan untuk saling mendengarkan dan memahami perasaan sesama dalam simfoni kasih sayang.&rdquo;
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
              {unlockedBadgesCount === PSE_ACHIEVEMENTS.length ? (
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
                  ⭐ <strong>Lencana Wawasan PSE</strong>: Bicaralah dengan mentor opsional di desa (Kak Citra di Alun-alun, Kakek Damai di tepi sungai, dan Moka si Kucing di Hutan) untuk mengumpulkan pengetahuan dan membuka semua achievement!
                </div>
              )}

              <div className="grid grid-cols-1 gap-2.5">
                {PSE_ACHIEVEMENTS.map((badge) => {
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
            <div>
              {items.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  Tas petualanganmu masih kosong. Selesaikan misi atau temukan rahasia desa!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {items.map((it) => (
                    <div
                      key={it.id}
                      className="bg-slate-800/80 border border-slate-700 hover:border-amber-400/70 hover:scale-[1.025] hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] rounded-xl p-3 flex gap-2.5 items-start transition-all duration-200 cursor-default"
                    >
                      <span className="text-2xl shrink-0 p-1 bg-slate-900 rounded-lg border border-slate-700 shadow-inner">
                        {it.icon}
                      </span>
                      <div>
                        <h4 className="font-bold text-xs text-amber-300">{it.name}</h4>
                        <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                          {it.description}
                        </p>
                      </div>
                    </div>
                  ))}
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

              <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 hover:border-emerald-400/60 hover:scale-[1.01] hover:shadow-[0_0_14px_rgba(16,185,129,0.3)] transition-all rounded-xl text-[11px] text-emerald-300">
                Poin Empati Terkumpul: <strong>{stats.empathyScore} Poin</strong>. Terus gunakan empati dan pemahaman untuk mendamaikan warga!
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 text-center text-[11px] text-slate-400">
          Gunakan tombol [Tutup] atau tekan ESC untuk kembali berpetualang.
        </div>
      </div>
    </div>
  );
};
