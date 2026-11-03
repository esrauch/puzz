/**
 * The final puzzle: a holiday for Tuesday. Six short parts, each a remix of
 * one room's style: a card (Valentine's), Tuesday's colours (Easter), a
 * parade (Fourth of July), clearing the porch (Halloween), the gravy
 * (Thanksgiving) and the presents (Christmas). Finish all six and
 * Tuesday's party begins.
 */
import { type Proto, h, rng } from '../kit';

/** Dye bits for Tuesday's colours: red 1, blue 4; mixes are their sums (red + blue = purple 5). */
export const RED = 1;
export const BLUE = 4;

export interface Dip {
  line: 'row' | 'col';
  index: number;
  /** RED, BLUE, or 0 for vinegar. */
  dye: number;
}

/** Dip a whole row or column: the dye mixes into every egg in it (vinegar clears them). */
export function dip(grid: number[][], d: Dip): number[][] {
  return grid.map((row, r) =>
    row.map((egg, c) => {
      if ((d.line === 'row' ? r : c) !== d.index) return egg;
      return d.dye === 0 ? 0 : egg | d.dye;
    }),
  );
}

export const same = (a: number[][], b: number[][]): boolean =>
  a.every((row, r) => row.every((v, c) => v === b[r]?.[c]));

// --- Parts' rules, plain (tested) ---

export const CARD = 'HAPPYTUESDAY';
export function scrambledCard(seed = 4): string[] {
  const random = rng(seed);
  const letters = CARD.split('');
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [letters[i], letters[j]] = [letters[j] as string, letters[i] as string];
  }
  return letters;
}

export const COLOURS_TARGET = [
  [1, 5, 1],
  [0, 4, 0],
  [1, 5, 1],
];

export const FLOATS = ['Heart', 'Egg', 'Star', 'Turkey'] as const;
export const PARADE_CLUES = [
  "The Heart float isn't first, and it isn't last.",
  'The Egg float comes right behind the Heart float.',
  'The Star float is somewhere ahead of the Turkey float.',
  'The Turkey float brings up the rear.',
];
export const paradeOk = (order: string[]): boolean => {
  const at = (f: string): number => order.indexOf(f);
  return (
    order.length === 4 &&
    new Set(order).size === 4 &&
    at('Heart') > 0 &&
    at('Heart') < 3 &&
    at('Egg') === at('Heart') + 1 &&
    at('Star') < at('Turkey') &&
    at('Turkey') === 3
  );
};

/** Pumpkin solitaire on a 4×4 porch: jump one pumpkin over a neighbour into a gap, removing it; leave one. */
export const PORCH = 4;
/** Seven pumpkins that can be cleared down to one (checked by the tests). */
export const PORCH_START = [6, 7, 8, 9, 10, 11, 12];
export function porchStart(): boolean[] {
  return Array.from({ length: PORCH * PORCH }, (_, i) => PORCH_START.includes(i));
}
export function jump(pegs: boolean[], from: number, to: number): boolean[] | null {
  const fr = Math.floor(from / PORCH);
  const fc = from % PORCH;
  const tr = Math.floor(to / PORCH);
  const tc = to % PORCH;
  const straight = (fr === tr && Math.abs(fc - tc) === 2) || (fc === tc && Math.abs(fr - tr) === 2);
  const over = ((fr + tr) / 2) * PORCH + (fc + tc) / 2;
  if (!straight || !pegs[from] || !pegs[over] || pegs[to]) return null;
  const out = [...pegs];
  out[from] = false;
  out[over] = false;
  out[to] = true;
  return out;
}

/** Gravy jugs: a 3-cup and a 5-cup jug; get exactly 4 cups in the big one. */
export type Jugs = [number, number];
export const JUG_SIZES: Jugs = [3, 5];
export function jugAction(j: Jugs, action: string): Jugs {
  const [a, b] = j;
  switch (action) {
    case 'fill small':
      return [3, b];
    case 'fill big':
      return [a, 5];
    case 'empty small':
      return [0, b];
    case 'empty big':
      return [a, 0];
    case 'small into big': {
      const pour = Math.min(a, 5 - b);
      return [a - pour, b + pour];
    }
    case 'big into small': {
      const pour = Math.min(b, 3 - a);
      return [a + pour, b - pour];
    }
    default:
      return j;
  }
}
export const JUG_ACTIONS = [
  'fill small',
  'fill big',
  'empty small',
  'empty big',
  'small into big',
  'big into small',
];

/** Presents: pack a long one and two L-shaped ones (four squares each) into a 3×4 box. */
export const BOX_ROWS = 3;
export const BOX_COLS = 4;
export const PRESENTS: { name: string; cells: [number, number][] }[] = [
  {
    name: 'I',
    cells: [
      [0, 0],
      [0, 1],
      [0, 2],
      [0, 3],
    ],
  },
  {
    name: 'L',
    cells: [
      [0, 0],
      [1, 0],
      [1, 1],
      [1, 2],
    ],
  },
  {
    name: 'L',
    cells: [
      [0, 0],
      [1, 0],
      [1, 1],
      [1, 2],
    ],
  },
];
export function turnCells(cells: [number, number][], turns: number): [number, number][] {
  let out = cells;
  for (let i = 0; i < turns % 4; i++) out = out.map(([r, c]) => [c, -r] as [number, number]);
  const minR = Math.min(...out.map(([r]) => r));
  const minC = Math.min(...out.map(([, c]) => c));
  return out.map(([r, c]) => [r - minR, c - minC] as [number, number]);
}

// --- The parts, on screen ---

interface Part {
  name: string;
  room: string;
  rules: string;
  mount(host: HTMLElement, done: () => void): void;
}

const PARTS: Part[] = [
  {
    name: 'A card for Tuesday',
    room: "Valentine's",
    rules: 'Click two letters to swap them. Write the card.',
    mount(host, done) {
      const letters = scrambledCard();
      let picked: number | null = null;
      const row = h('div', { style: { display: 'flex', gap: '4px' } });
      const render = (): void => {
        row.replaceChildren(
          ...letters.flatMap((ch, i) => [
            h(
              'button',
              {
                class: picked === i ? 'on' : '',
                style: { width: '40px', height: '44px', fontWeight: '800' },
                onclick: () => {
                  if (picked === null) picked = i;
                  else {
                    const t = letters[picked] as string;
                    letters[picked] = letters[i] as string;
                    letters[i] = t;
                    picked = null;
                  }
                  render();
                },
              },
              ch,
            ),
            ...(i === 4 ? [h('span', { style: { width: '18px' } })] : []),
          ]),
        );
        if (letters.join('') === CARD) done();
      };
      host.append(row);
      render();
    },
  },
  {
    name: "Tuesday's colours",
    room: 'Easter',
    rules:
      'Dip whole rows or columns; dyes mix (red on blue is purple). Match the eggs on the right. Three dips will do.',
    mount(host, done) {
      let grid = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ];
      let dye = RED;
      const fill = [
        '#fff',
        '#e2463b',
        '#f2d03b',
        '#f08a2c',
        '#3b6fd9',
        '#8a4bc2',
        '#4caf50',
        '#7a5230',
      ];
      const view = h('div', {});
      const render = (): void => {
        const egg = (v: number): HTMLElement =>
          h('div', {
            style: {
              width: '26px',
              height: '32px',
              borderRadius: '50%',
              background: fill[v],
              border: '1px solid #999',
            },
          });
        const t = h('div', {
          style: { display: 'grid', gridTemplateColumns: '36px repeat(3, 40px)', gap: '4px' },
        });
        t.append(
          h('span'),
          ...[0, 1, 2].map((c) =>
            h(
              'button',
              { onclick: () => ((grid = dip(grid, { line: 'col', index: c, dye })), render()) },
              '▼',
            ),
          ),
        );
        grid.forEach((row, r) =>
          t.append(
            h(
              'button',
              { onclick: () => ((grid = dip(grid, { line: 'row', index: r, dye })), render()) },
              '▶',
            ),
            ...row.map(egg),
          ),
        );
        view.replaceChildren(
          h(
            'div',
            { style: { display: 'flex', gap: '6px', marginBottom: '6px' } },
            ...[
              [RED, 'Red'],
              [BLUE, 'Blue'],
              [0, 'Vinegar'],
            ].map(([d, l]) =>
              h(
                'button',
                { class: dye === d ? 'on' : '', onclick: () => ((dye = d as number), render()) },
                l as string,
              ),
            ),
          ),
          h(
            'div',
            { style: { display: 'flex', gap: '30px' } },
            t,
            h(
              'div',
              { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 30px)', gap: '4px' } },
              ...COLOURS_TARGET.flat().map(egg),
            ),
          ),
        );
        if (same(grid, COLOURS_TARGET)) done();
      };
      host.append(view);
      render();
    },
  },
  {
    name: "Tuesday's parade",
    room: 'Fourth of July',
    rules: 'Put the floats in order, first to last, so every clue holds.',
    mount(host, done) {
      const order: string[] = ['', '', '', ''];
      host.append(
        h('ul', {}, ...PARADE_CLUES.map((c) => h('li', {}, c))),
        h(
          'div',
          { style: { display: 'flex', gap: '8px' } },
          ...order.map((_, i) =>
            h(
              'label',
              {},
              `${i + 1}. `,
              h(
                'select',
                {
                  onchange: (e: Event) => {
                    order[i] = (e.target as HTMLSelectElement).value;
                    if (paradeOk(order)) done();
                  },
                },
                h('option', { value: '' }, '—'),
                ...FLOATS.map((f) => h('option', { value: f }, f)),
              ),
            ),
          ),
        ),
      );
    },
  },
  {
    name: 'Clear the porch',
    room: 'Halloween',
    rules:
      'Click a pumpkin, then a gap two squares away in a straight line: it jumps, and the pumpkin it jumps over is taken away. Leave just one.',
    mount(host, done) {
      let pegs = porchStart();
      let picked: number | null = null;
      const g = h('div', {
        style: {
          display: 'grid',
          gridTemplateColumns: `repeat(${PORCH}, 46px)`,
          gap: '3px',
          width: 'fit-content',
        },
      });
      const render = (): void => {
        g.replaceChildren(
          ...pegs.map((p, i) =>
            h(
              'div',
              {
                class: 'cell',
                style: {
                  width: '46px',
                  height: '46px',
                  fontSize: '24px',
                  cursor: 'pointer',
                  outline: picked === i ? '3px solid #23202b' : 'none',
                },
                onclick: () => {
                  if (p) picked = i;
                  else if (picked !== null) {
                    const next = jump(pegs, picked, i);
                    if (next) pegs = next;
                    picked = null;
                  }
                  render();
                },
              },
              p ? '🎃' : '',
            ),
          ),
        );
        if (pegs.filter(Boolean).length === 1) done();
      };
      host.append(g);
      render();
    },
  },
  {
    name: 'Gravy for one',
    room: 'Thanksgiving',
    rules:
      'Tuesday wants exactly 4 cups of gravy, in the big jug. You have a 3-cup jug and a 5-cup jug, and a pot of gravy.',
    mount(host, done) {
      let jugs: Jugs = [0, 0];
      const view = h('div', {});
      const render = (): void => {
        view.replaceChildren(
          h(
            'div',
            { style: { margin: '6px 0' } },
            `Small jug: ${jugs[0]} of 3 cups · Big jug: ${jugs[1]} of 5 cups`,
          ),
          h(
            'div',
            { style: { display: 'flex', gap: '6px', flexWrap: 'wrap' } },
            ...JUG_ACTIONS.map((a) =>
              h('button', { onclick: () => ((jugs = jugAction(jugs, a)), render()) }, a),
            ),
          ),
        );
        if (jugs[1] === 4) done();
      };
      host.append(view);
      render();
    },
  },
  {
    name: 'Wrap the presents',
    room: 'Christmas',
    rules:
      'Pick a present, turn it if you like, then click the box where its top-left goes. Fill the box exactly. Click a placed present to take it out.',
    mount(host, done) {
      const placed: ({ row: number; col: number; turns: number } | null)[] = PRESENTS.map(
        () => null,
      );
      let picked = 0;
      let turns = 0;
      const view = h('div', {});
      const cellsOf = (i: number): [number, number][] => {
        const p = placed[i];
        const present = PRESENTS[i];
        return p && present
          ? turnCells(present.cells, p.turns).map(
              ([r, c]) => [p.row + r, p.col + c] as [number, number],
            )
          : [];
      };
      const render = (): void => {
        const owner = new Map<string, number>();
        placed.forEach((_, i) => cellsOf(i).forEach(([r, c]) => owner.set(`${r},${c}`, i)));
        const colours = ['#e2463b', '#2f9e5b', '#3b6fd9'];
        const g = h('div', {
          style: {
            display: 'grid',
            gridTemplateColumns: `repeat(${BOX_COLS}, 46px)`,
            gap: '2px',
            width: 'fit-content',
          },
        });
        for (let r = 0; r < BOX_ROWS; r++)
          for (let c = 0; c < BOX_COLS; c++) {
            const o = owner.get(`${r},${c}`);
            g.append(
              h('div', {
                class: 'cell',
                style: {
                  width: '46px',
                  height: '46px',
                  cursor: 'pointer',
                  background: o === undefined ? '#fff' : colours[o],
                },
                onclick: () => {
                  if (o !== undefined) placed[o] = null;
                  else {
                    const present = PRESENTS[picked];
                    if (!present) return;
                    const cells = turnCells(present.cells, turns).map(
                      ([dr, dc]) => [r + dr, c + dc] as [number, number],
                    );
                    const fitsHere = cells.every(
                      ([a, b]) =>
                        (a < BOX_ROWS && b < BOX_COLS && !owner.has(`${a},${b}`)) ||
                        owner.get(`${a},${b}`) === picked,
                    );
                    if (fitsHere) placed[picked] = { row: r, col: c, turns };
                  }
                  render();
                },
              }),
            );
          }
        view.replaceChildren(
          h(
            'div',
            { style: { display: 'flex', gap: '6px', marginBottom: '6px' } },
            ...PRESENTS.map((p, i) =>
              h(
                'button',
                {
                  class: picked === i ? 'on' : '',
                  style: { borderLeft: `12px solid ${colours[i]}` },
                  onclick: () => ((picked = i), render()),
                },
                p.name,
              ),
            ),
            h(
              'button',
              { onclick: () => ((turns = (turns + 1) % 4), render()) },
              `Turn (${turns * 90}°)`,
            ),
          ),
          g,
        );
        if (owner.size === BOX_ROWS * BOX_COLS) done();
      };
      host.append(view);
      render();
    },
  },
];

export const tuesday: Proto = {
  id: 'tuesday',
  title: 'A Holiday for Tuesday',
  room: 'Tuesday',
  kind: 'final',
  from: "The Fool's Errand's meta-puzzles and 7th Guest's last puzzle; twist: the end is a celebration",
  rules:
    "Six short parts, one in each holiday's style, to plan Tuesday's very own holiday. Do them in any order; finish all six and the party begins.",
  mount(host, ctx) {
    const done = new Set<number>();
    const view = h('div', {});
    let open = 0;
    const render = (): void => {
      const box = h('div', {
        style: {
          marginTop: '10px',
          padding: '12px',
          background: '#fff',
          border: '1px solid #d9d3c7',
          borderRadius: '8px',
        },
      });
      const part = PARTS[open] as Part;
      box.append(
        h('div', { style: { fontWeight: '700' } }, `${part.name} (${part.room})`),
        h('div', { style: { color: '#6b6676', marginBottom: '8px' } }, part.rules),
      );
      const inner = h('div', {});
      box.append(inner);
      part.mount(inner, () => {
        if (done.has(open)) return;
        done.add(open);
        renderTabs();
        if (done.size === PARTS.length) ctx.solved();
        else ctx.status(`${done.size} of ${PARTS.length} parts done`);
      });
      view.replaceChildren(tabs, box);
    };
    const tabs = h('div', { style: { display: 'flex', gap: '6px', flexWrap: 'wrap' } });
    const renderTabs = (): void => {
      tabs.replaceChildren(
        ...PARTS.map((p, i) =>
          h(
            'button',
            { class: open === i ? 'on' : '', onclick: () => ((open = i), renderTabs(), render()) },
            `${done.has(i) ? '✓ ' : ''}${p.name}`,
          ),
        ),
      );
    };
    renderTabs();
    host.append(view);
    render();
    ctx.status(`0 of ${PARTS.length} parts done`);
  },
};
