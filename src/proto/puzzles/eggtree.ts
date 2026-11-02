/**
 * Easter · Centrepiece: the Egg Tree. The Easter Bunny hops like a chess
 * knight through the tree's branches, hanging an egg on each spot it lands
 * on. Hang an egg on every spot, never landing on one twice: a knight's
 * tour on a tree-shaped board.
 */
import { type Proto, h } from '../kit';

export interface Level {
  name: string;
  /** The tree's shape: '#' a branch spot, '.' empty air. */
  rows: string[];
}

export const LEVELS: Level[] = [
  // A sapling: 16 spots, and a tour can start from any of them.
  { name: 'Sapling', rows: ['..##..', '.####.', '######', '..##..', '..##..'] },
];

export type Spot = [number, number];
const key = ([r, c]: Spot): string => `${r},${c}`;

export function spots(level: Level): Spot[] {
  return level.rows.flatMap((row, r) =>
    [...row].flatMap((ch, c): Spot[] => (ch === '#' ? [[r, c]] : [])),
  );
}

/** A knight's hop: two one way, one across. */
export const hop = (a: Spot, b: Spot): boolean => {
  const dr = Math.abs(a[0] - b[0]);
  const dc = Math.abs(a[1] - b[1]);
  return (dr === 1 && dc === 2) || (dr === 2 && dc === 1);
};

/** The spots the bunny can hop to next from the end of `path` (any spot, to start). */
export function nextHops(level: Level, path: Spot[]): Spot[] {
  const at = path[path.length - 1];
  const taken = new Set(path.map(key));
  return spots(level).filter((s) => !taken.has(key(s)) && (!at || hop(at, s)));
}

/** Every spot has an egg, each reached by a hop from the last. */
export function toured(level: Level, path: Spot[]): boolean {
  const all = spots(level);
  const on = new Set(all.map(key));
  return (
    path.length === all.length &&
    new Set(path.map(key)).size === path.length &&
    path.every((s, i) => on.has(key(s)) && (i === 0 || hop(path[i - 1] as Spot, s)))
  );
}

export const eggtree: Proto = {
  id: 'eggtree',
  title: 'The Egg Tree',
  room: 'Easter',
  kind: 'centrepiece',
  from: "7th Guest's and 11th Hour's knight puzzles (an odd-shaped board hides the knight's paths); twist: a knight's tour, on a tree",
  rules:
    'The Easter Bunny hops like a chess knight: two spots one way, then one across. Click any spot to start, then click where to hop next (the spots it can reach are marked). The bunny hangs an egg on every spot it lands on, and can never land on an egg. Hang an egg on every spot of the tree. Click the bunny to take back its last hop.',
  mount(host, ctx) {
    const level = LEVELS[0] as Level;
    const total = spots(level).length;
    const path: Spot[] = [];
    const view = h('div', {});
    const render = (): void => {
      const reach = new Set(nextHops(level, path).map(key));
      const grid = h('div', {
        style: {
          display: 'grid',
          gridTemplateColumns: `repeat(${level.rows[0]?.length ?? 0}, 48px)`,
          gap: '4px',
          width: 'fit-content',
        },
      });
      level.rows.forEach((row, r) => {
        [...row].forEach((ch, c) => {
          if (ch !== '#') {
            grid.append(h('div', {}));
            return;
          }
          const k = key([r, c]);
          const n = path.findIndex((s) => key(s) === k);
          const bunny = n >= 0 && n === path.length - 1;
          const canHop = path.length > 0 && reach.has(k);
          grid.append(
            h(
              'button',
              {
                style: {
                  width: '48px',
                  height: '48px',
                  padding: '0',
                  fontSize: bunny ? '24px' : '15px',
                  background: bunny
                    ? '#ffd54f'
                    : n >= 0
                      ? '#f8c8dc'
                      : canHop
                        ? '#c8ecc0'
                        : '#e9f5e4',
                  outline: canHop ? '2px dashed #5a9a4a' : 'none',
                },
                onclick: () => {
                  if (bunny) path.pop();
                  else if (n < 0 && reach.has(k)) path.push([r, c]);
                  render();
                },
              },
              bunny ? '🐇' : n >= 0 ? String(n + 1) : '',
            ),
          );
        });
      });
      view.replaceChildren(grid);
      if (toured(level, path)) ctx.solved();
      else if (path.length && !reach.size)
        ctx.status(
          `${path.length} of ${total} eggs · stuck, no hops left (click the bunny to take one back)`,
        );
      else ctx.status(path.length ? `${path.length} of ${total} eggs` : 'Click a spot to start');
    };
    host.append(view);
    render();
  },
};
