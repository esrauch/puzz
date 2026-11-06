/**
 * Generating Words panels: the plain puzzle, or any mix of twists, at a tier.
 *
 * Words come from one theme, picked to fill the grid exactly, and are laid
 * out along touching squares (bigger boards in two halves, which lay out far
 * more easily; with cuts, the halves are the fenced portions, each with the
 * same number of words). Then, in rounds:
 * 1. put the twists on: the dark, the code, red white and blue bows, eggs;
 * 2. if some word can still be traced more than one way, re-lay just those
 *    words (and the words whose squares their other spellings use) in place,
 *    keeping the rest of the board, and go again;
 * 3. keep the panel when every word lies one way, each clue-adding twist does
 *    work by the tier's margin, and the shared checks (verify.ts) pass.
 */
import { Budget, within } from '../core/budget';
import { type Rng, rng, shuffle } from '../core/rng';
import { type Made, Rejections, type Spec, type Tier, trySeeds } from '../core/spec';
import { fillBoard } from './make';
import { type Panel, type Spot, type Word, key, layOut } from './model';

type Wall = [number, number, 'v' | 'h'];
import { answers, edge, framedOptions, options } from './solve';
import { THEMES, pickWords } from './themes';
import { type WordTwist, eachWordOnce, problems, twistsOf } from './verify';

export interface Shape {
  width: number;
  height: number;
  /** The shortest and longest words allowed (short words turn up by accident elsewhere). */
  shortest: number;
  longest: number;
  /** With twists: without any one clue-adding twist, at least this many words could be traced more than one way. */
  margin: number;
  /** Letters to put in the dark. */
  dark: number;
  /** Letters to write as numbers. */
  code: number;
}

/** A tier is a board size; the twists make it easier or harder as they fall. */
export const SHAPES: Record<Tier, Shape> = {
  easy: { width: 5, height: 5, shortest: 4, longest: 8, margin: 1, dark: 2, code: 2 },
  medium: { width: 7, height: 7, shortest: 4, longest: 8, margin: 2, dark: 3, code: 3 },
  hard: { width: 9, height: 9, shortest: 5, longest: 9, margin: 2, dark: 5, code: 4 },
};

const ROUNDS = 40;

/** The theme's bank of words for a board (by the theme's name). */
const bankOf = (name: string, shape: Shape): string[] =>
  [...new Set(THEMES.find((t) => t.name === name)?.words ?? [])].filter(
    (w) => w.length >= shape.shortest && w.length <= shape.longest,
  );

/** Fill the board from a theme's bank. */
function layBoard(shape: Shape, random: Rng, seed: number): Panel | null {
  const theme = THEMES[Math.floor(random() * THEMES.length)];
  if (!theme) return null;
  const laid = fillBoard(bankOf(theme.name, shape), shape.height, shape.width, seed, {
    shortest: shape.shortest,
    longest: shape.longest,
  });
  return laid ? { ...laid, theme: theme.name } : null;
}

/** Every path through exactly these squares (touching steps, diagonals too). */
function pathsThrough(cells: Spot[], limit = 400): Spot[][] {
  const out: Spot[][] = [];
  const keys = new Set(cells.map(key));
  const path: Spot[] = [];
  const go = (s: Spot): void => {
    if (out.length >= limit) return;
    path.push(s);
    if (path.length === cells.length) out.push([...path]);
    else
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          const t: Spot = [s[0] + dr, s[1] + dc];
          if ((dr || dc) && keys.has(key(t)) && !path.some((x) => key(x) === key(t))) go(t);
        }
    path.pop();
  };
  for (const s of cells) go(s);
  return out;
}

/** Two diagonal steps crossing each other (an X between four squares). */
const crossing = (a: Spot, b: Spot, c: Spot, d: Spot): boolean =>
  Math.abs(a[0] - b[0]) === 1 &&
  Math.abs(a[1] - b[1]) === 1 &&
  Math.abs(c[0] - d[0]) === 1 &&
  Math.abs(c[1] - d[1]) === 1 &&
  Math.min(a[0], b[0]) === Math.min(c[0], d[0]) &&
  Math.min(a[1], b[1]) === Math.min(c[1], d[1]) &&
  key(a) !== key(c) &&
  key(a) !== key(d);

/**
 * Snowflakes: the whole board is the frame, one column narrower than the
 * tier's size (5×4, 7×6, 9×8) so the mirror line runs between squares and no
 * leftover strip gives a word away. Its words come in pairs of the same
 * length. One of each pair is laid on the first half (the most curled-up of
 * several layouts: a straight word, mirrored, has only two ways to lie); its
 * partner takes the mirrored squares in a different order, so the squares
 * mirror and the words don't. Turned a quarter half the time, so the mirror
 * runs either way.
 */
function layMirrored(shape: Shape, random: Rng, seed: number): Panel | null {
  const theme = THEMES[Math.floor(random() * THEMES.length)];
  if (!theme) return null;
  const { width: W, height: H } = shape;
  const fw = W - 1;
  const hw = fw / 2;
  // Pairs of the same length, picked to fill half the frame exactly.
  const byLength = new Map<number, string[]>();
  for (const w of shuffle(random, [...new Set(theme.words)]))
    if (w.length >= shape.shortest && w.length <= Math.min(shape.longest, H * hw))
      byLength.set(w.length, [...(byLength.get(w.length) ?? []), w]);
  const pairs: [string, string][] = [];
  for (const words of byLength.values())
    for (let i = 0; i + 1 < words.length; i += 2)
      pairs.push([words[i] as string, words[i + 1] as string]);
  const chosen = pickWords(
    { name: theme.name, words: pairs.map(([a]) => a) },
    H * hw,
    1,
    99,
    shape.longest,
    random,
  );
  if (!chosen) return null;
  const partner = new Map(pairs.map(([a, b]) => [a, b]));
  // The first half: the most curled-up of a few layouts (each word's longest side, against its length).
  let half: Panel | null = null;
  let best = Infinity;
  for (let t = 0; t < 6; t++) {
    const laid = layOut(chosen, H, hw, seed * 11 + t);
    if (!laid) continue;
    const score = laid.words.reduce((n, w) => {
      const rs = w.cells.map(([r]) => r);
      const cs = w.cells.map(([, c]) => c);
      const side =
        Math.max(Math.max(...rs) - Math.min(...rs), Math.max(...cs) - Math.min(...cs)) + 1;
      return n + side / w.word.length;
    }, 0);
    if (score < best) {
      best = score;
      half = laid;
    }
  }
  if (!half) return null;
  // The mirror half: each partner on the mirrored squares, its letters in a different order.
  const grid = Array.from({ length: H }, () => Array<string>(fw).fill(''));
  const words: Word[] = [];
  const steps: [Spot, Spot][] = [];
  for (const w of half.words) {
    words.push(w);
    w.cells.forEach(([r, c], i) => ((grid[r] as string[])[c] = w.word[i] as string));
    w.cells.forEach((s, i) => i && steps.push([w.cells[i - 1] as Spot, s]));
  }
  for (const w of half.words) {
    const other = partner.get(w.word);
    if (!other) return null;
    const mirror = w.cells.map(([r, c]): Spot => [r, fw - 1 - c]);
    const same = (path: Spot[]): boolean =>
      path.every((s, i) => key(s) === key(mirror[i] as Spot)) ||
      path.every((s, i) => key(s) === key(mirror[mirror.length - 1 - i] as Spot));
    const ways = shuffle(random, pathsThrough(mirror)).filter(
      (path) =>
        !same(path) &&
        !path.some(
          (s, i) => i > 0 && steps.some(([a, b]) => crossing(a, b, path[i - 1] as Spot, s)),
        ),
    );
    const path = ways[0];
    if (!path) return null;
    words.push({ word: other, cells: path });
    path.forEach(([r, c], i) => ((grid[r] as string[])[c] = other[i] as string));
    path.forEach((s, i) => i && steps.push([path[i - 1] as Spot, s]));
  }
  let p: Panel = {
    name: 'generated',
    theme: theme.name,
    rows: grid.map((row) => row.join('')),
    words,
    frame: { top: 0, bottom: H - 1, left: 0, right: fw - 1, axis: 'v' },
  };
  // Turned a quarter half the time (the mirror then runs top to bottom).
  if (random() < 0.5) {
    const f = p.frame as NonNullable<Panel['frame']>;
    p = {
      ...p,
      rows: Array.from({ length: W }, (_, c) => p.rows.map((row) => row[c] ?? '').join('')),
      words: p.words.map((w) => ({ word: w.word, cells: w.cells.map(([r, c]): Spot => [c, r]) })),
      frame: { top: f.left, bottom: f.right, left: f.top, right: f.bottom, axis: 'h' },
    };
  }
  return p;
}

/** Refill some words' squares from the bank (the rest stay), or null if they won't fill. */
function relay(p: Panel, which: Set<number>, seed: number, shape: Shape): Panel | null {
  const keep = p.words.filter((_, i) => !which.has(i));
  const H = p.rows.length;
  const W = p.rows[0]?.length ?? 0;
  // A refill touches only a few words: a small search budget, so a hopeless one gives up fast.
  const laid = fillBoard(bankOf(p.theme, shape), H, W, seed, {
    shortest: shape.shortest,
    longest: shape.longest,
    keep,
    steps: 6000,
  });
  if (!laid) return null;
  if (p.portions) {
    // A word must stay in one portion, and the portions keep the same number of words each.
    const portion = ([r, c]: Spot): string => p.portions?.[r]?.[c] ?? '';
    if (laid.words.some((w) => new Set(w.cells.map(portion)).size > 1)) return null;
    const count = new Map<string, number>();
    for (const w of laid.words)
      count.set(portion(w.cells[0] as Spot), (count.get(portion(w.cells[0] as Spot)) ?? 0) + 1);
    if (new Set(count.values()).size > 1) return null;
  }
  return { ...p, rows: laid.rows, words: laid.words };
}

/** The same board with word `i` swapped for another of the same length, along the same path. */
function swapWord(p: Panel, i: number, word: string): Panel {
  const rows = p.rows.map((row) => [...row]);
  const cells = p.words[i]?.cells ?? [];
  cells.forEach(([r, c], j) => ((rows[r] as string[])[c] = word[j] as string));
  return {
    ...p,
    rows: rows.map((row) => row.join('')),
    words: p.words.map((w, j) => (j === i ? { word, cells } : w)),
  };
}

/** One attempt at a panel from one seed (null: try the next seed). */
export function makePanel(
  spec: Spec<WordTwist>,
  seed: number,
  why = new Rejections(),
): Made<Panel> | null {
  const on = new Set(spec.twists);
  const shape = SHAPES[spec.tier];
  const budget = new Budget(4_000_000);
  return (
    within(() => {
      let base = on.has('snow')
        ? layMirrored(shape, rng(seed * 7919 + 41), seed)
        : layBoard(shape, rng(seed * 7919 + 41), seed);
      if (!base) return why.no('no words laid');
      // Which words can still be traced another way (and the words those other ways run through)?
      // `on`: the twists already chosen for this board (a swap keeps every word's squares, so the
      // dark, the code's letters, bows and eggs can stay where they are); otherwise choose them.
      const trouble = (b: Panel, keep?: Panel): { p: Panel | null; troubled: Set<number> } => {
        const p = keep ? reuse(b, keep) : twist(b, rng(seed * 104729));
        const troubled = new Set<number>();
        if (!p) return { p, troubled };
        const owner = new Map<string, number>();
        p.words.forEach((w, i) => w.cells.forEach((s) => owner.set(key(s), i)));
        framedOptions(p, { noCode: true }, budget).forEach((ways, i) => {
          if (ways.length <= 1) return;
          troubled.add(i);
          for (const o of ways)
            for (const k of o.cells) {
              const j = owner.get(k);
              if (j !== undefined) troubled.add(j);
            }
        });
        return { p, troubled };
      };
      for (let round = 0; round < ROUNDS; round++) {
        const random = rng(seed * 7 + round);
        const { p, troubled } = trouble(base);
        if (!p) return null;
        if (!troubled.size) return finish(p);
        // A snowflake board can't change single words without breaking its pairs: try the next seed.
        if (on.has('snow')) return why.no('a word lies more than one way');
        // Swap a troubled word for another of the same length, along the same path (new letters
        // usually kill the other way); if no swap helps, refill a few troubled words' squares.
        const onBoard = new Set(base.words.map((w) => w.word));
        let swapped = false;
        for (const i of shuffle(random, [...troubled])) {
          const len = base.words[i]?.word.length ?? 0;
          for (const word of shuffle(random, bankOf(base.theme, shape))
            .filter((w) => w.length === len && !onBoard.has(w))
            .slice(0, 8)) {
            const next = swapWord(base, i, word);
            if (trouble(next, p).troubled.size < troubled.size) {
              base = next;
              swapped = true;
              break;
            }
          }
          if (swapped) break;
        }
        if (swapped) continue;
        const next = relay(
          base,
          new Set(shuffle(random, [...troubled]).slice(0, 4)),
          seed * 31 + round,
          shape,
        );
        if (next) base = next;
      }
      return why.no('words still traced more than one way');
    }) ?? null
  );

  /** A board's twists put back on a swapped board (the same squares; the code keeps its letters). */
  function reuse(b: Panel, from: Panel): Panel {
    const q: Panel = { ...b };
    if (from.dark) q.dark = from.dark;
    if (from.code) q.code = from.code;
    if (from.colours) q.colours = from.colours;
    if (from.bows) q.bows = from.bows;
    if (from.eggs) q.eggs = from.eggs;
    if (from.walls) q.walls = from.walls;
    return q;
  }

  /** Put the twists on a laid board. */
  function twist(laid: Panel, random: Rng): Panel | null {
    let p: Panel = { ...laid };
    if (on.has('colours')) {
      // Red, white and blue: touching words differ; every coloured word gets a bow on one letter.
      const owner = new Map<string, number>();
      p.words.forEach((w, i) => w.cells.forEach((s) => owner.set(key(s), i)));
      const near = p.words.map((w, i) => {
        const out = new Set<number>();
        for (const [r, c] of w.cells)
          for (const t of [
            [r + 1, c],
            [r - 1, c],
            [r, c + 1],
            [r, c - 1],
          ] as Spot[]) {
            const j = owner.get(key(t));
            if (j !== undefined && j !== i) out.add(j);
          }
        return out;
      });
      const tone: (string | null)[] = p.words.map(() => null);
      for (const i of shuffle(
        random,
        p.words.map((_, i) => i),
      )) {
        const used = new Set([...(near[i] ?? [])].map((j) => tone[j]));
        tone[i] = shuffle(random, ['r', 'b']).find((c) => !used.has(c)) ?? null;
      }
      const colours = p.rows.map((row) => [...row].map(() => '.'));
      const bows: Spot[] = [];
      p.words.forEach((w, i) => {
        const t = tone[i];
        if (!t) return;
        for (const [r, c] of w.cells) (colours[r] as string[])[c] = t;
        const s = w.cells[Math.floor(random() * w.cells.length)];
        if (s) bows.push(s);
      });
      p = { ...p, colours: colours.map((r) => r.join('')), bows };
    }
    // Hiding clues: added one at a time, kept only while no word gains a way to lie.
    const load = (q: Panel): number =>
      framedOptions(q, { noCode: true }, budget).reduce((n, o) => n + o.length, 0);
    if (on.has('dark')) {
      const dark: Spot[] = [];
      let before = load(p);
      for (const w of shuffle(random, p.words)) {
        if (dark.length >= shape.dark) break;
        for (const s of shuffle(random, w.cells.slice(1, -1))) {
          const next = { ...p, dark: [...dark, s] };
          const after = load(next);
          if (after > before) continue;
          dark.push(s);
          before = after;
          break;
        }
      }
      if (dark.length < Math.min(2, shape.dark)) return why.no('no letter can go dark safely');
      p = { ...p, dark };
    }
    if (on.has('letters')) {
      // Code letters that appear more than once, so a number does work across words.
      const counts = new Map<string, number>();
      for (const ch of p.rows.join('')) counts.set(ch, (counts.get(ch) ?? 0) + 1);
      const code: string[] = [];
      let before = load(p);
      for (const ch of shuffle(
        random,
        [...counts].filter(([, n]) => n >= 2).map(([c]) => c),
      )) {
        if (code.length >= shape.code) break;
        const next = { ...p, code: [...code, ch].join('') };
        const after = load(next);
        if (after > before) continue;
        code.push(ch);
        before = after;
      }
      if (code.length < 2) return why.no('no two letters can be coded safely');
      p = { ...p, code: code.join('') };
    }
    if (on.has('cuts')) {
      // Fences on edges no word steps across, next to squares another way to lie uses;
      // each kept while it rules ways out, then the spare ones dropped.
      const H = p.rows.length;
      const W = p.rows[0]?.length ?? 0;
      const stepped = new Set(
        p.words.flatMap((w) => w.cells.slice(1).map((s, i) => edge(w.cells[i] as Spot, s))),
      );
      const truth = new Set(p.words.map((w) => w.cells.map(key).sort().join(' ')));
      const strays = new Set(
        framedOptions(p, { noCode: true }, budget).flatMap((ways) =>
          ways.length > 1
            ? ways.filter((o) => !truth.has(o.cells.join(' '))).flatMap((o) => o.cells)
            : [],
        ),
      );
      const candidates: Wall[] = [];
      for (let r = 0; r < H; r++)
        for (let c = 0; c < W; c++)
          for (const [side, t] of [
            ['v', [r, c + 1]],
            ['h', [r + 1, c]],
          ] as ['v' | 'h', Spot][]) {
            if (t[0] >= H || t[1] >= W || stepped.has(edge([r, c], t))) continue;
            if (strays.has(key([r, c])) || strays.has(key(t))) candidates.push([r, c, side]);
          }
      let walls: Wall[] = [];
      let before = load(p);
      for (const wall of shuffle(random, candidates)) {
        if (eachWordOnce({ ...p, walls }, {}, budget)) break;
        const after = load({ ...p, walls: [...walls, wall] });
        if (after < before) {
          walls.push(wall);
          before = after;
        }
      }
      for (const wall of shuffle(random, [...walls])) {
        const fewer = walls.filter((x) => x !== wall);
        if (fewer.length && load({ ...p, walls: fewer }) === before) walls = fewer;
      }
      if (walls.length) p = { ...p, walls };
    }
    if (on.has('eggs')) {
      // Eggs on letters whose word could otherwise be traced another way (each then settles it).
      const eggs: Spot[] = [];
      for (const w of p.words) {
        if (options({ ...p, eggs }, w.word, {}, budget).length <= 1) continue;
        for (const s of shuffle(random, w.cells)) {
          const next = [...eggs, s];
          if (
            options({ ...p, eggs: next }, w.word, {}, budget).length <
            options({ ...p, eggs }, w.word, {}, budget).length
          ) {
            eggs.push(s);
            if (options({ ...p, eggs }, w.word, {}, budget).length <= 1) break;
          }
        }
      }
      p = { ...p, eggs };
    }
    return p;
  }

  function finish(p: Panel): Made<Panel> | null {
    const missing = spec.twists.filter((t) => !twistsOf(p).includes(t));
    if (missing.length) return why.no(`${missing[0]} left no clue`);
    const bad = problems(p, shape.margin);
    if (bad.length) return why.no(`check: ${(bad[0] ?? '').replace(/[0-9,]+/g, '#')}`);
    const steps = new Budget();
    answers(p, 2, {}, steps);
    return { panel: p, seed, stats: { words: p.words.length, steps: steps.used } };
  }
}

/** Up to `count` different panels for a spec, trying seeds from `from` for at most `seconds` in all. */
export function generate(
  spec: Spec<WordTwist>,
  count: number,
  seconds: number,
  from = 1,
  why = new Rejections(),
): Made<Panel>[] {
  const out: Made<Panel>[] = [];
  const deadline = Date.now() + seconds * 1000;
  let seed = from;
  while (out.length < count && Date.now() < deadline) {
    const left = (deadline - Date.now()) / 1000;
    const found = trySeeds(seed, left, (s) => makePanel(spec, s, why));
    if (!found) break;
    if (!out.some((m) => m.panel.rows.join('/') === found.result.panel.rows.join('/')))
      out.push(found.result);
    seed = found.seed + 1;
  }
  return out;
}
