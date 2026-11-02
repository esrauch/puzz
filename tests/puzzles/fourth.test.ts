import { describe, expect, it } from 'vitest';
import { bfs } from '../../src/proto/kit';
import { PICTURES, puzzle, satisfies } from '../../src/proto/puzzles/bow';
import { ARROWS, LAUNCH_BEATS, matches } from '../../src/proto/puzzles/finale';
import { FLOATS, type State, out, slide, start } from '../../src/proto/puzzles/parade';

function schedules(
  i: number,
  used: Set<number>,
  launch: (number | null)[],
  found: (number | null)[][],
): void {
  if (i === ARROWS.length) {
    if (matches(launch)) found.push([...launch]);
    return;
  }
  for (let b = 0; b < LAUNCH_BEATS; b++) {
    if (used.has(b)) continue;
    used.add(b);
    launch[i] = b;
    schedules(i + 1, used, launch, found);
    used.delete(b);
  }
  launch[i] = null;
}

describe('grand finale', () => {
  it('has exactly one schedule', () => {
    const found: (number | null)[][] = [];
    schedules(
      0,
      new Set(),
      ARROWS.map(() => null),
      found,
    );
    expect(found).toHaveLength(1);
  });
});

describe('witch parade', () => {
  it('can be cleared, in 27 moves at best', () => {
    const moves = FLOATS.flatMap((_, i) => [
      [i, -1],
      [i, 1],
    ]) as [number, -1 | 1][];
    const key = (s: State): string => `${s.band}|${s.at.map((p) => p.join(',')).join(';')}`;
    const solution = bfs(
      start(),
      () => moves,
      (s, [i, d]) => slide(s, i, d),
      out,
      key,
    );
    expect(solution).toHaveLength(27);
  }, 60_000);
});

describe("Cupid's firework bow", () => {
  it('accepts each picture and rejects a blank board', () => {
    for (const pic of PICTURES) {
      const p = puzzle(pic.rows);
      expect(
        satisfies(
          p,
          pic.rows.map((row) => [...row].map((ch) => ch === '#')),
        ),
      ).toBe(true);
      expect(
        satisfies(
          p,
          pic.rows.map((row) => [...row].map(() => false)),
        ),
      ).toBe(false);
    }
  });
});
