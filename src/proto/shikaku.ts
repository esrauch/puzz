/**
 * Shikaku (Nikoli; Tatham's Rectangles) and Thanksgiving's twists on it:
 * the rules, a solver that counts a panel's answers (for the tests and the
 * level search), and a generator of random carvings (for the search).
 *
 * The base rules: divide the grid into rectangles (portions); each holds
 * exactly one number, and the number is its size. The twists, each
 * optional on a panel:
 * - flag skewers (the Fourth of July's clues from the edge): a number at the
 *   end of a row or column tops a skewer through that line, and says how
 *   many pieces (portions) it goes through;
 * - red and green (Christmas): a portion takes the colour of its marks, and
 *   two portions of the same colour may not share an edge (plain ones can
 *   touch anything);
 * - fair shares (Thanksgiving's own): dishes on the board, and every
 *   portion gets exactly one of each.
 * With flags or dishes, a portion may hold no number at all.
 */
import { rng } from './kit';

export interface Panel {
  name: string;
  /** Rows of space-separated tokens: '.' empty, a number (its portion's size), or a dish (T turkey, P pie, C cranberries). */
  rows: string[];
  /** Colour marks, row by row: 'r' red, 'g' green, '.' none. */
  colours?: string[];
  /** Flags on skewers: how many portions (pieces) each row's skewer goes through (null: no flag). */
  rowMarks?: (number | null)[];
  /** Flags for the columns. */
  colMarks?: (number | null)[];
  /** What each portion's fair share is, as dish letters (default: one of each dish on the board). */
  share?: string;
}

export interface Cell {
  n?: number;
  dish?: string;
  colour?: 'r' | 'g';
}

export interface Board {
  height: number;
  width: number;
  cells: Cell[][];
  /** Each portion's fair share of dishes, sorted (empty: no dishes). */
  dishes: string[];
  /** Portions may hold no number (when there are flags or dishes). */
  numberless: boolean;
  rowMarks: (number | null)[];
  colMarks: (number | null)[];
}

export interface Rect {
  r: number;
  c: number;
  h: number;
  w: number;
}

export type Problem = 'two numbers' | 'no number' | 'wrong size' | 'dishes' | 'two colours';

export function parse(panel: Panel): Board {
  const cells = panel.rows.map((row, r) =>
    row
      .trim()
      .split(/\s+/)
      .map((t, c): Cell => {
        const cell: Cell = {};
        if (/^[0-9]+$/.test(t)) cell.n = Number(t);
        else if (t !== '.') cell.dish = t;
        const colour = panel.colours?.[r]?.[c];
        if (colour === 'r' || colour === 'g') cell.colour = colour;
        return cell;
      }),
  );
  const height = cells.length;
  const width = cells[0]?.length ?? 0;
  const dishes = panel.share
    ? [...panel.share].sort()
    : [...new Set(cells.flat().flatMap((x) => (x.dish ? [x.dish] : [])))].sort();
  const rowMarks = panel.rowMarks ?? Array<null>(height).fill(null);
  const colMarks = panel.colMarks ?? Array<null>(width).fill(null);
  const marked = [...rowMarks, ...colMarks].some((m) => m !== null);
  return {
    height,
    width,
    cells,
    dishes,
    numberless: dishes.length > 0 || marked,
    rowMarks,
    colMarks,
  };
}

const cellsOf = (b: Board, x: Rect): Cell[] => {
  const out: Cell[] = [];
  for (let r = x.r; r < x.r + x.h; r++)
    for (let c = x.c; c < x.c + x.w; c++) out.push(b.cells[r]?.[c] ?? {});
  return out;
};

/** What's wrong with a portion on its own (null if nothing). */
export function problem(b: Board, x: Rect): Problem | null {
  const inside = cellsOf(b, x);
  const numbers = inside.flatMap((cell) => (cell.n === undefined ? [] : [cell.n]));
  if (numbers.length > 1) return 'two numbers';
  if (numbers.length === 0 && !b.numberless) return 'no number';
  if (numbers.length === 1 && numbers[0] !== x.h * x.w) return 'wrong size';
  if (b.dishes.length) {
    const here = inside.flatMap((cell) => (cell.dish ? [cell.dish] : [])).sort();
    if (here.join() !== b.dishes.join()) return 'dishes';
  }
  if (new Set(inside.flatMap((cell) => (cell.colour ? [cell.colour] : []))).size > 1)
    return 'two colours';
  return null;
}

export const colourOf = (b: Board, x: Rect): 'r' | 'g' | undefined =>
  cellsOf(b, x).find((cell) => cell.colour)?.colour;

/** Do two portions share an edge? */
export const touching = (a: Rect, x: Rect): boolean => {
  const rows = a.r < x.r + x.h && x.r < a.r + a.h;
  const cols = a.c < x.c + x.w && x.c < a.c + a.w;
  return (
    (rows && (a.c + a.w === x.c || x.c + x.w === a.c)) ||
    (cols && (a.r + a.h === x.r || x.r + x.h === a.r))
  );
};

/** Pairs of same-coloured portions that touch. */
export function colourClashes(b: Board, rects: Rect[]): [number, number][] {
  const out: [number, number][] = [];
  rects.forEach((a, i) =>
    rects.forEach((x, j) => {
      if (i < j && touching(a, x)) {
        const ca = colourOf(b, a);
        if (ca && ca === colourOf(b, x)) out.push([i, j]);
      }
    }),
  );
  return out;
}

/** How many portions each row and each column runs through. */
export function lineCounts(b: Board, rects: Rect[]): { rows: number[]; cols: number[] } {
  return {
    rows: Array.from(
      { length: b.height },
      (_, r) => rects.filter((x) => x.r <= r && r < x.r + x.h).length,
    ),
    cols: Array.from(
      { length: b.width },
      (_, c) => rects.filter((x) => x.c <= c && c < x.c + x.w).length,
    ),
  };
}

export function covers(b: Board, rects: Rect[]): boolean {
  const seen = new Set<string>();
  for (const x of rects)
    for (let r = x.r; r < x.r + x.h; r++)
      for (let c = x.c; c < x.c + x.w; c++) {
        if (seen.has(`${r},${c}`)) return false;
        seen.add(`${r},${c}`);
      }
  return seen.size === b.height * b.width;
}

export function solved(b: Board, rects: Rect[]): boolean {
  if (!covers(b, rects) || rects.some((x) => problem(b, x))) return false;
  if (colourClashes(b, rects).length) return false;
  const { rows, cols } = lineCounts(b, rects);
  return (
    b.rowMarks.every((m, r) => m === null || m === rows[r]) &&
    b.colMarks.every((m, c) => m === null || m === cols[c])
  );
}

export interface Rules {
  /** Ignore the colours (to check that they matter). */
  noColours?: boolean;
  /** Ignore the flags. */
  noMarks?: boolean;
}

/** Find up to `limit` answers (each a list of portions). */
export function solve(board: Board, limit = 2, rules: Rules = {}): Rect[][] {
  const b: Board = rules.noColours
    ? { ...board, cells: board.cells.map((row) => row.map(({ colour: _, ...cell }) => cell)) }
    : board;
  const rowMarks = rules.noMarks ? b.rowMarks.map(() => null) : b.rowMarks;
  const colMarks = rules.noMarks ? b.colMarks.map(() => null) : b.colMarks;
  const H = b.height;
  const W = b.width;
  const taken: boolean[][] = Array.from({ length: H }, () => Array<boolean>(W).fill(false));
  const placed: Rect[] = [];
  const found: Rect[][] = [];
  const rowCount = Array<number>(H).fill(0);
  const colCount = Array<number>(W).fill(0);
  // Every valid portion with its top-left at each cell, ignoring overlaps.
  const options: Rect[][][] = Array.from({ length: H }, (_, r) =>
    Array.from({ length: W }, (_, c) => {
      const out: Rect[] = [];
      for (let h = 1; r + h <= H; h++)
        for (let w = 1; c + w <= W; w++) {
          const x = { r, c, h, w };
          if (!problem(b, x)) out.push(x);
        }
      return out;
    }),
  );
  const fits = (x: Rect): boolean => {
    for (let r = x.r; r < x.r + x.h; r++)
      for (let c = x.c; c < x.c + x.w; c++) if (taken[r]?.[c]) return false;
    return true;
  };
  const mark = (x: Rect, v: boolean): void => {
    for (let r = x.r; r < x.r + x.h; r++)
      for (let c = x.c; c < x.c + x.w; c++) (taken[r] as boolean[])[c] = v;
    const d = v ? 1 : -1;
    for (let r = x.r; r < x.r + x.h; r++) rowCount[r] = (rowCount[r] ?? 0) + d;
    for (let c = x.c; c < x.c + x.w; c++) colCount[c] = (colCount[c] ?? 0) + d;
  };
  const go = (from: number): void => {
    if (found.length >= limit) return;
    let at = from;
    while (at < H * W && taken[Math.floor(at / W)]?.[at % W]) at++;
    // Rows above the first open cell are finished: their marks must be met.
    const doneRows = Math.floor(at / W);
    for (let r = Math.floor(from / W); r < Math.min(doneRows, H); r++) {
      const m = rowMarks[r];
      if (m !== null && m !== undefined && rowCount[r] !== m) return;
    }
    if (at === H * W) {
      if (colMarks.every((m, c) => m === null || m === colCount[c])) found.push([...placed]);
      return;
    }
    const r0 = Math.floor(at / W);
    const c0 = at % W;
    for (const x of options[r0]?.[c0] ?? []) {
      if (!fits(x)) continue;
      const colour = colourOf(b, x);
      if (colour && placed.some((y) => touching(x, y) && colourOf(b, y) === colour)) continue;
      mark(x, true);
      const over =
        rowMarks.some((m, r) => m !== null && (rowCount[r] ?? 0) > m) ||
        colMarks.some((m, c) => m !== null && (colCount[c] ?? 0) > m);
      if (!over) {
        placed.push(x);
        go(at);
        placed.pop();
      }
      mark(x, false);
    }
  };
  go(0);
  return found;
}

export const countSolutions = (b: Board, limit = 2, rules: Rules = {}): number =>
  solve(b, limit, rules).length;

export interface GenOptions {
  width: number;
  height: number;
  seed: number;
  /** Portion sizes allowed. */
  minArea?: number;
  maxArea?: number;
}

/** A random carving of the grid into portions. */
export function carve(o: GenOptions): Rect[] | null {
  const random = rng(o.seed);
  const taken = Array.from({ length: o.height }, () => Array<boolean>(o.width).fill(false));
  const rects: Rect[] = [];
  for (let at = 0; at < o.width * o.height; at++) {
    const r = Math.floor(at / o.width);
    const c = at % o.width;
    if (taken[r]?.[c]) continue;
    const shapes: Rect[] = [];
    for (let h = 1; r + h <= o.height; h++)
      for (let w = 1; c + w <= o.width; w++) {
        const area = h * w;
        if (area < (o.minArea ?? 1) || area > (o.maxArea ?? 9)) continue;
        let free = true;
        for (let i = r; i < r + h && free; i++)
          for (let j = c; j < c + w && free; j++) if (taken[i]?.[j]) free = false;
        if (free) shapes.push({ r, c, h, w });
      }
    if (!shapes.length) return null;
    const x = shapes[Math.floor(random() * shapes.length)] as Rect;
    for (let i = x.r; i < x.r + x.h; i++)
      for (let j = x.c; j < x.c + x.w; j++) (taken[i] as boolean[])[j] = true;
    rects.push(x);
  }
  return rects;
}

/** Write a board back out as a panel's rows. */
export function rowsOf(cells: Cell[][]): string[] {
  return cells.map((row) =>
    row.map((cell) => (cell.n !== undefined ? String(cell.n) : (cell.dish ?? '.'))).join(' '),
  );
}

export function coloursOf(cells: Cell[][]): string[] {
  return cells.map((row) => row.map((cell) => cell.colour ?? '.').join(''));
}
