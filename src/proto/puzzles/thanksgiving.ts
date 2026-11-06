/**
 * Thanksgiving: the carving run (GAME.md, "Thanksgiving: the carving run").
 * Shikaku panels in four runs: the warm-up on the bread board, the two
 * strays (the Hot Dog brings the Fourth of July's flags, here on skewers; the
 * Stocking, Christmas's red and green), and the Feast centrepiece (fair
 * shares: every portion gets one of each dish). Every panel has exactly
 * one answer (tests/puzzles/thanksgiving.test.ts); most were found by a
 * random search.
 */
import { run } from '../run';
import { type Panel } from '../../gen/carving';
import { mountCarving } from '../shikakuBoard';

export const WARMUP: Panel[] = [
  { name: 'One portion', rows: ['4 .', '. .'] },
  { name: 'Size counts', rows: ['. 4 .', '. . 2'] },
  { name: 'Shape matters', rows: ['4 . . .', '4 . . .'] },
  { name: 'Every square', rows: ['6 . . 1', '. . . .', '. . . 2', '. 6 . 1'] },
  {
    name: 'A first board',
    rows: ['3 2 . . .', '. . . . .', '. . . . 6', '. . 8 2 .', '2 . . 2 .'],
  },
];

export const HOTDOG: Panel[] = [
  // Training: no numbers at all, so the flags are the whole puzzle.
  { name: 'Count the pieces', rows: ['. .', '. .'], rowMarks: [1, 2] },
  { name: 'Down the columns', rows: ['. . .', '. . .'], colMarks: [1, 2, 1] },
  {
    name: 'A flag skewer',
    rows: ['4 2 . .', '. . . 2', '. . 3 .', '. . 3 .'],
    colMarks: [null, null, 3, null],
  },
  {
    name: 'Across and down',
    rows: ['. . . . .', '6 . . 3 4', '. . . . .', '. . . . .', '. . 2 . .'],
    rowMarks: [2, 3, null, null, 3],
    colMarks: [null, 2, 3, null, null],
  },
  {
    name: 'Kebabs',
    rows: ['. . . . .', '. . . 3 4', '. . . . .', '. . . . .', '. . . . .'],
    rowMarks: [2, 3, 4, null, 3],
    colMarks: [null, 2, 3, null, null],
  },
];

export const STOCKING: Panel[] = [
  {
    name: 'Red and green',
    rows: ['. . . 6 .', '. 4 . . .', '. . 4 . .', '. 4 . . 2'],
    colours: ['...g.', '.g...', '..r..', '.....'],
  },
  {
    name: 'Stripes',
    rows: [
      '. . 3 . . .',
      '. 3 . . . .',
      '3 . . . . 6',
      '. . . 6 . .',
      '3 . 2 2 3 .',
      '. 2 . . . 3',
    ],
    colours: ['..g...', '.r....', '.....r', '......', '...g..', '.r....'],
  },
  {
    name: 'A full stocking',
    rows: [
      '2 . . . . . 2',
      '4 . . . 4 . .',
      '. . . . . . 3',
      '. 3 8 . . . .',
      '. . 2 . . 6 .',
      '. 3 . 2 3 . .',
      '2 . . 2 . 3 .',
    ],
    colours: ['......g', '.......', '......r', '..r....', '.....g.', '.g.r...', 'r......'],
  },
];

export const FEAST: Panel[] = [
  {
    name: 'The big carve',
    rows: [
      '. . . 2 . . 6',
      '9 . . 2 . . .',
      '. . . . . . .',
      '. . . . 8 . 2',
      '. . 6 . . . .',
      '. 3 . . . 3 .',
      '2 . 2 . . 2 2',
    ],
  },
  {
    name: 'Fair shares',
    rows: ['T C P . C .', 'T . C T . P', '. . P C P .', 'T P C P . .', 'C P T T C T'],
  },
  {
    name: 'Fair shares, some sizes',
    rows: [
      'C T 4 P T C',
      'T P P T P .',
      'C . T P T C',
      '. 6 C C . P',
      'P . T . . C',
      'T C 6 . . P',
    ],
  },
  {
    name: 'Seconds',
    rows: [
      'C T P C P .',
      'P C C C . T',
      'C P C . P T',
      'T C T . T P',
      'T C T P C C',
      'P C C C C C',
    ],
    share: 'TPCC',
  },
  {
    name: 'The Feast',
    rows: [
      'C T P T P . P',
      'P P . . . C .',
      'T . T . C P C',
      '. C . T C T T',
      'C C T . . . C',
      '. P . . P P T',
      'T . C P C P T',
    ],
  },
];

const mountPanel: Parameters<typeof run<Panel>>[0]['mountPanel'] = (host, panel, hooks) =>
  mountCarving(host, panel, { solved: () => hooks.solved(), status: hooks.status });

const CONTROLS =
  'Drag from one square to another to carve the rectangle between them (it replaces any portions in its way); tap a portion to lift it off; tap an empty square for a one-square portion. The panels teach the rules; open a panel number to jump about.';

export const breadboard = run({
  id: 'breadboard',
  title: 'The Bread Board',
  room: 'Thanksgiving',
  kind: 'warm-up',
  from: "Shikaku (Nikoli; Tatham's Rectangles), taught panel by panel as in The Witness",
  rules: `${CONTROLS} (Rules: carve the board into rectangles; each holds exactly one number, and the number is its size.)`,
  panels: WARMUP,
  mountPanel,
});

export const hotdog = run({
  id: 'hotdog',
  title: 'The Hot Dog',
  room: 'Thanksgiving',
  kind: 'stray',
  from: 'Shikaku; twist from the Fourth of July: clues from the edge (cookout flags on skewers)',
  rules: `${CONTROLS} (Twist: a little cookout flag at the end of a row or column tops a skewer pushed straight through that line; its number is how many pieces (portions) the skewer goes through. With flags, a portion may hold no number. Tap a flag to see its skewer counted out; a wrong one is counted out in red.)`,
  panels: HOTDOG,
  mountPanel,
});

export const stocking = run({
  id: 'stocking',
  title: 'The Stocking',
  room: 'Thanksgiving',
  kind: 'stray',
  from: 'Shikaku; twist from Christmas: red and green',
  rules: `${CONTROLS} (Twist: a portion takes the colour of its red or green mark; two portions of the same colour may not share an edge, while plain portions can touch anything.)`,
  panels: STOCKING,
  mountPanel,
});

export const feast = run({
  id: 'feast',
  title: 'The Feast',
  room: 'Thanksgiving',
  kind: 'centrepiece',
  from: "Shikaku; Thanksgiving's own twist, fair shares (the round-one Hot Dog Platter, as panels)",
  rules: `${CONTROLS} (Twist: every portion gets the same fair share of dishes, shown above the board (one of each, or seconds of something); with dishes, a portion may hold no number.)`,
  panels: FEAST,
  mountPanel,
});
