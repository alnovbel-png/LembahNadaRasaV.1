import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameRenderer, Player } from './game/renderer';
import {
  generateMapLayout,
  isTileSolid,
  TILE_SIZE,
  MAP_COLS,
  MAP_ROWS,
  TILE,
  INITIAL_NPCS,
  INITIAL_QUESTS,
  INITIAL_ITEMS,
} from './game/constants';
import { GAME_DIALOGUES } from './game/dialogueData';
import {
  DialogueNode,
  ChoiceOption,
  ZoneColorStatus,
  PlayerStats,
  Item,
  GameQuest,
  NPC,
  EmotionProfile,
} from './types/game';
import { sound } from './utils/audio';
import { DialogueBox } from './components/DialogueBox';
import { EmotionRegulationModal, RegulationMode } from './components/EmotionRegulationModal';
import { CompassJournalModal } from './components/CompassJournalModal';
import { SettingsModal, SettingsModalTab } from './components/SettingsModal';
import { EndingModal } from './components/EndingModal';
import { VirtualControls } from './components/VirtualControls';
import { MiniMap } from './components/MiniMap';
import { StartMenuModal } from './components/StartMenuModal';
import { Sparkles, Compass } from 'lucide-react';
import { isMobileOrTabletDevice, useIsPortrait, useIsMobileOrTablet } from './utils/device';

const GAME_ZOOM = 1.35; // Focused zoom on main character for rich exploration feel

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<GameRenderer | null>(null);
  const isPortrait = useIsPortrait();
  const isMobile = useIsMobileOrTablet();

  // Game World State
  const [mapLayout] = useState<number[][]>(() => generateMapLayout());
  const [npcs, setNpcs] = useState<NPC[]>(INITIAL_NPCS);
  const [zoneStatus, setZoneStatus] = useState<ZoneColorStatus>({
    plaza: false,
    bridge: false,
    forest: false,
    tower: false,
  });
  const [inventory, setInventory] = useState<Item[]>(INITIAL_ITEMS);
  const [quests, setQuests] = useState<GameQuest[]>(INITIAL_QUESTS);
  const [stats, setStats] = useState<PlayerStats>({
    empathyScore: 20,
    resonanceUses: 0,
    calmTechniquesMastered: 0,
    secretsFound: 0,
    unlockedBadges: [],
  });

  // Player position & movement
  const playerRef = useRef<Player>({
    x: 11 * TILE_SIZE,
    y: 15 * TILE_SIZE,
    vx: 0,
    vy: 0,
    facing: 'down',
    animFrame: 0,
    isMoving: false,
  });

  const keysPressed = useRef<{ [key: string]: boolean }>({});

  // Camera tracking reference for click-to-world coordinate translation
  const cameraRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Destination target when clicking/tapping on the floor or an NPC
  const targetPosRef = useRef<{
    x: number;
    y: number;
    targetNPC?: NPC | null;
    targetType?: string;
  } | null>(null);

  // Step counter for footstep audio pacing and left/right cadence
  const stepCounterRef = useRef<number>(0);

  // Autonomous patrol / wander state for Didi (scout) and Pak Joko (farmer)
  const didiPatrolRef = useRef({
    currentWaypointIndex: 0,
    waitTicks: 0,
    waypoints: [
      { x: 11, y: 17, wait: 120 }, // Crossroads
      { x: 9, y: 17, wait: 30 },
      { x: 7, y: 17, wait: 140 }, // Farm entrance / signpost
      { x: 7, y: 19, wait: 120 }, // Near farmhouse
      { x: 7, y: 17, wait: 40 },
      { x: 11, y: 17, wait: 100 }, // Back to crossroads
      { x: 14, y: 17, wait: 120 }, // East pathway
      { x: 11, y: 17, wait: 80 },  // Return
    ],
  });

  const jokoFarmingRef = useRef({
    stepIndex: 0,
    waitTicks: 0,
    steps: [
      { x: 8, y: 23, facing: 'down' as const, wait: 220 }, // Watering cabbages
      { x: 6, y: 23, facing: 'left' as const, wait: 220 }, // Watering carrots
      { x: 7, y: 22, facing: 'up' as const, wait: 180 },   // Checking the well
      { x: 9, y: 23, facing: 'right' as const, wait: 220 }, // Tending wheat
    ],
  });

  // Active UI states
  const [showStartMenu, setShowStartMenu] = useState<boolean>(true);
  const [isCompassActive, setIsCompassActive] = useState<boolean>(false);
  const [currentDialogue, setCurrentDialogue] = useState<DialogueNode | null>(null);
  const [showBreathingMiniGame, setShowBreathingMiniGame] = useState<boolean>(false);
  const [breathingTarget, setBreathingTarget] = useState<string>('Kiki');
  const [regulationInitialMode, setRegulationInitialMode] = useState<RegulationMode>('breathing');
  const [showJournal, setShowJournal] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [settingsTab, setSettingsTab] = useState<SettingsModalTab>('quest');
  const [showEnding, setShowEnding] = useState<boolean>(false);
  const [isFreeRoamActive, setIsFreeRoamActive] = useState<boolean>(false);
  const [endingType, setEndingType] = useState<'perfect' | 'resilient'>('perfect');
  const [branchChoice, setBranchChoice] = useState<string>('empathy_first');
  const [isMuted, setIsMuted] = useState<boolean>(() => sound.isMuted);
  const [showMiniMap, setShowMiniMap] = useState<boolean>(() => !isMobileOrTabletDevice());
  const [questHint, setQuestHint] = useState<string>(
    'Pusaka Kompas Hati terjatuh di depanmu! Tekan [C] atau tombol Kompas untuk menggunakannya.'
  );

  // Sync mute state with sound system
  useEffect(() => {
    const unsub = sound.subscribe(() => {
      setIsMuted(sound.isMuted);
    });
    return unsub;
  }, []);

  // Handler for starting the game adventure directly into the story from opening menu
  const handleStartGame = useCallback(() => {
    sound.unlockAudio();
    sound.playCompassChime();
    setShowStartMenu(false);
    // Enter the story immediately with prologue dialogue & golden sparkles
    setTimeout(() => {
      setCurrentDialogue(GAME_DIALOGUES.intro_start);
      rendererRef.current?.addSparkle(
        playerRef.current.x + 16,
        playerRef.current.y + 16,
        '#f59e0b',
        30
      );
    }, 120);
  }, []);

  const handleOpenRegulation = useCallback(
    (target = 'Pemain', mode: RegulationMode = 'breathing') => {
      setBreathingTarget(target);
      setRegulationInitialMode(mode);
      setShowBreathingMiniGame(true);
      sound.playMenuSelect();
    },
    []
  );

  // Unified Game Settings Modal Handler
  const handleOpenSettings = useCallback((tab: SettingsModalTab = 'quest') => {
    setSettingsTab(tab);
    setShowSettings(true);
    sound.playMenuSelect();
  }, []);

  // Resolve NPC and immediately update their emotion profile & resonance indicator
  const resolveNPC = useCallback(
    (
      npcId: string,
      updatedEmotion?: Partial<EmotionProfile>,
      nextDialogueId?: string
    ) => {
      setNpcs((prev) =>
        prev.map((npc) => {
          if (npc.id !== npcId) return npc;
          // Spawn joyful emerald sparkles around the NPC
          rendererRef.current?.addSparkle(
            npc.x * TILE_SIZE + 16,
            npc.y * TILE_SIZE + 16,
            '#4ade80',
            25
          );
          return {
            ...npc,
            isResolved: true,
            currentDialogueId: nextDialogueId || `${npcId}_resolved`,
            emotionProfile: {
              ...npc.emotionProfile,
              surfaceEmotion: updatedEmotion?.surfaceEmotion ?? 'tenang',
              deepEmotion: updatedEmotion?.deepEmotion ?? 'gembira',
              reason:
                updatedEmotion?.reason ??
                'Merasa tenang, lega, dan bahagia karena masalahnya telah terselesaikan bersama.',
              selInsight:
                updatedEmotion?.selInsight ?? npc.emotionProfile.selInsight,
            },
          };
        })
      );
    },
    []
  );

  // Click on mini-map to auto-navigate
  const handleMiniMapNavigate = useCallback(
    (tileX: number, tileY: number) => {
      if (currentDialogue) return;
      const targetWorldX = tileX * TILE_SIZE + 16;
      const targetWorldY = tileY * TILE_SIZE + 16;
      targetPosRef.current = { x: targetWorldX, y: targetWorldY };
      rendererRef.current?.setDestination(targetWorldX, targetWorldY);
      sound.playMenuSelect();
    },
    [currentDialogue]
  );

  // Camera viewport
  const [viewportSize, setViewportSize] = useState({ width: 800, height: 600 });
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);

  // Handle Container & Window Resize for crisp, proportional canvas rendering
  // Mode vertikal: Rasio 9:16 (0.5625)
  // Mode horizontal: Rasio 16:9 (1.7778)
  useEffect(() => {
    const updateDimensions = () => {
      const container = canvasContainerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const cw = container.clientWidth;
      const ch = container.clientHeight;
      if (cw <= 0 || ch <= 0) return;

      // Deteksi orientasi vertikal vs horizontal:
      // Mode mobile vertikal -> Rasio 9:16
      // Mode mobile horizontal (dan desktop widescreen) -> Rasio 16:9
      const isVertical = window.innerHeight > window.innerWidth || ch > cw;
      const TARGET_ASPECT = isVertical ? 9 / 16 : 16 / 9;
      const containerAspect = cw / ch;

      let renderW: number;
      let renderH: number;

      if (containerAspect > TARGET_ASPECT) {
        // Container lebih lebar dari target rasio: fit tinggi, sesuaikan lebar (pillarbox)
        renderH = ch;
        renderW = Math.round(ch * TARGET_ASPECT);
      } else {
        // Container lebih tinggi dari target rasio: fit lebar, sesuaikan tinggi (letterbox)
        renderW = cw;
        renderH = Math.round(cw / TARGET_ASPECT);
      }

      // Pastikan ukuran genap untuk rendering pixel-art tajam tanpa subpixel blur/jitter
      renderW = renderW % 2 === 0 ? renderW : renderW - 1;
      renderH = renderH % 2 === 0 ? renderH : renderH - 1;

      // Terapkan dimensi CSS display
      canvas.style.width = `${renderW}px`;
      canvas.style.height = `${renderH}px`;

      // Terapkan resolusi buffer render canvas internal
      canvas.width = renderW;
      canvas.height = renderH;

      setViewportSize({ width: renderW, height: renderH });
    };

    updateDimensions();

    let ro: ResizeObserver | null = null;
    if (canvasContainerRef.current) {
      ro = new ResizeObserver(() => {
        updateDimensions();
      });
      ro.observe(canvasContainerRef.current);
    }

    window.addEventListener('resize', updateDimensions);
    window.addEventListener('orientationchange', updateDimensions);
    return () => {
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('orientationchange', updateDimensions);
      ro?.disconnect();
    };
  }, [isPortrait]);

  // Initialize Canvas Renderer
  useEffect(() => {
    if (canvasRef.current && !rendererRef.current) {
      rendererRef.current = new GameRenderer(canvasRef.current);
    }
  }, []);

  // Toggle Resonance Compass
  const handleToggleCompass = useCallback(() => {
    setIsCompassActive((prev) => {
      const next = !prev;
      if (next) {
        sound.playCompassChime();
        setStats((s) => ({ ...s, resonanceUses: s.resonanceUses + 1 }));
      }
      return next;
    });
  }, []);

  // Toggle Sound
  const handleToggleMute = useCallback(() => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  }, []);

  // Check collision against map tiles & bridge obstacle
  const checkCollision = useCallback(
    (x: number, y: number): boolean => {
      const pW = 20;
      const pH = 12;
      const feetX = x + 6;
      const feetY = y + 20;

      const corners = [
        { x: feetX, y: feetY },
        { x: feetX + pW, y: feetY },
        { x: feetX, y: feetY + pH },
        { x: feetX + pW, y: feetY + pH },
      ];

      for (const pt of corners) {
        const c = Math.floor(pt.x / TILE_SIZE);
        const r = Math.floor(pt.y / TILE_SIZE);

        if (r < 0 || r >= MAP_ROWS || c < 0 || c >= MAP_COLS) return true;

        const tile = mapLayout[r][c];
        if (isTileSolid(tile)) {
          // Special exception: if the tile is a bridge and bridge zone is not unlocked, it is solid
          return true;
        }

        // Bridge gate check: if bridge not yet restored, prevent crossing beyond x = 20*TILE_SIZE
        if (!zoneStatus.bridge && c >= 21 && c <= 24 && r >= 14 && r <= 16) {
          return true;
        }
      }
      return false;
    },
    [mapLayout, zoneStatus.bridge]
  );

  // Calculate safe, walkable talk position near an NPC without colliding with any obstacles/assets
  const getSafeNPCTalkPosition = useCallback(
    (npc: NPC, playerCenterX: number, playerCenterY: number): { x: number; y: number } => {
      const nx = npc.x * TILE_SIZE + 16;
      const ny = npc.y * TILE_SIZE + 16;
      const idealDist = 34; // comfortable distance from NPC center in pixels

      // 1. Direct approach angle
      const directAngle = Math.atan2(playerCenterY - ny, playerCenterX - nx);
      const directX = nx + Math.cos(directAngle) * idealDist;
      const directY = ny + Math.sin(directAngle) * idealDist;

      // If the direct approach spot is completely walkable and collision-free, use it!
      if (!checkCollision(directX - 16, directY - 16)) {
        return { x: directX, y: directY };
      }

      // 2. Otherwise, check candidate standing positions around the NPC (cardinals & diagonals at distances 32-42px)
      const candidateDistances = [34, 38, 30, 42];
      const validSpots: Array<{ x: number; y: number; distToPlayer: number }> = [];

      for (const d of candidateDistances) {
        const offsets = [
          { dx: 0, dy: d },        // South (in front/below)
          { dx: -d, dy: 0 },       // West (left)
          { dx: d, dy: 0 },        // East (right)
          { dx: 0, dy: -d },       // North (above)
          { dx: -d * 0.707, dy: d * 0.707 },
          { dx: d * 0.707, dy: d * 0.707 },
          { dx: -d * 0.707, dy: -d * 0.707 },
          { dx: d * 0.707, dy: -d * 0.707 },
        ];

        for (const offset of offsets) {
          const cx = nx + offset.dx;
          const cy = ny + offset.dy;
          if (!checkCollision(cx - 16, cy - 16)) {
            const dist = Math.hypot(cx - playerCenterX, cy - playerCenterY);
            validSpots.push({ x: cx, y: cy, distToPlayer: dist });
          }
        }
        if (validSpots.length > 0) break;
      }

      if (validSpots.length > 0) {
        // Pick the safe spot closest to the player's current location
        validSpots.sort((a, b) => a.distToPlayer - b.distToPlayer);
        return { x: validSpots[0].x, y: validSpots[0].y };
      }

      // Fallback in case all angles are tight: south offset
      return { x: nx, y: ny + 32 };
    },
    [checkCollision]
  );

  // Main interaction trigger: Talk to nearest NPC or examine object
  const handleInteract = useCallback(() => {
    if (currentDialogue) return; // already in dialogue

    const p = playerRef.current;
    const px = p.x + 16;
    const py = p.y + 16;

    // Check Holy Tree secret interaction (north-west: c=4, r=4)
    const treeX = 4 * TILE_SIZE + 16;
    const treeY = 4 * TILE_SIZE + 16;
    const distToTree = Math.hypot(treeX - px, treeY - py);
    if (distToTree < 55) {
      sound.playSecretFound();
      rendererRef.current?.triggerScreenShake(5, 14);
      setCurrentDialogue(GAME_DIALOGUES.secret_tree);
      return;
    }

    // Check Farm Signpost (c=6, r=17 di sebelah jalan)
    const farmSignX = 6 * TILE_SIZE + 16;
    const farmSignY = 17 * TILE_SIZE + 16;
    if (Math.hypot(farmSignX - px, farmSignY - py) < 55) {
      sound.playSecretFound();
      setCurrentDialogue(GAME_DIALOGUES.signpost_farm);
      return;
    }

    // Check Forest Signpost (c=10, r=9 di sebelah jalan)
    const forestSignX = 10 * TILE_SIZE + 16;
    const forestSignY = 9 * TILE_SIZE + 16;
    if (Math.hypot(forestSignX - px, forestSignY - py) < 55) {
      sound.playSecretFound();
      setCurrentDialogue(GAME_DIALOGUES.signpost_forest);
      return;
    }

    // Check Central Fountain (c=11, r=14)
    const fountainX = 11 * TILE_SIZE + 16;
    const fountainY = 14 * TILE_SIZE + 16;
    if (Math.hypot(fountainX - px, fountainY - py) < 55) {
      sound.playSecretFound();
      setCurrentDialogue(GAME_DIALOGUES.fountain_examine);
      return;
    }

    // Check Grand Clock Tower (c=30, r=6)
    const towerDoorX = 30 * TILE_SIZE + 16;
    const towerDoorY = 6 * TILE_SIZE + 16;
    if (Math.hypot(towerDoorX - px, towerDoorY - py) < 80) {
      sound.playTowerBell();
      rendererRef.current?.triggerScreenShake(4, 12);
      rendererRef.current?.addSparkle(towerDoorX, towerDoorY, '#fbbf24', 12);
      setCurrentDialogue(
        zoneStatus.tower
          ? GAME_DIALOGUES.tower_examine_restored
          : GAME_DIALOGUES.tower_examine
      );
      return;
    }

    // Check nearest NPC
    let nearestNPC: NPC | null = null;
    let minDist = 65;

    for (const npc of npcs) {
      const nx = npc.x * TILE_SIZE + 16;
      const ny = npc.y * TILE_SIZE + 16;
      const dist = Math.hypot(nx - px, ny - py);
      if (dist < minDist) {
        minDist = dist;
        nearestNPC = npc;
      }
    }

    if (nearestNPC) {
      const nx = nearestNPC.x * TILE_SIZE + 16;
      const ny = nearestNPC.y * TILE_SIZE + 16;
      if (Math.abs(nx - px) > Math.abs(ny - py)) {
        p.facing = nx > px ? 'right' : 'left';
      } else {
        p.facing = ny > py ? 'down' : 'up';
      }
      nearestNPC.facing = px > nx ? 'right' : 'left';

      sound.playVoiceBlip();
      const dialogueKey = nearestNPC.currentDialogueId || `${nearestNPC.id}_intro`;
      const node = GAME_DIALOGUES[dialogueKey] || GAME_DIALOGUES[`${nearestNPC.id}_intro`];
      if (node) {
        setCurrentDialogue(node);
      }
    }
  }, [currentDialogue, npcs, zoneStatus]);

  // Click / Tap on Floor or NPC/Props to walk there automatically
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (currentDialogue) return; // In active dialogue, don't interrupt
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;

      // Precise coordinate mapping accounting for scale between CSS display and canvas buffer
      const scaleX = rect.width > 0 ? canvas.width / rect.width : 1;
      const scaleY = rect.height > 0 ? canvas.height / rect.height : 1;
      const canvasX = screenX * scaleX;
      const canvasY = screenY * scaleY;

      const worldX = canvasX / GAME_ZOOM + cameraRef.current.x;
      const worldY = canvasY / GAME_ZOOM + cameraRef.current.y;

      const p = playerRef.current;
      const px = p.x + 16;
      const py = p.y + 16;

      // 1. Check if clicking on the Ancient Holy Tree (c=4, r=4)
      const treeX = 4 * TILE_SIZE + 16;
      const treeY = 4 * TILE_SIZE + 16;
      if (Math.hypot(treeX - worldX, treeY - worldY) < 40) {
        if (Math.hypot(treeX - px, treeY - py) < 65) {
          // Close enough: interact immediately!
          sound.playSecretFound();
          rendererRef.current?.triggerScreenShake(5, 14);
          setCurrentDialogue(GAME_DIALOGUES.secret_tree);
          targetPosRef.current = null;
          rendererRef.current?.clearDestination();
        } else {
          // Walk to tree with 'examine' marker
          targetPosRef.current = { x: treeX, y: treeY + 28, targetType: 'tree' };
          rendererRef.current?.setDestination(treeX, treeY + 28, 'examine');
          rendererRef.current?.addSparkle(treeX, treeY + 28, '#fef08a', 6);
        }
        return;
      }

      // 2. Check if clicking on the Central Plaza Fountain (c=11, r=14)
      const fountainX = 11 * TILE_SIZE + 16;
      const fountainY = 14 * TILE_SIZE + 16;
      if (Math.hypot(fountainX - worldX, fountainY - worldY) < 38) {
        if (Math.hypot(fountainX - px, fountainY - py) < 65) {
          sound.playSecretFound();
          setCurrentDialogue(GAME_DIALOGUES.fountain_examine);
          targetPosRef.current = null;
          rendererRef.current?.clearDestination();
        } else {
          targetPosRef.current = { x: fountainX, y: fountainY + 36, targetType: 'fountain' };
          rendererRef.current?.setDestination(fountainX, fountainY + 36, 'examine');
          rendererRef.current?.addSparkle(fountainX, fountainY + 36, '#67e8f9', 6);
        }
        return;
      }

      // 3. Check if clicking on the Forest Signpost (c=10, r=9 di sebelah jalan)
      const signX = 10 * TILE_SIZE + 16;
      const signY = 9 * TILE_SIZE + 16;
      if (Math.hypot(signX - worldX, signY - worldY) < 26) {
        if (Math.hypot(signX - px, signY - py) < 60) {
          sound.playSecretFound();
          setCurrentDialogue(GAME_DIALOGUES.signpost_forest);
          targetPosRef.current = null;
          rendererRef.current?.clearDestination();
        } else {
          // Karakter berjalan mendekati plang di pinggir jalan c=11, r=9
          targetPosRef.current = { x: 11 * TILE_SIZE + 16, y: 9 * TILE_SIZE + 16, targetType: 'signpost' };
          rendererRef.current?.setDestination(11 * TILE_SIZE + 16, 9 * TILE_SIZE + 16, 'examine');
          rendererRef.current?.addSparkle(signX, signY, '#a7f3d0', 6);
        }
        return;
      }

      // 3b. Check if clicking on the Farm Signpost (c=6, r=17 di sebelah jalan)
      const farmSignX = 6 * TILE_SIZE + 16;
      const farmSignY = 17 * TILE_SIZE + 16;
      if (Math.hypot(farmSignX - worldX, farmSignY - worldY) < 26) {
        if (Math.hypot(farmSignX - px, farmSignY - py) < 60) {
          sound.playSecretFound();
          setCurrentDialogue(GAME_DIALOGUES.signpost_farm);
          targetPosRef.current = null;
          rendererRef.current?.clearDestination();
        } else {
          // Karakter berjalan mendekati plang di pinggir jalan c=7, r=17
          targetPosRef.current = { x: 7 * TILE_SIZE + 16, y: 17 * TILE_SIZE + 16, targetType: 'farm_signpost' };
          rendererRef.current?.setDestination(7 * TILE_SIZE + 16, 17 * TILE_SIZE + 16, 'examine');
          rendererRef.current?.addSparkle(farmSignX, farmSignY, '#f59e0b', 6);
        }
        return;
      }

      // 3c. Check if clicking on the Grand Clock Tower (c: 28..32, r: 2..6)
      const towerMinX = 28 * TILE_SIZE;
      const towerMaxX = 33 * TILE_SIZE;
      const towerMinY = 2 * TILE_SIZE - 16;
      const towerMaxY = 7 * TILE_SIZE;
      const towerDoorX = 30 * TILE_SIZE + 16;
      const towerDoorY = 6 * TILE_SIZE + 16;

      if (
        (worldX >= towerMinX && worldX <= towerMaxX && worldY >= towerMinY && worldY <= towerMaxY) ||
        Math.hypot(towerDoorX - worldX, towerDoorY - worldY) < 45
      ) {
        if (Math.hypot(towerDoorX - px, towerDoorY - py) < 85) {
          sound.playTowerBell();
          rendererRef.current?.triggerScreenShake(4, 12);
          rendererRef.current?.addSparkle(towerDoorX, towerDoorY, '#fbbf24', 12);
          setCurrentDialogue(
            zoneStatus.tower
              ? GAME_DIALOGUES.tower_examine_restored
              : GAME_DIALOGUES.tower_examine
          );
          targetPosRef.current = null;
          rendererRef.current?.clearDestination();
        } else {
          // Walk up to the main portal entrance of the clock tower (c=30, r=7)
          const walkX = 30 * TILE_SIZE + 16;
          const walkY = 7 * TILE_SIZE + 16;
          targetPosRef.current = { x: walkX, y: walkY, targetType: 'tower' };
          rendererRef.current?.setDestination(walkX, walkY, 'examine');
          rendererRef.current?.addSparkle(towerDoorX, towerDoorY, '#f59e0b', 8);
        }
        return;
      }

      // 4. Check if clicking on or near an NPC
      let clickedNPC: NPC | null = null;
      for (const npc of npcs) {
        const nx = npc.x * TILE_SIZE + 16;
        const ny = npc.y * TILE_SIZE + 16;
        if (Math.hypot(nx - worldX, ny - worldY) < 32) {
          clickedNPC = npc;
          break;
        }
      }

      if (clickedNPC) {
        const nx = clickedNPC.x * TILE_SIZE + 16;
        const ny = clickedNPC.y * TILE_SIZE + 16;
        const distToPlayer = Math.hypot(nx - px, ny - py);

        if (distToPlayer < 65) {
          // Close enough to talk immediately without moving!
          const p = playerRef.current;
          if (Math.abs(nx - px) > Math.abs(ny - py)) {
            p.facing = nx > px ? 'right' : 'left';
          } else {
            p.facing = ny > py ? 'down' : 'up';
          }
          clickedNPC.facing = px > nx ? 'right' : 'left';

          sound.playVoiceBlip();
          const dialogueKey = clickedNPC.currentDialogueId || `${clickedNPC.id}_intro`;
          const node = GAME_DIALOGUES[dialogueKey] || GAME_DIALOGUES[`${clickedNPC.id}_intro`];
          if (node) setCurrentDialogue(node);
          targetPosRef.current = null;
          rendererRef.current?.clearDestination();
        } else {
          // Walk towards NPC using safe non-colliding coordinates
          const safeSpot = getSafeNPCTalkPosition(clickedNPC, px, py);

          targetPosRef.current = { x: safeSpot.x, y: safeSpot.y, targetNPC: clickedNPC };
          rendererRef.current?.setDestination(safeSpot.x, safeSpot.y, 'interact');
          rendererRef.current?.addSparkle(safeSpot.x, safeSpot.y, '#f59e0b', 6);
        }
        return;
      }

      // 5. Floor Click -> Walk directly to clicked tile coordinates with cyan 'walk' beacon
      const clampedX = Math.max(16, Math.min(MAP_COLS * TILE_SIZE - 16, worldX));
      const clampedY = Math.max(16, Math.min(MAP_ROWS * TILE_SIZE - 16, worldY));

      targetPosRef.current = { x: clampedX, y: clampedY };
      rendererRef.current?.setDestination(clampedX, clampedY, 'walk');
      rendererRef.current?.addSparkle(clampedX, clampedY, '#38bdf8', 5);
    },
    [currentDialogue, npcs, zoneStatus, getSafeNPCTalkPosition]
  );

  // Mouse move handler for interactive object hover hints and cursor styling
  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (currentDialogue) {
        rendererRef.current?.setHover(null);
        return;
      }
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;

      // Precise coordinate mapping accounting for scale between CSS display and canvas buffer
      const scaleX = rect.width > 0 ? canvas.width / rect.width : 1;
      const scaleY = rect.height > 0 ? canvas.height / rect.height : 1;
      const canvasX = screenX * scaleX;
      const canvasY = screenY * scaleY;

      const worldX = canvasX / GAME_ZOOM + cameraRef.current.x;
      const worldY = canvasY / GAME_ZOOM + cameraRef.current.y;

      // 1. Check hover on NPCs
      for (const npc of npcs) {
        const nx = npc.x * TILE_SIZE + 16;
        const ny = npc.y * TILE_SIZE + 16;
        if (Math.hypot(nx - worldX, ny - worldY) < 30) {
          rendererRef.current?.setHover({
            type: 'npc',
            name: npc.name,
            x: nx,
            y: ny,
          });
          canvas.style.cursor = 'pointer';
          return;
        }
      }

      // 2. Check hover on Fountain (c=11, r=14)
      const fx = 11 * TILE_SIZE + 16;
      const fy = 14 * TILE_SIZE + 16;
      if (Math.hypot(fx - worldX, fy - worldY) < 38) {
        rendererRef.current?.setHover({
          type: 'fountain',
          name: 'Air Mancur Alun-Alun',
          x: fx,
          y: fy,
        });
        canvas.style.cursor = 'pointer';
        return;
      }

      // 3. Check hover on Forest Signpost (c=10, r=9 di sebelah jalan)
      const sx = 10 * TILE_SIZE + 16;
      const sy = 9 * TILE_SIZE + 16;
      if (Math.hypot(sx - worldX, sy - worldY) < 26) {
        rendererRef.current?.setHover({
          type: 'signpost',
          name: 'Plang Petunjuk Hutan & Persimpangan',
          x: sx,
          y: sy,
        });
        canvas.style.cursor = 'pointer';
        return;
      }

      // 3b. Check hover on Farm Signpost (c=6, r=17 di sebelah jalan)
      const fsx = 6 * TILE_SIZE + 16;
      const fsy = 17 * TILE_SIZE + 16;
      if (Math.hypot(fsx - worldX, fsy - worldY) < 26) {
        rendererRef.current?.setHover({
          type: 'signpost',
          name: 'Plang Kebun & Pertanian',
          x: fsx,
          y: fsy,
        });
        canvas.style.cursor = 'pointer';
        return;
      }

      // 4. Check hover on Ancient Tree (c=4, r=4)
      const tx = 4 * TILE_SIZE + 16;
      const ty = 4 * TILE_SIZE + 16;
      if (Math.hypot(tx - worldX, ty - worldY) < 40) {
        rendererRef.current?.setHover({
          type: 'tree',
          name: 'Pohon Keramat Sahabat',
          x: tx,
          y: ty,
        });
        canvas.style.cursor = 'pointer';
        return;
      }

      // 4b. Check hover on Grand Clock Tower (c: 28..32, r: 2..6)
      const towerMinX = 28 * TILE_SIZE;
      const towerMaxX = 33 * TILE_SIZE;
      const towerMinY = 2 * TILE_SIZE - 16;
      const towerMaxY = 7 * TILE_SIZE;
      const towerDoorX = 30 * TILE_SIZE + 16;
      const towerDoorY = 6 * TILE_SIZE + 16;

      if (
        (worldX >= towerMinX && worldX <= towerMaxX && worldY >= towerMinY && worldY <= towerMaxY) ||
        Math.hypot(towerDoorX - worldX, towerDoorY - worldY) < 45
      ) {
        rendererRef.current?.setHover({
          type: 'tower',
          name: 'Menara Jam Harmoni',
          x: towerDoorX,
          y: towerDoorY,
        });
        canvas.style.cursor = 'pointer';
        return;
      }

      // Default terrain: clear hover badge, set walking cursor
      rendererRef.current?.setHover(null);
      canvas.style.cursor = 'crosshair';
    },
    [currentDialogue, npcs]
  );

  const handleCanvasMouseLeave = useCallback(() => {
    rendererRef.current?.setHover(null);
  }, []);

  // Dialogue choice selection
  const handleChoiceSelect = useCallback(
    (choice: ChoiceOption) => {
      sound.playVoiceBlip();

      // Update empathy points
      setStats((s) => ({
        ...s,
        empathyScore: Math.max(0, s.empathyScore + choice.impactScore),
      }));

      // Record branching tag
      if (choice.branchTag) {
        setBranchChoice(choice.branchTag);
      }

      // Check item rewards
      if (choice.givesItem) {
        addItemReward(choice.givesItem);
      }

      // Check badge rewards from choice
      if (choice.unlocksBadge) {
        const bId = choice.unlocksBadge;
        setStats((prev) => {
          const existing = prev.unlockedBadges ?? [];
          if (existing.includes(bId)) return prev;
          sound.playSuccessFanfare();
          rendererRef.current?.triggerScreenShake(6, 16);
          rendererRef.current?.addSparkle(
            playerRef.current.x + 16,
            playerRef.current.y + 16,
            '#f59e0b',
            20
          );
          return {
            ...prev,
            unlockedBadges: [...existing, bId],
            empathyScore: prev.empathyScore + 20,
          };
        });
      }

      // Next dialogue node
      const nextNode = GAME_DIALOGUES[choice.resultDialogueId];
      if (nextNode) {
        processDialogueTriggers(nextNode);
        setCurrentDialogue(nextNode);
      } else {
        setCurrentDialogue(null);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Add Item to bag
  const addItemReward = (itemId: string) => {
    const itemMap: Record<string, Item> = {
      item_letter: {
        id: 'item_letter',
        name: 'Surat Permintaan Maaf',
        icon: '✉️',
        description: 'Surat Kiki yang diisi harapan agar warga saling memaafkan.',
        foundLocation: 'Alun-alun Desa',
      },
      item_secret_key: {
        id: 'item_secret_key',
        name: 'Kunci Kuno Gudang Arsip',
        icon: '🗝️',
        description: 'Pemberian Kakek Ranu atas validasi rasa kesepiannya.',
        foundLocation: 'Jembatan Kayu',
      },
      item_bridge_pass: {
        id: 'item_bridge_pass',
        name: 'Izin Jembatan Bersama',
        icon: '📜',
        description: 'Kesepakatan Kakek Ranu untuk mendukung Bimo belajar dari kesalahan.',
        foundLocation: 'Jembatan Kayu',
      },
      item_gold_gear: {
        id: 'item_gold_gear',
        name: 'Roda Gigi Emas Pusaka',
        icon: '⚙️',
        description: 'Roda penggerak Menara Jam desa yang diselamatkan Bimo.',
        foundLocation: 'Hutan Sunyi',
      },
      item_egg_badge: {
        id: 'item_egg_badge',
        name: 'Lencana Telur Ceria',
        icon: '🥚',
        description: 'Hadiah Profesor Kotek. Simbol humor sehat yang meredakan hormon stres!',
        foundLocation: 'Kandang Ayam Desa',
      },
      item_friendship_capsule: {
        id: 'item_friendship_capsule',
        name: 'Kapsul Waktu Tahun 1950',
        icon: '🏺',
        description: 'Pesan bijak dari pendiri desa tentang 3 kata ajaib pertemanan.',
        foundLocation: 'Pohon Sahabat Purba',
      },
    };

    const newItem = itemMap[itemId];
    if (newItem) {
      setInventory((prev) => {
        if (prev.some((i) => i.id === newItem.id)) return prev;
        sound.playSecretFound();
        // Trigger haptic-like screen shake when discovering major items/secrets
        rendererRef.current?.triggerScreenShake(5, 14);
        return [...prev, newItem];
      });
    }
  };

  // Process triggers attached to dialogue nodes (restoring zones, breathing game)
  const processDialogueTriggers = useCallback((node: DialogueNode) => {
    // 1. Zone restoration
    if (node.triggerColorRestoreZone) {
      const zoneKey = node.triggerColorRestoreZone as keyof ZoneColorStatus;
      setZoneStatus((zs) => {
        if (zs[zoneKey]) return zs;
        sound.playColorRestore();
        // Screen shake haptic feedback when restoring a whole zone to color
        rendererRef.current?.triggerScreenShake(7, 20);
        rendererRef.current?.addSparkle(
          playerRef.current.x + 16,
          playerRef.current.y + 16,
          '#67e8f9',
          25
        );
        return { ...zs, [zoneKey]: true };
      });

      // Automatically resolve associated zone NPC and update their heart aura
      if (zoneKey === 'plaza') {
        resolveNPC('kiki', { surfaceEmotion: 'gembira', deepEmotion: 'tenang', reason: 'Napasnya teratur, surat-surat aman, dan plaza kembali cerah berkilau.' }, 'kiki_resolved');
      } else if (zoneKey === 'bridge') {
        resolveNPC('kakek_ranu', { surfaceEmotion: 'tenang', deepEmotion: 'haru', reason: 'Merasa dihargai dan diperhatikan warga desa, jembatan kembali kokoh terbuka.' }, 'ranu_resolved');
      } else if (zoneKey === 'forest') {
        resolveNPC('bimo', { surfaceEmotion: 'gembira', deepEmotion: 'tenang', reason: 'Memaafkan diri sendiri, berani memperbaiki roda gigi emas jam desa.' }, 'bimo_resolved');
      } else if (zoneKey === 'tower') {
        resolveNPC('penjaga_kabut', { surfaceEmotion: 'tenang', deepEmotion: 'haru', reason: 'Kabut prasangka musnah, menara jam berdenting merdu dan damai.' }, 'tower_resolved');
      }
    }

    // Specific dialogue resolutions
    if (node.id === 'kiki_after_breathe' || node.id === 'kiki_reward') {
      resolveNPC('kiki', { surfaceEmotion: 'gembira', deepEmotion: 'tenang', reason: 'Napasnya teratur, surat-surat aman, dan plaza kembali cerah.' }, 'kiki_resolved');
    } else if (node.id === 'ranu_path_empathy_2' || node.id === 'ranu_path_logic_2') {
      resolveNPC('kakek_ranu', { surfaceEmotion: 'tenang', deepEmotion: 'haru', reason: 'Merasa dihargai dan tidak lagi kesepian di tepi jembatan.' }, 'ranu_resolved');
    } else if (node.id === 'bimo_restore_forest') {
      resolveNPC('bimo', { surfaceEmotion: 'gembira', deepEmotion: 'tenang', reason: 'Memaafkan diri sendiri dan bangga memperbaiki jam desa.' }, 'bimo_resolved');
    }

    // 2. Breathing / Emotional Regulation mini-game
    if (node.triggerBreathing) {
      setBreathingTarget(node.speaker);
      setRegulationInitialMode('breathing');
      setShowBreathingMiniGame(true);
    }

    // 3. Quest completion
    if (node.triggerQuestProgress) {
      setQuests((prev) =>
        prev.map((q) =>
          q.id === node.triggerQuestProgress ? { ...q, isCompleted: true } : q
        )
      );
    }

    // 3b. Item reward
    if (node.givesItem) {
      addItemReward(node.givesItem);
    }

    // 3c. Achievement Badge Unlock & Mentor NPC Emotional Resolution
    const badgeId = typeof node.unlocksBadge === 'string' ? node.unlocksBadge : node.unlocksBadge?.id;
    if (badgeId) {
      // Immediately resolve the mentor NPC who provided the quiz or lesson
      if (badgeId === 'badge_woodcutter_anger' || node.id === 'teguh_reward' || node.id === 'teguh_resolved') {
        resolveNPC('teguh_woodcutter', { surfaceEmotion: 'tenang', deepEmotion: 'gembira', reason: 'Menguasai jeda regulasi amarah dan meredakan emosi sebelum berbicara.' }, 'teguh_resolved');
      } else if (badgeId === 'badge_fruit_gratitude' || node.id === 'sari_reward' || node.id === 'sari_resolved') {
        resolveNPC('sari_fruit', { surfaceEmotion: 'gembira', deepEmotion: 'haru', reason: 'Bersyukur atas limpahan panen buah dan melipatgandakan sukacita dengan berbagi.' }, 'sari_resolved');
      } else if (badgeId === 'badge_fisherman_patience' || node.id === 'jala_reward' || node.id === 'jala_resolved') {
        resolveNPC('jala_fisher', { surfaceEmotion: 'tenang', deepEmotion: 'haru', reason: 'Kesabaran berbuah manis, menikmati ketenangan batin tepi sungai.' }, 'jala_resolved');
      } else if (badgeId === 'badge_growth_mindset' || node.id === 'joko_lesson_end' || node.id === 'pak_joko_resolved') {
        resolveNPC('pak_joko', { surfaceEmotion: 'gembira', deepEmotion: 'tenang', reason: 'Bangga membagikan rahasia pola pikir berkembang kepada generasi muda.' }, 'pak_joko_resolved');
      } else if (badgeId === 'badge_counselor_zones' || node.id === 'citra_reward') {
        resolveNPC('kak_citra', { surfaceEmotion: 'tenang', deepEmotion: 'gembira', reason: 'Bahagia karena anak-anak memahami 4 zona regulasi emosi.' }, 'citra_resolved');
      } else if (badgeId === 'badge_circle_of_control' || node.id === 'damai_reward') {
        resolveNPC('kakek_damai', { surfaceEmotion: 'tenang', deepEmotion: 'tenang', reason: 'Melihat anak-anak berlatih fokus pada lingkaran kendali diri.' }, 'damai_resolved');
      } else if (badgeId === 'badge_active_listening' || node.id === 'moka_reward') {
        resolveNPC('moka_cat', { surfaceEmotion: 'tenang', deepEmotion: 'gembira', reason: 'Gembira anak-anak mendengarkan dengan telinga dan mata hati.' }, 'moka_resolved');
      } else if (badgeId === 'badge_laughter_medicine' || node.id === 'kotek_reward') {
        resolveNPC('prof_kotek', { surfaceEmotion: 'gembira', deepEmotion: 'gembira', reason: 'Tawa ceria dan endorfin positif menyebar ke seluruh penjuru desa.' }, 'kotek_resolved');
      } else if (badgeId === 'badge_friendly_greeter' || node.id === 'didi_reward' || node.id === 'didi_resolved') {
        resolveNPC('didi_scout', { surfaceEmotion: 'gembira', deepEmotion: 'tenang', reason: 'Senang menyapa setiap pengelana dengan senyuman tulus.' }, 'didi_resolved');
      }

      setStats((prev) => {
        const existing = prev.unlockedBadges ?? [];
        if (existing.includes(badgeId)) return prev;
        sound.playSuccessFanfare();
        // Screen shake feedback when unlocking educational achievements
        rendererRef.current?.triggerScreenShake(6, 16);
        rendererRef.current?.addSparkle(
          playerRef.current.x + 16,
          playerRef.current.y + 16,
          '#f59e0b',
          20
        );
        return {
          ...prev,
          unlockedBadges: [...existing, badgeId],
          empathyScore: prev.empathyScore + 20,
        };
      });
    }

    // 4. Climax ending trigger
    if (node.id === 'ending_summary_perfect' || node.id === 'ending_summary_resilient') {
      setEndingType(node.id === 'ending_summary_perfect' ? 'perfect' : 'resilient');
      rendererRef.current?.triggerScreenShake(8, 24);
      setTimeout(() => {
        setShowEnding(true);
        sound.playSuccessFanfare();
      }, 2500);
    }
  }, [resolveNPC]);

  // Advance dialogue when pressing Next or Spacebar
  const handleDialogueNext = useCallback(() => {
    if (!currentDialogue) return;

    if (currentDialogue.nextId && GAME_DIALOGUES[currentDialogue.nextId]) {
      const nextNode = GAME_DIALOGUES[currentDialogue.nextId];
      processDialogueTriggers(nextNode);
      setCurrentDialogue(nextNode);
    } else {
      setCurrentDialogue(null);
    }
  }, [currentDialogue, processDialogueTriggers]);

  // Analog virtual joystick vector for smooth mobile & touch movement
  const joystickVectorRef = useRef<{ x: number; y: number } | null>(null);

  const handleJoystickMove = useCallback((vec: { x: number; y: number } | null) => {
    joystickVectorRef.current = vec;
    if (vec && (Math.abs(vec.x) > 0.05 || Math.abs(vec.y) > 0.05)) {
      sound.unlockAudio();
      if (targetPosRef.current) {
        targetPosRef.current = null;
        rendererRef.current?.clearDestination();
      }
    }
  }, [sound]);

  // Handle directional virtual pad inputs
  const handleDirectionPress = (
    dir: 'up' | 'down' | 'left' | 'right',
    pressed: boolean
  ) => {
    const keyMap = {
      up: 'ArrowUp',
      down: 'ArrowDown',
      left: 'ArrowLeft',
      right: 'ArrowRight',
    };
    keysPressed.current[keyMap[dir]] = pressed;
    if (pressed) {
      sound.unlockAudio();
      if (targetPosRef.current) {
        targetPosRef.current = null;
        rendererRef.current?.clearDestination();
      }
    }
  };

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      sound.unlockAudio();
      keysPressed.current[e.key] = true;
      keysPressed.current[e.code] = true;

      // Cancel floor click target if manual keys are pressed
      if (
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'W', 's', 'S', 'a', 'A', 'd', 'D'].includes(e.key) ||
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS', 'KeyA', 'KeyD'].includes(e.code)
      ) {
        if (targetPosRef.current) {
          targetPosRef.current = null;
          rendererRef.current?.clearDestination();
        }
      }

      // Toggle Compass - Single dedicated key [C]
      if (e.key === 'c' || e.key === 'C' || e.code === 'KeyC') {
        if (!currentDialogue) {
          e.preventDefault();
          handleToggleCompass();
        }
      }

      // Interact / Talk - Single dedicated key [E]
      if (e.key === 'e' || e.key === 'E' || e.code === 'KeyE') {
        if (!currentDialogue) {
          handleInteract();
        }
      }

      // Open Journal - Single dedicated key [J]
      if (e.key === 'j' || e.key === 'J' || e.code === 'KeyJ') {
        if (!currentDialogue) {
          setShowJournal((prev) => !prev);
        }
      }

      // Toggle Mini-Map - Single dedicated key [M]
      if (e.key === 'm' || e.key === 'M' || e.code === 'KeyM') {
        setShowMiniMap((prev) => !prev);
      }

      // Open Emotional Regulation Toolkit - Single dedicated key [R]
      if (e.key === 'r' || e.key === 'R' || e.code === 'KeyR') {
        if (!currentDialogue) {
          handleOpenRegulation('Pemain', 'breathing');
        }
      }

      // Open Unified Settings Menu - Single dedicated key [O]
      if (e.key === 'o' || e.key === 'O' || e.code === 'KeyO') {
        setShowSettings((prev) => !prev);
      }

      // Open Controls Guide via [H] inside Settings Modal - Single dedicated key [H]
      if (e.key === 'h' || e.key === 'H' || e.code === 'KeyH') {
        setSettingsTab('controls');
        setShowSettings(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = false;
      keysPressed.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [currentDialogue, handleInteract, handleToggleCompass, handleOpenRegulation]);

  // Main 60 FPS Game Loop
  useEffect(() => {
    let animationFrameId: number;

    const gameLoop = () => {
      const p = playerRef.current;
      const speed = 2.8;

      let dx = 0;
      let dy = 0;

      // 1. Virtual Analog Joystick movement (smooth 360-degree vector)
      if (
        joystickVectorRef.current &&
        (Math.abs(joystickVectorRef.current.x) > 0.05 || Math.abs(joystickVectorRef.current.y) > 0.05)
      ) {
        dx = joystickVectorRef.current.x * speed;
        dy = joystickVectorRef.current.y * speed;

        if (Math.abs(dx) > Math.abs(dy)) {
          p.facing = dx > 0 ? 'right' : 'left';
        } else {
          p.facing = dy > 0 ? 'down' : 'up';
        }
      } else {
        // 2. Keyboard directional inputs
        if (
          keysPressed.current['ArrowUp'] ||
          keysPressed.current['KeyW'] ||
          keysPressed.current['w'] ||
          keysPressed.current['W']
        ) {
          dy -= speed;
          p.facing = 'up';
        }
        if (
          keysPressed.current['ArrowDown'] ||
          keysPressed.current['KeyS'] ||
          keysPressed.current['s'] ||
          keysPressed.current['S']
        ) {
          dy += speed;
          p.facing = 'down';
        }
        if (
          keysPressed.current['ArrowLeft'] ||
          keysPressed.current['KeyA'] ||
          keysPressed.current['a'] ||
          keysPressed.current['A']
        ) {
          dx -= speed;
          p.facing = 'left';
        }
        if (
          keysPressed.current['ArrowRight'] ||
          keysPressed.current['KeyD'] ||
          keysPressed.current['d'] ||
          keysPressed.current['D']
        ) {
          dx += speed;
          p.facing = 'right';
        }

        // Normalize diagonal movement speed for keyboard
        if (dx !== 0 && dy !== 0) {
          dx *= 0.7071;
          dy *= 0.7071;
        }
      }

      // Movement & collision resolution
      const isManualMoving = dx !== 0 || dy !== 0;

      if (isManualMoving) {
        // Manual input cancels any active floor click target
        if (targetPosRef.current) {
          targetPosRef.current = null;
          rendererRef.current?.clearDestination();
        }

        p.isMoving = true;
        stepCounterRef.current += 1;
        if (stepCounterRef.current % 14 === 0) {
          const isLeft = (stepCounterRef.current / 14) % 2 === 0;
          const tileRow = Math.floor((p.y + 24) / TILE_SIZE);
          const tileCol = Math.floor((p.x + 16) / TILE_SIZE);
          const tile = mapLayout[tileRow]?.[tileCol] ?? TILE.GRASS;
          const surface =
            tile === TILE.WOOD_BRIDGE
              ? 'wood'
              : tile === TILE.PATH_STONE ||
                tile === TILE.PLAZA_MOSAIC ||
                tile === TILE.PLAZA_BORDER ||
                tile === TILE.FOUNTAIN
              ? 'stone'
              : 'grass';
          sound.playFootstep(isLeft, surface);
        }

        // Horizontal movement
        if (dx !== 0 && !checkCollision(p.x + dx, p.y)) {
          p.x += dx;
        }
        // Vertical movement
        if (dy !== 0 && !checkCollision(p.x, p.y + dy)) {
          p.y += dy;
        }
      } else if (targetPosRef.current) {
        // Point-and-click / tap-to-move pathing
        const target = targetPosRef.current;
        const pCenterX = p.x + 16;
        const pCenterY = p.y + 16;
        const distX = target.x - pCenterX;
        const distY = target.y - pCenterY;
        const dist = Math.hypot(distX, distY);

        const reachedTarget = target;
        const reachedNPC = reachedTarget.targetNPC;
        let npcDist = Infinity;
        if (reachedNPC) {
          const nx = reachedNPC.x * TILE_SIZE + 16;
          const ny = reachedNPC.y * TILE_SIZE + 16;
          npcDist = Math.hypot(nx - pCenterX, ny - pCenterY);
        }

        // Destination reached:
        // 1. Reached close to target (dist <= 5)
        // 2. OR when approaching an NPC and already in speaking distance (npcDist <= 46px)
        // This stops the player comfortably in front of the NPC and prevents walking into any asset/obstacle!
        if (dist <= 5 || (reachedNPC && npcDist <= 46)) {
          targetPosRef.current = null;
          rendererRef.current?.clearDestination();
          p.isMoving = false;

          // If walking towards an NPC or secret, initiate interaction
          if (reachedNPC) {
            const nx = reachedNPC.x * TILE_SIZE + 16;
            const ny = reachedNPC.y * TILE_SIZE + 16;
            if (Math.abs(nx - pCenterX) > Math.abs(ny - pCenterY)) {
              p.facing = nx > pCenterX ? 'right' : 'left';
            } else {
              p.facing = ny > pCenterY ? 'down' : 'up';
            }
            reachedNPC.facing = pCenterX > nx ? 'right' : 'left';

            sound.playVoiceBlip();
            const dialogueKey =
              reachedNPC.currentDialogueId ||
              `${reachedNPC.id}_intro`;
            const node =
              GAME_DIALOGUES[dialogueKey] ||
              GAME_DIALOGUES[`${reachedNPC.id}_intro`];
            if (node) setCurrentDialogue(node);
          } else if (reachedTarget.targetType === 'tree') {
            sound.playSecretFound();
            rendererRef.current?.triggerScreenShake(5, 14);
            setCurrentDialogue(GAME_DIALOGUES.secret_tree);
          } else if (reachedTarget.targetType === 'fountain') {
            sound.playSecretFound();
            setCurrentDialogue(GAME_DIALOGUES.fountain_examine);
          } else if (reachedTarget.targetType === 'signpost') {
            sound.playSecretFound();
            setCurrentDialogue(GAME_DIALOGUES.signpost_forest);
          } else if (reachedTarget.targetType === 'farm_signpost') {
            sound.playSecretFound();
            setCurrentDialogue(GAME_DIALOGUES.signpost_farm);
          } else if (reachedTarget.targetType === 'tower') {
            sound.playTowerBell();
            rendererRef.current?.triggerScreenShake(4, 12);
            rendererRef.current?.addSparkle(30 * TILE_SIZE + 16, 6 * TILE_SIZE + 16, '#fbbf24', 12);
            setCurrentDialogue(
              zoneStatus.tower
                ? GAME_DIALOGUES.tower_examine_restored
                : GAME_DIALOGUES.tower_examine
            );
          }
        } else {
          const moveStep = Math.min(speed, dist);
          const angle = Math.atan2(distY, distX);
          const stepX = Math.cos(angle) * moveStep;
          const stepY = Math.sin(angle) * moveStep;

          // Update facing direction based on primary movement axis
          if (Math.abs(distX) > Math.abs(distY)) {
            p.facing = distX > 0 ? 'right' : 'left';
          } else {
            p.facing = distY > 0 ? 'down' : 'up';
          }

          let moved = false;
          // 1. Try moving directly along angle
          if (!checkCollision(p.x + stepX, p.y + stepY)) {
            p.x += stepX;
            p.y += stepY;
            moved = true;
          } else if (Math.abs(stepX) > 0.1 && !checkCollision(p.x + stepX, p.y)) {
            // 2. Try sliding horizontally
            p.x += stepX;
            moved = true;
          } else if (Math.abs(stepY) > 0.1 && !checkCollision(p.x, p.y + stepY)) {
            // 3. Try sliding vertically
            p.y += stepY;
            moved = true;
          } else {
            // 4. Try corner sliding along alternative axis to navigate around asset corners
            if (Math.abs(distX) >= Math.abs(distY)) {
              const altY = (distY !== 0 ? Math.sign(distY) : 1) * moveStep;
              if (!checkCollision(p.x, p.y + altY)) {
                p.y += altY;
                moved = true;
              }
            } else {
              const altX = (distX !== 0 ? Math.sign(distX) : 1) * moveStep;
              if (!checkCollision(p.x + altX, p.y)) {
                p.x += altX;
                moved = true;
              }
            }
          }

          if (moved) {
            p.isMoving = true;
            stepCounterRef.current += 1;
            if (stepCounterRef.current % 14 === 0) {
              const isLeft = (stepCounterRef.current / 14) % 2 === 0;
              const tileRow = Math.floor((p.y + 24) / TILE_SIZE);
              const tileCol = Math.floor((p.x + 16) / TILE_SIZE);
              const tile = mapLayout[tileRow]?.[tileCol] ?? TILE.GRASS;
              const surface =
                tile === TILE.WOOD_BRIDGE
                  ? 'wood'
                  : tile === TILE.PATH_STONE ||
                    tile === TILE.PLAZA_MOSAIC ||
                    tile === TILE.PLAZA_BORDER ||
                    tile === TILE.FOUNTAIN
                  ? 'stone'
                  : 'grass';
              sound.playFootstep(isLeft, surface);
            }
          } else {
            // Blocked by obstacle (e.g. wall/unopened bridge), check if already in speaking range of NPC
            if (targetPosRef.current?.targetNPC) {
              const blockedNPC = targetPosRef.current.targetNPC;
              const bnx = blockedNPC.x * TILE_SIZE + 16;
              const bny = blockedNPC.y * TILE_SIZE + 16;
              const bDist = Math.hypot(bnx - pCenterX, bny - pCenterY);
              // If already within conversational reach (<= 64px), start dialogue gracefully
              if (bDist <= 64) {
                targetPosRef.current = null;
                rendererRef.current?.clearDestination();
                p.isMoving = false;

                if (Math.abs(bnx - pCenterX) > Math.abs(bny - pCenterY)) {
                  p.facing = bnx > pCenterX ? 'right' : 'left';
                } else {
                  p.facing = bny > pCenterY ? 'down' : 'up';
                }
                blockedNPC.facing = pCenterX > bnx ? 'right' : 'left';

                sound.playVoiceBlip();
                const dialogueKey =
                  blockedNPC.currentDialogueId ||
                  `${blockedNPC.id}_intro`;
                const node =
                  GAME_DIALOGUES[dialogueKey] ||
                  GAME_DIALOGUES[`${blockedNPC.id}_intro`];
                if (node) setCurrentDialogue(node);
                return;
              }
            }
            targetPosRef.current = null;
            rendererRef.current?.clearDestination();
            p.isMoving = false;
          }
        }
      } else {
        p.isMoving = false;
      }

      // Autonomous behaviors for NPCs (Didi roaming and Pak Joko tending crops)
      if (!currentDialogue) {
        const px = p.x + 16;
        const py = p.y + 16;

        // 1. Didi the wandering scout
        const didi = npcs.find((n) => n.id === 'didi');
        if (didi) {
          const didiWorldX = didi.x * TILE_SIZE + 16;
          const didiWorldY = didi.y * TILE_SIZE + 16;
          const distToPlayer = Math.hypot(didiWorldX - px, didiWorldY - py);

          if (distToPlayer < 55) {
            // Notice and face player
            if (Math.abs(px - didiWorldX) > Math.abs(py - didiWorldY)) {
              didi.facing = px > didiWorldX ? 'right' : 'left';
            } else {
              didi.facing = py > didiWorldY ? 'down' : 'up';
            }
          } else {
            const patrol = didiPatrolRef.current;
            const targetWp = patrol.waypoints[patrol.currentWaypointIndex];
            const diffX = targetWp.x - didi.x;
            const diffY = targetWp.y - didi.y;
            const distToWp = Math.hypot(diffX, diffY);

            if (distToWp < 0.04) {
              didi.x = targetWp.x;
              didi.y = targetWp.y;
              patrol.waitTicks++;
              if (patrol.waitTicks >= targetWp.wait) {
                patrol.waitTicks = 0;
                patrol.currentWaypointIndex =
                  (patrol.currentWaypointIndex + 1) % patrol.waypoints.length;
              }
            } else {
              const moveSpeed = 0.025; // Gentle stroll speed in tile units per frame
              const angle = Math.atan2(diffY, diffX);
              didi.x += Math.cos(angle) * Math.min(moveSpeed, distToWp);
              didi.y += Math.sin(angle) * Math.min(moveSpeed, distToWp);

              if (Math.abs(diffX) > Math.abs(diffY)) {
                didi.facing = diffX > 0 ? 'right' : 'left';
              } else {
                didi.facing = diffY > 0 ? 'down' : 'up';
              }
            }
          }
        }

        // 2. Pak Joko the farmer tending crops
        const joko = npcs.find((n) => n.id === 'joko');
        if (joko) {
          const jokoWorldX = joko.x * TILE_SIZE + 16;
          const jokoWorldY = joko.y * TILE_SIZE + 16;
          const distToPlayer = Math.hypot(jokoWorldX - px, jokoWorldY - py);

          if (distToPlayer < 55) {
            if (Math.abs(px - jokoWorldX) > Math.abs(py - jokoWorldY)) {
              joko.facing = px > jokoWorldX ? 'right' : 'left';
            } else {
              joko.facing = py > jokoWorldY ? 'down' : 'up';
            }
          } else {
            const routine = jokoFarmingRef.current;
            const currentStep = routine.steps[routine.stepIndex];
            routine.waitTicks++;
            if (routine.waitTicks >= currentStep.wait) {
              routine.waitTicks = 0;
              routine.stepIndex = (routine.stepIndex + 1) % routine.steps.length;
              const nextStep = routine.steps[routine.stepIndex];
              joko.x = nextStep.x;
              joko.y = nextStep.y;
              joko.facing = nextStep.facing;
            }
          }
        }
      }

      // Camera positioning (centers on player with clamping, accounting for GAME_ZOOM)
      const mapTotalW = MAP_COLS * TILE_SIZE;
      const mapTotalH = MAP_ROWS * TILE_SIZE;
      const visibleW = viewportSize.width / GAME_ZOOM;
      const visibleH = viewportSize.height / GAME_ZOOM;

      let camX: number;
      if (visibleW >= mapTotalW) {
        camX = -(visibleW - mapTotalW) / 2;
      } else {
        camX = Math.max(
          0,
          Math.min(
            p.x - visibleW / 2 + 16,
            mapTotalW - visibleW
          )
        );
      }

      let camY: number;
      if (visibleH >= mapTotalH) {
        camY = -(visibleH - mapTotalH) / 2;
      } else {
        camY = Math.max(
          0,
          Math.min(
            p.y - visibleH / 2 + 16,
            mapTotalH - visibleH
          )
        );
      }

      // Keep cameraRef synchronized for click-to-world conversion
      cameraRef.current = { x: camX, y: camY };

      // Render Frame with focused zoom
      if (rendererRef.current) {
        const isMissionCompleted =
          isFreeRoamActive ||
          (zoneStatus.plaza && zoneStatus.bridge && zoneStatus.forest && zoneStatus.tower);

        rendererRef.current.render(
          mapLayout,
          p,
          npcs,
          zoneStatus,
          isCompassActive,
          camX,
          camY,
          viewportSize.width,
          viewportSize.height,
          GAME_ZOOM,
          isMissionCompleted
        );
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [mapLayout, npcs, zoneStatus, isCompassActive, viewportSize, checkCollision, isFreeRoamActive]);

  // Restart game for replayability
  const handleRestart = () => {
    setZoneStatus({
      plaza: false,
      bridge: false,
      forest: false,
      tower: false,
    });
    setInventory([]);
    setQuests(INITIAL_QUESTS);
    setStats({
      empathyScore: 20,
      resonanceUses: 0,
      calmTechniquesMastered: 0,
      secretsFound: 0,
      unlockedBadges: [],
    });
    playerRef.current.x = 11 * TILE_SIZE;
    playerRef.current.y = 15 * TILE_SIZE;
    targetPosRef.current = null;
    rendererRef.current?.clearDestination();
    setNpcs(INITIAL_NPCS);
    setShowEnding(false);
    setIsFreeRoamActive(false);
    setShowStartMenu(true);
    setCurrentDialogue(null);
  };

  // Enter free roam mode after game completion
  const handleFreeRoam = () => {
    setShowEnding(false);
    setIsFreeRoamActive(true);
    sound.playSecretFound();
    rendererRef.current?.addSparkle(
      playerRef.current.x + 16,
      playerRef.current.y + 16,
      '#34d399',
      30
    );
  };

  // Dynamic quest hint banner
  useEffect(() => {
    if (isFreeRoamActive) {
      setQuestHint('🌿 Mode Jelajah Bebas: Seluruh Lembah Nada Rasa telah pulih! Nikmati keindahan desa.');
    } else if (!zoneStatus.plaza) {
      setQuestHint(
        isCompassActive
          ? 'Misi 1: Dekati Kiki si tupai di barat air mancur dan ajak ia berbicara.'
          : 'Misi 1: Dekati Kiki si tupai di barat air mancur. Aktifkan Kompas Hati [C / Tombol Hati].'
      );
    } else if (!zoneStatus.bridge) {
      setQuestHint('Misi 2: Pergi ke timur menuju Jembatan Kayu. Bicara dengan Kakek Ranu.');
    } else if (!zoneStatus.forest) {
      setQuestHint('Misi 3: Cari Bimo di Hutan Sunyi (barat laut). Bantu ia mengatasi rasa malu.');
    } else if (!zoneStatus.tower) {
      setQuestHint('Misi 4: Bawa Roda Gigi Emas ke Menara Jam di timur laut!');
    } else {
      setQuestHint('Harmoni Lembah Pulih Sepenuhnya! Bicaralah pada warga untuk merayakan!');
    }
  }, [zoneStatus, isFreeRoamActive, isCompassActive]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans flex items-center justify-center">
      {/* 2D Pixel Canvas Viewport Container - Centered on Desktop with Arcade/Handheld Frame */}
      <main className="relative w-full h-full flex items-center justify-center p-0 md:p-3 lg:p-5 select-none overflow-hidden">
        <div
          ref={canvasContainerRef}
          className={`relative w-full h-full ${
            isPortrait
              ? 'sm:max-w-[560px] sm:max-h-[96vh]'
              : 'md:max-w-5xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[1600px] md:max-h-[85vh] lg:max-h-[88vh]'
          } md:rounded-2xl md:border-2 md:border-slate-800 md:shadow-[0_0_60px_rgba(0,0,0,0.9)] bg-slate-950 overflow-hidden flex items-center justify-center`}
        >
          <canvas
            ref={canvasRef}
            id="main-pixel-canvas"
            className="block max-w-full max-h-full shrink-0 cursor-crosshair"
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            onMouseLeave={handleCanvasMouseLeave}
            title="Klik di lantai untuk berjalan atau mendekati karakter dan objek"
          />
        </div>
      </main>

      {/* Dynamic Quest Tracker Banner - Full text visible across all screen sizes without truncation */}
      {!showStartMenu && (
        <div className="fixed top-12 sm:top-14 md:top-16 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl pointer-events-none">
          <div
            onClick={() => handleOpenSettings('quest')}
            title="Klik untuk melihat detail misi & objektif"
            className="bg-slate-950/95 border border-amber-500/60 hover:border-amber-400 rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 shadow-2xl backdrop-blur-md flex items-center gap-2 sm:gap-3 pointer-events-auto cursor-pointer transition active:scale-[0.99] group"
          >
            <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-400/50 rounded-lg px-2 py-0.5 text-amber-300 font-pixel text-[8px] sm:text-[9px] shrink-0 tracking-wider shadow-sm group-hover:bg-amber-500/30 transition-colors">
              <Sparkles className="w-3 h-3 text-amber-400 shrink-0 animate-pulse" />
              <span>MISI</span>
            </div>
            <p
              style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
              className="text-amber-100 text-xs sm:text-[13px] md:text-sm font-medium leading-normal sm:leading-relaxed tracking-normal break-words whitespace-normal flex-1 text-left sm:text-center select-text"
            >
              {questHint}
            </p>
          </div>
        </div>
      )}

      {/* Virtual Controls for Mobile & Desktop Toolbar */}
      {!showStartMenu && (
        <VirtualControls
          onDirectionPress={handleDirectionPress}
          onJoystickMove={handleJoystickMove}
          onActionPress={handleInteract}
          onCompassToggle={handleToggleCompass}
          isCompassActive={isCompassActive}
          onOpenJournal={() => setShowJournal(true)}
          onOpenSettings={() => handleOpenSettings('quest')}
          isDialogueOpen={!!currentDialogue}
          onToggleMiniMap={() => setShowMiniMap((prev) => !prev)}
          isMiniMapOpen={showMiniMap}
          onOpenEnding={() => setShowEnding(true)}
          isGameCompleted={
            isFreeRoamActive ||
            (zoneStatus.plaza && zoneStatus.bridge && zoneStatus.forest && zoneStatus.tower)
          }
          onOpenRegulation={() => handleOpenRegulation('Pemain', 'breathing')}
          onOpenStartMenu={() => setShowStartMenu(true)}
        />
      )}

      {/* Toggleable Mini-Map Overlay in the Corner */}
      {!showStartMenu && (
        <MiniMap
          isOpen={showMiniMap}
          onToggle={() => setShowMiniMap((prev) => !prev)}
          playerRef={playerRef}
          npcs={npcs}
          zoneStatus={zoneStatus}
          mapLayout={mapLayout}
          onNavigateToTile={handleMiniMapNavigate}
          isCompassActive={isCompassActive}
        />
      )}

      {/* Dialogue System Box */}
      {currentDialogue && (
        <DialogueBox
          dialogue={currentDialogue}
          onChoiceSelect={handleChoiceSelect}
          onNext={handleDialogueNext}
          onClose={() => setCurrentDialogue(null)}
          isCompassActive={isCompassActive}
        />
      )}

      {/* Interactive Emotion Regulation Studio (4 Modes for Player & NPCs) */}
      {showBreathingMiniGame && (
        <EmotionRegulationModal
          isOpen={showBreathingMiniGame}
          targetName={breathingTarget}
          initialMode={regulationInitialMode}
          onClose={() => setShowBreathingMiniGame(false)}
          onComplete={(_mode) => {
            setShowBreathingMiniGame(false);
            setStats((s) => ({
              ...s,
              calmTechniquesMastered: s.calmTechniquesMastered + 1,
              empathyScore: s.empathyScore + 25,
            }));

            // Sparkling aura effect around player's position
            rendererRef.current?.addSparkle(
              playerRef.current.x + 16,
              playerRef.current.y + 16,
              '#38bdf8',
              35
            );

            if (breathingTarget === 'Kiki') {
              const afterBreathe = GAME_DIALOGUES.kiki_after_breathe;
              if (afterBreathe) {
                processDialogueTriggers(afterBreathe);
                setCurrentDialogue(afterBreathe);
              }
            } else {
              setQuestHint('🌟 Latihan Regulasi Selesai! Pikiranmu jernih, tenang, dan siap berpetualang.');
            }
          }}
        />
      )}

      {/* Compass Journal & PSE Dictionary Modal */}
      <CompassJournalModal
        isOpen={showJournal}
        onClose={() => setShowJournal(false)}
        items={inventory}
        zoneStatus={zoneStatus}
        stats={stats}
      />

      {/* Unified Settings Modal (Quests, Achievements, Audio, Controls Guide, Offline Export) */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        initialTab={settingsTab}
        quests={quests}
        stats={stats}
        zoneStatus={zoneStatus}
        npcs={npcs}
        unlockedBadges={stats.unlockedBadges}
        empathyScore={stats.empathyScore}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Ending Celebration & Certificate Modal */}
      <EndingModal
        isOpen={showEnding}
        onRestart={handleRestart}
        onFreeRoam={handleFreeRoam}
        stats={stats}
        branchTag={branchChoice}
        endingType={endingType}
      />

      {/* Opening Start Menu Modal (Displayed before entering the game story) */}
      <StartMenuModal
        isOpen={showStartMenu}
        onStartGame={handleStartGame}
        onOpenControls={() => handleOpenSettings('controls')}
        onOpenAudioSettings={() => handleOpenSettings('audio')}
        isSettingsOpen={showSettings}
      />
    </div>
  );
}
