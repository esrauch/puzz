/**
 * The clicky picture-grid panel. One colour: tap a square to fill it, again
 * to cross it out, again to clear it. Colours: pick a paint from the bar
 * (or the cross), and tap to paint (tap a painted square again to clear it).
 * Drag along a row or column to paint a run in one stroke. A line's clues go
 * grey when it matches; dark clues show '?', letter clues their letter.
 * Supports all six holiday twists:
 * - colours (red and blue paints in the bar, different colours can touch);
 * - dark ('?' clues of any length);
 * - letters (letter clues and message blank tiles above the board);
 * - eggs (glow green when they are the nth filled square in their row, red when over);
 * - portions (live share counts per portion, green when fair, red when over);
 * - snowflakes (frosty frame, mirror line with ❄, and ghost mirror squares).
 * Solved, the picture glows and chimes (and a message's blanks fill in).
 */
import { mirrorSquare } from '../gen/core/mirror';
import { blip, h } from './kit';
import {
  type Panel,
  type Run,
  clues,
  eggsHold,
  fillMessage,
  frameSymmetric,
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

export function mountPicture(host: HTMLElement, panel: Panel, hooks: PictureHooks): () => unknown {
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
      ...[...panel.message].map((ch, i) => {
        if (ch === ' ') return h('span', { style: { width: '12px' } });
        const blank = /[0-9]/.test(ch);
        return h(
          'span',
          {
            style: {
              width: '30px',
              height: '38px',
              display: 'grid',
              placeItems: 'center',
              borderRadius: '6px',
              fontWeight: '700',
              fontSize: blank && !done ? '14px' : '22px',
              background: blank ? (done ? '#ffd54f' : '#fff') : '#f3e3e8',
              border: blank ? '2px dashed #c9a2b0' : '2px solid transparent',
              color: blank && !done ? '#9a8a96' : '#7a1f3d',
            },
          },
          done ? (solved[i] ?? '') : ch,
        );
      }),
    );
  };
  if (note) host.append(note);

  if (panel.frame) {
    host.append(
      h(
        'div',
        { style: { fontSize: '16px', fontWeight: '600', margin: '0 0 8px' } },
        '❄ Inside the frosty frame, the filled squares are their own mirror image. Outside it, anything goes.',
      ),
    );
  }

  const share = panel.portions ? ([...portionCounts(panel, picture(panel)).values()][0] ?? 0) : 0;
  const portionBar = panel.portions
    ? h('div', {
        style: {
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          flexWrap: 'wrap',
          fontSize: '16px',
          fontWeight: '600',
          margin: '0 0 8px',
        },
      })
    : null;
  const drawPortionBar = (): void => {
    if (!portionBar || !panel.portions) return;
    const counts = portionCounts(panel, grid);
    portionBar.replaceChildren(
      h('span', {}, `Every portion gets ${share} filled squares:`),
      ...[...counts.entries()].map(([k, have]) =>
        h(
          'span',
          {
            style: {
              padding: '2px 8px',
              borderRadius: '6px',
              background: have === share ? '#e2f2dc' : have > share ? '#fde0dd' : '#f4efe6',
              color: have === share ? '#2f8a45' : have > share ? '#c23b33' : '#5a4a3a',
              border: `1.5px solid ${have === share ? '#4caf50' : have > share ? '#d9534f' : '#c9beae'}`,
            },
          },
          `${k}: ${have}/${share}`,
        ),
      ),
    );
  };
  if (portionBar) host.append(portionBar);

  if (panel.eggs?.length) {
    host.append(
      h(
        'div',
        { style: { fontSize: '16px', fontWeight: '600', margin: '0 0 8px' } },
        'An egg on a row clue marks which run in that row covers the egg square.',
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
    drawPortionBar();
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
    drawPortionBar();
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
      drawPortionBar();
      render();
      hooks.solved();
      return;
    }
    drawPortionBar();
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

    // Concrete-clue lines that appear solved trigger auto-X on their remaining empty squares.
    const rowAuto = c.rows.map(
      (runs, r) => runs.every((run) => !run.hidden) && lineDone(runs, grid[r] as number[]),
    );
    const colAuto = c.cols.map(
      (runs, cc) =>
        runs.every((run) => !run.hidden) &&
        lineDone(
          runs,
          grid.map((row) => row[cc] ?? 0),
        ),
    );
    const isAutoX = (r: number, cc: number): boolean =>
      (grid[r]?.[cc] ?? 0) === 0 && Boolean(rowAuto[r] || colAuto[cc]);
    const effective = (r: number, cc: number): number => {
      const v = grid[r]?.[cc] ?? 0;
      return v !== 0 ? v : isAutoX(r, cc) ? CROSS : 0;
    };

    // Map each egg [r, cc, n] to which run index k in c.rows[r] covers (r, cc),
    // and compute its live fill/stroke colours.
    const sol = picture(panel);
    const eggStyle = (
      r: number,
      cc: number,
      n: number,
    ): { fill: string; stroke: string; right: boolean } => {
      const row = grid[r] ?? [];
      const atCell = row[cc] ?? 0;
      const filledToHere = row.slice(0, cc + 1).filter((v) => v > 0).length;
      const right = atCell > 0 && filledToHere === n;
      const wrong =
        atCell === CROSS ||
        filledToHere > n ||
        (atCell > 0 && row.slice(0, cc).every((v) => v !== 0) && filledToHere !== n);
      const fill = done ? '#ffd54f' : wrong ? '#ff8a80' : right ? '#a5d6a7' : '#fff6dc';
      const stroke = done ? '#b28704' : wrong ? '#c62828' : right ? '#2e7d32' : '#c9a227';
      return { fill, stroke, right };
    };
    const clueEgg = new Map<string, [number, number, number]>();
    for (const egg of panel.eggs ?? []) {
      const [r, cc] = egg;
      const solRow = sol[r] ?? [];
      let runIdx = -1;
      let prev = 0;
      for (let col = 0; col <= cc; col++) {
        const cur = solRow[col] ?? 0;
        if (cur > 0 && cur !== prev) runIdx++;
        prev = cur > 0 ? cur : 0;
      }
      if (runIdx >= 0) clueEgg.set(`${r},${runIdx}`, egg);
    }

    // Row clues, right-aligned against the grid (with an egg behind any egg-marked clue).
    c.rows.forEach((runs, r) => {
      const effRow = Array.from({ length: W }, (_, cc) => effective(r, cc));
      const grey = done || lineDone(runs, effRow);
      runs.forEach((run, k) => {
        const cx = clueW - (runs.length - k - 0.5) * cell * 0.62;
        const cy = clueH + r * cell + cell / 2;
        const egg = clueEgg.get(`${r},${k}`);
        if (egg) {
          const { fill, stroke } = eggStyle(egg[0], egg[1], egg[2]);
          add('ellipse', {
            cx,
            cy,
            rx: cell * 0.25,
            ry: cell * 0.32,
            fill,
            stroke,
            'stroke-width': 2,
          });
        }
        add(
          'text',
          {
            x: cx,
            y: clueH + r * cell + cell * 0.66,
            'text-anchor': 'middle',
            'font-size': cell * 0.46,
            'font-weight': 700,
            fill: egg ? (grey ? '#7a6f5d' : '#4a3a20') : tone(run, grey),
          },
          label(run),
        );
      });
    });
    c.cols.forEach((runs, cc) => {
      const effCol = Array.from({ length: H }, (_, r) => effective(r, cc));
      const grey = done || lineDone(runs, effCol);
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
              'font-weight': 700,
              fill: '#968d7e',
            },
            '✕',
          );
        else if (isAutoX(r, cc))
          add(
            'text',
            {
              x: x + cell / 2,
              y: y + cell * 0.66,
              'text-anchor': 'middle',
              'font-size': cell * 0.44,
              fill: '#d8d0c2',
            },
            '✕',
          );
      }),
    );

    // Snowflakes: frosty frame, mirror line with ❄, and ghost mirror squares
    if (panel.frame) {
      const f = panel.frame;
      for (let r = f.top; r <= f.bottom; r++) {
        for (let cc = f.left; cc <= f.right; cc++) {
          const v = grid[r]?.[cc] ?? 0;
          if (v <= 0) continue;
          const [mr, mc] = mirrorSquare(f, r, cc);
          if ((grid[mr]?.[mc] ?? 0) > 0) continue;
          add('rect', {
            x: clueW + mc * cell + 3,
            y: clueH + mr * cell + 3,
            width: cell - 6,
            height: cell - 6,
            rx: 5,
            fill: 'rgba(90, 169, 230, 0.22)',
            stroke: '#5aa9e6',
            'stroke-width': 2,
            'stroke-dasharray': '4 3',
          });
        }
      }
      const fx = clueW + f.left * cell + 2;
      const fy = clueH + f.top * cell + 2;
      const fw = (f.right - f.left + 1) * cell - 4;
      const fh = (f.bottom - f.top + 1) * cell - 4;
      add('rect', {
        x: fx,
        y: fy,
        width: fw,
        height: fh,
        rx: 8,
        fill: 'none',
        stroke: '#5aa9e6',
        'stroke-width': 2.5,
        'stroke-dasharray': '7 5',
      });
      const vertical = f.axis === 'v';
      const mid = vertical
        ? clueW + ((f.left + f.right + 1) * cell) / 2
        : clueH + ((f.top + f.bottom + 1) * cell) / 2;
      const [x1, y1, x2, y2] = vertical ? [mid, fy, mid, fy + fh] : [fx, mid, fx + fw, mid];
      add('line', {
        x1,
        y1,
        x2,
        y2,
        stroke: '#5aa9e6',
        'stroke-width': 1.8,
        'stroke-dasharray': '3 4',
      });
      for (const [x, y] of [
        [x1, y1],
        [x2, y2],
      ])
        add(
          'text',
          {
            x: x ?? 0,
            y: (y ?? 0) + cell * 0.1,
            'text-anchor': 'middle',
            'font-size': cell * 0.28,
          },
          '❄',
        );
    }

    // Fair shares: thick edges between portions.
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

    // Eggs inside the grid: just an unnumbered egg icon in the square.
    for (const [r, cc, n] of panel.eggs ?? []) {
      const x = clueW + cc * cell + cell / 2;
      const y = clueH + r * cell + cell / 2;
      const { fill, stroke } = eggStyle(r, cc, n);
      add('ellipse', {
        cx: x,
        cy: y,
        rx: cell * 0.22,
        ry: cell * 0.28,
        fill,
        stroke,
        'stroke-width': 2,
      });
      add('ellipse', {
        cx: x - cell * 0.06,
        cy: y - cell * 0.08,
        rx: cell * 0.06,
        ry: cell * 0.09,
        fill: 'rgba(255, 255, 255, 0.65)',
      });
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
    const allLinesDone =
      c.rows.every((runs, r) =>
        lineDone(
          runs,
          Array.from({ length: W }, (_, cc) => effective(r, cc)),
        ),
      ) &&
      c.cols.every((runs, cc) =>
        lineDone(
          runs,
          Array.from({ length: H }, (_, r) => effective(r, cc)),
        ),
      );
    const snowBad =
      !done && allLinesDone && Boolean(panel.frame && !frameSymmetric(panel.frame, grid));
    const portionsBad =
      !done &&
      allLinesDone &&
      Boolean(
        panel.portions && [...portionCounts(panel, grid).values()].some((have) => have !== share),
      );
    const eggsBad = !done && allLinesDone && Boolean(panel.eggs?.length && !eggsHold(panel, grid));
    hooks.status(
      done
        ? 'A picture!'
        : snowBad
          ? 'Every line matches, but the frosty frame isn’t a mirror image'
          : portionsBad
            ? 'Every line matches, but the portions don’t have equal shares'
            : eggsBad
              ? 'Every line matches, but an egg square doesn’t match its clue'
              : '',
    );
  };
  drawNote();
  drawPortionBar();
  drawBar();
  render();
  return () => ({
    done,
    grid: grid.map((row) =>
      row.map((v) => (v === CROSS ? 'X' : v > 0 ? (palette[v - 1] ?? '#') : '.')).join(''),
    ),
  });
}
