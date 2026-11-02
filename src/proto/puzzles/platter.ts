/**
 * Thanksgiving · The Hot Dog Platter (stray, from the Fourth of July).
 * A hot dog's on the turkey platter among the cranberries and stuffing.
 * Carve it into five helpings, every helping with the same mix of
 * everything.
 */
import { type Proto, h, rng } from '../kit';

export const ROWS = 5;
export const COLS = 6;
export const SHARES = 5;
/** What's on each square: H hot dog, C cranberries, S stuffing, '.' plain platter. */
export type Food = 'H' | 'C' | 'S' | '.';
/** Every helping: 2 hot dog, 2 cranberries, 1 stuffing, 1 plain. */
export const HELPING: Food[] = ['H', 'H', 'C', 'C', 'S', '.'];

const neighbours = (i: number): number[] => {
  const r = Math.floor(i / COLS);
  const c = i % COLS;
  return [
    [r - 1, c],
    [r + 1, c],
    [r, c - 1],
    [r, c + 1],
  ]
    .filter(
      ([a, b]) =>
        (a as number) >= 0 && (b as number) >= 0 && (a as number) < ROWS && (b as number) < COLS,
    )
    .map(([a, b]) => (a as number) * COLS + (b as number));
};

/** A carving the platter is laid out from: five connected helpings of six squares. */
export function carving(seed = 9): number[] {
  const random = rng(seed);
  for (;;) {
    const owner = Array<number>(ROWS * COLS).fill(-1);
    const seeds = [0, COLS - 1, ROWS * COLS - 1, (ROWS - 1) * COLS, 2 * COLS + 2];
    seeds.forEach((s, k) => (owner[s] = k));
    let stuck = false;
    for (let round = 1; round < 6 && !stuck; round++)
      for (let k = 0; k < SHARES; k++) {
        const frontier = owner.flatMap((o, i) =>
          o === k ? neighbours(i).filter((n) => owner[n] === -1) : [],
        );
        if (!frontier.length) {
          stuck = true;
          break;
        }
        owner[frontier[Math.floor(random() * frontier.length)] as number] = k;
      }
    if (!stuck && owner.every((o) => o >= 0)) return owner;
  }
}

/** The food on the platter: each helping of the carving gets the HELPING mix, scattered. */
export function platter(seed = 9): Food[] {
  const random = rng(seed + 1);
  const owner = carving(seed);
  const food = Array<Food>(ROWS * COLS).fill('.');
  for (let k = 0; k < SHARES; k++) {
    const squares = owner.flatMap((o, i) => (o === k ? [i] : []));
    const mix = [...HELPING];
    for (let i = mix.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [mix[i], mix[j]] = [mix[j] as Food, mix[i] as Food];
    }
    squares.forEach((sq, n) => (food[sq] = mix[n] as Food));
  }
  return food;
}

/** Is a carving (helping per square) fair: five connected helpings, each the same mix? */
export function fair(food: Food[], owner: number[]): boolean {
  for (let k = 0; k < SHARES; k++) {
    const squares = owner.flatMap((o, i) => (o === k ? [i] : []));
    if (squares.length !== HELPING.length) return false;
    const mix = squares
      .map((s) => food[s])
      .sort()
      .join('');
    if (mix !== [...HELPING].sort().join('')) return false;
    // Connected?
    const seen = new Set([squares[0] as number]);
    const stack = [squares[0] as number];
    while (stack.length)
      for (const n of neighbours(stack.pop() as number))
        if (owner[n] === k && !seen.has(n)) {
          seen.add(n);
          stack.push(n);
        }
    if (seen.size !== squares.length) return false;
  }
  return true;
}

const COLOURS = ['#f2b880', '#a9d18e', '#9ec5e8', '#e3a8d6', '#f4e285'];
const LABEL: Record<Food, string> = { H: '🌭', C: '●', S: '▒', '.': '' };

export const platterProto: Proto = {
  id: 'platter',
  title: 'The Hot Dog Platter',
  room: 'Thanksgiving',
  kind: 'stray',
  from: "7th Guest's Cake (equal pieces with the same contents); twist: a bit of every dish in every helping",
  rules:
    'Carve the platter into five helpings of six squares, each helping in one piece (joined edge to edge), and each with the same mix: 2 hot dog, 2 cranberries (●), 1 stuffing (▒) and 1 plain square. Pick a helping colour, then click squares to give them to it (click again to take them back).',
  mount(host, ctx) {
    const food = platter();
    const owner = Array<number>(ROWS * COLS).fill(-1);
    let current = 0;
    const board = h('div', {});
    const picker = h('div', { style: { display: 'flex', gap: '6px', margin: '6px 0 10px' } });
    const render = (): void => {
      picker.replaceChildren(
        ...COLOURS.map((col, k) => {
          const n = owner.filter((o) => o === k).length;
          return h(
            'button',
            {
              class: current === k ? 'on' : '',
              style: { background: current === k ? '' : col },
              onclick: () => ((current = k), render()),
            },
            `Helping ${k + 1} (${n})`,
          );
        }),
      );
      const g = h('div', {
        style: {
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, 52px)`,
          gap: '2px',
          width: 'fit-content',
        },
      });
      food.forEach((f, i) =>
        g.append(
          h(
            'div',
            {
              class: 'cell',
              style: {
                width: '52px',
                height: '52px',
                fontSize: '22px',
                cursor: 'pointer',
                background: owner[i] === -1 ? '#fff' : COLOURS[owner[i] as number],
              },
              onclick: () => {
                owner[i] = owner[i] === current ? -1 : current;
                render();
              },
            },
            LABEL[f],
          ),
        ),
      );
      board.replaceChildren(g);
      if (owner.every((o) => o >= 0) && fair(food, owner)) ctx.solved();
      else
        ctx.status(
          owner.every((o) => o >= 0)
            ? 'Not fair yet: check each helping.'
            : `${owner.filter((o) => o < 0).length} squares left to carve`,
        );
    };
    host.append(picker, board);
    render();
  },
};
