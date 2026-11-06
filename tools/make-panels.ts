/**
 * Generate panels and pin them as JSON under src/panels/<genre>/.
 *
 *   npx tsx tools/make-panels.ts webs --twists eggs,cuts --tier medium --count 3 --seconds 20
 *   npx tsx tools/make-panels.ts webs --all --count 3 --seconds 15
 *   npx tsx tools/make-panels.ts carving --twists snow,eggs --tier hard
 *
 * --all makes the plain puzzle and each single twist at every tier. A file is
 * <twists joined by '+', or 'plain'>.<tier>.json, holding each panel with its
 * seed and stats; rerunning replaces it. Every search is time-limited: a spec
 * that can't be met in time is reported, never waited on.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { format, resolveConfig } from 'prettier';
import { CARVE_TWISTS, type CarveTwist, generate as generateCarving } from '../src/gen/carving';
import { type Made, Rejections, type Spec, type Tier } from '../src/gen/core/spec';
import { HOP_TWISTS, type HopTwist, generate as generateHops } from '../src/gen/hops';
import { LIGHT_TWISTS, type LightTwist, generate as generateLights } from '../src/gen/lights';
import { WEB_TWISTS, type WebTwist, generate as generateWebs } from '../src/gen/webs';
import { WORD_TWISTS, type WordTwist, generate as generateWords } from '../src/gen/words';

/** Each genre with a generator: its twists, its generator and its title. */
interface Genre {
  title: string;
  twists: readonly string[];
  generate(
    spec: Spec<string>,
    count: number,
    seconds: number,
    from: number,
    why: Rejections,
  ): Made<object>[];
}
const GENRES: Record<string, Genre> = {
  webs: {
    title: 'Webs',
    twists: WEB_TWISTS,
    generate: (spec, ...rest) => generateWebs(spec as Spec<WebTwist>, ...rest),
  },
  carving: {
    title: 'Carving',
    twists: CARVE_TWISTS,
    generate: (spec, ...rest) => generateCarving(spec as Spec<CarveTwist>, ...rest),
  },
  words: {
    title: 'Words',
    twists: WORD_TWISTS,
    generate: (spec, ...rest) => generateWords(spec as Spec<WordTwist>, ...rest),
  },
  hops: {
    title: 'Bunny hops',
    twists: HOP_TWISTS,
    generate: (spec, ...rest) => generateHops(spec as Spec<HopTwist>, ...rest),
  },
  lights: {
    title: 'Lights',
    twists: LIGHT_TWISTS,
    generate: (spec, ...rest) => generateLights(spec as Spec<LightTwist>, ...rest),
  },
};

const TIERS: Tier[] = ['easy', 'medium', 'hard'];
const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const args = process.argv.slice(2);
const genre = args[0];
const opt = (name: string): string | undefined => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const count = Number(opt('count') ?? 3);
const seconds = Number(opt('seconds') ?? 15);
const from = Number(opt('seed') ?? 1);

const g = genre ? GENRES[genre] : undefined;
if (!genre || !g) {
  console.error(
    `usage: make-panels.ts <${Object.keys(GENRES).join('|')}> [--twists a,b] [--tier easy|medium|hard] [--all] [--count n] [--seconds s] [--seed n]`,
  );
  process.exit(1);
}

const specs: { twists: string[]; tier: Tier }[] = [];
if (args.includes('--all'))
  for (const tier of TIERS)
    for (const twists of [[], ...g.twists.map((t) => [t])]) specs.push({ twists, tier });
else {
  const twists = (opt('twists') ?? '').split(',').filter(Boolean);
  const bad = twists.filter((t) => !g.twists.includes(t));
  if (bad.length) throw new Error(`unknown twist(s): ${bad.join(', ')}`);
  const tiers = opt('tier') ? [opt('tier') as Tier] : TIERS;
  for (const tier of tiers) specs.push({ twists, tier });
}

for (const spec of specs) {
  const id = spec.twists.length ? spec.twists.join('+') : 'plain';
  const start = Date.now();
  const why = new Rejections();
  const made = g.generate(spec, count, seconds, from, why);
  const secs = ((Date.now() - start) / 1000).toFixed(1);
  const title = spec.twists.length ? spec.twists.join(' and ') : 'plain';
  const panels = made.map((m, i) => ({
    seed: m.seed,
    stats: m.stats,
    panel: { ...m.panel, name: `${g.title}, ${title}: ${spec.tier} ${i + 1}` },
  }));
  console.log(
    `${genre} ${id} ${spec.tier}: ${made.length}/${count} in ${secs}s`,
    made.map((m) => m.stats),
  );
  if (made.length < count) console.log(`  rejected: ${why.toString()}`);
  if (!made.length) continue;
  const file = join(root, 'src/panels', genre, `${id}.${spec.tier}.json`);
  mkdirSync(dirname(file), { recursive: true });
  const json = JSON.stringify({ genre, twists: spec.twists, tier: spec.tier, panels });
  writeFileSync(file, await format(json, { ...(await resolveConfig(file)), parser: 'json' }));
}
