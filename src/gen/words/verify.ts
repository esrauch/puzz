/**
 * The checks every generated Words panel must pass, shared by the generator
 * and the tests: the words fill the grid, every word can be traced only one
 * way (as the player sees the board, so a found word is always the right
 * one), each clue-adding twist does work by a margin, and nothing feels
 * pointless.
 */
import { Budget } from '../core/budget';
import { type Panel, key, wellFormed } from './model';
import { type Without, answers, framedOptions, truthOf } from './solve';

export type WordTwist = 'dark' | 'letters' | 'colours' | 'eggs' | 'cuts' | 'snow';
export const WORD_TWISTS: readonly WordTwist[] = [
  'dark',
  'letters',
  'colours',
  'eggs',
  'cuts',
  'snow',
];

/** Which twists a panel carries. */
export function twistsOf(p: Panel): WordTwist[] {
  const on: WordTwist[] = [];
  if (p.dark?.length) on.push('dark');
  if (p.code) on.push('letters');
  if (p.bows?.length) on.push('colours');
  if (p.eggs?.length) on.push('eggs');
  if (p.walls?.length) on.push('cuts');
  if (p.frame) on.push('snow');
  return on;
}

/** The rule that leaves one clue-adding twist out. */
const leaveOut: Partial<Record<WordTwist, Without>> = {
  eggs: { noEggs: true },
  colours: { noBows: true },
  cuts: { noWalls: true },
  snow: { noSnow: true },
};

/**
 * Does every word have exactly one way to lie, as the player traces it? Coded
 * letters count as known here (the key fills in as words are found); the
 * whole-board answer is checked with the code unknown.
 */
export function eachWordOnce(p: Panel, rules: Without = {}, budget = new Budget()): boolean {
  return framedOptions(p, { ...rules, noCode: true }, budget).every((o) => o.length === 1);
}

/** Problems with a panel (empty when it's good). */
export function problems(p: Panel, margin: number, budget = new Budget(4_000_000)): string[] {
  const out: string[] = [];
  if (!wellFormed(p)) out.push("the words don't fill the grid");
  const found = answers(p, 2, {}, budget);
  if (found.length !== 1 || found[0]?.join('|') !== truthOf(p).join('|'))
    out.push(`${found.length} answers, not just the true one`);
  if (!eachWordOnce(p, {}, budget)) out.push('a word can be traced more than one way');
  // Each clue-adding twist does work: without it, at least `margin` words could be
  // traced more than one way. (Whole-board answers hardly ever differ in Words:
  // the work a twist does is settling which way a word lies.)
  for (const twist of twistsOf(p)) {
    const rules = leaveOut[twist];
    if (!rules) continue; // the dark and the code hide clues: nothing to take away
    const loose = framedOptions(p, { ...rules, noCode: true }, budget).filter(
      (o) => o.length > 1,
    ).length;
    if (loose < margin)
      out.push(`without ${twist}, ${loose} words lie more than one way (want ${margin})`);
  }
  // The dark: at most one per word, never its first or last letter.
  for (const w of p.words) {
    const keys = w.cells.map(key);
    const dark = keys.filter((k) => (p.dark ?? []).some((d) => key(d) === k));
    if (dark.length > 1) out.push(`${w.word} has two dark letters`);
    if (dark.some((k) => k === keys[0] || k === keys[keys.length - 1]))
      out.push(`${w.word}'s dark letter is at an end`);
  }
  // The code: at least two letters (one alone is just a hidden given).
  if (p.code !== undefined && p.code.length < 2) out.push('only one coded letter');
  // Red, white and blue: bows in at least two colours.
  if (p.bows) {
    const tones = new Set(p.bows.map(([r, c]) => p.colours?.[r]?.[c]));
    if (tones.size < 2) out.push('the bows use only one colour');
  }
  return out;
}
