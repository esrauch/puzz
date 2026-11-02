/**
 * Easter · Centrepiece: the Egg Tree. Two branches are loops of hanging
 * eggs, crossing at two eggs they share. Turn a loop and its eggs slide
 * round, carrying the shared ones over. Pink on the left loop, yellow on
 * the right, and the Golden Egg at the crown.
 */
import { type Proto, h, rng } from '../kit';

export const LOOP = 12;
/** Slots 0..21: the left loop's 12, then the right loop's 10 of its own. Shared slots: 3 and 5 (left), which the right loop passes through. */
export const LEFT: number[] = Array.from({ length: LOOP }, (_, i) => i);
// The right loop: its own 10 slots (12..21), passing through the left loop's slots 3 and 5.
export const RIGHT: number[] = [12, 13, 14, 15, 3, 16, 5, 17, 18, 19, 20, 21];
export const SHARED = new Set([3, 5]);
export const CROWN = 0;

/** Egg colours: 'p' pink, 'y' yellow, 'g' gold. */
export type Egg = 'p' | 'y' | 'g';

export function solvedTree(): Egg[] {
  const eggs: Egg[] = Array(22).fill('y');
  for (const s of LEFT) eggs[s] = 'p';
  eggs[CROWN] = 'g';
  eggs[5] = 'y'; // the two shared eggs: one of each
  return eggs;
}

/** Turn a loop one step (dir 1: each egg moves to the next slot along). */
export function spin(eggs: Egg[], loop: number[], dir: 1 | -1): Egg[] {
  const out = [...eggs];
  loop.forEach((slot, i) => {
    const to = loop[(i + dir + loop.length) % loop.length] as number;
    out[to] = eggs[slot] as Egg;
  });
  return out;
}

export function sorted(eggs: Egg[]): boolean {
  if (eggs[CROWN] !== 'g') return false;
  const leftOwn = LEFT.filter((s) => !SHARED.has(s));
  const rightOwn = RIGHT.filter((s) => !SHARED.has(s));
  return leftOwn.every((s) => eggs[s] !== 'y') && rightOwn.every((s) => eggs[s] === 'y');
}

export function scrambledTree(seed = 5, turns = 40): Egg[] {
  const random = rng(seed);
  let eggs = solvedTree();
  for (let i = 0; i < turns; i++)
    eggs = spin(eggs, random() < 0.5 ? LEFT : RIGHT, random() < 0.5 ? 1 : -1);
  return eggs;
}

export const eggtree: Proto = {
  id: 'eggtree',
  title: 'The Egg Tree',
  room: 'Easter',
  kind: 'centrepiece',
  from: "Dr. Brain's Word Surge and 7th Guest's House puzzle (rotate rows); twist: two loops that interlock, like Hungarian rings",
  rules:
    'Two loops of eggs share two eggs where they cross. Turn a loop with its arrows: its eggs slide round, carrying the shared ones into the other loop. Make the left loop all pink, the right loop all yellow (the shared eggs can be either), with the Golden Egg at the top of the left loop.',
  mount(host, ctx) {
    let eggs = scrambledTree();
    let moves = 0;
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 440 365');
    svg.setAttribute('width', '440');
    svg.setAttribute('height', '365');
    // Slot positions: the left loop on a circle; the right loop's own slots on a second circle through the shared two.
    const pos = new Map<number, [number, number]>();
    const lc: [number, number] = [150, 150];
    const r = 105;
    LEFT.forEach((s, i) => {
      const a = -Math.PI / 2 + (i / LOOP) * Math.PI * 2;
      pos.set(s, [lc[0] + Math.cos(a) * r, lc[1] + Math.sin(a) * r]);
    });
    const [sx, sy] = pos.get(3) as [number, number];
    const [tx, ty] = pos.get(5) as [number, number];
    // The right circle's centre: same radius, through both shared slots, on the far side from the left one.
    const mx = (sx + tx) / 2;
    const my = (sy + ty) / 2;
    const half = Math.hypot(tx - sx, ty - sy) / 2;
    const away = Math.sqrt(r * r - half * half);
    const nx = (ty - sy) / (2 * half);
    const ny = -(tx - sx) / (2 * half);
    const rc: [number, number] = [mx + nx * away, my + ny * away];
    const a3 = Math.atan2(sy - rc[1], sx - rc[0]);
    RIGHT.forEach((s, i) => {
      if (SHARED.has(s)) return;
      const a = a3 - ((i - RIGHT.indexOf(3)) / LOOP) * Math.PI * 2;
      pos.set(s, [rc[0] + Math.cos(a) * r, rc[1] + Math.sin(a) * r]);
    });
    const fill: Record<Egg, string> = { p: '#f48fb1', y: '#ffd54f', g: '#c9a227' };
    const render = (): void => {
      svg.replaceChildren();
      for (const [cx, cy] of [lc, rc]) {
        const c = document.createElementNS(ns, 'circle');
        Object.entries({ cx, cy, r, fill: 'none', stroke: '#c8bfae', 'stroke-width': 2 }).forEach(
          ([k, v]) => c.setAttribute(k, String(v)),
        );
        svg.append(c);
      }
      eggs.forEach((egg, slot) => {
        const [x, y] = pos.get(slot) as [number, number];
        const e = document.createElementNS(ns, 'ellipse');
        Object.entries({
          cx: x,
          cy: y,
          rx: 12,
          ry: 15,
          fill: fill[egg],
          stroke: slot === CROWN ? '#7a5a00' : '#777',
          'stroke-width': slot === CROWN ? 3 : 1,
        }).forEach(([k, v]) => e.setAttribute(k, String(v)));
        svg.append(e);
      });
      if (sorted(eggs)) ctx.solved();
      else ctx.status(`${moves} turns`);
    };
    const turnBtn = (label: string, loop: number[], dir: 1 | -1): HTMLButtonElement =>
      h('button', { onclick: () => ((eggs = spin(eggs, loop, dir)), moves++, render()) }, label);
    host.append(
      svg,
      h(
        'div',
        { style: { display: 'flex', gap: '8px' } },
        turnBtn('Left loop ⟲', LEFT, -1),
        turnBtn('Left loop ⟳', LEFT, 1),
        turnBtn('Right loop ⟲', RIGHT, -1),
        turnBtn('Right loop ⟳', RIGHT, 1),
      ),
    );
    render();
  },
};
