import { describe, expect, it } from 'vitest';
import { problems } from '../../src/gen/lights';
import {
  type Panel,
  countSolutions,
  light,
  parse,
  solved,
  startGrid,
  turn,
} from '../../src/proto/net';
import { EGG, PIE, TREE, WARMUP } from '../../src/proto/puzzles/christmas';

const count = (p: Panel, rules = {}): number => countSolutions(parse(p), 2, rules);

describe('Christmas lights run', () => {
  const all = [...WARMUP, ...EGG, ...PIE, ...TREE];

  it('every panel has exactly one answer, and the panel is that answer', () => {
    for (const p of all) {
      expect(count(p), p.name).toBe(1);
      const b = parse(p);
      expect(solved(b, b.solution), p.name).toBe(true);
    }
    for (const p of [...EGG, ...PIE, ...TREE]) expect(problems(p, 2), p.name).toEqual([]);
  }, 120_000);

  it('no panel starts solved', () => {
    for (const p of all) expect(solved(parse(p), startGrid(p)), p.name).toBe(false);
  });

  it('the eggs and the servings matter', () => {
    for (const p of EGG) expect(count(p, { noEggs: true }), p.name).toBe(2);
    for (const p of PIE) expect(count(p, { noServings: true }), p.name).toBe(2);
  });

  it('a wire pointing off the board is a loose end, and lights nothing off it', () => {
    // Turn every piece of a tree each way in turn: the power never reaches off the board.
    const p = TREE[2] as Panel;
    const b = parse(p);
    for (const [r, row] of b.solution.entries())
      for (const [c, m] of row.entries()) {
        if (m < 0) continue;
        const grid = b.solution.map((x) => [...x]);
        for (let t = 0; t < 4; t++) {
          (grid[r] as number[])[c] = turn((grid[r] as number[])[c] ?? 0);
          const { dist } = light(b, grid);
          for (const k of dist.keys()) {
            const [rr, cc] = k.split(',').map(Number) as [number, number];
            expect(b.inside(rr, cc), `lit off the board at ${k}`).toBe(true);
          }
        }
      }
  });
});
