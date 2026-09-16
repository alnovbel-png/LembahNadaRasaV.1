import React, { useState, useEffect } from 'react';
import {
  X,
  Sliders,
  Volume2,
  VolumeX,
  Music,
  Play,
  RotateCcw,
  Target,
  Award,
  Gamepad2,
  CheckCircle2,
  Clock,
  Sparkles,
  Heart,
  BookOpen,
  MapPin,
  HelpCircle,
} from 'lucide-react';
import { useAudioSettings } from '../utils/audio';
import { GameQuest, ZoneColorStatus, NPC } from '../types/game';
import { PSE_ACHIEVEMENTS } from '../game/constants';

export type SettingsModalTab = 'quest' | 'achievements' | 'audio' | 'controls';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: SettingsModalTab;
  quests: GameQuest[];
  zoneStatus: ZoneColorStatus;
  unlockedBadges: string[];
  empathyScore: number;
  npcs: NPC[];
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'quest',
  quests,
  zoneStatus,
  unlockedBadges,
  empathyScore,
  npcs,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsModalTab>(initialTab);
  const {
    bgmVolume,
    sfxVolume,
    isMuted,
    setBgmVolume,
    setSfxVolume,
    toggleMute,
    setMuted,
    playTestSfx,
    playTestBgm,
  } = useAudioSettings();

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Keyboard shortcut: Esc to close
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

  const bgmPercent = Math.round(bgmVolume * 100);
  const sfxPercent = Math.round(sfxVolume * 100);
  const unlockedCount = unlockedBadges.length;
  const totalBadges = PSE_ACHIEVEMENTS.length;
  const badgeProgressPercent = Math.round((unlockedCount / totalBadges) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-3">
      <div className="bg-slate-900 border-2 border-amber-400/80 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-base text-amber-300">
              Pengaturan Game & Petualangan
            </h2>
          </div>
          <button
            id="close-settings-btn"
            onClick={onClose}
            aria-label="Tutup menu pengaturan"
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Unified Tab Navigation Bar */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/70 px-3 pt-2 gap-1 overflow-x-auto">
          <button
            id="settings-tab-quest-btn"
            onClick={() => setActiveTab('quest')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-t-xl text-xs sm:text-sm font-semibold transition border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'quest'
                ? 'bg-slate-900 text-amber-300 border-amber-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/40'
            }`}
          >
            <Target className="w-4 h-4 text-amber-400" />
            <span>Misi & Objektif</span>
          </button>

          <button
            id="settings-tab-achievements-btn"
            onClick={() => setActiveTab('achievements')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-t-xl text-xs sm:text-sm font-semibold transition border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'achievements'
                ? 'bg-slate-900 text-amber-300 border-amber-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/40'
            }`}
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Pencapaian ({unlockedCount}/{totalBadges})</span>
          </button>

          <button
            id="settings-tab-audio-btn"
            onClick={() => setActiveTab('audio')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-t-xl text-xs sm:text-sm font-semibold transition border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'audio'
                ? 'bg-slate-900 text-amber-300 border-amber-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/40'
            }`}
          >
            <Volume2 className="w-4 h-4 text-amber-400" />
            <span>Audio & Suara</span>
          </button>

          <button
            id="settings-tab-controls-btn"
            onClick={() => setActiveTab('controls')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-t-xl text-xs sm:text-sm font-semibold transition border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'controls'
                ? 'bg-slate-900 text-amber-300 border-amber-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/40'
            }`}
          >
            <Gamepad2 className="w-4 h-4 text-amber-400" />
            <span>Panduan Kontrol</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* TAB 1: MISI & OBJEKTIF */}
          {activeTab === 'quest' && (
            <div className="space-y-5">
              {/* Status Wilayah Lembah */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  Status Pemulihan Warna Lembah
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className={`p-2.5 rounded-lg border flex flex-col items-center text-center ${zoneStatus.plaza ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-300' : 'bg-slate-900/80 border-slate-800 text-slate-400'}`}>
                    <span className="font-bold">Alun-Alun</span>
                    <span className="text-[10px] mt-1">{zoneStatus.plaza ? '✨ Berwarna' : '🌫️ Kelabu'}</span>
                  </div>
                  <div className={`p-2.5 rounded-lg border flex flex-col items-center text-center ${zoneStatus.bridge ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-300' : 'bg-slate-900/80 border-slate-800 text-slate-400'}`}>
                    <span className="font-bold">Jembatan Kayu</span>
                    <span className="text-[10px] mt-1">{zoneStatus.bridge ? '✨ Berwarna' : '🌫️ Kelabu'}</span>
                  </div>
                  <div className={`p-2.5 rounded-lg border flex flex-col items-center text-center ${zoneStatus.forest ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-300' : 'bg-slate-900/80 border-slate-800 text-slate-400'}`}>
                    <span className="font-bold">Hutan Sunyi</span>
                    <span className="text-[10px] mt-1">{zoneStatus.forest ? '✨ Berwarna' : '🌫️ Kelabu'}</span>
                  </div>
                  <div className={`p-2.5 rounded-lg border flex flex-col items-center text-center ${zoneStatus.tower ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-300' : 'bg-slate-900/80 border-slate-800 text-slate-400'}`}>
                    <span className="font-bold">Menara Jam</span>
                    <span className="text-[10px] mt-1">{zoneStatus.tower ? '✨ Berwarna' : '🌫️ Kelabu'}</span>
                  </div>
                </div>
              </div>

              {/* Daftar Misi Utama */}
              <div>
                <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-400" />
                  Alur Misi Utama Kisah
                </h3>
                <div className="space-y-3">
                  {quests.map((q) => (
                    <div
                      key={q.id}
                      className={`p-3.5 rounded-xl border transition ${
                        q.isCompleted
                          ? 'bg-slate-950/40 border-emerald-500/40'
                          : 'bg-slate-950/80 border-amber-500/40 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {q.isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <Clock className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                          )}
                          <h4 className={`text-sm font-bold ${q.isCompleted ? 'text-slate-300 line-through' : 'text-amber-200'}`}>
                            {q.title}
                          </h4>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            q.isCompleted
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-700'
                          }`}
                        >
                          {q.isCompleted ? 'Selesai' : 'Sedang Berjalan'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                        {q.description}
                      </p>
                      {!q.isCompleted && (
                        <div className="mt-2 text-xs bg-amber-950/40 border border-amber-500/20 rounded-lg p-2 text-amber-200 font-medium">
                          💡 <strong>Petunjuk:</strong> {q.stepHint}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Misi Eksplorasi Warga & Hutan */}
              <div>
                <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Eksplorasi Warga Desa, Hutan, & Sungai
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {npcs.map((npc) => (
                    <div
                      key={npc.id}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                        npc.isResolved
                          ? 'bg-emerald-950/20 border-emerald-500/40'
                          : 'bg-slate-950/50 border-slate-800'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-slate-200 flex items-center gap-1.5">
                          <span>{npc.isResolved ? '✨' : '💬'}</span>
                          <span>{npc.name}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({npc.role})</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {npc.isResolved
                            ? '✅ Hati terbuka & harmonis'
                            : `Belum selesai: Emosi "${npc.emotionProfile.surfaceEmotion}"`}
                        </div>
                      </div>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          npc.isResolved
                            ? 'bg-emerald-900/60 text-emerald-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {npc.isResolved ? 'Selesai' : 'Belum'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PENCAPAIAN / ACHIVEMENTS */}
          {activeTab === 'achievements' && (
            <div className="space-y-5">
              {/* Header Progress Bar */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-slate-400 font-medium">Total Skor Empati & Wawasan</div>
                  <div className="text-xl font-bold text-amber-300 flex items-center gap-2 mt-0.5">
                    <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
                    <span>{empathyScore} Poin Empati</span>
                  </div>
                </div>

                <div className="w-full sm:w-48">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Lencana Terbuka</span>
                    <span className="font-bold text-amber-400">{unlockedCount} / {totalBadges}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${badgeProgressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Grid of PSE Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PSE_ACHIEVEMENTS.map((badge) => {
                  const isUnlocked = unlockedBadges.includes(badge.id);
                  return (
                    <div
                      key={badge.id}
                      className={`p-3.5 rounded-xl border transition flex flex-col justify-between ${
                        isUnlocked
                          ? 'bg-amber-950/20 border-amber-500/50 shadow-md'
                          : 'bg-slate-950/40 border-slate-800/80 opacity-70'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{badge.icon}</span>
                            <div>
                              <h4 className={`text-xs font-bold leading-tight ${isUnlocked ? 'text-amber-300' : 'text-slate-300'}`}>
                                {badge.title}
                              </h4>
                              <div className="text-[10px] text-slate-400">
                                Mentor: {badge.mentor}
                              </div>
                            </div>
                          </div>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0 ${
                              isUnlocked
                                ? 'bg-amber-400/20 text-amber-300 border border-amber-500/40'
                                : 'bg-slate-800 text-slate-500'
                            }`}
                          >
                            {isUnlocked ? 'Terbuka ✨' : 'Terkunci 🔒'}
                          </span>
                        </div>

                        <div className="text-[11px] font-semibold text-emerald-400 mb-1">
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

          {/* TAB 3: AUDIO & SUARA */}
          {activeTab === 'audio' && (
            <div className="space-y-6">
              {/* Master Mute Card */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${isMuted ? 'bg-rose-950/60 text-rose-400' : 'bg-emerald-950/60 text-emerald-400'}`}>
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-200">
                      Suara Game Keseluruhan
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {isMuted ? 'Game sedang dalam mode senyap (bisu)' : 'Audio aktif dan terdengar'}
                    </p>
                  </div>
                </div>

                <button
                  id="settings-toggle-mute-btn"
                  onClick={toggleMute}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isMuted
                      ? 'bg-rose-500 hover:bg-rose-400 text-slate-950'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  }`}
                >
                  {isMuted ? 'Nyalakan Suara' : 'Bisu (Mute)'}
                </button>
              </div>

              {/* BGM Volume Slider */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-sm text-slate-200">
                      Volume Musik Latar (BGM)
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-300">
                    {bgmPercent}%
                  </span>
                </div>

                <input
                  id="settings-bgm-slider"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={bgmVolume}
                  onChange={(e) => setBgmVolume(parseFloat(e.target.value))}
                  className="w-full accent-amber-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />

                <div className="flex justify-end pt-1">
                  <button
                    id="settings-test-bgm-btn"
                    onClick={playTestBgm}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-amber-400" />
                    <span>Uji Nada Musik</span>
                  </button>
                </div>
              </div>

              {/* SFX Volume Slider */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-sm text-slate-200">
                      Volume Efek Suara (SFX)
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-300">
                    {sfxPercent}%
                  </span>
                </div>

                <input
                  id="settings-sfx-slider"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={sfxVolume}
                  onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
                  className="w-full accent-amber-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />

                <div className="flex justify-end pt-1">
                  <button
                    id="settings-test-sfx-btn"
                    onClick={playTestSfx}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-amber-400" />
                    <span>Uji Efek Koin/Langkah</span>
                  </button>
                </div>
              </div>

              {/* Reset to Default */}
              <div className="flex justify-end">
                <button
                  id="settings-reset-audio-btn"
                  onClick={() => {
                    setBgmVolume(0.3);
                    setSfxVolume(0.65);
                    setMuted(false);
                  }}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-300 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Kembalikan Volume Default (BGM: 30%, SFX: 65%)</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: PANDUAN KONTROL & PSE */}
          {activeTab === 'controls' && (
            <div className="space-y-5">
              {/* Keyboard & Mouse Guide */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4 text-amber-400" />
                  Panduan Kontrol Keyboard & Mouse
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-300">Bergerak / Jalan</span>
                    <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-amber-300">W / A / S / D / Panah</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-300">Navigasi Titik Layar</span>
                    <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-amber-300">Klik / Ketuk Lantai</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-300">Kompas Resonansi Hati</span>
                    <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-amber-300">Spasi</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-300">Studio Regulasi Emosi</span>
                    <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-amber-300">R</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-300">Buka Peta Mini</span>
                    <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-amber-300">M</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-300">Buka Jurnal Kompas</span>
                    <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-amber-300">J</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-300">Buka Menu Pengaturan</span>
                    <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-amber-300">O / Esc</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-300">Interaksi / Lanjut Dialog</span>
                    <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-amber-300">E / Enter / Spasi</span>
                  </div>
                </div>
              </div>

              {/* Fakta Sains PSE */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  Kamus Singkat Pembelajaran Sosial Emosional (PSE)
                </h3>

                <div className="space-y-2.5 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="font-bold text-amber-300">1. Gunung Es Emosi (Iceberg of Emotion):</span>
                    <p className="text-slate-400 mt-1 leading-relaxed">
                      Emosi luar (seperti marah atau teriak) sering kali hanya puncak gunung es. Di bawah permukaan air tersimpan rasa takut, cemas, atau kesepian yang butuh didengarkan.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="font-bold text-emerald-300">2. Meredakan Alarm Amigdala:</span>
                    <p className="text-slate-400 mt-1 leading-relaxed">
                      Saat panik atau marah, otak bagian amigdala membunyikan alarm bahaya. Latihan napas dalam (Napas Balon 4-4) mengirimkan sinyal oksigen agar otak berpikir jernih kembali.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="font-bold text-cyan-300">3. Lingkaran Kendali (Circle of Control):</span>
                    <p className="text-slate-400 mt-1 leading-relaxed">
                      Fokuskan energi pada apa yang bisa kamu kendalikan: kata-katamu, usahamu, dan responmu. Jangan habiskan energimu meratapi hal di luar kendalimu.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-800/80 border-t border-slate-700 flex items-center justify-between text-xs text-slate-400">
          <span>Lembah Nada Rasa • PSE Kelas 4</span>
          <button
            id="settings-close-bottom-btn"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
