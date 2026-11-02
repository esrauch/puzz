/**
 * Valentine's · The Valentine Jack-o'-Lantern (stray, from Halloween).
 * Carved letters in a pumpkin throw their shadows on the wall: in reverse
 * order, each letter mirrored. Swap and flip the carved letters until the
 * wall reads the love note. A letter glows on the wall once it's in the
 * right place and the right way round; three notes ramp up from one word.
 */
import { type Proto, h, rng } from '../kit';

export const LEVELS: { phrase: string; clue: string }[] = [
  { phrase: 'LOVE', clue: 'Four letters: the reason for the whole holiday.' },
  { phrase: 'BE MINE', clue: 'What every valentine is really asking.' },
  { phrase: 'SWEET ON YOU', clue: "Fond of someone, the way you're fond of candy." },
];
/** Letters that look the same mirrored (their flip doesn't matter). */
const SYMMETRIC = new Set('AHIMOTUVWXY');

export interface Slot {
  ch: string;
  /** Carved mirror-image (as seen from the front). */
  flipped: boolean;
}

/** What the wall shows: the carving reversed, each letter mirrored (so a flipped carving reads true). */
export function shadow(slots: readonly Slot[]): Slot[] {
  return [...slots].reverse().map((s) => ({ ch: s.ch, flipped: !s.flipped }));
}

/** Which letters on the wall are right: the right letter in the right place, the right way round. */
export function glowing(phrase: string, slots: readonly Slot[]): boolean[] {
  const want = phrase.replaceAll(' ', '');
  return shadow(slots).map((s, i) => s.ch === want[i] && (!s.flipped || SYMMETRIC.has(s.ch)));
}

export const reads = (phrase: string, slots: readonly Slot[]): boolean =>
  glowing(phrase, slots).every(Boolean);

export function scrambled(phrase: string, seed = 7): Slot[] {
  const random = rng(seed);
  for (;;) {
    const letters = phrase.replaceAll(' ', '').split('');
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [letters[i], letters[j]] = [letters[j] as string, letters[i] as string];
    }
    const slots = letters.map((ch) => ({ ch, flipped: random() < 0.5 }));
    // Start with at most one letter already glowing.
    if (glowing(phrase, slots).filter(Boolean).length <= 1) return slots;
  }
}

export const jack: Proto = {
  id: 'jack',
  title: "The Valentine Jack-o'-Lantern",
  room: "Valentine's",
  kind: 'stray',
  from: "7th Guest's cans and Threes and Fives (letters into a sentence); twist: read it in the shadow, mirrored",
  rules:
    "The top row is the pumpkin's carving, as you see it from the front. The candle throws it onto the wall (bottom row): in reverse order, each letter mirrored. Click two carved letters to swap them; select one and press Flip to carve it the other way round. A letter glows on the wall once it's in the right place and the right way round. Make the whole note glow.",
  mount(host, ctx) {
    let level = 0;
    let slots: Slot[] = [];
    let selected: number | null = null;
    let moves = 0;
    const tabs = h('div', { style: { display: 'flex', gap: '6px', marginBottom: '8px' } });
    const clue = h('div', {
      style: { fontStyle: 'italic', color: '#6b6676', marginBottom: '8px' },
    });
    const pumpkin = h('div', { style: { display: 'flex', gap: '4px', margin: '8px 0 18px' } });
    const wall = h('div', {
      style: {
        display: 'flex',
        gap: '4px',
        padding: '14px',
        background: '#2b2a33',
        borderRadius: '8px',
        width: 'fit-content',
      },
    });
    const glyph = (s: Slot, size: number, colour?: string): HTMLElement =>
      h(
        'span',
        {
          style: {
            display: 'inline-block',
            transform: s.flipped ? 'scaleX(-1)' : 'none',
            fontSize: `${size}px`,
            fontWeight: '800',
            fontFamily: 'Georgia, serif',
            color: colour ?? 'inherit',
            textShadow: colour === '#ffcf6b' ? '0 0 10px #ffb000' : 'none',
          },
        },
        s.ch,
      );
    const gapsAfter = (lengths: number[]): Set<number> => {
      const out = new Set<number>();
      let at = 0;
      for (const n of lengths.slice(0, -1)) out.add((at += n) - 1);
      return out;
    };
    const flip = h(
      'button',
      {
        onclick: () => {
          if (selected === null) return;
          const s = slots[selected];
          if (s) s.flipped = !s.flipped;
          moves++;
          render();
        },
      },
      'Flip',
    );
    const start = (n: number): void => {
      level = n;
      slots = scrambled((LEVELS[n] as { phrase: string }).phrase, 7 + n);
      selected = null;
      moves = 0;
      render();
    };
    const render = (): void => {
      const { phrase, clue: hint } = LEVELS[level] as { phrase: string; clue: string };
      const words = phrase.split(' ').map((w) => w.length);
      const pumpkinGaps = gapsAfter([...words].reverse());
      const wallGaps = gapsAfter(words);
      tabs.replaceChildren(
        ...LEVELS.map((l, i) =>
          h(
            'button',
            { class: level === i ? 'on' : '', onclick: () => start(i) },
            `Note ${i + 1} (${l.phrase.replaceAll(' ', '').length} letters)`,
          ),
        ),
      );
      clue.textContent = `Clue: ${hint}`;
      pumpkin.replaceChildren(
        ...slots.flatMap((s, i) => [
          h(
            'button',
            {
              class: selected === i ? 'on' : '',
              style: { width: '48px', height: '56px', background: selected === i ? '' : '#ffb35c' },
              onclick: () => {
                if (selected === null) selected = i;
                else if (selected === i) selected = null;
                else {
                  const a = slots[selected] as Slot;
                  slots[selected] = slots[i] as Slot;
                  slots[i] = a;
                  selected = null;
                  moves++;
                }
                render();
              },
            },
            glyph(s, 26),
          ),
          ...(pumpkinGaps.has(i) ? [h('span', { style: { width: '22px' } })] : []),
        ]),
      );
      const glow = glowing(phrase, slots);
      wall.replaceChildren(
        ...shadow(slots).flatMap((s, i) => [
          h(
            'span',
            { style: { width: '40px', textAlign: 'center' } },
            glyph(s, 30, glow[i] ? '#ffcf6b' : '#8a7f6a'),
          ),
          ...(wallGaps.has(i) ? [h('span', { style: { width: '22px' } })] : []),
        ]),
      );
      flip.toggleAttribute('disabled', selected === null);
      if (reads(phrase, slots)) {
        if (level === LEVELS.length - 1) ctx.solved();
        else ctx.status(`Note ${level + 1} reads! On to note ${level + 2}.`);
      } else
        ctx.status(
          `${glow.filter(Boolean).length} of ${glow.length} letters glowing · ${moves} moves`,
        );
    };
    host.append(
      tabs,
      clue,
      h('div', {}, 'The pumpkin (front):'),
      pumpkin,
      flip,
      h('div', { style: { marginTop: '18px' } }, 'The wall:'),
      wall,
    );
    start(0);
  },
};
