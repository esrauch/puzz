/** A solver that finds a panel's answers (up to a limit, within a budget), by propagation and search. */
import { Budget } from '../core/budget';
import { type Knot, type Link, type Web } from './model';
import { type Rules, pieces, solved } from './rules';

/** Find up to `limit` answers (each a thread count per link). */
export function solve(
  web: Web,
  limit = 2,
  rules: Rules = {},
  budget: Budget = new Budget(),
): number[][] {
  const L = web.links.length;
  const K = web.knots.length;
  const found: number[][] = [];
  const noCrossing = rules.noCrossing !== false;
  const connected = rules.connected !== false;

  /** Tighten `val` (-1 unknown) in place; false if it can't be solved. */
  const propagate = (val: Int8Array): boolean => {
    for (let changed = true; changed;) {
      changed = false;
      // Snowflakes: inside the frame, a segment is drawn exactly when its mirror image is.
      // Drawn: some link over it has threads; empty: every link over it is settled at none.
      for (const [a, b] of web.framePairs) {
        const state = (seg: string): 'yes' | 'no' | 'maybe' => {
          const over = web.segmentLinks.get(seg) ?? [];
          if (over.some((i) => (val[i] ?? 0) > 0)) return 'yes';
          return over.every((i) => val[i] === 0) ? 'no' : 'maybe';
        };
        const x = state(a);
        const y = state(b);
        if ((x === 'yes' && y === 'no') || (x === 'no' && y === 'yes')) return false;
        const empty = x === 'no' && y === 'maybe' ? b : y === 'no' && x === 'maybe' ? a : null;
        if (empty)
          for (const i of web.segmentLinks.get(empty) ?? [])
            if (val[i] === -1) {
              val[i] = 0;
              changed = true;
            }
      }
      if (noCrossing)
        for (let i = 0; i < L; i++)
          if (val[i] === -1 && (web.crosses[i] ?? []).some((j) => (val[j] ?? 0) > 0)) {
            val[i] = 0;
            changed = true;
          }
      const lo = new Array<number>(K).fill(0);
      const freeCap = new Array<number>(K).fill(0);
      const freeCount = new Array<number>(K).fill(0);
      const deg = new Array<number>(K).fill(0);
      web.links.forEach((l, i) => {
        const v = val[i] ?? -1;
        for (const k of [l.a, l.b]) {
          if (v > 0) {
            lo[k] = (lo[k] ?? 0) + v;
            deg[k] = (deg[k] ?? 0) + 1;
          } else if (v === -1) {
            freeCap[k] = (freeCap[k] ?? 0) + 2;
            freeCount[k] = (freeCount[k] ?? 0) + 1;
          }
        }
      });
      // What each knot needs, where it's known: its number, or its letter's value once a knot of that letter is settled.
      const letterVal = new Map<string, number>();
      for (const [k, knot] of web.knots.entries()) {
        if (knot.clue.kind !== 'letter' || freeCount[k] !== 0) continue;
        const v = letterVal.get(knot.clue.letter);
        if (v !== undefined && v !== lo[k]) return false;
        letterVal.set(knot.clue.letter, lo[k] ?? 0);
      }
      if (new Set(letterVal.values()).size !== letterVal.size) return false;
      const need = web.knots.map((knot) =>
        knot.clue.kind === 'count'
          ? knot.clue.n
          : knot.clue.kind === 'letter'
            ? letterVal.get(knot.clue.letter)
            : undefined,
      );
      // Unsettled letters: their knots' ranges must overlap, and not only on a value another letter has.
      const groups = new Map<string, [number, number]>();
      for (const [k, knot] of web.knots.entries()) {
        if (knot.clue.kind !== 'letter' || letterVal.has(knot.clue.letter)) continue;
        const g = groups.get(knot.clue.letter) ?? [1, 99];
        groups.set(knot.clue.letter, [
          Math.max(g[0], lo[k] ?? 0),
          Math.min(g[1], (lo[k] ?? 0) + (freeCap[k] ?? 0)),
        ]);
      }
      const taken = new Set(letterVal.values());
      for (const [lo2, hi] of groups.values()) {
        if (lo2 > hi) return false;
        let open = false;
        for (let v = lo2; v <= hi && !open; v++) open = !taken.has(v);
        if (!open) return false;
      }
      // Each link's capacity: 2, less what a known end still needs.
      const cap = (i: number): number => {
        const l = web.links[i] as Link;
        let c = 2;
        for (const k of [l.a, l.b]) {
          const n = need[k];
          if (n !== undefined) c = Math.min(c, n - (lo[k] ?? 0));
        }
        return Math.max(0, c);
      };
      for (let k = 0; k < K; k++) {
        const free = (web.incident[k] ?? []).filter((i) => val[i] === -1);
        const caps = free.map(cap);
        const room = caps.reduce((s, c) => s + c, 0);
        const n = need[k];
        const have = lo[k] ?? 0;
        if (n !== undefined) {
          if (have > n || have + room < n) return false;
          if (free.length && (have === n || have + room === n)) {
            free.forEach((i, j) => (val[i] = have === n ? 0 : (caps[j] ?? 0)));
            changed = true;
          } else
            free.forEach((i, j) => {
              const c = caps[j] ?? 0;
              const least = n - have - (room - c);
              if (c === 0 || (least > 0 && least === c)) {
                val[i] = c;
                changed = true;
              }
            });
        } else if (K > 1 && have + room < 1) return false;
        if (changed) break;
        if (web.ends) {
          const want = web.ends.includes(k) ? 1 : 2;
          const d = deg[k] ?? 0;
          const open = free.filter((_, j) => (caps[j] ?? 0) > 0).length;
          if (d > want || d + open < want) return false;
          if (d === want && free.length) {
            free.forEach((i) => (val[i] = 0));
            changed = true;
          }
        }
        if (changed) break;
      }
    }
    if (!rules.noFlags && [...web.rowFlags, ...web.colFlags].some((f) => f !== null)) {
      // Each flag: threads already along its line can't pass it, and what's left must still reach it.
      const lo = {
        rows: new Array<number>(web.height).fill(0),
        cols: new Array<number>(web.width).fill(0),
      };
      const hi = {
        rows: new Array<number>(web.height).fill(0),
        cols: new Array<number>(web.width).fill(0),
      };
      web.links.forEach((l, i) => {
        const a = web.knots[l.a] as Knot;
        const b = web.knots[l.b] as Knot;
        const line =
          a.r === b.r ? (['rows', a.r] as const) : a.c === b.c ? (['cols', a.c] as const) : null;
        if (!line) return;
        const v = val[i] ?? -1;
        lo[line[0]][line[1]] = (lo[line[0]][line[1]] ?? 0) + Math.max(v, 0);
        hi[line[0]][line[1]] = (hi[line[0]][line[1]] ?? 0) + (v === -1 ? 2 : v);
      });
      for (const [flags, k] of [
        [web.rowFlags, 'rows'],
        [web.colFlags, 'cols'],
      ] as const)
        for (const [line, f] of flags.entries())
          if (f !== null && ((lo[k][line] ?? 0) > f || (hi[k][line] ?? 0) < f)) return false;
    }
    if (connected) {
      // A finished piece with knots left outside it can never join up.
      const threads = Array.from(val, (v) => Math.max(0, v));
      const piece = pieces(web, threads);
      const open = new Set<number>();
      web.links.forEach((l, i) => {
        if (val[i] === -1) open.add(piece[l.a] ?? -1).add(piece[l.b] ?? -1);
      });
      const all = new Set(piece);
      if (all.size > 1 && [...all].some((p) => !open.has(p))) return false;
    }
    return true;
  };

  const go = (val: Int8Array): void => {
    budget.tick();
    if (found.length >= limit || !propagate(val)) return;
    let pick = -1;
    let best = 99;
    for (let i = 0; i < L; i++) {
      if (val[i] !== -1) continue;
      const l = web.links[i] as Link;
      const free = [l.a, l.b].reduce(
        (s, k) => s + (web.incident[k] ?? []).filter((j) => val[j] === -1).length,
        0,
      );
      if (free < best) {
        best = free;
        pick = i;
      }
    }
    if (pick < 0) {
      const threads = Array.from(val);
      if (solved(web, threads, rules)) found.push(threads);
      return;
    }
    for (const v of [0, 1, 2]) {
      const next = Int8Array.from(val);
      next[pick] = v;
      go(next);
    }
  };
  go(new Int8Array(L).fill(-1));
  return found;
}

export const countSolutions = (
  web: Web,
  limit = 2,
  rules: Rules = {},
  budget: Budget = new Budget(),
): number => solve(web, limit, rules, budget).length;
