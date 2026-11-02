/**
 * Fourth of July · Cupid's Firework Bow (stray, from Valentine's). Cupid's
 * bow, strung up as a launcher, paints pictures in the sky. The program says
 * how many bursts each tube fires and how they bunch at each height: work out
 * the picture. Level 1, the flag, teaches the knack; level 2 is Cupid's heart.
 */
import { type Proto, h } from '../kit';

export const PICTURES: { name: string; rows: string[] }[] = [
  {
    name: 'Level 1: the knack of it',
    rows: [
      '#.#.######',
      '.#.#......',
      '#.#.######',
      '.#.#......',
      '##########',
      '..........',
      '##########',
    ],
  },
  {
    // A heart with Cupid's arrow through it (solvable by logic alone, one answer).
    name: "Level 2: Cupid's heart",
    rows: [
      '..........#....',
      '..###....####..',
      '.#####..######.',
      '###############',
      '######.########',
      '#####.#########',
      '.###.#########.',
      '..#.#########..',
      '..##########...',
      '##..#######....',
      '#....#####.....',
      '......###......',
      '.......#.......',
    ],
  },
];

/** A line's clue: the lengths of its runs of bursts. */
export function clue(line: boolean[]): number[] {
  const out: number[] = [];
  let run = 0;
  for (const v of line) {
    if (v) run++;
    else if (run) {
      out.push(run);
      run = 0;
    }
  }
  if (run) out.push(run);
  return out;
}

export interface Puzzle {
  rowClues: number[][];
  colClues: number[][];
  rows: number;
  cols: number;
}

export function puzzle(picture: string[]): Puzzle {
  const grid = picture.map((row) => [...row].map((ch) => ch === '#'));
  const cols = (picture[0] ?? '').length;
  return {
    rowClues: grid.map(clue),
    colClues: Array.from({ length: cols }, (_, c) => clue(grid.map((row) => row[c] as boolean))),
    rows: picture.length,
    cols,
  };
}

export function satisfies(p: Puzzle, grid: boolean[][]): boolean {
  return (
    grid.every((row, r) => clue(row).join() === p.rowClues[r]?.join()) &&
    Array.from(
      { length: p.cols },
      (_, c) => clue(grid.map((row) => row[c] as boolean)).join() === p.colClues[c]?.join(),
    ).every(Boolean)
  );
}

export const bow: Proto = {
  id: 'bow',
  title: "Cupid's Firework Bow",
  room: 'Fourth of July',
  kind: 'stray',
  from: "modern picture-logic (nonograms); twist: Cupid's arrows paint it across the sky",
  rules:
    'Each column is a launch tube, each row a height in the sky. The numbers say how many bursts there are in that row or tube, in unbroken runs, in order. Click a square to set a burst; right-click to mark it empty. Level 1 (the flag) teaches the knack; level 2 is the puzzle.',
  mount(host, ctx) {
    let level = 0;
    let p = puzzle((PICTURES[0] as { rows: string[] }).rows);
    let grid: boolean[][] = [];
    let marks: boolean[][] = [];
    const tabs = h('div', { style: { display: 'flex', gap: '6px', marginBottom: '8px' } });
    const board = h('div', {});
    const start = (n: number): void => {
      level = n;
      p = puzzle((PICTURES[n] as { rows: string[] }).rows);
      grid = Array.from({ length: p.rows }, () => Array<boolean>(p.cols).fill(false));
      marks = Array.from({ length: p.rows }, () => Array<boolean>(p.cols).fill(false));
      render();
    };
    const render = (): void => {
      tabs.replaceChildren(
        ...PICTURES.map((pic, i) =>
          h('button', { class: level === i ? 'on' : '', onclick: () => start(i) }, pic.name),
        ),
      );
      const done = satisfies(p, grid);
      const t = h('div', {
        style: { display: 'grid', gridTemplateColumns: `90px repeat(${p.cols}, 30px)`, gap: '2px' },
      });
      t.append(
        h('span'),
        ...p.colClues.map((c) =>
          h(
            'div',
            {
              style: { fontSize: '12px', textAlign: 'center', alignSelf: 'end', lineHeight: '1.2' },
            },
            ...c.map((n) => h('div', {}, String(n))),
          ),
        ),
      );
      grid.forEach((row, r) => {
        t.append(
          h(
            'div',
            {
              style: {
                fontSize: '12px',
                textAlign: 'right',
                paddingRight: '6px',
                alignSelf: 'center',
              },
            },
            (p.rowClues[r] ?? []).join(' '),
          ),
        );
        row.forEach((v, c) =>
          t.append(
            h(
              'div',
              {
                class: 'cell',
                style: {
                  width: '30px',
                  height: '30px',
                  cursor: 'pointer',
                  background: v
                    ? done
                      ? ['#e2463b', '#ff8fb8', '#fff3b0'][(r + c) % 3]
                      : '#23202b'
                    : '#fff',
                  color: '#aaa',
                },
                onclick: () => {
                  const rowArr = grid[r];
                  if (!rowArr) return;
                  rowArr[c] = !v;
                  const m = marks[r];
                  if (m) m[c] = false;
                  render();
                },
                oncontextmenu: (e: Event) => {
                  e.preventDefault();
                  const m = marks[r];
                  if (!m || grid[r]?.[c]) return;
                  m[c] = !m[c];
                  render();
                },
              },
              marks[r]?.[c] ? '✕' : '',
            ),
          ),
        );
      });
      board.replaceChildren(t);
      if (done) {
        if (level === PICTURES.length - 1) ctx.solved();
        else ctx.status('Level 1 done. On to level 2!');
      } else ctx.status(`${grid.flat().filter(Boolean).length} bursts placed`);
    };
    host.append(tabs, board);
    start(0);
  },
};
