import { describe, expect, it } from 'vitest';
import { problems } from '../../src/gen/pictures';
import { type Panel, clues, fillMessage, lineDone, logical } from '../../src/proto/picture';
import { BOW, BROOM, FINALE, SPARKLERS } from '../../src/proto/puzzles/fourth';

const all: Panel[] = [...SPARKLERS, ...BOW, ...BROOM, ...FINALE];

describe('Fourth of July fireworks run', () => {
  it('every picture can be solved by line logic alone (letters by trying values)', () => {
    for (const p of all) expect(logical(p), p.name).toBe(true);
    for (const p of [...BOW, ...BROOM, ...FINALE]) expect(problems(p, 2), p.name).toEqual([]);
  }, 120_000);

  it('dark clues: at most one per line, never a line’s only clue', () => {
    for (const p of BROOM) {
      expect(p.dark?.length ?? 0, p.name).toBeGreaterThan(0);
      const c = clues(p);
      const seen = new Set<string>();
      for (const [kind, line] of p.dark ?? []) {
        expect(seen.has(`${kind}${line}`), `${p.name} ${kind} ${line}`).toBe(false);
        seen.add(`${kind}${line}`);
        expect((kind === 'row' ? c.rows : c.cols)[line]?.length ?? 0).toBeGreaterThan(1);
      }
    }
  });

  it('each letter message spells a real phrase', () => {
    expect(BOW.map(fillMessage)).toEqual(['SHINE', 'BOOM', 'HEART']);
  });

  it('lineDone waits for dark (?) lines to have no empty squares left', () => {
    const plainRuns = [
      { n: 2, colour: 1 },
      { n: 1, colour: 1 },
    ];
    expect(lineDone(plainRuns, [1, 1, 0, 1, 0])).toBe(true);

    const darkRuns = [
      { n: 2, colour: 1 },
      { n: 3, colour: 1, hidden: true },
    ];
    // With open empty squares (0), a dark clue's run could still grow, so the line is not done yet.
    expect(lineDone(darkRuns, [1, 1, 0, 1, 0, 0])).toBe(false);
    // Once all non-filled squares are crossed out (-2), the dark line is done.
    expect(lineDone(darkRuns, [1, 1, -2, 1, 1, -2])).toBe(true);
  });
});
