/**
 * Strands (the New York Times' Strands): a grid of letters that is
 * entirely themed words. Drag through touching letters (diagonals too) to
 * spell one; every letter is in exactly one theme word, and bigger boards
 * have a spangram, a theme word that runs from one side to the other.
 *
 * Valentine's twists, each optional on a panel:
 * - the dark (Halloween): some letters are hidden until a word through them
 *   is found;
 * - numbered eggs (Easter): some letters carry their place in their word;
 * - letters for numbers (Valentine's own): some letters are written as
 *   numbers, the same number always the same letter, revealed everywhere
 *   when a word through one is found.
 *
 * Here: the rules, the checks the tests use (the words fill the grid, each
 * word can be spelled only one way), and the generator that lays words out.
 */
import { rng } from './kit';

export type Spot = [number, number];

export interface Word {
  word: string;
  /** Its letters' squares, in order. */
  cells: Spot[];
}

export interface Panel {
  name: string;
  /** The theme, shown above the board. */
  theme: string;
  /** The letters, row by row. */
  rows: string[];
  /** The theme words and where they lie (the spangram first, if any). */
  words: Word[];
  /** The first word is a spangram (runs from one side of the board to the other). */
  spangram?: boolean;
  /** Squares whose letter is in the dark. */
  dark?: Spot[];
  /** Squares with a numbered egg (their place in their word). */
  eggs?: Spot[];
  /** Letters written as numbers (the first letter is 1, and so on). */
  code?: string;
}

export const key = ([r, c]: Spot): string => `${r},${c}`;
export const touching = (a: Spot, b: Spot): boolean =>
  Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1])) === 1;

/** The letter at a square. */
export const letterAt = (p: Panel, [r, c]: Spot): string => p.rows[r]?.[c] ?? '';

/** The word a dragged path finds (its index), if it's a theme word laid exactly there. */
export function find(p: Panel, path: Spot[]): number {
  return p.words.findIndex(
    (w) =>
      w.cells.length === path.length && w.cells.every((s, i) => key(s) === key(path[i] as Spot)),
  );
}

/** Each square's place in its word (1-based), for the eggs. */
export function placeIn(p: Panel, s: Spot): number {
  for (const w of p.words) {
    const i = w.cells.findIndex((x) => key(x) === key(s));
    if (i >= 0) return i + 1;
  }
  return 0;
}

/** Every way to spell `word` in the grid, as distinct sets of squares. */
export function spellings(p: Panel, word: string): string[] {
  const H = p.rows.length;
  const W = p.rows[0]?.length ?? 0;
  const found = new Set<string>();
  const path: Spot[] = [];
  const go = (s: Spot, i: number): void => {
    if (letterAt(p, s) !== word[i]) return;
    path.push(s);
    if (i === word.length - 1) found.add(path.map(key).sort().join(' '));
    else
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          const t: Spot = [s[0] + dr, s[1] + dc];
          if (
            (dr || dc) &&
            t[0] >= 0 &&
            t[0] < H &&
            t[1] >= 0 &&
            t[1] < W &&
            !path.some((x) => key(x) === key(t))
          )
            go(t, i + 1);
        }
    path.pop();
  };
  for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) go([r, c], 0);
  return [...found];
}

/** Two diagonal steps that cross each other (an X between four squares). */
const crosses = (a: Spot, b: Spot, c: Spot, d: Spot): boolean =>
  Math.abs(a[0] - b[0]) === 1 &&
  Math.abs(a[1] - b[1]) === 1 &&
  Math.abs(c[0] - d[0]) === 1 &&
  Math.abs(c[1] - d[1]) === 1 &&
  Math.min(a[0], b[0]) === Math.min(c[0], d[0]) &&
  Math.min(a[1], b[1]) === Math.min(c[1], d[1]) &&
  key(a) !== key(c) &&
  key(a) !== key(d);

/** Lay the words out to fill an h×w grid exactly (null if this seed can't). */
export function generate(
  words: string[],
  h: number,
  w: number,
  seed: number,
  spangram = false,
): Panel | null {
  const random = rng(seed);
  if (words.reduce((s, x) => s + x.length, 0) !== h * w)
    throw new Error(`${words.join()} don't fill ${h}×${w}`);
  const grid: string[][] = Array.from({ length: h }, () => Array<string>(w).fill(''));
  const placed: Word[] = [];
  const steps: [Spot, Spot][] = [];
  const free = (s: Spot): boolean =>
    s[0] >= 0 && s[0] < h && s[1] >= 0 && s[1] < w && grid[s[0]]?.[s[1]] === '';
  const neighbours = (s: Spot): Spot[] => {
    const out: Spot[] = [];
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++) if (dr || dc) out.push([s[0] + dr, s[1] + dc]);
    return out.sort(() => random() - 0.5);
  };
  let budget = 20000;
  // Empty squares fall into pieces; each must be fillable by some of the words left.
  const fillable = (left: string[]): boolean => {
    const seen = new Set<string>();
    const lengths = left.map((x) => x.length);
    for (let r = 0; r < h; r++)
      for (let c = 0; c < w; c++) {
        if (!free([r, c]) || seen.has(key([r, c]))) continue;
        let size = 0;
        const stack: Spot[] = [[r, c]];
        seen.add(key([r, c]));
        while (stack.length) {
          const s = stack.pop() as Spot;
          size++;
          for (const t of neighbours(s))
            if (free(t) && !seen.has(key(t))) {
              seen.add(key(t));
              stack.push(t);
            }
        }
        // Can some of the lengths add up to this piece's size?
        const sums = new Set([0]);
        for (const n of lengths) for (const v of [...sums]) sums.add(v + n);
        if (!sums.has(size)) return false;
      }
    return true;
  };
  // Grow a path for `word` from `start`, through free squares, without crossing any laid step.
  const grow = (word: string, path: Spot[], done: (path: Spot[]) => boolean): boolean => {
    if (budget-- < 0) return false;
    if (path.length === word.length) return done(path);
    const last = path[path.length - 1] as Spot;
    for (const t of neighbours(last)) {
      if (!free(t) || path.some((x) => key(x) === key(t))) continue;
      if (steps.some(([a, b]) => crosses(a, b, last, t))) continue;
      if (path.some((x, i) => i > 0 && crosses(path[i - 1] as Spot, x, last, t))) continue;
      path.push(t);
      if (grow(word, path, done)) return true;
      path.pop();
    }
    return false;
  };
  const lay = (word: string, path: Spot[]): void => {
    path.forEach(([r, c], i) => ((grid[r] as string[])[c] = word[i] as string));
    path.forEach((s, i) => i > 0 && steps.push([path[i - 1] as Spot, s]));
    placed.push({ word, cells: path.map((s) => [s[0], s[1]] as Spot) });
  };
  const unlay = (path: Spot[]): void => {
    for (const [r, c] of path) (grid[r] as string[])[c] = '';
    steps.splice(steps.length - (path.length - 1), path.length - 1);
    placed.pop();
  };
  const fill = (left: string[]): boolean => {
    if (!left.length) return true;
    if (!fillable(left)) return false;
    // The first empty square starts (or ends) one of the words left.
    let first: Spot | null = null;
    for (let r = 0; r < h && !first; r++)
      for (let c = 0; c < w && !first; c++) if (free([r, c])) first = [r, c];
    const order = left.map((_, i) => i).sort(() => random() - 0.5);
    for (const i of order) {
      const word = left[i] as string;
      for (const backwards of random() < 0.5 ? [false, true] : [true, false]) {
        const spelled = backwards ? [...word].reverse().join('') : word;
        const rest = left.filter((_, j) => j !== i);
        const ok = grow(spelled, [first as Spot], (path) => {
          const cells = backwards ? [...path].reverse() : [...path];
          lay(word, cells);
          if (fill(rest)) return true;
          unlay(cells);
          return false;
        });
        if (ok) return true;
      }
    }
    return false;
  };
  let ok: boolean;
  if (spangram) {
    // The spangram first: from the left side to the right (or top to bottom).
    const word = words[0] as string;
    const across = random() < 0.5 || w > h;
    const starts: Spot[] = Array.from({ length: across ? h : w }, (_, i) =>
      across ? [i, 0] : [0, i],
    );
    ok = starts
      .sort(() => random() - 0.5)
      .some((start) =>
        grow(word, [start], (path) => {
          const last = path[path.length - 1] as Spot;
          if (across ? last[1] !== w - 1 : last[0] !== h - 1) return false;
          lay(word, [...path]);
          if (fill(words.slice(1))) return true;
          unlay([...path]);
          return false;
        }),
      );
  } else ok = fill(words);
  if (!ok) return null;
  const panel: Panel = {
    name: 'generated',
    theme: '',
    rows: grid.map((row) => row.join('')),
    words: [],
  };
  // Keep the words in the order given.
  panel.words = words.map((x) => placed.find((p) => p.word === x) as Word);
  if (spangram) panel.spangram = true;
  return panel;
}

/** The words fill the grid exactly, each laid along touching squares, spelling itself. */
export function wellFormed(p: Panel): boolean {
  const seen = new Set<string>();
  for (const w of p.words) {
    if (w.cells.map((s) => letterAt(p, s)).join('') !== w.word) return false;
    if (w.cells.some((s, i) => i > 0 && !touching(w.cells[i - 1] as Spot, s))) return false;
    for (const s of w.cells) {
      if (seen.has(key(s))) return false;
      seen.add(key(s));
    }
  }
  return seen.size === p.rows.length * (p.rows[0]?.length ?? 0);
}
