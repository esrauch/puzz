/**
 * Valentine's: the love-letter run (GAME.md, "Valentine's: the love-letter
 * run"). Strands panels in four runs: the warm-up love notes, the two strays
 * (the Jack-o'-Lantern brings Halloween's dark; the Bunny's Basket, Easter's
 * numbered eggs), and the Valentine Mailbox centrepiece (letters written as
 * numbers). The words were laid out by a random search so they fill each
 * grid and each can be spelled only one way (tests/puzzles/valentines.test.ts).
 */
import { run } from '../run';
import { type Panel } from '../strands';
import { mountStrands } from '../strandsBoard';

export const LOVENOTES: Panel[] = [
  {
    name: 'One word',
    theme: 'Four letters',
    rows: ['LV', 'OE'],
    words: [
      {
        word: 'LOVE',
        cells: [
          [0, 0],
          [1, 0],
          [0, 1],
          [1, 1],
        ],
      },
    ],
  },
  {
    name: 'Two words',
    theme: 'Red for love',
    rows: ['TRA', 'EHE', 'SOR'],
    words: [
      {
        word: 'HEART',
        cells: [
          [1, 1],
          [1, 2],
          [0, 2],
          [0, 1],
          [0, 0],
        ],
      },
      {
        word: 'ROSE',
        cells: [
          [2, 2],
          [2, 1],
          [2, 0],
          [1, 0],
        ],
      },
    ],
  },
  {
    name: 'Three words',
    theme: "Cupid's kit",
    rows: ['MIWO', 'AWSR', 'IGRW', 'NABO'],
    words: [
      {
        word: 'ARROW',
        cells: [
          [3, 1],
          [2, 2],
          [1, 3],
          [0, 3],
          [0, 2],
        ],
      },
      {
        word: 'BOW',
        cells: [
          [3, 2],
          [3, 3],
          [2, 3],
        ],
      },
      {
        word: 'WINGS',
        cells: [
          [1, 1],
          [2, 0],
          [3, 0],
          [2, 1],
          [1, 2],
        ],
      },
      {
        word: 'AIM',
        cells: [
          [1, 0],
          [0, 1],
          [0, 0],
        ],
      },
    ],
  },
  {
    name: 'Side to side',
    theme: 'Be mine',
    rows: ['VACSS', 'LENAI', 'RTIRK', 'OESND', 'SHUGE'],
    words: [
      {
        word: 'VALENTINE',
        cells: [
          [0, 0],
          [0, 1],
          [1, 0],
          [1, 1],
          [1, 2],
          [2, 1],
          [2, 2],
          [3, 3],
          [4, 4],
        ],
      },
      {
        word: 'ROSES',
        cells: [
          [2, 0],
          [3, 0],
          [4, 0],
          [3, 1],
          [3, 2],
        ],
      },
      {
        word: 'CARD',
        cells: [
          [0, 2],
          [1, 3],
          [2, 3],
          [3, 4],
        ],
      },
      {
        word: 'KISS',
        cells: [
          [2, 4],
          [1, 4],
          [0, 4],
          [0, 3],
        ],
      },
      {
        word: 'HUG',
        cells: [
          [4, 1],
          [4, 2],
          [4, 3],
        ],
      },
    ],
    spangram: true,
  },
  {
    name: 'A full note',
    theme: 'Sweet talk',
    rows: ['SEEART', 'EWEHLG', 'IHGTEN', 'DTONAD', 'ECUNIA', 'AREYLR'],
    words: [
      {
        word: 'SWEETHEART',
        cells: [
          [0, 0],
          [1, 1],
          [0, 1],
          [1, 2],
          [2, 3],
          [1, 3],
          [0, 2],
          [0, 3],
          [0, 4],
          [0, 5],
        ],
      },
      {
        word: 'HONEY',
        cells: [
          [2, 1],
          [3, 2],
          [4, 3],
          [5, 2],
          [5, 3],
        ],
      },
      {
        word: 'DARLING',
        cells: [
          [3, 5],
          [4, 5],
          [5, 5],
          [5, 4],
          [4, 4],
          [3, 3],
          [2, 2],
        ],
      },
      {
        word: 'CUTIE',
        cells: [
          [4, 1],
          [4, 2],
          [3, 1],
          [2, 0],
          [1, 0],
        ],
      },
      {
        word: 'DEAR',
        cells: [
          [3, 0],
          [4, 0],
          [5, 0],
          [5, 1],
        ],
      },
      {
        word: 'ANGEL',
        cells: [
          [3, 4],
          [2, 5],
          [1, 5],
          [2, 4],
          [1, 4],
        ],
      },
    ],
    spangram: true,
  },
];

export const JACK: Panel[] = [
  {
    name: 'Boo & you',
    theme: 'Boo & you',
    rows: ['BTRNI', 'OOEKP', 'TAPUM'],
    words: [
      {
        word: 'BOO',
        cells: [
          [0, 0],
          [1, 1],
          [1, 0],
        ],
      },
      {
        word: 'PUMPKIN',
        cells: [
          [2, 2],
          [2, 3],
          [2, 4],
          [1, 4],
          [1, 3],
          [0, 4],
          [0, 3],
        ],
      },
      {
        word: 'TREAT',
        cells: [
          [0, 1],
          [0, 2],
          [1, 2],
          [2, 1],
          [2, 0],
        ],
      },
    ],
    dark: [
      [0, 0],
      [1, 4],
    ],
  },
  {
    name: 'Bewitched',
    theme: 'Bewitched',
    rows: ['CXEHN', 'HRIOD', 'AEMTE', 'DPOIH', 'BEWTC'],
    words: [
      {
        word: 'BEWITCHED',
        cells: [
          [4, 0],
          [4, 1],
          [4, 2],
          [3, 3],
          [4, 3],
          [4, 4],
          [3, 4],
          [2, 4],
          [1, 4],
        ],
      },
      {
        word: 'CHARMED',
        cells: [
          [0, 0],
          [1, 0],
          [2, 0],
          [1, 1],
          [2, 2],
          [2, 1],
          [3, 0],
        ],
      },
      {
        word: 'POTION',
        cells: [
          [3, 1],
          [3, 2],
          [2, 3],
          [1, 2],
          [1, 3],
          [0, 4],
        ],
      },
      {
        word: 'HEX',
        cells: [
          [0, 3],
          [0, 2],
          [0, 1],
        ],
      },
    ],
    spangram: true,
    dark: [
      [3, 4],
      [4, 0],
      [0, 4],
      [1, 0],
    ],
  },
  {
    name: 'Ghoulfriend',
    theme: 'Ghoulfriend',
    rows: ['GOTEDOVE', 'HYSNLNBI', 'DNIGSOET', 'UETAMLUT'],
    words: [
      {
        word: 'UNDYINGLOVE',
        cells: [
          [3, 0],
          [2, 1],
          [2, 0],
          [1, 1],
          [2, 2],
          [1, 3],
          [2, 3],
          [1, 4],
          [0, 5],
          [0, 6],
          [0, 7],
        ],
      },
      {
        word: 'GHOSTED',
        cells: [
          [0, 0],
          [1, 0],
          [0, 1],
          [1, 2],
          [0, 2],
          [0, 3],
          [0, 4],
        ],
      },
      {
        word: 'BITTEN',
        cells: [
          [1, 6],
          [1, 7],
          [2, 7],
          [3, 7],
          [2, 6],
          [1, 5],
        ],
      },
      {
        word: 'SOULMATE',
        cells: [
          [2, 4],
          [2, 5],
          [3, 6],
          [3, 5],
          [3, 4],
          [3, 3],
          [3, 2],
          [3, 1],
        ],
      },
    ],
    spangram: true,
    dark: [
      [0, 0],
      [3, 0],
      [0, 1],
      [0, 5],
      [3, 4],
      [2, 7],
    ],
  },
];

export const BASKET: Panel[] = [
  {
    name: 'Some bunny',
    theme: 'Some bunny',
    rows: ['HEOEA', 'OSTNR', 'PAILS'],
    words: [
      {
        word: 'HOP',
        cells: [
          [0, 0],
          [1, 0],
          [2, 0],
        ],
      },
      {
        word: 'EARS',
        cells: [
          [0, 3],
          [0, 4],
          [1, 4],
          [2, 4],
        ],
      },
      {
        word: 'TAIL',
        cells: [
          [1, 2],
          [2, 1],
          [2, 2],
          [2, 3],
        ],
      },
      {
        word: 'NOSE',
        cells: [
          [1, 3],
          [0, 2],
          [1, 1],
          [0, 1],
        ],
      },
    ],
    eggs: [
      [0, 0],
      [0, 4],
      [1, 2],
    ],
  },
  {
    name: 'Spring fling',
    theme: 'Spring fling',
    rows: ['NECKB', 'STHCM', 'BLOIA', 'PISLM', 'LUTSO'],
    words: [
      {
        word: 'BLOSSOM',
        cells: [
          [2, 0],
          [2, 1],
          [2, 2],
          [3, 2],
          [4, 3],
          [4, 4],
          [3, 4],
        ],
      },
      {
        word: 'TULIP',
        cells: [
          [4, 2],
          [4, 1],
          [4, 0],
          [3, 1],
          [3, 0],
        ],
      },
      {
        word: 'LAMB',
        cells: [
          [3, 3],
          [2, 4],
          [1, 4],
          [0, 4],
        ],
      },
      {
        word: 'CHICK',
        cells: [
          [0, 2],
          [1, 2],
          [2, 3],
          [1, 3],
          [0, 3],
        ],
      },
      {
        word: 'NEST',
        cells: [
          [0, 0],
          [0, 1],
          [1, 0],
          [1, 1],
        ],
      },
    ],
    spangram: true,
    eggs: [
      [2, 0],
      [3, 0],
      [3, 3],
      [0, 3],
      [4, 2],
      [0, 2],
    ],
  },
  {
    name: 'Egg hunt',
    theme: 'Egg hunt',
    rows: ['JRIBBE', 'SELOAS', 'SLNETE', 'ARYGRB', 'GBEGNO', 'NASTEN'],
    words: [
      {
        word: 'EASTEREGGS',
        cells: [
          [0, 5],
          [1, 4],
          [1, 5],
          [2, 4],
          [2, 5],
          [3, 4],
          [2, 3],
          [3, 3],
          [4, 3],
          [5, 2],
        ],
      },
      {
        word: 'BONNET',
        cells: [
          [3, 5],
          [4, 5],
          [5, 5],
          [4, 4],
          [5, 4],
          [5, 3],
        ],
      },
      {
        word: 'RIBBON',
        cells: [
          [0, 1],
          [0, 2],
          [0, 3],
          [0, 4],
          [1, 3],
          [2, 2],
        ],
      },
      {
        word: 'GRASS',
        cells: [
          [4, 0],
          [3, 1],
          [3, 0],
          [2, 0],
          [1, 0],
        ],
      },
      {
        word: 'JELLYBEAN',
        cells: [
          [0, 0],
          [1, 1],
          [1, 2],
          [2, 1],
          [3, 2],
          [4, 1],
          [4, 2],
          [5, 1],
          [5, 0],
        ],
      },
    ],
    spangram: true,
    eggs: [
      [0, 5],
      [4, 5],
      [0, 1],
      [3, 1],
      [0, 0],
      [3, 5],
      [4, 0],
    ],
  },
];

export const MAILBOX: Panel[] = [
  {
    name: 'In the post',
    theme: 'In the post',
    rows: ['POSN', 'LTOE', 'IAMT'],
    words: [
      {
        word: 'MAIL',
        cells: [
          [2, 2],
          [2, 1],
          [2, 0],
          [1, 0],
        ],
      },
      {
        word: 'NOTE',
        cells: [
          [0, 3],
          [1, 2],
          [2, 3],
          [1, 3],
        ],
      },
      {
        word: 'POST',
        cells: [
          [0, 0],
          [0, 1],
          [0, 2],
          [1, 1],
        ],
      },
    ],
    code: 'O',
  },
  {
    name: 'Love letters',
    theme: 'Love letters',
    rows: ['SREN', 'ELTE', 'IATP', 'NKEL'],
    words: [
      {
        word: 'LETTER',
        cells: [
          [3, 3],
          [3, 2],
          [2, 2],
          [1, 2],
          [0, 2],
          [0, 1],
        ],
      },
      {
        word: 'INK',
        cells: [
          [2, 0],
          [3, 0],
          [3, 1],
        ],
      },
      {
        word: 'PEN',
        cells: [
          [2, 3],
          [1, 3],
          [0, 3],
        ],
      },
      {
        word: 'SEAL',
        cells: [
          [0, 0],
          [1, 0],
          [2, 1],
          [1, 1],
        ],
      },
    ],
    code: 'EL',
  },
  {
    name: 'Sealed with a kiss',
    theme: 'Sealed with a kiss',
    rows: ['ENVPE', 'COXEO', 'DAXOL', 'PRMST', 'OEPMA'],
    words: [
      {
        word: 'ENVELOPE',
        cells: [
          [0, 0],
          [0, 1],
          [0, 2],
          [1, 3],
          [2, 4],
          [1, 4],
          [0, 3],
          [0, 4],
        ],
      },
      {
        word: 'STAMP',
        cells: [
          [3, 3],
          [3, 4],
          [4, 4],
          [4, 3],
          [4, 2],
        ],
      },
      {
        word: 'POEM',
        cells: [
          [3, 0],
          [4, 0],
          [4, 1],
          [3, 2],
        ],
      },
      {
        word: 'XOXO',
        cells: [
          [2, 2],
          [2, 3],
          [1, 2],
          [1, 1],
        ],
      },
      {
        word: 'CARD',
        cells: [
          [1, 0],
          [2, 1],
          [3, 1],
          [2, 0],
        ],
      },
    ],
    spangram: true,
    code: 'EOP',
  },
  {
    name: 'Sweet nothings',
    theme: 'Sweet nothings',
    rows: ['IYEAU', 'IMROH', 'SNYSN', 'ASUTE', 'ODCRT', 'RESMI'],
    words: [
      {
        word: 'IMISSYOU',
        cells: [
          [0, 0],
          [1, 1],
          [1, 0],
          [2, 0],
          [3, 1],
          [2, 2],
          [1, 3],
          [0, 4],
        ],
      },
      {
        word: 'CRUSH',
        cells: [
          [4, 2],
          [4, 3],
          [3, 2],
          [2, 3],
          [1, 4],
        ],
      },
      {
        word: 'SMITTEN',
        cells: [
          [5, 2],
          [5, 3],
          [5, 4],
          [4, 4],
          [3, 3],
          [3, 4],
          [2, 4],
        ],
      },
      {
        word: 'ADORE',
        cells: [
          [3, 0],
          [4, 1],
          [4, 0],
          [5, 0],
          [5, 1],
        ],
      },
      {
        word: 'YEARN',
        cells: [
          [0, 1],
          [0, 2],
          [0, 3],
          [1, 2],
          [2, 1],
        ],
      },
    ],
    spangram: true,
    code: 'SEIR',
  },
  {
    name: 'Dear Valentine',
    theme: 'Dear Valentine',
    rows: ['BGHDIC', 'HEUPUS', 'REMROE', 'TALYVS', 'SONELA', 'VETINE'],
    words: [
      {
        word: 'BEMYVALENTINE',
        cells: [
          [0, 0],
          [1, 1],
          [2, 2],
          [3, 3],
          [3, 4],
          [4, 5],
          [4, 4],
          [4, 3],
          [4, 2],
          [5, 2],
          [5, 3],
          [5, 4],
          [5, 5],
        ],
      },
      {
        word: 'ROSES',
        cells: [
          [2, 3],
          [2, 4],
          [3, 5],
          [2, 5],
          [1, 5],
        ],
      },
      {
        word: 'CUPID',
        cells: [
          [0, 5],
          [1, 4],
          [1, 3],
          [0, 4],
          [0, 3],
        ],
      },
      {
        word: 'LOVE',
        cells: [
          [3, 2],
          [4, 1],
          [5, 0],
          [5, 1],
        ],
      },
      {
        word: 'HEARTS',
        cells: [
          [1, 0],
          [2, 1],
          [3, 1],
          [2, 0],
          [3, 0],
          [4, 0],
        ],
      },
      {
        word: 'HUG',
        cells: [
          [0, 2],
          [1, 2],
          [0, 1],
        ],
      },
    ],
    spangram: true,
    code: 'ESAHIL',
  },
];

const mountPanel: Parameters<typeof run<Panel>>[0]['mountPanel'] = (host, panel, hooks) =>
  mountStrands(host, panel, { solved: () => hooks.solved(), status: hooks.status });

const CONTROLS =
  'Drag through touching letters (diagonals too) to spell a word; slide back to undo a letter; let go to check it. Every letter is in exactly one theme word. The panels teach the rules; open a panel number to jump about.';

export const lovenotes = run({
  id: 'lovenotes',
  title: 'Love Notes',
  room: "Valentine's",
  kind: 'warm-up',
  from: "Strands (the New York Times' Strands), taught panel by panel as in The Witness",
  rules: `${CONTROLS} (A spangram, on bigger boards, runs from one side of the board to the other.)`,
  panels: LOVENOTES,
  mountPanel,
});

export const jack = run({
  id: 'jack',
  title: "The Jack-o'-Lantern",
  room: "Valentine's",
  kind: 'stray',
  from: 'Strands; twist from Halloween: letters in the dark',
  rules: `${CONTROLS} (Twist: some letters are in the dark, shown as ?; they light up when a word through them is found.)`,
  panels: JACK,
  mountPanel,
});

export const basket = run({
  id: 'basket',
  title: "The Bunny's Basket",
  room: "Valentine's",
  kind: 'stray',
  from: 'Strands; twist from Easter: numbered eggs',
  rules: `${CONTROLS} (Twist: an egg on a letter gives its place in its word; an egg marked 1 starts a word.)`,
  panels: BASKET,
  mountPanel,
});

export const mailbox = run({
  id: 'mailbox',
  title: 'The Valentine Mailbox',
  room: "Valentine's",
  kind: 'centrepiece',
  from: "Strands; Valentine's own letters for numbers (the round-one Mailbox's cipher)",
  rules: `${CONTROLS} (Twist: some letters are written as numbers, the same number always the same letter; find a word through one and it's revealed everywhere, and in the key.)`,
  panels: MAILBOX,
  mountPanel,
});
