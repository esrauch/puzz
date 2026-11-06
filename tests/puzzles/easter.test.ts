import { describe, expect, it } from 'vitest';
import { problems } from '../../src/gen/hops';
import { type Panel, countSolutions, key, parse, solve } from '../../src/proto/hops';
import { CORNUCOPIA, EGGTREE, FLAG, HUTCH } from '../../src/proto/puzzles/easter';

const count = (p: Panel, rules = {}): number => countSolutions(parse(p), 2, rules);

describe('Easter bunny-hop run', () => {
  const all = [...HUTCH, ...FLAG, ...CORNUCOPIA, ...EGGTREE];

  it('every panel has exactly one answer (free panels: at least one)', () => {
    for (const p of all) {
      if (p.free) expect(count(p), p.name).toBeGreaterThan(0);
      else expect(count(p), p.name).toBe(1);
    }
    for (const p of [...FLAG, ...CORNUCOPIA, ...EGGTREE])
      expect(problems(p, 2), p.name).toEqual([]);
  }, 120_000);

  it('no clue is pointless: taking away any egg or flag leaves more than one answer', () => {
    for (const p of all.filter((x) => !x.free)) {
      for (const g of p.given) {
        // The start egg and the Golden Egg are there by design, not as clues.
        if (g[2] === 1 || (p.golden && key([g[0], g[1]]) === key(p.golden))) continue;
        expect(
          count({ ...p, given: p.given.filter((x) => x !== g) }),
          `${p.name}: egg ${g.join(',')}`,
        ).toBe(2);
      }
      for (const k of ['rowFlags', 'colFlags'] as const)
        (p[k] ?? []).forEach((f, i) => {
          if (f === null) return;
          const flags = [...(p[k] ?? [])];
          flags[i] = null;
          expect(count({ ...p, [k]: flags }), `${p.name}: ${k} ${i}`).toBe(2);
        });
    }
  }, 120_000);

  it('the colours and the courses matter', () => {
    for (const p of FLAG) expect(count(p, { noColours: true }), p.name).toBe(2);
    for (const p of CORNUCOPIA) expect(count(p, { noPortions: true }), p.name).toBe(2);
  }, 120_000);

  it('every burrow is used, and the Golden Egg is the last hop', () => {
    for (const p of EGGTREE) {
      const b = parse(p);
      const route = solve(b, 1)[0] ?? [];
      for (const [a, z] of p.burrows ?? []) {
        const i = b.index.get(key(a)) as number;
        const j = b.index.get(key(z)) as number;
        const used = route.some(
          (x, n) => n > 0 && ((x === i && route[n - 1] === j) || (x === j && route[n - 1] === i)),
        );
        expect(used, `${p.name}: burrow ${key(a)}`).toBe(true);
      }
      if (p.golden) expect(route[route.length - 1], p.name).toBe(b.index.get(key(p.golden)));
    }
  }, 120_000);
});
