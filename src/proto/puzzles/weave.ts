/**
 * Easter · The Woven Cornucopia (stray, from Thanksgiving).
 * Turn the wicker tiles so every strand runs unbroken, and wherever two
 * strands cross they alternate: over, under, over, along each strand.
 */
import { type Proto, h, rng } from '../kit';

/** Tile edges as bits: N 1, E 2, S 4, W 8. */
const N = 1;
const E = 2;
const S = 4;
const W = 8;
const DIRS = [N, E, S, W];
const STEP: Record<number, [number, number]> = {
  [N]: [-1, 0],
  [E]: [0, 1],
  [S]: [1, 0],
  [W]: [0, -1],
};
const OPP: Record<number, number> = { [N]: S, [E]: W, [S]: N, [W]: E };

export type Tile =
  | { kind: 'empty' }
  | { kind: 'path'; edges: number }
  /** A crossing: both straight through; `hOver`: the east-west strand is on top. */
  | { kind: 'cross'; hOver: boolean };

export const SIZE = 5;
/** The real level's size. */
export const BIG = 7;

/** The woven horn, solved (its strands snake and cross five times). */
export function solvedWeave(): Tile[][] {
  const g: Tile[][] = Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => ({ kind: 'empty' }) as Tile),
  );
  const path = (r: number, c: number, edges: number): void =>
    void (g[r] && (g[r][c] = { kind: 'path', edges }));
  const cross = (r: number, c: number, hOver: boolean): void =>
    void (g[r] && (g[r][c] = { kind: 'cross', hOver }));
  // Strand 1: in from the west on row 1, east to column 3, down to row 3, out east.
  path(1, 0, W | E);
  path(1, 3, W | S);
  path(3, 3, N | E);
  path(3, 4, W | E);
  // Strand 2: down column 1. Strand 3: along row 2. Strand 4: down column 2.
  path(0, 1, N | S);
  path(3, 1, N | S);
  path(4, 1, N | S);
  path(2, 0, W | E);
  path(2, 4, W | E);
  path(0, 2, N | S);
  path(3, 2, N | S);
  path(4, 2, N | S);
  // The crossings, alternating along every strand.
  cross(1, 1, true);
  cross(1, 2, false);
  cross(2, 3, false);
  cross(2, 1, false);
  cross(2, 2, true);
  return g;
}

/** Turn a tile a quarter turn clockwise (a crossing swaps which strand is on top). */
export function turn(t: Tile): Tile {
  if (t.kind === 'cross') return { kind: 'cross', hOver: !t.hOver };
  if (t.kind === 'empty') return t;
  let edges = 0;
  for (const d of DIRS) if (t.edges & d) edges |= d === W ? N : d << 1;
  return { kind: 'path', edges };
}

const edgesOf = (t: Tile | undefined): number =>
  !t || t.kind === 'empty' ? 0 : t.kind === 'cross' ? N | E | S | W : t.edges;

/** Every strand connects, and each alternates over and under at its crossings. */
export function woven(g: Tile[][]): boolean {
  const SIZE = g.length;
  // Matching edges (the frame may take loose ends).
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      for (const d of DIRS) {
        if (!(edgesOf(g[r]?.[c]) & d)) continue;
        const [dr, dc] = STEP[d] as [number, number];
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nc < 0 || nr >= SIZE || nc >= SIZE) continue;
        if (!(edgesOf(g[nr]?.[nc]) & (OPP[d] as number))) return false;
      }
  // Follow each strand from a loose end at the frame, noting over/under at crossings.
  const visited = new Set<string>();
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      for (const d of DIRS) {
        const [dr, dc] = STEP[d] as [number, number];
        const atFrame = r + dr < 0 || c + dc < 0 || r + dr >= SIZE || c + dc >= SIZE;
        if (!atFrame || !(edgesOf(g[r]?.[c]) & d) || visited.has(`${r},${c},${d}`)) continue;
        // Walk inward: enter (r, c) from direction d.
        let at: [number, number] = [r, c];
        let from = d;
        let last: boolean | null = null;
        for (let guard = 0; guard < 100; guard++) {
          const t = g[at[0]]?.[at[1]];
          if (!t || t.kind === 'empty') break;
          let out: number;
          if (t.kind === 'cross') {
            out = OPP[from] as number;
            const horizontal = from === E || from === W;
            const over = horizontal === t.hOver;
            if (last !== null && over === last) return false;
            last = over;
          } else out = (t.edges & ~from) as number;
          const [sr, sc] = STEP[out] as [number, number];
          const next: [number, number] = [at[0] + sr, at[1] + sc];
          if (next[0] < 0 || next[1] < 0 || next[0] >= SIZE || next[1] >= SIZE) {
            visited.add(`${at[0]},${at[1]},${out}`);
            break;
          }
          at = next;
          from = OPP[out] as number;
        }
      }
  return true;
}

export function scrambledWeave(seed = 3): Tile[][] {
  const random = rng(seed);
  return solvedWeave().map((row) =>
    row.map((t) => {
      let out = t;
      const turns = 1 + Math.floor(random() * 3);
      for (let i = 0; i < turns; i++) out = turn(out);
      return out;
    }),
  );
}

/**
 * A real level: `strands` strands snaking across a size×size weave, turning
 * corners and crossing each other square-on, with the over-under made to
 * alternate along every strand (re-rolled until that's possible).
 */
export function generateWeave(seed = 8, size = BIG, strands = 4): Tile[][] {
  const random = rng(seed);
  for (let attempt = 0; attempt < 500; attempt++) {
    const edges = Array.from({ length: size }, () => Array<number>(size).fill(0));
    const crossings = new Set<string>();
    /** Each strand's cells in order, with whether it ran east-west through each. */
    const routes: { cell: string; across: boolean }[][] = [];
    let ok = true;
    for (let s = 0; s < strands && ok; s++) {
      let placed = false;
      for (let tries = 0; tries < 60 && !placed; tries++) {
        // Start on the frame, heading in.
        const side = Math.floor(random() * 4);
        const k = 1 + Math.floor(random() * (size - 2));
        let r = side === 0 ? 0 : side === 2 ? size - 1 : k;
        let c = side === 1 ? size - 1 : side === 3 ? 0 : k;
        let from = side === 0 ? N : side === 1 ? E : side === 2 ? S : W;
        const cells: { r: number; c: number; edges: number; cross: boolean }[] = [];
        const mine = new Set<string>();
        let done = false;
        for (let step = 0; step < size * size; step++) {
          const key = `${r},${c}`;
          if (mine.has(key)) break;
          const busy = edges[r]?.[c] ?? 0;
          let out: number;
          if (busy) {
            // Cross another strand square-on, only through a straight run of it.
            const square =
              (busy === (E | W) && (from === N || from === S)) ||
              (busy === (N | S) && (from === E || from === W));
            if (!square || crossings.has(key)) break;
            out = OPP[from] as number;
          } else {
            const ahead = OPP[from] as number;
            const options = [ahead, ahead, ahead, ...DIRS.filter((x) => x !== from && x !== ahead)];
            out = options[Math.floor(random() * options.length)] as number;
          }
          cells.push({ r, c, edges: from | out, cross: busy !== 0 });
          mine.add(key);
          const [dr, dc] = STEP[out] as [number, number];
          if (r + dr < 0 || c + dc < 0 || r + dr >= size || c + dc >= size) {
            done = cells.length >= size;
            break;
          }
          r += dr;
          c += dc;
          from = OPP[out] as number;
        }
        if (!done) continue;
        for (const cell of cells) {
          const row = edges[cell.r];
          if (!row) continue;
          if (cell.cross) crossings.add(`${cell.r},${cell.c}`);
          row[cell.c] = (row[cell.c] ?? 0) | cell.edges;
        }
        routes.push(
          cells.map((x) => ({ cell: `${x.r},${x.c}`, across: (x.edges & (E | W)) === (E | W) })),
        );
        placed = true;
      }
      if (!placed) ok = false;
    }
    if (!ok || crossings.size < 4) continue;
    // Over-under: hOver per crossing, alternating along each strand (a parity 2-colouring).
    const links = new Map<string, { to: string; flip: boolean }[]>();
    for (const route of routes) {
      const xs = route.filter((x) => crossings.has(x.cell));
      for (let i = 0; i + 1 < xs.length; i++) {
        const a = xs[i] as { cell: string; across: boolean };
        const b = xs[i + 1] as { cell: string; across: boolean };
        // A strand is on top where (it runs east-west) === hOver; it must alternate between a and b.
        const flip = a.across === b.across;
        for (const [p, q] of [
          [a.cell, b.cell],
          [b.cell, a.cell],
        ] as const) {
          const list = links.get(p) ?? [];
          list.push({ to: q, flip });
          links.set(p, list);
        }
      }
    }
    const hOver = new Map<string, boolean>();
    let consistent = true;
    for (const first of crossings) {
      if (hOver.has(first)) continue;
      hOver.set(first, random() < 0.5);
      const stack = [first];
      while (stack.length && consistent) {
        const at = stack.pop() as string;
        for (const { to, flip } of links.get(at) ?? []) {
          const want = flip ? !hOver.get(at) : (hOver.get(at) as boolean);
          if (!hOver.has(to)) {
            hOver.set(to, want);
            stack.push(to);
          } else if (hOver.get(to) !== want) consistent = false;
        }
      }
    }
    if (!consistent) continue;
    return edges.map((row, r) =>
      row.map((e, c) => {
        const key = `${r},${c}`;
        if (crossings.has(key)) return { kind: 'cross', hOver: hOver.get(key) ?? true } as Tile;
        return e ? ({ kind: 'path', edges: e } as Tile) : ({ kind: 'empty' } as Tile);
      }),
    );
  }
  throw new Error('no weave');
}

export function scramble(g: Tile[][], seed = 31): Tile[][] {
  const random = rng(seed);
  return g.map((row) =>
    row.map((t) => {
      let out = t;
      for (let i = Math.floor(random() * 4); i > 0; i--) out = turn(out);
      return out;
    }),
  );
}

export const weave: Proto = {
  id: 'weave',
  title: 'The Woven Cornucopia',
  room: 'Easter',
  kind: 'stray',
  from: "11th Hour's Gems (turn tiles so edges match); twist: the over-under weave must alternate",
  rules:
    'Level 1 teaches the knack, level 2 is the puzzle. Click a wicker tile to turn it a quarter. Every strand must run unbroken (strand ends may leave the edge of the weave). Turning a crossing swaps which strand is on top; along every strand, its crossings must go over, under, over…',
  mount(host, ctx) {
    const levels = [(): Tile[][] => scrambledWeave(), (): Tile[][] => scramble(generateWeave())];
    let level = 0;
    let g = (levels[0] as () => Tile[][])();
    let turns = 0;
    const tabs = h('div', { style: { display: 'flex', gap: '6px', marginBottom: '8px' } });
    const board = h('div', {
      style: {
        display: 'grid',
        gap: '2px',
        background: '#d9d3c7',
        width: 'fit-content',
        padding: '2px',
      },
    });
    const draw = (t: Tile): SVGSVGElement => {
      const ns = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(ns, 'svg');
      svg.setAttribute('viewBox', '0 0 64 64');
      svg.setAttribute('width', '64');
      svg.setAttribute('height', '64');
      const line = (
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        colour: string,
        width = 12,
      ): void => {
        const l = document.createElementNS(ns, 'line');
        Object.entries({
          x1,
          y1,
          x2,
          y2,
          stroke: colour,
          'stroke-width': width,
          'stroke-linecap': 'butt',
        }).forEach(([k, v]) => l.setAttribute(k, String(v)));
        svg.append(l);
      };
      const ends: Record<number, [number, number]> = {
        [N]: [32, 0],
        [E]: [64, 32],
        [S]: [32, 64],
        [W]: [0, 32],
      };
      if (t.kind === 'path')
        for (const d of DIRS)
          if (t.edges & d) line(32, 32, ...(ends[d] as [number, number]), '#b9874f');
      if (t.kind === 'path') {
        const dot = document.createElementNS(ns, 'circle');
        dot.setAttribute('cx', '32');
        dot.setAttribute('cy', '32');
        dot.setAttribute('r', '6');
        dot.setAttribute('fill', '#b9874f');
        svg.append(dot);
      }
      if (t.kind === 'cross') {
        // The under strand first, broken where the over strand passes.
        const [under, over] = t.hOver ? (['v', 'h'] as const) : (['h', 'v'] as const);
        const dark = '#7a5530';
        const light = '#d8a76b';
        if (under === 'v') {
          line(32, 0, 32, 20, dark);
          line(32, 44, 32, 64, dark);
        } else {
          line(0, 32, 20, 32, dark);
          line(44, 32, 64, 32, dark);
        }
        if (over === 'h') line(0, 32, 64, 32, light);
        else line(32, 0, 32, 64, light);
      }
      return svg;
    };
    const render = (): void => {
      tabs.replaceChildren(
        ...['Level 1: the knack of it', 'Level 2: the cornucopia'].map((name, i) =>
          h(
            'button',
            {
              class: level === i ? 'on' : '',
              onclick: () => {
                level = i;
                g = (levels[i] as () => Tile[][])();
                turns = 0;
                render();
              },
            },
            name,
          ),
        ),
      );
      board.style.gridTemplateColumns = `repeat(${g.length}, 64px)`;
      board.replaceChildren(
        ...g.flatMap((row, r) =>
          row.map((t, c) =>
            h(
              'div',
              {
                class: 'cell',
                style: {
                  width: '64px',
                  height: '64px',
                  cursor: t.kind === 'empty' ? 'default' : 'pointer',
                },
                onclick: () => {
                  const tile = g[r]?.[c];
                  if (!tile || tile.kind === 'empty' || !g[r]) return;
                  g[r][c] = turn(tile);
                  turns++;
                  render();
                },
              },
              draw(t),
            ),
          ),
        ),
      );
      if (woven(g)) {
        if (level === levels.length - 1) ctx.solved();
        else ctx.status(`Level 1 done in ${turns} turns. On to level 2!`);
      } else ctx.status(`${turns} turns`);
    };
    host.append(
      tabs,
      h(
        'div',
        { style: { color: '#6b6676', marginBottom: '6px' } },
        'Light strand on top, dark underneath.',
      ),
      board,
    );
    render();
  },
};
