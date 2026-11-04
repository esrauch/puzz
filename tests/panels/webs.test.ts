import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Tier } from '../../src/gen/core/spec';
import { type Panel, SHAPES, type WebTwist, problems, twistsOf } from '../../src/gen/webs';

interface Pinned {
  genre: string;
  twists: WebTwist[];
  tier: Tier;
  panels: { seed: number; panel: Panel }[];
}

const dir = join(__dirname, '../../src/panels/webs');
const files = readdirSync(dir).filter((f) => f.endsWith('.json'));

describe('generated webs panels', () => {
  it('there are some', () => expect(files.length).toBeGreaterThan(0));

  it.each(files)(
    '%s: each panel has one answer, the tier size, its twists, and every twist does work',
    (file) => {
      const pinned = JSON.parse(readFileSync(join(dir, file), 'utf8')) as Pinned;
      const margin = SHAPES[pinned.tier].margin;
      expect(pinned.panels.length).toBeGreaterThan(0);
      const { width, height } = SHAPES[pinned.tier];
      for (const { panel } of pinned.panels) {
        expect([panel.rows.length, panel.rows[0]?.length], panel.name).toEqual([height, width]);
        expect(new Set(twistsOf(panel)), panel.name).toEqual(new Set(pinned.twists));
        expect(problems(panel, margin), panel.name).toEqual([]);
      }
    },
  );
});
