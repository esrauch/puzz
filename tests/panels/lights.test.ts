import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Tier } from '../../src/gen/core/spec';
import {
  type LightTwist,
  type Panel,
  SHAPES,
  generate,
  problems,
  twistsOf,
} from '../../src/gen/lights';

interface Pinned {
  genre: string;
  twists: LightTwist[];
  tier: Tier;
  panels: { seed: number; panel: Panel }[];
}

const dir = join(__dirname, '../../src/panels/lights');
const files = readdirSync(dir).filter((f) => f.endsWith('.json'));

describe('generated lights panels', () => {
  it('there are all 21 pinned panel files', () => expect(files.length).toBe(21));

  it.each(files)(
    '%s: each panel has one answer, the tier size, its twists, and every twist does work',
    (file) => {
      const pinned = JSON.parse(readFileSync(join(dir, file), 'utf8')) as Pinned;
      const { margin, width, height } = SHAPES[pinned.tier];
      const effMargin = pinned.twists.length > 1 ? 2 : margin;
      expect(pinned.panels.length).toBe(3);
      for (const { panel } of pinned.panels) {
        expect([panel.rows.length, panel.rows[0]?.length], panel.name).toEqual([height, width]);
        expect(new Set(twistsOf(panel)), panel.name).toEqual(new Set(pinned.twists));
        expect(problems(panel, effMargin), panel.name).toEqual([]);
      }
    },
    30_000,
  );

  it('stacks multiple twists together', () => {
    for (const twists of [
      ['snow', 'dark'],
      ['colours', 'eggs'],
      ['slices', 'letters'],
    ] as LightTwist[][]) {
      const made = generate({ tier: 'easy', twists }, 1, 5);
      expect(made.length, twists.join('+')).toBe(1);
      expect(problems(made[0]!.panel, 2), twists.join('+')).toEqual([]);
    }
  }, 30_000);
});
