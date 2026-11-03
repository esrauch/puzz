/**
 * Picture grids (nonograms) and the Fourth of July's twists on them. The
 * numbers at the end of each row and column give the runs of filled squares
 * in that line, in order; fill the grid to match and a picture appears.
 *
 * Twists, each optional on a panel:
 * - colour (the Fourth of July's own, at home): runs come in colours; two
 *   runs of the same colour need a gap between them, different colours can
 *   touch;
 * - the dark (Halloween): some clues are hidden (any length);
 * - letters for numbers (Valentine's): some clue numbers are written as
 *   letters, the same letter always the same number, and a message's
 *   numbered blanks fill in from them.
 *
 * Every panel must be solvable line by line (no guessing): the solver here
 * only ever fills a square that every arrangement of its line agrees on.
 * Letter clues count as unknown lengths for that check, so a letter panel
 * can be solved even without working the letters out.
 */

export interface Panel {
  name: string;
  /** The picture, row by row: '.' empty, '#' filled, or a colour letter from the palette. */
  rows: string[];
  /** Colour letters, in order (default '#': one colour). */
  palette?: string;
  /** Hidden clues: [row or column, line, which clue in the line]. */
  dark?: ['row' | 'col', number, number][];
  /** Letters for numbers: the letter for 1 first, and so on ('' to leave a number alone). */
  letters?: string;
  /** A message with numbered blanks (blank n is the letter for n). */
  message?: string;
  /** Numbered eggs: [row, column, n]: that square is filled, the nth filled square of its row counting from the left. */
  eggs?: [number, number, number][];
  /** Fair shares: portions, a letter per square; each holds the same number of filled squares. */
  portions?: string[];
}

export interface Run {
  n: number;
  colour: number;
  /** Shown as unknown (dark, or a letter). */
  hidden?: boolean;
  /** Shown as this letter. */
  letter?: string;
}

/** A cell: -1 unknown, 0 empty, 1.. a colour. */
export type Cell = number;

export function picture(p: Panel): number[][] {
  const palette = p.palette ?? '#';
  return p.rows.map((row) => [...row].map((ch) => (ch === '.' ? 0 : palette.indexOf(ch) + 1)));
}

/** A line's runs. */
export function runsOf(line: number[]): Run[] {
  const out: Run[] = [];
  line.forEach((v, i) => {
    if (!v) return;
    if (i > 0 && line[i - 1] === v) (out[out.length - 1] as Run).n++;
    else out.push({ n: 1, colour: v });
  });
  return out;
}

export interface Clues {
  rows: Run[][];
  cols: Run[][];
}

export function clues(p: Panel): Clues {
  const g = picture(p);
  const W = g[0]?.length ?? 0;
  const rows = g.map(runsOf);
  const cols = Array.from({ length: W }, (_, c) => runsOf(g.map((row) => row[c] ?? 0)));
  for (const [kind, line, k] of p.dark ?? []) {
    const run = (kind === 'row' ? rows : cols)[line]?.[k];
    if (run) run.hidden = true;
  }
  if (p.letters)
    for (const line of [...rows, ...cols])
      for (const run of line) {
        const letter = p.letters[run.n - 1];
        if (letter && letter !== ' ') {
          run.letter = letter;
          run.hidden = true;
        }
      }
  return { rows, cols };
}

/** Every arrangement of a line's runs that fits what's known (each a full line). */
function arrangements(runs: Run[], known: Cell[], cap = 20000): number[][] | null {
  const L = known.length;
  const out: number[][] = [];
  const line = new Array<number>(L).fill(0);
  let overflow = false;
  const fits = (from: number, to: number, v: number): boolean => {
    for (let i = from; i < to; i++) {
      const k = known[i] ?? -1;
      if (k !== -1 && k !== v) return false;
    }
    return true;
  };
  const go = (r: number, at: number): void => {
    if (overflow) return;
    if (r === runs.length) {
      if (!fits(at, L, 0)) return;
      for (let i = at; i < L; i++) line[i] = 0;
      out.push([...line]);
      if (out.length > cap) overflow = true;
      return;
    }
    const run = runs[r] as Run;
    const next = runs[r + 1];
    // A run of the same colour next needs a gap; a different colour can touch.
    const gap = next !== undefined && next.colour === run.colour ? 1 : 0;
    for (let start = at; start < L; start++) {
      if (!fits(at, start, 0)) break; // squares skipped before the run are empty
      const lengths = run.hidden ? Array.from({ length: L - start }, (_, i) => i + 1) : [run.n];
      for (const n of lengths) {
        const end = start + n;
        if (end > L) break;
        if (!fits(start, end, run.colour)) continue;
        if (end < L && (known[end] ?? -1) === run.colour) continue; // it would run on
        if (gap && (end >= L || !fits(end, end + 1, 0))) continue;
        for (let i = at; i < start; i++) line[i] = 0;
        for (let i = start; i < end; i++) line[i] = run.colour;
        if (gap) line[end] = 0;
        go(r + 1, end + gap);
      }
    }
  };
  go(0, 0);
  return overflow ? null : out;
}

/**
 * Solve line by line: repeatedly fill any square every arrangement of its row
 * or column agrees on. Returns the grid (with -1 where logic stopped), or null
 * if a line can have no arrangement at all.
 */
export function solveLines(c: Clues): number[][] | null {
  const H = c.rows.length;
  const W = c.cols.length;
  const grid: number[][] = Array.from({ length: H }, () => new Array<number>(W).fill(-1));
  for (let changed = true; changed;) {
    changed = false;
    for (const [kind, lines] of [
      ['row', c.rows],
      ['col', c.cols],
    ] as const)
      for (const [i, runs] of lines.entries()) {
        const known = kind === 'row' ? (grid[i] as number[]) : grid.map((row) => row[i] ?? -1);
        if (!known.includes(-1)) {
          if (!arrangements(runs, known)?.length) return null;
          continue;
        }
        const all = arrangements(runs, known);
        if (all === null) continue; // too many to list yet: come back when more is known
        if (!all.length) return null;
        known.forEach((v, j) => {
          if (v !== -1) return;
          const first = (all[0] as number[])[j] as number;
          if (all.every((a) => a[j] === first)) {
            if (kind === 'row') (grid[i] as number[])[j] = first;
            else (grid[j] as number[])[i] = first;
            changed = true;
          }
        });
      }
  }
  return grid;
}

/** The clues as the solver sees them with the letters' values known (dark clues stay hidden). */
function withLetters(c: Clues, value: (letter: string) => number): Clues {
  const set = (runs: Run[]): Run[] =>
    runs.map((r) => (r.letter ? { n: value(r.letter), colour: r.colour } : r));
  return { rows: c.rows.map(set), cols: c.cols.map(set) };
}

const sameGrid = (g: number[][] | null, want: number[][]): boolean =>
  !!g && g.every((row, r) => row.every((v, c) => v === want[r]?.[c]));

/**
 * Can the panel be solved by logic alone, to exactly its picture? With letters,
 * as a player would: the true letter values solve it line by line, and every
 * other way of giving the letters values leads to a contradiction that line
 * logic finds (so the letters can be worked out by trying).
 */
export function logical(p: Panel): boolean {
  const c = clues(p);
  const want = picture(p);
  if (!p.letters) return sameGrid(solveLines(c), want);
  const letters = [...new Set([...p.letters].filter((ch) => ch !== ' '))];
  const truth = (letter: string): number => p.letters?.indexOf(letter) ?? -1;
  if (!sameGrid(solveLines(withLetters(c, (l) => truth(l) + 1)), want)) return false;
  const maxLen = Math.max(c.rows.length, c.cols.length);
  const values = new Map<string, number>();
  const used = new Set<number>();
  const others = (k: number): boolean => {
    if (k === letters.length) {
      const isTruth = letters.every((l) => values.get(l) === truth(l) + 1);
      return isTruth || solveLines(withLetters(c, (l) => values.get(l) ?? 0)) === null;
    }
    const l = letters[k] as string;
    for (let v = 1; v <= maxLen; v++) {
      if (used.has(v)) continue;
      values.set(l, v);
      used.add(v);
      const ok = others(k + 1);
      used.delete(v);
      if (!ok) return false;
    }
    return true;
  };
  return others(0);
}

/** Logic's best grid for a panel (letters at their true values), for the search. */
export function logicSolve(p: Panel): number[][] | null {
  const c = clues(p);
  return solveLines(p.letters ? withLetters(c, (l) => (p.letters?.indexOf(l) ?? -1) + 1) : c);
}

/** Does a grid (0 empty / crossed, colours) match every line's clues? */
export function matches(p: Panel, grid: number[][]): boolean {
  const want = picture(p);
  return grid.every((row, r) => row.every((v, c) => Math.max(v, 0) === want[r]?.[c]));
}

/** Does a line (as filled so far) satisfy its clues exactly (hidden lengths: any)? */
export function lineDone(runs: Run[], line: number[]): boolean {
  const have = runsOf(line.map((v) => Math.max(v, 0)));
  return (
    have.length === runs.length &&
    have.every((h, i) => h.colour === runs[i]?.colour && (runs[i]?.hidden || h.n === runs[i]?.n))
  );
}

/** The message, its blanks filled from the letters. */
export function fillMessage(p: Panel): string {
  return (p.message ?? '').replace(/[0-9]/g, (d) => p.letters?.[Number(d) - 1] ?? '_');
}

/** Do the eggs hold for a grid (each egg's square filled, and the nth filled square of its row, counting from the left)? */
export function eggsHold(p: Panel, grid: number[][]): boolean {
  return (p.eggs ?? []).every(([r, c, n]) => {
    const row = grid[r] ?? [];
    if (!(row[c] ?? 0)) return false;
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

export interface Twists {
  noEggs?: boolean;
  noPortions?: boolean;
  /** Give up (OverBudget) after this many steps. */
  budget?: number;
}

/** Thrown when a count runs past its step budget (searches treat it as "too many"). */
export class OverBudget extends Error {}

/**
 * Count the pictures (up to `limit`) that match every clue, eggs and fair
 * shares included, by search: row by row, each row an arrangement of its runs
 * that keeps every column still possible.
 */
export const countPictures = (p: Panel, limit = 2, twists: Twists = {}): number =>
  pictures(p, limit, twists).length;

/** Up to `limit` pictures that fit the clues (and the twists not switched off). */
export function pictures(p: Panel, limit = 2, twists: Twists = {}): number[][][] {
  const c = clues(p);
  const H = c.rows.length;
  const W = c.cols.length;
  const grid: number[][] = Array.from({ length: H }, () => new Array<number>(W).fill(-1));
  // Line logic first: every square it settles narrows each row's arrangements before the search.
  const known = solveLines(c);
  if (!known) return [];
  let steps = 0;
  const budget = twists.budget ?? Infinity;
  const rowsOptions = c.rows.map((runs, r) => {
    const all = arrangements(runs, known[r] ?? new Array<number>(W).fill(-1), 200000) ?? [];
    return twists.noEggs
      ? all
      : all.filter((line) =>
          eggsHold(
            {
              ...p,
              eggs: (p.eggs ?? []).filter(([er]) => er === r).map(([, ec, n]) => [0, ec, n]),
            },
            [line],
          ),
        );
  });
  const portions = !twists.noPortions && p.portions;
  let target = -1;
  if (portions) {
    const counts = portionCounts(p, picture(p));
    target = [...counts.values()][0] ?? 0;
  }
  const found: number[][][] = [];
  const go = (r: number): void => {
    if (found.length >= limit) return;
    if (r === H) {
      if (!portions || [...portionCounts(p, grid).values()].every((v) => v === target))
        found.push(grid.map((row) => [...row]));
      return;
    }
    for (const line of rowsOptions[r] ?? []) {
      if (++steps > budget) throw new OverBudget();
      grid[r] = line;
      // Every column must still be possible with the rows so far.
      const ok = c.cols.every((runs, col) => {
        const known = grid.map((row, rr) => (rr <= r ? (row[col] ?? 0) : -1));
        const a = arrangements(runs, known, 1);
        return a === null || a.length > 0;
      });
      if (ok && portions) {
        const counts = portionCounts(
          p,
          grid.map((row, rr) => (rr <= r ? row : row.map(() => 0))),
        );
        if ([...counts.values()].some((v) => v > target)) continue;
      }
      if (ok) go(r + 1);
    }
    grid[r] = new Array<number>(W).fill(-1);
  };
  go(0);
  return found;
}
