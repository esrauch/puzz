/**
 * Halloween · Centrepiece: the Spider's Web (Hashi, "build bridges"). The
 * friendly spider's web needs re-spinning. Each knot says how many threads
 * leave it. Threads run straight across or down, one or two between a pair
 * of knots, never crossing; and the finished web must hold together as one.
 * Most players won't know the puzzle, so it ramps up over four webs.
 */
import { type Proto, h } from '../kit';

export const LEVELS: { name: string; rows: string[] }[] = [
  { name: 'Web 1: first threads', rows: ['.....', '2...4', '.....', '....2', '.....'] },
  { name: 'Web 2: the corner', rows: ['3.4..4', '......', '2..2.4', '..1...', '......', '......'] },
  {
    name: 'Web 3: the porch',
    rows: ['.......', '.3...2.', '..3.3..', '2......', '..1..2.', '.3..2..', '3..2.2.'],
  },
  {
    name: 'Web 4: the great web',
    rows: [
      '.2..1...2',
      '...2...1.',
      '.........',
      '.3.7..3.4',
      '.........',
      '2..7...2.',
      '.....2..1',
      '1..3.....',
      '.2...6.3.',
    ],
  },
];

export interface Knot {
  r: number;
  c: number;
  need: number;
}

export interface Link {
  a: number;
  b: number;
  /** The empty squares the thread runs over. */
  cells: string[];
  across: boolean;
}

export interface Web {
  knots: Knot[];
  links: Link[];
  /** Which links can't both have threads (they'd cross). */
  crosses: Set<string>;
  width: number;
  height: number;
}

export function parse(rows: string[]): Web {
  const knots: Knot[] = [];
  const at = new Map<string, number>();
  rows.forEach((row, r) =>
    [...row].forEach((ch, c) => {
      if (ch === '.') return;
      at.set(`${r},${c}`, knots.length);
      knots.push({ r, c, need: Number(ch) });
    }),
  );
  const height = rows.length;
  const width = (rows[0] ?? '').length;
  const links: Link[] = [];
  knots.forEach((k, i) => {
    for (const [dr, dc] of [
      [0, 1],
      [1, 0],
    ] as const) {
      const cells: string[] = [];
      let r = k.r + dr;
      let c = k.c + dc;
      while (r < height && c < width && !at.has(`${r},${c}`)) {
        cells.push(`${r},${c}`);
        r += dr;
        c += dc;
      }
      const j = at.get(`${r},${c}`);
      if (j !== undefined) links.push({ a: i, b: j, cells, across: dr === 0 });
    }
  });
  const crosses = new Set<string>();
  links.forEach((x, i) =>
    links.forEach((y, j) => {
      if (i < j && x.across !== y.across && x.cells.some((cell) => y.cells.includes(cell))) {
        crosses.add(`${i},${j}`);
        crosses.add(`${j},${i}`);
      }
    }),
  );
  return { knots, links, crosses, width, height };
}

/** Is the web finished: every knot's count met, and all one piece? */
export function finished(web: Web, threads: number[]): boolean {
  const total = web.knots.map(() => 0);
  web.links.forEach((l, i) => {
    total[l.a] = (total[l.a] ?? 0) + (threads[i] ?? 0);
    total[l.b] = (total[l.b] ?? 0) + (threads[i] ?? 0);
  });
  if (web.knots.some((k, i) => total[i] !== k.need)) return false;
  const seen = new Set([0]);
  const stack = [0];
  while (stack.length) {
    const x = stack.pop() as number;
    web.links.forEach((l, i) => {
      if (!threads[i]) return;
      const y = l.a === x ? l.b : l.b === x ? l.a : -1;
      if (y >= 0 && !seen.has(y)) {
        seen.add(y);
        stack.push(y);
      }
    });
  }
  return seen.size === web.knots.length;
}

/** Count solutions (up to `limit`), for the tests: each web should have exactly one. */
export function countSolutions(web: Web, limit = 2): number {
  const threads: (number | null)[] = web.links.map(() => null);
  const incident = web.knots.map((_, k) =>
    web.links.flatMap((l, i) => (l.a === k || l.b === k ? [i] : [])),
  );
  let found = 0;
  const feasible = (): boolean =>
    web.knots.every((k, v) => {
      let sum = 0;
      let free = 0;
      for (const i of incident[v] ?? []) {
        const t = threads[i];
        if (t === null || t === undefined) free += 2;
        else sum += t;
      }
      return sum <= k.need && sum + free >= k.need;
    });
  const go = (i: number): void => {
    if (found >= limit) return;
    if (i === web.links.length) {
      if (finished(web, threads as number[])) found++;
      return;
    }
    for (const t of [0, 1, 2]) {
      if (t && threads.some((u, j) => u && web.crosses.has(`${i},${j}`))) break;
      threads[i] = t;
      if (feasible()) go(i + 1);
      threads[i] = null;
    }
  };
  go(0);
  return found;
}

export const web: Proto = {
  id: 'web',
  title: "The Spider's Web",
  room: 'Halloween',
  kind: 'centrepiece',
  from: 'Hashi ("build bridges"), a modern logic classic; twist: a friendly spider re-spinning its web, ramped over four webs',
  rules:
    "Each knot says how many threads leave it. Click a knot, then another knot straight across or down from it, to add a thread between them; again for a second; a third time takes them away. Threads can't cross each other or pass through knots, and the finished web must all hang together as one. Knots go green when they have the right number.",
  mount(host, ctx) {
    let level = 0;
    let w = parse((LEVELS[0] as { rows: string[] }).rows);
    let threads: number[] = [];
    let picked: number | null = null;
    const tabs = h('div', {
      style: { display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' },
    });
    const board = h('div', {});
    const ns = 'http://www.w3.org/2000/svg';
    const cell = 52;
    const start = (n: number): void => {
      level = n;
      w = parse((LEVELS[n] as { rows: string[] }).rows);
      threads = w.links.map(() => 0);
      picked = null;
      render();
    };
    const click = (k: number): void => {
      if (picked === null || picked === k) {
        picked = picked === k ? null : k;
        return render();
      }
      const i = w.links.findIndex(
        (l) => (l.a === picked && l.b === k) || (l.b === picked && l.a === k),
      );
      if (i < 0) {
        picked = k;
        return render();
      }
      const next = ((threads[i] ?? 0) + 1) % 3;
      if (next > 0 && threads.some((t, j) => t && w.crosses.has(`${i},${j}`))) {
        ctx.status('That thread would cross another.');
        return;
      }
      threads[i] = next;
      picked = null;
      render();
    };
    const render = (): void => {
      tabs.replaceChildren(
        ...LEVELS.map((l, i) =>
          h('button', { class: level === i ? 'on' : '', onclick: () => start(i) }, l.name),
        ),
      );
      const svg = document.createElementNS(ns, 'svg');
      svg.setAttribute('width', String(w.width * cell));
      svg.setAttribute('height', String(w.height * cell));
      svg.style.background = '#2b2a33';
      svg.style.borderRadius = '8px';
      const centre = (k: Knot): [number, number] => [k.c * cell + cell / 2, k.r * cell + cell / 2];
      const add = (tag: string, attrs: Record<string, string | number>): SVGElement => {
        const e = document.createElementNS(ns, tag);
        for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
        svg.append(e);
        return e;
      };
      w.links.forEach((l, i) => {
        const t = threads[i] ?? 0;
        if (!t) return;
        const [x1, y1] = centre(w.knots[l.a] as Knot);
        const [x2, y2] = centre(w.knots[l.b] as Knot);
        const offsets = t === 1 ? [0] : [-4, 4];
        for (const o of offsets)
          add('line', {
            x1: x1 + (l.across ? 0 : o),
            y1: y1 + (l.across ? o : 0),
            x2: x2 + (l.across ? 0 : o),
            y2: y2 + (l.across ? o : 0),
            stroke: '#e8e4f0',
            'stroke-width': 2.5,
          });
      });
      const total = w.knots.map(() => 0);
      w.links.forEach((l, i) => {
        total[l.a] = (total[l.a] ?? 0) + (threads[i] ?? 0);
        total[l.b] = (total[l.b] ?? 0) + (threads[i] ?? 0);
      });
      w.knots.forEach((k, i) => {
        const [x, y] = centre(k);
        const have = total[i] ?? 0;
        const circle = add('circle', {
          cx: x,
          cy: y,
          r: 17,
          fill: have === k.need ? '#5bbf5b' : have > k.need ? '#e2463b' : '#f4f1ea',
          stroke: picked === i ? '#ffcf6b' : '#777',
          'stroke-width': picked === i ? 4 : 1.5,
          style: 'cursor:pointer',
        });
        circle.addEventListener('click', () => click(i));
        const label = add('text', {
          x,
          y: y + 6,
          'text-anchor': 'middle',
          'font-size': 18,
          'font-weight': 700,
          fill: '#23202b',
          'pointer-events': 'none',
        });
        label.textContent = String(k.need);
      });
      board.replaceChildren(svg);
      if (finished(w, threads)) {
        if (level === LEVELS.length - 1) ctx.solved();
        else ctx.status(`Web ${level + 1} spun! On to web ${level + 2}.`);
      } else ctx.status(`${threads.reduce((s, t) => s + t, 0)} threads`);
    };
    host.append(tabs, board);
    start(0);
  },
};
