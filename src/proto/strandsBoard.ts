/**
 * The clicky Strands panel: drag through touching letters (diagonals too)
 * to spell a word; slide back to undo the last letter; let go to check it.
 * A theme word locks in (blue; the spangram gold) and chimes; anything else
 * shakes. The word builds above the board as you drag. Dark letters show as
 * blanks, coded letters as their number, until a word through them is found
 * (a coded letter is then revealed everywhere, and in the key).
 */
import { blip } from './kit';
import { type Panel, type Spot, find, key, letterAt, placeIn, touching } from './strands';

const NS = 'http://www.w3.org/2000/svg';

export interface StrandsHooks {
  solved(): void;
  status(text: string): void;
}

export function mountStrands(host: HTMLElement, panel: Panel, hooks: StrandsHooks): void {
  const H = panel.rows.length;
  const Wd = panel.rows[0]?.length ?? 0;
  const avail = Math.min(host.clientWidth || 360, 480);
  const cell = Math.max(40, Math.min(64, Math.floor((avail - 8) / Wd)));
  const W = Wd * cell;
  const Hpx = H * cell;
  const found = new Set<number>();
  const dark = new Set((panel.dark ?? []).map(key));
  const eggs = new Set((panel.eggs ?? []).map(key));
  const code = panel.code ?? '';
  let path: Spot[] = [];
  let shake = 0;

  const top = document.createElement('div');
  Object.assign(top.style, { margin: '0 0 6px' });
  const theme = document.createElement('div');
  theme.textContent = `Theme: ${panel.theme}`;
  Object.assign(theme.style, { fontSize: '18px', fontWeight: '700' });
  const building = document.createElement('div');
  Object.assign(building.style, {
    minHeight: '34px',
    fontSize: '26px',
    fontWeight: '800',
    letterSpacing: '3px',
    color: '#7a1f3d',
  });
  const keyLine = document.createElement('div');
  Object.assign(keyLine.style, {
    fontSize: '16px',
    margin: '2px 0',
    fontWeight: '600',
    color: '#5a4a52',
  });
  top.append(theme, keyLine, building);
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', String(W));
  svg.setAttribute('height', String(Hpx));
  svg.setAttribute('viewBox', `0 0 ${W} ${Hpx}`);
  Object.assign(svg.style, { touchAction: 'none', userSelect: 'none', display: 'block' });
  host.append(top, svg);

  /** Squares in found words. */
  const foundCells = (): Set<string> =>
    new Set([...found].flatMap((i) => (panel.words[i]?.cells ?? []).map(key)));
  /** Coded letters revealed (by a found word through one). */
  const revealed = (): Set<string> => {
    const out = new Set<string>();
    for (const k of foundCells()) {
      const [r, c] = k.split(',').map(Number) as Spot;
      out.add(letterAt(panel, [r, c]));
    }
    return out;
  };
  /** What a square shows: its letter, a blank in the dark, or its code number. */
  const shown = (s: Spot): string => {
    const letter = letterAt(panel, s);
    const isFound = foundCells().has(key(s));
    if (dark.has(key(s)) && !isFound) return '?';
    const n = code.indexOf(letter);
    if (n >= 0 && !revealed().has(letter)) return String(n + 1);
    return letter;
  };

  const at = (e: PointerEvent, strict: boolean): Spot | null => {
    const box = svg.getBoundingClientRect();
    const x = ((e.clientX - box.left) * W) / box.width;
    const y = ((e.clientY - box.top) * Hpx) / box.height;
    const r = Math.floor(y / cell);
    const c = Math.floor(x / cell);
    if (r < 0 || r >= H || c < 0 || c >= Wd) return null;
    // While dragging, only count a square near its middle, so diagonals are easy to hit.
    if (strict && Math.hypot(x - (c + 0.5) * cell, y - (r + 0.5) * cell) > cell * 0.4) return null;
    return foundCells().has(key([r, c])) ? null : [r, c];
  };

  svg.addEventListener('pointerdown', (e) => {
    const s = at(e, false);
    if (!s) return;
    path = [s];
    try {
      svg.setPointerCapture(e.pointerId);
    } catch {
      // A synthetic pointer: no capture needed.
    }
    blip(600, 20);
    render();
  });
  svg.addEventListener('pointermove', (e) => {
    if (!path.length) return;
    const s = at(e, true);
    if (!s) return;
    const last = path[path.length - 1] as Spot;
    if (key(s) === key(last)) return;
    const back = path[path.length - 2];
    if (back && key(back) === key(s)) path.pop();
    else if (touching(last, s) && !path.some((x) => key(x) === key(s))) path.push(s);
    else return;
    blip(600 + path.length * 40, 20);
    render();
  });
  const release = (): void => {
    if (!path.length) return;
    const i = find(panel, path);
    if (i >= 0 && !found.has(i)) {
      found.add(i);
      blip(880, 120, 15);
      if (found.size === panel.words.length) {
        [660, 880, 1100, 1320].forEach((f, k) => setTimeout(() => blip(f, 150), k * 110));
        navigator.vibrate?.([20, 40, 20]);
        path = [];
        render();
        hooks.solved();
        return;
      }
    } else if (path.length > 1) {
      shake = 6;
      blip(150, 120, 40);
      setTimeout(() => {
        shake = 0;
        render();
      }, 220);
    }
    path = [];
    render();
  };
  svg.addEventListener('pointerup', release);
  svg.addEventListener('pointercancel', release);

  /** Red and green: a letter's tint (plain letters white), and a ring in its colour. */
  // With bows, only the bowed letters show their colour.
  const bowed = new Set((panel.bows ?? []).map(key));
  const shows = (s: Spot): boolean => !panel.bows || bowed.has(key(s));
  const tint = ([r, c]: Spot): string =>
    (shows([r, c])
      ? { r: '#fde0dd', g: '#dff3df' }[panel.colours?.[r]?.[c] as 'r' | 'g']
      : undefined) ?? '#fff';
  const ring = ([r, c]: Spot): string =>
    (shows([r, c])
      ? { r: '#d9534f', g: '#43a35c' }[panel.colours?.[r]?.[c] as 'r' | 'g']
      : undefined) ?? '#d8d0dc';
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
    const centre = ([r, c]: Spot): [number, number] => [
      c * cell + cell / 2 + shake,
      r * cell + cell / 2,
    ];
    const strand = (cells: Spot[], colour: string): void => {
      for (let i = 1; i < cells.length; i++) {
        const [x1, y1] = centre(cells[i - 1] as Spot);
        const [x2, y2] = centre(cells[i] as Spot);
        add('line', {
          x1,
          y1,
          x2,
          y2,
          stroke: colour,
          'stroke-width': cell * 0.32,
          'stroke-linecap': 'round',
        });
      }
    };
    const colourOf = (i: number): string => (panel.spangram && i === 0 ? '#f5c542' : '#8ec5ff');
    // Fair shares: thick edges between portions.
    if (panel.portions)
      for (let r = 0; r < H; r++)
        for (let c = 0; c < Wd; c++) {
          const mine = panel.portions[r]?.[c];
          if (c + 1 < Wd && panel.portions[r]?.[c + 1] !== mine)
            add('line', {
              x1: (c + 1) * cell,
              y1: r * cell,
              x2: (c + 1) * cell,
              y2: (r + 1) * cell,
              stroke: '#b07a2a',
              'stroke-width': 4,
            });
          if (r + 1 < H && panel.portions[r + 1]?.[c] !== mine)
            add('line', {
              x1: c * cell,
              y1: (r + 1) * cell,
              x2: (c + 1) * cell,
              y2: (r + 1) * cell,
              stroke: '#b07a2a',
              'stroke-width': 4,
            });
        }
    for (const i of found) strand(panel.words[i]?.cells ?? [], colourOf(i));
    strand(path, '#c9b6e8');
    const inFound = new Map<string, number>();
    for (const i of found) for (const s of panel.words[i]?.cells ?? []) inFound.set(key(s), i);
    const inPath = new Set(path.map(key));
    for (let r = 0; r < H; r++)
      for (let c = 0; c < Wd; c++) {
        const s: Spot = [r, c];
        const [x, y] = centre(s);
        const f = inFound.get(key(s));
        const text = shown(s);
        const isDark = text === '?';
        const coded = /[0-9]/.test(text);
        add('circle', {
          cx: x,
          cy: y,
          r: cell * 0.36,
          fill:
            f !== undefined
              ? colourOf(f)
              : inPath.has(key(s))
                ? '#c9b6e8'
                : isDark
                  ? '#3a3340'
                  : coded
                    ? '#fde7ef'
                    : tint(s),
          stroke: coded ? '#c2185b' : panel.colours ? ring(s) : 'none',
          'stroke-width': 2,
        });
        add(
          'text',
          {
            x,
            y: y + cell * 0.13,
            'text-anchor': 'middle',
            'font-size': cell * 0.38,
            'font-weight': 700,
            fill: isDark ? '#bfb4cc' : coded ? '#c2185b' : '#2a2230',
          },
          text,
        );
        if (eggs.has(key(s))) {
          add('ellipse', {
            cx: x + cell * 0.3,
            cy: y - cell * 0.28,
            rx: cell * 0.13,
            ry: cell * 0.16,
            fill: '#fff3c4',
            stroke: '#c9a227',
            'stroke-width': 1.5,
          });
          add(
            'text',
            {
              x: x + cell * 0.3,
              y: y - cell * 0.23,
              'text-anchor': 'middle',
              'font-size': cell * 0.17,
              'font-weight': 700,
              fill: '#7a5a00',
            },
            String(placeIn(panel, s)),
          );
        }
      }
    building.textContent = path.map(shown).join('');
    if (code)
      keyLine.textContent = `Key: ${[...code]
        .map((letter, i) => `${i + 1} = ${revealed().has(letter) ? letter : '?'}`)
        .join(' · ')}`;
    // Once solved, the run's own message stands.
    if (found.size < panel.words.length)
      hooks.status(
        `${found.size} of ${panel.words.length} theme words${panel.spangram && !found.has(0) ? ' (one is a spangram, side to side)' : ''}`,
      );
  };
  render();
}
