/**
 * The bunny's hops: Numbrix (Hidato with plain steps). The Easter Bunny hops
 * to a neighbouring spot (up, down, left or right) and lands on every spot of
 * the board exactly once; some eggs are already numbered with their place in
 * the order. (Knight hops were tried first: too hard for quick panels.)
 *
 * Twists, each optional on a panel:
 * - parade flags (the Fourth of July's clues from the edge): a flag at the
 *   end of a row or column gives the number of the bunny's first visit to
 *   that line (the lowest number in it);
 * - courses (Thanksgiving's fair shares): the board is outlined in
 *   portions, and each is visited in one unbroken stretch;
 * - burrows (Easter's own, at home): two burrows joined underground, so
 *   popping down one and up the other is a hop of its own.
 *
 * Here: the rules, a solver that counts a panel's answers (for the tests and
 * the level search), and a generator of random hops.
 */
import { rng } from './kit';

export type Spot = [number, number];
export const key = ([r, c]: Spot): string => `${r},${c}`;

export interface Panel {
  name: string;
  /** The board, row by row: '#' a spot, '.' none. */
  rows: string[];
  /** Numbered eggs: [row, column, number]. */
  given: [number, number, number][];
  /** Any tour wins (no numbered eggs to match; a learning panel). */
  free?: boolean;
  /** Parade flags: each line's first-visit number (null: no flag). */
  rowFlags?: (number | null)[];
  colFlags?: (number | null)[];
  /** Courses: a letter per spot, row by row. */
  portions?: string[];
  /** Burrow pairs: each pair joined underground. */
  burrows?: [Spot, Spot][];
  /** The Golden Egg: the last spot (decoration, and a numbered egg). */
  golden?: Spot;
}

export interface Board {
  spots: Spot[];
  index: Map<string, number>;
  /** Each spot's hops (neighbouring spots, and burrows), as spot indices. */
  hops: number[][];
  given: Map<number, number>; // spot index -> number
  at: Map<number, number>; // number -> spot index
  rowFlags: (number | null)[];
  colFlags: (number | null)[];
  portion: (string | undefined)[];
  burrow: Set<string>; // "i,j" for a burrow hop (both ways)
}

/** A hop: one spot up, down, left or right. */
const STEPS: Spot[] = [
  [-1, 0],
  [0, 1],
  [1, 0],
  [0, -1],
];

export function parse(p: Panel): Board {
  const spots: Spot[] = [];
  p.rows.forEach((row, r) => [...row].forEach((ch, c) => ch !== '.' && spots.push([r, c])));
  const index = new Map(spots.map((s, i) => [key(s), i]));
  const burrow = new Set<string>();
  const hops = spots.map(([r, c]) =>
    STEPS.flatMap(([dr, dc]) => {
      const j = index.get(key([r + dr, c + dc]));
      return j === undefined ? [] : [j];
    }),
  );
  for (const [a, b] of p.burrows ?? []) {
    const i = index.get(key(a)) as number;
    const j = index.get(key(b)) as number;
    if (!hops[i]?.includes(j)) hops[i]?.push(j);
    if (!hops[j]?.includes(i)) hops[j]?.push(i);
    burrow.add(`${i},${j}`).add(`${j},${i}`);
  }
  const given = new Map(p.given.map(([r, c, n]) => [index.get(key([r, c])) as number, n]));
  const at = new Map([...given].map(([i, n]) => [n, i]));
  const portion = spots.map(([r, c]) => {
    const ch = p.portions?.[r]?.[c];
    return ch && ch !== '.' ? ch : undefined;
  });
  return {
    spots,
    index,
    hops,
    given,
    at,
    rowFlags: p.rowFlags ?? p.rows.map(() => null),
    colFlags: p.colFlags ?? [...(p.rows[0] ?? '')].map(() => null),
    portion,
    burrow,
  };
}

export interface Rules {
  noFlags?: boolean;
  noPortions?: boolean;
}

/** The lowest number in each row and column, for a full route (spot indices in order). */
export function firstVisits(b: Board, route: number[]): { rows: number[]; cols: number[] } {
  const H = Math.max(...b.spots.map(([r]) => r)) + 1;
  const W = Math.max(...b.spots.map(([, c]) => c)) + 1;
  const rows = Array<number>(H).fill(0);
  const cols = Array<number>(W).fill(0);
  route.forEach((i, n) => {
    const [r, c] = b.spots[i] as Spot;
    if (!rows[r]) rows[r] = n + 1;
    if (!cols[c]) cols[c] = n + 1;
  });
  return { rows, cols };
}

/** Is a route (spot indices, in order) a full, legal tour of the panel? */
export function solved(b: Board, route: number[], rules: Rules = {}): boolean {
  if (route.length !== b.spots.length || new Set(route).size !== route.length) return false;
  if (route.some((i, n) => n > 0 && !(b.hops[route[n - 1] as number] ?? []).includes(i)))
    return false;
  if (route.some((i, n) => b.given.has(i) && b.given.get(i) !== n + 1)) return false;
  if (!rules.noFlags) {
    const { rows, cols } = firstVisits(b, route);
    if (b.rowFlags.some((f, r) => f !== null && f !== rows[r])) return false;
    if (b.colFlags.some((f, c) => f !== null && f !== cols[c])) return false;
  }
  if (!rules.noPortions && b.portion.some((x) => x !== undefined)) {
    const done = new Set<string>();
    for (let n = 1; n < route.length; n++) {
      const was = b.portion[route[n - 1] as number] as string;
      const now = b.portion[route[n] as number] as string;
      if (was !== now) {
        done.add(was);
        if (done.has(now)) return false;
      }
    }
  }
  return true;
}

/** Thrown when a search runs past its step budget (the level search treats it as "not unique"). */
export class OverBudget extends Error {}

/** Find up to `limit` routes (spot indices in order), giving up (OverBudget) after `budget` steps. */
export function solve(
  b: Board,
  limit = 2,
  rules: Rules = {},
  budget = Infinity,
  stats?: { steps: number },
): number[][] {
  let steps = 0;
  const N = b.spots.length;
  const found: number[][] = [];
  const route: number[] = [];
  const used = new Array<boolean>(N).fill(false);
  const flags = !rules.noFlags;
  const courses = !rules.noPortions && b.portion.some((x) => x !== undefined);
  const lineSeen = { r: new Map<number, number>(), c: new Map<number, number>() };
  const finished = new Set<string>();
  // Hop distances between all spots (for "can I reach the next numbered egg in time?").
  const dist = b.spots.map((_, s) => {
    const d = new Array<number>(N).fill(99);
    d[s] = 0;
    const q = [s];
    while (q.length) {
      const x = q.shift() as number;
      for (const y of b.hops[x] ?? [])
        if ((d[y] ?? 99) > (d[x] ?? 0) + 1) {
          d[y] = (d[x] ?? 0) + 1;
          q.push(y);
        }
    }
    return d;
  });
  const numbers = [...b.at.keys()].sort((x, y) => x - y);
  const ok = (i: number, n: number): boolean => {
    // n is this spot's number (1-based).
    const g = b.given.get(i);
    if (g !== undefined && g !== n) return false;
    const want = b.at.get(n);
    if (want !== undefined && want !== i) return false;
    // The next numbered egg must still be reachable in time.
    const next = numbers.find((m) => m > n);
    if (next !== undefined && (dist[i]?.[b.at.get(next) as number] ?? 99) > next - n) return false;
    if (flags) {
      const [r, c] = b.spots[i] as Spot;
      for (const [line, flag, seen] of [
        [r, b.rowFlags[r], lineSeen.r],
        [c, b.colFlags[c], lineSeen.c],
      ] as const)
        if (flag !== null && flag !== undefined && !seen.has(line) && flag !== n) return false;
      // A flag whose number has come must already have been met (or be met now).
      for (const [lines, seen, mine] of [
        [b.rowFlags, lineSeen.r, r],
        [b.colFlags, lineSeen.c, c],
      ] as const)
        for (const [line, flag] of lines.entries())
          if (flag !== null && flag !== undefined && flag <= n && !seen.has(line) && line !== mine)
            return false;
    }
    return true;
  };
  const visit = (i: number): (() => void) => {
    const [r, c] = b.spots[i] as Spot;
    const n = route.length + 1;
    route.push(i);
    used[i] = true;
    const newR = !lineSeen.r.has(r);
    const newC = !lineSeen.c.has(c);
    if (newR) lineSeen.r.set(r, n);
    if (newC) lineSeen.c.set(c, n);
    return () => {
      route.pop();
      used[i] = false;
      if (newR) lineSeen.r.delete(r);
      if (newC) lineSeen.c.delete(c);
    };
  };
  const go = (): void => {
    if (found.length >= limit) return;
    if (++steps > budget) throw new OverBudget();
    if (route.length === N) {
      if (solved(b, route, rules)) found.push([...route]);
      return;
    }
    const last = route[route.length - 1] as number;
    // Dead ends: an unvisited spot with no way in or out left can't be finished (unless it's last).
    let stuck = 0;
    for (let s = 0; s < N; s++) {
      if (used[s]) continue;
      const free = (b.hops[s] ?? []).filter((t) => !used[t] || t === last).length;
      if (free === 0) return;
      if (free === 1) stuck++;
    }
    if (stuck > 2) return;
    // The spots left must hang together (reachable from the bunny), or the tour can't finish.
    const seen = new Array<boolean>(N).fill(false);
    const stack = [last];
    seen[last] = true;
    let reached = 0;
    while (stack.length) {
      const x = stack.pop() as number;
      for (const y of b.hops[x] ?? [])
        if (!used[y] && !seen[y]) {
          seen[y] = true;
          reached++;
          stack.push(y);
        }
    }
    if (reached !== N - route.length) return;
    const n = route.length + 1;
    // Fewest onward hops first (Warnsdorff's rule): finds routes fast.
    const onward = (j: number): number => (b.hops[j] ?? []).filter((k) => !used[k]).length;
    const order = (b.hops[last] ?? [])
      .filter((j) => !used[j])
      .sort((x, y) => onward(x) - onward(y));
    for (const j of order) {
      if (!ok(j, n)) continue;
      if (courses) {
        const was = b.portion[last] as string;
        const now = b.portion[j] as string;
        if (was !== now) {
          // Leaving a portion: it must be finished; and no going back into a finished one.
          if (b.spots.some((_, s) => !used[s] && b.portion[s] === was) || finished.has(now))
            continue;
          finished.add(was);
          const undo = visit(j);
          go();
          undo();
          finished.delete(was);
          continue;
        }
      }
      const undo = visit(j);
      go();
      undo();
    }
  };
  const starts = b.at.has(1) ? [b.at.get(1) as number] : b.spots.map((_, i) => i);
  for (const s of starts) {
    if (!ok(s, 1)) continue;
    const undo = visit(s);
    go();
    undo();
  }
  if (stats) stats.steps = steps;
  return found;
}

export const countSolutions = (b: Board, limit = 2, rules: Rules = {}, budget = Infinity): number =>
  solve(b, limit, rules, budget).length;

/** A random full route over the board (spot indices), or null. Warnsdorff's rule with random ties. */
export function randomRoute(b: Board, seed: number, start?: number): number[] | null {
  const random = rng(seed);
  const N = b.spots.length;
  for (let attempt = 0; attempt < 200; attempt++) {
    const used = new Array<boolean>(N).fill(false);
    let at = start ?? Math.floor(random() * N);
    const route = [at];
    used[at] = true;
    while (route.length < N) {
      const next = (b.hops[at] ?? []).filter((j) => !used[j]);
      if (!next.length) break;
      const degree = (j: number): number => (b.hops[j] ?? []).filter((k) => !used[k]).length;
      next.sort((x, y) => degree(x) - degree(y) || random() - 0.5);
      // Mostly Warnsdorff (fewest onward hops first), sometimes a random pick.
      at = (random() < 0.85 ? next[0] : next[Math.floor(random() * next.length)]) as number;
      route.push(at);
      used[at] = true;
    }
    if (route.length === N) return route;
  }
  return null;
}

/** Board shapes. */
export const rect = (h: number, w: number): string[] =>
  Array.from({ length: h }, () => '#'.repeat(w));
export const treeRows = (h: number, w: number, spread: number): string[] => {
  const mid = Math.floor(w / 2);
  return Array.from({ length: h }, (_, r) =>
    Array.from({ length: w }, (_, c) =>
      Math.abs(c - mid) <= Math.floor((r + 1) * spread) ? '#' : '.',
    ).join(''),
  );
};
