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
  MapPin,
  Trophy,
  Camera,
  BookOpen,
  Users,
  ArrowRight,
  Terminal,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { useAudioSettings, BgmPhase, sound } from '../utils/audio';
import { GameQuest, ZoneColorStatus, NPC, PlayerStats } from '../types/game';
import { PSE_ACHIEVEMENTS } from '../game/constants';
import { PeopleGuideModal } from './PeopleGuideModal';

export type SettingsModalTab = 'quest' | 'achievements' | 'audio' | 'controls';

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: SettingsModalTab;
  quests?: GameQuest[];
  zoneStatus?: ZoneColorStatus;
  stats?: PlayerStats;
  npcs?: NPC[];
  unlockedBadges?: string[];
  empathyScore?: number;
  isMuted?: boolean;
  isFreeRoamActive?: boolean;
  onToggleMute?: () => void;
  onOpenAllBadgesCelebration?: () => void;
  onUnlockAllBadges?: () => void;
  onCaptureMoment?: () => void;
  onNavigateToTile?: (tileX: number, tileY: number) => void;
  onActivateDeveloperMode?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'quest',
  quests = [],
  zoneStatus = { plaza: false, bridge: false, forest: false, tower: false },
  stats,
  npcs = [],
  unlockedBadges,
  empathyScore,
  isFreeRoamActive = false,
  onOpenAllBadgesCelebration,
  onUnlockAllBadges,
  onCaptureMoment,
  onNavigateToTile,
  onActivateDeveloperMode,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsModalTab>(initialTab);
  const [showPeopleGuide, setShowPeopleGuide] = useState(false);
  const [selectedVillagerForGuide, setSelectedVillagerForGuide] = useState<string | null>(null);
  const [devPin, setDevPin] = useState('');
  const [devPinError, setDevPinError] = useState<string | null>(null);

  const {
    bgmVolume,
    sfxVolume,
    isMuted,
    bgmPhase,
    setBgmVolume,
    setSfxVolume,
    toggleMute,
    setMuted,
    setBgmPhase,
    playTestSfx,
    playTestBgm,
    playTestBgmPhase,
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

  const handleDevPinSubmit = () => {
    if (devPin.trim() === '12345') {
      setDevPinError(null);
      sound.playSecretFound();
      onActivateDeveloperMode?.();
      onClose();
    } else {
      setDevPinError('Kode PIN salah! Masukkan kode PIN yang sesuai (12345).');
      sound.playMenuSelect();
    }
  };

  if (!isOpen) return null;

  // Safe fallback extractions
  const effectiveBadges: string[] =
    unlockedBadges ?? (stats && Array.isArray(stats.unlockedBadges) ? stats.unlockedBadges : []);
  const effectiveEmpathy: number =
    typeof empathyScore === 'number'
      ? empathyScore
      : stats && typeof stats.empathyScore === 'number'
      ? stats.empathyScore
      : 0;
  const effectiveNpcs: NPC[] = Array.isArray(npcs) ? npcs : [];
  const effectiveQuests: GameQuest[] = Array.isArray(quests) ? quests : [];
  const effectiveZoneStatus: ZoneColorStatus = zoneStatus ?? {
    plaza: false,
    bridge: false,
    forest: false,
    tower: false,
  };

  const bgmPercent = Math.round((bgmVolume ?? 0.3) * 100);
  const sfxPercent = Math.round((sfxVolume ?? 0.65) * 100);
  const unlockedCount = effectiveBadges.length;
  const totalBadges = PSE_ACHIEVEMENTS.length;
  const badgeProgressPercent = totalBadges > 0 ? Math.round((unlockedCount / totalBadges) * 100) : 0;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-3">
      <div className="bg-slate-900 border-2 border-amber-400/80 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h2
              style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
              className="font-bold text-base text-amber-300 tracking-wide"
            >
              Pengaturan Game & Petualangan
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {onCaptureMoment && (
              <button
                id="settings-header-capture-moment-btn"
                onClick={onCaptureMoment}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
                title="Ambil screenshot area game saat ini dengan bingkai dekoratif"
              >
                <Camera className="w-4 h-4 text-slate-950" />
                <span>Abadikan Momen</span>
              </button>
            )}
            <button
              id="close-settings-btn"
              onClick={onClose}
              aria-label="Tutup menu pengaturan"
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700/50 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Submenu Grid - Clean 4-Column Layout, Never Covered by Any Horizontal Slider */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 sm:p-3.5 bg-slate-950/90 border-b border-slate-800 shrink-0">
          <button
            id="settings-tab-quest-btn"
            onClick={() => setActiveTab('quest')}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer text-center ${
              activeTab === 'quest'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Target className="w-4 h-4 shrink-0" />
            <span
              style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
              className="truncate"
            >
              Misi & Objektif
            </span>
          </button>

          <button
            id="settings-tab-achievements-btn"
            onClick={() => setActiveTab('achievements')}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer text-center ${
              activeTab === 'achievements'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Award className="w-4 h-4 shrink-0" />
            <span
              style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
              className="truncate"
            >
              Pencapaian ({unlockedCount}/{totalBadges})
            </span>
          </button>

          <button
            id="settings-tab-audio-btn"
            onClick={() => setActiveTab('audio')}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer text-center ${
              activeTab === 'audio'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Volume2 className="w-4 h-4 shrink-0" />
            <span
              style={{
                fontFamily: "'Pixelify Sans', sans-serif",
                fontSize: '13px',
                textAlign: 'center',
                textDecorationLine: 'none',
              }}
              className="truncate"
            >
              Audio & Efek Suara
            </span>
          </button>

          <button
            id="settings-tab-controls-btn"
            onClick={() => setActiveTab('controls')}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer text-center ${
              activeTab === 'controls'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Gamepad2 className="w-4 h-4 shrink-0" />
            <span
              style={{
                fontFamily: "'Pixelify Sans', sans-serif",
                fontSize: '13px',
              }}
              className="truncate"
            >
              Kontrol Permainan
            </span>
          </button>
        </div>

        {/* Tab Content Body with sleek custom scrollbar */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar pr-3 sm:pr-5">
          {/* TAB 1: MISI & OBJEKTIF */}
          {activeTab === 'quest' && (
            <div className="space-y-5">
              {/* Card Abadikan Momen */}
              {onCaptureMoment && (
                <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border border-amber-400/50 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-500/20 border border-amber-400/40 rounded-xl text-amber-300">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-300 text-xs sm:text-sm">
                        Abadikan Momen Petualangan
                      </h4>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        Ambil screenshot pemandangan game saat ini dengan bingkai dekoratif eksklusif Lembah Nada Rasa!
                      </p>
                    </div>
                  </div>
                  <button
                    id="settings-tab-capture-moment-btn"
                    onClick={onCaptureMoment}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs shrink-0 shadow transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Abadikan Sekarang</span>
                  </button>
                </div>
              )}

              {/* Status Wilayah Lembah */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  Status Pemulihan Warna Lembah
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className={`p-2.5 rounded-lg border flex flex-col items-center text-center ${effectiveZoneStatus.plaza ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-300' : 'bg-slate-900/80 border-slate-800 text-slate-400'}`}>
                    <span className="font-bold">Alun-Alun</span>
                    <span className="text-[10px] mt-1">{effectiveZoneStatus.plaza ? '✨ Berwarna' : '🌫️ Kelabu'}</span>
                  </div>
                  <div className={`p-2.5 rounded-lg border flex flex-col items-center text-center ${effectiveZoneStatus.bridge ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-300' : 'bg-slate-900/80 border-slate-800 text-slate-400'}`}>
                    <span className="font-bold">Jembatan Kayu</span>
                    <span className="text-[10px] mt-1">{effectiveZoneStatus.bridge ? '✨ Berwarna' : '🌫️ Kelabu'}</span>
                  </div>
                  <div className={`p-2.5 rounded-lg border flex flex-col items-center text-center ${effectiveZoneStatus.forest ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-300' : 'bg-slate-900/80 border-slate-800 text-slate-400'}`}>
                    <span className="font-bold">Hutan Sunyi</span>
                    <span className="text-[10px] mt-1">{effectiveZoneStatus.forest ? '✨ Berwarna' : '🌫️ Kelabu'}</span>
                  </div>
                  <div className={`p-2.5 rounded-lg border flex flex-col items-center text-center ${effectiveZoneStatus.tower ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-300' : 'bg-slate-900/80 border-slate-800 text-slate-400'}`}>
                    <span className="font-bold">Menara Jam</span>
                    <span className="text-[10px] mt-1">{effectiveZoneStatus.tower ? '✨ Berwarna' : '🌫️ Kelabu'}</span>
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
                  {effectiveQuests.map((q) => (
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
              {effectiveNpcs.length > 0 && (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Eksplorasi Warga Desa, Hutan, & Sungai
                    </h3>
                    <button
                      id="btn-open-people-guide-from-quest"
                      onClick={() => {
                        sound.playMenuSelect();
                        setSelectedVillagerForGuide(null);
                        setShowPeopleGuide(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto border border-amber-300/60 active:scale-95"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Buka Panduan Warga (People Guide)</span>
                    </button>
                  </div>

                  {/* Banner Info People Guide */}
                  <div className="p-3 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-200">
                          Buku Panduan Karakter & Kompas Emosi Warga
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Klik warga mana pun di bawah untuk membuka pop-up dialog profil, dinamika emosi, wawasan PSE, dan tips berdialog.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    {effectiveNpcs.map((npc) => (
                      <button
                        key={npc.id}
                        id={`btn-open-villager-profile-${npc.id}`}
                        onClick={() => {
                          sound.playMenuSelect();
                          setSelectedVillagerForGuide(npc.id);
                          setShowPeopleGuide(true);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between gap-2.5 group select-none hover:shadow-md ${
                          npc.isResolved
                            ? 'bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-400 hover:bg-emerald-950/40'
                            : 'bg-slate-950/50 border-slate-800 hover:border-amber-400/80 hover:bg-slate-900'
                        }`}
                        title={`Klik untuk membuka pop-up dialog profil ${npc.name}`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-200 flex items-center gap-1.5 group-hover:text-amber-300 transition">
                            <span>{npc.isResolved ? '✨' : '💬'}</span>
                            <span className="truncate">{npc.name}</span>
                            <span className="text-[10px] text-slate-400 font-normal shrink-0">({npc.role})</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                            {npc.isResolved ? (
                              <span className="text-emerald-400">✅ Hati terbuka & harmonis</span>
                            ) : (
                              <span className="text-amber-300/90 truncate">
                                Perlu didengar: Emosi "{npc.emotionProfile?.surfaceEmotion || 'resah'}"
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                              npc.isResolved
                                ? 'bg-emerald-900/60 text-emerald-300'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {npc.isResolved ? 'Selesai' : 'Profil'}
                          </span>
                          <span className="text-slate-400 group-hover:text-amber-300 group-hover:translate-x-0.5 transition">
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PENCAPAIAN / ACHIEVEMENTS */}
          {activeTab === 'achievements' && (
            <div className="space-y-5">
              {/* Header Progress Bar */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-slate-400 font-medium">Total Skor Empati & Wawasan</div>
                  <div className="text-xl font-bold text-amber-300 flex items-center gap-2 mt-0.5">
                    <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
                    <span>{effectiveEmpathy} Poin Empati</span>
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

              {/* All Badges Unlocked Special Banner & Action */}
              {unlockedCount === totalBadges ? (
                <div className="bg-gradient-to-r from-amber-950/60 via-amber-900/40 to-slate-950 border-2 border-amber-400 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl p-1.5 bg-amber-500/20 rounded-xl border border-amber-400/50">
                      👑
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-300 text-sm">
                        Pencapaian Agung: Seluruh 10 Lencana Terkumpul!
                      </h4>
                      <p className="text-xs text-amber-200/80 mt-0.5">
                        Gelar Duta Besar Empati Paripurna disematkan oleh Nenek Wilis dan seluruh warga desa.
                      </p>
                    </div>
                  </div>
                  {onOpenAllBadgesCelebration && (
                    <button
                      id="settings-open-appreciation-modal-btn"
                      onClick={() => {
                        onClose();
                        onOpenAllBadgesCelebration();
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 shadow transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Trophy className="w-4 h-4" />
                      <span>Buka Dialog Apresiasi</span>
                    </button>
                  )}
                </div>
              ) : (
                onUnlockAllBadges && (
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
                    <div className="text-slate-300 text-center sm:text-left">
                      💡 <span className="font-semibold text-amber-300">Uji Coba Pengembang / Guru:</span> Ingin melihat dialog apresiasi dan piagam 10 lencana langsung?
                    </div>
                    <button
                      id="unlock-all-badges-test-btn"
                      onClick={() => {
                        onUnlockAllBadges();
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs shrink-0 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Kumpulkan Semua (10/10)</span>
                    </button>
                  </div>
                )
              )}

              {/* Grid of PSE Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PSE_ACHIEVEMENTS.map((badge) => {
                  const isUnlocked = effectiveBadges.includes(badge.id);
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

          {/* TAB 3: AUDIO & EKSPOR OFFLINE */}
          {activeTab === 'audio' && (
            <div className="space-y-6">
              {/* Master Mute Card */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${isMuted ? 'bg-rose-950/60 text-rose-400' : 'bg-emerald-950/60 text-emerald-400'}`}>
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3
                      style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
                      className="font-bold text-sm text-slate-200"
                    >
                      Suara Game Keseluruhan
                    </h3>
                    <p
                      style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
                      className="text-xs text-slate-400 mt-0.5"
                    >
                      {isMuted ? 'Game sedang dalam mode senyap (bisu)' : 'Audio aktif dan terdengar'}
                    </p>
                  </div>
                </div>

                <button
                  id="settings-toggle-mute-btn"
                  onClick={toggleMute}
                  style={{ backgroundColor: '#ea093e' }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isMuted
                      ? 'hover:opacity-90 text-slate-950'
                      : 'hover:opacity-90 text-slate-950'
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
                    <span
                      style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
                      className="font-bold text-sm text-slate-200"
                    >
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

                <div className="flex justify-between items-center pt-1">
                  <span
                    style={{ fontSize: '13px' }}
                    className="text-slate-500 font-mono"
                  >
                    0% (Senyap) - 100% (Maks)
                  </span>
                  <button
                    id="settings-test-bgm-btn"
                    onClick={() => {
                      if (isMuted) setMuted(false);
                      playTestBgm();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-amber-400" />
                    <span style={{ fontFamily: 'Arial' }}>Uji Melodi BGM</span>
                  </button>
                </div>
              </div>

              {/* SFX Volume Slider */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                    <span
                      style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
                      className="font-bold text-sm text-slate-200"
                    >
                      Volume Efek Suara (SFX)
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-300">
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
                  className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />

                <div className="flex justify-between items-center pt-1">
                  <span
                    style={{ fontSize: '14px' }}
                    className="text-slate-500 font-mono"
                  >
                    0% (Bisu) - 100% (Maks)
                  </span>
                  <button
                    id="settings-test-sfx-btn"
                    onClick={() => {
                      if (isMuted) setMuted(false);
                      playTestSfx();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Uji Denting SFX</span>
                  </button>
                </div>
              </div>

              {/* 3 Fase Musik Latar Adaptif (Background Music) */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-amber-400" />
                    <span
                      style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
                      className="font-bold text-sm text-slate-200"
                    >
                      3 Fase Musik Latar Adaptif (BGM)
                    </span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-amber-950/80 text-amber-300 border border-amber-800/80">
                    {bgmPhase === 'fog'
                      ? '🌫️ Fase 1: Kabut Kelabu'
                      : bgmPhase === 'restoring'
                      ? '✨ Fase 2: Warna Kembali'
                      : '🌸 Fase 3: Lingkungan Pulih'}
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Musik latar berubah secara dinamis dan prosedural mengikuti kondisi emosi dan pemulihan warna di Lembah Nada Rasa:
                </p>

                <div className="grid grid-cols-1 gap-2.5 pt-1">
                  {/* Phase 1: Saat Masa Kabut Kelabu */}
                  <div
                    className={`p-3 rounded-xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      bgmPhase === 'fog'
                        ? 'bg-slate-900/90 border-cyan-500/50 shadow-sm shadow-cyan-500/10'
                        : 'bg-slate-950/40 border-slate-800/80'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🌫️</span>
                        <h4 className="text-xs font-bold text-slate-200">
                          Saat Masa Kabut Kelabu
                        </h4>
                        {bgmPhase === 'fog' && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-semibold">
                            Sedang Berjalan
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        Terasa hampa, misterius, dan sepi. Nada piano lambat yang bergema dan diredam lembut, hembusan angin pelan, dan dentingan pelan keheningan tanpa perkusi.
                      </p>
                    </div>

                    <button
                      id="test-bgm-phase-fog-btn"
                      onClick={() => {
                        if (isMuted) setMuted(false);
                        playTestBgmPhase('fog');
                      }}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-cyan-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
                    >
                      <Play className="w-3 h-3 text-cyan-400" />
                      <span>Uji Fase Kabut</span>
                    </button>
                  </div>

                  {/* Phase 2: Momen Warna Kembali */}
                  <div
                    className={`p-3 rounded-xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      bgmPhase === 'restoring'
                        ? 'bg-slate-900/90 border-amber-500/50 shadow-sm shadow-amber-500/10'
                        : 'bg-slate-950/40 border-slate-800/80'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base">✨</span>
                        <h4 className="text-xs font-bold text-slate-200">
                          Momen Warna Kembali
                        </h4>
                        {bgmPhase === 'restoring' && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-800 font-semibold animate-pulse">
                            Transisi Bersemi
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        Jembatan emosional saat misi selesai. Tempo naik bertahap, petikan gitar tunggal dan dentingan lonceng angin bersemi memulihkan desa.
                      </p>
                    </div>

                    <button
                      id="test-bgm-phase-restoring-btn"
                      onClick={() => {
                        if (isMuted) setMuted(false);
                        playTestBgmPhase('restoring');
                      }}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
                    >
                      <Play className="w-3 h-3 text-amber-400" />
                      <span>Uji Transisi Warna</span>
                    </button>
                  </div>

                  {/* Phase 3: Setelah Lingkungan Pulih */}
                  <div
                    className={`p-3 rounded-xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      bgmPhase === 'restored'
                        ? 'bg-slate-900/90 border-emerald-500/50 shadow-sm shadow-emerald-500/10'
                        : 'bg-slate-950/40 border-slate-800/80'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🌸</span>
                        <h4 className="text-xs font-bold text-slate-200">
                          Setelah Lingkungan Pulih
                        </h4>
                        {bgmPhase === 'restored' && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
                            Mekar Harmonis
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        Mekar penuh kehangatan, harapan, dan rasa syukur. Petikan gitar akustik yang ringan, tiupan seruling merdu gembira, dan melodi yang membangkitkan semangat.
                      </p>
                    </div>

                    <button
                      id="test-bgm-phase-restored-btn"
                      onClick={() => {
                        if (isMuted) setMuted(false);
                        playTestBgmPhase('restored');
                      }}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 hover:text-emerald-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
                    >
                      <Play className="w-3 h-3 text-emerald-400" />
                      <span>Uji Melodi Pulih</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Audio Presets */}
              <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span
                    style={{
                      fontSize: '13px',
                      fontFamily: "'Geist Pixel', 'Pixelify Sans', monospace, sans-serif",
                    }}
                  >
                    Preset Keseimbangan Cepat:
                  </span>
                  <button
                    id="settings-reset-audio-btn"
                    onClick={() => {
                      setBgmVolume(0.3);
                      setSfxVolume(0.65);
                      setMuted(false);
                    }}
                    className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Default</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <button
                    id="preset-balanced-btn"
                    onClick={() => {
                      setMuted(false);
                      setBgmVolume(0.65);
                      setSfxVolume(0.8);
                      playTestSfx();
                    }}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left transition cursor-pointer"
                  >
                    <span className="font-bold text-amber-300 block">🎮 Seimbang</span>
                    <span className="text-[10px] text-slate-400">BGM 65% / SFX 80%</span>
                  </button>
                  <button
                    id="preset-story-btn"
                    onClick={() => {
                      setMuted(false);
                      setBgmVolume(0.3);
                      setSfxVolume(0.9);
                      playTestSfx();
                    }}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left transition cursor-pointer"
                  >
                    <span className="font-bold text-cyan-300 block">🎧 Dialog Cerita</span>
                    <span className="text-[10px] text-slate-400">BGM 30% / SFX 90%</span>
                  </button>
                  <button
                    id="preset-ambient-btn"
                    onClick={() => {
                      setMuted(false);
                      setBgmVolume(0.85);
                      setSfxVolume(0.35);
                      playTestBgm();
                    }}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left transition cursor-pointer"
                  >
                    <span className="font-bold text-emerald-300 block">🍃 Santai Alami</span>
                    <span className="text-[10px] text-slate-400">BGM 85% / SFX 35%</span>
                  </button>
                  <button
                    id="preset-mute-btn"
                    onClick={() => setMuted(true)}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left transition cursor-pointer"
                  >
                    <span className="font-bold text-rose-300 block">🔇 Hening Total</span>
                    <span className="text-[10px] text-slate-400">Audio Bisu (0%)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PANDUAN KONTROL & SAINS PSE */}
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
                    <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-amber-300">W / A / S / D</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-300">Navigasi Titik Layar</span>
                    <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-amber-300">Klik / Ketuk Lantai</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-300">Interaksi / Bicara</span>
                    <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-amber-300">E</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-300">Lanjut / Lewati Teks Dialog</span>
                    <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-amber-300">Spasi</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-300">Pilih Opsi Dialog</span>
                    <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-amber-300">Angka 1 - 5</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-300">Kompas Resonansi Hati</span>
                    <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-amber-300">C</span>
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
                    <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-amber-300">O</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-300">Panduan Kontrol Cepat</span>
                    <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-amber-300">H</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-300">Abadikan Momen (Foto)</span>
                    <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-amber-300">P / Menu Settings</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-300">Tutup Dialog / Menu</span>
                    <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-amber-300">Esc</span>
                  </div>
                </div>
              </div>

              {/* Layar Sentuh Mobile */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4 text-cyan-400" />
                  Kontrol Layar Sentuh (Smartphone / Tablet)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    • <strong>Ketuk Lantai:</strong> Karakter langsung berjalan ke titik yang kamu ketuk
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    • <strong>Joystick Virtual Analog:</strong> Navigasi analog 360° yang mulus di sisi kiri layar (mendukung mode vertikal & horizontal)
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    • <strong>Tombol [AKSI]:</strong> Berinteraksi dengan warga desa, pohon, dan item
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    • <strong>Tombol [KOMPAS / HATI]:</strong> Mengaktifkan Kompas Hati untuk memindai emosi
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    • <strong>Tombol [MENU] Atas:</strong> Satu tombol ringkas untuk Peta, Regulasi, Jurnal, dan Pengaturan
                  </div>
                </div>
              </div>

              {/* Mode Developer (PIN Terproteksi: 12345) */}
              <div
                id="developer-mode-section"
                className="bg-gradient-to-br from-slate-950/95 via-slate-900/90 to-amber-950/40 p-4 rounded-xl border-2 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.12)]"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-amber-400" />
                    <span>Mode Developer (Akses Khusus)</span>
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center gap-1">
                    <KeyRound className="w-3 h-3 text-amber-400" />
                    PIN PROTECTED
                  </span>
                </div>

                <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                  Fitur pintasan pengembang & guru: langsung membuka{' '}
                  <strong className="text-amber-300">Mode Jelajah Bebas (Free Roam)</strong> dengan{' '}
                  <strong className="text-emerald-300">Pencapaian 100%</strong> (seluruh 10 Lencana PSE) serta{' '}
                  <strong className="text-emerald-300">Misi Utama 100%</strong> (seluruh 4 wilayah desa pulih).
                </p>

                {isFreeRoamActive ? (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-500/50 rounded-lg space-y-2.5">
                    <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Mode Developer & Jelajah Bebas 100% Sedang Aktif!</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                      <div className="p-1.5 rounded bg-slate-900/70 border border-emerald-900/50 flex items-center justify-between">
                        <span>Misi Utama:</span>
                        <span className="font-bold text-emerald-300">100% Selesai (4/4)</span>
                      </div>
                      <div className="p-1.5 rounded bg-slate-900/70 border border-emerald-900/50 flex items-center justify-between">
                        <span>Pencapaian PSE:</span>
                        <span className="font-bold text-emerald-300">100% (10 Lencana)</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        id="dev-mode-enter-world-btn"
                        onClick={onClose}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Masuk Langsung ke Jelajah Bebas</span>
                      </button>
                      <button
                        id="dev-mode-reapply-btn"
                        onClick={() => {
                          onActivateDeveloperMode?.();
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Sinkronkan Ulang 100%</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <div className="relative">
                        <input
                          id="dev-mode-pin-input"
                          type="password"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={5}
                          value={devPin}
                          onChange={(e) => {
                            setDevPin(e.target.value.replace(/\D/g, '').slice(0, 5));
                            setDevPinError(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleDevPinSubmit();
                          }}
                          placeholder="•••••"
                          className="w-36 sm:w-44 text-center font-mono text-xl tracking-[0.35em] font-bold bg-slate-900 border-2 border-amber-500/60 rounded-lg px-3 py-2 text-amber-300 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 shadow-inner"
                        />
                      </div>

                      <button
                        id="dev-mode-unlock-btn"
                        onClick={handleDevPinSubmit}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.35)] active:scale-[0.98]"
                      >
                        <KeyRound className="w-4 h-4 text-slate-950" />
                        <span>Buka Mode Developer</span>
                      </button>
                    </div>

                    {/* Virtual Numpad for Touchscreen / Mobile ease */}
                    <div className="pt-1">
                      <div className="text-[11px] text-slate-400 mb-1.5 flex items-center justify-between">
                        <span>Papan Tombol Angka:</span>
                      </div>
                      <div className="grid grid-cols-6 sm:grid-cols-12 gap-1 max-w-md">
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((digit) => (
                          <button
                            key={digit}
                            type="button"
                            onClick={() => {
                              if (devPin.length < 5) {
                                setDevPin((prev) => (prev + digit).slice(0, 5));
                                setDevPinError(null);
                              }
                            }}
                            className="p-1.5 text-center font-mono font-bold text-xs bg-slate-900 hover:bg-slate-800 active:bg-amber-500/30 text-amber-200 border border-slate-700 rounded transition cursor-pointer"
                          >
                            {digit}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            setDevPin((prev) => prev.slice(0, -1));
                            setDevPinError(null);
                          }}
                          title="Hapus satu angka"
                          className="p-1.5 text-center font-mono text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded transition cursor-pointer"
                        >
                          ⌫
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDevPin('');
                            setDevPinError(null);
                          }}
                          title="Kosongkan PIN"
                          className="p-1.5 text-center font-mono text-[10px] font-bold bg-slate-900 hover:bg-slate-800 text-rose-300 border border-slate-700 rounded transition cursor-pointer"
                        >
                          C
                        </button>
                      </div>
                    </div>

                    {devPinError && (
                      <div className="text-rose-400 text-xs flex items-center gap-1.5 bg-rose-950/50 border border-rose-800/60 p-2 rounded-lg">
                        <span>⚠️</span>
                        <span>{devPinError}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-800/80 border-t border-slate-700 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Lembah Nada Rasa • PSE Kelas 4</span>
          </span>
          <button
            id="settings-close-bottom-btn"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* People Guide Modal (Panduan Warga Desa & Pop-Up Dialog Profil Warga) */}
      <PeopleGuideModal
        isOpen={showPeopleGuide}
        onClose={() => {
          setShowPeopleGuide(false);
          setSelectedVillagerForGuide(null);
        }}
        npcs={effectiveNpcs}
        initialSelectedNpcId={selectedVillagerForGuide}
        onNavigateToTile={(tileX, tileY) => {
          setShowPeopleGuide(false);
          setSelectedVillagerForGuide(null);
          onClose();
          onNavigateToTile?.(tileX, tileY);
        }}
      />
    </div>
  );
};
