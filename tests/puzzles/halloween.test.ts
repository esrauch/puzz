import { describe, expect, it } from 'vitest';
import { type Panel, countSolutions, parse, problems } from '../../src/gen/webs';
import {
  CHOCOLATES,
  MESSAGES,
  SPIDER,
  STAR,
  WARMUP,
  message,
} from '../../src/proto/puzzles/halloween';

const count = (p: Panel, limit = 2): number => countSolutions(parse(p), limit);
const noSnow = (p: Panel): Panel => {
  const q = { ...p };
  delete q.frame;
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
    for (const p of [...CHOCOLATES, ...STAR, ...SPIDER]) expect(problems(p, 2), p.name).toEqual([]);
  }, 120_000);

  it('each warm-up panel needs the rule it teaches', () => {
    const [, , , crossing, oneWeb] = WARMUP as [Panel, Panel, Panel, Panel, Panel];
    expect(countSolutions(parse(crossing), 2, { noCrossing: false })).toBe(2);
    expect(countSolutions(parse(oneWeb), 2, { connected: false })).toBe(2);
  });

  it('the letters and snowflakes matter', () => {
    for (const p of CHOCOLATES) expect(count(lettersDark(p)), p.name).toBe(2);
    for (const p of STAR) expect(count(noSnow(p)), p.name).toBe(2);
  });

  it('each message fills in from its web', () => {
    CHOCOLATES.forEach((p, i) => expect(message(p), p.name).toBe(MESSAGES[i]));
  });
});
