import { describe, expect, it } from 'vitest';
import { type Panel, countSolutions, parse, problems } from '../../src/gen/carving';
import { FEAST, HOTDOG, STOCKING, WARMUP } from '../../src/proto/puzzles/thanksgiving';

const count = (p: Panel, limit = 2, rules = {}): number => countSolutions(parse(p), limit, rules);

describe('Thanksgiving carving run', () => {
  it('every panel has exactly one answer', () => {
    for (const p of [...WARMUP, ...HOTDOG, ...STOCKING, ...FEAST]) expect(count(p), p.name).toBe(1);
    for (const p of [...HOTDOG, ...STOCKING, ...FEAST]) expect(problems(p, 2), p.name).toEqual([]);
  }, 120_000);

  it('the fences matter', () => {
    for (const p of FEAST.filter((p) => p.walls?.length)) {
      const q = { ...p };
      delete q.walls;
      expect(count(q, 2), p.name).toBe(2);
    }
  });

  it('the colours matter', () => {
    for (const p of STOCKING) expect(count(p, 2, { noColours: true }), p.name).toBe(2);
  });

  it('shape matters: the 4s could each be a square, but only lines fit', () => {
    expect(
      parse(WARMUP[2] as Panel)
        .cells.flat()
        .filter((c) => c.n === 4),
    ).toHaveLength(2);
  });
});
