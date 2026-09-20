import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import {
  Map as MapIcon,
  X,
  Navigation,
  Compass,
  ArrowRight,
  Sparkles,
  ZoomIn,
  ZoomOut,
  LocateFixed,
  RotateCcw,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  HelpCircle,
} from 'lucide-react';
import { NPC, ZoneColorStatus, GameQuest } from '../types/game';
import { Player } from '../game/renderer';
import { MAP_COLS, MAP_ROWS, TILE } from '../game/constants';
import {
  MINI_TILE_PX,
  MINI_MAP_W,
  MINI_MAP_H,
  renderTexturedTile,
  drawPixelTextWithShadow,
} from '../game/miniMapTextures';
import { sound } from '../utils/audio';
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

  // Zoom & Pan System:
  // 1.0x (full map overview) up to 3.0x (detailed close-up)
  const [zoom, setZoom] = useState<number>(1.0);
  const [isFollowingPlayer, setIsFollowingPlayer] = useState<boolean>(true);
  const [isDraggingMap, setIsDraggingMap] = useState<boolean>(false);

  const zoomRef = useRef<number>(1.0);
  const panRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const followPlayerRef = useRef<boolean>(true);

  const isPointerDownRef = useRef<boolean>(false);
  const dragStartRef = useRef<{
    clientX: number;
    clientY: number;
    panX: number;
    panY: number;
    hasMoved: boolean;
  }>({ clientX: 0, clientY: 0, panX: 0, panY: 0, hasMoved: false });
  const pinchDistRef = useRef<number | null>(null);

  // Synchronize ref values with component state
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    followPlayerRef.current = isFollowingPlayer;
  }, [isFollowingPlayer]);

  // Zoom control helpers
  const handleZoomIn = useCallback(() => {
    sound.playMenuSelect();
    setZoom((prev) => Math.min(3.0, Math.round((prev + 0.5) * 10) / 10));
  }, []);

  const handleZoomOut = useCallback(() => {
    sound.playMenuSelect();
    setZoom((prev) => {
      const next = Math.max(1.0, Math.round((prev - 0.5) * 10) / 10);
      if (next <= 1.0) {
        setIsFollowingPlayer(true);
        panRef.current = { x: 0, y: 0 };
      }
      return next;
    });
  }, []);

  const handleResetZoom = useCallback(() => {
    sound.playMenuSelect();
    setZoom(1.0);
    setIsFollowingPlayer(true);
    panRef.current = { x: 0, y: 0 };
  }, []);

  const handleCenterOnPlayer = useCallback(() => {
    sound.playMenuSelect();
    setIsFollowingPlayer(true);
    if (zoomRef.current <= 1.0) {
      setZoom(1.5);
    }
  }, []);

  const handleCycleZoom = useCallback(() => {
    sound.playMenuSelect();
    setZoom((prev) => {
      if (prev >= 3.0) {
        setIsFollowingPlayer(true);
        panRef.current = { x: 0, y: 0 };
        return 1.0;
      }
      return Math.min(3.0, Math.round((prev + 0.5) * 10) / 10);
    });
  }, []);

  // Keyboard shortcut support (+, -, 0, C) when map is open
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName;
      if (targetTag === 'INPUT' || targetTag === 'TEXTAREA') return;

      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === '0') {
        e.preventDefault();
        handleResetZoom();
      } else if (e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleCenterOnPlayer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleZoomIn, handleZoomOut, handleResetZoom, handleCenterOnPlayer]);

  // Non-passive mouse wheel zooming on map canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isOpen) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.deltaY < 0) {
        setZoom((prev) => Math.min(3.0, Math.round((prev + 0.25) * 100) / 100));
      } else if (e.deltaY > 0) {
        setZoom((prev) => {
          const next = Math.max(1.0, Math.round((prev - 0.25) * 100) / 100);
          if (next <= 1.0) {
            setIsFollowingPlayer(true);
            panRef.current = { x: 0, y: 0 };
          }
          return next;
        });
      }
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [isOpen]);

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
      return { id: 'plaza', name: 'Alun-Alun Nada', isRestored: zoneStatus.plaza };
    }
    if (target === 'kakek_ranu' || activeQuest.id === 'quest_bridge') {
      return { id: 'bridge', name: 'Jembatan Kayu Ranu', isRestored: zoneStatus.bridge };
    }
    if (target === 'bimo' || activeQuest.id === 'quest_bimo') {
      return { id: 'forest', name: 'Hutan Sunyi Refleksi', isRestored: zoneStatus.forest };
    }
    if (target === 'penjaga_kabut' || target === 'tetua_wilis' || activeQuest.id === 'quest_tower') {
      return { id: 'tower', name: 'Menara Jam Harmoni', isRestored: zoneStatus.tower };
    }
    return null;
  }, [activeQuest, zoneStatus]);

  // Pre-render static textured terrain to an offscreen canvas for optimal 60 FPS performance
  useEffect(() => {
    const offCanvas = document.createElement('canvas');
    offCanvas.width = MINI_MAP_W;
    offCanvas.height = MINI_MAP_H;
    const ctx = offCanvas.getContext('2d');
    if (!ctx) return;

    // Crisp pixel rendering without interpolation
    ctx.imageSmoothingEnabled = false;

    // Deep slate background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, MINI_MAP_W, MINI_MAP_H);

    for (let r = 0; r < MAP_ROWS; r++) {
      for (let c = 0; c < MAP_COLS; c++) {
        const tile = mapLayout[r]?.[c] ?? TILE.GRASS;
        renderTexturedTile(ctx, tile, c, r, zoneStatus.bridge, zoneStatus.tower);
      }
    }

    staticMapCanvasRef.current = offCanvas;
  }, [mapLayout, zoneStatus.bridge, zoneStatus.tower]);

  // Mini-map dynamic rendering loop (Real-time player position, NPC facing, active quest beacons)
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

      const p = playerRef.current;
      const tileCol = p.x / 32;
      const tileRow = p.y / 32;
      const px = tileCol * MINI_TILE_PX + MINI_TILE_PX / 2;
      const py = tileRow * MINI_TILE_PX + MINI_TILE_PX / 2;

      const curZoom = zoomRef.current;
      const viewW = MINI_MAP_W / curZoom;
      const viewH = MINI_MAP_H / curZoom;
      const maxPanX = Math.max(0, MINI_MAP_W - viewW);
      const maxPanY = Math.max(0, MINI_MAP_H - viewH);

      if (curZoom <= 1.0) {
        panRef.current = { x: 0, y: 0 };
      } else if (followPlayerRef.current) {
        const targetPanX = Math.max(0, Math.min(maxPanX, px - viewW / 2));
        const targetPanY = Math.max(0, Math.min(maxPanY, py - viewH / 2));
        panRef.current.x += (targetPanX - panRef.current.x) * 0.22;
        panRef.current.y += (targetPanY - panRef.current.y) * 0.22;
      } else {
        panRef.current.x = Math.max(0, Math.min(maxPanX, panRef.current.x));
        panRef.current.y = Math.max(0, Math.min(maxPanY, panRef.current.y));
      }

      const curPanX = panRef.current.x;
      const curPanY = panRef.current.y;

      // Clear the canvas
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, MINI_MAP_W, MINI_MAP_H);

      ctx.save();
      ctx.imageSmoothingEnabled = false;

      // Apply zoom & pan transformation
      ctx.scale(curZoom, curZoom);
      ctx.translate(-curPanX, -curPanY);

      // 1. Draw pre-rendered textured terrain
      if (staticMapCanvasRef.current) {
        ctx.drawImage(staticMapCanvasRef.current, 0, 0);
      } else {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, MINI_MAP_W, MINI_MAP_H);
      }

      // 2. Zone Restoration & Fog of Isolation Overlays
      const ZONES_CONFIG = [
        {
          id: 'plaza',
          name: 'ALUN-ALUN',
          x: 4 * MINI_TILE_PX,
          y: 10 * MINI_TILE_PX,
          w: 15 * MINI_TILE_PX,
          h: 11 * MINI_TILE_PX,
          isRestored: zoneStatus.plaza,
          isQuestZone: activeQuest?.targetNPC === 'kiki',
          restoredColor: 'rgba(245, 158, 11, 0.18)',
          labelX: 11.5 * MINI_TILE_PX,
          labelY: 14 * MINI_TILE_PX,
        },
        {
          id: 'forest',
          name: 'HUTAN SUNYI',
          x: 1 * MINI_TILE_PX,
          y: 1 * MINI_TILE_PX,
          w: 14 * MINI_TILE_PX,
          h: 8 * MINI_TILE_PX,
          isRestored: zoneStatus.forest,
          isQuestZone: activeQuest?.targetNPC === 'bimo',
          restoredColor: 'rgba(16, 185, 129, 0.20)',
          labelX: 8 * MINI_TILE_PX,
          labelY: 4.5 * MINI_TILE_PX,
        },
        {
          id: 'bridge',
          name: 'JEMBATAN KAYU',
          x: 20 * MINI_TILE_PX,
          y: 13 * MINI_TILE_PX,
          w: 5 * MINI_TILE_PX,
          h: 4 * MINI_TILE_PX,
          isRestored: zoneStatus.bridge,
          isQuestZone: activeQuest?.targetNPC === 'kakek_ranu',
          restoredColor: 'rgba(249, 115, 22, 0.22)',
          labelX: 22.5 * MINI_TILE_PX,
          labelY: 15 * MINI_TILE_PX,
        },
        {
          id: 'tower',
          name: 'MENARA JAM',
          x: 26 * MINI_TILE_PX,
          y: 2 * MINI_TILE_PX,
          w: 8 * MINI_TILE_PX,
          h: 7 * MINI_TILE_PX,
          isRestored: zoneStatus.tower,
          isQuestZone:
            activeQuest?.targetNPC === 'penjaga_kabut' ||
            activeQuest?.targetNPC === 'tetua_wilis',
          restoredColor: 'rgba(234, 179, 8, 0.22)',
          labelX: 30 * MINI_TILE_PX,
          labelY: 4.5 * MINI_TILE_PX,
        },
      ];

      for (const zone of ZONES_CONFIG) {
        if (zone.isRestored) {
          // Restored zone: radiant emerald/amber tint with crisp border
          ctx.fillStyle = zone.restoredColor;
          ctx.fillRect(zone.x, zone.y, zone.w, zone.h);

          ctx.strokeStyle = 'rgba(52, 211, 153, 0.45)';
          ctx.lineWidth = 1;
          ctx.strokeRect(zone.x, zone.y, zone.w, zone.h);
        } else {
          // Unrecovered area: desaturated cold isolation fog overlay
          ctx.fillStyle = 'rgba(30, 41, 59, 0.48)';
          ctx.fillRect(zone.x, zone.y, zone.w, zone.h);

          // Subtle drifting pixel fog particles
          const fogShift = (tick * 0.25) % (zone.w + 16);
          ctx.fillStyle = 'rgba(148, 163, 184, 0.15)';
          ctx.fillRect(zone.x + fogShift - 10, zone.y + 2, 8, zone.h - 4);

          if (zone.isQuestZone) {
            // Animated pulsing golden quest zone border
            ctx.save();
            ctx.setLineDash([4, 3]);
            ctx.lineDashOffset = -tick * 0.5;
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 1.8;
            ctx.strokeRect(zone.x, zone.y, zone.w, zone.h);
            ctx.restore();
          } else {
            // Subdued dashed outline
            ctx.save();
            ctx.setLineDash([2, 3]);
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
            ctx.lineWidth = 1;
            ctx.strokeRect(zone.x, zone.y, zone.w, zone.h);
            ctx.restore();
          }
        }
      }

      // 3. Crisp Typography: Landmark Labels with 1px Shadow / Outline
      for (const zone of ZONES_CONFIG) {
        const titleColor = zone.isRestored
          ? '#fef08a'
          : zone.isQuestZone
          ? '#fbbf24'
          : '#e2e8f0';

        drawPixelTextWithShadow(
          ctx,
          zone.name,
          zone.labelX,
          zone.labelY,
          titleColor,
          '#000000',
          'bold 9px "Pixelify Sans", sans-serif'
        );

        // Status pill text below title
        const statusText = zone.isRestored ? 'PULIH ✨' : 'BELUM PULIH';
        const statusColor = zone.isRestored ? '#34d399' : '#f87171';

        drawPixelTextWithShadow(
          ctx,
          statusText,
          zone.labelX,
          zone.labelY + 8,
          statusColor,
          '#000000',
          'bold 7.5px "Pixelify Sans", sans-serif'
        );
      }

      // Secondary Agricultural Labels
      drawPixelTextWithShadow(
        ctx,
        'KEBUN',
        8 * MINI_TILE_PX,
        22 * MINI_TILE_PX,
        'rgba(254, 240, 138, 0.85)',
        '#000000',
        'bold 8px "Pixelify Sans", sans-serif'
      );
      drawPixelTextWithShadow(
        ctx,
        'BUAH',
        26 * MINI_TILE_PX,
        23 * MINI_TILE_PX,
        'rgba(254, 240, 138, 0.85)',
        '#000000',
        'bold 8px "Pixelify Sans", sans-serif'
      );

      // 4. Draw NPCs with Real-Time Direction & Iconic Quest Badges
      for (const npc of npcs) {
        const nx = npc.x * MINI_TILE_PX + MINI_TILE_PX / 2;
        const ny = npc.y * MINI_TILE_PX + MINI_TILE_PX / 2;
        const isQuestTarget = Boolean(activeQuest && npc.id === activeQuest.targetNPC);

        // Facing direction vector
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

        // A. Forward field of movement
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(nx, ny);
        ctx.arc(nx, ny, isQuestTarget ? 9 : 6.5, angle - 0.45, angle + 0.45);
        ctx.closePath();
        ctx.fillStyle = isQuestTarget
          ? 'rgba(245, 158, 11, 0.35)'
          : npc.isResolved
          ? 'rgba(52, 211, 153, 0.25)'
          : 'rgba(251, 191, 36, 0.25)';
        ctx.fill();
        ctx.restore();

        // B. Directional Pointer Arrow
        const tipDist = isQuestTarget ? 8 : 6.5;
        const baseDist = isQuestTarget ? 4.5 : 3.5;
        const halfW = isQuestTarget ? 3.5 : 2.5;

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
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#090d16';
        ctx.stroke();

        // C. Center Villager Marker with Pixel Character Silhouette
        const markerRadius = isQuestTarget ? 4.5 : 3.5;
        ctx.beginPath();
        ctx.arc(nx, ny, markerRadius, 0, Math.PI * 2);
        ctx.fillStyle = isQuestTarget
          ? '#f59e0b'
          : npc.isResolved
          ? '#34d399'
          : '#fbbf24';
        ctx.fill();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = '#090d16';
        ctx.stroke();

        // D. Pulsing rings for unresolved NPCs
        if (!npc.isResolved && !isQuestTarget) {
          const pulse = (Math.sin(tick * 0.1) + 1) * 1.5;
          ctx.beginPath();
          ctx.arc(nx, ny, markerRadius + pulse, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // E. Dedicated High-Impact Active Quest Marker & Beacon
        if (isQuestTarget) {
          // Multi-wave radar pulses
          const radarWave = (tick % 40) / 40;
          ctx.beginPath();
          ctx.arc(nx, ny, 5 + radarWave * 12, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(245, 158, 11, ${1 - radarWave})`;
          ctx.lineWidth = 1.8;
          ctx.stroke();

          // Floating bobbing Quest Badge with Exclamation Mark '!'
          const bob = Math.sin(tick * 0.15) * 2;
          const badgeY = ny - 12 + bob;

          ctx.save();
          // Outer circular badge
          ctx.beginPath();
          ctx.arc(nx, badgeY, 6, 0, Math.PI * 2);
          ctx.fillStyle = '#f59e0b';
          ctx.fill();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = '#090d16';
          ctx.stroke();

          // Inner gold ring
          ctx.beginPath();
          ctx.arc(nx, badgeY, 4.5, 0, Math.PI * 2);
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Bold Exclamation Mark '!'
          ctx.font = 'bold 8px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#090d16';
          ctx.fillText('!', nx, badgeY + 0.5);

          // Top label
          drawPixelTextWithShadow(
            ctx,
            'TARGET',
            nx,
            badgeY - 8,
            '#fef08a',
            '#000000',
            'bold 7.5px "Pixelify Sans", sans-serif'
          );
          ctx.restore();

          // Animated golden dash guide line from player to active quest target
          ctx.save();
          ctx.setLineDash([3, 3]);
          ctx.lineDashOffset = -tick * 0.5;
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.65)';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(nx, ny);
          ctx.stroke();
          ctx.restore();
        }
      }

      // 6. Draw Player ("Kamu") Character Sprite with High-Contrast Directional Indicator
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
      const pTipDist = 7.5;
      const pBaseDist = 4;
      const pHalfW = 3;
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
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#022c22';
      ctx.stroke();

      // Sonar pulse wave beneath player feet
      const radarPhase = (tick % 36) / 36;
      const radarRadius = 3.5 + radarPhase * 10;
      const radarAlpha = 1 - radarPhase;
      ctx.beginPath();
      ctx.arc(px, py, radarRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(52, 211, 153, ${radarAlpha})`;
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Authentic Mini Pixel Character Sprite for Player:
      // Red cap, hair, skin face with eyes, and blue adventurer tunic
      ctx.save();
      const sx = Math.round(px);
      const sy = Math.round(py);

      // Outer drop shadow
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(sx - 3, sy + 3, 6, 2);

      // Red adventurer cap
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(sx - 3, sy - 5, 6, 2);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(sx - 2, sy - 6, 4, 1);

      // Hair
      ctx.fillStyle = '#78350f';
      ctx.fillRect(sx - 3, sy - 3, 6, 1);

      // Skin face
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(sx - 2, sy - 2, 4, 2);

      // Eyes
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(sx - 1, sy - 2, 1, 1);
      ctx.fillRect(sx + 1, sy - 2, 1, 1);

      // Blue tunic
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(sx - 2, sy, 4, 3);

      // Belt
      ctx.fillStyle = '#facc15';
      ctx.fillRect(sx - 1, sy + 1, 2, 1);

      // Sturdy outline
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(sx - 3.5, sy - 6.5, 7, 10);
      ctx.restore();

      // Restore zoom & pan canvas transformation
      ctx.restore();

      // Picture-in-Picture (PiP) Radar Thumbnail when zoomed in
      if (curZoom > 1.05 && staticMapCanvasRef.current) {
        const pipW = 46;
        const pipH = Math.round(pipW * (MINI_MAP_H / MINI_MAP_W)); // ~36px
        const pipX = MINI_MAP_W - pipW - 4;
        const pipY = MINI_MAP_H - pipH - 4;

        ctx.save();
        // Semi-transparent dark background
        ctx.fillStyle = 'rgba(9, 13, 22, 0.92)';
        ctx.fillRect(pipX - 1.5, pipY - 1.5, pipW + 3, pipH + 3);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.strokeRect(pipX - 1.5, pipY - 1.5, pipW + 3, pipH + 3);

        // Pre-rendered map terrain thumbnail
        ctx.drawImage(staticMapCanvasRef.current, pipX, pipY, pipW, pipH);

        // Viewport highlight
        const vpX = pipX + (curPanX / MINI_MAP_W) * pipW;
        const vpY = pipY + (curPanY / MINI_MAP_H) * pipH;
        const vpW = (viewW / MINI_MAP_W) * pipW;
        const vpH = (viewH / MINI_MAP_H) * pipH;

        ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
        ctx.fillRect(vpX, vpY, vpW, vpH);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1;
        ctx.strokeRect(vpX, vpY, vpW, vpH);

        // Player marker on PiP radar
        const miniPlayerX = pipX + (px / MINI_MAP_W) * pipW;
        const miniPlayerY = pipY + (py / MINI_MAP_H) * pipH;
        ctx.fillStyle = '#10b981';
        ctx.fillRect(miniPlayerX - 1, miniPlayerY - 1, 2, 2);
        ctx.restore();
      }

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

  // Coordinate conversion helper taking zoom and pan offset into account
  const getMapWorldCoords = (clientX: number, clientY: number) => {
    if (!canvasRef.current) return null;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = MINI_MAP_W / rect.width;
    const scaleY = MINI_MAP_H / rect.height;

    const rawCanvasX = (clientX - rect.left) * scaleX;
    const rawCanvasY = (clientY - rect.top) * scaleY;

    const curZoom = zoomRef.current;
    const curPanX = panRef.current.x;
    const curPanY = panRef.current.y;

    const worldX = rawCanvasX / curZoom + curPanX;
    const worldY = rawCanvasY / curZoom + curPanY;

    return { worldX, worldY, rect, scaleX, scaleY };
  };

  // Trigger tile auto-walk navigation
  const triggerNavigateAtClientCoord = (clientX: number, clientY: number) => {
    if (!onNavigateToTile) return;
    const coords = getMapWorldCoords(clientX, clientY);
    if (!coords) return;

    const tileX = Math.floor(coords.worldX / MINI_TILE_PX);
    const tileY = Math.floor(coords.worldY / MINI_TILE_PX);

    if (tileX >= 0 && tileX < MAP_COLS && tileY >= 0 && tileY < MAP_ROWS) {
      onNavigateToTile(tileX, tileY);
    }
  };

  // Mouse drag & pan handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return;
    isPointerDownRef.current = true;
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      panX: panRef.current.x,
      panY: panRef.current.y,
      hasMoved: false,
    };
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPointerDownRef.current && !dragStartRef.current.hasMoved) {
      triggerNavigateAtClientCoord(e.clientX, e.clientY);
    }
    isPointerDownRef.current = false;
    setIsDraggingMap(false);
  };

  // Mouse move handler: handles both drag panning and hover inspection
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPointerDownRef.current) {
      const dx = e.clientX - dragStartRef.current.clientX;
      const dy = e.clientY - dragStartRef.current.clientY;
      if (Math.hypot(dx, dy) > 4) {
        dragStartRef.current.hasMoved = true;
        setIsDraggingMap(true);
        if (zoomRef.current > 1.0) {
          followPlayerRef.current = false;
          setIsFollowingPlayer(false);
          const rect = canvasRef.current?.getBoundingClientRect();
          if (rect) {
            const factorX = (MINI_MAP_W / rect.width) / zoomRef.current;
            const factorY = (MINI_MAP_H / rect.height) / zoomRef.current;
            const viewW = MINI_MAP_W / zoomRef.current;
            const viewH = MINI_MAP_H / zoomRef.current;
            const maxPanX = Math.max(0, MINI_MAP_W - viewW);
            const maxPanY = Math.max(0, MINI_MAP_H - viewH);
            panRef.current.x = Math.max(0, Math.min(maxPanX, dragStartRef.current.panX - dx * factorX));
            panRef.current.y = Math.max(0, Math.min(maxPanY, dragStartRef.current.panY - dy * factorY));
          }
        }
      }
    }

    // Real-time hover inspection converted via zoom and pan
    const coords = getMapWorldCoords(e.clientX, e.clientY);
    if (!coords) return;
    const { worldX, worldY } = coords;

    // Check if hovering near an NPC
    for (const npc of npcs) {
      const nx = npc.x * MINI_TILE_PX + MINI_TILE_PX / 2;
      const ny = npc.y * MINI_TILE_PX + MINI_TILE_PX / 2;
      const dist = Math.hypot(worldX - nx, worldY - ny);
      if (dist <= 9) {
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
            ? 'Target Misi Aktif!'
            : npc.isResolved
            ? 'Harmoni Pulih ✨'
            : 'Belum Selesai 🌫️',
          isQuestTarget,
        });
        return;
      }
    }

    // Check if hovering over key zones
    const tileCol = worldX / MINI_TILE_PX;
    const tileRow = worldY / MINI_TILE_PX;
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
    isPointerDownRef.current = false;
    setIsDraggingMap(false);
    setHoveredInfo(null);
  };

  // Touch event handlers for mobile / tablet (single-finger pan, tap, two-finger pinch)
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      pinchDistRef.current = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      isPointerDownRef.current = false;
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      isPointerDownRef.current = true;
      dragStartRef.current = {
        clientX: touch.clientX,
        clientY: touch.clientY,
        panX: panRef.current.x,
        panY: panRef.current.y,
        hasMoved: false,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 2 && pinchDistRef.current !== null) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const newDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const ratio = newDist / pinchDistRef.current;
      if (Math.abs(ratio - 1) > 0.05) {
        setZoom((prev) => {
          const next = Math.min(3.0, Math.max(1.0, prev * (ratio > 1 ? 1.08 : 0.92)));
          return Math.round(next * 10) / 10;
        });
        pinchDistRef.current = newDist;
      }
      return;
    }

    if (e.touches.length === 1 && isPointerDownRef.current) {
      const touch = e.touches[0];
      const dx = touch.clientX - dragStartRef.current.clientX;
      const dy = touch.clientY - dragStartRef.current.clientY;
      if (Math.hypot(dx, dy) > 6) {
        dragStartRef.current.hasMoved = true;
        setIsDraggingMap(true);
        if (zoomRef.current > 1.0) {
          followPlayerRef.current = false;
          setIsFollowingPlayer(false);
          const rect = canvasRef.current?.getBoundingClientRect();
          if (rect) {
            const factorX = (MINI_MAP_W / rect.width) / zoomRef.current;
            const factorY = (MINI_MAP_H / rect.height) / zoomRef.current;
            const viewW = MINI_MAP_W / zoomRef.current;
            const viewH = MINI_MAP_H / zoomRef.current;
            const maxPanX = Math.max(0, MINI_MAP_W - viewW);
            const maxPanY = Math.max(0, MINI_MAP_H - viewH);
            panRef.current.x = Math.max(0, Math.min(maxPanX, dragStartRef.current.panX - dx * factorX));
            panRef.current.y = Math.max(0, Math.min(maxPanY, dragStartRef.current.panY - dy * factorY));
          }
        }
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (pinchDistRef.current !== null && e.touches.length < 2) {
      pinchDistRef.current = null;
    }
    if (isPointerDownRef.current && !dragStartRef.current.hasMoved) {
      const touch = e.changedTouches[0];
      if (touch) {
        triggerNavigateAtClientCoord(touch.clientX, touch.clientY);
      }
    }
    isPointerDownRef.current = false;
    setIsDraggingMap(false);
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

  // Screen optimization states:
  // - Default to compact mode (Tampilan Ringkas) immediately when game starts to keep screen clear
  const [isCompact, setIsCompact] = useState<boolean>(true);
  const [isTranslucent, setIsTranslucent] = useState<boolean>(false);
  const [showMobileLegend, setShowMobileLegend] = useState<boolean>(false);

  const isEffectiveCompact = isCompact;

  // Responsive position calculation:
  // - Mobile Portrait: docked neatly bottom-right above action buttons, leaving the entire left & center free
  // - Mobile Landscape: docked top-right below top-bar, leaving the action buttons and joystick 100% free
  // - Desktop: standard bottom-right
  const containerPosition = isMobileOrTablet
    ? isPortrait
      ? 'bottom-[68px] sm:bottom-[76px] right-2 sm:right-4'
      : 'top-11 right-2 sm:right-3'
    : 'bottom-4 right-4';

  const containerWidthClass = isMobileOrTablet
    ? isEffectiveCompact
      ? isPortrait
        ? 'w-[170px]'
        : 'w-[158px]'
      : 'w-[228px] max-h-[82vh] sm:max-h-[88vh] overflow-y-auto'
    : 'w-[240px] sm:w-[252px]';

  const canvasDisplayClass = isMobileOrTablet
    ? isEffectiveCompact
      ? isPortrait
        ? 'w-[154px] h-[120px]'
        : 'w-[144px] h-[112px]'
      : 'w-[208px] h-[162px]'
    : 'w-[220px] sm:w-[230px] h-[171px] sm:h-[179px]';

  const backdropClass = isTranslucent
    ? 'bg-slate-950/75 border-amber-500/70 shadow-[0_0_20px_rgba(0,0,0,0.7)] backdrop-blur-xs'
    : 'bg-slate-950/95 border-amber-500/80 shadow-[0_0_35px_rgba(0,0,0,0.9)] backdrop-blur-md';

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen ? (
        <button
          id="btn-open-minimap"
          onClick={() => {
            sound.playMenuSelect();
            onToggle();
          }}
          title="Buka Peta Mini [M]"
          className={`fixed ${containerPosition} z-30 pointer-events-auto bg-slate-950/95 border-2 border-amber-500/70 hover:bg-slate-900 active:bg-amber-500/20 text-amber-300 rounded-xl px-2.5 sm:px-3 py-1.5 shadow-2xl backdrop-blur-md flex items-center gap-1.5 sm:gap-2 transition active:scale-95 group`}
        >
          <MapIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
          <span className="font-pixel text-[8.5px] sm:text-[9px] font-bold">PETA</span>
          {activeQuest && (
            <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-amber-400 text-slate-950 text-[7.5px] sm:text-[8px] font-bold animate-pulse">
              !
            </span>
          )}
          <span className="hidden md:inline text-[9px] text-slate-400 font-mono">[M]</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        </button>
      ) : (
        /* Pixel-Art Mini-Map HUD Card (Optimized for Mobile Portrait, Landscape & Desktop) */
        <div
          id="minimap-overlay-container"
          className={`fixed ${containerPosition} z-30 pointer-events-auto select-none ${backdropClass} border-2 rounded-2xl ${
            isEffectiveCompact ? 'p-2 gap-1.5' : 'p-2.5 sm:p-3 gap-2'
          } ${containerWidthClass} flex flex-col animate-in fade-in zoom-in-95 duration-150`}
        >
          {/* Header with Visual Energy Gauge, Opacity Toggle, Size Toggle & Close Button */}
          {isEffectiveCompact ? (
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-1">
              <div className="flex items-center gap-1 min-w-0">
                <Compass
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isCompassActive
                      ? 'text-amber-300 animate-spin-slow drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]'
                      : 'text-amber-400'
                  }`}
                />
                <span className="font-pixel text-[8px] text-amber-300 font-bold tracking-tight">
                  PETA
                </span>

                {/* 4 Micro Harmonic Energy Vials */}
                <div
                  className="flex items-center gap-0.5 bg-slate-900/90 border border-slate-700/80 rounded px-1 py-0.5 ml-1"
                  title={`Zona Pulih: ${restoredCount}/4 (A: Alun-Alun, J: Jembatan, H: Hutan, M: Menara)`}
                >
                  <span
                    className={`w-1.5 h-2 rounded-xs transition-colors ${
                      zoneStatus.plaza ? 'bg-amber-400 shadow-[0_0_4px_rgba(245,158,11,0.8)]' : 'bg-slate-700'
                    }`}
                  />
                  <span
                    className={`w-1.5 h-2 rounded-xs transition-colors ${
                      zoneStatus.bridge ? 'bg-orange-400 shadow-[0_0_4px_rgba(249,115,22,0.8)]' : 'bg-slate-700'
                    }`}
                  />
                  <span
                    className={`w-1.5 h-2 rounded-xs transition-colors ${
                      zoneStatus.forest ? 'bg-emerald-400 shadow-[0_0_4px_rgba(16,185,129,0.8)]' : 'bg-slate-700'
                    }`}
                  />
                  <span
                    className={`w-1.5 h-2 rounded-xs transition-colors ${
                      zoneStatus.tower ? 'bg-yellow-400 shadow-[0_0_4px_rgba(234,179,8,0.8)]' : 'bg-slate-700'
                    }`}
                  />
                  <span className="font-pixel text-[6.5px] ml-0.5 text-amber-300 font-bold">
                    {restoredCount}/4
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-0.5">
                {/* Opacity toggle */}
                <button
                  onClick={() => {
                    sound.playMenuSelect();
                    setIsTranslucent((prev) => !prev);
                  }}
                  title={isTranslucent ? 'Tampilan Padat' : 'Tampilan Transparan'}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-300 transition"
                >
                  {isTranslucent ? <Eye className="w-3 h-3 text-amber-400" /> : <EyeOff className="w-3 h-3" />}
                </button>

                {/* Expand to Full View */}
                <button
                  onClick={() => {
                    sound.playMenuSelect();
                    setIsCompact(false);
                  }}
                  title="Perbesar Peta (Tampilan Lengkap)"
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-300 transition"
                >
                  <Maximize2 className="w-3 h-3 text-amber-400" />
                </button>

                {/* Close button */}
                <button
                  id="btn-close-minimap"
                  onClick={() => {
                    sound.playMenuSelect();
                    onToggle();
                  }}
                  title="Tutup Peta [M]"
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-1.5">
                <Compass
                  className={`w-4 h-4 ${
                    isCompassActive
                      ? 'text-amber-300 animate-spin-slow drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]'
                      : 'text-amber-400'
                  }`}
                />
                <span className="font-pixel text-[8.5px] text-amber-300 font-bold tracking-tight">
                  PETA DUNIA
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* 4-Vial Harmonic Energy Reservoir (Visual Progress Indicator) */}
                <div
                  className="flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 rounded-lg px-1.5 py-0.5 shadow-inner"
                  title={`Progres Harmoni Zona: ${restoredCount}/4 Pulih (A: Alun-Alun, J: Jembatan, H: Hutan, M: Menara)`}
                >
                  {/* Plaza Vial (Amber) */}
                  <div
                    className="flex flex-col items-center"
                    title={`Alun-Alun: ${zoneStatus.plaza ? 'Harmoni Pulih ✨' : 'Belum Pulih 🌫️'}`}
                  >
                    <div
                      className={`w-2.5 h-3.5 rounded-xs border flex items-end p-0.5 transition-all ${
                        zoneStatus.plaza
                          ? 'border-amber-400 bg-amber-950/80 shadow-[0_0_5px_rgba(245,158,11,0.7)]'
                          : 'border-slate-700 bg-slate-950/80 opacity-50'
                      }`}
                    >
                      <div
                        className={`w-full rounded-xs transition-all ${
                          zoneStatus.plaza ? 'h-full bg-amber-400 animate-pulse' : 'h-0.5 bg-slate-700'
                        }`}
                      />
                    </div>
                    <span
                      className={`text-[5.5px] font-pixel font-bold mt-0.5 ${
                        zoneStatus.plaza ? 'text-amber-300' : 'text-slate-500'
                      }`}
                    >
                      A
                    </span>
                  </div>

                  {/* Bridge Vial (Orange) */}
                  <div
                    className="flex flex-col items-center"
                    title={`Jembatan: ${zoneStatus.bridge ? 'Harmoni Pulih ✨' : 'Belum Pulih 🌫️'}`}
                  >
                    <div
                      className={`w-2.5 h-3.5 rounded-xs border flex items-end p-0.5 transition-all ${
                        zoneStatus.bridge
                          ? 'border-orange-400 bg-orange-950/80 shadow-[0_0_5px_rgba(249,115,22,0.7)]'
                          : 'border-slate-700 bg-slate-950/80 opacity-50'
                      }`}
                    >
                      <div
                        className={`w-full rounded-xs transition-all ${
                          zoneStatus.bridge ? 'h-full bg-orange-400 animate-pulse' : 'h-0.5 bg-slate-700'
                        }`}
                      />
                    </div>
                    <span
                      className={`text-[5.5px] font-pixel font-bold mt-0.5 ${
                        zoneStatus.bridge ? 'text-orange-300' : 'text-slate-500'
                      }`}
                    >
                      J
                    </span>
                  </div>

                  {/* Forest Vial (Emerald) */}
                  <div
                    className="flex flex-col items-center"
                    title={`Hutan Sunyi: ${zoneStatus.forest ? 'Harmoni Pulih ✨' : 'Belum Pulih 🌫️'}`}
                  >
                    <div
                      className={`w-2.5 h-3.5 rounded-xs border flex items-end p-0.5 transition-all ${
                        zoneStatus.forest
                          ? 'border-emerald-400 bg-emerald-950/80 shadow-[0_0_5px_rgba(16,185,129,0.7)]'
                          : 'border-slate-700 bg-slate-950/80 opacity-50'
                      }`}
                    >
                      <div
                        className={`w-full rounded-xs transition-all ${
                          zoneStatus.forest ? 'h-full bg-emerald-400 animate-pulse' : 'h-0.5 bg-slate-700'
                        }`}
                      />
                    </div>
                    <span
                      className={`text-[5.5px] font-pixel font-bold mt-0.5 ${
                        zoneStatus.forest ? 'text-emerald-300' : 'text-slate-500'
                      }`}
                    >
                      H
                    </span>
                  </div>

                  {/* Tower Vial (Yellow) */}
                  <div
                    className="flex flex-col items-center"
                    title={`Menara Jam: ${zoneStatus.tower ? 'Harmoni Pulih ✨' : 'Belum Pulih 🌫️'}`}
                  >
                    <div
                      className={`w-2.5 h-3.5 rounded-xs border flex items-end p-0.5 transition-all ${
                        zoneStatus.tower
                          ? 'border-yellow-400 bg-yellow-950/80 shadow-[0_0_5px_rgba(234,179,8,0.7)]'
                          : 'border-slate-700 bg-slate-950/80 opacity-50'
                      }`}
                    >
                      <div
                        className={`w-full rounded-xs transition-all ${
                          zoneStatus.tower ? 'h-full bg-yellow-400 animate-pulse' : 'h-0.5 bg-slate-700'
                        }`}
                      />
                    </div>
                    <span
                      className={`text-[5.5px] font-pixel font-bold mt-0.5 ${
                        zoneStatus.tower ? 'text-yellow-300' : 'text-slate-500'
                      }`}
                    >
                      M
                    </span>
                  </div>

                  {/* Counter Tag */}
                  <span
                    className={`font-pixel text-[7px] ml-1 px-1 py-0.5 rounded border font-bold ${
                      restoredCount === 4
                        ? 'text-emerald-300 bg-emerald-950/80 border-emerald-500/80 shadow-[0_0_6px_rgba(52,211,153,0.4)]'
                        : 'text-amber-300 bg-amber-950/70 border-amber-800/80'
                    }`}
                  >
                    {restoredCount}/4
                  </span>
                </div>

                {/* Opacity toggle */}
                <button
                  onClick={() => {
                    sound.playMenuSelect();
                    setIsTranslucent((prev) => !prev);
                  }}
                  title={isTranslucent ? 'Tampilan Padat' : 'Tampilan Transparan'}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-300 transition"
                >
                  {isTranslucent ? <Eye className="w-3.5 h-3.5 text-amber-400" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>

                {/* Minimize to compact */}
                <button
                  onClick={() => {
                    sound.playMenuSelect();
                    setIsCompact(true);
                  }}
                  title="Mode Ringkas (Hemat Layar)"
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-300 transition"
                >
                  <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
                </button>

                <button
                  id="btn-close-minimap"
                  onClick={() => {
                    sound.playMenuSelect();
                    onToggle();
                  }}
                  title="Tutup Peta [M]"
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Interactive Mini-Map Canvas Frame with Cardinal Navigation Border */}
          <div className="relative rounded-xl overflow-hidden border-2 border-slate-700/80 bg-slate-900 shadow-inner group select-none">
            {/* Cardinal Direction Indicators on Bezel Margins */}
            <div className="absolute top-0 inset-x-0 flex justify-center pointer-events-none z-10">
              <span className={`font-pixel ${isEffectiveCompact ? 'text-[5.5px] px-1 py-0' : 'text-[6.5px] px-1.5 py-0.5'} font-bold bg-slate-950/90 text-rose-400 rounded-b border-x border-b border-rose-900/60 shadow-md`}>
                U
              </span>
            </div>
            <div className="absolute bottom-0 inset-x-0 flex justify-center pointer-events-none z-10">
              <span className={`font-pixel ${isEffectiveCompact ? 'text-[5.5px] px-1 py-0' : 'text-[6.5px] px-1.5 py-0.5'} font-bold bg-slate-950/90 text-slate-300 rounded-t border-x border-t border-slate-700/60 shadow-md`}>
                S
              </span>
            </div>
            <div className="absolute left-0 inset-y-0 flex items-center pointer-events-none z-10">
              <span className={`font-pixel ${isEffectiveCompact ? 'text-[5.5px] px-0.5 py-0.5' : 'text-[6.5px] px-1 py-0.5'} font-bold bg-slate-950/90 text-slate-300 rounded-r border-y border-r border-slate-700/60 shadow-md`}>
                B
              </span>
            </div>
            <div className="absolute right-0 inset-y-0 flex items-center pointer-events-none z-10">
              <span className={`font-pixel ${isEffectiveCompact ? 'text-[5.5px] px-0.5 py-0.5' : 'text-[6.5px] px-1 py-0.5'} font-bold bg-slate-950/90 text-amber-300 rounded-l border-y border-l border-amber-700/60 shadow-md`}>
                T
              </span>
            </div>

            {/* Retro Pixel Zoom & Navigation Controls in Top-Left Corner */}
            <div className={`absolute top-1.5 left-1.5 z-20 flex items-center bg-slate-950/95 border border-slate-700/90 rounded-lg ${isEffectiveCompact ? 'p-0.5 gap-0.5' : 'p-0.5 gap-0.5'} shadow-xl backdrop-blur-xs`}>
              {/* Zoom In Button */}
              <button
                id="btn-minimap-zoom-in"
                onClick={handleZoomIn}
                disabled={zoom >= 3.0}
                title="Perbesar Peta [+] / Scroll Atas"
                className={`${isEffectiveCompact ? 'p-0.5' : 'p-1'} rounded hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-amber-300 hover:text-amber-100 transition active:scale-95 cursor-pointer`}
              >
                <ZoomIn className={isEffectiveCompact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
              </button>

              {/* Zoom Level Indicator Pill (clickable to cycle) */}
              <button
                id="btn-minimap-zoom-level"
                onClick={handleCycleZoom}
                title="Klik untuk ubah zoom (1.0x - 3.0x)"
                className={`${isEffectiveCompact ? 'px-1 py-0.2 text-[6.5px] min-w-[24px]' : 'px-1 py-0.5 text-[7.5px] min-w-[30px]'} font-pixel font-bold text-amber-300 hover:text-amber-200 bg-amber-950/70 rounded border border-amber-800/70 cursor-pointer text-center`}
              >
                {zoom.toFixed(1)}x
              </button>

              {/* Zoom Out Button */}
              <button
                id="btn-minimap-zoom-out"
                onClick={handleZoomOut}
                disabled={zoom <= 1.0}
                title="Perkecil Peta [-] / Scroll Bawah"
                className={`${isEffectiveCompact ? 'p-0.5' : 'p-1'} rounded hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-amber-300 hover:text-amber-100 transition active:scale-95 cursor-pointer`}
              >
                <ZoomOut className={isEffectiveCompact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
              </button>

              {/* Center / Follow Player Toggle Button */}
              {zoom > 1.0 && (
                <button
                  id="btn-minimap-center-player"
                  onClick={handleCenterOnPlayer}
                  title={isFollowingPlayer ? "Sedang Mengikuti Pemain [C]" : "Pusatkan ke Posisi Pemain [C]"}
                  className={`${isEffectiveCompact ? 'p-0.5' : 'p-1'} rounded transition active:scale-95 flex items-center gap-0.5 cursor-pointer border ${
                    isFollowingPlayer
                      ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-300 shadow-[0_0_6px_rgba(52,211,153,0.3)]'
                      : 'bg-slate-800/90 hover:bg-slate-700 text-amber-300 border-slate-600'
                  }`}
                >
                  <LocateFixed className={`${isEffectiveCompact ? 'w-2.5 h-2.5' : 'w-3 h-3'} ${isFollowingPlayer ? 'animate-pulse text-emerald-400' : ''}`} />
                  {!isEffectiveCompact && (
                    <span className="text-[6.5px] font-pixel font-bold hidden sm:inline">
                      {isFollowingPlayer ? 'IKUTI' : 'PUSAT'}
                    </span>
                  )}
                </button>
              )}
            </div>

            {/* Pixelated Compass Rose Dial Widget in Top-Right Corner */}
            <div
              className={`absolute top-1.5 right-1.5 z-20 ${
                isEffectiveCompact ? 'w-5.5 h-5.5' : 'w-8 h-8'
              } rounded-full bg-slate-950/95 border-2 ${
                isCompassActive
                  ? 'border-amber-400 shadow-[0_0_14px_rgba(251,191,36,0.8)] ring-2 ring-amber-300/60'
                  : 'border-slate-700 shadow-md'
              } backdrop-blur-xs flex items-center justify-center pointer-events-none transition-all`}
              title="Kompas Orientasi Peta: U = Utara, S = Selatan, T = Timur, B = Barat"
            >
              <span className={`absolute top-0 ${isEffectiveCompact ? 'text-[4px]' : 'text-[5px]'} font-pixel font-bold text-rose-400 leading-none`}>U</span>
              <span className={`absolute bottom-0 ${isEffectiveCompact ? 'text-[4px]' : 'text-[5px]'} font-pixel font-bold text-slate-400 leading-none`}>S</span>
              <span className={`absolute right-0.5 ${isEffectiveCompact ? 'text-[4px]' : 'text-[5px]'} font-pixel font-bold text-amber-300 leading-none`}>T</span>
              <span className={`absolute left-0.5 ${isEffectiveCompact ? 'text-[4px]' : 'text-[5px]'} font-pixel font-bold text-slate-400 leading-none`}>B</span>
              <div
                className={`relative ${isEffectiveCompact ? 'w-1 h-3' : 'w-1.5 h-4'} flex flex-col items-center justify-center ${
                  isCompassActive ? 'animate-pulse' : ''
                }`}
              >
                {/* Red North needle with pixel tip */}
                <div className={`w-0 h-0 border-l-[2px] border-l-transparent border-r-[2px] border-r-transparent ${isEffectiveCompact ? 'border-b-[5px]' : 'border-b-[7px]'} border-b-rose-500 filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]`} />
                {/* Brass Center rivet */}
                <div className={`${isEffectiveCompact ? 'w-1 h-1' : 'w-1.5 h-1.5'} rounded-full bg-amber-300 border border-amber-600 z-10 my-[-1px] shadow-sm`} />
                {/* Silver South needle */}
                <div className={`w-0 h-0 border-l-[2px] border-l-transparent border-r-[2px] border-r-transparent ${isEffectiveCompact ? 'border-t-[5px]' : 'border-t-[7px]'} border-t-slate-300 filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]`} />
              </div>
            </div>

            <canvas
              ref={canvasRef}
              width={MINI_MAP_W}
              height={MINI_MAP_H}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className={`block ${canvasDisplayClass} object-contain touch-none select-none ${
                isDraggingMap
                  ? 'cursor-grabbing'
                  : zoom > 1.0
                  ? 'cursor-grab active:cursor-grabbing'
                  : 'cursor-crosshair'
              }`}
              title="Klik untuk jalan otomatis • Scroll atau tombol +/- untuk zoom • Geser untuk menggeser peta saat zoom"
            />

            {/* Quick click-to-move overlay hint on hover */}
            <div className="absolute inset-x-0 bottom-0 py-0.5 bg-slate-950/85 text-[8px] text-amber-200 text-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity font-mono">
              {zoom > 1.0
                ? 'Geser untuk mengitari peta • Klik untuk jalan'
                : 'Klik peta untuk jalan • [+] [-] Zoom'}
            </div>
          </div>

          {/* Bottom Area: Compact Smart Bar vs Expanded Full Details */}
          {isEffectiveCompact ? (
            <>
              {/* Compact Active Quest / Target Banner or Zone Name */}
              {hoveredInfo ? (
                <div className="bg-amber-950/80 border border-amber-500/60 rounded-lg px-2 py-1 text-[7.5px] flex items-center justify-between text-amber-300 font-pixel shadow-xs">
                  <span className="truncate flex items-center gap-1 font-bold">
                    {hoveredInfo.isQuestTarget ? '🎯' : hoveredInfo.isUnrecoveredZone ? '🌫️' : '👤'}{' '}
                    {hoveredInfo.name}
                  </span>
                  <span className="text-slate-400 text-[6.5px] shrink-0 ml-1 truncate">
                    {hoveredInfo.role || hoveredInfo.status}
                  </span>
                </div>
              ) : activeQuest && activeTargetNpc ? (
                <button
                  id="minimap-quest-target-btn"
                  onClick={() => {
                    sound.playMenuSelect();
                    if (onNavigateToTile) {
                      onNavigateToTile(Math.round(activeTargetNpc.x), Math.round(activeTargetNpc.y));
                    }
                  }}
                  title="Klik untuk auto-walk otomatis menuju target misi aktif!"
                  className="w-full text-left bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 hover:from-amber-900/95 hover:to-amber-900/95 border border-amber-400 rounded-lg px-2 py-1 flex items-center justify-between cursor-pointer transition active:scale-95 shadow-xs group/quest"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-3.5 h-3.5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-pixel font-bold text-[7.5px] shrink-0 animate-pulse">
                      !
                    </span>
                    <span className="font-pixel text-[7.5px] text-amber-200 truncate font-bold">
                      {activeTargetNpc.name}
                    </span>
                  </div>
                  <span className="text-[6.5px] font-pixel text-amber-300 flex items-center gap-0.5 shrink-0 font-bold group-hover/quest:underline">
                    JALAN <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                </button>
              ) : (
                <div className="flex items-center justify-between text-[7.5px] text-slate-300 bg-slate-900/90 px-2 py-1 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-1 truncate">
                    <Navigation className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                    <span className="truncate font-bold text-slate-100 text-[8px]">{currentZoneName}</span>
                  </div>
                  <span className="text-[6px] font-pixel text-amber-300 font-bold">
                    {isCompassActive ? 'RESONANSI' : 'LEMBAH'}
                  </span>
                </div>
              )}

              {/* Compact Legend Row with Help Toggle */}
              <div className="flex items-center justify-between text-[6.5px] text-slate-400 pt-0.5 border-t border-slate-800/70 font-pixel">
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-400 flex items-center gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-xs bg-emerald-500 inline-block" /> Kamu
                  </span>
                  <span className="text-amber-300 flex items-center gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" /> Warga
                  </span>
                  <span className="text-amber-400 flex items-center gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 text-slate-950 font-bold inline-flex items-center justify-center text-[5px]">!</span> Misi
                  </span>
                </div>
                <button
                  onClick={() => setShowMobileLegend((prev) => !prev)}
                  className="text-slate-400 hover:text-amber-300 underline cursor-pointer"
                >
                  {showMobileLegend ? 'Tutup' : 'Bantuan'}
                </button>
              </div>

              {/* Expandable Mini Help */}
              {showMobileLegend && (
                <div className="bg-slate-900/95 border border-slate-700/80 rounded-lg p-1.5 text-[6.5px] text-slate-300 font-pixel flex flex-col gap-0.5 animate-in fade-in duration-100 shadow-lg">
                  <div className="text-amber-300 font-bold">Panduan Peta:</div>
                  <div>• Tap peta untuk jalan otomatis (auto-walk).</div>
                  <div>• Gunakan [+] [-] atau cubit untuk zoom.</div>
                  <div>• Geser peta dengan jari saat diperbesar.</div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Real-time Hovered Target Inspector Info Box */}
              {hoveredInfo ? (
                <div className="bg-amber-950/70 border border-amber-500/60 rounded-xl p-2 text-[9px] flex flex-col gap-0.5 animate-in fade-in duration-100 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300 flex items-center gap-1 truncate font-pixel text-[8.5px]">
                      {hoveredInfo.isQuestTarget ? '🎯' : hoveredInfo.isUnrecoveredZone ? '🌫️' : '👤'}{' '}
                      {hoveredInfo.name}
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
                    <div className="text-[7.5px] text-amber-400 italic truncate mt-0.5">
                      {hoveredInfo.zoneHint}
                    </div>
                  )}
                </div>
              ) : (
                /* Current Player Zone Location Tag & Compass Mode */
                <div className="flex items-center justify-between text-[9px] text-slate-300 bg-slate-900/90 px-2.5 py-1.5 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1.5 truncate">
                    <Navigation className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate font-bold text-slate-100 text-[9.5px]">{currentZoneName}</span>
                  </div>
                  <span
                    className={`text-[7px] font-pixel px-1.5 py-0.5 rounded border shrink-0 font-bold ${
                      isCompassActive
                        ? 'text-amber-300 bg-amber-950/70 border-amber-500/70 animate-pulse shadow-[0_0_6px_rgba(251,191,36,0.4)]'
                        : 'text-slate-400 bg-slate-800/70 border-slate-700/70'
                    }`}
                  >
                    {isCompassActive ? 'RESONANSI' : 'KOMPAS'}
                  </span>
                </div>
              )}

              {/* Active Quest Standout Clickable Button Panel */}
              {activeQuest && activeTargetNpc ? (
                <button
                  id="minimap-quest-target-btn"
                  onClick={() => {
                    sound.playMenuSelect();
                    if (onNavigateToTile) {
                      onNavigateToTile(Math.round(activeTargetNpc.x), Math.round(activeTargetNpc.y));
                    }
                  }}
                  title="Klik untuk auto-walk otomatis menuju target misi aktif!"
                  className="w-full text-left bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 hover:from-amber-900/95 hover:to-amber-900/95 border-2 border-amber-400 hover:border-amber-300 rounded-xl p-2 flex items-center justify-between cursor-pointer transition active:scale-[0.98] group/quest shadow-[0_4px_14px_rgba(0,0,0,0.6)]"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="relative w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-pixel font-bold text-[11px] shrink-0 group-hover/quest:rotate-12 transition-transform shadow-[0_0_10px_rgba(251,191,36,0.8)] border border-amber-300">
                      !
                      <span className="absolute inset-0 rounded-full bg-amber-400/40 animate-ping" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[7px] font-pixel px-1 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-500/40 font-bold">
                          TARGET
                        </span>
                        <span className="text-[8.5px] font-pixel text-amber-200 truncate font-bold">
                          {activeTargetNpc.name}
                        </span>
                      </div>
                      <div className="text-[8px] text-slate-300 flex items-center gap-1 truncate mt-0.5">
                        <span>{activeQuestZoneInfo ? activeQuestZoneInfo.name : 'Lembah'}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-amber-300 font-pixel text-[7px] group-hover/quest:underline">
                          KLIK JALAN OTOMATIS ➔
                        </span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-amber-400 group-hover/quest:translate-x-1 transition-transform shrink-0 drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]" />
                </button>
              ) : (
                <div className="bg-emerald-950/40 border-2 border-emerald-500/50 rounded-xl p-2 flex items-center gap-2 shadow-md">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
                  <div className="text-[8.5px] text-emerald-300 font-pixel font-bold">
                    SEMUA MISI UTAMA SELESAI ✨
                  </div>
                </div>
              )}

              {/* Interactive Legend with Updated Pixel Sprites */}
              <div className="flex items-center justify-between text-[7.5px] text-slate-300 px-1 pt-1 border-t border-slate-800/80">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 border border-emerald-300 inline-flex items-center justify-center text-[5.5px] text-slate-950 font-bold">
                      웃
                    </span>
                    Kamu
                  </span>
                  <span className="flex items-center gap-1 text-amber-300 font-medium">
                    <span className="w-2 h-2 rounded-full bg-amber-400 border border-amber-600 inline-block" />
                    Warga ➔
                  </span>
                  <span className="flex items-center gap-1 text-amber-400 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-slate-950 text-slate-950 text-[6.5px] font-pixel font-bold inline-flex items-center justify-center shadow-xs">
                      !
                    </span>
                    Misi
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <span className="w-2 h-2 rounded-xs bg-slate-700 border border-slate-600 inline-block" />
                    Kabut
                  </span>
                </div>
                <span className="text-[7px] text-slate-500 font-pixel">[M] Tutup</span>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
