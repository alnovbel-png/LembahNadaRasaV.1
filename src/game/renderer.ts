import { TILE, TILE_SIZE, MAP_COLS, MAP_ROWS } from './constants';
import { NPC, ZoneColorStatus, EmotionType } from '../types/game';

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
}

export type DestinationType = 'walk' | 'interact' | 'examine';

export interface HoverTarget {
  type: 'npc' | 'fountain' | 'signpost' | 'tree';
  name: string;
  x: number;
  y: number;
}

export class GameRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private tickCount: number = 0;
  private particles: Particle[] = [];
  private destinationTarget: { x: number; y: number; anim: number; type: DestinationType } | null = null;
  private hoverTarget: HoverTarget | null = null;
  private shakeIntensity: number = 0;
  private shakeDuration: number = 0;
  private shakeElapsed: number = 0;
  private playerStepTick: number = 0;

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
    zoom: number = 1.35
  ) {
    this.tickCount++;
    const ctx = this.ctx;
    ctx.save();
    ctx.imageSmoothingEnabled = false;

    // Clear background
    ctx.fillStyle = '#090d16';
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

    // 1. Draw Map Tiles
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const tile = map[r]?.[c] ?? TILE.GRASS;
        const screenX = c * TILE_SIZE;
        const screenY = r * TILE_SIZE;

        // Is this zone restored to color?
        const isRestored = this.isZoneColored(c, r, zoneColorStatus);

        this.drawTile(tile, screenX, screenY, isRestored);
      }
    }

    // 2. Draw Decorative Bridge Details & Water Ripple
    this.drawWaterCurrents(cameraX, cameraY, viewportW, viewportH, zoneColorStatus.bridge);

    // 3. Draw NPCs
    npcs.forEach((npc) => {
      this.drawNPC(npc, isCompassActive, player);
    });

    // Destination target marker on floor
    this.drawDestinationMarker();

    // Hover interaction indicator above interactive targets
    this.drawHoverIndicator();

    // 4. Draw Player
    this.drawPlayer(player);

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

    // 6. Draw Compass Resonance Aura overlay if active
    if (isCompassActive) {
      this.drawResonanceAuras(player, npcs);
    }

    // 7. Update and draw particles (bloom sparks, healing dust)
    this.updateAndDrawParticles();

    // 8. Draw Fog of gray mist over uncolored zones
    this.drawAtmosphericMist(zoneColorStatus, viewportW, viewportH, cameraX, cameraY);

    ctx.restore();
  }

  // Check which zone a coordinate belongs to
  private isZoneColored(c: number, r: number, status: ZoneColorStatus): boolean {
    if (c >= 25 && r <= 12) return status.tower;
    if (c >= 20 && (r >= 12 && r <= 20)) return status.bridge;
    if (c <= 16 && r <= 10) return status.forest;
    return status.plaza;
  }

  // Draw procedural pixel tile
  private drawTile(tile: number, x: number, y: number, isColored: boolean) {
    const ctx = this.ctx;

    // If not colored, shift to grayscale/cool muted tones
    switch (tile) {
      case TILE.GRASS:
        ctx.fillStyle = isColored ? '#386641' : '#334155';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        // Grass blade detail
        ctx.fillStyle = isColored ? '#6a994e' : '#475569';
        ctx.fillRect(x + 4, y + 6, 2, 4);
        ctx.fillRect(x + 20, y + 18, 2, 4);
        break;

      case TILE.GRASS_FLOWERS:
        ctx.fillStyle = isColored ? '#386641' : '#334155';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        // Small flowers
        ctx.fillStyle = isColored ? '#f43f5e' : '#64748b';
        ctx.fillRect(x + 8, y + 8, 3, 3);
        ctx.fillStyle = isColored ? '#eab308' : '#94a3b8';
        ctx.fillRect(x + 22, y + 16, 3, 3);
        break;

      case TILE.PATH_STONE:
        ctx.fillStyle = isColored ? '#94a3b8' : '#475569';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        // Paver edges
        ctx.fillStyle = isColored ? '#cbd5e1' : '#64748b';
        ctx.fillRect(x + 2, y + 2, 12, 12);
        ctx.fillRect(x + 16, y + 2, 14, 12);
        ctx.fillRect(x + 2, y + 16, 14, 14);
        ctx.fillRect(x + 18, y + 16, 12, 14);
        break;

      case TILE.WATER:
      case TILE.WATER_DEEP:
        ctx.fillStyle = isColored ? '#0284c7' : '#1e293b';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        // Gentle wave
        const waveShift = Math.floor((this.tickCount / 12 + x / 16) % 4);
        ctx.fillStyle = isColored ? '#38bdf8' : '#334155';
        ctx.fillRect(x + waveShift * 4, y + 12, 8, 2);
        ctx.fillRect(x + 16 - waveShift * 2, y + 24, 6, 2);
        break;

      case TILE.WOOD_BRIDGE:
        ctx.fillStyle = isColored ? '#854d0e' : '#334155';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        // Planks
        ctx.fillStyle = isColored ? '#a16207' : '#475569';
        ctx.fillRect(x, y + 2, TILE_SIZE, 6);
        ctx.fillRect(x, y + 10, TILE_SIZE, 6);
        ctx.fillRect(x, y + 18, TILE_SIZE, 6);
        ctx.fillRect(x, y + 26, TILE_SIZE, 5);
        // Planks nails
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x + 2, y + 4, 2, 2);
        ctx.fillRect(x + TILE_SIZE - 4, y + 4, 2, 2);
        break;

      case TILE.TREE_TRUNK: {
        // Classic 16-bit Pixel-Art Forest Oak Tree
        ctx.fillStyle = isColored ? '#386641' : '#334155';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

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
        break;
      }

      case TILE.FOREST_PINE: {
        // Distinctive Evergreen Pixel Spruce/Pine
        ctx.fillStyle = isColored ? '#386641' : '#334155';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

        // Ground shadow
        ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
        ctx.fillRect(x + 6, y + 27, 20, 4);

        // Tree trunk base
        ctx.fillStyle = isColored ? '#451a03' : '#1e293b';
        ctx.fillRect(x + 14, y + 22, 4, 8);

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
        ctx.fillStyle = isColored ? '#386641' : '#334155';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
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
        break;
      }

      case TILE.FOUNTAIN: {
        // Magnificent Multi-Tiered Octagonal Pixel-Art Plaza Fountain
        const fx = x - 16;
        const fy = y - 16;
        const fw = TILE_SIZE + 32;
        const fh = TILE_SIZE + 32;

        // Ground stone foundation & shadow
        ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
        ctx.fillRect(fx + 4, fy + fh - 6, fw - 8, 6);

        // Outer Octagonal Stone Basin Rim
        const stoneDark = isColored ? '#475569' : '#334155';
        const stoneMid = isColored ? '#64748b' : '#475569';
        const stoneLight = isColored ? '#94a3b8' : '#64748b';
        const stoneHighlight = isColored ? '#e2e8f0' : '#94a3b8';

        ctx.fillStyle = stoneDark;
        ctx.fillRect(fx + 6, fy + 6, fw - 12, fh - 12);
        // Beveled corners
        ctx.clearRect(fx + 6, fy + 6, 6, 6);
        ctx.clearRect(fx + fw - 12, fy + 6, 6, 6);
        ctx.clearRect(fx + 6, fy + fh - 12, 6, 6);
        ctx.clearRect(fx + fw - 12, fy + fh - 12, 6, 6);

        // Stone rim
        ctx.fillStyle = stoneMid;
        ctx.fillRect(fx + 8, fy + 8, fw - 16, 4);
        ctx.fillRect(fx + 8, fy + 10, 4, fh - 20);
        ctx.fillRect(fx + fw - 12, fy + 10, 4, fh - 20);
        ctx.fillRect(fx + 8, fy + fh - 12, fw - 16, 4);

        // Water Basin Pool (Stepped depth)
        const waterDeep = isColored ? '#0369a1' : '#1e293b';
        const waterMid = isColored ? '#0284c7' : '#334155';
        const waterShimmer = isColored ? '#38bdf8' : '#475569';
        const waterFoam = isColored ? '#e0f2fe' : '#94a3b8';

        ctx.fillStyle = waterDeep;
        ctx.fillRect(fx + 12, fy + 12, fw - 24, fh - 24);

        // Animated ripple rings in basin
        const wave = Math.floor((this.tickCount * 0.1) % 4);
        ctx.fillStyle = waterMid;
        ctx.fillRect(fx + 14 + wave, fy + 16, 10, 2);
        ctx.fillRect(fx + fw - 26 - wave, fy + fh - 20, 10, 2);

        // Central Stone Pedestal & Column
        ctx.fillStyle = stoneDark;
        ctx.fillRect(fx + 24, fy + 22, 16, 20);
        ctx.fillStyle = stoneLight;
        ctx.fillRect(fx + 26, fy + 20, 12, 4);

        // Upper Spill Basin (Bowl)
        ctx.fillStyle = stoneMid;
        ctx.fillRect(fx + 20, fy + 16, 24, 6);
        ctx.fillStyle = stoneHighlight;
        ctx.fillRect(fx + 22, fy + 15, 20, 2);

        if (isColored) {
          // Cascading waterfalls spilling down left and right from upper bowl
          const splashFrame = Math.floor((this.tickCount * 0.2) % 3);
          ctx.fillStyle = waterShimmer;
          ctx.fillRect(fx + 18, fy + 20, 3, 16);
          ctx.fillRect(fx + fw - 21, fy + 20, 3, 16);

          ctx.fillStyle = waterFoam;
          ctx.fillRect(fx + 17, fy + 34 + (splashFrame % 2), 5, 2);
          ctx.fillRect(fx + fw - 22, fy + 34 + (splashFrame % 2), 5, 2);

          // Central pulsing water plume leaping from top
          const spoutH = 6 + Math.sin(this.tickCount * 0.2) * 3;
          ctx.fillStyle = waterFoam;
          ctx.fillRect(fx + 30, fy + 15 - spoutH, 4, spoutH);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(fx + 29, fy + 14 - spoutH, 6, 2);

          // Tiny dancing mist water droplets
          const dropY = (this.tickCount * 1.5) % 18;
          ctx.fillStyle = 'rgba(224, 242, 254, 0.8)';
          ctx.fillRect(fx + 26 + (this.tickCount % 5) * 2, fy + 12 + dropY, 2, 2);
        } else {
          // Frozen uncolored fountain state
          ctx.fillStyle = '#475569';
          ctx.fillRect(fx + 30, fy + 15, 4, 3);
        }
        break;
      }

      case TILE.BENCH: {
        ctx.fillStyle = isColored ? '#94a3b8' : '#475569';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

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
        ctx.fillStyle = isColored ? '#94a3b8' : '#475569';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

        // Cast iron post
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 12, y + 25, 8, 4);
        ctx.fillRect(x + 14, y + 10, 4, 16);
        ctx.fillRect(x + 11, y + 9, 10, 2);
        ctx.fillRect(x + 12, y + 2, 8, 8);

        // Glowing lantern glass
        if (isColored) {
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(x + 14, y + 4, 4, 5);
          ctx.fillStyle = 'rgba(254, 240, 138, 0.15)';
          ctx.fillRect(x + 4, y - 4, 24, 22);
        } else {
          ctx.fillStyle = '#64748b';
          ctx.fillRect(x + 14, y + 4, 4, 5);
        }
        break;
      }

      case TILE.SIGNPOST: {
        ctx.fillStyle = isColored ? '#94a3b8' : '#475569';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

        // Wooden post
        ctx.fillStyle = isColored ? '#78350f' : '#334155';
        ctx.fillRect(x + 14, y + 12, 4, 18);

        // Direction arrow signs
        ctx.fillStyle = isColored ? '#d97706' : '#64748b';
        ctx.fillRect(x + 4, y + 6, 20, 5);
        ctx.fillRect(x + 2, y + 7, 3, 3);
        ctx.fillStyle = isColored ? '#b45309' : '#475569';
        ctx.fillRect(x + 8, y + 13, 20, 5);
        ctx.fillRect(x + 26, y + 14, 3, 3);
        break;
      }

      case TILE.FLOWER_CART: {
        ctx.fillStyle = isColored ? '#94a3b8' : '#475569';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

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
          ctx.fillStyle = '#a855f7';
          ctx.fillRect(x + 22, y + 8, 4, 4);
        }
        break;
      }

      case TILE.PLAZA_MOSAIC: {
        ctx.fillStyle = isColored ? '#cbd5e1' : '#475569';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        // Diamond geometric center medallion
        ctx.fillStyle = isColored ? '#94a3b8' : '#334155';
        ctx.fillRect(x + 4, y + 4, 24, 24);
        ctx.fillStyle = isColored ? '#f1f5f9' : '#64748b';
        ctx.fillRect(x + 8, y + 8, 16, 16);
        ctx.fillStyle = isColored ? '#fbbf24' : '#475569';
        ctx.fillRect(x + 14, y + 14, 4, 4);
        break;
      }

      case TILE.PLAZA_BORDER: {
        ctx.fillStyle = isColored ? '#386641' : '#334155';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        // Beveled granite curb
        ctx.fillStyle = isColored ? '#64748b' : '#475569';
        ctx.fillRect(x + 2, y + 2, 28, 28);
        ctx.fillStyle = isColored ? '#94a3b8' : '#64748b';
        ctx.fillRect(x + 4, y + 4, 24, 24);
        break;
      }

      case TILE.FENCE: {
        ctx.fillStyle = isColored ? '#386641' : '#334155';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        const fenceWood = isColored ? '#a16207' : '#64748b';
        ctx.fillStyle = fenceWood;
        ctx.fillRect(x, y + 10, TILE_SIZE, 3);
        ctx.fillRect(x, y + 20, TILE_SIZE, 3);
        for (let i = 0; i < 3; i++) {
          const px = x + 4 + i * 10;
          ctx.fillRect(px, y + 6, 4, 18);
          ctx.fillRect(px + 1, y + 4, 2, 2);
        }
        break;
      }

      case TILE.SECRET_TREE: {
        // Grand 64x64 Ancient Sacred Banyan Tree
        const tx = x - 16;
        const ty = y - 16;
        const tw = TILE_SIZE + 32;
        const th = TILE_SIZE + 32;

        ctx.fillStyle = isColored ? '#386641' : '#334155';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

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
        ctx.fillStyle = soilBase;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

        // Horizontal tilled furrows with soil clumps
        for (let row = 0; row < 4; row++) {
          const fy = y + 2 + row * 7;
          ctx.fillStyle = furrowDark;
          ctx.fillRect(x, fy + 4, TILE_SIZE, 2);
          ctx.fillStyle = ridgeLight;
          ctx.fillRect(x, fy, TILE_SIZE, 3);
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
        ctx.fillStyle = soilBase;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = furrowDark;
        ctx.fillRect(x, y + 14, TILE_SIZE, 2);
        ctx.fillStyle = ridgeLight;
        ctx.fillRect(x, y + 8, TILE_SIZE, 3);

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
        ctx.fillStyle = soilBase;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = isColored ? '#291004' : '#0f172a';
        ctx.fillRect(x, y + 16, TILE_SIZE, 2);

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
        ctx.fillStyle = isColored ? '#451a03' : '#1e293b';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

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
        ctx.fillStyle = isColored ? '#386641' : '#334155';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

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
        ctx.fillStyle = isColored ? '#3f1d0b' : '#1e293b';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

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
        ctx.fillStyle = isColored ? '#386641' : '#334155';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

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
        ctx.fillStyle = isColored ? '#386641' : '#334155';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

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

      case TILE.HOUSE_WALL:
      case TILE.TOWER_WALL: {
        // Timber-framed plaster cottage wall
        const plasterColor = isColored ? '#fef3c7' : '#334155';
        const timberColor = isColored ? '#78350f' : '#1e293b';
        ctx.fillStyle = plasterColor;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

        // Wooden corner studs & beam framing
        ctx.fillStyle = timberColor;
        ctx.fillRect(x, y, 3, TILE_SIZE);
        ctx.fillRect(x + TILE_SIZE - 3, y, 3, TILE_SIZE);
        ctx.fillRect(x, y + TILE_SIZE - 3, TILE_SIZE, 3);
        ctx.fillRect(x, y, TILE_SIZE, 3);

        // Diagonal timber brace
        ctx.fillStyle = isColored ? '#92400e' : '#273549';
        ctx.fillRect(x + 8, y + 14, 16, 3);
        break;
      }

      case TILE.HOUSE_WINDOW: {
        // Cottage wall with warm glowing window and flower planter box
        const plasterColor = isColored ? '#fef3c7' : '#334155';
        const timberColor = isColored ? '#78350f' : '#1e293b';
        ctx.fillStyle = plasterColor;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

        // Timber border
        ctx.fillStyle = timberColor;
        ctx.fillRect(x, y, 3, TILE_SIZE);
        ctx.fillRect(x + TILE_SIZE - 3, y, 3, TILE_SIZE);

        // Window frame
        ctx.fillStyle = '#451a03';
        ctx.fillRect(x + 7, y + 4, 18, 16);

        // Glass panes glowing warm amber light
        const glassGlow = isColored ? '#fef08a' : '#64748b';
        ctx.fillStyle = glassGlow;
        ctx.fillRect(x + 9, y + 6, 6, 5);
        ctx.fillRect(x + 17, y + 6, 6, 5);
        ctx.fillRect(x + 9, y + 13, 6, 5);
        ctx.fillRect(x + 17, y + 13, 6, 5);

        // Window mullion cross
        ctx.fillStyle = '#78350f';
        ctx.fillRect(x + 15, y + 6, 2, 12);
        ctx.fillRect(x + 9, y + 11, 14, 2);

        // Wooden planter flower box beneath window
        ctx.fillStyle = isColored ? '#a16207' : '#475569';
        ctx.fillRect(x + 5, y + 21, 22, 6);

        if (isColored) {
          // Blooming mini petunias in planter
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(x + 7, y + 19, 3, 3);
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(x + 13, y + 19, 3, 3);
          ctx.fillStyle = '#ec4899';
          ctx.fillRect(x + 19, y + 19, 3, 3);
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(x + 6, y + 20, 2, 2);
          ctx.fillRect(x + 17, y + 20, 2, 2);
        }
        break;
      }

      case TILE.HOUSE_DOOR: {
        // Cottage wall base
        const plasterColor = isColored ? '#fef3c7' : '#334155';
        ctx.fillStyle = plasterColor;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

        // Stone welcome step
        ctx.fillStyle = isColored ? '#94a3b8' : '#475569';
        ctx.fillRect(x + 4, y + 27, 24, 5);

        // Dark arched wooden door frame
        ctx.fillStyle = isColored ? '#451a03' : '#0f172a';
        ctx.fillRect(x + 6, y + 2, 20, 26);

        // Wooden planks
        ctx.fillStyle = isColored ? '#92400e' : '#334155';
        ctx.fillRect(x + 8, y + 4, 16, 23);
        ctx.fillStyle = isColored ? '#78350f' : '#1e293b';
        ctx.fillRect(x + 13, y + 4, 1, 23);
        ctx.fillRect(x + 18, y + 4, 1, 23);

        // Black iron door hinges
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 8, y + 8, 4, 2);
        ctx.fillRect(x + 8, y + 20, 4, 2);

        // Gleaming brass doorknob
        ctx.fillStyle = isColored ? '#fbbf24' : '#94a3b8';
        ctx.fillRect(x + 20, y + 15, 2, 3);
        break;
      }

      case TILE.HOUSE_ROOF: {
        ctx.fillStyle = isColored ? '#991b1b' : '#1e293b';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

        // Terracotta / Cedar wood shingle rows
        const shingleColor = isColored ? '#b91c1c' : '#334155';
        const shingleHighlight = isColored ? '#ef4444' : '#475569';

        ctx.fillStyle = shingleColor;
        ctx.fillRect(x, y + 4, TILE_SIZE, 6);
        ctx.fillRect(x, y + 14, TILE_SIZE, 6);
        ctx.fillRect(x, y + 24, TILE_SIZE, 6);

        ctx.fillStyle = shingleHighlight;
        ctx.fillRect(x + 2, y + 5, 8, 2);
        ctx.fillRect(x + 14, y + 5, 8, 2);
        ctx.fillRect(x + 6, y + 15, 8, 2);
        ctx.fillRect(x + 20, y + 15, 8, 2);

        // Chimney with animated rising smoke on specific roof tiles
        if ((x / TILE_SIZE === 4 && y / TILE_SIZE === 18) || (x / TILE_SIZE === 30 && y / TILE_SIZE === 19)) {
          // Brick chimney
          ctx.fillStyle = isColored ? '#7f1d1d' : '#334155';
          ctx.fillRect(x + 20, y - 6, 8, 12);
          ctx.fillStyle = isColored ? '#451a03' : '#1e293b';
          ctx.fillRect(x + 19, y - 8, 10, 3);

          // Animated rising pixel smoke puffs
          const smokeTime = this.tickCount * 0.08;
          for (let s = 0; s < 3; s++) {
            const smokeProgress = ((smokeTime + s * 1.2) % 3.6) / 3.6;
            const smokeY = y - 8 - smokeProgress * 22;
            const smokeX = x + 23 + Math.sin(smokeProgress * Math.PI * 2) * 4;
            const smokeSize = 3 + Math.floor(smokeProgress * 4);
            const smokeAlpha = (1 - smokeProgress) * 0.7;

            ctx.fillStyle = `rgba(241, 245, 249, ${smokeAlpha})`;
            ctx.fillRect(Math.floor(smokeX), Math.floor(smokeY), smokeSize, smokeSize);
          }
        }
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

      case TILE.CLIFF:
      default:
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
        break;
    }
  }

  // Draw player sprite with walking frames & scarf
  private drawPlayer(player: Player) {
    const ctx = this.ctx;
    const px = Math.floor(player.x);
    const py = Math.floor(player.y);
    const bob = player.isMoving ? Math.sin(this.tickCount * 0.3) * 2 : 0;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(px + 16, py + 29, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body (Shirt: Emerald/Teal)
    ctx.fillStyle = '#059669';
    ctx.fillRect(px + 8, py + 14 + bob, 16, 12);

    // Red Scarf (Signature Adventurer item)
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(px + 9, py + 12 + bob, 14, 4);
    if (player.facing === 'right') {
      ctx.fillRect(px + 6, py + 14 + bob, 4, 6);
    } else if (player.facing === 'left') {
      ctx.fillRect(px + 22, py + 14 + bob, 4, 6);
    }

    // Head (Skin tone)
    ctx.fillStyle = '#fde047';
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(px + 9, py + 4 + bob, 14, 10);

    // Hair (Brown adventurer messy cut)
    ctx.fillStyle = '#78350f';
    ctx.fillRect(px + 8, py + 2 + bob, 16, 5);
    ctx.fillRect(px + 8, py + 4 + bob, 3, 5);
    ctx.fillRect(px + 21, py + 4 + bob, 3, 5);

    // Eyes
    ctx.fillStyle = '#1e293b';
    if (player.facing === 'down') {
      ctx.fillRect(px + 11, py + 8 + bob, 2, 3);
      ctx.fillRect(px + 19, py + 8 + bob, 2, 3);
    } else if (player.facing === 'left') {
      ctx.fillRect(px + 10, py + 8 + bob, 2, 3);
    } else if (player.facing === 'right') {
      ctx.fillRect(px + 20, py + 8 + bob, 2, 3);
    }

    // Legs / Shoes
    ctx.fillStyle = '#1e293b';
    const legOffset = player.isMoving ? Math.sin(this.tickCount * 0.3) * 3 : 0;
    ctx.fillRect(px + 10, py + 26 + legOffset, 4, 5);
    ctx.fillRect(px + 18, py + 26 - legOffset, 4, 5);

    // Golden compass attached to belt, glowing
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(px + 14, py + 22 + bob, 4, 4);
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
      case 'squirrel': { // Kiki the Squirrel
        const isTwitching = Math.sin(this.tickCount * 0.05 + npc.y) > 0.88;
        const tailTwitch = isTwitching ? Math.sin(this.tickCount * 0.6) * 3 : 0;
        const tailSway = Math.sin(this.tickCount * 0.12) * 2;
        const tailBaseX = turnDir === 1 ? nx + 5 : turnDir === -1 ? nx + 21 : nx + 6;

        // Fluffy animated tail with organic wag & twitch
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.arc(tailBaseX, ny + 12 + idleBob + tailSway + tailTwitch, 8, 0, Math.PI * 2);
        ctx.fill();

        // Fur body
        ctx.fillStyle = '#d97706';
        ctx.fillRect(nx + 10, ny + 10 + idleBob, 12, 14);

        // White belly with slight turn shift
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(nx + 12 + headTurnX * 0.5, ny + 14 + idleBob, 8, 8);

        // Ears with attentive twitching
        const earTwitch = isTwitching ? -1 : 0;
        ctx.fillStyle = '#92400e';
        ctx.fillRect(nx + 10 + headTurnX, ny + 6 + headBob + earTwitch, 3, 5);
        ctx.fillRect(nx + 19 + headTurnX, ny + 6 + headBob - earTwitch, 3, 5);

        // Expressive eyes turning with gaze
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(nx + 13 + headTurnX + eyeTurnX, ny + 11 + headBob, 2, 2);
        ctx.fillRect(nx + 18 + headTurnX + eyeTurnX, ny + 11 + headBob, 2, 2);

        // Mail pouch bobbing with breath
        ctx.fillStyle = '#78350f';
        ctx.fillRect(nx + 14 + headTurnX * 0.5, ny + 18 + idleBob, 6, 5);
        break;
      }

      case 'old_man': { // Kakek Ranu
        // Blue dungarees / shirt
        ctx.fillStyle = '#1d4ed8';
        ctx.fillRect(nx + 8, ny + 14 + idleBob, 16, 12);

        // Head turning left/right
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(nx + 9 + headTurnX, ny + 6 + headBob, 14, 10);

        // White bald fringe & bushy mustache turning with head
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(nx + 8 + headTurnX, ny + 6 + headBob, 16, 3);
        ctx.fillRect(nx + 10 + headTurnX, ny + 13 + headBob, 12, 3);

        // Eyes glancing toward target
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(nx + 11 + headTurnX + eyeTurnX, ny + 9 + headBob, 2, 2);
        ctx.fillRect(nx + 19 + headTurnX + eyeTurnX, ny + 9 + headBob, 2, 2);

        // Carpenter Hammer in hand with rhythmic bridge inspection tap
        const hammerTap = Math.sin(this.tickCount * 0.08) * 1.8;
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(nx + 25, ny + 10 + idleBob + hammerTap, 4, 6);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(nx + 26, ny + 14 + idleBob + hammerTap, 2, 10);
        break;
      }

      case 'boy_glasses': { // Bimo
        // Yellow sweater body with gentle breathing
        ctx.fillStyle = '#eab308';
        ctx.fillRect(nx + 8, ny + 14 + idleBob, 16, 12);

        // Head turning with headBob
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(nx + 9 + headTurnX, ny + 6 + headBob, 14, 10);

        // Curly dark hair turning with head
        ctx.fillStyle = '#3b2f2f';
        ctx.fillRect(nx + 8 + headTurnX, ny + 4 + headBob, 16, 4);
        ctx.fillRect(nx + 7 + headTurnX, ny + 7 + headBob, 3, 4);

        // Huge round teal spectacles turning with gaze
        ctx.fillStyle = '#06b6d4';
        ctx.strokeRect(nx + 10 + headTurnX + eyeTurnX, ny + 9 + headBob, 5, 4);
        ctx.strokeRect(nx + 17 + headTurnX + eyeTurnX, ny + 9 + headBob, 5, 4);
        ctx.fillRect(nx + 15 + headTurnX + eyeTurnX, ny + 10 + headBob, 2, 1);

        // Shy idle gesture: occasionally reaches up to adjust glasses
        const nudgeCycle = (this.tickCount + Math.floor(npc.x * 50)) % 280;
        if (nudgeCycle > 230 && nudgeCycle < 270) {
          ctx.fillStyle = '#fed7aa';
          ctx.fillRect(nx + 18 + headTurnX, ny + 12 + headBob, 3, 4);
        }
        break;
      }

      case 'chicken_glasses': { // Profesor Kotek
        // Classic chicken forward-pecking head bob
        const peckX = Math.cos(this.tickCount * 0.12) * 1.5 + headTurnX;
        const peckY = Math.sin(this.tickCount * 0.12) * 1.5 + headBob;

        // White chicken body
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(nx + 10, ny + 12 + idleBob, 12, 12);

        // Wing flutter animation
        const wingFlutter = Math.sin(this.tickCount * 0.08) > 0.8 ? Math.sin(this.tickCount * 0.6) * 2 : 0;
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(nx + 8, ny + 14 + idleBob + wingFlutter, 3, 6);

        // Red comb swaying with peck
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(nx + 13 + peckX, ny + 7 + peckY, 6, 4);

        // Yellow beak facing direction
        ctx.fillStyle = '#f59e0b';
        const beakX = turnDir === -1 ? nx + 7 : nx + 19;
        ctx.fillRect(beakX + peckX, ny + 14 + peckY, 4, 3);

        // Round professor monocle swinging with pecking motion
        ctx.fillStyle = '#eab308';
        ctx.strokeRect(nx + 15 + peckX + eyeTurnX, ny + 12 + peckY, 4, 4);

        // Tiny feet
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(nx + 12, ny + 24, 2, 4);
        ctx.fillRect(nx + 18, ny + 24, 2, 4);
        break;
      }

      case 'girl_counselor': { // Kak Citra (Konselor Emosi)
        // Teal uniform vest & skirt
        ctx.fillStyle = '#0f766e';
        ctx.fillRect(nx + 8, ny + 14 + idleBob, 16, 12);

        // Head turning warmly
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(nx + 9 + headTurnX, ny + 6 + headBob, 14, 10);

        // Sleek brown hair with flower pin swaying gently
        ctx.fillStyle = '#451a03';
        ctx.fillRect(nx + 8 + headTurnX, ny + 4 + headBob, 16, 5);
        ctx.fillRect(nx + 7 + headTurnX, ny + 7 + headBob, 3, 8);
        const flowerSway = Math.sin(this.tickCount * 0.08) * 1;
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(nx + 20 + headTurnX, ny + 5 + headBob + flowerSway, 3, 3);

        // Smiling friendly eyes looking toward player/turn direction
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(nx + 11 + headTurnX + eyeTurnX, ny + 9 + headBob, 2, 2);
        ctx.fillRect(nx + 19 + headTurnX + eyeTurnX, ny + 9 + headBob, 2, 2);

        // Clipboard with 4 emotional zone color dots gently bobbing
        const clipTap = Math.sin(this.tickCount * 0.09) * 1;
        ctx.fillStyle = '#78350f';
        ctx.fillRect(nx + 22, ny + 15 + idleBob + clipTap, 6, 8);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(nx + 23, ny + 16 + idleBob + clipTap, 2, 2);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(nx + 25, ny + 16 + idleBob + clipTap, 2, 2);
        ctx.fillStyle = '#eab308';
        ctx.fillRect(nx + 23, ny + 19 + idleBob + clipTap, 2, 2);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(nx + 25, ny + 19 + idleBob + clipTap, 2, 2);
        break;
      }

      case 'zen_master': { // Kakek Damai (Mindfulness)
        // Meditative floating levitation above the rock
        const zenFloat = Math.sin(this.tickCount * 0.04) * 2.5;

        // Grounded meditation rock
        ctx.fillStyle = '#475569';
        ctx.fillRect(nx + 4, ny + 24, 24, 5);

        // Sage green kimono robe floating peacefully
        ctx.fillStyle = '#15803d';
        ctx.fillRect(nx + 6, ny + 13 + zenFloat, 20, 12);

        // Head gently swaying with breath
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(nx + 9 + headTurnX * 0.5, ny + 5 + zenFloat, 14, 10);

        // Silver-white beard & hair topknot flowing
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(nx + 14 + headTurnX * 0.5, ny + 1 + zenFloat, 4, 5);
        ctx.fillRect(nx + 11 + headTurnX * 0.5, ny + 11 + zenFloat, 10, 6);

        // Serene closed meditating eyes
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(nx + 11 + headTurnX * 0.5, ny + 8 + zenFloat, 3, 1);
        ctx.fillRect(nx + 18 + headTurnX * 0.5, ny + 8 + zenFloat, 3, 1);

        // Potted mini bonsai in hands with soothing green zen glint
        ctx.fillStyle = '#b45309';
        ctx.fillRect(nx + 14, ny + 18 + zenFloat, 5, 4);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(nx + 13, ny + 15 + zenFloat, 7, 4);
        if (Math.sin(this.tickCount * 0.1) > 0.6) {
          ctx.fillStyle = '#86efac';
          ctx.fillRect(nx + 15 + (this.tickCount % 3), ny + 14 + zenFloat, 2, 2);
        }
        break;
      }

      case 'cat_librarian': { // Moka si Kucing Pustakawan
        // Orange tabby cat body with gentle purr expansion
        ctx.fillStyle = '#f97316';
        ctx.fillRect(nx + 9, ny + 14 + idleBob, 14, 12);

        // White chest patch
        ctx.fillStyle = '#fff7ed';
        ctx.fillRect(nx + 12 + headTurnX * 0.5, ny + 17 + idleBob, 8, 7);

        // Cat head turning to face player
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(nx + 10 + headTurnX, ny + 8 + headBob, 12, 8);

        // Pointed ears with natural listening twitch
        const earTwitchL = Math.sin(this.tickCount * 0.06) > 0.85 ? -1 : 0;
        const earTwitchR = Math.sin(this.tickCount * 0.06 + 1.2) > 0.85 ? 1 : 0;
        ctx.fillStyle = '#c2410c';
        ctx.fillRect(nx + 9 + headTurnX, ny + 5 + headBob + earTwitchL, 3, 4);
        ctx.fillRect(nx + 20 + headTurnX, ny + 5 + headBob + earTwitchR, 3, 4);

        // Spectacles & attentive gaze
        ctx.fillStyle = '#38bdf8';
        ctx.strokeRect(nx + 11 + headTurnX + eyeTurnX, ny + 10 + headBob, 3, 3);
        ctx.strokeRect(nx + 18 + headTurnX + eyeTurnX, ny + 10 + headBob, 3, 3);

        // Red librarian bow tie
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(nx + 14 + headTurnX * 0.5, ny + 15 + idleBob, 4, 3);

        // Dynamic 3-joint animated curling tail
        const tailWave = Math.sin(this.tickCount * 0.14) * 3;
        ctx.fillStyle = '#c2410c';
        ctx.fillRect(nx + 5, ny + 17 + idleBob, 4, 3);
        ctx.fillRect(nx + 4 + tailWave * 0.5, ny + 14 + idleBob + tailWave * 0.5, 3, 4);
        ctx.fillRect(nx + 3 + tailWave, ny + 11 + idleBob + tailWave, 3, 4);

        // Mini stack of storybooks beside cat
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(nx + 22, ny + 21, 7, 3);
        ctx.fillStyle = '#eab308';
        ctx.fillRect(nx + 23, ny + 18, 6, 3);
        break;
      }

      case 'farmer': { // Pak Joko si Petani Harapan
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(nx + 8, ny + 27, 16, 4);

        // Body: Indigo overalls & rustic inner shirt
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(nx + 10, ny + 15 + idleBob, 12, 12);
        ctx.fillStyle = '#fef3c7'; // Shirt neckline
        ctx.fillRect(nx + 13 + headTurnX * 0.4, ny + 14 + idleBob, 6, 4);
        ctx.fillStyle = '#ca8a04'; // Brass overall buckle buttons
        ctx.fillRect(nx + 11, ny + 16 + idleBob, 2, 2);
        ctx.fillRect(nx + 19, ny + 16 + idleBob, 2, 2);

        // Brown boots
        ctx.fillStyle = '#451a03';
        ctx.fillRect(nx + 10, ny + 26, 4, 4);
        ctx.fillRect(nx + 18, ny + 26, 4, 4);

        // Head and face
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(nx + 11 + headTurnX, ny + 7 + headBob, 10, 8);

        // Bushy friendly mustache & warm smile
        ctx.fillStyle = '#78350f';
        ctx.fillRect(nx + 12 + headTurnX + eyeTurnX, ny + 12 + headBob, 8, 2);
        // Eyes
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(nx + 12 + headTurnX + eyeTurnX, ny + 9 + headBob, 2, 2);
        ctx.fillRect(nx + 18 + headTurnX + eyeTurnX, ny + 9 + headBob, 2, 2);

        // Traditional Bamboo Caping Sun Hat (Wide cone hat)
        ctx.fillStyle = '#b45309';
        ctx.fillRect(nx + 5 + headTurnX, ny + 5 + headBob, 22, 3);
        ctx.fillStyle = '#d97706';
        ctx.fillRect(nx + 8 + headTurnX, ny + 2 + headBob, 16, 3);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(nx + 12 + headTurnX, ny - 1 + headBob, 8, 3);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(nx + 14 + headTurnX, ny - 2 + headBob, 4, 2);

        // Animated Farming Action: Watering Can pouring fresh water onto vegetables!
        const waterCycle = Math.sin(this.tickCount * 0.09);
        const canTilt = waterCycle > 0.2 ? 3 : 0;

        // Arm holding watering can
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(nx + 20, ny + 16 + idleBob + canTilt, 4, 3);

        // Metal Watering Can
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(nx + 22, ny + 15 + idleBob + canTilt, 7, 7);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(nx + 23, ny + 16 + idleBob + canTilt, 5, 2);
        // Handle & spout
        ctx.fillStyle = '#0369a1';
        ctx.fillRect(nx + 21, ny + 13 + idleBob + canTilt, 2, 6);
        ctx.fillRect(nx + 28, ny + 18 + idleBob + canTilt, 3, 2);

        // Sparkling water droplets streaming when pouring
        if (waterCycle > 0.3) {
          ctx.fillStyle = '#7dd3fc';
          const dropY = (this.tickCount * 2) % 10;
          ctx.fillRect(nx + 30 + (dropY % 2), ny + 20 + dropY, 2, 2);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(nx + 31, ny + 22 + ((dropY + 4) % 10), 1, 2);
        }
        break;
      }

      case 'wandering_scout': { // Didi si Pengelana Cilik
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(nx + 8, ny + 27, 16, 4);

        // Leg walking stride animation (bouncing lightly as he explores)
        const scoutLegStride = Math.sin(this.tickCount * 0.25) * 2;
        ctx.fillStyle = '#475569'; // Explorer shorts
        ctx.fillRect(nx + 11, ny + 21 + idleBob, 10, 4);
        ctx.fillStyle = '#b45309'; // Sturdy hiking boots
        ctx.fillRect(nx + 10, ny + 25 + scoutLegStride, 4, 4);
        ctx.fillRect(nx + 18, ny + 25 - scoutLegStride, 4, 4);

        // Big Green Explorer Backpack on his back
        ctx.fillStyle = '#14532d';
        ctx.fillRect(nx + 5, ny + 12 + idleBob, 6, 12);
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(nx + 6, ny + 13 + idleBob, 4, 9);
        // Rolled bedroll on top of backpack
        ctx.fillStyle = '#ca8a04';
        ctx.fillRect(nx + 4, ny + 9 + idleBob, 8, 3);

        // Explorer Khaki Shirt & Orange Neckerchief
        ctx.fillStyle = '#d97706';
        ctx.fillRect(nx + 10, ny + 13 + idleBob, 12, 9);
        ctx.fillStyle = '#ea580c'; // Scout neckerchief
        ctx.fillRect(nx + 13 + headTurnX * 0.4, ny + 13 + idleBob, 6, 4);
        ctx.fillStyle = '#facc15'; // Neckerchief woggle
        ctx.fillRect(nx + 15 + headTurnX * 0.4, ny + 16 + idleBob, 2, 2);

        // Cheerful Scout Face
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(nx + 11 + headTurnX, ny + 6 + headBob, 10, 8);

        // Sparkly inquisitive scout eyes
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(nx + 12 + headTurnX + eyeTurnX, ny + 8 + headBob, 2, 2);
        ctx.fillRect(nx + 17 + headTurnX + eyeTurnX, ny + 8 + headBob, 2, 2);
        // Cheerful grin
        ctx.fillStyle = '#e11d48';
        ctx.fillRect(nx + 14 + headTurnX + eyeTurnX, ny + 11 + headBob, 4, 2);

        // Explorer Scout Cap with Bright Yellow Feather
        ctx.fillStyle = '#15803d';
        ctx.fillRect(nx + 9 + headTurnX, ny + 3 + headBob, 14, 4);
        ctx.fillStyle = '#166534';
        ctx.fillRect(nx + 12 + headTurnX, ny + 1 + headBob, 10, 3);
        // Yellow feather badge fluttering
        const featherWiggle = Math.sin(this.tickCount * 0.2) * 2;
        ctx.fillStyle = '#facc15';
        ctx.fillRect(nx + 19 + headTurnX + featherWiggle, ny - 2 + headBob, 2, 5);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(nx + 20 + headTurnX + featherWiggle, ny - 3 + headBob, 1, 3);

        // Wooden walking staff in hand
        ctx.fillStyle = '#78350f';
        ctx.fillRect(nx + 22, ny + 10 + idleBob, 2, 18);
        ctx.fillStyle = '#92400e';
        ctx.fillRect(nx + 21, ny + 9 + idleBob, 4, 2);

        // Friendly wave hand animation when player is nearby
        if (isNoticingPlayer) {
          const wave = Math.sin(this.tickCount * 0.3) * 3;
          ctx.fillStyle = '#fed7aa';
          ctx.fillRect(nx + 8 + wave, ny + 10 + idleBob - 2, 3, 3);
        }
        break;
      }

      case 'woodcutter': {
        // --- PAK TEGUH: PENEBANG POHON HUTAN BIJAK ---
        // Shadow
        ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
        ctx.fillRect(nx + 6, ny + 26, 20, 4);

        // Brown boots
        ctx.fillStyle = '#451a03';
        ctx.fillRect(nx + 9, ny + 25, 4, 4);
        ctx.fillRect(nx + 17, ny + 25, 4, 4);

        // Blue denim work pants
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(nx + 9, ny + 20, 12, 6);

        // Red Flannel Buffalo-plaid shirt
        ctx.fillStyle = '#b91c1c';
        ctx.fillRect(nx + 8, ny + 12 + idleBob, 14, 9);
        // Black plaid lines
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(nx + 8, ny + 15 + idleBob, 14, 2);
        ctx.fillRect(nx + 14, ny + 12 + idleBob, 2, 9);

        // Brown leather suspenders
        ctx.fillStyle = '#78350f';
        ctx.fillRect(nx + 10, ny + 12 + idleBob, 2, 9);
        ctx.fillRect(nx + 18, ny + 12 + idleBob, 2, 9);

        // Kind woodsman face
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(nx + 10 + headTurnX, ny + 5 + headBob, 11, 8);

        // Friendly trimmed brown beard & mustache
        ctx.fillStyle = '#542d13';
        ctx.fillRect(nx + 10 + headTurnX, ny + 10 + headBob, 11, 3);
        ctx.fillRect(nx + 12 + headTurnX, ny + 9 + headBob, 7, 2);

        // Cheerful woodsman eyes
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(nx + 12 + headTurnX + eyeTurnX, ny + 7 + headBob, 2, 2);
        ctx.fillRect(nx + 17 + headTurnX + eyeTurnX, ny + 7 + headBob, 2, 2);

        // Woodcutter ear-flap wool cap (Kopiah / Kupluk Hutan)
        ctx.fillStyle = '#065f46';
        ctx.fillRect(nx + 9 + headTurnX, ny + 2 + headBob, 13, 4);
        ctx.fillStyle = '#047857';
        ctx.fillRect(nx + 11 + headTurnX, ny + 0 + headBob, 9, 3);
        // Ear flaps
        ctx.fillStyle = '#065f46';
        ctx.fillRect(nx + 8 + headTurnX, ny + 4 + headBob, 2, 4);
        ctx.fillRect(nx + 21 + headTurnX, ny + 4 + headBob, 2, 4);

        // Tree stump & Chopping axe resting beside him
        ctx.fillStyle = '#78350f';
        ctx.fillRect(nx + 23, ny + 18, 7, 10);
        ctx.fillStyle = '#92400e';
        ctx.fillRect(nx + 24, ny + 18, 5, 2); // stump rings
        // Wood axe handle & steel head
        ctx.fillStyle = '#b45309';
        ctx.fillRect(nx + 24, ny + 7 + idleBob, 2, 14);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(nx + 22, ny + 6 + idleBob, 6, 3);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(nx + 22, ny + 6 + idleBob, 2, 3); // sharp steel blade
        break;
      }

      case 'fruit_farmer': {
        // --- IBU SARI: PETANI KEBUN BUAH HUTAN ---
        // Shadow
        ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
        ctx.fillRect(nx + 6, ny + 26, 20, 4);

        // Garden boots
        ctx.fillStyle = '#047857';
        ctx.fillRect(nx + 9, ny + 25, 4, 4);
        ctx.fillRect(nx + 17, ny + 25, 4, 4);

        // Floral farm dress & Green Apron
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(nx + 8, ny + 13 + idleBob, 14, 12);
        // Bright emerald gardener apron
        ctx.fillStyle = '#10b981';
        ctx.fillRect(nx + 10, ny + 14 + idleBob, 10, 10);
        // Apron pocket with yellow flower embroidery
        ctx.fillStyle = '#059669';
        ctx.fillRect(nx + 12, ny + 18 + idleBob, 6, 4);
        ctx.fillStyle = '#fde047';
        ctx.fillRect(nx + 14, ny + 19 + idleBob, 2, 2);

        // Warm maternal face
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(nx + 10 + headTurnX, ny + 5 + headBob, 11, 8);

        // Kind sparkling eyes
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(nx + 12 + headTurnX + eyeTurnX, ny + 7 + headBob, 2, 2);
        ctx.fillRect(nx + 17 + headTurnX + eyeTurnX, ny + 7 + headBob, 2, 2);
        // Gentle smile
        ctx.fillStyle = '#e11d48';
        ctx.fillRect(nx + 14 + headTurnX + eyeTurnX, ny + 10 + headBob, 3, 2);

        // Straw Sun Hat (Topi Caping Anyaman Jerami)
        ctx.fillStyle = '#eab308';
        ctx.fillRect(nx + 6 + headTurnX, ny + 2 + headBob, 19, 3);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(nx + 10 + headTurnX, ny - 1 + headBob, 11, 4);
        // Red ribbon on straw hat
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(nx + 10 + headTurnX, ny + 2 + headBob, 11, 1);

        // Basket of fresh red apples and oranges held in arm
        ctx.fillStyle = '#78350f'; // wicker basket
        ctx.fillRect(nx + 2, ny + 15 + idleBob, 8, 8);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(nx + 3, ny + 16 + idleBob, 6, 6);
        // Red Apples
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(nx + 3, ny + 14 + idleBob, 3, 3);
        ctx.fillRect(nx + 7, ny + 14 + idleBob, 3, 3);
        // Sweet Orange
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(nx + 5, ny + 13 + idleBob, 3, 3);
        break;
      }

      case 'fisherman': {
        // --- BUNG JALA: PEMANCING SABAR TEPI SUNGAI ---
        // Shadow
        ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
        ctx.fillRect(nx + 6, ny + 26, 20, 4);

        // Rubber river wading boots
        ctx.fillStyle = '#334155';
        ctx.fillRect(nx + 9, ny + 24, 4, 5);
        ctx.fillRect(nx + 16, ny + 24, 4, 5);

        // Fisherman Olive Vest & Cyan Shirt
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(nx + 8, ny + 12 + idleBob, 14, 9);
        // Multi-pocket olive tackle vest
        ctx.fillStyle = '#65a30d';
        ctx.fillRect(nx + 8, ny + 13 + idleBob, 4, 8);
        ctx.fillRect(nx + 18, ny + 13 + idleBob, 4, 8);
        ctx.fillStyle = '#4d7c0f';
        ctx.fillRect(nx + 9, ny + 15 + idleBob, 2, 2); // tackle box pocket
        ctx.fillRect(nx + 19, ny + 15 + idleBob, 2, 2);

        // Relaxed peaceful face
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(nx + 10 + headTurnX, ny + 5 + headBob, 11, 8);

        // Calm, meditative eyes
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(nx + 12 + headTurnX + eyeTurnX, ny + 7 + headBob, 2, 2);
        ctx.fillRect(nx + 17 + headTurnX + eyeTurnX, ny + 7 + headBob, 2, 2);

        // Fisherman Bucket Hat with colorful feather lures
        ctx.fillStyle = '#ca8a04';
        ctx.fillRect(nx + 7 + headTurnX, ny + 2 + headBob, 17, 3);
        ctx.fillStyle = '#a16207';
        ctx.fillRect(nx + 9 + headTurnX, ny - 1 + headBob, 13, 4);
        // Feather fishing lure on hat
        ctx.fillStyle = '#ec4899';
        ctx.fillRect(nx + 19 + headTurnX, ny + 0 + headBob, 2, 2);

        // Long Fishing Rod leaning toward river (c: 22, 23)
        ctx.fillStyle = '#78350f';
        ctx.fillRect(nx + 18, ny + 10 + idleBob, 10, 2);
        ctx.fillRect(nx + 26, ny + 6 + idleBob, 8, 2);
        ctx.fillRect(nx + 33, ny + 2 + idleBob, 6, 2);

        // Monofilament fishing line dropping into water
        const lineDropY = ny + 28;
        ctx.fillStyle = 'rgba(241, 245, 249, 0.7)';
        ctx.fillRect(nx + 38, ny + 3 + idleBob, 1, lineDropY - (ny + 3 + idleBob));

        // Animated red-and-white bobber floating in water
        const bobberWave = Math.sin(this.tickCount * 0.15) * 2;
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(nx + 37, lineDropY + bobberWave, 3, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(nx + 37, lineDropY + bobberWave + 2, 3, 2);

        // Concentric water ripple rings around bobber
        const rippleR = ((this.tickCount * 0.4) % 10) + 2;
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(nx + 38, lineDropY + bobberWave + 2, rippleR, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }

      case 'spirit_elder': // Nenek Wilis / Sosok Kabut
      default:
        if (npc.isResolved) {
          // Revealed Nenek Wilis in peaceful batik
          ctx.fillStyle = '#831843'; // Selendang
          ctx.fillRect(nx + 8, ny + 12 + idleBob, 16, 14);
          ctx.fillStyle = '#fed7aa'; // Face
          ctx.fillRect(nx + 10 + headTurnX, ny + 5 + headBob, 12, 9);
          ctx.fillStyle = '#94a3b8'; // White hair bun
          ctx.fillRect(nx + 11 + headTurnX, ny + 2 + headBob, 10, 4);

          // Gentle shawl fringe fluttering
          const shawlFlutter = Math.sin(this.tickCount * 0.1) * 1.5;
          ctx.fillStyle = '#9d174d';
          ctx.fillRect(nx + 7, ny + 24 + idleBob + shawlFlutter, 4, 3);
          ctx.fillRect(nx + 21, ny + 24 + idleBob - shawlFlutter, 4, 3);
        } else {
          // Ethereal swirling mist spirit
          const mistWobble1 = Math.sin(this.tickCount * 0.12) * 3;
          const mistWobble2 = Math.cos(this.tickCount * 0.08) * 2;
          ctx.fillStyle = 'rgba(148, 163, 184, 0.75)';
          ctx.beginPath();
          ctx.arc(nx + 16 + mistWobble1, ny + 14 + idleBob + mistWobble2, 14, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = 'rgba(203, 213, 225, 0.45)';
          ctx.beginPath();
          ctx.arc(nx + 16 - mistWobble2, ny + 12 + idleBob - mistWobble1, 10, 0, Math.PI * 2);
          ctx.fill();

          // Mysterious glowing lavender eyes tracking gaze
          ctx.fillStyle = '#c084fc';
          ctx.fillRect(nx + 12 + mistWobble1 + eyeTurnX, ny + 12 + idleBob, 3, 2);
          ctx.fillRect(nx + 18 + mistWobble1 + eyeTurnX, ny + 12 + idleBob, 3, 2);
        }
        break;
    }

    // Name badge / interaction prompt floating above NPC (smoothly bobs with headBob)
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    const displayName = npc.isResolved ? `✨ ${npc.name}` : npc.name;
    const textW = ctx.measureText(displayName).width;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(nx + 16 - textW / 2 - 5, ny - 11 + headBob, textW + 10, 14);
    ctx.strokeStyle = npc.isResolved ? '#22c55e' : '#eab308';
    ctx.lineWidth = 1;
    ctx.strokeRect(nx + 16 - textW / 2 - 5, ny - 11 + headBob, textW + 10, 14);

    ctx.fillStyle = npc.isResolved ? '#4ade80' : '#fef08a';
    ctx.fillText(displayName, nx + 16, ny + headBob);

    // Indikator visual 'tanda tanya' (?) melayang di atas NPC yang belum terselesaikan konfliknya
    if (!npc.isResolved) {
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
  }

  // Draw the Resonance Compass Auras & Deep Emotions
  private drawResonanceAuras(player: Player, npcs: NPC[]) {
    const ctx = this.ctx;
    const px = player.x + 16;
    const py = player.y + 16;

    // Expanding resonance pulse rings
    const pulseRadius = (this.tickCount * 2) % 180;
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(px, py, pulseRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Scan NPCs within resonance radius
    npcs.forEach((npc) => {
      const nx = npc.x * TILE_SIZE + 16;
      const ny = npc.y * TILE_SIZE + 16;
      const dist = Math.hypot(nx - px, ny - py);

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
      p.life++;

      const progress = p.life / p.maxLife;
      const alpha = Math.max(0, 1 - progress);
      const currentSize = p.shrink ? Math.max(1, Math.round(p.size * (1 - progress * 0.4))) : p.size;

      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), currentSize, currentSize);
      ctx.globalAlpha = 1.0;

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

  // Draw gray mist overlay over unrecovered areas
  private drawAtmosphericMist(
    status: ZoneColorStatus,
    w: number,
    h: number,
    camX: number,
    camY: number
  ) {
    const ctx = this.ctx;
    if (status.plaza && status.bridge && status.forest && status.tower) {
      // All zones restored: golden sunshine particles!
      return;
    }

    // Gentle swirling gray fog bands across the screen
    ctx.fillStyle = 'rgba(100, 116, 139, 0.15)';
    const offset = (this.tickCount * 0.5) % 80;
    ctx.fillRect(camX, camY + offset, w, 40);
    ctx.fillRect(camX, camY + offset + 140, w, 30);
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
    const borderColor = isNPC ? '#f59e0b' : '#10b981';
    const textColor = isNPC ? '#fef08a' : '#a7f3d0';
    const icon = isNPC ? '💬' : '🔍';
    const actionLabel = isNPC ? 'Klik Bicara' : 'Klik Periksa';

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

  private drawWaterCurrents(camX: number, camY: number, w: number, h: number, isBridgeClear: boolean) {
    // Extra visual polish on water flow
    const ctx = this.ctx;
    if (isBridgeClear) {
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      const waveX = 22 * TILE_SIZE + Math.sin(this.tickCount * 0.05) * 8;
      ctx.fillRect(waveX, 10 * TILE_SIZE, 6, 40);
      ctx.fillRect(waveX + 10, 18 * TILE_SIZE, 8, 30);
    }
  }
}
