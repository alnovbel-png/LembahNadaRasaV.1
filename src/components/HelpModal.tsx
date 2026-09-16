import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  Compass,
  Heart,
  Award,
  Sparkles,
  Download,
  Volume2,
  VolumeX,
  Music,
  Sliders,
  Play,
  RotateCcw,
} from 'lucide-react';
import { useAudioSettings } from '../utils/audio';

export type HelpModalTab = 'audio' | 'guide' | 'science';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportOffline: () => void;
  initialTab?: HelpModalTab;
}

export const HelpModal: React.FC<HelpModalProps> = ({
  isOpen,
  onClose,
  onExportOffline,
  initialTab = 'audio',
}) => {
  const [activeTab, setActiveTab] = useState<HelpModalTab>(initialTab);
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

  // Synchronize initialTab when opened
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const bgmPercent = Math.round(bgmVolume * 100);
  const sfxPercent = Math.round(sfxVolume * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-3">
      <div className="bg-slate-900 border-2 border-amber-400/80 rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-base text-amber-300">
              Pengaturan & Panduan Petualangan
            </h2>
          </div>
          <button
            id="close-help-btn"
            onClick={onClose}
            aria-label="Tutup menu pengaturan"
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/60 px-3 pt-2 gap-1.5 overflow-x-auto">
          <button
            id="tab-audio-btn"
            onClick={() => setActiveTab('audio')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-t-xl text-xs sm:text-sm font-semibold transition border-b-2 ${
              activeTab === 'audio'
                ? 'bg-slate-900 text-amber-300 border-amber-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/50'
            }`}
          >
            <Volume2 className="w-4 h-4 text-amber-400" />
            <span>Pengaturan Audio</span>
          </button>

          <button
            id="tab-guide-btn"
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-t-xl text-xs sm:text-sm font-semibold transition border-b-2 ${
              activeTab === 'guide'
                ? 'bg-slate-900 text-amber-300 border-amber-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/50'
            }`}
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>Panduan & Kontrol</span>
          </button>

          <button
            id="tab-science-btn"
            onClick={() => setActiveTab('science')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-t-xl text-xs sm:text-sm font-semibold transition border-b-2 ${
              activeTab === 'science'
                ? 'bg-slate-900 text-amber-300 border-amber-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/50'
            }`}
          >
            <Award className="w-4 h-4 text-rose-400" />
            <span>Sains PSE</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-200">
          {/* TAB 1: AUDIO SETTINGS */}
          {activeTab === 'audio' && (
            <div className="space-y-4">
              {/* Master Mute Status Banner */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between transition ${
                  isMuted
                    ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                    : 'bg-slate-800/60 border-slate-700 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-2 rounded-lg ${
                      isMuted ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm">
                      {isMuted ? 'Audio Dibisukan (Muted)' : 'Audio Aktif (Unmuted)'}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {isMuted
                        ? 'Semua suara & musik saat ini dinonaktifkan.'
                        : 'Atur keseimbangan volume musik latar dan efek suara di bawah.'}
                    </p>
                  </div>
                </div>

                <button
                  id="toggle-master-mute-btn"
                  onClick={toggleMute}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    isMuted
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md'
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600'
                  }`}
                >
                  {isMuted ? (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Aktifkan Suara</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>Bisu Semua</span>
                    </>
                  )}
                </button>
              </div>

              {/* Slider 1: Ambient Music Volume (BGM) */}
              <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-3.5 sm:p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                      <Music className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-300 text-xs sm:text-sm">
                        Musik Latar & Suasana (Ambient BGM)
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Melodi pentatonik lembut untuk rasa tenang dan konsentrasi
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`font-pixel text-[10px] px-2 py-1 rounded border ${
                        bgmPercent === 0 || isMuted
                          ? 'bg-slate-800 text-slate-500 border-slate-700'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      {isMuted ? 'BISU' : `${bgmPercent}%`}
                    </span>
                    <button
                      id="test-bgm-btn"
                      onClick={() => {
                        if (isMuted) setMuted(false);
                        playTestBgm();
                      }}
                      title="Tes melodi musik latar"
                      className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-amber-300 transition cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Slider Input */}
                <div className="space-y-1.5">
                  <input
                    id="bgm-volume-slider"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={isMuted ? 0 : bgmPercent}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (isMuted && val > 0) setMuted(false);
                      setBgmVolume(val / 100);
                    }}
                    className="w-full h-2.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>0% (Senyap)</span>
                    <span>50%</span>
                    <span>100% (Maksimal)</span>
                  </div>
                </div>
              </div>

              {/* Slider 2: Sound Effects Volume (SFX) */}
              <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-3.5 sm:p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-cyan-300 text-xs sm:text-sm">
                        Efek Suara Karakter & Aksi (SFX)
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Denting kompas hati, dialog bicara, langkah kaki, dan lencana
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`font-pixel text-[10px] px-2 py-1 rounded border ${
                        sfxPercent === 0 || isMuted
                          ? 'bg-slate-800 text-slate-500 border-slate-700'
                          : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      }`}
                    >
                      {isMuted ? 'BISU' : `${sfxPercent}%`}
                    </span>
                    <button
                      id="test-sfx-btn"
                      onClick={() => {
                        if (isMuted) setMuted(false);
                        playTestSfx();
                      }}
                      title="Tes efek suara SFX"
                      className="px-2 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-cyan-300 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Play className="w-3 h-3" />
                      <span>Tes SFX</span>
                    </button>
                  </div>
                </div>

                {/* Slider Input */}
                <div className="space-y-1.5">
                  <input
                    id="sfx-volume-slider"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={isMuted ? 0 : sfxPercent}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (isMuted && val > 0) setMuted(false);
                      setSfxVolume(val / 100);
                    }}
                    onMouseUp={playTestSfx}
                    onTouchEnd={playTestSfx}
                    className="w-full h-2.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>0% (Bisu)</span>
                    <span>50%</span>
                    <span>100% (Maksimal)</span>
                  </div>
                </div>
              </div>

              {/* Presets */}
              <div className="bg-slate-800/40 border border-slate-700/80 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                    Pilihan Keseimbangan Cepat (Presets):
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    id="preset-balanced-btn"
                    onClick={() => {
                      setMuted(false);
                      setBgmVolume(0.65);
                      setSfxVolume(0.8);
                      playTestSfx();
                    }}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition text-xs cursor-pointer"
                  >
                    <span className="font-bold text-amber-300 block">🎮 Seimbang</span>
                    <span className="text-[10px] text-slate-400">Musik 65%, SFX 80%</span>
                  </button>

                  <button
                    id="preset-story-btn"
                    onClick={() => {
                      setMuted(false);
                      setBgmVolume(0.3);
                      setSfxVolume(0.9);
                      playTestSfx();
                    }}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition text-xs cursor-pointer"
                  >
                    <span className="font-bold text-cyan-300 block">🎧 Dialog & Cerita</span>
                    <span className="text-[10px] text-slate-400">Musik 30%, SFX 90%</span>
                  </button>

                  <button
                    id="preset-ambient-btn"
                    onClick={() => {
                      setMuted(false);
                      setBgmVolume(0.85);
                      setSfxVolume(0.35);
                      playTestBgm();
                    }}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition text-xs cursor-pointer"
                  >
                    <span className="font-bold text-emerald-300 block">🍃 Suasana Santai</span>
                    <span className="text-[10px] text-slate-400">Musik 85%, SFX 35%</span>
                  </button>

                  <button
                    id="preset-mute-btn"
                    onClick={() => {
                      setMuted(true);
                    }}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition text-xs cursor-pointer"
                  >
                    <span className="font-bold text-rose-300 block">🔇 Hening Total</span>
                    <span className="text-[10px] text-slate-400">Semua Bisu (0%)</span>
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 italic text-center">
                ✨ Pengaturan volume disimpan secara otomatis di peramban ini dan disintesis 100% offline via Web Audio API.
              </p>
            </div>
          )}

          {/* TAB 2: GAME GUIDE & CONTROLS */}
          {activeTab === 'guide' && (
            <div className="space-y-4">
              <section className="space-y-2">
                <h3 className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-amber-400" />
                  Tujuan & Mekanik Utama Game
                </h3>
                <p className="text-slate-300 leading-relaxed text-xs">
                  Kamu menjelajahi <strong>Lembah Nada Rasa</strong> yang kehilangan warnanya akibat kabut
                  kesalahpahaman. Gunakan <strong>Kompas Resonansi Emosi [Spasi]</strong> untuk melihat lapisan
                  perasaan terdalam dari karakter. Setiap kali kamu membantu warga mengenali dan meregulasi
                  emosinya, warna dan harmoni kawasan tersebut akan pulih!
                </p>
              </section>

              <section className="bg-slate-800/60 border border-slate-700 rounded-xl p-3 space-y-2">
                <h3 className="font-bold text-cyan-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  Kontrol Permainan
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-1">
                    <span className="font-bold text-amber-300 block">Keyboard & Mouse:</span>
                    <div>• Klik Lantai: Jalan otomatis ke titik target</div>
                    <div>• WASD / Panah: Berjalan manual</div>
                    <div>• [E] / Enter / Klik NPC: Bicara & Interaksi</div>
                    <div>• [Spasi]: Nyalakan Kompas Hati</div>
                    <div>• [R]: Studio Regulasi Emosi (4 Mode Interaktif)</div>
                    <div>• [M]: Buka / Tutup Peta Mini</div>
                    <div>• [J]: Buka Jurnal PSE & Tas</div>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-1">
                    <span className="font-bold text-amber-300 block">Layar Sentuh (Ponsel/Tablet):</span>
                    <div>• Ketuk Lantai: Berjalan langsung ke titik ketuk</div>
                    <div>• D-Pad kiri: Navigasi arah manual</div>
                    <div>• Tombol A: Bicara / Interaksi</div>
                    <div>• Tombol HATI: Kompas Resonansi</div>
                    <div>• Header: Peta, Jurnal, dan Pengaturan Suara</div>
                  </div>
                </div>
              </section>

              <section className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-xs text-emerald-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    Mainkan Tanpa Internet (Offline)
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Unduh game dalam satu berkas HTML yang bisa disimpan di flashdisk sekolah dan dimainkan kapan saja!
                  </p>
                </div>
                <button
                  id="help-download-offline-btn"
                  onClick={() => {
                    onExportOffline();
                    onClose();
                  }}
                  className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shrink-0 flex items-center gap-1.5 shadow cursor-pointer transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh File HTML</span>
                </button>
              </section>
            </div>
          )}

          {/* TAB 3: PSE SCIENCE */}
          {activeTab === 'science' && (
            <div className="space-y-3">
              <h3 className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                Sains Pembelajaran Sosial Emosional (PSE)
              </h3>
              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                  <strong className="text-amber-200 block mb-1">1. Otak Amigdala vs Korteks Prefrontal:</strong>
                  Saat kita cemas atau marah, amigdala bertindak seperti alarm darurat. Melakukan napas berirama (4-4-4)
                  mengalirkan oksigen segar agar korteks prefrontal dapat berpikir jernih kembali.
                </div>
                <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                  <strong className="text-amber-200 block mb-1">2. Lapisan Emosi Gunung Es:</strong>
                  Kemarahan seringkali adalah selimut luar dari perasaan sedih, takut, atau rasa tidak dihargai yang
                  tersembunyi di kedalaman hati seseorang.
                </div>
                <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                  <strong className="text-amber-200 block mb-1">3. Validasi Perasaan:</strong>
                  Mengakui perasaan orang lain ("Wajar kamu merasa sedih/kecewa") membuat mereka merasa dihargai
                  dan mempermudah komunikasi solutif.
                </div>
                <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/40">
                  <strong className="text-cyan-300 block mb-1">4. 4 Pilar Regulasi Emosi Interaktif [R]:</strong>
                  <div>• <strong>Napas Balon 4-4-4:</strong> Menstimulasi saraf parasimpatis untuk menurunkan denyut jantung.</div>
                  <div>• <strong>Grounding 5-4-3-2-1:</strong> Menyelaraskan 5 indera menghentikan kepanikan amigdala.</div>
                  <div>• <strong>Rem Otak S-T-O-P:</strong> Jeda darurat (Stop, Take breath, Observe, Proceed) untuk mencegah aksi impulsif.</div>
                  <div>• <strong>Lepas Ketegangan:</strong> Goyangan kinestetik yang meluruhkan hormon kortisol di otot.</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-800/80 border-t border-slate-700 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 hidden sm:block">
            {activeTab === 'audio'
              ? `Musik: ${isMuted ? 'Muted' : `${bgmPercent}%`} | SFX: ${isMuted ? 'Muted' : `${sfxPercent}%`}`
              : 'Ekspedisi Kompas Hati • PSE'}
          </div>
          <button
            id="help-understood-btn"
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition cursor-pointer ml-auto"
          >
            Lanjut Petualangan
          </button>
        </div>
      </div>
    </div>
  );
};

