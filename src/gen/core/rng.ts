/**
 * Seeded random numbers, so every generated panel can be made again from its
 * seed: the game's one RNG (src/sim/rng.ts, mulberry32), as a plain function.
 */
import { createRng } from '../../sim/rng';

export type Rng = () => number;

export const rng = (seed: number): Rng => createRng(seed).next;

/** A random element (undefined for an empty list). */
export const pick = <T>(random: Rng, xs: readonly T[]): T | undefined =>
  xs[Math.floor(random() * xs.length)];

/** A shuffled copy. */
export function shuffle<T>(random: Rng, xs: readonly T[]): T[] {
  const out = [...xs];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j] as T, out[i] as T];
  }
  return out;
}
