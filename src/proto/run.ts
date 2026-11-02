/**
 * A room's run of panels, The Witness's way: a strip of small panels, each
 * solved one powering up the next. Solved panels are ticked (remembered in
 * this browser); any panel can be opened, for playtesting.
 */
import { type Proto, h } from './kit';

export interface PanelHooks {
  /** The panel's solved; `message` is shown under it. */
  solved(message?: string): void;
  status(text: string): void;
}

export interface RunDef<P extends { name: string }> extends Omit<Proto, 'mount'> {
  panels: P[];
  mountPanel(host: HTMLElement, panel: P, hooks: PanelHooks): void;
}

const KEY = 'puzz.proto.panels';
const load = (): Set<string> => {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]') as string[]);
  } catch {
    return new Set();
  }
};
const save = (done: Set<string>): void => {
  try {
    localStorage.setItem(KEY, JSON.stringify([...done]));
  } catch {
    // No storage: ticks last for this visit.
  }
};

export function run<P extends { name: string }>(def: RunDef<P>): Proto {
  const { panels, mountPanel, ...proto } = def;
  return {
    ...proto,
    teaches: true,
    mount(host, ctx) {
      const done = load();
      const strip = h('div', {
        style: { display: 'flex', gap: '6px', flexWrap: 'wrap', margin: '0 0 10px' },
      });
      const title = h('div', { style: { fontWeight: '700', margin: '0 0 8px' } });
      const board = h('div', { style: { maxWidth: '560px' } });
      const message = h('div', {
        style: { minHeight: '1.6em', margin: '8px 0', fontWeight: '700' },
      });
      const next = h(
        'button',
        { style: { visibility: 'hidden', fontSize: '17px', padding: '8px 18px' } },
        'Next ▸',
      );
      let at = Math.max(
        0,
        panels.findIndex((_, i) => !done.has(`${proto.id}:${i}`)),
      );
      const open = (i: number): void => {
        at = i;
        const panel = panels[i] as P;
        strip.replaceChildren(
          ...panels.map((_, j) =>
            h(
              'button',
              {
                style: {
                  minWidth: '38px',
                  fontWeight: j === i ? '700' : '400',
                  background: j === i ? '#e0662d' : done.has(`${proto.id}:${j}`) ? '#cfeccf' : '',
                  color: j === i ? '#fff' : '',
                },
                onclick: () => open(j),
              },
              done.has(`${proto.id}:${j}`) ? `${j + 1}✓` : String(j + 1),
            ),
          ),
        );
        title.textContent = `${i + 1}. ${panel.name}`;
        message.textContent = '';
        next.style.visibility = 'hidden';
        board.replaceChildren();
        mountPanel(board, panel, {
          solved: (text) => {
            done.add(`${proto.id}:${i}`);
            save(done);
            message.textContent = text ?? '';
            if (i === panels.length - 1) ctx.solved();
            else {
              next.style.visibility = 'visible';
              ctx.status(`Panel ${i + 1} of ${panels.length} solved`);
            }
            (strip.children[i] as HTMLElement | undefined)?.replaceChildren(`${i + 1}✓`);
          },
          status: (text) => ctx.status(text),
        });
      };
      next.addEventListener('click', () => open(Math.min(at + 1, panels.length - 1)));
      host.append(strip, title, board, message, next);
      open(at);
    },
  };
}
