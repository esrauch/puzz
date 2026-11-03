import { describe, expect, it } from 'vitest';
import * as hashi from '../../src/proto/hashi';
import * as net from '../../src/proto/net';
import * as picture from '../../src/proto/picture';
import * as shikaku from '../../src/proto/shikaku';
import * as strands from '../../src/proto/strands';
import * as two from '../../src/proto/twohops';
import {
  BUNNIES,
  BUNNIES_2,
  CARVING,
  CARVING_2,
  LIGHTS,
  LIGHTS_2,
  PANELS,
  PICTURE,
  PICTURE_2,
  WEBS,
  WEBS_2,
  WORDS,
  WORDS_2,
} from '../../src/proto/puzzles/tuesday';

// Each genre has an intro (without either twist, two or more answers fit) and a second
// level where each twist does more (without it, three or more fit).
describe("Tuesday's party (tentative)", () => {
  it('pairs each genre: intro, then second level', () => {
    expect(PANELS.map((p) => p.kind)).toEqual(
      ['web', 'carving', 'lights', 'words', 'bunnies', 'picture'].flatMap((k) => [k, k]),
    );
  });

  it.each([
    [WEBS, 2],
    [WEBS_2, 3],
  ] as const)('webs %#: one answer; eggs and flags each do work; none pointless', (web, need) => {
    const w = hashi.parse(web);
    expect(hashi.countSolutions(w)).toBe(1);
    expect(hashi.countSolutions(w, need, { noEggs: true })).toBe(need);
    expect(hashi.countSolutions(w, need, { noFlags: true })).toBe(need);
    for (const e of web.eggs ?? [])
      expect(
        hashi.countSolutions(
          hashi.parse({ ...web, eggs: (web.eggs ?? []).filter((x) => x !== e) }),
        ),
      ).toBe(2);
    for (const k of ['rowFlags', 'colFlags'] as const)
      (web[k] ?? []).forEach((f, i) => {
        if (f === null) return;
        const flags = [...(web[k] ?? [])];
        flags[i] = null;
        expect(hashi.countSolutions(hashi.parse({ ...web, [k]: flags }))).toBe(2);
      });
  });

  it('webs 2 has a far egg (3 or 4 threads from home)', () => {
    expect((WEBS_2.eggs ?? []).some(([, , n]) => n >= 3)).toBe(true);
  });

  it.each([
    [CARVING, 2, 'CAKE'],
    [CARVING_2, 3, 'PARTY'],
  ] as const)('carving %#: one answer; the letters do work; the message reads', (c, need, word) => {
    expect(shikaku.countSolutions(shikaku.parse(c))).toBe(1);
    const asDark = { ...c, rows: c.rows.map((r) => r.replace(/[A-Z]/g, '?')) };
    expect(shikaku.countSolutions(shikaku.parse(asDark), need)).toBe(need);
    expect([...(c.message ?? '')].map((d) => c.sizeLetters?.[Number(d) - 1]).join('')).toBe(word);
  });

  it.each([
    [LIGHTS, 2],
    [LIGHTS_2, 3],
  ] as const)(
    'lights %#: one answer; the flags do work; dark pieces are off the plug',
    (l, need) => {
      const b = net.parse(l);
      expect(net.countSolutions(b)).toBe(1);
      expect(net.countSolutions(b, need, { noFlags: true })).toBe(need);
      expect(l.dark?.length).toBeGreaterThan(0);
      for (const d of l.dark ?? []) expect(net.key(...d)).not.toBe(net.key(...l.plug));
    },
  );

  it.each([
    [WORDS, 2],
    [WORDS_2, 3],
  ] as const)(
    'words %#: one whole-grid answer; the bows and the portions each do work',
    (p, need) => {
      expect(strands.wellFormed(p)).toBe(true);
      expect(strands.sharesAndColours(p)).toBe(true);
      const answers = strands.tilings(p);
      expect(answers).toEqual([p.words.map((w) => w.cells.map(strands.key).sort().join(' '))]);
      expect(strands.tilings(p, need, { noColours: true })).toHaveLength(need);
      expect(strands.tilings(p, need, { noPortions: true })).toHaveLength(need);
    },
  );

  it.each([
    [BUNNIES, 2, 'JOY', 'FUN'],
    [BUNNIES_2, 3, 'CAKE', 'GIFT'],
  ] as const)(
    'bunnies %#: one answer; colours and letters each do work; each spells its word',
    (p, need, red, green) => {
      const b = two.parse(p);
      const answers = two.solve(b);
      expect(answers).toHaveLength(1);
      expect(two.countSolutions(b, need, { noColours: true })).toBe(need);
      expect(two.countSolutions(b, need, { noLetters: true })).toBe(need);
      expect(two.spell(b, answers[0]?.[0] ?? [], 'r')).toBe(red);
      expect(two.spell(b, answers[0]?.[1] ?? [], 'g')).toBe(green);
    },
    60_000,
  );

  it.each([
    [PICTURE, 2],
    [PICTURE_2, 3],
  ] as const)('picture %#: one answer; the eggs and the portions each do work', (p, need) => {
    expect(picture.countPictures(p)).toBe(1);
    expect(picture.countPictures(p, need, { noEggs: true })).toBe(need);
    expect(picture.countPictures(p, need, { noPortions: true })).toBe(need);
  });

  it('picture 2 has an egg of 3 or more', () => {
    expect((PICTURE_2.eggs ?? []).some(([, , n]) => n >= 3)).toBe(true);
  });

  it('second levels are bigger boards than their intros', () => {
    for (const [a, b] of [
      [WEBS, WEBS_2],
      [CARVING, CARVING_2],
      [LIGHTS, LIGHTS_2],
      [WORDS, WORDS_2],
      [BUNNIES, BUNNIES_2],
      [PICTURE, PICTURE_2],
    ] as const)
      expect(b.rows.length * (b.rows[0]?.length ?? 0)).toBeGreaterThan(
        a.rows.length * (a.rows[0]?.length ?? 0),
      );
  });
});
