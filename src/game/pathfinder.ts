import { TILE_SIZE, MAP_COLS, MAP_ROWS } from './constants';

export interface PathWaypoint {
  x: number;
  y: number;
  col: number;
  row: number;
}

/**
 * A* / BFS Grid Pathfinding for Lembah Nada Rasa
 * Finds a guaranteed collision-free route across the tilemap.
 */
export function findTilePath(
  startCol: number,
  startRow: number,
  targetCol: number,
  targetRow: number,
  isPassable: (col: number, row: number) => boolean,
  maxIterations: number = 2000
): PathWaypoint[] {
  // Clamp boundaries
  const clampCol = (c: number) => Math.max(0, Math.min(MAP_COLS - 1, c));
  const clampRow = (r: number) => Math.max(0, Math.min(MAP_ROWS - 1, r));

  const sC = clampCol(startCol);
  const sR = clampRow(startRow);
  let tC = clampCol(targetCol);
  let tR = clampRow(targetRow);

  // If target tile itself is not passable (e.g. tree trunk or exact NPC tile),
  // find the closest adjacent passable neighbor!
  if (!isPassable(tC, tR)) {
    const candidateOffsets = [
      { dc: 0, dr: 1 },  // South
      { dc: 1, dr: 0 },  // East
      { dc: -1, dr: 0 }, // West
      { dc: 0, dr: -1 }, // North
      { dc: 1, dr: 1 },
      { dc: -1, dr: 1 },
      { dc: 1, dr: -1 },
      { dc: -1, dr: -1 },
      { dc: 0, dr: 2 },
      { dc: 2, dr: 0 },
      { dc: -2, dr: 0 },
      { dc: 0, dr: -2 },
    ];

    let foundAlt = false;
    for (const offset of candidateOffsets) {
      const altC = clampCol(tC + offset.dc);
      const altR = clampRow(tR + offset.dr);
      if (isPassable(altC, altR)) {
        tC = altC;
        tR = altR;
        foundAlt = true;
        break;
      }
    }

    if (!foundAlt) {
      return [];
    }
  }

  // If already at target tile
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

  // A* implementation
  interface Node {
    c: number;
    r: number;
    g: number;
    h: number;
    f: number;
    parent: Node | null;
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

  const directions = [
    { dc: 0, dr: -1 }, // Up
    { dc: 0, dr: 1 },  // Down
    { dc: -1, dr: 0 }, // Left
    { dc: 1, dr: 0 },  // Right
  ];

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

    for (const dir of directions) {
      const nextC = current.c + dir.dc;
      const nextR = current.r + dir.dr;

      if (nextC < 0 || nextC >= MAP_COLS || nextR < 0 || nextR >= MAP_ROWS) {
        continue;
      }

      const nextKey = getKey(nextC, nextR);
      if (closedSet.has(nextKey)) {
        continue;
      }

      if (!isPassable(nextC, nextR)) {
        continue;
      }

      const tentativeG = current.g + 1;
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
    // Exclude start node from path waypoints so player immediately moves towards the first step
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
