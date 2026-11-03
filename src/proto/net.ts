/**
 * Net (Simon Tatham's Net) and Christmas's twists on it: the rules, a
 * solver that counts a panel's answers (for the tests and the level
 * search), and a generator of random light strings (for the search).
 *
 * Every square on the board holds a piece of the light string; turn the
 * pieces so the power reaches every square from the plug, with no loose
 * ends and no loops. The twists, each optional on a panel:
 * - numbered eggs (Easter): the power must reach an egg in exactly its
 *   number of steps from the plug;
 * - one serving per slice (Thanksgiving's fair shares): the pie is cut in
 *   slices round the middle, where the plug is; no wire may cross between
 *   two slices, and every slice gets exactly one wire from the middle;
 * - red and green (Christmas, at home): two strings, each from its own plug;
 *   red pieces only join red, green only green, and the strings never join;
 *   white pieces can belong to either string.
 * (No loops needs no rule: the pieces always have just enough wire ends for
 * one tree, so any join-up that reaches every square is loop-free.)
 */
import { rng } from './kit';

export type Spot = [number, number];
export const N = 1;
export const E = 2;
export const S = 4;
export const W = 8;
export const DIRS = [N, E, S, W] as const;
export const STEP: Record<number, Spot> = { [N]: [-1, 0], [E]: [0, 1], [S]: [1, 0], [W]: [0, -1] };
export const OPP: Record<number, number> = { [N]: S, [E]: W, [S]: N, [W]: E };

/** Turn a piece a quarter clockwise. */
export const turn = (m: number): number => ((m << 1) | (m >> 3)) & 15;

export interface Panel {
  name: string;
  /** The solved pieces, row by row: '.' off the board, else a hex digit of wire ends (1 N, 2 E, 4 S, 8 W). */
  rows: string[];
  /** Where the power comes in (the red string's plug, with colours). */
  plug: Spot;
  /** Red and green, row by row ('r', 'g', 'w' white: either string), with the green string's plug. */
  colours?: string[];
  greenPlug?: Spot;
  /** Numbered eggs: [row, column, steps from the plug]. */
  eggs?: [number, number, number][];
  /** The pie's slices, row by row: a letter per slice, '*' the middle (with the plug). */
  slices?: string[];
  /** The pieces as they start, row by row (default: turned at random from the panel's name). */
  start?: string[];
}

export interface Board {
  height: number;
  width: number;
  /** Solved pieces (-1 off the board). */
  solution: number[][];
  inside: (r: number, c: number) => boolean;
  plug: Spot;
  colour: (r: number, c: number) => 'r' | 'g' | undefined;
  greenPlug?: Spot;
  eggs: [number, number, number][];
  /** The slice a square's in ('*' the middle). */
  slice: (r: number, c: number) => string | undefined;
  /** The board is cut into slices (one serving each). */
  servings: boolean;
}

export const key = (r: number, c: number): string => `${r},${c}`;

export function parse(panel: Panel): Board {
  const solution = panel.rows.map((row) =>
    [...row].map((ch) => (ch === '.' ? -1 : parseInt(ch, 16))),
  );
  const height = solution.length;
  const width = solution[0]?.length ?? 0;
  const inside = (r: number, c: number): boolean => (solution[r]?.[c] ?? -1) >= 0;
  const colour = (r: number, c: number): 'r' | 'g' | undefined => {
    const ch = panel.colours?.[r]?.[c];
    return ch === 'r' || ch === 'g' ? ch : undefined;
  };
  const board: Board = {
    height,
    width,
    solution,
    inside,
    plug: panel.plug,
    colour,
    eggs: panel.eggs ?? [],
    servings: panel.slices !== undefined,
    slice: (r, c) => {
      const ch = panel.slices?.[r]?.[c];
      return ch && ch !== '.' ? ch : undefined;
    },
  };
  if (panel.greenPlug) board.greenPlug = panel.greenPlug;
  return board;
}

/** The pieces a square could be turned to (distinct), as the rules allow before the search. */
/** Two pieces' colours can join: the same, or either one white (or no colours at all). */
const mix = (x: 'r' | 'g' | undefined, y: 'r' | 'g' | undefined): boolean => !x || !y || x === y;

/** A wire between these two squares would cross a wall between two slices. */
export const wall = (b: Board, r: number, c: number, r2: number, c2: number): boolean => {
  const s = b.slice(r, c);
  const t = b.slice(r2, c2);
  return s !== undefined && t !== undefined && s !== t && s !== '*' && t !== '*';
};

function options(b: Board, r: number, c: number, walls: boolean): number[] {
  const m = b.solution[r]?.[c] ?? -1;
  if (m < 0) return [];
  const out = new Set<number>();
  let x = m;
  for (let i = 0; i < 4; i++, x = turn(x)) {
    const ok = DIRS.every((d) => {
      if (!(x & d)) return true;
      const [dr, dc] = STEP[d] as Spot;
      const nr = r + dr;
      const nc = c + dc;
      return (
        b.inside(nr, nc) &&
        mix(b.colour(nr, nc), b.colour(r, c)) &&
        !(walls && wall(b, r, c, nr, nc))
      );
    });
    if (ok) out.add(x);
  }
  return [...out];
}

export interface State {
  /** The current piece in each square (-1 off the board). */
  grid: number[][];
}

/** Squares joined both ways across an edge. */
const joined = (grid: number[][], r: number, c: number, d: number): boolean => {
  const [dr, dc] = STEP[d] as Spot;
  const here = grid[r]?.[c] ?? -1;
  const there = grid[r + dr]?.[c + dc] ?? -1;
  // Off the board is -1 (every bit set!), so check both squares are on it first.
  return here >= 0 && there >= 0 && !!(here & d) && !!(there & (OPP[d] as number));
};

export interface Lighting {
  /** Steps from the plug, for every square the power reaches (by its string's plug). */
  dist: Map<string, number>;
  /** Which string (plug) reached each lit square. */
  string: Map<string, 'r' | 'g'>;
  /** Wire ends that meet nothing. */
  loose: [number, number, number][];
  /** The power's gone round a loop. */
  loop: boolean;
}

export function light(b: Board, grid: number[][]): Lighting {
  const dist = new Map<string, number>();
  const string = new Map<string, 'r' | 'g'>();
  let loop = false;
  for (const [plug, tone] of (b.greenPlug
    ? [
        [b.plug, 'r'],
        [b.greenPlug, 'g'],
      ]
    : [[b.plug, 'r']]) as [Spot, 'r' | 'g'][]) {
    // A plug the other string already reached: the strings have joined.
    if (dist.has(key(plug[0], plug[1]))) loop = true;
    const queue: [number, number, number, number][] = [[plug[0], plug[1], 0, -1]];
    dist.set(key(plug[0], plug[1]), 0);
    string.set(key(plug[0], plug[1]), tone);
    while (queue.length) {
      const [r, c, n, from] = queue.shift() as [number, number, number, number];
      for (const d of DIRS) {
        if (d === from || !joined(grid, r, c, d)) continue;
        const [dr, dc] = STEP[d] as Spot;
        const k = key(r + dr, c + dc);
        if (dist.has(k)) {
          loop = true;
          continue;
        }
        dist.set(k, n + 1);
        string.set(k, tone);
        queue.push([r + dr, c + dc, n + 1, OPP[d] as number]);
      }
    }
  }
  const loose: [number, number, number][] = [];
  grid.forEach((row, r) =>
    row.forEach((m, c) => {
      if (m < 0) return;
      for (const d of DIRS) if (m & d && !joined(grid, r, c, d)) loose.push([r, c, d]);
    }),
  );
  return { dist, string, loose, loop };
}

/** Each slice's servings (wires in from the middle), and the wires that cross a wall between slices. */
export function servings(
  b: Board,
  grid: number[][],
): { feeds: Map<string, number>; walls: [number, number, number][] } {
  const feeds = new Map<string, number>();
  const walls: [number, number, number][] = [];
  grid.forEach((row, r) =>
    row.forEach((_, c) => {
      const s = b.slice(r, c);
      if (s === undefined) return;
      if (s !== '*' && !feeds.has(s)) feeds.set(s, 0);
      for (const d of [E, S]) {
        const [dr, dc] = STEP[d] as Spot;
        const t = b.slice(r + dr, c + dc);
        if (t === undefined || t === s || !joined(grid, r, c, d)) continue;
        if (s === '*' || t === '*') {
          const into = s === '*' ? t : s;
          feeds.set(into, (feeds.get(into) ?? 0) + 1);
        } else walls.push([r, c, d]);
      }
    }),
  );
  return { feeds, walls };
}

export interface Rules {
  /** Ignore the eggs / the servings, to check they matter. */
  noEggs?: boolean;
  noServings?: boolean;
  /** Allow loops (to check the no-loops rule matters). */
  loops?: boolean;
}

export function solved(b: Board, grid: number[][], rules: Rules = {}): boolean {
  const { dist, string, loose, loop } = light(b, grid);
  // With colours, every red or green piece is lit by its own string (white ones by either).
  if (b.greenPlug)
    for (const [k, tone] of string) {
      const [r, c] = k.split(',').map(Number) as Spot;
      const own = b.colour(r, c);
      if (own && own !== tone) return false;
    }
  let count = 0;
  grid.forEach((row) => row.forEach((m) => (count += m >= 0 ? 1 : 0)));
  if (loose.length || (loop && !rules.loops) || dist.size !== count) return false;
  if (!rules.noEggs && b.eggs.some(([r, c, n]) => dist.get(key(r, c)) !== n)) return false;
  if (!rules.noServings && b.servings) {
    const { feeds, walls } = servings(b, grid);
    if (walls.length || [...feeds.values()].some((v) => v !== 1)) return false;
  }
  return true;
}

/** Find up to `limit` answers (each the grid of pieces). */
export function solve(b: Board, limit = 2, rules: Rules = {}): number[][][] {
  const cells: Spot[] = [];
  for (let r = 0; r < b.height; r++)
    for (let c = 0; c < b.width; c++) if (b.inside(r, c)) cells.push([r, c]);
  const walls = b.servings && !rules.noServings;
  const opts = new Map(cells.map(([r, c]) => [key(r, c), options(b, r, c, walls)]));
  const can = (r: number, c: number, d: number, want: boolean): boolean =>
    (opts.get(key(r, c)) ?? []).some((m) => !!(m & d) === want);
  const grid = b.solution.map((row) => row.map((m) => (m < 0 ? -1 : -2))); // -2: undecided
  const index = new Map(cells.map(([r, c], i) => [key(r, c), i]));
  const parent = cells.map((_, i) => i);
  const find = (p: number[], i: number): number => {
    while (p[i] !== i) i = p[i] as number;
    return i;
  };
  const plugIndex = (b.greenPlug ? [b.plug, b.greenPlug] : [b.plug]).map(
    ([r, c]) => index.get(key(r, c)) as number,
  );
  const found: number[][][] = [];
  const go = (i: number, p: number[]): void => {
    if (found.length >= limit) return;
    if (i === cells.length) {
      const g = grid.map((row) => [...row]);
      if (solved(b, g, rules)) found.push(g);
      return;
    }
    const [r, c] = cells[i] as Spot;
    for (const m of opts.get(key(r, c)) ?? []) {
      // Agree with the decided neighbours above and to the left; be possible for those below and to the right.
      let ok = true;
      for (const d of DIRS) {
        const [dr, dc] = STEP[d] as Spot;
        const nr = r + dr;
        const nc = c + dc;
        if (!b.inside(nr, nc)) continue;
        const nm = grid[nr]?.[nc] ?? -1;
        const want = !!(m & d);
        if (nm >= 0) {
          if (!!(nm & (OPP[d] as number)) !== want) ok = false;
        } else if (!can(nr, nc, OPP[d] as number, want)) ok = false;
        if (!ok) break;
      }
      if (!ok) continue;
      const q = [...p];
      // Joins to the decided neighbours: a join inside one piece already would close a loop.
      for (const d of [N, W]) {
        if (!(m & d)) continue;
        const [dr, dc] = STEP[d] as Spot;
        const j = index.get(key(r + dr, c + dc));
        if (j === undefined) continue;
        const a = find(q, i);
        const z = find(q, j);
        if (a === z && !rules.loops) ok = false;
        else q[a] = z;
      }
      if (!ok) continue;
      (grid[r] as number[])[c] = m;
      // A finished piece (no wire ends left reaching undecided squares) must be its whole colour.
      const open = new Set<number>();
      const size = new Map<number, number>();
      for (let j = 0; j <= i; j++) {
        const [rr, cc] = cells[j] as Spot;
        const root = find(q, j);
        size.set(root, (size.get(root) ?? 0) + 1);
        const mm = grid[rr]?.[cc] ?? 0;
        for (const d of [S, E]) {
          const [dr, dc] = STEP[d] as Spot;
          if (mm & d && (grid[rr + dr]?.[cc + dc] ?? -1) === -2) open.add(root);
        }
      }
      // Strings so far: a finished one must hold a plug (and, with one plug, everything);
      // and no string may hold both plugs.
      let closedEarly = false;
      const plugRoots = plugIndex.map((k) => (k <= i ? find(q, k) : -1));
      if (plugRoots.length === 2 && plugRoots[0] !== -1 && plugRoots[0] === plugRoots[1])
        closedEarly = true;
      for (const [root, n] of size) {
        if (open.has(root)) continue;
        if (!plugRoots.includes(root) || (plugIndex.length === 1 && n < cells.length))
          closedEarly = true;
      }
      if (!closedEarly && walls) {
        const { feeds } = servings(
          b,
          grid.map((row) => row.map((x) => Math.max(x, 0))),
        );
        for (const v of feeds.values()) if (v > 1) closedEarly = true;
      }
      if (!closedEarly) go(i + 1, q);
      (grid[r] as number[])[c] = -2;
    }
  };
  go(0, parent);
  return found;
}

export const countSolutions = (b: Board, limit = 2, rules: Rules = {}): number =>
  solve(b, limit, rules).length;

/** The starting pieces: each turned at random (seeded by the panel's name). */
export function startGrid(panel: Panel): number[][] {
  const b = parse(panel);
  if (panel.start)
    return panel.start.map((row) => [...row].map((ch) => (ch === '.' ? -1 : parseInt(ch, 16))));
  let seed = 7;
  for (const ch of panel.name) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const random = rng(seed);
  return b.solution.map((row) =>
    row.map((m) => {
      if (m < 0) return m;
      let x = m;
      for (let t = 1 + Math.floor(random() * 3); t > 0; t--) x = turn(x);
      return x;
    }),
  );
}

/** A board shape, row by row ('#' a square, '.' none). */
export type Shape = string[];

export const rectangle = (h: number, w: number): Shape =>
  Array.from({ length: h }, () => '#'.repeat(w));

/** A Christmas tree: a triangle widening downwards, a star square on top. */
export const treeShape = (h: number, w: number, spread = 0.5): Shape => {
  const mid = Math.floor(w / 2);
  return Array.from({ length: h }, (_, r) =>
    Array.from({ length: w }, (_, c) =>
      Math.abs(c - mid) <= Math.floor((r + 1) * spread) ? '#' : '.',
    ).join(''),
  );
};

/** An oval (an egg, or a round pie when h = w). */
export const ovalShape = (h: number, w: number, top = 1): Shape =>
  Array.from({ length: h }, (_, r) =>
    Array.from({ length: w }, (_, c) => {
      const y = (r + 0.5) / h - 0.5;
      const x = (c + 0.5) / w - 0.5;
      // An egg narrows at the top: squeeze x more for the upper rows.
      const squeeze = 1 + (top - 1) * Math.max(0, -y * 2);
      return (x * squeeze) ** 2 + y ** 2 <= 0.26 ? '#' : '.';
    }).join(''),
  );

/** A wreath: a ring of squares round a hole. */
export const ringShape = (h: number, w: number, hole = 0.08): Shape =>
  Array.from({ length: h }, (_, r) =>
    Array.from({ length: w }, (_, c) => {
      const y = (r + 0.5) / h - 0.5;
      const x = (c + 0.5) / w - 0.5;
      const d = x * x + y * y;
      return d <= 0.26 && d >= hole ? '#' : '.';
    }).join(''),
  );

export interface GenOptions {
  shape: Shape;
  plug: Spot;
  seed: number;
  /** 'winding' grows long runs (random depth-first); 'branching' joins at random (lots of T-pieces). */
  style?: 'winding' | 'branching';
  /** Split into a red and a green string (each plug its string's lowest square). */
  colours?: boolean;
}

/** A random light string (a spanning tree of the shape, or two with colours): the solved panel. */
export function generate(o: GenOptions): Panel | null {
  const random = rng(o.seed);
  const H = o.shape.length;
  const Wd = o.shape[0]?.length ?? 0;
  const inside = (r: number, c: number): boolean => o.shape[r]?.[c] === '#';
  const cells: Spot[] = [];
  for (let r = 0; r < H; r++) for (let c = 0; c < Wd; c++) if (inside(r, c)) cells.push([r, c]);
  // Colours: the pieces split into a red and a green string later (one tree, cut in two).
  const owner = new Map<string, 'r' | 'g'>();
  const mask = new Map<string, number>(cells.map(([r, c]) => [key(r, c), 0]));
  const link = (a: Spot, d: number): void => {
    const [dr, dc] = STEP[d] as Spot;
    mask.set(key(...a), (mask.get(key(...a)) ?? 0) | d);
    mask.set(
      key(a[0] + dr, a[1] + dc),
      (mask.get(key(a[0] + dr, a[1] + dc)) ?? 0) | (OPP[d] as number),
    );
  };
  if (o.style === 'branching') {
    const parent = new Map(cells.map(([r, c]) => [key(r, c), key(r, c)]));
    const find = (k: string): string => {
      while (parent.get(k) !== k) k = parent.get(k) as string;
      return k;
    };
    const edges: [Spot, number][] = [];
    for (const s of cells)
      for (const d of [E, S]) {
        const t: Spot = [s[0] + (STEP[d] as Spot)[0], s[1] + (STEP[d] as Spot)[1]];
        if (inside(...t)) edges.push([s, d]);
      }
    edges.sort(() => random() - 0.5);
    for (const [s, d] of edges) {
      const t: Spot = [s[0] + (STEP[d] as Spot)[0], s[1] + (STEP[d] as Spot)[1]];
      const a = find(key(...s));
      const z = find(key(...t));
      if (a === z) continue;
      parent.set(a, z);
      link(s, d);
    }
  } else {
    const seen = new Set<string>();
    {
      const start = o.plug;
      const stack: Spot[] = [start];
      seen.add(key(...start));
      while (stack.length) {
        const at = stack[stack.length - 1] as Spot;
        const next = DIRS.filter((d) => {
          const t: Spot = [at[0] + (STEP[d] as Spot)[0], at[1] + (STEP[d] as Spot)[1]];
          return inside(...t) && !seen.has(key(...t));
        });
        if (!next.length) {
          stack.pop();
          continue;
        }
        const d = next[Math.floor(random() * next.length)] as number;
        const t: Spot = [at[0] + (STEP[d] as Spot)[0], at[1] + (STEP[d] as Spot)[1]];
        link(at, d);
        seen.add(key(...t));
        stack.push(t);
      }
    }
    if (seen.size !== cells.length) return null;
  }
  let plug = o.plug;
  let greenPlug: Spot | undefined;
  if (o.colours) {
    // Cut one join so the tree falls into two strings of fair size, winding round each other.
    const joins: [Spot, number][] = [];
    for (const s0 of cells)
      for (const d of [E, S]) if ((mask.get(key(...s0)) ?? 0) & d) joins.push([s0, d]);
    // The squares on one side of a join, if it were cut.
    const sideOf = ([s0, d]: [Spot, number]): Set<string> => {
      const t: Spot = [s0[0] + (STEP[d] as Spot)[0], s0[1] + (STEP[d] as Spot)[1]];
      const seen = new Set([key(...s0), key(...t)]);
      const side = new Set([key(...s0)]);
      const stack: Spot[] = [s0];
      while (stack.length) {
        const [r, c] = stack.pop() as Spot;
        for (const e of DIRS) {
          if (!((mask.get(key(r, c)) ?? 0) & e)) continue;
          const n: Spot = [r + (STEP[e] as Spot)[0], c + (STEP[e] as Spot)[1]];
          if (seen.has(key(...n))) continue;
          seen.add(key(...n));
          side.add(key(...n));
          stack.push(n);
        }
      }
      return side;
    };
    const lastRow = Math.max(...cells.map(([r]) => r));
    const bottom = cells.filter(([r]) => r === lastRow).map(([r, c]) => key(r, c));
    const fair = joins
      .map((cut) => ({ cut, side: sideOf(cut) }))
      .filter(
        ({ side }) =>
          side.size >= cells.length * 0.38 &&
          side.size <= cells.length * 0.62 &&
          // Both strings reach the bottom row, where their plugs go.
          bottom.some((k) => side.has(k)) &&
          bottom.some((k) => !side.has(k)),
      );
    if (!fair.length) return null;
    const { cut, side } = fair[Math.floor(random() * fair.length)] as {
      cut: [Spot, number];
      side: Set<string>;
    };
    const [s0, d] = cut;
    const t: Spot = [s0[0] + (STEP[d] as Spot)[0], s0[1] + (STEP[d] as Spot)[1]];
    mask.set(key(...s0), (mask.get(key(...s0)) ?? 0) & ~d);
    mask.set(key(...t), (mask.get(key(...t)) ?? 0) & ~(OPP[d] as number));
    for (const [r, c] of cells) owner.set(key(r, c), side.has(key(r, c)) ? 'r' : 'g');
    // Each string's plug: its lowest square nearest the middle.
    const mid = (Wd - 1) / 2;
    const lowest = (k: 'r' | 'g'): Spot =>
      cells
        .filter(([r, c]) => owner.get(key(r, c)) === k)
        .sort((x, y) => y[0] - x[0] || Math.abs(x[1] - mid) - Math.abs(y[1] - mid))[0] as Spot;
    plug = lowest('r');
    greenPlug = lowest('g');
  }
  const rows = o.shape.map((row, r) =>
    [...row].map((ch, c) => (ch === '#' ? (mask.get(key(r, c)) ?? 0).toString(16) : '.')).join(''),
  );
  if (rows.some((row) => row.includes('0'))) return null;
  const panel: Panel = { name: 'generated', rows, plug };
  if (greenPlug) {
    panel.greenPlug = greenPlug;
    panel.colours = o.shape.map((row, r) =>
      [...row].map((ch, c) => (ch === '#' ? (owner.get(key(r, c)) ?? '.') : '.')).join(''),
    );
  }
  return panel;
}
