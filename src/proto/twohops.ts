/**
 * Two bunnies (Tuesday's Numbrix panel): a red bunny and a green bunny, each
 * stepping to neighbouring squares (up, down, left, right) from its own egg
 * marked 1. Together they visit every square once: the red bunny every red
 * square, the green bunny every green one, and white squares go to either.
 * (Christmas's red and green, as at home: two strings.)
 *
 * Letters for numbers (Valentine's): some of the red bunny's eggs show a
 * letter instead of a number. The message's blanks are numbers, the red
 * bunny's steps where those letters lie: solve the route and the message
 * spells itself (or guess the message and learn where the steps go).
 */
export type Spot = [number, number];
export const key = ([r, c]: Spot): string => `${r},${c}`;

export interface Panel {
  name: string;
  /** Squares, row by row: 'r' red, 'g' green, 'w' white (either bunny), '.' none. */
  rows: string[];
  /** Numbered eggs: [row, column, step] (the step of the bunny of that square's colour). */
  given: [number, number, number][];
  /** Letter eggs: [row, column, letter], on a red or green square (that bunny's route). */
  letters?: [number, number, string][];
  /** Each bunny's message: its steps where its letters lie, in the word's order (e.g. "4 9 13"). */
  message?: string;
  greenMessage?: string;
}

export interface Board {
  spots: Spot[];
  index: Map<string, number>;
  colour: string[];
  hops: number[][];
  given: Map<number, number>;
  letterAt: Map<number, string>;
  /** The steps each bunny's message points at. */
  blanks: number[];
  greenBlanks: number[];
}

export function parse(p: Panel): Board {
  const spots: Spot[] = [];
  const colour: string[] = [];
  p.rows.forEach((row, r) =>
    [...row].forEach((ch, c) => {
      if (ch === '.') return;
      spots.push([r, c]);
      colour.push(ch);
    }),
  );
  const index = new Map(spots.map((s, i) => [key(s), i]));
  const hops = spots.map(([r, c]) =>
    [
      [r - 1, c],
      [r + 1, c],
      [r, c - 1],
      [r, c + 1],
    ].flatMap((s) => {
      const j = index.get(key(s as Spot));
      return j === undefined ? [] : [j];
    }),
  );
  return {
    spots,
    index,
    colour,
    hops,
    given: new Map(p.given.map(([r, c, n]) => [index.get(key([r, c])) as number, n])),
    letterAt: new Map((p.letters ?? []).map(([r, c, l]) => [index.get(key([r, c])) as number, l])),
    blanks: (p.message ?? '').split(/\s+/).filter(Boolean).map(Number),
    greenBlanks: (p.greenMessage ?? '').split(/\s+/).filter(Boolean).map(Number),
  };
}

export interface Rules {
  noLetters?: boolean;
  /** Treat every square as white (to check the colours matter). */
  noColours?: boolean;
}

/** Are two routes (spot indices, each from its 1 egg) a full, legal pair? */
export function solved(b: Board, red: number[], green: number[], rules: Rules = {}): boolean {
  const all = [...red, ...green];
  if (all.length !== b.spots.length || new Set(all).size !== all.length) return false;
  for (const route of [red, green])
    if (route.some((i, n) => n > 0 && !(b.hops[route[n - 1] as number] ?? []).includes(i)))
      return false;
  if (!rules.noColours) {
    if (red.some((i) => b.colour[i] === 'g') || green.some((i) => b.colour[i] === 'r'))
      return false;
  }
  for (const [route, mine] of [
    [red, 'r'],
    [green, 'g'],
  ] as const)
    if (
      route.some(
        (i, n) =>
          b.given.has(i) &&
          (b.colour[i] === mine || b.colour[i] === 'w') &&
          b.given.get(i) !== n + 1,
      )
    )
      return false;
  // Eggs must be on their own bunny's route.
  for (const [i] of b.given) {
    const onRed = red.includes(i);
    if ((b.colour[i] === 'r' && !onRed) || (b.colour[i] === 'g' && onRed)) return false;
  }
  if (!rules.noLetters && b.letterAt.size) {
    // Each bunny's letters lie exactly on the steps its message names.
    for (const [route, blanks, tone] of [
      [red, b.blanks, 'r'],
      [green, b.greenBlanks, 'g'],
    ] as const) {
      const steps = new Set(blanks);
      const mine = (i: number): boolean => b.letterAt.has(i) && b.colour[i] === tone;
      if (route.some((i, n) => steps.has(n + 1) !== mine(i))) return false;
    }
    for (const i of b.letterAt.keys())
      if (b.colour[i] === 'r' ? !red.includes(i) : !green.includes(i)) return false;
  }
  return true;
}

/** A bunny's message, filled from its route. */
export function spell(b: Board, route: number[], tone: 'r' | 'g' = 'r'): string {
  return (tone === 'r' ? b.blanks : b.greenBlanks)
    .map((n) => b.letterAt.get(route[n - 1] ?? -1) ?? '_')
    .join('');
}

/** Find up to `limit` pairs of routes. */
export function solve(b: Board, limit = 2, rules: Rules = {}): [number[], number[]][] {
  const N = b.spots.length;
  const colour = (i: number): string => (rules.noColours ? 'w' : (b.colour[i] as string));
  const used = new Array<boolean>(N).fill(false);
  const found: [number[], number[]][] = [];
  const startOf = (tone: string): number | undefined =>
    [...b.given].find(([i, n]) => n === 1 && b.colour[i] === tone)?.[0];
  const redStart = startOf('r');
  const greenStart = startOf('g');
  if (redStart === undefined || greenStart === undefined) return found;
  const steps = new Set(b.blanks);
  const greenSteps = new Set(b.greenBlanks);
  const redCount = b.spots.filter((_, i) => colour(i) === 'r').length;
  const fits = (i: number, n: number, tone: 'r' | 'g'): boolean => {
    const c = colour(i);
    if (c !== 'w' && c !== tone) return false;
    const g = b.given.get(i);
    if (g !== undefined && (b.colour[i] === tone || b.colour[i] === 'w') && g !== n) return false;
    if (g !== undefined && b.colour[i] !== 'w' && b.colour[i] !== tone) return false;
    if (!rules.noLetters && b.letterAt.size) {
      if (b.letterAt.has(i) && b.colour[i] !== tone) return false;
      const mine = b.letterAt.has(i) && b.colour[i] === tone;
      if ((tone === 'r' ? steps : greenSteps).has(n) !== mine) return false;
    }
    return true;
  };
  // The squares left must hang together from the bunny, or they can't all be visited.
  const together = (from: number, left: number): boolean => {
    const seen = new Set([from]);
    const stack = [from];
    let n = 0;
    while (stack.length) {
      const x = stack.pop() as number;
      for (const y of b.hops[x] ?? [])
        if (!used[y] && !seen.has(y)) {
          seen.add(y);
          n++;
          stack.push(y);
        }
    }
    return n === left;
  };
  const red: number[] = [];
  const green: number[] = [];
  const goGreen = (): void => {
    if (found.length >= limit) return;
    const left = N - red.length - green.length;
    if (!left) {
      if (solved(b, red, green, rules)) found.push([[...red], [...green]]);
      return;
    }
    const last = green[green.length - 1] as number;
    if (!together(last, left)) return;
    for (const j of b.hops[last] ?? []) {
      if (used[j] || !fits(j, green.length + 1, 'g')) continue;
      used[j] = true;
      green.push(j);
      goGreen();
      green.pop();
      used[j] = false;
    }
  };
  const goRed = (): void => {
    if (found.length >= limit) return;
    const last = red[red.length - 1] as number;
    // The red bunny may stop once it has every red square (and the steps the message needs).
    const reds = red.filter((i) => colour(i) === 'r').length;
    const needs = rules.noLetters ? 0 : Math.max(0, ...b.blanks);
    if (reds === redCount && red.length >= needs && !used[greenStart] && fits(greenStart, 1, 'g')) {
      used[greenStart] = true;
      green.push(greenStart);
      goGreen();
      green.pop();
      used[greenStart] = false;
    }
    for (const j of b.hops[last] ?? []) {
      if (used[j] || j === greenStart || !fits(j, red.length + 1, 'r')) continue;
      used[j] = true;
      red.push(j);
      goRed();
      red.pop();
      used[j] = false;
    }
  };
  if (!fits(redStart, 1, 'r')) return found;
  used[redStart] = true;
  red.push(redStart);
  goRed();
  return found;
}

export const countSolutions = (b: Board, limit = 2, rules: Rules = {}): number =>
  solve(b, limit, rules).length;
