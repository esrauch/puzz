/** Random webs with a known answer, grown knot by knot from a starting knot. */
import { type Frame, mirrorSquare } from '../core/mirror';
import { rng } from '../core/rng';
import { DIAG, type Dir, type Knot, ORTHO, type Panel, type Spot, type Web, parse } from './model';
import { pieces, totals } from './rules';

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
export function makeWeb(o: GenOptions): { panel: Panel; threads: number[] } | null {
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

/**
 * Colour a web's knots red and green along its answer's threads, so every
 * thread joins red to green. Knots are coloured one by one, opposite to their
 * coloured neighbours; one whose neighbours are already both colours (a loop
 * of odd length) stays plain, and plain knots join anything.
 */
export function colourWeb(web: Web, threads: number[], random: () => number): string[] {
  const colour = web.knots.map((): 'r' | 'g' | '.' | null => null);
  const near = web.knots.map((_, k) =>
    (web.incident[k] ?? []).flatMap((i) => {
      const l = web.links[i];
      return l && threads[i] ? [l.a === k ? l.b : l.a] : [];
    }),
  );
  for (let start = 0; start < web.knots.length; start++) {
    if (colour[start] !== null) continue;
    const queue = [start];
    const seen = new Set(queue);
    while (queue.length) {
      const k = queue.shift() as number;
      const around = new Set(
        (near[k] ?? []).map((j) => colour[j]).filter((c) => c === 'r' || c === 'g'),
      );
      colour[k] =
        around.size === 2
          ? '.'
          : around.has('r')
            ? 'g'
            : around.has('g')
              ? 'r'
              : random() < 0.5
                ? 'r'
                : 'g';
      for (const j of near[k] ?? [])
        if (!seen.has(j) && colour[j] === null) {
          seen.add(j);
          queue.push(j);
        }
    }
  }
  return Array.from({ length: web.height }, (_, r) =>
    Array.from({ length: web.width }, (_, c) => {
      const k = web.knots.findIndex((n) => n.r === r && n.c === c);
      return k < 0 ? '.' : (colour[k] ?? '.');
    }).join(''),
  );
}

/** The whole board as a snowflake frame, mirrored across its middle column ('v') or row ('h'). */
export const wholeBoard = (width: number, height: number, axis: 'v' | 'h'): Frame => ({
  top: 0,
  left: 0,
  bottom: height - 1,
  right: width - 1,
  axis,
});

/**
 * A random web whose joins are their own mirror image across the whole board
 * (snowflakes): grow a web on half the board, middle line included, and
 * reflect its knots and joins; each side then picks its own singles and
 * doubles, so mirror knots usually show different numbers. The half must
 * reach the middle line, where the two halves meet. Threads straight across
 * the line, joining a knot to its own reflection, may be added too.
 */
export function makeMirroredWeb(
  o: GenOptions & { axis: 'v' | 'h' },
): { panel: Panel; threads: number[] } | null {
  const vertical = o.axis === 'v';
  const half = makeWeb({
    ...o,
    width: vertical ? Math.ceil(o.width / 2) : o.width,
    height: vertical ? o.height : Math.ceil(o.height / 2),
    knots: Math.ceil(o.knots / 2) + 1,
  });
  if (!half) return null;
  const frame = wholeBoard(o.width, o.height, o.axis);
  const hw = parse({ name: 'half', rows: half.panel.rows });
  const onLine = (r: number, c: number): boolean =>
    vertical ? c === (o.width - 1) / 2 : r === (o.height - 1) / 2;
  if (!hw.knots.some((k) => onLine(k.r, k.c))) return null;
  const grid = Array.from({ length: o.height }, () => new Array<string>(o.width).fill('.'));
  for (const k of hw.knots) {
    const [mr, mc] = mirrorSquare(frame, k.r, k.c);
    (grid[k.r] as string[])[k.c] = '1';
    (grid[mr] as string[])[mc] = '1';
  }
  const rows = grid.map((r) => r.join(''));
  const web = parse({ name: 'mirrored', rows });
  const pair = (a: { r: number; c: number }, b: { r: number; c: number }): string =>
    [`${a.r},${a.c}`, `${b.r},${b.c}`].sort().join('-');
  const random = rng(o.seed * 31 + 7);
  const want = new Map<string, number>();
  hw.links.forEach((l, i) => {
    const n = half.threads[i] ?? 0;
    if (!n) return;
    const a = hw.knots[l.a] as Knot;
    const b = hw.knots[l.b] as Knot;
    const [ar, ac] = mirrorSquare(frame, a.r, a.c);
    const [br, bc] = mirrorSquare(frame, b.r, b.c);
    const own = pair(a, b);
    const mirror = pair({ r: ar, c: ac }, { r: br, c: bc });
    want.set(own, n);
    // Each side its own single or double (a join that's its own reflection keeps one).
    if (mirror !== own) want.set(mirror, random() < (o.doubles ?? 0.35) ? 2 : 1);
  });
  const threads = web.links.map(
    (l) => want.get(pair(web.knots[l.a] as Knot, web.knots[l.b] as Knot)) ?? 0,
  );
  if (threads.filter(Boolean).length !== want.size) return null; // a reflected knot landed in a thread's way
  web.links.forEach((l, i) => {
    const a = web.knots[l.a] as Knot;
    const b = web.knots[l.b] as Knot;
    const [mr, mc] = mirrorSquare(frame, a.r, a.c);
    if (threads[i] || mr !== b.r || mc !== b.c || random() >= (o.extra ?? 0)) return;
    if ((web.crosses[i] ?? []).some((j) => threads[j])) return;
    threads[i] = random() < (o.doubles ?? 0.35) ? 2 : 1;
  });
  if (web.crosses.some((cross, i) => threads[i] && cross.some((j) => threads[j]))) return null;
  if (new Set(pieces(web, threads)).size > 1) return null;
  const t = totals(web, threads);
  if (t.some((n) => n > 8 || n < 1)) return null;
  return {
    panel: {
      name: 'generated',
      rows: rows.map((row, r) =>
        [...row]
          .map((ch, c) =>
            ch === '.' ? '.' : String(t[web.knots.findIndex((k) => k.r === r && k.c === c)]),
          )
          .join(''),
      ),
    },
    threads,
  };
}
