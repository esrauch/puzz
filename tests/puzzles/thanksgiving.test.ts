import { describe, expect, it } from 'vitest';
import { bfs } from '../../src/proto/kit';
import { SEATS, START, WISHES, pass } from '../../src/proto/puzzles/feast';
import { carving, fair, platter } from '../../src/proto/puzzles/platter';
import { LEVELS, type Suspect, suspects, weigh } from '../../src/proto/puzzles/stocking';

describe('hot dog platter', () => {
  it('the carving it was laid out from is fair', () => {
    expect(fair(platter(), carving())).toBe(true);
  });
});

describe('stuffed stocking', () => {
  const range = (a: number, b: number): number[] => Array.from({ length: b - a }, (_, k) => a + k);

  it('level 2: nine stockings in two weighings, thirds then thirds', () => {
    const level = LEVELS[1] as (typeof LEVELS)[number];
    let open: Suspect[] = suspects(level);
    open = weigh(open, range(0, 3), range(3, 6)).open;
    expect(open).toHaveLength(3);
    const group = open.map((s) => s.i);
    open = weigh(open, [group[0] as number], [group[1] as number]).open;
    expect(open).toHaveLength(1);
  });

  it('level 3: the first weighing of four against four leaves at most eight possibilities', () => {
    const level = LEVELS[2] as (typeof LEVELS)[number];
    const open = suspects(level);
    expect(open).toHaveLength(24);
    expect(weigh(open, range(0, 4), range(4, 8)).open.length).toBeLessThanOrEqual(8);
  });

  it('the scales tip whichever way keeps the most open (no lucky guesses)', () => {
    const open = suspects(LEVELS[1] as (typeof LEVELS)[number]);
    // One against one: most likely "level", which leaves seven.
    expect(weigh(open, [0], [1]).open).toHaveLength(7);
  });
});

describe('feast', () => {
  it('takes ten passes at best', () => {
    const moves = Array.from({ length: SEATS }, (_, i) => [
      [i, 1],
      [i, -1],
    ]).flat() as [number, 1 | -1][];
    const solution = bfs(
      START,
      () => moves,
      (t, [i, d]) => pass(t, i, d),
      (t) => t === WISHES,
      (t) => t,
    );
    expect(solution).toHaveLength(10);
  }, 60_000);
});
