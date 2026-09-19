import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Users,
  Search,
  Sparkles,
  MapPin,
  Heart,
  BookOpen,
  ArrowRight,
  Footprints,
  Compass,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Brain,
  Smile,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { NPC, EmotionType } from '../types/game';
import { VILLAGER_GUIDE_DATA, VillagerGuideProfile } from '../game/villagerGuideData';
import { sound } from '../utils/audio';
import { CharacterPortrait } from './CharacterPortrait';

export interface PeopleGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  npcs?: NPC[];
  initialSelectedNpcId?: string | null;
  onNavigateToTile?: (tileX: number, tileY: number) => void;
}

export const PeopleGuideModal: React.FC<PeopleGuideModalProps> = ({
  isOpen,
  onClose,
  npcs = [],
  initialSelectedNpcId = null,
  onNavigateToTile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'main' | 'educator' | 'secret'>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'resolved' | 'unresolved'>('all');
  const [selectedNpcId, setSelectedNpcId] = useState<string | null>(initialSelectedNpcId);

  // Sync initial selection when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialSelectedNpcId) {
        setSelectedNpcId(initialSelectedNpcId);
      }
    } else {
      setSelectedNpcId(null);
    }
  }, [isOpen, initialSelectedNpcId]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedNpcId) {
          // If viewing profile popup, close profile popup first
          setSelectedNpcId(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedNpcId, onClose]);

  // Map of live NPC data from game state
  const liveNpcMap = useMemo(() => {
    const map = new Map<string, NPC>();
    npcs.forEach((n) => map.set(n.id, n));
    return map;
  }, [npcs]);

  // All profiles list
  const allProfiles = useMemo(() => {
    return Object.values(VILLAGER_GUIDE_DATA);
  }, []);

  // Filtered profiles
  const filteredProfiles = useMemo(() => {
    return allProfiles.filter((profile) => {
      const liveNpc = liveNpcMap.get(profile.id);
      const isResolved = liveNpc ? liveNpc.isResolved : false;

      // Category filter
      if (selectedCategory !== 'all' && profile.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (selectedStatusFilter === 'resolved' && !isResolved) return false;
      if (selectedStatusFilter === 'unresolved' && isResolved) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = profile.name.toLowerCase().includes(query);
        const matchesRole = profile.role.toLowerCase().includes(query);
        const matchesZone = profile.zoneName.toLowerCase().includes(query);
        const matchesPillar = profile.selConcept.pillar.toLowerCase().includes(query);
        return matchesName || matchesRole || matchesZone || matchesPillar;
      }

      return true;
    });
  }, [allProfiles, liveNpcMap, selectedCategory, selectedStatusFilter, searchQuery]);

  // Stats
  const totalCount = allProfiles.length;
  const resolvedCount = allProfiles.filter((p) => {
    const live = liveNpcMap.get(p.id);
    return live ? live.isResolved : false;
  }).length;
  const progressPercent = Math.round((resolvedCount / totalCount) * 100);

  // Selected profile for popup dialog
  const activeProfile = selectedNpcId ? VILLAGER_GUIDE_DATA[selectedNpcId] || null : null;
  const activeLiveNpc = selectedNpcId ? liveNpcMap.get(selectedNpcId) || null : null;

  if (!isOpen) return null;

  // Helper for pixel avatar rendering
  const renderAvatar = (sprite: string, size: 'sm' | 'md' | 'lg' = 'md', isResolved = false) => {
    return (
      <CharacterPortrait
        sprite={sprite}
        size={size}
        isResolved={isResolved}
      />
    );
  };

  // Helper for emotion badge styling
  const getEmotionBadge = (emotion: EmotionType) => {
    switch (emotion) {
      case 'marah':
        return { text: 'Marah', bg: 'bg-red-950/80 text-red-300 border-red-700/70', dot: 'bg-red-400' };
      case 'cemas':
        return { text: 'Cemas', bg: 'bg-amber-950/80 text-amber-300 border-amber-700/70', dot: 'bg-amber-400' };
      case 'sedih':
        return { text: 'Sedih', bg: 'bg-blue-950/80 text-blue-300 border-blue-700/70', dot: 'bg-blue-400' };
      case 'takut':
        return { text: 'Takut', bg: 'bg-purple-950/80 text-purple-300 border-purple-700/70', dot: 'bg-purple-400' };
      case 'kecewa':
        return { text: 'Kecewa', bg: 'bg-indigo-950/80 text-indigo-300 border-indigo-700/70', dot: 'bg-indigo-400' };
      case 'gembira':
        return { text: 'Gembira', bg: 'bg-yellow-950/80 text-yellow-300 border-yellow-700/70', dot: 'bg-yellow-400' };
      case 'haru':
        return { text: 'Haru', bg: 'bg-pink-950/80 text-pink-300 border-pink-700/70', dot: 'bg-pink-400' };
      case 'tenang':
      default:
        return { text: 'Tenang', bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/70', dot: 'bg-emerald-400' };
    }
  };

  const handleOpenVillagerProfile = (npcId: string) => {
    sound.playMenuSelect();
    setSelectedNpcId(npcId);
  };

  const handleCloseVillagerProfile = () => {
    sound.playMenuSelect();
    setSelectedNpcId(null);
  };

  const handleAutoWalkToVillager = (profile: VillagerGuideProfile) => {
    sound.playMenuSelect();
    if (onNavigateToTile) {
      onNavigateToTile(profile.locationCoordinates.x, profile.locationCoordinates.y);
      setSelectedNpcId(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-2 sm:p-4">
      {/* Main Container */}
      <div className="relative bg-slate-900 border-2 border-amber-400/90 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-800/95 border-b border-slate-700 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 border border-amber-400/50 rounded-xl text-amber-300 shadow">
              <Users className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
                  className="font-bold text-base sm:text-lg text-amber-300 tracking-wide"
                >
                  Panduan Warga Desa (People Guide)
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-700/60">
                  Lembah Nada Rasa
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 hidden sm:block">
                Buku catatan pengelana: Kenali profil warga, dinamika emosi, wawasan PSE, dan tips berdialog.
              </p>
            </div>
          </div>

          <button
            id="btn-close-people-guide-modal"
            onClick={() => {
              sound.playMenuSelect();
              onClose();
            }}
            aria-label="Tutup panduan warga desa"
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-700/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress & Quick Stats Banner */}
        <div className="p-3 sm:p-4 bg-slate-950/80 border-b border-slate-800 shrink-0">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Harmony Progress Indicator */}
            <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-700/80 rounded-xl p-2.5 sm:px-3.5 flex-1">
              <div className="p-2 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-emerald-300 shrink-0">
                <Heart className="w-4 h-4 fill-emerald-400 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300 truncate">Status Harmoni Warga Lembah:</span>
                  <span className="text-amber-300 font-bold ml-2">
                    {resolvedCount} / {totalCount} Terbantu ({progressPercent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-amber-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Search Input Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="input-search-villagers"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama, profesi, atau lokasi warga..."
                className="w-full pl-9 pr-8 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-400 transition"
              />
              {searchQuery && (
                <button
                  id="btn-clear-villager-search"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-800/80">
            {/* Category Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 mr-1 hidden sm:inline">Kategori:</span>
              <button
                id="btn-filter-category-all"
                onClick={() => {
                  sound.playMenuSelect();
                  setSelectedCategory('all');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                Semua ({totalCount})
              </button>
              <button
                id="btn-filter-category-main"
                onClick={() => {
                  sound.playMenuSelect();
                  setSelectedCategory('main');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedCategory === 'main'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                Kisah Utama (4)
              </button>
              <button
                id="btn-filter-category-educator"
                onClick={() => {
                  sound.playMenuSelect();
                  setSelectedCategory('educator');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedCategory === 'educator'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                Pembimbing PSE (8)
              </button>
              <button
                id="btn-filter-category-secret"
                onClick={() => {
                  sound.playMenuSelect();
                  setSelectedCategory('secret');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedCategory === 'secret'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                Rahasia Unik (1)
              </button>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-[11px] font-bold text-slate-400 mr-1 hidden sm:inline">Status:</span>
              <button
                id="btn-filter-status-all"
                onClick={() => {
                  sound.playMenuSelect();
                  setSelectedStatusFilter('all');
                }}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                  selectedStatusFilter === 'all'
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Semua
              </button>
              <button
                id="btn-filter-status-resolved"
                onClick={() => {
                  sound.playMenuSelect();
                  setSelectedStatusFilter('resolved');
                }}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                  selectedStatusFilter === 'resolved'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                    : 'text-slate-400 hover:text-emerald-300'
                }`}
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Harmonis ({resolvedCount})</span>
              </button>
              <button
                id="btn-filter-status-unresolved"
                onClick={() => {
                  sound.playMenuSelect();
                  setSelectedStatusFilter('unresolved');
                }}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                  selectedStatusFilter === 'unresolved'
                    ? 'bg-amber-950 text-amber-300 border border-amber-600'
                    : 'text-slate-400 hover:text-amber-300'
                }`}
              >
                <AlertCircle className="w-3 h-3 text-amber-400" />
                <span>Perlu Didengar ({totalCount - resolvedCount})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Villagers Cards Grid Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          {filteredProfiles.length === 0 ? (
            <div className="text-center py-12 px-4 bg-slate-950/40 border border-slate-800 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto text-slate-400 mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-200">Tidak ada warga yang cocok</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Coba gunakan kata kunci pencarian lain atau setel ulang filter kategori dan status di atas.
              </p>
              <button
                id="btn-reset-filters"
                onClick={() => {
                  sound.playMenuSelect();
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedStatusFilter('all');
                }}
                className="mt-4 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-bold transition cursor-pointer inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filter</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredProfiles.map((profile) => {
                const live = liveNpcMap.get(profile.id);
                const isResolved = live ? live.isResolved : false;
                const currentSurfaceEmotion = live
                  ? live.emotionProfile.surfaceEmotion
                  : profile.surfaceEmotion.type;
                const emotionBadge = getEmotionBadge(currentSurfaceEmotion);

                return (
                  <div
                    key={profile.id}
                    id={`villager-card-${profile.id}`}
                    onClick={() => handleOpenVillagerProfile(profile.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleOpenVillagerProfile(profile.id);
                      }
                    }}
                    className={`group relative rounded-2xl border p-4 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between select-none ${
                      isResolved
                        ? 'bg-slate-950/70 border-emerald-500/40 hover:border-emerald-400 hover:bg-slate-950 shadow-sm hover:shadow-emerald-500/10'
                        : 'bg-slate-950/80 border-slate-800 hover:border-amber-400/80 hover:bg-slate-950 shadow-sm hover:shadow-amber-400/10'
                    }`}
                  >
                    <div>
                      {/* Top Row: Avatar & Status Badges */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          {renderAvatar(profile.sprite, 'md', isResolved)}
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-bold text-sm text-slate-100 group-hover:text-amber-300 transition">
                                {profile.name}
                              </h3>
                              {isResolved ? (
                                <span title="Telah Harmonis">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-950 shrink-0" />
                                </span>
                              ) : (
                                <span title="Sedang Mengalami Pergolakan Emosi">
                                  <AlertCircle className="w-4 h-4 text-amber-400 fill-amber-950 shrink-0 animate-pulse" />
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-amber-200/80 font-medium line-clamp-1 mt-0.5">
                              {profile.role}
                            </p>
                          </div>
                        </div>

                        {/* Category Tag */}
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                          {profile.categoryLabel}
                        </span>
                      </div>

                      {/* Location Badge */}
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-2.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
                        <span className="truncate">{profile.zoneName}</span>
                      </div>

                      {/* Bio snippet */}
                      <p className="text-xs text-slate-300/90 line-clamp-2 leading-relaxed mb-3">
                        {profile.bio}
                      </p>
                    </div>

                    {/* Footer Row: Emotion Pill & Open Action */}
                    <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-auto">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${emotionBadge.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${emotionBadge.dot}`} />
                          <span>{isResolved ? 'Harmonis' : emotionBadge.text}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-bold text-amber-400 group-hover:text-amber-300 group-hover:translate-x-0.5 transition">
                        <span>Lihat Profil</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Klik profil warga mana pun untuk membuka pop-up dialog detail karakter, wawasan PSE, dan panduan dialog empati.</span>
          </div>
          <button
            id="btn-footer-close-people-guide"
            onClick={() => {
              sound.playMenuSelect();
              onClose();
            }}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer shrink-0"
          >
            Tutup Panduan
          </button>
        </div>

        {/* ========================================================================= */}
        {/* POP-UP DIALOG PROFIL WARGA DESA (DETAILED MODAL POPUP) */}
        {/* ========================================================================= */}
        {activeProfile && (
          <div
            id="villager-profile-dialog-overlay"
            className="absolute inset-0 z-30 bg-slate-950/95 backdrop-blur-md flex flex-col animate-fadeIn"
          >
            {/* Dialog Header */}
            <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-700 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-xs text-amber-300 font-bold">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Pop-Up Dialog Profil Warga Desa</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300">{activeProfile.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  id="btn-dialog-back-to-guide"
                  onClick={handleCloseVillagerProfile}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Daftar Warga</span>
                </button>
                <button
                  id="btn-dialog-close-x"
                  onClick={handleCloseVillagerProfile}
                  aria-label="Tutup dialog profil warga"
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700/60 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Dialog Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar pr-3 sm:pr-5">
              {/* Profile Main Card */}
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-400/80 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {renderAvatar(activeProfile.sprite, 'lg', activeLiveNpc?.isResolved)}
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2
                        style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
                        className="text-xl sm:text-2xl font-bold text-amber-300"
                      >
                        {activeProfile.name}
                      </h2>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-amber-950 text-amber-300 border border-amber-700">
                        {activeProfile.categoryLabel}
                      </span>
                      {activeLiveNpc?.isResolved ? (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>✨ Harmonis & Hati Terbuka</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-amber-400" />
                          <span>💬 Perlu Pendampingan Empatik</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 font-semibold mt-1">
                      {activeProfile.role}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{activeProfile.zoneName}</span>
                      <span>•</span>
                      <span className="font-mono text-[11px] text-amber-300/80">
                        Ubin (X: {activeProfile.locationCoordinates.x}, Y: {activeProfile.locationCoordinates.y})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Auto-walk CTA */}
                {onNavigateToTile && (
                  <button
                    id="btn-dialog-autowalk-villager"
                    onClick={() => handleAutoWalkToVillager(activeProfile)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md active:scale-95 transition cursor-pointer flex items-center justify-center gap-2 shrink-0 border border-emerald-400/60"
                    title="Arahkan langkah karakter berjalan otomatis menuju koordinat warga ini di peta desa"
                  >
                    <Footprints className="w-4 h-4 text-emerald-200" />
                    <span>Jalan Menuju Warga Ini (Auto-Walk)</span>
                  </button>
                )}
              </div>

              {/* Kutipan Khas Warga Callout */}
              <div className="bg-amber-950/30 border-l-4 border-amber-400 p-3.5 rounded-r-xl text-amber-200 text-xs sm:text-sm italic flex items-center gap-3">
                <span className="text-2xl select-none">💬</span>
                <p className="leading-relaxed">{activeProfile.favoriteQuote}</p>
              </div>

              {/* Grid: Latar Belakang & Lokasi */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Latar Belakang & Biodata */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    Kisah Hidup & Karakter
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeProfile.bio}
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">Kepribadian Khas: </span>
                    {activeProfile.personality}
                  </div>
                </div>

                {/* Petunjuk Arah & Lokasi */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-amber-400" />
                    Lokasi & Rute Perjalanan
                  </h4>
                  <div className="text-xs text-slate-300 leading-relaxed space-y-2">
                    <p>
                      <strong>Wilayah:</strong> {activeProfile.zoneName}
                    </p>
                    <p>
                      <strong>Petunjuk Rute:</strong> {activeProfile.locationHint}
                    </p>
                    <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-[11px] text-amber-200/90">
                      💡 <em>Tips Petualang:</em> Kamu juga dapat membuka Peta Mini (tombol <strong>M</strong>) dan mengklik ubin wilayah mereka untuk bernavigasi cepat.
                    </div>
                  </div>
                </div>
              </div>

              {/* Bedah Kompas Emosi (Surface vs Deep Emotion) */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 sm:p-5">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-400" />
                  Dinamika Emosi: Lapisan Luar & Lubuk Hati Terdalam
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-3.5">
                  {/* Surface Emotion */}
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        1. Emosi Permukaan (Tampak Luar)
                      </span>
                      {(() => {
                        const b = getEmotionBadge(activeProfile.surfaceEmotion.type);
                        return (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${b.bg}`}>
                            {b.text}
                          </span>
                        );
                      })()}
                    </div>
                    <div className="font-bold text-sm text-slate-100 mb-1">
                      {activeProfile.surfaceEmotion.label}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {activeProfile.surfaceEmotion.description}
                    </p>
                  </div>

                  {/* Deep Emotion */}
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        2. Emosi Mendalam (Lubuk Hati)
                      </span>
                      {(() => {
                        const b = getEmotionBadge(activeProfile.deepEmotion.type);
                        return (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${b.bg}`}>
                            {b.text}
                          </span>
                        );
                      })()}
                    </div>
                    <div className="font-bold text-sm text-slate-100 mb-1">
                      {activeProfile.deepEmotion.label}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {activeProfile.deepEmotion.description}
                    </p>
                  </div>
                </div>

                {/* Story Reason Root Cause */}
                <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl text-xs text-slate-200">
                  <span className="font-bold text-amber-300">Akar Persoalan: </span>
                  <span>{activeProfile.storyReason}</span>
                </div>
              </div>

              {/* Pembelajaran Sosial-Emosional (PSE / SEL) & Teknik Regulasi */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Wawasan PSE / SEL */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                        <Brain className="w-4 h-4 text-sky-400" />
                        Wawasan Pembelajaran Sosial-Emosional (PSE)
                      </h4>
                    </div>
                    <span className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-700/80 mb-2">
                      {activeProfile.selConcept.pillar}
                    </span>
                    <h5 className="text-xs sm:text-sm font-bold text-slate-200 mb-1.5">
                      {activeProfile.selConcept.title}
                    </h5>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {activeProfile.selConcept.insight}
                    </p>
                  </div>
                </div>

                {/* Teknik Menenangkan Diri / Calm Technique */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Smile className="w-4 h-4 text-emerald-400" />
                    Teknik Regulasi Emosi yang Dianjurkan
                  </h4>
                  <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-emerald-300 mb-1">
                    <span className="text-lg">{activeProfile.calmTechnique.icon}</span>
                    <span>{activeProfile.calmTechnique.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-2.5">
                    {activeProfile.calmTechnique.summary}
                  </p>
                  <div className="space-y-1.5">
                    {activeProfile.calmTechnique.steps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <span className="w-4 h-4 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-snug">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Panduan Dialog & Pendekatan Empati */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  Tips Dialog & Pendekatan Berempati
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* DOs */}
                  <div className="p-3 bg-emerald-950/20 border border-emerald-600/30 rounded-xl space-y-1.5">
                    <div className="font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Sikap yang Dianjurkan (Do's)</span>
                    </div>
                    {activeProfile.dialogueTips.dos.map((item, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-slate-300">
                        <span className="text-emerald-400 shrink-0">•</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* DONTs */}
                  <div className="p-3 bg-rose-950/20 border border-rose-600/30 rounded-xl space-y-1.5">
                    <div className="font-bold text-rose-400 flex items-center gap-1.5 mb-1">
                      <X className="w-3.5 h-3.5" />
                      <span>Hal yang Perlu Dihindari (Don'ts)</span>
                    </div>
                    {activeProfile.dialogueTips.donts.map((item, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-slate-300">
                        <span className="text-rose-400 shrink-0">•</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Dialog Footer Action */}
            <div className="px-5 py-3.5 bg-slate-900 border-t border-slate-700 flex items-center justify-between gap-3 shrink-0">
              <button
                id="btn-dialog-back-to-list-bottom"
                onClick={handleCloseVillagerProfile}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
              >
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                <span>Kembali ke Panduan Warga</span>
              </button>

              <div className="flex items-center gap-2">
                {onNavigateToTile && (
                  <button
                    id="btn-dialog-footer-autowalk"
                    onClick={() => handleAutoWalkToVillager(activeProfile)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow"
                  >
                    <Footprints className="w-3.5 h-3.5" />
                    <span>Berjalan ke Lokasi Warga</span>
                  </button>
                )}
                <button
                  id="btn-dialog-footer-close"
                  onClick={handleCloseVillagerProfile}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition cursor-pointer"
                >
                  Tutup Profil
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
