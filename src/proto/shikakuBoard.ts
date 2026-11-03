/**
 * The clicky carving panel: drag from one square to another to carve the
 * rectangle between them (it replaces any portions it overlaps); tap a
 * portion to lift it off; tap an empty square for a one-square portion.
 * The panel checks as you go: a portion glows green when it's right on its
 * own and shows red when it isn't (two numbers, the wrong size, a dish
 * missing, or touching a portion of its colour); a flag goes green
 * when its line is carved and right, red when it's over. Solved, the board
 * turns gold and chimes.
 */
import {
  type Panel,
  type Rect,
  colourClashes,
  colourOf,
  covers,
  lineCounts,
  parse,
  problem,
  solved,
} from './shikaku';
import { blip } from './kit';

const NS = 'http://www.w3.org/2000/svg';
const DISH: Record<string, string> = { T: '🦃', P: '🥧', C: '🍒' };
const TINT = { r: '#ef9a92', g: '#9fd49a' };
const INK = { r: '#c23b33', g: '#2f8a45' };

export interface CarveHooks {
  solved(): void;
  status(text: string): void;
}

export function mountCarving(host: HTMLElement, panel: Panel, hooks: CarveHooks): void {
  const b = parse(panel);
  const marks = [...b.rowMarks, ...b.colMarks].some((m) => m !== null);
  const avail = Math.min(host.clientWidth || 360, 560);
  const cols = b.width + (marks ? 0.9 : 0);
  const cell = Math.max(34, Math.min(62, Math.floor((avail - 8) / cols)));
  const pad = marks ? cell * 0.9 : 0;
  const W = b.width * cell + pad;
  const H = b.height * cell + pad;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', String(W));
  svg.setAttribute('height', String(H));
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  Object.assign(svg.style, { touchAction: 'none', userSelect: 'none', display: 'block' });
  // Fair shares: the recipe every portion must get, spelled out above the board.
  if (b.dishes.length) {
    const recipe = document.createElement('div');
    recipe.textContent = `Each portion gets: ${b.dishes
      .slice()
      .sort((x, y) => 'TPC'.indexOf(x) - 'TPC'.indexOf(y))
      .map((d) => DISH[d] ?? d)
      .join(' ')}`;
    Object.assign(recipe.style, { fontSize: '18px', margin: '0 0 8px', fontWeight: '600' });
    host.append(recipe);
  }
  host.append(svg);
  let rects: Rect[] = [];
  let drag: { r: number; c: number; to: [number, number] } | null = null;
  let done = false;
  /** A flag being inspected (tapped): its skewer's line is counted out for a moment. */
  let inspect: { row: boolean; i: number } | null = null;
  let inspectTimer = 0;

  const at = (e: PointerEvent): [number, number] | null => {
    const box = svg.getBoundingClientRect();
    const x = ((e.clientX - box.left) * W) / box.width;
    const y = ((e.clientY - box.top) * H) / box.height;
    const r = Math.floor(y / cell);
    const c = Math.floor(x / cell);
    return r >= 0 && r < b.height && c >= 0 && c < b.width ? [r, c] : null;
  };
  const span = (r1: number, c1: number, r2: number, c2: number): Rect => ({
    r: Math.min(r1, r2),
    c: Math.min(c1, c2),
    h: Math.abs(r1 - r2) + 1,
    w: Math.abs(c1 - c2) + 1,
  });
  const overlaps = (x: Rect, y: Rect): boolean =>
    x.r < y.r + y.h && y.r < x.r + x.h && x.c < y.c + y.w && y.c < x.c + x.w;
  const inside = (x: Rect, r: number, c: number): boolean =>
    r >= x.r && r < x.r + x.h && c >= x.c && c < x.c + x.w;

  svg.addEventListener('pointerdown', (e) => {
    if (done) return;
    const p = at(e);
    if (!p) {
      // A tap on a flag counts its skewer's line out.
      const box = svg.getBoundingClientRect();
      const x = ((e.clientX - box.left) * W) / box.width;
      const y = ((e.clientY - box.top) * H) / box.height;
      const r = Math.floor(y / cell);
      const c = Math.floor(x / cell);
      const hit =
        x >= b.width * cell && r < b.height && b.rowMarks[r] != null
          ? { row: true, i: r }
          : y >= b.height * cell && c < b.width && b.colMarks[c] != null
            ? { row: false, i: c }
            : null;
      if (hit) {
        inspect = hit;
        blip(500, 40);
        clearTimeout(inspectTimer);
        inspectTimer = window.setTimeout(() => {
          inspect = null;
          render();
        }, 1800);
        render();
      }
      return;
    }
    drag = { r: p[0], c: p[1], to: p };
    try {
      svg.setPointerCapture(e.pointerId);
    } catch {
      // A synthetic pointer: no capture needed.
    }
    render();
  });
  svg.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const p = at(e);
    if (p && (p[0] !== drag.to[0] || p[1] !== drag.to[1])) {
      drag.to = p;
      blip(700, 15);
      render();
    }
  });
  svg.addEventListener('pointerup', (e) => {
    if (!drag) return;
    const p = at(e) ?? drag.to;
    const { r, c } = drag;
    drag = null;
    if (p[0] === r && p[1] === c) {
      const hit = rects.findIndex((x) => inside(x, r, c));
      if (hit >= 0) {
        rects.splice(hit, 1);
        blip(260, 50, 8);
        return settle();
      }
    }
    const x = span(r, c, p[0], p[1]);
    rects = rects.filter((y) => !overlaps(x, y));
    rects.push(x);
    blip(problem(b, x) ? 200 : 600, 60, 8);
    settle();
  });
  svg.addEventListener('pointercancel', () => {
    drag = null;
    render();
  });

  const settle = (): void => {
    if (solved(b, rects)) {
      done = true;
      [660, 880, 1100].forEach((f, i) => setTimeout(() => blip(f, 160), i * 110));
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
    // Candy-cane stripes for red and green portions (a flat red would read as an error).
    const defs = document.createElementNS(NS, 'defs');
    defs.innerHTML = (['r', 'g'] as const)
      .map(
        (k) =>
          `<pattern id="stripes-${k}" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="12" height="12" fill="#fffaf2"/><rect width="5" height="12" fill="${TINT[k]}"/></pattern>`,
      )
      .join('');
    svg.append(defs);
    add('rect', {
      x: 0,
      y: 0,
      width: b.width * cell,
      height: b.height * cell,
      rx: 8,
      fill: '#f7efe1',
    });
    for (let r = 0; r <= b.height; r++)
      add('line', {
        x1: 0,
        y1: r * cell,
        x2: b.width * cell,
        y2: r * cell,
        stroke: '#e3d6bf',
        'stroke-width': 1,
      });
    for (let c = 0; c <= b.width; c++)
      add('line', {
        x1: c * cell,
        y1: 0,
        x2: c * cell,
        y2: b.height * cell,
        stroke: '#e3d6bf',
        'stroke-width': 1,
      });
    const clashing = new Set(colourClashes(b, rects).flat());
    rects.forEach((x, i) => {
      const bad = problem(b, x) !== null || clashing.has(i);
      const colour = colourOf(b, x);
      add('rect', {
        x: x.c * cell + 3,
        y: x.r * cell + 3,
        width: x.w * cell - 6,
        height: x.h * cell - 6,
        rx: 7,
        fill: done ? '#ffe7a0' : colour ? `url(#stripes-${colour})` : bad ? '#f3e1dc' : '#e2f2dc',
        stroke: done ? '#d4a017' : bad ? '#d9534f' : '#4caf50',
        'stroke-width': 3,
        'stroke-dasharray': bad && !done ? '6 4' : '',
      });
    });
    if (drag) {
      const x = span(drag.r, drag.c, drag.to[0], drag.to[1]);
      add('rect', {
        x: x.c * cell + 2,
        y: x.r * cell + 2,
        width: x.w * cell - 4,
        height: x.h * cell - 4,
        rx: 7,
        fill: 'rgba(255, 207, 107, 0.25)',
        stroke: '#e0a020',
        'stroke-width': 3,
        'stroke-dasharray': '5 4',
      });
      add(
        'text',
        {
          x: (x.c + x.w) * cell - 8,
          y: (x.r + x.h) * cell - 8,
          'text-anchor': 'end',
          'font-size': cell * 0.3,
          'font-weight': 700,
          fill: '#b07800',
        },
        String(x.h * x.w),
      );
    }
    b.cells.forEach((row, r) =>
      row.forEach((cl, c) => {
        const x = c * cell + cell / 2;
        const y = r * cell + cell / 2;
        if (cl.colour) add('circle', { cx: x, cy: y, r: cell * 0.3, fill: INK[cl.colour] });
        if (cl.n !== undefined)
          add(
            'text',
            {
              x,
              y: y + cell * 0.14,
              'text-anchor': 'middle',
              'font-size': cell * 0.4,
              'font-weight': 700,
              fill: cl.colour ? '#fff' : '#3a2f25',
            },
            String(cl.n),
          );
        else if (cl.dish)
          add(
            'text',
            { x, y: y + cell * 0.14, 'text-anchor': 'middle', 'font-size': cell * 0.42 },
            DISH[cl.dish] ?? cl.dish,
          );
      }),
    );
    let explain = '';
    if (marks) {
      const { rows, cols } = lineCounts(b, rects);
      const lineCells = (row: boolean, i: number): [number, number][] =>
        row
          ? Array.from({ length: b.width }, (_, c): [number, number] => [i, c])
          : Array.from({ length: b.height }, (_, r): [number, number] => [r, i]);
      const full = (cells: [number, number][]): boolean =>
        cells.every(([r, c]) => rects.some((x) => inside(x, r, c)));
      /** A line is wrong when it's over its mark, or carved right across and off it. */
      const wrong = (row: boolean, i: number): boolean => {
        const m = (row ? b.rowMarks : b.colMarks)[i];
        const have = (row ? rows : cols)[i] ?? 0;
        return m != null && (have > m || (have !== m && full(lineCells(row, i))));
      };
      // Count a line out: its skewer drawn right through it, and a numbered badge on each piece it goes through.
      const SKEWER = 0.8; // how far across a square the skewer runs (clear of the numbers)
      const countOut = (row: boolean, i: number, bad: boolean): void => {
        const along = i * cell + cell * SKEWER;
        const stick = bad ? '#d9534f' : '#b8894f';
        add('line', {
          x1: row ? cell * 0.15 : along,
          y1: row ? along : cell * 0.15,
          x2: row ? b.width * cell : along,
          y2: row ? along : b.height * cell,
          stroke: stick,
          'stroke-width': 4,
          'stroke-linecap': 'round',
        });
        rects
          .filter((x) => (row ? x.r <= i && i < x.r + x.h : x.c <= i && i < x.c + x.w))
          .sort((x, y) => (row ? x.c - y.c : x.r - y.r))
          .forEach((x, k) => {
            const cx = row ? (x.c + x.w / 2) * cell : along;
            const cy = row ? along : (x.r + x.h / 2) * cell;
            add('circle', { cx, cy, r: cell * 0.16, fill: bad ? '#d9534f' : '#e0a020' });
            add(
              'text',
              {
                x: cx,
                y: cy + cell * 0.07,
                'text-anchor': 'middle',
                'font-size': cell * 0.2,
                'font-weight': 700,
                fill: '#fff',
              },
              String(k + 1),
            );
          });
      };
      const lines = [
        ...b.rowMarks.map((_, i) => ({ row: true, i })),
        ...b.colMarks.map((_, i) => ({ row: false, i })),
      ];
      for (const { row, i } of lines) {
        const bad = wrong(row, i);
        if (bad || (inspect && inspect.row === row && inspect.i === i)) countOut(row, i, bad);
        if (bad && !explain) {
          const m = (row ? b.rowMarks : b.colMarks)[i];
          const have = (row ? rows : cols)[i] ?? 0;
          explain = `The skewer through ${row ? 'row' : 'column'} ${i + 1} goes through ${have} piece${have === 1 ? '' : 's'}, but its flag says ${m}`;
        }
      }
      const mark = (row: boolean, i: number, x: number, y: number): void => {
        const m = (row ? b.rowMarks : b.colMarks)[i];
        if (m == null) return;
        const have = (row ? rows : cols)[i] ?? 0;
        const right = have === m && full(lineCells(row, i));
        const colour = wrong(row, i) ? '#d9534f' : right ? '#2f8a45' : '#6b5f52';
        // A cookout flag on a toothpick skewer: the stub of the skewer from the board, a pole, and a pennant with the number.
        const along = i * cell + cell * SKEWER;
        add('line', {
          x1: row ? b.width * cell : along,
          y1: row ? along : b.height * cell,
          x2: row ? x - cell * 0.3 : along,
          y2: row ? along : y - cell * 0.3,
          stroke: '#b8894f',
          'stroke-width': 3,
          'stroke-linecap': 'round',
        });
        const fx = x - cell * 0.3;
        const fy = y - cell * 0.24;
        const fw = cell * 0.62;
        const fh = cell * 0.48;
        add('line', {
          x1: fx,
          y1: fy - cell * 0.06,
          x2: fx,
          y2: fy + fh + cell * 0.1,
          stroke: '#7a5a3a',
          'stroke-width': 2,
        });
        add('rect', {
          x: fx,
          y: fy,
          width: fw,
          height: fh,
          rx: 2,
          fill: '#fff',
          stroke: colour,
          'stroke-width': 2,
        });
        add('rect', { x: fx + 1, y: fy + 1, width: fw * 0.32, height: fh * 0.42, fill: '#3c5aa6' });
        add('rect', {
          x: fx + 1,
          y: fy + fh - fh * 0.2,
          width: fw - 2,
          height: fh * 0.18,
          fill: '#d9534f',
        });
        add(
          'text',
          {
            x: fx + fw * 0.62,
            y: fy + fh * 0.62,
            'text-anchor': 'middle',
            'font-size': cell * 0.32,
            'font-weight': 700,
            fill: colour,
          },
          String(m),
        );
      };
      b.rowMarks.forEach((_, r) => mark(true, r, b.width * cell + pad / 2, r * cell + cell / 2));
      b.colMarks.forEach((_, c) => mark(false, c, c * cell + cell / 2, b.height * cell + pad / 2));
    }
    hooks.status(
      done
        ? 'Carved!'
        : explain
          ? explain
          : covers(b, rects)
            ? 'Every square is carved, but something’s not right yet'
            : '',
    );
  };
  render();
}
