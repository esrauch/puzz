/**
 * Christmas · Centrepiece: the Christmas Tree. Turn the light-string
 * connectors so the power runs from the plug at the foot of the tree
 * through every bulb up to the top, where the Tree-Top Star lights last.
 * Bulbs light as the power reaches them. Level 1 (a small tree) teaches the
 * knack; level 2 is the big tree, wired with far more branches.
 */
import { type Proto, h, rng } from '../kit';

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

/** A tree's shape: its size, which squares hold a connector, and where the plug and star are. */
export interface Shape {
  rows: number;
  cols: number;
  inside: (r: number, c: number) => boolean;
  plug: [number, number];
  star: [number, number];
}

const triangle = (rows: number, cols: number, spread: number): Shape => {
  const mid = Math.floor(cols / 2);
  return {
    rows,
    cols,
    inside: (r, c) =>
      r >= 0 && c >= 0 && r < rows && c < cols && Math.abs(c - mid) <= Math.floor((r + 1) * spread),
    plug: [rows - 1, mid],
    star: [0, mid],
  };
};

export const LEVELS: {
  name: string;
  shape: Shape;
  wiring: 'winding' | 'branching';
  seed: number;
}[] = [
  { name: 'Level 1: the knack of it', shape: triangle(7, 7, 0.5), wiring: 'winding', seed: 21 },
  { name: 'Level 2: the big tree', shape: triangle(11, 15, 0.75), wiring: 'branching', seed: 5 },
];

export const rotate = (edges: number): number =>
  DIRS.reduce((out, d) => (edges & d ? out | (d === W ? N : d << 1) : out), 0);

/**
 * The wiring, solved: a tree of connections joining every square (no loops),
 * plus the plug's end and the star's. "Winding" grows one long path at a time
 * (long runs, easy to follow); "branching" joins squares in random order (lots
 * of T-junctions, much harder to reason about).
 */
export function solvedLights(
  shape: Shape,
  wiring: 'winding' | 'branching',
  seed: number,
): number[][] {
  const random = rng(seed);
  const { rows, cols, inside, plug, star } = shape;
  const g = Array.from({ length: rows }, () => Array<number>(cols).fill(0));
  const link = (r: number, c: number, d: number): void => {
    const [dr, dc] = STEP[d] as [number, number];
    const row = g[r];
    const next = g[r + dr];
    if (!row || !next) return;
    row[c] = (row[c] ?? 0) | d;
    next[c + dc] = (next[c + dc] ?? 0) | (OPP[d] as number);
  };
  if (wiring === 'winding') {
    const seen = new Set<string>([plug.join()]);
    const stack: [number, number][] = [plug];
    while (stack.length) {
      const [r, c] = stack[stack.length - 1] as [number, number];
      const options = DIRS.filter((d) => {
        const [dr, dc] = STEP[d] as [number, number];
        return inside(r + dr, c + dc) && !seen.has(`${r + dr},${c + dc}`);
      });
      if (!options.length) {
        stack.pop();
        continue;
      }
      const d = options[Math.floor(random() * options.length)] as number;
      const [dr, dc] = STEP[d] as [number, number];
      link(r, c, d);
      seen.add(`${r + dr},${c + dc}`);
      stack.push([r + dr, c + dc]);
    }
  } else {
    // Randomised Kruskal: every possible joint in random order, kept unless it makes a loop.
    const parent = new Map<string, string>();
    const find = (k: string): string => {
      let p = parent.get(k) ?? k;
      while (p !== (parent.get(p) ?? p)) p = parent.get(p) ?? p;
      parent.set(k, p);
      return p;
    };
    const joints: [number, number, number][] = [];
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        if (!inside(r, c)) continue;
        if (inside(r, c + 1)) joints.push([r, c, E]);
        if (inside(r + 1, c)) joints.push([r, c, S]);
      }
    for (let i = joints.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [joints[i], joints[j]] = [
        joints[j] as [number, number, number],
        joints[i] as [number, number, number],
      ];
    }
    for (const [r, c, d] of joints) {
      const [dr, dc] = STEP[d] as [number, number];
      const a = find(`${r},${c}`);
      const b = find(`${r + dr},${c + dc}`);
      if (a === b) continue;
      parent.set(a, b);
      link(r, c, d);
    }
  }
  const plugRow = g[plug[0]];
  const starRow = g[star[0]];
  if (plugRow) plugRow[plug[1]] = (plugRow[plug[1]] ?? 0) | S;
  if (starRow) starRow[star[1]] = (starRow[star[1]] ?? 0) | N;
  return g;
}

export function scrambledLights(level = 0): number[][] {
  const { shape, wiring, seed } = LEVELS[level] as (typeof LEVELS)[number];
  const random = rng(seed + 100);
  return solvedLights(shape, wiring, seed).map((row) =>
    row.map((e) => {
      let out = e;
      for (let i = Math.floor(random() * 4); i > 0; i--) out = rotate(out);
      return out;
    }),
  );
}

/** Squares the power reaches from the plug (through matching connections). */
export function lit(shape: Shape, g: number[][]): Set<string> {
  const { plug, inside } = shape;
  const out = new Set<string>();
  if (!((g[plug[0]]?.[plug[1]] ?? 0) & S)) return out;
  const stack: [number, number][] = [plug];
  out.add(plug.join());
  while (stack.length) {
    const [r, c] = stack.pop() as [number, number];
    for (const d of DIRS) {
      if (!((g[r]?.[c] ?? 0) & d)) continue;
      const [dr, dc] = STEP[d] as [number, number];
      const nr = r + dr;
      const nc = c + dc;
      if (!inside(nr, nc) || !((g[nr]?.[nc] ?? 0) & (OPP[d] as number)) || out.has(`${nr},${nc}`))
        continue;
      out.add(`${nr},${nc}`);
      stack.push([nr, nc]);
    }
  }
  return out;
}

/** Lit throughout, no loose ends, and the star end pointing up at the top. */
export function allLit(shape: Shape, g: number[][]): boolean {
  const { rows, cols, inside, plug, star } = shape;
  const on = lit(shape, g);
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (!inside(r, c)) continue;
      if (!on.has(`${r},${c}`)) return false;
      for (const d of DIRS) {
        if (!((g[r]?.[c] ?? 0) & d)) continue;
        if (
          (r === plug[0] && c === plug[1] && d === S) ||
          (r === star[0] && c === star[1] && d === N)
        )
          continue;
        const [dr, dc] = STEP[d] as [number, number];
        if (!inside(r + dr, c + dc) || !((g[r + dr]?.[c + dc] ?? 0) & (OPP[d] as number)))
          return false;
      }
    }
  return ((g[star[0]]?.[star[1]] ?? 0) & N) !== 0;
}

export const tree: Proto = {
  id: 'tree',
  title: 'The Christmas Tree',
  room: 'Christmas',
  kind: 'centrepiece',
  from: "7th Guest's Heart Maze (switch the paths) and Shivers' gears; twist: the bulbs light up as the power reaches them",
  rules:
    'Click a connector to turn it a quarter. Power comes in from the plug at the foot of the tree; bulbs light as it reaches them. Light every bulb, leave no loose wires, and run the top connector up to the star. Level 1 teaches the knack; level 2 is the big tree.',
  mount(host, ctx) {
    let level = 0;
    let g = scrambledLights(0);
    let turns = 0;
    const tabs = h('div', { style: { display: 'flex', gap: '6px', marginBottom: '8px' } });
    const view = h('div', {});
    const ns = 'http://www.w3.org/2000/svg';
    const render = (): void => {
      const { shape } = LEVELS[level] as (typeof LEVELS)[number];
      const size = shape.cols > 9 ? 40 : 50;
      tabs.replaceChildren(
        ...LEVELS.map((l, i) =>
          h(
            'button',
            {
              class: level === i ? 'on' : '',
              onclick: () => ((level = i), (g = scrambledLights(i)), (turns = 0), render()),
            },
            l.name,
          ),
        ),
      );
      const on = lit(shape, g);
      const done = allLit(shape, g);
      const grid = h('div', {
        style: {
          display: 'grid',
          gridTemplateColumns: `repeat(${shape.cols}, ${size}px)`,
          gap: '2px',
          width: 'fit-content',
        },
      });
      for (let r = 0; r < shape.rows; r++)
        for (let c = 0; c < shape.cols; c++) {
          if (!shape.inside(r, c)) {
            grid.append(h('div', { style: { width: `${size}px`, height: `${size}px` } }));
            continue;
          }
          const e = g[r]?.[c] ?? 0;
          const svg = document.createElementNS(ns, 'svg');
          svg.setAttribute('viewBox', '0 0 50 50');
          svg.setAttribute('width', String(size));
          svg.setAttribute('height', String(size));
          const live = on.has(`${r},${c}`);
          const ends: Record<number, [number, number]> = {
            [N]: [25, 0],
            [E]: [50, 25],
            [S]: [25, 50],
            [W]: [0, 25],
          };
          for (const d of DIRS)
            if (e & d) {
              const l = document.createElementNS(ns, 'line');
              const [x, y] = ends[d] as [number, number];
              Object.entries({
                x1: 25,
                y1: 25,
                x2: x,
                y2: y,
                stroke: live ? '#2f9e5b' : '#7d7d7d',
                'stroke-width': 6,
              }).forEach(([k, v]) => l.setAttribute(k, String(v)));
              svg.append(l);
            }
          const bulb = document.createElementNS(ns, 'circle');
          Object.entries({
            cx: 25,
            cy: 25,
            r: 9,
            fill: live ? ['#ff5252', '#ffd54f', '#64b5f6', '#ff8fb8'][(r * 3 + c) % 4] : '#ddd',
            stroke: '#555',
          }).forEach(([k, v]) => bulb.setAttribute(k, String(v)));
          svg.append(bulb);
          grid.append(
            h(
              'div',
              {
                style: {
                  width: `${size}px`,
                  height: `${size}px`,
                  background: '#1f3d2b',
                  cursor: 'pointer',
                  borderRadius: '4px',
                },
                onclick: () => {
                  const row = g[r];
                  if (row) row[c] = rotate(row[c] ?? 0);
                  turns++;
                  render();
                },
              },
              svg,
            ),
          );
        }
      const width = `${shape.cols * (size + 2)}px`;
      view.replaceChildren(
        h(
          'div',
          {
            style: {
              textAlign: 'center',
              width,
              fontSize: '34px',
              color: done ? '#f4c430' : '#ccc',
            },
          },
          '★',
        ),
        grid,
        h('div', { style: { textAlign: 'center', width } }, '🔌 plug'),
      );
      if (done) {
        if (level === LEVELS.length - 1) ctx.solved();
        else ctx.status(`Level 1 lit in ${turns} turns. On to level 2!`);
      } else ctx.status(`${on.size} bulbs lit · ${turns} turns`);
    };
    host.append(tabs, view);
    render();
  },
};
