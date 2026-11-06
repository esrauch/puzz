/** Random carvings: the grid cut into rectangles, laid row by row; and colours for them. */
import { type Rng, rng, shuffle } from '../core/rng';
import { type Colour, type Rect, touching } from './model';

export interface CarveOptions {
  width: number;
  height: number;
  seed: number;
  /** Portion sizes allowed. */
  minArea?: number;
  maxArea?: number;
}

/**
 * A random carving of the grid into portions, favouring varied areas and
 * interlocking (non-guillotine) layouts without full-board cut lines.
 */
export function carve(o: CarveOptions): Rect[] | null {
  const random = rng(o.seed);
  const H = o.height;
  const W = o.width;
  const minA = o.minArea ?? 1;
  const maxA = o.maxArea ?? 9;

  const hasFullSeam = (rects: Rect[]): boolean => {
    for (let r = 1; r < H; r++) {
      if (!rects.some((x) => x.r < r && x.r + x.h > r)) return true;
    }
    for (let c = 1; c < W; c++) {
      if (!rects.some((x) => x.c < c && x.c + x.w > c)) return true;
    }
    return false;
  };

  let fallback: Rect[] | null = null;
  for (let attempt = 0; attempt < 6; attempt++) {
    const taken = Array.from({ length: H }, () => Array<boolean>(W).fill(false));
    const rects: Rect[] = [];
    const areaCounts = new Map<number, number>();
    let ok = true;

    for (let at = 0; at < W * H; at++) {
      const r = Math.floor(at / W);
      const c = at % W;
      if (taken[r]?.[c]) continue;
      const shapes: { rect: Rect; weight: number }[] = [];
      for (let h = 1; r + h <= H; h++)
        for (let w = 1; c + w <= W; w++) {
          const area = h * w;
          if (area < minA || area > maxA) continue;
          let free = true;
          for (let i = r; i < r + h && free; i++)
            for (let j = c; j < c + w && free; j++) if (taken[i]?.[j]) free = false;
          if (free) {
            // Favour 2D blocks over thin strips and penalize already-common portion sizes
            const blockBonus = h > 1 && w > 1 ? 1.4 : 1;
            const variety = 1 / (1 + (areaCounts.get(area) ?? 0));
            shapes.push({ rect: { r, c, h, w }, weight: blockBonus * variety });
          }
        }
      if (!shapes.length) {
        ok = false;
        break;
      }
      const totalWeight = shapes.reduce((s, x) => s + x.weight, 0);
      let roll = random() * totalWeight;
      let picked = shapes[shapes.length - 1]?.rect as Rect;
      for (const item of shapes) {
        roll -= item.weight;
        if (roll <= 0) {
          picked = item.rect;
          break;
        }
      }
      for (let i = picked.r; i < picked.r + picked.h; i++)
        for (let j = picked.c; j < picked.c + picked.w; j++) (taken[i] as boolean[])[j] = true;
      rects.push(picked);
      const a = picked.h * picked.w;
      areaCounts.set(a, (areaCounts.get(a) ?? 0) + 1);
    }

    if (!ok) continue;
    if (!hasFullSeam(rects)) return rects;
    if (!fallback) fallback = rects;
  }
  return fallback;
}

/**
 * Red, white and blue: a colour for each portion (red or blue) so that touching
 * portions differ, portions taken in a random order; a portion whose
 * neighbours already use both stays plain (white, which touches anything).
 */
export function colourCarving(rects: Rect[], random: Rng): (Colour | null)[] {
  const colour: (Colour | null)[] = rects.map(() => null);
  for (const i of shuffle(
    random,
    rects.map((_, i) => i),
  )) {
    const x = rects[i] as Rect;
    const used = new Set(
      rects.flatMap((y, j) => (j !== i && touching(x, y) && colour[j] ? [colour[j]] : [])),
    );
    colour[i] = shuffle(random, ['r', 'b'] as const).find((c) => !used.has(c)) ?? null;
  }
  // If the portion graph happened to be 2-colourable with zero white portions,
  // promote one frontier portion (touching both 'r' and 'b') to white when possible.
  if (!colour.some((c) => c === null)) {
    const frontier = shuffle(
      random,
      rects.map((_, i) => i),
    ).find((i) => {
      const x = rects[i] as Rect;
      const tones = new Set(
        rects.flatMap((y, j) => (j !== i && touching(x, y) && colour[j] ? [colour[j]] : [])),
      );
      const remR = colour.filter((c, j) => j !== i && c === 'r').length;
      const remB = colour.filter((c, j) => j !== i && c === 'b').length;
      return tones.has('r') && tones.has('b') && remR >= 1 && remB >= 1;
    });
    if (frontier !== undefined) colour[frontier] = null;
  }
  return colour;
}
