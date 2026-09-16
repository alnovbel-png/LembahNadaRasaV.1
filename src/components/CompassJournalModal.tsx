import React, { useState } from 'react';
import { SEL_GLOSSARY, PSE_ACHIEVEMENTS } from '../game/constants';
import { Item, ZoneColorStatus, PlayerStats } from '../types/game';
import { BookOpen, Compass, Sparkles, X, Brain, CheckCircle2, Lock, Award } from 'lucide-react';

interface CompassJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: Item[];
  zoneStatus: ZoneColorStatus;
  stats: PlayerStats;
}

export const CompassJournalModal: React.FC<CompassJournalModalProps> = ({
  isOpen,
  onClose,
  items,
  zoneStatus,
  stats,
}) => {
  const [activeTab, setActiveTab] = useState<'kamus' | 'lencana' | 'tas' | 'harmoni'>('kamus');

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3">
      <div className="bg-slate-900 border-2 border-amber-400/80 rounded-2xl max-w-2xl sm:max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-400/40">
              <Compass className="w-5 h-5 text-amber-400 animate-spin-slow" />
            </div>
            <div>
              <h2 className="font-bold text-base text-amber-300">
                Jurnal Kompas Hati & Kamus PSE
              </h2>
              <p className="text-[11px] text-slate-400">
                Wawasan emosional, pencapaian lencana PSE, tas petualangan, & harmoni lembah
              </p>
            </div>
          </div>
          <button
            id="close-journal-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-700/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Grid (Fully visible 4 columns, no overflow scrollbar overlapping) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-950/90 border-b border-slate-800 shrink-0">
          <button
            id="tab-kamus"
            onClick={() => setActiveTab('kamus')}
            className={`px-3 py-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
              activeTab === 'kamus'
                ? 'border-amber-400/80 text-amber-300 bg-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Brain className="w-4 h-4 shrink-0 text-amber-400" />
            <span className="truncate">Kamus PSE</span>
          </button>

          <button
            id="tab-lencana"
            onClick={() => setActiveTab('lencana')}
            className={`px-3 py-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
              activeTab === 'lencana'
                ? 'border-amber-400/80 text-amber-300 bg-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Award className="w-4 h-4 shrink-0 text-amber-400" />
            <span className="truncate">Lencana ({unlockedBadgesCount}/{PSE_ACHIEVEMENTS.length})</span>
          </button>

          <button
            id="tab-tas"
            onClick={() => setActiveTab('tas')}
            className={`px-3 py-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
              activeTab === 'tas'
                ? 'border-amber-400/80 text-amber-300 bg-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0 text-amber-400" />
            <span className="truncate">Tas ({items.length})</span>
          </button>

          <button
            id="tab-harmoni"
            onClick={() => setActiveTab('harmoni')}
            className={`px-3 py-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
              activeTab === 'harmoni'
                ? 'border-amber-400/80 text-amber-300 bg-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
            <span className="truncate">Harmoni ({harmonyPercent}%)</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3 custom-scrollbar pr-3 sm:pr-4">
          {activeTab === 'kamus' && (
            <div className="space-y-3">
              <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200">
                <strong>Cara Kerja Kompas Resonansi:</strong> Tekan tombol [RESONANSI] atau Spasi di dekat warga. Lapisan warna aura memperlihatkan emosi yang tampak di luar vs yang tersimpan di dalam lubuk hati!
              </div>

              {SEL_GLOSSARY.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-3 text-slate-200 hover:border-amber-400/40 transition"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <h4 className="font-bold text-sm text-amber-300">{item.title}</h4>
                      <span className="text-[10px] text-cyan-300 uppercase tracking-wider font-semibold">
                        {item.concept}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {item.explanation}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'lencana' && (
            <div className="space-y-3">
              <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3 text-xs text-amber-200">
                ⭐ <strong>Lencana Wawasan PSE</strong>: Bicaralah dengan mentor opsional di desa (Kak Citra di Alun-alun, Kakek Damai di tepi sungai, dan Moka si Kucing di Hutan) untuk mengumpulkan pengetahuan dan membuka semua achievement!
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {PSE_ACHIEVEMENTS.map((badge) => {
                  const isUnlocked = unlockedBadges.includes(badge.id);
                  return (
                    <div
                      key={badge.id}
                      className={`p-3.5 rounded-xl border transition flex items-start gap-3.5 ${
                        isUnlocked
                          ? 'bg-amber-950/20 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                          : 'bg-slate-800/30 border-slate-700/60 opacity-75'
                      }`}
                    >
                      <div
                        className={`text-2xl sm:text-3xl p-2 rounded-xl flex items-center justify-center shrink-0 ${
                          isUnlocked
                            ? 'bg-amber-500/20 border border-amber-400/50'
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
                            <span className="font-pixel text-[8px] px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 shrink-0 flex items-center gap-1">
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
                      className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 flex gap-2.5 items-start"
                    >
                      <span className="text-2xl shrink-0 p-1 bg-slate-900 rounded-lg border border-slate-700">
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
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-300">Tingkat Pemulihan Warna Desa:</span>
                  <span className="text-amber-400">{harmonyPercent}%</span>
                </div>
                <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 via-amber-400 to-emerald-400 transition-all duration-700"
                    style={{ width: `${harmonyPercent}%` }}
                  />
                </div>
              </div>

              {/* Zones status list */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-700">
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

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-700">
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

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-700">
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

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-700">
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

              <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-[11px] text-emerald-300">
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
