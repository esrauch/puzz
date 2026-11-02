import { describe, expect, it } from 'vitest';
import { CLIPS, NEEDED, ROWS, type Spot, clash, hung } from '../../src/proto/puzzles/ornaments';
import { LEVELS, TIN, fits } from '../../src/proto/puzzles/pietin';
import {
  LEVELS as TREES,
  allLit,
  lit,
  scrambledLights,
  solvedLights,
} from '../../src/proto/puzzles/tree';

function permutations<T>(xs: T[]): T[][] {
  if (xs.length <= 1) return [xs];
  return xs.flatMap((x, i) =>
    permutations([...xs.slice(0, i), ...xs.slice(i + 1)]).map((p) => [x, ...p]),
  );
}

describe('golden egg ornament', () => {
  it('has exactly one way to hang them', () => {
    const spots: Spot[] = [];
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c <= r; c++) if (!CLIPS.has(`${r},${c}`)) spots.push([r, c]);
    let found = 0;
    const pick = (from: number, chosen: Spot[]): void => {
      if (chosen.length === NEEDED) {
        if (hung(chosen)) found++;
        return;
      }
      for (let i = from; i < spots.length; i++) {
        const s = spots[i] as Spot;
        if (chosen.every((x) => !clash(x, s))) pick(i + 1, [...chosen, s]);
      }
    };
    pick(0, []);
    expect(found).toBe(1);
  });
});

describe('pie in a tin', () => {
  it('each level makes exactly one pie (identical slices, turns and mirror images counted once)', () => {
    for (const { slices, useAll } of LEVELS) {
      const pies = new Set<string>();
      const choose = (from: number, chosen: number[], width: number): void => {
        if (width === TIN) {
          if (useAll && chosen.length !== slices.length) return;
          const [first, ...rest] = chosen;
          for (const p of permutations(rest)) {
            const order = [first as number, ...p];
            if (!fits(slices, order, useAll)) continue;
            const names = order.map((i) => `${slices[i]?.width}${slices[i]?.flavour}`);
            const turns = names.map((_, k) => [...names.slice(k), ...names.slice(0, k)].join(' '));
            const all = [...turns, ...turns.map((t) => t.split(' ').reverse().join(' '))];
            pies.add(all.sort()[0] as string);
          }
          return;
        }
        for (let i = from; i < slices.length; i++) {
          const w = slices[i]?.width ?? 0;
          if (width + w <= TIN) choose(i + 1, [...chosen, i], width + w);
        }
      };
      choose(0, [], 0);
      expect(pies.size).toBe(1);
    }
  });
});

describe('christmas tree', () => {
  it('each level lights fully when solved, and not when scrambled; the big tree branches a lot', () => {
    TREES.forEach(({ shape, wiring, seed }, i) => {
      const solved = solvedLights(shape, wiring, seed);
      expect(allLit(shape, solved)).toBe(true);
      expect(allLit(shape, scrambledLights(i))).toBe(false);
      expect(lit(shape, solved).size).toBeGreaterThan(20);
    });
    const big = TREES[1] as (typeof TREES)[number];
    const junctions = solvedLights(big.shape, big.wiring, big.seed)
      .flat()
      .filter((e) => [1, 2, 4, 8].filter((d) => e & d).length >= 3).length;
    expect(junctions).toBeGreaterThanOrEqual(15);
  });
});
