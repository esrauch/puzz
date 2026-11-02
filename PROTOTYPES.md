# Puzzle prototypes: status, audit and next steps

Working notes for the 19 puzzle prototypes (design in [GAME.md](GAME.md)).
Play them at `npm run dev` → `/dev/puzzles.html` (port 5176; `?p=<id>` for
one puzzle). Code: `src/proto/` (kit, page, one file per puzzle, rules as
plain functions); tests in `tests/puzzles/` prove each level is solvable
(and, where it matters, has exactly one answer or a known best solution).
Prototypes are deliberately unthemed: they test whether each puzzle is fun.

## Status by puzzle (after three rounds of playtesting)

| Room | Puzzle (`?p=`) | Kind | Status |
|---|---|---|---|
| Valentine's | Jack-o'-Lantern (`jack`) | stray | **Reworked:** 10 letters with no help was too hard; now 3 notes (LOVE, BE MINE, SWEET ON YOU) with a clue each, and letters glow when right. Needs replaying. |
| Valentine's | Secret Admirers (`admirers`) | stray | Not yet played. 4×4 logic grid, one answer. |
| Valentine's | Mailbox (`mailbox`) | centrepiece | **Confirmed.** 3 coded letters, 2 key fragments; two-layer completion (find and return the letters; beat two puzzles for the keys). **Open:** which two puzzles give the keys: the ones freeing Cupid's Bow and the Chocolates (as built), or the Valentine room's own two strays? |
| Easter | Egg-Carton Flag (`flag`) | stray | **Reworked:** original too easy, now level 1; level 2 is 5×5, three dyes, 8 dips (every dip needed). Needs replaying. |
| Easter | Woven Cornucopia (`weave`) | stray | **Reworked:** original too easy, now level 1; level 2 is a generated 7×7 weave of 4 snaking strands. Needs replaying. |
| Easter | Egg Tree (`eggtree`) | centrepiece | **Replaced:** the egg rings were too hard. Now a knight's tour: the Easter Bunny hops like a knight, an egg on every spot of a tree-shaped board. Built: the learning level only (16-spot sapling, no numbers; a tour starts from any spot). **Next:** harder trees with a few eggs numbered in order, searched to have exactly one tour. Needs playing. |
| Fourth of July | Cupid's Firework Bow (`bow`) | stray | **Swapped in:** the picture-logic grid (was the Grand Finale; felt like a level 1). Level 1 the flag, level 2 a heart with Cupid's arrow (one answer, logic alone). Needs replaying. |
| Fourth of July | Witch's Parade (`parade`) | stray | Not yet played. Rush Hour plus a marching band; 27 moves at best (10 without the band). Risk: tedious search. |
| Fourth of July | Grand Finale (`finale`) | centrepiece | **Swapped in:** the fuse schedule (was Cupid's Bow), now red, white and blue shells; one schedule works. Not yet judged as a centrepiece. |
| Halloween | Porch Cobwebs (`cobwebs`) | warm-up | **New direction, built:** 6 Hashi panels, one rule each (one thread, doubles, sharing out, no crossing, one web, a first web). Needs playing. |
| Halloween | Box of Chocolates (`chocolates`) | stray | **Built, reworked once:** 3 panels, Valentine's letters (same letter, same count), each with a message of numbered blanks (blank n = the letter with n threads): 1OV2, B2 M1N2, I 1234 YOU (I DARE YOU, or is it I READ YOU?). Words and web help each other. Needs playing. |
| Halloween | Tree-Top Star (`starlights`) | stray | **Built:** 3 panels, Christmas bulbs (threads only red to green); the last is one string from plug to star. Needs playing. |
| Halloween | Spider's Web (`web`) | centrepiece | **Built:** 5 panels: the big plain web, dark knots (Jack-o'-Lantern), diagonals (Witch's Broom), both, then a 9×8 web with everything. Needs playing. |
| Thanksgiving | Hot Dog Platter (`platter`) | stray | **Confirmed.** (The "cousin wants the nearest piece" twist isn't in.) |
| Thanksgiving | Stuffed Stocking (`stocking`) | stray | **Replaced:** the recipe balance was trivial (set the ratio, scale up). Now the weighing puzzle: 3 stockings/1 weighing, 9/2, 12/3 heavy-or-light; the scales tip adversarially, so no lucky guesses. Needs playing. |
| Thanksgiving | Feast (`feast`) | centrepiece | Not yet played. 10 passes at best. Probably now easier than its own stray (stocking level 3); see the audit. |
| Christmas | Golden Egg Ornament (`ornaments`) | stray | **Confirmed.** |
| Christmas | Pie in a Tin (`pietin`) | stray | **Reworked:** too easy (6 slices, ~120 orders); now level 1; level 2 has 9 slices for a pie of 6, one pie (4 flavours, 3 decoys). Needs replaying. |
| Christmas | Christmas Tree (`tree`) | centrepiece | **Reworked:** right kind of puzzle, too easy for a centrepiece; now level 1; level 2 is an 11-row tree wired with lots of T-junctions. Needs replaying. |
| Tuesday | A Holiday for Tuesday (`tuesday`) | final | Not yet played. Six short standalone parts (card, dyeing, parade order, pumpkin peg-jumping, gravy jugs, packing presents); doesn't yet reuse the rooms' real puzzles. |

Pattern from playtesting: a first version often makes a good **learning level**
before a real one; puzzles now ramp over 2–4 levels.

## Audit against the inspiration games (`inspiration/`)

**Puzzle types.**
- **Covered:** chess placement (Golden Egg), toggles (Egg Flag), sliding and swapping (Parade, Feast), fitting pieces (Shadows, Pie), division and measuring (Platter, Stocking).
- **Stronger than the originals:** pure logic (Admirers, Web, Cupid's grid, weighings, schedule). That's our modern turn.
- **Gaps:**
  1. **Routes and mazes:** (the Egg Tree's knight's tour now starts to fill this) a signature type of the originals (heart maze, altar maze, dollhouse, dice, pool table, card and coin "visit every square"), and we have none.
  2. **Words:** light (Jack, Mailbox); the planned riddle layer is where *11th Hour* put most of its.
- **Left out on purpose:** memory and sequence, board games against the host, sliding-tile pictures.
- **Overlap:** Parade and Feast are both slide-the-pieces search puzzles, the type the originals are most criticised for.

**Structure.**
- **Learning levels:** the originals give no warm-up; our learning levels fix that, but 19 puzzles have become about 32 solves. **Use the originals' answer:** Clandestiny's "Nervous/Brave" modes and Dr. Brain's Novice/Expert/Genius. Make learning levels optional, a difficulty choice.
- **Hints:** our biggest gap. *7th Guest* had a hint book (the third hint solves it), Dr. Brain hint coins, Clandestiny an easier mode, UHS graded hints. We have only the jack's glowing letters.
- **Matched well:** free order (*Safecracker*), centrepiece gating, the meta finale (*Fool's Errand*), rules explained up front.
- **Still to come:** the lighter layer (riddles, gags) and Tuesday's interjections.

**Room balance** (the centrepiece should be the room's hardest).
- **Egg Tree:** replaced by the knight's tour; only its learning level exists so far.
- **Feast:** probably weaker than its own stray.
- **Grand Finale:** untested in its new role.
- **Fine:** Web, Tree level 2, Mailbox.

## New direction (2026-11-02)

The game is now about 100 small, clicky panels, *The Witness*-style: a
genre per room, runs that add twists, and a final area crossing genres. See
GAME.md, "Direction". The round-one prototypes below become material: those
that fit a room's genre become panels. **Current focus: the Halloween web
run** (GAME.md, "Halloween: the web run"): built as 17 panels in four runs
(`cobwebs`, `chocolates`, `starlights`, `web`), replacing round one's Trick or
Trade and Star in the Shadows (in git history at d0d65b3).

How it's built, for the other rooms to follow:
- `src/proto/hashi.ts`: Hashi rules and twists, a solver with propagation
  (counts answers in milliseconds), and a random web generator.
- `src/proto/hashiBoard.ts`: the clicky panel (drag between knots, refusals
  flash, pieces coloured when split, chime and buzz when solved).
- `src/proto/run.ts`: a room's run of panels (strip, ticks, Next); any genre
  can use it.
- Panels were found by searching generated webs for one answer, plus the
  property each teaches (the rule must matter: relax it and there are more
  answers). Big diagonal webs are rarely unique (~1 in 100); search for a
  unique web first, then darken knots one at a time while it stays unique.
  Tests pin it all (tests/puzzles/halloween.test.ts).

## Next steps (round one; largely superseded by the new direction)

1. **Hint system:** graded hints for every puzzle (perhaps Tuesday's grudging notes).
2. **Optional learning levels**, Nervous/Brave style, to keep the game near the originals' length.
3. **Replace or upgrade the Feast**, e.g. a "serve every guest exactly once" route puzzle: fills the route gap and makes Thanksgiving's centrepiece its hardest.
4. **Playtest the unplayed six:** Admirers, Parade, Trade, Shadows, Feast, Tuesday (Parade and Trade first, the likeliest to feel like searching).
5. **Decide:** the Mailbox's key sources.

## Working notes

- None of the prototype work is committed yet (`src/proto/`, `tests/puzzles/`,
  `dev/puzzles.html`, GAME.md edits, `tools/screenshot.ts` PAGE/VIEW
  options). Commit only when asked; never push.
- Designing a level: search for one with the property you want (unique answer,
  a minimum move count, logic-only for picture grids), then pin it with a test.
  Several were found with throwaway Python searches; the tests re-check them.
- `PAGE=/dev/puzzles.html?p=<id> VIEW=1100x760 npm run screenshot -- 0 "" name`
  captures one puzzle headlessly.
