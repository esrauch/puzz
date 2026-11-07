/**
 * Tuesday's Calendar Desk: houses the deterministic "Daily Tuesday" challenge
 * (seeded by YYYY-MM-DD) and the "Custom Holiday Mixer" powered by the
 * in-browser Web Worker generator.
 */
import type { Panel as CarvePanel } from '../gen/carving';
import { type Genre, cancelGenerating, generateInBrowser } from '../gen/client';
import type { Tier } from '../gen/core/spec';
import type { Panel as HopPanel } from '../gen/hops';
import type { Panel as LightPanel } from '../gen/lights';
import type { Panel as PicPanel } from '../gen/pictures';
import type { Panel as WebPanel } from '../gen/webs';
import type { Panel as WordPanel } from '../gen/words';
import { mountWeb } from '../proto/hashiBoard';
import { mountHops } from '../proto/hopsBoard';
import { blip, h } from '../proto/kit';
import { mountLights } from '../proto/netBoard';
import { mountPicture } from '../proto/pictureBoard';
import { mountCarving } from '../proto/shikakuBoard';
import { mountStrands } from '../proto/strandsBoard';
import { gameState } from './state';

const GENRE_OPTIONS = [
  {
    id: 'webs' as Genre,
    label: '🎃 Spiderweb (Halloween)',
    twists: [
      { id: 'dark', label: '🎃 Spooky (?)' },
      { id: 'letters', label: '💌 Love Letters' },
      { id: 'colours', label: '🎆 Red, White & Blue' },
      { id: 'eggs', label: '🥚 Egg Hunt' },
      { id: 'cuts', label: '🦃 Portions (Fences)' },
      { id: 'snow', label: '❄️ Snowflakes' },
    ] as const,
  },
  {
    id: 'carving' as Genre,
    label: '🦃 Carving (Thanksgiving)',
    twists: [
      { id: 'dark', label: '🎃 Spooky (?)' },
      { id: 'letters', label: '💌 Love Letters' },
      { id: 'colours', label: '🎆 Red, White & Blue' },
      { id: 'basket', label: '🥚 Egg Hunt (Basket)' },
      { id: 'cuts', label: '🦃 Portions (Fences)' },
      { id: 'snow', label: '❄️ Snowflakes' },
    ] as const,
  },
  {
    id: 'lights' as Genre,
    label: '🎄 Lights (Christmas)',
    twists: [
      { id: 'dark', label: '🎃 Spooky (?)' },
      { id: 'letters', label: '💌 Love Letters' },
      { id: 'colours', label: '🎆 Red, White & Blue' },
      { id: 'eggs', label: '🥚 Egg Hunt' },
      { id: 'slices', label: '🦃 Portions (Slices)' },
      { id: 'snow', label: '❄️ Snowflakes' },
    ] as const,
  },
  {
    id: 'words' as Genre,
    label: "💌 Heartstrings (Valentine's)",
    twists: [
      { id: 'dark', label: '🎃 Spooky (?)' },
      { id: 'letters', label: '💌 Love Letters (Cipher)' },
      { id: 'colours', label: '🎆 Red, White & Blue' },
      { id: 'eggs', label: '🥚 Egg Hunt' },
      { id: 'cuts', label: '🦃 Portions (Fences)' },
      { id: 'snow', label: '❄️ Snowflakes' },
    ] as const,
  },
  {
    id: 'hops' as Genre,
    label: '🐰 Bunny Hops (Easter)',
    twists: [
      { id: 'dark', label: '🎃 Spooky (?)' },
      { id: 'letters', label: '💌 Love Letters' },
      { id: 'colours', label: '🎆 Red, White & Blue' },
      { id: 'burrows', label: '🐰 Burrows' },
      { id: 'courses', label: '🦃 Portions (Courses)' },
      { id: 'snow', label: '❄️ Snowflakes' },
    ] as const,
  },
  {
    id: 'pictures' as Genre,
    label: '🎆 Fireworks (Fourth of July)',
    twists: [
      { id: 'dark', label: '🎃 Spooky (?)' },
      { id: 'letters', label: '💌 Love Letters' },
      { id: 'colours', label: '🎆 Red, White & Blue' },
      { id: 'eggs', label: '🥚 Egg Hunt' },
      { id: 'portions', label: '🦃 Portions' },
      { id: 'snow', label: '❄️ Snowflakes' },
    ] as const,
  },
] as const;

function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function dateHash(str: string): number {
  let hVal = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hVal ^= str.charCodeAt(i);
    hVal = Math.imul(hVal, 16777619);
  }
  return ((hVal >>> 0) % 900_000) + 100;
}

function mountGenrePanel(
  host: HTMLElement,
  genre: Genre,
  panel: unknown,
  onSolved: () => void,
  onStatus: (s: string) => void,
): void {
  const hooks = { solved: onSolved, status: onStatus };
  if (genre === 'webs') mountWeb(host, panel as WebPanel, hooks);
  else if (genre === 'carving') mountCarving(host, panel as CarvePanel, hooks);
  else if (genre === 'lights') mountLights(host, panel as LightPanel, hooks);
  else if (genre === 'words') mountStrands(host, panel as WordPanel, hooks);
  else if (genre === 'hops') mountHops(host, panel as HopPanel, hooks);
  else mountPicture(host, panel as PicPanel, hooks);
}

export function mountCalendarDesk(host: HTMLElement, onClose: () => void): void {
  const dateStr = todayKey();
  const baseSeed = dateHash(dateStr);

  // Pick 3 deterministic daily specs from today's date hash
  const g1 = GENRE_OPTIONS[baseSeed % GENRE_OPTIONS.length] ?? GENRE_OPTIONS[0];
  const g2 = GENRE_OPTIONS[(baseSeed + 2) % GENRE_OPTIONS.length] ?? GENRE_OPTIONS[1];
  const g3 = GENRE_OPTIONS[(baseSeed + 4) % GENRE_OPTIONS.length] ?? GENRE_OPTIONS[2];
  const dailySteps: { genre: Genre; label: string; tier: Tier; twists: string[]; seed: number }[] =
    [
      {
        genre: g1.id,
        label: `Easy · ${g1.label}`,
        tier: 'easy',
        twists: [(g1.twists[baseSeed % g1.twists.length] ?? g1.twists[0]).id],
        seed: (baseSeed % 50) + 1,
      },
      {
        genre: g2.id,
        label: `Medium · ${g2.label}`,
        tier: 'medium',
        twists: [(g2.twists[(baseSeed >> 3) % g2.twists.length] ?? g2.twists[0]).id],
        seed: ((baseSeed >> 4) % 50) + 1,
      },
      {
        genre: g3.id,
        label: `Hard · ${g3.label}`,
        tier: 'hard',
        twists: [(g3.twists[(baseSeed >> 6) % g3.twists.length] ?? g3.twists[0]).id],
        seed: ((baseSeed >> 7) % 50) + 1,
      },
    ];

  let activeTab: 'daily' | 'custom' = 'daily';
  const dailySolved = new Set<number>();
  let dailyIdx = 0;

  const content = h('div', { style: { marginTop: '12px' } });
  const statusEl = h('div', {
    style: { fontWeight: '700', color: '#2b6cb0', minHeight: '22px' },
  });
  let remountCurrentBoard: (() => void) | null = null;
  const deskResetBtn = h(
    'button',
    {
      title: 'Reset current puzzle panel',
      style: {
        borderRadius: '999px',
        height: '28px',
        padding: '0 11px',
        fontWeight: '700',
        fontSize: '13px',
        cursor: 'pointer',
        border: '1px solid #cbbba0',
        background: '#fffdf9',
        color: '#1f2430',
      },
      onclick: () => {
        remountCurrentBoard?.();
      },
    },
    '↺ Reset',
  );
  const deskHintBtn = h(
    'button',
    {
      title: 'Get a hint for this panel',
      style: {
        borderRadius: '999px',
        height: '28px',
        padding: '0 11px',
        fontWeight: '700',
        fontSize: '13px',
        cursor: 'pointer',
        border: '1px solid #d69e2e',
        background: '#fefcbf',
        color: '#744210',
      },
      onclick: () => {
        activeDeskPane?.dispatchEvent(new CustomEvent('puzz:hint'));
      },
    },
    '💡 Hint',
  );
  const statusRow = h(
    'div',
    {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        flexWrap: 'wrap',
        margin: '8px 0',
      },
    },
    deskResetBtn,
    statusEl,
    h(
      'div',
      { style: { display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' } },
      deskHintBtn,
    ),
  );
  const boardHost = h('div', { class: 'puzz-board-stage', style: { minHeight: '240px' } });
  let activeDeskPane: HTMLElement | null = null;
  let deskHeightTimer = 0;

  const swapDeskPane = (dir: 'forward' | 'reset', mountInto: (pane: HTMLElement) => void): void => {
    const prevPane = activeDeskPane;
    const prevHeight = prevPane ? boardHost.offsetHeight : 0;
    if (prevPane) {
      const pTop = prevPane.offsetTop;
      const pLeft = prevPane.offsetLeft;
      const pWidth = prevPane.offsetWidth;
      Object.assign(prevPane.style, {
        position: 'absolute',
        top: `${pTop}px`,
        left: `${pLeft}px`,
        width: `${pWidth}px`,
        pointerEvents: 'none',
      });
      prevPane.className = `puzz-board-pane puzz-pane-exit-${dir}`;
      window.setTimeout(() => {
        prevPane.remove();
      }, 240);
    }
    const nextPane = h('div', {
      class: prevPane ? `puzz-board-pane puzz-pane-enter-${dir}` : 'puzz-board-pane',
    });
    activeDeskPane = nextPane;
    boardHost.append(nextPane);
    mountInto(nextPane);

    if (prevPane && prevHeight > 0) {
      if (deskHeightTimer) clearTimeout(deskHeightTimer);
      boardHost.style.height = 'auto';
      const targetHeight = boardHost.offsetHeight;
      if (Math.abs(targetHeight - prevHeight) > 2) {
        boardHost.style.height = `${prevHeight}px`;
        void boardHost.offsetHeight;
        boardHost.style.height = `${targetHeight}px`;
        deskHeightTimer = window.setTimeout(() => {
          deskHeightTimer = 0;
          boardHost.style.height = '';
        }, 260);
      } else {
        boardHost.style.height = '';
      }
    }
  };

  const loadDailyStep = async (idx: number): Promise<void> => {
    dailyIdx = idx;
    const step = dailySteps[idx] ?? dailySteps[0];
    if (!step) return;
    statusEl.textContent = `Generating Daily Panel ${idx + 1}/3 (${step.label})...`;
    const reply = await generateInBrowser({
      genre: step.genre,
      spec: { tier: step.tier, twists: step.twists },
      seconds: 8,
      seed: step.seed,
    });
    if (!reply.made) {
      statusEl.textContent = 'Could not generate panel; try again.';
      return;
    }
    const mountStep = (dir: 'forward' | 'reset'): void => {
      statusEl.textContent = `${step.label} · Twist: ${step.twists.join(', ')}`;
      swapDeskPane(dir, (pane) => {
        mountGenrePanel(
          pane,
          step.genre,
          reply.made?.panel,
          () => {
            dailySolved.add(idx);
            blip(660, 120);
            renderTabs();
            if (dailySolved.size === 3) {
              statusEl.textContent = `🎉 Daily Tuesday (${dateStr}) Complete!`;
            } else if (idx < 2) {
              statusEl.textContent = `✓ Panel ${idx + 1} solved! Loading next...`;
              window.setTimeout(() => {
                if (boardHost.isConnected) void loadDailyStep(idx + 1);
              }, 1350);
            }
          },
          (t) => {
            statusEl.textContent = t;
          },
        );
      });
    };
    remountCurrentBoard = () => mountStep('reset');
    mountStep('forward');
  };

  let customGenre: Genre = 'webs';
  let customTier: Tier = 'easy';
  const customTwists = new Set<string>(['snow']);

  const renderCustom = (): void => {
    const gInfo = GENRE_OPTIONS.find((x) => x.id === customGenre) ?? GENRE_OPTIONS[0];
    const genreSelect = h(
      'select',
      {
        style: { padding: '6px 10px', borderRadius: '6px', fontSize: '14px' },
        onchange: (e: Event) => {
          customGenre = (e.target as HTMLSelectElement).value as Genre;
          customTwists.clear();
          renderCustom();
        },
      },
      ...GENRE_OPTIONS.map((g) =>
        h('option', { value: g.id, selected: g.id === customGenre }, g.label),
      ),
    );

    const tierSelect = h(
      'select',
      {
        style: { padding: '6px 10px', borderRadius: '6px', fontSize: '14px' },
        onchange: (e: Event) => {
          customTier = (e.target as HTMLSelectElement).value as Tier;
        },
      },
      ...(['easy', 'medium', 'hard'] as const).map((t) =>
        h('option', { value: t, selected: t === customTier }, t.toUpperCase()),
      ),
    );

    const twistRow = h(
      'div',
      { style: { display: 'flex', gap: '6px', flexWrap: 'wrap', margin: '8px 0' } },
      ...gInfo.twists.map((tw) => {
        const on = customTwists.has(tw.id);
        return h(
          'button',
          {
            style: {
              padding: '5px 10px',
              borderRadius: '999px',
              fontSize: '12.5px',
              fontWeight: '600',
              cursor: 'pointer',
              border: on ? '1.5px solid #2b6cb0' : '1px solid #cbd5e0',
              background: on ? '#ebf8ff' : '#f7fafc',
              color: on ? '#2b6cb0' : '#4a5568',
            },
            onclick: () => {
              if (on) customTwists.delete(tw.id);
              else if (customTwists.size < 2) customTwists.add(tw.id);
              renderCustom();
            },
          },
          tw.label,
        );
      }),
    );

    const genBtn = h(
      'button',
      {
        style: {
          padding: '7px 16px',
          borderRadius: '8px',
          fontWeight: '700',
          background: '#e0662d',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
        },
        onclick: async () => {
          const seed = Math.floor(Math.random() * 100_000) + 1;
          statusEl.textContent = `Generating ${customTier} ${gInfo.label}...`;
          const reply = await generateInBrowser({
            genre: customGenre,
            spec: { tier: customTier, twists: [...customTwists] },
            seconds: 10,
            seed,
          });
          if (!reply.made) {
            statusEl.textContent =
              'No board found for that combination in time — try 1 twist or Easy/Medium.';
            return;
          }
          const mountCustom = (dir: 'forward' | 'reset'): void => {
            statusEl.textContent = `Seed ${reply.made?.seed} (${reply.ms} ms)`;
            swapDeskPane(dir, (pane) => {
              mountGenrePanel(
                pane,
                customGenre,
                reply.made?.panel,
                () => {
                  statusEl.textContent = `✓ Custom panel solved! (Seed ${reply.made?.seed})`;
                },
                (s) => {
                  statusEl.textContent = s;
                },
              );
            });
          };
          remountCurrentBoard = () => mountCustom('reset');
          mountCustom('forward');
        },
      },
      'Generate Board ▸',
    );

    content.replaceChildren(
      h(
        'div',
        { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' } },
        genreSelect,
        tierSelect,
        genBtn,
      ),
      twistRow,
      statusRow,
      boardHost,
    );
  };

  const renderDaily = (): void => {
    const strip = h(
      'div',
      { style: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' } },
      ...dailySteps.map((_, i) =>
        h(
          'button',
          {
            style: {
              padding: '6px 12px',
              borderRadius: '999px',
              fontWeight: '700',
              cursor: 'pointer',
              border: i === dailyIdx ? '2px solid #c05621' : '1px solid #cbd5e0',
              background: i === dailyIdx ? '#e0662d' : dailySolved.has(i) ? '#c6f6d5' : '#f7fafc',
              color: i === dailyIdx ? '#fff' : '#2d3748',
            },
            onclick: () => void loadDailyStep(i),
          },
          dailySolved.has(i) ? `Daily ${i + 1} ✓` : `Daily ${i + 1}`,
        ),
      ),
      h(
        'button',
        {
          style: {
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            border: '1px solid #805ad5',
            background: '#faf5ff',
            color: '#553c9a',
          },
          onclick: async () => {
            const marks = [0, 1, 2].map((i) => (dailySolved.has(i) ? '🟩' : '⬜')).join('');
            const text = `Puzz · Daily Tuesday (${dateStr}) ${marks} (${dailySolved.size}/3)`;
            try {
              await navigator.clipboard.writeText(text);
              statusEl.textContent = `Copied: "${text}"`;
            } catch {
              statusEl.textContent = text;
            }
          },
        },
        '📋 Copy Daily Receipt',
      ),
    );
    content.replaceChildren(strip, statusRow, boardHost);
    void loadDailyStep(dailyIdx);
  };

  const tabBar = h('div', { style: { display: 'flex', gap: '8px', marginBottom: '8px' } });
  const renderTabs = (): void => {
    tabBar.replaceChildren(
      h(
        'button',
        {
          style: {
            padding: '7px 14px',
            borderRadius: '8px',
            fontWeight: '700',
            cursor: 'pointer',
            background: activeTab === 'daily' ? '#805ad5' : '#edf2f7',
            color: activeTab === 'daily' ? '#fff' : '#2d3748',
            border: 'none',
          },
          onclick: () => {
            activeTab = 'daily';
            renderTabs();
            renderDaily();
          },
        },
        `📅 Daily Tuesday (${dateStr})`,
      ),
      h(
        'button',
        {
          style: {
            padding: '7px 14px',
            borderRadius: '8px',
            fontWeight: '700',
            cursor: 'pointer',
            background: activeTab === 'custom' ? '#805ad5' : '#edf2f7',
            color: activeTab === 'custom' ? '#fff' : '#2d3748',
            border: 'none',
          },
          onclick: () => {
            activeTab = 'custom';
            renderTabs();
            renderCustom();
          },
        },
        '🎛️ Custom Holiday Mixer',
      ),
    );
  };

  const header = h(
    'div',
    {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
      },
    },
    h('h2', { style: { margin: '0', fontSize: '20px' } }, "📅 Tuesday's Calendar Desk"),
    h(
      'button',
      {
        style: {
          marginLeft: 'auto',
          flexShrink: '0',
          padding: '6px 12px',
          borderRadius: '8px',
          fontWeight: '700',
          cursor: 'pointer',
          border: '1px solid #cbd5e0',
          background: '#f7fafc',
        },
        onclick: () => {
          cancelGenerating();
          onClose();
        },
      },
      '✕ Close',
    ),
  );

  gameState.setFreePlay(true);
  renderTabs();
  renderDaily();
  host.replaceChildren(header, tabBar, content);
}
