import { TILE } from './constants';

export const MINI_TILE_PX = 6;
export const MINI_MAP_W = 36 * MINI_TILE_PX; // 216px
export const MINI_MAP_H = 28 * MINI_TILE_PX; // 168px

// Pseudo-random deterministic hash based on coordinates
function pseudoRandom(r: number, c: number): number {
  const n = Math.sin(r * 12.9898 + c * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

/**
 * Draws an authentic pixel-art textured tile onto an offscreen canvas.
 * Every tile has detailed pixel shading, highlights, and borders to look like a true classic 2D RPG map.
 */
export function renderTexturedTile(
  ctx: CanvasRenderingContext2D,
  tile: number,
  col: number,
  row: number,
  isBridgeRestored: boolean,
  isTowerRestored: boolean
) {
  const x = col * MINI_TILE_PX;
  const y = row * MINI_TILE_PX;
  const rand = pseudoRandom(row, col);

  switch (tile) {
    // 1. GRASS & VEGETATION
    case TILE.GRASS: {
      // Base meadow green
      ctx.fillStyle = '#166534';
      ctx.fillRect(x, y, 6, 6);

      // Organic grass blade tufts
      ctx.fillStyle = '#22c55e'; // Light blade highlight
      if (rand > 0.6) {
        ctx.fillRect(x + 1, y + 1, 1, 2);
        ctx.fillRect(x + 2, y + 2, 1, 1);
      } else if (rand > 0.3) {
        ctx.fillRect(x + 3, y + 2, 1, 2);
        ctx.fillRect(x + 4, y + 3, 1, 1);
      } else {
        ctx.fillRect(x + 1, y + 3, 1, 2);
      }

      // Darker blade shadow
      ctx.fillStyle = '#14532d';
      ctx.fillRect(x + 4, y + 4, 1, 1);
      if (rand > 0.85) {
        // Occasional tiny wild daisy dot
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(x + 3, y + 1, 1, 1);
      }
      break;
    }

    case TILE.GRASS_FLOWERS:
    case TILE.FLOWER_BED: {
      // Lush grass bed
      ctx.fillStyle = '#15803d';
      ctx.fillRect(x, y, 6, 6);

      // Colorful pixel flower petals
      const flowerColor = rand > 0.66 ? '#f43f5e' : rand > 0.33 ? '#fbbf24' : '#ec4899';
      ctx.fillStyle = flowerColor;
      ctx.fillRect(x + 1, y + 1, 2, 2);
      ctx.fillRect(x + 3, y + 3, 2, 2);

      // Flower centers / stamens
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(x + 2, y + 2, 1, 1);
      ctx.fillRect(x + 4, y + 4, 1, 1);
      break;
    }

    // 2. PATHWAYS & COBBLESTONES
    case TILE.PATH_STONE:
    case TILE.PLAZA_BORDER: {
      // Cobblestone paving with distinct paver bricks and mortar
      ctx.fillStyle = '#475569'; // Base stone
      ctx.fillRect(x, y, 6, 6);

      // Stone block highlights
      ctx.fillStyle = '#64748b';
      ctx.fillRect(x + 1, y + 1, 2, 2);
      ctx.fillRect(x + 3, y + 3, 2, 2);

      // Top-left paver rim light
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(x + 1, y + 1, 1, 1);
      ctx.fillRect(x + 3, y + 3, 1, 1);

      // Dark mortar joints
      ctx.fillStyle = '#334155';
      ctx.fillRect(x, y + 5, 6, 1);
      ctx.fillRect(x + 5, y, 1, 5);
      break;
    }

    case TILE.PLAZA_MOSAIC: {
      // Ornate central plaza mosaic tile
      ctx.fillStyle = '#9a3412'; // Terracotta border
      ctx.fillRect(x, y, 6, 6);

      // Warm golden inner diamond
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(x + 1, y + 1, 4, 4);

      // Center ornamental gem
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(x + 2, y + 2, 2, 2);
      break;
    }

    // 3. RIVER & WATER
    case TILE.WATER:
    case TILE.WATER_DEEP: {
      const isDeep = tile === TILE.WATER_DEEP;
      // Deep flowing azure water
      ctx.fillStyle = isDeep ? '#1e3a8a' : '#2563eb';
      ctx.fillRect(x, y, 6, 6);

      // Horizontal wave gleam pixels
      ctx.fillStyle = '#60a5fa';
      if (row % 2 === 0) {
        ctx.fillRect(x + 1, y + 1, 3, 1);
        ctx.fillRect(x + 2, y + 4, 3, 1);
      } else {
        ctx.fillRect(x, y + 2, 3, 1);
        ctx.fillRect(x + 3, y + 5, 2, 1);
      }

      // Sparkle white foam peak
      ctx.fillStyle = '#e0f2fe';
      if (rand > 0.5) {
        ctx.fillRect(x + 2, y + 1, 1, 1);
      } else {
        ctx.fillRect(x + 4, y + 4, 1, 1);
      }

      // Water directly south of bridge (row 17, col 22..23): Ambient bridge cast shadow on water & pillar bases
      if (row === 17 && (col === 22 || col === 23)) {
        // Bridge cast shadow on water
        ctx.fillStyle = isBridgeRestored ? 'rgba(8, 20, 36, 0.65)' : 'rgba(15, 23, 42, 0.75)';
        ctx.fillRect(x, y, 6, 3);
        // Submerged support pillar base in water
        ctx.fillStyle = isBridgeRestored ? '#78350f' : '#334155';
        ctx.fillRect(x + 2, y, 2, 2);
        // Water wake / foam speck around pillar base
        ctx.fillStyle = '#e0f2fe';
        ctx.fillRect(x + 1, y + 1, 1, 1);
      } else if (row === 13 && (col === 22 || col === 23)) {
        // Water directly north of bridge: North shadow entry
        ctx.fillStyle = isBridgeRestored ? 'rgba(8, 20, 36, 0.55)' : 'rgba(15, 23, 42, 0.70)';
        ctx.fillRect(x, y + 4, 6, 2);
      } else if (row === 11 && (col === 22 || col === 23)) {
        // River Waterfall Top Crest & Cascading Curtain
        ctx.fillStyle = '#334155';
        ctx.fillRect(x, y, 6, 2); // Rock weir shelf
        ctx.fillStyle = isBridgeRestored ? '#38bdf8' : '#475569';
        ctx.fillRect(x, y + 2, 6, 4); // Cascading water body
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 1, y + 2, 2, 4); // Whitewater torrent stream
        ctx.fillRect(x + 4, y + 3, 2, 3);
        if (col === 22) {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(x + 5, y + 3, 2, 2); // Center crag boulder
        }
      } else if (row === 12 && (col === 22 || col === 23)) {
        // River Waterfall Plunge Basin & Churning Foam Pool
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, y, 6, 3); // Churning white impact froth
        ctx.fillStyle = isBridgeRestored ? '#7dd3fc' : '#64748b';
        ctx.fillRect(x + 1, y + 3, 4, 2); // Impact pool ripple
        ctx.fillStyle = isBridgeRestored ? '#0284c7' : '#334155';
        ctx.fillRect(x, y + 5, 6, 1); // Downstream reach
      }
      break;
    }

    // 4. WOODEN BRIDGE
    case TILE.WOOD_BRIDGE: {
      // Weathered brown wood vs radiant restored golden oak planks
      const plankColor = isBridgeRestored ? '#d97706' : '#78350f';
      const plankDark = isBridgeRestored ? '#92400e' : '#451a03';
      const highlightColor = isBridgeRestored ? '#fde047' : '#94a3b8';
      const borderPostColor = isBridgeRestored ? '#451a03' : '#1e293b';
      const stoneCurbColor = isBridgeRestored ? '#94a3b8' : '#475569';

      ctx.fillStyle = plankColor;
      ctx.fillRect(x, y, 6, 6);

      // Vertical bridge wooden planks
      ctx.fillStyle = plankDark;
      ctx.fillRect(x + 1, y, 1, 6);
      ctx.fillRect(x + 3, y, 1, 6);
      ctx.fillRect(x + 5, y, 1, 6);

      // Batas Kiri Jembatan (col 21): Abutment stone curb & entrance boundary post
      if (col === 21) {
        ctx.fillStyle = stoneCurbColor;
        ctx.fillRect(x, y, 1, 6);
        ctx.fillStyle = borderPostColor;
        ctx.fillRect(x + 1, y, 1, 6);
        if (row === 14 || row === 16) {
          // Gatepost finial / lantern
          ctx.fillStyle = isBridgeRestored ? '#fef08a' : '#cbd5e1';
          ctx.fillRect(x, y + (row === 14 ? 0 : 4), 2, 2);
        }
      }

      // Batas Kanan Jembatan (col 24): Abutment stone curb & exit boundary post
      if (col === 24) {
        ctx.fillStyle = borderPostColor;
        ctx.fillRect(x + 4, y, 1, 6);
        ctx.fillStyle = stoneCurbColor;
        ctx.fillRect(x + 5, y, 1, 6);
        if (row === 14 || row === 16) {
          // Gatepost finial / lantern
          ctx.fillStyle = isBridgeRestored ? '#fef08a' : '#cbd5e1';
          ctx.fillRect(x + 4, y + (row === 14 ? 0 : 4), 2, 2);
        }
      }

      // Northern Railing (row 14)
      if (row === 14) {
        ctx.fillStyle = plankDark;
        ctx.fillRect(x, y, 6, 2);
        ctx.fillStyle = highlightColor;
        ctx.fillRect(x, y, 6, 1);
      }

      // Southern Railing & Fascia (row 16)
      if (row === 16) {
        ctx.fillStyle = plankDark;
        ctx.fillRect(x, y + 4, 6, 2);
        ctx.fillStyle = highlightColor;
        ctx.fillRect(x, y + 3, 6, 1);

        // Support pillars in water indication (cols 22 & 23)
        if (col === 22 || col === 23) {
          ctx.fillStyle = '#451a03';
          ctx.fillRect(x + 2, y + 4, 2, 2);
        }
      }
      break;
    }

    // 5. TREES & FORESTRY
    case TILE.TREE_TOP:
    case TILE.FOREST_PINE:
    case TILE.SECRET_TREE: {
      const isSecret = tile === TILE.SECRET_TREE;
      // Canopy dark outline silhouette
      ctx.fillStyle = isSecret ? '#064e3b' : '#022c22';
      ctx.fillRect(x, y, 6, 6);

      // Dense layered foliage crown
      ctx.fillStyle = isSecret ? '#10b981' : '#065f46';
      ctx.fillRect(x + 1, y + 1, 4, 4);

      // Light canopy highlight (sunlit upper left)
      ctx.fillStyle = isSecret ? '#34d399' : '#10b981';
      ctx.fillRect(x + 1, y + 1, 2, 2);
      ctx.fillRect(x + 2, y + 2, 1, 1);

      if (isSecret) {
        // Mystical glowing core
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(x + 2, y + 2, 2, 2);
      }
      break;
    }

    case TILE.TREE_TRUNK: {
      // Grass backdrop with sturdy tree trunk in the center
      ctx.fillStyle = '#166534';
      ctx.fillRect(x, y, 6, 6);

      // Tree trunk bark
      ctx.fillStyle = '#78350f';
      ctx.fillRect(x + 1, y, 4, 5);

      // Wood shadow & root spread
      ctx.fillStyle = '#451a03';
      ctx.fillRect(x + 3, y, 2, 5);
      ctx.fillRect(x, y + 4, 1, 2);
      ctx.fillRect(x + 5, y + 4, 1, 2);
      break;
    }

    // 6. ORCHARD FRUIT TREES
    case TILE.ORCHARD_APPLE:
    case TILE.ORCHARD_ORANGE: {
      const isApple = tile === TILE.ORCHARD_APPLE;
      // Green canopy
      ctx.fillStyle = '#065f46';
      ctx.fillRect(x, y, 6, 6);

      ctx.fillStyle = '#10b981';
      ctx.fillRect(x + 1, y + 1, 4, 4);

      // Bright fruit dots
      ctx.fillStyle = isApple ? '#ef4444' : '#f97316';
      ctx.fillRect(x + 1, y + 2, 2, 2);
      ctx.fillRect(x + 4, y + 3, 1, 1);

      // Fruit shine
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(x + 1, y + 2, 1, 1);
      break;
    }

    // 7. HOUSES & BUILDINGS
    case TILE.HOUSE_ROOF:
    case TILE.FOREST_CABIN_ROOF:
    case TILE.ZEN_ROOF: {
      const isZen = tile === TILE.ZEN_ROOF;
      const isCabin = tile === TILE.FOREST_CABIN_ROOF;

      const roofColor = isZen ? '#0f766e' : isCabin ? '#78350f' : '#c2410c';
      const ridgeColor = isZen ? '#14b8a6' : isCabin ? '#a16207' : '#ea580c';

      ctx.fillStyle = roofColor;
      ctx.fillRect(x, y, 6, 6);

      // Shingle tile horizontal ridges
      ctx.fillStyle = ridgeColor;
      ctx.fillRect(x, y + 1, 6, 1);
      ctx.fillRect(x, y + 4, 6, 1);
      break;
    }

    case TILE.HOUSE_WALL:
    case TILE.FOREST_CABIN_WALL:
    case TILE.ZEN_WALL: {
      const isZen = tile === TILE.ZEN_WALL;
      const isCabin = tile === TILE.FOREST_CABIN_WALL;

      ctx.fillStyle = isZen ? '#b45309' : isCabin ? '#78350f' : '#d97706';
      ctx.fillRect(x, y, 6, 6);

      // Timber framing or brick line
      ctx.fillStyle = '#451a03';
      ctx.fillRect(x + 2, y, 1, 6);
      ctx.fillRect(x, y + 5, 6, 1);
      break;
    }

    case TILE.HOUSE_DOOR:
    case TILE.FOREST_CABIN_DOOR:
    case TILE.ZEN_DOOR: {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(x, y, 6, 6);

      // Door frame
      ctx.fillStyle = '#451a03';
      ctx.fillRect(x + 1, y, 4, 6);

      // Brass door handle
      ctx.fillStyle = '#facc15';
      ctx.fillRect(x + 3, y + 3, 1, 1);
      break;
    }

    case TILE.HOUSE_WINDOW:
    case TILE.FOREST_CABIN_WINDOW:
    case TILE.ZEN_WINDOW: {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(x, y, 6, 6);

      // Glass pane
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(x + 1, y + 1, 4, 4);

      // Window cross grid
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x + 2, y + 1, 1, 4);
      ctx.fillRect(x + 1, y + 2, 4, 1);
      break;
    }

    // 8. TOWER & MONUMENTS
    case TILE.TOWER_WALL: {
      // Stately stone masonry
      ctx.fillStyle = isTowerRestored ? '#475569' : '#334155';
      ctx.fillRect(x, y, 6, 6);

      // Cut stone block mortar
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x, y + 3, 6, 1);
      ctx.fillRect(x + 3, y, 1, 3);
      ctx.fillRect(x + 1, y + 3, 1, 3);

      // Stone block highlight
      ctx.fillStyle = isTowerRestored ? '#cbd5e1' : '#64748b';
      ctx.fillRect(x + 1, y + 1, 1, 1);
      break;
    }

    case TILE.TOWER_ROOF: {
      // Grand Gothic tower roof (purple vs restored gold)
      ctx.fillStyle = isTowerRestored ? '#d97706' : '#581c87';
      ctx.fillRect(x, y, 6, 6);

      ctx.fillStyle = isTowerRestored ? '#fde047' : '#9333ea';
      ctx.fillRect(x + 2, y, 2, 6);
      break;
    }

    case TILE.TOWER_CLOCK: {
      // Castle stone backing
      ctx.fillStyle = '#334155';
      ctx.fillRect(x, y, 6, 6);

      // Giant Golden Clock face dial
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(x + 1, y + 1, 4, 4);

      // Clock center & hands
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x + 2, y + 2, 2, 2);
      ctx.fillRect(x + 2, y + 1, 1, 1); // 12 o'clock hand
      ctx.fillRect(x + 4, y + 2, 1, 1); // 3 o'clock hand
      break;
    }

    case TILE.TOWER_DOOR:
    case TILE.TOWER_WINDOW: {
      ctx.fillStyle = '#334155';
      ctx.fillRect(x, y, 6, 6);

      // Gothic arched opening
      ctx.fillStyle = tile === TILE.TOWER_WINDOW ? '#38bdf8' : '#1e1b4b';
      ctx.fillRect(x + 1, y + 1, 4, 5);
      break;
    }

    // 9. FARMLAND & CROPS
    case TILE.FARMLAND_SOIL: {
      // Tilled furrowed soil
      ctx.fillStyle = '#451a03';
      ctx.fillRect(x, y, 6, 6);

      ctx.fillStyle = '#78350f';
      ctx.fillRect(x, y + 1, 6, 2);
      ctx.fillRect(x, y + 4, 6, 1);
      break;
    }

    case TILE.CROP_CARROT: {
      // Farmland soil
      ctx.fillStyle = '#451a03';
      ctx.fillRect(x, y, 6, 6);

      // Orange carrots poking out
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(x + 1, y + 2, 2, 3);
      ctx.fillRect(x + 4, y + 3, 1, 2);

      // Green leafy carrot tops
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(x + 1, y + 1, 2, 1);
      ctx.fillRect(x + 4, y + 2, 1, 1);
      break;
    }

    case TILE.CROP_CABBAGE: {
      ctx.fillStyle = '#451a03';
      ctx.fillRect(x, y, 6, 6);

      // Round green cabbages
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(x + 1, y + 1, 4, 4);

      ctx.fillStyle = '#86efac';
      ctx.fillRect(x + 2, y + 2, 2, 2);
      break;
    }

    case TILE.CROP_WHEAT:
    case TILE.HAY_BALE: {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(x, y, 6, 6);

      // Golden wheat ears
      ctx.fillStyle = '#eab308';
      ctx.fillRect(x + 1, y + 1, 1, 4);
      ctx.fillRect(x + 3, y, 1, 5);
      ctx.fillRect(x + 4, y + 2, 1, 3);

      ctx.fillStyle = '#fef08a';
      ctx.fillRect(x + 3, y, 1, 2);
      break;
    }

    case TILE.WATER_WELL: {
      // Grass
      ctx.fillStyle = '#166534';
      ctx.fillRect(x, y, 6, 6);

      // Stone circular well
      ctx.fillStyle = '#64748b';
      ctx.fillRect(x + 1, y + 1, 4, 4);

      // Blue water pool
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(x + 2, y + 2, 2, 2);
      break;
    }

    // 10. CLIFFS & BOUNDARIES
    case TILE.CLIFF:
    case TILE.FENCE: {
      // Rugged mountain rock strata
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x, y, 6, 6);

      // Horizontal rock clefts
      ctx.fillStyle = '#334155';
      ctx.fillRect(x, y + 1, 6, 2);
      ctx.fillRect(x, y + 4, 6, 1);

      // Cliff top rim grass
      if (row === 0 || row === 27) {
        ctx.fillStyle = '#166534';
        ctx.fillRect(x, y, 6, 1);
      }
      break;
    }

    // 11. PLAZA FOUNTAIN
    case TILE.FOUNTAIN: {
      // Carved stone square pool masonry rim
      ctx.fillStyle = '#475569';
      ctx.fillRect(x, y, 6, 6);

      // Pebbled pool floor & clear water
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(x + 1, y + 1, 4, 4);

      // Pebbled riverbed specks
      ctx.fillStyle = '#d97706';
      ctx.fillRect(x + 1, y + 3, 1, 1);
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(x + 4, y + 2, 1, 1);

      // Central leaping crystal spray & foam
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 2, y + 2, 2, 2);
      break;
    }

    // 11b. ROAD SIGNPOST
    case TILE.SIGNPOST: {
      // Grass patch
      ctx.fillStyle = '#166534';
      ctx.fillRect(x, y, 6, 6);
      // Dark cobblestone ring & wooden post
      ctx.fillStyle = '#451a03';
      ctx.fillRect(x + 2, y + 2, 2, 4);
      // Directional arrow planks
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(x + 1, y + 1, 4, 1);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(x + 2, y + 3, 3, 1);
      break;
    }

    // 12. PLAZA VEGETATION & ENVIRONMENT
    case TILE.GRAND_OAK: {
      // Majestic Grand Oak Tree canopy & trunk
      ctx.fillStyle = '#14532d';
      ctx.fillRect(x, y, 6, 6);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(x + 1, y + 1, 4, 3);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(x + 2, y + 4, 2, 2);
      break;
    }

    case TILE.PLAZA_PLANTER: {
      // Potted ornamental plant: terracotta pot + green topiary
      ctx.fillStyle = '#b45309';
      ctx.fillRect(x + 1, y + 3, 4, 3);
      ctx.fillStyle = '#15803d';
      ctx.fillRect(x + 1, y, 4, 3);
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(x + 2, y + 1, 2, 1);
      break;
    }

    case TILE.FLOWERING_BUSH: {
      // Flowering bush: lush foliage with pink & violet blossoms
      ctx.fillStyle = '#166534';
      ctx.fillRect(x, y, 6, 6);
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(x + 1, y + 1, 2, 2);
      ctx.fillStyle = '#c084fc';
      ctx.fillRect(x + 3, y + 3, 2, 2);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(x + 4, y + 1, 1, 1);
      break;
    }

    default: {
      // Default grass
      ctx.fillStyle = '#166534';
      ctx.fillRect(x, y, 6, 6);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(x + 2, y + 2, 1, 2);
      break;
    }
  }
}

/**
 * Draws text with a crisp, 1px high-contrast outline for crystal-clear readability
 * over any colorful or textured map background.
 */
export function drawPixelTextWithShadow(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fillColor: string,
  shadowColor = '#000000',
  font = 'bold 9px "Pixelify Sans", sans-serif'
) {
  ctx.save();
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 4-directional 1px black outline for maximum contrast
  ctx.fillStyle = shadowColor;
  ctx.fillText(text, x - 1, y);
  ctx.fillText(text, x + 1, y);
  ctx.fillText(text, x, y - 1);
  ctx.fillText(text, x, y + 1);
  ctx.fillText(text, x - 1, y - 1);
  ctx.fillText(text, x + 1, y + 1);

  // Main text fill
  ctx.fillStyle = fillColor;
  ctx.fillText(text, x, y);
  ctx.restore();
}
