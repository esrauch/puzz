/**
 * Snowflakes (Christmas): inside a frame, what's drawn is its own mirror
 * image; outside it, anything goes. Shared by every genre: a genre lists its
 * drawing as grid features (the unit segments its lines cover between
 * neighbouring squares, or the squares it fills), and these helpers mirror
 * them, check them and find frames.
 */

/** A rectangle of squares (inclusive), mirrored across its own middle: 'v' left↔right, 'h' top↔bottom. */
export interface Frame {
  top: number;
  left: number;
  bottom: number;
  right: number;
  axis: 'v' | 'h';
}

/** A unit segment between two neighbouring squares (either order), as a key. */
export const segment = (r1: number, c1: number, r2: number, c2: number): string =>
  r1 < r2 || (r1 === r2 && c1 < c2) ? `s${r1},${c1},${r2},${c2}` : `s${r2},${c2},${r1},${c1}`;

/** A square, as a key (for drawings that fill squares). */
export const square = (r: number, c: number): string => `q${r},${c}`;

export const inFrame = (f: Frame, r: number, c: number): boolean =>
  r >= f.top && r <= f.bottom && c >= f.left && c <= f.right;

/** Where a square lands in the frame's mirror. */
export const mirrorSquare = (f: Frame, r: number, c: number): [number, number] =>
  f.axis === 'v' ? [r, f.left + f.right - c] : [f.top + f.bottom - r, c];

const parts = (key: string): number[] => key.slice(1).split(',').map(Number);

/** Is a feature (segment or square) wholly inside the frame? */
export function inside(f: Frame, key: string): boolean {
  const [r1 = 0, c1 = 0, r2 = r1, c2 = c1] = parts(key);
  return inFrame(f, r1, c1) && inFrame(f, r2, c2);
}

/** A feature's mirror image in the frame. */
export function mirrorKey(f: Frame, key: string): string {
  const [r1 = 0, c1 = 0, r2 = 0, c2 = 0] = parts(key);
  const [a, b] = mirrorSquare(f, r1, c1);
  if (key[0] === 'q') return square(a, b);
  const [x, y] = mirrorSquare(f, r2, c2);
  return segment(a, b, x, y);
}

/** Inside the frame, is every drawn feature's mirror image drawn too? */
export function symmetricIn(f: Frame, drawn: ReadonlySet<string>): boolean {
  for (const key of drawn) if (inside(f, key) && !drawn.has(mirrorKey(f, key))) return false;
  return true;
}

/** Drawn features inside the frame that aren't their own mirror image (the ones that tell you something). */
export function offAxis(f: Frame, drawn: ReadonlySet<string>): number {
  let n = 0;
  for (const key of drawn) if (inside(f, key) && mirrorKey(f, key) !== key) n++;
  return n;
}

/** Every frame on a board at least `min` squares each way, both axes. */
export function frames(width: number, height: number, min = 2): Frame[] {
  const out: Frame[] = [];
  for (let top = 0; top < height; top++)
    for (let bottom = top + min - 1; bottom < height; bottom++)
      for (let left = 0; left < width; left++)
        for (let right = left + min - 1; right < width; right++)
          for (const axis of ['v', 'h'] as const) out.push({ top, left, bottom, right, axis });
  return out;
}

export const area = (f: Frame): number => (f.bottom - f.top + 1) * (f.right - f.left + 1);
