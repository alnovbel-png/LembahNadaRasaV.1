import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Download,
  Copy,
  Check,
  Printer,
  RefreshCw,
  X,
  Sparkles,
  Heart,
  Compass,
  Award,
  Share2,
  Palette,
  MapPin,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { PlayerStats, ZoneColorStatus } from '../types/game';
import { sound } from '../utils/audio';
import { useLanguage } from '../game/localization';

export type FrameTheme = 'postcard' | 'polaroid' | 'golden_plaque';

interface CaptureMomentModalProps {
  isOpen: boolean;
  onClose: () => void;
  screenshotDataUrl: string | null;
  locationName: string;
  stats: PlayerStats;
  zoneStatus: ZoneColorStatus;
  onRetake?: () => void;
}

const DEFAULT_QUOTES_ID = [
  '“Mendengarkan dengan hati, merangkul setiap rasa, dan bertumbuh bersama.”',
  '“Ketenangan sejati bermula dari lingkaran kendali batin kita sendiri.”',
  '“Tidak ada emosi yang salah; kenali dan peluk setiap rasanya.”',
  '“Senyuman tulus dan rasa syukur melipatgandakan kebahagiaan.”',
  '“Belajar dari kegagalan adalah benih terindah menuju keberhasilan.”',
];

const DEFAULT_QUOTES_EN = [
  '“Listening with heart, embracing every feeling, and growing together.”',
  '“True peace begins from our own inner circle of control.”',
  '“There is no wrong emotion; recognize and embrace every sensation.”',
  '“A sincere smile and grateful heart multiply genuine joy.”',
  '“Learning through mistakes is the finest seed of wisdom.”',
];

export const CaptureMomentModal: React.FC<CaptureMomentModalProps> = ({
  isOpen,
  onClose,
  screenshotDataUrl,
  locationName,
  stats,
  zoneStatus,
  onRetake,
}) => {
  const { lang, ui } = useLanguage();
  const defaultQuotes = lang === 'en' ? DEFAULT_QUOTES_EN : DEFAULT_QUOTES_ID;
  const [frameTheme, setFrameTheme] = useState<FrameTheme>('postcard');
  const [caption, setCaption] = useState(defaultQuotes[0]);
  const [authorName, setAuthorName] = useState('Ezzel');
  const [showStats, setShowStats] = useState(true);
  const [showStickers, setShowStickers] = useState(true);
  const [copied, setCopied] = useState(false);
  const [compositeUrl, setCompositeUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sound effect on modal opening
  useEffect(() => {
    if (isOpen) {
      sound.playCameraShutter();
    }
  }, [isOpen]);

  // Sync default quote if lang changes and user hasn't heavily customized
  useEffect(() => {
    if (lang === 'en') {
      if (DEFAULT_QUOTES_ID.includes(caption)) {
        setCaption(DEFAULT_QUOTES_EN[0]);
      }
    } else {
      if (DEFAULT_QUOTES_EN.includes(caption)) {
        setCaption(DEFAULT_QUOTES_ID[0]);
      }
    }
  }, [lang]);

  // Current formatted timestamp
  const captureDateStr = new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const totalZones = 4;
  const coloredZonesCount =
    (zoneStatus.plaza ? 1 : 0) +
    (zoneStatus.bridge ? 1 : 0) +
    (zoneStatus.forest ? 1 : 0) +
    (zoneStatus.tower ? 1 : 0);
  const harmonyPercent = Math.round((coloredZonesCount / totalZones) * 100);
  const badgesCount = stats.unlockedBadges ? stats.unlockedBadges.length : 0;

  // Generate composite high-resolution canvas image with decorative overlay
  const renderComposite = useCallback(() => {
    if (!screenshotDataUrl) return;
    setIsGenerating(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const srcW = img.naturalWidth || 800;
      const srcH = img.naturalHeight || 600;

      // Target canvas with decorative borders
      let frameTop = 48;
      let frameSide = 36;
      let frameBottom = 130;

      if (frameTheme === 'polaroid') {
        frameTop = 32;
        frameSide = 32;
        frameBottom = 150;
      } else if (frameTheme === 'golden_plaque') {
        frameTop = 56;
        frameSide = 44;
        frameBottom = 136;
      }

      const outW = srcW + frameSide * 2;
      const outH = srcH + frameTop + frameBottom;

      const canvas = document.createElement('canvas');
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsGenerating(false);
        return;
      }

      // 1. Frame Background
      if (frameTheme === 'postcard') {
        // Warm vintage paper / postcard background
        ctx.fillStyle = '#fbf7ee';
        ctx.fillRect(0, 0, outW, outH);

        // Subtle vintage grain/border
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 4;
        ctx.strokeRect(10, 10, outW - 20, outH - 20);

        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(16, 16, outW - 32, outH - 32);
      } else if (frameTheme === 'polaroid') {
        // Classic Polaroid off-white cardstock
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, outW, outH);

        // Soft drop shadow line around picture
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.strokeRect(frameSide - 2, frameTop - 2, srcW + 4, srcH + 4);
      } else {
        // Golden Plaque Theme: Rich dark fantasy gold frame
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, outW, outH);

        // Double golden filigree border
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 5;
        ctx.strokeRect(12, 12, outW - 24, outH - 24);

        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(18, 18, outW - 36, outH - 36);

        // Corner ornaments (golden diamonds)
        const corners = [
          [22, 22],
          [outW - 22, 22],
          [22, outH - 22],
          [outW - 22, outH - 22],
        ];
        corners.forEach(([cx, cy]) => {
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(cx, cy, 6, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // 2. Draw Game Screenshot
      ctx.drawImage(img, frameSide, frameTop, srcW, srcH);

      // Inner thin shadow border around photo
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.lineWidth = 2;
      ctx.strokeRect(frameSide, frameTop, srcW, srcH);

      // 3. Header Stamp & Title
      if (frameTheme === 'postcard') {
        // Top Postage Stamp / Seal (top right of photo)
        ctx.save();
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(
          lang === 'en'
            ? '🌸 VALLEY OF HARMONY • EXPEDITION OF THE HEART'
            : '🌸 LEMBAH NADA RASA • EKSPEDISI KOMPAS HATI',
          frameSide + 4,
          30
        );

        // Vintage postmark circle
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(outW - 48, 28, 18, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#b45309';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('PSE', outW - 48, 26);
        ctx.fillText('VALID', outW - 48, 35);
        ctx.restore();
      } else if (frameTheme === 'golden_plaque') {
        ctx.save();
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          lang === 'en'
            ? '👑 VALLEY OF HARMONY ADVENTURE MEMORY'
            : '👑 KENANGAN PETUALANGAN LEMBAH NADA RASA',
          outW / 2,
          36
        );
        ctx.restore();
      } else {
        // Polaroid top pin
        ctx.save();
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(outW / 2, 18, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(outW / 2 - 2, 16, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 4. Location Badge (top-left inside photo or bottom)
      ctx.save();
      const locText = `📍 ${locationName}`;
      ctx.font = 'bold 12px sans-serif';
      const locWidth = ctx.measureText(locText).width;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
      ctx.beginPath();
      ctx.roundRect(frameSide + 12, frameTop + 12, locWidth + 16, 26, 6);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.fillText(locText, frameSide + 20, frameTop + 29);
      ctx.restore();

      // 5. Watermark / Compass Badge (bottom-right inside photo)
      ctx.save();
      const compText = lang === 'en' ? `🧭 Village Harmony: ${harmonyPercent}%` : `🧭 Harmoni Desa: ${harmonyPercent}%`;
      ctx.font = 'bold 11px sans-serif';
      const compWidth = ctx.measureText(compText).width;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
      ctx.beginPath();
      ctx.roundRect(frameSide + srcW - compWidth - 28, frameTop + 12, compWidth + 16, 26, 6);
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(compText, frameSide + srcW - compWidth - 20, frameTop + 29);
      ctx.restore();

      // 6. Optional Pixel Stickers on the canvas
      if (showStickers) {
        ctx.save();
        ctx.font = '28px sans-serif';
        // Flower sticker on bottom left of photo
        ctx.fillText('🌸', frameSide + 14, frameTop + srcH - 16);
        // Cat / Mascot sticker
        ctx.fillText('🐱', frameSide + srcW - 44, frameTop + srcH - 16);
        ctx.restore();
      }

      // 7. Bottom Plaque Area (Caption, Author, Stats)
      const bottomY = frameTop + srcH + 28;

      ctx.save();
      if (frameTheme === 'golden_plaque') {
        ctx.fillStyle = '#fef08a';
      } else if (frameTheme === 'polaroid') {
        ctx.fillStyle = '#0f172a';
      } else {
        ctx.fillStyle = '#78350f';
      }

      // Caption Text
      ctx.font = frameTheme === 'polaroid' ? 'italic 14px Georgia, serif' : 'italic 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(caption, outW / 2, bottomY);

      // Author and Date
      const subInfo = lang === 'en'
        ? `Explorer: ${authorName} • Date: ${captureDateStr}`
        : `Penjelajah: ${authorName} • Tanggal: ${captureDateStr}`;
      ctx.font = '11px sans-serif';
      if (frameTheme === 'golden_plaque') {
        ctx.fillStyle = '#94a3b8';
      } else if (frameTheme === 'polaroid') {
        ctx.fillStyle = '#64748b';
      } else {
        ctx.fillStyle = '#92400e';
      }
      ctx.fillText(subInfo, outW / 2, bottomY + 24);

      // Stats Ribbon
      if (showStats) {
        const statsStr = lang === 'en'
          ? `💖 ${stats.empathyScore} Empathy Points   •   🏆 ${badgesCount}/10 SEL Badges Collected   •   🌈 Village Restored`
          : `💖 ${stats.empathyScore} Poin Empati   •   🏆 ${badgesCount}/10 Lencana PSE Terkumpul   •   🌈 Lembah Pulih`;
        ctx.font = 'bold 11px sans-serif';
        if (frameTheme === 'golden_plaque') {
          ctx.fillStyle = '#f59e0b';
        } else if (frameTheme === 'polaroid') {
          ctx.fillStyle = '#0284c7';
        } else {
          ctx.fillStyle = '#b45309';
        }
        ctx.fillText(statsStr, outW / 2, bottomY + 48);
      }

      ctx.restore();

      // Output data URL
      const fullUrl = canvas.toDataURL('image/png');
      setCompositeUrl(fullUrl);
      setIsGenerating(false);
    };
    img.src = screenshotDataUrl;
  }, [
    screenshotDataUrl,
    frameTheme,
    caption,
    authorName,
    showStats,
    showStickers,
    locationName,
    captureDateStr,
    harmonyPercent,
    badgesCount,
    stats.empathyScore,
  ]);

  // Re-render whenever settings or screenshot change
  useEffect(() => {
    if (isOpen && screenshotDataUrl) {
      renderComposite();
    }
  }, [isOpen, screenshotDataUrl, renderComposite]);

  if (!isOpen) return null;

  // Handle PNG Download
  const handleDownload = () => {
    if (!compositeUrl) return;
    sound.playSuccessFanfare();
    const link = document.createElement('a');
    link.download = `momen-lembah-nada-rasa-${Date.now()}.png`;
    link.href = compositeUrl;
    link.click();
  };

  // Handle Copy to Clipboard
  const handleCopy = async () => {
    if (!compositeUrl) return;
    try {
      const res = await fetch(compositeUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setCopied(true);
      sound.playCompassChime();
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      handleDownload();
    }
  };

  // Handle Print
  const handlePrint = () => {
    if (!compositeUrl) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Momen Lembah Nada Rasa - ${authorName}</title>
          <style>
            body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #fff; }
            img { max-width: 95%; max-height: 95vh; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-radius: 8px; }
          </style>
        </head>
        <body>
          <img src="${compositeUrl}" onload="window.print(); window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-backdrop-fade-in">
      <div className="bg-slate-900 border-2 border-amber-400/90 rounded-2xl max-w-4xl w-full max-h-[95vh] flex flex-col shadow-[0_0_50px_rgba(245,158,11,0.25)] text-slate-100 overflow-hidden my-auto modal-glow-frame animate-fade-in-slide-up">
        {/* Header */}
        <div className="px-5 py-3 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-300">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2
                style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
                className="font-bold text-base sm:text-lg text-amber-300 tracking-wide"
              >
                {lang === 'en' ? 'Capture Valley Moments' : 'Abadikan Momen Lembah Nada Rasa'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {lang === 'en'
                  ? 'Capture in-game scene with decorative frames & SEL memories'
                  : 'Screenshot area game dengan bingkai dekoratif & kenangan PSE'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onRetake && (
              <button
                id="retake-moment-btn"
                onClick={() => {
                  sound.playCameraShutter();
                  onRetake();
                }}
                className="px-2.5 py-1.5 rounded-lg bg-slate-700/80 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                title={lang === 'en' ? 'Retake photo' : 'Ambil foto ulang'}
              >
                <RefreshCw className="w-3.5 h-3.5 text-cyan-300" />
                <span className="hidden sm:inline">{lang === 'en' ? 'Retake' : 'Foto Ulang'}</span>
              </button>
            )}

            <button
              id="close-capture-moment-btn"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700/60 transition cursor-pointer"
              title={lang === 'en' ? 'Close' : 'Tutup'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Left Preview, Right Customization */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 flex flex-col md:flex-row gap-5 items-center md:items-start justify-center">
          {/* Screenshot Preview Card */}
          <div className="flex-1 flex flex-col items-center justify-center max-w-lg w-full">
            <div className="relative rounded-xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-950 p-1 flex items-center justify-center min-h-[220px] w-full">
              {isGenerating || !compositeUrl ? (
                <div className="flex flex-col items-center justify-center p-8 text-amber-300 gap-2">
                  <Sparkles className="w-6 h-6 animate-spin" />
                  <span className="text-xs font-medium">
                    {lang === 'en' ? 'Weaving decorative frame...' : 'Merajut bingkai dekoratif...'}
                  </span>
                </div>
              ) : (
                <img
                  src={compositeUrl}
                  alt={lang === 'en' ? 'Valley of Harmony Moment' : 'Momen Lembah Nada Rasa'}
                  className="max-h-[50vh] sm:max-h-[58vh] w-auto max-w-full object-contain rounded-lg shadow-md"
                />
              )}
            </div>

            {/* Quick Stats Summary Under Preview */}
            <div className="w-full mt-2.5 px-2 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-amber-300">
                <MapPin className="w-3.5 h-3.5" />
                {locationName}
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <Calendar className="w-3.5 h-3.5" />
                {captureDateStr}
              </span>
            </div>
          </div>

          {/* Right Controls Panel */}
          <div className="w-full md:w-80 flex flex-col gap-3.5 shrink-0">
            {/* Theme Selector */}
            <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                <Palette className="w-4 h-4 text-amber-400" />
                <span>{lang === 'en' ? 'Choose Frame Style:' : 'Pilih Gaya Bingkai Dekoratif:'}</span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <button
                  id="frame-theme-postcard-btn"
                  onClick={() => {
                    setFrameTheme('postcard');
                    sound.playMenuSelect();
                  }}
                  className={`px-2 py-2 rounded-xl text-center text-xs font-bold transition cursor-pointer border ${
                    frameTheme === 'postcard'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-sm'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800'
                  }`}
                >
                  <div className="text-base mb-0.5">🌸</div>
                  <span>{lang === 'en' ? 'Postcard' : 'Kartu Pos'}</span>
                </button>

                <button
                  id="frame-theme-polaroid-btn"
                  onClick={() => {
                    setFrameTheme('polaroid');
                    sound.playMenuSelect();
                  }}
                  className={`px-2 py-2 rounded-xl text-center text-xs font-bold transition cursor-pointer border ${
                    frameTheme === 'polaroid'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-sm'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800'
                  }`}
                >
                  <div className="text-base mb-0.5">📷</div>
                  <span>Polaroid</span>
                </button>

                <button
                  id="frame-theme-golden-btn"
                  onClick={() => {
                    setFrameTheme('golden_plaque');
                    sound.playMenuSelect();
                  }}
                  className={`px-2 py-2 rounded-xl text-center text-xs font-bold transition cursor-pointer border ${
                    frameTheme === 'golden_plaque'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-sm'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800'
                  }`}
                >
                  <div className="text-base mb-0.5">👑</div>
                  <span>{lang === 'en' ? 'Gold Plaque' : 'Piagam Emas'}</span>
                </button>
              </div>
            </div>

            {/* Custom Quote & Name Customizer */}
            <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl space-y-2.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  {lang === 'en' ? 'Explorer Name:' : 'Nama Penjelajah:'}
                </label>
                <input
                  type="text"
                  id="photo-author-name-input"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-bold focus:outline-none focus:border-amber-400"
                  placeholder={lang === 'en' ? 'Type your name...' : 'Ketik namamu...'}
                  maxLength={30}
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  {lang === 'en' ? 'Message / SEL Wisdom Note:' : 'Pesan / Catatan Kebijaksanaan PSE:'}
                </label>
                <textarea
                  id="photo-caption-input"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 text-xs focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
                  placeholder={lang === 'en' ? 'Write a message or pick a quote below...' : 'Tulis pesan atau pilih kutipan di bawah...'}
                  maxLength={120}
                />
              </div>

              {/* Quick Quotes Picker */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-medium">
                  {lang === 'en' ? 'Recommended Quotes:' : 'Kutipan Rekomendasi:'}
                </span>
                <div className="flex flex-wrap gap-1">
                  {defaultQuotes.slice(0, 3).map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCaption(q);
                        sound.playMenuSelect();
                      }}
                      className="px-2 py-0.5 text-[10px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 truncate max-w-full text-left cursor-pointer"
                    >
                      {q.slice(0, 35)}...
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={showStats}
                    onChange={(e) => setShowStats(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-0 cursor-pointer"
                  />
                  <span>{lang === 'en' ? 'Show Score & Badges' : 'Tampilkan Skor & Lencana'}</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={showStickers}
                    onChange={(e) => setShowStickers(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-0 cursor-pointer"
                  />
                  <span>{lang === 'en' ? 'Decorative Stickers' : 'Stiker Dekorasi'}</span>
                </label>
              </div>
            </div>

            {/* Action Buttons: Download, Copy, Print */}
            <div className="space-y-2 pt-1">
              <button
                id="download-moment-btn"
                onClick={handleDownload}
                disabled={isGenerating || !compositeUrl}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{lang === 'en' ? 'Download Photo (Full Res PNG)' : 'Unduh Foto (PNG Resolusi Penuh)'}</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  id="copy-moment-btn"
                  onClick={handleCopy}
                  disabled={isGenerating || !compositeUrl}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">{lang === 'en' ? 'Copied!' : 'Tersalin!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{lang === 'en' ? 'Copy Image' : 'Salin Gambar'}</span>
                    </>
                  )}
                </button>

                <button
                  id="print-moment-btn"
                  onClick={handlePrint}
                  disabled={isGenerating || !compositeUrl}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{lang === 'en' ? 'Print Photo' : 'Cetak Foto'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-5 py-2.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {lang === 'en'
                ? 'Photo saved with beautiful Valley of Harmony decorative frame'
                : 'Foto tersimpan lengkap dengan bingkai dekoratif Lembah Nada Rasa'}
            </span>
          </span>

          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white font-semibold text-xs px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
          >
            {lang === 'en' ? 'Done / Back' : 'Selesai / Kembali'}
          </button>
        </div>
      </div>
    </div>
  );
};
