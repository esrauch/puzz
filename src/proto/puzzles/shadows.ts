/**
 * Halloween · The Star in the Shadows (stray, from Christmas). Cut-out
 * shapes stand between a candle and the wall. Arrange them so their shadows
 * make the star: a shape nearer the candle throws a bigger shadow. Every
 * shape casts one, so the ones you don't need must hide inside the star.
 */
import { type Proto, h } from '../kit';

export const WALL = 12;
export type Cells = [number, number][];

export interface Piece {
  name: string;
  cells: Cells;
}

export const PIECES: Piece[] = [
  {
    name: 'Plus',
    cells: [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, 2],
      [2, 1],
    ],
  },
  { name: 'Square', cells: [[0, 0]] },
  { name: 'Square', cells: [[0, 0]] },
  {
    name: 'Bar',
    cells: [
      [0, 0],
      [1, 0],
    ],
  },
  {
    name: 'Bar',
    cells: [
      [0, 0],
      [1, 0],
    ],
  },
  {
    name: 'Hook',
    cells: [
      [0, 0],
      [1, 0],
      [1, 1],
    ],
  },
];

export interface Placed {
  row: number;
  col: number;
  /** 1 by the wall, 2 nearer, 3 nearest the candle: the shadow's scale. */
  depth: number;
  /** Quarter turns clockwise. */
  turns: number;
}

/** The solution the star is made from (the target is its shadow). */
export const SOLUTION: Placed[] = [
  { row: 3, col: 3, depth: 2, turns: 0 },
  { row: 1, col: 5, depth: 2, turns: 0 },
  { row: 9, col: 5, depth: 2, turns: 0 },
  { row: 5, col: 2, depth: 1, turns: 0 },
  { row: 5, col: 9, depth: 1, turns: 0 },
  { row: 5, col: 5, depth: 1, turns: 0 },
];

function rotate(cells: Cells, turns: number): Cells {
  let out = cells;
  for (let i = 0; i < ((turns % 4) + 4) % 4; i++)
    out = out.map(([r, c]) => [c, -r] as [number, number]);
  const minR = Math.min(...out.map(([r]) => r));
  const minC = Math.min(...out.map(([, c]) => c));
  return out.map(([r, c]) => [r - minR, c - minC] as [number, number]);
}

/** The wall cells a piece's shadow covers. */
export function shadowOf(piece: Piece, p: Placed): Cells {
  const out: Cells = [];
  for (const [r, c] of rotate(piece.cells, p.turns))
    for (let dr = 0; dr < p.depth; dr++)
      for (let dc = 0; dc < p.depth; dc++)
        out.push([p.row + r * p.depth + dr, p.col + c * p.depth + dc]);
  return out;
}

export function wall(placed: Placed[]): Set<string> {
  const out = new Set<string>();
  placed.forEach((p, i) => {
    const piece = PIECES[i];
    if (piece) for (const [r, c] of shadowOf(piece, p)) out.add(`${r},${c}`);
  });
  return out;
}

export const TARGET = wall(SOLUTION);
export const matchesStar = (placed: Placed[]): boolean => {
  const w = wall(placed);
  return w.size === TARGET.size && [...w].every((k) => TARGET.has(k));
};

export const shadows: Proto = {
  id: 'shadows',
  title: 'The Star in the Shadows',
  room: 'Halloween',
  kind: 'stray',
  from: "Clandestiny's 13 Easy Pieces and 7th Guest's Grate (fit the pieces); twist: they fit in shadow, at depth",
  rules:
    "Six cut-outs stand between the candle and the wall; their shadows (dark) must exactly make the star (outlined). Pick a shape, then click the wall to move it, turn it, or set its depth: 1 is by the wall (shadow its own size), 2 and 3 nearer the candle (shadow twice or three times as big). Every shape throws a shadow, so any you don't need must hide inside the star.",
  mount(host, ctx) {
    const placed: Placed[] = PIECES.map((_, i) => ({
      row: 0,
      col: (i * 2) % WALL,
      depth: 1,
      turns: 0,
    }));
    let picked = 0;
    const board = h('div', {});
    const controls = h('div', {
      style: { display: 'flex', gap: '6px', flexWrap: 'wrap', margin: '8px 0' },
    });
    const render = (): void => {
      const lit = wall(placed);
      const mine = new Set(
        shadowOf(PIECES[picked] as Piece, placed[picked] as Placed).map(([r, c]) => `${r},${c}`),
      );
      const g = h('div', {
        style: {
          display: 'grid',
          gridTemplateColumns: `repeat(${WALL}, 30px)`,
          gap: '1px',
          background: '#d9d3c7',
          width: 'fit-content',
        },
      });
      for (let r = 0; r < WALL; r++)
        for (let c = 0; c < WALL; c++) {
          const k = `${r},${c}`;
          g.append(
            h('div', {
              onclick: () => {
                const p = placed[picked];
                if (p) {
                  p.row = r;
                  p.col = c;
                }
                render();
              },
              style: {
                width: '30px',
                height: '30px',
                cursor: 'pointer',
                background: lit.has(k)
                  ? mine.has(k)
                    ? '#5a4a6e'
                    : '#2b2a33'
                  : TARGET.has(k)
                    ? '#ffe9a8'
                    : '#fbf8f2',
                outline: TARGET.has(k) ? '1px solid #c9a227' : 'none',
                outlineOffset: '-1px',
              },
            }),
          );
        }
      board.replaceChildren(g);
      const p = placed[picked] as Placed;
      controls.replaceChildren(
        ...PIECES.map((piece, i) =>
          h(
            'button',
            { class: picked === i ? 'on' : '', onclick: () => ((picked = i), render()) },
            `${piece.name} ${i + 1}`,
          ),
        ),
        h('span', { style: { width: '14px' } }),
        h('button', { onclick: () => ((p.turns = (p.turns + 1) % 4), render()) }, 'Turn'),
        ...[1, 2, 3].map((d) =>
          h(
            'button',
            { class: p.depth === d ? 'on' : '', onclick: () => ((p.depth = d), render()) },
            `Depth ${d}`,
          ),
        ),
      );
      if (matchesStar(placed)) ctx.solved();
      else ctx.status(`Star: ${TARGET.size} squares · shadows: ${lit.size}`);
    };
    host.append(controls, board);
    render();
  },
};
