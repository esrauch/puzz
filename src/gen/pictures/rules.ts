/**
 * Picture-grid rules: checking lines, whole grids, numbered eggs, fair-share
 * portions, and snowflake mirror frames.
 */
import { type Frame, mirrorSquare } from '../core/mirror';
import { type Panel, type Run, picture, runsOf } from './model';

/** Does a grid (0 empty / crossed, 1.. colours) match the panel's picture? */
export function matches(p: Panel, grid: number[][]): boolean {
  const want = picture(p);
  return grid.every((row, r) => row.every((v, c) => Math.max(v, 0) === want[r]?.[c]));
}

/**
 * Does a line (as filled so far) satisfy its clues? When a line has a hidden
 * clue ('?' or a letter), its length is unknown from the clue alone, so the
 * line only counts as done once every non-filled square in the line is crossed
 * out (no empty 0 squares remain).
 */
export function lineDone(runs: Run[], line: number[]): boolean {
  const have = runsOf(line.map((v) => Math.max(v, 0)));
  if (
    have.length !== runs.length ||
    !have.every((h, i) => h.colour === runs[i]?.colour && (runs[i]?.hidden || h.n === runs[i]?.n))
  ) {
    return false;
  }
  if (runs.some((r) => r.hidden)) {
    return line.every((v) => v !== 0);
  }
  return true;
}

/** Do the eggs hold for a grid (each egg's square filled, and the nth filled square of its row, counting from the left)? */
export function eggsHold(p: Panel, grid: number[][]): boolean {
  return (p.eggs ?? []).every(([r, c, n]) => {
    const row = grid[r] ?? [];
    if ((row[c] ?? 0) <= 0) return false;
    return row.slice(0, c + 1).filter((v) => v > 0).length === n;
  });
}

/** Filled squares in each portion. */
export function portionCounts(p: Panel, grid: number[][]): Map<string, number> {
  const counts = new Map<string, number>();
  grid.forEach((row, r) =>
    row.forEach((v, c) => {
      const k = p.portions?.[r]?.[c];
      if (k === undefined) return;
      counts.set(k, (counts.get(k) ?? 0) + (v > 0 ? 1 : 0));
    }),
  );
  return counts;
}

/**
 * Inside the snowflake frame, do the filled squares mirror across the frame's
 * axis? (Works in one colour or with red/blue paints: a square inside the
 * frame has the same paint as its mirror square.)
 */
export function frameSymmetric(f: Frame, grid: number[][]): boolean {
  for (let r = f.top; r <= f.bottom; r++) {
    for (let c = f.left; c <= f.right; c++) {
      const [mr, mc] = mirrorSquare(f, r, c);
      const a = Math.max(grid[r]?.[c] ?? 0, 0);
      const b = Math.max(grid[mr]?.[mc] ?? 0, 0);
      if (a !== b) return false;
    }
  }
  return true;
}
