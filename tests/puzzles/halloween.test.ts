import { describe, expect, it } from 'vitest';
import { bfs } from '../../src/proto/kit';
import { LEVELS, countSolutions, parse } from '../../src/proto/puzzles/web';
import { PIECES, SOLUTION, TARGET, matchesStar, wall } from '../../src/proto/puzzles/shadows';
import { KIDS, type Haul, offer, startHaul } from '../../src/proto/puzzles/trade';

describe('trick or trade', () => {
  it('takes five trades to reach the chocolates', () => {
    const solution = bfs(
      startHaul(),
      () => KIDS.map((_, i) => i),
      offer,
      (s: Haul) => s.you === 'chocolates',
      (s: Haul) => `${s.you}|${s.kids.join(',')}`,
    );
    expect(solution).toHaveLength(5);
  });
});

describe('star in the shadows', () => {
  it('the solution makes the star, with the decoy hidden inside it', () => {
    expect(matchesStar(SOLUTION)).toBe(true);
    const withoutDecoy = wall(SOLUTION.slice(0, PIECES.length - 1));
    expect(withoutDecoy.size).toBe(TARGET.size);
  });
});

describe("spider's web", () => {
  it('every web has exactly one way to spin it', () => {
    for (const level of LEVELS) expect(countSolutions(parse(level.rows)), level.name).toBe(1);
  }, 60_000);
});
