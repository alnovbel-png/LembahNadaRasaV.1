import React, { useRef, useEffect, useState } from 'react';
import { Map as MapIcon, X, MapPin, Sparkles, Navigation } from 'lucide-react';
import { NPC, ZoneColorStatus } from '../types/game';
import { Player } from '../game/renderer';
import { MAP_COLS, MAP_ROWS, TILE } from '../game/constants';

interface MiniMapProps {
  isOpen: boolean;
  onToggle: () => void;
  playerRef: React.MutableRefObject<Player>;
  npcs: NPC[];
  zoneStatus: ZoneColorStatus;
  mapLayout: number[][];
  onNavigateToTile?: (tileX: number, tileY: number) => void;
}

const TILE_PX = 5; // 5px per tile -> 36 cols * 5 = 180px width, 28 rows * 5 = 140px height
const MAP_W = MAP_COLS * TILE_PX;
const MAP_H = MAP_ROWS * TILE_PX;

export const MiniMap: React.FC<MiniMapProps> = ({
  isOpen,
  onToggle,
  playerRef,
  npcs,
  zoneStatus,
  mapLayout,
  onNavigateToTile,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const staticMapCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentZoneName, setCurrentZoneName] = useState<string>('Alun-Alun Nada');

  // Pre-render static terrain to an offscreen canvas for optimal performance
  useEffect(() => {
    const offCanvas = document.createElement('canvas');
    offCanvas.width = MAP_W;
    offCanvas.height = MAP_H;
    const ctx = offCanvas.getContext('2d');
    if (!ctx) return;

    // Crisp pixel rendering
    ctx.imageSmoothingEnabled = false;

    // Base background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, MAP_W, MAP_H);

    for (let r = 0; r < MAP_ROWS; r++) {
      for (let c = 0; c < MAP_COLS; c++) {
        const tile = mapLayout[r]?.[c] ?? TILE.GRASS;
        let color = '#15803d'; // Default grass

        switch (tile) {
          case TILE.CLIFF:
          case TILE.FENCE:
            color = '#334155';
            break;
          case TILE.WATER:
          case TILE.WATER_DEEP:
            color = '#2563eb';
            break;
          case TILE.WOOD_BRIDGE:
            color = zoneStatus.bridge ? '#f59e0b' : '#78350f';
            break;
          case TILE.PATH_STONE:
            color = '#64748b';
            break;
          case TILE.TREE_TRUNK:
          case TILE.TREE_TOP:
            color = '#064e3b';
            break;
          case TILE.HOUSE_WALL:
          case TILE.HOUSE_ROOF:
          case TILE.HOUSE_DOOR:
          case TILE.HOUSE_WINDOW:
            color = '#b45309';
            break;
          case TILE.FARMLAND_SOIL:
            color = '#78350f';
            break;
          case TILE.CROP_CARROT:
            color = '#ea580c';
            break;
          case TILE.CROP_CABBAGE:
            color = '#22c55e';
            break;
          case TILE.CROP_WHEAT:
            color = '#eab308';
            break;
          case TILE.WATER_WELL:
            color = '#0284c7';
            break;
          case TILE.SCARECROW:
          case TILE.HAY_BALE:
            color = '#d97706';
            break;
          case TILE.ORCHARD_APPLE:
            color = '#dc2626';
            break;
          case TILE.ORCHARD_ORANGE:
            color = '#f97316';
            break;
          case TILE.FOUNTAIN:
            color = '#06b6d4';
            break;
          case TILE.FLOWER_BED:
            color = '#ec4899';
            break;
          case TILE.TOWER_WALL:
            color = zoneStatus.tower ? '#fbbf24' : '#6b21a8';
            break;
          case TILE.SECRET_TREE:
            color = '#10b981';
            break;
          case TILE.GRASS_FLOWERS:
            color = '#16a34a';
            break;
          default:
            color = '#15803d';
        }

        ctx.fillStyle = color;
        ctx.fillRect(c * TILE_PX, r * TILE_PX, TILE_PX, TILE_PX);
      }
    }

    staticMapCanvasRef.current = offCanvas;
  }, [mapLayout, zoneStatus.bridge, zoneStatus.tower]);

  // Mini-map dynamic rendering loop (60 FPS player position & blips)
  useEffect(() => {
    if (!isOpen) return;

    let animId: number;
    let tick = 0;

    const renderMiniMap = () => {
      tick++;
      const canvas = canvasRef.current;
      if (!canvas) {
        animId = requestAnimationFrame(renderMiniMap);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Draw pre-rendered static terrain
      if (staticMapCanvasRef.current) {
        ctx.drawImage(staticMapCanvasRef.current, 0, 0);
      } else {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, MAP_W, MAP_H);
      }

      // 2. Zone restored glows
      if (zoneStatus.plaza) {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.18)';
        ctx.fillRect(4 * TILE_PX, 10 * TILE_PX, 15 * TILE_PX, 11 * TILE_PX);
      }
      if (zoneStatus.forest) {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.22)';
        ctx.fillRect(1 * TILE_PX, 1 * TILE_PX, 14 * TILE_PX, 8 * TILE_PX);
      }
      if (zoneStatus.bridge) {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
        ctx.fillRect(20 * TILE_PX, 13 * TILE_PX, 5 * TILE_PX, 4 * TILE_PX);
      }
      if (zoneStatus.tower) {
        ctx.fillStyle = 'rgba(234, 179, 8, 0.25)';
        ctx.fillRect(26 * TILE_PX, 2 * TILE_PX, 8 * TILE_PX, 7 * TILE_PX);
      }

      // 3. Draw Landmark Labels
      ctx.font = '7px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(254, 240, 138, 0.75)';
      ctx.fillText('ALUN²', 11 * TILE_PX, 13 * TILE_PX);
      ctx.fillText('HUTAN', 7 * TILE_PX, 4 * TILE_PX);
      ctx.fillText('MENARA', 30 * TILE_PX, 4 * TILE_PX);
      ctx.fillText('KEBUN', 8 * TILE_PX, 22 * TILE_PX);
      ctx.fillText('BUAH', 26 * TILE_PX, 23 * TILE_PX);

      // 4. Draw NPCs as distinctive gold/colored markers
      for (const npc of npcs) {
        const nx = npc.x * TILE_PX + TILE_PX / 2;
        const ny = npc.y * TILE_PX + TILE_PX / 2;

        ctx.beginPath();
        ctx.arc(nx, ny, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = npc.isResolved ? '#34d399' : '#fbbf24';
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#0f172a';
        ctx.stroke();

        // Pulsing alert for unresolved NPCs
        if (!npc.isResolved) {
          const pulse = (Math.sin(tick * 0.1) + 1) * 1.5;
          ctx.beginPath();
          ctx.arc(nx, ny, 4 + pulse, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
          ctx.stroke();
        }
      }

      // 5. Draw Player as high-contrast emerald & white beacon
      const p = playerRef.current;
      const tileCol = p.x / 32;
      const tileRow = p.y / 32;
      const px = tileCol * TILE_PX + TILE_PX / 2;
      const py = tileRow * TILE_PX + TILE_PX / 2;

      // Radar ping animation
      const radarPhase = (tick % 40) / 40;
      const radarRadius = 3 + radarPhase * 9;
      const radarAlpha = 1 - radarPhase;
      ctx.beginPath();
      ctx.arc(px, py, radarRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(52, 211, 153, ${radarAlpha})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Core player dot
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#10b981';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(px, py, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#022c22';
      ctx.stroke();

      // Calculate current zone name dynamically for player
      if (tileCol >= 26 && tileRow <= 10) {
        setCurrentZoneName('Menara Jam Harmoni');
      } else if (tileCol < 15 && tileRow < 10) {
        setCurrentZoneName('Hutan Sunyi Refleksi');
      } else if (tileCol >= 19 && tileCol <= 25 && tileRow >= 12 && tileRow <= 18) {
        setCurrentZoneName('Jembatan Kayu Ranu');
      } else if (tileCol <= 14 && tileRow >= 19) {
        setCurrentZoneName('Kebun Harapan & Pertanian');
      } else if (tileCol >= 20 && tileRow >= 19) {
        setCurrentZoneName('Perkebunan Buah Segar');
      } else if (tileCol >= 4 && tileCol <= 18 && tileRow >= 10 && tileRow <= 21) {
        setCurrentZoneName('Alun-Alun Nada Rasa');
      } else if (tileCol >= 21 && tileCol <= 25) {
        setCurrentZoneName('Tepi Sungai Gemericik');
      } else {
        setCurrentZoneName('Lembah Nada Rasa');
      }

      animId = requestAnimationFrame(renderMiniMap);
    };

    animId = requestAnimationFrame(renderMiniMap);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, npcs, playerRef, zoneStatus]);

  // Click on mini-map to auto-navigate
  const handleMapClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onNavigateToTile || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = MAP_W / rect.width;
    const scaleY = MAP_H / rect.height;

    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const tileX = Math.floor(clickX / TILE_PX);
    const tileY = Math.floor(clickY / TILE_PX);

    if (tileX >= 0 && tileX < MAP_COLS && tileY >= 0 && tileY < MAP_ROWS) {
      onNavigateToTile(tileX, tileY);
    }
  };

  // Restored zones count
  const restoredCount = [
    zoneStatus.plaza,
    zoneStatus.bridge,
    zoneStatus.forest,
    zoneStatus.tower,
  ].filter(Boolean).length;

  return (
    <>
      {/* Floating Toggle Button (Always accessible) */}
      {!isOpen ? (
        <button
          id="btn-open-minimap"
          onClick={onToggle}
          title="Buka Peta Mini [M]"
          className="fixed top-24 sm:top-auto sm:bottom-4 right-2.5 sm:right-4 z-20 pointer-events-auto bg-slate-950/95 border border-amber-500/60 hover:bg-slate-900 text-amber-300 rounded-xl px-2.5 sm:px-3 py-1.5 shadow-xl backdrop-blur-md flex items-center gap-1.5 transition active:scale-95 group"
        >
          <MapIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
          <span className="font-pixel text-[8px] sm:text-[9px] font-bold">PETA</span>
          <span className="hidden md:inline text-[9px] text-slate-400 font-mono">[M]</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        </button>
      ) : (
        /* Expanded Mini-Map HUD Card */
        <div
          id="minimap-overlay-container"
          className="fixed top-24 sm:top-auto sm:bottom-4 right-2.5 sm:right-4 z-20 pointer-events-auto select-none bg-slate-950/95 border-2 border-amber-500/70 rounded-2xl p-2 sm:p-2.5 shadow-[0_0_30px_rgba(0,0,0,0.85)] backdrop-blur-md w-[204px] flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-pixel text-[8px] text-amber-300 font-bold tracking-tight">
                PETA LEMBAH
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span
                className="font-pixel text-[7px] text-emerald-400 px-1 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/80"
                title={`${restoredCount}/4 Harmoni Zona Pulih`}
              >
                {restoredCount}/4
              </span>
              <button
                id="btn-close-minimap"
                onClick={onToggle}
                title="Tutup Peta [M]"
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Interactive Mini-Map Canvas */}
          <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-900 shadow-inner group">
            <canvas
              ref={canvasRef}
              width={MAP_W}
              height={MAP_H}
              onClick={handleMapClick}
              className="block w-[184px] h-[143px] cursor-crosshair object-contain"
              title="Klik peta untuk berjalan ke titik tujuan"
            />
            {/* Quick click-to-move overlay hint on hover */}
            <div className="absolute inset-x-0 bottom-0 py-0.5 bg-slate-950/80 text-[8px] text-amber-200 text-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity font-mono">
              Klik peta untuk jalan
            </div>
          </div>

          {/* Current Player Zone Location Tag */}
          <div className="flex items-center justify-between text-[9px] text-slate-300 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800/80">
            <div className="flex items-center gap-1 truncate">
              <Navigation className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="truncate font-medium text-slate-200">{currentZoneName}</span>
            </div>
          </div>

          {/* Legend & Shortcut Hint */}
          <div className="flex items-center justify-between text-[8px] text-slate-400 px-1">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-0.5 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> Kamu
              </span>
              <span className="flex items-center gap-0.5 text-amber-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" /> Warga
              </span>
            </div>
            <span className="text-[7px] text-slate-500 font-pixel">[M] Tutup</span>
          </div>
        </div>
      )}
    </>
  );
};
