/**
 * The clicky lights panel: tap a piece to turn it a quarter clockwise
 * (always clockwise; four taps go all the way round). Power spreads from the plug as
 * you turn: every piece it reaches lights up, and a lit wire end that meets
 * nothing sparks red. Numbered eggs glow when the power reaches them in
 * their number of steps; on a pie, each slice shows its servings (wires in
 * from the middle), and a wire across a wall between slices shows red. Solved, the lights turn gold, the star lights, and it chimes.
 */
import { blip } from './kit';
import {
  DIRS,
  E,
  N,
  type Panel,
  STEP,
  type Spot,
  key,
  light,
  parse,
  servings,
  solved,
  startGrid,
  turn,
  W as WEST,
} from './net';

const NS = 'http://www.w3.org/2000/svg';
const WIRE = { r: '#ff6b6b', g: '#5fd27a', w: '#ffe08a' };
const DIM = { r: '#6e3a44', g: '#2f5a43', w: '#55607a' };

export interface LightsHooks {
  solved(): void;
  status(text: string): void;
}

/** A panel with a tree-top star to light when it's solved (decoration). */
export type LightsPanel = Panel & { star?: Spot };

export function mountLights(host: HTMLElement, panel: LightsPanel, hooks: LightsHooks): void {
  const b = parse(panel);
  const grid = startGrid(panel);
  const avail = Math.min(host.clientWidth || 360, 560);
  const cell = Math.max(30, Math.min(64, Math.floor((avail - 8) / b.width)));
  const W = b.width * cell;
  const H = b.height * cell;
  if (b.servings) {
    const recipe = document.createElement('div');
    recipe.textContent =
      'Each slice gets exactly one wire from the middle. No wire may cross a thick crust line.';
    Object.assign(recipe.style, { fontSize: '17px', margin: '0 0 8px', fontWeight: '600' });
    host.append(recipe);
  }
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', String(W));
  svg.setAttribute('height', String(H));
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  Object.assign(svg.style, { touchAction: 'none', userSelect: 'none', display: 'block' });
  host.append(svg);
  let done = false;

  // Every tap turns the piece under it a quarter clockwise, at once (on the
  // press, so it feels instant). Always the same way: four taps go all round.
  svg.addEventListener('pointerdown', (e) => {
    if (done) return;
    e.preventDefault();
    const box = svg.getBoundingClientRect();
    const r = Math.floor(((e.clientY - box.top) * H) / box.height / cell);
    const c = Math.floor(((e.clientX - box.left) * W) / box.width / cell);
    if (!b.inside(r, c)) return;
    const row = grid[r] as number[];
    row[c] = turn(row[c] ?? 0);
    blip(520, 30, 6);
    settle();
  });

  const settle = (): void => {
    if (solved(b, grid)) {
      done = true;
      [660, 880, 1100, 1320].forEach((f, i) => setTimeout(() => blip(f, 150), i * 110));
      navigator.vibrate?.([20, 40, 20]);
      render();
      hooks.solved();
    } else render();
  };

  const render = (): void => {
    svg.replaceChildren();
    const add = (
      tag: string,
      attrs: Record<string, string | number>,
      text?: string,
    ): SVGElement => {
      const el = document.createElementNS(NS, tag);
      for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
      if (text !== undefined) el.textContent = text;
      svg.append(el);
      return el;
    };
    const { dist, string, loose } = light(b, grid);
    const sparks = new Set(loose.map(([r, c, d]) => `${key(r, c)}:${d}`));
    const { feeds, walls } = b.servings
      ? servings(b, grid)
      : { feeds: new Map<string, number>(), walls: [] };
    const crossing = new Set(walls.map(([r, c, d]) => `${key(r, c)}:${d}`));
    // A wire across a wall shows red from both sides.
    for (const [r, c, d] of walls) {
      const [dr, dc] = STEP[d] as Spot;
      crossing.add(`${key(r + dr, c + dc)}:${d === E ? WEST : N}`);
    }
    const plugTone = (r: number, c: number): string | undefined =>
      r === b.plug[0] && c === b.plug[1]
        ? WIRE[b.greenPlug ? 'r' : 'w']
        : b.greenPlug && r === b.greenPlug[0] && c === b.greenPlug[1]
          ? WIRE.g
          : undefined;
    // Squares.
    for (let r = 0; r < b.height; r++)
      for (let c = 0; c < b.width; c++) {
        if (!b.inside(r, c)) continue;
        const s = b.slice(r, c);
        // The pie: slices in two crust browns, the middle (the serving dish) lighter.
        const shade =
          s === '*' ? '#5a4a3a' : s ? (s.charCodeAt(0) % 2 ? '#3a2a22' : '#2e2420') : '#1f2636';
        add('rect', {
          x: c * cell + 1,
          y: r * cell + 1,
          width: cell - 2,
          height: cell - 2,
          rx: 6,
          fill: shade,
          // The plug's square is ringed in its string's colour.
          stroke: plugTone(r, c) ?? 'none',
          'stroke-width': plugTone(r, c) ? 3 : 1.5,
        });
      }
    // Slice walls (solid gold), and the middle's edge (dashed: a slice's serving comes in across it).
    if (b.servings)
      for (let r = 0; r < b.height; r++)
        for (let c = 0; c < b.width; c++) {
          const s = b.slice(r, c);
          if (s === undefined) continue;
          for (const [r2, c2, x1, y1, x2, y2] of [
            [r, c + 1, (c + 1) * cell, r * cell, (c + 1) * cell, (r + 1) * cell],
            [r + 1, c, c * cell, (r + 1) * cell, (c + 1) * cell, (r + 1) * cell],
          ] as const) {
            const t = b.slice(r2, c2);
            if (t === undefined || t === s) continue;
            const middle = s === '*' || t === '*';
            add('line', {
              x1,
              y1,
              x2,
              y2,
              stroke: middle ? '#f0d9a8' : '#e0a040',
              'stroke-width': middle ? 2 : 7,
              'stroke-dasharray': middle ? '2 5' : '',
              'stroke-linecap': 'round',
            });
          }
        }
    // Wires and bulbs.
    grid.forEach((row, r) =>
      row.forEach((m, c) => {
        if (m < 0) return;
        const lit = dist.has(key(r, c));
        const own = b.colour(r, c);
        // A white light (on a red-and-green board) takes the colour of the string that reaches it.
        const white = b.greenPlug !== undefined && !own;
        const reached = string.get(key(r, c));
        const tone = own ?? (white && lit && reached ? reached : 'w');
        const colour = done ? '#ffd54f' : lit ? WIRE[tone] : DIM[tone];
        const wrongString = lit && own !== undefined && reached !== undefined && reached !== own;
        const across = (d: number): boolean => crossing.has(`${key(r, c)}:${d}`);
        const cx = c * cell + cell / 2;
        const cy = r * cell + cell / 2;
        let arms = 0;
        for (const d of DIRS) {
          if (!(m & d)) continue;
          arms++;
          const [dr, dc] = STEP[d] as Spot;
          add('line', {
            x1: cx,
            y1: cy,
            x2: cx + (dc * cell) / 2,
            y2: cy + (dr * cell) / 2,
            stroke: across(d) ? '#ff3b30' : colour,
            'stroke-width': cell * 0.14,
            'stroke-linecap': 'round',
          });
          if (lit && sparks.has(`${key(r, c)}:${d}`))
            add('circle', {
              cx: cx + dc * cell * 0.42,
              cy: cy + dr * cell * 0.42,
              r: cell * 0.1,
              fill: '#ff3b30',
            });
        }
        if (arms === 1)
          add('circle', {
            cx,
            cy,
            r: cell * 0.2,
            fill: lit || done ? colour : '#2a3142',
            stroke: white ? '#ffffff' : colour,
            'stroke-width': white ? 3 : 2,
          });
        else
          add('circle', {
            cx,
            cy,
            r: cell * (white ? 0.13 : 0.09),
            fill: white ? '#ffffff' : colour,
          });
        // A red or green light on the other string: ringed in orange.
        if (wrongString)
          add('circle', {
            cx,
            cy,
            r: cell * 0.3,
            fill: 'none',
            stroke: '#ff9f1a',
            'stroke-width': 3,
          });
      }),
    );
    // Plugs, eggs, the star and the slice counts.
    const plugs: [Spot, keyof typeof WIRE][] = [[b.plug, b.greenPlug ? 'r' : 'w']];
    if (b.greenPlug) plugs.push([b.greenPlug, 'g']);
    for (const [[r, c], tone] of plugs) {
      add('circle', {
        cx: c * cell + cell * 0.2,
        cy: r * cell + cell * 0.8,
        r: cell * 0.16,
        fill: WIRE[tone],
      });
      add(
        'text',
        {
          x: c * cell + cell * 0.2,
          y: r * cell + cell * 0.86,
          'text-anchor': 'middle',
          'font-size': cell * 0.2,
        },
        '🔌',
      );
    }
    for (const [r, c, n] of b.eggs) {
      const reached = dist.get(key(r, c));
      const fill = reached === undefined ? '#fff6dc' : reached === n ? '#7ed37e' : '#ff8a80';
      add('ellipse', {
        cx: c * cell + cell * 0.75,
        cy: r * cell + cell * 0.27,
        rx: cell * 0.2,
        ry: cell * 0.25,
        fill,
        stroke: '#c9a227',
        'stroke-width': 2,
      });
      add(
        'text',
        {
          x: c * cell + cell * 0.75,
          y: r * cell + cell * 0.35,
          'text-anchor': 'middle',
          'font-size': cell * 0.22,
          'font-weight': 700,
          fill: '#3a2f25',
        },
        String(n),
      );
    }
    if (panel.star) {
      const [r, c] = panel.star;
      add(
        'text',
        {
          x: c * cell + cell / 2,
          y: r * cell + cell * 0.36,
          'text-anchor': 'middle',
          'font-size': cell * 0.5,
          fill: done ? '#ffd54f' : '#77705a',
        },
        '★',
      );
    }
    // Each slice's servings so far, by its middle square: green at one, red over.
    if (b.servings) {
      const placed = new Set<string>();
      for (let r = 0; r < b.height; r++)
        for (let c = 0; c < b.width; c++) {
          const s = b.slice(r, c);
          if (s === undefined || s === '*' || placed.has(s)) continue;
          placed.add(s);
          const squares: Spot[] = [];
          for (let rr = 0; rr < b.height; rr++)
            for (let cc = 0; cc < b.width; cc++) if (b.slice(rr, cc) === s) squares.push([rr, cc]);
          const [mr, mc] = squares[Math.floor(squares.length / 2)] as Spot;
          const have = feeds.get(s) ?? 0;
          const colour = have === 1 ? '#2f8a45' : have > 1 ? '#d9534f' : '#6b5f52';
          add('rect', {
            x: mc * cell + cell * 0.02,
            y: mr * cell + cell * 0.02,
            width: cell * 0.34,
            height: cell * 0.3,
            rx: 4,
            fill: '#fff',
            stroke: colour,
            'stroke-width': 2,
          });
          add(
            'text',
            {
              x: mc * cell + cell * 0.19,
              y: mr * cell + cell * 0.25,
              'text-anchor': 'middle',
              'font-size': cell * 0.22,
              'font-weight': 700,
              fill: colour,
            },
            String(have),
          );
        }
    }
    let total = 0;
    grid.forEach((row) => row.forEach((m) => (total += m >= 0 ? 1 : 0)));
    let wrongStrings = false;
    for (const [k, tone] of string) {
      const [r, c] = k.split(',').map(Number) as [number, number];
      const own = b.colour(r, c);
      if (own && own !== tone) wrongStrings = true;
    }
    const eggWrong = b.eggs.some(([r, c, n]) => dist.has(key(r, c)) && dist.get(key(r, c)) !== n);
    hooks.status(
      done
        ? 'Lit!'
        : dist.size === total && !loose.length
          ? eggWrong
            ? 'Everything’s lit, but an egg is the wrong number of steps from the plug'
            : wrongStrings
              ? 'Everything’s lit, but a light is on the wrong-coloured string'
              : walls.length
                ? 'Everything’s lit, but a wire crosses between two slices'
                : 'Everything’s lit, but a slice gets more than one serving'
          : `${dist.size} of ${total} lit`,
    );
  };
  render();
}
