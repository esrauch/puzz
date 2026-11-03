import { describe, expect, it } from 'vitest';
import { type Panel, clues, fillMessage, logical } from '../../src/proto/picture';
import { BOW, BROOM, FINALE, SPARKLERS } from '../../src/proto/puzzles/fourth';

const all: Panel[] = [...SPARKLERS, ...BOW, ...BROOM, ...FINALE];

describe('Fourth of July fireworks run', () => {
  it('every picture can be solved by line logic alone (letters by trying values)', () => {
    for (const p of all) expect(logical(p), p.name).toBe(true);
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
    expect(BOW.map(fillMessage)).toEqual(['XOXO', 'HUGS', 'LOVE']);
  });
});
