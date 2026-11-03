/**
 * A holiday for Tuesday (tentative; GAME.md, "The final area: Tuesday's
 * party"): twelve panels, two per puzzle genre, each with two holiday twists it
 * hasn't had in its own room or as a stray: an intro, then a level where each twist does more. A grand finale may follow.
 */
import { type Panel as HashiPanel } from '../hashi';
import { mountWeb } from '../hashiBoard';
import { type Panel as NetPanel } from '../net';
import { mountLights } from '../netBoard';
import { type Panel as PicturePanel } from '../picture';
import { mountPicture } from '../pictureBoard';
import { run } from '../run';
import { type Panel as ShikakuPanel } from '../shikaku';
import { mountCarving } from '../shikakuBoard';
import { type Panel as StrandsPanel } from '../strands';
import { mountStrands } from '../strandsBoard';
import { type Panel as TwoHopsPanel } from '../twohops';
import { mountTwoHops } from '../twohopsBoard';

/** 1. Hashi with numbered eggs (threads from the spider's home 🕷) and edge flags (threads along a line). */
export const WEBS: HashiPanel = {
  name: 'Webs: eggs and flags',
  rows: ['254.2.', '......', '252...', '......', '.....1', '134..3'],
  home: [2, 0],
  eggs: [[0, 0, 1]],
  rowFlags: [null, null, null, null, null, null],
  colFlags: [null, 3, 1, null, null, null],
};

/** 2. Shikaku with coded sizes (the message spells CAKE) and sizes in the dark. */
export const CARVING: ShikakuPanel = {
  name: 'Carving: code and the dark',
  rows: ['C . . . . A', '. . A . ? .', '. . . . . .', '. ? . . E .', '. K . K K E', '. . . . . .'],
  sizeLetters: ' K EAC',
  message: '6524',
};

/** 3. Net with pieces in the dark (shown when the power reaches them) and edge flags (joins along a line). */
export const LIGHTS: NetPanel = {
  name: 'Lights: the dark and flags',
  rows: ['2eaaac', '6b86c1', '7c6938', '57d46c', '511791', '3aaba8'],
  plug: [5, 2],
  rowFlags: [null, null, null, null, null, null],
  colFlags: [null, null, null, 3, null, null],
  dark: [
    [0, 0],
    [1, 0],
    [1, 2],
    [1, 3],
  ],
};

/** 4. Strands with red and green words (a bow shows a word's colour; same colours never touch) and fair shares (three words per portion). */
export const WORDS: StrandsPanel = {
  name: 'Words: red, green and portions',
  theme: "Tuesday's party",
  rows: ['NOLAGA', 'COLBME', 'ANDLES', 'TNEMDA', 'RSCSUN', 'PEISEC'],
  words: [
    {
      word: 'BALLOON',
      cells: [
        [1, 3],
        [0, 3],
        [0, 2],
        [1, 2],
        [0, 1],
        [1, 1],
        [0, 0],
      ],
    },
    {
      word: 'CANDLE',
      cells: [
        [1, 0],
        [2, 0],
        [2, 1],
        [2, 2],
        [2, 3],
        [2, 4],
      ],
    },
    {
      word: 'GAMES',
      cells: [
        [0, 4],
        [0, 5],
        [1, 4],
        [1, 5],
        [2, 5],
      ],
    },
    {
      word: 'PRESENT',
      cells: [
        [5, 0],
        [4, 0],
        [5, 1],
        [4, 1],
        [3, 2],
        [3, 1],
        [3, 0],
      ],
    },
    {
      word: 'MUSIC',
      cells: [
        [3, 3],
        [4, 4],
        [4, 3],
        [5, 2],
        [4, 2],
      ],
    },
    {
      word: 'DANCES',
      cells: [
        [3, 4],
        [3, 5],
        [4, 5],
        [5, 5],
        [5, 4],
        [5, 3],
      ],
    },
  ],
  portions: ['AAAAAA', 'AAAAAA', 'AAAAAA', 'BBBBBB', 'BBBBBB', 'BBBBBB'],
  colours: ['rrrrgg', 'wrrrgg', 'wwwwwg', 'rrrgrr', 'rrgggr', 'rrgrrr'],
  bows: [
    [1, 5],
    [4, 3],
    [1, 2],
  ],
};

/** 5. Numbrix with two bunnies (red and green, white either) and letter eggs: each bunny's message spells a word (JOY, FUN). */
export const BUNNIES: TwoHopsPanel = {
  name: 'Two bunnies and a message',
  rows: ['gggrr', 'gggrw', 'ggggr', 'ggwwr', 'wrrrr'],
  given: [
    [1, 3, 1],
    [3, 0, 1],
  ],
  letters: [
    [4, 3, 'J'],
    [2, 4, 'O'],
    [0, 3, 'Y'],
    [2, 0, 'F'],
    [2, 2, 'U'],
    [1, 2, 'N'],
  ],
  message: '8 5 2',
  greenMessage: '2 10 7',
};

/** 6. A picture grid (two balloons and confetti) with numbered eggs (a filled square's place in its row) and fair shares (filled squares per portion). */
export const PICTURE: PicturePanel = {
  name: 'A picture: eggs and portions',
  rows: ['.##.#.##.', '####.####', '####.####', '.##...##.', '..#...#..', '...#.#.#.', '.#..#....'],
  portions: [
    'AAAABBBBB',
    'AAAABBBBB',
    'AAAABBBBB',
    'AAAABBBBB',
    'AAAABBBBB',
    'AAAABBBBB',
    'AAAAABBBB',
  ],
  eggs: [[5, 7, 3]],
};

// Second levels: each twist does more work (without either one, three or more answers fit).

/** 1b. A far egg (3 threads from home) and one row flag. */
export const WEBS_2: HashiPanel = {
  name: 'Webs: a far egg',
  rows: ['.......', '2.4..2.', '.......', '..2....', '4.6...3', '3.52..3', '2.4...2'],
  home: [5, 6],
  eggs: [[5, 0, 3]],
  rowFlags: [null, null, null, null, null, null, 2],
  colFlags: [null, null, null, null, null, null, null],
};

/** 2b. A five-letter code (PARTY) and more sizes in the dark. */
export const CARVING_2: ShikakuPanel = {
  name: 'Carving: a longer word',
  rows: [
    '. R . . . Y T',
    '. . P . . . .',
    '. ? . . . . .',
    'A . . . A ? .',
    '? . . . A . .',
    '. A . . . . .',
    '. . . 3 A . A',
  ],
  sizeLetters: ' A RT P Y',
  message: '72459',
};

/** 3b. Six pieces in the dark, one column flag. */
export const LIGHTS_2: NetPanel = {
  name: 'Lights: deeper in the dark',
  rows: ['6aaaac4', '7ec42b9', '117bee8', '6ad2978', '54786f8', '7938514', '382aba9'],
  plug: [6, 3],
  rowFlags: [null, null, null, null, null, null, null],
  colFlags: [null, null, null, null, 3, null, null],
  dark: [
    [0, 3],
    [3, 6],
    [4, 2],
    [5, 4],
    [5, 2],
    [4, 0],
  ],
};

/** 4b. Eight words side by side in two portions, three bows. */
export const WORDS_2: StrandsPanel = {
  name: 'Words: two big portions',
  theme: "Tuesday's party",
  rows: ['BAGANUCA', 'LOMSSAFK', 'LONEPRSE', 'THSSKPRE', 'EATRRLST', 'RMAEEENS'],
  words: [
    {
      word: 'BALLOONS',
      cells: [
        [0, 0],
        [0, 1],
        [1, 0],
        [2, 0],
        [2, 1],
        [1, 1],
        [2, 2],
        [3, 3],
      ],
    },
    {
      word: 'STREAMER',
      cells: [
        [3, 2],
        [4, 2],
        [4, 3],
        [5, 3],
        [5, 2],
        [5, 1],
        [4, 0],
        [5, 0],
      ],
    },
    {
      word: 'GAMES',
      cells: [
        [0, 2],
        [0, 3],
        [1, 2],
        [2, 3],
        [1, 3],
      ],
    },
    {
      word: 'HAT',
      cells: [
        [3, 1],
        [4, 1],
        [3, 0],
      ],
    },
    {
      word: 'PRESENTS',
      cells: [
        [3, 5],
        [3, 6],
        [3, 7],
        [4, 6],
        [5, 5],
        [5, 6],
        [4, 7],
        [5, 7],
      ],
    },
    {
      word: 'SPARKLER',
      cells: [
        [1, 4],
        [2, 4],
        [1, 5],
        [2, 5],
        [3, 4],
        [4, 5],
        [5, 4],
        [4, 4],
      ],
    },
    {
      word: 'CAKES',
      cells: [
        [0, 6],
        [0, 7],
        [1, 7],
        [2, 7],
        [2, 6],
      ],
    },
    {
      word: 'FUN',
      cells: [
        [1, 6],
        [0, 5],
        [0, 4],
      ],
    },
  ],
  portions: ['AAAABBBB', 'AAAABBBB', 'AAAABBBB', 'AAAABBBB', 'AAAABBBB', 'AAAABBBB'],
  colours: ['ggrrggrr', 'ggrrwwgr', 'gggrwwrr', 'wwrgwggg', 'rwrrwwgg', 'rrrrwggg'],
  bows: [
    [1, 2],
    [5, 3],
    [0, 5],
  ],
};

/** 5b. Two bunnies on a bigger lawn: CAKE and GIFT. */
export const BUNNIES_2: TwoHopsPanel = {
  name: 'Two bunnies, two longer words',
  rows: ['rrgggg', 'wrrgwg', 'rggggw', 'rgwggg', 'wgwggr', 'rrrrrr'],
  given: [
    [4, 5, 1],
    [0, 2, 1],
    [0, 4, 21],
  ],
  letters: [
    [5, 5, 'C'],
    [5, 4, 'A'],
    [0, 1, 'K'],
    [3, 0, 'E'],
    [2, 3, 'G'],
    [2, 2, 'I'],
    [3, 1, 'F'],
    [4, 1, 'T'],
  ],
  message: '2 3 13 9',
  greenMessage: '4 5 7 8',
};

/** 6b. Three balloons in three portions, and two eggs (one a 3). */
export const PICTURE_2: PicturePanel = {
  name: 'A picture: three balloons',
  rows: [
    '.##..###...##.',
    '####.####.####',
    '####.####.####',
    '.###..##...##.',
    '..#..#.#...#..',
    '...#...#..#...',
    '....#..#.#....',
    '..#..#.##.....',
    '......##......',
  ],
  portions: [
    'AAAAABBBCCCCCC',
    'AAAAABBBCCCCCC',
    'AAAAABBBCCCCCC',
    'AAAAABBBCCCCCC',
    'AAAAABBBCCCCCC',
    'AAAAABBBCCCCCC',
    'AAAAABBBCCCCCC',
    'AAAAAABBCCCCCC',
    'AAAAABBBCCCCCC',
  ],
  eggs: [
    [5, 3, 1],
    [5, 10, 3],
  ],
};

type Tuesday =
  | { name: string; kind: 'web'; panel: HashiPanel }
  | { name: string; kind: 'carving'; panel: ShikakuPanel }
  | { name: string; kind: 'lights'; panel: NetPanel }
  | { name: string; kind: 'words'; panel: StrandsPanel }
  | { name: string; kind: 'bunnies'; panel: TwoHopsPanel }
  | { name: string; kind: 'picture'; panel: PicturePanel };

export const PANELS: Tuesday[] = [
  { name: WEBS.name, kind: 'web', panel: WEBS },
  { name: WEBS_2.name, kind: 'web', panel: WEBS_2 },
  { name: CARVING.name, kind: 'carving', panel: CARVING },
  { name: CARVING_2.name, kind: 'carving', panel: CARVING_2 },
  { name: LIGHTS.name, kind: 'lights', panel: LIGHTS },
  { name: LIGHTS_2.name, kind: 'lights', panel: LIGHTS_2 },
  { name: WORDS.name, kind: 'words', panel: WORDS },
  { name: WORDS_2.name, kind: 'words', panel: WORDS_2 },
  { name: BUNNIES.name, kind: 'bunnies', panel: BUNNIES },
  { name: BUNNIES_2.name, kind: 'bunnies', panel: BUNNIES_2 },
  { name: PICTURE.name, kind: 'picture', panel: PICTURE },
  { name: PICTURE_2.name, kind: 'picture', panel: PICTURE_2 },
];

export const tuesday = run<Tuesday>({
  id: 'tuesday',
  title: 'A Holiday for Tuesday',
  room: 'Tuesday',
  kind: 'final',
  from: 'Each genre with two holiday twists it has not had yet (tentative)',
  rules:
    'Twelve panels, two of each kind of puzzle from the rooms, each with two twists from other holidays. Webs: drag between knots. Carving: drag rectangles. Lights: tap to turn (dark pieces turn blind until lit). Words: drag through letters. Bunnies: drag from a bunny. Pictures: tap or drag to fill.',
  panels: PANELS,
  mountPanel: (host, t, hooks) => {
    const done = { solved: () => hooks.solved(), status: hooks.status };
    if (t.kind === 'web') mountWeb(host, t.panel, done);
    else if (t.kind === 'carving') mountCarving(host, t.panel, done);
    else if (t.kind === 'lights') mountLights(host, t.panel, done);
    else if (t.kind === 'words') mountStrands(host, t.panel, done);
    else if (t.kind === 'bunnies') mountTwoHops(host, t.panel, done);
    else mountPicture(host, t.panel, done);
  },
});
