/**
 * Choosing twist clues against a list of answers, in memory.
 *
 * A generator lists the board's answers once (without the clues it's about to
 * add), then each candidate clue is just a test on an answer. Clues are added
 * while they rule answers out, until only the true answer is left, then any
 * clue the rest make unnecessary is dropped. Every clue comes from the true
 * answer, so it always holds there.
 */
import { type Rng, shuffle } from './rng';

/** A clue tagged with the twist it belongs to (eggs, flags, …). */
export interface Tagged<C> {
  twist: string;
  clue: C;
}

export interface ChooseOptions<A, C> {
  /** Every answer of the board without the candidate clues (the true one among them). */
  answers: A[];
  /** Clues already on the board, which the choice must keep. */
  fixed?: Tagged<C>[];
  candidates: Tagged<C>[];
  holds: (clue: Tagged<C>, answer: A) => boolean;
  random: Rng;
  /** Keep clues that aren't strictly needed (as hints): default false. */
  keepSpare?: boolean;
}

const filter = <A, C>(
  answers: A[],
  clues: Tagged<C>[],
  holds: (clue: Tagged<C>, answer: A) => boolean,
): A[] => answers.filter((a) => clues.every((c) => holds(c, a)));

/**
 * Clues that leave exactly one answer (fixed ones first), or null if the candidates can't.
 * Uses a small random tournament to favour high-leverage break-in clues while giving every
 * candidate twist a turn before pruning any redundant clues.
 */
export function chooseClues<A, C>(o: ChooseOptions<A, C>): Tagged<C>[] | null {
  const fixed = o.fixed ?? [];
  let alive = filter(o.answers, fixed, o.holds);
  const chosen: Tagged<C>[] = [];
  const pool = shuffle(o.random, o.candidates);
  const used = new Set<Tagged<C>>();
  const chosenTwists = new Set<string>(fixed.map((f) => f.twist));

  while (alive.length > 1) {
    const helpful: { c: Tagged<C>; next: A[] }[] = [];
    const unrepresented: { c: Tagged<C>; next: A[] }[] = [];
    for (const c of pool) {
      if (used.has(c)) continue;
      const next = alive.filter((a) => o.holds(c, a));
      if (next.length > 0 && next.length < alive.length) {
        const item = { c, next };
        helpful.push(item);
        if (!chosenTwists.has(c.twist)) unrepresented.push(item);
        if (helpful.length >= 12 && unrepresented.length >= 4) break;
      }
    }
    const window = (unrepresented.length > 0 ? unrepresented : helpful).slice(0, 6);
    if (!window.length) break;
    window.sort((x, y) => x.next.length - y.next.length);
    const pick = window[0] as { c: Tagged<C>; next: A[] };
    used.add(pick.c);
    chosen.push(pick.c);
    chosenTwists.add(pick.c.twist);
    alive = pick.next;
  }
  if (alive.length !== 1) return null;
  if (o.keepSpare) return [...fixed, ...chosen];
  let kept = chosen;
  for (const c of shuffle(o.random, chosen)) {
    const without = kept.filter((x) => x !== c);
    if (filter(o.answers, [...fixed, ...without], o.holds).length === 1) kept = without;
  }
  return [...fixed, ...kept];
}

/** For each twist among the clues: how many answers fit without that twist's clues. */
export function margins<A, C>(
  answers: A[],
  clues: Tagged<C>[],
  holds: (clue: Tagged<C>, answer: A) => boolean,
): Map<string, number> {
  const out = new Map<string, number>();
  for (const twist of new Set(clues.map((c) => c.twist)))
    out.set(
      twist,
      filter(
        answers,
        clues.filter((c) => c.twist !== twist),
        holds,
      ).length,
    );
  return out;
}
