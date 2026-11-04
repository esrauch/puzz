/**
 * Generate panels and pin them as JSON under src/panels/<genre>/.
 *
 *   npx tsx tools/make-panels.ts webs --twists eggs,flags --tier medium --count 3 --seconds 20
 *   npx tsx tools/make-panels.ts webs --all --count 3 --seconds 15
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
import { Rejections, type Tier } from '../src/gen/core/spec';
import { WEB_TWISTS, type WebTwist, generate as generateWebs } from '../src/gen/webs';

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

if (genre !== 'webs') {
  console.error(
    'usage: make-panels.ts webs [--twists a,b] [--tier easy|medium|hard] [--all] [--count n] [--seconds s] [--seed n]',
  );
  console.error('(only webs has a generator so far)');
  process.exit(1);
}

const specs: { twists: WebTwist[]; tier: Tier }[] = [];
if (args.includes('--all'))
  for (const tier of TIERS)
    for (const twists of [[], ...WEB_TWISTS.map((t) => [t])]) specs.push({ twists, tier });
else {
  const twists = (opt('twists') ?? '').split(',').filter(Boolean) as WebTwist[];
  const bad = twists.filter((t) => !WEB_TWISTS.includes(t));
  if (bad.length) throw new Error(`unknown twist(s): ${bad.join(', ')}`);
  const tiers = opt('tier') ? [opt('tier') as Tier] : TIERS;
  for (const tier of tiers) specs.push({ twists, tier });
}

for (const spec of specs) {
  const id = spec.twists.length ? spec.twists.join('+') : 'plain';
  const start = Date.now();
  const why = new Rejections();
  const made = generateWebs(spec, count, seconds, from, why);
  const secs = ((Date.now() - start) / 1000).toFixed(1);
  const title = spec.twists.length ? spec.twists.join(' and ') : 'plain';
  const panels = made.map((m, i) => ({
    seed: m.seed,
    stats: m.stats,
    panel: { ...m.panel, name: `Webs, ${title}: ${spec.tier} ${i + 1}` },
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
