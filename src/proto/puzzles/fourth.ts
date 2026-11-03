/**
 * Fourth of July: the fireworks run (GAME.md, "Fourth of July: the fireworks
 * run"). Picture-grid (nonogram) panels in four runs: the warm-up sparklers,
 * the two strays (Cupid's Bow brings Valentine's letters for numbers; the
 * Witch's Broom, Halloween's dark clues), and the Grand Finale centrepiece in
 * colour. Hand-drawn pictures, adjusted by a search until each solves by
 * line logic alone (tests/puzzles/fourth.test.ts).
 */
import { type Panel } from '../picture';
import { mountPicture } from '../pictureBoard';
import { run } from '../run';

export const SPARKLERS: Panel[] = [
  { name: 'A full line', rows: ['#####'] },
  { name: 'A gap', rows: ['#.#', '.#.', '#.#'] },
  { name: 'Runs in order', rows: ['.#.#.', '#####', '#####', '.###.', '..#..'] },
  { name: 'Crossing clues', rows: ['..#..', '.###.', '#####', '.###.', '.#.#.'] },
  {
    name: 'A first picture',
    rows: [
      '....#...',
      '...###..',
      '...#.#..',
      '...###..',
      '...###..',
      '..#####.',
      '.##.#.##',
      '.#.###.#',
    ],
  },
];

export const BOW: Panel[] = [
  {
    name: 'Be mine',
    rows: ['.##.##', '######', '######', '.####.', '..##..', '......'],
    letters: '    OX',
    message: '6565',
  },
  {
    name: "Cupid's arrow",
    rows: ['..##.##.', '.#######', '########', '.######.', '..####..', '...##...', '........'],
    letters: '   SGH U',
    message: '6854',
  },
  {
    name: 'Sweethearts',
    rows: [
      '.##.##..',
      '#######.',
      '#######.',
      '.#####..',
      '..###.##',
      '...#.###',
      '....####',
      '.....##.',
    ],
    letters: 'OL  V E',
    message: '2157',
  },
];

export const BROOM: Panel[] = [
  {
    name: 'The pumpkin',
    rows: ['...#...', '.#####.', '##.#.##', '#######', '##...##', '.#####.', '..###..'],
    dark: [
      ['row', 2, 2],
      ['row', 4, 1],
      ['col', 2, 0],
    ],
  },
  {
    name: 'The broom',
    rows: [
      '...##...',
      '...#....',
      '...#....',
      '...#....',
      '..###...',
      '.#####..',
      '#######.',
      '#.#.#.#.',
    ],
    dark: [
      ['col', 4, 1],
      ['row', 7, 0],
    ],
  },
  {
    name: 'The bat',
    rows: [
      '..#...#..',
      '#.##.##.#',
      '##.###.##',
      '#########',
      '#########',
      '.#######.',
      '..##.##..',
      '...#.#...',
      '.........',
    ],
    dark: [
      ['row', 7, 1],
      ['col', 6, 0],
      ['row', 2, 1],
      ['row', 1, 1],
      ['row', 0, 1],
      ['row', 6, 0],
    ],
  },
];

export const FINALE: Panel[] = [
  {
    name: 'The big picture',
    rows: [
      '....#....',
      '.#.###.#.',
      '..#####..',
      '.#######.',
      '#########',
      '.#######.',
      '..#####..',
      '.#.###.#.',
      '....#....',
    ],
  },
  {
    name: 'Red and blue',
    rows: ['BBBRRRR', 'BBB....', 'RRRRRRR', '.......', 'RRRRRRR'],
    palette: 'RB',
  },
  {
    name: 'A rocket',
    rows: [
      '....R...',
      '...RRR..',
      '...B.B..',
      '...BBB..',
      '...BBB..',
      '..BBBBB.',
      '.RR.B.RR',
      '.R.RRR.R',
    ],
    palette: 'RB',
  },
  {
    name: 'Three colours',
    rows: [
      '....B....',
      '...RRR...',
      'B.GGGGG.B',
      '.RGGGGGR.',
      'BGGGGGGGB',
      '.RGGGGGR.',
      'B.GGGGG.B',
      '...RRR...',
      '....B....',
    ],
    palette: 'RBG',
  },
  {
    name: 'The Grand Finale',
    rows: [
      '.R......B.',
      'RRR....BBB',
      '.R..G...B.',
      '....G.....',
      '...GGG....',
      'G.GGGGG.G.',
      '...GGG....',
      '.R..G...B.',
      'RRR.G..BBB',
      '.R..G...B.',
    ],
    palette: 'RBG',
  },
];

const mountPanel: Parameters<typeof run<Panel>>[0]['mountPanel'] = (host, panel, hooks) =>
  mountPicture(host, panel, { solved: () => hooks.solved(), status: hooks.status });

const CONTROLS =
  'The numbers by each row and column are the runs of filled squares in that line, in order. Tap a square to fill it, again to cross it out, again to clear; drag along a row or column to do a run at once. The panels teach the rules; open a panel number to jump about.';

export const sparklers = run({
  id: 'sparklers',
  title: 'Sparklers',
  room: 'Fourth of July',
  kind: 'warm-up',
  from: 'Picture grids (nonograms), taught panel by panel as in The Witness',
  rules: CONTROLS,
  panels: SPARKLERS,
  mountPanel,
});

export const bow = run({
  id: 'bow',
  title: "Cupid's Bow",
  room: 'Fourth of July',
  kind: 'stray',
  from: "Picture grids; twist from Valentine's: letters for numbers",
  rules: `${CONTROLS} (Twist: some clues are letters; the same letter is always the same number. The message's numbered blanks take the letter with that number.)`,
  panels: BOW,
  mountPanel,
});

export const broom = run({
  id: 'broom',
  title: "The Witch's Broom",
  room: 'Fourth of July',
  kind: 'stray',
  from: 'Picture grids; twist from Halloween: clues in the dark',
  rules: `${CONTROLS} (Twist: a ? is a clue in the dark: a run of any length.)`,
  panels: BROOM,
  mountPanel,
});

export const finale = run({
  id: 'finale',
  title: 'The Grand Finale',
  room: 'Fourth of July',
  kind: 'centrepiece',
  from: "Picture grids; the Fourth of July's own extra: colour",
  rules: `${CONTROLS} (Colour: pick a paint from the bar. Clues come in colours; two runs of the same colour need a gap between them, different colours can touch.)`,
  panels: FINALE,
  mountPanel,
});
