/**
 * Christmas · The Golden Egg Ornament (stray, from Easter). Hang five
 * ornaments on the tree, the Golden Egg among them, so no two share a row
 * of branches or a diagonal. The tree's a triangle, and a few spots hold
 * candle clips.
 */
import { type Proto, h } from '../kit';

export const ROWS = 7;
/** Spots with candle clips (no ornament there). */
export const CLIPS = new Set(['4,4', '5,4', '4,0']);
export const NEEDED = 5;

export type Spot = [number, number];
/** Two ornaments clash on a row, or either diagonal (down-left keeps the column; down-right keeps row − column). */
export const clash = (a: Spot, b: Spot): boolean =>
  a[0] === b[0] || a[1] === b[1] || a[0] - a[1] === b[0] - b[1];

export function hung(spots: Spot[]): boolean {
  return (
    spots.length === NEEDED && spots.every((a, i) => spots.every((b, j) => i === j || !clash(a, b)))
  );
}

export const ornaments: Proto = {
  id: 'ornaments',
  title: 'The Golden Egg Ornament',
  room: 'Christmas',
  kind: 'stray',
  from: "7th Guest's Queens and Bishops (place pieces where none threaten); twist: a tree is a triangle",
  rules:
    'Click branch spots to hang ornaments (click again to take one down). Hang five, no two in the same row or along either diagonal of the tree. The first four are baubles; the fifth is the Golden Egg. Grey spots hold candle clips. Spots another ornament already rules out are shaded.',
  mount(host, ctx) {
    const spots: Spot[] = [];
    const view = h('div', {});
    const render = (): void => {
      const rows = h('div', { style: { display: 'grid', gap: '4px', width: 'fit-content' } });
      for (let r = 0; r < ROWS; r++) {
        const row = h('div', { style: { display: 'flex', gap: '4px', justifyContent: 'center' } });
        for (let c = 0; c <= r; c++) {
          const here = spots.findIndex(([a, b]) => a === r && b === c);
          const clip = CLIPS.has(`${r},${c}`);
          const ruled = here < 0 && spots.some((s) => clash(s, [r, c]));
          row.append(
            h(
              'button',
              {
                disabled: clip ? 'disabled' : null,
                style: {
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  padding: '0',
                  fontSize: '20px',
                  background: clip ? '#9a9488' : ruled ? '#e6e0d4' : '#e9f5e4',
                },
                onclick: () => {
                  if (here >= 0) spots.splice(here, 1);
                  else if (spots.length < NEEDED) spots.push([r, c]);
                  render();
                },
              },
              here < 0 ? '' : here === NEEDED - 1 ? '🥚' : '●',
            ),
          );
        }
        rows.append(row);
      }
      view.replaceChildren(rows);
      if (hung(spots)) ctx.solved();
      else
        ctx.status(
          `${spots.length} of ${NEEDED} hung${spots.some((a, i) => spots.some((b, j) => i !== j && clash(a, b))) ? ' · two are clashing' : ''}`,
        );
    };
    host.append(view);
    render();
  },
};
