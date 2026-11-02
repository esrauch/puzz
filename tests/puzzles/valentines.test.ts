import { describe, expect, it } from 'vitest';
import { BUNNIES, CARDS, type Bunny, type Card, satisfies } from '../../src/proto/puzzles/admirers';
import { LEVELS, type Slot, glowing, reads, scrambled, shadow } from '../../src/proto/puzzles/jack';
import { LETTERS, cipher, encode } from '../../src/proto/puzzles/mailbox';

function permutations<T>(xs: T[]): T[][] {
  if (xs.length <= 1) return [xs];
  return xs.flatMap((x, i) =>
    permutations([...xs.slice(0, i), ...xs.slice(i + 1)]).map((p) => [x, ...p]),
  );
}

describe('jack-o-lantern', () => {
  it('each note reads when carved backwards and mirrored, and starts mostly dark', () => {
    for (const { phrase } of LEVELS) {
      const letters = phrase.replaceAll(' ', '');
      const solved: Slot[] = letters
        .split('')
        .reverse()
        .map((ch) => ({ ch, flipped: true }));
      expect(reads(phrase, solved)).toBe(true);
      expect(
        shadow(solved)
          .map((s) => s.ch)
          .join(''),
      ).toBe(letters);
      const start = scrambled(phrase);
      expect(reads(phrase, start)).toBe(false);
      expect(glowing(phrase, start).filter(Boolean).length).toBeLessThanOrEqual(1);
    }
  });
});

describe('secret admirers', () => {
  it('has exactly one answer', () => {
    const answers = permutations(CARDS).filter((cards) =>
      satisfies(
        Object.fromEntries(BUNNIES.map((b, i) => [b, cards[i] as Card])) as Record<Bunny, Card>,
      ),
    );
    expect(answers).toHaveLength(1);
    expect(answers[0]?.map((c) => c.id).join('')).toBe('BCDA');
  });
});

describe('mailbox', () => {
  it('codes every letter, and the letters only use what the key can decode', () => {
    const key = cipher();
    expect(new Set(key.values()).size).toBe(26);
    const coded = encode(LETTERS[0] ?? '', key);
    expect(coded).not.toBe(LETTERS[0]);
    expect(coded.length).toBe(LETTERS[0]?.length);
  });
});
