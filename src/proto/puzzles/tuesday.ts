/**
 * Act III Finale ("Santa's Merger & Tuesday's Party"): six dual-twist boss
 * panels behind the 6-lamp door in Holiday Hall. One panel per holiday
 * puzzle genre, each combining two holiday twists so every twist appears
 * twice across the gauntlet.
 */
import type { Panel as CarvePanel } from '../../gen/carving';
import type { Panel as HopPanel } from '../../gen/hops';
import type { Panel as LightPanel } from '../../gen/lights';
import type { Panel as PicPanel } from '../../gen/pictures';
import type { Panel as WebPanel } from '../../gen/webs';
import type { Panel as WordPanel } from '../../gen/words';
import { mountWeb } from '../hashiBoard';
import { mountHops } from '../hopsBoard';
import { mountLights } from '../netBoard';
import { mountPicture } from '../pictureBoard';
import { run } from '../run';
import { mountCarving } from '../shikakuBoard';
import { mountStrands } from '../strandsBoard';

export type FinaleItem =
  | { name: string; tip?: string; genre: 'webs'; panel: WebPanel }
  | { name: string; tip?: string; genre: 'carving'; panel: CarvePanel }
  | { name: string; tip?: string; genre: 'lights'; panel: LightPanel }
  | { name: string; tip?: string; genre: 'words'; panel: WordPanel }
  | { name: string; tip?: string; genre: 'hops'; panel: HopPanel }
  | { name: string; tip?: string; genre: 'pictures'; panel: PicPanel };

export const FINALE_PANELS: FinaleItem[] = [
  {
    name: 'Frosty Web Hunt',
    tip: '🥚 Egg = steps from 🕷 · ❄️ Mirror joins',
    genre: 'webs',
    panel: {
      name: 'Frosty Web Hunt',
      rows: ['..3.5.2', '3.5.4..', '.......', '4.4...4', '.......', '2.4.3..', '..3.5.3'],
      frame: { top: 0, left: 0, bottom: 6, right: 6, axis: 'h' },
      home: [1, 2],
      eggs: [[5, 4, 3]],
    },
  },
  {
    name: 'Secret Recipe',
    tip: '🎃 ? = any size · 💌 Same letter = same size',
    genre: 'carving',
    panel: {
      name: 'Secret Recipe',
      rows: [
        '. . . . . . .',
        '. . A . . ? .',
        '. . . . . . 6',
        '. 6 . . . . .',
        '. . Y A . Y .',
        '. M . . . Y .',
        '. . . . . . ?',
      ],
      sizeLetters: ' Y M A   ',
      message: '264',
    },
  },
  {
    name: 'Midnight Pie',
    tip: '🎃 ? turns blind · 🥧 One wire per slice',
    genre: 'lights',
    panel: {
      name: 'Midnight Pie',
      rows: ['..684..', '.6947c.', '6fad178', '13c543c', '2ed7ba9', '.157a8.', '..138..'],
      plug: [3, 3],
      slices: ['..BBA..', '.BBBAA.', 'BBBBAAA', 'BBB*AAA', 'BBBAAAA', '.BBAAA.', '..BAA..'],
      dark: [
        [5, 1],
        [6, 4],
        [2, 0],
      ],
    },
  },
  {
    name: 'Frosted Bows',
    tip: '🎆 Same-color words don’t touch · ❄️ Mirror pairs',
    genre: 'words',
    panel: {
      name: 'Frosted Bows',
      theme: 'Garden of love',
      rows: ['YPOMBL', 'NPPOOC', 'ORNVLA', 'THEIIL', 'RTCOLE', 'ASLTET', 'UTOPAL'],
      words: [
        {
          word: 'POPPY',
          cells: [
            [1, 2],
            [0, 2],
            [1, 1],
            [0, 1],
            [0, 0],
          ],
        },
        {
          word: 'NECTAR',
          cells: [
            [2, 2],
            [3, 2],
            [4, 2],
            [4, 1],
            [5, 0],
            [4, 0],
          ],
        },
        {
          word: 'LOTUS',
          cells: [
            [5, 2],
            [6, 2],
            [6, 1],
            [6, 0],
            [5, 1],
          ],
        },
        {
          word: 'THORN',
          cells: [
            [3, 0],
            [3, 1],
            [2, 0],
            [2, 1],
            [1, 0],
          ],
        },
        {
          word: 'BLOOM',
          cells: [
            [0, 4],
            [0, 5],
            [1, 4],
            [1, 3],
            [0, 3],
          ],
        },
        {
          word: 'VIOLET',
          cells: [
            [2, 3],
            [3, 3],
            [4, 3],
            [4, 4],
            [4, 5],
            [5, 5],
          ],
        },
        {
          word: 'PETAL',
          cells: [
            [6, 3],
            [5, 4],
            [5, 3],
            [6, 4],
            [6, 5],
          ],
        },
        {
          word: 'LILAC',
          cells: [
            [2, 4],
            [3, 4],
            [3, 5],
            [2, 5],
            [1, 5],
          ],
        },
      ],
      frame: { top: 0, bottom: 6, left: 0, right: 5, axis: 'v' },
      colours: ['......', 'b....r', 'bbrbrr', 'bbrbrr', 'rrrbbb', 'rbbrrb', 'bbbrrr'],
      bows: [
        [4, 1],
        [6, 1],
        [3, 1],
        [4, 5],
        [6, 5],
        [3, 5],
      ],
    },
  },
  {
    name: 'Parade Dispatch',
    tip: '🎆 Match bunny colors · 💌 Letter eggs spell word',
    genre: 'hops',
    panel: {
      name: 'Parade Dispatch',
      rows: ['#######', '#######', '#######', '#######', '#######', '#######', '#######'],
      given: [
        [4, 0, 1],
        [3, 1, 1],
        [5, 5, 15],
        [4, 5, 20],
      ],
      colours: ['rrrrrrr', 'rrrrrrr', 'rwwrbwb', 'rbbrbbb', 'rbbbbbb', 'wbbbbbb', 'bbbbbbb'],
      letters: [
        [0, 3, 'G'],
        [0, 5, 'O'],
        [0, 6, 'L'],
        [1, 1, 'D'],
      ],
      message: '8 10 11 17',
      word: 'GOLD',
      blanks: [8, 10, 11, 17],
    },
  },
  {
    name: 'Confetti Shares',
    tip: '🦃 Equal shares per portion · 🥚 Egg = nth filled in row',
    genre: 'pictures',
    panel: {
      name: 'Confetti Shares',
      rows: ['##.#.', '....#', '#....', '.#.##', '..##.'],
      portions: ['AAAAA', 'AAAAA', 'ABBBB', 'BBBBB', 'BBBBB'],
      eggs: [
        [0, 3, 3],
        [3, 4, 3],
      ],
    },
  },
];

export const tuesday = run<FinaleItem>({
  id: 'tuesday',
  title: "Santa's Merger & Tuesday's Party",
  room: 'Tuesday',
  kind: 'final',
  from: 'All six holiday genres, each combining two holiday twists to foil Santa and throw Ordinary Tuesday a party',
  rules:
    'One board per holiday genre, each combining two holiday twists you have mastered across the house.',
  panels: FINALE_PANELS,
  mountPanel: (host, item, hooks) => {
    const h = { solved: () => hooks.solved(), status: hooks.status };
    if (item.genre === 'webs') mountWeb(host, item.panel, h);
    else if (item.genre === 'carving') mountCarving(host, item.panel, h);
    else if (item.genre === 'lights') mountLights(host, item.panel, h);
    else if (item.genre === 'words') mountStrands(host, item.panel, h);
    else if (item.genre === 'hops') mountHops(host, item.panel, h);
    else mountPicture(host, item.panel, h);
  },
});
