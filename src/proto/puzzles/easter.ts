/**
 * Easter: the bunny-hop run (GAME.md, "Easter: the bunny-hop run"). Numbrix
 * (Hidato with plain steps) panels in four runs: the warm-up in the hutch, the two strays (the
 * Star-Spangled Flag brings the Fourth of July's flags, as parade viewers; the
 * Cornucopia, Thanksgiving's fair shares, as courses), and the Egg Tree
 * centrepiece (tree boards, burrows, the Golden Egg on top). Every panel but
 * the free learning ones has exactly one answer (tests/puzzles/easter.test.ts);
 * most were found by a random search.
 */
import { type Panel } from '../hops';
import { mountHops } from '../hopsBoard';
import { run } from '../run';

export const HUTCH: Panel[] = [
  { name: 'One step', rows: ['##'], given: [[0, 0, 1]] },
  { name: 'A little run', rows: ['###', '..#'], given: [[0, 0, 1]] },
  { name: 'Every spot', rows: ['###', '###', '###'], given: [[0, 0, 1]], free: true },
  {
    name: 'Numbered eggs',
    rows: ['####', '####', '####'],
    given: [
      [0, 0, 1],
      [2, 1, 12],
    ],
  },
  {
    name: 'A first real hunt',
    rows: ['#####', '#####', '#####', '#####', '#####'],
    given: [
      [3, 1, 1],
      [2, 2, 19],
      [1, 2, 22],
    ],
  },
];

export const FLAG: Panel[] = [
  {
    name: 'A parade',
    rows: ['#####', '#####', '#####', '#####', '#####'],
    given: [
      [2, 2, 1],
      [2, 0, 21],
      [4, 0, 23],
    ],
    rowFlags: [null, null, null, null, null],
    colFlags: [17, null, null, null, 5],
  },
  {
    name: 'Down every street',
    rows: ['######', '######', '######', '######', '######', '######'],
    given: [
      [1, 2, 1],
      [0, 3, 33],
      [0, 4, 34],
    ],
    rowFlags: [null, null, null, null, 11, null],
    colFlags: [null, null, null, null, null, 24],
  },
  {
    name: 'The big parade',
    rows: ['#######', '#######', '#######', '#######', '#######', '#######', '#######'],
    given: [
      [4, 0, 1],
      [4, 6, 43],
      [4, 4, 47],
    ],
    rowFlags: [null, null, null, null, null, null, 23],
    colFlags: [null, null, null, null, null, null, null],
  },
];

export const CORNUCOPIA: Panel[] = [
  {
    name: 'Two courses',
    rows: ['#####', '#####', '#####', '#####', '#####'],
    given: [
      [4, 4, 1],
      [2, 1, 10],
      [0, 0, 13],
      [3, 3, 25],
    ],
    portions: ['BBBBB', 'BBBBB', 'AAABB', 'AAABB', 'AAAAA'],
  },
  {
    name: 'Three courses',
    rows: ['######', '######', '######', '######', '######', '######'],
    given: [
      [3, 0, 1],
      [2, 2, 18],
      [5, 1, 36],
    ],
    portions: ['AAAAAA', 'ABBBBA', 'ABBBBB', 'ABBBBB', 'CCCCCB', 'CCCCCC'],
  },
  {
    name: 'The full table',
    rows: ['#######', '#######', '#######', '#######', '#######', '#######', '#######'],
    given: [
      [0, 0, 1],
      [1, 2, 46],
      [0, 2, 47],
    ],
    portions: ['AEECCCC', 'AEECCCC', 'AEEDDCC', 'AEEDDDC', 'AEEDBCC', 'ADDDBBB', 'AAAAABB'],
  },
];

export const EGGTREE: Panel[] = [
  {
    name: 'The tree',
    rows: ['...#...', '..###..', '..###..', '.#####.', '.#####.', '#######', '#######'],
    given: [
      [1, 2, 1],
      [6, 1, 13],
      [5, 6, 21],
      [0, 3, 31],
    ],
    golden: [0, 3],
  },
  {
    name: 'A burrow',
    rows: ['...#...', '..###..', '..###..', '.#####.', '.#####.', '#######', '#######'],
    given: [
      [1, 4, 1],
      [6, 2, 12],
      [5, 1, 24],
      [0, 3, 31],
    ],
    burrows: [
      [
        [6, 1],
        [3, 5],
      ],
    ],
    golden: [0, 3],
  },
  {
    name: 'A taller tree',
    rows: [
      '....#....',
      '...###...',
      '...###...',
      '..#####..',
      '..#####..',
      '.#######.',
      '.#######.',
      '#########',
      '#########',
    ],
    given: [
      [1, 5, 1],
      [5, 7, 13],
      [7, 2, 20],
      [2, 4, 45],
      [0, 4, 49],
    ],
    golden: [0, 4],
  },
  {
    name: 'Two pairs of burrows',
    rows: [
      '....#....',
      '...###...',
      '...###...',
      '..#####..',
      '..#####..',
      '.#######.',
      '.#######.',
      '#########',
    ],
    given: [
      [1, 3, 1],
      [5, 4, 14],
      [7, 4, 25],
      [0, 4, 40],
    ],
    burrows: [
      [
        [7, 8],
        [2, 4],
      ],
      [
        [7, 0],
        [6, 7],
      ],
    ],
    golden: [0, 4],
  },
  {
    name: 'The Egg Tree',
    rows: [
      '....#....',
      '...###...',
      '...###...',
      '..#####..',
      '..#####..',
      '.#######.',
      '.#######.',
      '#########',
      '#########',
    ],
    given: [
      [1, 3, 1],
      [6, 5, 15],
      [7, 4, 25],
      [6, 2, 34],
      [5, 2, 35],
      [0, 4, 49],
    ],
    burrows: [
      [
        [4, 2],
        [5, 5],
      ],
      [
        [7, 0],
        [4, 5],
      ],
    ],
    golden: [0, 4],
  },
];

const mountPanel: Parameters<typeof run<Panel>>[0]['mountPanel'] = (host, panel, hooks) =>
  mountHops(host, panel, { solved: () => hooks.solved(), status: hooks.status });

const CONTROLS =
  'Drag from the bunny through neighbouring spots (up, down, left, right) to lay its trail; drag back to rub it out. Tap the bunny to take a hop back. Visit every spot once; a numbered egg must be that hop. The panels teach the rules; open a panel number to jump about.';

export const hutch = run({
  id: 'hutch',
  title: 'The Hutch',
  room: 'Easter',
  kind: 'warm-up',
  from: 'Numbrix (Hidato with plain steps), taught panel by panel as in The Witness',
  rules: CONTROLS,
  panels: HUTCH,
  mountPanel,
});

export const flag = run({
  id: 'flag',
  title: 'The Star-Spangled Flag',
  room: 'Easter',
  kind: 'stray',
  from: 'Numbrix; twist from the Fourth of July: parade flags at the edge',
  rules: `${CONTROLS} (Twist: a flag at the end of a row or column gives the number of the bunny's first visit to that line, the lowest number in it.)`,
  panels: FLAG,
  mountPanel,
});

export const cornucopia = run({
  id: 'cornucopia',
  title: 'The Cornucopia',
  room: 'Easter',
  kind: 'stray',
  from: 'Numbrix; twist from Thanksgiving: fair shares, as courses',
  rules: `${CONTROLS} (Twist: the board is outlined in courses; the bunny must finish each course before starting the next.)`,
  panels: CORNUCOPIA,
  mountPanel,
});

export const eggtree = run({
  id: 'eggtree',
  title: 'The Egg Tree',
  room: 'Easter',
  kind: 'centrepiece',
  from: "Numbrix on trees; Easter's own extra: burrows",
  rules: `${CONTROLS} (Burrows: two burrows of a colour are joined underground; popping down one and up the other is a hop. The last egg is the Golden Egg at the top.)`,
  panels: EGGTREE,
  mountPanel,
});
