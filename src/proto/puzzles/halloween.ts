/**
 * Halloween: the web run (GAME.md, "Halloween: the web run"). Hashi panels
 * in four runs: the warm-up on the porch cobwebs, the two strays (the Box of
 * Chocolates brings Valentine's letters; the Tree-Top Star, Christmas
 * lights), and the Spider's Web centrepiece (the Jack-o'-Lantern's dark
 * knots, the Witch's Broom's diagonals). Every panel has exactly one answer
 * (tests/puzzles/halloween.test.ts); most were found by a random search.
 */
import { type Panel, fillMessage, letterValues, parse, solve } from '../../gen/webs';
import { mountWeb } from '../hashiBoard';
import { run } from '../run';

export const WARMUP: Panel[] = [
  { name: 'One thread', rows: ['1.1'] },
  { name: 'Doubles', rows: ['2..2'] },
  { name: 'Sharing out', rows: ['1.3.2'] },
  { name: 'No crossing', rows: ['.2.3', '3..3', '....', '21..'] },
  {
    name: 'One web',
    rows: ['2.2', '...', '2.2'],
    start: [
      [0, 0, 0, 2, 2],
      [2, 0, 2, 2, 2],
    ],
  },
  { name: 'A first web', rows: ['.....', '.....', '..243', '1...3', '1...2'] },
];

export const CHOCOLATES: Panel[] = [
  {
    name: 'A love note',
    rows: ['OL..4', '.....', '.....', '.4.O.', 'O...3'],
    message: '52VE',
  },
  {
    name: 'Be mine',
    rows: ['..E....', '158...B', '.E.....', '12B.B.5', '......2', '.......', '....2..'],
    message: 'W24',
  },
  {
    name: 'A dare',
    rows: [
      '.......1.',
      'R..2..R..',
      'E...EE.3.',
      '..R......',
      'E....R...',
      'R.....1..',
      'R.6.T..3.',
      '.........',
      '2R4..3..1',
    ],
    message: 'H3A24',
  },
];

/** What each message reads once its web is spun. */
export const MESSAGES = ['LOVE', 'WEB', 'HEART'];

export const STAR: Panel[] = [
  {
    name: 'Red, white and blue',
    rows: ['3..43', '2...3', '.....', '.....', '2...3'],
    colours: ['b..rb', 'r....', '.....', '.....', 'r...b'],
  },
  {
    name: 'A string of bulbs',
    rows: ['......2', '3..2..4', '..1...3', '4.4.2..', '.......', '3......', '3.3...2'],
    colours: ['......r', 'b..r..b', '..b...r', 'r.b.r..', '.......', 'b......', '..r...b'],
  },
  {
    name: 'White knots too',
    rows: [
      '..3.2...2',
      '..43..3..',
      '4.3......',
      '.........',
      '4..5.55.3',
      '...2..12.',
      '.........',
      '.....1...',
      '23.4...32',
    ],
    colours: [
      '..b.r...b',
      '..rb..r..',
      'r.b......',
      '.........',
      'b..r..b.r',
      '...r..rb.',
      '.........',
      '.....r...',
      'br.b...rb',
    ],
  },
];

export const SPIDER: Panel[] = [
  {
    name: 'The big web',
    rows: [
      '21..3...4',
      '5...3...5',
      '..242....',
      '....1....',
      '...23...5',
      '5.4...33.',
      '.......1.',
      '.........',
      '2.....2.4',
    ],
  },
  {
    name: 'In the dark',
    rows: ['.2?..', '.....', '....?', '1.3.3', '....1'],
  },
  {
    name: 'Deep in the dark',
    rows: ['?42...3', '.......', '...1.?4', '.1.....', '..4.2..', '..?...3', '......1'],
  },
  {
    name: 'Shadows in the rafters',
    rows: [
      '?1..3...?',
      '5...3...5',
      '..24?....',
      '....1....',
      '...23...5',
      '5.4...33.',
      '.......1.',
      '.........',
      '2.....2.4',
    ],
  },
  {
    name: "The spider's web",
    rows: [
      '....2.3?.',
      '?........',
      '2..1?..42',
      '..1...4..',
      '..1......',
      '3.5...5.?',
      '...?..66.',
      '.........',
      '..1...12.',
    ],
  },
];

const mountPanel: Parameters<typeof run<Panel>>[0]['mountPanel'] = (host, panel, hooks) => {
  mountWeb(host, panel, {
    solved: () => hooks.solved(),
    status: hooks.status,
  });
};

const CONTROLS =
  'Drag from a knot towards another to spin a thread between them; drag again for a double, and a third time to cut it (or tap a thread). Tapping one knot, then another, works too. The panels teach the rules; open a panel number to jump about.';

export const cobwebs = run({
  id: 'cobwebs',
  title: 'The Porch Cobwebs',
  room: 'Halloween',
  kind: 'warm-up',
  from: "Spiderweb (Nikoli's Hashiwokakero, Tatham's Bridges), taught panel by panel as in The Witness",
  rules: `${CONTROLS} (Rules: a knot's number is how many threads leave it; threads run straight, one or two between a pair, never crossing; the web hangs together as one.)`,
  panels: WARMUP,
  mountPanel,
});

export const chocolates = run({
  id: 'chocolates',
  title: 'The Box of Chocolates',
  room: 'Halloween',
  kind: 'stray',
  from: "Spiderweb; twist from Valentine's: Love Letters",
  rules: `${CONTROLS} (Twist: the same letter means the same count, different letters different counts. Each numbered blank in the message takes the letter with that many threads, so the words can help with the web, and the web with the words. A small number by a knot shows its threads so far.)`,
  panels: CHOCOLATES,
  mountPanel,
});

export const starlights = run({
  id: 'starlights',
  title: 'The Tree-Top Star',
  room: 'Halloween',
  kind: 'stray',
  from: 'Spiderweb; twist from Fourth of July: Red, White and Blue',
  rules: `${CONTROLS} (Twist: a thread only joins a red knot to a blue one; white knots can join anything.)`,
  panels: STAR,
  mountPanel,
});

export const web = run({
  id: 'web',
  title: "The Spider's Web",
  room: 'Halloween',
  kind: 'centrepiece',
  from: "Spiderweb; Halloween's own twist: Spooky (the Jack-o'-Lantern's dark knots)",
  rules: `${CONTROLS} (Twist: a dark knot (?) in the shadows may have any count.)`,
  panels: SPIDER,
  mountPanel,
});

/** For the tests: the panel's message, filled in from its one answer. */
export const message = (panel: Panel): string => {
  const web = parse(panel);
  const answer = solve(web, 1)[0];
  const values = answer && letterValues(web, answer);
  return values && panel.message ? fillMessage(panel.message, values) : '';
};
