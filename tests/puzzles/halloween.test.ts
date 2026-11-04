import { describe, expect, it } from 'vitest';
import { type Panel, countSolutions, parse } from '../../src/gen/webs';
import {
  CHOCOLATES,
  MESSAGES,
  SPIDER,
  STAR,
  WARMUP,
  message,
} from '../../src/proto/puzzles/halloween';

const count = (p: Panel, limit = 2): number => countSolutions(parse(p), limit);
const noColours = (p: Panel): Panel => {
  const q = { ...p };
  delete q.colours;
  return q;
};
const lettersDark = (p: Panel): Panel => ({
  ...p,
  rows: p.rows.map((r) => r.replace(/[A-Z]/g, '?')),
});

describe('Halloween web run', () => {
  it('every panel has exactly one answer', () => {
    for (const p of [...WARMUP, ...CHOCOLATES, ...STAR, ...SPIDER])
      expect(count(p), p.name).toBe(1);
  }, 120_000);

  it('each warm-up panel needs the rule it teaches', () => {
    const [, , , crossing, oneWeb] = WARMUP as [Panel, Panel, Panel, Panel, Panel];
    expect(countSolutions(parse(crossing), 2, { noCrossing: false })).toBe(2);
    expect(countSolutions(parse(oneWeb), 2, { connected: false })).toBe(2);
  });

  it('the letters and colours matter', () => {
    for (const p of CHOCOLATES) expect(count(lettersDark(p)), p.name).toBe(2);
    expect(count(noColours(STAR[0] as Panel)), 'red and green').toBe(2);
    expect(count(noColours(STAR[1] as Panel), 4), 'string of bulbs').toBe(4);
    const free = { ...(STAR[2] as Panel) };
    delete free.ends;
    expect(count(free, 3), 'plug to star').toBe(3);
  });

  it('each message fills in from its web', () => {
    CHOCOLATES.forEach((p, i) => expect(message(p), p.name).toBe(MESSAGES[i]));
  });
});
