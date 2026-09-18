import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  Map as MapIcon,
  X,
  MapPin,
  Sparkles,
  Navigation,
  Compass,
  Target,
  ArrowRight,
  Eye,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { NPC, ZoneColorStatus, GameQuest } from '../types/game';
import { Player } from '../game/renderer';
import { MAP_COLS, MAP_ROWS, TILE } from '../game/constants';
import { useIsMobileOrTablet, useIsPortrait } from '../utils/device';

interface MiniMapProps {
  isOpen: boolean;
  onToggle: () => void;
  playerRef: React.MutableRefObject<Player>;
  npcs: NPC[];
  zoneStatus: ZoneColorStatus;
  mapLayout: number[][];
  quests?: GameQuest[];
  onNavigateToTile?: (tileX: number, tileY: number) => void;
  isCompassActive?: boolean;
}

const TILE_PX = 5; // 5px per tile -> 36 cols * 5 = 180px width, 28 rows * 5 = 140px height
const MAP_W = MAP_COLS * TILE_PX;
const MAP_H = MAP_ROWS * TILE_PX;

interface HoveredTargetInfo {
  name: string;
  role?: string;
  facing?: string;
  status: string;
  isQuestTarget?: boolean;
  isUnrecoveredZone?: boolean;
  zoneHint?: string;
}

export const MiniMap: React.FC<MiniMapProps> = ({
  isOpen,
  onToggle,
  playerRef,
  npcs,
  zoneStatus,
  mapLayout,
  quests,
  onNavigateToTile,
  isCompassActive = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const staticMapCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentZoneName, setCurrentZoneName] = useState<string>('Alun-Alun Nada');
  const [hoveredInfo, setHoveredInfo] = useState<HoveredTargetInfo | null>(null);

  // Active quest and current target NPC
  const activeQuest = useMemo(() => quests?.find((q) => !q.isCompleted), [quests]);
  const activeTargetNpc = useMemo(() => {
    if (!activeQuest) return null;
    return npcs.find((n) => n.id === activeQuest.targetNPC) || null;
  }, [activeQuest, npcs]);

  // Destination zone name & status for active quest
  const activeQuestZoneInfo = useMemo(() => {
    if (!activeQuest) return null;
    const target = activeQuest.targetNPC;
    if (target === 'kiki' || activeQuest.id === 'quest_start') {
      return { id: 'plaza', name: 'Alun-Alun', isRestored: zoneStatus.plaza };
    }
    if (target === 'kakek_ranu' || activeQuest.id === 'quest_bridge') {
      return { id: 'bridge', name: 'Jembatan Kayu', isRestored: zoneStatus.bridge };
    }
    if (target === 'bimo' || activeQuest.id === 'quest_bimo') {
      return { id: 'forest', name: 'Hutan Sunyi', isRestored: zoneStatus.forest };
    }
    if (target === 'penjaga_kabut' || target === 'tetua_wilis' || activeQuest.id === 'quest_tower') {
      return { id: 'tower', name: 'Menara Jam', isRestored: zoneStatus.tower };
    }
    return null;
  }, [activeQuest, zoneStatus]);

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
            color = '#c2410c';
            break;
          case TILE.FOREST_CABIN_ROOF:
          case TILE.FOREST_CABIN_WALL:
          case TILE.FOREST_CABIN_DOOR:
          case TILE.FOREST_CABIN_WINDOW:
            color = '#78350f';
            break;
          case TILE.LOG_STACK:
            color = '#d97706';
            break;
          case TILE.ZEN_ROOF:
            color = '#0f766e';
            break;
          case TILE.ZEN_WALL:
          case TILE.ZEN_DOOR:
          case TILE.ZEN_WINDOW:
            color = '#b45309';
            break;
          case TILE.STONE_LANTERN:
            color = '#94a3b8';
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
          case TILE.TOWER_ROOF:
          case TILE.TOWER_CLOCK:
          case TILE.TOWER_DOOR:
          case TILE.TOWER_WINDOW:
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

  // Mini-map dynamic rendering loop (60 FPS player position, real-time NPC movements, active quest beacon)
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

      // 2. Zone Restoration & Unrecovered Areas Visualization
      const ZONES_CONFIG = [
        {
          id: 'plaza',
          name: 'ALUN²',
          x: 4 * TILE_PX,
          y: 10 * TILE_PX,
          w: 15 * TILE_PX,
          h: 11 * TILE_PX,
          isRestored: zoneStatus.plaza,
          isQuestZone: activeQuest?.targetNPC === 'kiki',
          restoredColor: 'rgba(245, 158, 11, 0.2)',
          labelX: 11 * TILE_PX,
          labelY: 13 * TILE_PX,
        },
        {
          id: 'forest',
          name: 'HUTAN',
          x: 1 * TILE_PX,
          y: 1 * TILE_PX,
          w: 14 * TILE_PX,
          h: 8 * TILE_PX,
          isRestored: zoneStatus.forest,
          isQuestZone: activeQuest?.targetNPC === 'bimo',
          restoredColor: 'rgba(16, 185, 129, 0.22)',
          labelX: 7 * TILE_PX,
          labelY: 4 * TILE_PX,
        },
        {
          id: 'bridge',
          name: 'JEMBATAN',
          x: 20 * TILE_PX,
          y: 13 * TILE_PX,
          w: 5 * TILE_PX,
          h: 4 * TILE_PX,
          isRestored: zoneStatus.bridge,
          isQuestZone: activeQuest?.targetNPC === 'kakek_ranu',
          restoredColor: 'rgba(245, 158, 11, 0.25)',
          labelX: 22 * TILE_PX,
          labelY: 15 * TILE_PX,
        },
        {
          id: 'tower',
          name: 'MENARA',
          x: 26 * TILE_PX,
          y: 2 * TILE_PX,
          w: 8 * TILE_PX,
          h: 7 * TILE_PX,
          isRestored: zoneStatus.tower,
          isQuestZone:
            activeQuest?.targetNPC === 'penjaga_kabut' ||
            activeQuest?.targetNPC === 'tetua_wilis',
          restoredColor: 'rgba(234, 179, 8, 0.25)',
          labelX: 30 * TILE_PX,
          labelY: 4 * TILE_PX,
        },
      ];

      for (const zone of ZONES_CONFIG) {
        if (zone.isRestored) {
          // Restored zone: warm radiant golden/emerald tint
          ctx.fillStyle = zone.restoredColor;
          ctx.fillRect(zone.x, zone.y, zone.w, zone.h);

          // Subtle restored border
          ctx.strokeStyle = 'rgba(52, 211, 153, 0.35)';
          ctx.lineWidth = 1;
          ctx.strokeRect(zone.x, zone.y, zone.w, zone.h);
        } else {
          // Unrecovered area: desaturated cold slate fog overlay
          ctx.fillStyle = 'rgba(51, 65, 85, 0.42)';
          ctx.fillRect(zone.x, zone.y, zone.w, zone.h);

          // Drifting subtle mist streaks
          const mistShift = (tick * 0.3) % (zone.w + 12);
          ctx.fillStyle = 'rgba(148, 163, 184, 0.12)';
          ctx.fillRect(zone.x + mistShift - 8, zone.y, 6, zone.h);

          if (zone.isQuestZone) {
            // High-priority destination zone for active quest: animated pulsing golden/amber border
            ctx.save();
            ctx.setLineDash([3, 3]);
            ctx.lineDashOffset = -tick * 0.4;
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 1.6;
            ctx.strokeRect(zone.x, zone.y, zone.w, zone.h);
            ctx.restore();
          } else {
            // Other unrestored zone: subdued dashed grey border
            ctx.save();
            ctx.setLineDash([2, 2]);
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
            ctx.lineWidth = 0.8;
            ctx.strokeRect(zone.x, zone.y, zone.w, zone.h);
            ctx.restore();
          }
        }
      }

      // 3. Draw Landmark Labels
      ctx.font = '6px "Press Start 2P", monospace';
      ctx.textAlign = 'center';

      for (const zone of ZONES_CONFIG) {
        if (zone.isRestored) {
          ctx.fillStyle = 'rgba(254, 240, 138, 0.9)';
          ctx.fillText(zone.name, zone.labelX, zone.labelY);
          ctx.font = '5px "Press Start 2P", monospace';
          ctx.fillStyle = '#34d399';
          ctx.fillText('PULIH', zone.labelX, zone.labelY + 6);
          ctx.font = '6px "Press Start 2P", monospace';
        } else if (zone.isQuestZone) {
          ctx.fillStyle = '#fbbf24';
          ctx.fillText(zone.name, zone.labelX, zone.labelY);
          ctx.font = '5px "Press Start 2P", monospace';
          ctx.fillStyle = '#f87171';
          ctx.fillText('BELUM', zone.labelX, zone.labelY + 6);
          ctx.font = '6px "Press Start 2P", monospace';
        } else {
          ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
          ctx.fillText(zone.name, zone.labelX, zone.labelY);
        }
      }

      ctx.fillStyle = 'rgba(254, 240, 138, 0.7)';
      ctx.fillText('KEBUN', 8 * TILE_PX, 22 * TILE_PX);
      ctx.fillText('BUAH', 26 * TILE_PX, 23 * TILE_PX);

      // 4. Calculate player coordinate on mini-map
      const p = playerRef.current;
      const tileCol = p.x / 32;
      const tileRow = p.y / 32;
      const px = tileCol * TILE_PX + TILE_PX / 2;
      const py = tileRow * TILE_PX + TILE_PX / 2;

      // 5. Draw NPCs with Real-Time Direction of Movement & Active Quest Marker
      for (const npc of npcs) {
        const nx = npc.x * TILE_PX + TILE_PX / 2;
        const ny = npc.y * TILE_PX + TILE_PX / 2;
        const isQuestTarget = Boolean(activeQuest && npc.id === activeQuest.targetNPC);

        // Direction vector & angle according to npc.facing
        let dx = 0;
        let dy = 1;
        let angle = Math.PI / 2;
        if (npc.facing === 'up') {
          dx = 0;
          dy = -1;
          angle = -Math.PI / 2;
        } else if (npc.facing === 'down') {
          dx = 0;
          dy = 1;
          angle = Math.PI / 2;
        } else if (npc.facing === 'left') {
          dx = -1;
          dy = 0;
          angle = Math.PI;
        } else if (npc.facing === 'right') {
          dx = 1;
          dy = 0;
          angle = 0;
        }

        // A. Real-time forward vision / movement field
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(nx, ny);
        ctx.arc(nx, ny, isQuestTarget ? 8.5 : 6, angle - 0.42, angle + 0.42);
        ctx.closePath();
        ctx.fillStyle = isQuestTarget
          ? 'rgba(245, 158, 11, 0.35)'
          : npc.isResolved
          ? 'rgba(52, 211, 153, 0.22)'
          : 'rgba(251, 191, 36, 0.22)';
        ctx.fill();
        ctx.restore();

        // B. Real-time Directional Arrow Pointer (Points where NPC moves / faces)
        const tipDist = isQuestTarget ? 7.5 : 5.8;
        const baseDist = isQuestTarget ? 4.2 : 3.2;
        const halfW = isQuestTarget ? 3.2 : 2.4;

        const tipX = nx + dx * tipDist;
        const tipY = ny + dy * tipDist;
        const leftX = nx + dx * baseDist - dy * halfW;
        const leftY = ny + dy * baseDist + dx * halfW;
        const rightX = nx + dx * baseDist + dy * halfW;
        const rightY = ny + dy * baseDist - dx * halfW;

        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(leftX, leftY);
        ctx.lineTo(rightX, rightY);
        ctx.closePath();
        ctx.fillStyle = isQuestTarget
          ? '#f59e0b'
          : npc.isResolved
          ? '#10b981'
          : '#fbbf24';
        ctx.fill();
        ctx.lineWidth = 0.8;
        ctx.strokeStyle = '#0f172a';
        ctx.stroke();

        // C. Center NPC bead
        const radius = isQuestTarget ? 4 : 3;
        ctx.beginPath();
        ctx.arc(nx, ny, radius, 0, Math.PI * 2);
        ctx.fillStyle = isQuestTarget
          ? '#f59e0b'
          : npc.isResolved
          ? '#34d399'
          : '#fbbf24';
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#0f172a';
        ctx.stroke();

        // D. Pulsing rings for unresolved NPCs
        if (!npc.isResolved) {
          const pulse = (Math.sin(tick * 0.1) + 1) * 1.3;
          ctx.beginPath();
          ctx.arc(nx, ny, radius + pulse, 0, Math.PI * 2);
          ctx.strokeStyle = isQuestTarget
            ? 'rgba(245, 158, 11, 0.7)'
            : 'rgba(251, 191, 36, 0.4)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // E. Dedicated Special Active Quest Marker & Beacon
        if (isQuestTarget) {
          // Multi-stage radar pulse
          const radarWave = (tick % 45) / 45;
          ctx.beginPath();
          ctx.arc(nx, ny, 4 + radarWave * 11, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(245, 158, 11, ${1 - radarWave})`;
          ctx.lineWidth = 1.6;
          ctx.stroke();

          // Bobbing floating Quest Diamond with Exclamation Mark '!'
          const bob = Math.sin(tick * 0.14) * 1.8;
          const iconY = ny - 10 + bob;

          ctx.save();
          // Golden diamond badge
          ctx.beginPath();
          ctx.moveTo(nx, iconY - 5);
          ctx.lineTo(nx + 4.5, iconY);
          ctx.lineTo(nx, iconY + 5);
          ctx.lineTo(nx - 4.5, iconY);
          ctx.closePath();
          ctx.fillStyle = '#f59e0b';
          ctx.fill();
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Exclamation '!' symbol
          ctx.font = 'bold 7px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#0f172a';
          ctx.fillText('!', nx, iconY + 0.5);

          // Top label
          ctx.font = '5px "Press Start 2P", monospace';
          ctx.fillStyle = '#fef08a';
          ctx.fillText('QUEST', nx, iconY - 6.5);
          ctx.restore();

          // Animated golden dash guide line from player to active quest target!
          ctx.save();
          ctx.setLineDash([2, 3]);
          ctx.lineDashOffset = -tick * 0.4;
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.55)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(nx, ny);
          ctx.stroke();
          ctx.restore();
        }
      }

      // 6. Draw Player as high-contrast beacon with real-time facing direction
      let pdx = 0;
      let pdy = 1;
      if (p.facing === 'up') {
        pdx = 0;
        pdy = -1;
      } else if (p.facing === 'down') {
        pdx = 0;
        pdy = 1;
      } else if (p.facing === 'left') {
        pdx = -1;
        pdy = 0;
      } else if (p.facing === 'right') {
        pdx = 1;
        pdy = 0;
      }

      // Player forward facing arrow
      const pTipDist = 6.2;
      const pBaseDist = 3.4;
      const pHalfW = 2.4;
      const pTipX = px + pdx * pTipDist;
      const pTipY = py + pdy * pTipDist;
      const pLeftX = px + pdx * pBaseDist - pdy * pHalfW;
      const pLeftY = py + pdy * pBaseDist + pdx * pHalfW;
      const pRightX = px + pdx * pBaseDist + pdy * pHalfW;
      const pRightY = py + pdy * pBaseDist - pdx * pHalfW;

      ctx.beginPath();
      ctx.moveTo(pTipX, pTipY);
      ctx.lineTo(pLeftX, pLeftY);
      ctx.lineTo(pRightX, pRightY);
      ctx.closePath();
      ctx.fillStyle = '#34d399';
      ctx.fill();
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = '#022c22';
      ctx.stroke();

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
  }, [isOpen, npcs, playerRef, zoneStatus, activeQuest]);

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

  // Touch on mini-map for mobile / tablet auto-navigation
  const handleTouchMap = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!onNavigateToTile || !canvasRef.current) return;
    const touch = e.touches[0] || e.changedTouches[0];
    if (!touch) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = MAP_W / rect.width;
    const scaleY = MAP_H / rect.height;

    const clickX = (touch.clientX - rect.left) * scaleX;
    const clickY = (touch.clientY - rect.top) * scaleY;

    const tileX = Math.floor(clickX / TILE_PX);
    const tileY = Math.floor(clickY / TILE_PX);

    if (tileX >= 0 && tileX < MAP_COLS && tileY >= 0 && tileY < MAP_ROWS) {
      onNavigateToTile(tileX, tileY);
    }
  };

  // Mouse hover tracking for real-time target inspector
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = MAP_W / rect.width;
    const scaleY = MAP_H / rect.height;
    const canvasX = (e.clientX - rect.left) * scaleX;
    const canvasY = (e.clientY - rect.top) * scaleY;

    // Check if hovering near an NPC
    for (const npc of npcs) {
      const nx = npc.x * TILE_PX + TILE_PX / 2;
      const ny = npc.y * TILE_PX + TILE_PX / 2;
      const dist = Math.hypot(canvasX - nx, canvasY - ny);
      if (dist <= 8) {
        const isQuestTarget = Boolean(activeQuest && npc.id === activeQuest.targetNPC);
        const facingText =
          npc.facing === 'up'
            ? 'Utara ⬆️'
            : npc.facing === 'down'
            ? 'Selatan ⬇️'
            : npc.facing === 'left'
            ? 'Barat ⬅️'
            : 'Timur ➡️';
        setHoveredInfo({
          name: npc.name,
          role: npc.role,
          facing: facingText,
          status: isQuestTarget
            ? 'Target Quest Aktif!'
            : npc.isResolved
            ? 'Harmoni Pulih'
            : 'Belum Selesai',
          isQuestTarget,
        });
        return;
      }
    }

    // Check if hovering over key zones
    const tileCol = canvasX / TILE_PX;
    const tileRow = canvasY / TILE_PX;
    if (tileCol >= 4 && tileCol <= 19 && tileRow >= 10 && tileRow <= 21) {
      setHoveredInfo({
        name: 'Alun-Alun Nada Rasa',
        status: zoneStatus.plaza ? 'Harmoni Pulih ✨' : 'Belum Pulih 🌫️',
        isUnrecoveredZone: !zoneStatus.plaza,
        zoneHint: zoneStatus.plaza ? undefined : 'Selesaikan Misi Kiki untuk memulihkan warna!',
      });
      return;
    }
    if (tileCol >= 1 && tileCol <= 15 && tileRow >= 1 && tileRow <= 9) {
      setHoveredInfo({
        name: 'Hutan Sunyi Refleksi',
        status: zoneStatus.forest ? 'Harmoni Pulih ✨' : 'Belum Pulih 🌫️',
        isUnrecoveredZone: !zoneStatus.forest,
        zoneHint: zoneStatus.forest ? undefined : 'Bantu Bimo mengatasi rasa bersalah!',
      });
      return;
    }
    if (tileCol >= 20 && tileCol <= 25 && tileRow >= 12 && tileRow <= 18) {
      setHoveredInfo({
        name: 'Jembatan Kayu Ranu',
        status: zoneStatus.bridge ? 'Harmoni Pulih ✨' : 'Belum Pulih 🌫️',
        isUnrecoveredZone: !zoneStatus.bridge,
        zoneHint: zoneStatus.bridge ? undefined : 'Temui Kakek Ranu dengan respon empatik!',
      });
      return;
    }
    if (tileCol >= 26 && tileCol <= 34 && tileRow >= 1 && tileRow <= 9) {
      setHoveredInfo({
        name: 'Menara Jam Harmoni',
        status: zoneStatus.tower ? 'Harmoni Pulih ✨' : 'Belum Pulih 🌫️',
        isUnrecoveredZone: !zoneStatus.tower,
        zoneHint: zoneStatus.tower ? undefined : 'Bawa Roda Gigi Jam ke puncak menara!',
      });
      return;
    }

    setHoveredInfo(null);
  };

  const handleMouseLeave = () => {
    setHoveredInfo(null);
  };

  // Restored zones count
  const restoredCount = [
    zoneStatus.plaza,
    zoneStatus.bridge,
    zoneStatus.forest,
    zoneStatus.tower,
  ].filter(Boolean).length;

  // Accurately determine mobile/tablet vs desktop and orientation
  const isMobileOrTablet = useIsMobileOrTablet();
  const isPortrait = useIsPortrait();

  const containerPosition = isMobileOrTablet
    ? isPortrait
      ? 'bottom-[76px] sm:bottom-[84px] right-3 sm:right-5'
      : 'bottom-[72px] sm:bottom-[78px] right-3 sm:right-5'
    : 'bottom-4 right-4';

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen ? (
        <button
          id="btn-open-minimap"
          onClick={onToggle}
          title="Buka Peta Mini [M]"
          className={`fixed ${containerPosition} z-30 pointer-events-auto bg-slate-950/95 border border-amber-500/60 hover:bg-slate-900 active:bg-amber-500/20 text-amber-300 rounded-xl px-2.5 sm:px-3 py-1.5 shadow-xl backdrop-blur-md flex items-center gap-1.5 transition active:scale-95 group`}
        >
          <MapIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
          <span className="font-pixel text-[8px] sm:text-[9px] font-bold">PETA</span>
          {activeQuest && (
            <span className="flex items-center justify-center w-3 h-3 rounded-full bg-amber-400 text-slate-950 text-[7px] font-bold animate-pulse">
              !
            </span>
          )}
          <span className="hidden md:inline text-[9px] text-slate-400 font-mono">[M]</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        </button>
      ) : (
        /* Expanded Mini-Map HUD Card */
        <div
          id="minimap-overlay-container"
          className={`fixed ${containerPosition} z-30 pointer-events-auto select-none bg-slate-950/95 border-2 border-amber-500/70 rounded-2xl p-2 sm:p-2.5 shadow-[0_0_30px_rgba(0,0,0,0.85)] backdrop-blur-md w-[212px] sm:w-[220px] flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-150`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <div className="flex items-center gap-1.5">
              <Compass
                className={`w-3.5 h-3.5 ${
                  isCompassActive
                    ? 'text-amber-300 animate-spin-slow drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]'
                    : 'text-amber-400'
                }`}
              />
              <span className="font-pixel text-[8px] text-amber-300 font-bold tracking-tight">
                PETA & RADAR
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span
                className={`font-pixel text-[7px] px-1.5 py-0.5 rounded border ${
                  restoredCount === 4
                    ? 'text-emerald-300 bg-emerald-950/80 border-emerald-500/80'
                    : 'text-amber-300 bg-amber-950/70 border-amber-800/80'
                }`}
                title={`${restoredCount}/4 Harmoni Zona Pulih`}
              >
                {restoredCount}/4 {restoredCount === 4 ? '✨' : 'PULIH'}
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

          {/* Interactive Mini-Map Canvas with Compass Dial & Direction Guides */}
          <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-900 shadow-inner group">
            {/* Cardinal Direction Indicators */}
            <div className="absolute top-0 inset-x-0 flex justify-center pointer-events-none z-10">
              <span className="font-pixel text-[6px] font-bold px-1 bg-slate-950/75 text-rose-400 rounded-b border-x border-b border-slate-800">
                U (Utara)
              </span>
            </div>
            <div className="absolute bottom-0 inset-x-0 flex justify-center pointer-events-none z-10">
              <span className="font-pixel text-[6px] font-bold px-1 bg-slate-950/75 text-slate-400 rounded-t border-x border-t border-slate-800">
                S (Selatan)
              </span>
            </div>
            <div className="absolute left-0 inset-y-0 flex items-center pointer-events-none z-10">
              <span className="font-pixel text-[6px] font-bold py-0.5 px-0.5 bg-slate-950/75 text-slate-400 rounded-r border-y border-r border-slate-800">
                B
              </span>
            </div>
            <div className="absolute right-0 inset-y-0 flex items-center pointer-events-none z-10">
              <span className="font-pixel text-[6px] font-bold py-0.5 px-0.5 bg-slate-950/75 text-amber-300 rounded-l border-y border-l border-slate-800">
                T
              </span>
            </div>

            {/* Visual Compass Rose Dial Overlay */}
            <div
              className={`absolute top-2 right-2 z-20 w-7 h-7 rounded-full bg-slate-950/90 border ${
                isCompassActive
                  ? 'border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.7)] ring-1 ring-amber-300/60'
                  : 'border-slate-700/80 shadow-md'
              } backdrop-blur-xs flex items-center justify-center pointer-events-none transition-all`}
              title="Kompas Navigasi: U = Utara, S = Selatan, T = Timur, B = Barat"
            >
              <span className="absolute top-0.5 text-[5.5px] font-black text-rose-400 leading-none">U</span>
              <span className="absolute bottom-0.5 text-[5px] font-bold text-slate-400 leading-none">S</span>
              <span className="absolute right-0.5 text-[5px] font-bold text-amber-300 leading-none">T</span>
              <span className="absolute left-0.5 text-[5px] font-bold text-slate-400 leading-none">B</span>
              <div
                className={`relative w-1 h-4 flex flex-col items-center justify-center ${
                  isCompassActive ? 'animate-pulse' : ''
                }`}
              >
                <div className="w-0 h-0 border-l-[2px] border-l-transparent border-r-[2px] border-r-transparent border-b-[6px] border-b-rose-500" />
                <div className="w-1 h-1 rounded-full bg-amber-300 border border-amber-500 z-10 my-[-0.5px]" />
                <div className="w-0 h-0 border-l-[2px] border-l-transparent border-r-[2px] border-r-transparent border-t-[6px] border-t-slate-300" />
              </div>
            </div>

            <canvas
              ref={canvasRef}
              width={MAP_W}
              height={MAP_H}
              onClick={handleMapClick}
              onTouchEnd={handleTouchMap}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="block w-[196px] sm:w-[204px] h-[143px] cursor-crosshair object-contain touch-none"
              title="Arah gerakan NPC diperbarui real-time. Klik titik peta untuk berjalan."
            />

            {/* Quick click-to-move overlay hint on hover */}
            <div className="absolute inset-x-0 bottom-0 py-0.5 bg-slate-950/80 text-[8px] text-amber-200 text-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity font-mono">
              Klik peta untuk jalan • Panah menunjukkan arah gerak
            </div>
          </div>

          {/* Real-time Hovered Target Inspector Info Box */}
          {hoveredInfo ? (
            <div className="bg-amber-950/60 border border-amber-500/50 rounded-lg p-1.5 text-[9px] flex flex-col gap-0.5 animate-in fade-in duration-100">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300 flex items-center gap-1 truncate">
                  {hoveredInfo.isQuestTarget ? '🎯' : hoveredInfo.isUnrecoveredZone ? '🌫️' : '👤'} {hoveredInfo.name}
                </span>
                {hoveredInfo.facing && (
                  <span className="text-[8px] text-amber-200/90 font-medium shrink-0">
                    {hoveredInfo.facing}
                  </span>
                )}
              </div>
              <div className="text-[8px] text-slate-300 truncate">
                {hoveredInfo.role || hoveredInfo.status}
              </div>
              {hoveredInfo.zoneHint && (
                <div className="text-[7.5px] text-amber-400 italic truncate">
                  {hoveredInfo.zoneHint}
                </div>
              )}
            </div>
          ) : (
            /* Current Player Zone Location Tag & Compass Mode */
            <div className="flex items-center justify-between text-[9px] text-slate-300 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800/80">
              <div className="flex items-center gap-1 truncate">
                <Navigation className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate font-medium text-slate-200">{currentZoneName}</span>
              </div>
              <span
                className={`text-[7px] font-pixel px-1 py-0.5 rounded border shrink-0 ${
                  isCompassActive
                    ? 'text-amber-300 bg-amber-950/60 border-amber-500/60 animate-pulse'
                    : 'text-slate-400 bg-slate-800/60 border-slate-700/60'
                }`}
              >
                {isCompassActive ? 'RESONANSI' : 'KOMPAS'}
              </span>
            </div>
          )}

          {/* Active Quest Quick Navigation Card */}
          {activeQuest && activeTargetNpc ? (
            <div
              onClick={() => {
                if (onNavigateToTile) {
                  onNavigateToTile(Math.round(activeTargetNpc.x), Math.round(activeTargetNpc.y));
                }
              }}
              title="Klik untuk auto-walk menuju target quest aktif"
              className="bg-amber-950/40 hover:bg-amber-950/70 border border-amber-500/40 hover:border-amber-400/70 rounded-lg p-1.5 flex items-center justify-between cursor-pointer transition active:scale-[0.98] group/quest"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-[10px] shrink-0 group-hover/quest:rotate-12 transition-transform shadow-[0_0_8px_rgba(251,191,36,0.6)]">
                  !
                </div>
                <div className="min-w-0">
                  <div className="text-[8px] font-pixel text-amber-300 truncate">
                    TARGET: {activeTargetNpc.name}
                  </div>
                  <div className="text-[8.5px] text-slate-300 flex items-center gap-1 truncate">
                    <span>{activeQuestZoneInfo ? activeQuestZoneInfo.name : 'Lembah'}</span>
                    <span className="text-slate-500">•</span>
                    <span
                      className={`text-[7.5px] font-semibold ${
                        activeQuestZoneInfo?.isRestored ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {activeQuestZoneInfo?.isRestored ? '✨ Pulih' : '🌫️ Belum Pulih'}
                    </span>
                  </div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover/quest:translate-x-0.5 transition-transform shrink-0" />
            </div>
          ) : (
            <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-lg p-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <div className="text-[8px] text-emerald-300 font-pixel">
                SEMUA MISI UTAMA SELESAI
              </div>
            </div>
          )}

          {/* Interactive Legend & Movement Indicators */}
          <div className="flex items-center justify-between text-[7.5px] text-slate-400 px-0.5 pt-0.5 border-t border-slate-800/60">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="flex items-center gap-0.5 text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> Kamu
              </span>
              <span className="flex items-center gap-0.5 text-amber-300 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" /> Warga ➔
              </span>
              <span className="flex items-center gap-0.5 text-amber-400 font-medium">
                <span className="w-2 h-2 bg-amber-500 rotate-45 inline-block text-[5px] text-slate-950 text-center leading-none" /> Misi [!]
              </span>
              <span className="flex items-center gap-0.5 text-slate-400">
                <span className="w-1.5 h-1.5 rounded-sm bg-slate-600 inline-block" /> Kelabu
              </span>
            </div>
            <span className="text-[7px] text-slate-500 font-pixel">[M] Tutup</span>
          </div>
        </div>
      )}
    </>
  );
};
