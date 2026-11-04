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

/** Clues that leave exactly one answer (fixed ones first), or null if the candidates can't. */
export function chooseClues<A, C>(o: ChooseOptions<A, C>): Tagged<C>[] | null {
  const fixed = o.fixed ?? [];
  let alive = filter(o.answers, fixed, o.holds);
  const chosen: Tagged<C>[] = [];
  for (const c of shuffle(o.random, o.candidates)) {
    if (alive.length <= 1) break;
    const next = alive.filter((a) => o.holds(c, a));
    if (next.length < alive.length) {
      chosen.push(c);
      alive = next;
    }
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
