import { TILE, TILE_SIZE, MAP_COLS, MAP_ROWS } from './constants';
import { NPC, ZoneColorStatus, EmotionType } from '../types/game';
import { freeRoamWorld } from './freeRoamWorld';

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 'down' | 'up' | 'left' | 'right';
  animFrame: number;
  isMoving: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  gravity?: number;
  drag?: number;
  shrink?: boolean;
  shape?: 'pixel' | 'sparkle' | 'circle' | 'ring';
  twinkle?: boolean;
  rotation?: number;
  vRot?: number;
}

export interface WaterfallParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'spray' | 'mist' | 'streak' | 'foam' | 'rainbow';
  alpha: number;
  gravity?: number;
  drag?: number;
  maxSize?: number;
}

export interface FogLeaf {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  angle: number;
  angularSpeed: number;
  flutterPhase: number;
  flutterSpeed: number;
  leafType: number;
  color: string;
  accentColor: string;
  stemColor: string;
  baseOpacity: number;
  depth: number;
}

export interface FogWindStreak {
  id: number;
  x: number;
  y: number;
  length: number;
  speed: number;
  width: number;
  curvature: number;
  driftY: number;
  opacity: number;
  phase: number;
  depth: number;
}

export interface FogMistMote {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  phase: number;
  depth: number;
}

export type DestinationType = 'walk' | 'interact' | 'examine';

export interface HoverTarget {
  type: 'npc' | 'fountain' | 'signpost' | 'tree' | 'tower' | 'windmill' | 'animal' | 'river';
  name: string;
  x: number;
  y: number;
}

export class GameRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private tickCount: number = 0;
  private particles: Particle[] = [];
  private waterfallParticles: WaterfallParticle[] = [];
  private waterfallParticleId: number = 0;
  private destinationTarget: { x: number; y: number; anim: number; type: DestinationType } | null = null;
  private hoverTarget: HoverTarget | null = null;
  private shakeIntensity: number = 0;
  private shakeDuration: number = 0;
  private shakeElapsed: number = 0;
  private playerStepTick: number = 0;
  private isAllMissionsCompleted: boolean = false;
  private fogLeaves: FogLeaf[] = [];
  private fogWindStreaks: FogWindStreak[] = [];
  private fogMistMotes: FogMistMote[] = [];
  private fogSystemInitialized: boolean = false;
  // Dynamic smooth transition state for fog & atmospheric particles (fade-in / fade-out)
  private currentFogIntensity: number = 0.0;
  private targetFogIntensity: number = 1.0;
  // Parallax tracking relative to player movement
  private lastPlayerX: number = -1;
  private lastPlayerY: number = -1;
  private fogRibbonParallaxX: number[] = [0, 0, 0];
  private fogRibbonParallaxY: number[] = [0, 0, 0];

  // Fixed Daytime Atmosphere (Day/Night cycle removed in both fog and free roam modes)
  private targetTimeOfDay: 'day' | 'night' = 'day';
  private timeOfDayProgress: number = 0.0;

  public setTimeOfDay(_time: 'day' | 'night', _instant: boolean = false) {
    this.targetTimeOfDay = 'day';
    this.timeOfDayProgress = 0.0;
  }

  public toggleDayNightCycle(): 'day' | 'night' {
    this.targetTimeOfDay = 'day';
    this.timeOfDayProgress = 0.0;
    return 'day';
  }

  public getTimeOfDay(): 'day' | 'night' {
    return 'day';
  }

  public getTimeOfDayProgress(): number {
    return 0.0;
  }

  // Active sequential quest tracking for eye-catching visual guidance
  private activeQuestTarget: {
    npcId: string;
    stepNumber: number;
    label: string;
    targetX: number;
    targetY: number;
  } | null = null;

  public setActiveQuestTarget(
    target: {
      npcId: string;
      stepNumber: number;
      label: string;
      targetX: number;
      targetY: number;
    } | null
  ) {
    this.activeQuestTarget = target;
  }

  // Player custom avatar representation (boy or girl)
  public playerAvatar: 'boy' | 'girl' = 'boy';

  public setPlayerAvatar(avatar: 'boy' | 'girl') {
    this.playerAvatar = avatar;
  }

  // Player custom nickname
  public playerName: string = 'Ezzel';

  public setPlayerName(name: string) {
    if (name && name.trim()) {
      this.playerName = name.trim();
    }
  }

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Could not create 2D context');
    this.ctx = context;
    // Crisp pixel rendering
    this.ctx.imageSmoothingEnabled = false;
  }

  /**
   * Triggers a punchy screen shake effect providing immediate haptic-like feedback
   * @param intensity Pixel displacement magnitude (e.g. 5-8px)
   * @param durationFrames Number of render frames the shake lasts (e.g. 14-22 frames)
   */
  public triggerScreenShake(intensity: number = 6, durationFrames: number = 18) {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    this.shakeDuration = Math.max(this.shakeDuration, durationFrames);
    this.shakeElapsed = 0;

    // Trigger physical haptic vibration if supported on device (mobile/gamepad)
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate([35, 25, 45]);
      } catch {
        // Silently ignore if not supported or disallowed by browser permissions
      }
    }
  }

  public setDestination(x: number, y: number, type: DestinationType = 'walk') {
    this.destinationTarget = { x, y, anim: 0, type };
  }

  public setHover(hover: HoverTarget | null) {
    this.hoverTarget = hover;
  }

  public clearDestination() {
    this.destinationTarget = null;
  }

  public addSparkle(x: number, y: number, color: string = '#fef08a', count: number = 8) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 1.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.5,
        life: 0,
        maxLife: 20 + Math.random() * 20,
        color,
        size: 2 + Math.random() * 3,
        shape: 'sparkle',
        twinkle: true,
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.1,
      });
    }
  }

  /**
   * Triggers a radiant sparkle burst when Kompas Hati is activated,
   * scanning the emotional resonance in the surrounding area.
   */
  public triggerCompassBurst(x: number, y: number) {
    const resonanceColors = [
      '#fde047', // Radiant golden yellow
      '#fbbf24', // Warm amber
      '#f59e0b', // Sunburst gold
      '#fef08a', // Pale crystalline starlight
      '#34d399', // Harmony emerald
      '#6ee7b7', // Mint serenity
      '#38bdf8', // Clarity sky blue
      '#f472b6', // Empathy rose
      '#ffffff', // Pure flash white
    ];

    const particleCount = 42;
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
      const speed = 0.8 + Math.random() * 2.8;
      const color = resonanceColors[Math.floor(Math.random() * resonanceColors.length)];
      const maxLife = 35 + Math.floor(Math.random() * 30);
      const size = 2.4 + Math.random() * 2.8;

      this.particles.push({
        x: x + (Math.random() - 0.5) * 6,
        y: y + (Math.random() - 0.5) * 6,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.35,
        life: 0,
        maxLife,
        color,
        size,
        gravity: -0.02, // Gentle ethereal lift
        drag: 0.94,     // Natural airy deceleration
        shrink: true,
        shape: 'sparkle',
        twinkle: true,
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.14,
      });
    }

    // Expanding soft resonance ring motes
    for (let r = 0; r < 4; r++) {
      this.particles.push({
        x,
        y,
        vx: 0,
        vy: 0,
        life: r * 3,
        maxLife: 26 + r * 5,
        color: '#fbbf24',
        size: 10 + r * 14,
        shape: 'ring',
        drag: 1,
      });
    }
  }

  /**
   * Triggers small particle bursts when walking over specific tile surfaces,
   * e.g., dust puffs on stone or leaves on grass
   * @param x Foot X coordinate in world pixels
   * @param y Foot Y coordinate in world pixels
   * @param tile Tile type integer from TILE
   * @param isColored Whether current zone has recovered its vibrant colors
   */
  public addTileFootstepParticles(x: number, y: number, tile: number, isColored: boolean = true) {
    if (tile === TILE.PATH_STONE || tile === TILE.PLAZA_MOSAIC || tile === TILE.PLAZA_BORDER) {
      // Dust puffs on stone & mosaic plaza
      const count = 3 + Math.floor(Math.random() * 2);
      const dustColors = isColored
        ? ['#cbd5e1', '#94a3b8', '#e2e8f0', '#64748b']
        : ['#475569', '#334155', '#64748b'];

      for (let i = 0; i < count; i++) {
        const spreadX = (Math.random() - 0.5) * 1.4;
        const liftY = -0.3 - Math.random() * 0.5;
        this.particles.push({
          x: x + (Math.random() - 0.5) * 6,
          y: y + (Math.random() - 0.5) * 3,
          vx: spreadX,
          vy: liftY,
          life: 0,
          maxLife: 12 + Math.floor(Math.random() * 6),
          color: dustColors[Math.floor(Math.random() * dustColors.length)],
          size: Math.random() > 0.4 ? 2 : 1.5,
          drag: 0.88,
          gravity: -0.015, // Soft upward rise like a dust puff
          shrink: true,
        });
      }
    } else if (tile === TILE.GRASS || tile === TILE.GRASS_FLOWERS || tile === TILE.FOREST_PINE) {
      // Leaves and grass flecks
      const count = 3 + Math.floor(Math.random() * 2);
      const leafColors = isColored
        ? (tile === TILE.GRASS_FLOWERS
            ? ['#4ade80', '#22c55e', '#f43f5e', '#facc15']
            : ['#4ade80', '#22c55e', '#16a34a', '#86efac'])
        : ['#475569', '#64748b', '#334155'];

      for (let i = 0; i < count; i++) {
        const angle = Math.PI * (1.15 + Math.random() * 0.7); // Kick upward & backward
        const speed = 0.5 + Math.random() * 1.0;
        this.particles.push({
          x: x + (Math.random() - 0.5) * 6,
          y: y + (Math.random() - 0.5) * 3,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: 15 + Math.floor(Math.random() * 8),
          color: leafColors[Math.floor(Math.random() * leafColors.length)],
          size: Math.random() > 0.5 ? 2 : 1.5,
          gravity: 0.08, // Flutter down gently like light leaves
          drag: 0.94,
          shrink: false,
        });
      }
    } else if (tile === TILE.WOOD_BRIDGE) {
      // Wood sawdust / splinters
      const count = 3;
      const woodColors = isColored
        ? ['#b45309', '#d97706', '#fef08a', '#78350f']
        : ['#475569', '#64748b'];

      for (let i = 0; i < count; i++) {
        const kickX = (Math.random() - 0.5) * 1.2;
        const kickY = -0.5 - Math.random() * 0.7;
        this.particles.push({
          x: x + (Math.random() - 0.5) * 5,
          y: y + (Math.random() - 0.5) * 2,
          vx: kickX,
          vy: kickY,
          life: 0,
          maxLife: 12 + Math.floor(Math.random() * 6),
          color: woodColors[Math.floor(Math.random() * woodColors.length)],
          size: 1.5,
          gravity: 0.1,
          drag: 0.9,
          shrink: true,
        });
      }
    } else if (tile === TILE.FOUNTAIN || tile === TILE.WATER || tile === TILE.WATER_DEEP) {
      // Water droplet splashes
      const count = 4;
      const splashColors = ['#38bdf8', '#7dd3fc', '#bae6fd', '#ffffff'];

      for (let i = 0; i < count; i++) {
        const spreadX = (Math.random() - 0.5) * 1.4;
        const popY = -0.9 - Math.random() * 1.0;
        this.particles.push({
          x: x + (Math.random() - 0.5) * 4,
          y: y + (Math.random() - 0.5) * 2,
          vx: spreadX,
          vy: popY,
          life: 0,
          maxLife: 14 + Math.floor(Math.random() * 6),
          color: splashColors[Math.floor(Math.random() * splashColors.length)],
          size: 2,
          gravity: 0.16,
          drag: 0.95,
          shrink: true,
        });
      }
    } else if (tile === TILE.FLOWER_BED) {
      // Petals flutter
      const count = 4;
      const petalColors = isColored
        ? ['#f43f5e', '#fb7185', '#fbcfe8', '#facc15']
        : ['#94a3b8', '#64748b'];

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.4 + Math.random() * 0.8;
        this.particles.push({
          x: x + (Math.random() - 0.5) * 6,
          y: y + (Math.random() - 0.5) * 3,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.3,
          life: 0,
          maxLife: 16 + Math.floor(Math.random() * 8),
          color: petalColors[Math.floor(Math.random() * petalColors.length)],
          size: 2,
          gravity: 0.04,
          drag: 0.93,
          shrink: false,
        });
      }
    } else if (tile === TILE.MUSHROOM_PATCH) {
      // Bioluminescent spore puff
      const count = 3;
      const sporeColors = ['#c084fc', '#e879f9', '#fef08a', '#a855f7'];

      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: x + (Math.random() - 0.5) * 6,
          y: y + (Math.random() - 0.5) * 3,
          vx: (Math.random() - 0.5) * 0.8,
          vy: -0.4 - Math.random() * 0.5,
          life: 0,
          maxLife: 18 + Math.floor(Math.random() * 8),
          color: sporeColors[Math.floor(Math.random() * sporeColors.length)],
          size: 1.5,
          gravity: -0.01,
          drag: 0.96,
          shrink: true,
        });
      }
    } else if (tile === TILE.FARMLAND_SOIL) {
      // Rich dark loamy earth dust puff
      const count = 3;
      const soilColors = isColored ? ['#78350f', '#92400e', '#451a03', '#b45309'] : ['#334155', '#475569'];
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: x + (Math.random() - 0.5) * 5,
          y: y + (Math.random() - 0.5) * 2,
          vx: (Math.random() - 0.5) * 0.9,
          vy: -0.4 - Math.random() * 0.5,
          life: 0,
          maxLife: 14 + Math.floor(Math.random() * 6),
          color: soilColors[Math.floor(Math.random() * soilColors.length)],
          size: 2,
          gravity: 0.08,
          drag: 0.9,
          shrink: true,
        });
      }
    } else if (tile === TILE.CROP_CARROT || tile === TILE.CROP_CABBAGE) {
      // Green vegetable leaf flecks + earth bits
      const count = 3;
      const cropColors = isColored
        ? (tile === TILE.CROP_CARROT
            ? ['#ea580c', '#22c55e', '#78350f', '#86efac']
            : ['#16a34a', '#86efac', '#bbf7d0', '#78350f'])
        : ['#475569', '#64748b'];
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: x + (Math.random() - 0.5) * 5,
          y: y + (Math.random() - 0.5) * 2,
          vx: (Math.random() - 0.5) * 1.1,
          vy: -0.5 - Math.random() * 0.6,
          life: 0,
          maxLife: 15 + Math.floor(Math.random() * 6),
          color: cropColors[Math.floor(Math.random() * cropColors.length)],
          size: 1.5,
          gravity: 0.07,
          drag: 0.92,
          shrink: false,
        });
      }
    } else if (tile === TILE.CROP_WHEAT || tile === TILE.HAY_BALE) {
      // Golden grain flakes and dry chaff
      const count = 3;
      const wheatColors = isColored ? ['#facc15', '#eab308', '#ca8a04', '#fef08a'] : ['#64748b', '#94a3b8'];
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: x + (Math.random() - 0.5) * 5,
          y: y + (Math.random() - 0.5) * 2,
          vx: (Math.random() - 0.5) * 1.2,
          vy: -0.6 - Math.random() * 0.6,
          life: 0,
          maxLife: 16 + Math.floor(Math.random() * 6),
          color: wheatColors[Math.floor(Math.random() * wheatColors.length)],
          size: 1.5,
          gravity: 0.06,
          drag: 0.91,
          shrink: true,
        });
      }
    }
  }

  public render(
    map: number[][],
    player: Player,
    npcs: NPC[],
    zoneColorStatus: ZoneColorStatus,
    isCompassActive: boolean,
    cameraX: number,
    cameraY: number,
    viewportW: number,
    viewportH: number,
    zoom: number = 1.35,
    isMissionCompleted?: boolean,
    timeOfDay?: 'day' | 'night'
  ) {
    this.tickCount++;
    this.isAllMissionsCompleted =
      isMissionCompleted ??
      (zoneColorStatus.plaza &&
        zoneColorStatus.bridge &&
        zoneColorStatus.forest &&
        zoneColorStatus.tower);

    // Permanent bright daytime in both Fog Mode and Free Roam Mode (Day/Night cycle removed)
    this.targetTimeOfDay = 'day';
    this.timeOfDayProgress = 0.0;

    const ctx = this.ctx;
    ctx.save();
    ctx.imageSmoothingEnabled = false;

    // Clear background with natural terrain base color
    const isPlazaRestored = this.isAllMissionsCompleted || zoneColorStatus.plaza;
    const dayTerrain = isPlazaRestored ? '#386641' : '#334155';
    ctx.fillStyle = dayTerrain;
    ctx.fillRect(0, 0, viewportW, viewportH);

    // Apply zoom transformation to focus closely on player exploration
    ctx.scale(zoom, zoom);

    // Calculate screen shake displacement with smooth exponential decay
    let shakeOffsetX = 0;
    let shakeOffsetY = 0;
    if (this.shakeElapsed < this.shakeDuration && this.shakeIntensity > 0) {
      const progress = this.shakeElapsed / this.shakeDuration;
      const decay = Math.pow(1 - progress, 1.6);
      const currentIntensity = this.shakeIntensity * decay;

      // Dynamic oscillation with dual frequency for high tactile responsiveness
      const phase = this.shakeElapsed * 2.4;
      shakeOffsetX = (Math.sin(phase) * 0.75 + Math.sin(phase * 2.7) * 0.25) * currentIntensity;
      shakeOffsetY = (Math.cos(phase * 1.3) * 0.75 + Math.cos(phase * 3.1) * 0.25) * currentIntensity;
      this.shakeElapsed++;
    } else if (this.shakeIntensity > 0) {
      this.shakeIntensity = 0;
      this.shakeDuration = 0;
      this.shakeElapsed = 0;
    }

    // Camera translation with screen shake
    ctx.translate(-Math.floor(cameraX + shakeOffsetX), -Math.floor(cameraY + shakeOffsetY));

    // Determine tile bounds to render in world coordinates (considering zoom scale)
    const worldW = viewportW / zoom;
    const worldH = viewportH / zoom;
    const effectiveCamX = cameraX + shakeOffsetX;
    const effectiveCamY = cameraY + shakeOffsetY;
    const startCol = Math.max(0, Math.floor(effectiveCamX / TILE_SIZE) - 2);
    const endCol = Math.min(MAP_COLS - 1, Math.ceil((effectiveCamX + worldW) / TILE_SIZE) + 2);
    const startRow = Math.max(0, Math.floor(effectiveCamY / TILE_SIZE) - 2);
    const endRow = Math.min(MAP_ROWS - 1, Math.ceil((effectiveCamY + worldH) / TILE_SIZE) + 2);

    // 0. Continuous seamless ground undercoat across visible bounds:
    // Fuses all ground into an organic, monolithic 16-bit canvas terrain before individual tile layers
    const groundPad = TILE_SIZE * 2;
    const undercoatX = Math.max(0, startCol * TILE_SIZE - groundPad);
    const undercoatY = Math.max(0, startRow * TILE_SIZE - groundPad);
    const undercoatW = (endCol - startCol + 1) * TILE_SIZE + groundPad * 2;
    const undercoatH = (endRow - startRow + 1) * TILE_SIZE + groundPad * 2;
    ctx.fillStyle = dayTerrain;
    ctx.fillRect(undercoatX, undercoatY, undercoatW, undercoatH);

    // 1. Draw Map Base & Floor Tiles
    const structuresToRender: Array<{ tile: number; x: number; y: number; isColored: boolean; r: number; c: number }> = [];

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const tile = map[r]?.[c] ?? TILE.GRASS;
        const screenX = c * TILE_SIZE;
        const screenY = r * TILE_SIZE;

        // Is this zone restored to color?
        const isRestored = this.isZoneColored(c, r, zoneColorStatus);

        if (tile === TILE.FOUNTAIN || tile === TILE.GRAND_OAK) {
          // Render plaza mosaic/border floor under the structure so floor extends continuously
          this.drawTile(tile === TILE.FOUNTAIN ? TILE.PLAZA_MOSAIC : TILE.PLAZA_BORDER, screenX, screenY, isRestored, r, c);
          structuresToRender.push({ tile, x: screenX, y: screenY, isColored: isRestored, r, c });
        } else {
          this.drawTile(tile, screenX, screenY, isRestored, r, c);
        }
      }
    }

    // 1b. Render Plaza Structures (Fountain) after all floor tiles so no floor tiles overlap
    for (const s of structuresToRender) {
      this.drawTile(s.tile, s.x, s.y, s.isColored, s.r, s.c);
    }

    // 1c. Free Roam / Post-completion Pastoral & Agricultural Life
    if (this.isAllMissionsCompleted) {
      // Soft environmental ground shadows for depth
      freeRoamWorld.renderSoftEnvironmentalShadows(ctx);
      // Agricultural gardening tools leaning on fences
      freeRoamWorld.renderGardeningTools(ctx);
      // Pasture livestock: Holstein cow, brown calf, and fluffy grazing sheep in north meadow
      freeRoamWorld.renderPastureLivestock(ctx, this.tickCount, player.x, player.y);
      // Farm sparrows foraging and perching in crops & fences
      freeRoamWorld.renderFarmBirds(ctx, this.tickCount);
      // Rotating Windmill with wooden lattice sail blades near wheat farm & riverbank
      freeRoamWorld.renderWindmill(ctx, this.tickCount, true);
    }

    // 2. Draw Decorative Bridge Details: Support Pillars in Water, River Cast Shadows, and Railings
    const isBridgeColored = this.isAllMissionsCompleted || zoneColorStatus.bridge;
    this.drawBridgeStructuresAndWaterShadow(isBridgeColored);
    this.drawRiverWaterfall(isBridgeColored);
    this.drawWaterCurrents(cameraX, cameraY, viewportW, viewportH, zoneColorStatus.bridge);

    // 2b. River Life: Active swimming fish school and surface ripples
    if (this.isAllMissionsCompleted || zoneColorStatus.bridge) {
      freeRoamWorld.renderRiverLife(ctx, this.tickCount);
    }

    // 3. Draw NPCs
    npcs.forEach((npc) => {
      this.drawNPC(npc, isCompassActive, player);
    });

    // Destination target marker on floor
    this.drawDestinationMarker();

    // Hover interaction indicator above interactive targets
    this.drawHoverIndicator();

    // 4. Draw Player with Kompas Hati resonance state
    this.drawPlayer(player, isCompassActive);

    // 4c. Bridge Foreground Southern Railing & Gateposts (creates true 2.5D depth so characters walk behind railing)
    this.drawBridgeForegroundRailing(isBridgeColored, player);

    // 4b. Overhead dynamic life: Butterflies & Farmhouse Chimney Smoke
    if (this.isAllMissionsCompleted) {
      // Butterflies fluttering near fruit trees (rest gracefully at dusk/night)
      freeRoamWorld.renderButterflies(ctx, this.tickCount, this.timeOfDayProgress);
      // Puffy smoke clouds billowing from farmhouse chimney
      freeRoamWorld.renderChimneySmoke(ctx, this.tickCount);
    }

    // Trigger footstep particle bursts when player walks over specific tile types (dust puffs, leaves, sawdust, splashes)
    if (player.isMoving) {
      this.playerStepTick++;
      if (this.playerStepTick % 14 === 0) {
        const isLeft = (this.playerStepTick / 14) % 2 === 0;
        const footX = player.x + 16 + (isLeft ? -5 : 5);
        const footY = player.y + 27;
        const tileCol = Math.floor(footX / TILE_SIZE);
        const tileRow = Math.floor(footY / TILE_SIZE);
        const currentTile = map[tileRow]?.[tileCol] ?? TILE.GRASS;
        const isColored = this.isZoneColored(tileCol, tileRow, zoneColorStatus);
        this.addTileFootstepParticles(footX, footY, currentTile, isColored);
      }
    } else {
      this.playerStepTick = 0;
    }

    // 5. Draw Secret sparkle over Holy Tree if not yet inspected
    this.drawSecretSparkles(isCompassActive);

    // 6. Draw Compass Resonance Aura overlay and continuous scan sparkles if active
    if (isCompassActive) {
      this.drawResonanceAuras(player, npcs);

      // Continuous ambient sparkles rising from the Heart Compass during active scan
      if (this.tickCount % 5 === 0) {
        const pHeartX = player.x + 16 + (Math.random() - 0.5) * 12;
        const pHeartY = player.y + 18 + (Math.random() - 0.5) * 10;
        const colors = ['#fef08a', '#fbbf24', '#f59e0b', '#34d399', '#f472b6', '#38bdf8'];
        this.particles.push({
          x: pHeartX,
          y: pHeartY,
          vx: (Math.random() - 0.5) * 0.8,
          vy: -0.7 - Math.random() * 0.9,
          life: 0,
          maxLife: 26 + Math.floor(Math.random() * 20),
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 2.2 + Math.random() * 2.2,
          gravity: -0.018,
          drag: 0.95,
          shrink: true,
          shape: 'sparkle',
          twinkle: true,
          rotation: Math.random() * Math.PI,
          vRot: (Math.random() - 0.5) * 0.1,
        });
      }
    }

    // 7. Update and draw particles (bloom sparks, healing dust)
    this.updateAndDrawParticles();

    // 8. Draw Fog of gray mist over uncolored zones with wind gusts and flying leaves
    this.drawAtmosphericMist(
      zoneColorStatus,
      worldW,
      worldH,
      effectiveCamX,
      effectiveCamY,
      player
    );

    // 9. If all missions completed / in Free Roam: Dynamic Living World Atmosphere (Sunbeams & Golden Spores in Day)
    if (this.isAllMissionsCompleted) {
      // Natural crossfade: atmosphere emerges gracefully as the cold fog mist fades out
      const atmosphereCrossfade = Math.max(0.0, Math.min(1.0, 1.0 - this.currentFogIntensity));
      if (atmosphereCrossfade > 0.01) {
        ctx.save();
        ctx.globalAlpha = atmosphereCrossfade;
        freeRoamWorld.renderAtmosphere(ctx, this.tickCount, 0.0);
        ctx.restore();
      }
    }

    ctx.restore();

    // 11. Screen-space Directional Guide Arrow for Active Mission Target (Off-screen indicator for children)
    this.drawOffScreenQuestArrow(cameraX, cameraY, viewportW, viewportH, zoom);
  }

  // Draw bouncing off-screen directional arrow pointing toward active mission target
  private drawOffScreenQuestArrow(
    camX: number,
    camY: number,
    viewportW: number,
    viewportH: number,
    zoom: number
  ) {
    if (!this.activeQuestTarget || this.isAllMissionsCompleted) return;

    const { targetX, targetY, stepNumber, label } = this.activeQuestTarget;
    const ctx = this.ctx;

    // Convert target world position to screen coordinates
    const screenX = (targetX - camX) * zoom;
    const screenY = (targetY - camY) * zoom;

    // Margin padding from screen edges
    const marginX = 64;
    const marginY = 64;
    const isOffScreen =
      screenX < marginX ||
      screenX > viewportW - marginX ||
      screenY < marginY ||
      screenY > viewportH - marginY;

    if (!isOffScreen) return; // Target is visible inside view, no arrow needed

    ctx.save();
    const centerX = viewportW / 2;
    const centerY = viewportH / 2;
    const dx = screenX - centerX;
    const dy = screenY - centerY;
    const angle = Math.atan2(dy, dx);

    // Clamp indicator position to screen edges
    const radiusX = viewportW / 2 - marginX;
    const radiusY = viewportH / 2 - marginY;
    const clampX = Math.max(marginX, Math.min(viewportW - marginX, centerX + Math.cos(angle) * radiusX));
    const clampY = Math.max(marginY + 25, Math.min(viewportH - marginY - 15, centerY + Math.sin(angle) * radiusY));

    const bounce = Math.sin(this.tickCount * 0.18) * 4;
    const arrowX = clampX + Math.cos(angle) * bounce;
    const arrowY = clampY + Math.sin(angle) * bounce;

    // Glowing aura behind arrow
    ctx.fillStyle = 'rgba(245, 158, 11, 0.45)';
    ctx.beginPath();
    ctx.arc(arrowX, arrowY, 18, 0, Math.PI * 2);
    ctx.fill();

    // Mission direction pill
    const indicatorText = `➔ MISI ${stepNumber}: ${label}`;
    ctx.font = 'bold 9px "Pixelify Sans", "Press Start 2P", monospace';
    const textW = ctx.measureText(indicatorText).width;

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.rect(arrowX - textW / 2 - 8, arrowY - 26, textW + 16, 18);
    ctx.fill();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(indicatorText, arrowX, arrowY - 17);

    // Pointer arrow tip pointing toward target direction
    ctx.save();
    ctx.translate(arrowX, arrowY + 2);
    ctx.rotate(angle);
    ctx.fillStyle = '#f59e0b';
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(11, 0);
    ctx.lineTo(-6, -7);
    ctx.lineTo(-2, 0);
    ctx.lineTo(-6, 7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  // Check which zone a coordinate belongs to
  private isZoneColored(c: number, r: number, status: ZoneColorStatus): boolean {
    if (c >= 25 && r <= 12) return status.tower;
    if (c >= 20 && (r >= 12 && r <= 20)) return status.bridge;
    if (c <= 16 && r <= 10) return status.forest;
    return status.plaza;
  }

  // Helper to draw tile base with subpixel overdraw (+1px) to guarantee no dark hairline seams
  private fillTileBase(x: number, y: number, color: string, w: number = TILE_SIZE, h: number = TILE_SIZE) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, w + 1, h + 1);
  }

  // Draw procedural pixel tile
  private drawTile(tile: number, x: number, y: number, isColored: boolean, r: number = 0, c: number = 0) {
    const ctx = this.ctx;

    // If not colored, shift to grayscale/cool muted tones
    switch (tile) {
      case TILE.GRASS: {
        this.fillTileBase(x, y, isColored ? '#386641' : '#334155');
        // Grass blade detail with subtle wind swaying
        const sway = isColored ? Math.floor(Math.sin(this.tickCount * 0.05 + c * 0.4 + r * 0.3) * 1.5) : 0;
        ctx.fillStyle = isColored ? '#6a994e' : '#475569';
        ctx.fillRect(x + 4 + sway, y + 6, 2, 4);
        ctx.fillRect(x + 20 + sway, y + 18, 2, 4);
        // Additional subtle grass blade variation
        if ((r + c) % 3 === 0 && isColored) {
          ctx.fillStyle = '#4f772d';
          ctx.fillRect(x + 12 - sway, y + 12, 2, 3);
        }
        break;
      }

      case TILE.GRASS_FLOWERS: {
        this.fillTileBase(x, y, isColored ? '#386641' : '#334155');
        const sway = isColored ? Math.floor(Math.sin(this.tickCount * 0.05 + c * 0.4 + r * 0.3) * 1.5) : 0;
        // Small flowers with animated petal sway
        ctx.fillStyle = isColored ? '#f43f5e' : '#64748b';
        ctx.fillRect(x + 8 + sway, y + 8, 3, 3);
        ctx.fillStyle = isColored ? '#eab308' : '#94a3b8';
        ctx.fillRect(x + 22 + sway, y + 16, 3, 3);
        if (isColored) {
          ctx.fillStyle = '#6a994e';
          ctx.fillRect(x + 9, y + 11, 1, 2);
          ctx.fillRect(x + 23, y + 19, 1, 2);
        }
        break;
      }

      case TILE.PATH_STONE: {
        // Authentic 16-bit interlocking flagstone path without square borders
        const pathBase = isColored ? '#8b9bb4' : '#475569';
        const stoneToneA = isColored ? '#cbd5e1' : '#64748b';
        const stoneToneB = isColored ? '#b0c4de' : '#576579';
        const stoneHighlight = isColored ? '#f1f5f9' : '#94a3b8';
        const mortarColor = isColored ? '#64748b' : '#334155';

        // 1. Seamless foundation
        this.fillTileBase(x, y, pathBase);

        // 2. Interlocking staggered flagstones spanning across tile boundaries seamlessly
        const altRow = (r + c) % 2 === 0;
        if (altRow) {
          // Course A: Two wide stones connecting horizontally across edges
          ctx.fillStyle = stoneToneA;
          ctx.fillRect(x, y, 15, 14);
          ctx.fillRect(x + 16, y, TILE_SIZE + 1 - 16, 14);
          ctx.fillStyle = stoneToneB;
          ctx.fillRect(x, y + 16, 18, TILE_SIZE + 1 - 16);
          ctx.fillRect(x + 19, y + 16, TILE_SIZE + 1 - 19, TILE_SIZE + 1 - 16);

          // Soft chisel highlights (top edges)
          ctx.fillStyle = stoneHighlight;
          ctx.fillRect(x + 1, y + 1, 13, 1);
          ctx.fillRect(x + 17, y + 1, 14, 1);
          ctx.fillRect(x + 1, y + 17, 16, 1);
          ctx.fillRect(x + 20, y + 17, 11, 1);
        } else {
          // Course B: Staggered center keystones connecting vertically and horizontally
          ctx.fillStyle = stoneToneB;
          ctx.fillRect(x, y, 10, 16);
          ctx.fillRect(x + 11, y, 12, 16);
          ctx.fillRect(x + 24, y, TILE_SIZE + 1 - 24, 16);
          ctx.fillStyle = stoneToneA;
          ctx.fillRect(x, y + 17, 14, TILE_SIZE + 1 - 17);
          ctx.fillRect(x + 15, y + 17, TILE_SIZE + 1 - 15, TILE_SIZE + 1 - 17);

          // Soft chisel highlights
          ctx.fillStyle = stoneHighlight;
          ctx.fillRect(x + 1, y + 1, 8, 1);
          ctx.fillRect(x + 12, y + 1, 10, 1);
          ctx.fillRect(x + 25, y + 1, 6, 1);
          ctx.fillRect(x + 1, y + 18, 12, 1);
          ctx.fillRect(x + 16, y + 18, 15, 1);
        }

        // Gentle sand/mortar joints between stones (soft, never harsh black)
        ctx.fillStyle = mortarColor;
        ctx.fillRect(x, y + 15, TILE_SIZE + 1, 1);

        // --- ORNAMEN MODE KABUT: DETAIL TANAH, PANTULAN AIR/BASAH & LUMUT BERPENDAR ---
        if (!isColored) {
          // 1. Detail Tanah dan Jalan: celah retakan mikro & lumut abu-abu lapuk
          ctx.fillStyle = '#334155';
          if ((r + c) % 3 === 0) {
            ctx.fillRect(x + 4, y + 6, 5, 1);
            ctx.fillRect(x + 8, y + 7, 1, 3);
            ctx.fillRect(x + 22, y + 20, 6, 1);
            ctx.fillRect(x + 25, y + 21, 1, 4);
          } else if ((r + c) % 3 === 1) {
            ctx.fillRect(x + 18, y + 5, 6, 1);
            ctx.fillRect(x + 20, y + 6, 1, 4);
            ctx.fillRect(x + 6, y + 22, 5, 1);
          }
          // Lumut abu-abu lapuk di sela-sela mortar
          ctx.fillStyle = '#475569';
          ctx.fillRect(x + 12, y + 14, 4, 2);
          ctx.fillRect(x + 24, y + 15, 3, 2);

          // 2. Pantulan di Permukaan Air / Lantai Basah: genangan air mengkilap & kilau partikel
          const isPuddleTile = (r * 7 + c * 11) % 4 === 0;
          if (isPuddleTile) {
            // Lapisan tipis genangan air basah dingin
            ctx.fillStyle = 'rgba(224, 242, 254, 0.16)';
            ctx.fillRect(x + 4, y + 4, 12, 8);
            ctx.fillStyle = 'rgba(186, 230, 253, 0.22)';
            ctx.fillRect(x + 6, y + 6, 8, 4);

            // Pantulan cahaya lampu jalan jika berada dekat area lentera desa (kolom 12-18)
            if (c >= 12 && c <= 18 && r >= 12 && r <= 20) {
              const lampGlint = Math.sin(this.tickCount * 0.08 + c + r) * 0.08 + 0.22;
              ctx.fillStyle = `rgba(254, 240, 138, ${lampGlint})`;
              ctx.fillRect(x + 7, y + 7, 5, 2);
            }

            // Kilau lembut pantulan partikel pendar di atas permukaan basah
            ctx.fillStyle = 'rgba(240, 249, 255, 0.55)';
            ctx.fillRect(x + 8, y + 6, 2, 1);
            ctx.fillRect(x + 11, y + 8, 1, 1);
          }

          // 3. Tumbuhan Bercahaya (Bioluminescence): lumut berpendar redup di sela-sela lantai batu
          const hasBiolumMoss = (r * 13 + c * 17) % 5 === 0;
          if (hasBiolumMoss) {
            const pulse = Math.sin(this.tickCount * 0.06 + r * 1.5 + c * 2.1) * 0.25 + 0.75;
            // Pendaran lembut hijau mint & biru toska
            ctx.fillStyle = `rgba(45, 212, 191, ${0.35 * pulse})`;
            ctx.fillRect(x + 9, y + 13, 8, 5);
            ctx.fillStyle = '#2dd4bf';
            ctx.fillRect(x + 11, y + 14, 4, 2);
            ctx.fillStyle = '#4ade80';
            ctx.fillRect(x + 12, y + 15, 2, 1);
            ctx.fillStyle = '#a7f3d0';
            ctx.fillRect(x + 13, y + 14, 1, 1);
          }
        }
        break;
      }

      case TILE.WATER:
      case TILE.WATER_DEEP:
        this.drawWaterTile(x, y, isColored, r, c, tile === TILE.WATER_DEEP);
        break;

      case TILE.WOOD_BRIDGE:
        this.drawBridgeDeckTile(x, y, isColored, r, c);
        break;

      case TILE.TREE_TRUNK: {
        // Classic 16-bit Pixel-Art Forest Oak Tree
        this.fillTileBase(x, y, isColored ? '#386641' : '#334155');

        // Tree shadow on grass
        ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
        ctx.fillRect(x + 4, y + 26, 24, 5);

        // Textured pixel trunk with bark grain
        const barkDark = isColored ? '#451a03' : '#1e293b';
        const barkMid = isColored ? '#78350f' : '#334155';
        const barkLight = isColored ? '#b45309' : '#475569';

        ctx.fillStyle = barkMid;
        ctx.fillRect(x + 11, y + 14, 10, 15);
        ctx.fillStyle = barkDark;
        ctx.fillRect(x + 17, y + 14, 4, 15);
        ctx.fillStyle = barkLight;
        ctx.fillRect(x + 11, y + 16, 2, 10);

        // Root flare base
        ctx.fillStyle = barkDark;
        ctx.fillRect(x + 8, y + 25, 4, 4);
        ctx.fillRect(x + 20, y + 25, 4, 4);

        // Stepped Pixel Foliage Canopy (16-bit blocks, strictly NO math arcs)
        const leafDark = isColored ? '#14532d' : '#1e293b';
        const leafMid = isColored ? '#15803d' : '#334155';
        const leafLight = isColored ? '#22c55e' : '#475569';
        const leafHighlight = isColored ? '#86efac' : '#94a3b8';

        ctx.fillStyle = leafDark;
        ctx.fillRect(x + 4, y - 6, 24, 22);
        ctx.fillRect(x + 2, y - 2, 28, 16);
        ctx.fillRect(x + 8, y - 10, 16, 28);

        ctx.fillStyle = leafMid;
        ctx.fillRect(x + 5, y - 5, 22, 18);
        ctx.fillRect(x + 3, y - 1, 26, 12);
        ctx.fillRect(x + 9, y - 8, 14, 22);

        ctx.fillStyle = leafLight;
        ctx.fillRect(x + 6, y - 6, 12, 8);
        ctx.fillRect(x + 4, y - 1, 10, 6);
        ctx.fillRect(x + 14, y + 2, 10, 6);

        ctx.fillStyle = leafHighlight;
        ctx.fillRect(x + 8, y - 5, 4, 3);
        ctx.fillRect(x + 6, y, 3, 2);

        // Bioluminescent shelf fungi & moss beneath tree roots in fog mode
        if (!isColored) {
          const treePulse = Math.sin(this.tickCount * 0.06 + x * 0.5 + y) * 0.25 + 0.75;
          // Glowing shelf bracket fungus on trunk side
          ctx.fillStyle = `rgba(56, 189, 248, ${0.4 * treePulse})`;
          ctx.fillRect(x + 7, y + 21, 5, 3);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(x + 8, y + 22, 3, 2);
          ctx.fillStyle = '#bae6fd';
          ctx.fillRect(x + 9, y + 22, 2, 1);
          // Bioluminescent root moss
          ctx.fillStyle = `rgba(74, 222, 128, ${0.35 * treePulse})`;
          ctx.fillRect(x + 19, y + 24, 6, 4);
          ctx.fillStyle = '#4ade80';
          ctx.fillRect(x + 20, y + 25, 4, 2);
          ctx.fillStyle = '#a7f3d0';
          ctx.fillRect(x + 21, y + 25, 2, 1);
        }
        break;
      }

      case TILE.FOREST_PINE: {
        // Distinctive Evergreen Pixel Spruce/Pine
        this.fillTileBase(x, y, isColored ? '#386641' : '#334155');

        // Ground shadow
        ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
        ctx.fillRect(x + 6, y + 27, 20, 4);

        // Tree trunk base
        ctx.fillStyle = isColored ? '#451a03' : '#1e293b';
        ctx.fillRect(x + 14, y + 22, 4, 8);

        // Bioluminescent fungi under pine tree in fog mode
        if (!isColored) {
          const pinePulse = Math.sin(this.tickCount * 0.05 + x * 0.3) * 0.25 + 0.75;
          ctx.fillStyle = `rgba(45, 212, 191, ${0.35 * pinePulse})`;
          ctx.fillRect(x + 9, y + 25, 5, 3);
          ctx.fillStyle = '#2dd4bf';
          ctx.fillRect(x + 10, y + 26, 3, 2);
          ctx.fillStyle = '#6ee7b7';
          ctx.fillRect(x + 18, y + 25, 3, 2);
        }

        const pineDark = isColored ? '#064e3b' : '#1e293b';
        const pineMid = isColored ? '#047857' : '#334155';
        const pineLight = isColored ? '#10b981' : '#475569';
        const pineEdge = isColored ? '#6ee7b7' : '#94a3b8';

        // Tier 3 (Bottom wide skirt)
        ctx.fillStyle = pineDark;
        ctx.fillRect(x + 2, y + 16, 28, 7);
        ctx.fillStyle = pineMid;
        ctx.fillRect(x + 4, y + 14, 24, 7);
        ctx.fillStyle = pineLight;
        ctx.fillRect(x + 6, y + 14, 10, 3);
        ctx.fillStyle = pineEdge;
        ctx.fillRect(x + 3, y + 21, 4, 2);
        ctx.fillRect(x + 25, y + 21, 4, 2);

        // Tier 2 (Middle cone)
        ctx.fillStyle = pineDark;
        ctx.fillRect(x + 6, y + 7, 20, 8);
        ctx.fillStyle = pineMid;
        ctx.fillRect(x + 8, y + 5, 16, 8);
        ctx.fillStyle = pineLight;
        ctx.fillRect(x + 9, y + 5, 7, 3);
        ctx.fillStyle = pineEdge;
        ctx.fillRect(x + 6, y + 13, 3, 2);
        ctx.fillRect(x + 23, y + 13, 3, 2);

        // Tier 1 (Top pine spire tip)
        ctx.fillStyle = pineDark;
        ctx.fillRect(x + 11, y - 2, 10, 8);
        ctx.fillStyle = pineMid;
        ctx.fillRect(x + 13, y - 6, 6, 9);
        ctx.fillStyle = pineLight;
        ctx.fillRect(x + 14, y - 6, 2, 4);
        ctx.fillStyle = pineEdge;
        ctx.fillRect(x + 15, y - 7, 2, 2);
        break;
      }

      case TILE.MUSHROOM_PATCH: {
        this.fillTileBase(x, y, isColored ? '#386641' : '#334155');
        // Earthy moss patch
        ctx.fillStyle = isColored ? '#2d5a36' : '#273549';
        ctx.fillRect(x + 4, y + 6, 24, 20);

        // Mushroom 1 (Big Fly-Agaric)
        ctx.fillStyle = isColored ? '#fef3c7' : '#94a3b8';
        ctx.fillRect(x + 8, y + 16, 4, 7);
        ctx.fillStyle = isColored ? '#ef4444' : '#64748b';
        ctx.fillRect(x + 5, y + 11, 10, 6);
        ctx.fillRect(x + 7, y + 9, 6, 3);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 7, y + 10, 2, 2);
        ctx.fillRect(x + 11, y + 13, 2, 2);

        // Mushroom 2 (Small companion)
        ctx.fillStyle = isColored ? '#fef3c7' : '#94a3b8';
        ctx.fillRect(x + 20, y + 19, 3, 5);
        ctx.fillStyle = isColored ? '#f59e0b' : '#64748b';
        ctx.fillRect(x + 18, y + 15, 7, 4);

        // Tumbuhan Bercahaya (Bioluminescence): jamur berpendar redup di mode kabut
        if (!isColored) {
          const shroomPulse = Math.sin(this.tickCount * 0.08 + x * 0.4 + y * 0.3) * 0.25 + 0.75;
          // Pendaran tudung jamur utama (biru toska magis)
          ctx.fillStyle = `rgba(56, 189, 248, ${0.4 * shroomPulse})`;
          ctx.fillRect(x + 3, y + 8, 14, 11);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(x + 5, y + 11, 10, 6);
          ctx.fillRect(x + 7, y + 9, 6, 3);
          ctx.fillStyle = '#bae6fd';
          ctx.fillRect(x + 7, y + 10, 2, 2);
          ctx.fillRect(x + 11, y + 13, 2, 2);

          // Pendaran tudung jamur pendamping (hijau zamrud pudar)
          ctx.fillStyle = `rgba(52, 211, 153, ${0.35 * shroomPulse})`;
          ctx.fillRect(x + 16, y + 13, 11, 8);
          ctx.fillStyle = '#34d399';
          ctx.fillRect(x + 18, y + 15, 7, 4);
          ctx.fillStyle = '#a7f3d0';
          ctx.fillRect(x + 19, y + 16, 2, 2);
        }
        break;
      }

      case TILE.FOUNTAIN: {
        // --- KOLAM AIR MANCUR KOTAK BESAR DENGAN DASAR BERKERIKIL & DETAIL BATU ---
        // Ukuran kolam diperbesar menjadi kolam persegi 68x68 px berarsitektur batu indah
        const fx = x - 18;
        const fy = y - 18;
        const fw = 68;
        const fh = 68;

        // 1. Bayangan dasar kolam pada ubin plaza
        ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
        ctx.fillRect(fx + 2, fy + fh - 4, fw - 4, 7);

        // 2. Dinding Fondasi Luar Kolam Persegi (Detail Batu Kotak)
        const stoneDark = isColored ? '#334155' : '#1e293b';
        const stoneBase = isColored ? '#475569' : '#334155';
        const stoneMid = isColored ? '#64748b' : '#475569';
        const stoneLight = isColored ? '#94a3b8' : '#64748b';
        const stoneHighlight = isColored ? '#cbd5e1' : '#94a3b8';
        const stoneBright = isColored ? '#f1f5f9' : '#cbd5e1';

        // Base block
        ctx.fillStyle = stoneDark;
        ctx.fillRect(fx, fy, fw, fh);

        // Pahat batu bibir kolam persegi (Ashlar coping stones keliling)
        ctx.fillStyle = stoneBase;
        ctx.fillRect(fx + 2, fy + 2, fw - 4, fh - 4);

        // Balok batu bibir atas & bawah (dengan garis pahatan sambungan antar blok batu)
        ctx.fillStyle = stoneMid;
        ctx.fillRect(fx + 4, fy + 4, fw - 8, 7);
        ctx.fillRect(fx + 4, fy + fh - 11, fw - 8, 7);
        ctx.fillRect(fx + 4, fy + 4, 7, fh - 8);
        ctx.fillRect(fx + fw - 11, fy + 4, 7, fh - 8);

        // Detail sambungan balok batu (Chiseled block joints & bevel highlights)
        ctx.fillStyle = stoneDark;
        for (let bx = fx + 16; bx < fx + fw - 12; bx += 12) {
          ctx.fillRect(bx, fy + 4, 1, 7);
          ctx.fillRect(bx, fy + fh - 11, 1, 7);
        }
        for (let by = fy + 16; by < fy + fh - 12; by += 12) {
          ctx.fillRect(fx + 4, by, 7, 1);
          ctx.fillRect(fx + fw - 11, by, 7, 1);
        }

        // Garis tepi terik matahari (Sunlight specular rim) pada tepi luar batu
        ctx.fillStyle = stoneHighlight;
        ctx.fillRect(fx + 2, fy + 2, fw - 4, 2);
        ctx.fillRect(fx + 2, fy + 2, 2, fh - 4);
        ctx.fillStyle = stoneBright;
        ctx.fillRect(fx + 4, fy + 4, fw - 8, 1);
        ctx.fillRect(fx + 4, fy + 4, 1, fh - 8);

        // 3. Empat Pilar Sudut Batu Berukir (Corner Stone Pedestals & Sphere Finials)
        const corners = [
          { cx: fx, cy: fy },
          { cx: fx + fw - 14, cy: fy },
          { cx: fx, cy: fy + fh - 14 },
          { cx: fx + fw - 14, cy: fy + fh - 14 },
        ];

        for (const { cx, cy } of corners) {
          // Tiang sudut persegi bertingkat
          ctx.fillStyle = stoneDark;
          ctx.fillRect(cx, cy, 14, 14);
          ctx.fillStyle = stoneMid;
          ctx.fillRect(cx + 1, cy + 1, 12, 12);
          ctx.fillStyle = stoneLight;
          ctx.fillRect(cx + 2, cy + 2, 10, 10);
          ctx.fillStyle = stoneBright;
          ctx.fillRect(cx + 2, cy + 2, 9, 2);
          ctx.fillRect(cx + 2, cy + 2, 2, 9);

          // Ornamen bola batu bundar di atas pilar sudut (Carved stone sphere finial)
          ctx.fillStyle = stoneDark;
          ctx.fillRect(cx + 4, cy + 4, 6, 6);
          ctx.fillStyle = stoneMid;
          ctx.fillRect(cx + 4, cy + 4, 5, 5);
          ctx.fillStyle = stoneHighlight;
          ctx.fillRect(cx + 5, cy + 5, 3, 3);
          ctx.fillStyle = stoneBright;
          ctx.fillRect(cx + 5, cy + 5, 1, 1);

          // Lumut alami di sela lekukan batu saat sudah berwarna
          if (isColored) {
            ctx.fillStyle = '#3f6212';
            ctx.fillRect(cx + 1, cy + 11, 2, 2);
            ctx.fillRect(cx + 11, cy + 2, 2, 2);
          }
        }

        // 4. Rongga Air Kolam Persegi & Tepi Dalam (Stepped Inner Basin Rim)
        const px = fx + 11;
        const py = fy + 11;
        const pw = fw - 22; // 46x46 px kolam luas
        const ph = fh - 22;

        // Bayangan kedalaman tepi dalam kolam
        ctx.fillStyle = isColored ? '#0f172a' : '#020617';
        ctx.fillRect(px, py, pw, ph);

        // 5. DASAR KOLAM BERKERIKIL (Pebbled Riverbed Basin Floor)
        // Hamparan pasir dan kerikil halus di dasar air yang jernih
        const bedBase = isColored ? '#57412b' : '#1e293b';
        ctx.fillStyle = bedBase;
        ctx.fillRect(px + 1, py + 1, pw - 2, ph - 2);

        // Taburan batu kerikil sungai alami beraneka rona mineral
        const pebbles = [
          // Baris 1
          { ox: 3, oy: 4, w: 4, h: 3, c: isColored ? '#78716c' : '#334155', hi: true },
          { ox: 9, oy: 3, w: 3, h: 4, c: isColored ? '#d97706' : '#475569', hi: false },
          { ox: 14, oy: 5, w: 4, h: 3, c: isColored ? '#cbd5e1' : '#64748b', hi: true },
          { ox: 20, oy: 3, w: 3, h: 3, c: isColored ? '#ca8a04' : '#475569', hi: false },
          { ox: 26, oy: 4, w: 4, h: 4, c: isColored ? '#64748b' : '#334155', hi: true },
          { ox: 32, oy: 3, w: 4, h: 3, c: isColored ? '#b45309' : '#475569', hi: false },
          { ox: 38, oy: 5, w: 3, h: 3, c: isColored ? '#a8a29e' : '#64748b', hi: true },
          // Baris 2
          { ox: 4, oy: 10, w: 3, h: 3, c: isColored ? '#ca8a04' : '#475569', hi: false },
          { ox: 10, oy: 9, w: 4, h: 4, c: isColored ? '#e2e8f0' : '#64748b', hi: true },
          { ox: 31, oy: 9, w: 4, h: 3, c: isColored ? '#78716c' : '#334155', hi: false },
          { ox: 37, oy: 11, w: 4, h: 4, c: isColored ? '#d97706' : '#475569', hi: true },
          // Baris 3
          { ox: 3, oy: 16, w: 4, h: 3, c: isColored ? '#475569' : '#334155', hi: true },
          { ox: 9, oy: 17, w: 3, h: 4, c: isColored ? '#f59e0b' : '#64748b', hi: false },
          { ox: 32, oy: 16, w: 4, h: 4, c: isColored ? '#ca8a04' : '#475569', hi: true },
          { ox: 38, oy: 18, w: 3, h: 3, c: isColored ? '#cbd5e1' : '#64748b', hi: false },
          // Baris 4 (samping tiang tengah)
          { ox: 4, oy: 23, w: 4, h: 4, c: isColored ? '#d97706' : '#475569', hi: true },
          { ox: 38, oy: 24, w: 4, h: 3, c: isColored ? '#64748b' : '#334155', hi: true },
          // Baris 5
          { ox: 3, oy: 29, w: 3, h: 4, c: isColored ? '#a8a29e' : '#64748b', hi: false },
          { ox: 9, oy: 31, w: 4, h: 3, c: isColored ? '#78716c' : '#334155', hi: true },
          { ox: 32, oy: 30, w: 3, h: 4, c: isColored ? '#f59e0b' : '#64748b', hi: false },
          { ox: 37, oy: 29, w: 4, h: 3, c: isColored ? '#d97706' : '#475569', hi: true },
          // Baris 6
          { ox: 4, oy: 36, w: 4, h: 3, c: isColored ? '#ca8a04' : '#475569', hi: true },
          { ox: 10, oy: 37, w: 3, h: 4, c: isColored ? '#e2e8f0' : '#64748b', hi: false },
          { ox: 31, oy: 36, w: 4, h: 4, c: isColored ? '#78716c' : '#334155', hi: true },
          { ox: 37, oy: 37, w: 4, h: 3, c: isColored ? '#b45309' : '#475569', hi: false },
          // Baris 7 (bawah)
          { ox: 3, oy: 41, w: 4, h: 3, c: isColored ? '#64748b' : '#334155', hi: false },
          { ox: 9, oy: 42, w: 3, h: 3, c: isColored ? '#d97706' : '#475569', hi: true },
          { ox: 15, oy: 40, w: 4, h: 3, c: isColored ? '#a8a29e' : '#64748b', hi: false },
          { ox: 21, oy: 41, w: 4, h: 4, c: isColored ? '#f59e0b' : '#64748b', hi: true },
          { ox: 27, oy: 41, w: 3, h: 3, c: isColored ? '#ca8a04' : '#475569', hi: false },
          { ox: 32, oy: 42, w: 4, h: 3, c: isColored ? '#cbd5e1' : '#64748b', hi: true },
          { ox: 38, oy: 41, w: 3, h: 3, c: isColored ? '#78716c' : '#334155', hi: false },
        ];

        for (const p of pebbles) {
          ctx.fillStyle = p.c;
          ctx.fillRect(px + p.ox, py + p.oy, p.w, p.h);
          if (p.hi && isColored) {
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(px + p.ox + 1, py + p.oy + 1, 1, 1);
          }
        }

        // 6. LAPISAN AIR JERNIH (Translucent Pool Water & Light Caustics)
        if (isColored) {
          // Lapisan kebiruan air jernih tembus pandang
          ctx.fillStyle = 'rgba(14, 165, 233, 0.42)';
          ctx.fillRect(px + 1, py + 1, pw - 2, ph - 2);
          ctx.fillStyle = 'rgba(2, 132, 199, 0.22)';
          ctx.fillRect(px + 4, py + 4, pw - 8, ph - 8);

          // Efek bias cahaya matahari di atas kerikil (Animated Sun Caustics)
          const causticPhase = (this.tickCount * 0.08) % (Math.PI * 2);
          const cX1 = Math.floor(Math.sin(causticPhase) * 4);
          const cY1 = Math.floor(Math.cos(causticPhase) * 3);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
          ctx.fillRect(px + 8 + cX1, py + 7 + cY1, 6, 2);
          ctx.fillRect(px + 28 - cX1, py + 8 + cY1, 8, 2);
          ctx.fillRect(px + 6 + cY1, py + 32 + cX1, 8, 2);
          ctx.fillRect(px + 26 + cX1, py + 34 - cY1, 10, 2);

          // Riak air konsentris bergetar lembut
          const wave = Math.floor((this.tickCount * 0.12) % 4);
          ctx.fillStyle = 'rgba(224, 242, 254, 0.55)';
          ctx.fillRect(px + 8 + wave, py + 12, 8, 1);
          ctx.fillRect(px + pw - 18 - wave, py + 13, 8, 1);
          ctx.fillRect(px + 10, py + ph - 14 - wave, 8, 1);
          ctx.fillRect(px + pw - 20, py + ph - 12 + wave, 8, 1);

          // Daun teratai kecil mengapung di sudut kolam
          ctx.fillStyle = '#15803d';
          ctx.fillRect(px + 5, py + 6, 5, 4);
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(px + 6, py + 7, 3, 2);
          ctx.fillStyle = '#f472b6';
          ctx.fillRect(px + 8, py + 6, 2, 2);
        } else {
          // Saat abu-abu belum pulih: Air mancur dalam mode kabut dengan pantulan air berkilau
          ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
          ctx.fillRect(px + 1, py + 1, pw - 2, ph - 2);

          // Lapisan biasan air sejuk berkabut
          ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
          ctx.fillRect(px + 3, py + 3, pw - 6, ph - 6);

          // Riak-riak air mancur yang memantulkan cahaya lembut
          const ripplePhase = Math.floor((this.tickCount * 0.08) % 6);
          ctx.fillStyle = 'rgba(186, 230, 253, 0.28)';
          ctx.fillRect(px + 8 + ripplePhase, py + 6, pw - 16, 2);
          ctx.fillRect(px + 6, py + 14 - ripplePhase, pw - 12, 2);

          // Kilau pendaran bintang di permukaan air kolam berkabut
          const sparklePhase = (this.tickCount * 0.12) % 24;
          if (sparklePhase < 12) {
            const spX = px + 14 + (sparklePhase < 6 ? 0 : 18);
            const spY = py + 8 + (sparklePhase < 6 ? 0 : 10);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(spX, spY, 1, 1);
            ctx.fillStyle = 'rgba(125, 211, 252, 0.8)';
            ctx.fillRect(spX - 1, spY, 3, 1);
            ctx.fillRect(spX, spY - 1, 1, 3);
          }
        }

        // 7. PILAR TENGAH AIR MANCUR BERUKIR (Sculpted Central Stone Fountain Pedestal)
        const cx = fx + 24;
        const cy = fy + 24;
        const cw = 20;
        const ch = 20;

        // Alas pilar tengah bertingkat
        ctx.fillStyle = stoneDark;
        ctx.fillRect(cx - 2, cy + 10, cw + 4, 10);
        ctx.fillStyle = stoneMid;
        ctx.fillRect(cx, cy + 8, cw, 10);
        ctx.fillStyle = stoneLight;
        ctx.fillRect(cx + 2, cy + 6, cw - 4, 10);
        ctx.fillStyle = stoneHighlight;
        ctx.fillRect(cx + 3, cy + 6, cw - 6, 2);

        // Mangkuk tumpahan atas (Upper Scalloped Spill Basin)
        const bx = fx + 19;
        const by = fy + 16;
        const bw = 30;
        const bh = 8;
        ctx.fillStyle = stoneDark;
        ctx.fillRect(bx, by, bw, bh);
        ctx.fillStyle = stoneMid;
        ctx.fillRect(bx + 1, by + 1, bw - 2, bh - 2);
        ctx.fillStyle = stoneHighlight;
        ctx.fillRect(bx + 2, by + 1, bw - 4, 2);
        ctx.fillStyle = stoneBright;
        ctx.fillRect(bx + 4, by, bw - 8, 1);

        // 8. ALIRAN AIR & PANCURAN KRISTAL (Water Cascades & Gushing Geyser)
        if (isColored) {
          const splashFrame = Math.floor((this.tickCount * 0.25) % 4);

          // 4 Pancuran air terjun meluncur dari mangkuk atas ke kolam berkerikil
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(cx + 3, by + bh, cw - 6, 12);
          ctx.fillRect(bx + 1, by + 4, 3, 14);
          ctx.fillRect(bx + bw - 4, by + 4, 3, 14);

          // Lapisan kilau air jernih
          ctx.fillStyle = '#7dd3fc';
          ctx.fillRect(cx + 5, by + bh + 1, cw - 10, 10);
          ctx.fillRect(bx + 2, by + 6, 1, 10);
          ctx.fillRect(bx + bw - 3, by + 6, 1, 10);

          // Percikan busa putih bergejolak di tempat jatuhnya air ke kolam
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(cx + 2 - (splashFrame % 2), by + bh + 11, cw - 4 + (splashFrame % 3), 3);
          ctx.fillRect(bx - 1, by + 16 + (splashFrame % 2), 6, 3);
          ctx.fillRect(bx + bw - 5, by + 16 + ((splashFrame + 1) % 2), 6, 3);

          // Pancuran geyser kristal menjulang tinggi dari tengah mangkuk
          const spoutH = 10 + Math.sin(this.tickCount * 0.24) * 4;
          ctx.fillStyle = '#7dd3fc';
          ctx.fillRect(cx + 8, by - spoutH, 4, spoutH);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(cx + 9, by - spoutH - 1, 2, spoutH);

          // Puncak semburan mahkota air
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(cx + 7, by - spoutH - 3, 6, 3);
          ctx.fillRect(cx + 6, by - spoutH - 1, 8, 2);

          // Butiran embun air beterbangan di udara
          const spray1 = (this.tickCount * 1.8) % 20;
          const spray2 = ((this.tickCount + 10) * 1.6) % 22;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.fillRect(cx + 4 - (this.tickCount % 3), by - 6 - spray1 * 0.4, 2, 2);
          ctx.fillRect(cx + 14 + (this.tickCount % 4), by - 5 - spray2 * 0.4, 2, 2);
          ctx.fillRect(cx + 9, by - spoutH - 5, 2, 2);
        } else {
          // Saat abu-abu belum pulih
          ctx.fillStyle = '#475569';
          ctx.fillRect(cx + 8, by - 3, 4, 3);
        }
        break;
      }

      case TILE.BENCH: {
        // Base ground underneath bench matches surroundings
        if (r !== undefined && c !== undefined && r >= 12 && r <= 16 && c >= 8 && c <= 14) {
          this.drawTile(TILE.PLAZA_BORDER, x, y, isColored, r, c);
        } else {
          this.fillTileBase(x, y, isColored ? '#22c55e' : '#334155');
        }

        // Bench cast shadow
        ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
        ctx.fillRect(x + 3, y + 24, 26, 4);

        // Cast iron black legs
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 4, y + 14, 3, 11);
        ctx.fillRect(x + 25, y + 14, 3, 11);

        // Polished wood backrest
        const woodColor = isColored ? '#a16207' : '#64748b';
        const woodHighlight = isColored ? '#d97706' : '#94a3b8';
        ctx.fillStyle = woodColor;
        ctx.fillRect(x + 2, y + 6, 28, 4);
        ctx.fillRect(x + 2, y + 12, 28, 4);

        // Wood seat slat
        ctx.fillStyle = woodHighlight;
        ctx.fillRect(x + 2, y + 17, 28, 4);
        break;
      }

      case TILE.LAMP_POST: {
        this.fillTileBase(x, y, isColored ? '#94a3b8' : '#475569');

        // Cast iron post
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 12, y + 25, 8, 4);
        ctx.fillRect(x + 14, y + 10, 4, 16);
        ctx.fillRect(x + 11, y + 9, 10, 2);
        ctx.fillRect(x + 12, y + 2, 8, 8);

        // Lampu taman: Menyala saat sedang kabut, atau saat mode malam tiba di pedesaan
        const isLampLit = !this.isAllMissionsCompleted || this.timeOfDayProgress > 0.15;

        if (isLampLit) {
          // Lampu taman menyala dengan pendaran cahaya hangat
          const nightGlow = !this.isAllMissionsCompleted ? 1.0 : this.timeOfDayProgress;
          const pulse = Math.sin(this.tickCount * 0.08 + (x + y) * 0.05);
          const haloAlpha = (0.2 + pulse * 0.05) * Math.max(0.4, nightGlow);

          // Pendaran radial gradien memancar menembus lapisan kabut & kegelapan malam
          const gradient = ctx.createRadialGradient(x + 16, y + 6, 2, x + 16, y + 6, 24);
          gradient.addColorStop(0, `rgba(254, 240, 138, ${haloAlpha * 1.6})`);
          gradient.addColorStop(0.5, `rgba(245, 158, 11, ${haloAlpha * 0.8})`);
          gradient.addColorStop(1, 'rgba(245, 158, 11, 0)');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x + 16, y + 6, 24, 0, Math.PI * 2);
          ctx.fill();

          // Kaca lentera menyala kuning keemasan terang
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(x + 14, y + 4, 4, 5);

          // Inti filamen lampu putih berkilau
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x + 15, y + 5, 2, 3);
        } else {
          // Lampu taman dimatikan di bawah terang sinar matahari siang hari
          ctx.fillStyle = isColored ? '#94a3b8' : '#64748b';
          ctx.fillRect(x + 14, y + 4, 4, 5);

          // Pantulan kilau kaca lentera siang hari
          ctx.fillStyle = isColored ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.2)';
          ctx.fillRect(x + 14, y + 4, 2, 2);
        }
        break;
      }

      case TILE.SIGNPOST: {
        // 1. Natural Grass Verge beside stone path
        this.fillTileBase(x, y, isColored ? '#22c55e' : '#334155');

        if (isColored) {
          // Lush grass blades and texture
          ctx.fillStyle = '#4ade80';
          ctx.fillRect(x + 2, y + 4, 2, 2);
          ctx.fillRect(x + 26, y + 6, 2, 2);
          ctx.fillRect(x + 3, y + 26, 2, 3);
          ctx.fillRect(x + 27, y + 25, 2, 2);
        }

        // 2. Soft ground shadow
        ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
        ctx.beginPath();
        ctx.ellipse(x + 16, y + 28, 9, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // 3. Cobblestone anchor ring & earthen mound
        if (isColored) {
          // Rich soil mound
          ctx.fillStyle = '#78350f';
          ctx.fillRect(x + 11, y + 26, 10, 4);
          ctx.fillStyle = '#92400e';
          ctx.fillRect(x + 12, y + 25, 8, 2);

          // Natural stone base pebbles
          ctx.fillStyle = '#475569';
          ctx.fillRect(x + 9, y + 27, 3, 2);
          ctx.fillRect(x + 20, y + 27, 3, 2);
          ctx.fillRect(x + 13, y + 28, 3, 2);
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(x + 10, y + 27, 1, 1);
          ctx.fillRect(x + 21, y + 27, 1, 1);

          // Wildflower & moss accent
          ctx.fillStyle = '#15803d';
          ctx.fillRect(x + 11, y + 25, 2, 2);
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(x + 8, y + 26, 2, 2);
        } else {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(x + 11, y + 26, 10, 4);
          ctx.fillStyle = '#334155';
          ctx.fillRect(x + 9, y + 27, 3, 2);
          ctx.fillRect(x + 20, y + 27, 3, 2);
        }

        // 4. Carved Weathered Timber Pillar
        const postShadow = isColored ? '#451a03' : '#1e293b';
        const postCore = isColored ? '#78350f' : '#334155';
        const postHighlight = isColored ? '#b45309' : '#64748b';

        ctx.fillStyle = postCore;
        ctx.fillRect(x + 14, y + 7, 4, 20);
        // Left shadow bevel
        ctx.fillStyle = postShadow;
        ctx.fillRect(x + 14, y + 7, 1, 20);
        // Right sunlit rim
        ctx.fillStyle = postHighlight;
        ctx.fillRect(x + 17, y + 7, 1, 20);

        // Pyramid Post Cap & Iron Finial
        ctx.fillStyle = isColored ? '#92400e' : '#475569';
        ctx.fillRect(x + 13, y + 6, 6, 2);
        ctx.fillStyle = isColored ? '#b45309' : '#64748b';
        ctx.fillRect(x + 14, y + 5, 4, 1);
        ctx.fillStyle = '#0f172a'; // Iron tip
        ctx.fillRect(x + 15, y + 3, 2, 2);

        // 5. Upper Directional Sign Plank (Pointing Left / West towards Forest / Village)
        const signTopWood = isColored ? '#d97706' : '#64748b';
        const signTopLight = isColored ? '#fde047' : '#94a3b8';
        const signTopDark = isColored ? '#92400e' : '#334155';

        // Plank body (17px wide, 7px tall, x: 4..21, y: 7..13)
        ctx.fillStyle = signTopWood;
        ctx.fillRect(x + 4, y + 7, 17, 7);
        // Pointed chevron arrow tip on left side
        ctx.fillRect(x + 2, y + 9, 2, 3);
        ctx.fillRect(x + 1, y + 10, 1, 1);
        // Highlight top rim
        ctx.fillStyle = signTopLight;
        ctx.fillRect(x + 4, y + 7, 17, 1);
        ctx.fillRect(x + 2, y + 9, 2, 1);
        // Bottom bevel shadow
        ctx.fillStyle = signTopDark;
        ctx.fillRect(x + 4, y + 13, 17, 1);
        ctx.fillRect(x + 2, y + 11, 2, 1);

        // Iron mount bracket & square bolts on upper plank
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 14, y + 7, 4, 7);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(x + 15, y + 8, 1, 1);
        ctx.fillRect(x + 15, y + 12, 1, 1);

        // Carved Pictogram & Engraved Runes on upper plank
        if (isColored) {
          // Emerald Pine Tree / Leaf symbol for North Forest
          ctx.fillStyle = '#15803d';
          ctx.fillRect(x + 5, y + 9, 3, 3);
          ctx.fillStyle = '#4ade80';
          ctx.fillRect(x + 6, y + 8, 1, 1);
          // Engraved line representing written village name
          ctx.fillStyle = '#78350f';
          ctx.fillRect(x + 9, y + 10, 4, 1);
        }

        // 6. Lower Directional Sign Plank (Pointing Right / East towards Alun-Alun / Plaza)
        const signBotWood = isColored ? '#b45309' : '#475569';
        const signBotLight = isColored ? '#f59e0b' : '#64748b';
        const signBotDark = isColored ? '#451a03' : '#1e293b';

        // Plank body (17px wide, 7px tall, x: 11..28, y: 14..20)
        ctx.fillStyle = signBotWood;
        ctx.fillRect(x + 11, y + 14, 17, 7);
        // Pointed chevron arrow tip on right side
        ctx.fillRect(x + 28, y + 16, 2, 3);
        ctx.fillRect(x + 30, y + 17, 1, 1);
        // Highlight top rim
        ctx.fillStyle = signBotLight;
        ctx.fillRect(x + 11, y + 14, 17, 1);
        ctx.fillRect(x + 28, y + 16, 2, 1);
        // Bottom bevel shadow
        ctx.fillStyle = signBotDark;
        ctx.fillRect(x + 11, y + 20, 17, 1);
        ctx.fillRect(x + 28, y + 18, 2, 1);

        // Iron mount bracket & square bolts on lower plank
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 14, y + 14, 4, 7);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(x + 16, y + 15, 1, 1);
        ctx.fillRect(x + 16, y + 19, 1, 1);

        // Carved Pictogram & Engraved Runes on lower plank
        if (isColored) {
          // Golden Sun / Fountain symbol for Plaza
          ctx.fillStyle = '#eab308';
          ctx.fillRect(x + 23, y + 16, 3, 3);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(x + 24, y + 17, 1, 1);
          // Engraved line
          ctx.fillStyle = '#451a03';
          ctx.fillRect(x + 19, y + 17, 3, 1);
        }

        // 7. Hanging Brass Lantern on Forged Iron Scroll Arm
        ctx.fillStyle = '#0f172a'; // Iron scroll arm
        ctx.fillRect(x + 18, y + 7, 5, 1);
        ctx.fillRect(x + 22, y + 8, 1, 2);

        if (isColored) {
          // Warm lantern glow
          const lanternFlicker = Math.sin(this.tickCount * 0.12 + (x + y)) * 0.15;
          const lanternGradient = ctx.createRadialGradient(x + 23, y + 12, 1, x + 23, y + 12, 8);
          lanternGradient.addColorStop(0, `rgba(254, 240, 138, ${0.45 + lanternFlicker})`);
          lanternGradient.addColorStop(1, 'rgba(245, 158, 11, 0)');
          ctx.fillStyle = lanternGradient;
          ctx.beginPath();
          ctx.arc(x + 23, y + 12, 8, 0, Math.PI * 2);
          ctx.fill();

          // Lantern hood & base
          ctx.fillStyle = '#78350f';
          ctx.fillRect(x + 21, y + 10, 4, 1);
          ctx.fillStyle = '#fef08a'; // Glowing glass
          ctx.fillRect(x + 22, y + 11, 2, 2);
          ctx.fillStyle = '#ffffff'; // Filament sparkle
          ctx.fillRect(x + 22, y + 11, 1, 1);
          ctx.fillStyle = '#78350f';
          ctx.fillRect(x + 21, y + 13, 4, 1);
        } else {
          ctx.fillStyle = '#334155';
          ctx.fillRect(x + 21, y + 10, 4, 4);
        }

        // 8. Climbing Ivy Vine on Post Base
        if (isColored) {
          ctx.fillStyle = '#15803d';
          ctx.fillRect(x + 13, y + 21, 2, 2);
          ctx.fillRect(x + 14, y + 23, 2, 2);
          ctx.fillRect(x + 17, y + 24, 2, 2);
          ctx.fillStyle = '#4ade80';
          ctx.fillRect(x + 13, y + 21, 1, 1);
          ctx.fillRect(x + 17, y + 24, 1, 1);
        }
        break;
      }

      case TILE.FLOWER_CART: {
        this.fillTileBase(x, y, isColored ? '#94a3b8' : '#475569');

        // Wooden cart bed
        ctx.fillStyle = isColored ? '#78350f' : '#334155';
        ctx.fillRect(x + 4, y + 10, 24, 10);

        // Cart wheels
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 4, y + 18, 5, 8);
        ctx.fillRect(x + 23, y + 18, 5, 8);

        // Awning roof
        const stripe = isColored ? '#ef4444' : '#475569';
        ctx.fillStyle = stripe;
        ctx.fillRect(x + 2, y + 2, 28, 5);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 8, y + 2, 4, 5);
        ctx.fillRect(x + 20, y + 2, 4, 5);

        // Buckets of colorful flowers inside cart
        if (isColored) {
          ctx.fillStyle = '#f43f5e';
          ctx.fillRect(x + 6, y + 8, 4, 4);
          ctx.fillStyle = '#eab308';
          ctx.fillRect(x + 14, y + 8, 4, 4);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(x + 22, y + 8, 4, 4);
        }
        break;
      }

      case TILE.PLAZA_MOSAIC: {
        // --- POLA UBIN PLAZA KHAS & ARTISTIK (Artistic Sandstone & Terracotta Mosaic) ---
        // Satu kesatuan lantai plaza mewah khas 16-bit RPG tanpa garis petak hitam
        const isAlternate = (r + c) % 2 === 0;

        // 1. Dasar ubin batu pasir hangat tanpa sekat hitam (+1px overdraw seamless)
        const baseColor = isColored ? (isAlternate ? '#e7dbc9' : '#dfd1be') : (isAlternate ? '#475569' : '#3d495a');
        this.fillTileBase(x, y, baseColor);

        // 2. Aksen halus belah ketupat mosaik yang menyatu mulus antar ubin
        const stoneInlay = isColored ? '#f5ebe0' : '#64748b';
        const inlayShadow = isColored ? '#c8b7a6' : '#334155';
        ctx.fillStyle = inlayShadow;
        ctx.fillRect(x + 6, y + 6, 20, 20);
        ctx.fillStyle = stoneInlay;
        ctx.fillRect(x + 7, y + 7, 18, 18);

        // Belah ketupat mosaik bagian dalam (Decorative diamond star)
        const starColor = isColored ? (isAlternate ? '#2563eb' : '#d97706') : '#475569';
        const starCore = isColored ? (isAlternate ? '#60a5fa' : '#fcd34d') : '#94a3b8';
        const starCenter = isColored ? '#ffffff' : '#cbd5e1';

        ctx.fillStyle = starColor;
        ctx.beginPath();
        ctx.moveTo(x + 16, y + 9);
        ctx.lineTo(x + 23, y + 16);
        ctx.lineTo(x + 16, y + 23);
        ctx.lineTo(x + 9, y + 16);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = starCore;
        ctx.beginPath();
        ctx.moveTo(x + 16, y + 11);
        ctx.lineTo(x + 21, y + 16);
        ctx.lineTo(x + 16, y + 21);
        ctx.lineTo(x + 11, y + 16);
        ctx.closePath();
        ctx.fill();

        // Inti permata tengah
        ctx.fillStyle = starCenter;
        ctx.fillRect(x + 15, y + 15, 2, 2);

        // 4 Sudut mosaik keramik berukir halus (warna lembut, bukan garis hitam)
        const dotColor = isColored ? '#b45309' : '#334155';
        ctx.fillStyle = dotColor;
        ctx.fillRect(x + 6, y + 6, 2, 2);
        ctx.fillRect(x + 24, y + 6, 2, 2);
        ctx.fillRect(x + 6, y + 24, 2, 2);
        ctx.fillRect(x + 24, y + 24, 2, 2);

        // Ornamen Mode Kabut: Pantulan Lantai Basah, Retakan Lapuk & Lumut Berpendar
        if (!isColored) {
          // 1. Pantulan di Permukaan Basah: genangan air dingin pada ubin batu plaza
          const hasPlazaPuddle = (r * 3 + c * 5) % 3 === 0;
          if (hasPlazaPuddle) {
            ctx.fillStyle = 'rgba(224, 242, 254, 0.16)';
            ctx.fillRect(x + 8, y + 8, 16, 16);
            ctx.fillStyle = 'rgba(186, 230, 253, 0.22)';
            ctx.fillRect(x + 11, y + 11, 10, 10);
            // Kilau cahaya pantulan lembut
            ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.fillRect(x + 12, y + 10, 2, 1);
            ctx.fillRect(x + 18, y + 14, 1, 1);
          }

          // 2. Retakan mikro ubin lapuk
          ctx.fillStyle = '#1e293b';
          if ((r + c) % 2 === 0) {
            ctx.fillRect(x + 7, y + 14, 4, 1);
            ctx.fillRect(x + 10, y + 15, 1, 3);
          }

          // 3. Tumbuhan bercahaya: pendaran lumut redup di sudut mosaik
          if ((r * 9 + c * 7) % 4 === 0) {
            const bioPulse = Math.sin(this.tickCount * 0.07 + r * 2 + c) * 0.25 + 0.75;
            ctx.fillStyle = `rgba(45, 212, 191, ${0.35 * bioPulse})`;
            ctx.fillRect(x + 22, y + 22, 4, 4);
            ctx.fillStyle = '#2dd4bf';
            ctx.fillRect(x + 23, y + 23, 2, 2);
            ctx.fillStyle = '#a7f3d0';
            ctx.fillRect(x + 24, y + 23, 1, 1);
          }
        }
        break;
      }

      case TILE.PLAZA_BORDER: {
        // --- BINGKAI BATU GRANIT TEPI PLAZA (Chiseled Granite Plaza Curbing) ---
        // Menyatu mulus tanpa garis kotak hitam
        const curbBase = isColored ? '#475569' : '#334155';
        const curbMid = isColored ? '#64748b' : '#475569';
        const curbLight = isColored ? '#94a3b8' : '#64748b';
        const curbHighlight = isColored ? '#cbd5e1' : '#94a3b8';

        this.fillTileBase(x, y, curbBase);
        ctx.fillStyle = curbMid;
        ctx.fillRect(x + 2, y + 2, TILE_SIZE + 1 - 4, TILE_SIZE + 1 - 4);
        ctx.fillStyle = curbLight;
        ctx.fillRect(x + 3, y + 3, TILE_SIZE + 1 - 6, TILE_SIZE + 1 - 6);
        ctx.fillStyle = curbHighlight;
        ctx.fillRect(x + 3, y + 3, TILE_SIZE + 1 - 6, 2);
        ctx.fillRect(x + 3, y + 3, 2, TILE_SIZE + 1 - 6);

        // Daun semanggi / lumut alami di pinggir batu
        if (isColored) {
          ctx.fillStyle = '#15803d';
          ctx.fillRect(x + 2, y + 26, 3, 3);
          ctx.fillRect(x + 26, y + 2, 3, 3);
        } else {
          // Mode kabut: Lumut abu-abu lapuk & pendaran lumut bertahan hidup
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(x + 2, y + 26, 4, 3);
          ctx.fillStyle = '#475569';
          ctx.fillRect(x + 3, y + 26, 2, 2);

          // Pendaran lumut redup di sudut batu
          const curbPulse = Math.sin(this.tickCount * 0.06 + r + c * 1.5) * 0.25 + 0.75;
          ctx.fillStyle = `rgba(74, 222, 128, ${0.35 * curbPulse})`;
          ctx.fillRect(x + 24, y + 3, 5, 4);
          ctx.fillStyle = '#4ade80';
          ctx.fillRect(x + 25, y + 4, 3, 2);
          ctx.fillStyle = '#a7f3d0';
          ctx.fillRect(x + 26, y + 4, 1, 1);
        }
        break;
      }

      case TILE.FENCE: {
        // --- PAGAR KAYU RUSTIK DETAIL (Detailed Rustic Timber Fence) ---
        // Latar rumput
        this.fillTileBase(x, y, isColored ? '#386641' : '#334155');

        // Bayangan pagar di atas tanah
        ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
        ctx.fillRect(x, y + 26, TILE_SIZE + 1, 5);

        // Warna kayu berserat alami
        const woodDark = isColored ? '#78350f' : '#1e293b';
        const woodBase = isColored ? '#92400e' : '#334155';
        const woodLight = isColored ? '#b45309' : '#475569';
        const woodHighlight = isColored ? '#d97706' : '#64748b';

        // 1. Dua balok palang horisontal (Horizontal cross rails)
        // Palang atas menyambung mulus (+1px)
        ctx.fillStyle = woodDark;
        ctx.fillRect(x, y + 11, TILE_SIZE + 1, 5);
        ctx.fillStyle = woodBase;
        ctx.fillRect(x, y + 12, TILE_SIZE + 1, 3);
        ctx.fillStyle = woodHighlight;
        ctx.fillRect(x, y + 11, TILE_SIZE + 1, 1);

        // Palang bawah menyambung mulus (+1px)
        ctx.fillStyle = woodDark;
        ctx.fillRect(x, y + 21, TILE_SIZE + 1, 5);
        ctx.fillStyle = woodBase;
        ctx.fillRect(x, y + 22, TILE_SIZE + 1, 3);
        ctx.fillStyle = woodHighlight;
        ctx.fillRect(x, y + 21, TILE_SIZE + 1, 1);

        // 2. Tiga tiang pagar vertikal berpucuk lancip (Pointed vertical pickets)
        for (let i = 0; i < 3; i++) {
          const px = x + 4 + i * 10;
          // Bayangan tiang
          ctx.fillStyle = woodDark;
          ctx.fillRect(px, y + 7, 5, 20);
          // Batang tiang
          ctx.fillStyle = woodBase;
          ctx.fillRect(px + 1, y + 7, 3, 19);
          // Pucuk lancip tiang
          ctx.fillStyle = woodLight;
          ctx.fillRect(px + 1, y + 5, 3, 2);
          ctx.fillStyle = woodHighlight;
          ctx.fillRect(px + 2, y + 4, 1, 2);

          // Paku besi tempa hitam pada persilangan kayu
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(px + 2, y + 13, 2, 2);
          ctx.fillRect(px + 2, y + 23, 2, 2);
          ctx.fillStyle = '#475569';
          ctx.fillRect(px + 2, y + 13, 1, 1);
        }

        // 3. Sulur tanaman liar merambat pada tiang (Wild climbing ivy)
        if (isColored) {
          ctx.fillStyle = '#15803d';
          ctx.fillRect(x + 3, y + 16, 2, 8);
          ctx.fillRect(x + 5, y + 18, 3, 2);
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(x + 6, y + 17, 2, 2);
          ctx.fillRect(x + 2, y + 22, 2, 2);
        } else {
          // Efek Embun Beku (Frost) pada pagar di mode kabut
          // Kristal embun beku tipis pada puncak 3 tiang pagar lancip
          ctx.fillStyle = 'rgba(224, 242, 254, 0.9)';
          for (let i = 0; i < 3; i++) {
            const px = x + 4 + i * 10;
            ctx.fillRect(px + 2, y + 3, 1, 2);
            ctx.fillRect(px + 1, y + 5, 3, 1);
          }
          // Lapisan embun beku sepanjang tepi palang atas
          ctx.fillRect(x, y + 11, TILE_SIZE + 1, 1);
          ctx.fillStyle = '#f0fdf4';
          ctx.fillRect(x + 3, y + 10, 2, 1);
          ctx.fillRect(x + 14, y + 10, 3, 1);
          ctx.fillRect(x + 24, y + 10, 2, 1);
          // Embun beku pada palang bawah
          ctx.fillStyle = 'rgba(224, 242, 254, 0.75)';
          ctx.fillRect(x, y + 21, TILE_SIZE + 1, 1);
          ctx.fillRect(x + 7, y + 20, 2, 1);
          ctx.fillRect(x + 18, y + 20, 2, 1);
        }
        break;
      }

      case TILE.SECRET_TREE: {
        // Grand 64x64 Ancient Sacred Banyan Tree
        const tx = x - 16;
        const ty = y - 16;
        const tw = TILE_SIZE + 32;
        const th = TILE_SIZE + 32;

        this.fillTileBase(x, y, isColored ? '#386641' : '#334155');

        // Ground mystical circle
        ctx.fillStyle = 'rgba(250, 204, 21, 0.2)';
        ctx.fillRect(tx + 6, ty + th - 12, tw - 12, 10);

        // Knotted Golden Bark Trunk
        ctx.fillStyle = isColored ? '#78350f' : '#1e293b';
        ctx.fillRect(tx + 22, ty + 24, 20, 28);
        ctx.fillStyle = isColored ? '#d97706' : '#334155';
        ctx.fillRect(tx + 18, ty + 38, 8, 14);
        ctx.fillRect(tx + 38, ty + 38, 8, 14);

        // Ancient golden rune glowing on trunk
        if (isColored) {
          const glow = (Math.sin(this.tickCount * 0.1) + 1) * 0.5;
          ctx.fillStyle = `rgba(253, 224, 71, ${0.4 + glow * 0.6})`;
          ctx.fillRect(tx + 28, ty + 32, 8, 2);
          ctx.fillRect(tx + 31, ty + 28, 2, 10);
        }

        // Tiered Majestic Pixel Foliage
        const fDark = isColored ? '#14532d' : '#1e293b';
        const fMid = isColored ? '#15803d' : '#334155';
        const fGold = isColored ? '#ca8a04' : '#475569';
        const fGleam = isColored ? '#fde047' : '#94a3b8';

        ctx.fillStyle = fDark;
        ctx.fillRect(tx + 4, ty + 2, tw - 8, 28);
        ctx.fillRect(tx + 8, ty - 6, tw - 16, 36);

        ctx.fillStyle = fMid;
        ctx.fillRect(tx + 8, ty + 4, tw - 16, 24);
        ctx.fillRect(tx + 12, ty - 2, tw - 24, 30);

        ctx.fillStyle = fGold;
        ctx.fillRect(tx + 10, ty + 2, 16, 12);
        ctx.fillRect(tx + 34, ty + 8, 14, 10);

        ctx.fillStyle = fGleam;
        ctx.fillRect(tx + 14, ty + 4, 6, 4);
        ctx.fillRect(tx + 36, ty + 10, 6, 4);
        break;
      }

      case TILE.FARMLAND_SOIL: {
        // Tilled dark rich loam beds with horizontal furrows
        const soilBase = isColored ? '#3f1d0b' : '#1e293b';
        const furrowDark = isColored ? '#291004' : '#0f172a';
        const ridgeLight = isColored ? '#78350f' : '#334155';
        this.fillTileBase(x, y, soilBase);

        // Horizontal tilled furrows with soil clumps connecting seamlessly (+1px)
        for (let row = 0; row < 4; row++) {
          const fy = y + 2 + row * 7;
          ctx.fillStyle = furrowDark;
          ctx.fillRect(x, fy + 4, TILE_SIZE + 1, 2);
          ctx.fillStyle = ridgeLight;
          ctx.fillRect(x, fy, TILE_SIZE + 1, 3);
          // Soil crumbs
          ctx.fillStyle = isColored ? '#92400e' : '#475569';
          ctx.fillRect(x + 4 + (row * 9) % 20, fy + 1, 2, 2);
          ctx.fillRect(x + 16 + (row * 13) % 12, fy + 1, 3, 2);
        }
        break;
      }

      case TILE.CROP_CARROT: {
        // Tilled soil base
        const soilBase = isColored ? '#3f1d0b' : '#1e293b';
        const furrowDark = isColored ? '#291004' : '#0f172a';
        const ridgeLight = isColored ? '#78350f' : '#334155';
        this.fillTileBase(x, y, soilBase);
        ctx.fillStyle = furrowDark;
        ctx.fillRect(x, y + 14, TILE_SIZE + 1, 2);
        ctx.fillStyle = ridgeLight;
        ctx.fillRect(x, y + 8, TILE_SIZE + 1, 3);

        // 3 Ripe Carrots with feathery green tops swaying
        const carrotPositions = [
          { cx: x + 4, cy: y + 10 },
          { cx: x + 14, cy: y + 8 },
          { cx: x + 24, cy: y + 11 },
        ];

        const leafSway = Math.floor(Math.sin(this.tickCount * 0.1 + x * 0.2) * 1.5);

        for (const { cx, cy } of carrotPositions) {
          if (isColored) {
            // Orange carrot crown poking through soil
            ctx.fillStyle = '#ea580c';
            ctx.fillRect(cx + 1, cy + 8, 4, 3);
            ctx.fillStyle = '#f97316';
            ctx.fillRect(cx + 2, cy + 9, 2, 2);

            // Feathery green carrot leaves
            ctx.fillStyle = '#15803d';
            ctx.fillRect(cx + 2 + leafSway, cy + 3, 2, 6);
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(cx + leafSway, cy + 1, 2, 4);
            ctx.fillRect(cx + 4 + leafSway, cy + 2, 2, 4);
            ctx.fillStyle = '#86efac';
            ctx.fillRect(cx + 1 + leafSway, cy, 2, 2);
          } else {
            ctx.fillStyle = '#475569';
            ctx.fillRect(cx + 1, cy + 8, 4, 3);
            ctx.fillStyle = '#64748b';
            ctx.fillRect(cx + 2, cy + 2, 2, 6);
          }
        }
        break;
      }

      case TILE.CROP_CABBAGE: {
        // Tilled soil base
        const soilBase = isColored ? '#3f1d0b' : '#1e293b';
        this.fillTileBase(x, y, soilBase);
        ctx.fillStyle = isColored ? '#291004' : '#0f172a';
        ctx.fillRect(x, y + 16, TILE_SIZE + 1, 2);

        // 2 Big Round Crisp Cabbages in the garden patch
        const cabbages = [
          { cx: x + 4, cy: y + 6 },
          { cx: x + 18, cy: y + 14 },
        ];

        for (const { cx, cy } of cabbages) {
          if (isColored) {
            // Dark outer curling leaves
            ctx.fillStyle = '#14532d';
            ctx.fillRect(cx, cy + 2, 10, 8);
            ctx.fillRect(cx + 2, cy, 8, 10);

            // Medium green head
            ctx.fillStyle = '#16a34a';
            ctx.fillRect(cx + 1, cy + 1, 8, 8);

            // Crisp pale heart center
            ctx.fillStyle = '#86efac';
            ctx.fillRect(cx + 3, cy + 3, 4, 4);
            ctx.fillStyle = '#dcfce7';
            ctx.fillRect(cx + 4, cy + 4, 2, 2);

            // Dewdrop glint
            if (this.tickCount % 40 < 20) {
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(cx + 6, cy + 2, 1, 1);
            }
          } else {
            ctx.fillStyle = '#334155';
            ctx.fillRect(cx, cy + 2, 10, 8);
            ctx.fillStyle = '#475569';
            ctx.fillRect(cx + 2, cy + 2, 6, 6);
          }
        }
        break;
      }

      case TILE.CROP_WHEAT: {
        // Warm dry earth base
        this.fillTileBase(x, y, isColored ? '#451a03' : '#1e293b');

        // Dense Golden Wheat stalks waving in summer wind
        const wind = Math.floor(Math.sin(this.tickCount * 0.12 + (x + y) * 0.1) * 2);

        if (isColored) {
          // Shadow under stalks
          ctx.fillStyle = '#291004';
          ctx.fillRect(x + 2, y + 26, 28, 4);

          // Wheat stalks & golden grain heads
          const stalks = [3, 8, 13, 18, 23, 27];
          for (let i = 0; i < stalks.length; i++) {
            const sx = x + stalks[i];
            const stalkH = 18 + (i % 3) * 3;
            const grainY = y + 28 - stalkH;

            // Stalk stem
            ctx.fillStyle = '#ca8a04';
            ctx.fillRect(sx + Math.floor(wind * 0.5), grainY + 6, 1, stalkH - 6);

            // Golden Grain Head
            ctx.fillStyle = '#eab308';
            ctx.fillRect(sx - 1 + wind, grainY, 3, 8);
            ctx.fillStyle = '#fde047';
            ctx.fillRect(sx + wind, grainY, 1, 7);
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(sx + wind, grainY - 1, 1, 2); // awn/whisker
          }
        } else {
          ctx.fillStyle = '#334155';
          ctx.fillRect(x + 4, y + 8, 24, 18);
          ctx.fillStyle = '#475569';
          ctx.fillRect(x + 6, y + 4, 20, 8);
        }
        break;
      }

      case TILE.WATER_WELL: {
        // Base grass/stone surrounding
        this.fillTileBase(x, y, isColored ? '#386641' : '#334155');

        // Stone well shadow
        ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
        ctx.fillRect(x + 2, y + 24, 28, 6);

        // Circular stone masonry basin
        const stoneDark = isColored ? '#475569' : '#1e293b';
        const stoneMid = isColored ? '#64748b' : '#334155';
        const stoneLight = isColored ? '#94a3b8' : '#475569';

        ctx.fillStyle = stoneDark;
        ctx.fillRect(x + 4, y + 14, 24, 13);
        ctx.fillStyle = stoneMid;
        ctx.fillRect(x + 5, y + 15, 22, 11);
        ctx.fillStyle = stoneLight;
        ctx.fillRect(x + 6, y + 14, 20, 2);

        // Deep water pool inside well
        ctx.fillStyle = '#0369a1';
        ctx.fillRect(x + 8, y + 16, 16, 8);
        ctx.fillStyle = isColored ? '#38bdf8' : '#64748b';
        const sparkle = Math.sin(this.tickCount * 0.15) > 0 ? 1 : 0;
        ctx.fillRect(x + 12 + sparkle, y + 18, 3, 2);

        // Wooden roof support pillars
        const woodColor = isColored ? '#78350f' : '#334155';
        ctx.fillStyle = woodColor;
        ctx.fillRect(x + 5, y + 2, 3, 14);
        ctx.fillRect(x + 24, y + 2, 3, 14);

        // Wooden well crank and rope
        ctx.fillStyle = '#d97706';
        ctx.fillRect(x + 8, y + 5, 16, 2);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(x + 14, y + 7, 2, 7); // rope
        ctx.fillStyle = '#b45309';
        ctx.fillRect(x + 13, y + 12, 4, 3); // bucket

        // Peaked shingle well canopy
        ctx.fillStyle = isColored ? '#991b1b' : '#334155';
        ctx.fillRect(x + 2, y - 2, 28, 5);
        ctx.fillStyle = isColored ? '#b91c1c' : '#475569';
        ctx.fillRect(x + 6, y - 5, 20, 4);
        ctx.fillStyle = isColored ? '#ef4444' : '#64748b';
        ctx.fillRect(x + 12, y - 7, 8, 3);
        break;
      }

      case TILE.SCARECROW: {
        // Farmland base
        this.fillTileBase(x, y, isColored ? '#3f1d0b' : '#1e293b');

        // Ground shadow
        ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
        ctx.fillRect(x + 8, y + 27, 16, 4);

        // Wooden cross post
        ctx.fillStyle = isColored ? '#78350f' : '#334155';
        ctx.fillRect(x + 14, y + 6, 4, 22);
        ctx.fillRect(x + 4, y + 13, 24, 3);

        // Flannel Shirt (Red & Blue Patchwork)
        ctx.fillStyle = isColored ? '#ef4444' : '#475569';
        ctx.fillRect(x + 11, y + 11, 10, 11);
        ctx.fillStyle = isColored ? '#3b82f6' : '#334155';
        ctx.fillRect(x + 6, y + 12, 6, 4);
        ctx.fillRect(x + 20, y + 12, 6, 4);

        // Straw tufts spilling from wrists & hem
        ctx.fillStyle = isColored ? '#fef08a' : '#94a3b8';
        ctx.fillRect(x + 3, y + 13, 3, 2);
        ctx.fillRect(x + 26, y + 13, 3, 2);
        ctx.fillRect(x + 13, y + 22, 6, 3);

        // Burlap head with button eyes
        ctx.fillStyle = isColored ? '#fef3c7' : '#cbd5e1';
        ctx.fillRect(x + 12, y + 4, 8, 7);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 14, y + 6, 1, 2);
        ctx.fillRect(x + 17, y + 6, 1, 2);
        ctx.fillRect(x + 15, y + 9, 2, 1); // smile stitch

        // Conical Farmer's Caping Hat
        ctx.fillStyle = isColored ? '#b45309' : '#334155';
        ctx.fillRect(x + 7, y + 2, 18, 3);
        ctx.fillStyle = isColored ? '#d97706' : '#475569';
        ctx.fillRect(x + 10, y - 1, 12, 3);
        ctx.fillStyle = isColored ? '#f59e0b' : '#64748b';
        ctx.fillRect(x + 13, y - 3, 6, 3);
        ctx.fillRect(x + 15, y - 4, 2, 2);
        break;
      }

      case TILE.HAY_BALE: {
        this.fillTileBase(x, y, isColored ? '#386641' : '#334155');

        // Ground shadow
        ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
        ctx.fillRect(x + 3, y + 24, 26, 6);

        // Golden cylindrical straw bale
        const strawDark = isColored ? '#a16207' : '#334155';
        const strawMid = isColored ? '#ca8a04' : '#475569';
        const strawLight = isColored ? '#eab308' : '#64748b';
        const strawHighlight = isColored ? '#fef08a' : '#94a3b8';

        ctx.fillStyle = strawDark;
        ctx.fillRect(x + 4, y + 8, 24, 18);
        ctx.fillStyle = strawMid;
        ctx.fillRect(x + 5, y + 7, 22, 18);
        ctx.fillStyle = strawLight;
        ctx.fillRect(x + 6, y + 8, 20, 6);
        ctx.fillStyle = strawHighlight;
        ctx.fillRect(x + 8, y + 9, 14, 2);

        // Brown Twine / Rope tying the bale tightly
        ctx.fillStyle = isColored ? '#78350f' : '#1e293b';
        ctx.fillRect(x + 11, y + 7, 2, 18);
        ctx.fillRect(x + 19, y + 7, 2, 18);

        // Stray straw wisps
        ctx.fillStyle = strawHighlight;
        ctx.fillRect(x + 2, y + 14, 3, 1);
        ctx.fillRect(x + 27, y + 19, 3, 1);
        break;
      }

      case TILE.ORCHARD_APPLE:
      case TILE.ORCHARD_ORANGE: {
        const isApple = tile === TILE.ORCHARD_APPLE;
        this.fillTileBase(x, y, isColored ? '#386641' : '#334155');

        // Shadow under tree
        ctx.fillStyle = 'rgba(15, 23, 42, 0.38)';
        ctx.fillRect(x + 5, y + 25, 22, 5);

        // Gnarled orchard tree trunk
        ctx.fillStyle = isColored ? '#451a03' : '#1e293b';
        ctx.fillRect(x + 12, y + 14, 8, 14);
        ctx.fillStyle = isColored ? '#78350f' : '#334155';
        ctx.fillRect(x + 13, y + 15, 4, 12);

        // Lush rounded orchard canopy
        const leafDark = isColored ? '#14532d' : '#1e293b';
        const leafMid = isColored ? '#15803d' : '#334155';
        const leafLight = isColored ? '#22c55e' : '#475569';
        const leafH = isColored ? '#86efac' : '#64748b';

        ctx.fillStyle = leafDark;
        ctx.fillRect(x + 3, y - 4, 26, 22);
        ctx.fillStyle = leafMid;
        ctx.fillRect(x + 4, y - 3, 24, 19);
        ctx.fillStyle = leafLight;
        ctx.fillRect(x + 6, y - 2, 14, 10);
        ctx.fillStyle = leafH;
        ctx.fillRect(x + 8, y - 1, 6, 4);

        // Hanging Orchard Fruits!
        if (isColored) {
          const fruitCoords = isApple
            ? [
                { fx: x + 6, fy: y + 2 },
                { fx: x + 15, fy: y - 1 },
                { fx: x + 23, fy: y + 3 },
                { fx: x + 9, fy: y + 10 },
                { fx: x + 19, fy: y + 11 },
              ]
            : [
                { fx: x + 7, fy: y + 1 },
                { fx: x + 14, fy: y + 2 },
                { fx: x + 22, fy: y + 2 },
                { fx: x + 10, fy: y + 9 },
                { fx: x + 18, fy: y + 10 },
              ];

          const primaryColor = isApple ? '#dc2626' : '#ea580c';
          const brightColor = isApple ? '#ef4444' : '#fb923c';

          for (const { fx, fy } of fruitCoords) {
            ctx.fillStyle = primaryColor;
            ctx.fillRect(fx, fy, 4, 4);
            ctx.fillStyle = brightColor;
            ctx.fillRect(fx + 1, fy + 1, 2, 2);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(fx + 1, fy + 1, 1, 1); // gleam
            // Little leaf stem
            ctx.fillStyle = '#86efac';
            ctx.fillRect(fx + 2, fy - 1, 1, 1);
          }
        }
        break;
      }

      case TILE.HOUSE_WALL: {
        // --- RUMAH PAK JOKO: HALF-TIMBERED AGRARIAN FARMHOUSE WALL ---
        const plasterColor = isColored ? '#fef3c7' : '#334155';
        const timberColor = isColored ? '#78350f' : '#1e293b';
        const timberHighlight = isColored ? '#92400e' : '#273549';
        const stoneColor = isColored ? '#64748b' : '#334155';
        const stoneHighlight = isColored ? '#94a3b8' : '#475569';

        // 1. Plaster background (+1px overdraw)
        this.fillTileBase(x, y, plasterColor);

        // 2. Fieldstone foundation along bottom 6px
        ctx.fillStyle = stoneColor;
        ctx.fillRect(x, y + TILE_SIZE - 6, TILE_SIZE + 1, 6);
        ctx.fillStyle = stoneHighlight;
        ctx.fillRect(x + 2, y + TILE_SIZE - 5, 6, 4);
        ctx.fillRect(x + 10, y + TILE_SIZE - 6, 7, 4);
        ctx.fillRect(x + 19, y + TILE_SIZE - 5, 5, 4);
        ctx.fillRect(x + 26, y + TILE_SIZE - 6, 5, 4);
        ctx.fillStyle = isColored ? '#334155' : '#0f172a';
        ctx.fillRect(x, y + TILE_SIZE - 1, TILE_SIZE + 1, 1);

        // 3. Heavy timber studs & frame
        ctx.fillStyle = timberColor;
        ctx.fillRect(x, y, 4, TILE_SIZE - 6);
        ctx.fillRect(x + TILE_SIZE - 4, y, 4, TILE_SIZE - 6);
        ctx.fillRect(x, y, TILE_SIZE + 1, 3);
        ctx.fillRect(x, y + TILE_SIZE - 7, TILE_SIZE + 1, 2);

        // 4. Half-timber diagonal braces
        ctx.fillStyle = timberHighlight;
        if (c % 2 === 0) {
          ctx.beginPath();
          ctx.moveTo(x + 4, y + 3);
          ctx.lineTo(x + 7, y + 3);
          ctx.lineTo(x + TILE_SIZE - 4, y + TILE_SIZE - 7);
          ctx.lineTo(x + TILE_SIZE - 7, y + TILE_SIZE - 7);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(x + TILE_SIZE - 4, y + 3);
          ctx.lineTo(x + TILE_SIZE - 7, y + 3);
          ctx.lineTo(x + 4, y + TILE_SIZE - 7);
          ctx.lineTo(x + 7, y + TILE_SIZE - 7);
          ctx.fill();
        }

        // 5. Farmhouse decorative accents
        if (isColored) {
          if (c === 4 && r === 19) {
            // Lucky iron horseshoe above door
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(x + 16, y + 11, 4, Math.PI * 0.7, Math.PI * 2.3);
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(x + 15, y + 10, 2, 2);
          } else if (c === 2) {
            // Hanging dried herbs on corner beam
            ctx.fillStyle = '#15803d';
            ctx.fillRect(x + 5, y + 9, 4, 8);
            ctx.fillStyle = '#facc15';
            ctx.fillRect(x + 6, y + 7, 2, 3);
          }
        } else {
          // Ornamen mode kabut: Embun beku (Frost) & lumut berpendar di sela-sela dinding batu
          ctx.fillStyle = 'rgba(224, 242, 254, 0.75)';
          ctx.fillRect(x, y + TILE_SIZE - 7, TILE_SIZE + 1, 1); // Kristal embun beku pada lis batu
          ctx.fillRect(x + 2, y, 4, 1);
          ctx.fillRect(x + TILE_SIZE - 5, y, 4, 1);

          // Pendaran lumut bercahaya di celah fondasi batu
          const houseBioPulse = Math.sin(this.tickCount * 0.06 + c * 2 + r) * 0.25 + 0.75;
          ctx.fillStyle = `rgba(45, 212, 191, ${0.35 * houseBioPulse})`;
          ctx.fillRect(x + 8, y + TILE_SIZE - 5, 5, 3);
          ctx.fillStyle = '#2dd4bf';
          ctx.fillRect(x + 9, y + TILE_SIZE - 5, 3, 2);
          ctx.fillStyle = '#a7f3d0';
          ctx.fillRect(x + 10, y + TILE_SIZE - 4, 1, 1);
        }
        break;
      }

      case TILE.FOREST_CABIN_WALL: {
        // --- PONDOK HUTAN PAK TEGUH: RUSTIC LOG CABIN WALL ---
        const logDark = isColored ? '#451a03' : '#0f172a';
        const logBase = isColored ? '#78350f' : '#1e293b';
        const logMid = isColored ? '#92400e' : '#334155';
        const logLight = isColored ? '#b45309' : '#475569';
        const logCore = isColored ? '#fde047' : '#64748b';
        const chinking = isColored ? '#d6d3d1' : '#334155';

        // 1. Stacked horizontal peeled spruce logs (4 logs, 8px high each, +1px seamless)
        for (let i = 0; i < 4; i++) {
          const ly = y + i * 8;
          ctx.fillStyle = logDark;
          ctx.fillRect(x, ly + 6, TILE_SIZE + 1, 2);
          ctx.fillStyle = chinking;
          ctx.fillRect(x, ly + 7, TILE_SIZE + 1, 1);
          ctx.fillStyle = logBase;
          ctx.fillRect(x, ly + 1, TILE_SIZE + 1, 5);
          ctx.fillStyle = logMid;
          ctx.fillRect(x, ly + 1, TILE_SIZE + 1, 3);
          ctx.fillRect(x, ly + 1, TILE_SIZE + 1, 1);
        }

        // 2. Interlocking corner log ends on edge tiles
        if (c === 9) {
          for (let i = 0; i < 4; i++) {
            const ly = y + i * 8;
            ctx.fillStyle = logDark;
            ctx.fillRect(x, ly, 5, 8);
            ctx.fillStyle = logBase;
            ctx.fillRect(x + 1, ly + 1, 3, 6);
            ctx.fillStyle = logCore;
            ctx.fillRect(x + 2, ly + 3, 2, 2);
          }
        } else if (c === 13) {
          for (let i = 0; i < 4; i++) {
            const ly = y + i * 8;
            ctx.fillStyle = logDark;
            ctx.fillRect(x + TILE_SIZE - 5, ly, 5, 8);
            ctx.fillStyle = logBase;
            ctx.fillRect(x + TILE_SIZE - 4, ly + 1, 3, 6);
            ctx.fillStyle = logCore;
            ctx.fillRect(x + TILE_SIZE - 3, ly + 3, 2, 2);
          }
        }

        // 3. Climbing forest moss and hanging dried herbs
        if (isColored) {
          ctx.fillStyle = '#15803d';
          ctx.fillRect(x + (c === 9 ? 4 : c === 13 ? 24 : 14), y + 16, 3, 10);
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(x + (c === 9 ? 5 : c === 13 ? 23 : 15), y + 19, 2, 5);

          if (c === 10 && r === 4) {
            ctx.fillStyle = '#451a03';
            ctx.fillRect(x + 14, y + 4, 4, 3);
            ctx.fillStyle = '#a855f7';
            ctx.fillRect(x + 13, y + 7, 6, 9);
            ctx.fillStyle = '#c084fc';
            ctx.fillRect(x + 14, y + 9, 4, 5);
          }
        } else {
          // Mode kabut: Embun beku (Frost) pada sela kayu & jamur/lumut berpendar di dinding kayu
          ctx.fillStyle = 'rgba(224, 242, 254, 0.7)';
          ctx.fillRect(x, y + 7, TILE_SIZE + 1, 1);
          ctx.fillRect(x, y + 23, TILE_SIZE + 1, 1);

          // Lumut berpendar redup di sela kayu log
          const cabinPulse = Math.sin(this.tickCount * 0.05 + c + r * 1.8) * 0.25 + 0.75;
          ctx.fillStyle = `rgba(56, 189, 248, ${0.35 * cabinPulse})`;
          ctx.fillRect(x + 12, y + 14, 6, 4);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(x + 13, y + 15, 4, 2);
          ctx.fillStyle = '#bae6fd';
          ctx.fillRect(x + 14, y + 15, 2, 1);
        }
        break;
      }

      case TILE.ZEN_WALL: {
        // --- PONDOK KAKEK DAMAI: MINDFUL ZEN TEAHOUSE WALL ---
        const woodPost = isColored ? '#78350f' : '#1e293b';
        const woodHighlight = isColored ? '#92400e' : '#334155';
        const plasterTone = isColored ? '#fef3c7' : '#334155';
        const bambooTone = isColored ? '#b45309' : '#1e293b';

        // 1. Natural warm earthen plaster
        this.fillTileBase(x, y, plasterTone);

        // 2. Bamboo wainscoting along bottom 8px
        ctx.fillStyle = bambooTone;
        ctx.fillRect(x, y + TILE_SIZE - 8, TILE_SIZE + 1, 8);
        ctx.fillStyle = isColored ? '#d97706' : '#334155';
        for (let b = 2; b < TILE_SIZE; b += 4) {
          ctx.fillRect(x + b, y + TILE_SIZE - 8, 2, 8);
        }

        // 3. Cypress (Hinoki) vertical posts and top rail
        ctx.fillStyle = woodPost;
        ctx.fillRect(x, y, 3, TILE_SIZE);
        ctx.fillRect(x + TILE_SIZE - 3, y, 3, TILE_SIZE);
        ctx.fillRect(x, y, TILE_SIZE + 1, 3);
        ctx.fillRect(x, y + TILE_SIZE - 9, TILE_SIZE + 1, 2);

        ctx.fillStyle = woodHighlight;
        ctx.fillRect(x + 1, y + 1, 1, TILE_SIZE - 2);

        // 4. Carved Ensō Zen Circle of Mindfulness on center wall tile
        if (c === 30 && r === 20) {
          ctx.strokeStyle = isColored ? '#78350f' : '#475569';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(x + 16, y + 12, 7, 0.2, Math.PI * 1.85);
          ctx.stroke();
          if (isColored) {
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(x + 21, y + 15, 3, 3);
          }
        }
        break;
      }

      case TILE.TOWER_WALL: {
        // --- ANCIENT TOWER ASHLAR ANDESITE STONE MASONRY ---
        const stoneBase = isColored ? '#64748b' : '#334155';
        const stoneDark = isColored ? '#475569' : '#1e293b';
        const stoneHighlight = isColored ? '#94a3b8' : '#475569';
        const mortarLine = isColored ? '#334155' : '#0f172a';

        // Base ashlar blocks
        this.fillTileBase(x, y, stoneBase);

        // Horizontal mortar courses (+1px seamless)
        ctx.fillStyle = mortarLine;
        ctx.fillRect(x, y + 8, TILE_SIZE + 1, 1.5);
        ctx.fillRect(x, y + 16, TILE_SIZE + 1, 1.5);
        ctx.fillRect(x, y + 24, TILE_SIZE + 1, 1.5);

        // Vertical brick mortar joints (staggered pattern)
        ctx.fillRect(x + 10, y, 1.5, 8);
        ctx.fillRect(x + 22, y, 1.5, 8);
        ctx.fillRect(x + 16, y + 8, 1.5, 8);
        ctx.fillRect(x + 8, y + 16, 1.5, 8);
        ctx.fillRect(x + 24, y + 16, 1.5, 8);
        ctx.fillRect(x + 14, y + 24, 1.5, 8);

        // Stone highlight bevels
        ctx.fillStyle = stoneHighlight;
        ctx.fillRect(x + 1, y + 1, 8, 1);
        ctx.fillRect(x + 12, y + 1, 9, 1);
        ctx.fillRect(x + 1, y + 9, 14, 1);
        ctx.fillRect(x + 18, y + 9, 12, 1);

        // Architectural details based on location
        if (c === 28 || c === 32) {
          // --- CORNER BUTTRESS / PILASTER & HERALDIC BANNER ---
          const isLeft = c === 28;
          ctx.fillStyle = stoneDark;
          if (isLeft) {
            ctx.fillRect(x, y, 6, TILE_SIZE);
            ctx.fillStyle = stoneHighlight;
            ctx.fillRect(x + 5, y, 1, TILE_SIZE);
          } else {
            ctx.fillRect(x + TILE_SIZE - 6, y, 6, TILE_SIZE);
            ctx.fillStyle = stoneHighlight;
            ctx.fillRect(x + TILE_SIZE - 6, y, 1, TILE_SIZE);
          }

          if (r === 4) {
            // Ceremonial Heraldic Valley Banner
            const bx = isLeft ? x + 8 : x + 12;
            const bannerWave = Math.sin(this.tickCount * 0.08 + (isLeft ? 0 : 1.6)) * 1.5;

            // Iron wall bracket
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(bx - 2, y + 4, 16, 2);
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(bx - 3, y + 3, 2, 4);
            ctx.fillRect(bx + 13, y + 3, 2, 4);

            // Banner fabric
            const bannerColor = isColored ? '#2563eb' : '#475569';
            const bannerGold = isColored ? '#fbbf24' : '#64748b';
            ctx.fillStyle = bannerColor;
            ctx.beginPath();
            ctx.moveTo(bx, y + 6);
            ctx.lineTo(bx + 12, y + 6);
            ctx.lineTo(bx + 12 + bannerWave, y + 26);
            ctx.lineTo(bx + 6 + bannerWave * 0.5, y + 22);
            ctx.lineTo(bx + bannerWave, y + 26);
            ctx.closePath();
            ctx.fill();

            // Golden Sunburst crest on banner
            ctx.fillStyle = bannerGold;
            ctx.fillRect(bx + 4, y + 10, 4, 4);
            ctx.fillStyle = isColored ? '#ffffff' : '#94a3b8';
            ctx.fillRect(bx + 5, y + 11, 2, 2);
          } else if (r === 5 || r === 6) {
            // Mounted Wrought-Iron Torch Sconce on Corner Pier
            const tx = isLeft ? x + 12 : x + 16;
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(tx, y + 14, 4, 4);
            ctx.fillRect(tx + 1, y + 18, 2, 6);
            ctx.fillStyle = isColored ? '#78350f' : '#334155';
            ctx.fillRect(tx - 1, y + 10, 6, 4);

            if (isColored) {
              // Flickering Warm Ember Torch Flame
              const flicker = Math.sin(this.tickCount * 0.25 + (isLeft ? 0 : 2.5)) * 1.5;
              ctx.fillStyle = 'rgba(245, 158, 11, 0.18)';
              ctx.beginPath();
              ctx.arc(tx + 2, y + 7, 10, 0, Math.PI * 2);
              ctx.fill();

              ctx.fillStyle = '#ef4444';
              ctx.fillRect(tx - 1 + flicker * 0.5, y + 4, 6, 6);
              ctx.fillStyle = '#f59e0b';
              ctx.fillRect(tx + flicker, y + 2, 4, 6);
              ctx.fillStyle = '#fef08a';
              ctx.fillRect(tx + 1 + flicker * 0.5, y + 4, 2, 3);
            } else {
              // Mode kabut: Cahaya obor/lentera dinding kuning hangat yang lembut
              const sconcePulse = Math.sin(this.tickCount * 0.12 + (isLeft ? 0 : 2.5)) * 0.05;
              ctx.fillStyle = `rgba(254, 240, 138, ${0.26 + sconcePulse})`;
              ctx.beginPath();
              ctx.arc(tx + 2, y + 7, 9, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#f59e0b';
              ctx.fillRect(tx, y + 5, 4, 5);
              ctx.fillStyle = '#fef08a';
              ctx.fillRect(tx + 1, y + 6, 2, 3);
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(tx + 1, y + 6, 1, 1);
            }
          }
        } else {
          // --- INNER WALL: Creeping Green Ivy & Arrow Embrasure ---
          if (r === 5) {
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(x + 14, y + 8, 4, 14);
            ctx.fillStyle = stoneDark;
            ctx.fillRect(x + 12, y + 6, 8, 2);
            ctx.fillRect(x + 12, y + 22, 8, 2);
          }

          if (isColored) {
            ctx.fillStyle = '#15803d';
            ctx.fillRect(x + 3, y + 20, 4, 5);
            ctx.fillRect(x + 6, y + 16, 5, 6);
            ctx.fillRect(x + 4, y + 10, 3, 5);
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(x + 4, y + 21, 2, 2);
            ctx.fillRect(x + 8, y + 17, 2, 2);
            ctx.fillRect(x + 5, y + 11, 1, 2);
          } else {
            // Mode kabut: Lumut berpendar redup di sela-sela dinding batu purba
            const towerBioPulse = Math.sin(this.tickCount * 0.06 + r * 1.7 + c) * 0.25 + 0.75;
            ctx.fillStyle = `rgba(45, 212, 191, ${0.35 * towerBioPulse})`;
            ctx.fillRect(x + 4, y + 18, 6, 4);
            ctx.fillStyle = '#2dd4bf';
            ctx.fillRect(x + 5, y + 19, 4, 2);
            ctx.fillStyle = '#a7f3d0';
            ctx.fillRect(x + 6, y + 19, 2, 1);

            // Efek embun beku (Frost) pada lis mortar batu
            ctx.fillStyle = 'rgba(224, 242, 254, 0.65)';
            ctx.fillRect(x, y + 8, TILE_SIZE + 1, 1);
            ctx.fillRect(x + 12, y + 5, 8, 1);
          }
        }
        break;
      }

      case TILE.TOWER_ROOF: {
        // Slate & copper roof spire structure of the Grand Clock Tower
        const slateBase = isColored ? '#1e293b' : '#334155';
        const slateDark = isColored ? '#0f172a' : '#1e293b';
        const slateHighlight = isColored ? '#38bdf8' : '#64748b';
        const copperTrim = isColored ? '#b45309' : '#475569';
        const copperGold = isColored ? '#f59e0b' : '#64748b';
        const goldHighlight = isColored ? '#fef08a' : '#94a3b8';

        // Background behind roof
        this.fillTileBase(x, y, isColored ? '#15803d' : '#1e293b');

        if (r === 2 && c === 30) {
          // --- PINNACLE: Central High Gothic Spire with Golden Weathervane ---
          ctx.fillStyle = slateBase;
          ctx.beginPath();
          ctx.moveTo(x + 16, y - 8);
          ctx.lineTo(x + 30, y + 32);
          ctx.lineTo(x + 2, y + 32);
          ctx.closePath();
          ctx.fill();

          // Left facet shadow
          ctx.fillStyle = slateDark;
          ctx.beginPath();
          ctx.moveTo(x + 16, y - 8);
          ctx.lineTo(x + 16, y + 32);
          ctx.lineTo(x + 2, y + 32);
          ctx.closePath();
          ctx.fill();

          // Slate horizontal bands
          ctx.fillStyle = copperTrim;
          ctx.fillRect(x + 6, y + 26, 20, 2);
          ctx.fillRect(x + 10, y + 16, 12, 2);
          ctx.fillRect(x + 13, y + 6, 6, 2);

          // Bronze mast
          ctx.fillStyle = copperGold;
          ctx.fillRect(x + 15, y - 16, 2, 12);

          // Golden Celestial Weathervane
          const vaneFlutter = Math.sin(this.tickCount * 0.08) * 1.5;
          ctx.fillStyle = copperGold;
          ctx.fillRect(x + 11, y - 12, 10, 1.5);
          ctx.fillStyle = goldHighlight;
          ctx.beginPath();
          ctx.moveTo(x + 23 + vaneFlutter, y - 12);
          ctx.lineTo(x + 19 + vaneFlutter, y - 15);
          ctx.lineTo(x + 19 + vaneFlutter, y - 9);
          ctx.closePath();
          ctx.fill();
          ctx.fillRect(x + 8 + vaneFlutter, y - 14, 2, 4);

          // Golden Orb Apex
          ctx.fillStyle = copperGold;
          ctx.beginPath();
          ctx.arc(x + 16, y - 16, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = goldHighlight;
          ctx.beginPath();
          ctx.arc(x + 15.5, y - 16.5, 1.5, 0, Math.PI * 2);
          ctx.fill();

          if (isColored) {
            const sparkleFrame = Math.floor(this.tickCount * 0.1) % 5;
            if (sparkleFrame === 0) {
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(x + 15, y - 18, 2, 2);
            }
          }
        } else if (r === 2 && (c === 29 || c === 31)) {
          // --- SLOPING SPIRE ROOF (Flanks) ---
          const isLeft = c === 29;
          ctx.fillStyle = slateBase;
          ctx.fillRect(x, y + 6, TILE_SIZE, TILE_SIZE - 6);

          ctx.fillStyle = slateDark;
          ctx.beginPath();
          if (isLeft) {
            ctx.moveTo(x, y + 20);
            ctx.lineTo(x + TILE_SIZE, y + 6);
            ctx.lineTo(x + TILE_SIZE, y + TILE_SIZE);
            ctx.lineTo(x, y + TILE_SIZE);
          } else {
            ctx.moveTo(x, y + 6);
            ctx.lineTo(x + TILE_SIZE, y + 20);
            ctx.lineTo(x + TILE_SIZE, y + TILE_SIZE);
            ctx.lineTo(x, y + TILE_SIZE);
          }
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = copperGold;
          ctx.fillRect(x, y + 28, TILE_SIZE, 3);
          ctx.fillStyle = slateHighlight;
          ctx.fillRect(x + 6, y + 22, 6, 1);
          ctx.fillRect(x + 18, y + 22, 6, 1);
        } else if (r === 2 && (c === 28 || c === 32)) {
          // --- CORNER PINNACLE TURRET ---
          ctx.fillStyle = isColored ? '#475569' : '#1e293b';
          ctx.fillRect(x + 4, y + 20, 24, 12);
          ctx.fillStyle = isColored ? '#64748b' : '#334155';
          ctx.fillRect(x + 6, y + 18, 20, 4);

          ctx.fillStyle = slateBase;
          ctx.beginPath();
          ctx.moveTo(x + 16, y + 2);
          ctx.lineTo(x + 27, y + 18);
          ctx.lineTo(x + 5, y + 18);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = copperGold;
          ctx.fillRect(x + 15, y - 2, 2, 5);
          ctx.beginPath();
          ctx.arc(x + 16, y - 3, 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (r === 3 && c === 30) {
          // --- STONE CLOCK PEDIMENT & GABLE ---
          ctx.fillStyle = isColored ? '#64748b' : '#334155';
          ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

          ctx.fillStyle = isColored ? '#94a3b8' : '#475569';
          ctx.beginPath();
          ctx.moveTo(x + 16, y + 2);
          ctx.lineTo(x + 30, y + 22);
          ctx.lineTo(x + 2, y + 22);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = isColored ? '#475569' : '#1e293b';
          ctx.fillRect(x + 4, y + 22, 24, 4);

          ctx.fillStyle = copperGold;
          ctx.beginPath();
          ctx.arc(x + 16, y + 14, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = isColored ? '#ffffff' : '#94a3b8';
          ctx.fillRect(x + 15, y + 13, 2, 2);

          ctx.fillStyle = isColored ? '#334155' : '#0f172a';
          ctx.fillRect(x, y + 28, TILE_SIZE, 4);
        } else {
          ctx.fillStyle = slateBase;
          ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = copperTrim;
          ctx.fillRect(x, y + 28, TILE_SIZE, 4);
        }
        break;
      }

      case TILE.TOWER_CLOCK: {
        // --- THE GRAND ASTRONOMICAL CLOCK FACE OF HARMONY ---
        this.fillTileBase(x, y, isColored ? '#64748b' : '#334155');

        ctx.fillStyle = isColored ? '#475569' : '#1e293b';
        ctx.fillRect(x, y, TILE_SIZE, 2);
        ctx.fillRect(x, y + TILE_SIZE - 2, TILE_SIZE, 2);
        ctx.fillRect(x, y, 2, TILE_SIZE);
        ctx.fillRect(x + TILE_SIZE - 2, y, 2, TILE_SIZE);

        const cx = x + 16;
        const cy = y + 16;

        // Outer ornamental golden bronze dial bezel (28px diameter)
        ctx.fillStyle = isColored ? '#d97706' : '#475569';
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.fill();

        // Embossed golden studs / gear teeth
        ctx.fillStyle = isColored ? '#f59e0b' : '#64748b';
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
          const gx = cx + Math.cos(a) * 13;
          const gy = cy + Math.sin(a) * 13;
          ctx.fillRect(gx - 1, gy - 1, 2, 2);
        }

        // Inner Clock Face Dial (22px diameter)
        const dialFill = isColored ? '#fefce8' : '#0f172a';
        ctx.fillStyle = dialFill;
        ctx.beginPath();
        ctx.arc(cx, cy, 11, 0, Math.PI * 2);
        ctx.fill();

        // Soft radial warm light aura when colored
        if (isColored) {
          const auraPulse = Math.sin(this.tickCount * 0.08) * 0.08;
          ctx.fillStyle = `rgba(254, 240, 138, ${0.28 + auraPulse})`;
          ctx.beginPath();
          ctx.arc(cx, cy, 16, 0, Math.PI * 2);
          ctx.fill();
        }

        // 12 Roman / Diamond hour markers on dial
        const markerColor = isColored ? '#78350f' : '#64748b';
        ctx.fillStyle = markerColor;
        ctx.fillRect(cx - 1, cy - 9, 2, 2); // XII
        ctx.fillRect(cx + 7, cy - 1, 2, 2); // III
        ctx.fillRect(cx - 1, cy + 7, 2, 2); // VI
        ctx.fillRect(cx - 9, cy - 1, 2, 2); // IX

        // Dynamic Moving Hands of Time & Harmony
        const minuteAngle = isColored
          ? ((this.tickCount * 0.02) % (Math.PI * 2)) - Math.PI / 2
          : -Math.PI / 2;
        const hourAngle = isColored ? 0.35 : -Math.PI / 2;

        // Hour Hand
        ctx.strokeStyle = isColored ? '#92400e' : '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(hourAngle) * 5.5, cy + Math.sin(hourAngle) * 5.5);
        ctx.stroke();

        // Minute Hand
        ctx.strokeStyle = isColored ? '#1e293b' : '#334155';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(minuteAngle) * 7.5, cy + Math.sin(minuteAngle) * 7.5);
        ctx.stroke();

        // Central Golden Hub
        ctx.fillStyle = isColored ? '#fbbf24' : '#64748b';
        ctx.beginPath();
        ctx.arc(cx, cy, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 0.5, cy - 0.5, 1, 1);
        break;
      }

      case TILE.TOWER_WINDOW: {
        // --- BELFRY BRONZE BELL (r=3) OR MID-TOWER STAINED GLASS LANCET (r=5) ---
        this.fillTileBase(x, y, isColored ? '#64748b' : '#334155');

        if (r === 3) {
          // --- BELFRY OPEN STONE ARCH & BRONZE BELL OF HARMONY ---
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(x + 16, y + 14, 10, Math.PI, 0);
          ctx.lineTo(x + 26, y + 28);
          ctx.lineTo(x + 6, y + 28);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = isColored ? '#94a3b8' : '#475569';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(x + 16, y + 14, 10, Math.PI, 0);
          ctx.stroke();

          // Oak beam
          ctx.fillStyle = isColored ? '#78350f' : '#1e293b';
          ctx.fillRect(x + 8, y + 10, 16, 3);

          ctx.fillStyle = '#1e293b';
          ctx.fillRect(x + 15, y + 13, 2, 2);

          // Bronze Bell
          const bellBronze = isColored ? '#b45309' : '#334155';
          const bellGleam = isColored ? '#f59e0b' : '#64748b';
          const bellLight = isColored ? '#fef08a' : '#94a3b8';

          ctx.fillStyle = bellBronze;
          ctx.beginPath();
          ctx.moveTo(x + 13, y + 15);
          ctx.lineTo(x + 19, y + 15);
          ctx.lineTo(x + 22, y + 23);
          ctx.lineTo(x + 10, y + 23);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = bellGleam;
          ctx.fillRect(x + 14, y + 17, 4, 5);
          ctx.fillStyle = bellLight;
          ctx.fillRect(x + 15, y + 18, 1, 3);

          ctx.fillStyle = isColored ? '#d97706' : '#475569';
          ctx.fillRect(x + 9, y + 23, 14, 2);

          ctx.fillStyle = '#0f172a';
          ctx.fillRect(x + 15, y + 25, 2, 2);

          // Stone balustrade rail
          ctx.fillStyle = isColored ? '#475569' : '#1e293b';
          ctx.fillRect(x + 4, y + 27, 24, 5);
          ctx.fillStyle = isColored ? '#94a3b8' : '#475569';
          ctx.fillRect(x + 6, y + 27, 20, 2);
        } else {
          // --- GOTHIC STAINED GLASS LANCET WINDOW (r=5, c=30) ---
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.moveTo(x + 16, y + 3);
          ctx.lineTo(x + 24, y + 12);
          ctx.lineTo(x + 24, y + 26);
          ctx.lineTo(x + 8, y + 26);
          ctx.lineTo(x + 8, y + 12);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = isColored ? '#94a3b8' : '#475569';
          ctx.lineWidth = 2;
          ctx.stroke();

          if (isColored) {
            const glowPulse = Math.sin(this.tickCount * 0.07) * 0.05;
            ctx.fillStyle = `rgba(254, 240, 138, ${0.2 + glowPulse})`;
            ctx.fillRect(x + 7, y + 6, 18, 22);

            ctx.fillStyle = '#10b981';
            ctx.fillRect(x + 14, y + 7, 4, 4);

            ctx.fillStyle = '#ef4444';
            ctx.fillRect(x + 10, y + 13, 5, 5);
            ctx.fillRect(x + 17, y + 13, 5, 5);

            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(x + 10, y + 19, 5, 5);
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(x + 17, y + 19, 5, 5);

            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fillRect(x + 11, y + 14, 2, 2);
            ctx.fillRect(x + 18, y + 14, 2, 2);
          } else {
            // Cahaya dari Balik Jendela (Mode Kabut): pendaran kuning hangat lembut lilin menara
            const towerGlowPulse = Math.sin(this.tickCount * 0.08) * 0.06;
            ctx.fillStyle = `rgba(254, 240, 138, ${0.32 + towerGlowPulse})`;
            ctx.fillRect(x + 6, y + 5, 20, 23);

            // Kaca jendela memancarkan cahaya kuning hangat keemasan
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(x + 10, y + 12, 12, 13);
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(x + 11, y + 13, 10, 11);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x + 14, y + 15, 3, 4); // Inti nyala lilin
          }

          ctx.fillStyle = isColored ? '#334155' : '#0f172a';
          ctx.fillRect(x + 15, y + 11, 2, 14);
          ctx.fillRect(x + 9, y + 17, 14, 1.5);

          ctx.fillStyle = isColored ? '#475569' : '#1e293b';
          ctx.fillRect(x + 6, y + 26, 20, 4);
          ctx.fillStyle = isColored ? '#94a3b8' : '#475569';
          ctx.fillRect(x + 7, y + 26, 18, 1.5);
        }
        break;
      }

      case TILE.TOWER_DOOR: {
        // --- GRAND GOTHIC ARCHED OAK PORTAL & GATE OF HARMONY ---
        this.fillTileBase(x, y, isColored ? '#64748b' : '#334155');

        ctx.fillStyle = isColored ? '#475569' : '#1e293b';
        ctx.beginPath();
        ctx.arc(x + 16, y + 13, 12, Math.PI, 0);
        ctx.lineTo(x + 28, y + 30);
        ctx.lineTo(x + 4, y + 30);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = isColored ? '#94a3b8' : '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x + 16, y + 13, 12, Math.PI, 0);
        ctx.stroke();

        ctx.fillStyle = isColored ? '#fbbf24' : '#64748b';
        ctx.fillRect(x + 14, y, 4, 4);

        const oakBase = isColored ? '#451a03' : '#1e293b';
        const oakPlank = isColored ? '#78350f' : '#334155';
        ctx.fillStyle = oakBase;
        ctx.beginPath();
        ctx.arc(x + 16, y + 14, 10, Math.PI, 0);
        ctx.lineTo(x + 26, y + 29);
        ctx.lineTo(x + 6, y + 29);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = oakPlank;
        ctx.fillRect(x + 9, y + 14, 2, 15);
        ctx.fillRect(x + 13, y + 10, 2, 19);
        ctx.fillRect(x + 17, y + 10, 2, 19);
        ctx.fillRect(x + 21, y + 14, 2, 15);

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 15.5, y + 6, 1, 23);

        ctx.fillStyle = isColored ? '#1e293b' : '#0f172a';
        ctx.fillRect(x + 7, y + 14, 18, 2.5);
        ctx.fillRect(x + 7, y + 24, 18, 2.5);

        ctx.fillStyle = isColored ? '#475569' : '#334155';
        ctx.fillRect(x + 8, y + 14, 1.5, 2.5);
        ctx.fillRect(x + 22, y + 14, 1.5, 2.5);
        ctx.fillRect(x + 8, y + 24, 1.5, 2.5);
        ctx.fillRect(x + 22, y + 24, 1.5, 2.5);

        ctx.fillStyle = isColored ? '#fbbf24' : '#64748b';
        ctx.fillRect(x + 12, y + 18, 2, 3);
        ctx.fillRect(x + 18, y + 18, 2, 3);
        ctx.fillRect(x + 14.5, y + 21, 3, 3);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 15.5, y + 22, 1, 1.5);

        ctx.fillStyle = isColored ? '#334155' : '#0f172a';
        ctx.fillRect(x + 2, y + 29, 28, 3);
        ctx.fillStyle = isColored ? '#64748b' : '#475569';
        ctx.fillRect(x + 4, y + 29, 24, 1);
        break;
      }

      case TILE.HOUSE_WINDOW: {
        // --- RUMAH PAK JOKO: FARMHOUSE WINDOW WITH SHUTTERS & FLOWER BOX ---
        const plasterColor = isColored ? '#fef3c7' : '#334155';
        const timberColor = isColored ? '#78350f' : '#1e293b';
        const stoneColor = isColored ? '#64748b' : '#334155';

        // 1. Plaster wall & stone foundation
        this.fillTileBase(x, y, plasterColor);
        ctx.fillStyle = stoneColor;
        ctx.fillRect(x, y + TILE_SIZE - 6, TILE_SIZE, 6);
        ctx.fillStyle = timberColor;
        ctx.fillRect(x, y, 3, TILE_SIZE - 6);
        ctx.fillRect(x + TILE_SIZE - 3, y, 3, TILE_SIZE - 6);

        // 2. Open wooden shutters (Forest sage green) on both sides of window
        const shutterColor = isColored ? '#15803d' : '#334155';
        const shutterDark = isColored ? '#14532d' : '#1e293b';
        // Left shutter
        ctx.fillStyle = shutterColor;
        ctx.fillRect(x + 4, y + 5, 5, 14);
        ctx.fillStyle = shutterDark;
        ctx.fillRect(x + 4, y + 8, 5, 1);
        ctx.fillRect(x + 4, y + 12, 5, 1);
        ctx.fillRect(x + 4, y + 16, 5, 1);
        // Left shutter black iron strap hinge
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 8, y + 6, 2, 2);
        ctx.fillRect(x + 8, y + 16, 2, 2);

        // Right shutter
        ctx.fillStyle = shutterColor;
        ctx.fillRect(x + 23, y + 5, 5, 14);
        ctx.fillStyle = shutterDark;
        ctx.fillRect(x + 23, y + 8, 5, 1);
        ctx.fillRect(x + 23, y + 12, 5, 1);
        ctx.fillRect(x + 23, y + 16, 5, 1);
        // Right shutter black iron strap hinge
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 22, y + 6, 2, 2);
        ctx.fillRect(x + 22, y + 16, 2, 2);

        // 3. Window frame (Dark oak)
        ctx.fillStyle = isColored ? '#451a03' : '#0f172a';
        ctx.fillRect(x + 9, y + 4, 14, 16);

        // 4. Window glass panes (4-pane window)
        const isLampLit = !isColored || !this.isAllMissionsCompleted || this.timeOfDayProgress > 0.1;
        if (isLampLit) {
          // Warm glowing golden lantern light from behind window
          const pulse = Math.sin(this.tickCount * 0.08 + x * 0.1) * 0.05;
          ctx.fillStyle = `rgba(254, 240, 138, ${0.32 + pulse})`;
          ctx.fillRect(x + 7, y + 2, 18, 20);

          ctx.fillStyle = '#fef08a';
          ctx.fillRect(x + 10, y + 5, 5, 6);
          ctx.fillRect(x + 17, y + 5, 5, 6);
          ctx.fillRect(x + 10, y + 13, 5, 6);
          ctx.fillRect(x + 17, y + 13, 5, 6);

          // Warm white flame core
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x + 12, y + 7, 2, 2);
          ctx.fillRect(x + 19, y + 7, 2, 2);
        } else {
          // Daylight blue sky reflection with bright sun glint
          const glassShade = isColored ? '#0284c7' : '#475569';
          ctx.fillStyle = glassShade;
          ctx.fillRect(x + 10, y + 5, 5, 6);
          ctx.fillRect(x + 17, y + 5, 5, 6);
          ctx.fillRect(x + 10, y + 13, 5, 6);
          ctx.fillRect(x + 17, y + 13, 5, 6);

          // Sky reflection glints
          ctx.fillStyle = isColored ? 'rgba(255, 255, 255, 0.55)' : 'rgba(255, 255, 255, 0.2)';
          ctx.fillRect(x + 11, y + 6, 3, 2);
          ctx.fillRect(x + 18, y + 6, 3, 2);
          ctx.fillRect(x + 11, y + 14, 3, 2);
          ctx.fillRect(x + 18, y + 14, 3, 2);
        }

        // Window mullion cross
        ctx.fillStyle = isColored ? '#78350f' : '#1e293b';
        ctx.fillRect(x + 15, y + 5, 2, 14);
        ctx.fillRect(x + 10, y + 11, 12, 2);

        // 5. Terracotta flower planter box beneath window
        ctx.fillStyle = isColored ? '#c2410c' : '#475569';
        ctx.fillRect(x + 7, y + 20, 18, 6);
        ctx.fillStyle = isColored ? '#ea580c' : '#64748b';
        ctx.fillRect(x + 7, y + 20, 18, 2);

        if (isColored) {
          // Blooming mini petunias & marigolds in planter
          ctx.fillStyle = '#ef4444'; // Red
          ctx.fillRect(x + 9, y + 18, 3, 3);
          ctx.fillStyle = '#fbbf24'; // Yellow
          ctx.fillRect(x + 14, y + 18, 3, 3);
          ctx.fillStyle = '#ec4899'; // Pink
          ctx.fillRect(x + 19, y + 18, 3, 3);
          // Trailing green leaves
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(x + 8, y + 19, 2, 2);
          ctx.fillRect(x + 13, y + 19, 2, 2);
          ctx.fillRect(x + 18, y + 19, 2, 2);
          ctx.fillRect(x + 10, y + 23, 2, 3);
          ctx.fillRect(x + 17, y + 23, 2, 3);
        } else {
          // Mode kabut: Embun beku (Frost) pada tepi kotak tanaman & lumut berpendar
          ctx.fillStyle = 'rgba(224, 242, 254, 0.8)';
          ctx.fillRect(x + 7, y + 20, 18, 1);
          ctx.fillRect(x + 9, y + 19, 3, 1);
          ctx.fillRect(x + 18, y + 19, 4, 1);

          // Pendaran lumut redup di bawah kotak jendela
          const boxPulse = Math.sin(this.tickCount * 0.07 + x) * 0.25 + 0.75;
          ctx.fillStyle = `rgba(45, 212, 191, ${0.35 * boxPulse})`;
          ctx.fillRect(x + 12, y + 25, 6, 3);
          ctx.fillStyle = '#2dd4bf';
          ctx.fillRect(x + 13, y + 25, 4, 2);
        }
        break;
      }

      case TILE.HOUSE_DOOR: {
        // --- RUMAH PAK JOKO: DUTCH SPLIT BARN DOOR WITH RAIN BARREL & CARRIAGE LAMP ---
        const plasterColor = isColored ? '#fef3c7' : '#334155';
        const stoneColor = isColored ? '#64748b' : '#334155';
        ctx.fillStyle = plasterColor;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

        // Fieldstone foundation
        ctx.fillStyle = stoneColor;
        ctx.fillRect(x, y + TILE_SIZE - 6, TILE_SIZE, 6);

        // 1. Natural stone welcome step with woven coir welcome mat
        ctx.fillStyle = isColored ? '#94a3b8' : '#475569';
        ctx.fillRect(x + 6, y + 27, 20, 5);
        ctx.fillStyle = isColored ? '#d97706' : '#334155';
        ctx.fillRect(x + 9, y + 28, 14, 3);

        // 2. Heavy dark oak door frame
        ctx.fillStyle = isColored ? '#451a03' : '#0f172a';
        ctx.fillRect(x + 8, y + 2, 16, 26);

        // 3. Dutch split door planks
        ctx.fillStyle = isColored ? '#92400e' : '#334155';
        ctx.fillRect(x + 10, y + 4, 12, 23);
        ctx.fillStyle = isColored ? '#78350f' : '#1e293b';
        ctx.fillRect(x + 15, y + 4, 2, 23);
        // Horizontal split seam for Dutch barn door
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 10, y + 15, 12, 2);

        // Diagonal wooden cross-brace on lower half
        ctx.fillStyle = isColored ? '#b45309' : '#475569';
        ctx.beginPath();
        ctx.moveTo(x + 10, y + 17);
        ctx.lineTo(x + 13, y + 17);
        ctx.lineTo(x + 22, y + 26);
        ctx.lineTo(x + 19, y + 26);
        ctx.fill();

        // 4. Wrought iron strap hinges & golden brass latch
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 10, y + 7, 4, 2);
        ctx.fillRect(x + 10, y + 19, 4, 2);
        ctx.fillStyle = isColored ? '#fbbf24' : '#94a3b8';
        ctx.fillRect(x + 19, y + 13, 2, 3);

        // 5. Rustic wooden rain barrel on left side with brass tap + watering can
        ctx.fillStyle = isColored ? '#78350f' : '#1e293b';
        ctx.fillRect(x + 1, y + 17, 6, 12);
        // Barrel iron hoops
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 1, y + 19, 6, 1);
        ctx.fillRect(x + 1, y + 26, 6, 1);
        // Brass tap
        ctx.fillStyle = isColored ? '#f59e0b' : '#64748b';
        ctx.fillRect(x + 6, y + 23, 2, 2);
        // Cute sky-blue watering can sitting beside barrel
        if (isColored) {
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(x + 2, y + 13, 4, 4);
          ctx.fillRect(x + 5, y + 12, 2, 2); // Spout
        }

        // 6. Warm brass carriage lamp on right side
        const isDoorLampLit = !this.isAllMissionsCompleted;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 26, y + 7, 3, 2); // Bracket
        ctx.fillRect(x + 25, y + 5, 5, 6); // Lamp body

        if (isDoorLampLit) {
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(x + 26, y + 6, 3, 4);
          ctx.fillStyle = 'rgba(254, 240, 138, 0.28)';
          ctx.fillRect(x + 23, y + 3, 9, 10);
        } else {
          ctx.fillStyle = isColored ? '#94a3b8' : '#64748b';
          ctx.fillRect(x + 26, y + 6, 3, 4);
        }
        break;
      }

      case TILE.HOUSE_ROOF: {
        // --- RUMAH PAK JOKO: CURVED MEDITERRANEAN TERRACOTTA ROOF WITH GARLANDS & CHIMNEY ---
        ctx.fillStyle = isColored ? '#991b1b' : '#1e293b';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

        // 1. Terracotta clay scalloped barrel tile rows
        const tileBase = isColored ? '#c2410c' : '#334155';
        const tileLight = isColored ? '#ea580c' : '#475569';
        const tileHighlight = isColored ? '#f97316' : '#64748b';
        const tileShadow = isColored ? '#7c2d12' : '#1e293b';

        // Three horizontal curved tile tiers
        for (let tier = 0; tier < 3; tier++) {
          const ty = y + 2 + tier * 9;
          // Tile row base
          ctx.fillStyle = tileBase;
          ctx.fillRect(x, ty, TILE_SIZE, 8);
          // Dark overlap shadow at bottom of tier
          ctx.fillStyle = tileShadow;
          ctx.fillRect(x, ty + 7, TILE_SIZE, 2);

          // Vertical barrel curvature ridges every 6 pixels
          for (let tx = 1; tx < TILE_SIZE - 2; tx += 6) {
            ctx.fillStyle = tileShadow;
            ctx.fillRect(x + tx, ty, 1, 7);
            ctx.fillStyle = tileHighlight;
            ctx.fillRect(x + tx + 1, ty + 1, 2, 5);
            ctx.fillStyle = tileLight;
            ctx.fillRect(x + tx + 3, ty + 1, 2, 5);
          }
        }

        // Timber fascia under the bottom eave
        ctx.fillStyle = isColored ? '#451a03' : '#0f172a';
        ctx.fillRect(x, y + TILE_SIZE - 2, TILE_SIZE, 2);

        // 2. Hanging dried crops under the eaves
        if (isColored) {
          if (c === 2 || c === 6) {
            // Braided golden corn cobs hanging under eaves
            ctx.fillStyle = '#16a34a'; // Corn husk
            ctx.fillRect(x + 10, y + 26, 3, 2);
            ctx.fillStyle = '#facc15'; // Golden corn
            ctx.fillRect(x + 10, y + 28, 3, 5);
            ctx.fillRect(x + 18, y + 26, 3, 2);
            ctx.fillStyle = '#eab308';
            ctx.fillRect(x + 18, y + 28, 3, 5);
          } else if (c === 5) {
            // Braided red chili garland
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(x + 8, y + 27, 2, 3);
            ctx.fillRect(x + 12, y + 28, 2, 3);
            ctx.fillRect(x + 16, y + 27, 2, 3);
            ctx.fillStyle = '#16a34a';
            ctx.fillRect(x + 8, y + 26, 10, 1);
          }
        }

        // 3. Red brick chimney on column 3
        if (c === 3 && r === 18) {
          // Brick chimney body
          ctx.fillStyle = isColored ? '#b91c1c' : '#334155';
          ctx.fillRect(x + 18, y - 8, 10, 14);
          // Mortar joints
          ctx.fillStyle = isColored ? '#fef3c7' : '#475569';
          ctx.fillRect(x + 18, y - 4, 10, 1);
          ctx.fillRect(x + 18, y + 1, 10, 1);
          ctx.fillRect(x + 23, y - 8, 1, 4);
          ctx.fillRect(x + 21, y - 3, 1, 4);
          // Stone chimney capping
          ctx.fillStyle = isColored ? '#64748b' : '#1e293b';
          ctx.fillRect(x + 17, y - 10, 12, 3);

          // Animated rising pixel smoke puffs
          const smokeTime = this.tickCount * 0.08;
          for (let s = 0; s < 3; s++) {
            const smokeProgress = ((smokeTime + s * 1.2) % 3.6) / 3.6;
            const smokeY = y - 10 - smokeProgress * 22;
            const smokeX = x + 22 + Math.sin(smokeProgress * Math.PI * 2) * 4;
            const smokeSize = 3 + Math.floor(smokeProgress * 4);
            const smokeAlpha = (1 - smokeProgress) * 0.7;

            ctx.fillStyle = `rgba(241, 245, 249, ${smokeAlpha})`;
            ctx.fillRect(Math.floor(smokeX), Math.floor(smokeY), smokeSize, smokeSize);
          }
        }

        // 4. Golden rooster weather vane on column 4
        if (c === 4 && r === 18 && isColored) {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(x + 15, y - 8, 2, 10); // Spire
          ctx.fillRect(x + 12, y - 5, 8, 1); // Crossbar
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(x + 14, y - 11, 4, 3); // Rooster
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(x + 16, y - 12, 2, 2); // Comb
        }
        break;
      }

      case TILE.FOREST_CABIN_WINDOW: {
        // --- PONDOK HUTAN PAK TEGUH: TIMBER CABIN WINDOW WITH HEARTH GLOW ---
        // 1. Peeled log wall background
        const logDark = isColored ? '#451a03' : '#0f172a';
        const logBase = isColored ? '#78350f' : '#1e293b';
        const logMid = isColored ? '#92400e' : '#334155';
        for (let i = 0; i < 4; i++) {
          const ly = y + i * 8;
          ctx.fillStyle = logDark;
          ctx.fillRect(x, ly + 6, TILE_SIZE, 2);
          ctx.fillStyle = logBase;
          ctx.fillRect(x, ly + 1, TILE_SIZE, 5);
          ctx.fillStyle = logMid;
          ctx.fillRect(x, ly + 1, TILE_SIZE, 2);
        }

        // 2. Heavy rough-hewn timber window frame
        ctx.fillStyle = isColored ? '#451a03' : '#0f172a';
        ctx.fillRect(x + 7, y + 4, 18, 16);

        // 3. Cabin interior hearth glow
        const pulse = Math.sin(this.tickCount * 0.09 + x * 0.2) * 0.05;
        ctx.fillStyle = isColored ? `rgba(251, 191, 36, ${0.25 + pulse})` : `rgba(254, 240, 138, ${0.35 + pulse})`;
        ctx.fillRect(x + 5, y + 2, 22, 20);

        // Cozy amber window panes with diamond-lattice - glowing in both colored and fog modes!
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(x + 9, y + 6, 6, 5);
        ctx.fillRect(x + 17, y + 6, 6, 5);
        ctx.fillRect(x + 9, y + 13, 6, 5);
        ctx.fillRect(x + 17, y + 13, 6, 5);

        // Hearth fire flicker cores (warm yellow flame of life inside)
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(x + 11, y + 7, 3, 3);
        ctx.fillRect(x + 18, y + 8, 3, 3);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 12, y + 8, 1, 1);
        ctx.fillRect(x + 19, y + 9, 1, 1);

        // Heavy dark mullion cross
        ctx.fillStyle = isColored ? '#292524' : '#0f172a';
        ctx.fillRect(x + 15, y + 6, 2, 12);
        ctx.fillRect(x + 9, y + 11, 14, 2);

        // 4. Hollowed-log window planter box with mountain wildflowers
        ctx.fillStyle = isColored ? '#78350f' : '#334155';
        ctx.fillRect(x + 5, y + 20, 22, 6);
        ctx.fillStyle = isColored ? '#451a03' : '#1e293b';
        ctx.fillRect(x + 5, y + 25, 22, 1);

        if (isColored) {
          // Alpine bluebells, mountain arnica & ferns
          ctx.fillStyle = '#38bdf8'; // Bluebells
          ctx.fillRect(x + 7, y + 18, 3, 3);
          ctx.fillStyle = '#facc15'; // Arnica
          ctx.fillRect(x + 14, y + 18, 3, 3);
          ctx.fillStyle = '#c084fc'; // Purple lupine
          ctx.fillRect(x + 20, y + 18, 3, 3);
          // Forest fern fronds
          ctx.fillStyle = '#16a34a';
          ctx.fillRect(x + 6, y + 19, 2, 2);
          ctx.fillRect(x + 12, y + 19, 2, 2);
          ctx.fillRect(x + 18, y + 19, 2, 2);
          ctx.fillRect(x + 10, y + 22, 2, 3);
        } else {
          // Mode kabut: Embun beku (Frost) pada tepi planter kayu & jamur berpendar
          ctx.fillStyle = 'rgba(224, 242, 254, 0.8)';
          ctx.fillRect(x + 5, y + 20, 22, 1);
          ctx.fillRect(x + 7, y + 19, 3, 1);
          ctx.fillRect(x + 16, y + 19, 4, 1);

          // Jamur mungil berpendar redup di sela kotak kayu
          const shroomGlow = Math.sin(this.tickCount * 0.08 + x) * 0.25 + 0.75;
          ctx.fillStyle = `rgba(56, 189, 248, ${0.4 * shroomGlow})`;
          ctx.fillRect(x + 9, y + 17, 4, 4);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(x + 10, y + 18, 2, 2);
          ctx.fillStyle = '#bae6fd';
          ctx.fillRect(x + 10, y + 18, 1, 1);
        }

        // 5. Forged iron lantern bracket
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 2, y + 7, 3, 2);
        ctx.fillRect(x + 3, y + 5, 2, 6);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(x + 3, y + 6, 2, 3);
        ctx.fillStyle = 'rgba(254, 240, 138, 0.28)';
        ctx.fillRect(x + 1, y + 4, 6, 7);
        break;
      }

      case TILE.FOREST_CABIN_DOOR: {
        // --- PONDOK HUTAN PAK TEGUH: ARCHED OAK LOG DOOR WITH AXE CREST ---
        // 1. Peeled log wall background
        const logDark = isColored ? '#451a03' : '#0f172a';
        const logBase = isColored ? '#78350f' : '#1e293b';
        const logMid = isColored ? '#92400e' : '#334155';
        for (let i = 0; i < 4; i++) {
          const ly = y + i * 8;
          ctx.fillStyle = logDark;
          ctx.fillRect(x, ly + 6, TILE_SIZE, 2);
          ctx.fillStyle = logBase;
          ctx.fillRect(x, ly + 1, TILE_SIZE, 5);
          ctx.fillStyle = logMid;
          ctx.fillRect(x, ly + 1, TILE_SIZE, 2);
        }

        // 2. Thick split-log threshold step
        ctx.fillStyle = isColored ? '#78350f' : '#334155';
        ctx.fillRect(x + 5, y + 27, 22, 5);
        ctx.fillStyle = isColored ? '#b45309' : '#475569';
        ctx.fillRect(x + 7, y + 28, 18, 3);

        // 3. Arched oak timber door frame
        ctx.fillStyle = isColored ? '#292524' : '#0f172a';
        ctx.fillRect(x + 7, y + 2, 18, 26);

        // 4. Solid oak log planks
        ctx.fillStyle = isColored ? '#78350f' : '#1e293b';
        ctx.fillRect(x + 9, y + 4, 14, 23);
        ctx.fillStyle = isColored ? '#451a03' : '#0f172a';
        ctx.fillRect(x + 13, y + 4, 1, 23);
        ctx.fillRect(x + 18, y + 4, 1, 23);

        // 5. Woodcutter's crossed axes crest carved on door
        if (isColored) {
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(x + 14, y + 8, 4, 4);
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(x + 13, y + 7, 2, 2);
          ctx.fillRect(x + 17, y + 7, 2, 2);
        }

        // 6. Black forged iron studs & strap hinges
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 9, y + 7, 4, 2);
        ctx.fillRect(x + 9, y + 19, 4, 2);
        ctx.fillRect(x + 10, y + 13, 2, 2); // Stud
        ctx.fillRect(x + 20, y + 13, 2, 2); // Stud
        // Heavy brass handle ring
        ctx.fillStyle = isColored ? '#f59e0b' : '#94a3b8';
        ctx.fillRect(x + 19, y + 15, 2, 4);

        // 7. Porch awning with hanging forest amber lantern
        ctx.fillStyle = isColored ? '#451a03' : '#0f172a';
        ctx.fillRect(x + 4, y, 24, 3); // Awning beam
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 15, y + 2, 2, 3); // Chain
        ctx.fillStyle = isColored ? '#fef08a' : '#94a3b8';
        ctx.fillRect(x + 14, y + 4, 4, 4); // Lantern
        ctx.fillStyle = 'rgba(254, 240, 138, 0.3)';
        ctx.fillRect(x + 11, y + 2, 10, 8);
        break;
      }

      case TILE.FOREST_CABIN_ROOF: {
        // --- PONDOK HUTAN PAK TEGUH: MOSSY CEDAR SHAKE ROOF WITH RIVER STONE CHIMNEY ---
        ctx.fillStyle = isColored ? '#292524' : '#1e293b';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

        // 1. Deep timber cedar split-shake shingles
        const shakeBase = isColored ? '#44403c' : '#334155';
        const shakeLight = isColored ? '#57534e' : '#475569';
        const shakeDark = isColored ? '#1c1917' : '#0f172a';

        // Staggered wooden shake tiers
        for (let tier = 0; tier < 3; tier++) {
          const ty = y + 2 + tier * 9;
          ctx.fillStyle = shakeBase;
          ctx.fillRect(x, ty, TILE_SIZE, 8);
          ctx.fillStyle = shakeDark;
          ctx.fillRect(x, ty + 7, TILE_SIZE, 2);

          // Staggered vertical shingle gaps
          const offset = tier % 2 === 0 ? 0 : 4;
          for (let sx = offset; sx < TILE_SIZE; sx += 7) {
            ctx.fillStyle = shakeDark;
            ctx.fillRect(x + sx, ty, 1, 7);
            ctx.fillStyle = shakeLight;
            ctx.fillRect(x + sx + 1, ty + 1, 4, 2);
          }
        }

        // 2. Overgrown patches of lush emerald forest moss
        if (isColored) {
          ctx.fillStyle = '#15803d';
          ctx.fillRect(x + 3, y + 5, 8, 4);
          ctx.fillRect(x + 18, y + 14, 10, 5);
          ctx.fillRect(x + 8, y + 23, 12, 4);
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(x + 4, y + 6, 6, 2);
          ctx.fillRect(x + 20, y + 15, 6, 2);
          ctx.fillRect(x + 10, y + 24, 8, 2);
        }

        // Heavy cedar eave log at bottom
        ctx.fillStyle = isColored ? '#451a03' : '#0f172a';
        ctx.fillRect(x, y + TILE_SIZE - 3, TILE_SIZE, 3);

        // 3. River stone cobblestone chimney on column 12
        if (c === 12 && r === 2) {
          ctx.fillStyle = isColored ? '#475569' : '#1e293b';
          ctx.fillRect(x + 16, y - 10, 12, 16);
          // Cobblestone textures
          ctx.fillStyle = isColored ? '#64748b' : '#334155';
          ctx.fillRect(x + 17, y - 9, 4, 3);
          ctx.fillRect(x + 23, y - 9, 4, 3);
          ctx.fillRect(x + 18, y - 5, 5, 3);
          ctx.fillRect(x + 23, y - 4, 4, 4);
          ctx.fillRect(x + 17, y - 1, 4, 3);
          // Flat stone chimney cap
          ctx.fillStyle = isColored ? '#334155' : '#0f172a';
          ctx.fillRect(x + 15, y - 12, 14, 3);

          // Animated forest woodsmoke curls
          const smokeTime = this.tickCount * 0.07;
          for (let s = 0; s < 3; s++) {
            const smokeProgress = ((smokeTime + s * 1.2) % 3.6) / 3.6;
            const smokeY = y - 12 - smokeProgress * 24;
            const smokeX = x + 21 + Math.sin(smokeProgress * Math.PI * 2) * 5;
            const smokeSize = 3 + Math.floor(smokeProgress * 5);
            const smokeAlpha = (1 - smokeProgress) * 0.65;

            ctx.fillStyle = `rgba(241, 245, 249, ${smokeAlpha})`;
            ctx.fillRect(Math.floor(smokeX), Math.floor(smokeY), smokeSize, smokeSize);
          }
        }

        // 4. Carved pine finial ridge ornament on column 11
        if (c === 11 && r === 2 && isColored) {
          ctx.fillStyle = '#451a03';
          ctx.fillRect(x + 14, y - 6, 4, 8);
          ctx.fillStyle = '#15803d';
          ctx.fillRect(x + 13, y - 9, 6, 4);
          ctx.fillRect(x + 14, y - 12, 4, 4);
        }
        break;
      }

      case TILE.LOG_STACK: {
        // --- TUMPUKAN KAYU BAKAR PAK TEGUH & CHOPPING STUMP ---
        // Grass background
        ctx.fillStyle = isColored ? '#386641' : '#334155';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

        // 1. Stack of split firewood logs
        const barkColor = isColored ? '#451a03' : '#1e293b';
        const woodGrain = isColored ? '#b45309' : '#334155';
        const woodCore = isColored ? '#fde047' : '#64748b';

        // Base row of logs (3 logs)
        for (let l = 0; l < 3; l++) {
          const lx = x + 2 + l * 7;
          const ly = y + 14;
          ctx.fillStyle = barkColor;
          ctx.beginPath();
          ctx.arc(lx + 4, ly + 4, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = woodGrain;
          ctx.beginPath();
          ctx.arc(lx + 4, ly + 4, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = woodCore;
          ctx.fillRect(lx + 3, ly + 3, 2, 2);
        }

        // Top row of logs (2 logs stacked above)
        for (let l = 0; l < 2; l++) {
          const lx = x + 5 + l * 7;
          const ly = y + 8;
          ctx.fillStyle = barkColor;
          ctx.beginPath();
          ctx.arc(lx + 4, ly + 4, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = woodGrain;
          ctx.beginPath();
          ctx.arc(lx + 4, ly + 4, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = woodCore;
          ctx.fillRect(lx + 3, ly + 3, 2, 2);
        }

        // 2. Tree stump chopping block with embedded woodsman's axe
        ctx.fillStyle = isColored ? '#78350f' : '#1e293b';
        ctx.fillRect(x + 22, y + 12, 8, 12);
        ctx.fillStyle = isColored ? '#b45309' : '#334155';
        ctx.fillRect(x + 23, y + 13, 6, 2);

        if (isColored) {
          // Steel axe head embedded in stump
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(x + 24, y + 8, 5, 4);
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(x + 27, y + 8, 2, 4);
          // Wooden axe handle sticking out
          ctx.fillStyle = '#d97706';
          ctx.fillRect(x + 22, y + 3, 3, 7);

          // Scattered wood chips on grass
          ctx.fillStyle = '#fde047';
          ctx.fillRect(x + 18, y + 25, 2, 2);
          ctx.fillRect(x + 25, y + 26, 3, 2);
          ctx.fillRect(x + 29, y + 24, 2, 2);
        } else {
          // Benda Terpakai/Lusuh (Mode Kabut): Kapak penebang, serpihan kayu, dan keranjang anyaman rotan
          ctx.fillStyle = '#64748b';
          ctx.fillRect(x + 24, y + 8, 5, 4);
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(x + 27, y + 8, 2, 4);
          ctx.fillStyle = '#475569';
          ctx.fillRect(x + 22, y + 3, 3, 7);

          // Serpihan kayu di tanah
          ctx.fillStyle = '#64748b';
          ctx.fillRect(x + 18, y + 25, 2, 2);
          ctx.fillRect(x + 25, y + 26, 3, 2);

          // Keranjang anyaman rotan lusuh pengumpul ranting & kerucut pinus
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(x + 2, y + 21, 8, 8);
          ctx.fillStyle = '#334155';
          ctx.fillRect(x + 3, y + 22, 6, 6);
          ctx.fillStyle = '#475569';
          ctx.fillRect(x + 4, y + 20, 2, 4); // Ranting kayu bakar dalam keranjang
          ctx.fillRect(x + 6, y + 19, 2, 5);

          // Embun beku tipis pada puncak tumpukan kayu
          ctx.fillStyle = 'rgba(224, 242, 254, 0.75)';
          ctx.fillRect(x + 6, y + 8, 12, 1);

          // Pendaran lumut di dasar tunggul
          const stumpGlow = Math.sin(this.tickCount * 0.06 + x) * 0.25 + 0.75;
          ctx.fillStyle = `rgba(45, 212, 191, ${0.35 * stumpGlow})`;
          ctx.fillRect(x + 20, y + 23, 4, 3);
          ctx.fillStyle = '#2dd4bf';
          ctx.fillRect(x + 21, y + 23, 2, 2);
        }
        break;
      }

      case TILE.ZEN_WINDOW: {
        // --- PONDOK KAKEK DAMAI: KUMIKO SHOJI TRANSLUCENT SCREEN WINDOW ---
        const woodFrame = isColored ? '#78350f' : '#1e293b';
        const woodHighlight = isColored ? '#92400e' : '#334155';
        const plasterTone = isColored ? '#fef3c7' : '#334155';
        const bambooTone = isColored ? '#b45309' : '#1e293b';

        // 1. Plaster wall & bamboo wainscoting
        ctx.fillStyle = plasterTone;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = bambooTone;
        ctx.fillRect(x, y + TILE_SIZE - 8, TILE_SIZE, 8);
        ctx.fillStyle = woodFrame;
        ctx.fillRect(x, y, 3, TILE_SIZE);
        ctx.fillRect(x + TILE_SIZE - 3, y, 3, TILE_SIZE);

        // 2. Shoji window outer cedar frame
        ctx.fillStyle = isColored ? '#451a03' : '#0f172a';
        ctx.fillRect(x + 6, y + 3, 20, 18);

        // 3. Translucent washi rice paper glowing softly with warm amber/yellow light (Mode Kabut & Colored)
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(x + 7, y + 4, 18, 16);
        // Calming peach-amber inner serenity glow
        const zenPulse = Math.sin(this.tickCount * 0.05 + x * 0.1) * 0.04;
        ctx.fillStyle = `rgba(253, 230, 138, ${0.35 + zenPulse})`;
        ctx.fillRect(x + 7, y + 4, 18, 16);

        // 4. Intricate Kumiko geometric lattice grid
        ctx.fillStyle = isColored ? '#92400e' : '#334155';
        // Vertical lattice ribs
        ctx.fillRect(x + 11, y + 4, 1, 16);
        ctx.fillRect(x + 15, y + 4, 2, 16); // Center sliding frame
        ctx.fillRect(x + 20, y + 4, 1, 16);
        // Horizontal lattice ribs
        ctx.fillRect(x + 7, y + 8, 18, 1);
        ctx.fillRect(x + 7, y + 12, 18, 1);
        ctx.fillRect(x + 7, y + 16, 18, 1);

        // 5. Delicate bamboo roll-up screen (Sudare) along top
        ctx.fillStyle = isColored ? '#d97706' : '#475569';
        ctx.fillRect(x + 5, y + 2, 22, 3);
        break;
      }

      case TILE.ZEN_DOOR: {
        // --- PONDOK KAKEK DAMAI: SLIDING CEDAR SCREEN WITH RIVER STONE & GETA ---
        const plasterTone = isColored ? '#fef3c7' : '#334155';
        const woodFrame = isColored ? '#78350f' : '#1e293b';
        const bambooTone = isColored ? '#b45309' : '#1e293b';

        ctx.fillStyle = plasterTone;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = bambooTone;
        ctx.fillRect(x, y + TILE_SIZE - 8, TILE_SIZE, 8);

        // 1. Natural dark river stone entrance step (Kutsunugi-ishi)
        ctx.fillStyle = isColored ? '#475569' : '#1e293b';
        ctx.fillRect(x + 5, y + 27, 22, 5);
        ctx.fillStyle = isColored ? '#64748b' : '#334155';
        ctx.fillRect(x + 7, y + 27, 18, 2);

        // Neat pair of traditional wooden sandals (Geta) on the stone step
        if (isColored) {
          ctx.fillStyle = '#d97706'; // Wooden base
          ctx.fillRect(x + 11, y + 28, 3, 4);
          ctx.fillRect(x + 17, y + 28, 3, 4);
          ctx.fillStyle = '#dc2626'; // Red fabric thong (Hanao)
          ctx.fillRect(x + 12, y + 29, 1, 1);
          ctx.fillRect(x + 18, y + 29, 1, 1);
        }

        // 2. Sliding cedar door frame
        ctx.fillStyle = isColored ? '#451a03' : '#0f172a';
        ctx.fillRect(x + 7, y + 2, 18, 26);

        // 3. Fine horizontal cedar slats
        ctx.fillStyle = isColored ? '#92400e' : '#334155';
        ctx.fillRect(x + 9, y + 4, 14, 23);
        ctx.fillStyle = isColored ? '#78350f' : '#1e293b';
        for (let s = 6; s < 26; s += 3) {
          ctx.fillRect(x + 9, y + s, 14, 1);
        }

        // Center sliding joint & circular brass pull ring
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 15, y + 4, 2, 23);
        ctx.fillStyle = isColored ? '#fbbf24' : '#94a3b8';
        ctx.beginPath();
        ctx.arc(x + 18, y + 15, 2, 0, Math.PI * 2);
        ctx.stroke();

        // 4. Hanging paper lantern (Chochin) beside entrance
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 2, y + 7, 3, 1); // Rod
        ctx.fillStyle = isColored ? '#fef08a' : '#64748b';
        ctx.fillRect(x + 1, y + 8, 5, 8); // Paper body
        ctx.fillStyle = isColored ? '#dc2626' : '#334155';
        ctx.fillRect(x + 2, y + 10, 3, 4); // Red crest
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 1, y + 8, 5, 1);
        ctx.fillRect(x + 1, y + 15, 5, 1);
        break;
      }

      case TILE.ZEN_ROOF: {
        // --- PONDOK KAKEK DAMAI: CURVED JADE/TEAL PAGODA ROOF WITH TEMPLE WIND BELLS ---
        ctx.fillStyle = isColored ? '#042f2e' : '#0f172a';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

        // 1. Jade / Teal ceramic roof tiles (Kawara)
        const jadeBase = isColored ? '#0f766e' : '#1e293b';
        const jadeLight = isColored ? '#14b8a6' : '#334155';
        const jadeHighlight = isColored ? '#2dd4bf' : '#475569';
        const jadeDark = isColored ? '#115e59' : '#0f172a';

        // Three cascading curved tiers
        for (let tier = 0; tier < 3; tier++) {
          const ty = y + 2 + tier * 9;
          ctx.fillStyle = jadeBase;
          ctx.fillRect(x, ty, TILE_SIZE, 8);
          ctx.fillStyle = jadeDark;
          ctx.fillRect(x, ty + 7, TILE_SIZE, 2);

          // Curved ceramic tile ribs
          for (let tx = 2; tx < TILE_SIZE - 2; tx += 6) {
            ctx.fillStyle = jadeDark;
            ctx.fillRect(x + tx, ty, 1, 7);
            ctx.fillStyle = jadeHighlight;
            ctx.fillRect(x + tx + 1, ty + 1, 2, 5);
            ctx.fillStyle = jadeLight;
            ctx.fillRect(x + tx + 3, ty + 1, 2, 5);
          }
        }

        // 2. Sweeping upturned eaves (Sori) on left & right corners
        if (c === 28) {
          // Left corner upward flare
          ctx.fillStyle = jadeLight;
          ctx.fillRect(x, y + 22, 6, 6);
          ctx.fillRect(x, y + 18, 3, 5);
          // Copper wind bell (Furin) swaying under eave
          if (isColored) {
            const sway = Math.sin(this.tickCount * 0.06) * 1.5;
            ctx.fillStyle = '#d97706';
            ctx.fillRect(x + 2 + sway, y + 28, 2, 3);
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(x + 2 + sway, y + 31, 2, 4); // Paper wind strip
          }
        } else if (c === 32) {
          // Right corner upward flare
          ctx.fillStyle = jadeLight;
          ctx.fillRect(x + TILE_SIZE - 6, y + 22, 6, 6);
          ctx.fillRect(x + TILE_SIZE - 3, y + 18, 3, 5);
          // Copper wind bell (Furin)
          if (isColored) {
            const sway = Math.sin(this.tickCount * 0.06 + 1) * 1.5;
            ctx.fillStyle = '#d97706';
            ctx.fillRect(x + TILE_SIZE - 4 + sway, y + 28, 2, 3);
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(x + TILE_SIZE - 4 + sway, y + 31, 2, 4);
          }
        }

        // 3. Golden apex jewel finial (Hōju) on central ridge (c === 30)
        if (c === 30 && r === 19 && isColored) {
          ctx.fillStyle = '#d97706';
          ctx.fillRect(x + 14, y - 4, 4, 6);
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(x + 16, y - 6, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x + 15, y - 8, 2, 2);
        }
        break;
      }

      case TILE.STONE_LANTERN: {
        // --- LENTERA BATU TAMAN ZEN (KASUGA-TORO) ---
        // Manicured moss & raked white gravel base
        ctx.fillStyle = isColored ? '#386641' : '#334155';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

        if (isColored) {
          // Circular patch of fine garden sand/gravel
          ctx.fillStyle = '#e2e8f0';
          ctx.beginPath();
          ctx.arc(x + 16, y + 20, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#cbd5e1';
          ctx.beginPath();
          ctx.arc(x + 16, y + 20, 10, 0, Math.PI * 2);
          ctx.stroke();
          // Velvet garden moss rim
          ctx.fillStyle = '#15803d';
          ctx.fillRect(x + 6, y + 16, 4, 3);
          ctx.fillRect(x + 22, y + 18, 4, 3);
        }

        // 1. Granite stepped pedestal base (Kiso)
        ctx.fillStyle = isColored ? '#64748b' : '#334155';
        ctx.fillRect(x + 10, y + 26, 12, 4);
        ctx.fillStyle = isColored ? '#94a3b8' : '#475569';
        ctx.fillRect(x + 12, y + 23, 8, 3);

        // 2. Carved stone pillar (Sao)
        ctx.fillStyle = isColored ? '#64748b' : '#334155';
        ctx.fillRect(x + 14, y + 15, 4, 8);

        // 3. Middle platform (Chūdai)
        ctx.fillStyle = isColored ? '#94a3b8' : '#475569';
        ctx.fillRect(x + 11, y + 13, 10, 2);

        // 4. Fire chamber (Hibukuro) with candle flame
        ctx.fillStyle = isColored ? '#334155' : '#0f172a';
        ctx.fillRect(x + 12, y + 8, 8, 5);
        // Warm flame glow inside stone chamber
        ctx.fillStyle = isColored ? '#fef08a' : '#94a3b8';
        ctx.fillRect(x + 14, y + 9, 4, 3);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 15, y + 10, 2, 2);

        // 5. Flared stone umbrella roof (Kasa) & lotus jewel finial (Hōju)
        ctx.fillStyle = isColored ? '#64748b' : '#334155';
        ctx.fillRect(x + 9, y + 6, 14, 2);
        ctx.fillStyle = isColored ? '#94a3b8' : '#475569';
        ctx.fillRect(x + 12, y + 4, 8, 2);
        ctx.fillStyle = isColored ? '#cbd5e1' : '#64748b';
        ctx.fillRect(x + 15, y + 2, 2, 2);
        break;
      }

      case TILE.FLOWER_BED:
        ctx.fillStyle = isColored ? '#4d7c0f' : '#334155';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        if (isColored) {
          // Vivid flower blossoms
          const colors = ['#f43f5e', '#ec4899', '#eab308', '#a855f7'];
          for (let i = 0; i < 4; i++) {
            ctx.fillStyle = colors[i];
            ctx.fillRect(x + 6 + (i % 2) * 12, y + 6 + Math.floor(i / 2) * 12, 6, 6);
          }
        }
        break;

      case TILE.GRAND_OAK: {
        // --- POHON EK BESAR MEGAH DI SUDUT PLAZA (Grand Majestic Ancient Oak) ---
        // Kanopi megah bertingkat, batang ek tua berurat, bangku kayu melingkar & daun gugur
        const ox = x - 20;
        const oy = y - 44;

        // 1. Bayangan kanopi raksasa di atas ubin & rumput
        ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
        ctx.beginPath();
        ctx.ellipse(x + 16, y + 26, 32, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. Bangku Kayu Melingkari Batang Pohon Ek (Circular Oak Tree Bench)
        const benchWood = isColored ? '#92400e' : '#334155';
        const benchLight = isColored ? '#d97706' : '#64748b';
        ctx.fillStyle = benchWood;
        ctx.fillRect(x - 2, y + 18, 36, 6);
        ctx.fillStyle = benchLight;
        ctx.fillRect(x - 1, y + 18, 34, 2);
        // Kaki bangku
        ctx.fillStyle = isColored ? '#451a03' : '#1e293b';
        ctx.fillRect(x + 1, y + 24, 3, 5);
        ctx.fillRect(x + 14, y + 24, 4, 5);
        ctx.fillRect(x + 28, y + 24, 3, 5);

        // 3. Batang Ek Kokoh & Berakar (Gnarled Ancient Oak Trunk & Roots)
        const trunkDark = isColored ? '#451a03' : '#1e293b';
        const trunkBase = isColored ? '#78350f' : '#334155';
        const trunkLight = isColored ? '#92400e' : '#475569';
        const trunkHighlight = isColored ? '#b45309' : '#64748b';

        // Akar mencengkeram tanah
        ctx.fillStyle = trunkDark;
        ctx.fillRect(x + 4, y + 16, 24, 12);
        ctx.fillRect(x + 2, y + 22, 6, 6);
        ctx.fillRect(x + 24, y + 22, 6, 6);

        // Batang utama
        ctx.fillStyle = trunkBase;
        ctx.fillRect(x + 7, y + 4, 18, 18);
        ctx.fillStyle = trunkLight;
        ctx.fillRect(x + 9, y + 4, 14, 18);

        // Guratan tekstur kulit kayu (Bark furrows)
        ctx.fillStyle = trunkHighlight;
        ctx.fillRect(x + 11, y + 6, 2, 14);
        ctx.fillRect(x + 17, y + 8, 2, 12);
        ctx.fillStyle = trunkDark;
        ctx.fillRect(x + 14, y + 6, 2, 16);

        // Lumut hijau pada batang pohon
        if (isColored) {
          ctx.fillStyle = '#15803d';
          ctx.fillRect(x + 6, y + 14, 3, 6);
          ctx.fillRect(x + 8, y + 17, 2, 4);
        }

        // 4. Kanopi Daun Raksasa Bertingkat (Massive Multi-Tiered Leafy Oak Canopy)
        const leafDark = isColored ? '#14532d' : '#1e293b';
        const leafBase = isColored ? '#166534' : '#334155';
        const leafMid = isColored ? '#15803d' : '#475569';
        const leafLight = isColored ? '#22c55e' : '#64748b';
        const leafBright = isColored ? '#4ade80' : '#94a3b8';
        const leafSun = isColored ? '#86efac' : '#cbd5e1';

        // Gumpalan bayangan kanopi bawah
        ctx.fillStyle = leafDark;
        ctx.beginPath();
        ctx.arc(ox + 20, oy + 44, 18, 0, Math.PI * 2);
        ctx.arc(ox + 52, oy + 44, 18, 0, Math.PI * 2);
        ctx.arc(ox + 36, oy + 32, 24, 0, Math.PI * 2);
        ctx.fill();

        // Gumpalan dedaunan utama
        ctx.fillStyle = leafBase;
        ctx.beginPath();
        ctx.arc(ox + 18, oy + 40, 16, 0, Math.PI * 2);
        ctx.arc(ox + 54, oy + 40, 16, 0, Math.PI * 2);
        ctx.arc(ox + 36, oy + 28, 22, 0, Math.PI * 2);
        ctx.arc(ox + 24, oy + 22, 18, 0, Math.PI * 2);
        ctx.arc(ox + 48, oy + 22, 18, 0, Math.PI * 2);
        ctx.fill();

        // Tingkat dedaunan tengah dengan rona segar
        ctx.fillStyle = leafMid;
        ctx.beginPath();
        ctx.arc(ox + 22, oy + 36, 14, 0, Math.PI * 2);
        ctx.arc(ox + 50, oy + 36, 14, 0, Math.PI * 2);
        ctx.arc(ox + 36, oy + 24, 18, 0, Math.PI * 2);
        ctx.arc(ox + 26, oy + 18, 14, 0, Math.PI * 2);
        ctx.arc(ox + 46, oy + 18, 14, 0, Math.PI * 2);
        ctx.fill();

        // Puncak kanopi terpapar sinar matahari
        ctx.fillStyle = leafLight;
        ctx.beginPath();
        ctx.arc(ox + 26, oy + 16, 11, 0, Math.PI * 2);
        ctx.arc(ox + 46, oy + 16, 11, 0, Math.PI * 2);
        ctx.arc(ox + 36, oy + 14, 14, 0, Math.PI * 2);
        ctx.fill();

        // Kilau daun keemasan dan pucuk muda
        ctx.fillStyle = leafBright;
        ctx.fillRect(ox + 24, oy + 10, 8, 4);
        ctx.fillRect(ox + 40, oy + 11, 8, 4);
        ctx.fillRect(ox + 32, oy + 6, 8, 4);
        ctx.fillStyle = leafSun;
        ctx.fillRect(ox + 34, oy + 7, 4, 2);

        // 5. Butir Biji Ek Keemasan (Golden Acorns nestled in canopy)
        if (isColored) {
          const acorns = [
            { ax: ox + 18, ay: oy + 34 },
            { ax: ox + 32, ay: oy + 26 },
            { ax: ox + 48, ay: oy + 30 },
            { ax: ox + 38, ay: oy + 42 },
          ];
          for (const { ax, ay } of acorns) {
            ctx.fillStyle = '#78350f';
            ctx.fillRect(ax, ay, 4, 2);
            ctx.fillStyle = '#ca8a04';
            ctx.fillRect(ax + 1, ay + 2, 2, 3);
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(ax + 1, ay + 2, 1, 1);
          }

          // Daun ek berguguran melayang santai ditiup angin
          const leafTime = this.tickCount * 0.05;
          const leafX = ox + 30 + Math.sin(leafTime) * 16;
          const leafY = oy + 20 + ((this.tickCount * 0.8) % 40);
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(Math.floor(leafX), Math.floor(leafY), 2, 3);
          ctx.fillStyle = '#86efac';
          ctx.fillRect(Math.floor(leafX) + 1, Math.floor(leafY), 1, 1);
        }
        break;
      }

      case TILE.PLAZA_PLANTER: {
        // --- TANAMAN HIAS DALAM POT BESAR (Large Potted Ornamental Planter) ---
        // 1. Bayangan pot di atas lantai plaza
        ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
        ctx.fillRect(x + 3, y + 25, 26, 6);

        // 2. Guci Pot Besar Terakota / Batu Pahat
        const potDark = isColored ? '#78350f' : '#1e293b';
        const potBase = isColored ? '#9a3412' : '#334155';
        const potMid = isColored ? '#c2410c' : '#475569';
        const potLight = isColored ? '#ea580c' : '#64748b';
        const potGold = isColored ? '#f59e0b' : '#94a3b8';

        // Kaki alas pot bertingkat
        ctx.fillStyle = potDark;
        ctx.fillRect(x + 7, y + 26, 18, 4);
        ctx.fillStyle = potBase;
        ctx.fillRect(x + 8, y + 26, 16, 2);

        // Badan pot terakota mengembang
        ctx.fillStyle = potDark;
        ctx.fillRect(x + 5, y + 14, 22, 12);
        ctx.fillStyle = potBase;
        ctx.fillRect(x + 6, y + 14, 20, 11);
        ctx.fillStyle = potMid;
        ctx.fillRect(x + 8, y + 15, 16, 9);
        ctx.fillStyle = potLight;
        ctx.fillRect(x + 9, y + 16, 5, 7);

        // Sabuk ornamen tembaga / emas di leher pot
        ctx.fillStyle = potGold;
        ctx.fillRect(x + 5, y + 17, 22, 2);
        ctx.fillStyle = isColored ? '#fef08a' : '#cbd5e1';
        ctx.fillRect(x + 9, y + 17, 4, 1);

        // Bibir atas pot berprofil tebal
        ctx.fillStyle = potDark;
        ctx.fillRect(x + 4, y + 12, 24, 3);
        ctx.fillStyle = potMid;
        ctx.fillRect(x + 5, y + 12, 22, 2);
        ctx.fillStyle = potLight;
        ctx.fillRect(x + 6, y + 12, 20, 1);

        // 3. Tanaman Hias Daun Rimbun Bulat (Sculpted Ornamental Topiary)
        const shrubDark = isColored ? '#14532d' : '#1e293b';
        const shrubBase = isColored ? '#166534' : '#334155';
        const shrubMid = isColored ? '#15803d' : '#475569';
        const shrubLight = isColored ? '#22c55e' : '#64748b';
        const shrubHighlight = isColored ? '#4ade80' : '#94a3b8';

        ctx.fillStyle = shrubDark;
        ctx.beginPath();
        ctx.arc(x + 16, y + 7, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = shrubBase;
        ctx.beginPath();
        ctx.arc(x + 16, y + 7, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = shrubMid;
        ctx.beginPath();
        ctx.arc(x + 15, y + 6, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = shrubLight;
        ctx.beginPath();
        ctx.arc(x + 14, y + 5, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = shrubHighlight;
        ctx.fillRect(x + 13, y + 3, 3, 2);

        // 4. Sulur daun menjuntai ke sisi pot & bunga mekar cerah
        if (isColored) {
          ctx.fillStyle = '#15803d';
          ctx.fillRect(x + 5, y + 14, 2, 7);
          ctx.fillRect(x + 24, y + 15, 2, 6);
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(x + 6, y + 17, 2, 3);
          ctx.fillRect(x + 23, y + 18, 2, 2);

          ctx.fillStyle = '#f43f5e';
          ctx.fillRect(x + 12, y + 5, 3, 3);
          ctx.fillRect(x + 18, y + 8, 3, 3);
          ctx.fillRect(x + 6, y + 19, 2, 2);
          ctx.fillStyle = '#fda4af';
          ctx.fillRect(x + 13, y + 6, 1, 1);
          ctx.fillRect(x + 19, y + 9, 1, 1);
        }
        break;
      }

      case TILE.FLOWERING_BUSH: {
        // --- SEMAK BERBUNGA (Dense Blooming Flowering Shrub) ---
        // Latar rumput
        ctx.fillStyle = isColored ? '#386641' : '#334155';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

        // Bayangan semak di tanah
        ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
        ctx.beginPath();
        ctx.ellipse(x + 16, y + 25, 14, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Dedaunan rimbun semak bertingkat
        const bushDark = isColored ? '#14532d' : '#1e293b';
        const bushBase = isColored ? '#166534' : '#334155';
        const bushMid = isColored ? '#15803d' : '#475569';
        const bushLight = isColored ? '#22c55e' : '#64748b';
        const bushHighlight = isColored ? '#4ade80' : '#94a3b8';

        ctx.fillStyle = bushDark;
        ctx.beginPath();
        ctx.arc(x + 10, y + 18, 9, 0, Math.PI * 2);
        ctx.arc(x + 22, y + 18, 9, 0, Math.PI * 2);
        ctx.arc(x + 16, y + 12, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = bushBase;
        ctx.beginPath();
        ctx.arc(x + 10, y + 17, 8, 0, Math.PI * 2);
        ctx.arc(x + 22, y + 17, 8, 0, Math.PI * 2);
        ctx.arc(x + 16, y + 11, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = bushMid;
        ctx.beginPath();
        ctx.arc(x + 11, y + 15, 6, 0, Math.PI * 2);
        ctx.arc(x + 21, y + 15, 6, 0, Math.PI * 2);
        ctx.arc(x + 16, y + 10, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = bushLight;
        ctx.fillRect(x + 13, y + 6, 6, 3);
        ctx.fillRect(x + 8, y + 11, 4, 3);
        ctx.fillRect(x + 20, y + 11, 4, 3);
        ctx.fillStyle = bushHighlight;
        ctx.fillRect(x + 14, y + 7, 4, 1);

        // Gugusan bunga mekar beraneka ragam (Hydrangea, Lilac, Marigold, Jasmine)
        if (isColored) {
          // 1. Kelopak Hydrangea Merah Muda (Pink Hydrangea)
          ctx.fillStyle = '#ec4899';
          ctx.fillRect(x + 6, y + 13, 4, 4);
          ctx.fillStyle = '#f472b6';
          ctx.fillRect(x + 7, y + 12, 2, 2);
          ctx.fillRect(x + 5, y + 15, 2, 2);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x + 7, y + 14, 1, 1);

          // 2. Kelopak Lilac Ungu (Violet Lilac)
          ctx.fillStyle = '#7e22ce';
          ctx.fillRect(x + 21, y + 12, 4, 4);
          ctx.fillStyle = '#a855f7';
          ctx.fillRect(x + 22, y + 11, 2, 2);
          ctx.fillRect(x + 20, y + 14, 2, 2);
          ctx.fillStyle = '#f3e8ff';
          ctx.fillRect(x + 22, y + 13, 1, 1);

          // 3. Marigold Emas Cerah (Golden Marigold) di tengah atas
          ctx.fillStyle = '#d97706';
          ctx.fillRect(x + 14, y + 8, 4, 4);
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(x + 15, y + 7, 2, 2);
          ctx.fillRect(x + 13, y + 9, 2, 2);
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(x + 15, y + 9, 1, 1);

          // 4. Bunga Melati Bintang Putih Kecil (White Jasmine stars)
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x + 11, y + 19, 2, 2);
          ctx.fillRect(x + 18, y + 18, 2, 2);
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(x + 11, y + 19, 1, 1);

          // Kilau embun pagi pada daun
          if (this.tickCount % 30 < 15) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x + 17, y + 5, 1, 1);
          }
        }
        break;
      }

      case TILE.CLIFF:
      default:
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
        break;
    }
  }

  // Draw player sprite with walking frames, scarf & glowing resonance compass matching the reference image
  private drawPlayer(player: Player, isCompassActive: boolean = false) {
    const ctx = this.ctx;
    const px = Math.floor(player.x);
    const py = Math.floor(player.y);

    // Walking animation cycle: rhythm, bobbing, and limb offsets
    const walkSpeed = 0.28;
    const walkTick = player.isMoving ? this.tickCount * walkSpeed : 0;
    // Crisp pixel vertical bobbing (bounces down/up during footsteps, gentle breath when idle)
    const bob = player.isMoving
      ? Math.floor(Math.sin(walkTick * 2) * 1.5)
      : Math.floor(Math.sin(this.tickCount * 0.05) * 0.5);

    // Subtle backpack inertia bobbing: slightly offset in phase from body bob to simulate leather bag weight & momentum
    const backpackBob = player.isMoving
      ? Math.round(Math.sin(walkTick * 2 - 0.45) * 1.8)
      : Math.round(Math.sin(this.tickCount * 0.05 - 0.3) * 0.5);

    // 1. Soft oval ground shadow beneath feet
    ctx.fillStyle = 'rgba(18, 38, 28, 0.42)';
    ctx.beginPath();
    ctx.ellipse(px + 16, py + 29, 11, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    const isGirl = this.playerAvatar === 'girl';

    // Color Palette matching the reference image (karakter ezzel & ezzy)
    // For Girl Avatar (Ezzy): vibrant bright-colored tunic ("baju yang berwarna cerah")
    const HAIR_COLOR = isGirl ? '#8d5524' : '#8e4a23';       // Warm chestnut brown hair
    const HAIR_DARK = isGirl ? '#6b3713' : '#723816';        // Hair shadow/outline
    const SKIN_COLOR = '#fcd0a1';                            // Warm peach skin tone
    const EYE_COLOR = '#172033';                             // Dark navy/charcoal eye blocks
    const SCARF_COLOR = '#ef4444';                           // Vibrant warm red scarf
    const SCARF_SHADOW = '#dc2626';                          // Scarf fold shade
    const TUNIC_COLOR = isGirl ? '#06b6d4' : '#259d88';       // Bright radiant cyan for Ezzy ("baju cerah")
    const TUNIC_SHADOW = isGirl ? '#0891b2' : '#1b7d6c';      // Tunic shadow
    const TUNIC_HIGHLIGHT = isGirl ? '#67e8f9' : '#34d399';   // Bright tunic highlight
    const BUCKLE_COLOR = '#f4b728';                          // Golden yellow belt buckle
    const BUCKLE_SHADOW = '#d99b16';                         // Buckle shade
    const BELT_COLOR = isGirl ? '#78350f' : '#1f483f';        // Brown leather belt for Ezzy
    const PANTS_COLOR = '#232d3f';                           // Dark blue-gray pants
    const BACKPACK_COLOR = '#532924';                        // Rich warm leather brown backpack
    const BACKPACK_SHADOW = '#3c1c18';                       // Backpack shadow/straps
    const BACKPACK_STRAP = '#3e201b';                        // Dark leather strap
    const BACKPACK_HIGHLIGHT = '#6a3630';                    // Backpack highlight
    const MAT_COLOR = '#b8b894';                             // Rolled sleeping mat / bedroll
    const MAT_SHADOW = '#8c8c66';                            // Sleeping mat shadow
    const CANTEEN_COLOR = '#93c5fd';                          // Water canteen bottle
    const CANTEEN_SHADOW = '#60a5fa';                         // Water canteen shadow
    const RIBBON_COLOR = '#f43f5e';                           // Bright pink ribbons

    // Compass anchor position based on orientation
    let compassX = px + 16;
    let compassY = py + 24 + bob;

    // 2. Render Character Body & Limbs by Direction matching 4-panel reference
    if (player.facing === 'down') {
      // ===== DEPAN / FRONT VIEW (Panel 1: Top-Left of reference) =====
      const legStride = player.isMoving ? Math.round(Math.sin(walkTick) * 3) : 0;

      // Backpack visible peeking behind shoulders and sides with inertia bobbing
      ctx.fillStyle = BACKPACK_SHADOW;
      ctx.fillRect(px + 6, py + 12 + backpackBob, 20, 14);
      ctx.fillStyle = BACKPACK_COLOR;
      ctx.fillRect(px + 7, py + 13 + backpackBob, 18, 12);

      // Rolled sleeping mat and canteen peeking behind shoulders (for Ezzy)
      if (isGirl) {
        ctx.fillStyle = MAT_SHADOW;
        ctx.fillRect(px + 6, py + 23 + backpackBob, 20, 2);
        ctx.fillStyle = MAT_COLOR;
        ctx.fillRect(px + 7, py + 23 + backpackBob, 18, 2);
        // Water canteen peeking on right side
        ctx.fillStyle = CANTEEN_COLOR;
        ctx.fillRect(px + 25, py + 16 + backpackBob, 2, 4);
      }

      // Pants / Legs (Dark charcoal/navy)
      ctx.fillStyle = PANTS_COLOR;
      if (player.isMoving) {
        ctx.fillRect(px + 10, py + 24 + legStride, 5, 6 - Math.max(0, legStride));
        ctx.fillRect(px + 17, py + 24 - legStride, 5, 6 - Math.max(0, -legStride));
      } else {
        ctx.fillRect(px + 10, py + 24, 5, 6);
        ctx.fillRect(px + 17, py + 24, 5, 6);
      }

      // Torso / Tunic (Baju Cerah for Ezzy)
      ctx.fillStyle = TUNIC_COLOR;
      ctx.fillRect(px + 8, py + 15 + bob, 16, 10);
      if (isGirl) {
        ctx.fillStyle = TUNIC_HIGHLIGHT;
        ctx.fillRect(px + 9, py + 15 + bob, 14, 2);
      }

      // Belt Line & Buckle
      ctx.fillStyle = BELT_COLOR;
      ctx.fillRect(px + 8, py + 22 + bob, 16, 2);
      ctx.fillStyle = BUCKLE_COLOR;
      ctx.fillRect(px + 14, py + 21 + bob, 4, 4);
      ctx.fillStyle = BUCKLE_SHADOW;
      ctx.fillRect(px + 14, py + 24 + bob, 4, 1);

      // Backpack Straps passing down the chest (dark brown leather straps)
      ctx.fillStyle = BACKPACK_STRAP;
      ctx.fillRect(px + 10, py + 15 + bob, 2, 7);
      ctx.fillRect(px + 20, py + 15 + bob, 2, 7);

      // Sleeves & Hands (Peach hands at sides)
      ctx.fillStyle = TUNIC_COLOR;
      ctx.fillRect(px + 6, py + 16 + bob, 2, 5);
      ctx.fillRect(px + 24, py + 16 + bob, 2, 5);
      if (isGirl) {
        ctx.fillStyle = TUNIC_HIGHLIGHT;
        ctx.fillRect(px + 6, py + 16 + bob, 2, 1);
        ctx.fillRect(px + 24, py + 16 + bob, 2, 1);
      }
      ctx.fillStyle = SKIN_COLOR;
      ctx.fillRect(px + 6, py + 21 + bob, 4, 3);
      ctx.fillRect(px + 22, py + 21 + bob, 4, 3);

      // Red Scarf across collar (Vibrant red horizontal bar)
      ctx.fillStyle = SCARF_COLOR;
      ctx.fillRect(px + 7, py + 13 + bob, 18, 3);
      ctx.fillStyle = SCARF_SHADOW;
      ctx.fillRect(px + 7, py + 15 + bob, 18, 1);

      // Face (Warm peach square canvas)
      ctx.fillStyle = SKIN_COLOR;
      ctx.fillRect(px + 8, py + 7 + bob, 16, 7);

      // Hair (Brown blocky hair with top and side locks framing the eyes)
      ctx.fillStyle = HAIR_COLOR;
      ctx.fillRect(px + 7, py + 3 + bob, 18, 5);  // Top hair block
      ctx.fillRect(px + 7, py + 7 + bob, 2, 3);   // Left side lock
      ctx.fillRect(px + 23, py + 7 + bob, 2, 3);  // Right side lock
      // Subtle top hair line
      ctx.fillStyle = HAIR_DARK;
      ctx.fillRect(px + 7, py + 3 + bob, 18, 1);

      // Two Distinct Dark Square Eyes
      ctx.fillStyle = EYE_COLOR;
      ctx.fillRect(px + 10, py + 8 + bob, 3, 3);
      ctx.fillRect(px + 19, py + 8 + bob, 3, 3);
      // Eye Catchlights
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + 10, py + 8 + bob, 1, 1);
      ctx.fillRect(px + 19, py + 8 + bob, 1, 1);

      // Girl Avatar features (Twin ribbons, ponytail bobs, bangs and rosy cheeks)
      if (isGirl) {
        // Forehead bangs dip
        ctx.fillStyle = HAIR_COLOR;
        ctx.fillRect(px + 13, py + 7 + bob, 2, 1);
        ctx.fillRect(px + 17, py + 7 + bob, 2, 1);

        // Rosy Cheeks
        ctx.fillStyle = '#fda4af';
        ctx.fillRect(px + 9, py + 11 + bob, 3, 1);
        ctx.fillRect(px + 20, py + 11 + bob, 3, 1);

        // Twin Hairclips / Pink Bows
        ctx.fillStyle = RIBBON_COLOR;
        ctx.fillRect(px + 4, py + 5 + bob, 3, 3);
        ctx.fillRect(px + 25, py + 5 + bob, 3, 3);
        ctx.fillStyle = '#ffe4e6';
        ctx.fillRect(px + 5, py + 6 + bob, 1, 1);
        ctx.fillRect(px + 26, py + 6 + bob, 1, 1);

        // Twin Ponytails
        ctx.fillStyle = HAIR_COLOR;
        ctx.fillRect(px + 3, py + 7 + bob, 3, 6);
        ctx.fillRect(px + 26, py + 7 + bob, 3, 6);
        ctx.fillStyle = HAIR_DARK;
        ctx.fillRect(px + 3, py + 11 + bob, 3, 2);
        ctx.fillRect(px + 26, py + 11 + bob, 3, 2);
      }

      compassX = px + 16;
      compassY = py + 24 + bob;
    } else if (player.facing === 'up') {
      // ===== BELAKANG / BACK VIEW (Panel 2: Top-Right of reference) =====
      const legStride = player.isMoving ? Math.round(Math.sin(walkTick) * 3) : 0;

      // Pants / Legs
      ctx.fillStyle = PANTS_COLOR;
      if (player.isMoving) {
        ctx.fillRect(px + 10, py + 24 + legStride, 5, 6);
        ctx.fillRect(px + 17, py + 24 - legStride, 5, 6);
      } else {
        ctx.fillRect(px + 10, py + 24, 5, 6);
        ctx.fillRect(px + 17, py + 24, 5, 6);
      }

      // Torso / Tunic base (shoulders peek behind the backpack)
      ctx.fillStyle = TUNIC_COLOR;
      ctx.fillRect(px + 8, py + 15 + bob, 16, 10);

      // Sleeves & Hands visible on the sides
      ctx.fillStyle = TUNIC_COLOR;
      ctx.fillRect(px + 6, py + 16 + bob, 2, 5);
      ctx.fillRect(px + 24, py + 16 + bob, 2, 5);
      if (isGirl) {
        ctx.fillStyle = TUNIC_HIGHLIGHT;
        ctx.fillRect(px + 6, py + 16 + bob, 2, 1);
        ctx.fillRect(px + 24, py + 16 + bob, 2, 1);
      }
      ctx.fillStyle = SKIN_COLOR;
      ctx.fillRect(px + 6, py + 21 + bob, 4, 3);
      ctx.fillRect(px + 22, py + 21 + bob, 4, 3);

      // Red Scarf across the back of the neck
      ctx.fillStyle = SCARF_COLOR;
      ctx.fillRect(px + 7, py + 13 + bob, 18, 3);

      // Full Brown Hair (Back of head)
      ctx.fillStyle = HAIR_COLOR;
      ctx.fillRect(px + 7, py + 3 + bob, 18, 11);
      ctx.fillStyle = HAIR_DARK;
      ctx.fillRect(px + 7, py + 3 + bob, 18, 1);

      // Tiny peach neck/ear tabs on left and right
      ctx.fillStyle = SKIN_COLOR;
      ctx.fillRect(px + 8, py + 12 + bob, 2, 2);
      ctx.fillRect(px + 22, py + 12 + bob, 2, 2);

      // Girl Avatar features (Back view: Twin ribbons and ponytail bobs)
      if (isGirl) {
        ctx.fillStyle = RIBBON_COLOR;
        ctx.fillRect(px + 4, py + 5 + bob, 3, 3);
        ctx.fillRect(px + 25, py + 5 + bob, 3, 3);
        ctx.fillStyle = '#ffe4e6';
        ctx.fillRect(px + 5, py + 6 + bob, 1, 1);
        ctx.fillRect(px + 26, py + 6 + bob, 1, 1);

        ctx.fillStyle = HAIR_COLOR;
        ctx.fillRect(px + 3, py + 7 + bob, 3, 7);
        ctx.fillRect(px + 26, py + 7 + bob, 3, 7);
        ctx.fillStyle = HAIR_DARK;
        ctx.fillRect(px + 3, py + 12 + bob, 3, 2);
        ctx.fillRect(px + 26, py + 12 + bob, 3, 2);
      }

      // ===== PROMINENT BROWN BACKPACK ON THE BACK (Inertia bobbing synced to walk cycle) =====
      // Matches Panel 2 of reference image:
      // Dark brown rounded box with outline and darker horizontal flap/buckle straps
      ctx.fillStyle = BACKPACK_SHADOW;
      ctx.fillRect(px + 9, py + 14 + backpackBob, 14, 13);
      ctx.fillRect(px + 8, py + 15 + backpackBob, 16, 11);
      // Main backpack body (Rich brown)
      ctx.fillStyle = BACKPACK_COLOR;
      ctx.fillRect(px + 9, py + 15 + backpackBob, 14, 11);
      ctx.fillStyle = BACKPACK_HIGHLIGHT;
      ctx.fillRect(px + 10, py + 15 + backpackBob, 12, 2);
      // Backpack flap detail & buckle straps
      ctx.fillStyle = BACKPACK_STRAP;
      ctx.fillRect(px + 10, py + 18 + backpackBob, 12, 2); // Horizontal flap strap
      ctx.fillRect(px + 12, py + 17 + backpackBob, 2, 4);  // Left vertical buckle tab
      ctx.fillRect(px + 18, py + 17 + backpackBob, 2, 4);  // Right vertical buckle tab

      // Equipment for Ezzy (Back view matching reference):
      if (isGirl) {
        // Water Canteen on right side of backpack
        ctx.fillStyle = CANTEEN_SHADOW;
        ctx.fillRect(px + 24, py + 16 + backpackBob, 3, 6);
        ctx.fillStyle = CANTEEN_COLOR;
        ctx.fillRect(px + 24, py + 17 + backpackBob, 2, 4);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(px + 24, py + 16 + backpackBob, 1, 2);
        ctx.fillStyle = BACKPACK_STRAP;
        ctx.fillRect(px + 23, py + 19 + backpackBob, 3, 1);

        // Rolled Sleeping Mat / Bedroll underneath the backpack
        ctx.fillStyle = MAT_SHADOW;
        ctx.fillRect(px + 7, py + 25 + backpackBob, 18, 4);
        ctx.fillStyle = MAT_COLOR;
        ctx.fillRect(px + 8, py + 25 + backpackBob, 16, 3);
        ctx.fillStyle = BACKPACK_STRAP;
        ctx.fillRect(px + 11, py + 25 + backpackBob, 2, 4);
        ctx.fillRect(px + 19, py + 25 + backpackBob, 2, 4);
      }

      compassX = px + 16;
      compassY = py + 24 + bob;
    } else if (player.facing === 'right') {
      // ===== KANAN / SIDE RIGHT VIEW (Panel 3: Bottom-Left of reference) =====
      const legSwing = player.isMoving ? Math.round(Math.sin(walkTick) * 3.5) : 0;

      // Legs / Pants (Side scissor stride)
      ctx.fillStyle = PANTS_COLOR;
      if (player.isMoving) {
        ctx.fillRect(px + 14 + legSwing, py + 24, 6, 6);
        ctx.fillRect(px + 9 - legSwing, py + 24, 6, 6);
      } else {
        ctx.fillRect(px + 11, py + 24, 7, 6);
      }

      // ===== PROMINENT BACKPACK ON THE BACK (Protrudes on left side with inertia bobbing) =====
      ctx.fillStyle = BACKPACK_SHADOW;
      ctx.fillRect(px + 5, py + 14 + backpackBob, 5, 12);
      ctx.fillRect(px + 6, py + 13 + backpackBob, 4, 14);
      ctx.fillStyle = BACKPACK_COLOR;
      ctx.fillRect(px + 6, py + 14 + backpackBob, 4, 12);
      ctx.fillStyle = BACKPACK_HIGHLIGHT;
      ctx.fillRect(px + 7, py + 14 + backpackBob, 2, 4);

      // Accessories for Ezzy on backpack (Right facing view)
      if (isGirl) {
        // Water canteen on backpack side
        ctx.fillStyle = CANTEEN_SHADOW;
        ctx.fillRect(px + 3, py + 16 + backpackBob, 3, 5);
        ctx.fillStyle = CANTEEN_COLOR;
        ctx.fillRect(px + 4, py + 17 + backpackBob, 2, 3);
        // Rolled sleeping mat underneath
        ctx.fillStyle = MAT_SHADOW;
        ctx.fillRect(px + 4, py + 25 + backpackBob, 8, 4);
        ctx.fillStyle = MAT_COLOR;
        ctx.fillRect(px + 5, py + 25 + backpackBob, 6, 3);
        ctx.fillStyle = BACKPACK_STRAP;
        ctx.fillRect(px + 7, py + 25 + backpackBob, 1, 4);
      }

      // Torso / Bright Tunic
      ctx.fillStyle = TUNIC_COLOR;
      ctx.fillRect(px + 10, py + 15 + bob, 11, 10);
      if (isGirl) {
        ctx.fillStyle = TUNIC_HIGHLIGHT;
        ctx.fillRect(px + 11, py + 15 + bob, 9, 2);
      }

      // Dark Belt Line
      ctx.fillStyle = BELT_COLOR;
      ctx.fillRect(px + 9, py + 22 + bob, 12, 2);

      // Yellow Buckle at front edge (Right waist)
      ctx.fillStyle = BUCKLE_COLOR;
      ctx.fillRect(px + 19, py + 21 + bob, 3, 4);

      // Backpack Shoulder Strap going down front chest
      ctx.fillStyle = BACKPACK_STRAP;
      ctx.fillRect(px + 16, py + 15 + bob, 2, 5);

      // Arm & Hand (Peach hand facing forward)
      ctx.fillStyle = TUNIC_COLOR;
      ctx.fillRect(px + 13, py + 16 + bob, 4, 6);
      ctx.fillStyle = SKIN_COLOR;
      ctx.fillRect(px + 14, py + 21 + bob, 3, 3);

      // Red Scarf under chin (wrapping from neck around)
      ctx.fillStyle = SCARF_COLOR;
      ctx.fillRect(px + 9, py + 13 + bob, 12, 3);
      ctx.fillStyle = SCARF_SHADOW;
      ctx.fillRect(px + 9, py + 15 + bob, 12, 1);

      // Face Skin Profile (with step for nose on the right)
      ctx.fillStyle = SKIN_COLOR;
      ctx.fillRect(px + 11, py + 7 + bob, 10, 7);
      // Nose step
      ctx.fillRect(px + 20, py + 9 + bob, 2, 3);

      // Hair (Brown blocky hair covering top and back)
      ctx.fillStyle = HAIR_COLOR;
      ctx.fillRect(px + 8, py + 3 + bob, 13, 5);  // Top hair
      ctx.fillRect(px + 8, py + 4 + bob, 5, 9);   // Back hair block
      ctx.fillStyle = HAIR_DARK;
      ctx.fillRect(px + 8, py + 3 + bob, 13, 1);

      // One Dark Square Eye on the right profile
      ctx.fillStyle = EYE_COLOR;
      ctx.fillRect(px + 17, py + 8 + bob, 2, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + 17, py + 8 + bob, 1, 1);

      // Girl Avatar details (Right view: ribbon, ponytail, side bangs, blush)
      if (isGirl) {
        ctx.fillStyle = '#fda4af';
        ctx.fillRect(px + 18, py + 11 + bob, 2, 1); // Rosy cheek
        // Ribbon
        ctx.fillStyle = RIBBON_COLOR;
        ctx.fillRect(px + 7, py + 5 + bob, 3, 3);
        ctx.fillStyle = '#ffe4e6';
        ctx.fillRect(px + 8, py + 6 + bob, 1, 1);
        // Ponytail bob
        ctx.fillStyle = HAIR_COLOR;
        ctx.fillRect(px + 6, py + 7 + bob, 3, 6);
        ctx.fillStyle = HAIR_DARK;
        ctx.fillRect(px + 6, py + 11 + bob, 3, 2);
        // Side bangs
        ctx.fillStyle = HAIR_COLOR;
        ctx.fillRect(px + 15, py + 6 + bob, 2, 4);
      }

      compassX = px + 21;
      compassY = py + 24 + bob;
    } else if (player.facing === 'left') {
      // ===== KIRI / SIDE LEFT VIEW (Panel 4: Bottom-Right of reference) =====
      const legSwing = player.isMoving ? Math.round(Math.sin(walkTick) * 3.5) : 0;

      // Legs / Pants (Side scissor stride)
      ctx.fillStyle = PANTS_COLOR;
      if (player.isMoving) {
        ctx.fillRect(px + 9 - legSwing, py + 24, 6, 6);
        ctx.fillRect(px + 14 + legSwing, py + 24, 6, 6);
      } else {
        ctx.fillRect(px + 11, py + 24, 7, 6);
      }

      // ===== PROMINENT BACKPACK ON THE BACK (Protrudes on right side with inertia bobbing) =====
      ctx.fillStyle = BACKPACK_SHADOW;
      ctx.fillRect(px + 20, py + 14 + backpackBob, 5, 12);
      ctx.fillRect(px + 20, py + 13 + backpackBob, 4, 14);
      ctx.fillStyle = BACKPACK_COLOR;
      ctx.fillRect(px + 20, py + 14 + backpackBob, 4, 12);
      ctx.fillStyle = BACKPACK_HIGHLIGHT;
      ctx.fillRect(px + 21, py + 14 + backpackBob, 2, 4);

      // Accessories for Ezzy on backpack (Left facing view)
      if (isGirl) {
        // Rolled sleeping mat underneath
        ctx.fillStyle = MAT_SHADOW;
        ctx.fillRect(px + 20, py + 25 + backpackBob, 8, 4);
        ctx.fillStyle = MAT_COLOR;
        ctx.fillRect(px + 21, py + 25 + backpackBob, 6, 3);
        ctx.fillStyle = BACKPACK_STRAP;
        ctx.fillRect(px + 24, py + 25 + backpackBob, 1, 4);
      }

      // Torso / Bright Tunic
      ctx.fillStyle = TUNIC_COLOR;
      ctx.fillRect(px + 9, py + 15 + bob, 11, 10);
      if (isGirl) {
        ctx.fillStyle = TUNIC_HIGHLIGHT;
        ctx.fillRect(px + 10, py + 15 + bob, 9, 2);
      }

      // Dark Belt Line
      ctx.fillStyle = BELT_COLOR;
      ctx.fillRect(px + 9, py + 22 + bob, 12, 2);

      // Yellow Buckle at front edge (Left waist)
      ctx.fillStyle = BUCKLE_COLOR;
      ctx.fillRect(px + 8, py + 21 + bob, 3, 4);

      // Backpack Shoulder Strap going down front chest
      ctx.fillStyle = BACKPACK_STRAP;
      ctx.fillRect(px + 12, py + 15 + bob, 2, 5);

      // Arm & Hand (Peach hand facing forward)
      ctx.fillStyle = TUNIC_COLOR;
      ctx.fillRect(px + 13, py + 16 + bob, 4, 6);
      ctx.fillStyle = SKIN_COLOR;
      ctx.fillRect(px + 13, py + 21 + bob, 3, 3);

      // Red Scarf under chin (wrapping from neck around)
      ctx.fillStyle = SCARF_COLOR;
      ctx.fillRect(px + 9, py + 13 + bob, 12, 3);
      ctx.fillStyle = SCARF_SHADOW;
      ctx.fillRect(px + 9, py + 15 + bob, 12, 1);

      // Face Skin Profile (with step for nose on the left)
      ctx.fillStyle = SKIN_COLOR;
      ctx.fillRect(px + 9, py + 7 + bob, 10, 7);
      // Nose step
      ctx.fillRect(px + 8, py + 9 + bob, 2, 3);

      // Hair (Brown blocky hair covering top and back)
      ctx.fillStyle = HAIR_COLOR;
      ctx.fillRect(px + 9, py + 3 + bob, 13, 5);  // Top hair
      ctx.fillRect(px + 17, py + 4 + bob, 5, 9);  // Back hair block
      ctx.fillStyle = HAIR_DARK;
      ctx.fillRect(px + 9, py + 3 + bob, 13, 1);

      // One Dark Square Eye on the left profile
      ctx.fillStyle = EYE_COLOR;
      ctx.fillRect(px + 11, py + 8 + bob, 2, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + 12, py + 8 + bob, 1, 1);

      // Girl Avatar details (Left view: ribbon, ponytail, side bangs, blush)
      if (isGirl) {
        ctx.fillStyle = '#fda4af';
        ctx.fillRect(px + 10, py + 11 + bob, 2, 1); // Rosy cheek
        // Ribbon
        ctx.fillStyle = RIBBON_COLOR;
        ctx.fillRect(px + 22, py + 5 + bob, 3, 3);
        ctx.fillStyle = '#ffe4e6';
        ctx.fillRect(px + 23, py + 6 + bob, 1, 1);
        // Ponytail bob
        ctx.fillStyle = HAIR_COLOR;
        ctx.fillRect(px + 23, py + 7 + bob, 3, 6);
        ctx.fillStyle = HAIR_DARK;
        ctx.fillRect(px + 23, py + 11 + bob, 3, 2);
        // Side bangs
        ctx.fillStyle = HAIR_COLOR;
        ctx.fillRect(px + 15, py + 6 + bob, 2, 4);
      }

      compassX = px + 11;
      compassY = py + 24 + bob;
    }

    // 3. Golden Compass Resonance Aura: when isCompassActive is true
    if (isCompassActive) {
      const pulse = (Math.sin(this.tickCount * 0.18) + 1) * 0.5;

      ctx.save();
      // Multi-layer glowing resonance aura
      const glowGrad = ctx.createRadialGradient(compassX, compassY, 2, compassX, compassY, 15 + pulse * 5);
      glowGrad.addColorStop(0, 'rgba(251, 191, 36, 0.9)');
      glowGrad.addColorStop(0.45, 'rgba(52, 211, 153, 0.5)');
      glowGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(compassX, compassY, 15 + pulse * 5, 0, Math.PI * 2);
      ctx.fill();

      // Golden Compass bezel
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(compassX, compassY, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Spinning miniature compass needle
      const needleAngle = this.tickCount * 0.08;
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(compassX, compassY);
      ctx.lineTo(compassX + Math.cos(needleAngle) * 3.5, compassY + Math.sin(needleAngle) * 3.5);
      ctx.stroke();

      ctx.strokeStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(compassX, compassY);
      ctx.lineTo(compassX - Math.cos(needleAngle) * 3.5, compassY - Math.sin(needleAngle) * 3.5);
      ctx.stroke();

      // 4-pointed radiant glint on compass center
      ctx.fillStyle = '#ffffff';
      const glintLen = 4 + pulse * 3;
      ctx.fillRect(compassX - 0.5, compassY - glintLen, 1, glintLen * 2);
      ctx.fillRect(compassX - glintLen, compassY - 0.5, glintLen * 2, 1);
      ctx.restore();

      // Active Resonance Scan overhead badge
      ctx.save();
      ctx.font = '6px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      const badgeY = py - 20 + Math.round(bob * 0.5);
      const pulseAlpha = 0.8 + Math.sin(this.tickCount * 0.2) * 0.2;
      ctx.fillStyle = `rgba(254, 240, 138, ${pulseAlpha})`;
      ctx.fillText('✨ RESONANSI ✨', px + 16, badgeY);
      ctx.restore();
    }

    // 4. Protagonist Name Banner (Dynamic nickname chosen by player)
    // Box: dark teal background, cyan-teal border (2px), crisp mint pixel text with drop shadow
    ctx.save();
    const displayName = this.playerName || 'Ezzel';
    ctx.font = '8px "Press Start 2P", monospace';
    const textWidth = ctx.measureText(displayName).width;
    const tagW = Math.max(50, Math.round(textWidth + 14));
    const tagH = 15;
    const tagX = px + 16 - tagW / 2;
    // Anchor nicely above the hair, slightly dampened bob
    const tagY = py - 14 + Math.round(bob * 0.5);

    // Outer dark silhouette shadow border
    ctx.fillStyle = '#0a1d1b';
    ctx.fillRect(tagX - 1, tagY - 1, tagW + 2, tagH + 2);

    // Inner dark teal background
    ctx.fillStyle = '#112b29';
    ctx.fillRect(tagX, tagY, tagW, tagH);

    // Turquoise / Teal pixel border (2px)
    ctx.strokeStyle = '#2ca88e';
    ctx.lineWidth = 2;
    ctx.strokeRect(tagX + 1, tagY + 1, tagW - 2, tagH - 2);

    // Pixel lettering
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const textCenterX = px + 16;
    const textCenterY = tagY + tagH / 2 + 1;

    // Dark teal drop shadow on letters for 3D pixel effect
    ctx.fillStyle = '#1c6858';
    ctx.fillText(displayName, textCenterX + 1, textCenterY + 1);

    // Minty cyan glowing letters matching reference image
    ctx.fillStyle = '#9ef4dc';
    ctx.fillText(displayName, textCenterX, textCenterY);
    ctx.restore();
  }

  // Draw unique NPCs with distinct expressive sprites, dynamic breathing, and turning animations
  private drawNPC(npc: NPC, isCompassActive: boolean, player?: Player) {
    const ctx = this.ctx;
    const nx = Math.floor(npc.x * TILE_SIZE);
    const ny = Math.floor(npc.y * TILE_SIZE);

    // Dynamic turning orientation & gaze calculation
    const nxCenter = nx + 16;
    const nyCenter = ny + 16;
    let turnDir: -1 | 0 | 1 = 0; // -1 = left, 0 = forward/center, 1 = right
    let isNoticingPlayer = false;

    if (player) {
      const pCenterX = player.x + 16;
      const pCenterY = player.y + 16;
      const distToPlayer = Math.hypot(pCenterX - nxCenter, pCenterY - nyCenter);

      // If player is close by (within 75px), NPC attentively turns their gaze and head toward the player
      if (distToPlayer < 75) {
        isNoticingPlayer = true;
        if (pCenterX < nxCenter - 6) {
          turnDir = -1;
        } else if (pCenterX > nxCenter + 6) {
          turnDir = 1;
        } else {
          turnDir = 0;
        }
      }
    }

    // If player is not within conversation range, run subtle periodic autonomous turning/glance cycle
    if (!isNoticingPlayer) {
      const npcSeed = Math.floor(npc.x * 79 + npc.y * 47);
      const turnPhase = (this.tickCount + npcSeed) % 360;
      if (turnPhase >= 110 && turnPhase < 170) {
        turnDir = -1; // Turn & glance left
      } else if (turnPhase >= 250 && turnPhase < 310) {
        turnDir = 1; // Turn & glance right
      } else {
        turnDir = 0; // Neutral forward gaze
      }
    }

    // Natural breathing bobbing (subtle organic sine oscillation)
    const breathRate = 0.07;
    const breathPhase = this.tickCount * breathRate + npc.x * 1.8;
    const idleBob = Math.sin(breathPhase) * 1.5;
    // Head bobs with slight phase lead for natural squash-and-stretch
    const headBob = Math.sin(breathPhase + 0.35) * 1.8;

    // Turning offsets for head, eyes, and accessories
    const headTurnX = turnDir * 1.5;
    const eyeTurnX = turnDir * 1.2;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(nx + 16, ny + 28, 9, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    switch (npc.sprite) {
      case 'squirrel': { // Kiki - Tupai Pos Cilik (Postal Squirrel)
        const isTwitching = Math.sin(this.tickCount * 0.05 + npc.y) > 0.88;
        const tailTwitch = isTwitching ? Math.sin(this.tickCount * 0.6) * 3 : 0;
        const tailSway = Math.sin(this.tickCount * 0.12) * 2;
        const tailBaseX = turnDir === 1 ? nx + 4 : turnDir === -1 ? nx + 22 : nx + 5;

        // 1. Lush multi-toned fluffy S-curve tail
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.arc(tailBaseX, ny + 11 + idleBob + tailSway + tailTwitch, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.arc(tailBaseX + 1, ny + 10 + idleBob + tailSway + tailTwitch, 6, 0, Math.PI * 2);
        ctx.fill();
        // White fluffy tip
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(tailBaseX - 1, ny + 4 + idleBob + tailSway + tailTwitch, 4, 4);

        // 2. Squirrel feet
        ctx.fillStyle = '#92400e';
        ctx.fillRect(nx + 11, ny + 26, 3, 2);
        ctx.fillRect(nx + 18, ny + 26, 3, 2);

        // 3. Russet Body with shading
        ctx.fillStyle = '#d97706';
        ctx.fillRect(nx + 10, ny + 13 + idleBob, 12, 13);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(nx + 10, ny + 13 + idleBob, 2, 13);
        ctx.fillRect(nx + 20, ny + 13 + idleBob, 2, 13);

        // 4. Cream bib & tummy
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(nx + 13 + headTurnX * 0.5, ny + 15 + idleBob, 6, 8);

        // 5. Leather Messenger Satchel Strap across chest
        ctx.fillStyle = '#78350f';
        ctx.fillRect(nx + 11, ny + 14 + idleBob, 2, 3);
        ctx.fillRect(nx + 13, ny + 17 + idleBob, 2, 3);
        ctx.fillRect(nx + 15, ny + 20 + idleBob, 2, 3);
        // Courier bag with golden buckle & mail letter
        ctx.fillStyle = '#78350f';
        ctx.fillRect(nx + 17 + headTurnX * 0.5, ny + 19 + idleBob, 6, 6);
        ctx.fillStyle = '#facc15'; // Brass buckle
        ctx.fillRect(nx + 19 + headTurnX * 0.5, ny + 21 + idleBob, 2, 2);
        ctx.fillStyle = '#ffffff'; // Letter envelope with red wax seal
        ctx.fillRect(nx + 18 + headTurnX * 0.5, ny + 18 + idleBob, 4, 2);
        ctx.fillStyle = '#ef4444'; // Red wax seal
        ctx.fillRect(nx + 19 + headTurnX * 0.5, ny + 18 + idleBob, 2, 1);

        // 6. Head
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(nx + 9 + headTurnX, ny + 7 + headBob, 14, 8);

        // 7. Attentive twitching ears with pink inner tuft
        const earTwitch = isTwitching ? -1 : 0;
        ctx.fillStyle = '#c2410c';
        ctx.fillRect(nx + 9 + headTurnX, ny + 3 + headBob + earTwitch, 4, 5);
        ctx.fillRect(nx + 19 + headTurnX, ny + 3 + headBob - earTwitch, 4, 5);
        ctx.fillStyle = '#fda4af';
        ctx.fillRect(nx + 10 + headTurnX, ny + 4 + headBob + earTwitch, 2, 3);
        ctx.fillRect(nx + 20 + headTurnX, ny + 4 + headBob - earTwitch, 2, 3);

        // 8. Royal Blue Courier Cap with Postal Visor & Brass Emblem
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(nx + 11 + headTurnX, ny + 3 + headBob, 10, 4);
        ctx.fillStyle = '#1d4ed8';
        ctx.fillRect(nx + 10 + headTurnX, ny + 6 + headBob, 12, 2);
        ctx.fillStyle = '#0f172a'; // Visor
        ctx.fillRect(nx + 10 + headTurnX + (turnDir > 0 ? 1 : 0), ny + 7 + headBob, 13, 1);
        ctx.fillStyle = '#fbbf24'; // Postal horn badge
        ctx.fillRect(nx + 15 + headTurnX, ny + 4 + headBob, 2, 2);

        // 9. Shiny dark eyes with catchlights
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(nx + 11 + headTurnX + eyeTurnX, ny + 10 + headBob, 3, 3);
        ctx.fillRect(nx + 18 + headTurnX + eyeTurnX, ny + 10 + headBob, 3, 3);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(nx + 11 + headTurnX + eyeTurnX, ny + 10 + headBob, 1, 1);
        ctx.fillRect(nx + 18 + headTurnX + eyeTurnX, ny + 10 + headBob, 1, 1);

        // 10. Cute snout & whiskers
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(nx + 14 + headTurnX, ny + 12 + headBob, 4, 3);
        ctx.fillStyle = '#18181b'; // Black nose
        ctx.fillRect(nx + 15 + headTurnX, ny + 12 + headBob, 2, 1);
        break;
      }

      case 'old_man': { // Kakek Ranu - Master Carpenter & Bridge Keeper
        // 1. Sturdy Work Pants & Heavy Boots
        ctx.fillStyle = '#334155';
        ctx.fillRect(nx + 10, ny + 24, 4, 4);
        ctx.fillRect(nx + 18, ny + 24, 4, 4);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(nx + 9, ny + 26, 5, 3);
        ctx.fillRect(nx + 18, ny + 26, 5, 3);

        // 2. Rolled Linen Sleeves & Indigo Denim Carpenter Vest
        ctx.fillStyle = '#fef3c7'; // Linen under-shirt
        ctx.fillRect(nx + 7, ny + 13 + idleBob, 18, 12);
        ctx.fillStyle = '#1e3a8a'; // Denim vest
        ctx.fillRect(nx + 9, ny + 13 + idleBob, 14, 10);
        ctx.fillStyle = '#1d4ed8'; // Vest front lapels
        ctx.fillRect(nx + 9, ny + 13 + idleBob, 3, 10);
        ctx.fillRect(nx + 20, ny + 13 + idleBob, 3, 10);
        // Brass buttons
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(nx + 15, ny + 15 + idleBob, 2, 2);
        ctx.fillRect(nx + 15, ny + 18 + idleBob, 2, 2);

        // 3. Heavy Leather Carpenter Belt with Chisel & Brass Buckle
        ctx.fillStyle = '#78350f';
        ctx.fillRect(nx + 8, ny + 21 + idleBob, 16, 3);
        ctx.fillStyle = '#f59e0b'; // Brass buckle
        ctx.fillRect(nx + 14, ny + 21 + idleBob, 4, 3);
        // Chisel in holster
        ctx.fillStyle = '#b45309';
        ctx.fillRect(nx + 9, ny + 22 + idleBob, 2, 4);
        ctx.fillStyle = '#94a3b8'; // Steel chisel blade
        ctx.fillRect(nx + 9, ny + 26 + idleBob, 2, 2);

        // 4. Head & Face
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(nx + 9 + headTurnX, ny + 5 + headBob, 14, 9);

        // 5. Bald crown with silver locks framing ears
        ctx.fillStyle = '#ffedd5';
        ctx.fillRect(nx + 11 + headTurnX, ny + 4 + headBob, 10, 2);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(nx + 8 + headTurnX, ny + 6 + headBob, 3, 7);
        ctx.fillRect(nx + 21 + headTurnX, ny + 6 + headBob, 3, 7);

        // 6. Traditional Red/Gold Batik Headband (Udeng / Ikat Kepala)
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(nx + 8 + headTurnX, ny + 3 + headBob, 16, 3);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(nx + 10 + headTurnX, ny + 4 + headBob, 2, 1);
        ctx.fillRect(nx + 14 + headTurnX, ny + 4 + headBob, 2, 1);
        ctx.fillRect(nx + 18 + headTurnX, ny + 4 + headBob, 2, 1);
        ctx.fillStyle = '#991b1b'; // Tied knot
        ctx.fillRect(nx + 22 + headTurnX, ny + 2 + headBob, 2, 4);

        // 7. Wise eyes with bushy white eyebrows
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(nx + 10 + headTurnX, ny + 6 + headBob, 4, 2);
        ctx.fillRect(nx + 18 + headTurnX, ny + 6 + headBob, 4, 2);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(nx + 11 + headTurnX + eyeTurnX, ny + 7 + headBob, 2, 2);
        ctx.fillRect(nx + 19 + headTurnX + eyeTurnX, ny + 7 + headBob, 2, 2);

        // 8. Magnificent Silver Handlebar Mustache & Braided Beard
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(nx + 9 + headTurnX, ny + 11 + headBob, 14, 3);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(nx + 8 + headTurnX, ny + 12 + headBob, 3, 2);
        ctx.fillRect(nx + 21 + headTurnX, ny + 12 + headBob, 3, 2);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(nx + 13 + headTurnX, ny + 14 + headBob, 6, 4);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(nx + 14 + headTurnX, ny + 17 + headBob, 4, 2);

        // 9. Master Carpenter Mallet in hand with rhythmic inspection tap
        const malletTap = Math.sin(this.tickCount * 0.08) * 1.8;
        ctx.fillStyle = '#b45309'; // Mallet wood handle
        ctx.fillRect(nx + 25, ny + 13 + idleBob + malletTap, 2, 9);
        ctx.fillStyle = '#64748b'; // Heavy iron mallet head
        ctx.fillRect(nx + 23, ny + 10 + idleBob + malletTap, 6, 4);
        ctx.fillStyle = '#f59e0b'; // Brass reinforcement rings
        ctx.fillRect(nx + 23, ny + 10 + idleBob + malletTap, 1, 4);
        ctx.fillRect(nx + 28, ny + 10 + idleBob + malletTap, 1, 4);
        break;
      }

      case 'boy_glasses': { // Bimo - Young Horologist Apprentice
        // 1. Trousers & Boots
        ctx.fillStyle = '#475569';
        ctx.fillRect(nx + 11, ny + 23, 4, 5);
        ctx.fillRect(nx + 17, ny + 23, 4, 5);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(nx + 10, ny + 26, 5, 3);
        ctx.fillRect(nx + 17, ny + 26, 5, 3);

        // 2. White Collared Shirt with Cravat
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(nx + 9, ny + 13 + idleBob, 14, 11);
        ctx.fillStyle = '#7c2d12'; // Small cravat
        ctx.fillRect(nx + 14, ny + 13 + idleBob, 4, 2);

        // 3. Mustard Knit Sweater Vest with V-neck
        ctx.fillStyle = '#eab308';
        ctx.fillRect(nx + 9, ny + 14 + idleBob, 14, 9);
        ctx.fillStyle = '#ca8a04';
        ctx.fillRect(nx + 15, ny + 16 + idleBob, 2, 2); // Argyle knit pattern
        ctx.fillRect(nx + 15, ny + 19 + idleBob, 2, 2);

        // 4. Leather Horologist Tool Apron & Pocket Tools
        ctx.fillStyle = '#543930';
        ctx.fillRect(nx + 9, ny + 20 + idleBob, 14, 4);
        ctx.fillStyle = '#94a3b8'; // Tweezers handle
        ctx.fillRect(nx + 11, ny + 19 + idleBob, 1, 3);
        ctx.fillStyle = '#ca8a04'; // Precision screwdriver
        ctx.fillRect(nx + 13, ny + 18 + idleBob, 1, 4);

        // 5. Golden Pocket Watch on Chain
        ctx.fillStyle = '#facc15';
        ctx.fillRect(nx + 18, ny + 18 + idleBob, 3, 3);

        // 6. Head & Rosy Cheeks
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(nx + 10 + headTurnX, ny + 6 + headBob, 12, 8);
        ctx.fillStyle = '#fca5a5'; // Blushing cheeks
        ctx.fillRect(nx + 9 + headTurnX, ny + 11 + headBob, 3, 2);
        ctx.fillRect(nx + 20 + headTurnX, ny + 11 + headBob, 3, 2);

        // 7. Messy Curly Brown Hair with Animated Cowlick
        ctx.fillStyle = '#3b2f2f';
        ctx.fillRect(nx + 8 + headTurnX, ny + 3 + headBob, 16, 5);
        ctx.fillRect(nx + 7 + headTurnX, ny + 6 + headBob, 3, 5);
        ctx.fillRect(nx + 22 + headTurnX, ny + 6 + headBob, 3, 5);
        const cowlickWiggle = Math.sin(this.tickCount * 0.15) * 1;
        ctx.fillRect(nx + 10 + headTurnX + cowlickWiggle, ny + 1 + headBob, 4, 3);

        // 8. Round Turquoise Spectacles with Lens Glint
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(nx + 9 + headTurnX + eyeTurnX, ny + 8 + headBob, 6, 5);
        ctx.strokeRect(nx + 17 + headTurnX + eyeTurnX, ny + 8 + headBob, 6, 5);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(nx + 15 + headTurnX + eyeTurnX, ny + 10 + headBob, 2, 1); // Bridge

        // Eyes behind spectacles
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(nx + 11 + headTurnX + eyeTurnX, ny + 9 + headBob, 2, 2);
        ctx.fillRect(nx + 19 + headTurnX + eyeTurnX, ny + 9 + headBob, 2, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(nx + 11 + headTurnX + eyeTurnX, ny + 9 + headBob, 1, 1);
        ctx.fillRect(nx + 19 + headTurnX + eyeTurnX, ny + 9 + headBob, 1, 1);

        // 9. Brass Watchmaker Loupe Magnifier above right lens
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(nx + 18 + headTurnX, ny + 6 + headBob, 4, 2);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(nx + 19 + headTurnX, ny + 6 + headBob, 2, 2);

        // Shy idle gesture: adjusts glasses periodically
        const nudgeCycle = (this.tickCount + Math.floor(npc.x * 50)) % 280;
        if (nudgeCycle > 230 && nudgeCycle < 270) {
          ctx.fillStyle = '#fed7aa';
          ctx.fillRect(nx + 18 + headTurnX, ny + 11 + headBob, 3, 4);
        }
        break;
      }

      case 'chicken_glasses': { // Profesor Kotek - Emotional Science Rooster (Official 4-Direction Model Sheet)
        // 1. Pecker rhythm & subtle head turn
        const peckX = Math.cos(this.tickCount * 0.12) * 1.5 + headTurnX;
        const peckY = Math.sin(this.tickCount * 0.12) * 1.5 + headBob;

        // Determine orientation: 'up' (Belakang), 'down' (Depan), 'right' (Samping Ka), 'left' (Samping Kii)
        const facing = npc.facing || (turnDir === -1 ? 'left' : turnDir === 1 ? 'right' : 'down');

        if (facing === 'up') {
          // ==================== BELAKANG (BACK VIEW) ====================
          // 1. Scaled Golden Chicken Feet
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(nx + 12, ny + 23, 2, 5);
          ctx.fillRect(nx + 10, ny + 27, 4, 2);
          ctx.fillRect(nx + 18, ny + 23, 2, 5);
          ctx.fillRect(nx + 17, ny + 27, 4, 2);

          // 2. White Lab Coat Bottom Hem
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(nx + 9, ny + 18 + idleBob, 14, 5);
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(nx + 9, ny + 22 + idleBob, 14, 1);

          // 3. High-Tech Chemical/Emotion Backpack ("Tas Tabung Reaktor Riset Emosi")
          // Steel mounting frame
          ctx.fillStyle = '#334155';
          ctx.fillRect(nx + 6, ny + 10 + idleBob, 20, 11);

          // Left Canister: Glowing Green Liquid (#22c55e)
          ctx.fillStyle = '#475569'; // Top metal cap
          ctx.fillRect(nx + 7, ny + 9 + idleBob, 4, 2);
          ctx.fillStyle = '#15803d'; // Outer glass
          ctx.fillRect(nx + 7, ny + 11 + idleBob, 4, 9);
          ctx.fillStyle = '#22c55e'; // Green liquid core
          ctx.fillRect(nx + 8, ny + 12 + idleBob, 2, 7);
          ctx.fillStyle = '#86efac'; // Bubble / glow line
          ctx.fillRect(nx + 8, ny + 14 + idleBob, 1, 2);
          ctx.fillStyle = '#334155'; // Bottom metal cap
          ctx.fillRect(nx + 7, ny + 20 + idleBob, 4, 2);

          // Right Canister: Glowing Orange/Amber Liquid (#f97316)
          ctx.fillStyle = '#475569'; // Top metal cap
          ctx.fillRect(nx + 21, ny + 9 + idleBob, 4, 2);
          ctx.fillStyle = '#c2410c'; // Outer glass
          ctx.fillRect(nx + 21, ny + 11 + idleBob, 4, 9);
          ctx.fillStyle = '#f97316'; // Orange liquid core
          ctx.fillRect(nx + 22, ny + 12 + idleBob, 2, 7);
          ctx.fillStyle = '#fde047'; // Glow line
          ctx.fillRect(nx + 22, ny + 14 + idleBob, 1, 2);
          ctx.fillStyle = '#334155'; // Bottom metal cap
          ctx.fillRect(nx + 21, ny + 20 + idleBob, 4, 2);

          // Center Processor Unit (Metal gray with status LEDs & cables)
          ctx.fillStyle = '#475569';
          ctx.fillRect(nx + 12, ny + 11 + idleBob, 8, 9);
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(nx + 13, ny + 12 + idleBob, 6, 5);
          ctx.fillStyle = '#ef4444'; // Red status light
          ctx.fillRect(nx + 14, ny + 13 + idleBob, 2, 1);
          ctx.fillStyle = '#22c55e'; // Green status light
          ctx.fillRect(nx + 14, ny + 15 + idleBob, 2, 1);
          ctx.fillStyle = '#f59e0b'; // Amber gauge
          ctx.fillRect(nx + 17, ny + 13 + idleBob, 1, 3);
          ctx.fillStyle = '#94a3b8'; // Connecting tubes
          ctx.fillRect(nx + 11, ny + 18 + idleBob, 10, 1);

          // Side modules: Brown pack and dark purple canister on right
          ctx.fillStyle = '#92400e';
          ctx.fillRect(nx + 25, ny + 11 + idleBob, 2, 7);
          ctx.fillStyle = '#581c87';
          ctx.fillRect(nx + 26, ny + 14 + idleBob, 2, 5);

          // 4. Arms / Wings
          // Left Wing: Red glove/sleeve sticking out to the left
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(nx + 2, ny + 13 + idleBob, 6, 5);
          ctx.fillStyle = '#b91c1c';
          ctx.fillRect(nx + 2, ny + 17 + idleBob, 6, 1);
          // Right Wing: White lab coat sleeve
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(nx + 24, ny + 13 + idleBob, 3, 7);

          // 5. Head from behind & Red Comb
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(nx + 11 + peckX, ny + 5 + peckY, 10, 8);
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(nx + 11 + peckX, ny + 11 + peckY, 10, 2);
          // Tall Red Royal Comb
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(nx + 14 + peckX, ny - 2 + peckY, 4, 8);
          ctx.fillStyle = '#f87171';
          ctx.fillRect(nx + 15 + peckX, ny - 1 + peckY, 2, 6);

        } else if (facing === 'right') {
          // ==================== SAMPING KA. (SIDE RIGHT) ====================
          // 1. Scaled Golden Feet in walking profile
          ctx.fillStyle = '#d97706'; // Back leg
          ctx.fillRect(nx + 13, ny + 23, 2, 5);
          ctx.fillRect(nx + 12, ny + 27, 4, 2);
          ctx.fillStyle = '#f59e0b'; // Front leg
          ctx.fillRect(nx + 18, ny + 23, 2, 5);
          ctx.fillRect(nx + 17, ny + 27, 5, 2);

          // 2. High-Tech Backpack on back (left side of sprite)
          ctx.fillStyle = '#334155'; // Bracket
          ctx.fillRect(nx + 6, ny + 11 + idleBob, 3, 9);
          ctx.fillStyle = '#92400e'; // Pack
          ctx.fillRect(nx + 5, ny + 12 + idleBob, 2, 7);
          // Glowing Green Canister
          ctx.fillStyle = '#475569';
          ctx.fillRect(nx + 7, ny + 9 + idleBob, 4, 2);
          ctx.fillStyle = '#15803d';
          ctx.fillRect(nx + 7, ny + 11 + idleBob, 4, 9);
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(nx + 8, ny + 12 + idleBob, 2, 7);
          ctx.fillStyle = '#86efac';
          ctx.fillRect(nx + 8, ny + 13 + idleBob, 1, 3);
          ctx.fillStyle = '#334155';
          ctx.fillRect(nx + 7, ny + 20 + idleBob, 4, 2);
          ctx.fillStyle = '#78350f'; // Tube
          ctx.fillRect(nx + 9, ny + 21 + idleBob, 2, 2);

          // 3. White Lab Coat & Blue Shirt
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(nx + 10, ny + 12 + idleBob, 9, 12);
          ctx.fillStyle = '#0284c7'; // Blue shirt at chest front
          ctx.fillRect(nx + 17, ny + 13 + idleBob, 3, 8);
          ctx.fillStyle = '#f8fafc'; // Coat lapel
          ctx.fillRect(nx + 15, ny + 12 + idleBob, 2, 12);

          // 4. Clipboard / Research Notes tucked under wing
          ctx.fillStyle = '#92400e'; // Clipboard wood
          ctx.fillRect(nx + 19, ny + 15 + idleBob, 3, 8);
          ctx.fillStyle = '#ffffff'; // Paper
          ctx.fillRect(nx + 20, ny + 16 + idleBob, 2, 6);
          ctx.fillStyle = '#22c55e'; // Emotion graph line
          ctx.fillRect(nx + 20, ny + 17 + idleBob, 1, 2);

          // 5. White Wing over body
          ctx.fillStyle = '#f1f5f9';
          ctx.fillRect(nx + 12, ny + 14 + idleBob, 5, 7);

          // 6. Head Facing Right
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(nx + 13 + peckX, ny + 5 + peckY, 8, 8);
          // Tall Red Comb
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(nx + 14 + peckX, ny - 2 + peckY, 4, 8);
          ctx.fillStyle = '#f87171';
          ctx.fillRect(nx + 15 + peckX, ny - 1 + peckY, 2, 6);
          // Golden Beak
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(nx + 21 + peckX, ny + 8 + peckY, 5, 3);
          // Crimson Wattle
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(nx + 20 + peckX, ny + 11 + peckY, 3, 4);
          // Blue Eye with Yellow Spectacles Frame
          ctx.strokeStyle = '#eab308';
          ctx.lineWidth = 1;
          ctx.strokeRect(nx + 16 + peckX, ny + 7 + peckY, 4, 4);
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(nx + 17 + peckX, ny + 8 + peckY, 2, 2);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(nx + 17 + peckX, ny + 8 + peckY, 1, 1);

        } else if (facing === 'left') {
          // ==================== SAMPING KII. (SIDE LEFT) ====================
          // 1. Scaled Golden Feet in walking profile
          ctx.fillStyle = '#d97706'; // Back leg
          ctx.fillRect(nx + 17, ny + 23, 2, 5);
          ctx.fillRect(nx + 16, ny + 27, 4, 2);
          ctx.fillStyle = '#f59e0b'; // Front leg
          ctx.fillRect(nx + 12, ny + 23, 2, 5);
          ctx.fillRect(nx + 10, ny + 27, 5, 2);

          // 2. High-Tech Backpack on back (right side of sprite)
          ctx.fillStyle = '#334155'; // Bracket
          ctx.fillRect(nx + 23, ny + 11 + idleBob, 3, 9);
          ctx.fillStyle = '#92400e'; // Pack
          ctx.fillRect(nx + 25, ny + 12 + idleBob, 2, 7);
          // Glowing Canister
          ctx.fillStyle = '#475569';
          ctx.fillRect(nx + 21, ny + 9 + idleBob, 4, 2);
          ctx.fillStyle = '#15803d';
          ctx.fillRect(nx + 21, ny + 11 + idleBob, 4, 9);
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(nx + 22, ny + 12 + idleBob, 2, 7);
          ctx.fillStyle = '#86efac';
          ctx.fillRect(nx + 22, ny + 13 + idleBob, 1, 3);
          ctx.fillStyle = '#334155';
          ctx.fillRect(nx + 21, ny + 20 + idleBob, 4, 2);
          ctx.fillStyle = '#78350f'; // Tube
          ctx.fillRect(nx + 21, ny + 21 + idleBob, 2, 2);

          // 3. White Lab Coat & Blue Shirt
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(nx + 13, ny + 12 + idleBob, 9, 12);
          ctx.fillStyle = '#0284c7'; // Blue shirt at chest front
          ctx.fillRect(nx + 12, ny + 13 + idleBob, 3, 8);
          ctx.fillStyle = '#f8fafc'; // Coat lapel
          ctx.fillRect(nx + 15, ny + 12 + idleBob, 2, 12);

          // 4. Clipboard / Research Notes under Wing
          ctx.fillStyle = '#92400e'; // Clipboard wood
          ctx.fillRect(nx + 10, ny + 15 + idleBob, 3, 8);
          ctx.fillStyle = '#ffffff'; // Paper
          ctx.fillRect(nx + 10, ny + 16 + idleBob, 2, 6);
          ctx.fillStyle = '#ef4444'; // Emotion graph line
          ctx.fillRect(nx + 11, ny + 17 + idleBob, 1, 2);

          // 5. White Wing over body
          ctx.fillStyle = '#f1f5f9';
          ctx.fillRect(nx + 15, ny + 14 + idleBob, 5, 7);

          // 6. Head Facing Left
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(nx + 11 + peckX, ny + 5 + peckY, 8, 8);
          // Tall Red Comb
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(nx + 14 + peckX, ny - 2 + peckY, 4, 8);
          ctx.fillStyle = '#f87171';
          ctx.fillRect(nx + 15 + peckX, ny - 1 + peckY, 2, 6);
          // Golden Beak
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(nx + 6 + peckX, ny + 8 + peckY, 5, 3);
          // Crimson Wattle
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(nx + 9 + peckX, ny + 11 + peckY, 3, 4);
          // Blue Eye with Yellow Spectacles Frame
          ctx.strokeStyle = '#eab308';
          ctx.lineWidth = 1;
          ctx.strokeRect(nx + 12 + peckX, ny + 7 + peckY, 4, 4);
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(nx + 13 + peckX, ny + 8 + peckY, 2, 2);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(nx + 13 + peckX, ny + 8 + peckY, 1, 1);

        } else {
          // ==================== DEPAN (FRONT VIEW - DEFAULT) ====================
          // 1. Scaled Golden Rooster Legs & Feet
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(nx + 12, ny + 23, 2, 5);
          ctx.fillRect(nx + 10, ny + 27, 5, 2);
          ctx.fillRect(nx + 18, ny + 23, 2, 5);
          ctx.fillRect(nx + 17, ny + 27, 5, 2);

          // 2. Backpack Apparatus Peek Behind Shoulders
          // Left side (our left): Green canister cap & purple module
          ctx.fillStyle = '#475569';
          ctx.fillRect(nx + 6, ny + 9 + idleBob, 3, 2);
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(nx + 6, ny + 11 + idleBob, 3, 3);
          ctx.fillStyle = '#581c87';
          ctx.fillRect(nx + 5, ny + 14 + idleBob, 2, 5);
          // Right side (our right): Orange canister cap & cyan tube
          ctx.fillStyle = '#475569';
          ctx.fillRect(nx + 23, ny + 9 + idleBob, 3, 2);
          ctx.fillStyle = '#f97316';
          ctx.fillRect(nx + 23, ny + 11 + idleBob, 3, 3);

          // 3. White Lab Coat & Blue Shirt
          ctx.fillStyle = '#ffffff'; // White lab coat
          ctx.fillRect(nx + 9, ny + 12 + idleBob, 14, 12);
          ctx.fillStyle = '#f1f5f9';
          ctx.fillRect(nx + 9, ny + 12 + idleBob, 2, 12);
          ctx.fillStyle = '#0284c7'; // Blue shirt down center
          ctx.fillRect(nx + 13, ny + 13 + idleBob, 6, 9);
          ctx.fillStyle = '#0369a1'; // Waist/belt line
          ctx.fillRect(nx + 13, ny + 20 + idleBob, 6, 2);

          // 4. High-Tech Chest Harness & Dual-Sensor Badge
          ctx.fillStyle = '#78350f'; // Harness straps
          ctx.fillRect(nx + 11, ny + 13 + idleBob, 10, 1.5);
          // Base casing (beige/white with dark border)
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(nx + 13, ny + 14 + idleBob, 6, 6);
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 0.8;
          ctx.strokeRect(nx + 13, ny + 14 + idleBob, 6, 6);
          // Golden round sensor at top
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(nx + 15, ny + 14 + idleBob, 2, 2);
          // Dual indicator bars
          ctx.fillStyle = '#ef4444'; // Left red bar
          ctx.fillRect(nx + 14, ny + 17 + idleBob, 1.5, 2.5);
          ctx.fillStyle = '#22c55e'; // Right green bar
          ctx.fillRect(nx + 16.5, ny + 17 + idleBob, 1.5, 2.5);

          // 5. Wings & Arms
          // Right Wing (our left): Folded white lab coat sleeve
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(nx + 7, ny + 13 + idleBob, 3, 8);
          // Left Wing (our right): Bright Red Glove/Sleeve extending out with cyan device!
          ctx.fillStyle = '#ef4444'; // Red glove
          ctx.fillRect(nx + 22, ny + 14 + idleBob, 7, 4.5);
          ctx.fillStyle = '#b91c1c'; // Red cuff shading
          ctx.fillRect(nx + 22, ny + 17.5 + idleBob, 7, 1);
          ctx.fillStyle = '#06b6d4'; // Cyan gadget cuff below glove
          ctx.fillRect(nx + 24, ny + 18.5 + idleBob, 3, 2);

          // 6. Head & Red Royal Comb
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(nx + 11 + peckX, ny + 5 + peckY, 10, 8);
          // Tall Red Royal Comb
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(nx + 14 + peckX, ny - 2 + peckY, 4, 8);
          ctx.fillStyle = '#f87171';
          ctx.fillRect(nx + 15 + peckX, ny - 1 + peckY, 2, 6);

          // Golden Beak & Crimson Wattle
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(nx + 18 + peckX, ny + 8 + peckY, 4, 3);
          ctx.fillStyle = '#ef4444'; // Wattle
          ctx.fillRect(nx + 17 + peckX, ny + 11 + peckY, 3, 4);

          // Blue Eye with Yellow Spectacles Frame
          ctx.strokeStyle = '#eab308';
          ctx.lineWidth = 1;
          ctx.strokeRect(nx + 14 + peckX + eyeTurnX, ny + 7 + peckY, 4, 4);
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(nx + 15 + peckX + eyeTurnX, ny + 8 + peckY, 2, 2);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(nx + 15 + peckX + eyeTurnX, ny + 8 + peckY, 1, 1);
        }
        break;
      }

      case 'girl_counselor': { // Kak Citra - Floral Garden Counselor
        // 1. Apricot Peasant Skirt with Peach Fold Trim
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(nx + 8, ny + 20 + idleBob, 16, 7);
        ctx.fillStyle = '#fdba74';
        ctx.fillRect(nx + 9, ny + 25 + idleBob, 14, 2);

        // 2. Sage-Mint Gardener Counselor Tunic
        ctx.fillStyle = '#0f766e';
        ctx.fillRect(nx + 8, ny + 13 + idleBob, 16, 8);
        ctx.fillStyle = '#14b8a6';
        ctx.fillRect(nx + 10, ny + 13 + idleBob, 12, 7);

        // 3. 4-Zone SEL Emotion Brooch on Chest
        ctx.fillStyle = '#134e4a';
        ctx.fillRect(nx + 12, ny + 16 + idleBob, 8, 3);
        ctx.fillStyle = '#22c55e'; // Green (Harmonis)
        ctx.fillRect(nx + 13, ny + 17 + idleBob, 1, 1);
        ctx.fillStyle = '#eab308'; // Yellow (Cemas/Bingung)
        ctx.fillRect(nx + 15, ny + 17 + idleBob, 1, 1);
        ctx.fillStyle = '#ef4444'; // Red (Marah)
        ctx.fillRect(nx + 17, ny + 17 + idleBob, 1, 1);
        ctx.fillStyle = '#38bdf8'; // Blue (Sedih)
        ctx.fillRect(nx + 19, ny + 17 + idleBob, 1, 1);

        // 4. Head & Face
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(nx + 10 + headTurnX, ny + 6 + headBob, 12, 8);

        // 5. Cascading Braided Brown Hair
        ctx.fillStyle = '#451a03';
        ctx.fillRect(nx + 8 + headTurnX, ny + 3 + headBob, 16, 5);
        ctx.fillRect(nx + 7 + headTurnX, ny + 6 + headBob, 4, 8);
        ctx.fillRect(nx + 21 + headTurnX, ny + 6 + headBob, 4, 12); // Long side braid

        // 6. Fresh Pink Jasmine Blossoms in Hair with Gentle Sway
        const flowerSway = Math.sin(this.tickCount * 0.08) * 1;
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(nx + 21 + headTurnX, ny + 5 + headBob + flowerSway, 3, 3);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(nx + 22 + headTurnX, ny + 6 + headBob + flowerSway, 1, 1);
        ctx.fillStyle = '#fda4af';
        ctx.fillRect(nx + 22 + headTurnX, ny + 10 + headBob + flowerSway, 3, 3);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(nx + 23 + headTurnX, ny + 11 + headBob + flowerSway, 1, 1);

        // 7. Cheerful Friendly Eyes & Smile
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(nx + 11 + headTurnX + eyeTurnX, ny + 8 + headBob, 2, 3);
        ctx.fillRect(nx + 18 + headTurnX + eyeTurnX, ny + 8 + headBob, 2, 3);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(nx + 11 + headTurnX + eyeTurnX, ny + 8 + headBob, 1, 1);
        ctx.fillRect(nx + 18 + headTurnX + eyeTurnX, ny + 8 + headBob, 1, 1);
        ctx.fillStyle = '#e11d48'; // Gentle smile
        ctx.fillRect(nx + 13 + headTurnX, ny + 12 + headBob, 5, 1);

        // 8. Leather Counselor Assessment Folder with 4 Colored Ribbons
        const clipTap = Math.sin(this.tickCount * 0.09) * 1;
        ctx.fillStyle = '#78350f';
        ctx.fillRect(nx + 22, ny + 15 + idleBob + clipTap, 6, 8);
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(nx + 23, ny + 16 + idleBob + clipTap, 4, 6);
        ctx.fillStyle = '#22c55e'; // Green Ribbon
        ctx.fillRect(nx + 23, ny + 15 + idleBob + clipTap, 1, 2);
        ctx.fillStyle = '#eab308'; // Yellow Ribbon
        ctx.fillRect(nx + 24, ny + 15 + idleBob + clipTap, 1, 2);
        ctx.fillStyle = '#ef4444'; // Red Ribbon
        ctx.fillRect(nx + 25, ny + 15 + idleBob + clipTap, 1, 2);
        ctx.fillStyle = '#38bdf8'; // Blue Ribbon
        ctx.fillRect(nx + 26, ny + 15 + idleBob + clipTap, 1, 2);
        break;
      }

      case 'zen_master': { // Kakek Damai - Mindful Elder
        // 1. Serene Floating Levitation Wave
        const zenFloat = Math.sin(this.tickCount * 0.04) * 2.8;

        // 2. Sacred Mossy River Meditation Rock
        ctx.fillStyle = '#334155';
        ctx.fillRect(nx + 4, ny + 24, 24, 6);
        ctx.fillStyle = '#16a34a'; // Lush moss cushion
        ctx.fillRect(nx + 6, ny + 23, 20, 2);

        // 3. Flowing Jade-Green and Ivory Zen Robes (Lotus Posture)
        ctx.fillStyle = '#15803d';
        ctx.fillRect(nx + 6, ny + 13 + zenFloat, 20, 12);
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(nx + 8, ny + 13 + zenFloat, 16, 11);
        ctx.fillStyle = '#f8fafc'; // Ivory lapel & meditation sash
        ctx.fillRect(nx + 13, ny + 13 + zenFloat, 6, 11);

        // 4. Head & Face
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(nx + 10 + headTurnX * 0.5, ny + 6 + zenFloat, 12, 8);

        // 5. Flowing Silver Beard & Topknot with Bamboo Pin
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(nx + 14 + headTurnX * 0.5, ny + 1 + zenFloat, 4, 5); // Topknot
        ctx.fillStyle = '#ca8a04'; // Bamboo hairpin
        ctx.fillRect(nx + 13 + headTurnX * 0.5, ny + 2 + zenFloat, 6, 1);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(nx + 9 + headTurnX * 0.5, ny + 4 + zenFloat, 14, 4);
        ctx.fillStyle = '#f8fafc'; // Long flowing beard
        ctx.fillRect(nx + 10 + headTurnX * 0.5, ny + 11 + zenFloat, 12, 6);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(nx + 12 + headTurnX * 0.5, ny + 16 + zenFloat, 8, 3);

        // 6. Serene Closed Meditative Eyes
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(nx + 11 + headTurnX * 0.5, ny + 9 + zenFloat, 3, 1);
        ctx.fillRect(nx + 18 + headTurnX * 0.5, ny + 9 + zenFloat, 3, 1);

        // 7. Miniature Ancient Pine Bonsai in Celadon Pot with Glowing Petals
        ctx.fillStyle = '#0284c7'; // Celadon blue-green pot
        ctx.fillRect(nx + 13, ny + 18 + zenFloat, 6, 4);
        ctx.fillStyle = '#78350f'; // Bonsai twisted trunk
        ctx.fillRect(nx + 15, ny + 16 + zenFloat, 2, 3);
        ctx.fillStyle = '#22c55e'; // Lush pine foliage
        ctx.fillRect(nx + 12, ny + 13 + zenFloat, 8, 4);
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(nx + 14, ny + 12 + zenFloat, 4, 2);
        // Zen aura sparkle petals
        if (Math.sin(this.tickCount * 0.1) > 0.4) {
          ctx.fillStyle = '#86efac';
          const petalOffset = (this.tickCount * 0.5) % 8;
          ctx.fillRect(nx + 18 + (petalOffset % 3), ny + 10 + zenFloat - petalOffset * 0.5, 2, 2);
        }
        break;
      }

      case 'cat_librarian': { // Moka - Librarian Cat
        // 1. Tricolor Calico Coat (Caramel base, Espresso patches, White bib)
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(nx + 9, ny + 14 + idleBob, 14, 12);
        ctx.fillStyle = '#451a03'; // Espresso Calico patch
        ctx.fillRect(nx + 9, ny + 14 + idleBob, 5, 8);
        ctx.fillStyle = '#ffffff'; // Snowy white chest bib
        ctx.fillRect(nx + 13 + headTurnX * 0.5, ny + 16 + idleBob, 6, 9);

        // 2. Graceful 3-Joint Animated Striped Tail
        const tailWave = Math.sin(this.tickCount * 0.14) * 3;
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(nx + 5, ny + 17 + idleBob, 4, 3);
        ctx.fillRect(nx + 4 + tailWave * 0.5, ny + 14 + idleBob + tailWave * 0.5, 3, 4);
        ctx.fillRect(nx + 3 + tailWave, ny + 11 + idleBob + tailWave, 3, 4);
        ctx.fillStyle = '#fef08a'; // Golden tail ring
        ctx.fillRect(nx + 3 + tailWave, ny + 12 + idleBob + tailWave, 3, 1);

        // 3. Head & Ears with Listening Twitch
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(nx + 9 + headTurnX, ny + 8 + headBob, 14, 8);
        ctx.fillStyle = '#451a03'; // Head patch
        ctx.fillRect(nx + 9 + headTurnX, ny + 8 + headBob, 4, 4);
        // Ears with pink tufts
        const earTwitchL = Math.sin(this.tickCount * 0.06) > 0.85 ? -1 : 0;
        const earTwitchR = Math.sin(this.tickCount * 0.06 + 1.2) > 0.85 ? 1 : 0;
        ctx.fillStyle = '#c2410c';
        ctx.fillRect(nx + 9 + headTurnX, ny + 4 + headBob + earTwitchL, 4, 5);
        ctx.fillRect(nx + 19 + headTurnX, ny + 4 + headBob + earTwitchR, 4, 5);
        ctx.fillStyle = '#fda4af';
        ctx.fillRect(nx + 10 + headTurnX, ny + 5 + headBob + earTwitchL, 2, 3);
        ctx.fillRect(nx + 20 + headTurnX, ny + 5 + headBob + earTwitchR, 2, 3);

        // 4. Round Brass Librarian Spectacles & Intelligent Green Eyes
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1;
        ctx.strokeRect(nx + 11 + headTurnX + eyeTurnX, ny + 10 + headBob, 4, 4);
        ctx.strokeRect(nx + 17 + headTurnX + eyeTurnX, ny + 10 + headBob, 4, 4);
        ctx.fillStyle = '#15803d'; // Emerald eyes
        ctx.fillRect(nx + 12 + headTurnX + eyeTurnX, ny + 11 + headBob, 2, 2);
        ctx.fillRect(nx + 18 + headTurnX + eyeTurnX, ny + 11 + headBob, 2, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(nx + 12 + headTurnX + eyeTurnX, ny + 11 + headBob, 1, 1);
        ctx.fillRect(nx + 18 + headTurnX + eyeTurnX, ny + 11 + headBob, 1, 1);

        // 5. Pink Snout & Whiskers
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(nx + 15 + headTurnX, ny + 13 + headBob, 2, 1);
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(nx + 8 + headTurnX, ny + 13 + headBob, 3, 1);
        ctx.fillRect(nx + 21 + headTurnX, ny + 13 + headBob, 3, 1);

        // 6. Aristocratic Velvet Crimson Bow Tie with Clock Key Charm
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(nx + 13 + headTurnX * 0.5, ny + 15 + idleBob, 6, 3);
        ctx.fillStyle = '#facc15'; // Golden key/clock charm
        ctx.fillRect(nx + 15 + headTurnX * 0.5, ny + 17 + idleBob, 2, 2);

        // 7. Open Antique Fairytale Tome in front of paws
        ctx.fillStyle = '#1d4ed8'; // Blue leather cover
        ctx.fillRect(nx + 21, ny + 20, 8, 6);
        ctx.fillStyle = '#fef3c7'; // Cream pages
        ctx.fillRect(nx + 22, ny + 21, 6, 4);
        break;
      }

      case 'farmer': { // Pak Joko - Petani Kebun Harapan
        // 1. Traditional Indigo Lurik Tunic with Stripes
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(nx + 9, ny + 14 + idleBob, 14, 12);
        ctx.fillStyle = '#172554'; // Lurik stripes
        ctx.fillRect(nx + 11, ny + 14 + idleBob, 2, 12);
        ctx.fillRect(nx + 15, ny + 14 + idleBob, 2, 12);
        ctx.fillRect(nx + 19, ny + 14 + idleBob, 2, 12);

        // 2. Checkered Red-and-White Sweat Towel around Neck
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(nx + 11, ny + 13 + idleBob, 10, 3);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(nx + 12, ny + 14 + idleBob, 2, 2);
        ctx.fillRect(nx + 16, ny + 14 + idleBob, 2, 2);

        // 3. Boots
        ctx.fillStyle = '#451a03';
        ctx.fillRect(nx + 10, ny + 25, 4, 4);
        ctx.fillRect(nx + 18, ny + 25, 4, 4);

        // 4. Sun-Kissed Face & Eyes
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(nx + 10 + headTurnX, ny + 6 + headBob, 12, 8);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(nx + 11 + headTurnX + eyeTurnX, ny + 8 + headBob, 2, 2);
        ctx.fillRect(nx + 19 + headTurnX + eyeTurnX, ny + 8 + headBob, 2, 2);

        // 5. Friendly Bushy Mustache & Straw Stalk in Mouth
        ctx.fillStyle = '#78350f';
        ctx.fillRect(nx + 11 + headTurnX, ny + 11 + headBob, 10, 2);
        ctx.fillStyle = '#fde047'; // Straw stalk
        ctx.fillRect(nx + 17 + headTurnX, ny + 12 + headBob, 5, 1);

        // 6. Woven Bamboo Caping Sun Hat with Batik Ribbon Band
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(nx + 4 + headTurnX, ny + 4 + headBob, 24, 3);
        ctx.fillStyle = '#d97706';
        ctx.fillRect(nx + 7 + headTurnX, ny + 1 + headBob, 18, 3);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(nx + 11 + headTurnX, ny - 2 + headBob, 10, 3);
        ctx.fillStyle = '#b91c1c'; // Batik Ribbon Band
        ctx.fillRect(nx + 5 + headTurnX, ny + 4 + headBob, 22, 2);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(nx + 7 + headTurnX, ny + 4 + headBob, 2, 2);
        ctx.fillRect(nx + 15 + headTurnX, ny + 4 + headBob, 2, 2);
        ctx.fillRect(nx + 23 + headTurnX, ny + 4 + headBob, 2, 2);

        // 7. Hammered Copper Watering Can Pouring Water onto Sprouting Crops!
        const waterCycle = Math.sin(this.tickCount * 0.09);
        const canTilt = waterCycle > 0.2 ? 3 : 0;
        ctx.fillStyle = '#c2410c'; // Hammered Copper Can
        ctx.fillRect(nx + 21, ny + 14 + idleBob + canTilt, 7, 7);
        ctx.fillStyle = '#fed7aa'; // Copper sheen
        ctx.fillRect(nx + 22, ny + 15 + idleBob + canTilt, 5, 2);
        ctx.fillStyle = '#9a3412'; // Handle
        ctx.fillRect(nx + 20, ny + 12 + idleBob + canTilt, 2, 5);
        ctx.fillStyle = '#f59e0b'; // Brass Spout
        ctx.fillRect(nx + 28, ny + 16 + idleBob + canTilt, 3, 2);

        // Sparkling water drops & fresh green sprout
        if (waterCycle > 0.3) {
          ctx.fillStyle = '#7dd3fc';
          const dropY = (this.tickCount * 2) % 10;
          ctx.fillRect(nx + 30 + (dropY % 2), ny + 19 + dropY, 2, 2);
        }
        // Green sprout growing from ground
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(nx + 30, ny + 27, 2, 3);
        ctx.fillRect(nx + 29, ny + 26, 4, 1);
        break;
      }

      case 'wandering_scout': { // Didi - Little Wanderer Scout (Official 4-Direction Model Sheet)
        // Determine orientation: 'up' (Belakang), 'down' (Depan), 'right' (Kanan), 'left' (Kiri)
        const facing = npc.facing || (turnDir === -1 ? 'left' : turnDir === 1 ? 'right' : 'down');

        if (facing === 'up') {
          // ==================== BELAKANG (BACK VIEW) ====================
          // 1. Soft Ground Shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
          ctx.fillRect(nx + 6, ny + 27, 20, 3.5);

          // 2. Slate Gray Trousers & Brown Hiking Boots
          ctx.fillStyle = '#475569';
          ctx.fillRect(nx + 9, ny + 19 + idleBob, 14, 5);
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(nx + 15, ny + 20 + idleBob, 2, 4); // Inseam gap

          // Hiking Boots
          ctx.fillStyle = '#c2410c';
          ctx.fillRect(nx + 9, ny + 24, 6, 4);
          ctx.fillRect(nx + 17, ny + 24, 6, 4);
          ctx.fillStyle = '#9a3412'; // Soles
          ctx.fillRect(nx + 9, ny + 27, 6, 1.5);
          ctx.fillRect(nx + 17, ny + 27, 6, 1.5);

          // 3. Wooden Walking Staff & Arms
          // Viewer's Left (Didi's Left Arm holding tall walking staff)
          ctx.fillStyle = '#b45309'; // Knob
          ctx.fillRect(nx + 5, ny + 7 + idleBob, 4, 4);
          ctx.fillStyle = '#d97706';
          ctx.fillRect(nx + 6, ny + 8 + idleBob, 2, 2);
          ctx.fillStyle = '#78350f'; // Shaft
          ctx.fillRect(nx + 6, ny + 10 + idleBob, 2, 18);
          ctx.fillStyle = '#ea580c'; // Sleeve
          ctx.fillRect(nx + 5, ny + 13 + idleBob, 3, 5);
          ctx.fillStyle = '#fcd3a7'; // Peach Hand gripping staff
          ctx.fillRect(nx + 4, ny + 14 + idleBob, 4, 3);

          // Viewer's Right (Didi's Right Arm hanging down)
          ctx.fillStyle = '#ea580c';
          ctx.fillRect(nx + 24, ny + 13 + idleBob, 3, 5);
          ctx.fillStyle = '#fcd3a7';
          ctx.fillRect(nx + 24, ny + 18 + idleBob, 3, 3);

          // 4. Large Expedition Green Backpack & Rolled Mat
          // Rolled Sleeping Mat / Bedroll on Top (Tan camel leather)
          ctx.fillStyle = '#92400e';
          ctx.fillRect(nx + 5, ny + 8 + idleBob, 22, 4);
          ctx.fillStyle = '#d97706';
          ctx.fillRect(nx + 6, ny + 9 + idleBob, 20, 2);
          ctx.fillStyle = '#b45309'; // Roll ends
          ctx.fillRect(nx + 5, ny + 9 + idleBob, 2, 2);
          ctx.fillRect(nx + 25, ny + 9 + idleBob, 2, 2);

          // Main Green Pack Body
          ctx.fillStyle = '#15803d';
          ctx.fillRect(nx + 8, ny + 11 + idleBob, 16, 11);
          ctx.fillStyle = '#14532d';
          ctx.fillRect(nx + 8, ny + 11 + idleBob, 1, 11);
          ctx.fillRect(nx + 23, ny + 11 + idleBob, 1, 11);
          // Side Pouch on Right
          ctx.fillStyle = '#166534';
          ctx.fillRect(nx + 24, ny + 12 + idleBob, 2, 8);

          // Leather Harness Straps & Silver Buckles
          ctx.fillStyle = '#b45309';
          ctx.fillRect(nx + 11, ny + 8 + idleBob, 2, 10);
          ctx.fillRect(nx + 19, ny + 8 + idleBob, 2, 10);
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(nx + 10.5, ny + 13 + idleBob, 3, 2);
          ctx.fillRect(nx + 18.5, ny + 13 + idleBob, 3, 2);

          // Lower Pouch with Orange Zipper
          ctx.fillStyle = '#16a34a';
          ctx.fillRect(nx + 10, ny + 16 + idleBob, 12, 5);
          ctx.fillStyle = '#14532d';
          ctx.fillRect(nx + 10, ny + 16 + idleBob, 12, 1);
          ctx.fillStyle = '#ea580c'; // Zipper tab
          ctx.fillRect(nx + 14, ny + 18 + idleBob, 4, 1);

          // 5. Head from Behind (Black Hair & Green Hat)
          ctx.fillStyle = '#000000'; // Black Hair at nape
          ctx.fillRect(nx + 11 + headTurnX, ny + 7 + headBob, 10, 3);

          // Green Scout Fedora Hat with Center Crease
          ctx.fillStyle = '#14532d'; // Brim underside
          ctx.fillRect(nx + 5 + headTurnX, ny + 5 + headBob, 22, 2);
          ctx.fillStyle = '#16a34a'; // Brim top
          ctx.fillRect(nx + 6 + headTurnX, ny + 4 + headBob, 20, 1);
          // Crown
          ctx.fillStyle = '#16a34a';
          ctx.fillRect(nx + 9 + headTurnX, ny + 0 + headBob, 14, 5);
          // Center Crease
          ctx.fillStyle = '#14532d';
          ctx.fillRect(nx + 14 + headTurnX, ny - 1 + headBob, 4, 2);
          // Left & Right Crown Peaks
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(nx + 10 + headTurnX, ny - 1 + headBob, 4, 1);
          ctx.fillRect(nx + 18 + headTurnX, ny - 1 + headBob, 4, 1);

        } else if (facing === 'left') {
          // ==================== KIRI (SIDE LEFT VIEW) ====================
          // 1. Soft Ground Shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
          ctx.fillRect(nx + 4, ny + 27, 22, 3.5);

          // 2. Green Backpack & Rolled Mat on the Right (Behind him)
          // Green Backpack body
          ctx.fillStyle = '#15803d';
          ctx.fillRect(nx + 19, ny + 12 + idleBob, 7, 10);
          ctx.fillStyle = '#14532d';
          ctx.fillRect(nx + 25, ny + 12 + idleBob, 1, 10);
          // Lower side pocket with buckle
          ctx.fillStyle = '#166534';
          ctx.fillRect(nx + 20, ny + 17 + idleBob, 4, 4);
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(nx + 21, ny + 18 + idleBob, 2, 1);

          // Rolled Bedroll on top (Spiral Roll detail!)
          ctx.fillStyle = '#b45309';
          ctx.fillRect(nx + 20, ny + 8 + idleBob, 6, 5);
          ctx.fillStyle = '#d97706';
          ctx.fillRect(nx + 21, ny + 9 + idleBob, 4, 3);
          ctx.fillStyle = '#78350f'; // Spiral curl
          ctx.fillRect(nx + 22, ny + 9 + idleBob, 2, 1);
          ctx.fillRect(nx + 23, ny + 10 + idleBob, 1, 2);

          // 3. Legs & Boots (Profile Stride)
          ctx.fillStyle = '#475569';
          ctx.fillRect(nx + 12, ny + 19 + idleBob, 9, 5);
          ctx.fillRect(nx + 12, ny + 22 + idleBob, 5, 2);
          // Boots pointing left
          ctx.fillStyle = '#c2410c';
          ctx.fillRect(nx + 11, ny + 24, 7, 4);
          ctx.fillRect(nx + 9, ny + 25, 4, 3); // Toe
          ctx.fillStyle = '#9a3412';
          ctx.fillRect(nx + 9, ny + 27, 9, 1.5);

          // 4. Torso & Orange Jacket (Profile)
          ctx.fillStyle = '#ea580c';
          ctx.fillRect(nx + 11, ny + 12 + idleBob, 9, 8);
          // Green harness strap
          ctx.fillStyle = '#15803d';
          ctx.fillRect(nx + 13, ny + 12 + idleBob, 3, 2);
          ctx.fillRect(nx + 14, ny + 14 + idleBob, 3, 2);
          ctx.fillRect(nx + 15, ny + 18 + idleBob, 6, 2);

          // 5. Walking Staff & Hand in Front (Left)
          // Knob
          ctx.fillStyle = '#b45309';
          ctx.fillRect(nx + 5, ny + 7 + idleBob, 4, 4);
          ctx.fillStyle = '#d97706';
          ctx.fillRect(nx + 6, ny + 8 + idleBob, 2, 2);
          // Shaft
          ctx.fillStyle = '#78350f';
          ctx.fillRect(nx + 6, ny + 10 + idleBob, 2, 18);
          // Arm & Hand
          ctx.fillStyle = '#ea580c';
          ctx.fillRect(nx + 9, ny + 13 + idleBob, 5, 4);
          ctx.fillStyle = '#fcd3a7';
          ctx.fillRect(nx + 5, ny + 14 + idleBob, 4, 3);

          // 6. Head Profile Facing Left
          ctx.fillStyle = '#fcd3a7';
          ctx.fillRect(nx + 10 + headTurnX, ny + 6 + headBob, 10, 7);
          ctx.fillRect(nx + 9 + headTurnX, ny + 9 + headBob, 2, 2); // Nose bump
          // Black eye
          ctx.fillStyle = '#000000';
          ctx.fillRect(nx + 11 + headTurnX, ny + 7 + headBob, 2, 2);
          // Mouth
          ctx.fillRect(nx + 10 + headTurnX, ny + 11 + headBob, 2, 1);
          // Ear with inner contour
          ctx.fillStyle = '#fcd3a7';
          ctx.fillRect(nx + 16 + headTurnX, ny + 8 + headBob, 3, 4);
          ctx.fillStyle = '#c2410c';
          ctx.fillRect(nx + 17 + headTurnX, ny + 9 + headBob, 1, 2);

          // 7. Green Hat in Profile
          ctx.fillStyle = '#14532d';
          ctx.fillRect(nx + 5 + headTurnX, ny + 5 + headBob, 18, 2);
          ctx.fillStyle = '#16a34a';
          ctx.fillRect(nx + 6 + headTurnX, ny + 4 + headBob, 16, 1);
          ctx.fillStyle = '#16a34a';
          ctx.fillRect(nx + 8 + headTurnX, ny + 0 + headBob, 12, 5);
          ctx.fillStyle = '#14532d';
          ctx.fillRect(nx + 13 + headTurnX, ny - 1 + headBob, 3, 2);
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(nx + 9 + headTurnX, ny - 1 + headBob, 3, 1);
          ctx.fillRect(nx + 16 + headTurnX, ny - 1 + headBob, 3, 1);

        } else if (facing === 'right') {
          // ==================== KANAN (SIDE RIGHT VIEW) ====================
          // 1. Soft Ground Shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
          ctx.fillRect(nx + 6, ny + 27, 22, 3.5);

          // 2. Green Backpack & Rolled Mat on the Left (Behind him)
          // Green Backpack body
          ctx.fillStyle = '#15803d';
          ctx.fillRect(nx + 6, ny + 12 + idleBob, 7, 10);
          ctx.fillStyle = '#14532d';
          ctx.fillRect(nx + 6, ny + 12 + idleBob, 1, 10);
          // Lower side pocket with buckle
          ctx.fillStyle = '#166534';
          ctx.fillRect(nx + 8, ny + 17 + idleBob, 4, 4);
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(nx + 9, ny + 18 + idleBob, 2, 1);

          // Rolled Bedroll on top (Spiral Roll detail!)
          ctx.fillStyle = '#b45309';
          ctx.fillRect(nx + 6, ny + 8 + idleBob, 6, 5);
          ctx.fillStyle = '#d97706';
          ctx.fillRect(nx + 7, ny + 9 + idleBob, 4, 3);
          ctx.fillStyle = '#78350f'; // Spiral curl
          ctx.fillRect(nx + 8, ny + 9 + idleBob, 2, 1);
          ctx.fillRect(nx + 8, ny + 10 + idleBob, 1, 2);

          // 3. Legs & Boots (Profile Stride)
          ctx.fillStyle = '#475569';
          ctx.fillRect(nx + 11, ny + 19 + idleBob, 9, 5);
          ctx.fillRect(nx + 15, ny + 22 + idleBob, 5, 2);
          // Boots pointing right
          ctx.fillStyle = '#c2410c';
          ctx.fillRect(nx + 14, ny + 24, 7, 4);
          ctx.fillRect(nx + 19, ny + 25, 4, 3); // Toe
          ctx.fillStyle = '#9a3412';
          ctx.fillRect(nx + 14, ny + 27, 9, 1.5);

          // 4. Torso & Orange Jacket (Profile)
          ctx.fillStyle = '#ea580c';
          ctx.fillRect(nx + 12, ny + 12 + idleBob, 9, 8);
          // Green harness strap
          ctx.fillStyle = '#15803d';
          ctx.fillRect(nx + 16, ny + 12 + idleBob, 3, 2);
          ctx.fillRect(nx + 15, ny + 14 + idleBob, 3, 2);
          ctx.fillRect(nx + 11, ny + 18 + idleBob, 6, 2);

          // 5. Walking Staff & Hand in Front (Right)
          // Knob
          ctx.fillStyle = '#b45309';
          ctx.fillRect(nx + 23, ny + 7 + idleBob, 4, 4);
          ctx.fillStyle = '#d97706';
          ctx.fillRect(nx + 24, ny + 8 + idleBob, 2, 2);
          // Shaft
          ctx.fillStyle = '#78350f';
          ctx.fillRect(nx + 24, ny + 10 + idleBob, 2, 18);
          // Arm & Hand
          ctx.fillStyle = '#ea580c';
          ctx.fillRect(nx + 18, ny + 13 + idleBob, 5, 4);
          ctx.fillStyle = '#fcd3a7';
          ctx.fillRect(nx + 23, ny + 14 + idleBob, 4, 3);

          // 6. Head Profile Facing Right
          ctx.fillStyle = '#fcd3a7';
          ctx.fillRect(nx + 12 + headTurnX, ny + 6 + headBob, 10, 7);
          ctx.fillRect(nx + 21 + headTurnX, ny + 9 + headBob, 2, 2); // Nose bump
          // Black eye
          ctx.fillStyle = '#000000';
          ctx.fillRect(nx + 19 + headTurnX, ny + 7 + headBob, 2, 2);
          // Mouth
          ctx.fillRect(nx + 20 + headTurnX, ny + 11 + headBob, 2, 1);
          // Ear with inner contour
          ctx.fillStyle = '#fcd3a7';
          ctx.fillRect(nx + 13 + headTurnX, ny + 8 + headBob, 3, 4);
          ctx.fillStyle = '#c2410c';
          ctx.fillRect(nx + 14 + headTurnX, ny + 9 + headBob, 1, 2);

          // 7. Green Hat in Profile
          ctx.fillStyle = '#14532d';
          ctx.fillRect(nx + 9 + headTurnX, ny + 5 + headBob, 18, 2);
          ctx.fillStyle = '#16a34a';
          ctx.fillRect(nx + 10 + headTurnX, ny + 4 + headBob, 16, 1);
          ctx.fillStyle = '#16a34a';
          ctx.fillRect(nx + 12 + headTurnX, ny + 0 + headBob, 12, 5);
          ctx.fillStyle = '#14532d';
          ctx.fillRect(nx + 16 + headTurnX, ny - 1 + headBob, 3, 2);
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(nx + 13 + headTurnX, ny - 1 + headBob, 3, 1);
          ctx.fillRect(nx + 20 + headTurnX, ny - 1 + headBob, 3, 1);

        } else {
          // ==================== DEPAN (FRONT VIEW - DEFAULT) ====================
          // 1. Soft Ground Shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
          ctx.fillRect(nx + 6, ny + 27, 20, 3.5);

          // 2. Backpack & Bedroll Peeking Behind Left Shoulder (Viewer's Left)
          // Tan Rolled Bedroll
          ctx.fillStyle = '#b45309';
          ctx.fillRect(nx + 4, ny + 9 + idleBob, 6, 4);
          ctx.fillStyle = '#d97706';
          ctx.fillRect(nx + 5, ny + 10 + idleBob, 4, 2);
          // Green Pack Body
          ctx.fillStyle = '#14532d';
          ctx.fillRect(nx + 4, ny + 13 + idleBob, 6, 9);
          ctx.fillStyle = '#16a34a';
          ctx.fillRect(nx + 5, ny + 14 + idleBob, 4, 7);

          // 3. Slate Gray Trousers & Brown Hiking Boots
          ctx.fillStyle = '#475569';
          ctx.fillRect(nx + 9, ny + 19 + idleBob, 14, 5);
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(nx + 15, ny + 20 + idleBob, 2, 4); // Inseam gap

          // Hiking Boots
          ctx.fillStyle = '#c2410c';
          ctx.fillRect(nx + 9, ny + 24, 6, 4);
          ctx.fillRect(nx + 17, ny + 24, 6, 4);
          ctx.fillStyle = '#9a3412'; // Soles
          ctx.fillRect(nx + 9, ny + 27, 6, 1.5);
          ctx.fillRect(nx + 17, ny + 27, 6, 1.5);

          // 4. Torso & Orange Explorer Jacket
          ctx.fillStyle = '#ea580c';
          ctx.fillRect(nx + 9, ny + 12 + idleBob, 14, 8);
          ctx.fillStyle = '#c2410c'; // Inner collar
          ctx.fillRect(nx + 14, ny + 12 + idleBob, 4, 2);

          // Green Shoulder Straps
          ctx.fillStyle = '#15803d';
          ctx.fillRect(nx + 10, ny + 12 + idleBob, 2, 8);
          ctx.fillRect(nx + 20, ny + 12 + idleBob, 2, 8);

          // Badges & Pocket Details (From official model sheet)
          // Green Walkie-Talkie / Clip on left chest (viewer's left)
          ctx.fillStyle = '#15803d';
          ctx.fillRect(nx + 11, ny + 13 + idleBob, 2, 3);
          ctx.fillStyle = '#86efac';
          ctx.fillRect(nx + 11, ny + 13 + idleBob, 2, 1);
          // Blue Pocket / Tag
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(nx + 13, ny + 15 + idleBob, 3, 2);
          // Dark Red Badge
          ctx.fillStyle = '#991b1b';
          ctx.fillRect(nx + 17, ny + 15 + idleBob, 2, 2);
          // Green Pocket / Badge
          ctx.fillStyle = '#16a34a';
          ctx.fillRect(nx + 15, ny + 17 + idleBob, 3, 2);

          // 5. Arms & Hands
          // Right Arm (viewer's left): Hanging down
          ctx.fillStyle = '#ea580c';
          ctx.fillRect(nx + 6, ny + 13 + idleBob, 3, 5);
          ctx.fillStyle = '#fcd3a7';
          ctx.fillRect(nx + 6, ny + 18 + idleBob, 3, 3);

          // Left Arm (viewer's right): Gripping walking staff
          ctx.fillStyle = '#ea580c';
          ctx.fillRect(nx + 23, ny + 13 + idleBob, 3, 5);
          ctx.fillStyle = '#fcd3a7';
          ctx.fillRect(nx + 23, ny + 14 + idleBob, 4, 3);

          // 6. Tall Wooden Walking Staff (Viewer's Right)
          // Round Knob
          ctx.fillStyle = '#b45309';
          ctx.fillRect(nx + 24, ny + 7 + idleBob, 4, 4);
          ctx.fillStyle = '#d97706';
          ctx.fillRect(nx + 25, ny + 8 + idleBob, 2, 2);
          // Shaft
          ctx.fillStyle = '#78350f';
          ctx.fillRect(nx + 25, ny + 10 + idleBob, 2, 18);
          ctx.fillStyle = '#92400e';
          ctx.fillRect(nx + 25, ny + 10 + idleBob, 1, 18);

          // 7. Head & Cheerful Face
          ctx.fillStyle = '#fcd3a7';
          ctx.fillRect(nx + 9 + headTurnX, ny + 6 + headBob, 14, 7);
          // Solid Black Square Eyes
          ctx.fillStyle = '#000000';
          ctx.fillRect(nx + 11 + headTurnX + eyeTurnX, ny + 7 + headBob, 2, 2);
          ctx.fillRect(nx + 19 + headTurnX + eyeTurnX, ny + 7 + headBob, 2, 2);
          // Friendly Smile
          ctx.fillRect(nx + 14 + headTurnX, ny + 10 + headBob, 4, 1);
          ctx.fillRect(nx + 13 + headTurnX, ny + 9.5 + headBob, 1, 1);
          ctx.fillRect(nx + 18 + headTurnX, ny + 9.5 + headBob, 1, 1);

          // 8. Green Scout Fedora Hat with Center Crease
          // Brim
          ctx.fillStyle = '#14532d';
          ctx.fillRect(nx + 5 + headTurnX, ny + 5 + headBob, 22, 2);
          ctx.fillStyle = '#16a34a';
          ctx.fillRect(nx + 6 + headTurnX, ny + 4 + headBob, 20, 1);
          // Creased Crown
          ctx.fillStyle = '#16a34a';
          ctx.fillRect(nx + 9 + headTurnX, ny + 0 + headBob, 14, 5);
          // Center Crease
          ctx.fillStyle = '#14532d';
          ctx.fillRect(nx + 14 + headTurnX, ny - 1 + headBob, 4, 2);
          // Peaks
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(nx + 10 + headTurnX, ny - 1 + headBob, 4, 1);
          ctx.fillRect(nx + 18 + headTurnX, ny - 1 + headBob, 4, 1);
        }
        break;
      }

      case 'woodcutter': { // Pak Teguh - Wise Woodsman
        // 1. Heavy Work Jeans & Sturdy Boots
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(nx + 9, ny + 23, 5, 5);
        ctx.fillRect(nx + 18, ny + 23, 5, 5);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(nx + 8, ny + 26, 6, 3);
        ctx.fillRect(nx + 18, ny + 26, 6, 3);

        // 2. Buffalo-Plaid Red-and-Black Flannel Shirt
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(nx + 8, ny + 13 + idleBob, 16, 11);
        ctx.fillStyle = '#0f172a'; // Plaid grid
        ctx.fillRect(nx + 8, ny + 15 + idleBob, 16, 2);
        ctx.fillRect(nx + 8, ny + 19 + idleBob, 16, 2);
        ctx.fillRect(nx + 12, ny + 13 + idleBob, 2, 11);
        ctx.fillRect(nx + 18, ny + 13 + idleBob, 2, 11);

        // 3. Split-Leather Work Apron with Brass Rivets
        ctx.fillStyle = '#78350f';
        ctx.fillRect(nx + 10, ny + 15 + idleBob, 12, 10);
        ctx.fillStyle = '#facc15'; // Rivets
        ctx.fillRect(nx + 11, ny + 16 + idleBob, 1, 1);
        ctx.fillRect(nx + 20, ny + 16 + idleBob, 1, 1);

        // 4. Kind Woodsman Face
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(nx + 10 + headTurnX, ny + 6 + headBob, 12, 8);

        // 5. Braided Chestnut Woodsman Beard with Brass Ring
        ctx.fillStyle = '#542d13';
        ctx.fillRect(nx + 9 + headTurnX, ny + 10 + headBob, 14, 6);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(nx + 12 + headTurnX, ny + 16 + headBob, 8, 3);
        ctx.fillStyle = '#ca8a04'; // Brass ring
        ctx.fillRect(nx + 15 + headTurnX, ny + 18 + headBob, 2, 2);

        // 6. Kind Eyes
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(nx + 11 + headTurnX + eyeTurnX, ny + 8 + headBob, 2, 2);
        ctx.fillRect(nx + 19 + headTurnX + eyeTurnX, ny + 8 + headBob, 2, 2);

        // 7. Forest Wool Ushanka Watch Cap with Ear Flaps
        ctx.fillStyle = '#065f46';
        ctx.fillRect(nx + 8 + headTurnX, ny + 3 + headBob, 16, 4);
        ctx.fillStyle = '#047857';
        ctx.fillRect(nx + 10 + headTurnX, ny + 1 + headBob, 12, 3);
        ctx.fillStyle = '#065f46';
        ctx.fillRect(nx + 7 + headTurnX, ny + 5 + headBob, 3, 5); // Ear flaps
        ctx.fillRect(nx + 22 + headTurnX, ny + 5 + headBob, 3, 5);

        // 8. Mossy Pine Tree Stump & Carved Heart Rune Axe
        ctx.fillStyle = '#78350f';
        ctx.fillRect(nx + 23, ny + 17, 8, 11);
        ctx.fillStyle = '#15803d'; // Moss on stump
        ctx.fillRect(nx + 24, ny + 17, 6, 2);
        // Polished felling axe with carved heart rune
        ctx.fillStyle = '#b45309';
        ctx.fillRect(nx + 24, ny + 8 + idleBob, 2, 16);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(nx + 22, ny + 7 + idleBob, 6, 4);
        ctx.fillStyle = '#f1f5f9'; // Razor edge
        ctx.fillRect(nx + 22, ny + 7 + idleBob, 2, 4);
        ctx.fillStyle = '#f43f5e'; // Heart rune
        ctx.fillRect(nx + 24.5, ny + 13 + idleBob, 1, 1);
        break;
      }

      case 'fruit_farmer': { // Ibu Sari - Fruit Orchard Farmer
        // 1. Rose-Red Farm Dress with Puff Sleeves
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(nx + 8, ny + 14 + idleBob, 16, 13);

        // 2. Emerald Gardener Apron with Strawberry Embroidery
        ctx.fillStyle = '#10b981';
        ctx.fillRect(nx + 10, ny + 15 + idleBob, 12, 11);
        ctx.fillStyle = '#059669'; // Pocket
        ctx.fillRect(nx + 14, ny + 20 + idleBob, 4, 4);
        ctx.fillStyle = '#ef4444'; // Strawberry
        ctx.fillRect(nx + 15, ny + 21 + idleBob, 2, 2);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(nx + 15.5, ny + 20.5 + idleBob, 1, 1);

        // 3. Maternal Radiant Face & Silver Hoop Earrings
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(nx + 10 + headTurnX, ny + 6 + headBob, 12, 8);
        ctx.fillStyle = '#cbd5e1'; // Silver earrings
        ctx.fillRect(nx + 9 + headTurnX, ny + 10 + headBob, 1, 2);
        ctx.fillRect(nx + 22 + headTurnX, ny + 10 + headBob, 1, 2);

        // 4. Rosy Cheeks & Smiling Eyes
        ctx.fillStyle = '#fca5a5';
        ctx.fillRect(nx + 9 + headTurnX, ny + 10 + headBob, 3, 2);
        ctx.fillRect(nx + 20 + headTurnX, ny + 10 + headBob, 3, 2);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(nx + 11 + headTurnX + eyeTurnX, ny + 8 + headBob, 2, 2);
        ctx.fillRect(nx + 19 + headTurnX + eyeTurnX, ny + 8 + headBob, 2, 2);
        ctx.fillStyle = '#e11d48';
        ctx.fillRect(nx + 14 + headTurnX, ny + 12 + headBob, 4, 1);

        // 5. Woven Straw Sun Hat with Fluttering Crimson Ribbon
        ctx.fillStyle = '#facc15';
        ctx.fillRect(nx + 5 + headTurnX, ny + 4 + headBob, 22, 3);
        ctx.fillStyle = '#eab308';
        ctx.fillRect(nx + 9 + headTurnX, ny + 0 + headBob, 14, 4);
        ctx.fillStyle = '#dc2626'; // Ribbon
        ctx.fillRect(nx + 6 + headTurnX, ny + 3 + headBob, 20, 2);
        const ribbonFlutter = Math.sin(this.tickCount * 0.15) * 2;
        ctx.fillRect(nx + 24 + headTurnX + ribbonFlutter, ny + 5 + headBob, 2, 7);

        // 6. Willow Wicker Basket Overflowing with Red Apples, Pears, and Berries
        ctx.fillStyle = '#78350f';
        ctx.fillRect(nx + 2, ny + 16 + idleBob, 8, 8);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(nx + 3, ny + 17 + idleBob, 6, 6);
        ctx.fillStyle = '#ef4444'; // Red apple
        ctx.fillRect(nx + 3, ny + 14 + idleBob, 3, 3);
        ctx.fillStyle = '#f59e0b'; // Golden pear
        ctx.fillRect(nx + 6, ny + 13 + idleBob, 3, 3);
        ctx.fillStyle = '#8b5cf6'; // Forest berry
        ctx.fillRect(nx + 5, ny + 15 + idleBob, 2, 2);
        break;
      }

      case 'fisherman': { // Bung Jala - Patient River Angler
        // 1. High Wading Rubber Boots
        ctx.fillStyle = '#334155';
        ctx.fillRect(nx + 9, ny + 24, 5, 5);
        ctx.fillRect(nx + 18, ny + 24, 5, 5);

        // 2. Sky Blue Linen Shirt & Multi-Pocket Olive Tackle Vest
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(nx + 8, ny + 13 + idleBob, 16, 11);
        ctx.fillStyle = '#65a30d'; // Vest
        ctx.fillRect(nx + 8, ny + 13 + idleBob, 5, 9);
        ctx.fillRect(nx + 19, ny + 13 + idleBob, 5, 9);
        ctx.fillStyle = '#4d7c0f'; // Tackle box pockets
        ctx.fillRect(nx + 9, ny + 15 + idleBob, 3, 3);
        ctx.fillRect(nx + 20, ny + 15 + idleBob, 3, 3);

        // 3. Calm Sun-Tanned Face & Meditative Eyes
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(nx + 10 + headTurnX, ny + 6 + headBob, 12, 8);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(nx + 11 + headTurnX + eyeTurnX, ny + 8 + headBob, 3, 1);
        ctx.fillRect(nx + 18 + headTurnX + eyeTurnX, ny + 8 + headBob, 3, 1);

        // 4. Olive Angler Bucket Hat with Colorful Fly Lures
        ctx.fillStyle = '#ca8a04';
        ctx.fillRect(nx + 6 + headTurnX, ny + 3 + headBob, 20, 3);
        ctx.fillStyle = '#a16207';
        ctx.fillRect(nx + 9 + headTurnX, ny + 0 + headBob, 14, 4);
        ctx.fillStyle = '#ec4899'; // Pink fly lure
        ctx.fillRect(nx + 20 + headTurnX, ny + 1 + headBob, 2, 2);
        ctx.fillStyle = '#06b6d4'; // Cyan fly lure
        ctx.fillRect(nx + 17 + headTurnX, ny + 1 + headBob, 2, 2);

        // 5. Split-Bamboo Fishing Rod with Reel
        ctx.fillStyle = '#78350f';
        ctx.fillRect(nx + 18, ny + 10 + idleBob, 10, 2);
        ctx.fillRect(nx + 26, ny + 6 + idleBob, 8, 2);
        ctx.fillRect(nx + 33, ny + 2 + idleBob, 6, 2);
        ctx.fillStyle = '#facc15'; // Brass reel
        ctx.fillRect(nx + 20, ny + 11 + idleBob, 3, 3);

        // 6. Monofilament Line & Red-and-White Bobber in River with Ripples
        const lineDropY = ny + 28;
        ctx.fillStyle = 'rgba(241, 245, 249, 0.7)';
        ctx.fillRect(nx + 38, ny + 3 + idleBob, 1, lineDropY - (ny + 3 + idleBob));

        const bobberWave = Math.sin(this.tickCount * 0.15) * 2;
        ctx.fillStyle = '#ef4444'; // Red half
        ctx.fillRect(nx + 37, lineDropY + bobberWave, 3, 2);
        ctx.fillStyle = '#ffffff'; // White half
        ctx.fillRect(nx + 37, lineDropY + bobberWave + 2, 3, 2);

        // Concentric water ripple rings
        const rippleR = ((this.tickCount * 0.4) % 10) + 2;
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(nx + 38, lineDropY + bobberWave + 2, rippleR, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }

      case 'spirit_elder': // Sosok Kabut / Nenek Wilis
      default:
        if (npc.isResolved) {
          // --- REVEALED FORM: NENEK WILIS (TRADITIONAL ELDER IN ROYAL BATIK KEBAYA) ---
          // 1. Royal Maroon Batik Kebaya Skirt with Golden Prada Motifs
          ctx.fillStyle = '#831843';
          ctx.fillRect(nx + 8, ny + 14 + idleBob, 16, 13);
          ctx.fillStyle = '#fbbf24'; // Golden floral motifs
          ctx.fillRect(nx + 10, ny + 17 + idleBob, 2, 2);
          ctx.fillRect(nx + 18, ny + 19 + idleBob, 2, 2);
          ctx.fillRect(nx + 12, ny + 22 + idleBob, 2, 2);

          // 2. Emerald Green Silk Selendang (Sash) with Golden Fringes
          ctx.fillStyle = '#047857';
          ctx.fillRect(nx + 7, ny + 14 + idleBob, 4, 12);
          ctx.fillStyle = '#facc15'; // Golden fringe
          ctx.fillRect(nx + 7, ny + 25 + idleBob, 4, 2);

          // 3. Dignified Face & Pearl Necklace
          ctx.fillStyle = '#fed7aa';
          ctx.fillRect(nx + 10 + headTurnX, ny + 6 + headBob, 12, 8);
          ctx.fillStyle = '#f8fafc'; // Pearl necklace
          ctx.fillRect(nx + 12 + headTurnX, ny + 13 + headBob, 8, 2);

          // 4. Silver Traditional Hair Bun (Sanggul)
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(nx + 9 + headTurnX, ny + 3 + headBob, 14, 5);
          ctx.fillStyle = '#e2e8f0'; // High coiled bun
          ctx.fillRect(nx + 13 + headTurnX, ny + 1 + headBob, 6, 3);

          // 5. 3 Golden Hairpins (Cunduk Mentul) with Sparkles
          ctx.fillStyle = '#facc15';
          ctx.fillRect(nx + 13 + headTurnX, ny - 1 + headBob, 1, 3);
          ctx.fillRect(nx + 16 + headTurnX, ny - 2 + headBob, 1, 4);
          ctx.fillRect(nx + 19 + headTurnX, ny - 1 + headBob, 1, 3);

          // 6. Loving Grandmotherly Eyes
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(nx + 11 + headTurnX + eyeTurnX, ny + 8 + headBob, 3, 2);
          ctx.fillRect(nx + 18 + headTurnX + eyeTurnX, ny + 8 + headBob, 3, 2);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(nx + 12 + headTurnX + eyeTurnX, ny + 8 + headBob, 1, 1);
          ctx.fillRect(nx + 19 + headTurnX + eyeTurnX, ny + 8 + headBob, 1, 1);

          // 7. Village Chronicle Ledger in Hand
          ctx.fillStyle = '#78350f';
          ctx.fillRect(nx + 20, ny + 17 + idleBob, 7, 9);
          ctx.fillStyle = '#fef3c7';
          ctx.fillRect(nx + 21, ny + 18 + idleBob, 5, 7);
          ctx.fillStyle = '#f59e0b'; // Golden crest
          ctx.fillRect(nx + 22, ny + 20 + idleBob, 3, 3);
        } else {
          // --- UNRESOLVED FORM: SOSOK KABUT (ETHEREAL AURORAL SPIRIT) ---
          const mistWobble1 = Math.sin(this.tickCount * 0.12) * 3;
          const mistWobble2 = Math.cos(this.tickCount * 0.08) * 2;

          // 1. Swirling violet-cyan auroral spirit mist
          ctx.fillStyle = 'rgba(147, 51, 234, 0.4)';
          ctx.beginPath();
          ctx.arc(nx + 16 + mistWobble1, ny + 15 + idleBob + mistWobble2, 14, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = 'rgba(59, 130, 246, 0.5)';
          ctx.beginPath();
          ctx.arc(nx + 16 - mistWobble2, ny + 14 + idleBob - mistWobble1, 11, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = 'rgba(192, 132, 252, 0.65)';
          ctx.beginPath();
          ctx.arc(nx + 16 + mistWobble2 * 0.5, ny + 13 + idleBob, 8, 0, Math.PI * 2);
          ctx.fill();

          // 2. Glowing Ancient Runes
          ctx.fillStyle = '#67e8f9';
          ctx.fillRect(nx + 8 + mistWobble1, ny + 10 + idleBob, 2, 2);
          ctx.fillStyle = '#fde047';
          ctx.fillRect(nx + 22 - mistWobble2, ny + 20 + idleBob, 2, 2);

          // 3. Luminous Amethyst Spirit Eyes tracking player
          ctx.fillStyle = '#c084fc';
          ctx.fillRect(nx + 12 + mistWobble1 + eyeTurnX, ny + 12 + idleBob, 3, 2);
          ctx.fillRect(nx + 18 + mistWobble1 + eyeTurnX, ny + 12 + idleBob, 3, 2);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(nx + 13 + mistWobble1 + eyeTurnX, ny + 12 + idleBob, 1, 1);
          ctx.fillRect(nx + 19 + mistWobble1 + eyeTurnX, ny + 12 + idleBob, 1, 1);

          // 4. Floating Antique Spirit Lantern with Golden Inner Flame
          const lanternFloat = Math.sin(this.tickCount * 0.15) * 2;
          ctx.fillStyle = '#b45309';
          ctx.fillRect(nx + 22, ny + 14 + idleBob + lanternFloat, 5, 7);
          ctx.fillStyle = '#fef08a'; // Glowing flame
          ctx.fillRect(nx + 23, ny + 15 + idleBob + lanternFloat, 3, 5);
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(nx + 24, ny + 17 + idleBob + lanternFloat, 1, 2);
          ctx.fillStyle = '#ca8a04'; // Handle
          ctx.fillRect(nx + 23, ny + 12 + idleBob + lanternFloat, 3, 2);
        }
        break;
    }

    // Ground target indicator for active sequential quest NPC
    const isActiveQuestTarget = Boolean(this.activeQuestTarget && this.activeQuestTarget.npcId === npc.id);
    if (isActiveQuestTarget) {
      const ringPhase = this.tickCount * 0.1;
      const ringPulse = (Math.sin(ringPhase) + 1) / 2;
      const rOuter = 16 + ringPulse * 5;
      ctx.save();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(nx + 16, ny + 27, rOuter, rOuter * 0.45, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(251, 191, 36, 0.35)';
      ctx.beginPath();
      ctx.ellipse(nx + 16, ny + 27, rOuter * 0.75, rOuter * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Name badge / interaction prompt floating above NPC (smoothly bobs with headBob)
    // Label nama dihilangkan khusus bagi NPC yang sedang mengobrol dengan NPC lain
    if (!npc.isChatting) {
      ctx.font = '9px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      const displayName = npc.isResolved ? `✨ ${npc.name}` : npc.name;
      const textW = ctx.measureText(displayName).width;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(nx + 16 - textW / 2 - 5, ny - 11 + headBob, textW + 10, 14);
      ctx.strokeStyle = npc.isResolved ? '#22c55e' : isActiveQuestTarget ? '#f59e0b' : '#eab308';
      ctx.lineWidth = isActiveQuestTarget ? 2 : 1;
      ctx.strokeRect(nx + 16 - textW / 2 - 5, ny - 11 + headBob, textW + 10, 14);

      ctx.fillStyle = npc.isResolved ? '#4ade80' : isActiveQuestTarget ? '#fbbf24' : '#fef08a';
      ctx.fillText(displayName, nx + 16, ny + headBob);
    }

    // Indikator visual target misi aktif ATAU tanda tanya biasa
    if (isActiveQuestTarget) {
      const qPhase = this.tickCount * 0.15;
      const qBob = Math.sin(qPhase) * 4;
      const qCenterX = nx + 16;
      const qCenterY = ny - 28 + qBob;

      // Soft pulsating glow halo behind the mission badge
      const glowPulse = 0.5 + Math.sin(qPhase) * 0.25;
      ctx.fillStyle = `rgba(245, 158, 11, ${glowPulse})`;
      ctx.beginPath();
      ctx.arc(qCenterX, qCenterY + 4, 15, 0, Math.PI * 2);
      ctx.fill();

      // Bold Red/Gold "★ MISI X" Pill Badge
      const stepNum = this.activeQuestTarget?.stepNumber || 1;
      const badgeText = `★ MISI ${stepNum}`;
      ctx.font = 'bold 8px "Pixelify Sans", "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const bW = ctx.measureText(badgeText).width;

      ctx.fillStyle = '#dc2626'; // Bright eye-catching scarlet badge
      ctx.fillRect(qCenterX - bW / 2 - 5, qCenterY - 14, bW + 10, 13);
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(qCenterX - bW / 2 - 5, qCenterY - 14, bW + 10, 13);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(badgeText, qCenterX, qCenterY - 7);

      // Golden Circular Balloon with Exclamation Point [ ! ]
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(qCenterX, qCenterY + 6, 8.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(qCenterX - 2, qCenterY + 4, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(qCenterX, qCenterY + 6, 8.5, 0, Math.PI * 2);
      ctx.stroke();

      ctx.font = 'bold 12px "Press Start 2P", monospace';
      ctx.fillStyle = '#1e1b4b';
      ctx.fillText('!', qCenterX, qCenterY + 7);

      // Sparkle stars
      const sp = Math.floor((this.tickCount * 0.15) % 4);
      ctx.fillStyle = '#ffffff';
      if (sp === 0) ctx.fillRect(qCenterX - 14, qCenterY, 3, 3);
      else if (sp === 1) ctx.fillRect(qCenterX + 12, qCenterY - 5, 3, 3);
      else if (sp === 2) ctx.fillRect(qCenterX + 13, qCenterY + 7, 3, 3);
      else ctx.fillRect(qCenterX - 11, qCenterY - 9, 3, 3);
    } else if (!npc.isResolved) {
      const qPhase = this.tickCount * 0.12 + npc.x * 2.3;
      const qBob = Math.sin(qPhase) * 3.5;
      const qCenterX = nx + 16;
      const qCenterY = ny - 24 + qBob;

      // Soft pulsating glow halo behind the question mark
      const glowPulse = 0.35 + Math.sin(qPhase) * 0.18;
      ctx.fillStyle = `rgba(245, 158, 11, ${glowPulse})`;
      ctx.beginPath();
      ctx.arc(qCenterX, qCenterY, 11, 0, Math.PI * 2);
      ctx.fill();

      // Shadow under question balloon
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.arc(qCenterX, qCenterY + 1.5, 9, 0, Math.PI * 2);
      ctx.fill();

      // Golden Circular Balloon
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(qCenterX, qCenterY, 8.5, 0, Math.PI * 2);
      ctx.fill();

      // Inner bright highlight
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(qCenterX - 2, qCenterY - 2, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Balloon pointer tip pointing down toward NPC head
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(qCenterX - 3, qCenterY + 7);
      ctx.lineTo(qCenterX + 3, qCenterY + 7);
      ctx.lineTo(qCenterX, qCenterY + 11);
      ctx.closePath();
      ctx.fill();

      // Balloon dark outline
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(qCenterX, qCenterY, 8.5, 0, Math.PI * 2);
      ctx.stroke();

      // Bold, crisp '?' (tanda tanya) in deep navy contrast
      ctx.font = 'bold 11px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#1e1b4b';
      ctx.fillText('?', qCenterX, qCenterY + 1);

      // Tiny animated sparkle star
      const sparkleFrame = Math.floor((this.tickCount * 0.1 + npc.y) % 4);
      if (sparkleFrame === 0 || sparkleFrame === 2) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(qCenterX + 7, qCenterY - 7, 2, 2);
      }
    }

    // -----------------------------------------------------------------------
    // FREE ROAM: CHATTING BUBBLE INDICATOR (Icon bubble chat kecil di atas NPC)
    // -----------------------------------------------------------------------
    if (npc.isChatting) {
      const bubblePhase = this.tickCount * 0.12 + npc.x * 1.5;
      const bubbleBob = Math.sin(bubblePhase) * 2.5;
      const bx = nx + 16;
      const by = ny - 13 + bubbleBob;

      ctx.save();
      // Soft ambient glow
      ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.beginPath();
      ctx.arc(bx, by, 12, 0, Math.PI * 2);
      ctx.fill();

      // Bubble drop shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.arc(bx + 1, by + 1.5, 9, 0, Math.PI * 2);
      ctx.fill();

      // White speech bubble body
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(bx, by, 8.5, 0, Math.PI * 2);
      ctx.fill();

      // Speech pointer tail
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(bx - 3, by + 6.5);
      ctx.lineTo(bx + 3, by + 6.5);
      ctx.lineTo(bx, by + 11);
      ctx.closePath();
      ctx.fill();

      // Crisp outline
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(bx, by, 8.5, 0, Math.PI * 2);
      ctx.stroke();

      // Tail outline
      ctx.beginPath();
      ctx.moveTo(bx - 3, by + 6.5);
      ctx.lineTo(bx, by + 11);
      ctx.lineTo(bx + 3, by + 6.5);
      ctx.stroke();

      // Animated 3 speech dots (... typing/chatting effect)
      const dotTick = (this.tickCount * 0.15) % 3;
      const dotColor1 = dotTick < 1 ? '#0284c7' : '#94a3b8';
      const dotColor2 = dotTick >= 1 && dotTick < 2 ? '#0284c7' : '#94a3b8';
      const dotColor3 = dotTick >= 2 ? '#0284c7' : '#94a3b8';

      ctx.fillStyle = dotColor1;
      ctx.fillRect(bx - 4.5, by - 1, 2, 2);
      ctx.fillStyle = dotColor2;
      ctx.fillRect(bx - 1, by - 1, 2, 2);
      ctx.fillStyle = dotColor3;
      ctx.fillRect(bx + 2.5, by - 1, 2, 2);

      ctx.restore();
    } else if (npc.isRoaming) {
      // Roaming indicator badge (small compass / footsteps icon indicator)
      const roamPhase = this.tickCount * 0.14 + npc.x * 2;
      const roamBob = Math.sin(roamPhase) * 2;
      const rx = nx + 16;
      const ry = ny - 24 + roamBob;

      ctx.save();
      // Amber glow for active wandering
      ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
      ctx.beginPath();
      ctx.arc(rx, ry, 11, 0, Math.PI * 2);
      ctx.fill();

      // Badge body
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(rx, ry, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Tiny icon depending on sprite / character
      if (npc.sprite === 'squirrel') {
        // Mail envelope for Kiki delivering letters
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(rx - 3.5, ry - 2.5, 7, 5);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(rx - 1, ry - 1, 2, 2); // Red wax seal
      } else if (npc.sprite === 'chicken_glasses') {
        // Dual emotion reactor canisters (green & orange) for Prof. Kotek
        ctx.fillStyle = '#22c55e'; // Green liquid canister
        ctx.fillRect(rx - 3, ry - 3, 3, 5);
        ctx.fillStyle = '#f97316'; // Orange liquid canister
        ctx.fillRect(rx + 1, ry - 3, 3, 5);
        ctx.fillStyle = '#475569'; // Metal caps
        ctx.fillRect(rx - 3, ry - 4, 7, 1);
        ctx.fillRect(rx - 3, ry + 2, 7, 1);
      } else {
        // Official Scout Compass Emblem for Didi (matching model sheet badge)
        ctx.fillStyle = '#d97706'; // Outer gold/bronze circular rim
        ctx.beginPath();
        ctx.arc(rx, ry - 0.5, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1e293b'; // Dark slate inner circle
        ctx.beginPath();
        ctx.arc(rx, ry - 0.5, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#10b981'; // Emerald central sensor/compass core
        ctx.fillRect(rx - 1, ry - 1.5, 2, 2);
      }
      ctx.restore();
    }
  }

  // Draw the Resonance Compass Auras & Deep Emotions
  private drawResonanceAuras(player: Player, npcs: NPC[]) {
    const ctx = this.ctx;
    const px = player.x + 16;
    const py = player.y + 16;

    // Dual expanding resonance pulse wave
    const pulseRadius = (this.tickCount * 2) % 200;
    const pulseFade = Math.max(0, 1 - pulseRadius / 200);

    // Primary pulse wave (Radiant golden amber)
    ctx.save();
    ctx.strokeStyle = `rgba(250, 204, 21, ${0.5 * pulseFade})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(px, py, pulseRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Trailing inner wave (Emerald harmony)
    if (pulseRadius > 20) {
      ctx.strokeStyle = `rgba(52, 211, 153, ${0.35 * pulseFade})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(px, py, pulseRadius - 20, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Sparkling resonance nodes along the expanding wave perimeter
    const nodeCount = 8;
    for (let i = 0; i < nodeCount; i++) {
      const nodeAngle = (i / nodeCount) * Math.PI * 2 + this.tickCount * 0.04;
      const sx = px + Math.cos(nodeAngle) * pulseRadius;
      const sy = py + Math.sin(nodeAngle) * pulseRadius;
      const twinkle = Math.sin(this.tickCount * 0.25 + i) * 0.4 + 0.6;

      ctx.fillStyle = i % 2 === 0 ? '#fef08a' : '#34d399';
      ctx.globalAlpha = pulseFade * twinkle;
      const starR = 2.5;
      ctx.beginPath();
      ctx.moveTo(sx, sy - starR * 1.6);
      ctx.lineTo(sx + starR * 0.4, sy - starR * 0.4);
      ctx.lineTo(sx + starR * 1.6, sy);
      ctx.lineTo(sx + starR * 0.4, sy + starR * 0.4);
      ctx.lineTo(sx, sy + starR * 1.6);
      ctx.lineTo(sx - starR * 0.4, sy + starR * 0.4);
      ctx.lineTo(sx - starR * 1.6, sy);
      ctx.lineTo(sx - starR * 0.4, sy - starR * 0.4);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Scan NPCs within resonance radius
    npcs.forEach((npc) => {
      const nx = npc.x * TILE_SIZE + 16;
      const ny = npc.y * TILE_SIZE + 16;
      const dist = Math.hypot(nx - px, ny - py);

      // Trigger sympathetic resonance sparkles on NPC when pulse reaches them
      if (dist < 280 && Math.abs(dist - pulseRadius) < 18) {
        if (this.tickCount % 6 === 0) {
          const emotionColor = this.getEmotionColor(npc.emotionProfile.surfaceEmotion);
          this.particles.push({
            x: nx + (Math.random() - 0.5) * 20,
            y: ny + (Math.random() - 0.5) * 20,
            vx: (Math.random() - 0.5) * 0.6,
            vy: -0.6 - Math.random() * 0.6,
            life: 0,
            maxLife: 22,
            color: emotionColor,
            size: 2.2,
            shape: 'sparkle',
            twinkle: true,
          });
        }
      }

      if (dist < 280) {
        // Draw emotional spectrum aura
        const isResolved = npc.isResolved;
        const auraColor = isResolved
          ? 'rgba(34, 197, 94, 1)' // Shimmering green harmony
          : this.getEmotionColor(npc.emotionProfile.surfaceEmotion);
        const deepColor = isResolved
          ? 'rgba(250, 204, 21, 1)' // Warm golden gratitude
          : this.getEmotionColor(npc.emotionProfile.deepEmotion);

        // Flashing aura halo
        const auraAlpha = isResolved
          ? 0.5 + Math.sin(this.tickCount * 0.15) * 0.25
          : 0.4 + Math.sin(this.tickCount * 0.1) * 0.2;
        ctx.fillStyle = auraColor.replace('1)', `${auraAlpha})`);
        ctx.beginPath();
        ctx.arc(nx, ny - 4, isResolved ? 26 : 22, 0, Math.PI * 2);
        ctx.fill();

        if (isResolved) {
          // Extra rotating golden sparkle ring for resolved characters
          ctx.strokeStyle = 'rgba(254, 240, 138, 0.7)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.lineDashOffset = this.tickCount * 0.5;
          ctx.beginPath();
          ctx.arc(nx, ny - 4, 30, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Emotional iceberg indicator above NPC
        ctx.font = '8px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';

        const surfaceLabel = isResolved
          ? `Luar: ${npc.emotionProfile.surfaceEmotion.toUpperCase()} (LEGA & HARMONIS)`
          : `Luar: ${npc.emotionProfile.surfaceEmotion.toUpperCase()}`;
        const deepLabel = isResolved
          ? `Hati: ${npc.emotionProfile.deepEmotion.toUpperCase()} (DAMAI & BERSYUKUR)`
          : `Hati: ${npc.emotionProfile.deepEmotion.toUpperCase()}`;

        // Tag background
        const tagW = isResolved ? 150 : 116;
        const tagH = isResolved ? 36 : 28;
        const tagY = isResolved ? ny - 55 : ny - 45;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
        ctx.fillRect(nx - tagW / 2, tagY, tagW, tagH);
        ctx.strokeStyle = isResolved ? '#22c55e' : auraColor;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(nx - tagW / 2, tagY, tagW, tagH);

        if (isResolved) {
          // Mini title badge
          ctx.font = '7px "Press Start 2P", monospace';
          ctx.fillStyle = '#fef08a';
          ctx.fillText('✨ HATI TERBUKA ✨', nx, tagY + 9);

          ctx.font = '8px "Plus Jakarta Sans", sans-serif';
          ctx.fillStyle = '#4ade80';
          ctx.fillText(surfaceLabel, nx, tagY + 20);
          ctx.fillStyle = '#fde047';
          ctx.fillText(deepLabel, nx, tagY + 31);
        } else {
          // Surface emotion
          ctx.fillStyle = auraColor;
          ctx.fillText(surfaceLabel, nx, tagY + 11);
          // Deep hidden emotion
          ctx.fillStyle = deepColor;
          ctx.fillText(deepLabel, nx, tagY + 23);
        }
      }
    });
  }

  private getEmotionColor(emotion: EmotionType): string {
    switch (emotion) {
      case 'marah': return 'rgba(239, 68, 68, 1)';   // Red
      case 'cemas': return 'rgba(234, 179, 8, 1)';   // Amber/Yellow
      case 'sedih': return 'rgba(59, 130, 246, 1)';  // Blue
      case 'takut': return 'rgba(168, 85, 247, 1)';  // Purple
      case 'kecewa': return 'rgba(14, 165, 233, 1)'; // Cyan
      case 'tenang': return 'rgba(34, 197, 94, 1)';  // Green
      case 'gembira': return 'rgba(249, 115, 22, 1)';// Orange
      case 'haru': return 'rgba(236, 72, 153, 1)';   // Pink
      default: return 'rgba(255, 255, 255, 1)';
    }
  }

  // Draw secret sparkles over ancient tree
  private drawSecretSparkles(isCompassActive: boolean) {
    if (isCompassActive) {
      const ctx = this.ctx;
      const tx = 4 * TILE_SIZE + 16;
      const ty = 4 * TILE_SIZE + 16;
      const pulse = Math.sin(this.tickCount * 0.1) * 4;

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(tx, ty - pulse, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private updateAndDrawParticles() {
    const ctx = this.ctx;
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.gravity) p.vy += p.gravity;
      if (p.drag) {
        p.vx *= p.drag;
        p.vy *= p.drag;
      }
      if (p.vRot) {
        p.rotation = (p.rotation || 0) + p.vRot;
      }
      p.life++;

      const progress = p.life / p.maxLife;
      const alpha = Math.max(0, 1 - progress);
      const currentSize = p.shrink ? Math.max(1, Math.round(p.size * (1 - progress * 0.4))) : p.size;

      if (p.shape === 'sparkle') {
        // 4-pointed radiant sparkle star with twinkling glint and soft bloom
        const twinkleScale = p.twinkle
          ? (Math.sin(p.life * 0.35) * 0.35 + 1.0)
          : 1.0;
        const radius = Math.max(1.5, currentSize * twinkleScale);
        const px = Math.floor(p.x);
        const py = Math.floor(p.y);

        ctx.save();
        ctx.translate(px, py);
        if (p.rotation) {
          ctx.rotate(p.rotation);
        }

        // Soft atmospheric glow bloom
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha * 0.35;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 2.2, 0, Math.PI * 2);
        ctx.fill();

        // 4-pointed radiant sparkle diamond star
        ctx.globalAlpha = alpha * 0.95;
        ctx.beginPath();
        ctx.moveTo(0, -radius * 2);
        ctx.lineTo(radius * 0.35, -radius * 0.35);
        ctx.lineTo(radius * 2, 0);
        ctx.lineTo(radius * 0.35, radius * 0.35);
        ctx.lineTo(0, radius * 2);
        ctx.lineTo(-radius * 0.35, radius * 0.35);
        ctx.lineTo(-radius * 2, 0);
        ctx.lineTo(-radius * 0.35, -radius * 0.35);
        ctx.closePath();
        ctx.fill();

        // Bright pure white center glint
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = alpha;
        ctx.fillRect(-1, -1, 2, 2);

        ctx.restore();
      } else if (p.shape === 'circle') {
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha * 0.8;
        ctx.beginPath();
        ctx.arc(Math.floor(p.x), Math.floor(p.y), currentSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (p.shape === 'ring') {
        ctx.save();
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = alpha * 0.75;
        ctx.beginPath();
        ctx.arc(Math.floor(p.x), Math.floor(p.y), currentSize, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      } else {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), currentSize, currentSize);
        ctx.globalAlpha = 1.0;
      }

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

  // Initialize dynamic atmospheric fog particle pools with distinct depth tiers for parallax
  private initFogSystem(camX: number, camY: number, worldW: number, worldH: number) {
    if (this.fogSystemInitialized) return;
    this.fogSystemInitialized = true;

    // Palette of dried, wilted autumn & misty desaturated leaves
    const leafPalettes = [
      { color: '#b48a58', accent: '#d5aa76', stem: '#6b5438' }, // Golden ochre
      { color: '#828c74', accent: '#9fa890', stem: '#525a48' }, // Muted sage olive
      { color: '#a06e50', accent: '#c48968', stem: '#5e402e' }, // Russet ember
      { color: '#6e7f80', accent: '#8da2a3', stem: '#465354' }, // Cold misty slate
      { color: '#9c8e76', accent: '#baad94', stem: '#5e5443' }, // Dried birch
    ];

    // 1. Initialize 30 flying leaves distributed across 3 depth tiers:
    //    - Background (depth 0.45 - 0.65): smaller, softer, slower parallax
    //    - Midground (depth 0.90 - 1.15): standard size, ground elevation
    //    - Foreground (depth 1.45 - 1.85): large, crisp, soaring close to viewer lens
    const leafDepthConfigs = [
      { minDepth: 0.45, maxDepth: 0.65, minSize: 2.2, maxSize: 3.2, opacityMult: 0.65, speedMult: 0.75 },
      { minDepth: 0.90, maxDepth: 1.15, minSize: 3.8, maxSize: 5.2, opacityMult: 0.85, speedMult: 1.0 },
      { minDepth: 1.45, maxDepth: 1.85, minSize: 6.2, maxSize: 8.2, opacityMult: 1.0, speedMult: 1.35 },
    ];

    for (let i = 0; i < 30; i++) {
      const tier = leafDepthConfigs[i % 3];
      const pal = leafPalettes[i % leafPalettes.length];
      const depth = tier.minDepth + Math.random() * (tier.maxDepth - tier.minDepth);
      const size = tier.minSize + Math.random() * (tier.maxSize - tier.minSize);
      this.fogLeaves.push({
        id: i,
        x: camX + Math.random() * (worldW + 100) - 50,
        y: camY + Math.random() * (worldH + 100) - 50,
        vx: (1.5 + Math.random() * 1.5) * tier.speedMult,
        vy: (0.25 + Math.random() * 0.6) * tier.speedMult,
        size,
        angle: Math.random() * Math.PI * 2,
        angularSpeed: (Math.random() - 0.5) * 0.08,
        flutterPhase: Math.random() * Math.PI * 2,
        flutterSpeed: 0.05 + Math.random() * 0.08,
        leafType: Math.floor(Math.random() * 3),
        color: pal.color,
        accentColor: pal.accent,
        stemColor: pal.stem,
        baseOpacity: (0.75 + Math.random() * 0.25) * tier.opacityMult,
        depth,
      });
    }
    // Sort leaves back-to-front so foreground leaves render on top of background leaves
    this.fogLeaves.sort((a, b) => a.depth - b.depth);

    // 2. Initialize 15 graceful wind gust ribbons across depths
    const streakDepthConfigs = [
      { minDepth: 0.5, maxDepth: 0.7, minLen: 22, maxLen: 34, width: 0.8, op: 0.2 },
      { minDepth: 0.9, maxDepth: 1.15, minLen: 34, maxLen: 50, width: 1.4, op: 0.32 },
      { minDepth: 1.4, maxDepth: 1.8, minLen: 48, maxLen: 70, width: 2.2, op: 0.42 },
    ];
    for (let i = 0; i < 15; i++) {
      const tier = streakDepthConfigs[i % 3];
      const depth = tier.minDepth + Math.random() * (tier.maxDepth - tier.minDepth);
      this.fogWindStreaks.push({
        id: i,
        x: camX + Math.random() * (worldW + 160) - 80,
        y: camY + Math.random() * worldH,
        length: tier.minLen + Math.random() * (tier.maxLen - tier.minLen),
        speed: (2.8 + Math.random() * 2.5) * (0.8 + depth * 0.25),
        width: tier.width,
        curvature: (Math.random() - 0.5) * 12,
        driftY: 0.35 + Math.random() * 0.7,
        opacity: tier.op + Math.random() * 0.12,
        phase: Math.random() * Math.PI * 2,
        depth,
      });
    }
    this.fogWindStreaks.sort((a, b) => a.depth - b.depth);

    // 3. Initialize 36 atmospheric fog mist motes across depths
    const moteDepthConfigs = [
      { minDepth: 0.35, maxDepth: 0.65, minSz: 1.0, maxSz: 1.8, alpha: 0.14 },
      { minDepth: 0.85, maxDepth: 1.15, minSz: 2.0, maxSz: 2.8, alpha: 0.24 },
      { minDepth: 1.35, maxDepth: 1.8, minSz: 3.4, maxSz: 5.0, alpha: 0.34 },
    ];
    for (let i = 0; i < 36; i++) {
      const tier = moteDepthConfigs[i % 3];
      const depth = tier.minDepth + Math.random() * (tier.maxDepth - tier.minDepth);
      this.fogMistMotes.push({
        id: i,
        x: camX + Math.random() * worldW,
        y: camY + Math.random() * worldH,
        vx: (0.6 + Math.random() * 0.8) * (0.7 + depth * 0.3),
        vy: (Math.random() - 0.5) * 0.3,
        size: tier.minSz + Math.random() * (tier.maxSz - tier.minSz),
        alpha: tier.alpha + Math.random() * 0.1,
        phase: Math.random() * Math.PI * 2,
        depth,
      });
    }
    this.fogMistMotes.sort((a, b) => a.depth - b.depth);
  }

  // Draw atmospheric fog mist, wind gusts, and flying leaves over unrecovered areas with silky fade-in/fade-out transitions
  private drawAtmosphericMist(
    status: ZoneColorStatus,
    w: number,
    h: number,
    camX: number,
    camY: number,
    player: Player
  ) {
    const ctx = this.ctx;
    const isAllRestored =
      this.isAllMissionsCompleted ||
      (status.plaza && status.bridge && status.forest && status.tower);

    // Dynamically calculate target fog intensity based on player position and village restoration status
    if (isAllRestored) {
      // Village is fully restored: fog completely clears away
      this.targetFogIntensity = 0.0;
    } else {
      const playerCol = Math.floor((player.x + 16) / TILE_SIZE);
      const playerRow = Math.floor((player.y + 16) / TILE_SIZE);
      const isCurrentZoneRestored = this.isZoneColored(playerCol, playerRow, status);
      // In restored oasis pockets, fog calms down to a soft 0.18 hint; in misty dreary zones, it is full 1.0
      this.targetFogIntensity = isCurrentZoneRestored ? 0.18 : 1.0;
    }

    // Smooth exponential ease-in-out transition (lerp)
    // A lerp rate of 0.032 at 60 FPS produces a smooth ~1.6 - 2.0s natural fade-in / fade-out atmospheric transition
    const lerpRate = 0.032;
    this.currentFogIntensity += (this.targetFogIntensity - this.currentFogIntensity) * lerpRate;
    if (Math.abs(this.targetFogIntensity - this.currentFogIntensity) < 0.002) {
      this.currentFogIntensity = this.targetFogIntensity;
    }

    // If fog intensity is fully zeroed out and world is fully restored, cleanly skip fog rendering
    if (this.currentFogIntensity <= 0.002 && this.targetFogIntensity === 0.0) {
      return;
    }

    // Calculate player movement delta for depth parallax
    let deltaPlayerX = 0;
    let deltaPlayerY = 0;
    if (this.lastPlayerX >= 0 && this.lastPlayerY >= 0) {
      const dx = player.x - this.lastPlayerX;
      const dy = player.y - this.lastPlayerY;
      // Guard against teleportation jumps (> 40px in a single frame)
      if (Math.hypot(dx, dy) < 40) {
        deltaPlayerX = dx;
        deltaPlayerY = dy;
      }
    }
    this.lastPlayerX = player.x;
    this.lastPlayerY = player.y;

    // Ensure particle pools are populated in current camera bounds
    this.initFogSystem(camX, camY, w, h);

    const atmosphericIntensity = Math.max(0.0, Math.min(1.0, this.currentFogIntensity));

    // Dynamic Global Wind Gust Engine:
    // A rhythmic wind wave with periodic howling gusts
    const time = this.tickCount;
    // Gust oscillation: cycles periodically with dramatic surging peaks
    const gustPulse = Math.sin(time * 0.022);
    const isGusting = gustPulse > 0.28;
    const gustMultiplier = isGusting
      ? 1.0 + Math.pow((gustPulse - 0.28) / 0.72, 1.8) * 2.6
      : 1.0;
    const globalWindX = 1.5 * gustMultiplier * atmosphericIntensity;

    ctx.save();

    // 1. Layered rolling mist ribbons with wavy sinusoidal edges, edge vignette & depth parallax
    this.renderFogRollingRibbons(
      ctx,
      camX,
      camY,
      w,
      h,
      time,
      atmosphericIntensity,
      deltaPlayerX,
      deltaPlayerY
    );

    // 2. Micro mist vapor motes floating across the fog with depth parallax
    this.renderFogMistMotes(
      ctx,
      camX,
      camY,
      w,
      h,
      time,
      globalWindX,
      atmosphericIntensity,
      deltaPlayerX,
      deltaPlayerY
    );

    // 3. Dynamic Wind Gust Streaks with depth parallax
    this.renderFogWindStreaks(
      ctx,
      camX,
      camY,
      w,
      h,
      time,
      gustMultiplier,
      atmosphericIntensity,
      deltaPlayerX,
      deltaPlayerY
    );

    // 4. Flying Leaves tumbling and fluttering with 3D roll and depth parallax
    this.renderFogFlyingLeaves(
      ctx,
      camX,
      camY,
      w,
      h,
      time,
      gustMultiplier,
      atmosphericIntensity,
      deltaPlayerX,
      deltaPlayerY
    );

    ctx.restore();
  }

  // Render rolling translucent mist ribbons across the landscape with depth parallax
  private renderFogRollingRibbons(
    ctx: CanvasRenderingContext2D,
    camX: number,
    camY: number,
    w: number,
    h: number,
    time: number,
    intensity: number,
    deltaPlayerX: number,
    deltaPlayerY: number
  ) {
    const np = this.timeOfDayProgress;
    const fogR = Math.round(148 * (1 - np) + 24 * np);
    const fogG = Math.round(163 * (1 - np) + 34 * np);
    const fogB = Math.round(184 * (1 - np) + 58 * np);

    // Top atmospheric cold haze
    const topGrad = ctx.createLinearGradient(0, camY, 0, camY + h * 0.35);
    topGrad.addColorStop(0, `rgba(${fogR}, ${fogG}, ${fogB}, ${(0.16 + 0.12 * np) * intensity})`);
    topGrad.addColorStop(1, `rgba(${fogR}, ${fogG}, ${fogB}, 0)`);
    ctx.fillStyle = topGrad;
    ctx.fillRect(camX, camY, w, h * 0.35);

    // Soft atmospheric peripheral mist vignette surrounding the viewport in fog mode
    if (intensity > 0.02) {
      const centerX = camX + w * 0.5;
      const centerY = camY + h * 0.5;
      const innerRadius = Math.min(w, h) * 0.35;
      const outerRadius = Math.max(w, h) * 0.72;
      const vignetteGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        innerRadius,
        centerX,
        centerY,
        outerRadius
      );
      vignetteGrad.addColorStop(0, `rgba(${fogR}, ${fogG}, ${fogB}, 0)`);
      vignetteGrad.addColorStop(1, `rgba(${fogR}, ${fogG}, ${fogB}, ${(0.12 + 0.18 * np) * intensity})`);
      ctx.fillStyle = vignetteGrad;
      ctx.fillRect(camX, camY, w, h);
    }

    // Rolling fog bands across screen with sinusoidal height, drift, and parallax depth
    const bands = [
      { baseOffset: 30, height: 42, speed: 0.7, alpha: 0.13, freq: 0.015, amp: 8, depth: 0.45 },
      { baseOffset: 120, height: 50, speed: 1.1, alpha: 0.15, freq: 0.02, amp: 11, depth: 0.95 },
      { baseOffset: 220, height: 46, speed: 0.85, alpha: 0.12, freq: 0.012, amp: 9, depth: 1.4 },
    ];

    for (let i = 0; i < bands.length; i++) {
      const band = bands[i];
      // Parallax shift based on ribbon depth relative to player movement
      this.fogRibbonParallaxX[i] += (1.0 - band.depth) * deltaPlayerX;
      this.fogRibbonParallaxY[i] += (1.0 - band.depth) * deltaPlayerY;

      const shiftX = (time * band.speed + this.fogRibbonParallaxX[i]) % (w + 80);
      const bandY = camY + ((band.baseOffset + time * 0.2 + this.fogRibbonParallaxY[i]) % (h + 40)) - 20;

      ctx.fillStyle = `rgba(${fogR}, ${fogG}, ${fogB}, ${band.alpha * intensity * (1 + 0.2 * np)})`;
      ctx.beginPath();
      ctx.moveTo(camX - 20, bandY);

      // Undulating wave along the top of the fog band
      const step = 40;
      for (let x = camX - 20; x <= camX + w + 20; x += step) {
        const waveY = bandY + Math.sin((x + shiftX) * band.freq) * band.amp;
        ctx.lineTo(x, waveY);
      }
      ctx.lineTo(camX + w + 20, bandY + band.height);
      for (let x = camX + w + 20; x >= camX - 20; x -= step) {
        const waveY =
          bandY + band.height + Math.cos((x + shiftX) * band.freq * 1.3) * (band.amp * 0.6);
        ctx.lineTo(x, waveY);
      }
      ctx.closePath();
      ctx.fill();
    }
  }

  // Render micro mist motes floating along the fog wind with depth parallax
  private renderFogMistMotes(
    ctx: CanvasRenderingContext2D,
    camX: number,
    camY: number,
    w: number,
    h: number,
    time: number,
    globalWindX: number,
    intensity: number,
    deltaPlayerX: number,
    deltaPlayerY: number
  ) {
    for (const m of this.fogMistMotes) {
      // Parallax shift: particles at different depths shift at varying speeds relative to player movement
      // depth < 1.0 (distant) shifts with the player, moving slower across the viewport
      // depth > 1.0 (foreground) shifts against player movement, rushing past quickly
      const parallaxShiftX = (1.0 - m.depth) * deltaPlayerX;
      const parallaxShiftY = (1.0 - m.depth) * deltaPlayerY;

      // Update position
      m.x += m.vx + globalWindX * 0.6 + parallaxShiftX;
      m.y += m.vy + Math.sin(m.phase + time * 0.03) * 0.25 + parallaxShiftY;

      // Wrap around camera viewport
      const margin = 40;
      if (m.x > camX + w + margin) {
        m.x = camX - margin - Math.random() * 30;
        m.y = camY + Math.random() * h;
      } else if (m.x < camX - margin * 1.5) {
        m.x = camX + w + margin;
        m.y = camY + Math.random() * h;
      }
      if (m.y > camY + h + margin) {
        m.y = camY - margin;
        m.x = camX + Math.random() * w;
      } else if (m.y < camY - margin) {
        m.y = camY + h + margin;
        m.x = camX + Math.random() * w;
      }

      // Pulse alpha
      const alphaPulse = 0.5 + 0.5 * Math.sin(m.phase + time * 0.04);
      const alpha = m.alpha * alphaPulse * intensity;

      if (alpha <= 0.02) continue;

      // Foreground motes (closer to camera) have a subtle soft luminous aura
      if (m.depth > 1.3) {
        ctx.fillStyle = `rgba(241, 245, 249, ${alpha * 0.3})`;
        ctx.beginPath();
        ctx.arc(Math.round(m.x), Math.round(m.y), m.size * 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = m.depth > 1.2 ? `rgba(248, 250, 252, ${alpha})` : `rgba(226, 232, 240, ${alpha})`;
      ctx.beginPath();
      ctx.arc(Math.round(m.x), Math.round(m.y), m.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Render dynamic wind gust ribbons rushing across the landscape with depth parallax
  private renderFogWindStreaks(
    ctx: CanvasRenderingContext2D,
    camX: number,
    camY: number,
    w: number,
    h: number,
    time: number,
    gustMultiplier: number,
    intensity: number,
    deltaPlayerX: number,
    deltaPlayerY: number
  ) {
    for (const s of this.fogWindStreaks) {
      // Wind streaks surge in speed when gusts pick up, modulated by parallax depth
      const currentSpeed = s.speed * (0.8 + gustMultiplier * 0.7) * intensity;
      const parallaxShiftX = (1.0 - s.depth) * deltaPlayerX;
      const parallaxShiftY = (1.0 - s.depth) * deltaPlayerY;
      s.x += currentSpeed + parallaxShiftX;
      s.y += s.driftY + Math.sin(s.phase + time * 0.05) * 0.3 + parallaxShiftY;

      // Wrap around
      if (s.x > camX + w + s.length + 40) {
        s.x = camX - s.length - 30 - Math.random() * 40;
        s.y = camY + Math.random() * h;
        s.length = 26 + Math.random() * 48;
        s.curvature = (Math.random() - 0.5) * 10;
      } else if (s.x < camX - s.length - 60) {
        s.x = camX + w + 30;
        s.y = camY + Math.random() * h;
      }
      if (s.y > camY + h + 30) {
        s.y = camY - 20;
      } else if (s.y < camY - 30) {
        s.y = camY + h + 20;
      }

      const gustAlphaBonus = Math.min(1.0, (gustMultiplier - 0.9) * 0.6);
      const streakAlpha = (s.opacity + gustAlphaBonus * 0.25) * intensity;
      if (streakAlpha <= 0.02) continue;

      ctx.save();
      // Graceful wind streak line
      ctx.strokeStyle = `rgba(226, 232, 240, ${streakAlpha * 0.75})`;
      ctx.lineWidth = s.width;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      const midX = s.x + s.length * 0.5;
      const midY = s.y + s.curvature + Math.sin(s.phase + time * 0.08) * 3;
      const endX = s.x + s.length;
      const endY = s.y + s.driftY * 2;
      ctx.quadraticCurveTo(midX, midY, endX, endY);
      ctx.stroke();

      // Trailing subtle vapor bead during strong gusts or on foreground streaks
      if (gustMultiplier > 1.3 || s.depth > 1.35) {
        ctx.fillStyle = `rgba(241, 245, 249, ${streakAlpha * 0.85})`;
        ctx.beginPath();
        ctx.arc(endX + 2, endY, s.width * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // Render flying leaves swept by the fog wind with 3D tumbling and depth parallax
  private renderFogFlyingLeaves(
    ctx: CanvasRenderingContext2D,
    camX: number,
    camY: number,
    w: number,
    h: number,
    time: number,
    gustMultiplier: number,
    intensity: number,
    deltaPlayerX: number,
    deltaPlayerY: number
  ) {
    if (intensity <= 0.005) return;
    for (const leaf of this.fogLeaves) {
      // Depth parallax: particles at different depths move at varying speeds relative to player movement
      const parallaxShiftX = (1.0 - leaf.depth) * deltaPlayerX;
      const parallaxShiftY = (1.0 - leaf.depth) * deltaPlayerY;

      // Horizontal drift boosted by wind gust, atmospheric intensity, and player movement parallax
      const currentVx = (leaf.vx + (gustMultiplier - 1.0) * 2.2) * (0.4 + intensity * 0.6);
      leaf.x += currentVx + parallaxShiftX;

      // Vertical drift with sinusoidal floating wave and parallax
      leaf.flutterPhase += leaf.flutterSpeed * (0.8 + (gustMultiplier - 1) * 0.5);
      const waveVy = Math.sin(leaf.flutterPhase) * (0.6 + intensity * 0.7) + leaf.vy;
      leaf.y += waveVy + parallaxShiftY;

      // Rotational spinning
      leaf.angle += leaf.angularSpeed * (0.8 + (gustMultiplier - 1) * 0.8);

      // Wrap around camera bounds
      const margin = 50;
      if (leaf.x > camX + w + margin) {
        leaf.x = camX - margin - Math.random() * 50;
        leaf.y = camY - 20 + Math.random() * (h + 40);
      } else if (leaf.x < camX - margin * 2) {
        leaf.x = camX + w + margin;
        leaf.y = camY - 20 + Math.random() * (h + 40);
      }
      if (leaf.y > camY + h + margin) {
        leaf.y = camY - margin;
        leaf.x = camX + Math.random() * w;
      } else if (leaf.y < camY - margin * 1.5) {
        leaf.y = camY + h + margin;
        leaf.x = camX + Math.random() * w;
      }

      // 3D roll scale: leaf tumbling end-over-end in the breeze
      const rollCos = Math.cos(leaf.flutterPhase);
      const rollScale = Math.abs(rollCos) < 0.18 ? 0.18 * Math.sign(rollCos || 1) : rollCos;

      ctx.save();
      ctx.translate(Math.round(leaf.x), Math.round(leaf.y));
      ctx.rotate(leaf.angle);
      ctx.scale(1, rollScale);
      ctx.globalAlpha = Math.max(0, Math.min(1.0, leaf.baseOpacity * intensity));

      // Render pixel leaf based on leafType
      const sz = leaf.size;

      // Ground shadow depth: foreground leaves floating higher above ground have shadow offset further down
      const shadowDistY = leaf.depth > 1.3 ? 3.5 : (leaf.depth < 0.8 ? 1.2 : 2.0);
      ctx.fillStyle = leaf.depth < 0.8 ? 'rgba(15, 23, 42, 0.14)' : 'rgba(15, 23, 42, 0.24)';
      ctx.beginPath();
      ctx.ellipse(1, shadowDistY, sz * 0.8, sz * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();

      if (leaf.leafType === 0) {
        // --- Type 0: Pointed Teardrop Leaf (Daun Gugur Lembah) ---
        // Base leaf body
        ctx.fillStyle = leaf.color;
        ctx.beginPath();
        ctx.moveTo(0, -sz * 1.2);
        ctx.quadraticCurveTo(sz * 0.75, -sz * 0.1, 0, sz);
        ctx.quadraticCurveTo(-sz * 0.75, -sz * 0.1, 0, -sz * 1.2);
        ctx.fill();

        // Shaded highlight side
        ctx.fillStyle = leaf.accentColor;
        ctx.beginPath();
        ctx.moveTo(0, -sz * 1.2);
        ctx.quadraticCurveTo(sz * 0.75, -sz * 0.1, 0, sz);
        ctx.lineTo(0, -sz * 1.2);
        ctx.fill();

        // Leaf central spine / vein
        ctx.strokeStyle = leaf.stemColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -sz * 0.9);
        ctx.lineTo(0, sz * 1.25);
        ctx.stroke();
      } else if (leaf.leafType === 1) {
        // --- Type 1: Lobed Oak Leaf (Daun Pohon Purba) ---
        ctx.fillStyle = leaf.color;
        ctx.beginPath();
        ctx.moveTo(0, -sz * 1.3);
        ctx.lineTo(sz * 0.5, -sz * 0.8);
        ctx.lineTo(sz * 0.25, -sz * 0.4);
        ctx.lineTo(sz * 0.8, 0);
        ctx.lineTo(sz * 0.3, sz * 0.4);
        ctx.lineTo(sz * 0.6, sz * 0.8);
        ctx.lineTo(0, sz * 1.1);
        ctx.lineTo(-sz * 0.6, sz * 0.8);
        ctx.lineTo(-sz * 0.3, sz * 0.4);
        ctx.lineTo(-sz * 0.8, 0);
        ctx.lineTo(-sz * 0.25, -sz * 0.4);
        ctx.lineTo(-sz * 0.5, -sz * 0.8);
        ctx.closePath();
        ctx.fill();

        // Highlight upper lobe
        ctx.fillStyle = leaf.accentColor;
        ctx.beginPath();
        ctx.moveTo(0, -sz * 1.3);
        ctx.lineTo(sz * 0.5, -sz * 0.8);
        ctx.lineTo(sz * 0.25, -sz * 0.4);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();

        // Stem
        ctx.strokeStyle = leaf.stemColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -sz * 0.7);
        ctx.lineTo(0, sz * 1.35);
        ctx.stroke();
      } else {
        // --- Type 2: Slender Willow Leaf (Daun Dedalu Lembah) ---
        ctx.fillStyle = leaf.color;
        ctx.beginPath();
        ctx.moveTo(-sz * 1.3, -sz * 0.3);
        ctx.quadraticCurveTo(0, -sz * 0.55, sz * 1.3, 0);
        ctx.quadraticCurveTo(0, sz * 0.55, -sz * 1.3, -sz * 0.3);
        ctx.fill();

        // Top highlight
        ctx.fillStyle = leaf.accentColor;
        ctx.beginPath();
        ctx.moveTo(-sz * 1.3, -sz * 0.3);
        ctx.quadraticCurveTo(0, -sz * 0.55, sz * 1.3, 0);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();

        // Curved stem
        ctx.strokeStyle = leaf.stemColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-sz * 1.45, -sz * 0.35);
        ctx.lineTo(sz * 0.8, 0);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  // Unified Day & Night dynamic lighting pass
  // Seamlessly transitions the world between day and night in BOTH Fog Mode and Free Roam Mode
  private renderDayNightLightingPass(
    ctx: CanvasRenderingContext2D,
    camX: number,
    camY: number,
    w: number,
    h: number,
    player: Player,
    map: number[][],
    zoneColorStatus: ZoneColorStatus
  ) {
    const progress = this.timeOfDayProgress;
    if (progress <= 0.001) return; // Full daylight, no shadow overlay required

    ctx.save();

    // 1. Dusk / Twilight blush during transition (peaks smoothly around golden hour)
    const duskIntensity = Math.sin(progress * Math.PI) * 0.24;
    if (duskIntensity > 0.01) {
      const duskGrad = ctx.createLinearGradient(0, camY, 0, camY + h);
      duskGrad.addColorStop(0, `rgba(244, 63, 94, ${duskIntensity * 0.45})`);
      duskGrad.addColorStop(0.4, `rgba(249, 115, 22, ${duskIntensity * 0.35})`);
      duskGrad.addColorStop(1, `rgba(124, 58, 237, ${duskIntensity * 0.25})`);
      ctx.fillStyle = duskGrad;
      ctx.fillRect(camX, camY, w, h);
    }

    // 2. Nocturnal darkness overlay with smooth ambient alpha
    const nightAlpha = progress * (this.isAllMissionsCompleted ? 0.62 : 0.72);
    if (nightAlpha > 0.01) {
      const baseNightColor = this.isAllMissionsCompleted ? '10, 15, 30' : '6, 10, 20';
      ctx.fillStyle = `rgba(${baseNightColor}, ${nightAlpha})`;
      ctx.fillRect(camX, camY, w, h);

      // 3. Player's warm exploration lantern aura (lights up surroundings at night)
      const playerCenterX = player.x + 16;
      const playerCenterY = player.y + 20;
      const lanternRadius = 82 + Math.sin(this.tickCount * 0.06) * 4;

      const pLight = ctx.createRadialGradient(
        playerCenterX,
        playerCenterY,
        4,
        playerCenterX,
        playerCenterY,
        lanternRadius
      );
      pLight.addColorStop(0, `rgba(254, 240, 138, ${0.45 * progress})`);
      pLight.addColorStop(0.35, `rgba(245, 158, 11, ${0.28 * progress})`);
      pLight.addColorStop(0.7, `rgba(217, 119, 6, ${0.1 * progress})`);
      pLight.addColorStop(1, 'rgba(217, 119, 6, 0)');

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = pLight;
      ctx.beginPath();
      ctx.arc(playerCenterX, playerCenterY, lanternRadius, 0, Math.PI * 2);
      ctx.fill();

      // Handheld lantern light source
      const lanternX = playerCenterX + (player.facing === 'left' ? -11 : 11);
      const lanternY = playerCenterY - 2;
      const glowSparkle = ctx.createRadialGradient(lanternX, lanternY, 1, lanternX, lanternY, 20);
      glowSparkle.addColorStop(0, `rgba(255, 255, 255, ${0.75 * progress})`);
      glowSparkle.addColorStop(0.3, `rgba(253, 224, 71, ${0.5 * progress})`);
      glowSparkle.addColorStop(1, 'rgba(253, 224, 71, 0)');
      ctx.fillStyle = glowSparkle;
      ctx.beginPath();
      ctx.arc(lanternX, lanternY, 20, 0, Math.PI * 2);
      ctx.fill();

      // 4. Street Lamps, Village Houses, Grand Clock Tower, and Special Light Sources in viewport
      const startCol = Math.max(0, Math.floor(camX / TILE_SIZE) - 3);
      const endCol = Math.min(map[0]?.length ?? 0, Math.ceil((camX + w) / TILE_SIZE) + 3);
      const startRow = Math.max(0, Math.floor(camY / TILE_SIZE) - 3);
      const endRow = Math.min(map.length, Math.ceil((camY + h) / TILE_SIZE) + 3);

      for (let r = startRow; r < endRow; r++) {
        const row = map[r];
        if (!row) continue;
        for (let c = startCol; c < endCol; c++) {
          const tile = row[c];

          // --- A. LAMPU JALAN & ALUN-ALUN (STREET LAMPS) ---
          // Menyinari jalan setapak desa, rerumputan, dan pagar kayu dengan cahaya hangat keemasan
          if (tile === TILE.LAMP_POST) {
            const lx = c * TILE_SIZE + 16;
            const ly = r * TILE_SIZE + 6;
            const flicker = Math.sin(this.tickCount * 0.08 + (c * 7 + r * 13)) * 3;
            const rad = 110 + flicker;

            // Pendaran cahaya tanah yang luas menyinari desa
            const lampLight = ctx.createRadialGradient(lx, ly + 8, 3, lx, ly + 8, rad);
            lampLight.addColorStop(0, `rgba(255, 250, 220, ${0.85 * progress})`);
            lampLight.addColorStop(0.25, `rgba(254, 240, 138, ${0.62 * progress})`);
            lampLight.addColorStop(0.55, `rgba(245, 158, 11, ${0.30 * progress})`);
            lampLight.addColorStop(0.85, `rgba(217, 119, 6, ${0.10 * progress})`);
            lampLight.addColorStop(1, 'rgba(217, 119, 6, 0)');
            ctx.fillStyle = lampLight;
            ctx.beginPath();
            ctx.arc(lx, ly + 8, rad, 0, Math.PI * 2);
            ctx.fill();

            // Inti lentera kaca yang menyala terang benderang
            const bulbGlow = ctx.createRadialGradient(lx, ly, 1, lx, ly, 14);
            bulbGlow.addColorStop(0, `rgba(255, 255, 255, ${0.98 * progress})`);
            bulbGlow.addColorStop(0.4, `rgba(254, 240, 138, ${0.82 * progress})`);
            bulbGlow.addColorStop(1, 'rgba(254, 240, 138, 0)');
            ctx.fillStyle = bulbGlow;
            ctx.beginPath();
            ctx.arc(lx, ly, 14, 0, Math.PI * 2);
            ctx.fill();

          // --- B. RUMAH WARGA (HOUSE WINDOWS & DOORS) ---
          // Jendela rumah warga bersinar hangat dari dalam dan memancarkan cahaya ke pekarangan/jalan
          } else if (tile === TILE.HOUSE_WINDOW) {
            const wx = c * TILE_SIZE + 16;
            const wy = r * TILE_SIZE + 12;
            const pulse = Math.sin(this.tickCount * 0.07 + c * 3 + r * 5) * 0.05;

            // Sorot cahaya hangat yang memancar keluar ke pekarangan rumah & jalan desa
            const windowLight = ctx.createRadialGradient(wx, wy + 4, 3, wx, wy + 16, 75);
            windowLight.addColorStop(0, `rgba(254, 240, 138, ${(0.82 + pulse) * progress})`);
            windowLight.addColorStop(0.35, `rgba(245, 158, 11, ${(0.48 + pulse) * progress})`);
            windowLight.addColorStop(0.7, `rgba(217, 119, 6, ${0.16 * progress})`);
            windowLight.addColorStop(1, 'rgba(217, 119, 6, 0)');
            ctx.fillStyle = windowLight;
            ctx.beginPath();
            ctx.arc(wx, wy + 16, 75, 0, Math.PI * 2);
            ctx.fill();

            // Kaca jendela langsung berpendar keemasan menembus kegelapan malam
            ctx.fillStyle = `rgba(254, 240, 138, ${(0.92 + pulse) * progress})`;
            ctx.fillRect(c * TILE_SIZE + 10, r * TILE_SIZE + 5, 5, 6);
            ctx.fillRect(c * TILE_SIZE + 17, r * TILE_SIZE + 5, 5, 6);
            ctx.fillRect(c * TILE_SIZE + 10, r * TILE_SIZE + 13, 5, 6);
            ctx.fillRect(c * TILE_SIZE + 17, r * TILE_SIZE + 13, 5, 6);

            // Titik nyala api lentera dalam rumah
            ctx.fillStyle = `rgba(255, 255, 255, ${(0.78 + pulse) * progress})`;
            ctx.fillRect(c * TILE_SIZE + 11, r * TILE_SIZE + 6, 3, 4);
            ctx.fillRect(c * TILE_SIZE + 18, r * TILE_SIZE + 6, 3, 4);

          } else if (tile === TILE.HOUSE_DOOR) {
            const dx = c * TILE_SIZE + 16;
            const dy = r * TILE_SIZE + 26;
            // Cahaya hangat ambang pintu rumah
            const doorLight = ctx.createRadialGradient(dx, dy, 2, dx, dy + 6, 52);
            doorLight.addColorStop(0, `rgba(254, 240, 138, ${0.70 * progress})`);
            doorLight.addColorStop(0.4, `rgba(245, 158, 11, ${0.36 * progress})`);
            doorLight.addColorStop(1, 'rgba(245, 158, 11, 0)');
            ctx.fillStyle = doorLight;
            ctx.beginPath();
            ctx.arc(dx, dy + 6, 52, 0, Math.PI * 2);
            ctx.fill();

            // Celah cahaya di bawah daun pintu
            ctx.fillStyle = `rgba(254, 240, 138, ${0.85 * progress})`;
            ctx.fillRect(c * TILE_SIZE + 8, r * TILE_SIZE + 27, 16, 3);

          } else if (tile === TILE.HOUSE_WALL) {
            // Nuansa hangat lembut pada dinding rumah berpenghuni
            const cx = c * TILE_SIZE + 16;
            const cy = r * TILE_SIZE + 16;
            const wallLight = ctx.createRadialGradient(cx, cy, 2, cx, cy, 38);
            wallLight.addColorStop(0, `rgba(254, 240, 138, ${0.18 * progress})`);
            wallLight.addColorStop(1, 'rgba(254, 240, 138, 0)');
            ctx.fillStyle = wallLight;
            ctx.beginPath();
            ctx.arc(cx, cy, 38, 0, Math.PI * 2);
            ctx.fill();

          // --- C. PONDOK HUTAN PAK TEGUH (FOREST CABIN) ---
          } else if (tile === TILE.FOREST_CABIN_WINDOW || tile === TILE.FOREST_CABIN_DOOR) {
            const fx = c * TILE_SIZE + 16;
            const fy = r * TILE_SIZE + 14;
            const fPulse = Math.sin(this.tickCount * 0.1 + c) * 0.08;
            const cabinLight = ctx.createRadialGradient(fx, fy, 4, fx, fy + 12, 70);
            cabinLight.addColorStop(0, `rgba(254, 215, 170, ${(0.85 + fPulse) * progress})`);
            cabinLight.addColorStop(0.35, `rgba(249, 115, 22, ${(0.50 + fPulse) * progress})`);
            cabinLight.addColorStop(0.7, `rgba(194, 65, 12, ${0.18 * progress})`);
            cabinLight.addColorStop(1, 'rgba(194, 65, 12, 0)');
            ctx.fillStyle = cabinLight;
            ctx.beginPath();
            ctx.arc(fx, fy + 12, 70, 0, Math.PI * 2);
            ctx.fill();

            if (tile === TILE.FOREST_CABIN_WINDOW) {
              ctx.fillStyle = `rgba(254, 240, 138, ${(0.90 + fPulse) * progress})`;
              ctx.fillRect(c * TILE_SIZE + 10, r * TILE_SIZE + 7, 12, 10);
              ctx.fillStyle = `rgba(255, 255, 255, ${0.75 * progress})`;
              ctx.fillRect(c * TILE_SIZE + 12, r * TILE_SIZE + 9, 8, 6);
            }

          // --- D. PONDOK KAKEK DAMAI (ZEN MINDFUL TEA HOUSE) ---
          } else if (tile === TILE.ZEN_WINDOW || tile === TILE.ZEN_DOOR) {
            const zx = c * TILE_SIZE + 16;
            const zy = r * TILE_SIZE + 14;
            const zenLight = ctx.createRadialGradient(zx, zy, 3, zx, zy + 10, 65);
            zenLight.addColorStop(0, `rgba(254, 243, 199, ${0.80 * progress})`);
            zenLight.addColorStop(0.4, `rgba(245, 158, 11, ${0.40 * progress})`);
            zenLight.addColorStop(0.75, `rgba(217, 119, 6, ${0.14 * progress})`);
            zenLight.addColorStop(1, 'rgba(217, 119, 6, 0)');
            ctx.fillStyle = zenLight;
            ctx.beginPath();
            ctx.arc(zx, zy + 10, 65, 0, Math.PI * 2);
            ctx.fill();

            if (tile === TILE.ZEN_WINDOW) {
              ctx.fillStyle = `rgba(254, 240, 138, ${0.85 * progress})`;
              ctx.fillRect(c * TILE_SIZE + 9, r * TILE_SIZE + 6, 14, 12);
            }

          // --- E. MENARA JAM DESA (THE GRAND CLOCK TOWER) ---
          // Jam Harmoni raksasa bersinar megah menerangi puncak menara dan seluruh pelataran alun-alun
          } else if (tile === TILE.TOWER_CLOCK) {
            const tx = c * TILE_SIZE + 16;
            const ty = r * TILE_SIZE + 16;
            const pulse = Math.sin(this.tickCount * 0.06) * 6;
            const clockRad = 140 + pulse;

            // Halo cahaya megah keemasan menara jam
            const clockHalo = ctx.createRadialGradient(tx, ty, 6, tx, ty, clockRad);
            clockHalo.addColorStop(0, `rgba(255, 255, 250, ${0.98 * progress})`);
            clockHalo.addColorStop(0.15, `rgba(254, 240, 138, ${0.88 * progress})`);
            clockHalo.addColorStop(0.4, `rgba(245, 158, 11, ${0.55 * progress})`);
            clockHalo.addColorStop(0.7, `rgba(217, 119, 6, ${0.22 * progress})`);
            clockHalo.addColorStop(1, 'rgba(217, 119, 6, 0)');
            ctx.fillStyle = clockHalo;
            ctx.beginPath();
            ctx.arc(tx, ty, clockRad, 0, Math.PI * 2);
            ctx.fill();

            // Piringan jam bersinar bercahaya
            ctx.fillStyle = `rgba(254, 252, 232, ${0.95 * progress})`;
            ctx.beginPath();
            ctx.arc(tx, ty, 12, 0, Math.PI * 2);
            ctx.fill();

            // Sinar salib keemasan penunjuk waktu astronomi
            const rayLen = 32 + Math.sin(this.tickCount * 0.08) * 4;
            ctx.strokeStyle = `rgba(254, 240, 138, ${0.65 * progress})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(tx - rayLen, ty); ctx.lineTo(tx + rayLen, ty);
            ctx.moveTo(tx, ty - rayLen); ctx.lineTo(tx, ty + rayLen);
            ctx.stroke();

          } else if (tile === TILE.TOWER_WINDOW) {
            // Jendela gotik kaca patri menara bersinar keemasan & safir
            const twx = c * TILE_SIZE + 16;
            const twy = r * TILE_SIZE + 16;
            const twLight = ctx.createRadialGradient(twx, twy, 3, twx, twy + 12, 75);
            twLight.addColorStop(0, `rgba(254, 240, 138, ${0.85 * progress})`);
            twLight.addColorStop(0.35, `rgba(245, 158, 11, ${0.45 * progress})`);
            twLight.addColorStop(0.65, `rgba(147, 197, 253, ${0.20 * progress})`);
            twLight.addColorStop(1, 'rgba(147, 197, 253, 0)');
            ctx.fillStyle = twLight;
            ctx.beginPath();
            ctx.arc(twx, twy + 12, 75, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = `rgba(254, 240, 138, ${0.90 * progress})`;
            ctx.fillRect(c * TILE_SIZE + 10, r * TILE_SIZE + 8, 12, 16);

          } else if (tile === TILE.TOWER_DOOR) {
            // Obor gerbang utama menara jam
            const tdx = c * TILE_SIZE + 16;
            const tdy = r * TILE_SIZE + 24;
            const tdLight = ctx.createRadialGradient(tdx, tdy, 3, tdx, tdy + 8, 70);
            tdLight.addColorStop(0, `rgba(254, 240, 138, ${0.80 * progress})`);
            tdLight.addColorStop(0.35, `rgba(245, 158, 11, ${0.42 * progress})`);
            tdLight.addColorStop(1, 'rgba(217, 119, 6, 0)');
            ctx.fillStyle = tdLight;
            ctx.beginPath();
            ctx.arc(tdx, tdy + 8, 70, 0, Math.PI * 2);
            ctx.fill();

          } else if (tile === TILE.TOWER_WALL) {
            // Pencahayaan aksen arsitektural batu menara
            const tcx = c * TILE_SIZE + 16;
            const tcy = r * TILE_SIZE + 16;
            const twallLight = ctx.createRadialGradient(tcx, tcy, 2, tcx, tcy, 42);
            twallLight.addColorStop(0, `rgba(254, 240, 138, ${0.20 * progress})`);
            twallLight.addColorStop(1, 'rgba(254, 240, 138, 0)');
            ctx.fillStyle = twallLight;
            ctx.beginPath();
            ctx.arc(tcx, tcy, 42, 0, Math.PI * 2);
            ctx.fill();

          // --- F. LENTERA BATU, AIR MANCUR & SUMUR (SPECIAL LIGHT SOURCES) ---
          } else if (tile === TILE.STONE_LANTERN) {
            const sx = c * TILE_SIZE + 16;
            const sy = r * TILE_SIZE + 16;
            const sLight = ctx.createRadialGradient(sx, sy, 2, sx, sy, 75);
            sLight.addColorStop(0, `rgba(254, 240, 138, ${0.85 * progress})`);
            sLight.addColorStop(0.3, `rgba(245, 158, 11, ${0.50 * progress})`);
            sLight.addColorStop(0.6, `rgba(167, 139, 250, ${0.25 * progress})`);
            sLight.addColorStop(1, 'rgba(167, 139, 250, 0)');
            ctx.fillStyle = sLight;
            ctx.beginPath();
            ctx.arc(sx, sy, 75, 0, Math.PI * 2);
            ctx.fill();

          } else if (tile === TILE.FOUNTAIN) {
            const fx = c * TILE_SIZE + 16;
            const fy = r * TILE_SIZE + 16;
            const fLight = ctx.createRadialGradient(fx, fy, 4, fx, fy, 85);
            fLight.addColorStop(0, `rgba(165, 243, 252, ${0.65 * progress})`);
            fLight.addColorStop(0.4, `rgba(56, 189, 248, ${0.35 * progress})`);
            fLight.addColorStop(0.75, `rgba(99, 102, 241, ${0.15 * progress})`);
            fLight.addColorStop(1, 'rgba(99, 102, 241, 0)');
            ctx.fillStyle = fLight;
            ctx.beginPath();
            ctx.arc(fx, fy, 85, 0, Math.PI * 2);
            ctx.fill();

          } else if (tile === TILE.WATER_WELL) {
            const wx = c * TILE_SIZE + 16;
            const wy = r * TILE_SIZE + 16;
            const wLight = ctx.createRadialGradient(wx, wy, 2, wx, wy, 58);
            wLight.addColorStop(0, `rgba(254, 240, 138, ${0.70 * progress})`);
            wLight.addColorStop(0.4, `rgba(245, 158, 11, ${0.32 * progress})`);
            wLight.addColorStop(1, 'rgba(217, 119, 6, 0)');
            ctx.fillStyle = wLight;
            ctx.beginPath();
            ctx.arc(wx, wy, 58, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      ctx.restore();
    }

    ctx.restore();
  }

  // Draw visual feedback marker when clicking - clearly differentiated by target type!
  private drawDestinationMarker() {
    if (!this.destinationTarget) return;
    this.destinationTarget.anim += 1;
    const { x, y, anim, type } = this.destinationTarget;
    const ctx = this.ctx;
    ctx.save();

    const bob = Math.sin(anim * 0.15) * 4;

    if (type === 'walk') {
      // --- NAVIGATION: Pure Cyan Ground Radar & Bouncing Arrow ---
      const pulse = Math.sin(anim * 0.15);
      const radius = 9 + pulse * 2;

      // Glowing ground disc
      ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Outer cyan dash ring
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.lineDashOffset = -anim * 0.6;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Expanding beacon ripple
      const rippleProgress = (anim % 40) / 40;
      const rippleRadius = 6 + rippleProgress * 18;
      const rippleAlpha = 0.65 * (1 - rippleProgress);
      ctx.strokeStyle = `rgba(103, 232, 249, ${rippleAlpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, rippleRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Downward Bouncing Pixel Navigation Arrow
      const arrowY = y - 18 + bob;
      ctx.fillStyle = '#38bdf8';
      // Triangle pointing down
      ctx.beginPath();
      ctx.moveTo(x - 5, arrowY);
      ctx.lineTo(x + 5, arrowY);
      ctx.lineTo(x, arrowY + 6);
      ctx.closePath();
      ctx.fill();
      // Arrow stem
      ctx.fillRect(x - 2, arrowY - 6, 4, 6);

      // Inner bright center dot
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();

    } else if (type === 'interact') {
      // --- NPC INTERACTION: Radiant Golden Ring, Speech Bubble & Star Sparkles ---
      const pulse = Math.sin(anim * 0.15);
      const radius = 13 + pulse * 2;

      // Golden glowing ground zone
      ctx.fillStyle = 'rgba(250, 204, 21, 0.25)';
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Golden outer solid glow ring
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Rotating dashed golden halo
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 4]);
      ctx.lineDashOffset = anim * 0.8;
      ctx.beginPath();
      ctx.arc(x, y, radius + 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Floating Bouncing Interaction Bubble with Dialogue Icon
      const bubbleY = y - 36 + bob;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x - 24, bubbleY - 14, 48, 16);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x - 24, bubbleY - 14, 48, 16);

      // Pointer tail
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(x - 4, bubbleY + 2);
      ctx.lineTo(x + 4, bubbleY + 2);
      ctx.lineTo(x, bubbleY + 6);
      ctx.closePath();
      ctx.fill();

      // Text inside bubble
      ctx.font = '7px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fef08a';
      ctx.fillText('💬 BICARA', x, bubbleY - 3);

    } else if (type === 'examine') {
      // --- EXAMINE (Fountain, Signpost, Tree): Emerald Inspection Halo & Magnifier ---
      const pulse = Math.sin(anim * 0.15);
      const radius = 14 + pulse * 2;

      ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Floating Bouncing Inspection Bubble
      const bubbleY = y - 32 + bob;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x - 28, bubbleY - 14, 56, 16);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x - 28, bubbleY - 14, 56, 16);

      // Pointer tail
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.moveTo(x - 4, bubbleY + 2);
      ctx.lineTo(x + 4, bubbleY + 2);
      ctx.lineTo(x, bubbleY + 6);
      ctx.closePath();
      ctx.fill();

      ctx.font = '7px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#6ee7b7';
      ctx.fillText('🔍 PERIKSA', x, bubbleY - 3);
    }

    ctx.restore();
  }

  // Draw hover guidance tooltip and bouncing arrow when cursor is over interactive objects!
  private drawHoverIndicator() {
    if (!this.hoverTarget) return;
    const { type, name, x, y } = this.hoverTarget;
    const ctx = this.ctx;
    ctx.save();

    const bob = Math.sin(this.tickCount * 0.2) * 3;
    const targetY = y - 18 + bob;

    // Badge styling based on type
    const isNPC = type === 'npc';
    const isTower = type === 'tower';
    const isWindmill = type === 'windmill';
    const isAnimal = type === 'animal';
    const isRiver = type === 'river';

    const borderColor = isTower || isWindmill ? '#f59e0b' : isAnimal || isRiver ? '#38bdf8' : isNPC ? '#f59e0b' : '#10b981';
    const textColor = isTower || isWindmill ? '#fef08a' : isAnimal || isRiver ? '#e0f2fe' : isNPC ? '#fef08a' : '#a7f3d0';
    const icon = isTower ? '🕰️' : isWindmill ? '🌾' : isAnimal ? '🐮' : isRiver ? '🐟' : isNPC ? '💬' : '🔍';
    const actionLabel = isTower ? 'Klik Periksa Menara' : isWindmill ? 'Klik Periksa Kincir' : isAnimal ? 'Klik Dekati' : isRiver ? 'Klik Amati' : isNPC ? 'Klik Bicara' : 'Klik Periksa';

    ctx.font = '7px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    const labelText = `${icon} ${name} [${actionLabel}]`;
    const textW = ctx.measureText(labelText).width;

    // Background pill
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.fillRect(x - textW / 2 - 8, targetY - 18, textW + 16, 16);
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - textW / 2 - 8, targetY - 18, textW + 16, 16);

    // Downward arrow pointer pointing right onto the interactive target
    ctx.fillStyle = borderColor;
    ctx.beginPath();
    ctx.moveTo(x - 4, targetY - 2);
    ctx.lineTo(x + 4, targetY - 2);
    ctx.lineTo(x, targetY + 3);
    ctx.closePath();
    ctx.fill();

    // Text inside
    ctx.fillStyle = textColor;
    ctx.fillText(labelText, x, targetY - 7);

    ctx.restore();
  }

  private drawWaterCurrents(_camX: number, _camY: number, _w: number, _h: number, isBridgeClear: boolean) {
    // Extra visual polish on water flow
    const ctx = this.ctx;
    const waveX = 22 * TILE_SIZE + Math.sin(this.tickCount * 0.05) * 8;
    if (isBridgeClear) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.fillRect(waveX, 10 * TILE_SIZE, 6, 40);
      ctx.fillRect(waveX + 10, 18 * TILE_SIZE, 8, 30);
    } else {
      // In fog mode: luminous mist currents flowing along the river gorge
      ctx.fillStyle = 'rgba(125, 211, 252, 0.16)';
      ctx.fillRect(waveX, 10 * TILE_SIZE, 5, 36);
      ctx.fillRect(waveX + 12, 18 * TILE_SIZE, 6, 28);
    }
  }

  /**
   * 16-Bit Pixel Water Shader & Frame-by-Frame Shimmer Reflection System
   * Features:
   * - Organic fluid current flow across tile boundaries (no grid seams)
   * - Multi-tiered horizontal wave reflection crests with dynamic fluid oscillation
   * - Moving caustic light ribbons refracting through water
   * - In Fog Mode (!isColored): Mystical cold moonlight/fog reflection with animated
   *   frame-by-frame 4-point diamond sparkles, luminous cyan/ice caustics, and deep aquatic shadows
   * - In Restored Mode (isColored): Rich cerulean azure waters with bright foam crests and sun caustics
   */
  private drawWaterTile(x: number, y: number, isColored: boolean, r: number, c: number, isDeep: boolean) {
    const ctx = this.ctx;

    // 1. Base aquatic tint & depth foundation
    // In fog mode: deep cold slate navy (#090d16 for deep, #0f172a for standard)
    // In color mode: deep azure (#0369a1 for deep, #0284c7 for standard)
    const baseColor = isColored
      ? (isDeep ? '#0369a1' : '#0284c7')
      : (isDeep ? '#090d16' : '#0f172a');

    this.fillTileBase(x, y, baseColor);

    // Continuous flow dynamics: river flows southward with gentle sinusoidal meander
    const flowTick = this.tickCount * 0.07;
    const spatialSeed = c * 37 + r * 19;

    // Sub-surface depth gradient bands (gives water volume & body)
    if (!isColored) {
      // In fog mode: subtle deep obsidian-cyan undertone
      ctx.fillStyle = isDeep ? '#070b14' : '#141e2e';
      ctx.fillRect(x, y + 4, TILE_SIZE, 8);
      ctx.fillRect(x, y + 18, TILE_SIZE, 8);

      // Secondary ambient water body tone
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x, y + 10, TILE_SIZE, 6);
      ctx.fillRect(x, y + 24, TILE_SIZE, 6);
    } else {
      ctx.fillStyle = isDeep ? '#025282' : '#0369a1';
      ctx.fillRect(x, y + 4, TILE_SIZE, 8);
      ctx.fillRect(x, y + 18, TILE_SIZE, 8);

      ctx.fillStyle = isDeep ? '#0369a1' : '#0ea5e9';
      ctx.fillRect(x, y + 10, TILE_SIZE, 6);
      ctx.fillRect(x, y + 24, TILE_SIZE, 6);
    }

    // 2. Animated Caustic Light Refraction Ribbons (Under-surface shimmering fluid currents)
    // 3 rhythmic caustic wave bands moving diagonally with the river current
    const causticShift1 = Math.sin(flowTick + spatialSeed * 0.1) * 4;
    const causticShift2 = Math.cos(flowTick * 0.8 + spatialSeed * 0.15) * 3;
    const causticShift3 = Math.sin(flowTick * 1.2 - spatialSeed * 0.12) * 3.5;

    if (!isColored) {
      // Mode Kabut: Ethereal pale cyan & silvery fog-light caustics reflecting through misty water
      ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
      ctx.fillRect(x + 2 + causticShift1, y + 6, 12, 2);
      ctx.fillRect(x + 18 - causticShift2, y + 14, 11, 2);
      ctx.fillRect(x + 6 + causticShift3, y + 22, 14, 2);

      ctx.fillStyle = 'rgba(186, 230, 253, 0.18)';
      ctx.fillRect(x + 5 + causticShift1, y + 7, 7, 1);
      ctx.fillRect(x + 20 - causticShift2, y + 15, 6, 1);
      ctx.fillRect(x + 9 + causticShift3, y + 23, 8, 1);
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.fillRect(x + 2 + causticShift1, y + 6, 12, 2);
      ctx.fillRect(x + 18 - causticShift2, y + 14, 11, 2);
      ctx.fillRect(x + 6 + causticShift3, y + 22, 14, 2);

      ctx.fillStyle = 'rgba(224, 242, 254, 0.40)';
      ctx.fillRect(x + 5 + causticShift1, y + 7, 7, 1);
      ctx.fillRect(x + 20 - causticShift2, y + 15, 6, 1);
      ctx.fillRect(x + 9 + causticShift3, y + 23, 8, 1);
    }

    // 3. Multi-tier Stepped Surface Wave Crests (16-bit liquid surface ripples)
    // Wave Tier A (Upper half of tile)
    const waveShiftA = Math.floor((this.tickCount * 0.09 + c * 0.8 + r * 0.4) % 6);
    const waveX1 = x + ((waveShiftA * 5 + r * 7) % (TILE_SIZE + 4)) - 2;
    const waveY1 = y + 9 + Math.floor(Math.sin(flowTick + c * 0.5) * 2);

    // Wave Tier B (Lower half of tile)
    const waveShiftB = Math.floor((this.tickCount * 0.08 + c * 0.6 - r * 0.5 + 3) % 6);
    const waveX2 = x + ((waveShiftB * 5 + c * 5) % (TILE_SIZE + 4)) - 2;
    const waveY2 = y + 23 + Math.floor(Math.cos(flowTick + r * 0.5) * 2);

    if (!isColored) {
      // Shimmering cold water ripples in fog
      ctx.fillStyle = 'rgba(71, 85, 105, 0.6)';
      ctx.fillRect(waveX1, waveY1, 10, 2);
      ctx.fillRect(waveX2, waveY2, 9, 2);

      // Specular crest line catching diffuse ambient light
      ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
      ctx.fillRect(waveX1 + 1, waveY1, 7, 1);
      ctx.fillRect(waveX2 + 1, waveY2, 6, 1);

      // Luminous ice-cyan edge glint
      ctx.fillStyle = 'rgba(186, 230, 253, 0.85)';
      ctx.fillRect(waveX1 + 3, waveY1, 3, 1);
      ctx.fillRect(waveX2 + 2, waveY2, 3, 1);
    } else {
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(waveX1, waveY1, 10, 2);
      ctx.fillRect(waveX2, waveY2, 9, 2);

      ctx.fillStyle = '#bae6fd';
      ctx.fillRect(waveX1 + 1, waveY1, 7, 1);
      ctx.fillRect(waveX2 + 1, waveY2, 6, 1);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(waveX1 + 3, waveY1, 3, 1);
      ctx.fillRect(waveX2 + 2, waveY2, 3, 1);
    }

    // 4. Frame-by-Frame Sparkle Shader (Pantulan Cahaya Berkilau)
    // Renders twinkling 16-bit specular starbursts on water surfaces
    // Each tile possesses 3 deterministic sparkle points that cycle through 5 distinct animation frames:
    // Frame 0: 1px faint spark
    // Frame 1: 2x2 bright glint
    // Frame 2: 4-point diamond starburst with glowing cross-tips & white center core
    // Frame 3: 2x2 softening glimmer
    // Frame 4: 1px fading spark
    const sparklePoints = [
      { ox: 6, oy: 7, speed: 0.10, offset: 0 },
      { ox: 22, oy: 15, speed: 0.09, offset: 23 },
      { ox: 13, oy: 25, speed: 0.11, offset: 41 },
    ];

    for (let i = 0; i < sparklePoints.length; i++) {
      const sp = sparklePoints[i];
      // Deterministic cycle per tile position
      const phase = (this.tickCount * sp.speed + sp.offset + (c * 17 + r * 29)) % 36;

      // Sparkle active window is 15 ticks (~250ms), otherwise idle
      if (phase < 15) {
        const stage = Math.floor(phase / 3); // 0, 1, 2, 3, 4
        // Sway position slightly with wave
        const sx = x + sp.ox + Math.floor(Math.sin(flowTick + sp.offset) * 1.5);
        const sy = y + sp.oy + Math.floor(Math.cos(flowTick + sp.offset) * 1.2);

        if (!isColored) {
          // --- FOG MODE: Ethereal Mystical Starlight / Moonlight Sparkles ---
          if (stage === 0) {
            // Stage 0: Gentle ignition spark (1px cyan-silver)
            ctx.fillStyle = 'rgba(56, 189, 248, 0.65)';
            ctx.fillRect(sx, sy, 1, 1);
          } else if (stage === 1) {
            // Stage 1: Expanding gleam (2x2 ice blue)
            ctx.fillStyle = 'rgba(125, 211, 252, 0.85)';
            ctx.fillRect(sx, sy, 2, 2);
            ctx.fillStyle = 'rgba(240, 249, 255, 0.9)';
            ctx.fillRect(sx, sy, 1, 1);
          } else if (stage === 2) {
            // Stage 2: APEX - Brilliant 4-Point Diamond Sparkle Star
            // Outer cross wings (cyan/ice)
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(sx - 2, sy, 5, 1); // Horizontal wing (5px)
            ctx.fillRect(sx, sy - 2, 1, 5); // Vertical wing (5px)

            // Inner cross (bright ice cyan)
            ctx.fillStyle = '#bae6fd';
            ctx.fillRect(sx - 1, sy, 3, 1);
            ctx.fillRect(sx, sy - 1, 1, 3);

            // Center brilliant white core (pure white gleam)
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(sx, sy, 1, 1);

            // Diagonal micro-halo
            ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
            ctx.fillRect(sx - 1, sy - 1, 1, 1);
            ctx.fillRect(sx + 1, sy - 1, 1, 1);
            ctx.fillRect(sx - 1, sy + 1, 1, 1);
            ctx.fillRect(sx + 1, sy + 1, 1, 1);
          } else if (stage === 3) {
            // Stage 3: Softening glimmer
            ctx.fillStyle = 'rgba(186, 230, 253, 0.85)';
            ctx.fillRect(sx, sy, 2, 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillRect(sx, sy, 1, 1);
          } else if (stage === 4) {
            // Stage 4: Fading ember (1px soft ice blue)
            ctx.fillStyle = 'rgba(125, 211, 252, 0.45)';
            ctx.fillRect(sx, sy, 1, 1);
          }
        } else {
          // --- RESTORED MODE: Sunlit Golden / Pure White Water Sparkles ---
          if (stage === 0) {
            ctx.fillStyle = 'rgba(254, 240, 138, 0.6)';
            ctx.fillRect(sx, sy, 1, 1);
          } else if (stage === 1) {
            ctx.fillStyle = '#bae6fd';
            ctx.fillRect(sx, sy, 2, 2);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(sx, sy, 1, 1);
          } else if (stage === 2) {
            // Apex Sunlit Diamond Star
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(sx - 2, sy, 5, 1);
            ctx.fillRect(sx, sy - 2, 1, 5);
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(sx - 1, sy, 3, 1);
            ctx.fillRect(sx, sy - 1, 1, 3);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(sx, sy, 1, 1);
          } else if (stage === 3) {
            ctx.fillStyle = '#e0f2fe';
            ctx.fillRect(sx, sy, 2, 2);
          } else if (stage === 4) {
            ctx.fillStyle = 'rgba(186, 230, 253, 0.5)';
            ctx.fillRect(sx, sy, 1, 1);
          }
        }
      }
    }
  }

  /**
   * Authentic 16-bit Pixel-Art Wooden Bridge Deck Tile
   * Renders vertical floor planks (perpendicular to crossing), wood grain seams,
   * iron carriage bolts, approach stone curbs (left/right borders), and edge baluster sockets.
   */
  private drawBridgeDeckTile(x: number, y: number, isColored: boolean, r: number, c: number) {
    const ctx = this.ctx;
    const isRestored = isColored;

    // Palette: restored rich golden cedar/oak vs weathered charcoal/slate
    const plankColors = isRestored
      ? ['#b45309', '#a16207', '#d97706', '#92400e']
      : ['#334155', '#475569', '#3f4e65', '#1e293b'];
    const plankHighlight = isRestored ? '#f59e0b' : '#64748b';
    const plankSeam = isRestored ? '#451a03' : '#0f172a';
    const boltColor = isRestored ? '#1e293b' : '#0f172a';
    const boltShine = isRestored ? '#fef08a' : '#cbd5e1';
    const curbStone = isRestored ? '#64748b' : '#334155';
    const curbStoneLight = isRestored ? '#94a3b8' : '#475569';
    const borderTimber = isRestored ? '#451a03' : '#1e293b';
    const borderTimberLight = isRestored ? '#78350f' : '#334155';

    // 1. Base under-deck structural timber bed
    ctx.fillStyle = isRestored ? '#78350f' : '#1e293b';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

    // 2. Vertical wooden floor planks (4 planks per tile, each 8px wide)
    for (let i = 0; i < 4; i++) {
      const px = x + i * 8;
      const colorIndex = Math.abs(c * 4 + i + r * 2) % plankColors.length;
      ctx.fillStyle = plankColors[colorIndex];
      ctx.fillRect(px, y, 8, TILE_SIZE);

      // Left edge highlight on each plank
      ctx.fillStyle = plankHighlight;
      ctx.fillRect(px, y, 1, TILE_SIZE);

      // Right edge deep groove / shadow seam
      ctx.fillStyle = plankSeam;
      ctx.fillRect(px + 7, y, 1, TILE_SIZE);

      // Subtle organic wood grain streak
      if ((i + c + r) % 2 === 0) {
        ctx.fillStyle = isRestored ? 'rgba(69, 26, 3, 0.35)' : 'rgba(15, 23, 42, 0.35)';
        ctx.fillRect(px + 3, y + 6, 1, 10);
        ctx.fillRect(px + 4, y + 18, 1, 8);
      }

      // Hand-forged square iron carriage bolts / nails with metallic glint
      // Top bolt
      ctx.fillStyle = boltColor;
      ctx.fillRect(px + 3, y + 4, 2, 2);
      ctx.fillStyle = boltShine;
      ctx.fillRect(px + 3, y + 4, 1, 1);

      // Bottom bolt
      ctx.fillStyle = boltColor;
      ctx.fillRect(px + 3, y + 26, 2, 2);
      ctx.fillStyle = boltShine;
      ctx.fillRect(px + 3, y + 26, 1, 1);
    }

    // 3. Batas Kiri Jembatan (col === 21): Western Embankment Stone Threshold & Heavy Timber Curb
    if (c === 21) {
      // Mainland stone approach ramp pavers
      ctx.fillStyle = curbStone;
      ctx.fillRect(x, y, 4, TILE_SIZE);
      ctx.fillStyle = curbStoneLight;
      ctx.fillRect(x + 1, y, 2, TILE_SIZE);
      // Cobble joints
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x, y + 8, 4, 1);
      ctx.fillRect(x, y + 16, 4, 1);
      ctx.fillRect(x, y + 24, 4, 1);

      // Heavy vertical anchor timber beam
      ctx.fillStyle = borderTimber;
      ctx.fillRect(x + 4, y, 4, TILE_SIZE);
      ctx.fillStyle = borderTimberLight;
      ctx.fillRect(x + 5, y, 2, TILE_SIZE);

      // Iron bracket plates
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x + 3, y + 6, 4, 3);
      ctx.fillRect(x + 3, y + 23, 4, 3);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(x + 4, y + 7, 1, 1);
      ctx.fillRect(x + 4, y + 24, 1, 1);
    }

    // 4. Batas Kanan Jembatan (col === 24): Eastern Embankment Stone Threshold & Heavy Timber Curb
    if (c === 24) {
      // Heavy vertical anchor timber beam
      ctx.fillStyle = borderTimber;
      ctx.fillRect(x + 24, y, 4, TILE_SIZE);
      ctx.fillStyle = borderTimberLight;
      ctx.fillRect(x + 25, y, 2, TILE_SIZE);

      // Eastern stone approach ramp pavers
      ctx.fillStyle = curbStone;
      ctx.fillRect(x + 28, y, 4, TILE_SIZE);
      ctx.fillStyle = curbStoneLight;
      ctx.fillRect(x + 29, y, 2, TILE_SIZE);
      // Cobble joints
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x + 28, y + 8, 4, 1);
      ctx.fillRect(x + 28, y + 16, 4, 1);
      ctx.fillRect(x + 28, y + 24, 4, 1);

      // Iron bracket plates
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x + 25, y + 6, 4, 3);
      ctx.fillRect(x + 25, y + 23, 4, 3);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(x + 26, y + 7, 1, 1);
      ctx.fillRect(x + 26, y + 24, 1, 1);
    }

    // 5. Northern edge (row === 14): Northern railing shadow and baluster sockets
    if (r === 14) {
      // Northern railing shadow falling onto deck
      ctx.fillStyle = isRestored ? 'rgba(15, 23, 42, 0.45)' : 'rgba(15, 23, 42, 0.55)';
      ctx.fillRect(x, y + 9, TILE_SIZE, 4);

      // Northern base runner rail
      ctx.fillStyle = isRestored ? '#451a03' : '#1e293b';
      ctx.fillRect(x, y + 6, TILE_SIZE, 3);
      ctx.fillStyle = isRestored ? '#78350f' : '#334155';
      ctx.fillRect(x, y + 6, TILE_SIZE, 1);

      // Top handrail beam
      ctx.fillStyle = isRestored ? '#78350f' : '#334155';
      ctx.fillRect(x, y, TILE_SIZE, 5);
      ctx.fillStyle = isRestored ? '#d97706' : '#64748b';
      ctx.fillRect(x, y, TILE_SIZE, 1);
      ctx.fillStyle = isRestored ? '#451a03' : '#1e293b';
      ctx.fillRect(x, y + 4, TILE_SIZE, 1);

      // Vertical baluster pickets (ruji-ruji pagar)
      for (let bx = 2; bx < TILE_SIZE; bx += 8) {
        ctx.fillStyle = isRestored ? '#92400e' : '#475569';
        ctx.fillRect(x + bx, y + 4, 3, 3);
        ctx.fillStyle = isRestored ? '#f59e0b' : '#64748b';
        ctx.fillRect(x + bx, y + 4, 1, 3);
      }
    }

    // 6. Southern edge (row === 16): Southern fascia edge girder
    if (r === 16) {
      // Lower fascia beam (balok gelagar tepi jembatan)
      ctx.fillStyle = isRestored ? '#451a03' : '#1e293b';
      ctx.fillRect(x, y + 26, TILE_SIZE, 6);
      ctx.fillStyle = isRestored ? '#78350f' : '#334155';
      ctx.fillRect(x, y + 26, TILE_SIZE, 2);
      ctx.fillStyle = isRestored ? '#92400e' : '#475569';
      ctx.fillRect(x, y + 26, TILE_SIZE, 1);

      // Timber dowel plugs / iron bolts along fascia
      ctx.fillStyle = isRestored ? '#1c1917' : '#0f172a';
      ctx.fillRect(x + 4, y + 28, 2, 2);
      ctx.fillRect(x + 12, y + 28, 2, 2);
      ctx.fillRect(x + 20, y + 28, 2, 2);
      ctx.fillRect(x + 28, y + 28, 2, 2);
      ctx.fillStyle = isRestored ? '#fef08a' : '#cbd5e1';
      ctx.fillRect(x + 4, y + 28, 1, 1);
      ctx.fillRect(x + 12, y + 28, 1, 1);
      ctx.fillRect(x + 20, y + 28, 1, 1);
      ctx.fillRect(x + 28, y + 28, 1, 1);
    }
  }

  /**
   * Renders the Bridge Structural Support Pillars submerged in river water,
   * realistic cast shadow directly over the water surface with liquid wave distortion,
   * diagonal timber cross-trusses, and boundary gateposts with lanterns.
   */
  private drawBridgeStructuresAndWaterShadow(isColored: boolean) {
    const ctx = this.ctx;
    const isRestored = isColored;

    // Bridge geographic footprint:
    // Columns: 21 (west bank), 22 (water), 23 (water), 24 (east bank)
    // Rows: 14 (north), 15 (center), 16 (south)
    // x = 672..800, y = 448..544
    // Water spans x = 704..768, rows 17+ (south) and 13- (north)

    // =========================================================================
    // 1. BAYANGAN BAWAH JEMBATAN TEPAT DI ATAS AIR (Cast Shadow On Water)
    // =========================================================================
    // A. North water shadow (where river flows south under north bridge edge: r=13, y=442..448, c=22..23)
    ctx.fillStyle = isRestored ? 'rgba(8, 18, 32, 0.65)' : 'rgba(10, 15, 26, 0.78)';
    ctx.fillRect(704, 442, 64, 6);

    // B. South water shadow (cast directly onto river water at r=17, y=544..568, c=22..23)
    // Ambient Occlusion: Darkest shadow strip immediately beneath the southern wooden fascia beam
    ctx.fillStyle = isRestored ? 'rgba(8, 18, 32, 0.88)' : 'rgba(10, 15, 26, 0.92)';
    ctx.fillRect(702, 544, 68, 6);

    // Main bridge deck cast shadow on water with organic current wave oscillation
    ctx.fillStyle = isRestored ? 'rgba(12, 28, 48, 0.64)' : 'rgba(15, 23, 42, 0.76)';
    ctx.beginPath();
    ctx.moveTo(702, 550);
    ctx.lineTo(770, 550);
    // Wavy southern shadow contour oscillating with river fluid dynamics
    for (let px = 770; px >= 702; px -= 4) {
      const wave = Math.sin(this.tickCount * 0.08 + px * 0.12) * 2.8;
      ctx.lineTo(px, 564 + wave);
    }
    ctx.closePath();
    ctx.fill();

    // Vertical column drop shadows extending deeper into the riverbed under the two pillars
    ctx.fillStyle = isRestored ? 'rgba(8, 20, 36, 0.55)' : 'rgba(10, 15, 26, 0.68)';
    ctx.fillRect(712, 560, 15, 12);
    ctx.fillRect(744, 560, 15, 12);

    // Subtle caustic water wave glints right along the outer rim of the shadow to accent depth
    if (isRestored) {
      ctx.fillStyle = 'rgba(186, 230, 253, 0.32)';
      for (let px = 706; px <= 766; px += 8) {
        const wave = Math.sin(this.tickCount * 0.08 + px * 0.12) * 2.8;
        ctx.fillRect(px, 565 + wave, 4, 1);
      }
    }

    // =========================================================================
    // 2. TIANG PENYANGGA DI AIR (Support Pillars Submerged in River Water)
    // =========================================================================
    // Timber Palette for pillars & trusses
    const pillarHighlight = isRestored ? '#f59e0b' : '#64748b';
    const pillarLight = isRestored ? '#d97706' : '#475569';
    const pillarMid = isRestored ? '#92400e' : '#334155';
    const pillarDark = isRestored ? '#451a03' : '#1e293b';
    const pillarShadow = isRestored ? '#291002' : '#0f172a';
    const ironBand = '#1e293b';
    const ironBolt = '#cbd5e1';

    // A. Under-bridge horizontal tie-beam / stringer girder across the water
    ctx.fillStyle = pillarDark;
    ctx.fillRect(706, 540, 60, 5);
    ctx.fillStyle = pillarLight;
    ctx.fillRect(706, 540, 60, 1);

    // B. Diagonal support trusses (balok penyangga siku/silang X-bracing)
    // Left diagonal strut (riverbank towards west pillar)
    ctx.fillStyle = pillarDark;
    ctx.beginPath();
    ctx.moveTo(704, 538);
    ctx.lineTo(708, 538);
    ctx.lineTo(716, 546);
    ctx.lineTo(713, 548);
    ctx.closePath();
    ctx.fill();

    // Right diagonal strut (riverbank towards east pillar)
    ctx.beginPath();
    ctx.moveTo(768, 538);
    ctx.lineTo(764, 538);
    ctx.lineTo(754, 546);
    ctx.lineTo(757, 548);
    ctx.closePath();
    ctx.fill();

    // Center X-braces between the two pillars
    ctx.beginPath();
    ctx.moveTo(724, 541);
    ctx.lineTo(726, 541);
    ctx.lineTo(746, 550);
    ctx.lineTo(744, 550);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(746, 541);
    ctx.lineTo(744, 541);
    ctx.lineTo(724, 550);
    ctx.lineTo(726, 550);
    ctx.closePath();
    ctx.fill();

    // C. The Two Main Heavy Cylindrical Water Pilings
    const pillars = [
      { x: 713, w: 11, label: 'west' },
      { x: 745, w: 11, label: 'east' },
    ];

    pillars.forEach((p) => {
      const px = p.x;
      const pw = p.w;
      const topY = 538;
      const botY = 562; // Submerged into water
      const height = botY - topY;

      // 1. Pillar main body
      ctx.fillStyle = pillarMid;
      ctx.fillRect(px, topY, pw, height);

      // 2. 3D Cylindrical lighting: highlight on left, shadow on right
      ctx.fillStyle = pillarHighlight;
      ctx.fillRect(px, topY, 2, height);
      ctx.fillStyle = pillarLight;
      ctx.fillRect(px + 2, topY, 2, height);

      ctx.fillStyle = pillarDark;
      ctx.fillRect(px + pw - 4, topY, 2, height);
      ctx.fillStyle = pillarShadow;
      ctx.fillRect(px + pw - 2, topY, 2, height);

      // 3. Wrought iron reinforcement collars with bolt studs
      [543, 551].forEach((bandY) => {
        ctx.fillStyle = ironBand;
        ctx.fillRect(px - 1, bandY, pw + 2, 2);
        ctx.fillStyle = ironBolt;
        ctx.fillRect(px + 1, bandY, 1, 1);
        ctx.fillRect(px + pw - 2, bandY, 1, 1);
      });

      // 4. Submerged waterline zone: soaked dark wet timber & river moss/algae
      ctx.fillStyle = isRestored ? '#1c1917' : '#0f172a';
      ctx.fillRect(px, 554, pw, 8);
      if (isRestored) {
        ctx.fillStyle = '#166534'; // river algae
        ctx.fillRect(px + 1, 555, 3, 4);
        ctx.fillRect(px + pw - 3, 556, 2, 3);
      }

      // 5. Dynamic water wake & foaming ripples circling the pillar base in flowing river
      const cx = px + pw / 2;
      const pulse1 = (this.tickCount * 0.04 + (p.label === 'east' ? 0.35 : 0)) % 1;
      const pulse2 = (this.tickCount * 0.04 + (p.label === 'east' ? 0.85 : 0.5)) % 1;

      // Outer expanding ripple
      ctx.strokeStyle = `rgba(224, 242, 254, ${(1 - pulse1) * 0.85})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx, 559, 7 + pulse1 * 5, 2.5 + pulse1 * 1.8, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Inner expanding ripple
      ctx.strokeStyle = `rgba(186, 230, 253, ${(1 - pulse2) * 0.85})`;
      ctx.beginPath();
      ctx.ellipse(cx, 559, 7 + pulse2 * 5, 2.5 + pulse2 * 1.8, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Foaming water crest breaking on the flanks
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 7, 557, 2, 1);
      ctx.fillRect(cx + 5, 557, 2, 1);
    });

    // D. North pillar tops visible entering northern water (r=13, y=442..448)
    [714, 746].forEach((npx) => {
      ctx.fillStyle = pillarDark;
      ctx.fillRect(npx, 442, 9, 6);
      ctx.fillStyle = pillarLight;
      ctx.fillRect(npx, 442, 2, 6);
      // North water foam
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fillRect(npx - 1, 446, 2, 1);
      ctx.fillRect(npx + 8, 446, 2, 1);
    });

    // =========================================================================
    // 3. BATAS KIRI KANAN GATEWAY POSTS & NORTHERN RAILINGS
    // =========================================================================
    // Northern corner boundary posts
    this.drawBridgeGatepost(672, 444, isRestored, 'top-left');
    this.drawBridgeGatepost(790, 444, isRestored, 'top-right');
  }

  /**
   * Helper to draw carved decorative bridgehead boundary posts (tiang batas gerbang jembatan)
   */
  private drawBridgeGatepost(x: number, y: number, isColored: boolean, _position: string) {
    const ctx = this.ctx;
    const postW = 10;
    const postH = 18;

    // Timber post body
    ctx.fillStyle = isColored ? '#451a03' : '#1e293b';
    ctx.fillRect(x, y, postW, postH);
    ctx.fillStyle = isColored ? '#92400e' : '#475569';
    ctx.fillRect(x + 1, y, postW - 2, postH);
    ctx.fillStyle = isColored ? '#d97706' : '#64748b';
    ctx.fillRect(x + 1, y, 2, postH);

    // Carved pyramid roof cap
    ctx.fillStyle = isColored ? '#78350f' : '#334155';
    ctx.beginPath();
    ctx.moveTo(x - 1, y);
    ctx.lineTo(x + postW / 2, y - 4);
    ctx.lineTo(x + postW + 1, y);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = isColored ? '#f59e0b' : '#94a3b8';
    ctx.fillRect(x + postW / 2 - 1, y - 5, 2, 2);

    // Iron reinforcement band with bolt
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x - 1, y + 8, postW + 2, 2);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(x + 1, y + 8, 1, 1);
    ctx.fillRect(x + postW - 2, y + 8, 1, 1);

    // Post-mounted lantern in restored state
    if (isColored) {
      const lanternX = x + postW / 2;
      const lanternY = y + 5;

      // Ambient warm light glow
      const glow = ctx.createRadialGradient(lanternX, lanternY, 1, lanternX, lanternY, 14);
      glow.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
      glow.addColorStop(0.5, 'rgba(245, 158, 11, 0.20)');
      glow.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(lanternX, lanternY, 14, 0, Math.PI * 2);
      ctx.fill();

      // Brass lantern frame
      ctx.fillStyle = '#78350f';
      ctx.fillRect(lanternX - 3, lanternY - 3, 6, 6);
      // Amber flame glass
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(lanternX - 2, lanternY - 2, 4, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(lanternX - 1, lanternY - 1, 2, 2);
    }
  }

  /**
   * Foreground Southern Railing & Gateposts
   * Rendered in front of the player/NPCs when walking along row 16 for genuine 2.5D depth.
   */
  private drawBridgeForegroundRailing(isColored: boolean, player?: Player) {
    const ctx = this.ctx;
    const isRestored = isColored;

    // Southern handrail spans across x = 676 to 794 along y = 532..544
    const railX1 = 676;
    const railX2 = 794;
    const railW = railX2 - railX1;

    // If player is walking south of the bridge on mainland (y >= 544), don't draw over player
    if (player && player.y >= 544 && player.x >= 670 && player.x <= 800) {
      // Player is in front of the southern posts
    }

    // 1. Vertical baluster pickets (ruji-ruji pagar)
    for (let bx = railX1 + 4; bx < railX2; bx += 8) {
      ctx.fillStyle = isRestored ? '#92400e' : '#475569';
      ctx.fillRect(bx, 532, 3, 10);
      ctx.fillStyle = isRestored ? '#d97706' : '#64748b';
      ctx.fillRect(bx, 532, 1, 10);
      ctx.fillStyle = isRestored ? '#451a03' : '#1e293b';
      ctx.fillRect(bx + 2, 532, 1, 10);
    }

    // 2. Horizontal safety mid-rail
    ctx.fillStyle = isRestored ? '#451a03' : '#1e293b';
    ctx.fillRect(railX1, 537, railW, 2);
    ctx.fillStyle = isRestored ? '#78350f' : '#334155';
    ctx.fillRect(railX1, 537, railW, 1);

    // 3. Top heavy handrail beam
    ctx.fillStyle = isRestored ? '#78350f' : '#334155';
    ctx.fillRect(railX1, 531, railW, 5);
    ctx.fillStyle = isRestored ? '#f59e0b' : '#64748b';
    ctx.fillRect(railX1, 531, railW, 1);
    ctx.fillStyle = isRestored ? '#451a03' : '#1e293b';
    ctx.fillRect(railX1, 535, railW, 1);

    // 4. Southern boundary corner posts
    this.drawBridgeGatepost(672, 528, isRestored, 'bottom-left');
    this.drawBridgeGatepost(790, 528, isRestored, 'bottom-right');
  }

  /**
   * Dynamic Pixel-Art River Waterfall Cascade & Particle System
   * Located in the river directly north of the bridge at columns 21..24, rows 11..13 (x: 688..784, y: 360..444).
   * Features:
   * - Natural stepped river gorge rock ledges with mossy boulders on west & east banks
   * - Center crag divider boulder splitting the cascade into twin energetic chutes
   * - Multi-ribbon animated falling water curtains with vertical flow streaks & churning crests
   * - Boiling plunge basin with expanding concentric shockwave impact ripples
   * - Downstream current streaks carrying frothing whitewater towards the bridge pillars
   * - Dynamic Particle Simulation: rising mist clouds, upward spray droplets, plummeting streaks,
   *   river foam clumps drifting downstream, and sunlit prismatic rainbow sparkles.
   */
  private drawRiverWaterfall(isColored: boolean) {
    const ctx = this.ctx;
    const isRestored = isColored;

    // Palette configurations
    const rockDark = isRestored ? '#0f172a' : '#090d16';
    const rockMid = isRestored ? '#334155' : '#1e293b';
    const rockLight = isRestored ? '#64748b' : '#334155';
    const rockHighlight = isRestored ? '#94a3b8' : '#475569';
    const mossDark = isRestored ? '#14532d' : '#1e293b';
    const mossLight = isRestored ? '#22c55e' : '#334155';

    const waterDeep = isRestored ? '#0369a1' : '#0f172a';
    const waterMid = isRestored ? '#0284c7' : '#1e293b';
    const waterBright = isRestored ? '#38bdf8' : '#334155';
    const waterIce = isRestored ? '#7dd3fc' : '#475569';
    const waterFoam = '#ffffff';

    // =========================================================================
    // 1. ROCK GORGE EMBANKMENTS & CENTRAL CRAG BOULDER
    // =========================================================================
    // A. West Gorge Rock Shelf (cols 21..22, x: 688..708, y: 362..424)
    // Stepped natural granite boulders jutting into the river
    ctx.fillStyle = rockDark;
    ctx.fillRect(688, 364, 18, 58);
    ctx.fillRect(694, 368, 14, 52);
    ctx.fillRect(702, 374, 5, 42);

    ctx.fillStyle = rockMid;
    ctx.fillRect(689, 365, 16, 54);
    ctx.fillRect(695, 370, 10, 46);
    ctx.fillRect(701, 376, 4, 36);

    ctx.fillStyle = rockLight;
    ctx.fillRect(690, 366, 6, 12);
    ctx.fillRect(692, 384, 8, 14);
    ctx.fillRect(696, 404, 6, 10);

    ctx.fillStyle = rockHighlight;
    ctx.fillRect(691, 367, 3, 2);
    ctx.fillRect(693, 385, 4, 2);
    ctx.fillRect(697, 405, 3, 2);

    // Lush wet moss on western rocks dipping towards the falls
    if (isRestored) {
      ctx.fillStyle = mossDark;
      ctx.fillRect(694, 366, 8, 4);
      ctx.fillRect(698, 382, 6, 5);
      ctx.fillRect(700, 402, 5, 4);
      ctx.fillStyle = mossLight;
      ctx.fillRect(695, 366, 5, 2);
      ctx.fillRect(699, 382, 4, 2);
      ctx.fillRect(701, 402, 3, 2);
    }

    // B. East Gorge Rock Shelf (cols 23..24, x: 764..784, y: 362..424)
    ctx.fillStyle = rockDark;
    ctx.fillRect(766, 364, 18, 58);
    ctx.fillRect(764, 368, 14, 52);
    ctx.fillRect(765, 374, 5, 42);

    ctx.fillStyle = rockMid;
    ctx.fillRect(767, 365, 16, 54);
    ctx.fillRect(767, 370, 10, 46);
    ctx.fillRect(767, 376, 4, 36);

    ctx.fillStyle = rockLight;
    ctx.fillRect(774, 366, 6, 12);
    ctx.fillRect(772, 384, 8, 14);
    ctx.fillRect(770, 404, 6, 10);

    ctx.fillStyle = rockHighlight;
    ctx.fillRect(775, 367, 3, 2);
    ctx.fillRect(773, 385, 4, 2);
    ctx.fillRect(771, 405, 3, 2);

    if (isRestored) {
      ctx.fillStyle = mossDark;
      ctx.fillRect(770, 366, 8, 4);
      ctx.fillRect(768, 382, 6, 5);
      ctx.fillRect(767, 402, 5, 4);
      ctx.fillStyle = mossLight;
      ctx.fillRect(771, 366, 5, 2);
      ctx.fillRect(769, 382, 4, 2);
      ctx.fillRect(768, 402, 3, 2);
    }

    // C. Natural Bedrock Weir Lip across top (x: 704..768, y: 366..374)
    // Dark stone bedrock shelf visible beneath accelerating upper water
    ctx.fillStyle = rockDark;
    ctx.fillRect(706, 366, 60, 6);
    ctx.fillStyle = rockMid;
    ctx.fillRect(706, 367, 60, 2);

    // =========================================================================
    // 2. ACCELERATING UPPER RIVER LIP (y: 366..374)
    // =========================================================================
    // Deep river water surging forward toward the cascade brink
    ctx.fillStyle = waterDeep;
    ctx.fillRect(704, 366, 64, 4);
    ctx.fillStyle = waterMid;
    ctx.fillRect(705, 369, 62, 3);
    ctx.fillStyle = waterBright;
    ctx.fillRect(706, 371, 60, 2);

    // Accelerating whitewater comb over the crest edge
    for (let px = 706; px <= 764; px += 4) {
      const tooth = Math.sin(this.tickCount * 0.25 + px * 0.4) > 0 ? 3 : 2;
      ctx.fillStyle = waterFoam;
      ctx.fillRect(px, 372, 3, tooth);
      ctx.fillStyle = waterIce;
      ctx.fillRect(px, 372 + tooth, 3, 1);
    }

    // =========================================================================
    // 3. VERTICAL CASCADING WATERFALL CURTAIN (y: 374..408)
    // =========================================================================
    // Deep dark backing curtain shadow
    ctx.fillStyle = waterDeep;
    ctx.fillRect(704, 374, 64, 34);

    // Left Chute: x = 706..731 (width 25px)
    // Right Chute: x = 741..766 (width 25px)
    // Divided by the center crag boulder at x = 732..740
    const chutes = [
      { startX: 706, endX: 731, id: 'left' },
      { startX: 741, endX: 766, id: 'right' },
    ];

    chutes.forEach((chute) => {
      // 1. Mid-tone rushing water body
      ctx.fillStyle = waterMid;
      ctx.fillRect(chute.startX, 374, chute.endX - chute.startX, 34);

      // 2. Animated vertical torrent ribbons (each 3-5px wide)
      const chuteW = chute.endX - chute.startX;
      const numRibbons = Math.floor(chuteW / 4);

      for (let r = 0; r < numRibbons; r++) {
        const rx = chute.startX + r * 4;
        // Animated flow offset moving downward at high speed
        const speed = (r % 2 === 0 ? 3.8 : 4.6);
        const flowOffset = (this.tickCount * speed + r * 11) % 34;

        // Bright energetic cyan water stream
        ctx.fillStyle = waterBright;
        ctx.fillRect(rx, 374, 3, 34);

        // Ice cyan highlights
        ctx.fillStyle = waterIce;
        const hlY = (374 + flowOffset) % 34 + 374;
        ctx.fillRect(rx, hlY, 2, 8);

        // Pure white foaming crests cascading down
        ctx.fillStyle = waterFoam;
        const foamY1 = (374 + flowOffset * 1.3) % 34 + 374;
        const foamY2 = (374 + flowOffset * 0.7 + 16) % 34 + 374;
        ctx.fillRect(rx + 1, foamY1, 2, 4);
        ctx.fillRect(rx, foamY2, 2, 3);
      }
    });

    // Central crag boulder: x = 731..741, y = 384..400
    // Protrudes straight out of the falling water, breaking the curtain
    ctx.fillStyle = rockDark;
    ctx.fillRect(731, 384, 11, 16);
    ctx.fillStyle = rockMid;
    ctx.fillRect(732, 385, 9, 14);
    ctx.fillStyle = rockLight;
    ctx.fillRect(733, 386, 7, 6);
    ctx.fillStyle = rockHighlight;
    ctx.fillRect(734, 387, 3, 2);

    if (isRestored) {
      // Velvet green moss on rock crown
      ctx.fillStyle = mossDark;
      ctx.fillRect(732, 385, 7, 3);
      ctx.fillStyle = mossLight;
      ctx.fillRect(733, 385, 5, 1);
    }

    // Water crashing violently onto the top and sides of the center boulder
    // Foaming rooster-tail V-crest
    ctx.fillStyle = waterFoam;
    ctx.fillRect(730, 383, 13, 2);
    ctx.fillRect(729, 385, 3, 10);
    ctx.fillRect(741, 385, 3, 10);
    ctx.fillStyle = waterIce;
    ctx.fillRect(728, 386, 2, 8);
    ctx.fillRect(743, 386, 2, 8);

    // =========================================================================
    // 4. PLUNGE BASIN & CHURNING FOAM POOL (y: 408..424)
    // =========================================================================
    // Dark deep basin base
    ctx.fillStyle = waterDeep;
    ctx.fillRect(702, 408, 68, 16);

    // Boiling white froth blanket where the torrent strikes the basin
    ctx.fillStyle = isRestored ? 'rgba(255, 255, 255, 0.95)' : 'rgba(226, 232, 240, 0.90)';
    ctx.fillRect(704, 408, 64, 5);

    // Pulsating frothing churn crests
    for (let px = 704; px <= 766; px += 3) {
      const bob = Math.sin(this.tickCount * 0.22 + px * 0.35) * 2.2;
      ctx.fillStyle = waterFoam;
      ctx.fillRect(px, 411 + bob, 3, 3);
      ctx.fillStyle = waterIce;
      ctx.fillRect(px, 414 + bob, 3, 2);
    }

    // Concentric expanding impact shockwave ripples in the plunge pool
    const poolCenters = [
      { x: 718, delay: 0 },
      { x: 752, delay: 0.5 },
    ];
    poolCenters.forEach((pc) => {
      const pulse1 = (this.tickCount * 0.045 + pc.delay) % 1;
      const pulse2 = (this.tickCount * 0.045 + pc.delay + 0.5) % 1;

      ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - pulse1) * 0.85})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(pc.x, 414, 6 + pulse1 * 16, 2.5 + pulse1 * 4.5, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = `rgba(186, 230, 253, ${(1 - pulse2) * 0.75})`;
      ctx.beginPath();
      ctx.ellipse(pc.x, 414, 6 + pulse2 * 16, 2.5 + pulse2 * 4.5, 0, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Swirling eddy foam pockets near the rock corners
    const eddyLeft = Math.sin(this.tickCount * 0.15) * 2;
    const eddyRight = Math.cos(this.tickCount * 0.15) * 2;
    ctx.fillStyle = waterFoam;
    ctx.fillRect(704 + eddyLeft, 415, 4, 2);
    ctx.fillRect(764 + eddyRight, 415, 4, 2);

    // =========================================================================
    // 5. DOWNSTREAM RIVER FLOW TOWARDS BRIDGE (y: 424..444)
    // =========================================================================
    // Surface current streaks carrying oxygenated whitewater southward to the bridge
    for (let cy = 424; cy <= 442; cy += 4) {
      const flowShift = Math.sin(this.tickCount * 0.08 + cy * 0.25) * 3;
      ctx.fillStyle = isRestored ? 'rgba(125, 211, 252, 0.45)' : 'rgba(71, 85, 105, 0.40)';
      ctx.fillRect(712 + flowShift, cy, 18, 1);
      ctx.fillRect(742 - flowShift, cy + 2, 16, 1);
    }

    // =========================================================================
    // 6. DYNAMIC WATERFALL PARTICLE SIMULATION ENGINE
    // =========================================================================
    this.updateAndDrawWaterfallParticles(isRestored);
  }

  /**
   * Dedicated Particle Simulation for Waterfall Spray, Mist, Plunging Streaks, Foam, and Rainbow
   */
  private updateAndDrawWaterfallParticles(isRestored: boolean) {
    const ctx = this.ctx;

    // --- 1. SPAWN PARTICLES ---
    // A. Plunge Impact Spray Droplets: 2 per frame
    for (let i = 0; i < 2; i++) {
      const chute = Math.random() > 0.5 ? 718 : 752;
      const x = chute + (Math.random() - 0.5) * 26;
      const y = 410 + Math.random() * 4;
      this.waterfallParticles.push({
        id: ++this.waterfallParticleId,
        x,
        y,
        vx: (Math.random() - 0.5) * 2.2,
        vy: -1.4 - Math.random() * 2.2,
        gravity: 0.13,
        life: 0,
        maxLife: 16 + Math.floor(Math.random() * 10),
        size: Math.random() > 0.4 ? 2 : 1,
        color: Math.random() > 0.3 ? '#ffffff' : '#bae6fd',
        type: 'spray',
        alpha: 0.95,
      });
    }

    // B. Billowing Mist Clouds: 1 every 3 frames
    if (this.tickCount % 3 === 0) {
      const x = 712 + Math.random() * 48;
      const y = 412 + Math.random() * 6;
      this.waterfallParticles.push({
        id: ++this.waterfallParticleId,
        x,
        y,
        vx: (Math.sin(this.tickCount * 0.04) * 0.25) + (Math.random() - 0.5) * 0.35,
        vy: -0.32 - Math.random() * 0.32,
        drag: 0.985,
        life: 0,
        maxLife: 42 + Math.floor(Math.random() * 22),
        size: 3.5,
        maxSize: 9 + Math.random() * 4,
        color: isRestored ? '#f0fdf4' : '#e2e8f0',
        type: 'mist',
        alpha: 0.42,
      });
    }

    // C. Plummeting Cascade Streaks: 2 per frame
    for (let i = 0; i < 2; i++) {
      const x = (Math.random() > 0.5 ? 707 + Math.random() * 23 : 742 + Math.random() * 23);
      const y = 372 + Math.random() * 4;
      this.waterfallParticles.push({
        id: ++this.waterfallParticleId,
        x,
        y,
        vx: (Math.random() - 0.5) * 0.3,
        vy: 3.8 + Math.random() * 1.8,
        life: 0,
        maxLife: 11 + Math.floor(Math.random() * 4),
        size: 2,
        color: '#ffffff',
        type: 'streak',
        alpha: 0.9,
      });
    }

    // D. Floating Downstream River Foam Clumps: 1 every 9 frames
    if (this.tickCount % 9 === 0) {
      const x = 710 + Math.random() * 52;
      const y = 416 + Math.random() * 6;
      this.waterfallParticles.push({
        id: ++this.waterfallParticleId,
        x,
        y,
        vx: 0,
        vy: 0.48 + Math.random() * 0.35,
        life: 0,
        maxLife: 65 + Math.floor(Math.random() * 25),
        size: 2 + (Math.random() > 0.6 ? 1 : 0),
        color: Math.random() > 0.3 ? '#ffffff' : '#f1f5f9',
        type: 'foam',
        alpha: 0.85,
      });
    }

    // E. Sunlit Prismatic Rainbow Sparkles in the Mist (when restored): 1 every 6 frames
    if (isRestored && this.tickCount % 6 === 0) {
      const rainbowColors = ['#f472b6', '#38bdf8', '#fde047', '#a78bfa', '#34d399', '#f97316'];
      const x = 714 + Math.random() * 44;
      const y = 394 + Math.random() * 20;
      this.waterfallParticles.push({
        id: ++this.waterfallParticleId,
        x,
        y,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.15 - Math.random() * 0.2,
        life: 0,
        maxLife: 28 + Math.floor(Math.random() * 10),
        size: 2,
        color: rainbowColors[Math.floor(Math.random() * rainbowColors.length)],
        type: 'rainbow',
        alpha: 0.9,
      });
    }

    // --- 2. UPDATE & RENDER PARTICLES ---
    for (let i = this.waterfallParticles.length - 1; i >= 0; i--) {
      const p = this.waterfallParticles[i];
      p.life++;

      // Lifespan expiration
      if (p.life >= p.maxLife) {
        this.waterfallParticles.splice(i, 1);
        continue;
      }

      // Physics update
      if (p.gravity) {
        p.vy += p.gravity;
      }
      if (p.drag) {
        p.vx *= p.drag;
        p.vy *= p.drag;
      }
      p.x += p.vx;
      p.y += p.vy;

      const progress = p.life / p.maxLife;

      switch (p.type) {
        // 1. SPRAY DROPLETS (Crisp pixel drops with parabolic bounce)
        case 'spray': {
          const fadeAlpha = 1 - progress * progress;
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha * fadeAlpha;
          ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
          ctx.globalAlpha = 1.0;
          break;
        }

        // 2. BILLOWING MIST CLOUDS (Expanding soft translucent vapor)
        case 'mist': {
          const currentSize = p.size + (p.maxSize ? (p.maxSize - p.size) * progress : progress * 8);
          // Sine curve for smooth alpha fade-in and fade-out
          const mistAlpha = Math.sin(progress * Math.PI) * p.alpha;
          ctx.save();
          ctx.globalAlpha = mistAlpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, currentSize / 2, 0, Math.PI * 2);
          ctx.fill();
          // Subtle inner denser vapor core
          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = mistAlpha * 0.6;
          ctx.fillRect(Math.round(p.x - 1), Math.round(p.y - 1), 2, 2);
          ctx.restore();
          break;
        }

        // 3. PLUNGING CASCADE STREAKS (High-speed vertical whitewater beads)
        case 'streak': {
          const streakAlpha = 1 - progress * 0.5;
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha * streakAlpha;
          ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 4);
          ctx.globalAlpha = 1.0;
          break;
        }

        // 4. FLOATING RIVER FOAM CLUMPS (Drifting downstream towards bridge)
        case 'foam': {
          // Meander horizontally with water current
          p.x += Math.sin(this.tickCount * 0.06 + p.id) * 0.22;
          const foamAlpha = progress < 0.7 ? 0.85 : 0.85 * (1 - (progress - 0.7) / 0.3);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = foamAlpha;
          ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
          // Highlight specks on larger foam clump
          if (p.size > 2) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
          }
          ctx.globalAlpha = 1.0;
          break;
        }

        // 5. SUNLIT PRISMATIC RAINBOW SPARKLES (Twinkling 4-point micro glints)
        case 'rainbow': {
          const sparkleScale = Math.sin(progress * Math.PI);
          const sparkleAlpha = sparkleScale * p.alpha;
          ctx.fillStyle = p.color;
          ctx.globalAlpha = sparkleAlpha;
          const px = Math.round(p.x);
          const py = Math.round(p.y);
          // 4-point pixel sparkle cross
          ctx.fillRect(px, py - 1, 1, 3);
          ctx.fillRect(px - 1, py, 3, 1);
          // Bright white center gleam
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(px, py, 1, 1);
          ctx.globalAlpha = 1.0;
          break;
        }
      }
    }

    // Hard ceiling safety cap on particle count for rock-solid 60 FPS
    if (this.waterfallParticles.length > 90) {
      this.waterfallParticles.splice(0, this.waterfallParticles.length - 90);
    }
  }
}
