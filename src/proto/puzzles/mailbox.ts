/**
 * Valentine's · Centrepiece: the Valentine Mailbox. Love letters in a
 * sweetheart's code. Cupid's Bow and the Box of Chocolates (brought home)
 * each hold part of the key; work out the rest and decode them all.
 */
import { type Proto, h, rng } from '../kit';

export const LETTERS = [
  'DEAR BUNNY, YOU ARE SOME BUNNY TO LOVE.',
  'DEAR GRANDMA, THANKS FOR THE PIE. I LOVE YOU MORE THAN GRAVY.',
  'DEAR TUESDAY, EVEN PLAIN DAYS DESERVE A CARD. HAPPY VALENTINE.',
];
/** Plain letters whose code the returned items give away. */
export const GIVEN = { "Cupid's Bow": 'LOVE', 'Box of Chocolates': 'DEAR' } as const;

/** The secret alphabet: plain → code (a shuffle with no letter left as itself). */
export function cipher(seed = 14): Map<string, string> {
  const random = rng(seed);
  const abc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  for (;;) {
    const code = [...abc];
    for (let i = code.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [code[i], code[j]] = [code[j] as string, code[i] as string];
    }
    if (code.every((c, i) => c !== abc[i]))
      return new Map(abc.map((p, i) => [p, code[i] as string]));
  }
}

export function encode(text: string, key: Map<string, string>): string {
  return text.replace(/[A-Z]/g, (c) => key.get(c) ?? c);
}

export const mailbox: Proto = {
  id: 'mailbox',
  title: 'The Valentine Mailbox',
  room: "Valentine's",
  kind: 'centrepiece',
  from: "Clandestiny's Cryptic Identity and Dr. Brain's cryptograms; twist: the key comes from the items you brought home",
  rules:
    "Three love letters, every letter of the alphabet swapped for another (the same swap throughout). Cupid's Bow and the Box of Chocolates each give away part of the code. Type a plain letter under each code letter; the letters decode as you go.",
  mount(host, ctx) {
    const key = cipher();
    const coded = LETTERS.map((l) => encode(l, key));
    const used = [...new Set(coded.join('').replace(/[^A-Z]/g, ''))].sort();
    const plainOf = new Map([...key].map(([p, c]) => [c, p]));
    const guess = new Map<string, string>();
    const fixed = new Set<string>();
    for (const word of Object.values(GIVEN))
      for (const p of word) {
        const c = key.get(p) as string;
        guess.set(c, p);
        fixed.add(c);
      }
    const view = h('div', {
      style: {
        fontFamily: 'ui-monospace, monospace',
        fontSize: '16px',
        lineHeight: '1.9',
        margin: '8px 0 14px',
      },
    });
    const inputs = h('div', {
      style: { display: 'flex', flexWrap: 'wrap', gap: '6px', maxWidth: '780px' },
    });
    const render = (): void => {
      view.replaceChildren(
        ...coded.map((line) =>
          h(
            'div',
            { style: { marginBottom: '10px' } },
            h('div', { style: { color: '#9a3b52' } }, line),
            h(
              'div',
              {},
              line.replace(/[A-Z]/g, (c) => guess.get(c) ?? '·'),
            ),
          ),
        ),
      );
      const right = used.every((c) => guess.get(c) === plainOf.get(c));
      if (right) ctx.solved();
      else
        ctx.status(
          `${used.filter((c) => guess.get(c)).length} of ${used.length} code letters filled in`,
        );
    };
    for (const c of used) {
      const input = h('input', {
        maxlength: 1,
        value: guess.get(c) ?? '',
        disabled: fixed.has(c) ? 'disabled' : null,
        style: { width: '28px', textAlign: 'center', fontSize: '16px', textTransform: 'uppercase' },
        oninput: (e: Event) => {
          const v = (e.target as HTMLInputElement).value.toUpperCase().replace(/[^A-Z]/g, '');
          if (v) guess.set(c, v);
          else guess.delete(c);
          render();
        },
      });
      inputs.append(
        h(
          'label',
          {
            style: {
              display: 'grid',
              justifyItems: 'center',
              fontFamily: 'ui-monospace, monospace',
              color: '#9a3b52',
            },
          },
          c,
          input,
        ),
      );
    }
    host.append(
      h(
        'div',
        {},
        ...Object.entries(GIVEN).map(([item, word]) =>
          h('div', {}, h('b', {}, `${item}: `), `“${word}” is “${encode(word, key)}”`),
        ),
      ),
      view,
      inputs,
    );
    render();
  },
};
