import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { GameRenderer, Player } from './game/renderer';
import {
  generateMapLayout,
  isTileSolid,
  isDecorativeTile,
  isHardStructuralSolid,
  TILE_SIZE,
  MAP_COLS,
  MAP_ROWS,
  TILE,
  INITIAL_NPCS,
  INITIAL_QUESTS,
  INITIAL_ITEMS,
  NPC_RESOLVED_DIALOGUES,
  NPC_INTRO_DIALOGUES,
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
import { freeRoamWorld } from './game/freeRoamWorld';
import { findTilePath } from './game/pathfinder';
import { DialogueBox } from './components/DialogueBox';
import { EmotionRegulationModal, RegulationMode } from './components/EmotionRegulationModal';
import { CompassJournalModal } from './components/CompassJournalModal';
import { SettingsModal, SettingsModalTab } from './components/SettingsModal';
import { EndingModal } from './components/EndingModal';
import { AllBadgesCelebrationModal } from './components/AllBadgesCelebrationModal';
import { CaptureMomentModal } from './components/CaptureMomentModal';
import { VirtualControls } from './components/VirtualControls';
import { MiniMap } from './components/MiniMap';
import { StartMenuModal } from './components/StartMenuModal';
import { PauseMenuModal } from './components/PauseMenuModal';
import { MissionNotificationModal, MissionStepData } from './components/MissionNotificationModal';
import { Sparkles, Compass } from 'lucide-react';
import { isMobileOrTabletDevice, useIsPortrait, useIsMobileOrTablet } from './utils/device';
import { PSE_ACHIEVEMENTS } from './game/constants';

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
  const zoneStatusRef = useRef<ZoneColorStatus>(zoneStatus);
  zoneStatusRef.current = zoneStatus;
  const [inventory, setInventory] = useState<Item[]>(INITIAL_ITEMS);
  const [quests, setQuests] = useState<GameQuest[]>(INITIAL_QUESTS);
  const [stats, setStats] = useState<PlayerStats>({
    empathyScore: 20,
    resonanceUses: 0,
    calmTechniquesMastered: 0,
    secretsFound: 0,
    unlockedBadges: [],
  });
  const statsRef = useRef<PlayerStats>(stats);
  statsRef.current = stats;

  const isFreeRoamActiveRef = useRef<boolean>(false);

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
    minDistSoFar?: number;
    stuckFrames?: number;
    waypoints?: Array<{ x: number; y: number; col?: number; row?: number }>;
    waypointIndex?: number;
    isGuidedMode?: boolean;
  } | null>(null);

  // Step counter for footstep audio pacing and left/right cadence
  const stepCounterRef = useRef<number>(0);

  // Autonomous patrol / wander state for Roaming NPCs:
  // 1. Didi: Grand Circuit (Plaza -> Kebun -> Hutan -> Menara Jam -> return)
  const didiPatrolRef = useRef({
    currentWaypointIndex: 0,
    waitTicks: 0,
    waypoints: [
      // Plaza Alun-Alun
      { x: 11, y: 15, wait: 120, label: 'Alun-Alun' },
      { x: 11, y: 17, wait: 30, label: 'Simpang Alun-Alun' },
      // Menuju Kebun Sayur & Pertanian Pak Joko
      { x: 7, y: 17, wait: 40, label: 'Jalur Kebun' },
      { x: 7, y: 22, wait: 140, label: 'Kebun Harapan Pak Joko' },
      { x: 7, y: 17, wait: 40, label: 'Kembali ke Jalur Tengah' },
      { x: 11, y: 17, wait: 40, label: 'Simpang Tengah' },
      // Menuju Hutan Pinus Utara
      { x: 11, y: 14, wait: 30, label: 'Jalur Menuju Hutan' },
      { x: 11, y: 10, wait: 40, label: 'Pintu Gerbang Hutan' },
      { x: 11, y: 7, wait: 140, label: 'Kawasan Hutan Pinus' },
      { x: 11, y: 10, wait: 30, label: 'Kembali dari Hutan' },
      { x: 11, y: 14, wait: 30, label: 'Simpang Plaza Timur' },
      // Menuju Jembatan & Menara Jam Harmoni
      { x: 15, y: 15, wait: 30, label: 'Jalan Jembatan Barat' },
      { x: 21, y: 15, wait: 60, label: 'Jembatan Harmoni' },
      { x: 26, y: 15, wait: 40, label: 'Seberang Jembatan Timur' },
      { x: 30, y: 15, wait: 30, label: 'Simpang Jalan Menara' },
      { x: 30, y: 9, wait: 150, label: 'Pelataran Menara Jam' },
      { x: 30, y: 15, wait: 40, label: 'Turun dari Menara' },
      { x: 26, y: 15, wait: 30, label: 'Kembali ke Jembatan' },
      { x: 21, y: 15, wait: 40, label: 'Menyeberang Jembatan' },
      { x: 15, y: 15, wait: 30, label: 'Kembali ke Alun-Alun' },
    ],
  });

  // 2. Kiki: Delivery Route delivering letters between village residents
  const kikiPatrolRef = useRef({
    currentWaypointIndex: 0,
    waitTicks: 0,
    waypoints: [
      { x: 8, y: 13, wait: 140, label: 'Kotak Pos Alun-Alun' },
      { x: 11, y: 13, wait: 40, label: 'Jalur Timur Plaza' },
      { x: 11, y: 16, wait: 40, label: 'Simpang Selatan Plaza' },
      { x: 7, y: 16, wait: 50, label: 'Menuju Rumah Warga Barat' },
      { x: 7, y: 20, wait: 150, label: 'Kirim Surat ke Kebun Pak Joko' },
      { x: 7, y: 16, wait: 40, label: 'Kembali ke Jalur Tengah' },
      { x: 14, y: 16, wait: 40, label: 'Menuju Dermaga & Jembatan' },
      { x: 20, y: 15, wait: 160, label: 'Kirim Surat Apresiasi Kakek Ranu' },
      { x: 14, y: 15, wait: 40, label: 'Kembali Menuju Alun-Alun' },
      { x: 11, y: 11, wait: 50, label: 'Jalur Utara Menuju Hutan' },
      { x: 11, y: 7, wait: 150, label: 'Kirim Surat untuk Bimo & Hutan' },
      { x: 11, y: 11, wait: 40, label: 'Kembali ke Alun-Alun' },
    ],
  });

  // 3. Prof. Kotek: Emotional Science Field Researcher measuring happiness resonance
  const kotekPatrolRef = useRef({
    currentWaypointIndex: 0,
    waitTicks: 0,
    waypoints: [
      { x: 16, y: 19, wait: 140, label: 'Pos Riset Alun-Alun Selatan' },
      { x: 13, y: 18, wait: 60, label: 'Sensor Resonansi Dekat Bunga' },
      { x: 11, y: 17, wait: 50, label: 'Pusat Gelombang Simpang Desa' },
      { x: 9, y: 19, wait: 160, label: 'Mengukur Gelombang Tawa Petani' },
      { x: 11, y: 17, wait: 50, label: 'Kembali ke Pusat Sinyal' },
      { x: 14, y: 15, wait: 50, label: 'Meneliti Resonansi Gemercik Air' },
      { x: 18, y: 15, wait: 150, label: 'Sensor Harmoni Dekat Jembatan' },
      { x: 14, y: 17, wait: 60, label: 'Kembali ke Pos Pengamatan' },
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
  const [playerName, setPlayerName] = useState<string>(() => {
    const saved = localStorage.getItem('lembah_player_name');
    if (saved === 'Ezsela' || saved === 'Kayla') return 'Ezzy';
    if (saved === 'Aris') return 'Ezzel';
    return saved || 'Ezzel';
  });
  const [playerAvatar, setPlayerAvatar] = useState<'boy' | 'girl'>(() => {
    const saved = localStorage.getItem('lembah_player_avatar');
    if (saved === 'girl') return 'girl';
    return 'boy';
  });
  const [isCompassActive, setIsCompassActive] = useState<boolean>(false);
  const [currentDialogue, setCurrentDialogue] = useState<DialogueNode | null>(null);
  const [showBreathingMiniGame, setShowBreathingMiniGame] = useState<boolean>(false);
  const [breathingTarget, setBreathingTarget] = useState<string>('Kiki');
  const [regulationInitialMode, setRegulationInitialMode] = useState<RegulationMode>('breathing');
  const [showJournal, setShowJournal] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [settingsTab, setSettingsTab] = useState<SettingsModalTab>('quest');
  const [showPauseMenu, setShowPauseMenu] = useState<boolean>(false);
  const showPauseMenuRef = useRef<boolean>(false);
  const [showEnding, setShowEnding] = useState<boolean>(false);
  const [showAllBadgesCelebration, setShowAllBadgesCelebration] = useState<boolean>(false);
  const hasSeenAllBadgesCelebrationRef = useRef<boolean>(false);
  const pendingAllBadgesCelebrationRef = useRef<boolean>(false);
  const [isFreeRoamActive, setIsFreeRoamActive] = useState<boolean>(false);
  useEffect(() => {
    isFreeRoamActiveRef.current = isFreeRoamActive;
  }, [isFreeRoamActive]);
  const [endingType, setEndingType] = useState<'perfect' | 'resilient'>('perfect');
  const [branchChoice, setBranchChoice] = useState<string>('empathy_first');
  const [isMuted, setIsMuted] = useState<boolean>(() => sound.isMuted);
  const [showMiniMap, setShowMiniMap] = useState<boolean>(() => !isMobileOrTabletDevice());
  const [developerToast, setDeveloperToast] = useState<string | null>(null);
  const [questHint, setQuestHint] = useState<string>(
    'Pusaka Kompas Hati terjatuh di depanmu! Tekan [C] atau tombol Kompas untuk menggunakannya.'
  );
  // Dedicated Sequential Mission Pop-up state
  const [showMissionModal, setShowMissionModal] = useState<boolean>(false);
  const [isNewMissionUnlock, setIsNewMissionUnlock] = useState<boolean>(false);
  const lastStepRef = useRef<number>(1);
  // Intro / Narrator & Petunjuk Awal completion tracker
  const [hasCompletedIntroTutorial, setHasCompletedIntroTutorial] = useState<boolean>(false);
  const hasCompletedIntroTutorialRef = useRef<boolean>(false);

  useEffect(() => {
    hasCompletedIntroTutorialRef.current = hasCompletedIntroTutorial;
  }, [hasCompletedIntroTutorial]);

  // Capture Moment state
  const [showCaptureMoment, setShowCaptureMoment] = useState<boolean>(false);
  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string | null>(null);
  const [capturedLocationName, setCapturedLocationName] = useState<string>('Alun-alun & Air Mancur Desa');
  const [showCameraFlash, setShowCameraFlash] = useState<boolean>(false);

  // Helper to determine location for screenshot metadata
  const getCurrentLocationName = useCallback((): string => {
    const p = playerRef.current;
    const col = Math.floor(p.x / 32);
    const row = Math.floor(p.y / 32);
    if (row < 12 && col < 18) return 'Hutan Sahabat Purba';
    if (row < 12 && col >= 20) return 'Kawasan Menara Jam Harmoni';
    if (row >= 12 && row <= 18 && col >= 20 && col <= 26) return 'Jembatan Kedamaian & Sungai';
    if (row >= 17 && col < 18) return 'Kebun Harapan Pak Joko';
    if (row >= 17 && col >= 18) return 'Pondok Desa & Kebun Buah Ibu Sari';
    return 'Alun-alun & Air Mancur Desa';
  }, []);

  // Action to capture current game area screenshot
  const handleCaptureMoment = useCallback(() => {
    sound.playCameraShutter();
    setShowCameraFlash(true);
    setTimeout(() => setShowCameraFlash(false), 300);

    // If Settings is open, close it so player can review their photo
    setShowSettings(false);

    if (canvasRef.current) {
      try {
        const dataUrl = canvasRef.current.toDataURL('image/png');
        setScreenshotDataUrl(dataUrl);
        setCapturedLocationName(getCurrentLocationName());
        setShowCaptureMoment(true);
      } catch (err) {
        console.error('Failed to capture canvas screenshot:', err);
      }
    }
  }, [getCurrentLocationName]);

  // Trigger Grand Celebration when all 10 badges are collected
  const triggerAllBadgesCelebration = useCallback(() => {
    hasSeenAllBadgesCelebrationRef.current = true;
    pendingAllBadgesCelebrationRef.current = false;
    sound.playAllBadgesFanfare();
    rendererRef.current?.triggerScreenShake(8, 24);
    rendererRef.current?.addSparkle(
      playerRef.current.x + 16,
      playerRef.current.y + 16,
      '#f59e0b',
      35
    );
    setShowAllBadgesCelebration(true);
  }, []);

  // Developer / Teacher shortcut to unlock all badges and immediately view appreciation dialogue
  const handleUnlockAllBadgesTest = useCallback(() => {
    const allIds = PSE_ACHIEVEMENTS.map((b) => b.id);
    setStats((prev) => ({
      ...prev,
      unlockedBadges: allIds,
      empathyScore: Math.max(prev.empathyScore, 220),
    }));
    triggerAllBadgesCelebration();
  }, [triggerAllBadgesCelebration]);

  // Mode Developer (PIN: 12345): Masuk langsung ke Mode Jelajah Bebas dengan 100% Misi & 100% Pencapaian
  const handleActivateDeveloperMode = useCallback(() => {
    // 1. Pulihkan dan warnai seluruh 4 wilayah desa (Plaza, Jembatan, Hutan, Menara)
    setZoneStatus({
      plaza: true,
      bridge: true,
      forest: true,
      tower: true,
    });

    // 2. Selesaikan seluruh misi utama (100% Selesai)
    setQuests((prev) =>
      prev.map((q) => ({
        ...q,
        isCompleted: true,
      }))
    );

    // 3. Buka seluruh 10 Lencana Pencapaian PSE (100%) dengan skor empati maksimal
    const allBadgeIds = PSE_ACHIEVEMENTS.map((b) => b.id);
    setStats({
      empathyScore: 500,
      resonanceUses: 20,
      calmTechniquesMastered: 5,
      secretsFound: 5,
      unlockedBadges: allBadgeIds,
    });

    // 4. Resolusikan seluruh warga desa ke emosi bahagia, tenang, dan damai serta atur posisi mengobrol
    setNpcs((prev) =>
      prev.map((npc) => {
        const base = {
          ...npc,
          isResolved: true,
          currentDialogueId: NPC_RESOLVED_DIALOGUES[npc.id] || `${npc.id}_resolved`,
          emotionProfile: {
            ...npc.emotionProfile,
            surfaceEmotion: 'tenang',
            deepEmotion: 'gembira',
            reason: 'Merasa damai dan bahagia karena Lembah Nada Rasa telah kembali harmonis.',
          },
        };

        // Chatting Pair 1: Kak Citra & Moka in Plaza Flower Garden
        if (npc.id === 'kak_citra') {
          return { ...base, x: 13, y: 16, facing: 'right', isChatting: true, chatPartnerId: 'moka_cat' };
        }
        if (npc.id === 'moka_cat') {
          return { ...base, x: 14, y: 16, facing: 'left', isChatting: true, chatPartnerId: 'kak_citra' };
        }
        // Chatting Pair 2: Kakek Ranu & Bimo at Bridge Pavilion
        if (npc.id === 'kakek_ranu') {
          return { ...base, x: 23, y: 15, facing: 'right', isChatting: true, chatPartnerId: 'bimo' };
        }
        if (npc.id === 'bimo') {
          return { ...base, x: 24, y: 15, facing: 'left', isChatting: true, chatPartnerId: 'kakek_ranu' };
        }
        // Chatting Pair 3: Pak Teguh & Ibu Sari at Forest Edge
        if (npc.id === 'teguh_woodcutter') {
          return { ...base, x: 10, y: 6, facing: 'right', isChatting: true, chatPartnerId: 'sari_fruit' };
        }
        if (npc.id === 'sari_fruit') {
          return { ...base, x: 11, y: 6, facing: 'left', isChatting: true, chatPartnerId: 'teguh_woodcutter' };
        }
        // Chatting Pair 4: Kakek Damai & Bung Jala at Riverbank
        if (npc.id === 'kakek_damai') {
          return { ...base, x: 25, y: 19, facing: 'right', isChatting: true, chatPartnerId: 'jala_fisher' };
        }
        if (npc.id === 'jala_fisher') {
          return { ...base, x: 26, y: 19, facing: 'left', isChatting: true, chatPartnerId: 'kakek_damai' };
        }
        // Roaming NPCs
        if (npc.id === 'kiki') {
          return { ...base, isRoaming: true, roamActivity: 'Mengantar Surat Apresiasi Desa' };
        }
        if (npc.id === 'prof_kotek') {
          return { ...base, isRoaming: true, roamActivity: 'Riset Lapangan Resonansi Emosi' };
        }
        if (npc.id === 'didi_scout' || npc.id === 'didi') {
          return { ...base, isRoaming: true, roamActivity: 'Patroli Rute Harmoni Desa' };
        }

        return base;
      })
    );

    // 5. Aktifkan Mode Jelajah Bebas secara langsung
    hasSeenAllBadgesCelebrationRef.current = true;
    pendingAllBadgesCelebrationRef.current = false;
    setIsFreeRoamActive(true);
    setShowEnding(false);
    setShowStartMenu(false);
    setCurrentDialogue(null);
    setShowSettings(false);

    // 6. Mainkan efek audio selebrasi meriah & efek partikel berkilau
    sound.unlockAudio();
    sound.playAllBadgesFanfare();
    sound.setBgmPhase('restored', true);
    rendererRef.current?.triggerScreenShake(7, 24);
    rendererRef.current?.addSparkle(
      playerRef.current.x + 16,
      playerRef.current.y + 16,
      '#f59e0b',
      45
    );

    // 7. Tampilkan notifikasi visual toast di layar
    setDeveloperToast(
      '🚀 MODE DEVELOPER AKTIF: Mode Jelajah Bebas Terbuka! Misi Utama 100% & Pencapaian 100% Terbuka Penuh.'
    );
    setTimeout(() => {
      setDeveloperToast(null);
    }, 5000);
  }, []);

  // Sync mute state with sound system
  useEffect(() => {
    const unsub = sound.subscribe(() => {
      setIsMuted(sound.isMuted);
    });
    return unsub;
  }, []);

  // Handler for starting the game adventure directly into the story from opening menu
  const handleStartGame = useCallback((name: string, avatar: 'boy' | 'girl') => {
    const finalName = name.trim() || (avatar === 'girl' ? 'Ezzy' : 'Ezzel');
    setPlayerName(finalName);
    setPlayerAvatar(avatar);
    localStorage.setItem('lembah_player_name', finalName);
    localStorage.setItem('lembah_player_avatar', avatar);
    if (rendererRef.current) {
      rendererRef.current.setPlayerAvatar(avatar);
      rendererRef.current.setPlayerName(finalName);
    }

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

  // Auto-resolve prof_kotek if player already received item_egg_badge previously but badge/resolution was pending
  useEffect(() => {
    const hasEggBadge = inventory.some((item) => item.id === 'item_egg_badge');
    if (hasEggBadge) {
      const kotekNPC = npcs.find((n) => n.id === 'prof_kotek');
      if (kotekNPC && !kotekNPC.isResolved) {
        resolveNPC(
          'prof_kotek',
          {
            surfaceEmotion: 'gembira',
            deepEmotion: 'gembira',
            reason: 'Tawa ceria dan endorfin positif menyebar ke seluruh penjuru desa.',
          },
          'kotek_resolved'
        );
      }
      if (!stats.unlockedBadges.includes('badge_laughter_medicine')) {
        setStats((prev) => {
          const updated = [...(prev.unlockedBadges || []), 'badge_laughter_medicine'];
          if (updated.length >= PSE_ACHIEVEMENTS.length && !hasSeenAllBadgesCelebrationRef.current) {
            setTimeout(() => {
              triggerAllBadgesCelebration();
            }, 350);
          }
          return {
            ...prev,
            unlockedBadges: updated,
            empathyScore: prev.empathyScore + 20,
          };
        });
      }
    }
  }, [inventory, npcs, stats.unlockedBadges, resolveNPC, triggerAllBadgesCelebration]);

  // Immediately synchronize active quest target into renderer whenever mission or tutorial state updates
  useEffect(() => {
    if (!rendererRef.current) return;
    const isMissionCompleted =
      isFreeRoamActive ||
      (zoneStatus.plaza && zoneStatus.bridge && zoneStatus.forest && zoneStatus.tower);

    if (isMissionCompleted || !hasCompletedIntroTutorial) {
      rendererRef.current.setActiveQuestTarget(null);
      return;
    }

    if (!zoneStatus.plaza) {
      const kiki = npcs.find((n) => n.id === 'kiki');
      rendererRef.current.setActiveQuestTarget({
        npcId: 'kiki',
        stepNumber: 1,
        label: 'Kiki',
        targetX: (kiki?.x ?? 8) * TILE_SIZE + 16,
        targetY: (kiki?.y ?? 14) * TILE_SIZE + 16,
      });
    } else if (!zoneStatus.bridge) {
      const ranu = npcs.find((n) => n.id === 'kakek_ranu');
      rendererRef.current.setActiveQuestTarget({
        npcId: 'kakek_ranu',
        stepNumber: 2,
        label: 'Kakek Ranu',
        targetX: (ranu?.x ?? 20) * TILE_SIZE + 16,
        targetY: (ranu?.y ?? 15) * TILE_SIZE + 16,
      });
    } else if (!zoneStatus.forest) {
      const bimo = npcs.find((n) => n.id === 'bimo');
      rendererRef.current.setActiveQuestTarget({
        npcId: 'bimo',
        stepNumber: 3,
        label: 'Bimo',
        targetX: (bimo?.x ?? 7) * TILE_SIZE + 16,
        targetY: (bimo?.y ?? 6) * TILE_SIZE + 16,
      });
    } else if (!zoneStatus.tower) {
      const penjaga = npcs.find((n) => n.id === 'penjaga_kabut');
      rendererRef.current.setActiveQuestTarget({
        npcId: 'penjaga_kabut',
        stepNumber: 4,
        label: 'Menara Jam',
        targetX: (penjaga?.x ?? 29) * TILE_SIZE + 16,
        targetY: (penjaga?.y ?? 8) * TILE_SIZE + 16,
      });
    }
  }, [zoneStatus, npcs, isFreeRoamActive, hasCompletedIntroTutorial]);

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
      const renderer = new GameRenderer(canvasRef.current);
      renderer.setPlayerAvatar(playerAvatar);
      renderer.setPlayerName(playerName);
      rendererRef.current = renderer;
    }
  }, [playerAvatar, playerName]);

  // Sync avatar and name representation if changed
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setPlayerAvatar(playerAvatar);
      rendererRef.current.setPlayerName(playerName);
    }
  }, [playerAvatar, playerName]);

  // Toggle Resonance Compass
  const handleToggleCompass = useCallback(() => {
    setIsCompassActive((prev) => {
      const next = !prev;
      if (next) {
        sound.playCompassChime();
        setStats((s) => ({ ...s, resonanceUses: s.resonanceUses + 1 }));

        // Trigger radiant sparkle particles burst from Heart Compass
        if (rendererRef.current && playerRef.current) {
          const px = playerRef.current.x + 16;
          const py = playerRef.current.y + 16;
          rendererRef.current.triggerCompassBurst(px, py);
        }
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
  // ignoreDecorative: if true, allows passing through decorative elements (trees, plants, benches)
  // while strictly enforcing hard structural boundaries (cliffs, deep water, building walls/doors, locked gates)
  const checkCollision = useCallback(
    (x: number, y: number, ignoreDecorative: boolean = false): boolean => {
      const pW = 16;
      const pH = 8;
      const feetX = x + 8;
      const feetY = y + 22;

      const corners = [
        { x: feetX, y: feetY },
        { x: feetX + pW - 1, y: feetY },
        { x: feetX, y: feetY + pH - 1 },
        { x: feetX + pW - 1, y: feetY + pH - 1 },
      ];

      for (const pt of corners) {
        const c = Math.floor(pt.x / TILE_SIZE);
        const r = Math.floor(pt.y / TILE_SIZE);

        if (r < 0 || r >= MAP_ROWS || c < 0 || c >= MAP_COLS) return true;

        const tile = mapLayout[r][c];
        if (ignoreDecorative) {
          if (isHardStructuralSolid(tile)) return true;
        } else {
          if (isTileSolid(tile)) return true;
        }

        // Bridge gate check: if bridge not yet restored, prevent crossing beyond x = 20*TILE_SIZE
        if (!zoneStatus.bridge && c >= 21 && c <= 24 && r >= 14 && r <= 16) {
          return true;
        }

        // Windmill solid footprint in Free Roam / Restored world (c: 15..16, r: 24..25)
        if (isFreeRoamActive || (zoneStatus.plaza && zoneStatus.bridge && zoneStatus.forest && zoneStatus.tower)) {
          if ((c === 15 || c === 16) && (r === 24 || r === 25)) {
            return true;
          }
        }
      }
      return false;
    },
    [mapLayout, zoneStatus, isFreeRoamActive]
  );

  // Check if a tile coordinate is passable for A* pathfinding
  const isTilePassable = useCallback(
    (c: number, r: number): boolean => {
      if (r < 0 || r >= MAP_ROWS || c < 0 || c >= MAP_COLS) return false;
      const tile = mapLayout[r]?.[c];
      if (tile === undefined || isTileSolid(tile)) return false;

      // Bridge gate check: if bridge not yet restored, prevent crossing beyond x = 20*TILE_SIZE
      if (!zoneStatus.bridge && c >= 21 && c <= 24 && r >= 14 && r <= 16) {
        return false;
      }

      // Windmill solid footprint in Free Roam / Restored world (c: 15..16, r: 24..25)
      if (isFreeRoamActive || (zoneStatus.plaza && zoneStatus.bridge && zoneStatus.forest && zoneStatus.tower)) {
        if ((c === 15 || c === 16) && (r === 24 || r === 25)) {
          return false;
        }
      }

      return true;
    },
    [mapLayout, zoneStatus.bridge, isFreeRoamActive, zoneStatus.plaza, zoneStatus.forest, zoneStatus.tower]
  );

  // Identify decorative/nature tiles that can be dynamically bypassed for mission NPC pathfinding
  const isTileDecorativeAt = useCallback(
    (c: number, r: number): boolean => {
      if (r < 0 || r >= MAP_ROWS || c < 0 || c >= MAP_COLS) return false;
      // Never bypass the locked bridge gate
      if (!zoneStatus.bridge && c >= 21 && c <= 24 && r >= 14 && r <= 16) {
        return false;
      }
      const tile = mapLayout[r]?.[c];
      if (tile === undefined) return false;
      return isDecorativeTile(tile);
    },
    [mapLayout, zoneStatus.bridge]
  );

  // Calculate safe, walkable talk position near an NPC without colliding with any obstacles/assets.
  // Dynamically relaxes decorative obstacles (trees, bushes) if the NPC is in dense terrain.
  const getSafeNPCTalkPosition = useCallback(
    (npc: NPC, playerCenterX: number, playerCenterY: number): { x: number; y: number } => {
      const nx = npc.x * TILE_SIZE + 16;
      const ny = npc.y * TILE_SIZE + 16;
      const idealDist = 34; // comfortable distance from NPC center in pixels

      // 1. Direct approach angle
      const directAngle = Math.atan2(playerCenterY - ny, playerCenterX - nx);
      const directX = nx + Math.cos(directAngle) * idealDist;
      const directY = ny + Math.sin(directAngle) * idealDist;

      // If the direct approach spot is completely open and collision-free, use it!
      if (!checkCollision(directX - 16, directY - 16, false)) {
        return { x: directX, y: directY };
      }

      // Candidate offsets in 8 directions (cardinals & diagonals)
      const candidateDistances = [34, 38, 30, 42, 28, 46];
      const angleOffsets = [
        { dx: 0, dy: 1 },        // South (in front/below)
        { dx: -1, dy: 0 },       // West (left)
        { dx: 1, dy: 0 },        // East (right)
        { dx: 0, dy: -1 },       // North (above)
        { dx: -0.707, dy: 0.707 },
        { dx: 0.707, dy: 0.707 },
        { dx: -0.707, dy: -0.707 },
        { dx: 0.707, dy: -0.707 },
      ];

      // Pass 1: Strict open-ground search (zero collisions with any tile)
      const pureSpots: Array<{ x: number; y: number; distToPlayer: number }> = [];
      for (const d of candidateDistances) {
        for (const off of angleOffsets) {
          const cx = nx + off.dx * d;
          const cy = ny + off.dy * d;
          if (!checkCollision(cx - 16, cy - 16, false)) {
            const dist = Math.hypot(cx - playerCenterX, cy - playerCenterY);
            pureSpots.push({ x: cx, y: cy, distToPlayer: dist });
          }
        }
        if (pureSpots.length > 0) break;
      }

      if (pureSpots.length > 0) {
        // Pick the safe spot closest to the player's current location
        pureSpots.sort((a, b) => a.distToPlayer - b.distToPlayer);
        return { x: pureSpots[0].x, y: pureSpots[0].y };
      }

      // Pass 2: Dynamic decorative bypass
      // If NPC is surrounded by dense trees or decorative flora (e.g. in the forest or orchard),
      // allow spots overlapping decorative elements while strictly preventing immersion in cliffs, water, or building walls!
      const bypassSpots: Array<{ x: number; y: number; distToPlayer: number }> = [];
      for (const d of candidateDistances) {
        for (const off of angleOffsets) {
          const cx = nx + off.dx * d;
          const cy = ny + off.dy * d;
          if (!checkCollision(cx - 16, cy - 16, true)) {
            const dist = Math.hypot(cx - playerCenterX, cy - playerCenterY);
            bypassSpots.push({ x: cx, y: cy, distToPlayer: dist });
          }
        }
        if (bypassSpots.length > 0) break;
      }

      if (bypassSpots.length > 0) {
        bypassSpots.sort((a, b) => a.distToPlayer - b.distToPlayer);
        return { x: bypassSpots[0].x, y: bypassSpots[0].y };
      }

      // Fallback: direct approach angle safe from hard walls
      if (!checkCollision(directX - 16, directY - 16, true)) {
        return { x: directX, y: directY };
      }

      // Safe south offset
      return { x: nx, y: ny + 32 };
    },
    [checkCollision]
  );

  // Helper to reliably find dialogue node for an NPC in any game state (including Developer Mode / Free Roam)
  const getNPCDialogueNode = useCallback((npc: NPC): DialogueNode | null => {
    const unlocked = stats.unlockedBadges || [];

    // Badge status for chatting pairs
    const citraBadgeUnlocked = unlocked.includes('badge_counselor_zones');
    const mokaBadgeUnlocked = unlocked.includes('badge_active_listening');
    const citraMokaPairActive = citraBadgeUnlocked && mokaBadgeUnlocked;

    const teguhBadgeUnlocked = unlocked.includes('badge_woodcutter_anger');
    const sariBadgeUnlocked = unlocked.includes('badge_fruit_gratitude');
    const teguhSariPairActive = teguhBadgeUnlocked && sariBadgeUnlocked;

    const damaiBadgeUnlocked = unlocked.includes('badge_circle_of_control');
    const jalaBadgeUnlocked = unlocked.includes('badge_fisherman_patience');
    const damaiJalaPairActive = damaiBadgeUnlocked && jalaBadgeUnlocked;

    const ranuResolved = npc.id === 'kakek_ranu' ? npc.isResolved : npcs.find((n) => n.id === 'kakek_ranu')?.isResolved;
    const bimoResolved = npc.id === 'bimo' ? npc.isResolved : npcs.find((n) => n.id === 'bimo')?.isResolved;
    const ranuBimoPairActive = Boolean(ranuResolved && bimoResolved);

    // 0. In Free Roam mode:
    // Pair chatting and contextual dialogue ONLY occur after the dialogue interaction to earn the badge has been completed!
    if (isFreeRoamActive) {
      // Chatting Pair 1: Kak Citra & Moka
      if (npc.id === 'kak_citra') {
        if (citraMokaPairActive && GAME_DIALOGUES.chat_citra_moka_citra) {
          return GAME_DIALOGUES.chat_citra_moka_citra;
        }
        if (!citraBadgeUnlocked && GAME_DIALOGUES.citra_intro) {
          return GAME_DIALOGUES.citra_intro;
        }
        if (GAME_DIALOGUES.citra_resolved) {
          return GAME_DIALOGUES.citra_resolved;
        }
      }

      if (npc.id === 'moka_cat') {
        if (citraMokaPairActive && GAME_DIALOGUES.chat_citra_moka_moka) {
          return GAME_DIALOGUES.chat_citra_moka_moka;
        }
        if (!mokaBadgeUnlocked && GAME_DIALOGUES.moka_intro) {
          return GAME_DIALOGUES.moka_intro;
        }
        if (GAME_DIALOGUES.moka_resolved) {
          return GAME_DIALOGUES.moka_resolved;
        }
      }

      // Chatting Pair 2: Kakek Ranu & Bimo
      if (npc.id === 'kakek_ranu') {
        if (ranuBimoPairActive && GAME_DIALOGUES.chat_ranu_bimo_ranu) {
          return GAME_DIALOGUES.chat_ranu_bimo_ranu;
        }
        if (!ranuResolved && GAME_DIALOGUES.ranu_intro) {
          return GAME_DIALOGUES.ranu_intro;
        }
        if (GAME_DIALOGUES.ranu_resolved) {
          return GAME_DIALOGUES.ranu_resolved;
        }
      }

      if (npc.id === 'bimo') {
        if (ranuBimoPairActive && GAME_DIALOGUES.chat_ranu_bimo_bimo) {
          return GAME_DIALOGUES.chat_ranu_bimo_bimo;
        }
        if (!bimoResolved && GAME_DIALOGUES.bimo_intro) {
          return GAME_DIALOGUES.bimo_intro;
        }
        if (GAME_DIALOGUES.bimo_resolved) {
          return GAME_DIALOGUES.bimo_resolved;
        }
      }

      // Chatting Pair 3: Pak Teguh & Ibu Sari
      if (npc.id === 'teguh_woodcutter') {
        if (teguhSariPairActive && GAME_DIALOGUES.chat_teguh_sari_teguh) {
          return GAME_DIALOGUES.chat_teguh_sari_teguh;
        }
        if (!teguhBadgeUnlocked && GAME_DIALOGUES.teguh_intro) {
          return GAME_DIALOGUES.teguh_intro;
        }
        if (GAME_DIALOGUES.teguh_resolved) {
          return GAME_DIALOGUES.teguh_resolved;
        }
      }

      if (npc.id === 'sari_fruit') {
        if (teguhSariPairActive && GAME_DIALOGUES.chat_teguh_sari_sari) {
          return GAME_DIALOGUES.chat_teguh_sari_sari;
        }
        if (!sariBadgeUnlocked && GAME_DIALOGUES.sari_intro) {
          return GAME_DIALOGUES.sari_intro;
        }
        if (GAME_DIALOGUES.sari_resolved) {
          return GAME_DIALOGUES.sari_resolved;
        }
      }

      // Chatting Pair 4: Kakek Damai & Bung Jala
      if (npc.id === 'kakek_damai') {
        if (damaiJalaPairActive && GAME_DIALOGUES.chat_damai_jala_damai) {
          return GAME_DIALOGUES.chat_damai_jala_damai;
        }
        if (!damaiBadgeUnlocked && GAME_DIALOGUES.damai_intro) {
          return GAME_DIALOGUES.damai_intro;
        }
        if (GAME_DIALOGUES.damai_resolved) {
          return GAME_DIALOGUES.damai_resolved;
        }
      }

      if (npc.id === 'jala_fisher') {
        if (damaiJalaPairActive && GAME_DIALOGUES.chat_damai_jala_jala) {
          return GAME_DIALOGUES.chat_damai_jala_jala;
        }
        if (!jalaBadgeUnlocked && GAME_DIALOGUES.jala_intro) {
          return GAME_DIALOGUES.jala_intro;
        }
        if (GAME_DIALOGUES.jala_resolved) {
          return GAME_DIALOGUES.jala_resolved;
        }
      }

      // Roaming NPCs: require badge dialogue before roaming banter
      if (npc.id === 'prof_kotek') {
        if (!unlocked.includes('badge_laughter_medicine') && GAME_DIALOGUES.kotek_intro) {
          return GAME_DIALOGUES.kotek_intro;
        }
        if (GAME_DIALOGUES.prof_kotek_roaming) {
          return GAME_DIALOGUES.prof_kotek_roaming;
        }
      }

      if (npc.id === 'didi' || npc.id === 'didi_scout') {
        if (!unlocked.includes('badge_friendly_greeter') && GAME_DIALOGUES.didi_intro) {
          return GAME_DIALOGUES.didi_intro;
        }
        if (GAME_DIALOGUES.didi_roaming) {
          return GAME_DIALOGUES.didi_roaming;
        }
      }

      if (npc.id === 'pak_joko') {
        if (!unlocked.includes('badge_growth_mindset') && GAME_DIALOGUES.joko_intro) {
          return GAME_DIALOGUES.joko_intro;
        }
        if (GAME_DIALOGUES.pak_joko_resolved) {
          return GAME_DIALOGUES.pak_joko_resolved;
        }
      }

      if (npc.id === 'kiki' && GAME_DIALOGUES.kiki_roaming) {
        return GAME_DIALOGUES.kiki_roaming;
      }

      if (npc.id === 'penjaga_kabut' && GAME_DIALOGUES.chat_nenek_wilis) {
        return GAME_DIALOGUES.chat_nenek_wilis;
      }
    }

    // Sequential Mission Flow Enforcer: Guide player through missions strictly 1 by 1
    if (!isFreeRoamActive) {
      // Step 1: Misi 1 (Target: Kiki di Plaza Alun-Alun)
      if (!zoneStatus.plaza) {
        if (npc.id === 'kakek_ranu') {
          return GAME_DIALOGUES.ranu_locked_need_kiki;
        }
        if (npc.id === 'bimo') {
          return GAME_DIALOGUES.bimo_locked_need_bridge;
        }
        if (npc.id === 'penjaga_kabut') {
          return GAME_DIALOGUES.tower_locked_need_gear;
        }
      }
      // Step 2: Misi 2 (Target: Kakek Ranu di Jembatan Kayu)
      else if (!zoneStatus.bridge) {
        if (npc.id === 'kiki') {
          return GAME_DIALOGUES.kiki_remind_bridge || GAME_DIALOGUES.kiki_resolved;
        }
        if (npc.id === 'bimo') {
          return GAME_DIALOGUES.bimo_locked_need_bridge;
        }
        if (npc.id === 'penjaga_kabut') {
          return GAME_DIALOGUES.tower_locked_need_gear;
        }
      }
      // Step 3: Misi 3 (Target: Bimo di Hutan Sunyi)
      else if (!zoneStatus.forest) {
        if (npc.id === 'kiki') {
          return GAME_DIALOGUES.kiki_remind_bridge || GAME_DIALOGUES.kiki_resolved;
        }
        if (npc.id === 'kakek_ranu') {
          return GAME_DIALOGUES.ranu_remind_bimo || GAME_DIALOGUES.ranu_resolved;
        }
        if (npc.id === 'penjaga_kabut') {
          return GAME_DIALOGUES.tower_locked_need_gear;
        }
      }
      // Step 4: Misi 4 (Target: Menara Jam Harmoni)
      else if (!zoneStatus.tower) {
        if (npc.id === 'kiki') {
          return GAME_DIALOGUES.kiki_resolved;
        }
        if (npc.id === 'kakek_ranu') {
          return GAME_DIALOGUES.ranu_remind_bimo || GAME_DIALOGUES.ranu_resolved;
        }
        if (npc.id === 'bimo') {
          return GAME_DIALOGUES.bimo_remind_tower || GAME_DIALOGUES.bimo_resolved;
        }
      }
    }

    // 1. If NPC is resolved, prioritize resolved dialogue key from mapping or explicit currentDialogueId
    if (npc.isResolved) {
      const resolvedKey = NPC_RESOLVED_DIALOGUES[npc.id] || npc.currentDialogueId || `${npc.id}_resolved`;
      if (GAME_DIALOGUES[resolvedKey]) return GAME_DIALOGUES[resolvedKey];
    }

    // 2. Try explicit currentDialogueId
    if (npc.currentDialogueId && GAME_DIALOGUES[npc.currentDialogueId]) {
      return GAME_DIALOGUES[npc.currentDialogueId];
    }

    // 3. Try mapped intro key or standard intro fallback
    const introKey = NPC_INTRO_DIALOGUES[npc.id] || `${npc.id}_intro`;
    if (GAME_DIALOGUES[introKey]) {
      return GAME_DIALOGUES[introKey];
    }

    // 4. Try mapped resolved key as fallback
    const fallbackResolvedKey = NPC_RESOLVED_DIALOGUES[npc.id];
    if (fallbackResolvedKey && GAME_DIALOGUES[fallbackResolvedKey]) {
      return GAME_DIALOGUES[fallbackResolvedKey];
    }

    return null;
  }, [isFreeRoamActive, stats.unlockedBadges, npcs, zoneStatus]);

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

    // Check Forest Cabin Door (Pondok Hutan Pak Teguh: c=11, r=4)
    const cabinDoorX = 11 * TILE_SIZE + 16;
    const cabinDoorY = 4 * TILE_SIZE + 16;
    if (Math.hypot(cabinDoorX - px, cabinDoorY - py) < 60) {
      sound.playSecretFound();
      rendererRef.current?.addSparkle(cabinDoorX, cabinDoorY, '#f59e0b', 8);
      setCurrentDialogue(GAME_DIALOGUES.forest_cabin_examine);
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
      if (!isFreeRoamActive && (!zoneStatus.plaza || !zoneStatus.bridge || !zoneStatus.forest)) {
        setCurrentDialogue(GAME_DIALOGUES.tower_locked_need_gear);
      } else {
        setCurrentDialogue(
          zoneStatus.tower
            ? GAME_DIALOGUES.tower_examine_restored
            : GAME_DIALOGUES.tower_examine
        );
      }
      return;
    }

    // Free Roam Interactive Living Objects (Windmill, Pasture Livestock, River)
    if (isFreeRoamActive || (zoneStatus.plaza && zoneStatus.bridge && zoneStatus.forest && zoneStatus.tower)) {
      // Windmill (c=15..16, r=24..25)
      const wmX = 16 * TILE_SIZE;
      const wmY = 25 * TILE_SIZE;
      if (Math.hypot(wmX - px, wmY - py) < 70) {
        sound.playSecretFound();
        rendererRef.current?.triggerScreenShake(3, 10);
        rendererRef.current?.addSparkle(wmX, wmY - 16, '#fbbf24', 8);
        setCurrentDialogue(GAME_DIALOGUES.free_roam_windmill);
        return;
      }

      // Pasture Cow (c=16.5, r=2.8)
      const cowX = 16.5 * TILE_SIZE + 16;
      const cowY = 2.8 * TILE_SIZE + 16;
      if (Math.hypot(cowX - px, cowY - py) < 65) {
        sound.playSecretFound();
        rendererRef.current?.addSparkle(cowX, cowY - 14, '#38bdf8', 8);
        setCurrentDialogue(GAME_DIALOGUES.free_roam_cow);
        return;
      }

      // Pasture Sheep (c=18.5, r=4.8)
      const sheepX = 18.5 * TILE_SIZE + 8;
      const sheepY = 4.8 * TILE_SIZE + 12;
      if (Math.hypot(sheepX - px, sheepY - py) < 60) {
        sound.playSecretFound();
        rendererRef.current?.addSparkle(sheepX, sheepY - 12, '#f8fafc', 8);
        setCurrentDialogue(GAME_DIALOGUES.free_roam_sheep);
        return;
      }

      // Woodland Spotted Deer (c=14.6, r=3.4)
      const deerX = 14.6 * TILE_SIZE + 12;
      const deerY = 3.4 * TILE_SIZE + 14;
      if (Math.hypot(deerX - px, deerY - py) < 60) {
        sound.playSecretFound();
        rendererRef.current?.addSparkle(deerX, deerY - 12, '#fbbf24', 8);
        setCurrentDialogue(GAME_DIALOGUES.free_roam_deer);
        return;
      }

      // Meadow Bunnies (c=16.3, r=4.5)
      const rabbitX = 16.3 * TILE_SIZE + 8;
      const rabbitY = 4.5 * TILE_SIZE + 6;
      if (Math.hypot(rabbitX - px, rabbitY - py) < 55) {
        sound.playSecretFound();
        rendererRef.current?.addSparkle(rabbitX, rabbitY - 8, '#fbcfe8', 8);
        setCurrentDialogue(GAME_DIALOGUES.free_roam_rabbit);
        return;
      }

      // Baby Lamb (c=19.4, r=5.1)
      const lambX = 19.4 * TILE_SIZE + 6;
      const lambY = 5.1 * TILE_SIZE + 6;
      if (Math.hypot(lambX - px, lambY - py) < 55) {
        sound.playSecretFound();
        rendererRef.current?.addSparkle(lambX, lambY - 8, '#ffffff', 8);
        setCurrentDialogue(GAME_DIALOGUES.free_roam_lamb);
        return;
      }

      // Woodland Squirrel (c=14.8, r=1.8)
      const sqX = 14.8 * TILE_SIZE + 6;
      const sqY = 1.8 * TILE_SIZE + 6;
      if (Math.hypot(sqX - px, sqY - py) < 55) {
        sound.playSecretFound();
        rendererRef.current?.addSparkle(sqX, sqY - 8, '#ea580c', 8);
        setCurrentDialogue(GAME_DIALOGUES.free_roam_squirrel);
        return;
      }

      // River Fish (c=23, r=20)
      const fishX = 23 * TILE_SIZE;
      const fishY = 20 * TILE_SIZE;
      if (Math.hypot(fishX - px, fishY - py) < 70) {
        sound.playSecretFound();
        rendererRef.current?.addSparkle(fishX, fishY, '#38bdf8', 8);
        setCurrentDialogue(GAME_DIALOGUES.free_roam_river);
        return;
      }
    }

    // River Waterfall Cascade (c=22.5, r=12.5, x: 736, y: 400)
    const waterfallX = 736;
    const waterfallY = 400;
    if (Math.hypot(waterfallX - px, waterfallY - py) < 85) {
      sound.playWaterfallSplash();
      rendererRef.current?.triggerScreenShake(3, 10);
      rendererRef.current?.addSparkle(waterfallX, waterfallY + 10, '#38bdf8', 10);
      setCurrentDialogue(GAME_DIALOGUES.free_roam_waterfall);
      return;
    }

    // Check nearest NPC
    let nearestNPC: NPC | null = null;
    let minDist = 75;

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
      const node = getNPCDialogueNode(nearestNPC);
      if (node) {
        setCurrentDialogue(node);
      }
    }
  }, [currentDialogue, npcs, zoneStatus, isFreeRoamActive, getNPCDialogueNode]);

  // Click / Tap on Floor or NPC/Props to walk there automatically
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (currentDialogue || showSettings || showStartMenu || showPauseMenu) return; // In active dialogue, paused settings or start menu, don't walk
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
          targetPosRef.current = {
            x: treeX,
            y: treeY + 28,
            targetType: 'tree',
            minDistSoFar: Math.hypot(treeX - px, treeY + 28 - py),
            stuckFrames: 0,
          };
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
          targetPosRef.current = {
            x: fountainX,
            y: fountainY + 36,
            targetType: 'fountain',
            minDistSoFar: Math.hypot(fountainX - px, fountainY + 36 - py),
            stuckFrames: 0,
          };
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
          const destX = 11 * TILE_SIZE + 16;
          const destY = 9 * TILE_SIZE + 16;
          targetPosRef.current = {
            x: destX,
            y: destY,
            targetType: 'signpost',
            minDistSoFar: Math.hypot(destX - px, destY - py),
            stuckFrames: 0,
          };
          rendererRef.current?.setDestination(destX, destY, 'examine');
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
          const destX = 7 * TILE_SIZE + 16;
          const destY = 17 * TILE_SIZE + 16;
          targetPosRef.current = {
            x: destX,
            y: destY,
            targetType: 'farm_signpost',
            minDistSoFar: Math.hypot(destX - px, destY - py),
            stuckFrames: 0,
          };
          rendererRef.current?.setDestination(destX, destY, 'examine');
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
          if (!isFreeRoamActive && (!zoneStatus.plaza || !zoneStatus.bridge || !zoneStatus.forest)) {
            setCurrentDialogue(GAME_DIALOGUES.tower_locked_need_gear);
          } else {
            setCurrentDialogue(
              zoneStatus.tower
                ? GAME_DIALOGUES.tower_examine_restored
                : GAME_DIALOGUES.tower_examine
            );
          }
          targetPosRef.current = null;
          rendererRef.current?.clearDestination();
        } else {
          // Walk up to the main portal entrance of the clock tower (c=30, r=7)
          const walkX = 30 * TILE_SIZE + 16;
          const walkY = 7 * TILE_SIZE + 16;
          targetPosRef.current = {
            x: walkX,
            y: walkY,
            targetType: 'tower',
            minDistSoFar: Math.hypot(walkX - px, walkY - py),
            stuckFrames: 0,
          };
          rendererRef.current?.setDestination(walkX, walkY, 'examine');
          rendererRef.current?.addSparkle(towerDoorX, towerDoorY, '#f59e0b', 8);
        }
        return;
      }

      // 3d. Check if clicking on the Forest Cabin (c: 9..13, r: 2..4)
      const cabinDoorX = 11 * TILE_SIZE + 16;
      const cabinDoorY = 4 * TILE_SIZE + 16;
      if (Math.hypot(cabinDoorX - worldX, cabinDoorY - worldY) < 36) {
        if (Math.hypot(cabinDoorX - px, cabinDoorY - py) < 65) {
          sound.playSecretFound();
          rendererRef.current?.addSparkle(cabinDoorX, cabinDoorY, '#f59e0b', 8);
          setCurrentDialogue(GAME_DIALOGUES.forest_cabin_examine);
          targetPosRef.current = null;
          rendererRef.current?.clearDestination();
        } else {
          // Walk up to porch in front of the door (c=11, r=5)
          const walkX = 11 * TILE_SIZE + 16;
          const walkY = 5 * TILE_SIZE + 16;
          targetPosRef.current = {
            x: walkX,
            y: walkY,
            targetType: 'cabin',
            minDistSoFar: Math.hypot(walkX - px, walkY - py),
            stuckFrames: 0,
          };
          rendererRef.current?.setDestination(walkX, walkY, 'examine');
          rendererRef.current?.addSparkle(cabinDoorX, cabinDoorY, '#f59e0b', 8);
        }
        return;
      }

      // 3d-2. Check if clicking on the River Waterfall (c: 21..24, r: 11..13, center x: 736, y: 400)
      const wfX = 736;
      const wfY = 400;
      if (
        (worldX >= 695 && worldX <= 775 && worldY >= 365 && worldY <= 435) ||
        Math.hypot(wfX - worldX, wfY - worldY) < 45
      ) {
        if (Math.hypot(wfX - px, wfY - py) < 85) {
          sound.playWaterfallSplash();
          rendererRef.current?.triggerScreenShake(3, 10);
          rendererRef.current?.addSparkle(wfX, wfY + 10, '#38bdf8', 10);
          setCurrentDialogue(GAME_DIALOGUES.free_roam_waterfall);
          targetPosRef.current = null;
          rendererRef.current?.clearDestination();
        } else {
          // Walk to safe viewing spot near waterfall on west bank (c=21, r=12)
          const walkX = 21 * TILE_SIZE + 16;
          const walkY = 12 * TILE_SIZE + 16;
          targetPosRef.current = {
            x: walkX,
            y: walkY,
            targetType: 'waterfall',
            minDistSoFar: Math.hypot(walkX - px, walkY - py),
            stuckFrames: 0,
          };
          rendererRef.current?.setDestination(walkX, walkY, 'examine');
          rendererRef.current?.addSparkle(wfX, wfY + 10, '#38bdf8', 8);
        }
        return;
      }

      // 3e. Check if clicking on Free Roam objects (Windmill, Cow, Sheep, River Fish)
      if (isFreeRoamActive || (zoneStatus.plaza && zoneStatus.bridge && zoneStatus.forest && zoneStatus.tower)) {
        // Windmill (c: 15..16, r: 23..25)
        const wmX = 16 * TILE_SIZE;
        const wmY = 24 * TILE_SIZE + 16;
        if (Math.hypot(wmX - worldX, wmY - worldY) < 45) {
          if (Math.hypot(wmX - px, wmY - py) < 70) {
            sound.playSecretFound();
            rendererRef.current?.triggerScreenShake(3, 10);
            setCurrentDialogue(GAME_DIALOGUES.free_roam_windmill);
            targetPosRef.current = null;
            rendererRef.current?.clearDestination();
          } else {
            const walkX = 16 * TILE_SIZE;
            const walkY = 26 * TILE_SIZE + 16;
            targetPosRef.current = {
              x: walkX,
              y: walkY,
              targetType: 'windmill',
              minDistSoFar: Math.hypot(walkX - px, walkY - py),
              stuckFrames: 0,
            };
            rendererRef.current?.setDestination(walkX, walkY, 'examine');
            rendererRef.current?.addSparkle(wmX, wmY, '#fbbf24', 8);
          }
          return;
        }

        // Holstein Cow (c=16.5, r=2.8)
        const cowX = 16.5 * TILE_SIZE + 16;
        const cowY = 2.8 * TILE_SIZE + 16;
        if (Math.hypot(cowX - worldX, cowY - worldY) < 32) {
          if (Math.hypot(cowX - px, cowY - py) < 65) {
            sound.playSecretFound();
            setCurrentDialogue(GAME_DIALOGUES.free_roam_cow);
            targetPosRef.current = null;
            rendererRef.current?.clearDestination();
          } else {
            const walkX = cowX - 24;
            const walkY = cowY;
            targetPosRef.current = {
              x: walkX,
              y: walkY,
              targetType: 'cow',
              minDistSoFar: Math.hypot(walkX - px, walkY - py),
              stuckFrames: 0,
            };
            rendererRef.current?.setDestination(walkX, walkY, 'examine');
            rendererRef.current?.addSparkle(cowX, cowY, '#38bdf8', 6);
          }
          return;
        }

        // Fluffy Sheep (c=18.5, r=4.8)
        const sheepX = 18.5 * TILE_SIZE + 8;
        const sheepY = 4.8 * TILE_SIZE + 12;
        if (Math.hypot(sheepX - worldX, sheepY - worldY) < 28) {
          if (Math.hypot(sheepX - px, sheepY - py) < 60) {
            sound.playSecretFound();
            setCurrentDialogue(GAME_DIALOGUES.free_roam_sheep);
            targetPosRef.current = null;
            rendererRef.current?.clearDestination();
          } else {
            const walkX = sheepX - 20;
            const walkY = sheepY;
            targetPosRef.current = {
              x: walkX,
              y: walkY,
              targetType: 'sheep',
              minDistSoFar: Math.hypot(walkX - px, walkY - py),
              stuckFrames: 0,
            };
            rendererRef.current?.setDestination(walkX, walkY, 'examine');
            rendererRef.current?.addSparkle(sheepX, sheepY, '#f8fafc', 6);
          }
          return;
        }

        // Woodland Spotted Deer (c=14.6, r=3.4)
        const deerX = 14.6 * TILE_SIZE + 12;
        const deerY = 3.4 * TILE_SIZE + 14;
        if (Math.hypot(deerX - worldX, deerY - worldY) < 28) {
          if (Math.hypot(deerX - px, deerY - py) < 60) {
            sound.playSecretFound();
            setCurrentDialogue(GAME_DIALOGUES.free_roam_deer);
            targetPosRef.current = null;
            rendererRef.current?.clearDestination();
          } else {
            const walkX = deerX + 22;
            const walkY = deerY;
            targetPosRef.current = {
              x: walkX,
              y: walkY,
              targetType: 'deer',
              minDistSoFar: Math.hypot(walkX - px, walkY - py),
              stuckFrames: 0,
            };
            rendererRef.current?.setDestination(walkX, walkY, 'examine');
            rendererRef.current?.addSparkle(deerX, deerY, '#fbbf24', 6);
          }
          return;
        }

        // Meadow Bunnies (c=16.3, r=4.5)
        const rabbitX = 16.3 * TILE_SIZE + 8;
        const rabbitY = 4.5 * TILE_SIZE + 6;
        if (Math.hypot(rabbitX - worldX, rabbitY - worldY) < 26) {
          if (Math.hypot(rabbitX - px, rabbitY - py) < 55) {
            sound.playSecretFound();
            setCurrentDialogue(GAME_DIALOGUES.free_roam_rabbit);
            targetPosRef.current = null;
            rendererRef.current?.clearDestination();
          } else {
            const walkX = rabbitX - 18;
            const walkY = rabbitY;
            targetPosRef.current = {
              x: walkX,
              y: walkY,
              targetType: 'rabbit',
              minDistSoFar: Math.hypot(walkX - px, walkY - py),
              stuckFrames: 0,
            };
            rendererRef.current?.setDestination(walkX, walkY, 'examine');
            rendererRef.current?.addSparkle(rabbitX, rabbitY, '#fbcfe8', 6);
          }
          return;
        }

        // Baby Lamb (c=19.4, r=5.1)
        const lambX = 19.4 * TILE_SIZE + 6;
        const lambY = 5.1 * TILE_SIZE + 6;
        if (Math.hypot(lambX - worldX, lambY - worldY) < 24) {
          if (Math.hypot(lambX - px, lambY - py) < 55) {
            sound.playSecretFound();
            setCurrentDialogue(GAME_DIALOGUES.free_roam_lamb);
            targetPosRef.current = null;
            rendererRef.current?.clearDestination();
          } else {
            const walkX = lambX - 18;
            const walkY = lambY;
            targetPosRef.current = {
              x: walkX,
              y: walkY,
              targetType: 'lamb',
              minDistSoFar: Math.hypot(walkX - px, walkY - py),
              stuckFrames: 0,
            };
            rendererRef.current?.setDestination(walkX, walkY, 'examine');
            rendererRef.current?.addSparkle(lambX, lambY, '#ffffff', 6);
          }
          return;
        }

        // Woodland Squirrel (c=14.8, r=1.8)
        const sqX = 14.8 * TILE_SIZE + 6;
        const sqY = 1.8 * TILE_SIZE + 6;
        if (Math.hypot(sqX - worldX, sqY - worldY) < 24) {
          if (Math.hypot(sqX - px, sqY - py) < 55) {
            sound.playSecretFound();
            setCurrentDialogue(GAME_DIALOGUES.free_roam_squirrel);
            targetPosRef.current = null;
            rendererRef.current?.clearDestination();
          } else {
            const walkX = sqX + 18;
            const walkY = sqY + 12;
            targetPosRef.current = {
              x: walkX,
              y: walkY,
              targetType: 'squirrel',
              minDistSoFar: Math.hypot(walkX - px, walkY - py),
              stuckFrames: 0,
            };
            rendererRef.current?.setDestination(walkX, walkY, 'examine');
            rendererRef.current?.addSparkle(sqX, sqY, '#ea580c', 6);
          }
          return;
        }

        // River Fish (c=23, r=20)
        const fishX = 23 * TILE_SIZE;
        const fishY = 20 * TILE_SIZE;
        if (Math.hypot(fishX - worldX, fishY - worldY) < 36) {
          const dockX = 22 * TILE_SIZE + 16;
          const dockY = 20 * TILE_SIZE + 16;
          if (Math.hypot(dockX - px, dockY - py) < 70) {
            sound.playSecretFound();
            setCurrentDialogue(GAME_DIALOGUES.free_roam_river);
            targetPosRef.current = null;
            rendererRef.current?.clearDestination();
          } else {
            targetPosRef.current = {
              x: dockX,
              y: dockY,
              targetType: 'river',
              minDistSoFar: Math.hypot(dockX - px, dockY - py),
              stuckFrames: 0,
            };
            rendererRef.current?.setDestination(dockX, dockY, 'examine');
            rendererRef.current?.addSparkle(fishX, fishY, '#38bdf8', 6);
          }
          return;
        }
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

        if (distToPlayer < 75) {
          // Close enough to talk immediately without moving!
          const p = playerRef.current;
          if (Math.abs(nx - px) > Math.abs(ny - py)) {
            p.facing = nx > px ? 'right' : 'left';
          } else {
            p.facing = ny > py ? 'down' : 'up';
          }
          clickedNPC.facing = px > nx ? 'right' : 'left';

          sound.playVoiceBlip();
          const node = getNPCDialogueNode(clickedNPC);
          if (node) setCurrentDialogue(node);
          targetPosRef.current = null;
          rendererRef.current?.clearDestination();
        } else {
          // Walk towards NPC using safe non-colliding coordinates and dynamic decorative bypass waypoints
          const safeSpot = getSafeNPCTalkPosition(clickedNPC, px, py);
          const startCol = Math.floor(px / TILE_SIZE);
          const startRow = Math.floor(py / TILE_SIZE);
          const waypoints = findTilePath(startCol, startRow, clickedNPC.x, clickedNPC.y, isTilePassable, {
            isDecorative: isTileDecorativeAt,
            allowDecorativeBypass: true,
          });

          if (waypoints && waypoints.length > 0) {
            waypoints[waypoints.length - 1] = {
              x: safeSpot.x,
              y: safeSpot.y,
              col: Math.floor(safeSpot.x / TILE_SIZE),
              row: Math.floor(safeSpot.y / TILE_SIZE),
            };
          }

          const finalTarget = waypoints && waypoints.length > 0 ? waypoints[waypoints.length - 1] : safeSpot;

          targetPosRef.current = {
            x: finalTarget.x,
            y: finalTarget.y,
            targetNPC: clickedNPC,
            targetType: 'interact',
            minDistSoFar: Math.hypot(finalTarget.x - px, finalTarget.y - py),
            stuckFrames: 0,
            waypoints: waypoints && waypoints.length > 0 ? waypoints : undefined,
            waypointIndex: 0,
          };
          rendererRef.current?.setDestination(finalTarget.x, finalTarget.y, 'interact');
          rendererRef.current?.addSparkle(finalTarget.x, finalTarget.y, '#f59e0b', 6);
        }
        return;
      }

      // 5. Floor Click -> Check if the clicked destination is accessible
      const targetCol = Math.floor(worldX / TILE_SIZE);
      const targetRow = Math.floor(worldY / TILE_SIZE);
      const isOutOfBounds = targetRow < 0 || targetRow >= MAP_ROWS || targetCol < 0 || targetCol >= MAP_COLS;
      const clickedTile = isOutOfBounds ? TILE.CLIFF : mapLayout[targetRow]?.[targetCol] ?? TILE.CLIFF;
      const isSolid = isTileSolid(clickedTile);

      const clampedX = Math.max(16, Math.min(MAP_COLS * TILE_SIZE - 16, worldX));
      const clampedY = Math.max(16, Math.min(MAP_ROWS * TILE_SIZE - 16, worldY));
      const isFootCollision = checkCollision(clampedX - 16, clampedY - 16);

      if (isOutOfBounds || isSolid || isFootCollision) {
        // Inaccessible / blocked area clicked!
        // Immediately stop character movement, clear destination arrow, and cancel pathing
        targetPosRef.current = null;
        rendererRef.current?.clearDestination();
        p.isMoving = false;
        keysPressed.current = {};
        if (joystickVectorRef.current) joystickVectorRef.current = null;

        // Gentle red sparkle ripple indicating blocked destination
        rendererRef.current?.addSparkle(clampedX, clampedY, '#f87171', 6);
        sound.playBlocked();
        return;
      }

      // Valid walkable destination: initiate smooth walking with cyan navigation arrow
      targetPosRef.current = {
        x: clampedX,
        y: clampedY,
        minDistSoFar: Math.hypot(clampedX - px, clampedY - py),
        stuckFrames: 0,
      };
      rendererRef.current?.setDestination(clampedX, clampedY, 'walk');
      rendererRef.current?.addSparkle(clampedX, clampedY, '#38bdf8', 5);
    },
    [
      currentDialogue,
      npcs,
      zoneStatus,
      getSafeNPCTalkPosition,
      mapLayout,
      checkCollision,
      sound,
      getNPCDialogueNode,
      isTilePassable,
      isTileDecorativeAt,
    ]
  );

  // Mouse move handler for interactive object hover hints and cursor styling
  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (currentDialogue || showSettings || showStartMenu) {
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

      // 4b-2. Check hover on River Waterfall (c: 21..24, r: 11..13, center x: 736, y: 400)
      const wfHoverX = 736;
      const wfHoverY = 400;
      if (
        (worldX >= 695 && worldX <= 775 && worldY >= 365 && worldY <= 435) ||
        Math.hypot(wfHoverX - worldX, wfHoverY - worldY) < 45
      ) {
        rendererRef.current?.setHover({
          type: 'river',
          name: 'Air Terjun Sungai Harmoni',
          x: wfHoverX,
          y: wfHoverY,
        });
        canvas.style.cursor = 'pointer';
        return;
      }

      // 4c. Check hover on Free Roam objects (Windmill, Cows, Sheep, River Fish)
      if (isFreeRoamActive || (zoneStatus.plaza && zoneStatus.bridge && zoneStatus.forest && zoneStatus.tower)) {
        const freeRoamHover = freeRoamWorld.getInteractiveHover(worldX, worldY);
        if (freeRoamHover) {
          rendererRef.current?.setHover({
            type: freeRoamHover.type as any,
            name: freeRoamHover.name,
            x: freeRoamHover.x,
            y: freeRoamHover.y,
          });
          canvas.style.cursor = 'pointer';
          return;
        }
      }

      // Default terrain: clear hover badge, set walking cursor
      rendererRef.current?.setHover(null);
      canvas.style.cursor = 'crosshair';
    },
    [currentDialogue, npcs, isFreeRoamActive, zoneStatus]
  );

  const handleCanvasMouseLeave = useCallback(() => {
    rendererRef.current?.setHover(null);
  }, []);

  // Complete initial prologue (Narrator & Petunjuk Awal) and unveil the mission guidance
  const completeIntroTutorial = useCallback(() => {
    setHasCompletedIntroTutorial((prev) => {
      if (prev) return prev;
      hasCompletedIntroTutorialRef.current = true;
      setIsNewMissionUnlock(true);
      setShowMissionModal(true);
      sound.playSecretFound();
      return true;
    });
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
        if (bId === 'badge_woodcutter_anger') {
          resolveNPC('teguh_woodcutter', { surfaceEmotion: 'tenang', deepEmotion: 'gembira', reason: 'Menguasai jeda regulasi amarah dan meredakan emosi sebelum berbicara.' }, 'teguh_resolved');
        } else if (bId === 'badge_fruit_gratitude') {
          resolveNPC('sari_fruit', { surfaceEmotion: 'gembira', deepEmotion: 'haru', reason: 'Bersyukur atas limpahan panen buah dan melipatgandakan sukacita dengan berbagi.' }, 'sari_resolved');
        } else if (bId === 'badge_fisherman_patience') {
          resolveNPC('jala_fisher', { surfaceEmotion: 'tenang', deepEmotion: 'haru', reason: 'Kesabaran berbuah manis, menikmati ketenangan batin tepi sungai.' }, 'jala_resolved');
        } else if (bId === 'badge_growth_mindset') {
          resolveNPC('pak_joko', { surfaceEmotion: 'gembira', deepEmotion: 'tenang', reason: 'Bangga membagikan rahasia pola pikir berkembang kepada generasi muda.' }, 'pak_joko_resolved');
        } else if (bId === 'badge_counselor_zones') {
          resolveNPC('kak_citra', { surfaceEmotion: 'tenang', deepEmotion: 'gembira', reason: 'Bahagia karena anak-anak memahami 4 zona regulasi emosi.' }, 'citra_resolved');
        } else if (bId === 'badge_circle_of_control') {
          resolveNPC('kakek_damai', { surfaceEmotion: 'tenang', deepEmotion: 'tenang', reason: 'Melihat anak-anak berlatih fokus pada lingkaran kendali diri.' }, 'damai_resolved');
        } else if (bId === 'badge_active_listening') {
          resolveNPC('moka_cat', { surfaceEmotion: 'tenang', deepEmotion: 'gembira', reason: 'Gembira anak-anak mendengarkan dengan telinga dan mata hati.' }, 'moka_resolved');
        } else if (bId === 'badge_laughter_medicine') {
          resolveNPC('prof_kotek', { surfaceEmotion: 'gembira', deepEmotion: 'gembira', reason: 'Tawa ceria dan endorfin positif menyebar ke seluruh penjuru desa.' }, 'kotek_resolved');
        } else if (bId === 'badge_friendly_greeter') {
          resolveNPC('didi_scout', { surfaceEmotion: 'gembira', deepEmotion: 'tenang', reason: 'Senang menyapa setiap pengelana dengan senyuman tulus.' }, 'didi_resolved');
        }

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
          const updatedBadges = [...existing, bId];
          if (updatedBadges.length >= PSE_ACHIEVEMENTS.length && !hasSeenAllBadgesCelebrationRef.current) {
            pendingAllBadgesCelebrationRef.current = true;
          }
          return {
            ...prev,
            unlockedBadges: updatedBadges,
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
        const finishedId = currentDialogue?.id;
        setCurrentDialogue(null);
        if (
          finishedId === 'kiki_wait' ||
          finishedId?.startsWith('intro_start') ||
          choice.resultDialogueId === 'kiki_wait' ||
          currentDialogue?.speaker?.includes('Narator') ||
          currentDialogue?.speaker?.includes('Petunjuk')
        ) {
          completeIntroTutorial();
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentDialogue, completeIntroTutorial]
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
        sound.triggerColorRestorationTransition();
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
        resolveNPC('bimo', { surfaceEmotion: 'gembira', deepEmotion: 'tenang', reason: 'Meluruskan salah paham dengan Kakek Ranu, memaafkan diri sendiri, dan bangga membawa Roda Gigi Harmoni.' }, 'bimo_resolved');
      } else if (zoneKey === 'tower') {
        resolveNPC('penjaga_kabut', { surfaceEmotion: 'tenang', deepEmotion: 'haru', reason: 'Kabut prasangka musnah, menara jam berdenting merdu dan damai.' }, 'tower_resolved');
      }
    }

    // Specific dialogue resolutions
    if (
      node.id === 'kiki_after_breathe' ||
      node.id === 'kiki_after_breathing' ||
      node.id === 'kiki_after_grounding' ||
      node.id === 'kiki_after_stop' ||
      node.id === 'kiki_after_shakeout' ||
      node.id === 'kiki_reward'
    ) {
      resolveNPC('kiki', { surfaceEmotion: 'gembira', deepEmotion: 'tenang', reason: 'Napasnya teratur, surat-surat aman, dan plaza kembali cerah.' }, 'kiki_resolved');
    } else if (node.id === 'ranu_path_empathy_2' || node.id === 'ranu_path_logic_2') {
      resolveNPC('kakek_ranu', { surfaceEmotion: 'tenang', deepEmotion: 'haru', reason: 'Merasa dihargai dan tidak lagi kesepian di tepi jembatan.' }, 'ranu_resolved');
    } else if (node.id === 'bimo_restore_forest') {
      resolveNPC('bimo', { surfaceEmotion: 'gembira', deepEmotion: 'tenang', reason: 'Meluruskan salah paham dengan Kakek Ranu dan bangga membawa Roda Gigi Harmoni.' }, 'bimo_resolved');
    }

    // 2. Breathing / Emotional Regulation mini-game target & initial mode preparation
    if (node.triggerBreathing || node.triggerRegulationMode) {
      const target = node.speaker === 'Ezzel' ? 'Kiki' : node.speaker;
      setBreathingTarget(target);
      setRegulationInitialMode(node.triggerRegulationMode || 'breathing');
      if (node.speaker !== 'Ezzel') {
        setShowBreathingMiniGame(true);
      }
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
      } else if (badgeId === 'badge_laughter_medicine' || node.id === 'kotek_reward' || node.id === 'kotek_fact' || node.id === 'kotek_resolved') {
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
        const updatedBadges = [...existing, badgeId];
        if (updatedBadges.length >= PSE_ACHIEVEMENTS.length && !hasSeenAllBadgesCelebrationRef.current) {
          pendingAllBadgesCelebrationRef.current = true;
        }
        return {
          ...prev,
          unlockedBadges: updatedBadges,
          empathyScore: prev.empathyScore + 20,
        };
      });
    }

    // 4. Climax ending trigger - initialize ending state without cutting off dialogue
    if (
      node.id === 'ending_summary_perfect' ||
      node.id === 'ending_summary_resilient' ||
      node.id === 'nenek_wilis_closing_perfect' ||
      node.id === 'nenek_wilis_closing_resilient'
    ) {
      setEndingType(node.id.includes('perfect') ? 'perfect' : 'resilient');
      rendererRef.current?.triggerScreenShake(4, 12);
      sound.playSecretFound();
    }
  }, [resolveNPC]);

  // Auto-navigate using A* pathfinding to guarantee collision-free travel across the map
  const handleMiniMapNavigate = useCallback(
    (tileX: number, tileY: number, targetNPC?: NPC | null, isGuided: boolean = false) => {
      if (currentDialogue) return;

      const px = playerRef.current.x + 16;
      const py = playerRef.current.y + 16;
      const startCol = Math.floor(px / TILE_SIZE);
      const startRow = Math.floor(py / TILE_SIZE);

      // Find path using A* pathfinder with dynamic decorative bypass
      const waypoints = findTilePath(startCol, startRow, tileX, tileY, isTilePassable, {
        isDecorative: isTileDecorativeAt,
        allowDecorativeBypass: true,
      });

      if (!waypoints || waypoints.length === 0) {
        // If already at or directly adjacent to target tile
        if (Math.hypot(tileX * TILE_SIZE + 16 - px, tileY * TILE_SIZE + 16 - py) < 48) {
          if (targetNPC) {
            const dialogueNode = getNPCDialogueNode(targetNPC);
            if (dialogueNode) {
              processDialogueTriggers(dialogueNode);
              setCurrentDialogue(dialogueNode);
              sound.playVoiceBlip();
            }
          }
          return;
        }
        targetPosRef.current = null;
        rendererRef.current?.clearDestination();
        playerRef.current.isMoving = false;
        sound.playBlocked();
        return;
      }

      // If targeting an NPC, ensure the final waypoint is the safe interaction spot
      if (targetNPC) {
        const safeSpot = getSafeNPCTalkPosition(targetNPC, px, py);
        waypoints[waypoints.length - 1] = {
          x: safeSpot.x,
          y: safeSpot.y,
          col: Math.floor(safeSpot.x / TILE_SIZE),
          row: Math.floor(safeSpot.y / TILE_SIZE),
        };
      }

      const finalTarget = waypoints[waypoints.length - 1];

      targetPosRef.current = {
        x: finalTarget.x,
        y: finalTarget.y,
        targetNPC: targetNPC ?? null,
        targetType: targetNPC ? 'interact' : 'walk',
        minDistSoFar: Math.hypot(finalTarget.x - px, finalTarget.y - py),
        stuckFrames: 0,
        waypoints,
        waypointIndex: 0,
        isGuidedMode: isGuided,
      };

      rendererRef.current?.setDestination(finalTarget.x, finalTarget.y, targetNPC ? 'interact' : 'walk');
      rendererRef.current?.addSparkle(finalTarget.x, finalTarget.y, isGuided ? '#fbbf24' : '#38bdf8', 8);
      sound.playMenuSelect();
    },
    [currentDialogue, isTilePassable, isTileDecorativeAt, getSafeNPCTalkPosition, getNPCDialogueNode, processDialogueTriggers]
  );

  // Kid-friendly guided mode: navigates straight to current mission target with zero obstacle collisions
  const handleGuideToMission = useCallback(
    (stepNumber?: number) => {
      if (currentDialogue) {
        setCurrentDialogue(null);
      }
      let step = stepNumber;
      if (!step) {
        if (!zoneStatus.plaza) step = 1;
        else if (!zoneStatus.bridge) step = 2;
        else if (!zoneStatus.forest) step = 3;
        else if (!zoneStatus.tower) step = 4;
        else step = 5;
      }

      let targetNpcId: string | null = null;
      let targetTile = { x: 11, y: 15 };

      if (step === 1) {
        targetNpcId = 'kiki';
        targetTile = { x: 8, y: 14 };
      } else if (step === 2) {
        targetNpcId = 'kakek_ranu';
        targetTile = { x: 20, y: 15 };
      } else if (step === 3) {
        targetNpcId = 'bimo';
        targetTile = { x: 7, y: 6 };
      } else if (step === 4) {
        targetNpcId = 'penjaga_kabut';
        targetTile = { x: 29, y: 8 };
      }

      const targetNpc = targetNpcId ? npcs.find((n) => n.id === targetNpcId) || null : null;
      if (targetNpc) {
        targetTile = { x: targetNpc.x, y: targetNpc.y };
      }

      sound.playSecretFound();
      handleMiniMapNavigate(targetTile.x, targetTile.y, targetNpc, true);
    },
    [currentDialogue, zoneStatus, npcs, handleMiniMapNavigate]
  );

  // Advance dialogue when pressing Next or Spacebar
  const handleDialogueNext = useCallback(() => {
    if (!currentDialogue) return;

    // If current dialogue has an emotional regulation trigger, launch the interactive studio!
    if (currentDialogue.triggerRegulationMode || currentDialogue.triggerBreathing) {
      const target = currentDialogue.speaker === 'Ezzel' ? 'Kiki' : currentDialogue.speaker;
      setBreathingTarget(target);
      setRegulationInitialMode(currentDialogue.triggerRegulationMode || 'breathing');
      sound.playMenuSelect();
      setShowBreathingMiniGame(true);
      return;
    }

    if (currentDialogue.nextId && GAME_DIALOGUES[currentDialogue.nextId]) {
      const nextNode = GAME_DIALOGUES[currentDialogue.nextId];
      processDialogueTriggers(nextNode);
      setCurrentDialogue(nextNode);
    } else {
      const finishedId = currentDialogue.id;
      const finishedSpeaker = currentDialogue.speaker;
      setCurrentDialogue(null);

      // Check if finished intro sequence (narrator & initial instructions)
      if (
        finishedId === 'kiki_wait' ||
        finishedId?.startsWith('intro_start') ||
        finishedSpeaker?.includes('Narator') ||
        finishedSpeaker?.includes('Petunjuk')
      ) {
        completeIntroTutorial();
      }

      // Trigger Climax Ending Modal ONLY AFTER the player finishes reading the final dialogue!
      if (
        finishedId === 'ending_summary_perfect' ||
        finishedId === 'ending_summary_resilient'
      ) {
        sound.playSuccessFanfare();
        rendererRef.current?.triggerScreenShake(8, 24);
        rendererRef.current?.addSparkle(
          playerRef.current.x + 16,
          playerRef.current.y + 16,
          '#f59e0b',
          30
        );
        setTimeout(() => {
          setShowEnding(true);
        }, 400);
      } else if (pendingAllBadgesCelebrationRef.current) {
        setTimeout(() => {
          triggerAllBadgesCelebration();
        }, 350);
      }
    }
  }, [currentDialogue, processDialogueTriggers, triggerAllBadgesCelebration]);

  // Skip regulation directly to dialogue after-regulation node
  const handleSkipRegulation = useCallback(() => {
    if (!currentDialogue) return;
    if (currentDialogue.nextId && GAME_DIALOGUES[currentDialogue.nextId]) {
      const nextNode = GAME_DIALOGUES[currentDialogue.nextId];
      processDialogueTriggers(nextNode);
      setCurrentDialogue(nextNode);
    }
  }, [currentDialogue, processDialogueTriggers]);

  // Close dialogue handler (Esc or X button)
  const handleDialogueClose = useCallback(() => {
    if (!currentDialogue) return;
    const closedId = currentDialogue.id;
    const closedSpeaker = currentDialogue.speaker;
    setCurrentDialogue(null);

    // If closed during intro sequence, mark intro completed so user is not stuck
    if (
      closedId === 'kiki_wait' ||
      closedId?.startsWith('intro_start') ||
      closedSpeaker?.includes('Narator') ||
      closedSpeaker?.includes('Petunjuk')
    ) {
      completeIntroTutorial();
    }

    // If closed during climax ending, trigger celebration modal smoothly
    if (
      closedId === 'ending_summary_perfect' ||
      closedId === 'ending_summary_resilient'
    ) {
      sound.playSuccessFanfare();
      rendererRef.current?.triggerScreenShake(8, 24);
      rendererRef.current?.addSparkle(
        playerRef.current.x + 16,
        playerRef.current.y + 16,
        '#f59e0b',
        30
      );
      setTimeout(() => {
        setShowEnding(true);
      }, 400);
    } else if (pendingAllBadgesCelebrationRef.current) {
      setTimeout(() => {
        triggerAllBadgesCelebration();
      }, 350);
    }
  }, [currentDialogue, triggerAllBadgesCelebration]);

  // Analog virtual joystick vector for smooth mobile & touch movement
  const joystickVectorRef = useRef<{ x: number; y: number } | null>(null);

  // Sync refs for immediate synchronous access within event handlers and high-frequency loops
  const showSettingsRef = useRef(showSettings);
  const showStartMenuRef = useRef(showStartMenu);

  useEffect(() => {
    showSettingsRef.current = showSettings;
    if (showSettings) {
      keysPressed.current = {};
      joystickVectorRef.current = null;
      targetPosRef.current = null;
      rendererRef.current?.clearDestination();
      playerRef.current.isMoving = false;
    }
  }, [showSettings]);

  useEffect(() => {
    showPauseMenuRef.current = showPauseMenu;
    if (showPauseMenu) {
      keysPressed.current = {};
      joystickVectorRef.current = null;
      targetPosRef.current = null;
      rendererRef.current?.clearDestination();
      playerRef.current.isMoving = false;
    }
  }, [showPauseMenu]);

  useEffect(() => {
    showStartMenuRef.current = showStartMenu;
    if (showStartMenu) {
      keysPressed.current = {};
      joystickVectorRef.current = null;
      targetPosRef.current = null;
      rendererRef.current?.clearDestination();
      playerRef.current.isMoving = false;
    }
  }, [showStartMenu]);

  const handleJoystickMove = useCallback((vec: { x: number; y: number } | null) => {
    // Cannot interact with controls if settings/pause is open (game paused) or in start menu
    if (showSettingsRef.current || showStartMenuRef.current || showPauseMenuRef.current) return;

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
    // Cannot interact with controls if settings/pause is open (game paused) or in start menu
    if (showSettingsRef.current || showStartMenuRef.current || showPauseMenuRef.current) return;

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

      const target = e.target as HTMLElement | null;
      const isTypingInInput =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        Boolean(target?.isContentEditable);

      // 1. Tampilan pemilihan karakter dan saat mengetik nama:
      // Matikan fungsi kontrol permainan agar tidak muncul konflik dengan kontrol permainan
      if (showStartMenu || isTypingInInput) {
        keysPressed.current = {};
        return;
      }

      // 2. Tampilan Pause Menu:
      if (showPauseMenu) {
        keysPressed.current = {};
        if (e.key === 'Escape') {
          sound.playMenuSelect();
          setShowPauseMenu(false);
        }
        return;
      }

      // 3. Tampilan menu pengaturan:
      // Game berada dalam status PAUSE dan tidak bisa berinteraksi dengan tombol kontrol apapun.
      // Game baru bisa dilanjutkan ketika keluar dari menu pengaturan.
      if (showSettings) {
        keysPressed.current = {};
        // Tombol Escape diizinkan untuk menutup menu pengaturan dan melanjutkan game
        if (e.key === 'Escape') {
          setShowSettings(false);
        }
        return;
      }

      // Tombol Escape saat bermain: Buka Pause Menu
      if (e.key === 'Escape') {
        if (!currentDialogue && !showSettings && !showJournal && !showStartMenu && !showEnding && !showBreathingMiniGame) {
          e.preventDefault();
          sound.playMenuSelect();
          setShowPauseMenu(true);
          return;
        }
      }

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

      // Abadikan Momen (Screenshot game dengan overlay dekoratif) - Hotkey [P]
      if (e.key === 'p' || e.key === 'P' || e.code === 'KeyP') {
        if (!currentDialogue) {
          handleCaptureMoment();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTypingInInput =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        Boolean(target?.isContentEditable);

      if (showStartMenu || isTypingInInput || showSettings || showPauseMenu) {
        keysPressed.current = {};
        return;
      }

      keysPressed.current[e.key] = false;
      keysPressed.current[e.code] = false;
    };

    const handleWindowBlur = () => {
      keysPressed.current = {};
      if (joystickVectorRef.current) {
        joystickVectorRef.current = null;
      }
      playerRef.current.isMoving = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleWindowBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [showStartMenu, showSettings, showPauseMenu, currentDialogue, handleInteract, handleToggleCompass, handleOpenRegulation, handleCaptureMoment, showJournal, showEnding, showBreathingMiniGame]);

  // Main 60 FPS Game Loop
  useEffect(() => {
    let animationFrameId: number;

    const gameLoop = () => {
      const p = playerRef.current;

      // 0. GAME DALAM STATUS PAUSE SAAT MENU PENGATURAN ATAU PAUSE MENU TERBUKA:
      // Seluruh simulasi dunia berhenti (pergerakan player, NPC, waypoint, suara langkah).
      // Render frame statis tetap dijalankan agar kanvas tetap tampil stabil di balik dialog jeda.
      if (showSettingsRef.current || showPauseMenuRef.current) {
        p.isMoving = false;
        keysPressed.current = {};
        if (rendererRef.current) {
          const mapTotalW = MAP_COLS * TILE_SIZE;
          const mapTotalH = MAP_ROWS * TILE_SIZE;
          const visibleW = viewportSize.width / GAME_ZOOM;
          const visibleH = viewportSize.height / GAME_ZOOM;
          const camX =
            visibleW >= mapTotalW
              ? -(visibleW - mapTotalW) / 2
              : Math.max(0, Math.min(p.x - visibleW / 2 + 16, mapTotalW - visibleW));
          const camY =
            visibleH >= mapTotalH
              ? -(visibleH - mapTotalH) / 2
              : Math.max(0, Math.min(p.y - visibleH / 2 + 16, mapTotalH - visibleH));
          cameraRef.current = { x: camX, y: camY };

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
        return;
      }

      // 0b. GAME DI MENU AWAL / PEMILIHAN KARAKTER:
      // Player tidak menerima input gerakan keyboard/tombol kontrol permainan
      if (showStartMenuRef.current) {
        p.isMoving = false;
        keysPressed.current = {};
      }

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

        // Adaptive BGM check as player walks across zones
        if (stepCounterRef.current % 28 === 0 && !sound.isRestoringTransition) {
          const col = Math.floor((p.x + 16) / TILE_SIZE);
          const row = Math.floor((p.y + 16) / TILE_SIZE);
          let isRestored = false;
          if (col >= 25 && row <= 12) isRestored = zoneStatus.tower;
          else if (col >= 20 && row >= 12 && row <= 20) isRestored = zoneStatus.bridge;
          else if (col <= 16 && row <= 10) isRestored = zoneStatus.forest;
          else isRestored = zoneStatus.plaza;
          sound.setBgmPhase(isRestored ? 'restored' : 'fog');
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
        // Point-and-click / tap-to-move / guided pathing
        const target = targetPosRef.current;
        const pCenterX = p.x + 16;
        const pCenterY = p.y + 16;

        const hasWaypoints = Boolean(target.waypoints && target.waypoints.length > 0);
        let curTargetX = target.x;
        let curTargetY = target.y;

        if (hasWaypoints && target.waypoints) {
          const wpIdx = target.waypointIndex ?? 0;
          const currentWp = target.waypoints[wpIdx];
          if (currentWp) {
            curTargetX = currentWp.x;
            curTargetY = currentWp.y;
          }
        }

        const distX = curTargetX - pCenterX;
        const distY = curTargetY - pCenterY;
        const dist = Math.hypot(distX, distY);

        // Progress watchdog: track whether player is making forward progress towards destination
        if (target.minDistSoFar === undefined || dist < target.minDistSoFar - 1.0) {
          target.minDistSoFar = dist;
          target.stuckFrames = 0;
        } else {
          target.stuckFrames = (target.stuckFrames ?? 0) + 1;
        }

        const reachedTarget = target;
        const reachedNPC = reachedTarget.targetNPC;
        let npcDist = Infinity;
        if (reachedNPC) {
          const nx = reachedNPC.x * TILE_SIZE + 16;
          const ny = reachedNPC.y * TILE_SIZE + 16;
          npcDist = Math.hypot(nx - pCenterX, ny - pCenterY);
        }

        // If following waypoints and we reached current waypoint, advance to next waypoint!
        if (hasWaypoints && target.waypoints) {
          const wpIdx = target.waypointIndex ?? 0;
          const isLastWp = wpIdx >= target.waypoints.length - 1;

          const advanceDist = target.isGuidedMode ? 16 : 12;
          const shouldAdvanceStuck = target.isGuidedMode && (target.stuckFrames ?? 0) > 12;

          if (!isLastWp && (dist <= advanceDist || (reachedNPC && npcDist <= 46) || shouldAdvanceStuck)) {
            target.waypointIndex = wpIdx + 1;
            target.minDistSoFar = undefined;
            target.stuckFrames = 0;
            if (target.isGuidedMode && wpIdx % 2 === 0) {
              rendererRef.current?.addSparkle(pCenterX, pCenterY, '#fbbf24', 3);
            }
          }
        }

        const isLastWaypoint =
          !hasWaypoints || (target.waypoints && (target.waypointIndex ?? 0) >= target.waypoints.length - 1);
        const isCloseEnough = (isLastWaypoint && dist <= 8) || (reachedNPC && npcDist <= 46);
        const isStuck = (target.stuckFrames ?? 0) > (target.isGuidedMode ? 60 : 30);

        if (isCloseEnough || isStuck) {
          targetPosRef.current = null;
          rendererRef.current?.clearDestination();
          p.isMoving = false;

          // If walking towards an NPC or secret, initiate interaction
          if (isCloseEnough) {
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
              if (target.isGuidedMode) {
                rendererRef.current?.addSparkle(nx, ny, '#fbbf24', 12);
              }
              const node = getNPCDialogueNode(reachedNPC);
              if (node) {
                processDialogueTriggers(node);
                setCurrentDialogue(node);
              }
            } else if (reachedTarget.targetType === 'cabin') {
              sound.playSecretFound();
              rendererRef.current?.addSparkle(11 * TILE_SIZE + 16, 4 * TILE_SIZE + 16, '#f59e0b', 8);
              setCurrentDialogue(GAME_DIALOGUES.forest_cabin_examine);
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
              if (!isFreeRoamActive && (!zoneStatus.plaza || !zoneStatus.bridge || !zoneStatus.forest)) {
                setCurrentDialogue(GAME_DIALOGUES.tower_locked_need_gear);
              } else {
                setCurrentDialogue(
                  zoneStatus.tower
                    ? GAME_DIALOGUES.tower_examine_restored
                    : GAME_DIALOGUES.tower_examine
                );
              }
            } else if (reachedTarget.targetType === 'windmill') {
              sound.playSecretFound();
              rendererRef.current?.triggerScreenShake(3, 10);
              rendererRef.current?.addSparkle(16 * TILE_SIZE, 24 * TILE_SIZE, '#fbbf24', 8);
              setCurrentDialogue(GAME_DIALOGUES.free_roam_windmill);
            } else if (reachedTarget.targetType === 'cow') {
              sound.playSecretFound();
              rendererRef.current?.addSparkle(16.5 * TILE_SIZE + 16, 2.8 * TILE_SIZE + 16, '#38bdf8', 8);
              setCurrentDialogue(GAME_DIALOGUES.free_roam_cow);
            } else if (reachedTarget.targetType === 'sheep') {
              sound.playSecretFound();
              rendererRef.current?.addSparkle(18.5 * TILE_SIZE + 8, 4.8 * TILE_SIZE + 12, '#f8fafc', 8);
              setCurrentDialogue(GAME_DIALOGUES.free_roam_sheep);
            } else if (reachedTarget.targetType === 'deer') {
              sound.playSecretFound();
              rendererRef.current?.addSparkle(14.6 * TILE_SIZE + 12, 3.4 * TILE_SIZE + 14, '#fbbf24', 8);
              setCurrentDialogue(GAME_DIALOGUES.free_roam_deer);
            } else if (reachedTarget.targetType === 'rabbit') {
              sound.playSecretFound();
              rendererRef.current?.addSparkle(16.3 * TILE_SIZE + 8, 4.5 * TILE_SIZE + 6, '#fbcfe8', 8);
              setCurrentDialogue(GAME_DIALOGUES.free_roam_rabbit);
            } else if (reachedTarget.targetType === 'lamb') {
              sound.playSecretFound();
              rendererRef.current?.addSparkle(19.4 * TILE_SIZE + 6, 5.1 * TILE_SIZE + 6, '#ffffff', 8);
              setCurrentDialogue(GAME_DIALOGUES.free_roam_lamb);
            } else if (reachedTarget.targetType === 'squirrel') {
              sound.playSecretFound();
              rendererRef.current?.addSparkle(14.8 * TILE_SIZE + 6, 1.8 * TILE_SIZE + 6, '#ea580c', 8);
              setCurrentDialogue(GAME_DIALOGUES.free_roam_squirrel);
            } else if (reachedTarget.targetType === 'river') {
              sound.playSecretFound();
              rendererRef.current?.addSparkle(23 * TILE_SIZE, 20 * TILE_SIZE, '#38bdf8', 8);
              setCurrentDialogue(GAME_DIALOGUES.free_roam_river);
            }
          }
        } else {
          const effectiveSpeed = target.isGuidedMode ? Math.max(speed, 3.0) : speed;
          const moveStep = Math.min(effectiveSpeed, dist);
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
          // 1. Try moving directly along angle (standard collision check)
          if (!checkCollision(p.x + stepX, p.y + stepY, false)) {
            p.x += stepX;
            p.y += stepY;
            moved = true;
          } else if (Math.abs(stepX) > 0.1 && !checkCollision(p.x + stepX, p.y, false)) {
            // 2. Try sliding horizontally
            p.x += stepX;
            moved = true;
          } else if (Math.abs(stepY) > 0.1 && !checkCollision(p.x, p.y + stepY, false)) {
            // 3. Try sliding vertically
            p.y += stepY;
            moved = true;
          } else {
            // 4. Try corner sliding along alternative axis ONLY if actually reducing dist in that direction
            if (Math.abs(distX) >= Math.abs(distY)) {
              if (Math.abs(distY) > 1.5) {
                const altY = Math.sign(distY) * moveStep;
                if (!checkCollision(p.x, p.y + altY, false)) {
                  p.y += altY;
                  moved = true;
                }
              }
            } else {
              if (Math.abs(distX) > 1.5) {
                const altX = Math.sign(distX) * moveStep;
                if (!checkCollision(p.x + altX, p.y, false)) {
                  p.x += altX;
                  moved = true;
                }
              }
            }
          }

          // 5. Dynamic decorative bypass: If moving towards an NPC or in guided mission mode,
          // and movement is obstructed by decorative obstacles (trees, pines, bushes, flowerbeds, fences, benches),
          // allow dynamically stepping through decorative obstacles while strictly enforcing hard boundaries (cliff, water, building walls)!
          if (!moved && (target.targetNPC || target.isGuidedMode)) {
            if (!checkCollision(p.x + stepX, p.y + stepY, true)) {
              p.x += stepX;
              p.y += stepY;
              moved = true;
            } else if (Math.abs(stepX) > 0.1 && !checkCollision(p.x + stepX, p.y, true)) {
              p.x += stepX;
              moved = true;
            } else if (Math.abs(stepY) > 0.1 && !checkCollision(p.x, p.y + stepY, true)) {
              p.y += stepY;
              moved = true;
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

            // Adaptive BGM check as player walks across zones
            if (stepCounterRef.current % 28 === 0 && !sound.isRestoringTransition) {
              const col = Math.floor((p.x + 16) / TILE_SIZE);
              const row = Math.floor((p.y + 16) / TILE_SIZE);
              let isRestored = false;
              if (col >= 25 && row <= 12) isRestored = zoneStatus.tower;
              else if (col >= 20 && row >= 12 && row <= 20) isRestored = zoneStatus.bridge;
              else if (col <= 16 && row <= 10) isRestored = zoneStatus.forest;
              else isRestored = zoneStatus.plaza;
              sound.setBgmPhase(isRestored ? 'restored' : 'fog');
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
                const node = getNPCDialogueNode(blockedNPC);
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

      // Autonomous behaviors for NPCs (Free Roam movement and routines)
      if (!currentDialogue) {
        const px = p.x + 16;
        const py = p.y + 16;

        // 1. Didi the wandering scout (Grand Circuit: Plaza -> Kebun -> Hutan -> Menara Jam)
        const didi = npcs.find((n) => n.id === 'didi_scout' || n.id === 'didi');
        if (didi) {
          didi.isRoaming = true;
          didi.roamActivity = 'Patroli Rute Harmoni Desa';
          const didiWorldX = didi.x * TILE_SIZE + 16;
          const didiWorldY = didi.y * TILE_SIZE + 16;
          const distToPlayer = Math.hypot(didiWorldX - px, didiWorldY - py);

          if (distToPlayer < 55) {
            // Notice and face player attentively
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
              const moveSpeed = 0.024; // Gentle stroll speed in tile units per frame
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

        // 2. Kiki the postal squirrel (Delivering mail across village zones during Free Roam or once resolved)
        const kiki = npcs.find((n) => n.id === 'kiki');
        if (kiki && (isFreeRoamActive || kiki.isResolved)) {
          kiki.isRoaming = true;
          kiki.roamActivity = 'Mengantar Surat Apresiasi Desa';
          const kikiWorldX = kiki.x * TILE_SIZE + 16;
          const kikiWorldY = kiki.y * TILE_SIZE + 16;
          const distToPlayer = Math.hypot(kikiWorldX - px, kikiWorldY - py);

          if (distToPlayer < 55) {
            if (Math.abs(px - kikiWorldX) > Math.abs(py - kikiWorldY)) {
              kiki.facing = px > kikiWorldX ? 'right' : 'left';
            } else {
              kiki.facing = py > kikiWorldY ? 'down' : 'up';
            }
          } else {
            const patrol = kikiPatrolRef.current;
            const targetWp = patrol.waypoints[patrol.currentWaypointIndex];
            const diffX = targetWp.x - kiki.x;
            const diffY = targetWp.y - kiki.y;
            const distToWp = Math.hypot(diffX, diffY);

            if (distToWp < 0.04) {
              kiki.x = targetWp.x;
              kiki.y = targetWp.y;
              patrol.waitTicks++;
              if (patrol.waitTicks >= targetWp.wait) {
                patrol.waitTicks = 0;
                patrol.currentWaypointIndex =
                  (patrol.currentWaypointIndex + 1) % patrol.waypoints.length;
              }
            } else {
              const moveSpeed = 0.026; // Nimble postal squirrel hop speed
              const angle = Math.atan2(diffY, diffX);
              kiki.x += Math.cos(angle) * Math.min(moveSpeed, distToWp);
              kiki.y += Math.sin(angle) * Math.min(moveSpeed, distToWp);

              if (Math.abs(diffX) > Math.abs(diffY)) {
                kiki.facing = diffX > 0 ? 'right' : 'left';
              } else {
                kiki.facing = diffY > 0 ? 'down' : 'up';
              }
            }
          }
        }

        // 3. Prof. Kotek the emotional science rooster (Patrolling and measuring happiness frequency)
        const kotek = npcs.find((n) => n.id === 'prof_kotek');
        if (kotek && (isFreeRoamActive || kotek.isResolved)) {
          kotek.isRoaming = true;
          kotek.roamActivity = 'Riset Lapangan Resonansi Emosi';
          const kotekWorldX = kotek.x * TILE_SIZE + 16;
          const kotekWorldY = kotek.y * TILE_SIZE + 16;
          const distToPlayer = Math.hypot(kotekWorldX - px, kotekWorldY - py);

          if (distToPlayer < 55) {
            if (Math.abs(px - kotekWorldX) > Math.abs(py - kotekWorldY)) {
              kotek.facing = px > kotekWorldX ? 'right' : 'left';
            } else {
              kotek.facing = py > kotekWorldY ? 'down' : 'up';
            }
          } else {
            const patrol = kotekPatrolRef.current;
            const targetWp = patrol.waypoints[patrol.currentWaypointIndex];
            const diffX = targetWp.x - kotek.x;
            const diffY = targetWp.y - kotek.y;
            const distToWp = Math.hypot(diffX, diffY);

            if (distToWp < 0.04) {
              kotek.x = targetWp.x;
              kotek.y = targetWp.y;
              patrol.waitTicks++;
              if (patrol.waitTicks >= targetWp.wait) {
                patrol.waitTicks = 0;
                patrol.currentWaypointIndex =
                  (patrol.currentWaypointIndex + 1) % patrol.waypoints.length;
              }
            } else {
              const moveSpeed = 0.021; // Stately researcher strut
              const angle = Math.atan2(diffY, diffX);
              kotek.x += Math.cos(angle) * Math.min(moveSpeed, distToWp);
              kotek.y += Math.sin(angle) * Math.min(moveSpeed, distToWp);

              if (Math.abs(diffX) > Math.abs(diffY)) {
                kotek.facing = diffX > 0 ? 'right' : 'left';
              } else {
                kotek.facing = diffY > 0 ? 'down' : 'up';
              }
            }
          }
        }

        // 4. Pak Joko the farmer tending crops (Daily agricultural care routine)
        const joko = npcs.find((n) => n.id === 'pak_joko' || n.id === 'joko');
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

        // 5. Chatting NPC pairs during Free Roam mode:
        // Set dynamic gaze & face-to-face orientation when player is not right next to them
        // Pair chatting is ONLY enabled when the interaction dialogue to earn the badge has been completed for both NPCs!
        if (isFreeRoamActive) {
          const unlocked = statsRef.current?.unlockedBadges || [];
          const chattingPairs = [
            {
              a: 'kak_citra',
              b: 'moka_cat',
              facingA: 'right' as const,
              facingB: 'left' as const,
              isUnlocked: unlocked.includes('badge_counselor_zones') && unlocked.includes('badge_active_listening'),
            },
            {
              a: 'kakek_ranu',
              b: 'bimo',
              facingA: 'right' as const,
              facingB: 'left' as const,
              isUnlocked: Boolean(npcs.find((n) => n.id === 'kakek_ranu')?.isResolved && npcs.find((n) => n.id === 'bimo')?.isResolved),
            },
            {
              a: 'teguh_woodcutter',
              b: 'sari_fruit',
              facingA: 'right' as const,
              facingB: 'left' as const,
              isUnlocked: unlocked.includes('badge_woodcutter_anger') && unlocked.includes('badge_fruit_gratitude'),
            },
            {
              a: 'kakek_damai',
              b: 'jala_fisher',
              facingA: 'right' as const,
              facingB: 'left' as const,
              isUnlocked: unlocked.includes('badge_circle_of_control') && unlocked.includes('badge_fisherman_patience'),
            },
          ];

          for (const pair of chattingPairs) {
            const npcA = npcs.find((n) => n.id === pair.a);
            const npcB = npcs.find((n) => n.id === pair.b);
            if (npcA && npcB) {
              if (pair.isUnlocked) {
                npcA.isChatting = true;
                npcB.isChatting = true;
                npcA.chatPartnerId = pair.b;
                npcB.chatPartnerId = pair.a;

                // If player is not within talking proximity, face their chat partner
                const distA = Math.hypot(npcA.x * TILE_SIZE + 16 - px, npcA.y * TILE_SIZE + 16 - py);
                const distB = Math.hypot(npcB.x * TILE_SIZE + 16 - px, npcB.y * TILE_SIZE + 16 - py);
                if (distA >= 55) npcA.facing = pair.facingA;
                if (distB >= 55) npcB.facing = pair.facingB;
              } else {
                npcA.isChatting = false;
                npcB.isChatting = false;
                npcA.chatPartnerId = undefined;
                npcB.chatPartnerId = undefined;
              }
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

        // Update active sequential quest target for on-screen NPC beacon & off-screen arrow guide
        if (isMissionCompleted || !hasCompletedIntroTutorialRef.current) {
          rendererRef.current.setActiveQuestTarget(null);
        } else if (!zoneStatus.plaza) {
          const kiki = npcs.find((n) => n.id === 'kiki');
          rendererRef.current.setActiveQuestTarget({
            npcId: 'kiki',
            stepNumber: 1,
            label: 'Kiki',
            targetX: (kiki?.x ?? 8) * TILE_SIZE + 16,
            targetY: (kiki?.y ?? 14) * TILE_SIZE + 16,
          });
        } else if (!zoneStatus.bridge) {
          const ranu = npcs.find((n) => n.id === 'kakek_ranu');
          rendererRef.current.setActiveQuestTarget({
            npcId: 'kakek_ranu',
            stepNumber: 2,
            label: 'Kakek Ranu',
            targetX: (ranu?.x ?? 20) * TILE_SIZE + 16,
            targetY: (ranu?.y ?? 15) * TILE_SIZE + 16,
          });
        } else if (!zoneStatus.forest) {
          const bimo = npcs.find((n) => n.id === 'bimo');
          rendererRef.current.setActiveQuestTarget({
            npcId: 'bimo',
            stepNumber: 3,
            label: 'Bimo',
            targetX: (bimo?.x ?? 7) * TILE_SIZE + 16,
            targetY: (bimo?.y ?? 6) * TILE_SIZE + 16,
          });
        } else if (!zoneStatus.tower) {
          const penjaga = npcs.find((n) => n.id === 'penjaga_kabut');
          rendererRef.current.setActiveQuestTarget({
            npcId: 'penjaga_kabut',
            stepNumber: 4,
            label: 'Menara Jam',
            targetX: (penjaga?.x ?? 29) * TILE_SIZE + 16,
            targetY: (penjaga?.y ?? 8) * TILE_SIZE + 16,
          });
        }

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
    setHasCompletedIntroTutorial(false);
    hasCompletedIntroTutorialRef.current = false;
    setShowMissionModal(false);
    lastStepRef.current = 1;
  };

  // Enter free roam mode after game completion
  const handleFreeRoam = () => {
    setShowEnding(false);
    setIsFreeRoamActive(true);
    setHasCompletedIntroTutorial(true);
    hasCompletedIntroTutorialRef.current = true;
    sound.playSecretFound();
    rendererRef.current?.addSparkle(
      playerRef.current.x + 16,
      playerRef.current.y + 16,
      '#34d399',
      30
    );

    const unlocked = stats.unlockedBadges || [];
    const citraMokaUnlocked = unlocked.includes('badge_counselor_zones') && unlocked.includes('badge_active_listening');
    const teguhSariUnlocked = unlocked.includes('badge_woodcutter_anger') && unlocked.includes('badge_fruit_gratitude');
    const damaiJalaUnlocked = unlocked.includes('badge_circle_of_control') && unlocked.includes('badge_fisherman_patience');

    // Arrange talking pairs in their scenic spots if badges earned; otherwise keep individual positions
    setNpcs((prev) => {
      const ranuResolved = prev.find((n) => n.id === 'kakek_ranu')?.isResolved;
      const bimoResolved = prev.find((n) => n.id === 'bimo')?.isResolved;
      const ranuBimoUnlocked = Boolean(ranuResolved && bimoResolved);

      return prev.map((npc) => {
        // Chatting Pair 1: Kak Citra & Moka in Plaza Flower Garden
        if (npc.id === 'kak_citra') {
          if (citraMokaUnlocked) {
            return { ...npc, x: 13, y: 16, facing: 'right' as const, isChatting: true, chatPartnerId: 'moka_cat' };
          }
          return { ...npc, isChatting: false, chatPartnerId: undefined };
        }
        if (npc.id === 'moka_cat') {
          if (citraMokaUnlocked) {
            return { ...npc, x: 14, y: 16, facing: 'left' as const, isChatting: true, chatPartnerId: 'kak_citra' };
          }
          return { ...npc, isChatting: false, chatPartnerId: undefined };
        }
        // Chatting Pair 2: Kakek Ranu & Bimo at Bridge Pavilion
        if (npc.id === 'kakek_ranu') {
          if (ranuBimoUnlocked) {
            return { ...npc, x: 23, y: 15, facing: 'right' as const, isChatting: true, chatPartnerId: 'bimo' };
          }
          return { ...npc, isChatting: false, chatPartnerId: undefined };
        }
        if (npc.id === 'bimo') {
          if (ranuBimoUnlocked) {
            return { ...npc, x: 24, y: 15, facing: 'left' as const, isChatting: true, chatPartnerId: 'kakek_ranu' };
          }
          return { ...npc, isChatting: false, chatPartnerId: undefined };
        }
        // Chatting Pair 3: Pak Teguh & Ibu Sari at Forest Edge
        if (npc.id === 'teguh_woodcutter') {
          if (teguhSariUnlocked) {
            return { ...npc, x: 10, y: 6, facing: 'right' as const, isChatting: true, chatPartnerId: 'sari_fruit' };
          }
          return { ...npc, isChatting: false, chatPartnerId: undefined };
        }
        if (npc.id === 'sari_fruit') {
          if (teguhSariUnlocked) {
            return { ...npc, x: 11, y: 6, facing: 'left' as const, isChatting: true, chatPartnerId: 'teguh_woodcutter' };
          }
          return { ...npc, isChatting: false, chatPartnerId: undefined };
        }
        // Chatting Pair 4: Kakek Damai & Bung Jala at Riverbank
        if (npc.id === 'kakek_damai') {
          if (damaiJalaUnlocked) {
            return { ...npc, x: 25, y: 19, facing: 'right' as const, isChatting: true, chatPartnerId: 'jala_fisher' };
          }
          return { ...npc, isChatting: false, chatPartnerId: undefined };
        }
        if (npc.id === 'jala_fisher') {
          if (damaiJalaUnlocked) {
            return { ...npc, x: 26, y: 19, facing: 'left' as const, isChatting: true, chatPartnerId: 'kakek_damai' };
          }
          return { ...npc, isChatting: false, chatPartnerId: undefined };
        }
        // Roaming NPCs
        if (npc.id === 'kiki') {
          return { ...npc, isRoaming: true, roamActivity: 'Mengantar Surat Apresiasi Desa' };
        }
        if (npc.id === 'prof_kotek') {
          return { ...npc, isRoaming: true, roamActivity: 'Riset Lapangan Resonansi Emosi' };
        }
        if (npc.id === 'didi_scout' || npc.id === 'didi') {
          return { ...npc, isRoaming: true, roamActivity: 'Patroli Rute Harmoni Desa' };
        }
        return npc;
      });
    });
  };

  // Synchronize NPC chatting states and pair positions dynamically during Free Roam as badges are unlocked
  useEffect(() => {
    if (!isFreeRoamActive) return;

    const unlocked = stats.unlockedBadges || [];
    const citraMokaUnlocked = unlocked.includes('badge_counselor_zones') && unlocked.includes('badge_active_listening');
    const teguhSariUnlocked = unlocked.includes('badge_woodcutter_anger') && unlocked.includes('badge_fruit_gratitude');
    const damaiJalaUnlocked = unlocked.includes('badge_circle_of_control') && unlocked.includes('badge_fisherman_patience');

    setNpcs((prev) => {
      const ranuResolved = prev.find((n) => n.id === 'kakek_ranu')?.isResolved;
      const bimoResolved = prev.find((n) => n.id === 'bimo')?.isResolved;
      const ranuBimoUnlocked = Boolean(ranuResolved && bimoResolved);

      let changed = false;
      const updated = prev.map((npc) => {
        // Pair 1: Kak Citra & Moka
        if (npc.id === 'kak_citra') {
          if (citraMokaUnlocked && (!npc.isChatting || npc.x !== 13 || npc.y !== 16)) {
            changed = true;
            return { ...npc, x: 13, y: 16, facing: 'right' as const, isChatting: true, chatPartnerId: 'moka_cat' };
          }
          if (!citraMokaUnlocked && npc.isChatting) {
            changed = true;
            return { ...npc, isChatting: false, chatPartnerId: undefined };
          }
        }
        if (npc.id === 'moka_cat') {
          if (citraMokaUnlocked && (!npc.isChatting || npc.x !== 14 || npc.y !== 16)) {
            changed = true;
            return { ...npc, x: 14, y: 16, facing: 'left' as const, isChatting: true, chatPartnerId: 'kak_citra' };
          }
          if (!citraMokaUnlocked && npc.isChatting) {
            changed = true;
            return { ...npc, isChatting: false, chatPartnerId: undefined };
          }
        }

        // Pair 2: Kakek Ranu & Bimo
        if (npc.id === 'kakek_ranu') {
          if (ranuBimoUnlocked && (!npc.isChatting || npc.x !== 23 || npc.y !== 15)) {
            changed = true;
            return { ...npc, x: 23, y: 15, facing: 'right' as const, isChatting: true, chatPartnerId: 'bimo' };
          }
          if (!ranuBimoUnlocked && npc.isChatting) {
            changed = true;
            return { ...npc, isChatting: false, chatPartnerId: undefined };
          }
        }
        if (npc.id === 'bimo') {
          if (ranuBimoUnlocked && (!npc.isChatting || npc.x !== 24 || npc.y !== 15)) {
            changed = true;
            return { ...npc, x: 24, y: 15, facing: 'left' as const, isChatting: true, chatPartnerId: 'kakek_ranu' };
          }
          if (!ranuBimoUnlocked && npc.isChatting) {
            changed = true;
            return { ...npc, isChatting: false, chatPartnerId: undefined };
          }
        }

        // Pair 3: Pak Teguh & Ibu Sari
        if (npc.id === 'teguh_woodcutter') {
          if (teguhSariUnlocked && (!npc.isChatting || npc.x !== 10 || npc.y !== 6)) {
            changed = true;
            return { ...npc, x: 10, y: 6, facing: 'right' as const, isChatting: true, chatPartnerId: 'sari_fruit' };
          }
          if (!teguhSariUnlocked && npc.isChatting) {
            changed = true;
            return { ...npc, isChatting: false, chatPartnerId: undefined };
          }
        }
        if (npc.id === 'sari_fruit') {
          if (teguhSariUnlocked && (!npc.isChatting || npc.x !== 11 || npc.y !== 6)) {
            changed = true;
            return { ...npc, x: 11, y: 6, facing: 'left' as const, isChatting: true, chatPartnerId: 'teguh_woodcutter' };
          }
          if (!teguhSariUnlocked && npc.isChatting) {
            changed = true;
            return { ...npc, isChatting: false, chatPartnerId: undefined };
          }
        }

        // Pair 4: Kakek Damai & Bung Jala
        if (npc.id === 'kakek_damai') {
          if (damaiJalaUnlocked && (!npc.isChatting || npc.x !== 25 || npc.y !== 19)) {
            changed = true;
            return { ...npc, x: 25, y: 19, facing: 'right' as const, isChatting: true, chatPartnerId: 'jala_fisher' };
          }
          if (!damaiJalaUnlocked && npc.isChatting) {
            changed = true;
            return { ...npc, isChatting: false, chatPartnerId: undefined };
          }
        }
        if (npc.id === 'jala_fisher') {
          if (damaiJalaUnlocked && (!npc.isChatting || npc.x !== 26 || npc.y !== 19)) {
            changed = true;
            return { ...npc, x: 26, y: 19, facing: 'left' as const, isChatting: true, chatPartnerId: 'kakek_damai' };
          }
          if (!damaiJalaUnlocked && npc.isChatting) {
            changed = true;
            return { ...npc, isChatting: false, chatPartnerId: undefined };
          }
        }

        return npc;
      });

      return changed ? updated : prev;
    });
  }, [isFreeRoamActive, stats.unlockedBadges]);

  // Computed active sequential mission data
  const currentMissionData = useMemo<MissionStepData>(() => {
    if (isFreeRoamActive) {
      return {
        step: 5,
        total: 4,
        badge: 'JELAJAH BEBAS',
        title: 'Semua Misi Selesai!',
        speaker: 'Ezsel & Warga Desa',
        portrait: 'player',
        hint: '🌿 Desa sudah ceria kembali! Ayo sapa teman-teman dan rayakan bersama.',
        locationName: 'Lembah Nada Rasa',
        targetCoords: { x: 11, y: 15 },
        isCompleted: true,
      };
    }
    if (!zoneStatus.plaza) {
      return {
        step: 1,
        total: 4,
        badge: 'MISI 1 DARI 4',
        title: 'Misi 1: Redakan Amarah Kiki',
        speaker: 'Kiki Si Tupai',
        portrait: 'squirrel',
        hint: isCompassActive
          ? 'Ayo dekati Kiki di dekat air mancur. Ajak Kiki bicara [Tekan Spasi / Tombol Bicara].'
          : 'Ayo dekati Kiki di dekat air mancur. Buka Kompas Hati [Tekan C] untuk tahu perasaannya!',
        locationName: 'Alun-Alun & Air Mancur',
        targetCoords: { x: 8, y: 14 },
        isCompleted: false,
      };
    }
    if (!zoneStatus.bridge) {
      return {
        step: 2,
        total: 4,
        badge: 'MISI 2 DARI 4',
        title: 'Misi 2: Temui Kakek Ranu',
        speaker: 'Kakek Ranu',
        portrait: 'old_man',
        hint: 'Jalan ke jembatan di sebelah timur. Temui Kakek Ranu dan bantu perbaiki jembatan.',
        locationName: 'Jembatan Kayu (Arah Timur)',
        targetCoords: { x: 20, y: 15 },
        isCompleted: false,
      };
    }
    if (!zoneStatus.forest) {
      return {
        step: 3,
        total: 4,
        badge: 'MISI 3 DARI 4',
        title: 'Misi 3: Tolong Bimo di Hutan',
        speaker: 'Bimo',
        portrait: 'boy_glasses',
        hint: 'Jalan ke Hutan Sunyi di barat laut. Temukan Bimo yang sedang sembunyi.',
        locationName: 'Hutan Sunyi (Barat Laut)',
        targetCoords: { x: 7, y: 6 },
        isCompleted: false,
      };
    }
    if (!zoneStatus.tower) {
      return {
        step: 4,
        total: 4,
        badge: 'MISI 4 DARI 4',
        title: 'Misi 4: Aktifkan Menara Jam',
        speaker: 'Sosok Kabut',
        portrait: 'spirit_elder',
        hint: 'Bawa Roda Gigi Emas ke Menara Jam. Pasang roda gigi agar lonceng berbunyi indah!',
        locationName: 'Menara Jam Harmoni (Timur Laut)',
        targetCoords: { x: 29, y: 8 },
        isCompleted: false,
      };
    }
    return {
      step: 5,
      total: 4,
      badge: 'SELESAI',
      title: 'Lembah Pulih Sepenuhnya!',
      speaker: 'Ezsel & Warga Desa',
      portrait: 'player',
      hint: '🌿 Desa sudah ceria kembali! Ayo sapa semua temanmu dan rayakan bersama.',
      locationName: 'Seluruh Desa',
      targetCoords: { x: 11, y: 15 },
      isCompleted: true,
    };
  }, [zoneStatus, isFreeRoamActive, isCompassActive]);

  // Sync hint string for other systems
  useEffect(() => {
    setQuestHint(currentMissionData.hint);
  }, [currentMissionData.hint]);

  // Auto celebratory popup when completing previous step and unlocking next sequential mission
  useEffect(() => {
    if (showStartMenu || !hasCompletedIntroTutorial) return;
    const currentStep = currentMissionData.step;
    if (currentStep !== lastStepRef.current && currentStep <= 4) {
      lastStepRef.current = currentStep;
      setIsNewMissionUnlock(true);
      setShowMissionModal(true);
      sound.playSecretFound();
    }
  }, [currentMissionData.step, showStartMenu, hasCompletedIntroTutorial]);

  // Adaptive BGM Synchronization:
  // Phase 1: 'fog' - Saat Masa Kabut Kelabu (hampa, misterius, sepi, piano lambat teredam & desiran angin)
  // Phase 2: 'restoring' - Momen Warna Kembali (jembatan emosional, tempo naik bertahap, petikan gitar tunggal & dentingan lonceng)
  // Phase 3: 'restored' - Setelah Lingkungan Pulih (mekar penuh kehangatan, harapan, petikan gitar akustik ringan & tiupan seruling gembira)
  useEffect(() => {
    if (sound.isRestoringTransition) return;

    const allRestored =
      isFreeRoamActive ||
      (zoneStatus.plaza && zoneStatus.bridge && zoneStatus.forest && zoneStatus.tower);

    if (allRestored) {
      sound.setBgmPhase('restored');
      return;
    }

    const col = Math.floor((playerRef.current.x + 16) / TILE_SIZE);
    const row = Math.floor((playerRef.current.y + 16) / TILE_SIZE);
    let isZoneRestored = false;
    if (col >= 25 && row <= 12) isZoneRestored = zoneStatus.tower;
    else if (col >= 20 && row >= 12 && row <= 20) isZoneRestored = zoneStatus.bridge;
    else if (col <= 16 && row <= 10) isZoneRestored = zoneStatus.forest;
    else isZoneRestored = zoneStatus.plaza;

    sound.setBgmPhase(isZoneRestored ? 'restored' : 'fog');
  }, [zoneStatus, isFreeRoamActive]);

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

      {/* Dynamic Quest Tracker Banner - Positioned cleanly below the top header bar */}
      {!showStartMenu && hasCompletedIntroTutorial && !currentDialogue && (
        <div
          id="quest-tracker-banner"
          className="fixed top-13 sm:top-14 md:top-16 left-1/2 -translate-x-1/2 z-20 w-[94%] sm:w-[90%] max-w-sm sm:max-w-xl md:max-w-2xl lg:max-w-3xl pointer-events-none animate-fade-in-slide-down"
        >
          <div
            onClick={() => {
              setIsNewMissionUnlock(false);
              setShowMissionModal(true);
            }}
            title="Klik untuk melihat panduan langkah misi lengkap"
            className="bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-200 border-2 sm:border-3 border-amber-600 hover:border-amber-700 rounded-xl sm:rounded-2xl px-2.5 py-1.5 sm:px-4 sm:py-2 shadow-[0_6px_20px_rgba(245,158,11,0.45),0_0_0_2px_rgba(255,255,255,0.9)] flex items-center gap-2 sm:gap-3 pointer-events-auto cursor-pointer transition-all active:scale-[0.99] group text-slate-950"
          >
            {/* Scarlet/Crimson Badge */}
            <div className="flex items-center gap-1 sm:gap-1.5 bg-rose-600 border border-rose-300 rounded-lg sm:rounded-xl px-2 sm:px-3 py-0.5 sm:py-1 text-white font-pixel text-[8px] sm:text-[10px] shrink-0 font-black shadow-sm group-hover:bg-rose-500 transition-colors">
              <Sparkles className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-yellow-300 shrink-0" />
              <span>{currentMissionData.step <= 4 ? `MISI ${currentMissionData.step}/4` : 'SELESAI'}</span>
            </div>

            {/* Instruction Text with Pixelify Sans - 2 lines max on mobile with comfortable leading */}
            <p
              style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
              className="text-slate-950 text-[10px] sm:text-[13px] md:text-sm font-bold leading-tight sm:leading-snug tracking-tight break-words flex-1 text-left select-text line-clamp-2 sm:line-clamp-none"
            >
              {currentMissionData.hint}
            </p>

            {/* Direct Kid-Friendly "Tuntun Saya" Action Button */}
            {!currentMissionData.isCompleted && (
              <button
                id="banner-guide-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleGuideToMission(currentMissionData.step);
                }}
                className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-slate-950 hover:bg-slate-900 active:scale-95 text-amber-300 hover:text-amber-200 border border-amber-400 font-pixel text-[8px] sm:text-[10px] font-bold shadow-sm transition flex items-center gap-1 shrink-0 cursor-pointer"
                title="Tuntun karakter otomatis berjalan ke target misi"
              >
                <span>Tuntun</span>
                <span className="text-[9px] sm:text-xs">🏃</span>
              </button>
            )}
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
          isSettingsOpen={showSettings}
          onToggleMiniMap={() => setShowMiniMap((prev) => !prev)}
          isMiniMapOpen={showMiniMap}
          onOpenEnding={() => setShowEnding(true)}
          isGameCompleted={
            isFreeRoamActive ||
            (zoneStatus.plaza && zoneStatus.bridge && zoneStatus.forest && zoneStatus.tower)
          }
          onOpenRegulation={() => handleOpenRegulation('Pemain', 'breathing')}
          onOpenStartMenu={() => {
            sound.playMenuSelect();
            setShowPauseMenu(false);
            setShowSettings(false);
            setShowJournal(false);
            setCurrentDialogue(null);
            handleRestart();
          }}
          onOpenPauseMenu={() => {
            sound.playMenuSelect();
            setShowPauseMenu(true);
          }}
          isPauseOpen={showPauseMenu}
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
          quests={quests}
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
          onSkipRegulation={handleSkipRegulation}
          onClose={handleDialogueClose}
          isCompassActive={isCompassActive}
          playerName={playerName}
          playerAvatar={playerAvatar}
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

            if (breathingTarget === 'Kiki' || breathingTarget === 'kiki') {
              let afterNode = GAME_DIALOGUES.kiki_after_breathing;
              if (_mode === 'grounding') {
                afterNode = GAME_DIALOGUES.kiki_after_grounding || afterNode;
              } else if (_mode === 'stop') {
                afterNode = GAME_DIALOGUES.kiki_after_stop || afterNode;
              } else if (_mode === 'shakeout') {
                afterNode = GAME_DIALOGUES.kiki_after_shakeout || afterNode;
              } else if (_mode === 'breathing') {
                afterNode = GAME_DIALOGUES.kiki_after_breathing || afterNode;
              }
              if (afterNode) {
                processDialogueTriggers(afterNode);
                setCurrentDialogue(afterNode);
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
        onOpenAllBadgesCelebration={() => setShowAllBadgesCelebration(true)}
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
        isFreeRoamActive={isFreeRoamActive}
        onToggleMute={handleToggleMute}
        onOpenAllBadgesCelebration={() => setShowAllBadgesCelebration(true)}
        onUnlockAllBadges={handleUnlockAllBadgesTest}
        onCaptureMoment={handleCaptureMoment}
        onNavigateToTile={handleMiniMapNavigate}
        onActivateDeveloperMode={handleActivateDeveloperMode}
      />

      {/* Developer Mode Toast Notification */}
      {developerToast && (
        <div
          id="developer-mode-toast"
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none px-4 py-2.5 rounded-xl bg-slate-950/95 border-2 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.55)] flex items-center gap-2.5 max-w-[90vw] animate-bounce"
        >
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0 animate-spin" />
          <p className="text-amber-200 text-xs sm:text-sm font-bold tracking-wide text-center">
            {developerToast}
          </p>
        </div>
      )}

      {/* Capture Moment / Abadikan Momen Modal with decorative overlay */}
      <CaptureMomentModal
        isOpen={showCaptureMoment}
        onClose={() => setShowCaptureMoment(false)}
        screenshotDataUrl={screenshotDataUrl}
        locationName={capturedLocationName}
        stats={stats}
        zoneStatus={zoneStatus}
        onRetake={handleCaptureMoment}
      />

      {/* Camera shutter flash effect */}
      {showCameraFlash && (
        <div className="fixed inset-0 bg-white pointer-events-none z-[9999] transition-opacity duration-300 opacity-90 animate-pulse" />
      )}

      {/* Grand 10/10 Badges Appreciation Celebration Modal */}
      <AllBadgesCelebrationModal
        isOpen={showAllBadgesCelebration}
        onClose={() => setShowAllBadgesCelebration(false)}
        stats={stats}
        playerName={playerName}
        onOpenJournal={() => {
          setShowAllBadgesCelebration(false);
          setShowJournal(true);
        }}
        onFreeRoam={() => {
          setShowAllBadgesCelebration(false);
          handleFreeRoam();
        }}
      />

      {/* Ending Celebration & Certificate Modal */}
      <EndingModal
        isOpen={showEnding}
        onRestart={handleRestart}
        onFreeRoam={handleFreeRoam}
        stats={stats}
        branchTag={branchChoice}
        endingType={endingType}
        playerName={playerName}
      />

      {/* Opening Start Menu Modal (Displayed before entering the game story) */}
      <StartMenuModal
        isOpen={showStartMenu}
        onStartGame={handleStartGame}
        onOpenControls={() => handleOpenSettings('controls')}
        onOpenAudioSettings={() => handleOpenSettings('audio')}
        onOpenSettings={() => handleOpenSettings('quest')}
        isSettingsOpen={showSettings}
        initialPlayerName={playerName}
        initialPlayerAvatar={playerAvatar}
      />

      {/* Pause Menu Modal (Resume, Pengaturan, Main Menu, Quit Game) */}
      <PauseMenuModal
        isOpen={showPauseMenu}
        onResume={() => {
          sound.playMenuSelect();
          setShowPauseMenu(false);
        }}
        onOpenSettings={() => {
          sound.playMenuSelect();
          setShowPauseMenu(false);
          handleOpenSettings('audio');
        }}
        onOpenMainMenu={() => {
          sound.playMenuSelect();
          setShowPauseMenu(false);
          setShowSettings(false);
          setShowJournal(false);
          setCurrentDialogue(null);
          handleRestart();
        }}
      />

      {/* Prominent Sequential Mission Guidance Pop-Up for Kids */}
      <MissionNotificationModal
        isOpen={showMissionModal && hasCompletedIntroTutorial && !showStartMenu && !currentDialogue}
        onClose={() => setShowMissionModal(false)}
        mission={currentMissionData}
        onNavigateToTarget={(tx, ty) => {
          handleGuideToMission(currentMissionData.step);
        }}
        isNewUnlock={isNewMissionUnlock}
      />
    </div>
  );
}
