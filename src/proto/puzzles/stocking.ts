/**
 * Thanksgiving · The Stuffed Stocking (stray, from Christmas). A row of
 * identical Christmas stockings, and one of them has the Thanksgiving
 * stuffing in it. Find it with the kitchen scales, in only so many
 * weighings. The scales never let you get lucky: until your weighings pin
 * the stocking down, it could always be another one.
 */
import { type Proto, h } from '../kit';

export interface Level {
  name: string;
  stockings: number;
  weighings: number;
  /** Is the odd one known to be heavier (stuffed), or could it be lighter (empty)? */
  heavyOnly: boolean;
}

export const LEVELS: Level[] = [
  { name: 'Level 1: three stockings', stockings: 3, weighings: 1, heavyOnly: true },
  { name: 'Level 2: nine stockings', stockings: 9, weighings: 2, heavyOnly: true },
  { name: 'Level 3: twelve, heavy or light', stockings: 12, weighings: 3, heavyOnly: false },
];

/** A possibility: stocking i is the odd one, heavier (+1) or lighter (−1). */
export interface Suspect {
  i: number;
  sign: 1 | -1;
}
export type Tip = 'left' | 'right' | 'level';

export function suspects(level: Level): Suspect[] {
  return Array.from({ length: level.stockings }, (_, i) => i).flatMap((i) =>
    level.heavyOnly
      ? [{ i, sign: 1 as const }]
      : [
          { i, sign: 1 as const },
          { i, sign: -1 as const },
        ],
  );
}

/** How the scales tip if `s` is the odd one, with `left` and `right` on the pans. */
export function tipFor(s: Suspect, left: number[], right: number[]): Tip {
  if (left.includes(s.i)) return s.sign > 0 ? 'left' : 'right';
  if (right.includes(s.i)) return s.sign > 0 ? 'right' : 'left';
  return 'level';
}

/**
 * Weigh: the scales tip whichever way keeps the most possibilities open (so
 * only a plan that works every way round can win). Returns the tip and what's
 * still possible.
 */
export function weigh(
  open: Suspect[],
  left: number[],
  right: number[],
): { tip: Tip; open: Suspect[] } {
  const by: Record<Tip, Suspect[]> = { left: [], right: [], level: [] };
  for (const s of open) by[tipFor(s, left, right)].push(s);
  const tip = (['level', 'left', 'right'] as Tip[]).reduce(
    (best, t) => (by[t].length > by[best].length ? t : best),
    'level',
  );
  return { tip, open: by[tip] };
}

export const stocking: Proto = {
  id: 'stocking',
  title: 'The Stuffed Stocking',
  room: 'Thanksgiving',
  kind: 'stray',
  from: "the classic counterfeit-coin weighing puzzle, with 11th Hour's Cash Register and Island of Dr. Brain's balances; twist: the scales never let you get lucky",
  rules:
    "One stocking is stuffed (heavier). Click a stocking to put it on the left pan, the right pan, or back on the side. Put the same number on each pan and Weigh. When you're sure which it is, pick it. The scales never let you get lucky: until your weighings pin it down, it could always be another. In level 3 it might be stuffed (heavier) or empty (lighter), and you have to say which.",
  mount(host, ctx) {
    let level = 0;
    let open: Suspect[] = [];
    let place: ('left' | 'right' | null)[] = [];
    let log: string[] = [];
    let used = 0;
    let over = false;
    const tabs = h('div', {
      style: { display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' },
    });
    const view = h('div', {});
    const start = (n: number): void => {
      level = n;
      const lv = LEVELS[n] as Level;
      open = suspects(lv);
      place = Array.from({ length: lv.stockings }, () => null);
      log = [];
      used = 0;
      over = false;
      render();
    };
    const guess = (i: number, sign: 1 | -1): void => {
      const lv = LEVELS[level] as Level;
      const right = open.length === 1 && open[0]?.i === i && open[0]?.sign === sign;
      over = true;
      if (right) {
        if (level === LEVELS.length - 1) ctx.solved();
        else ctx.status(`Found it! On to level ${level + 2}.`);
      } else {
        const other = open.find((s) => s.i !== i || s.sign !== sign);
        ctx.status(
          `Not sure enough: it could have been stocking ${(other?.i ?? 0) + 1}${lv.heavyOnly ? '' : other?.sign === 1 ? ' (stuffed)' : ' (empty)'}. Try the level again.`,
        );
      }
      render();
    };
    const render = (): void => {
      const lv = LEVELS[level] as Level;
      tabs.replaceChildren(
        ...LEVELS.map((l, i) =>
          h('button', { class: level === i ? 'on' : '', onclick: () => start(i) }, l.name),
        ),
      );
      const left = place.flatMap((p, i) => (p === 'left' ? [i] : []));
      const right = place.flatMap((p, i) => (p === 'right' ? [i] : []));
      const sock = (i: number): HTMLElement =>
        h(
          'button',
          {
            style: { width: '46px', height: '56px', fontSize: '22px', padding: '0' },
            disabled: over ? 'disabled' : null,
            onclick: () => {
              place[i] = place[i] === null ? 'left' : place[i] === 'left' ? 'right' : null;
              render();
            },
          },
          h('div', {}, '🧦'),
          h('div', { style: { fontSize: '12px' } }, String(i + 1)),
        );
      const pan = (side: 'left' | 'right'): HTMLElement =>
        h(
          'div',
          {
            style: {
              minWidth: '220px',
              minHeight: '70px',
              padding: '6px',
              background: '#fff',
              border: '2px solid #c8bfae',
              borderRadius: '0 0 60px 60px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '4px',
              justifyContent: 'center',
            },
          },
          ...place.flatMap((p, i) => (p === side ? [sock(i)] : [])),
        );
      const weighBtn = h(
        'button',
        {
          class: 'on',
          disabled:
            over || used >= lv.weighings || !left.length || left.length !== right.length
              ? 'disabled'
              : null,
          onclick: () => {
            const result = weigh(open, left, right);
            open = result.open;
            used++;
            const names = (xs: number[]): string => xs.map((x) => x + 1).join(', ');
            log.push(
              `${names(left)}  vs  ${names(right)}:  ${result.tip === 'level' ? 'level' : `the ${result.tip} pan is heavier`}`,
            );
            render();
          },
        },
        `Weigh (${lv.weighings - used} left)`,
      );
      const picks = h(
        'div',
        { style: { display: 'flex', gap: '4px', flexWrap: 'wrap' } },
        ...Array.from({ length: lv.stockings }, (_, i) =>
          lv.heavyOnly
            ? h(
                'button',
                { disabled: over ? 'disabled' : null, onclick: () => guess(i, 1) },
                `#${i + 1}`,
              )
            : h(
                'span',
                { style: { display: 'inline-flex' } },
                h(
                  'button',
                  {
                    disabled: over ? 'disabled' : null,
                    onclick: () => guess(i, 1),
                    title: 'stuffed (heavier)',
                  },
                  `#${i + 1}+`,
                ),
                h(
                  'button',
                  {
                    disabled: over ? 'disabled' : null,
                    onclick: () => guess(i, -1),
                    title: 'empty (lighter)',
                  },
                  `−`,
                ),
              ),
        ),
      );
      view.replaceChildren(
        h(
          'div',
          {
            style: { display: 'flex', gap: '24px', alignItems: 'flex-start', margin: '6px 0 12px' },
          },
          h('div', {}, h('div', {}, 'Left pan'), pan('left')),
          h('div', {}, h('div', {}, 'Right pan'), pan('right')),
        ),
        h('div', {}, 'On the side:'),
        h(
          'div',
          { style: { display: 'flex', gap: '4px', flexWrap: 'wrap', margin: '4px 0 12px' } },
          ...place.flatMap((p, i) => (p === null ? [sock(i)] : [])),
        ),
        weighBtn,
        h('ol', {}, ...log.map((l) => h('li', {}, l))),
        h(
          'div',
          { style: { margin: '6px 0' } },
          lv.heavyOnly ? 'The stuffed one is…' : 'The odd one is… (+ stuffed, − empty)',
        ),
        picks,
      );
      if (!over) ctx.status(`${used} of ${lv.weighings} weighings used`);
    };
    host.append(tabs, view);
    start(0);
  },
};
