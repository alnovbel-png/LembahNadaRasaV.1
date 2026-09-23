import { TILE_SIZE, MAP_COLS, MAP_ROWS } from './constants';

export interface PathWaypoint {
  x: number;
  y: number;
  col: number;
  row: number;
}

export interface FindTilePathOptions {
  maxIterations?: number;
  /** Callback to identify decorative/nature tiles that can be bypassed if strict path is blocked */
  isDecorative?: (col: number, row: number) => boolean;
  /** Whether to allow dynamically bypassing decorative obstacles if no clear path exists (default: true) */
  allowDecorativeBypass?: boolean;
  /** Added movement cost when traversing decorative tiles so clear paths are preferred (default: 4) */
  decorativeCost?: number;
}

interface Node {
  c: number;
  r: number;
  g: number;
  h: number;
  f: number;
  parent: Node | null;
}

const CANDIDATE_OFFSETS = [
  { dc: 0, dr: 1 },   // South (front/below)
  { dc: 1, dr: 0 },   // East (right)
  { dc: -1, dr: 0 },  // West (left)
  { dc: 0, dr: -1 },  // North (above)
  { dc: 1, dr: 1 },
  { dc: -1, dr: 1 },
  { dc: 1, dr: -1 },
  { dc: -1, dr: -1 },
  { dc: 0, dr: 2 },
  { dc: 2, dr: 0 },
  { dc: -2, dr: 0 },
  { dc: 0, dr: -2 },
  { dc: 1, dr: 2 },
  { dc: -1, dr: 2 },
  { dc: 2, dr: 1 },
  { dc: -2, dr: 1 },
];

const DIRECTIONS = [
  { dc: 0, dr: -1 }, // Up
  { dc: 0, dr: 1 },  // Down
  { dc: -1, dr: 0 }, // Left
  { dc: 1, dr: 0 },  // Right
];

/**
 * A* Grid Pathfinding for Lembah Nada Rasa.
 * Supports a two-phase search:
 * 1. Strict collision-free path (zero obstacle overlap).
 * 2. Dynamic decorative bypass (if strict path is blocked by trees/plants, routes through with penalty cost).
 */
export function findTilePath(
  startCol: number,
  startRow: number,
  targetCol: number,
  targetRow: number,
  isPassable: (col: number, row: number) => boolean,
  optionsOrMaxIterations?: number | FindTilePathOptions
): PathWaypoint[] {
  const clampCol = (c: number) => Math.max(0, Math.min(MAP_COLS - 1, c));
  const clampRow = (r: number) => Math.max(0, Math.min(MAP_ROWS - 1, r));

  const sC = clampCol(startCol);
  const sR = clampRow(startRow);
  const origTC = clampCol(targetCol);
  const origTR = clampRow(targetRow);

  // Parse options
  let maxIterations = 2500;
  let isDecorative: ((c: number, r: number) => boolean) | undefined;
  let allowDecorativeBypass = true;
  let decorativeCost = 4;

  if (typeof optionsOrMaxIterations === 'number') {
    maxIterations = optionsOrMaxIterations;
    allowDecorativeBypass = false;
  } else if (optionsOrMaxIterations) {
    if (optionsOrMaxIterations.maxIterations !== undefined) {
      maxIterations = optionsOrMaxIterations.maxIterations;
    }
    isDecorative = optionsOrMaxIterations.isDecorative;
    if (optionsOrMaxIterations.allowDecorativeBypass !== undefined) {
      allowDecorativeBypass = optionsOrMaxIterations.allowDecorativeBypass;
    }
    if (optionsOrMaxIterations.decorativeCost !== undefined) {
      decorativeCost = optionsOrMaxIterations.decorativeCost;
    }
  }

  // --- PHASE 1: Try strict pathfinding (strict collision-free open road) ---
  const strictPath = runAStarSearch(
    sC,
    sR,
    origTC,
    origTR,
    isPassable,
    undefined,
    maxIterations,
    decorativeCost,
    clampCol,
    clampRow
  );

  if (strictPath.length > 0) {
    return strictPath;
  }

  // If already at target tile
  if (sC === origTC && sR === origTR) {
    return [
      {
        x: origTC * TILE_SIZE + 16,
        y: origTR * TILE_SIZE + 16,
        col: origTC,
        row: origTR,
      },
    ];
  }

  // --- PHASE 2: Dynamic Decorative Bypass ---
  // If strict path is blocked by trees or foliage on the way to the mission NPC,
  // allow dynamically routing through decorative obstacles with higher movement cost.
  if (allowDecorativeBypass && isDecorative) {
    const bypassPath = runAStarSearch(
      sC,
      sR,
      origTC,
      origTR,
      isPassable,
      isDecorative,
      maxIterations,
      decorativeCost,
      clampCol,
      clampRow
    );

    if (bypassPath.length > 0) {
      return bypassPath;
    }
  }

  return [];
}

/**
 * Internal A* search execution
 */
function runAStarSearch(
  sC: number,
  sR: number,
  targetCol: number,
  targetRow: number,
  isPassable: (c: number, r: number) => boolean,
  isDecorative: ((c: number, r: number) => boolean) | undefined,
  maxIterations: number,
  decorativeCost: number,
  clampCol: (c: number) => number,
  clampRow: (r: number) => number
): PathWaypoint[] {
  let tC = targetCol;
  let tR = targetRow;

  const isTileWalkable = (c: number, r: number): boolean => {
    if (isPassable(c, r)) return true;
    if (isDecorative && isDecorative(c, r)) return true;
    return false;
  };

  // If target tile itself is not walkable (e.g. tree trunk or exact NPC tile),
  // find the closest candidate adjacent neighbor!
  if (!isTileWalkable(tC, tR)) {
    let foundAlt = false;

    // 1. Prefer strictly passable neighbor
    for (const offset of CANDIDATE_OFFSETS) {
      const altC = clampCol(tC + offset.dc);
      const altR = clampRow(tR + offset.dr);
      if (isPassable(altC, altR)) {
        tC = altC;
        tR = altR;
        foundAlt = true;
        break;
      }
    }

    // 2. If no strictly passable neighbor and decorative bypass enabled, accept decorative neighbor
    if (!foundAlt && isDecorative) {
      for (const offset of CANDIDATE_OFFSETS) {
        const altC = clampCol(tC + offset.dc);
        const altR = clampRow(tR + offset.dr);
        if (isDecorative(altC, altR)) {
          tC = altC;
          tR = altR;
          foundAlt = true;
          break;
        }
      }
    }

    if (!foundAlt) {
      return [];
    }
  }

  if (sC === tC && sR === tR) {
    return [
      {
        x: tC * TILE_SIZE + 16,
        y: tR * TILE_SIZE + 16,
        col: tC,
        row: tR,
      },
    ];
  }

  const getKey = (c: number, r: number) => `${c},${r}`;
  const heuristic = (c: number, r: number) => Math.abs(c - tC) + Math.abs(r - tR);

  const openList: Node[] = [];
  const openMap = new Map<string, Node>();
  const closedSet = new Set<string>();

  const startNode: Node = {
    c: sC,
    r: sR,
    g: 0,
    h: heuristic(sC, sR),
    f: heuristic(sC, sR),
    parent: null,
  };

  openList.push(startNode);
  openMap.set(getKey(sC, sR), startNode);

  let iterations = 0;
  let reachedNode: Node | null = null;

  while (openList.length > 0 && iterations < maxIterations) {
    iterations++;

    // Find node with smallest f in openList
    let bestIdx = 0;
    for (let i = 1; i < openList.length; i++) {
      if (openList[i].f < openList[bestIdx].f) {
        bestIdx = i;
      }
    }

    const current = openList.splice(bestIdx, 1)[0];
    const currKey = getKey(current.c, current.r);
    openMap.delete(currKey);
    closedSet.add(currKey);

    // Goal reached?
    if (current.c === tC && current.r === tR) {
      reachedNode = current;
      break;
    }

    for (const dir of DIRECTIONS) {
      const nextC = current.c + dir.dc;
      const nextR = current.r + dir.dr;

      if (nextC < 0 || nextC >= MAP_COLS || nextR < 0 || nextR >= MAP_ROWS) {
        continue;
      }

      const nextKey = getKey(nextC, nextR);
      if (closedSet.has(nextKey)) {
        continue;
      }

      // Check walkability and determine step cost
      let stepCost = 1;
      if (isPassable(nextC, nextR)) {
        stepCost = 1;
      } else if (isDecorative && isDecorative(nextC, nextR)) {
        // Traversable with penalty cost to prioritize clear open roads
        stepCost = decorativeCost;
      } else {
        // Impassable wall/water/cliff
        continue;
      }

      const tentativeG = current.g + stepCost;
      const existing = openMap.get(nextKey);

      if (!existing) {
        const h = heuristic(nextC, nextR);
        const neighborNode: Node = {
          c: nextC,
          r: nextR,
          g: tentativeG,
          h,
          f: tentativeG + h,
          parent: current,
        };
        openList.push(neighborNode);
        openMap.set(nextKey, neighborNode);
      } else if (tentativeG < existing.g) {
        existing.g = tentativeG;
        existing.f = tentativeG + existing.h;
        existing.parent = current;
      }
    }
  }

  if (!reachedNode) {
    return [];
  }

  // Reconstruct path (from start to target)
  const path: PathWaypoint[] = [];
  let curr: Node | null = reachedNode;
  while (curr) {
    if (curr.parent !== null) {
      path.unshift({
        x: curr.c * TILE_SIZE + 16,
        y: curr.r * TILE_SIZE + 16,
        col: curr.c,
        row: curr.r,
      });
    }
    curr = curr.parent;
  }

  return path;
}
