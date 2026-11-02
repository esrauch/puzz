/**
 * Halloween: the web run (GAME.md, "Halloween: the web run"). Hashi panels
 * in four runs: the warm-up on the porch cobwebs, the two strays (the Box of
 * Chocolates brings Valentine's letters; the Tree-Top Star, Christmas
 * lights), and the Spider's Web centrepiece (the Jack-o'-Lantern's dark
 * knots, the Witch's Broom's diagonals). Every panel has exactly one answer
 * (tests/puzzles/halloween.test.ts); most were found by a random search.
 */
import { type Panel, fillMessage, letterValues, parse, solve } from '../hashi';
import { mountWeb } from '../hashiBoard';
import { h } from '../kit';
import { run } from '../run';

export const WARMUP: Panel[] = [
  { name: 'One thread', rows: ['1.1'] },
  { name: 'Doubles', rows: ['2..2'] },
  { name: 'Sharing out', rows: ['1.3.2'] },
  { name: 'No crossing', rows: ['.2.3', '3..3', '....', '21..'] },
  { name: 'One web', rows: ['2.2', '...', '2.2'] },
  { name: 'A first web', rows: ['.....', '.....', '..243', '1...3', '1...2'] },
];

export const CHOCOLATES: Panel[] = [
  { name: 'A love note', rows: ['.....', 'E.3L.', '..E..', 'E.4.E', '.....'], message: '1OV2' },
  {
    name: 'Be mine',
    rows: ['.I....', '.5.E..', '....IE', '......', '.6...4', '.3...E'],
    message: 'B2 M1N2',
  },
  {
    name: 'A dare',
    rows: ['..A...', 'A.E...', '....A.', 'R.R.R.', '.D..R.', 'R...E.'],
    message: 'I 1234 YOU',
  },
];

/** What each message reads once its web is spun. */
export const MESSAGES = ['LOVE', 'BE MINE', 'I DARE YOU'];

export const STAR: Panel[] = [
  {
    name: 'Red and green',
    rows: ['2..3.', '.....', '.....', '3.24.', '2..2.'],
    colours: ['r..g.', '.....', '.....', 'r.gr.', 'g..g.'],
  },
  {
    name: 'A string of bulbs',
    rows: ['.1....', '.4...3', '.2..13', '.2..44', '......', '....22'],
    colours: ['.g....', '.r...g', '.g..rr', '.g..rg', '......', '....gr'],
  },
  {
    name: 'From the plug to the star',
    rows: ['32....', '......', '......', '..243.', '41....', '4..43.'],
    colours: ['gr....', '......', '......', '..rgr.', 'rg....', 'g..rg.'],
    ends: [
      [3, 2],
      [4, 1],
    ],
  },
];

export const SPIDER: Panel[] = [
  {
    name: 'The big web',
    rows: [
      '.2..1...2',
      '...2...1.',
      '.........',
      '.3.7..3.4',
      '.........',
      '2..7...2.',
      '.....2..1',
      '1..3.....',
      '.2...6.3.',
    ],
  },
  {
    name: 'In the dark',
    rows: ['...2..?', '1?...1.', '...?51.', '.4..6?.', '....5.3', '....?1.', '.......'],
  },
  {
    name: 'Corner to corner',
    rows: ['2.....', '..3.2.', '4..41.', '......', '3.....', '23....'],
    diagonal: true,
  },
  {
    name: 'Dark and diagonal',
    rows: ['.61?...', '3...1?.', '?..5...', '.2..64.', '....4..', '3......', '.......'],
    diagonal: true,
  },
  {
    name: "The spider's web",
    rows: [
      '1....1..2',
      '..?.8.3.?',
      '3........',
      '271..1...',
      '..?.31.?.',
      '6........',
      '2?.......',
      '1........',
    ],
    diagonal: true,
  },
];

const mountPanel: Parameters<typeof run<Panel>>[0]['mountPanel'] = (host, panel, hooks) => {
  // A message's blanks, as tiles above the web: each shows its number until the web is spun.
  const tiles = (text: string, solved: boolean): HTMLElement => {
    let at = 0;
    // One unbreakable group per word, so a word never wraps mid-way.
    const words = text.split(' ').map((word) => {
      const group = h(
        'span',
        { style: { display: 'inline-flex', gap: '4px' } },
        ...[...word].map((ch, i) => {
          const blank = /[0-9]/.test(panel.message?.[at + i] ?? '');
          return h(
            'span',
            {
              style: {
                width: '30px',
                height: '38px',
                display: 'grid',
                placeItems: 'center',
                borderRadius: '6px',
                fontWeight: '700',
                fontSize: blank && !solved ? '14px' : '22px',
                background: blank ? (solved ? '#ffd54f' : '#fff') : '#f3e3e8',
                border: blank ? '2px dashed #c9a2b0' : '2px solid transparent',
                color: blank && !solved ? '#9a8a96' : '#7a1f3d',
              },
            },
            ch,
          );
        }),
      );
      at += word.length + 1;
      return group;
    });
    return h(
      'div',
      { style: { display: 'flex', gap: '6px 16px', flexWrap: 'wrap', margin: '0 0 10px' } },
      ...words,
    );
  };
  const note = panel.message ? tiles(panel.message, false) : null;
  if (note) host.append(note);
  mountWeb(host, panel, {
    solved: (web, threads) => {
      const values = letterValues(web, threads);
      if (note && panel.message && values)
        note.replaceWith(tiles(fillMessage(panel.message, values), true));
      hooks.solved();
    },
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
  from: "Hashi (Nikoli's Hashiwokakero, Tatham's Bridges), taught panel by panel as in The Witness",
  rules: `${CONTROLS} (Rules: a knot's number is how many threads leave it; threads run straight, one or two between a pair, never crossing; the web hangs together as one.)`,
  panels: WARMUP,
  mountPanel,
});

export const chocolates = run({
  id: 'chocolates',
  title: 'The Box of Chocolates',
  room: 'Halloween',
  kind: 'stray',
  from: "Hashi; twist from Valentine's: letters in place of numbers",
  rules: `${CONTROLS} (Twist: the same letter means the same count, different letters different counts. Each numbered blank in the message takes the letter with that many threads, so the words can help with the web, and the web with the words. A small number by a knot shows its threads so far.)`,
  panels: CHOCOLATES,
  mountPanel,
});

export const starlights = run({
  id: 'starlights',
  title: 'The Tree-Top Star',
  room: 'Halloween',
  kind: 'stray',
  from: 'Hashi; twist from Christmas: red and green bulbs, and a string of lights',
  rules: `${CONTROLS} (Twist: a thread only joins a red bulb to a green one. Last panel: the web is one unbranched string from the plug to the star.)`,
  panels: STAR,
  mountPanel,
});

export const web = run({
  id: 'web',
  title: "The Spider's Web",
  room: 'Halloween',
  kind: 'centrepiece',
  from: "Hashi; Halloween's own twists: the Jack-o'-Lantern's dark knots, the Witch's Broom's diagonals",
  rules: `${CONTROLS} (Twists: a dark knot may have any count; with the broom, threads may also run corner to corner, and still never cross.)`,
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
