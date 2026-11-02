/**
 * Christmas · The Pie in a Tin (stray, from Thanksgiving). Santa's been
 * left pumpkin pie, and the rest, in mismatched slices. Fit every slice
 * into the round tin, no two neighbours of the same flavour or the same
 * width.
 */
import { type Proto, h } from '../kit';

export interface Slice {
  /** Width in twelfths of the tin. */
  width: number;
  flavour: string;
}

export const LEVELS: { name: string; slices: Slice[]; useAll: boolean }[] = [
  {
    name: 'Level 1: the knack of it',
    useAll: true,
    slices: [
      { width: 3, flavour: 'apple' },
      { width: 2, flavour: 'pumpkin' },
      { width: 1, flavour: 'pecan' },
      { width: 3, flavour: 'pecan' },
      { width: 1, flavour: 'pecan' },
      { width: 2, flavour: 'pumpkin' },
    ],
  },
  {
    // More slices than fit: which ones make the pie is half the puzzle (one pie works).
    name: "Level 2: Santa's tin",
    useAll: false,
    slices: [
      { width: 3, flavour: 'cherry' },
      { width: 3, flavour: 'pecan' },
      { width: 3, flavour: 'pumpkin' },
      { width: 3, flavour: 'apple' },
      { width: 1, flavour: 'cherry' },
      { width: 1, flavour: 'pumpkin' },
      { width: 2, flavour: 'pumpkin' },
      { width: 3, flavour: 'pumpkin' },
      { width: 1, flavour: 'pumpkin' },
    ],
  },
];
export const TIN = 12;

/** The slices in the tin, clockwise (indices into `slices`): a whole pie, neighbours all different. */
export function fits(slices: Slice[], order: number[], useAll: boolean): boolean {
  if (useAll && order.length !== slices.length) return false;
  if (order.reduce((sum, i) => sum + (slices[i]?.width ?? 0), 0) !== TIN) return false;
  return order.every((s, i) => {
    const a = slices[s];
    const b = slices[order[(i + 1) % order.length] as number];
    return a && b && a.flavour !== b.flavour && a.width !== b.width;
  });
}

const FILL: Record<string, string> = {
  apple: '#e9c46a',
  pumpkin: '#e07a2d',
  pecan: '#8a5a3b',
  cherry: '#c2273b',
};

export const pietin: Proto = {
  id: 'pietin',
  title: 'The Pie in a Tin',
  room: 'Christmas',
  kind: 'stray',
  from: "Clandestiny's 13 Easy Pieces and Dr. Brain's 3-D Construction (packing); twist: wedges round a circle",
  rules:
    'Click a slice to put it in the tin, next round clockwise; click a slice in the tin to take it out. Fill the tin exactly. Round the whole pie (last slice next to the first), no two neighbours may be the same flavour, or the same width. Level 1 uses every slice; in level 2 some slices are left over.',
  mount(host, ctx) {
    let level = 0;
    let order: number[] = [];
    const tabs = h('div', { style: { display: 'flex', gap: '6px', marginBottom: '8px' } });
    const view = h('div', {});
    const ns = 'http://www.w3.org/2000/svg';
    const render = (): void => {
      const { slices: SLICES, useAll } = LEVELS[level] as (typeof LEVELS)[number];
      tabs.replaceChildren(
        ...LEVELS.map((l, i) =>
          h(
            'button',
            {
              class: level === i ? 'on' : '',
              onclick: () => ((level = i), (order = []), render()),
            },
            l.name,
          ),
        ),
      );
      const svg = document.createElementNS(ns, 'svg');
      svg.setAttribute('viewBox', '-120 -120 240 240');
      svg.setAttribute('width', '260');
      svg.setAttribute('height', '260');
      const rim = document.createElementNS(ns, 'circle');
      Object.entries({ r: 110, fill: '#f3efe6', stroke: '#b8a98c', 'stroke-width': 3 }).forEach(
        ([k, v]) => rim.setAttribute(k, String(v)),
      );
      svg.append(rim);
      let at = 0;
      order.forEach((s, i) => {
        const slice = SLICES[s];
        if (!slice) return;
        const a0 = -Math.PI / 2 + (at / TIN) * Math.PI * 2;
        const a1 = -Math.PI / 2 + ((at + slice.width) / TIN) * Math.PI * 2;
        at += slice.width;
        const p = document.createElementNS(ns, 'path');
        const r = 104;
        const d = `M0 0 L${Math.cos(a0) * r} ${Math.sin(a0) * r} A${r} ${r} 0 ${slice.width > 6 ? 1 : 0} 1 ${Math.cos(a1) * r} ${Math.sin(a1) * r} Z`;
        Object.entries({
          d,
          fill: FILL[slice.flavour],
          stroke: '#fff',
          'stroke-width': 2,
          cursor: 'pointer',
        }).forEach(([k, v]) => p.setAttribute(k, String(v)));
        p.addEventListener('click', () => {
          order.splice(i, 1);
          render();
        });
        svg.append(p);
      });
      const loose = SLICES.map((s, i) => ({ s, i })).filter(({ i }) => !order.includes(i));
      view.replaceChildren(
        h(
          'div',
          { style: { display: 'flex', gap: '30px', alignItems: 'center', flexWrap: 'wrap' } },
          svg,
          h(
            'div',
            {},
            h('div', { style: { fontWeight: '700', marginBottom: '6px' } }, 'Slices'),
            ...loose.map(({ s, i }) =>
              h(
                'button',
                {
                  style: {
                    display: 'block',
                    margin: '4px 0',
                    borderLeft: `14px solid ${FILL[s.flavour]}`,
                  },
                  disabled:
                    order.reduce((sum, k) => sum + (SLICES[k]?.width ?? 0), 0) + s.width > TIN
                      ? 'disabled'
                      : null,
                  onclick: () => {
                    order.push(i);
                    render();
                  },
                },
                `${s.flavour}, ${s.width}/12 wide`,
              ),
            ),
          ),
        ),
      );
      const filled = order.reduce((sum, k) => sum + (SLICES[k]?.width ?? 0), 0);
      if (fits(SLICES, order, useAll)) {
        if (level === LEVELS.length - 1) ctx.solved();
        else ctx.status('Level 1 done. On to level 2!');
      } else
        ctx.status(
          filled === TIN
            ? 'The tin is full, but some neighbours clash.'
            : `${filled} of ${TIN} twelfths filled`,
        );
    };
    host.append(tabs, view);
    render();
  },
};
