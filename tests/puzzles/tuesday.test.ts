import { describe, expect, it } from 'vitest';
import { GameState, ROOM_SPECS, STRAY_ITEMS, getVillainNote } from '../../src/game/state';
import { problems as carveProblems } from '../../src/gen/carving';
import { problems as hopProblems } from '../../src/gen/hops';
import { problems as lightProblems } from '../../src/gen/lights';
import { problems as picProblems } from '../../src/gen/pictures';
import { problems as webProblems } from '../../src/gen/webs';
import { problems as wordProblems } from '../../src/gen/words';
import { FINALE_PANELS } from '../../src/proto/puzzles/tuesday';

describe("Tuesday's Finale gauntlet (6 dual-twist panels)", () => {
  it('covers all 6 genres and each panel passes its generator verifier', () => {
    expect(FINALE_PANELS.map((x) => x.genre)).toEqual([
      'webs',
      'carving',
      'lights',
      'words',
      'hops',
      'pictures',
    ]);
    for (const item of FINALE_PANELS) {
      if (item.genre === 'webs') expect(webProblems(item.panel, 2), item.name).toEqual([]);
      else if (item.genre === 'carving')
        expect(carveProblems(item.panel, 2), item.name).toEqual([]);
      else if (item.genre === 'lights') expect(lightProblems(item.panel, 2), item.name).toEqual([]);
      else if (item.genre === 'words') expect(wordProblems(item.panel, 1), item.name).toEqual([]);
      else if (item.genre === 'hops') expect(hopProblems(item.panel, 2), item.name).toEqual([]);
      else expect(picProblems(item.panel, 2), item.name).toEqual([]);
    }
  });

  it('maintains 2-item twist symmetry across all 6 holiday rooms', () => {
    expect(ROOM_SPECS).toHaveLength(6);
    const allStrays = Object.values(STRAY_ITEMS);
    expect(allStrays).toHaveLength(12);

    for (const room of ROOM_SPECS) {
      const foundHere = allStrays.filter((s) => s.foundIn === room.id);
      const belongsHere = allStrays.filter((s) => s.homeRoom === room.id);
      expect(foundHere, `${room.id} foundIn count`).toHaveLength(2);
      expect(belongsHere, `${room.id} homeRoom count`).toHaveLength(2);
      for (const s of foundHere) {
        expect(s.homeRoom).not.toBe(s.foundIn);
      }
      expect(new Set(room.centerpiece.requiredItems)).toEqual(
        new Set(belongsHere.map((s) => s.id)),
      );
    }
  });

  it('progresses through Acts I -> II -> III -> IV and gates strays/centerpieces', () => {
    const state = new GameState();
    state.solvedRuns.clear();
    state.placedItems.clear();

    expect(state.act()).toBe(1);
    expect(getVillainNote('cobwebs', state.act()).sender).toContain('SHADOWY FIGURE');

    const halloween = ROOM_SPECS[0];
    expect(state.isStrayUnlocked(halloween)).toBe(false);
    expect(state.isCenterpieceUnlocked(halloween)).toBe(false);

    // Beat warmup -> unlocks strays in Halloween
    state.markRunSolved(halloween.warmup.id);
    expect(state.isStrayUnlocked(halloween)).toBe(true);

    // Beat a stray -> enters carry tray until placed on home pedestal
    state.markRunSolved('jack');
    expect(state.carriedItems().map((x) => x.id)).toContain('jack');
    state.markRunSolved('broom');
    state.placeItem('jack');
    state.placeItem('broom');
    expect(state.carriedItems().map((x) => x.id)).not.toContain('jack');
    expect(state.isCenterpieceUnlocked(halloween)).toBe(true);

    // Complete 3 rooms -> Act II (Ordinary Tuesday unmasked)
    for (const r of ROOM_SPECS.slice(0, 3)) {
      state.markRunSolved(r.warmup.id);
      state.markRunSolved(r.strays[0].proto.id);
      state.markRunSolved(r.strays[1].proto.id);
      state.markRunSolved(r.centerpiece.proto.id);
    }
    expect(state.completedRoomCount()).toBe(3);
    expect(state.act()).toBe(2);
    expect(getVillainNote('cobwebs', state.act()).sender).toBe('ORDINARY TUESDAY');

    // Complete all 6 rooms -> Act III (Santa's Hostile Merger)
    for (const r of ROOM_SPECS.slice(3)) {
      state.markRunSolved(r.warmup.id);
      state.markRunSolved(r.strays[0].proto.id);
      state.markRunSolved(r.strays[1].proto.id);
      state.markRunSolved(r.centerpiece.proto.id);
    }
    expect(state.completedRoomCount()).toBe(6);
    expect(state.act()).toBe(3);
    expect(getVillainNote('tuesday', state.act()).sender).toContain('SANTA CLAUS');

    // Beat the Finale -> Act IV (Tuesday's Party)
    state.markRunSolved('tuesday');
    expect(state.act()).toBe(4);
    expect(state.freePlayUnlocked).toBe(true);
    expect(getVillainNote('cobwebs', state.act()).sender).toContain('GUEST OF HONOR');
  });
});
