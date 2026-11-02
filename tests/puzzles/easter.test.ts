import { describe, expect, it } from 'vitest';
import { bfs } from '../../src/proto/kit';
import {
  type Dip,
  BLUE,
  LEVELS,
  RED,
  YELLOW,
  blankLike,
  dip,
  same,
} from '../../src/proto/puzzles/flag';
import {
  LEFT,
  RIGHT,
  scrambledTree,
  solvedTree,
  sorted,
  spin,
} from '../../src/proto/puzzles/eggtree';
import {
  generateWeave,
  scramble,
  scrambledWeave,
  solvedWeave,
  turn,
  woven,
} from '../../src/proto/puzzles/weave';

const level = (i: number): (typeof LEVELS)[number] => LEVELS[i] as (typeof LEVELS)[number];

describe('egg-carton flag', () => {
  it('level 1 can be dyed in 5 dips, and no fewer', () => {
    const { target, dyes } = level(0);
    const moves: Dip[] = [];
    for (const line of ['row', 'col'] as const)
      for (let i = 0; i < (line === 'row' ? target.length : (target[0]?.length ?? 0)); i++)
        for (const dye of [...dyes, 0]) moves.push({ line, index: i, dye });
    const solution = bfs(
      blankLike(target),
      () => moves,
      dip,
      (g) => same(g, target),
      (g) => g.flat().join(''),
    );
    expect(solution).toHaveLength(5);
  });

  it('level 2 can be dyed in its par of 8, and every one of those dips matters', () => {
    const recipe: Dip[] = [
      { line: 'col', index: 3, dye: RED },
      { line: 'row', index: 2, dye: BLUE },
      { line: 'col', index: 0, dye: 0 },
      { line: 'row', index: 0, dye: YELLOW },
      { line: 'col', index: 4, dye: RED },
      { line: 'col', index: 0, dye: RED },
      { line: 'col', index: 1, dye: BLUE },
      { line: 'row', index: 4, dye: 0 },
    ];
    const { target, par } = level(1);
    const run = (steps: Dip[]): number[][] => steps.reduce(dip, blankLike(target));
    expect(same(run(recipe), target)).toBe(true);
    expect(recipe).toHaveLength(par);
    recipe.forEach((_, k) =>
      expect(same(run(recipe.filter((__, j) => j !== k)), target)).toBe(false),
    );
  });
});

describe('woven cornucopia', () => {
  it('level 1 is woven when solved, and not when scrambled', () => {
    expect(woven(solvedWeave())).toBe(true);
    expect(woven(scrambledWeave())).toBe(false);
  });

  it('notices a crossing that breaks the over-under', () => {
    const g = solvedWeave();
    const row = g[1];
    if (row) row[1] = turn(row[1] as never);
    expect(woven(g)).toBe(false);
  });

  it('generates real levels that are woven, with plenty of crossings, scrambled to start', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const g = generateWeave(seed);
      expect(woven(g)).toBe(true);
      expect(g.flat().filter((t) => t.kind === 'cross').length).toBeGreaterThanOrEqual(4);
    }
    expect(woven(scramble(generateWeave()))).toBe(false);
  });
});

describe('egg tree', () => {
  it('starts sorted when solved, scrambles, and turning back undoes a turn', () => {
    expect(sorted(solvedTree())).toBe(true);
    const s = scrambledTree();
    expect(sorted(s)).toBe(false);
    expect(spin(spin(s, LEFT, 1), LEFT, -1)).toEqual(s);
    expect(new Set([...LEFT, ...RIGHT]).size).toBe(22);
  });
});
