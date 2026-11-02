/**
 * Fourth of July · The Witch's Parade Float (stray, from Halloween).
 * The parade's jammed. Slide floats along their lanes to get the broom
 * float out to the right, while the marching band marches up and down its
 * street, a step every time you move a float.
 */
import { type Proto, h } from '../kit';

export const N = 6;
export interface Float {
  name: string;
  row: number;
  col: number;
  length: number;
  across: boolean;
}

export const FLOATS: Float[] = [
  { name: 'broom', row: 2, col: 1, length: 2, across: true },
  { name: 'a', row: 0, col: 2, length: 2, across: true },
  { name: 'b', row: 5, col: 3, length: 3, across: true },
  { name: 'c', row: 3, col: 3, length: 2, across: true },
  { name: 'd', row: 1, col: 2, length: 2, across: true },
  { name: 'e', row: 0, col: 5, length: 3, across: false },
  { name: 'f', row: 2, col: 0, length: 2, across: false },
  { name: 'g', row: 0, col: 1, length: 2, across: false },
  { name: 'h', row: 1, col: 4, length: 2, across: false },
  { name: 'i', row: 4, col: 3, length: 3, across: true },
  { name: 'j', row: 3, col: 2, length: 2, across: false },
];
/** The band marches down column 4 and back up, a step per move (it waits if a float's in its way). */
export const BAND_ROUTE: [number, number][] = [
  ...Array.from({ length: 6 }, (_, r) => [r, 4] as [number, number]),
  ...[4, 3, 2, 1].map((r) => [r, 4] as [number, number]),
];

export interface State {
  at: [number, number][];
  band: number;
}

const cells = (f: Float, row: number, col: number): [number, number][] =>
  Array.from(
    { length: f.length },
    (_, k) => (f.across ? [row, col + k] : [row + k, col]) as [number, number],
  );

function occupied(at: [number, number][], skip = -1): Set<string> {
  const out = new Set<string>();
  FLOATS.forEach((f, i) => {
    if (i === skip) return;
    const p = at[i] as [number, number];
    for (const [r, c] of cells(f, ...p)) out.add(`${r},${c}`);
  });
  return out;
}

export const start = (): State => ({ at: FLOATS.map((f) => [f.row, f.col]), band: 0 });

/** Slide float `i` one step (dir −1 left/up, +1 right/down); null if it can't. Then the band steps. */
export function slide(s: State, i: number, dir: -1 | 1): State | null {
  const f = FLOATS[i];
  const p = s.at[i];
  if (!f || !p) return null;
  const to: [number, number] = f.across ? [p[0], p[1] + dir] : [p[0] + dir, p[1]];
  const band = BAND_ROUTE[s.band] as [number, number];
  const others = occupied(s.at, i);
  for (const [r, c] of cells(f, ...to)) {
    if (r < 0 || c < 0 || r >= N || c >= N) return null;
    if (others.has(`${r},${c}`) || (r === band[0] && c === band[1])) return null;
  }
  const at = s.at.map((q, k) => (k === i ? to : q));
  const next = (s.band + 1) % BAND_ROUTE.length;
  const nb = BAND_ROUTE[next] as [number, number];
  return { at, band: occupied(at).has(`${nb[0]},${nb[1]}`) ? s.band : next };
}

export const out = (s: State): boolean => (s.at[0]?.[1] ?? 0) === N - 2;

export const parade: Proto = {
  id: 'parade',
  title: "The Witch's Parade Float",
  room: 'Fourth of July',
  kind: 'stray',
  from: "11th Hour's Furniture puzzle (Rush Hour); twist: the marching band takes a step every move",
  rules:
    "Click a float, then use the arrow buttons (or keys) to slide it one step along its lane. Get the orange broom float out of the exit on the right. The marching band (♪) marches down its street and back, one step every time you move; floats can't move through it, and it waits if a float is in its way.",
  mount(host, ctx) {
    let s = start();
    let picked = 0;
    let moves = 0;
    const board = h('div', {
      style: {
        position: 'relative',
        width: `${N * 54}px`,
        height: `${N * 54}px`,
        background: '#e8e2d6',
        border: '2px solid #bbb',
      },
    });
    const colours = [
      '#e0662d',
      '#7fa7d8',
      '#a3c98a',
      '#d6a1d8',
      '#e8c35a',
      '#8fc7c2',
      '#c9a27a',
      '#b4b4e0',
      '#e39a9a',
      '#9cc0e8',
      '#c2d68a',
    ];
    const move = (dir: -1 | 1): void => {
      const next = slide(s, picked, dir);
      if (!next) return;
      s = next;
      moves++;
      render();
    };
    const render = (): void => {
      board.replaceChildren();
      // The exit, and the band's street.
      board.append(
        h('div', {
          style: {
            position: 'absolute',
            left: `${N * 54}px`,
            top: `${2 * 54 + 10}px`,
            width: '14px',
            height: '34px',
            background: '#e0662d',
          },
        }),
      );
      for (let r = 0; r < N; r++)
        board.append(
          h('div', {
            style: {
              position: 'absolute',
              left: `${4 * 54}px`,
              top: `${r * 54}px`,
              width: '54px',
              height: '54px',
              background: '#d9cfbd',
            },
          }),
        );
      FLOATS.forEach((f, i) => {
        const [r, c] = s.at[i] as [number, number];
        board.append(
          h(
            'div',
            {
              onclick: () => ((picked = i), render()),
              style: {
                position: 'absolute',
                left: `${c * 54 + 3}px`,
                top: `${r * 54 + 3}px`,
                width: `${(f.across ? f.length : 1) * 54 - 6}px`,
                height: `${(f.across ? 1 : f.length) * 54 - 6}px`,
                background: colours[i % colours.length],
                border: picked === i ? '3px solid #23202b' : '1px solid #888',
                borderRadius: '8px',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                fontWeight: '700',
              },
            },
            f.name === 'broom' ? 'BROOM' : '',
          ),
        );
      });
      const [br, bc] = BAND_ROUTE[s.band] as [number, number];
      board.append(
        h(
          'div',
          {
            style: {
              position: 'absolute',
              left: `${bc * 54 + 12}px`,
              top: `${br * 54 + 8}px`,
              fontSize: '30px',
            },
          },
          '♪',
        ),
      );
      if (out(s)) ctx.solved();
      else ctx.status(`${moves} moves`);
    };
    const f = (): Float => FLOATS[picked] as Float;
    const arrows = h(
      'div',
      { style: { display: 'flex', gap: '6px', marginTop: '10px' } },
      h('button', { onclick: () => move(-1) }, '◀ / ▲'),
      h('button', { onclick: () => move(1) }, '▶ / ▼'),
    );
    window.addEventListener('keydown', (e) => {
      if (!host.isConnected) return;
      const k = e.key;
      if ((k === 'ArrowLeft' && f().across) || (k === 'ArrowUp' && !f().across)) move(-1);
      if ((k === 'ArrowRight' && f().across) || (k === 'ArrowDown' && !f().across)) move(1);
    });
    host.append(board, arrows);
    render();
  },
};
