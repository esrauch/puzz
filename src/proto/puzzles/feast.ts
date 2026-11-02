/**
 * Thanksgiving · Centrepiece: the Feast. Ten seats round the table, seven
 * dishes, everyone wanting something in front of them. Pass a dish left or
 * right: it slides over any dishes in its way to the next empty place.
 */
import { type Proto, h } from '../kit';

export const SEATS = 10;
export const DISHES: Record<string, string> = {
  T: 'turkey',
  P: 'pumpkin pie',
  C: 'cornucopia',
  G: 'gravy',
  R: 'cranberries',
  S: 'stuffing',
  M: 'mash',
};
/** What each seat wants ('.' for nothing). */
export const WISHES = 'T.PC.GR.SM';
export const START = 'P.CG.RTSM.';

/** Pass the dish at seat i (dir ±1): it slides to the first empty seat that way. */
export function pass(table: string, i: number, dir: 1 | -1): string | null {
  if (table[i] === '.') return null;
  let j = i;
  for (let step = 0; step < SEATS; step++) {
    j = (j + dir + SEATS) % SEATS;
    if (table[j] === '.') {
      const out = [...table];
      out[j] = table[i] as string;
      out[i] = '.';
      return out.join('');
    }
  }
  return null;
}

export const feast: Proto = {
  id: 'feast',
  title: 'The Feast',
  room: 'Thanksgiving',
  kind: 'centrepiece',
  from: "11th Hour's Plates (how far a plate goes depends on the plates in the way); twist: everyone wants something different",
  rules:
    'Each place at the table says what that person wants. Click ◀ or ▶ on a dish to pass it that way: it slides past any dishes in the way to the next empty place. Give everyone what they want. It can be done in 10 passes.',
  mount(host, ctx) {
    let table = START;
    let passes = 0;
    const view = h('div', {});
    const render = (): void => {
      const radius = 170;
      const box = h('div', { style: { position: 'relative', width: '440px', height: '440px' } });
      box.append(
        h('div', {
          style: {
            position: 'absolute',
            left: '110px',
            top: '110px',
            width: '220px',
            height: '220px',
            borderRadius: '50%',
            background: '#e8d9bf',
            border: '2px solid #c4b08d',
          },
        }),
      );
      for (let i = 0; i < SEATS; i++) {
        const a = -Math.PI / 2 + (i / SEATS) * Math.PI * 2;
        const x = 220 + Math.cos(a) * radius - 55;
        const y = 220 + Math.sin(a) * radius - 34;
        const d = table[i] as string;
        const want = WISHES[i] as string;
        const happy = d !== '.' && d === want;
        box.append(
          h(
            'div',
            {
              style: {
                position: 'absolute',
                left: `${x}px`,
                top: `${y}px`,
                width: '110px',
                textAlign: 'center',
                fontSize: '12px',
              },
            },
            h(
              'div',
              { style: { color: '#6b6676' } },
              want === '.' ? '(wants nothing)' : `wants ${DISHES[want]}`,
            ),
            h(
              'div',
              {
                style: {
                  padding: '4px',
                  borderRadius: '6px',
                  background: d === '.' ? '#f3efe6' : happy ? '#c9ecc9' : '#fff',
                  border: '1px solid #d9d3c7',
                  fontWeight: '700',
                  minHeight: '20px',
                },
              },
              d === '.' ? '' : DISHES[d],
            ),
            d === '.'
              ? ''
              : h(
                  'div',
                  {},
                  h('button', { style: { padding: '0 6px' }, onclick: () => act(i, -1) }, '◀'),
                  h('button', { style: { padding: '0 6px' }, onclick: () => act(i, 1) }, '▶'),
                ),
          ),
        );
      }
      view.replaceChildren(box);
      if (table === WISHES) ctx.solved();
      else ctx.status(`${passes} passes`);
    };
    const act = (i: number, dir: 1 | -1): void => {
      const next = pass(table, i, dir);
      if (!next) return;
      table = next;
      passes++;
      render();
    };
    host.append(view);
    render();
  },
};
