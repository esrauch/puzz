/**
 * Hashi (Nikoli's Hashiwokakero, Tatham's Bridges) and Halloween's twists on
 * it: the rules, a solver that counts a panel's answers (for the tests and
 * the level search), and a generator of random webs (for the search).
 *
 * The base rules: a knot's number is how many threads leave it; threads run
 * straight between two knots, one or two between a pair, never crossing; the
 * web hangs together as one. The twists, each optional on a panel:
 * - letters: a knot shows a letter, not a number; the same letter means the
 *   same count, different letters different counts;
 * - dark knots ('?'): any count;
 * - colours: knots are red or green bulbs, and a thread only joins a red to
 *   a green;
 * - a string: the web is one unbranched string from the plug to the star;
 * - diagonals: threads may also run corner to corner.
 */
import { rng } from './kit';

export type Spot = [number, number];
type Dir = readonly [number, number];
const ORTHO: Dir[] = [
  [0, 1],
  [1, 0],
];
const DIAG: Dir[] = [
  [1, 1],
  [1, -1],
];

export interface Panel {
  name: string;
  /** '.' empty; a digit: a knot with that many threads; a letter: a coded count; '?': a dark knot. */
  rows: string[];
  /** Bulb colours, row by row: 'r' red, 'g' green. A thread only joins different colours. */
  colours?: string[];
  /** Threads may also run diagonally. */
  diagonal?: boolean;
  /** The web is one unbranched string from the plug (first) to the star (second). */
  ends?: [Spot, Spot];
  /** A message with numbered blanks: blank n takes the letter whose knots have n threads. */
  message?: string;
  /** The spider's home knot, and numbered eggs: [row, column, threads from home]. */
  home?: Spot;
  eggs?: [number, number, number][];
  /** Edge flags: how many threads run along each row / column (null: no flag). */
  rowFlags?: (number | null)[];
  colFlags?: (number | null)[];
}

export type Clue =
  { kind: 'count'; n: number } | { kind: 'letter'; letter: string } | { kind: 'dark' };

export interface Knot {
  r: number;
  c: number;
  clue: Clue;
  colour?: 'r' | 'g';
}

export interface Link {
  a: number;
  b: number;
  /** Unit step from a to b. */
  dir: Dir;
  /** The points the thread passes over (doubled coordinates, endpoints excluded). */
  points: string[];
}

export interface Web {
  knots: Knot[];
  links: Link[];
  /** For each link, the links it would cross. */
  crosses: number[][];
  /** For each knot, its links. */
  incident: number[][];
  width: number;
  height: number;
  /** The string's plug and star (knot indices), if the panel is a string. */
  ends?: [number, number];
  /** The home knot, and eggs as [knot, threads from home]. */
  home?: number;
  eggs: [number, number][];
  rowFlags: (number | null)[];
  colFlags: (number | null)[];
}

export interface Rules {
  /** Ignore the eggs / the flags (to check they matter). */
  noEggs?: boolean;
  noFlags?: boolean;
  /** Threads may not cross (default true). */
  noCrossing?: boolean;
  /** The web must be one piece (default true). */
  connected?: boolean;
}

export function parse(panel: Panel): Web {
  const knots: Knot[] = [];
  const at = new Map<string, number>();
  panel.rows.forEach((row, r) =>
    [...row].forEach((ch, c) => {
      if (ch === '.') return;
      const clue: Clue =
        ch === '?'
          ? { kind: 'dark' }
          : /[0-9]/.test(ch)
            ? { kind: 'count', n: Number(ch) }
            : { kind: 'letter', letter: ch };
      const colour = panel.colours?.[r]?.[c];
      at.set(`${r},${c}`, knots.length);
      knots.push(colour === 'r' || colour === 'g' ? { r, c, clue, colour } : { r, c, clue });
    }),
  );
  const height = panel.rows.length;
  const width = panel.rows[0]?.length ?? 0;
  const links: Link[] = [];
  knots.forEach((k, a) => {
    for (const dir of panel.diagonal ? [...ORTHO, ...DIAG] : ORTHO) {
      let r = k.r + dir[0];
      let c = k.c + dir[1];
      let steps = 1;
      while (r >= 0 && r < height && c >= 0 && c < width && !at.has(`${r},${c}`)) {
        r += dir[0];
        c += dir[1];
        steps++;
      }
      const b = at.get(`${r},${c}`);
      if (b === undefined) continue;
      const other = knots[b] as Knot;
      if (k.colour && other.colour && k.colour === other.colour) continue;
      const points: string[] = [];
      for (let t = 1; t < steps * 2; t++)
        points.push(`${2 * k.r + dir[0] * t},${2 * k.c + dir[1] * t}`);
      links.push({ a, b, dir, points });
    }
  });
  const crosses = links.map((x, i) =>
    links.flatMap((y, j) => (i !== j && x.points.some((p) => y.points.includes(p)) ? [j] : [])),
  );
  const incident = knots.map((_, k) =>
    links.flatMap((l, i) => (l.a === k || l.b === k ? [i] : [])),
  );
  const knotAt = (s: Spot): number => {
    const i = at.get(`${s[0]},${s[1]}`);
    if (i === undefined) throw new Error(`${panel.name}: no knot at ${s.join(',')}`);
    return i;
  };
  const web: Web = {
    knots,
    links,
    crosses,
    incident,
    width,
    height,
    eggs: (panel.eggs ?? []).map(([r, c, n]) => [knotAt([r, c]), n]),
    rowFlags: panel.rowFlags ?? panel.rows.map(() => null),
    colFlags: panel.colFlags ?? [...(panel.rows[0] ?? '')].map(() => null),
  };
  if (panel.ends) web.ends = [knotAt(panel.ends[0]), knotAt(panel.ends[1])];
  if (panel.home) web.home = knotAt(panel.home);
  return web;
}

export function totals(web: Web, threads: number[]): number[] {
  const t = web.knots.map(() => 0);
  web.links.forEach((l, i) => {
    const n = threads[i] ?? 0;
    t[l.a] = (t[l.a] ?? 0) + n;
    t[l.b] = (t[l.b] ?? 0) + n;
  });
  return t;
}

/** How many knots each knot is joined to (not counting doubles twice). */
export function neighbours(web: Web, threads: number[]): number[] {
  const d = web.knots.map(() => 0);
  web.links.forEach((l, i) => {
    if (!threads[i]) return;
    d[l.a] = (d[l.a] ?? 0) + 1;
    d[l.b] = (d[l.b] ?? 0) + 1;
  });
  return d;
}

/** Which piece each knot is in (pieces numbered from 0). */
export function pieces(web: Web, threads: number[]): number[] {
  const piece = web.knots.map(() => -1);
  let n = 0;
  web.knots.forEach((_, start) => {
    if ((piece[start] ?? -1) >= 0) return;
    piece[start] = n;
    const stack = [start];
    while (stack.length) {
      const x = stack.pop() as number;
      for (const i of web.incident[x] ?? []) {
        if (!threads[i]) continue;
        const l = web.links[i] as Link;
        const y = l.a === x ? l.b : l.a;
        if (piece[y] === -1) {
          piece[y] = n;
          stack.push(y);
        }
      }
    }
    n++;
  });
  return piece;
}

/** The count each letter stands for, if the letters are consistent (every knot of a letter alike, letters all different). */
export function letterValues(web: Web, threads: number[]): Map<string, number> | null {
  const t = totals(web, threads);
  const values = new Map<string, number>();
  for (const [k, knot] of web.knots.entries()) {
    if (knot.clue.kind !== 'letter') continue;
    const v = values.get(knot.clue.letter);
    if (v === undefined) values.set(knot.clue.letter, t[k] ?? 0);
    else if (v !== t[k]) return null;
  }
  return new Set(values.values()).size === values.size ? values : null;
}

/** The message with its blanks filled from the letters' counts ('_' where no letter has that count). */
export function fillMessage(message: string, values: Map<string, number>): string {
  const byCount = new Map([...values.entries()].map(([letter, n]) => [n, letter]));
  return message.replace(/[0-9]/g, (d) => byCount.get(Number(d)) ?? '_');
}

/** Is the panel solved under every one of its rules? */
/** How many threads run along each row and each column (a double counts two). */
export function threadsAlong(web: Web, threads: number[]): { rows: number[]; cols: number[] } {
  const rows = new Array<number>(web.height).fill(0);
  const cols = new Array<number>(web.width).fill(0);
  web.links.forEach((l, i) => {
    const n = threads[i] ?? 0;
    if (!n) return;
    const a = web.knots[l.a] as Knot;
    const b = web.knots[l.b] as Knot;
    if (a.r === b.r) rows[a.r] = (rows[a.r] ?? 0) + n;
    else if (a.c === b.c) cols[a.c] = (cols[a.c] ?? 0) + n;
  });
  return { rows, cols };
}

/** Threads (joins) from a knot to every knot, along the web (-1: not reached). */
export function distances(web: Web, threads: number[], from: number): number[] {
  const d = web.knots.map(() => -1);
  d[from] = 0;
  const queue = [from];
  while (queue.length) {
    const x = queue.shift() as number;
    for (const i of web.incident[x] ?? []) {
      if (!threads[i]) continue;
      const l = web.links[i] as Link;
      const y = l.a === x ? l.b : l.a;
      if (d[y] === -1) {
        d[y] = (d[x] ?? 0) + 1;
        queue.push(y);
      }
    }
  }
  return d;
}

export function solved(web: Web, threads: number[], rules: Rules = {}): boolean {
  const t = totals(web, threads);
  if (web.knots.some((k, i) => (k.clue.kind === 'count' ? t[i] !== k.clue.n : (t[i] ?? 0) < 1)))
    return false;
  if (!letterValues(web, threads)) return false;
  if (rules.noCrossing !== false)
    for (const [i, cross] of web.crosses.entries())
      if (threads[i] && cross.some((j) => threads[j])) return false;
  if (web.ends) {
    const d = neighbours(web, threads);
    if (web.knots.some((_, k) => d[k] !== (web.ends?.includes(k) ? 1 : 2))) return false;
  }
  if (rules.connected !== false && new Set(pieces(web, threads)).size > 1) return false;
  if (!rules.noFlags) {
    const { rows, cols } = threadsAlong(web, threads);
    if (web.rowFlags.some((f, r) => f !== null && f !== rows[r])) return false;
    if (web.colFlags.some((f, c) => f !== null && f !== cols[c])) return false;
  }
  if (!rules.noEggs && web.home !== undefined) {
    const d = distances(web, threads, web.home);
    if (web.eggs.some(([k, n]) => d[k] !== n)) return false;
  }
  return true;
}

/** Find up to `limit` answers (each a thread count per link). */
export function solve(web: Web, limit = 2, rules: Rules = {}): number[][] {
  const L = web.links.length;
  const K = web.knots.length;
  const found: number[][] = [];
  const noCrossing = rules.noCrossing !== false;
  const connected = rules.connected !== false;

  /** Tighten `val` (-1 unknown) in place; false if it can't be solved. */
  const propagate = (val: Int8Array): boolean => {
    for (let changed = true; changed;) {
      changed = false;
      if (noCrossing)
        for (let i = 0; i < L; i++)
          if (val[i] === -1 && (web.crosses[i] ?? []).some((j) => (val[j] ?? 0) > 0)) {
            val[i] = 0;
            changed = true;
          }
      const lo = new Array<number>(K).fill(0);
      const freeCap = new Array<number>(K).fill(0);
      const freeCount = new Array<number>(K).fill(0);
      const deg = new Array<number>(K).fill(0);
      web.links.forEach((l, i) => {
        const v = val[i] ?? -1;
        for (const k of [l.a, l.b]) {
          if (v > 0) {
            lo[k] = (lo[k] ?? 0) + v;
            deg[k] = (deg[k] ?? 0) + 1;
          } else if (v === -1) {
            freeCap[k] = (freeCap[k] ?? 0) + 2;
            freeCount[k] = (freeCount[k] ?? 0) + 1;
          }
        }
      });
      // What each knot needs, where it's known: its number, or its letter's value once a knot of that letter is settled.
      const letterVal = new Map<string, number>();
      for (const [k, knot] of web.knots.entries()) {
        if (knot.clue.kind !== 'letter' || freeCount[k] !== 0) continue;
        const v = letterVal.get(knot.clue.letter);
        if (v !== undefined && v !== lo[k]) return false;
        letterVal.set(knot.clue.letter, lo[k] ?? 0);
      }
      if (new Set(letterVal.values()).size !== letterVal.size) return false;
      const need = web.knots.map((knot) =>
        knot.clue.kind === 'count'
          ? knot.clue.n
          : knot.clue.kind === 'letter'
            ? letterVal.get(knot.clue.letter)
            : undefined,
      );
      // Unsettled letters: their knots' ranges must overlap, and not only on a value another letter has.
      const groups = new Map<string, [number, number]>();
      for (const [k, knot] of web.knots.entries()) {
        if (knot.clue.kind !== 'letter' || letterVal.has(knot.clue.letter)) continue;
        const g = groups.get(knot.clue.letter) ?? [1, 99];
        groups.set(knot.clue.letter, [
          Math.max(g[0], lo[k] ?? 0),
          Math.min(g[1], (lo[k] ?? 0) + (freeCap[k] ?? 0)),
        ]);
      }
      const taken = new Set(letterVal.values());
      for (const [lo2, hi] of groups.values()) {
        if (lo2 > hi) return false;
        let open = false;
        for (let v = lo2; v <= hi && !open; v++) open = !taken.has(v);
        if (!open) return false;
      }
      // Each link's capacity: 2, less what a known end still needs.
      const cap = (i: number): number => {
        const l = web.links[i] as Link;
        let c = 2;
        for (const k of [l.a, l.b]) {
          const n = need[k];
          if (n !== undefined) c = Math.min(c, n - (lo[k] ?? 0));
        }
        return Math.max(0, c);
      };
      for (let k = 0; k < K; k++) {
        const free = (web.incident[k] ?? []).filter((i) => val[i] === -1);
        const caps = free.map(cap);
        const room = caps.reduce((s, c) => s + c, 0);
        const n = need[k];
        const have = lo[k] ?? 0;
        if (n !== undefined) {
          if (have > n || have + room < n) return false;
          if (free.length && (have === n || have + room === n)) {
            free.forEach((i, j) => (val[i] = have === n ? 0 : (caps[j] ?? 0)));
            changed = true;
          } else
            free.forEach((i, j) => {
              const c = caps[j] ?? 0;
              const least = n - have - (room - c);
              if (c === 0 || (least > 0 && least === c)) {
                val[i] = c;
                changed = true;
              }
            });
        } else if (K > 1 && have + room < 1) return false;
        if (changed) break;
        if (web.ends) {
          const want = web.ends.includes(k) ? 1 : 2;
          const d = deg[k] ?? 0;
          const open = free.filter((_, j) => (caps[j] ?? 0) > 0).length;
          if (d > want || d + open < want) return false;
          if (d === want && free.length) {
            free.forEach((i) => (val[i] = 0));
            changed = true;
          }
        }
        if (changed) break;
      }
    }
    if (!rules.noFlags && [...web.rowFlags, ...web.colFlags].some((f) => f !== null)) {
      // Each flag: threads already along its line can't pass it, and what's left must still reach it.
      const lo = {
        rows: new Array<number>(web.height).fill(0),
        cols: new Array<number>(web.width).fill(0),
      };
      const hi = {
        rows: new Array<number>(web.height).fill(0),
        cols: new Array<number>(web.width).fill(0),
      };
      web.links.forEach((l, i) => {
        const a = web.knots[l.a] as Knot;
        const b = web.knots[l.b] as Knot;
        const line =
          a.r === b.r ? (['rows', a.r] as const) : a.c === b.c ? (['cols', a.c] as const) : null;
        if (!line) return;
        const v = val[i] ?? -1;
        lo[line[0]][line[1]] = (lo[line[0]][line[1]] ?? 0) + Math.max(v, 0);
        hi[line[0]][line[1]] = (hi[line[0]][line[1]] ?? 0) + (v === -1 ? 2 : v);
      });
      for (const [flags, k] of [
        [web.rowFlags, 'rows'],
        [web.colFlags, 'cols'],
      ] as const)
        for (const [line, f] of flags.entries())
          if (f !== null && ((lo[k][line] ?? 0) > f || (hi[k][line] ?? 0) < f)) return false;
    }
    if (connected) {
      // A finished piece with knots left outside it can never join up.
      const threads = Array.from(val, (v) => Math.max(0, v));
      const piece = pieces(web, threads);
      const open = new Set<number>();
      web.links.forEach((l, i) => {
        if (val[i] === -1) open.add(piece[l.a] ?? -1).add(piece[l.b] ?? -1);
      });
      const all = new Set(piece);
      if (all.size > 1 && [...all].some((p) => !open.has(p))) return false;
    }
    return true;
  };

  const go = (val: Int8Array): void => {
    if (found.length >= limit || !propagate(val)) return;
    let pick = -1;
    let best = 99;
    for (let i = 0; i < L; i++) {
      if (val[i] !== -1) continue;
      const l = web.links[i] as Link;
      const free = [l.a, l.b].reduce(
        (s, k) => s + (web.incident[k] ?? []).filter((j) => val[j] === -1).length,
        0,
      );
      if (free < best) {
        best = free;
        pick = i;
      }
    }
    if (pick < 0) {
      const threads = Array.from(val);
      if (solved(web, threads, rules)) found.push(threads);
      return;
    }
    for (const v of [0, 1, 2]) {
      const next = Int8Array.from(val);
      next[pick] = v;
      go(next);
    }
  };
  go(new Int8Array(L).fill(-1));
  return found;
}

export const countSolutions = (web: Web, limit = 2, rules: Rules = {}): number =>
  solve(web, limit, rules).length;

export interface GenOptions {
  width: number;
  height: number;
  knots: number;
  seed: number;
  diagonal?: boolean;
  /** Colour the knots red and green, threads only between different colours. */
  colours?: boolean;
  /** Grow one unbranched string (the knots in order). */
  string?: boolean;
  /** Chance a thread is doubled. */
  doubles?: number;
  /** Chance of each extra thread between knots that can see each other (making loops). */
  extra?: number;
  /** Longest thread, in squares. */
  reach?: number;
}

/** A random web with a known answer: the panel (every clue a number) and its threads. */
export function generate(o: GenOptions): { panel: Panel; threads: number[] } | null {
  const random = rng(o.seed);
  const pick = <T>(xs: T[]): T => xs[Math.floor(random() * xs.length)] as T;
  const dirs = (o.diagonal ? [...ORTHO, ...DIAG] : ORTHO).flatMap((d): Dir[] => [
    d,
    [-d[0], -d[1]],
  ]);
  const spots: Spot[] = [[Math.floor(random() * o.height), Math.floor(random() * o.width)]];
  const colour: ('r' | 'g')[] = ['r'];
  const used = new Set<string>(); // points under threads
  const edges: [number, number, number][] = []; // knot, knot, threads
  const isKnot = (r: number, c: number): boolean => spots.some((s) => s[0] === r && s[1] === c);
  for (let tries = 0; spots.length < o.knots && tries < 4000; tries++) {
    const from = o.string ? spots.length - 1 : Math.floor(random() * spots.length);
    const [r0, c0] = spots[from] as Spot;
    const d = pick(dirs);
    const len = 1 + Math.floor(random() * (o.reach ?? 4));
    const r = r0 + d[0] * len;
    const c = c0 + d[1] * len;
    if (
      r < 0 ||
      r >= o.height ||
      c < 0 ||
      c >= o.width ||
      isKnot(r, c) ||
      used.has(`${2 * r},${2 * c}`)
    )
      continue;
    let clear = true;
    const points: string[] = [];
    for (let t = 1; t < len * 2 && clear; t++) {
      const pr = 2 * r0 + d[0] * t;
      const pc = 2 * c0 + d[1] * t;
      points.push(`${pr},${pc}`);
      if (used.has(`${pr},${pc}`) || (pr % 2 === 0 && pc % 2 === 0 && isKnot(pr / 2, pc / 2)))
        clear = false;
    }
    if (!clear) continue;
    points.forEach((p) => used.add(p));
    spots.push([r, c]);
    colour.push(colour[from] === 'r' ? 'g' : 'r');
    edges.push([from, spots.length - 1, random() < (o.doubles ?? 0.35) ? 2 : 1]);
  }
  if (spots.length < o.knots) return null;
  const rows = Array.from({ length: o.height }, (_, r) =>
    Array.from({ length: o.width }, (_, c) => (isKnot(r, c) ? '1' : '.')).join(''),
  );
  const colours = Array.from({ length: o.height }, (_, r) =>
    Array.from({ length: o.width }, (_, c) => {
      const k = spots.findIndex((s) => s[0] === r && s[1] === c);
      return k < 0 ? '.' : (colour[k] as string);
    }).join(''),
  );
  const shape: Panel = { name: 'generated', rows, diagonal: o.diagonal ?? false };
  if (o.colours) shape.colours = colours;
  const web = parse(shape);
  const index = (k: number): number => {
    const [r, c] = spots[k] as Spot;
    return web.knots.findIndex((n) => n.r === r && n.c === c);
  };
  const threads = web.links.map(() => 0);
  const linkOf = (a: number, b: number): number =>
    web.links.findIndex((l) => (l.a === a && l.b === b) || (l.a === b && l.b === a));
  for (const [a, b, n] of edges) {
    const i = linkOf(index(a), index(b));
    if (i < 0) return null; // a later knot landed between them
    threads[i] = n;
  }
  if (!o.string)
    web.links.forEach((_, i) => {
      if (threads[i] || random() >= (o.extra ?? 0)) return;
      if ((web.crosses[i] ?? []).some((j) => threads[j])) return;
      threads[i] = random() < (o.doubles ?? 0.35) ? 2 : 1;
    });
  if (web.crosses.some((cross, i) => threads[i] && cross.some((j) => threads[j]))) return null;
  const t = totals(web, threads);
  if (t.some((n) => n > 9)) return null;
  const panel: Panel = {
    name: 'generated',
    rows: rows.map((row, r) =>
      [...row]
        .map((ch, c) =>
          ch === '.' ? '.' : String(t[web.knots.findIndex((k) => k.r === r && k.c === c)]),
        )
        .join(''),
    ),
  };
  if (o.diagonal) panel.diagonal = true;
  if (o.colours) panel.colours = colours;
  if (o.string) panel.ends = [spots[0] as Spot, spots[spots.length - 1] as Spot];
  return { panel, threads };
}

/** Replace the clue at a spot (a digit, a letter or '?'). */
export function withClue(panel: Panel, [r, c]: Spot, clue: string): Panel {
  return {
    ...panel,
    rows: panel.rows.map((row, i) => (i === r ? row.slice(0, c) + clue + row.slice(c + 1) : row)),
  };
}
