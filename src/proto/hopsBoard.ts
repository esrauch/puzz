/**
 * The clicky bunny-hop panel: drag from the bunny through neighbouring spots
 * to lay its trail (drag back over it to rub it out), or tap a neighbour to
 * hop there; tap the bunny to take a hop back, or an earlier spot to go back
 * to it. If there's an egg marked 1, the bunny starts on it. Each spot shows
 * its number as the bunny lays it; a numbered egg glows when the bunny lands
 * on it on time and turns red if it comes early or is passed by. Flags turn
 * green or red with their line's first visit; portion edges are thick; a
 * burrow pair shares a colour. Solved, the eggs turn gold and chime.
 */
import { blip } from './kit';
import { type Panel, type Spot, firstVisits, key, parse, solved } from './hops';

const NS = 'http://www.w3.org/2000/svg';
const BURROW = ['#8d6e63', '#5c6bc0', '#26a69a'];

export interface HopsHooks {
  solved(): void;
  status(text: string): void;
}

export function mountHops(host: HTMLElement, panel: Panel, hooks: HopsHooks): void {
  const b = parse(panel);
  const H = panel.rows.length;
  const Wd = panel.rows[0]?.length ?? 0;
  const flagged = [...b.rowFlags, ...b.colFlags].some((f) => f !== null);
  const avail = Math.min(host.clientWidth || 360, 520);
  const cell = Math.max(32, Math.min(60, Math.floor((avail - 8) / (Wd + (flagged ? 0.9 : 0)))));
  const pad = flagged ? cell * 0.9 : 0;
  const W = Wd * cell + pad;
  const Hpx = H * cell + pad;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', String(W));
  svg.setAttribute('height', String(Hpx));
  svg.setAttribute('viewBox', `0 0 ${W} ${Hpx}`);
  Object.assign(svg.style, { touchAction: 'none', userSelect: 'none', display: 'block' });
  host.append(svg);
  const start = b.at.get(1);
  const route: number[] = start === undefined ? [] : [start];
  let done = false;

  /** The spot under the pointer (while dragging, only near a spot's middle, so corners don't count). */
  const spotAt = (e: PointerEvent, strict: boolean): number | undefined => {
    const box = svg.getBoundingClientRect();
    const x = ((e.clientX - box.left) * W) / box.width;
    const y = ((e.clientY - box.top) * Hpx) / box.height;
    const r = Math.floor(y / cell);
    const c = Math.floor(x / cell);
    if (strict && Math.hypot(x - (c + 0.5) * cell, y - (r + 0.5) * cell) > cell * 0.42)
      return undefined;
    return b.index.get(key([r, c]));
  };
  const floor = start === undefined ? 0 : 1; // the egg marked 1 stays put
  let dragging = false;
  let moved = false;
  let wasBunny = false;

  // Drag to draw the trail (back over it to rub it out); a tap hops to a neighbour,
  // goes back to an earlier spot, or (on the bunny) takes a hop back.
  svg.addEventListener('pointerdown', (e) => {
    if (done) return;
    const i = spotAt(e, false);
    if (i === undefined) return;
    const at = route.indexOf(i);
    const last = route[route.length - 1];
    wasBunny = i === last;
    moved = false;
    if (at >= 0) route.length = Math.max(floor, at + 1);
    else if (last === undefined || (b.hops[last] ?? []).includes(i)) {
      route.push(i);
      blip(500 + route.length * 12, 30, 6);
    } else {
      blip(150, 80, 25);
      return;
    }
    dragging = true;
    try {
      svg.setPointerCapture(e.pointerId);
    } catch {
      // A synthetic pointer: no capture needed.
    }
    render();
  });
  svg.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const j = spotAt(e, true);
    const last = route[route.length - 1];
    if (j === undefined || j === last) return;
    if (route.length > floor && route[route.length - 2] === j) route.pop();
    else if (last !== undefined && (b.hops[last] ?? []).includes(j) && !route.includes(j))
      route.push(j);
    else return;
    moved = true;
    blip(500 + route.length * 12, 25, 4);
    render();
  });
  const release = (): void => {
    if (!dragging) return;
    dragging = false;
    if (wasBunny && !moved && route.length > floor) {
      route.pop();
      blip(300, 40, 8);
    }
    settle();
  };
  svg.addEventListener('pointerup', release);
  svg.addEventListener('pointercancel', release);

  const settle = (): void => {
    if (solved(b, route)) {
      done = true;
      [660, 880, 1100, 1320].forEach((f, k) => setTimeout(() => blip(f, 150), k * 110));
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
    const centre = ([r, c]: Spot): [number, number] => [c * cell + cell / 2, r * cell + cell / 2];
    const last = route[route.length - 1];
    const reach = new Set(
      last === undefined ? [] : (b.hops[last] ?? []).filter((j) => !route.includes(j)),
    );
    const number = new Map(route.map((i, n) => [i, n + 1]));
    // Lawn squares.
    b.spots.forEach(([r, c]) =>
      add('rect', {
        x: c * cell + 2,
        y: r * cell + 2,
        width: cell - 4,
        height: cell - 4,
        rx: 8,
        fill: '#e3f2d9',
      }),
    );
    // Portion edges.
    b.spots.forEach(([r, c], i) => {
      const mine = b.portion[i];
      if (mine === undefined) return;
      for (const [r2, c2, x1, y1, x2, y2] of [
        [r, c + 1, (c + 1) * cell, r * cell, (c + 1) * cell, (r + 1) * cell],
        [r + 1, c, c * cell, (r + 1) * cell, (c + 1) * cell, (r + 1) * cell],
      ] as const) {
        const j = b.index.get(key([r2, c2]));
        if (j !== undefined && b.portion[j] !== mine)
          add('line', {
            x1,
            y1,
            x2,
            y2,
            stroke: '#b07a2a',
            'stroke-width': 5,
            'stroke-linecap': 'round',
          });
      }
    });
    // The bunny's trail.
    route.forEach((i, n) => {
      if (!n) return;
      const [x1, y1] = centre(b.spots[route[n - 1] as number] as Spot);
      const [x2, y2] = centre(b.spots[i] as Spot);
      const underground = b.burrow.has(`${route[n - 1]},${i}`);
      add('line', {
        x1,
        y1,
        x2,
        y2,
        stroke: done ? '#e0b030' : '#9ccc65',
        'stroke-width': cell * 0.3,
        'stroke-linecap': 'round',
        'stroke-dasharray': underground ? '3 5' : '',
        opacity: 0.8,
      });
    });
    (panel.burrows ?? []).forEach((pair, k) =>
      pair.forEach(([r, c]) =>
        add('circle', {
          cx: c * cell + cell * 0.22,
          cy: r * cell + cell * 0.78,
          r: cell * 0.13,
          fill: BURROW[k % BURROW.length] as string,
        }),
      ),
    );
    b.spots.forEach((s, i) => {
      const [x, y] = centre(s);
      const n = number.get(i);
      const g = b.given.get(i);
      const isBunny = i === last;
      const late = g !== undefined && n === undefined && route.length >= g; // its turn has passed
      const wrong = g !== undefined && n !== undefined && n !== g;
      if (reach.has(i))
        add('circle', {
          cx: x,
          cy: y,
          r: cell * 0.36,
          fill: 'none',
          stroke: '#43a047',
          'stroke-width': 2.5,
          'stroke-dasharray': '4 3',
        });
      if (g !== undefined) {
        const gold = panel.golden && key(panel.golden) === key(s);
        add('ellipse', {
          cx: x,
          cy: y,
          rx: cell * 0.27,
          ry: cell * 0.33,
          fill:
            done || gold ? '#ffd54f' : wrong || late ? '#ff8a80' : n === g ? '#a5d6a7' : '#fffaf0',
          stroke: gold ? '#c9a227' : '#b89a6a',
          'stroke-width': 2,
        });
        add(
          'text',
          {
            x,
            y: y + cell * 0.12,
            'text-anchor': 'middle',
            'font-size': cell * 0.3,
            'font-weight': 700,
            fill: '#4a3a20',
          },
          String(g),
        );
      } else if (n !== undefined)
        add(
          'text',
          {
            x,
            y: y + cell * 0.12,
            'text-anchor': 'middle',
            'font-size': cell * 0.3,
            'font-weight': 700,
            fill: done ? '#a07800' : '#33691e',
          },
          String(n),
        );
      if (isBunny)
        add(
          'text',
          {
            x: x + cell * 0.26,
            y: y - cell * 0.14,
            'text-anchor': 'middle',
            'font-size': cell * 0.32,
          },
          '🐇',
        );
    });
    // Parade flags: green when the line's first visit matches, red when it can't.
    if (flagged) {
      const firsts = firstVisits(b, route);
      const flag = (f: number | null, first: number, x: number, y: number): void => {
        if (f === null) return;
        const colour =
          first === f
            ? '#2f8a45'
            : (first && first !== f) || (!first && route.length >= f)
              ? '#d9534f'
              : '#6b5f52';
        add('rect', {
          x: x - cell * 0.3,
          y: y - cell * 0.22,
          width: cell * 0.6,
          height: cell * 0.44,
          rx: 3,
          fill: '#fff',
          stroke: colour,
          'stroke-width': 2,
        });
        add('rect', {
          x: x - cell * 0.3 + 1,
          y: y - cell * 0.22 + 1,
          width: cell * 0.18,
          height: cell * 0.16,
          fill: '#3c5aa6',
        });
        add(
          'text',
          {
            x: x + cell * 0.05,
            y: y + cell * 0.12,
            'text-anchor': 'middle',
            'font-size': cell * 0.28,
            'font-weight': 700,
            fill: colour,
          },
          String(f),
        );
      };
      b.rowFlags.forEach((f, r) =>
        flag(f, firsts.rows[r] ?? 0, Wd * cell + pad / 2, r * cell + cell / 2),
      );
      b.colFlags.forEach((f, c) =>
        flag(f, firsts.cols[c] ?? 0, c * cell + cell / 2, H * cell + pad / 2),
      );
    }
    hooks.status(
      done
        ? 'All hidden!'
        : route.length && !reach.size
          ? `${route.length} of ${b.spots.length} eggs hidden; no hops left (tap the bunny to go back)`
          : route.length
            ? `${route.length} of ${b.spots.length} eggs hidden`
            : 'Tap a spot to start',
    );
  };
  render();
}
