/**
 * The two-bunny panel: drag from either bunny through neighbouring squares to
 * lay its trail (drag back over it to rub it out); touch a square on a trail
 * to go back to it. Red trail and green trail; white squares take either. The
 * message's blanks are the red bunny's steps where its letters lie; solved,
 * they fill in.
 */
import { blip, h } from './kit';
import { type Panel, type Spot, key, parse, solved, spell } from './twohops';

const NS = 'http://www.w3.org/2000/svg';
const TINT: Record<string, string> = { r: '#fbe0dc', g: '#dcf0dc', w: '#ffffff' };
const TRAIL: Record<'r' | 'g', string> = { r: '#e57373', g: '#66bb6a' };

export interface TwoHopsHooks {
  solved(): void;
  status(text: string): void;
}

export function mountTwoHops(host: HTMLElement, panel: Panel, hooks: TwoHopsHooks): void {
  const b = parse(panel);
  const H = panel.rows.length;
  const W = panel.rows[0]?.length ?? 0;
  const avail = Math.min(host.clientWidth || 360, 480);
  const cell = Math.max(36, Math.min(64, Math.floor((avail - 8) / W)));
  const start = (tone: string): number =>
    [...b.given].find(([i, n]) => n === 1 && b.colour[i] === tone)?.[0] ?? 0;
  const routes: Record<'r' | 'g', number[]> = { r: [start('r')], g: [start('g')] };
  let active: 'r' | 'g' | null = null;
  let done = false;

  // Each bunny's message: its blanks are its steps where its letters lie, filled in when solved.
  const note =
    panel.message || panel.greenMessage ? h('div', { style: { margin: '0 0 8px' } }) : null;
  const drawNote = (): void => {
    if (!note) return;
    const row = (tone: 'r' | 'g', blanks: number[]): HTMLElement => {
      const word = done ? spell(b, routes[tone], tone) : '';
      return h(
        'div',
        { style: { display: 'flex', gap: '4px', margin: '0 0 4px', alignItems: 'center' } },
        h('span', { style: { width: '24px' } }, '🐇'),
        ...blanks.map((n, i) =>
          h(
            'span',
            {
              style: {
                minWidth: '30px',
                height: '36px',
                display: 'grid',
                placeItems: 'center',
                borderRadius: '6px',
                border: `2px dashed ${tone === 'r' ? '#d9534f' : '#43a35c'}`,
                fontWeight: '700',
                fontSize: done ? '22px' : '14px',
                background: done ? '#ffd54f' : '#fff',
                color: done ? '#7a1f3d' : '#9a8a96',
                padding: '0 4px',
              },
            },
            done ? (word[i] ?? '') : String(n),
          ),
        ),
      );
    };
    note.replaceChildren(
      ...(b.blanks.length ? [row('r', b.blanks)] : []),
      ...(b.greenBlanks.length ? [row('g', b.greenBlanks)] : []),
    );
  };
  if (note) host.append(note);
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', String(W * cell));
  svg.setAttribute('height', String(H * cell));
  svg.setAttribute('viewBox', `0 0 ${W * cell} ${H * cell}`);
  Object.assign(svg.style, { touchAction: 'none', userSelect: 'none', display: 'block' });
  host.append(svg);

  const spotAt = (e: PointerEvent, strict: boolean): number | undefined => {
    const box = svg.getBoundingClientRect();
    const x = ((e.clientX - box.left) * W * cell) / box.width;
    const y = ((e.clientY - box.top) * H * cell) / box.height;
    const r = Math.floor(y / cell);
    const c = Math.floor(x / cell);
    if (strict && Math.hypot(x - (c + 0.5) * cell, y - (r + 0.5) * cell) > cell * 0.42)
      return undefined;
    return b.index.get(key([r, c]));
  };
  const owner = (i: number): 'r' | 'g' | null =>
    routes.r.includes(i) ? 'r' : routes.g.includes(i) ? 'g' : null;
  const canTake = (tone: 'r' | 'g', i: number): boolean =>
    b.colour[i] === 'w' || b.colour[i] === tone;

  svg.addEventListener('pointerdown', (e) => {
    if (done) return;
    const i = spotAt(e, false);
    if (i === undefined) return;
    const mine = owner(i);
    if (mine) {
      // Back to this square on its trail.
      active = mine;
      routes[mine].length = Math.max(1, routes[mine].indexOf(i) + 1);
    } else {
      // A free square next to a bunny: that bunny steps there.
      const tone = (['r', 'g'] as const).find((t) => {
        const end = routes[t][routes[t].length - 1] as number;
        return (b.hops[end] ?? []).includes(i) && canTake(t, i);
      });
      if (!tone) {
        blip(150, 80, 25);
        return;
      }
      active = tone;
      routes[tone].push(i);
    }
    blip(520, 30, 6);
    try {
      svg.setPointerCapture(e.pointerId);
    } catch {
      // A synthetic pointer: no capture needed.
    }
    render();
  });
  svg.addEventListener('pointermove', (e) => {
    if (!active) return;
    const j = spotAt(e, true);
    const route = routes[active];
    const last = route[route.length - 1] as number;
    if (j === undefined || j === last) return;
    if (route.length > 1 && route[route.length - 2] === j) route.pop();
    else if ((b.hops[last] ?? []).includes(j) && owner(j) === null && canTake(active, j))
      route.push(j);
    else return;
    blip(500 + route.length * 10, 25, 4);
    render();
  });
  const release = (): void => {
    if (!active) return;
    active = null;
    if (solved(b, routes.r, routes.g)) {
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
    const centre = ([r, c]: Spot): [number, number] => [c * cell + cell / 2, r * cell + cell / 2];
    b.spots.forEach(([r, c], i) =>
      add('rect', {
        x: c * cell + 2,
        y: r * cell + 2,
        width: cell - 4,
        height: cell - 4,
        rx: 8,
        fill: TINT[b.colour[i] as string] ?? '#fff',
        stroke: '#e0d8cc',
      }),
    );
    for (const tone of ['r', 'g'] as const)
      routes[tone].forEach((i, n) => {
        if (!n) return;
        const [x1, y1] = centre(b.spots[routes[tone][n - 1] as number] as Spot);
        const [x2, y2] = centre(b.spots[i] as Spot);
        add('line', {
          x1,
          y1,
          x2,
          y2,
          stroke: done ? '#e0b030' : TRAIL[tone],
          'stroke-width': cell * 0.28,
          'stroke-linecap': 'round',
        });
      });
    b.spots.forEach((s, i) => {
      const [x, y] = centre(s);
      const tone = owner(i);
      const n = tone ? routes[tone].indexOf(i) + 1 : 0;
      const g = b.given.get(i);
      const letter = b.letterAt.get(i);
      if (g !== undefined || letter) {
        add('ellipse', {
          cx: x,
          cy: y,
          rx: cell * 0.26,
          ry: cell * 0.32,
          fill: '#fffaf0',
          stroke: b.colour[i] === 'g' ? '#43a35c' : '#d9534f',
          'stroke-width': 2.5,
        });
        add(
          'text',
          {
            x,
            y: y + cell * 0.11,
            'text-anchor': 'middle',
            'font-size': cell * 0.3,
            'font-weight': 700,
            fill: letter ? '#c2185b' : '#4a3a20',
          },
          letter ?? String(g),
        );
      } else if (n)
        add(
          'text',
          {
            x,
            y: y + cell * 0.11,
            'text-anchor': 'middle',
            'font-size': cell * 0.28,
            'font-weight': 700,
            fill: '#33302a',
          },
          String(n),
        );
      for (const t of ['r', 'g'] as const)
        if (routes[t][routes[t].length - 1] === i)
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
    const left = b.spots.length - routes.r.length - routes.g.length;
    hooks.status(done ? 'Both bunnies home!' : `${left} square${left === 1 ? '' : 's'} left`);
  };
  drawNote();
  render();
}
