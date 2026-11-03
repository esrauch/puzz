/**
 * Christmas: the lights run (GAME.md, "Christmas: the lights run"). Net
 * panels in four runs: the warm-up on the fairy lights, the two strays (the
 * Golden Egg brings Easter's numbered eggs on an egg-shaped board; the
 * Pumpkin Pie, Thanksgiving's fair shares on a pie cut in slices), and the
 * Christmas Tree centrepiece (red and green strings, on trees and a wreath).
 * Every panel has exactly one answer (tests/puzzles/christmas.test.ts);
 * most were found by a random search.
 */
import { type LightsPanel, mountLights } from '../netBoard';
import { run } from '../run';

export const WARMUP: LightsPanel[] = [
  { name: 'One turn', rows: ['2a8'], plug: [0, 0], start: ['258'] },
  { name: 'Corners', rows: ['44', '39'], plug: [0, 0], start: ['24', 'c3'] },
  { name: 'A branch', rows: ['2ec', '291'], plug: [1, 1] },
  { name: 'No loose ends', rows: ['6a8', '7ac', '129'], plug: [2, 1] },
  { name: 'Everything lit', rows: ['444', '3b9'], plug: [1, 0] },
  { name: 'A first string', rows: ['682c', '7aad', '7a81', '3aa8'], plug: [3, 1] },
];

export const EGG: LightsPanel[] = [
  {
    name: 'A numbered egg',
    rows: ['..6c..', '.6d38.', '2952e8', '46bebc', '794785', '3ad7c1', '.2911.'],
    plug: [6, 3],
    eggs: [[0, 2, 7]],
  },
  {
    name: 'A clutch of eggs',
    rows: ['..684..', '.2d47c.', '.43d15.', '2d6faf8', '6fd147c', '153ed11', '.38578.', '..291..'],
    plug: [7, 3],
    eggs: [
      [1, 3, 8],
      [4, 4, 4],
    ],
  },
  {
    name: 'The Golden Egg',
    rows: [
      '...6c...',
      '..6d14..',
      '.295454.',
      '.2abd7d.',
      '682ed178',
      '542d7878',
      '3ba9787c',
      '2c2eba91',
      '.3ebae8.',
      '..3a81..',
    ],
    plug: [9, 4],
    eggs: [
      [0, 3, 14],
      [1, 5, 15],
    ],
  },
];

export const PIE: LightsPanel[] = [
  {
    name: 'Two slices',
    rows: ['.684.', '2feb8', '2956c', '2efd1', '.111.'],
    plug: [2, 2],
    slices: ['.BBB.', 'BBBBB', 'BB*AA', 'AAAAA', '.AAA.'],
  },
  {
    name: 'Three slices',
    rows: ['.468.', '6d3ec', '17e91', '29568', '.2b9.'],
    plug: [2, 2],
    slices: ['.BCC.', 'BBCCC', 'BB*CC', 'BBAAA', '.AAA.'],
  },
  {
    name: 'Four slices',
    rows: ['.6844.', '47c7f8', '397d38', '2e93e8', '2f86b8', '.3838.'],
    plug: [2, 2],
    slices: ['.CCDD.', 'CCCDDD', 'CC**DD', 'BB**AA', 'BBBAAA', '.BBAA.'],
  },
];

export const TREE: LightsPanel[] = [
  {
    name: 'A little tree',
    rows: ['...4...', '..2d4..', '..6f9..', '.2d7a8.', '.453ec.', '2bb8138'],
    plug: [5, 3],
    star: [0, 3],
  },
  {
    name: 'Red and green',
    rows: ['...4...', '..6bc..', '..529..', '.6d6e8.', '.5153c.', '6d296d4', '1382939'],
    plug: [6, 3],
    greenPlug: [6, 2],
    colours: ['...g...', '..ggg..', '..ggg..', '.ggrrr.', '.ggrrr.', 'ggrrrrr', 'gggrrrr'],
    star: [0, 3],
  },
  {
    name: 'A taller tree',
    rows: [
      '....4....',
      '...47c...',
      '...795...',
      '..43c3c..',
      '..54545..',
      '.6939578.',
      '.3c6e93c.',
      '685516c7c',
      '3ab929391',
    ],
    plug: [8, 3],
    greenPlug: [8, 4],
    colours: [
      '....g....',
      '...ggg...',
      '...ggg...',
      '..rgggg..',
      '..rggrg..',
      '.rrggrgg.',
      '.rrrrrgg.',
      'rrrrrgggg',
      'rrrrggggg',
    ],
    star: [0, 4],
  },
  {
    name: 'The wreath, with white lights',
    rows: [
      '..6aac..',
      '.292abc.',
      '2c....3c',
      '6d....45',
      '51....55',
      '3c....79',
      '.3eac69.',
      '..1291..',
    ],
    plug: [7, 5],
    greenPlug: [7, 3],
    colours: [
      '..rrrr..',
      '.rrrrrr.',
      'gg....rr',
      'gg....rr',
      'gg....rr',
      'gg....rr',
      '.ggggrr.',
      '..gggr..',
    ],
  },
  {
    name: 'The Christmas Tree',
    rows: [
      '....4....',
      '....5....',
      '...6b8...',
      '...568...',
      '..6956c..',
      '..54555..',
      '..55555..',
      '.43d3978.',
      '.7c3e83c.',
      '6d1696c7c',
      '13a929391',
    ],
    plug: [10, 3],
    greenPlug: [10, 4],
    colours: [
      '....w....',
      '....r....',
      '...rrw...',
      '...wwg...',
      '..wrwgw..',
      '..rwggg..',
      '..rrwwg..',
      '.rwwgggg.',
      '.rrwrrwg.',
      'wrwwrgwgw',
      'rrrrgwwgw',
    ],
    star: [0, 4],
  },
];

const mountPanel: Parameters<typeof run<LightsPanel>>[0]['mountPanel'] = (host, panel, hooks) =>
  mountLights(host, panel, { solved: () => hooks.solved(), status: hooks.status });

const CONTROLS =
  'Tap a piece to turn it a quarter clockwise (always clockwise; four taps go all the way round). The panels teach the rules; open a panel number to jump about.';

export const fairylights = run({
  id: 'fairylights',
  title: 'The Fairy Lights',
  room: 'Christmas',
  kind: 'warm-up',
  from: "Net (Simon Tatham's collection), taught panel by panel as in The Witness",
  rules: `${CONTROLS} (Rules: turn the pieces so the power from the plug reaches every square, with no loose wire ends.)`,
  panels: WARMUP,
  mountPanel,
});

export const goldenegg = run({
  id: 'goldenegg',
  title: 'The Golden Egg',
  room: 'Christmas',
  kind: 'stray',
  from: 'Net; twist from Easter: numbered eggs',
  rules: `${CONTROLS} (Twist: the power must reach each numbered egg in exactly that many steps from the plug, counting squares along the wire.)`,
  panels: EGG,
  mountPanel,
});

export const pumpkinpie = run({
  id: 'pumpkinpie',
  title: 'The Pumpkin Pie',
  room: 'Christmas',
  kind: 'stray',
  from: 'Net; twist from Thanksgiving: fair shares',
  rules: `${CONTROLS} (Twist: each slice gets exactly one wire from the middle, across a dotted edge, and no wire may cross a thick crust line between two slices. Each slice shows how many wires it gets from the middle so far.)`,
  panels: PIE,
  mountPanel,
});

export const tree = run({
  id: 'tree',
  title: 'The Christmas Tree',
  room: 'Christmas',
  kind: 'centrepiece',
  from: "Net; Christmas's own red and green: two strings, each from its own plug",
  rules: `${CONTROLS} (Twist: a red string and a green string, each from its own plug; red pieces only join red, green only green, and the strings never join. White lights can belong to either string, and light up in its colour.)`,
  panels: TREE,
  mountPanel,
});
