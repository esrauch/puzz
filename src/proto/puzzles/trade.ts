/**
 * Halloween · Trick or Trade (stray, from Valentine's). The Box of
 * Chocolates is in someone's haul. Each kid will swap their candy for yours
 * only if they like yours better, and their costume says what they like.
 * Start with a lone candy corn and trade your way to the chocolates.
 */
import { type Proto, h } from '../kit';

export const CANDY: Record<string, string[]> = {
  'candy corn': ['orange', 'white', 'yellow'],
  lollipop: ['red', 'wrapped'],
  'gummy worms': ['green', 'squishy'],
  licorice: ['black', 'squishy'],
  peppermint: ['white', 'red', 'wrapped'],
  caramel: ['brown', 'wrapped'],
  chocolates: ['red', 'brown', 'boxed'],
};

/** Each kid: what they like most, then next (anything else is nothing to them), and what's in their bag. */
export const KIDS: { costume: string; likes: string[]; holds: string }[] = [
  { costume: 'Vampire', likes: ['brown', 'red'], holds: 'gummy worms' },
  { costume: 'Ghost', likes: ['white', 'boxed', 'wrapped'], holds: 'lollipop' },
  { costume: 'Witch', likes: ['green'], holds: 'caramel' },
  { costume: 'Mummy', likes: ['boxed', 'wrapped'], holds: 'peppermint' },
  { costume: 'Scarecrow', likes: ['brown'], holds: 'licorice' },
  { costume: 'Skeleton', likes: ['black', 'boxed', 'white'], holds: 'chocolates' },
];

/** How much a kid likes a candy: their favourite thing scores highest. */
export function liking(likes: string[], candy: string): number {
  const traits = CANDY[candy] ?? [];
  const i = likes.findIndex((l) => traits.includes(l));
  return i < 0 ? 0 : likes.length - i;
}

export interface Haul {
  you: string;
  kids: string[];
}

export const startHaul = (): Haul => ({ you: 'candy corn', kids: KIDS.map((k) => k.holds) });

/** Offer your candy to kid `i`: they swap if they like yours better. */
export function offer(s: Haul, i: number): Haul | null {
  const kid = KIDS[i];
  const theirs = s.kids[i];
  if (!kid || !theirs || liking(kid.likes, s.you) <= liking(kid.likes, theirs)) return null;
  return { you: theirs, kids: s.kids.map((c, k) => (k === i ? s.you : c)) };
}

export const trade: Proto = {
  id: 'trade',
  title: 'Trick or Trade',
  room: 'Halloween',
  kind: 'stray',
  from: "Clandestiny's Trade Winds; twist: the costumes are the rules",
  rules:
    "You hold one candy. Offer it to a kid: they'll swap only if they like yours better than theirs. Each kid's costume tells you what they like, best first; candy with none of those things is nothing to them. Trade your way to the Box of Chocolates.",
  mount(host, ctx) {
    let s = startHaul();
    let trades = 0;
    const view = h('div', {});
    const render = (): void => {
      view.replaceChildren(
        h(
          'div',
          { style: { fontSize: '18px', margin: '4px 0 12px' } },
          'You hold: ',
          h('b', {}, s.you),
          h('span', { style: { color: '#6b6676' } }, ` (${(CANDY[s.you] ?? []).join(', ')})`),
        ),
        h(
          'div',
          { style: { display: 'flex', gap: '10px', flexWrap: 'wrap' } },
          ...KIDS.map((k, i) =>
            h(
              'div',
              {
                style: {
                  width: '190px',
                  padding: '10px',
                  background: '#fff',
                  border: '1px solid #d9d3c7',
                  borderRadius: '8px',
                },
              },
              h('div', { style: { fontWeight: '700' } }, k.costume),
              h(
                'div',
                { style: { fontSize: '13px', color: '#6b6676' } },
                `Likes: ${k.likes.join(', then ')}`,
              ),
              h(
                'div',
                { style: { margin: '6px 0' } },
                'Has: ',
                h('b', {}, s.kids[i] ?? ''),
                h(
                  'div',
                  { style: { fontSize: '12px', color: '#6b6676' } },
                  (CANDY[s.kids[i] ?? ''] ?? []).join(', '),
                ),
              ),
              h(
                'button',
                {
                  onclick: () => {
                    const next = offer(s, i);
                    if (!next)
                      return ctx.status(
                        `The ${k.costume.toLowerCase()} doesn't want your ${s.you}.`,
                      );
                    s = next;
                    trades++;
                    render();
                  },
                },
                `Offer your ${s.you}`,
              ),
            ),
          ),
        ),
      );
      if (s.you === 'chocolates') ctx.solved();
      else ctx.status(`${trades} trades`);
    };
    host.append(view);
    render();
  },
};
