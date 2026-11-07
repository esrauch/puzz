# Puzz: Roadmap

From where the game stands (2026-11-07) to the finished, polished game.
What the game *is* lives in [GAME.md](GAME.md) (the story is "The story:
Santa's hostile takeover"); the puzzle-by-twist map in
[PUZZLES.md](PUZZLES.md); build status in [PROTOTYPES.md](PROTOTYPES.md).

## Where we are

- **Puzzles: in decent shape.** Six genres, six twists, three tiers, all
  generated in seconds and pinned by tests; every room's runs built; Santa's
  merger contract is six two-twist panels.
- **Game shell: working.** Holiday Hall (3D rotunda), room runs, carried
  items, lamps, the Calendar Desk, step hints.
- **Story and progression: the weak part.** The code runs an older story
  told in text banners, with progress shown as counters. The new design (you
  are Tuesday; free the mascots; Santa's memos; acquired rooms that peel
  back; a party at the end) isn't built.

## The plan

Phases run roughly in order; each ends in something playable. Playtests
(your phone, the whole loop, in order) are the checkpoints between them.

### Phase 0: housekeeping (small)

- Finish and commit the in-progress Calendar Desk menu work.
- Keep `GAME.md`, `PUZZLES.md` and `PROTOTYPES.md` in step as each phase lands.

### Phase 1: the new story in the shell

Replace the old story with the new one, in words first (art comes later).

- **State:** drop the act chain (Shadowy Figure, Tuesday unmasked); Santa is
  the open villain from the start. Track story milestones as events: first
  entry to a room, stray freed, item brought home, mascot freed, lamp count.
- **Beats:** one small system that shows a short beat at each milestone (a
  Santa memo or fax, a Tuesday one-liner, a mascot's thank-you), shown once,
  replayable from the hall. Remove the per-panel villain notes: panels show
  rules only.
- **Lines:** all story text in one content file: Santa's memos (by milestone
  and lamp count, escalating, always getting Tuesday's name wrong), Tuesday's
  replies, six mascot thank-yous, the ending.
- **Player as Tuesday:** UI copy speaks to the player as Tuesday.

*Done when:* a full playthrough reads as the new story, start to finish,
with no old-story text left.

### Phase 2: the guided opening and gating

- **Opening:** the takeover memo, addressed to "Monday"; only Thanksgiving
  open. Freeing its first stray and carrying the item home opens that item's
  room, and the rest of the house with it.
- **Calendar Desk:** visible in the hall from the start, dusty, "closed for
  the merger"; opens only after the party. Remove the per-genre desk unlocks.
- **Never stuck:** after the opening, every room open and every stray
  available, as now.

*Done when:* a brand-new player is taught the whole loop in Thanksgiving
without reading instructions. **Playtest 1: the whole loop, new story.**

### Phase 3: acquired rooms, mascots and lamps (art)

The story told in the world.

- **Six mascots** as voxel models (the Spider, the Turkey, an Elf, Cupid, the
  Easter Bunny, and the Fourth of July's, to decide), each with a cage at its
  centrepiece, and a freed pose.
- **Acquired rooms:** each room starts with corporate Christmas signage,
  drained colours and the caged mascot.
- **Peel-back stages:** each item brought home peels some branding off;
  restoring the centrepiece opens the cage, brings back the room's full
  colour and lights its lamp in the hall (a moment with sound and a little
  camera move).
- Santa's memos as a physical thing in the hall (a fax machine or an inbox).

*Done when:* you can tell how far you are by looking at the house.

### Phase 4: the ending

- **Santa's merger contract:** the six two-twist panels framed as clauses,
  each torn up on solving, with Santa's escalating, then desperate, memos.
- **The cake relay:** design and build the single board where every genre
  adds to Tuesday's party cake (outline in `GAME.md`). This needs a small
  multi-genre board of its own.
- **The party:** all six mascots in the hall, the crowning of Extraordinary
  Tuesday, Santa finally getting the name right, credits.

*Done when:* the game can be finished. **Playtest 2: the whole game, start
to end.**

### Phase 5: bonus panels

- A few optional hard panels per room, picked from the generators (and
  pinned), with a small visible reward each: a decoration in the room, a
  party hat for its mascot, which then shows at the party.

### Phase 6: sound

- Music per room in two moods (acquired: muzak-ish corporate Christmas;
  restored: the room's own theme), the hall's theme, the party.
- Milestone sounds: stray freed, item placed, cage opened, lamp lit, clause
  torn. Built on `src/audio` (synthesized songs and effects already exist).

### Phase 7: the lighter layer

- Strays that start hidden, with a line from Tuesday (or a smug memo from
  Santa) hinting where.
- Clickable gags and reactions in every room, above all round the mash-ups
  and Santa's branding.

### Phase 8: tuning and UX

- Panel order and difficulty within each run (from playtest notes); the
  open UX items in `PROTOTYPES.md` ("For the UX pass").
- Accessibility: red and blue readable for colour-blind players (shapes or
  patterns as well as colour), text size, touch targets.
- **Playtest 3**, ideally with someone who hasn't seen the game.

### Phase 9: release

- Phone performance: a steady 60 fps on a mid-range phone, first load under
  ~5 MB (`TECHNICAL.md`, Goals).
- Saves that survive refreshes and updates; a reset option.
- Title screen, settings, credits; deployment as a static site.

### After release: the Calendar Desk

- The daily Tuesday puzzle (seeded by date) and the mixer are the endless
  mode; tune which genres and twists the daily rotates through.

## Decisions still open

From `GAME.md`, "To decide": the exact lines; the Fourth of July's mascot;
which bonus panels go where and what each earns; how the cake relay looks
with the mascots at the party; hidden strays and the lighter layer's gags.
