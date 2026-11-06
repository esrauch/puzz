/**
 * Filling a Words board from a theme's bank, choosing words as it goes.
 *
 * Rather than picking a word list first and then trying to fit it, each
 * empty square starts whichever unused word fits there, so a pocket of four
 * squares just takes a four-letter word. Dead ends are caught early: as a
 * word's path grows, any pocket of empty squares it seals off must be big
 * enough for the shortest word and a size some unused words add up to
 * (a lone square, or two, can never be filled).
 */
import { rng, shuffle } from '../core/rng';
import { type Panel, type Spot, type Word, key } from './model';

export interface FillOptions {
  shortest: number;
  longest: number;
  /** Exactly this many words (besides `keep`), when set. */
  count?: number;
  /** Words already on the board, which stay. */
  keep?: Word[];
  /** Search steps before giving up. */
  steps?: number;
}

/** Two diagonal steps that cross each other (an X between four squares). */
const crossing = (a: Spot, b: Spot, c: Spot, d: Spot): boolean =>
  Math.abs(a[0] - b[0]) === 1 &&
  Math.abs(a[1] - b[1]) === 1 &&
  Math.abs(c[0] - d[0]) === 1 &&
  Math.abs(c[1] - d[1]) === 1 &&
  Math.min(a[0], b[0]) === Math.min(c[0], d[0]) &&
  Math.min(a[1], b[1]) === Math.min(c[1], d[1]) &&
  key(a) !== key(c) &&
  key(a) !== key(d);

/** Fill an h×w board with words from `bank` (each at most once), or null. */
export function fillBoard(
  bank: readonly string[],
  h: number,
  w: number,
  seed: number,
  o: FillOptions,
): Panel | null {
  const random = rng(seed);
  const keep = o.keep ?? [];
  const grid: string[][] = Array.from({ length: h }, () => Array<string>(w).fill(''));
  const placed: Word[] = [];
  const steps: [Spot, Spot][] = [];
  const unused = new Set(
    bank.filter(
      (x) => x.length >= o.shortest && x.length <= o.longest && !keep.some((k) => k.word === x),
    ),
  );
  let free = h * w;
  let budget = o.steps ?? 60000;
  const isFree = (s: Spot): boolean =>
    s[0] >= 0 && s[0] < h && s[1] >= 0 && s[1] < w && grid[s[0]]?.[s[1]] === '';
  const around = (s: Spot): Spot[] => {
    const out: Spot[] = [];
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++) if (dr || dc) out.push([s[0] + dr, s[1] + dc]);
    return out;
  };
  const lay = (word: string, cells: Spot[]): void => {
    cells.forEach(([r, c], i) => ((grid[r] as string[])[c] = word[i] as string));
    cells.forEach((s, i) => i > 0 && steps.push([cells[i - 1] as Spot, s]));
    placed.push({ word, cells: cells.map(([r, c]) => [r, c] as Spot) });
    unused.delete(word);
    free -= cells.length;
  };
  const unlay = (word: string, cells: Spot[]): void => {
    for (const [r, c] of cells) (grid[r] as string[])[c] = '';
    steps.splice(steps.length - (cells.length - 1), cells.length - 1);
    placed.pop();
    unused.add(word);
    free += cells.length;
  };
  for (const k of keep) {
    lay(k.word, k.cells);
    unused.delete(k.word);
  }
  const fresh = placed.length;

  /** Sizes the unused words can add up to (each word once), up to `max`. */
  const sums = (max: number, except = ''): boolean[] => {
    const can = Array<boolean>(max + 1).fill(false);
    can[0] = true;
    for (const x of unused) {
      if (x === except) continue;
      for (let v = max; v >= x.length; v--) if (can[v - x.length]) can[v] = true;
    }
    return can;
  };
  /** The pocket of empty squares around `s` (not through `avoid`). */
  const pocket = (s: Spot, seen: Set<string>, avoid: Set<string>): number => {
    let size = 0;
    const stack = [s];
    seen.add(key(s));
    while (stack.length) {
      const x = stack.pop() as Spot;
      size++;
      for (const t of around(x))
        if (isFree(t) && !seen.has(key(t)) && !avoid.has(key(t))) {
          seen.add(key(t));
          stack.push(t);
        }
    }
    return size;
  };
  /** Every pocket of empty squares fillable by the words left. */
  const fillable = (): boolean => {
    const can = sums(free);
    const seen = new Set<string>();
    for (let r = 0; r < h; r++)
      for (let c = 0; c < w; c++) {
        if (!isFree([r, c]) || seen.has(key([r, c]))) continue;
        const size = pocket([r, c], seen, new Set());
        if (size < o.shortest || !can[size]) return false;
      }
    return true;
  };
  /**
   * Pockets the newest square has sealed off must be fillable too (only it can
   * have sealed one); a pocket the tip can still reach is still being filled by
   * this word. `can`: sizes the other unused words add up to.
   */
  const sealedOk = (path: Spot[], can: boolean[]): boolean => {
    const onPath = new Set(path.map(key));
    const tip = path[path.length - 1] as Spot;
    const nearTip = new Set(around(tip).map(key));
    const seen = new Set<string>();
    for (const t of around(tip)) {
      if (!isFree(t) || onPath.has(key(t)) || seen.has(key(t))) continue;
      const pocketSeen = new Set<string>();
      const size = pocket(t, pocketSeen, onPath);
      pocketSeen.forEach((k) => seen.add(k));
      if ([...pocketSeen].some((k) => nearTip.has(k))) continue;
      if (size < o.shortest || !can[size]) return false;
    }
    // Squares around the path but not the tip, cut off from it, are sealed pockets too.
    for (const s of path.slice(0, -1))
      for (const t of around(s)) {
        if (!isFree(t) || onPath.has(key(t)) || seen.has(key(t))) continue;
        const pocketSeen = new Set<string>();
        const size = pocket(t, pocketSeen, onPath);
        pocketSeen.forEach((k) => seen.add(k));
        if ([...pocketSeen].some((k) => nearTip.has(k))) continue;
        if (size < o.shortest || !can[size]) return false;
      }
    return true;
  };
  /** Free neighbours of a square, not on the path (fewest first, as Warnsdorff: hug edges and corners). */
  const freeAround = (s: Spot, path: Spot[]): number =>
    around(s).filter((t) => isFree(t) && !path.some((x) => key(x) === key(t))).length;
  const grow = (
    word: string,
    path: Spot[],
    can: boolean[],
    done: (p: Spot[]) => boolean,
  ): boolean => {
    if (budget-- < 0) return false;
    if (path.length === word.length) return done(path);
    const last = path[path.length - 1] as Spot;
    const next = shuffle(random, around(last))
      .filter((t) => isFree(t) && !path.some((x) => key(x) === key(t)))
      .map((t) => [freeAround(t, path), t] as const)
      .sort((a, b) => a[0] - b[0]);
    for (const [, t] of next) {
      if (steps.some(([a, b]) => crossing(a, b, last, t))) continue;
      if (path.some((x, i) => i > 0 && crossing(path[i - 1] as Spot, x, last, t))) continue;
      path.push(t);
      if (sealedOk(path, can) && grow(word, path, can, done)) return true;
      path.pop();
    }
    return false;
  };
  const fill = (): boolean => {
    const made = placed.length - fresh;
    if (o.count !== undefined) {
      const left = o.count - made;
      if (left < 0 || free < left * o.shortest || free > left * o.longest) return false;
    }
    if (!free) return true;
    if (budget < 0 || !fillable()) return false;
    let first: Spot | null = null;
    for (let r = 0; r < h && !first; r++)
      for (let c = 0; c < w && !first; c++) if (isFree([r, c])) first = [r, c];
    const start = first as Spot;
    // A handful of words that could start here, in random order.
    const tries = shuffle(
      random,
      [...unused].filter((x) => x.length <= free),
    ).slice(0, 8);
    for (const word of tries) {
      for (const backwards of random() < 0.5 ? [false, true] : [true, false]) {
        const spelled = backwards ? [...word].reverse().join('') : word;
        const can = sums(free, word);
        const ok = grow(spelled, [start], can, (path) => {
          const cells = backwards ? [...path].reverse() : [...path];
          lay(word, cells);
          if (fill()) return true;
          unlay(word, cells);
          return false;
        });
        if (ok) return true;
      }
    }
    return false;
  };
  if (!fill()) return null;
  return {
    name: 'generated',
    theme: '',
    rows: grid.map((row) => row.join('')),
    words: [...keep, ...placed.slice(fresh)],
  };
}
