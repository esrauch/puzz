import { describe, expect, it } from 'vitest';
import { bfs } from '../../src/proto/kit';
import {
  BOX_COLS,
  BOX_ROWS,
  COLOURS_TARGET,
  FLOATS,
  JUG_ACTIONS,
  PORCH,
  PRESENTS,
  type Jugs,
  jugAction,
  jump,
  paradeOk,
  porchStart,
  turnCells,
  BLUE,
  RED,
  dip,
  same,
} from '../../src/proto/puzzles/tuesday';

function permutations<T>(xs: readonly T[]): T[][] {
  if (xs.length <= 1) return [[...xs]];
  return xs.flatMap((x, i) =>
    permutations([...xs.slice(0, i), ...xs.slice(i + 1)]).map((p) => [x, ...p]),
  );
}

describe("Tuesday's holiday", () => {
  it('the colours can be dyed in three dips', () => {
    let g = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];
    g = dip(g, { line: 'row', index: 0, dye: RED });
    g = dip(g, { line: 'row', index: 2, dye: RED });
    g = dip(g, { line: 'col', index: 1, dye: BLUE });
    expect(same(g, COLOURS_TARGET)).toBe(true);
  });

  it('the parade has exactly one order', () => {
    expect(permutations(FLOATS).filter(paradeOk)).toHaveLength(1);
  });

  it('the porch can be cleared to one pumpkin', () => {
    const moves: [number, number][] = [];
    for (let a = 0; a < PORCH * PORCH; a++)
      for (let b = 0; b < PORCH * PORCH; b++) moves.push([a, b]);
    const solution = bfs(
      porchStart(),
      () => moves,
      (p, [a, b]) => jump(p, a, b),
      (p) => p.filter(Boolean).length === 1,
      (p) => p.map(Number).join(''),
    );
    expect(solution).not.toBeNull();
  });

  it('the gravy can be measured', () => {
    const solution = bfs<Jugs, string>(
      [0, 0],
      () => JUG_ACTIONS,
      jugAction,
      (j) => j[1] === 4,
      (j) => j.join(),
    );
    expect(solution?.length).toBe(6);
  });

  it('the presents can fill the box', () => {
    // Try every placement of all three presents.
    const placements = (i: number): [number, number][][] => {
      const out: [number, number][][] = [];
      for (let t = 0; t < 4; t++)
        for (let r = 0; r < BOX_ROWS; r++)
          for (let c = 0; c < BOX_COLS; c++) {
            const cells = turnCells(PRESENTS[i]?.cells ?? [], t).map(
              ([a, b]) => [r + a, c + b] as [number, number],
            );
            if (cells.every(([a, b]) => a < BOX_ROWS && b < BOX_COLS)) out.push(cells);
          }
      return out;
    };
    const fill = (i: number, used: Set<string>): boolean => {
      if (i === PRESENTS.length) return used.size === BOX_ROWS * BOX_COLS;
      return placements(i).some((cells) => {
        const keys = cells.map(([a, b]) => `${a},${b}`);
        if (keys.some((k) => used.has(k))) return false;
        return fill(i + 1, new Set([...used, ...keys]));
      });
    };
    expect(fill(0, new Set())).toBe(true);
  });
});
