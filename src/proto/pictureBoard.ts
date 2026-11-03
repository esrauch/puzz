/**
 * The clicky picture-grid panel. One colour: tap a square to fill it, again
 * to cross it out, again to clear it. Colours: pick a paint from the bar
 * (or the cross), and tap to paint (tap a painted square again to clear it).
 * Drag along a row or column to paint a run in one stroke. A line's clues go
 * grey when it matches; dark clues show '?', letter clues their letter.
 * Solved, the picture glows and chimes (and a message's blanks fill in).
 */
import { blip, h } from './kit';
import {
  type Panel,
  type Run,
  clues,
  fillMessage,
  lineDone,
  matches,
  picture,
  portionCounts,
} from './picture';

const NS = 'http://www.w3.org/2000/svg';
const PAINT: Record<string, string> = { '#': '#2b2a33', R: '#d9534f', B: '#3c5aa6', G: '#e0a62a' };
const CROSS = -2;

export interface PictureHooks {
  solved(): void;
  status(text: string): void;
}

export function mountPicture(host: HTMLElement, panel: Panel, hooks: PictureHooks): void {
  const palette = panel.palette ?? '#';
  const c = clues(panel);
  const H = c.rows.length;
  const W = c.cols.length;
  const rowSlots = Math.max(1, ...c.rows.map((r) => r.length));
  const colSlots = Math.max(1, ...c.cols.map((r) => r.length));
  const avail = Math.min(host.clientWidth || 360, 520);
  const cell = Math.max(24, Math.min(48, Math.floor((avail - 8) / (W + rowSlots * 0.62))));
  const clueW = rowSlots * cell * 0.62;
  const clueH = colSlots * cell * 0.62;
  const Wpx = clueW + W * cell;
  const Hpx = clueH + H * cell;
  // 0 empty, CROSS crossed out, 1.. a colour.
  const grid = Array.from({ length: H }, () => new Array<number>(W).fill(0));
  let tool = 1;
  let done = false;

  // The message's blanks, as tiles (letter panels).
  const note = panel.message
    ? h('div', { style: { display: 'flex', gap: '4px', margin: '0 0 8px', flexWrap: 'wrap' } })
    : null;
  const drawNote = (): void => {
    if (!note || !panel.message) return;
    const solved = fillMessage(panel);
    note.replaceChildren(
      ...[...panel.message].map((ch, i) =>
        ch === ' '
          ? h('span', { style: { width: '12px' } })
          : h(
              'span',
              {
                style: {
                  width: '30px',
                  height: '38px',
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: '6px',
                  fontWeight: '700',
                  fontSize: done ? '22px' : '14px',
                  background: done ? '#ffd54f' : '#fff',
                  border: '2px dashed #c9a2b0',
                  color: done ? '#7a1f3d' : '#9a8a96',
                },
              },
              done ? (solved[i] ?? '') : ch,
            ),
      ),
    );
  };
  if (note) host.append(note);
  if (panel.portions) {
    const share = [...portionCounts(panel, picture(panel)).values()][0] ?? 0;
    host.append(
      h(
        'div',
        { style: { fontSize: '17px', fontWeight: '600', margin: '0 0 8px' } },
        `Every portion gets ${share} filled squares.`,
      ),
    );
  }
  if (panel.eggs?.length) {
    host.append(
      h(
        'div',
        { style: { fontSize: '16px', fontWeight: '600', margin: '0 0 8px' } },
        'An egg’s number: which filled square it is in its row, counting from the left.',
      ),
    );
  }

  // Paints (colour panels only).
  const bar =
    palette.length > 1
      ? h('div', { style: { display: 'flex', gap: '6px', margin: '0 0 8px' } })
      : null;
  const drawBar = (): void => {
    if (!bar) return;
    bar.replaceChildren(
      ...[...palette, '✕'].map((ch, i) => {
        const value = ch === '✕' ? CROSS : i + 1;
        return h(
          'button',
          {
            style: {
              width: '44px',
              height: '36px',
              background: ch === '✕' ? '#fff' : PAINT[ch],
              color: '#666',
              border: tool === value ? '3px solid #222' : '1px solid #ccc',
              borderRadius: '8px',
              fontSize: '18px',
            },
            onclick: () => {
              tool = value;
              drawBar();
            },
          },
          ch === '✕' ? '✕' : '',
        );
      }),
    );
  };
  if (bar) host.append(bar);

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', String(Wpx));
  svg.setAttribute('height', String(Hpx));
  svg.setAttribute('viewBox', `0 0 ${Wpx} ${Hpx}`);
  Object.assign(svg.style, { touchAction: 'none', userSelect: 'none', display: 'block' });
  host.append(svg);

  const at = (e: PointerEvent): [number, number] | null => {
    const box = svg.getBoundingClientRect();
    const x = ((e.clientX - box.left) * Wpx) / box.width - clueW;
    const y = ((e.clientY - box.top) * Hpx) / box.height - clueH;
    const r = Math.floor(y / cell);
    const cc = Math.floor(x / cell);
    return r >= 0 && r < H && cc >= 0 && cc < W ? [r, cc] : null;
  };
  let drag: { r: number; c: number; value: number; axis: 'row' | 'col' | null } | null = null;
  const paint = (r: number, cc: number, value: number): void => {
    const row = grid[r] as number[];
    if (row[cc] === value) return;
    row[cc] = value;
    blip(value > 0 ? 560 : value === CROSS ? 380 : 260, 25, 5);
  };
  svg.addEventListener('pointerdown', (e) => {
    if (done) return;
    const p = at(e);
    if (!p) return;
    const [r, cc] = p;
    const now = grid[r]?.[cc] ?? 0;
    // One colour: fill → cross → clear. Colours: the chosen paint, or clear if it's already that.
    const value =
      palette.length === 1 ? (now === 0 ? 1 : now === 1 ? CROSS : 0) : now === tool ? 0 : tool;
    drag = { r, c: cc, value, axis: null };
    paint(r, cc, value);
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
    if (!p) return;
    const [r, cc] = p;
    if (r === drag.r && cc === drag.c && !drag.axis) return;
    // The drag keeps to the row or column it first moves along.
    drag.axis ??= r === drag.r ? 'row' : 'col';
    if (drag.axis === 'row') paint(drag.r, cc, drag.value);
    else paint(r, drag.c, drag.value);
    render();
  });
  const release = (): void => {
    if (!drag) return;
    drag = null;
    if (matches(panel, grid)) {
      done = true;
      [660, 880, 1100, 1320].forEach((f, k) => setTimeout(() => blip(f, 150), k * 110));
      navigator.vibrate?.([20, 40, 20]);
      drawNote();
      render();
      hooks.solved();
      return;
    }
    render();
  };
  svg.addEventListener('pointerup', release);
  svg.addEventListener('pointercancel', release);

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
    const label = (run: Run): string => run.letter ?? (run.hidden ? '?' : String(run.n));
    const tone = (run: Run, grey: boolean): string =>
      grey
        ? '#c4bfb6'
        : palette.length > 1
          ? (PAINT[palette[run.colour - 1] as string] as string)
          : '#2b2a33';
    // Row clues, right-aligned against the grid.
    c.rows.forEach((runs, r) => {
      const grey = lineDone(runs, grid[r] as number[]);
      runs.forEach((run, k) =>
        add(
          'text',
          {
            x: clueW - (runs.length - k - 0.5) * cell * 0.62,
            y: clueH + r * cell + cell * 0.66,
            'text-anchor': 'middle',
            'font-size': cell * 0.46,
            'font-weight': 700,
            fill: tone(run, grey),
          },
          label(run),
        ),
      );
    });
    c.cols.forEach((runs, cc) => {
      const grey = lineDone(
        runs,
        grid.map((row) => row[cc] ?? 0),
      );
      runs.forEach((run, k) =>
        add(
          'text',
          {
            x: clueW + cc * cell + cell / 2,
            y: clueH - (runs.length - k - 1) * cell * 0.62 - cell * 0.16,
            'text-anchor': 'middle',
            'font-size': cell * 0.46,
            'font-weight': 700,
            fill: tone(run, grey),
          },
          label(run),
        ),
      );
    });
    grid.forEach((row, r) =>
      row.forEach((v, cc) => {
        const x = clueW + cc * cell;
        const y = clueH + r * cell;
        const fill = v > 0 ? (PAINT[palette[v - 1] as string] as string) : '#fbf8f2';
        add('rect', {
          x: x + 0.5,
          y: y + 0.5,
          width: cell - 1,
          height: cell - 1,
          fill,
          stroke: '#d9d0c0',
          'stroke-width': 1,
        });
        if (v === CROSS)
          add(
            'text',
            {
              x: x + cell / 2,
              y: y + cell * 0.68,
              'text-anchor': 'middle',
              'font-size': cell * 0.5,
              fill: '#b0a898',
            },
            '✕',
          );
      }),
    );
    // Fair shares: thick edges between portions. Eggs: a filled square's place in its row's run.
    if (panel.portions)
      for (let r = 0; r < H; r++)
        for (let cc = 0; cc < W; cc++) {
          const mine = panel.portions[r]?.[cc];
          if (cc + 1 < W && panel.portions[r]?.[cc + 1] !== mine)
            add('line', {
              x1: clueW + (cc + 1) * cell,
              y1: clueH + r * cell,
              x2: clueW + (cc + 1) * cell,
              y2: clueH + (r + 1) * cell,
              stroke: '#b07a2a',
              'stroke-width': 4,
            });
          if (r + 1 < H && panel.portions[r + 1]?.[cc] !== mine)
            add('line', {
              x1: clueW + cc * cell,
              y1: clueH + (r + 1) * cell,
              x2: clueW + (cc + 1) * cell,
              y2: clueH + (r + 1) * cell,
              stroke: '#b07a2a',
              'stroke-width': 4,
            });
        }
    for (const [r, cc, n] of panel.eggs ?? []) {
      const x = clueW + cc * cell + cell / 2;
      const y = clueH + r * cell + cell / 2;
      add('ellipse', {
        cx: x,
        cy: y,
        rx: cell * 0.24,
        ry: cell * 0.3,
        fill: '#fff6dc',
        stroke: '#c9a227',
        'stroke-width': 2,
      });
      add(
        'text',
        {
          x,
          y: y + cell * 0.1,
          'text-anchor': 'middle',
          'font-size': cell * 0.3,
          'font-weight': 700,
          fill: '#4a3a20',
        },
        String(n),
      );
    }
    // Thicker lines every five squares, to help counting.
    for (let k = 5; k < W; k += 5)
      add('line', {
        x1: clueW + k * cell,
        y1: clueH,
        x2: clueW + k * cell,
        y2: clueH + H * cell,
        stroke: '#9a9080',
        'stroke-width': 2,
      });
    for (let k = 5; k < H; k += 5)
      add('line', {
        x1: clueW,
        y1: clueH + k * cell,
        x2: clueW + W * cell,
        y2: clueH + k * cell,
        stroke: '#9a9080',
        'stroke-width': 2,
      });
    if (done)
      add('rect', {
        x: clueW,
        y: clueH,
        width: W * cell,
        height: H * cell,
        fill: 'none',
        stroke: '#ffd54f',
        'stroke-width': 5,
      });
    hooks.status(done ? 'A picture!' : '');
  };
  drawNote();
  drawBar();
  render();
}
