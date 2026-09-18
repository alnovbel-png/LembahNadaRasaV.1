// Free Roam Living World Engine
// Adds vibrant, animated pastoral elements after all zones are restored and during Free Roam mode:
// 1. River Life (Water ripples & school of animated swimming fish)
// 2. Windmill (Rustic stone tower with rotating wooden lattice sail blades)
// 3. Pasture Livestock (Holstein cow, brown calf, and fluffy grazing sheep)
// 4. Farm Birds (Sparrows hopping, pecking in the crops, and perching on fence posts)
// 5. Butterflies (Vibrant colorful butterflies fluttering near orchard fruit trees)
// 6. Environmental Life (Puffy billowing chimney smoke from farmhouse, gardening tools)
// 7. Rich Afternoon Lighting (Warm golden god rays & soft directional ground shadows)
// 8. Swaying grass and wildflowers

import { TILE_SIZE, MAP_COLS, MAP_ROWS } from './constants';

export interface Fish {
  id: number;
  relX: number; // offset relative to school center
  relY: number;
  speed: number;
  phase: number;
  scale: number;
}

export interface Sparrow {
  id: number;
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  isPerched?: boolean;
  hopTimer: number;
  peckTimer: number;
  facingLeft: boolean;
}

export interface Butterfly {
  id: number;
  centerX: number;
  centerY: number;
  radiusX: number;
  radiusY: number;
  speed: number;
  colorType: 'orange' | 'purple' | 'yellow' | 'cyan';
  phase: number;
}

export interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

export class FreeRoamWorld {
  private fishSchool: Fish[] = [
    { id: 1, relX: 0, relY: 0, speed: 0.8, phase: 0, scale: 1.0 },
    { id: 2, relX: -14, relY: -8, speed: 0.9, phase: 1.2, scale: 0.9 },
    { id: 3, relX: 12, relY: -12, speed: 0.75, phase: 2.4, scale: 0.85 },
    { id: 4, relX: -8, relY: 14, speed: 0.85, phase: 3.6, scale: 1.1 },
    { id: 5, relX: 10, relY: 10, speed: 0.95, phase: 4.8, scale: 0.8 },
    { id: 6, relX: -20, relY: 4, speed: 0.7, phase: 0.7, scale: 0.75 },
  ];

  private sparrows: Sparrow[] = [
    // Carrot field sparrow
    { id: 1, x: 4.5 * TILE_SIZE, y: 22.8 * TILE_SIZE, baseX: 4.5 * TILE_SIZE, baseY: 22.8 * TILE_SIZE, hopTimer: 0, peckTimer: 30, facingLeft: true },
    // Near path & scarecrow
    { id: 2, x: 6.2 * TILE_SIZE, y: 23.4 * TILE_SIZE, baseX: 6.2 * TILE_SIZE, baseY: 23.4 * TILE_SIZE, hopTimer: 50, peckTimer: 10, facingLeft: false },
    // Cabbage & wheat border
    { id: 3, x: 9.5 * TILE_SIZE, y: 24.6 * TILE_SIZE, baseX: 9.5 * TILE_SIZE, baseY: 24.6 * TILE_SIZE, hopTimer: 25, peckTimer: 70, facingLeft: true },
    // Golden wheat field sparrow
    { id: 4, x: 12.2 * TILE_SIZE, y: 23.2 * TILE_SIZE, baseX: 12.2 * TILE_SIZE, baseY: 23.2 * TILE_SIZE, hopTimer: 80, peckTimer: 45, facingLeft: false },
    // Fence post percher (col 14, row 21 fence post)
    { id: 5, x: 14.0 * TILE_SIZE + 10, y: 21.0 * TILE_SIZE - 4, baseX: 14.0 * TILE_SIZE + 10, baseY: 21.0 * TILE_SIZE - 4, isPerched: true, hopTimer: 0, peckTimer: 0, facingLeft: true },
    // North garden fence percher
    { id: 6, x: 10.0 * TILE_SIZE + 16, y: 21.0 * TILE_SIZE - 4, baseX: 10.0 * TILE_SIZE + 16, baseY: 21.0 * TILE_SIZE - 4, isPerched: true, hopTimer: 0, peckTimer: 0, facingLeft: false },
  ];

  private butterflies: Butterfly[] = [
    // Orchard apple tree 1 (cols 25..27, rows 23..25)
    { id: 1, centerX: 25.5 * TILE_SIZE, centerY: 23.5 * TILE_SIZE, radiusX: 24, radiusY: 16, speed: 0.035, colorType: 'orange', phase: 0 },
    // Orchard orange tree (cols 26..28, rows 24..26)
    { id: 2, centerX: 27.2 * TILE_SIZE, centerY: 24.5 * TILE_SIZE, radiusX: 28, radiusY: 20, speed: 0.028, colorType: 'purple', phase: 1.8 },
    // Orchard flowerbed (col 30, row 24)
    { id: 3, centerX: 29.5 * TILE_SIZE, centerY: 24.0 * TILE_SIZE, radiusX: 22, radiusY: 14, speed: 0.04, colorType: 'yellow', phase: 3.5 },
    // North-East garden trees (cols 25..27, rows 2..4)
    { id: 4, centerX: 26.5 * TILE_SIZE, centerY: 3.5 * TILE_SIZE, radiusX: 26, radiusY: 18, speed: 0.032, colorType: 'cyan', phase: 0.9 },
    // North-East orchard path
    { id: 5, centerX: 28.0 * TILE_SIZE, centerY: 4.8 * TILE_SIZE, radiusX: 30, radiusY: 15, speed: 0.038, colorType: 'orange', phase: 4.2 },
  ];

  private ripples: Ripple[] = [];
  private rippleSpawnTimer: number = 0;

  // 1. Render all Ground-Level Shadows
  public renderSoftEnvironmentalShadows(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';

    // Windmill base shadow (elongated soft diagonal to down-left)
    const wmX = 16 * TILE_SIZE;
    const wmY = 25 * TILE_SIZE + 16;
    ctx.beginPath();
    ctx.ellipse(wmX - 6, wmY + 4, 34, 14, -0.15, 0, Math.PI * 2);
    ctx.fill();

    // Cows & Sheep ground shadows in pasture
    const cow1X = 16.5 * TILE_SIZE + 16;
    const cow1Y = 2.8 * TILE_SIZE + 24;
    ctx.beginPath();
    ctx.ellipse(cow1X - 4, cow1Y, 22, 9, -0.1, 0, Math.PI * 2);
    ctx.fill();

    const cow2X = 18.2 * TILE_SIZE + 12;
    const cow2Y = 2.3 * TILE_SIZE + 24;
    ctx.beginPath();
    ctx.ellipse(cow2X - 4, cow2Y, 18, 8, -0.1, 0, Math.PI * 2);
    ctx.fill();

    const sheepX = 18.5 * TILE_SIZE + 8;
    const sheepY = 4.8 * TILE_SIZE + 20;
    ctx.beginPath();
    ctx.ellipse(sheepX - 3, sheepY, 15, 7, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // Farm fence soft cast shadows
    ctx.fillRect(2 * TILE_SIZE, 26 * TILE_SIZE + 28, 13 * TILE_SIZE, 4);

    ctx.restore();
  }

  // 2. Render River Life: Fish School & Dynamic Water Ripples
  public renderRiverLife(ctx: CanvasRenderingContext2D, tickCount: number) {
    ctx.save();

    // River fish school center (near Bung Jala's dock at col 22..23, row 19..21)
    const schoolCenterX = 23 * TILE_SIZE + Math.sin(tickCount * 0.015) * 12;
    const schoolCenterY = 20 * TILE_SIZE + 8 + Math.cos(tickCount * 0.02) * 14;

    // Spawn water ripple periodically
    this.rippleSpawnTimer++;
    if (this.rippleSpawnTimer % 28 === 0) {
      const rx = schoolCenterX + (Math.random() - 0.5) * 36;
      const ry = schoolCenterY + (Math.random() - 0.5) * 40;
      this.ripples.push({ x: rx, y: ry, radius: 2, maxRadius: 16, alpha: 0.65 });
    }
    // Bung Jala fishing line ripple
    if (this.rippleSpawnTimer % 45 === 0) {
      this.ripples.push({ x: 22.8 * TILE_SIZE + 18, y: 18.2 * TILE_SIZE + 20, radius: 1, maxRadius: 14, alpha: 0.8 });
    }

    // Update & draw ripples
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const rip = this.ripples[i];
      rip.radius += 0.35;
      rip.alpha -= 0.014;
      if (rip.alpha <= 0 || rip.radius >= rip.maxRadius) {
        this.ripples.splice(i, 1);
        continue;
      }

      ctx.strokeStyle = `rgba(224, 242, 254, ${rip.alpha * 0.6})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(rip.x, rip.y, rip.radius * 1.6, rip.radius * 0.8, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Inner faint ring
      if (rip.radius > 6) {
        ctx.strokeStyle = `rgba(186, 230, 253, ${rip.alpha * 0.35})`;
        ctx.beginPath();
        ctx.ellipse(rip.x, rip.y, (rip.radius - 4) * 1.5, (rip.radius - 4) * 0.7, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Draw Fish School
    for (const fish of this.fishSchool) {
      const fx = schoolCenterX + fish.relX + Math.sin(tickCount * 0.03 * fish.speed + fish.phase) * 6;
      const fy = schoolCenterY + fish.relY + Math.cos(tickCount * 0.025 * fish.speed + fish.phase) * 4;

      // Fish swimming wiggle
      const tailWiggle = Math.sin(tickCount * 0.18 + fish.phase) * 2.5;

      ctx.save();
      ctx.translate(Math.floor(fx), Math.floor(fy));

      // Fish body (swimming upward/leftward slightly angled)
      ctx.rotate(-0.25 + Math.sin(tickCount * 0.04 + fish.phase) * 0.1);

      // Fish shadow in water
      ctx.fillStyle = 'rgba(2, 44, 75, 0.4)';
      ctx.fillRect(-6, 3, 12, 4);

      // Dorsal & dark spine
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(-7, -2, 11, 2);

      // Main silvery blue-cyan body
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-6, -1, 10, 3);
      ctx.fillStyle = '#7dd3fc';
      ctx.fillRect(-4, 0, 7, 2);

      // White belly highlight
      ctx.fillStyle = '#f0f9ff';
      ctx.fillRect(-5, 1, 8, 1);

      // Dark eye
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-6, -1, 1, 1);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-7, -1, 1, 1);

      // Animated tail fin
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(4, Math.floor(-2 + tailWiggle), 3, 2);
      ctx.fillRect(5, Math.floor(0 + tailWiggle), 3, 2);
      ctx.fillRect(4, Math.floor(2 + tailWiggle), 2, 1);

      ctx.restore();
    }

    ctx.restore();
  }

  // 3. Render Windmill (Kincir Angin)
  // Location: col 15..16, row 23..25 (X: 480..544, Y: 736..832)
  public renderWindmill(ctx: CanvasRenderingContext2D, tickCount: number, isColored: boolean) {
    ctx.save();

    const baseX = 15 * TILE_SIZE + 4;
    const baseY = 23 * TILE_SIZE;

    // 1. Stone & Timber Windmill Tower Base (Width: 56px, Height: 78px)
    // Tower lower foundation plinth (sturdy grey cobblestone)
    ctx.fillStyle = isColored ? '#475569' : '#334155';
    ctx.fillRect(baseX + 4, baseY + 60, 48, 22);
    ctx.fillStyle = isColored ? '#64748b' : '#475569';
    ctx.fillRect(baseX + 6, baseY + 62, 44, 18);
    // Foundation stone joints
    ctx.fillStyle = isColored ? '#334155' : '#1e293b';
    ctx.fillRect(baseX + 16, baseY + 62, 2, 18);
    ctx.fillRect(baseX + 30, baseY + 62, 2, 18);
    ctx.fillRect(baseX + 42, baseY + 62, 2, 18);
    ctx.fillRect(baseX + 6, baseY + 70, 44, 2);

    // Tower tapered octagonal body (warm cream/white plaster)
    ctx.fillStyle = isColored ? '#fdf8f0' : '#475569';
    ctx.beginPath();
    ctx.moveTo(baseX + 14, baseY + 18); // top left
    ctx.lineTo(baseX + 42, baseY + 18); // top right
    ctx.lineTo(baseX + 48, baseY + 60); // bottom right
    ctx.lineTo(baseX + 8, baseY + 60);  // bottom left
    ctx.closePath();
    ctx.fill();

    // Tower side bevel shadows for 3D curved depth
    ctx.fillStyle = isColored ? '#e2d8c3' : '#334155';
    ctx.beginPath();
    ctx.moveTo(baseX + 14, baseY + 18);
    ctx.lineTo(baseX + 22, baseY + 18);
    ctx.lineTo(baseX + 18, baseY + 60);
    ctx.lineTo(baseX + 8, baseY + 60);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = isColored ? '#d5c7ab' : '#1e293b';
    ctx.beginPath();
    ctx.moveTo(baseX + 36, baseY + 18);
    ctx.lineTo(baseX + 42, baseY + 18);
    ctx.lineTo(baseX + 48, baseY + 60);
    ctx.lineTo(baseX + 40, baseY + 60);
    ctx.closePath();
    ctx.fill();

    // Horizontal timber reinforcement bands
    ctx.fillStyle = isColored ? '#78350f' : '#1e293b';
    ctx.fillRect(baseX + 11, baseY + 32, 34, 3);
    ctx.fillRect(baseX + 9, baseY + 46, 38, 3);

    // Arched wooden entrance door at bottom
    ctx.fillStyle = isColored ? '#451a03' : '#0f172a';
    ctx.fillRect(baseX + 22, baseY + 58, 12, 24);
    // Door arch curved top
    ctx.fillRect(baseX + 24, baseY + 56, 8, 3);
    // Wooden door planks
    ctx.fillStyle = isColored ? '#92400e' : '#334155';
    ctx.fillRect(baseX + 24, baseY + 60, 4, 20);
    ctx.fillRect(baseX + 29, baseY + 60, 4, 20);
    // Door handle ring
    ctx.fillStyle = isColored ? '#f59e0b' : '#64748b';
    ctx.fillRect(baseX + 24, baseY + 68, 2, 2);

    // Upper mill window with warm lantern glow
    ctx.fillStyle = isColored ? '#78350f' : '#1e293b';
    ctx.fillRect(baseX + 24, baseY + 36, 8, 8);
    ctx.fillStyle = isColored ? '#fef08a' : '#cbd5e1';
    ctx.fillRect(baseX + 25, baseY + 37, 6, 6);
    ctx.fillStyle = isColored ? '#78350f' : '#334155';
    ctx.fillRect(baseX + 27, baseY + 37, 2, 6);
    ctx.fillRect(baseX + 25, baseY + 39, 6, 2);

    // Conical Thatch/Timber Roof Cap (Height: 20px)
    ctx.fillStyle = isColored ? '#92400e' : '#1e293b';
    ctx.beginPath();
    ctx.moveTo(baseX + 28, baseY - 2);   // roof apex
    ctx.lineTo(baseX + 46, baseY + 18);  // roof bottom right
    ctx.lineTo(baseX + 10, baseY + 18);  // roof bottom left
    ctx.closePath();
    ctx.fill();

    // Roof eave overhang trim
    ctx.fillStyle = isColored ? '#78350f' : '#0f172a';
    ctx.fillRect(baseX + 9, baseY + 18, 38, 4);

    // Roof weather finial
    ctx.fillStyle = isColored ? '#f59e0b' : '#64748b';
    ctx.fillRect(baseX + 27, baseY - 7, 2, 6);
    ctx.fillRect(baseX + 26, baseY - 9, 4, 3);

    // 2. Rotating Windmill Sails / Blades (Baling-baling Kincir)
    // Central rotor axle hub
    const hubX = baseX + 28;
    const hubY = baseY + 18;

    const rotationAngle = (tickCount * 0.02) % (Math.PI * 2);

    ctx.save();
    ctx.translate(hubX, hubY);

    // Rotating soft shadow of the blades on the tower face
    ctx.save();
    ctx.rotate(rotationAngle);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
    for (let b = 0; b < 4; b++) {
      ctx.save();
      ctx.rotate((b * Math.PI) / 2);
      ctx.fillRect(-2, 6, 5, 34);
      ctx.fillRect(3, 10, 10, 28);
      ctx.restore();
    }
    ctx.restore();

    // Actual 4 wooden lattice blades
    ctx.rotate(rotationAngle);

    for (let b = 0; b < 4; b++) {
      ctx.save();
      ctx.rotate((b * Math.PI) / 2);

      // Wooden main spar beam
      ctx.fillStyle = isColored ? '#5c2d10' : '#1e293b';
      ctx.fillRect(-2, 4, 4, 38);

      // Sail canvas lattice framework (white cloth on right half of spar)
      ctx.fillStyle = isColored ? '#fef3c7' : '#e2e8f0';
      ctx.fillRect(2, 8, 11, 32);

      // Lattice wooden grid lines
      ctx.fillStyle = isColored ? '#78350f' : '#475569';
      // Vertical divider
      ctx.fillRect(7, 8, 1.5, 32);
      // Horizontal cross struts
      for (let s = 10; s <= 38; s += 6) {
        ctx.fillRect(2, s, 11, 1.5);
      }

      // Outer sail edge border
      ctx.fillStyle = isColored ? '#451a03' : '#0f172a';
      ctx.fillRect(12, 8, 2, 32);
      ctx.fillRect(2, 39, 12, 2);

      ctx.restore();
    }

    // Center iron rotor hub cap
    ctx.fillStyle = isColored ? '#334155' : '#0f172a';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = isColored ? '#fbbf24' : '#94a3b8';
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore(); // end blades transform

    ctx.restore();
  }

  // 4. Render Pasture Livestock: Holstein Cow, Brown Calf, and Fluffy Sheep
  // Location: North pasture meadow (cols 15..18, rows 2..5)
  public renderPastureLivestock(ctx: CanvasRenderingContext2D, tickCount: number) {
    ctx.save();

    // --- A. Holstein Cow (Sapi Perah Putih-Hitam) ---
    // Location: col 16.5, row 2.5 (X: 528, Y: 80)
    const cowX = 16.5 * TILE_SIZE;
    const cowY = 2.5 * TILE_SIZE;

    // Head chew & bob animation
    const chewCycle = (tickCount * 0.06) % 10;
    const isChewing = chewCycle < 6;
    const headBobY = isChewing ? Math.sin(tickCount * 0.25) * 1.5 : 0;
    const tailSwish = Math.sin(tickCount * 0.08) * 3.5;

    // Tail
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(cowX + 2, cowY + 12, 2, 8);
    ctx.fillStyle = '#0f172a'; // Black tail tuft
    ctx.fillRect(cowX + Math.floor(1 + tailSwish), cowY + 18, 3, 4);

    // Sturdy four legs
    ctx.fillStyle = '#0f172a'; // Back legs (shadowed)
    ctx.fillRect(cowX + 6, cowY + 18, 3, 10);
    ctx.fillRect(cowX + 22, cowY + 18, 3, 10);
    // Dark hooves
    ctx.fillStyle = '#334155';
    ctx.fillRect(cowX + 6, cowY + 27, 3, 2);
    ctx.fillRect(cowX + 22, cowY + 27, 3, 2);

    ctx.fillStyle = '#f8fafc'; // Front legs
    ctx.fillRect(cowX + 9, cowY + 19, 3, 9);
    ctx.fillRect(cowX + 25, cowY + 19, 3, 9);
    ctx.fillStyle = '#334155';
    ctx.fillRect(cowX + 9, cowY + 27, 3, 2);
    ctx.fillRect(cowX + 25, cowY + 27, 3, 2);

    // Cow body (white base)
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(cowX + 5, cowY + 8, 24, 13);
    ctx.fillRect(cowX + 7, cowY + 6, 20, 3);

    // Characteristic black patches
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(cowX + 8, cowY + 7, 7, 7);
    ctx.fillRect(cowX + 11, cowY + 13, 5, 5);
    ctx.fillRect(cowX + 19, cowY + 8, 8, 8);
    ctx.fillRect(cowX + 22, cowY + 15, 6, 4);

    // Pink cow udder
    ctx.fillStyle = '#fbcfe8';
    ctx.fillRect(cowX + 9, cowY + 18, 6, 3);

    // Cow head & neck (facing right towards pasture)
    const headX = cowX + 26;
    const headY = cowY + 5 + Math.floor(headBobY);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(headX, headY + 2, 9, 8);
    ctx.fillStyle = '#0f172a'; // Black patch on head
    ctx.fillRect(headX + 2, headY, 5, 5);

    // Small horns
    ctx.fillStyle = '#d97706';
    ctx.fillRect(headX + 1, headY - 2, 2, 3);
    ctx.fillRect(headX + 5, headY - 2, 2, 3);

    // Pink snout & nose
    ctx.fillStyle = '#fbcfe8';
    ctx.fillRect(headX + 7, headY + 4, 4, 5);
    ctx.fillStyle = '#475569';
    ctx.fillRect(headX + 9, headY + 6, 1, 1); // nostril

    // Eye
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(headX + 4, headY + 4, 2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(headX + 4, headY + 4, 1, 1);

    // Soft pink ear
    ctx.fillStyle = '#fbcfe8';
    ctx.fillRect(headX - 1, headY + 2, 2, 4);

    // Grass blade in mouth when chewing
    if (isChewing) {
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(headX + 10, headY + 7, 3, 1);
      ctx.fillRect(headX + 12, headY + 8, 2, 1);
    }

    // --- B. Brown Jersey Cow / Calf (Sapi Cokelat) ---
    // Location: col 18.2, row 2.2 (X: 582, Y: 70)
    const calfX = 18.2 * TILE_SIZE;
    const calfY = 2.2 * TILE_SIZE;

    // Legs
    ctx.fillStyle = '#78350f';
    ctx.fillRect(calfX + 4, calfY + 16, 2, 8);
    ctx.fillRect(calfX + 16, calfY + 16, 2, 8);
    ctx.fillRect(calfX + 7, calfY + 17, 2, 7);
    ctx.fillRect(calfX + 19, calfY + 17, 2, 7);
    ctx.fillStyle = '#292524';
    ctx.fillRect(calfX + 4, calfY + 23, 2, 2);
    ctx.fillRect(calfX + 16, calfY + 23, 2, 2);
    ctx.fillRect(calfX + 7, calfY + 23, 2, 2);
    ctx.fillRect(calfX + 19, calfY + 23, 2, 2);

    // Body (warm caramel brown)
    ctx.fillStyle = '#b45309';
    ctx.fillRect(calfX + 3, calfY + 7, 18, 11);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(calfX + 5, calfY + 5, 14, 4);
    // Cream underbelly
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(calfX + 5, calfY + 15, 12, 3);

    // Little tail
    ctx.fillStyle = '#78350f';
    ctx.fillRect(calfX + 1, calfY + 9, 2, 6);

    // Head
    const calfHeadX = calfX + 18;
    const calfHeadY = calfY + 4;
    ctx.fillStyle = '#b45309';
    ctx.fillRect(calfHeadX, calfHeadY + 2, 7, 7);
    // Cream snout
    ctx.fillStyle = '#fde68a';
    ctx.fillRect(calfHeadX + 5, calfHeadY + 4, 3, 4);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(calfHeadX + 6, calfHeadY + 5, 1, 1);
    // Eye
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(calfHeadX + 2, calfHeadY + 3, 2, 2);
    // Cute ear
    ctx.fillStyle = '#92400e';
    ctx.fillRect(calfHeadX - 1, calfHeadY + 1, 2, 3);

    // --- C. Fluffy White Grazing Sheep (Domba Berbulu Putih) ---
    // Location: col 18.5, row 4.8 (X: 592, Y: 154)
    const sheepX = 18.5 * TILE_SIZE + 4;
    const sheepY = 4.8 * TILE_SIZE + 4;

    const sheepGrazing = Math.sin(tickCount * 0.1) > 0.3;
    const sheepHeadY = sheepGrazing ? sheepY + 8 : sheepY + 4;

    // Four little dark legs
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(sheepX + 4, sheepY + 13, 2, 6);
    ctx.fillRect(sheepX + 8, sheepY + 14, 2, 5);
    ctx.fillRect(sheepX + 14, sheepY + 13, 2, 6);
    ctx.fillRect(sheepX + 18, sheepY + 14, 2, 5);

    // Fluffy cloud-like wool body
    ctx.fillStyle = '#e2e8f0'; // Wool shadow edge
    ctx.fillRect(sheepX + 2, sheepY + 3, 19, 12);
    ctx.fillStyle = '#f8fafc'; // Pure white fleece puffs
    ctx.fillRect(sheepX + 3, sheepY + 1, 16, 12);
    ctx.fillRect(sheepX + 1, sheepY + 4, 20, 8);
    // Soft fleece curl texture
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(sheepX + 6, sheepY + 3, 2, 2);
    ctx.fillRect(sheepX + 12, sheepY + 4, 2, 2);
    ctx.fillRect(sheepX + 9, sheepY + 8, 2, 2);
    ctx.fillRect(sheepX + 16, sheepY + 7, 2, 2);

    // Dark sheep face & ears (facing left towards the grass)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(sheepX - 3, sheepHeadY, 6, 6);
    // Tiny white eye
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(sheepX - 2, sheepHeadY + 1, 1, 1);
    // Cute drooping wool ears
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(sheepX + 1, sheepHeadY + 1, 2, 3);

    // Nibbling grass animation
    if (sheepGrazing) {
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(sheepX - 5, sheepHeadY + 4, 3, 1);
    }

    // --- D. Woodland Spotted Fawn / Deer (Rusa Tutul Hutan) ---
    // Location: col 14.6, row 3.4 (X: 467, Y: 108) - Edge of pine forest & pasture
    const deerX = 14.6 * TILE_SIZE;
    const deerY = 3.4 * TILE_SIZE;

    // Deer ground shadow
    ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
    ctx.beginPath();
    ctx.ellipse(deerX + 11, deerY + 26, 12, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Slender graceful legs
    const deerHeadBob = Math.sin(tickCount * 0.05) * 1.5;
    const deerEarTwitch = Math.sin(tickCount * 0.08);

    // Back legs (in shadow)
    ctx.fillStyle = '#78350f';
    ctx.fillRect(deerX + 4, deerY + 16, 2, 10);
    ctx.fillRect(deerX + 16, deerY + 16, 2, 10);
    ctx.fillStyle = '#1e293b'; // Hooves
    ctx.fillRect(deerX + 4, deerY + 25, 2, 2);
    ctx.fillRect(deerX + 16, deerY + 25, 2, 2);

    // Front legs
    ctx.fillStyle = '#b45309';
    ctx.fillRect(deerX + 7, deerY + 17, 2, 9);
    ctx.fillRect(deerX + 19, deerY + 17, 2, 9);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(deerX + 7, deerY + 25, 2, 2);
    ctx.fillRect(deerX + 19, deerY + 25, 2, 2);

    // Warm golden-chestnut body
    ctx.fillStyle = '#b45309';
    ctx.fillRect(deerX + 3, deerY + 7, 18, 10);
    ctx.fillStyle = '#d97706'; // Sunlight highlight on upper back
    ctx.fillRect(deerX + 5, deerY + 5, 14, 3);
    // Cream chest & underbelly
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(deerX + 6, deerY + 14, 10, 3);
    ctx.fillRect(deerX + 17, deerY + 9, 4, 6);

    // White fawn spots
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(deerX + 6, deerY + 8, 1.5, 1.5);
    ctx.fillRect(deerX + 10, deerY + 7, 1.5, 1.5);
    ctx.fillRect(deerX + 14, deerY + 8, 1.5, 1.5);
    ctx.fillRect(deerX + 8, deerY + 11, 1.5, 1.5);
    ctx.fillRect(deerX + 12, deerY + 11, 1.5, 1.5);

    // Fluffy tail with white underside
    const deerTailWag = Math.sin(tickCount * 0.09) * 2;
    ctx.fillStyle = '#b45309';
    ctx.fillRect(deerX + 1, deerY + 8 + deerTailWag, 3, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(deerX, deerY + 9 + deerTailWag, 2, 3);

    // Slender neck & alert head
    const deerHeadX = deerX + 19;
    const deerHeadY = deerY + 1 + deerHeadBob;
    ctx.fillStyle = '#b45309';
    ctx.fillRect(deerHeadX - 1, deerHeadY + 3, 4, 6); // Neck
    ctx.fillRect(deerHeadX + 1, deerHeadY - 1, 7, 6); // Head
    // Delicate dark snout
    ctx.fillStyle = '#78350f';
    ctx.fillRect(deerHeadX + 6, deerHeadY + 1, 3, 3);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(deerHeadX + 8, deerHeadY + 2, 1.5, 1.5); // Nose
    // Gentle dark eye with white catchlight
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(deerHeadX + 4, deerHeadY, 2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(deerHeadX + 4, deerHeadY, 1, 1);
    // Long alert ears with twitch
    ctx.fillStyle = '#92400e';
    ctx.fillRect(deerHeadX + (deerEarTwitch > 0.3 ? 1 : 2), deerHeadY - 4, 2, 4);
    ctx.fillRect(deerHeadX + 4, deerHeadY - 4, 2, 4);
    ctx.fillStyle = '#fef3c7'; // Inner ear
    ctx.fillRect(deerHeadX + 4, deerHeadY - 3, 1, 2);

    // --- E. Playful Meadow Bunnies (Sepasang Kelinci Lucu) ---
    // Bunny 1: Caramel-white cottontail at col 16.3, row 4.5 (X: 522, Y: 144)
    const b1X = 16.3 * TILE_SIZE;
    const b1Y = 4.5 * TILE_SIZE;
    const b1HopTimer = tickCount % 100;
    const isB1Hopping = b1HopTimer < 14;
    const b1HopY = isB1Hopping ? -Math.sin((b1HopTimer / 14) * Math.PI) * 4 : 0;
    const b1HopX = isB1Hopping ? (b1HopTimer < 7 ? 1 : -1) : 0;

    // Bunny 1 shadow
    ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
    ctx.beginPath();
    ctx.ellipse(b1X + 5 + b1HopX, b1Y + 9, 6, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bunny 1 body
    const b1CurX = b1X + b1HopX;
    const b1CurY = b1Y + b1HopY;
    ctx.fillStyle = '#d97706'; // Warm caramel fur
    ctx.fillRect(b1CurX + 2, b1CurY + 2, 7, 6);
    ctx.fillStyle = '#fef3c7'; // White chest bib
    ctx.fillRect(b1CurX + 6, b1CurY + 4, 3, 4);
    // Little round cotton puff tail
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(b1CurX, b1CurY + 3, 2.5, 2.5);
    // Cute head
    ctx.fillStyle = '#d97706';
    ctx.fillRect(b1CurX + 6, b1CurY, 5, 5);
    // Pink nose
    ctx.fillStyle = '#fda4af';
    ctx.fillRect(b1CurX + 10, b1CurY + 2, 1.5, 1.5);
    // Black shiny eye
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(b1CurX + 8, b1CurY + 1, 1.5, 1.5);
    // Upright tall ears with pink interior
    const earWiggle = Math.sin(tickCount * 0.12) > 0.5 ? 0.5 : 0;
    ctx.fillStyle = '#b45309';
    ctx.fillRect(b1CurX + 6 + earWiggle, b1CurY - 5, 2, 5);
    ctx.fillRect(b1CurX + 8, b1CurY - 5, 2, 5);
    ctx.fillStyle = '#fbcfe8';
    ctx.fillRect(b1CurX + 7 + earWiggle, b1CurY - 4, 1, 3);
    ctx.fillRect(b1CurX + 9, b1CurY - 4, 1, 3);

    // Bunny 2: Soft Silver-Ash Bunny at col 17.3, row 5.2 (X: 554, Y: 166)
    const b2X = 17.3 * TILE_SIZE;
    const b2Y = 5.2 * TILE_SIZE;
    const isChewingClover = (tickCount % 40) < 25;
    const b2ChewOffset = isChewingClover ? Math.sin(tickCount * 0.4) * 0.8 : 0;

    // Bunny 2 shadow
    ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
    ctx.beginPath();
    ctx.ellipse(b2X + 5, b2Y + 8, 6, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bunny 2 body (silver-ash)
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(b2X + 2, b2Y + 2, 7, 5);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(b2X + 1, b2Y + 3, 2, 2); // Tail
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(b2X + 5, b2Y + 3, 3, 4); // Chest
    // Head facing left
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(b2X - 2, b2Y + b2ChewOffset, 5, 5);
    ctx.fillStyle = '#fda4af';
    ctx.fillRect(b2X - 3, b2Y + 2 + b2ChewOffset, 1.5, 1.5); // Nose
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(b2X, b2Y + 1 + b2ChewOffset, 1.5, 1.5); // Eye
    // Floppy ears
    ctx.fillStyle = '#64748b';
    ctx.fillRect(b2X + 1, b2Y - 3, 2, 4);
    ctx.fillRect(b2X + 3, b2Y - 3, 2, 4);
    // Green clover leaf in mouth
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(b2X - 5, b2Y + 3 + b2ChewOffset, 3, 1.5);
    ctx.fillRect(b2X - 6, b2Y + 2 + b2ChewOffset, 2, 2);

    // --- F. Bouncy Baby Lamb (Anak Domba Gemas) ---
    // Location: col 19.4, row 5.1 (X: 620, Y: 163) - next to mother sheep
    const lambX = 19.4 * TILE_SIZE;
    const lambY = 5.1 * TILE_SIZE;
    const lambBounce = Math.abs(Math.sin(tickCount * 0.14)) * 2;
    const lambTailWag = Math.sin(tickCount * 0.22) * 2;

    // Lamb shadow
    ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
    ctx.beginPath();
    ctx.ellipse(lambX + 6, lambY + 11, 7, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Four tiny charcoal legs
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(lambX + 2, lambY + 6 - lambBounce, 1.5, 5 + lambBounce);
    ctx.fillRect(lambX + 5, lambY + 6 - lambBounce, 1.5, 5 + lambBounce);
    ctx.fillRect(lambX + 8, lambY + 6 - lambBounce, 1.5, 5 + lambBounce);
    ctx.fillRect(lambX + 11, lambY + 6 - lambBounce, 1.5, 5 + lambBounce);

    // Fluffy cloud wool body
    const lambCurY = lambY - lambBounce;
    ctx.fillStyle = '#e2e8f0'; // Wool shadow edge
    ctx.fillRect(lambX + 1, lambCurY + 1, 12, 7);
    ctx.fillStyle = '#f8fafc'; // Pure white fleece
    ctx.fillRect(lambX + 2, lambCurY, 10, 7);
    ctx.fillRect(lambX + 1, lambCurY + 2, 12, 4);

    // Tiny wagging wool tail
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(lambX + 12, lambCurY + 2 + lambTailWag, 2, 2);

    // Charcoal lamb face facing left
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(lambX - 2, lambCurY + 1, 4, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(lambX - 1, lambCurY + 2, 1, 1); // Eye
    // Drooping cute wool ear
    ctx.fillStyle = '#334155';
    ctx.fillRect(lambX + 1, lambCurY + 1, 1.5, 2.5);

    // --- G. Woodland Bushy-Tailed Squirrel (Tupai Hutan) ---
    // Location: col 14.8, row 1.8 (X: 474, Y: 58) - Perched on fence border near pine woods
    const sqX = 14.8 * TILE_SIZE;
    const sqY = 1.8 * TILE_SIZE;
    const sqTailWave = Math.sin(tickCount * 0.12) * 2;
    const isNibblingNut = Math.sin(tickCount * 0.28) > 0;

    // Squirrel body
    ctx.fillStyle = '#c2410c'; // Auburn coat
    ctx.fillRect(sqX + 3, sqY + 4, 5, 6);
    ctx.fillStyle = '#ffedd5'; // Cream belly
    ctx.fillRect(sqX + 6, sqY + 5, 2, 4);

    // Magnificent bushy tail curling up
    ctx.fillStyle = '#9a3412';
    ctx.fillRect(sqX + 1, sqY + 2 + sqTailWave, 3, 7);
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(sqX - 1, sqY - 3 + sqTailWave, 4, 6);
    ctx.fillRect(sqX, sqY - 5 + sqTailWave, 3, 3);
    ctx.fillStyle = '#fdba74'; // Soft tip
    ctx.fillRect(sqX + 1, sqY - 6 + sqTailWave, 2, 2);

    // Head
    ctx.fillStyle = '#c2410c';
    ctx.fillRect(sqX + 6, sqY + 2, 4, 4);
    // Pointed ears
    ctx.fillStyle = '#9a3412';
    ctx.fillRect(sqX + 6, sqY, 1.5, 2);
    ctx.fillRect(sqX + 8, sqY, 1.5, 2);
    // Dark sparkling eye
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(sqX + 8, sqY + 3, 1, 1);

    // Little front paws holding golden acorn
    ctx.fillStyle = '#78350f'; // Acorn cap
    ctx.fillRect(sqX + 9, sqY + 4 + (isNibblingNut ? 0.5 : 0), 2, 1);
    ctx.fillStyle = '#f59e0b'; // Acorn nut
    ctx.fillRect(sqX + 9, sqY + 5 + (isNibblingNut ? 0.5 : 0), 2, 2);
    ctx.fillStyle = '#ea580c'; // Paws
    ctx.fillRect(sqX + 8, sqY + 5, 1.5, 1.5);

    ctx.restore();
  }

  // 5. Render Farm Birds (Sparrows / Burung Pipit)
  // Location: in carrot/wheat plots and perching on farm fences
  public renderFarmBirds(ctx: CanvasRenderingContext2D, tickCount: number) {
    ctx.save();

    for (const bird of this.sparrows) {
      // Update bird state
      if (!bird.isPerched) {
        bird.hopTimer++;
        if (bird.hopTimer > 120) {
          // Trigger hopping
          const hopStep = (bird.hopTimer - 120);
          if (hopStep < 18) {
            bird.y = bird.baseY - Math.sin((hopStep / 18) * Math.PI) * 5;
            bird.x += (bird.facingLeft ? -0.4 : 0.4);
          } else {
            bird.baseX = bird.x;
            bird.hopTimer = 0;
            if (Math.random() < 0.4) bird.facingLeft = !bird.facingLeft;
            // Prevent wandering out of crop field
            if (bird.x < 3.5 * TILE_SIZE) { bird.x = 3.5 * TILE_SIZE; bird.facingLeft = false; }
            if (bird.x > 13.5 * TILE_SIZE) { bird.x = 13.5 * TILE_SIZE; bird.facingLeft = true; }
          }
        }

        bird.peckTimer++;
      }

      const bx = Math.floor(bird.x);
      const by = Math.floor(bird.y);

      // Sparrow ground shadow
      ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
      ctx.fillRect(bx - 3, Math.floor(bird.baseY) + 5, 8, 2);

      // Bird body
      ctx.save();
      ctx.translate(bx, by);
      if (bird.facingLeft) {
        ctx.scale(-1, 1);
      }

      // Pecking angle
      const isPecking = !bird.isPerched && (bird.peckTimer % 75 < 15);
      const headOffset = isPecking ? 2 : 0;

      // Tail feathers
      ctx.fillStyle = '#451a03';
      ctx.fillRect(-6, -1, 3, 2);

      // Brown back & wings
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-4, -4, 7, 5);
      ctx.fillStyle = '#92400e';
      ctx.fillRect(-2, -3, 4, 3);

      // Creamy chest & belly
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(0, -1, 3, 3);

      // Head
      ctx.fillStyle = '#78350f';
      ctx.fillRect(1, -6 + headOffset, 4, 4);

      // Eye
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(3, -5 + headOffset, 1, 1);

      // Amber/yellow beak
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(5, -4 + headOffset, 2, 1);

      // Tiny feet
      ctx.fillStyle = '#451a03';
      ctx.fillRect(-1, 1, 1, 3);
      ctx.fillRect(2, 1, 1, 3);

      // Wing flutter if perched
      if (bird.isPerched && tickCount % 90 < 12) {
        ctx.fillStyle = '#b45309';
        ctx.fillRect(-3, -7, 4, 3);
      }

      ctx.restore();
    }

    ctx.restore();
  }

  // 6. Render Butterflies (Kupu-kupu Berterbangan)
  // Location: around orchard fruit trees (cols 25..28, rows 22..26)
  public renderButterflies(ctx: CanvasRenderingContext2D, tickCount: number) {
    ctx.save();

    for (const b of this.butterflies) {
      const angle = tickCount * b.speed + b.phase;
      // Figure-8 / sinusoidal gentle fluttering path
      const bx = b.centerX + Math.cos(angle) * b.radiusX;
      const by = b.centerY + Math.sin(angle * 2) * b.radiusY;

      // Wing flapping animation (scale X between 0.15 and 1.0)
      const flapScale = Math.abs(Math.cos(tickCount * 0.28 + b.phase));

      ctx.save();
      ctx.translate(Math.floor(bx), Math.floor(by));

      // Butterfly gentle shadow
      ctx.fillStyle = 'rgba(15, 23, 42, 0.18)';
      ctx.fillRect(-2, 16, 5, 2);

      // Dark butterfly body & antennae
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-0.5, -2, 1, 6);
      ctx.fillRect(-1.5, -4, 1, 2);
      ctx.fillRect(1.5, -4, 1, 2);

      // Wing colors
      let wingColor = '#f97316';
      let wingAccent = '#fed7aa';
      if (b.colorType === 'purple') {
        wingColor = '#a855f7';
        wingAccent = '#e9d5ff';
      } else if (b.colorType === 'yellow') {
        wingColor = '#facc15';
        wingAccent = '#fef08a';
      } else if (b.colorType === 'cyan') {
        wingColor = '#06b6d4';
        wingAccent = '#cffafe';
      }

      // Left wing
      ctx.save();
      ctx.scale(flapScale, 1);
      ctx.fillStyle = wingColor;
      ctx.fillRect(-5, -4, 4, 4);
      ctx.fillRect(-4, 0, 3, 3);
      ctx.fillStyle = wingAccent;
      ctx.fillRect(-4, -3, 2, 2);
      ctx.restore();

      // Right wing
      ctx.save();
      ctx.scale(-flapScale, 1);
      ctx.fillStyle = wingColor;
      ctx.fillRect(-5, -4, 4, 4);
      ctx.fillRect(-4, 0, 3, 3);
      ctx.fillStyle = wingAccent;
      ctx.fillRect(-4, -3, 2, 2);
      ctx.restore();

      ctx.restore();
    }

    ctx.restore();
  }

  // 7. Render Puffy Chimney Smoke Billows from Farmhouse
  // Location: col 3, row 18 (X: 118, Y: 566)
  public renderChimneySmoke(ctx: CanvasRenderingContext2D, tickCount: number) {
    ctx.save();

    const chimneyX = 3 * TILE_SIZE + 22;
    const chimneyY = 18 * TILE_SIZE - 10;

    // Billowing smoke cloud sequence (6 expanding rounded pixel puffs)
    const smokeCount = 7;
    for (let i = 0; i < smokeCount; i++) {
      const progress = ((tickCount * 0.025 + (i / smokeCount) * 2.5) % 2.5) / 2.5;

      // Rising with gentle sinusoidal wind sway to the right
      const sway = Math.sin(progress * Math.PI * 2.5) * 8 + progress * 16;
      const sx = chimneyX + sway;
      const sy = chimneyY - progress * 48;

      // Size grows as it rises (from 3px to 14px)
      const radius = 3 + Math.floor(progress * 11);
      const alpha = Math.sin(progress * Math.PI) * 0.75; // fade in then fade out

      // Draw soft cloud puff cluster
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
      ctx.beginPath();
      ctx.arc(sx, sy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Outer fluff
      ctx.fillStyle = `rgba(226, 232, 240, ${alpha * 0.5})`;
      ctx.beginPath();
      ctx.arc(sx - radius * 0.4, sy + radius * 0.2, radius * 0.7, 0, Math.PI * 2);
      ctx.arc(sx + radius * 0.4, sy - radius * 0.2, radius * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // 8. Render Gardening Tools along Farm Fences
  // Showing active agricultural life: hoes, shovels, pitchfork, hay bales
  public renderGardeningTools(ctx: CanvasRenderingContext2D) {
    ctx.save();

    // --- A. Shovel & Hoe leaning on West Fence (col 2, rows 23..24) ---
    // Hoe (Cangkul) leaning on fence (col 2, row 24, X: 76, Y: 778)
    const hoeX = 2 * TILE_SIZE + 12;
    const hoeY = 24 * TILE_SIZE + 8;
    // Wooden shaft
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(hoeX - 4, hoeY + 16);
    ctx.lineTo(hoeX + 2, hoeY - 4);
    ctx.stroke();
    // Metal blade
    ctx.fillStyle = '#64748b';
    ctx.fillRect(hoeX + 2, hoeY - 6, 6, 3);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(hoeX + 3, hoeY - 5, 4, 1);

    // Shovel (Sekop) stuck in ground near fence (col 2, row 23, X: 78, Y: 746)
    const shovX = 2 * TILE_SIZE + 16;
    const shovY = 23 * TILE_SIZE + 12;
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(shovX, shovY + 14);
    ctx.lineTo(shovX - 1, shovY - 4);
    ctx.stroke();
    // Shovel D-handle top
    ctx.fillStyle = '#451a03';
    ctx.fillRect(shovX - 3, shovY - 6, 5, 2);
    // Curved metal spade head
    ctx.fillStyle = '#475569';
    ctx.fillRect(shovX - 3, shovY + 10, 6, 7);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(shovX - 2, shovY + 11, 4, 4);

    // --- B. Pitchfork (Garpu Rumput) on East Fence near Wheat (col 14, row 24) ---
    const forkX = 14 * TILE_SIZE + 6;
    const forkY = 24 * TILE_SIZE + 10;
    // Shaft
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(forkX + 2, forkY + 16);
    ctx.lineTo(forkX - 2, forkY - 6);
    ctx.stroke();
    // 3 Steel Tines
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(forkX - 5, forkY - 9, 8, 2);
    ctx.fillRect(forkX - 5, forkY - 14, 1.5, 6);
    ctx.fillRect(forkX - 1, forkY - 14, 1.5, 6);
    ctx.fillRect(forkX + 2, forkY - 14, 1.5, 6);

    // --- C. Second Spade on East Fence (col 14, row 22) ---
    const shov2X = 14 * TILE_SIZE + 8;
    const shov2Y = 22 * TILE_SIZE + 8;
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(shov2X, shov2Y + 14);
    ctx.lineTo(shov2X + 2, shov2Y - 4);
    ctx.stroke();
    ctx.fillStyle = '#64748b';
    ctx.fillRect(shov2X - 2, shov2Y + 10, 5, 6);

    ctx.restore();
  }

  // 9. Render Rich Golden Afternoon Sunlight & Volumetric God Rays
  // Statically anchored to the world environment (does NOT follow the player or camera)
  public renderGoldenAfternoonSunlight(
    ctx: CanvasRenderingContext2D,
    tickCount: number
  ) {
    ctx.save();

    const worldW = MAP_COLS * TILE_SIZE;
    const worldH = MAP_ROWS * TILE_SIZE;

    // 1. Soft warm afternoon ambient color grading anchored statically across the world map
    const ambientGrad = ctx.createLinearGradient(worldW, 0, 0, worldH);
    ambientGrad.addColorStop(0, 'rgba(251, 191, 36, 0.055)');
    ambientGrad.addColorStop(0.5, 'rgba(251, 191, 36, 0.035)');
    ambientGrad.addColorStop(1, 'rgba(245, 158, 11, 0.02)');

    ctx.fillStyle = ambientGrad;
    ctx.fillRect(0, 0, worldW, worldH);

    // 2. Stationary Diagonal Golden God Rays (Sunbeams) anchored to fixed world landmarks
    // Streaming down-left from the north-eastern sky across the peaceful valley
    const sunbeamPulse = Math.sin(tickCount * 0.02) * 0.025 + 0.11;

    // Fixed ray origins and paths across the world coordinates
    const fixedRays = [
      { originX: 1160, originY: -40, width: 85, slopeX: -360, length: 820 }, // Eastern orchards & Bell Tower
      { originX: 960,  originY: -50, width: 95, slopeX: -380, length: 880 }, // Pasture livestock & River Bridge
      { originX: 770,  originY: -40, width: 90, slopeX: -390, length: 900 }, // Riverbank & fishing dock
      { originX: 580,  originY: -50, width: 105, slopeX: -390, length: 860 }, // Harmony Plaza & Fountain
      { originX: 400,  originY: -40, width: 95, slopeX: -370, length: 840 }, // Rustic Windmill & Golden Wheat Field
      { originX: 220,  originY: -40, width: 85, slopeX: -350, length: 780 }, // Sacred Ancient Oak & West Cottage
    ];

    for (let i = 0; i < fixedRays.length; i++) {
      const ray = fixedRays[i];
      // Subtle organic breathing wobble in width/intensity without shifting ray world position
      const shimmer = Math.sin(tickCount * 0.018 + i * 1.5) * 6;
      const ox = ray.originX;
      const oy = ray.originY;
      const rw = ray.width + shimmer;
      const dx = ray.slopeX;
      const dy = ray.length;

      const grad = ctx.createLinearGradient(ox, oy, ox + dx, oy + dy);
      grad.addColorStop(0, `rgba(254, 240, 138, ${sunbeamPulse * 1.35})`);
      grad.addColorStop(0.45, `rgba(251, 191, 36, ${sunbeamPulse * 0.75})`);
      grad.addColorStop(1, 'rgba(251, 191, 36, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox + rw, oy);
      ctx.lineTo(ox + rw + dx, oy + dy);
      ctx.lineTo(ox + dx, oy + dy);
      ctx.closePath();
      ctx.fill();
    }

    // 3. Ambient Golden Dust Motes floating within fixed world areas
    const worldMotes = [
      // Harmony Plaza & Mosaic
      { x: 490, y: 410 }, { x: 530, y: 390 }, { x: 440, y: 450 }, { x: 580, y: 430 },
      // Wheat field & Windmill
      { x: 260, y: 710 }, { x: 330, y: 670 }, { x: 390, y: 740 }, { x: 200, y: 640 },
      // Pasture & Livestock
      { x: 590, y: 150 }, { x: 650, y: 120 }, { x: 530, y: 170 },
      // River & Fishing Pier
      { x: 750, y: 510 }, { x: 810, y: 470 }, { x: 720, y: 590 },
      // Clock Tower & Eastern Grove
      { x: 930, y: 230 }, { x: 990, y: 190 }, { x: 890, y: 290 }, { x: 960, y: 690 },
      // Ancient Sacred Tree
      { x: 170, y: 210 }, { x: 230, y: 170 }, { x: 140, y: 270 },
    ];

    for (let m = 0; m < worldMotes.length; m++) {
      const mote = worldMotes[m];
      const driftX = Math.sin(tickCount * 0.02 + m * 1.2) * 8;
      const driftY = ((tickCount * 0.12 + m * 15) % 36) - 18;
      const alpha = Math.sin(tickCount * 0.04 + m) * 0.35 + 0.45;

      ctx.fillStyle = `rgba(254, 243, 199, ${alpha * 0.6})`;
      ctx.fillRect(Math.floor(mote.x + driftX), Math.floor(mote.y - driftY), 2, 2);
    }

    ctx.restore();
  }

  // 10. Check hover for Free Roam interactive elements
  public getInteractiveHover(
    worldX: number,
    worldY: number
  ): { type: string; name: string; x: number; y: number } | null {
    // 1. Windmill
    const wmX = 16 * TILE_SIZE;
    const wmY = 24 * TILE_SIZE + 16;
    if (Math.hypot(wmX - worldX, wmY - worldY) < 38) {
      return {
        type: 'windmill',
        name: 'Kincir Angin Harmoni',
        x: wmX,
        y: wmY - 20,
      };
    }

    // 2. Holstein Cow
    const cowX = 16.5 * TILE_SIZE + 16;
    const cowY = 2.8 * TILE_SIZE + 16;
    if (Math.hypot(cowX - worldX, cowY - worldY) < 28) {
      return {
        type: 'animal',
        name: 'Sapi Padang Rumput',
        x: cowX,
        y: cowY - 14,
      };
    }

    // 3. Fluffy Sheep
    const sheepX = 18.5 * TILE_SIZE + 8;
    const sheepY = 4.8 * TILE_SIZE + 12;
    if (Math.hypot(sheepX - worldX, sheepY - worldY) < 24) {
      return {
        type: 'animal',
        name: 'Domba Wol Lembut',
        x: sheepX,
        y: sheepY - 12,
      };
    }

    // 4. Fish School in River
    const fishX = 23 * TILE_SIZE;
    const fishY = 20 * TILE_SIZE;
    if (Math.hypot(fishX - worldX, fishY - worldY) < 32) {
      return {
        type: 'river',
        name: 'Sekumpulan Ikan Sungai',
        x: fishX,
        y: fishY - 16,
      };
    }

    // 5. Woodland Spotted Fawn / Deer (c=14.6, r=3.4)
    const deerX = 14.6 * TILE_SIZE + 12;
    const deerY = 3.4 * TILE_SIZE + 14;
    if (Math.hypot(deerX - worldX, deerY - worldY) < 26) {
      return {
        type: 'animal',
        name: 'Rusa Tutul Hutan',
        x: deerX,
        y: deerY - 16,
      };
    }

    // 6. Meadow Bunnies (c=16.3, r=4.5)
    const bunnyX = 16.3 * TILE_SIZE + 8;
    const bunnyY = 4.5 * TILE_SIZE + 6;
    if (Math.hypot(bunnyX - worldX, bunnyY - worldY) < 22) {
      return {
        type: 'animal',
        name: 'Kelinci Padang Rumput',
        x: bunnyX,
        y: bunnyY - 12,
      };
    }

    // 7. Bouncy Baby Lamb (c=19.4, r=5.1)
    const lambX = 19.4 * TILE_SIZE + 6;
    const lambY = 5.1 * TILE_SIZE + 6;
    if (Math.hypot(lambX - worldX, lambY - worldY) < 20) {
      return {
        type: 'animal',
        name: 'Anak Domba Gemas',
        x: lambX,
        y: lambY - 12,
      };
    }

    // 8. Woodland Acorn Squirrel (c=14.8, r=1.8)
    const sqX = 14.8 * TILE_SIZE + 6;
    const sqY = 1.8 * TILE_SIZE + 6;
    if (Math.hypot(sqX - worldX, sqY - worldY) < 20) {
      return {
        type: 'animal',
        name: 'Tupai Hutan',
        x: sqX,
        y: sqY - 12,
      };
    }

    return null;
  }
}

export const freeRoamWorld = new FreeRoamWorld();
