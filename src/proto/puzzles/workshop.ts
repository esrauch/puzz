/**
 * The workshop: generate a new panel in the browser, with the same generator
 * the offline tool uses (src/gen/). Pick a difficulty and any twists, press
 * Generate, and play it. The seed is shown, so a panel you like can be made
 * again offline (tools/make-panels.ts --seed).
 */
import type { Tier } from '../../gen/core/spec';
import { cancelGenerating, generateInBrowser } from '../../gen/client';
import { type WebTwist, twistsOf } from '../../gen/webs';
import { mountWeb } from '../hashiBoard';
import { type Proto, h } from '../kit';

const TWISTS: { id: WebTwist; label: string }[] = [
  { id: 'dark', label: 'The dark (Halloween): some knots show no number' },
  { id: 'letters', label: "Letters for numbers (Valentine's): a message to fill in" },
  {
    id: 'colours',
    label:
      'Red, white and blue (Fourth of July): threads join different colours (two colours so far)',
  },
  { id: 'eggs', label: 'Numbered eggs (Easter): threads from the spider’s home' },
  { id: 'flags', label: 'Flags (old Fourth of July twist, being retired): threads along a line' },
  { id: 'cuts', label: 'Cuts (Thanksgiving): fences no thread may cross' },
  { id: 'snow', label: 'Snowflakes (Christmas): the joins mirror; singles and doubles don’t' },
];

const KEY = 'puzz.workshop.webs';
interface Choice {
  tier: Tier;
  twists: WebTwist[];
}
const load = (): Choice => {
  try {
    return {
      tier: 'easy',
      twists: [],
      ...(JSON.parse(localStorage.getItem(KEY) ?? '{}') as Partial<Choice>),
    };
  } catch {
    return { tier: 'easy', twists: [] };
  }
};
const save = (c: Choice): void => {
  try {
    localStorage.setItem(KEY, JSON.stringify(c));
  } catch {
    // No storage: the choice lasts for this visit.
  }
};

export const webWorkshop: Proto = {
  id: 'webworkshop',
  title: 'Webs workshop',
  room: 'Workshop',
  kind: 'workshop',
  from: 'Hashi, generated in the browser, with any mix of twists',
  rules:
    'Pick a difficulty and any twists, then Generate. Drag between knots to spin a thread (again for a double); tap a thread to cut it.',
  mount(host, ctx) {
    const choice = load();
    const tier = h(
      'select',
      { style: { fontSize: '16px', padding: '4px' } },
      ...(['easy', 'medium', 'hard'] as const).map((t) =>
        h('option', { value: t, ...(t === choice.tier ? { selected: true } : {}) }, t),
      ),
    ) as HTMLSelectElement;
    const boxes = TWISTS.map((t) => {
      const box = h('input', {
        type: 'checkbox',
        ...(choice.twists.includes(t.id) ? { checked: true } : {}),
      }) as HTMLInputElement;
      return {
        id: t.id,
        box,
        row: h('label', { style: { display: 'block', margin: '4px 0' } }, box, ' ', t.label),
      };
    });
    const go = h('button', { style: { fontSize: '17px', padding: '8px 18px' } }, 'Generate');
    const info = h('div', { style: { minHeight: '1.4em', margin: '8px 0', color: '#6b5f52' } });
    const board = h('div', { style: { maxWidth: '560px' } });

    const stop = h(
      'button',
      { style: { fontSize: '17px', padding: '8px 18px', marginLeft: '8px', display: 'none' } },
      'Cancel',
    );
    let ticking = 0;
    const busy = (on: boolean): void => {
      go.toggleAttribute('disabled', on);
      stop.style.display = on ? '' : 'none';
      clearInterval(ticking);
    };

    const generateNow = async (): Promise<void> => {
      const spec: Choice = {
        tier: tier.value as Tier,
        twists: boxes.filter((b) => b.box.checked).map((b) => b.id),
      };
      save(spec);
      board.replaceChildren();
      busy(true);
      const began = performance.now();
      info.textContent = 'Generating…';
      ticking = window.setInterval(() => {
        info.textContent = `Generating… ${((performance.now() - began) / 1000).toFixed(1)} s`;
      }, 100);
      const reply = await generateInBrowser({
        genre: 'webs',
        spec,
        seconds: 8,
        seed: Math.floor(Math.random() * 1e9),
      });
      busy(false);
      const { made, ms } = reply;
      if (!made) {
        info.textContent = `Nothing found in ${ms} ms (${reply.rejected || 'no attempts'}). Try again, or fewer twists.`;
        return;
      }
      const on = twistsOf(made.panel);
      info.textContent = `Made in ${ms} ms · seed ${made.seed} · ${spec.tier} · ${on.length ? on.join(', ') : 'plain'} · ${Object.entries(
        made.stats,
      )
        .map(([k, v]) => `${k} ${v}`)
        .join(', ')}`;
      mountWeb(
        board,
        { ...made.panel, name: 'Workshop web' },
        { solved: () => ctx.solved(), status: (text) => ctx.status(text) },
      );
    };
    stop.addEventListener('click', () => {
      cancelGenerating();
      busy(false);
      info.textContent = 'Cancelled.';
    });
    go.addEventListener('click', () => void generateNow());
    host.append(
      h('div', { style: { margin: '0 0 6px' } }, 'Difficulty ', tier),
      ...boxes.map((b) => b.row),
      h('div', { style: { margin: '8px 0' } }, go, stop),
      info,
      board,
    );
    void generateNow();
  },
};
