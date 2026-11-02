/**
 * Fourth of July · Centrepiece: the Grand Finale. The fireworks show, one
 * shell launched a beat. Each shell's fuse burns for its own number of beats;
 * schedule the launches so the bursts go off exactly as the show program
 * says.
 */
import { type Proto, h } from '../kit';

export type Colour = 'red' | 'white' | 'blue';
/** The program: which colour bursts on each beat. */
export const PROGRAM: { beat: number; colour: Colour }[] = [
  { beat: 5, colour: 'red' },
  { beat: 6, colour: 'blue' },
  { beat: 7, colour: 'blue' },
  { beat: 8, colour: 'red' },
  { beat: 9, colour: 'white' },
  { beat: 10, colour: 'red' },
  { beat: 11, colour: 'blue' },
];
/** The shells: colour, and fuse length in beats. */
export const ARROWS: { colour: Colour; fuse: number }[] = [
  { colour: 'blue', fuse: 7 },
  { colour: 'blue', fuse: 6 },
  { colour: 'red', fuse: 6 },
  { colour: 'white', fuse: 4 },
  { colour: 'red', fuse: 5 },
  { colour: 'blue', fuse: 3 },
  { colour: 'red', fuse: 4 },
];
/** One shell can be launched a beat, on beats 0–6. */
export const LAUNCH_BEATS = 7;

/** Does a schedule (each arrow's launch beat, or null) make the program? */
export function matches(launch: (number | null)[]): boolean {
  if (launch.some((l) => l === null)) return false;
  if (new Set(launch).size !== launch.length) return false;
  const bursts = new Map<number, Colour>();
  for (const [i, l] of launch.entries()) {
    const a = ARROWS[i];
    if (!a || l === null) return false;
    const beat = l + a.fuse;
    if (bursts.has(beat)) return false;
    bursts.set(beat, a.colour);
  }
  return PROGRAM.every((p) => bursts.get(p.beat) === p.colour) && bursts.size === PROGRAM.length;
}

const SWATCH: Record<Colour, string> = { red: '#e2463b', white: '#f4f1ea', blue: '#3b6fd9' };

export const finale: Proto = {
  id: 'finale',
  title: 'The Grand Finale',
  room: 'Fourth of July',
  kind: 'centrepiece',
  from: "7th Guest's piano and Safecracker's switches (the right sequence); twist: a schedule with fuses of different lengths",
  rules:
    "The show launches one shell a beat, on beats 0 to 6. Each shell's fuse burns for its own number of beats before it bursts. Click a beat in a shell's row to launch it then. Make the bursts match the program, beat by beat. Then press Play.",
  mount(host, ctx) {
    const launch: (number | null)[] = ARROWS.map(() => null);
    const table = h('div', {});
    const play = h('button', { disabled: 'disabled' }, '▶ Play the show');
    const sky = h('div', {
      style: { display: 'flex', gap: '4px', marginTop: '10px', height: '46px' },
    });
    const beats = Array.from({ length: 12 }, (_, b) => b);
    const render = (): void => {
      const grid = h('div', {
        style: {
          display: 'grid',
          gridTemplateColumns: `120px repeat(${beats.length}, 40px)`,
          gap: '3px',
          alignItems: 'center',
        },
      });
      grid.append(
        h('b', {}, 'Beat'),
        ...beats.map((b) => h('b', { style: { textAlign: 'center' } }, String(b))),
      );
      grid.append(
        h('span', {}, 'Program'),
        ...beats.map((b) => {
          const p = PROGRAM.find((x) => x.beat === b);
          return h(
            'div',
            {
              class: 'cell',
              style: { height: '28px', background: p ? SWATCH[p.colour] : '#f3efe6' },
            },
            p ? '✸' : '',
          );
        }),
      );
      const bursts = new Map<number, Colour[]>();
      ARROWS.forEach((a, i) => {
        const l = launch[i];
        if (l === null || l === undefined) return;
        const list = bursts.get(l + a.fuse) ?? [];
        list.push(a.colour);
        bursts.set(l + a.fuse, list);
      });
      grid.append(
        h('span', {}, 'Your show'),
        ...beats.map((b) => {
          const list = bursts.get(b) ?? [];
          const clash = list.length > 1;
          return h(
            'div',
            {
              class: 'cell',
              style: {
                height: '28px',
                background: list.length === 1 ? SWATCH[list[0] as Colour] : clash ? '#333' : '#fff',
                color: clash ? '#fff' : '',
              },
            },
            list.length ? (clash ? '✕' : '✸') : '',
          );
        }),
      );
      ARROWS.forEach((a, i) => {
        grid.append(
          h(
            'span',
            {},
            h('span', {
              style: {
                display: 'inline-block',
                width: '12px',
                height: '12px',
                background: SWATCH[a.colour],
                border: '1px solid #999',
                marginRight: '6px',
              },
            }),
            `${a.colour}, fuse ${a.fuse}`,
          ),
          ...beats.map((b) => {
            const can = b < LAUNCH_BEATS;
            const mine = launch[i] === b;
            const taken = launch.some((l, j) => j !== i && l === b);
            const lit =
              launch[i] !== null && b > (launch[i] ?? 0) && b <= (launch[i] ?? 0) + a.fuse;
            return h(
              'button',
              {
                class: mine ? 'on' : '',
                disabled: can ? null : 'disabled',
                title: taken ? 'Another shell is launched on this beat' : '',
                style: {
                  height: '28px',
                  padding: '0',
                  background: mine ? '' : lit ? '#ffe2b8' : taken ? '#eee' : '',
                },
                onclick: () => {
                  launch[i] = launch[i] === b ? null : b;
                  render();
                },
              },
              mine ? '🚀' : lit ? '·' : '',
            );
          }),
        );
      });
      table.replaceChildren(grid);
      const ok = matches(launch);
      play.toggleAttribute('disabled', !ok);
      if (ok) ctx.solved();
      else
        ctx.status(
          `${launch.filter((l) => l !== null).length} of ${ARROWS.length} shells scheduled`,
        );
    };
    play.addEventListener('click', () => {
      sky.replaceChildren();
      PROGRAM.forEach((p, i) =>
        setTimeout(
          () =>
            sky.append(
              h(
                'div',
                {
                  style: {
                    width: '40px',
                    fontSize: '34px',
                    color: SWATCH[p.colour],
                    textShadow: '0 0 6px #000',
                  },
                },
                '✸',
              ),
            ),
          i * 350,
        ),
      );
    });
    host.append(table, h('div', { style: { marginTop: '10px' } }, play), sky);
    render();
  },
};
