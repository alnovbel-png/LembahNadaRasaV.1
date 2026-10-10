import React, { useState, useEffect } from 'react';
import {
  X,
  Sliders,
  Volume2,
  VolumeX,
  Music,
  Play,
  RotateCcw,
  Gamepad2,
  Camera,
  MessageSquare,
  HelpCircle,
  BookOpen,
} from 'lucide-react';
import { useAudioSettings, sound } from '../utils/audio';
import { useLanguage } from '../game/localization';

export type SettingsModalTab = 'audio' | 'controls';

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: SettingsModalTab;
  isMuted?: boolean;
  onToggleMute?: () => void;
  onCaptureMoment?: () => void;
  onOpenTutorial?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'audio',
  onCaptureMoment,
  onOpenTutorial,
}) => {
  const { lang, toggleLang } = useLanguage();
  const [activeTab, setActiveTab] = useState<SettingsModalTab>(initialTab);

  const {
    masterVolume,
    bgmVolume,
    sfxVolume,
    voiceVolume,
    isMuted,
    setMasterVolume,
    setBgmVolume,
    setSfxVolume,
    setVoiceVolume,
    toggleMute,
    setMuted,
    playTestMaster,
    playTestSfx,
    playTestBgm,
    playTestVoice,
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

  const masterPercent = Math.round((masterVolume ?? 0.85) * 100);
  const bgmPercent = Math.round((bgmVolume ?? 0.65) * 100);
  const sfxPercent = Math.round((sfxVolume ?? 0.8) * 100);
  const voicePercent = Math.round((voiceVolume ?? 0.85) * 100);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-3 animate-backdrop-fade-in">
      <div className="bg-slate-900 border-2 border-amber-400/80 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden modal-glow-frame animate-fade-in-slide-up">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h2
              style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
              className="font-bold text-base text-amber-300 tracking-wide"
            >
              {lang === 'en' ? 'Game & Adventure Settings' : 'Pengaturan Game & Petualangan'}
            </h2>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-[9px] sm:text-[10px] font-pixel shadow-sm animate-pulse">
              <span>⏸️</span>
              <span>{lang === 'en' ? 'GAME PAUSED' : 'GAME DI-PAUSE'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Language Switcher Button */}
            <button
              id="settings-language-toggle-btn"
              onClick={toggleLang}
              className="px-2.5 py-1.5 rounded-xl border border-amber-400/80 bg-slate-950 hover:bg-slate-900 active:scale-95 text-amber-300 font-pixel text-[9px] sm:text-[10px] flex items-center gap-1.5 cursor-pointer shadow transition"
              title={lang === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
            >
              <span>🌐</span>
              <span className="font-bold">{lang === 'id' ? 'ID 🇮🇩' : 'EN 🇬🇧'}</span>
            </button>

            {onCaptureMoment && (
              <button
                id="settings-header-capture-moment-btn"
                onClick={onCaptureMoment}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 hover:scale-105 hover:shadow-[0_0_16px_rgba(245,158,11,0.6)] active:scale-95 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow transition-all duration-200 cursor-pointer"
                title={lang === 'en' ? 'Take screenshot of current area with decorative frame' : 'Ambil screenshot area game saat ini dengan bingkai dekoratif'}
              >
                <Camera className="w-4 h-4 text-slate-950" />
                <span>{lang === 'en' ? 'Capture Moment' : 'Abadikan Momen'}</span>
              </button>
            )}
            <button
              id="close-settings-btn"
              onClick={onClose}
              aria-label={lang === 'en' ? 'Close settings menu' : 'Tutup menu pengaturan'}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-rose-950/50 hover:scale-110 hover:shadow-[0_0_10px_rgba(244,63,94,0.4)] transition-all duration-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Submenu Grid - Clean 2-Column Layout for Audio and Controls */}
        <div className="grid grid-cols-2 gap-2 p-3 sm:p-3.5 bg-slate-950/90 border-b border-slate-800 shrink-0">
          <button
            id="settings-tab-audio-btn"
            onClick={() => setActiveTab('audio')}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 hover:scale-[1.03] cursor-pointer text-center ${
              activeTab === 'audio'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30 ring-2 ring-amber-400/50'
                : 'bg-slate-900/90 hover:bg-slate-800 hover:border-amber-400/50 hover:shadow-[0_0_14px_rgba(245,158,11,0.25)] text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Volume2 className="w-4 h-4 shrink-0" />
            <span
              style={{
                fontFamily: "'Pixelify Sans', sans-serif",
                fontSize: '13px',
              }}
              className="truncate"
            >
              {lang === 'en' ? 'Audio & Sound' : 'Audio & Efek Suara'}
            </span>
          </button>

          <button
            id="settings-tab-controls-btn"
            onClick={() => setActiveTab('controls')}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 hover:scale-[1.03] cursor-pointer text-center ${
              activeTab === 'controls'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30 ring-2 ring-amber-400/50'
                : 'bg-slate-900/90 hover:bg-slate-800 hover:border-amber-400/50 hover:shadow-[0_0_14px_rgba(245,158,11,0.25)] text-slate-300 hover:text-white border border-slate-800'
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
              {lang === 'en' ? 'Controls & Guide' : 'Kontrol Permainan'}
            </span>
          </button>
        </div>

        {/* Tab Content Body with sleek custom scrollbar */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar pr-3 sm:pr-5">
          {/* TAB 1: AUDIO & EFEK SUARA */}
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

              {/* 1. Volume Utama */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-purple-400" />
                    <span
                      style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
                      className="font-bold text-sm text-slate-200"
                    >
                      Volume Utama
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-purple-300">
                    {masterPercent}%
                  </span>
                </div>

                <input
                  id="settings-master-slider"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={masterVolume}
                  onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                  className="w-full accent-purple-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />

                <div className="flex justify-between items-center pt-1">
                  <span
                    style={{ fontSize: '13px' }}
                    className="text-slate-500 font-mono"
                  >
                    0% (Senyap) - 100% (Maksimal)
                  </span>
                  <button
                    id="settings-test-master-btn"
                    onClick={() => {
                      if (isMuted) setMuted(false);
                      playTestMaster();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-purple-400" />
                    <span>Uji Suara Utama</span>
                  </button>
                </div>
              </div>

              {/* 2. Volume Musik Latar */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-amber-400" />
                    <span
                      style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
                      className="font-bold text-sm text-slate-200"
                    >
                      Volume Musik Latar
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
                    0% (Senyap) - 100% (Maksimal)
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

              {/* 3. Volume Efek Suara (SFX) */}
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
                    0% (Bisu) - 100% (Maksimal)
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

              {/* 4. Volume Narasi */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span
                      style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
                      className="font-bold text-sm text-slate-200"
                    >
                      Volume Narasi
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-300">
                    {voicePercent}%
                  </span>
                </div>

                <input
                  id="settings-voice-slider"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={voiceVolume}
                  onChange={(e) => setVoiceVolume(parseFloat(e.target.value))}
                  className="w-full accent-emerald-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />

                <div className="flex justify-between items-center pt-1">
                  <span
                    style={{ fontSize: '13px' }}
                    className="text-slate-500 font-mono"
                  >
                    0% (Senyap) - 100% (Maksimal)
                  </span>
                  <button
                    id="settings-test-voice-btn"
                    onClick={() => {
                      if (isMuted) setMuted(false);
                      playTestVoice();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Uji Suara Narasi</span>
                  </button>
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
                      setMasterVolume(0.85);
                      setBgmVolume(0.65);
                      setSfxVolume(0.8);
                      setVoiceVolume(0.85);
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
                      setMasterVolume(0.85);
                      setBgmVolume(0.65);
                      setSfxVolume(0.8);
                      setVoiceVolume(0.85);
                      playTestSfx();
                    }}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left transition cursor-pointer"
                  >
                    <span className="font-bold text-amber-300 block">🎮 Seimbang</span>
                    <span className="text-[10px] text-slate-400">Utama 85% / BGM 65% / SFX 80% / Narasi 85%</span>
                  </button>
                  <button
                    id="preset-story-btn"
                    onClick={() => {
                      setMuted(false);
                      setMasterVolume(0.9);
                      setBgmVolume(0.3);
                      setSfxVolume(0.7);
                      setVoiceVolume(1.0);
                      playTestVoice();
                    }}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left transition cursor-pointer"
                  >
                    <span className="font-bold text-cyan-300 block">🎧 Dialog Cerita</span>
                    <span className="text-[10px] text-slate-400">BGM 30% / Narasi 100%</span>
                  </button>
                  <button
                    id="preset-ambient-btn"
                    onClick={() => {
                      setMuted(false);
                      setMasterVolume(0.85);
                      setBgmVolume(0.85);
                      setSfxVolume(0.35);
                      setVoiceVolume(0.75);
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

              {/* Interactive In-Game Tutorial Banner Card */}
              {onOpenTutorial && (
                <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 p-4 rounded-xl border border-emerald-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 shrink-0">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-emerald-200">
                          {lang === 'en' ? 'Interactive In-Game Tutorial' : 'Tutorial Interaktif Cara Bermain'}
                        </h4>
                        <span className="text-[9px] font-bold bg-emerald-900 text-emerald-200 border border-emerald-500/40 px-1.5 py-0.5 rounded">
                          5 LANGKAH
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        {lang === 'en'
                          ? 'Step-by-step illustrated walkthrough of controls, talking to villagers, Heart Compass, and emotion regulation.'
                          : 'Panduan bergambar langkah demi langkah: kontrol jalan, interaksi warga, Kompas Hati, dan regulasi emosi.'}
                      </p>
                    </div>
                  </div>
                  <button
                    id="settings-open-tutorial-btn"
                    onClick={() => {
                      sound.playMenuSelect();
                      onOpenTutorial();
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-slate-950 font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 border border-emerald-200"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{lang === 'en' ? 'Open Tutorial [H]' : 'Buka Tutorial [H]'}</span>
                  </button>
                </div>
              )}

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
                    • <strong>Tombol [MENU] Atas:</strong> Satu tombol ringkas untuk Peta, Pusat Informasi, dan Pengaturan
                  </div>
                </div>
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
    </div>
  );
};
