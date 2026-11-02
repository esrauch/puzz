/**
 * Valentine's · The Bunny's Secret Admirers (stray, from Easter).
 * Four unsigned valentines, four bunnies. Work out who sent which from
 * what's on the cards and what the bunnies let slip.
 */
import { type Proto, h } from '../kit';

export const BUNNIES = ['Clover', 'Pip', 'Juniper', 'Biscuit'] as const;
export type Bunny = (typeof BUNNIES)[number];

export interface Card {
  id: string;
  paper: string;
  stamp: string;
  smudge: string;
}

export const CARDS: Card[] = [
  { id: 'A', paper: 'pink', stamp: 'heart', smudge: 'chocolate thumbprint' },
  { id: 'B', paper: 'red', stamp: 'carrot', smudge: 'grass stain' },
  { id: 'C', paper: 'white', stamp: 'flower', smudge: 'paw print' },
  { id: 'D', paper: 'lilac', stamp: 'egg', smudge: 'none' },
];

/** Each clue as a bunny says it, and as a test of an assignment (bunny → card). */
export const CLUES: { says: Bunny; text: string; holds: (a: Record<Bunny, Card>) => boolean }[] = [
  {
    says: 'Pip',
    text: 'My card has a stamp of something that grows in the ground.',
    holds: (a) => ['carrot', 'flower'].includes(a.Pip.stamp),
  },
  {
    says: 'Juniper',
    text: "I'd never use pink or red paper. Far too obvious.",
    holds: (a) => !['pink', 'red'].includes(a.Juniper.paper),
  },
  {
    says: 'Biscuit',
    text: "I'll admit mine's a bit... smudged.",
    holds: (a) => a.Biscuit.smudge !== 'none',
  },
  {
    says: 'Clover',
    text: "Whoever left paw prints all over their card, it wasn't me.",
    holds: (a) => a.Clover.smudge !== 'paw print',
  },
  {
    says: 'Clover',
    text: "And mine's not the white one, or the lilac one.",
    holds: (a) => !['white', 'lilac'].includes(a.Clover.paper),
  },
  {
    says: 'Pip',
    text: 'I kept well away from the grass while I wrote it.',
    holds: (a) => a.Pip.smudge !== 'grass stain',
  },
  {
    says: 'Biscuit',
    text: "Carrots? Don't even talk to me about carrots.",
    holds: (a) => a.Biscuit.stamp !== 'carrot',
  },
];

export function satisfies(assignment: Record<Bunny, Card>): boolean {
  return CLUES.every((c) => c.holds(assignment));
}

export const admirers: Proto = {
  id: 'admirers',
  title: "The Bunny's Secret Admirers",
  room: "Valentine's",
  kind: 'stray',
  from: "Clandestiny's The Truth Is Out There and Layton's logic grids; twist: the clues are on the cards themselves",
  rules:
    'Four unsigned valentines are in the basket, from four bunnies. Each card shows its paper, its stamp and any smudge on it. Read what the bunnies say, then pick who sent each card.',
  mount(host, ctx) {
    const picks: Record<string, Bunny | ''> = { A: '', B: '', C: '', D: '' };
    const cards = h('div', {
      style: { display: 'flex', gap: '12px', flexWrap: 'wrap', margin: '6px 0 14px' },
    });
    const clues = h(
      'ol',
      {},
      ...CLUES.map((c) => h('li', {}, h('b', {}, `${c.says}: `), `“${c.text}”`)),
    );
    const render = (): void => {
      cards.replaceChildren(
        ...CARDS.map((card) => {
          const select = h(
            'select',
            {
              onchange: (e: Event) => {
                picks[card.id] = (e.target as HTMLSelectElement).value as Bunny | '';
                check();
              },
            },
            h('option', { value: '' }, 'Who sent it?'),
            ...BUNNIES.map((b) =>
              h('option', { value: b, selected: picks[card.id] === b ? 'selected' : null }, b),
            ),
          );
          return h(
            'div',
            {
              style: {
                width: '170px',
                padding: '10px',
                border: '1px solid #d9d3c7',
                borderRadius: '8px',
                background: '#fff',
              },
            },
            h('div', { style: { fontWeight: '700' } }, `Card ${card.id}`),
            h('div', {}, `${card.paper} paper`),
            h('div', {}, `${card.stamp} stamp`),
            h('div', {}, card.smudge === 'none' ? 'spotless' : card.smudge),
            h('div', { style: { marginTop: '6px' } }, select),
          );
        }),
      );
    };
    const check = (): void => {
      const chosen = Object.values(picks);
      if (chosen.some((p) => !p)) return ctx.status('');
      if (new Set(chosen).size < chosen.length) return ctx.status('Each bunny sent just one card.');
      const assignment = Object.fromEntries(
        Object.entries(picks).map(([id, b]) => [b, CARDS.find((c) => c.id === id) as Card]),
      ) as Record<Bunny, Card>;
      if (satisfies(assignment)) ctx.solved();
      else ctx.status("That doesn't square with what everyone said.");
    };
    host.append(cards, h('div', { style: { fontWeight: '700' } }, 'What the bunnies say'), clues);
    render();
  },
};
