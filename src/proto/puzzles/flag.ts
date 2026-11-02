/**
 * Easter · The Egg-Carton Flag (stray, from the Fourth of July).
 * Dip a whole row or column of the carton in a dye: every egg in it takes
 * the colour, mixing with what's there (red + blue = purple). Vinegar
 * clears a line back to white. Dye the carton into the (Easter) flag.
 */
import { type Proto, h } from '../kit';

/** Colours as dye bits: red 1, yellow 2, blue 4; mixes are their sums (red + blue = purple 5). */
export const RED = 1;
export const YELLOW = 2;
export const BLUE = 4;
const NAMES = ['white', 'red', 'yellow', 'orange', 'blue', 'purple', 'green', 'brown'];
const FILL = [
  '#ffffff',
  '#e2463b',
  '#f2d03b',
  '#f08a2c',
  '#3b6fd9',
  '#8a4bc2',
  '#4caf50',
  '#7a5230',
];

export interface Level {
  name: string;
  dyes: number[];
  target: number[][];
  /** Dips it can be done in. */
  par: number;
}

export const LEVELS: Level[] = [
  {
    // Learning the mechanic: the flag, as two dyes can make it (a purple canton).
    name: 'Level 1: the knack of it',
    dyes: [RED, BLUE],
    target: [
      [5, 5, 1, 1, 1],
      [4, 4, 0, 0, 0],
      [5, 5, 1, 1, 1],
      [0, 0, 0, 0, 0],
    ],
    par: 5,
  },
  {
    // The real one: three dyes, eight colours, and vinegar that has to come at the right moment.
    name: 'Level 2: the Easter flag',
    dyes: [RED, YELLOW, BLUE],
    target: [
      [3, 6, 2, 3, 3],
      [1, 4, 0, 1, 1],
      [1, 4, 4, 5, 5],
      [1, 4, 0, 1, 1],
      [0, 0, 0, 0, 0],
    ],
    par: 8,
  },
];

export interface Dip {
  line: 'row' | 'col';
  index: number;
  /** RED, BLUE, or 0 for vinegar. */
  dye: number;
}

export function dip(grid: number[][], d: Dip): number[][] {
  return grid.map((row, r) =>
    row.map((egg, c) => {
      if ((d.line === 'row' ? r : c) !== d.index) return egg;
      return d.dye === 0 ? 0 : egg | d.dye;
    }),
  );
}

export const blankLike = (target: number[][]): number[][] => target.map((row) => row.map(() => 0));
export const same = (a: number[][], b: number[][]): boolean =>
  a.every((row, r) => row.every((v, c) => v === b[r]?.[c]));

export const flag: Proto = {
  id: 'flag',
  title: 'The Egg-Carton Flag',
  room: 'Easter',
  kind: 'stray',
  from: "7th Guest's House puzzle (moves act on whole rows and columns) and Stauf portrait; twist: the dyes mix",
  rules:
    'Pick a dye (or vinegar, which washes a line back to white), then click a row or column button to dip that whole line. Dyes add up: red and blue make purple, red and yellow orange, yellow and blue green, all three brown. Make the carton match the flag. Level 1 teaches the knack; level 2 is the puzzle.',
  mount(host, ctx) {
    let level = 0;
    let grid = blankLike((LEVELS[0] as Level).target);
    let dye = RED;
    let dips = 0;
    const tabs = h('div', { style: { display: 'flex', gap: '6px', marginBottom: '8px' } });
    const board = h('div', {});
    const target = h('div', {});
    const dyes = h('div', { style: { display: 'flex', gap: '6px', margin: '6px 0 12px' } });
    const egg = (v: number, size: number): HTMLElement =>
      h('div', {
        title: NAMES[v],
        style: {
          width: `${size}px`,
          height: `${size * 1.25}px`,
          borderRadius: '50%/60% 60% 40% 40%',
          background: FILL[v],
          border: '1px solid #999',
        },
      });
    const start = (n: number): void => {
      level = n;
      grid = blankLike((LEVELS[n] as Level).target);
      dye = RED;
      dips = 0;
      render();
    };
    const act = (line: 'row' | 'col', index: number): void => {
      grid = dip(grid, { line, index, dye });
      dips++;
      render();
    };
    const render = (): void => {
      const lv = LEVELS[level] as Level;
      const cols = lv.target[0]?.length ?? 0;
      tabs.replaceChildren(
        ...LEVELS.map((l, i) =>
          h('button', { class: level === i ? 'on' : '', onclick: () => start(i) }, l.name),
        ),
      );
      const label: Record<number, string> = {
        [RED]: 'Red dye',
        [YELLOW]: 'Yellow dye',
        [BLUE]: 'Blue dye',
        0: 'Vinegar',
      };
      dyes.replaceChildren(
        ...[...lv.dyes, 0].map((d) =>
          h(
            'button',
            { class: dye === d ? 'on' : '', onclick: () => ((dye = d), render()) },
            label[d] ?? '',
          ),
        ),
      );
      const table = h('div', {
        style: {
          display: 'grid',
          gridTemplateColumns: `40px repeat(${cols}, 46px)`,
          gap: '6px',
          alignItems: 'center',
        },
      });
      table.append(
        h('span'),
        ...Array.from({ length: cols }, (_, c) =>
          h('button', { onclick: () => act('col', c) }, '▼'),
        ),
      );
      grid.forEach((row, r) => {
        table.append(
          h('button', { onclick: () => act('row', r) }, '▶'),
          ...row.map((v) =>
            h('div', { style: { display: 'grid', placeItems: 'center' } }, egg(v, 34)),
          ),
        );
      });
      board.replaceChildren(table);
      target.replaceChildren(
        h(
          'div',
          { style: { display: 'grid', gridTemplateColumns: `repeat(${cols}, 22px)`, gap: '3px' } },
          ...lv.target.flat().map((v) => egg(v, 18)),
        ),
      );
      if (same(grid, lv.target)) {
        if (level === LEVELS.length - 1) ctx.solved();
        else
          ctx.status(
            `Level ${level + 1} done in ${dips} dips (par ${lv.par}). On to level ${level + 2}!`,
          );
      } else ctx.status(`${dips} dips · par ${lv.par}`);
    };
    host.append(
      tabs,
      dyes,
      h(
        'div',
        { style: { display: 'flex', gap: '40px', alignItems: 'flex-start' } },
        board,
        h('div', {}, h('div', {}, 'The flag:'), target),
      ),
    );
    render();
  },
};
