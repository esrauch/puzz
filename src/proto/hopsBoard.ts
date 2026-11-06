/**
 * The clicky bunny-hop panel: drag from a bunny through neighbouring spots
 * to lay its trail (drag back over it to rub it out), or tap a neighbour to
 * hop there; tap a bunny to take a hop back, or an earlier spot to go back
 * to it. Supports all six holiday twists:
 * - courses (thick portion walls);
 * - colours (red bunny and blue bunny, white squares go to either);
 * - burrows (matching coloured holes joined underground);
 * - snowflakes (frosty frame, mirror line with ❄, and ghost mirror trail);
 * - letters (letter eggs on the board and message blank tiles above);
 * - the dark (shadowed squares ? that may be lawn or rock, lighting up when solved).
 */
import { inside, mirrorKey } from '../gen/core/mirror';
import {
  type Panel,
  type Spot,
  firstVisits,
  key,
  parse,
  solved,
  spell,
  trailSegments,
} from './hops';
import { blip, h } from './kit';

const NS = 'http://www.w3.org/2000/svg';
const BURROW = ['#8d6e63', '#5c6bc0', '#26a69a'];
const TINT: Record<string, string> = {
  r: '#fbe0dc',
  b: '#dde6fb',
  g: '#dcf0dc',
  w: '#ffffff',
};
const TRAIL: Record<'r' | 'b' | 'g', string> = {
  r: '#e57373',
  b: '#5c85d6',
  g: '#66bb6a',
};

export interface HopsHooks {
  solved(): void;
  status(text: string): void;
}

export function mountHops(host: HTMLElement, panel: Panel, hooks: HopsHooks): () => unknown {
  const b = parse(panel);
  const H = panel.rows.length;
  const Wd = panel.rows[0]?.length ?? 0;
  const flagged = [...b.rowFlags, ...b.colFlags].some((f) => f !== null);
  const avail = Math.min(host.clientWidth || 360, 520);
  const cell = Math.max(32, Math.min(60, Math.floor((avail - 8) / (Wd + (flagged ? 0.9 : 0)))));
  const pad = flagged ? cell * 0.9 : 0;
  const W = Wd * cell + pad;
  const Hpx = H * cell + pad;

  const secTone = b.secondTone;
  const routes: { r: number[]; b: number[] } = {
    r: b.redStart !== undefined ? [b.redStart] : [],
    b: b.twoBunnies && b.blueStart !== undefined ? [b.blueStart] : [],
  };
  let active: 'r' | 'b' | null = null;
  let lastBunny: 'r' | 'b' = 'r';
  let done = false;
  const flashing = new Set<number>();

  // Twist legends above the board
  const rules: string[] = [];
  if (b.frame) {
    rules.push(
      '❄ Inside the frosty frame, the trail’s strokes mirror across the icy line. Outside it, anything goes.',
    );
  }
  if (panel.portions) {
    rules.push('Courses: finish every square of an outlined portion before hopping into the next.');
  }
  if (b.twoBunnies) {
    rules.push(
      `Two bunnies: the red bunny visits every red square, the ${secTone === 'g' ? 'green' : 'blue'} bunny every ${secTone === 'g' ? 'green' : 'blue'} square, and white squares go to either.`,
    );
  }
  if (b.burrows.length) {
    rules.push('Burrows: matching holes are joined underground — hop into one and out the other.');
  }
  if (b.dark.some(Boolean)) {
    rules.push(
      'The dark: shadowed squares (?) may be lawn or rock; the last egg gives the route’s length.',
    );
  }
  for (const text of rules) {
    const line = h(
      'div',
      {
        style: { fontSize: '15px', fontWeight: '600', margin: '0 0 6px' },
      },
      text,
    );
    host.append(line);
  }

  // Message blank tiles for Valentine's letters twist
  const note = b.blanks.length ? h('div', { style: { margin: '0 0 8px' } }) : null;
  const combinedRoute = (): number[] => (b.twoBunnies ? [...routes.r, ...routes.b] : routes.r);
  const blankSteps = new Set(b.blanks);

  const drawNote = (): void => {
    if (!note) return;
    const word = done && b.word ? b.word : spell(b, combinedRoute());
    const row = h(
      'div',
      { style: { display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'wrap' } },
      h('span', { style: { fontSize: '20px', marginRight: '2px' } }, '🐇'),
      ...b.blanks.map((n, idx) => {
        const ch = word[idx] ?? '_';
        const filled = ch !== '_';
        return h(
          'span',
          {
            style: {
              minWidth: '34px',
              height: '38px',
              display: 'grid',
              placeItems: 'center',
              borderRadius: '6px',
              border: `2px ${done ? 'solid #c9a227' : 'dashed #c2185b'}`,
              fontWeight: '700',
              fontSize: done ? '20px' : filled ? '16px' : '14px',
              background: done ? '#ffd54f' : filled ? '#fce4ec' : '#fff',
              color: done ? '#7a1f3d' : filled ? '#ad1457' : '#8a7a86',
              padding: '0 6px',
            },
          },
          done ? ch : filled ? `${n}:${ch}` : String(n),
        );
      }),
    );
    note.replaceChildren(row);
  };
  if (note) host.append(note);

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', String(W));
  svg.setAttribute('height', String(Hpx));
  svg.setAttribute('viewBox', `0 0 ${W} ${Hpx}`);
  Object.assign(svg.style, { touchAction: 'none', userSelect: 'none', display: 'block' });
  host.append(svg);

  const flashSpots = (spots: number[]): void => {
    spots.forEach((s) => flashing.add(s));
    blip(140, 120, 40);
    render();
    setTimeout(() => {
      spots.forEach((s) => flashing.delete(s));
      render();
    }, 400);
  };

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

  const owner = (i: number): 'r' | 'b' | null =>
    routes.r.includes(i) ? 'r' : b.twoBunnies && routes.b.includes(i) ? 'b' : null;

  const canTake = (which: 'r' | 'b', i: number): boolean => {
    if (!b.twoBunnies || b.dark[i]) return true;
    const col = b.colour[i];
    const want = which === 'r' ? 'r' : secTone;
    return !col || col === 'w' || col === want;
  };

  const floorOf = (which: 'r' | 'b'): number =>
    which === 'r' ? (b.redStart === undefined ? 0 : 1) : b.blueStart === undefined ? 0 : 1;

  let moved = false;
  let wasBunny = false;

  svg.addEventListener('pointerdown', (e) => {
    if (done) return;
    const i = spotAt(e, false);
    if (i === undefined) return;
    const mine = owner(i);
    moved = false;
    wasBunny = false;

    if (mine) {
      active = mine;
      lastBunny = mine;
      const route = routes[mine];
      wasBunny = i === route[route.length - 1];
      route.length = Math.max(floorOf(mine), route.indexOf(i) + 1);
    } else {
      const candidates: ('r' | 'b')[] = b.twoBunnies
        ? lastBunny === 'b'
          ? ['b', 'r']
          : ['r', 'b']
        : ['r'];
      const adjacentBunnies = candidates.filter((t) => {
        const route = routes[t];
        const last = route[route.length - 1];
        return last === undefined || (b.hops[last] ?? []).includes(i);
      });
      if (!adjacentBunnies.length) {
        blip(150, 80, 25);
        return;
      }
      const neighborBunny = adjacentBunnies.find((t) => canTake(t, i));
      if (!neighborBunny) {
        const blocked = adjacentBunnies[0] as 'r' | 'b';
        const last = routes[blocked][routes[blocked].length - 1];
        flashSpots(last !== undefined ? [last, i] : [i]);
        return;
      }
      active = neighborBunny;
      lastBunny = neighborBunny;
      routes[neighborBunny].push(i);
      blip(500 + routes[neighborBunny].length * 12, 30, 6);
    }
    try {
      svg.setPointerCapture(e.pointerId);
    } catch {
      // Synthetic pointer: no capture needed
    }
    drawNote();
    render();
  });

  svg.addEventListener('pointermove', (e) => {
    if (!active) return;
    const j = spotAt(e, true);
    const route = routes[active];
    const last = route[route.length - 1];
    if (j === undefined || j === last) return;
    const floor = floorOf(active);
    if (route.length > floor && route[route.length - 2] === j) {
      route.pop();
    } else if (last !== undefined && (b.hops[last] ?? []).includes(j) && owner(j) === null) {
      if (!canTake(active, j)) {
        flashSpots([last, j]);
        return;
      }
      route.push(j);
    } else {
      return;
    }
    moved = true;
    blip(500 + route.length * 12, 25, 4);
    drawNote();
    render();
  });

  const release = (): void => {
    if (!active) return;
    const cur = active;
    active = null;
    const route = routes[cur];
    const floor = floorOf(cur);
    if (wasBunny && !moved && route.length > floor) {
      route.pop();
      blip(300, 40, 8);
    }
    settle();
  };
  svg.addEventListener('pointerup', release);
  svg.addEventListener('pointercancel', release);

  const settle = (): void => {
    const full = combinedRoute();
    if (solved(b, full)) {
      done = true;
      [660, 880, 1100, 1320].forEach((f, k) => setTimeout(() => blip(f, 150), k * 110));
      navigator.vibrate?.([20, 40, 20]);
      drawNote();
      render();
      hooks.solved();
    } else {
      drawNote();
      render();
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
    const centre = ([r, c]: Spot): [number, number] => [c * cell + cell / 2, r * cell + cell / 2];
    const full = combinedRoute();
    const visitedSet = new Set(full);

    const lastR = routes.r[routes.r.length - 1];
    const lastB = b.twoBunnies ? routes.b[routes.b.length - 1] : undefined;
    const reach = new Set<number>();
    if (!done) {
      if (lastR !== undefined) {
        for (const j of b.hops[lastR] ?? []) if (owner(j) === null && canTake('r', j)) reach.add(j);
      }
      if (lastB !== undefined) {
        for (const j of b.hops[lastB] ?? []) if (owner(j) === null && canTake('b', j)) reach.add(j);
      }
    }

    const stepNumber = new Map<number, number>();
    routes.r.forEach((i, idx) => stepNumber.set(i, idx + 1));
    if (b.twoBunnies) routes.b.forEach((i, idx) => stepNumber.set(i, idx + 1));

    // Lawn / coloured / shadowed squares
    b.spots.forEach(([r, c], i) => {
      const inDark = b.dark[i];
      const col = b.colour[i];
      const flash = flashing.has(i);
      const fill = flash
        ? '#ff8a80'
        : inDark && !done
          ? '#4b4859'
          : inDark && done && !visitedSet.has(i)
            ? '#d7ccc8'
            : col
              ? (TINT[col] ?? '#e3f2d9')
              : '#e3f2d9';
      const stroke = flash ? '#d32f2f' : inDark && !done ? '#7e7894' : col ? '#d8d0c5' : 'none';
      add('rect', {
        x: c * cell + 2,
        y: r * cell + 2,
        width: cell - 4,
        height: cell - 4,
        rx: 8,
        fill,
        stroke,
        'stroke-width': flash ? 3 : 1.5,
      });
      if (inDark && !done && !visitedSet.has(i)) {
        add(
          'text',
          {
            x: c * cell + cell / 2,
            y: r * cell + cell * 0.62,
            'text-anchor': 'middle',
            'font-size': cell * 0.36,
            'font-weight': 700,
            fill: '#b0aac0',
          },
          '?',
        );
      } else if (inDark && done && !visitedSet.has(i)) {
        add(
          'text',
          {
            x: c * cell + cell / 2,
            y: r * cell + cell * 0.64,
            'text-anchor': 'middle',
            'font-size': cell * 0.4,
          },
          '🪨',
        );
      }
    });

    // Portion edges (Courses)
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

    // Snowflakes: frosty frame, mirror line with ❄, and ghost mirror trail strokes
    if (b.frame) {
      const f = b.frame;
      const [fx, fy] = [f.left * cell + 3, f.top * cell + 3];
      const [fw, fh] = [(f.right - f.left + 1) * cell - 6, (f.bottom - f.top + 1) * cell - 6];
      add('rect', {
        x: fx,
        y: fy,
        width: fw,
        height: fh,
        rx: 10,
        fill: 'rgba(154, 215, 255, 0.08)',
        stroke: '#5aa9e6',
        'stroke-width': 2.5,
        'stroke-dasharray': '7 5',
      });
      const vertical = f.axis === 'v';
      const mid = vertical
        ? ((f.left + f.right + 1) * cell) / 2
        : ((f.top + f.bottom + 1) * cell) / 2;
      const [x1, y1, x2, y2] = vertical ? [mid, fy, mid, fy + fh] : [fx, mid, fx + fw, mid];
      add('line', {
        x1,
        y1,
        x2,
        y2,
        stroke: '#5aa9e6',
        'stroke-width': 2,
        'stroke-dasharray': '3 4',
      });
      for (const [x, y] of [
        [x1, y1],
        [x2, y2],
      ]) {
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
      const drawn = trailSegments(b, full);
      for (const seg of drawn) {
        if (!inside(f, seg)) continue;
        const m = mirrorKey(f, seg);
        if (drawn.has(m)) continue;
        const [r1 = 0, c1 = 0, r2 = 0, c2 = 0] = m.slice(1).split(',').map(Number);
        add('line', {
          x1: c1 * cell + cell / 2,
          y1: r1 * cell + cell / 2,
          x2: c2 * cell + cell / 2,
          y2: r2 * cell + cell / 2,
          stroke: '#5aa9e6',
          'stroke-width': cell * 0.16,
          'stroke-dasharray': '4 5',
          'stroke-linecap': 'round',
          opacity: 0.75,
        });
      }
    }

    // Bunny trail(s)
    for (const [which, path] of [
      ['r', routes.r],
      ['b', routes.b],
    ] as const) {
      const trailCol = done
        ? '#e0b030'
        : b.twoBunnies
          ? TRAIL[which === 'r' ? 'r' : secTone]
          : '#9ccc65';
      path.forEach((i, n) => {
        if (!n) return;
        const prev = path[n - 1] as number;
        const [x1, y1] = centre(b.spots[prev] as Spot);
        const [x2, y2] = centre(b.spots[i] as Spot);
        const underground = b.burrow.has(`${prev},${i}`);
        add('line', {
          x1,
          y1,
          x2,
          y2,
          stroke: trailCol,
          'stroke-width': cell * 0.28,
          'stroke-linecap': 'round',
          'stroke-dasharray': underground ? '3 5' : '',
          opacity: 0.85,
        });
      });
    }

    // Burrow holes
    (panel.burrows ?? []).forEach((pair, k) =>
      pair.forEach(([r, c]) =>
        add('circle', {
          cx: c * cell + cell * 0.22,
          cy: r * cell + cell * 0.78,
          r: cell * 0.13,
          fill: BURROW[k % BURROW.length] as string,
          stroke: '#fff',
          'stroke-width': 1.5,
        }),
      ),
    );

    // Eggs, letters, step numbers, and bunnies
    b.spots.forEach((s, i) => {
      const [x, y] = centre(s);
      const n = stepNumber.get(i);
      const g = b.given.get(i);
      const letter = b.letterAt.get(i);
      const isBunny = i === lastR || (b.twoBunnies && i === lastB);

      if (reach.has(i)) {
        add('circle', {
          cx: x,
          cy: y,
          r: cell * 0.36,
          fill: 'none',
          stroke: '#43a047',
          'stroke-width': 2.5,
          'stroke-dasharray': '4 3',
        });
      }

      if (g !== undefined || letter !== undefined) {
        const gold = panel.golden && key(panel.golden) === key(s);
        const eggTone: 'r' | 'b' = b.twoBunnies && b.colour[i] === secTone ? 'b' : 'r';
        const myRoute = routes[eggTone];
        const byMe = !b.twoBunnies || owner(i) === eggTone;
        const late = g !== undefined && n === undefined && myRoute.length >= g;
        const wrong =
          (g !== undefined && n !== undefined && (!byMe || n !== g)) ||
          (letter !== undefined && n !== undefined && (owner(i) !== 'r' || !blankSteps.has(n)));
        const right =
          (g !== undefined && byMe && n === g) ||
          (letter !== undefined && n !== undefined && owner(i) === 'r' && blankSteps.has(n));
        const strokeCol = b.twoBunnies
          ? b.colour[i] === secTone
            ? TRAIL[secTone]
            : '#d9534f'
          : gold
            ? '#c9a227'
            : '#b89a6a';

        add('ellipse', {
          cx: x,
          cy: y,
          rx: cell * 0.27,
          ry: cell * 0.33,
          fill:
            done || gold ? '#ffd54f' : wrong || late ? '#ff8a80' : right ? '#a5d6a7' : '#fffaf0',
          stroke: strokeCol,
          'stroke-width': 2.2,
        });
        add(
          'text',
          {
            x,
            y: y + cell * 0.12,
            'text-anchor': 'middle',
            'font-size': cell * 0.3,
            'font-weight': 700,
            fill: letter ? '#c2185b' : '#4a3a20',
          },
          letter ?? String(g),
        );
      } else if (n !== undefined) {
        add(
          'text',
          {
            x,
            y: y + cell * 0.12,
            'text-anchor': 'middle',
            'font-size': cell * 0.3,
            'font-weight': 700,
            fill: done ? '#a07800' : b.dark[i] ? '#ffffff' : '#33691e',
          },
          String(n),
        );
      }

      if (isBunny) {
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
      }
    });

    // Legacy parade flags
    if (flagged) {
      const firsts = firstVisits(b, full);
      const flag = (f: number | null, first: number, x: number, y: number): void => {
        if (f === null) return;
        const colour =
          first === f
            ? '#2f8a45'
            : (first && first !== f) || (!first && full.length >= f)
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

    const left = b.length - full.length;
    hooks.status(
      done
        ? b.twoBunnies
          ? 'Both bunnies home!'
          : 'Home!'
        : left > 0
          ? `${left} hop${left === 1 ? '' : 's'} left`
          : 'Check your route — a clue or rule isn’t met yet',
    );
  };

  drawNote();
  render();
  return () => ({
    done,
    redTrail: routes.r.map((idx) => b.spots[idx]),
    ...(b.twoBunnies ? { secondTrail: routes.b.map((idx) => b.spots[idx]) } : {}),
  });
}
