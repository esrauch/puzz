/**
 * The clicky web panel: drag from a knot towards another to spin a thread
 * (again for a double, a third time to cut it), or tap a thread to cut it.
 * (Tapping one knot then another works too.) The panel checks as you go:
 * a knot glows when its count is right and flashes red when over; a refused
 * thread (crossing, or two bulbs of a colour) flashes what's in the way;
 * when every count is met but the web's in pieces, the pieces show in
 * different colours. Solved, the web turns gold and chimes.
 */
import {
  type Knot,
  type Link,
  type Panel,
  type Web,
  letterValues,
  neighbours,
  parse,
  pieces,
  solved,
  totals,
  distances,
  threadsAlong,
} from './hashi';
import { blip } from './kit';

const NS = 'http://www.w3.org/2000/svg';
const PIECE_COLOURS = ['#e8e4f0', '#8fd3ff', '#ffb36b', '#c79bff', '#7fe0a8', '#ff8fb6'];

export interface BoardHooks {
  solved(web: Web, threads: number[]): void;
  status(text: string): void;
}

export function mountWeb(host: HTMLElement, panel: Panel, hooks: BoardHooks): void {
  const web = parse(panel);
  const threads = web.links.map(() => 0);
  const avail = Math.min(host.clientWidth || 360, 560);
  const flagged = [...web.rowFlags, ...web.colFlags].some((f) => f !== null);
  const cell = Math.max(
    34,
    Math.min(60, Math.floor((avail - 8) / (web.width + (flagged ? 0.8 : 0)))),
  );
  const pad = flagged ? cell * 0.8 : 0;
  const W = web.width * cell + pad;
  const H = web.height * cell + pad;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', String(W));
  svg.setAttribute('height', String(H));
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  Object.assign(svg.style, {
    background: '#2b2a33',
    borderRadius: '10px',
    touchAction: 'none',
    userSelect: 'none',
    display: 'block',
  });
  if (web.home !== undefined && web.eggs.length) {
    const legend = document.createElement('div');
    legend.textContent =
      '🕷 is home. An egg’s number is how many threads it takes to reach it from home.';
    Object.assign(legend.style, { fontSize: '16px', fontWeight: '600', margin: '0 0 8px' });
    host.append(legend);
  }
  host.append(svg);
  const centre = (k: Knot): [number, number] => [k.c * cell + cell / 2, k.r * cell + cell / 2];
  const flashing = new Set<string>(); // 'k3', 'l5': things to flash red briefly
  let picked: number | null = null;
  let drag: { from: number; x: number; y: number } | null = null;
  let done = false;

  const flash = (keys: string[]): void => {
    keys.forEach((k) => flashing.add(k));
    blip(140, 120, 40);
    render();
    setTimeout(() => {
      keys.forEach((k) => flashing.delete(k));
      render();
    }, 450);
  };

  /** Spin (or add to, or cut) the thread on link i. */
  const pull = (i: number): void => {
    const blocking = (web.crosses[i] ?? []).filter((j) => threads[j]);
    if (!threads[i] && blocking.length) return flash(blocking.map((j) => `l${j}`));
    threads[i] = ((threads[i] ?? 0) + 1) % 3;
    blip(threads[i] ? 520 + 140 * (threads[i] ?? 0) : 260, 50, 8);
    settle();
  };

  /** The knot along a direction from knot k, ignoring colours (to explain a refusal). */
  const lookAlong = (k: number, dr: number, dc: number): number => {
    const from = web.knots[k] as Knot;
    for (
      let r = from.r + dr, c = from.c + dc;
      r >= 0 && r < web.height && c >= 0 && c < web.width;
      r += dr, c += dc
    ) {
      const j = web.knots.findIndex((n) => n.r === r && n.c === c);
      if (j >= 0) return j;
    }
    return -1;
  };

  const dirs = panel.diagonal
    ? [
        [0, 1],
        [1, 0],
        [0, -1],
        [-1, 0],
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ]
    : [
        [0, 1],
        [1, 0],
        [0, -1],
        [-1, 0],
      ];

  const dragTo = (from: number, dx: number, dy: number): void => {
    // The direction nearest the drag.
    let best: number[] = [0, 0];
    let score = -2;
    const len = Math.hypot(dx, dy);
    for (const d of dirs) {
      const s = ((d[1] ?? 0) * dx + (d[0] ?? 0) * dy) / (len * Math.hypot(d[0] ?? 0, d[1] ?? 0));
      if (s > score) {
        score = s;
        best = d;
      }
    }
    if (score < 0.8) return;
    const [dr, dc] = best as [number, number];
    const i = web.links.findIndex((l) => {
      const other = l.a === from ? l.b : l.b === from ? l.a : -1;
      if (other < 0) return false;
      const o = web.knots[other] as Knot;
      const f = web.knots[from] as Knot;
      return Math.sign(o.r - f.r) === dr && Math.sign(o.c - f.c) === dc;
    });
    if (i >= 0) return pull(i);
    const j = lookAlong(from, dr, dc);
    const a = web.knots[from] as Knot;
    const b = web.knots[j];
    if (b && a.colour && a.colour === b.colour) flash([`k${from}`, `k${j}`]);
  };

  const at = (e: PointerEvent): [number, number] => {
    const box = svg.getBoundingClientRect();
    return [((e.clientX - box.left) * W) / box.width, ((e.clientY - box.top) * H) / box.height];
  };
  const knotAt = (x: number, y: number): number =>
    web.knots.findIndex((k) => {
      const [cx, cy] = centre(k);
      return Math.hypot(cx - x, cy - y) < cell * 0.45;
    });
  const linkAt = (x: number, y: number): number =>
    web.links.findIndex((l, i) => {
      if (!threads[i]) return false;
      const [x1, y1] = centre(web.knots[l.a] as Knot);
      const [x2, y2] = centre(web.knots[l.b] as Knot);
      const t = Math.max(
        0,
        Math.min(
          1,
          ((x - x1) * (x2 - x1) + (y - y1) * (y2 - y1)) / ((x2 - x1) ** 2 + (y2 - y1) ** 2),
        ),
      );
      return Math.hypot(x - (x1 + t * (x2 - x1)), y - (y1 + t * (y2 - y1))) < cell * 0.22;
    });

  let rubber: SVGLineElement | null = null;
  svg.addEventListener('pointerdown', (e) => {
    if (done) return;
    const [x, y] = at(e);
    const k = knotAt(x, y);
    if (k >= 0) {
      drag = { from: k, x, y };
      svg.setPointerCapture(e.pointerId);
      return;
    }
    const i = linkAt(x, y);
    if (i >= 0) {
      threads[i] = 0;
      blip(260, 50, 8);
      settle();
    }
  });
  svg.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const [x, y] = at(e);
    const [cx, cy] = centre(web.knots[drag.from] as Knot);
    if (!rubber) {
      rubber = document.createElementNS(NS, 'line');
      Object.entries({
        stroke: '#ffcf6b',
        'stroke-width': 3,
        'stroke-dasharray': '4 5',
        'stroke-linecap': 'round',
      }).forEach(([k, v]) => rubber?.setAttribute(k, String(v)));
      svg.append(rubber);
    }
    rubber.setAttribute('x1', String(cx));
    rubber.setAttribute('y1', String(cy));
    rubber.setAttribute('x2', String(x));
    rubber.setAttribute('y2', String(y));
  });
  const end = (e: PointerEvent): void => {
    if (!drag) return;
    const [x, y] = at(e);
    const from = drag.from;
    drag = null;
    rubber?.remove();
    rubber = null;
    const [cx, cy] = centre(web.knots[from] as Knot);
    if (Math.hypot(x - cx, y - cy) > cell * 0.4) {
      picked = null;
      return dragTo(from, x - cx, y - cy);
    }
    // A tap: pick this knot, or join it to the one picked.
    if (picked !== null && picked !== from) {
      const i = web.links.findIndex(
        (l) => (l.a === picked && l.b === from) || (l.a === from && l.b === picked),
      );
      if (i >= 0) {
        picked = null;
        return pull(i);
      }
    }
    picked = picked === from ? null : from;
    blip(picked === null ? 300 : 440, 30);
    render();
  };
  svg.addEventListener('pointerup', end);
  svg.addEventListener('pointercancel', () => {
    drag = null;
    rubber?.remove();
    rubber = null;
  });

  const settle = (): void => {
    render();
    if (solved(web, threads)) {
      done = true;
      picked = null;
      render();
      [660, 880, 1100].forEach((f, i) => setTimeout(() => blip(f, 160), i * 110));
      navigator.vibrate?.([20, 40, 20]);
      hooks.solved(web, threads);
    }
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
    const t = totals(web, threads);
    const deg = neighbours(web, threads);
    const piece = pieces(web, threads);
    const countsMet = web.knots.every((k, i) =>
      k.clue.kind === 'count' ? t[i] === k.clue.n : (t[i] ?? 0) >= 1,
    );
    const split = countsMet && new Set(piece).size > 1;
    const lettersBad = countsMet && !split && !letterValues(web, threads);
    // Faint dots on the empty squares, so the grid reads.
    for (let r = 0; r < web.height; r++)
      for (let c = 0; c < web.width; c++)
        add('circle', {
          cx: c * cell + cell / 2,
          cy: r * cell + cell / 2,
          r: 1.5,
          fill: '#4a4756',
        });
    // On a broom panel, faint crosses between the dots: threads may run corner to corner.
    if (panel.diagonal)
      for (let r = 1; r < web.height; r++)
        for (let c = 1; c < web.width; c++)
          add(
            'text',
            {
              x: c * cell,
              y: r * cell + 3,
              'text-anchor': 'middle',
              'font-size': 9,
              fill: '#4a4756',
            },
            '✕',
          );
    web.links.forEach((l: Link, i) => {
      const n = threads[i] ?? 0;
      if (!n) return;
      const [x1, y1] = centre(web.knots[l.a] as Knot);
      const [x2, y2] = centre(web.knots[l.b] as Knot);
      const len = Math.hypot(x2 - x1, y2 - y1);
      const [px, py] = [(-(y2 - y1) / len) * 4, ((x2 - x1) / len) * 4];
      const colour = flashing.has(`l${i}`)
        ? '#ff5a4f'
        : done
          ? '#ffd54f'
          : split
            ? (PIECE_COLOURS[(piece[l.a] ?? 0) % PIECE_COLOURS.length] as string)
            : '#e8e4f0';
      for (const o of n === 1 ? [0] : [-1, 1])
        add('line', {
          x1: x1 + px * o,
          y1: y1 + py * o,
          x2: x2 + px * o,
          y2: y2 + py * o,
          stroke: colour,
          'stroke-width': 3,
          'stroke-linecap': 'round',
        });
    });
    const r = cell * 0.34;
    web.knots.forEach((k, i) => {
      const [x, y] = centre(k);
      const have = t[i] ?? 0;
      const over =
        (k.clue.kind === 'count' && have > k.clue.n) ||
        (web.ends !== undefined && (deg[i] ?? 0) > (web.ends.includes(i) ? 1 : 2));
      const met = k.clue.kind === 'count' && have === k.clue.n;
      const bad = over || flashing.has(`k${i}`) || (lettersBad && k.clue.kind === 'letter');
      const fill = k.colour
        ? k.colour === 'r'
          ? '#d9534f'
          : '#43a35c'
        : k.clue.kind === 'dark'
          ? '#4b4859'
          : done || met
            ? '#7ed37e'
            : '#f4f1ea';
      add('circle', {
        cx: x,
        cy: y,
        r,
        fill,
        stroke: bad ? '#ff5a4f' : picked === i ? '#ffcf6b' : met || done ? '#b8ffb0' : '#8a8596',
        'stroke-width': bad || picked === i || met || done ? 4 : 1.5,
      });
      const ink = k.colour || k.clue.kind === 'dark' ? '#fff' : '#23202b';
      const label =
        k.clue.kind === 'count' ? String(k.clue.n) : k.clue.kind === 'letter' ? k.clue.letter : '';
      if (label)
        add(
          'text',
          {
            x,
            y: y + r * 0.42,
            'text-anchor': 'middle',
            'font-size': r * 1.15,
            'font-weight': 700,
            fill: ink,
          },
          label,
        );
      if (k.clue.kind !== 'count' && have)
        add(
          'text',
          {
            x: x + r * 0.95,
            y: y + r * 1.1,
            'text-anchor': 'middle',
            'font-size': r * 0.6,
            fill: '#cfc9da',
          },
          String(have),
        );
      if (web.ends?.[0] === i)
        add(
          'text',
          { x: x - r * 0.9, y: y - r * 0.7, 'font-size': r * 0.9, 'text-anchor': 'middle' },
          '🔌',
        );
      if (web.ends?.[1] === i)
        add(
          'text',
          {
            x: x - r * 0.9,
            y: y - r * 0.7,
            'font-size': r * 0.9,
            'text-anchor': 'middle',
            fill: '#ffd54f',
          },
          '★',
        );
    });
    // The spider's home, numbered eggs (green when the threads put them that far from home), and edge flags.
    if (web.home !== undefined) {
      const [hx, hy] = centre(web.knots[web.home] as Knot);
      add(
        'text',
        { x: hx - r * 0.95, y: hy - r * 0.55, 'font-size': r * 0.9, 'text-anchor': 'middle' },
        '🕷',
      );
    }
    if (web.eggs.length) {
      const d = web.home === undefined ? [] : distances(web, threads, web.home);
      // Count each egg out: the shortest thread path from home to it, each step numbered.
      if (web.home !== undefined)
        for (const [k] of web.eggs) {
          if ((d[k] ?? -1) < 1) continue;
          const path = [k];
          while ((d[path[path.length - 1] as number] ?? 0) > 0) {
            const x = path[path.length - 1] as number;
            const back = (web.incident[x] ?? [])
              .filter((i) => threads[i])
              .map((i) => {
                const l = web.links[i] as Link;
                return l.a === x ? l.b : l.a;
              })
              .find((y) => d[y] === (d[x] ?? 0) - 1);
            if (back === undefined) break;
            path.push(back);
          }
          path.reverse().forEach((x, step) => {
            if (!step) return;
            const [x1, y1] = centre(web.knots[path[step - 1] as number] as Knot);
            const [x2, y2] = centre(web.knots[x] as Knot);
            add('line', {
              x1,
              y1,
              x2,
              y2,
              stroke: '#ffd54f',
              'stroke-width': 2,
              'stroke-dasharray': '3 4',
            });
            add(
              'text',
              {
                x: (x1 + x2) / 2 + 4,
                y: (y1 + y2) / 2 - 4,
                'font-size': r * 0.55,
                'font-weight': 700,
                fill: '#ffd54f',
              },
              String(step),
            );
          });
        }
      for (const [k, n] of web.eggs) {
        const [ex, ey] = centre(web.knots[k] as Knot);
        const at = d[k] ?? -1;
        add('ellipse', {
          cx: ex + r * 0.95,
          cy: ey - r * 0.75,
          rx: r * 0.42,
          ry: r * 0.52,
          fill: at === n ? '#a5d6a7' : at > n ? '#ff8a80' : '#fff6dc',
          stroke: '#c9a227',
          'stroke-width': 1.5,
        });
        add(
          'text',
          {
            x: ex + r * 0.95,
            y: ey - r * 0.6,
            'text-anchor': 'middle',
            'font-size': r * 0.5,
            'font-weight': 700,
            fill: '#4a3a20',
          },
          String(n),
        );
      }
    }
    if (flagged) {
      const along = threadsAlong(web, threads);
      const flag = (f: number | null, have: number, x: number, y: number): void => {
        if (f === null) return;
        const colour = have === f ? '#7ed37e' : have > f ? '#ff5a4f' : '#cfc9da';
        add('rect', {
          x: x - cell * 0.28,
          y: y - cell * 0.2,
          width: cell * 0.56,
          height: cell * 0.4,
          rx: 3,
          fill: '#2b2a33',
          stroke: colour,
          'stroke-width': 2,
        });
        add('rect', {
          x: x - cell * 0.28 + 1,
          y: y - cell * 0.2 + 1,
          width: cell * 0.16,
          height: cell * 0.14,
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
      web.rowFlags.forEach((f, rr) =>
        flag(f, along.rows[rr] ?? 0, web.width * cell + pad / 2, rr * cell + cell / 2),
      );
      web.colFlags.forEach((f, c) =>
        flag(f, along.cols[c] ?? 0, c * cell + cell / 2, web.height * cell + pad / 2),
      );
    }
    hooks.status(
      done
        ? 'Spun!'
        : split
          ? `Every count is met, but the web is in ${new Set(piece).size} pieces`
          : lettersBad
            ? 'The letters don’t add up'
            : '',
    );
  };
  render();
}
