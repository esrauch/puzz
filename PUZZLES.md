# Puzzles: six base puzzles, six twists

The puzzle design in one place. `GAME.md` has the story, rooms and panel
runs; `PROTOTYPES.md` has build status; `PUZZLE_DESIGN.md` has the generator
design rules, Do/Don't examples and precedents for making compelling panels.
This file is the map that ties them
together: every base puzzle against every holiday twist, and what makes each
one satisfying to play with a thumb.

**Decided 2026-11-03:** Christmas's twist is **snowflakes** (a mirror) and
the Fourth of July's is **red, white and blue**. Red and green (the old
Christmas twist) and edge flags (the old Fourth of July twist) are retired.
Some built panels still use them; see "Not cleaned up yet" at the end.

## The premise

Ordinary Tuesday has mixed up the six holidays. Each holiday brings two
things, kept apart on purpose:

- **A base puzzle:** a proven logic puzzle (Nikoli, Simon Tatham's
  collection, the NYT) dressed in the holiday's theme. It's the genre of
  that holiday's room: every panel there is that puzzle.
- **A twist:** one extra rule about the holiday itself, not its puzzle. It
  travels: the holiday's two items are stray in two other rooms and carry
  the twist into those rooms' puzzles. A twist means the same thing
  everywhere, so a player who's met it once recognises it in the next room.

So the game is a 6 × 6 grid where any puzzle can carry any twist. Each
room plays its own puzzle plain (the warm-up), then with two visiting
twists (the strays), then with its own holiday's twist at home (the
centrepiece). Tuesday's final area fills in more of the grid: each puzzle
with two twists it hasn't had yet. Across the whole grid the player keeps
meeting the same six puzzles and six twists in new combinations, which is
*The Witness*'s pleasure: learn a language, then read it everywhere.

**Rules that hold everywhere:**
- Every panel has exactly one answer, reached by logic.
- No twist feels pointless: remove it and more answers fit, and its clues
  change what the player would otherwise do (an egg refutes the obvious
  path, rather than confirming it). Extra clues are fine as hints or theme.
- A centrepiece uses only its own holiday's twist (plus a home-only extra),
  since a player may reach it without playing the strays.
- Words in a grid are real words; puns go in labels only.

## What "clicky" means here

The bar is *The Witness* on a phone: every touch does something you can see
and hear, the rules are on the board, and solving is a small celebration.

1. **One gesture per puzzle,** learned in a second: drag a thread, drag a
   rectangle, tap to turn, drag through letters, drag a trail, tap to fill.
   A twist never adds a second gesture.
2. **Every action answers back:** a blip, a buzz, a colour. A clue glows
   when it's satisfied and blushes red when it's broken, *as you go*, so the
   player never has to check by hand.
3. **Twists you can see working:** an egg turns green on time, a fence
   flashes when a thread tries to cross it, a snowflake's ghost shows where
   the mirror image still has to go. If a twist can't show its progress, it
   isn't clicky enough.
4. **A reveal on solving:** the board turns gold and chimes, and the twist
   pays off: a message spells itself, the dark lights up, the picture
   appears.
5. **Failure teaches:** a wrong move is allowed and then explained, never
   silently refused.
6. **Small boards:** 5×5, 7×7 and 9×9 (easy, medium, hard), solvable in a
   minute or two.

## The six base puzzles

| Holiday | Puzzle | Based on | Rules in brief | The gesture | The payoff |
|---|---|---|---|---|---|
| **Halloween** | **Webs** | Hashi (Nikoli's Hashiwokakero; Tatham's Bridges) | Join the knots with threads. Each knot's number is how many threads leave it; threads run straight, one or two between a pair, never cross; the web is all one piece. | Drag knot to knot (again for a double); tap to cut. | Knots glow as they fill; a web in pieces flashes each piece; solved, it turns gold in the moonlight. |
| **Thanksgiving** | **Carving** | Shikaku (Nikoli; Tatham's Rectangles) | Divide the grid into rectangles, each holding exactly one number: its size. | Drag corner to corner; tap to lift. | A portion glows green when right; the carved board turns gold. |
| **Christmas** | **Lights** | Net (Tatham) | Turn the pieces so power from the plug reaches every square, with no loose wire ends. | Tap to turn a quarter clockwise. | You watch the power spread from the plug; loose ends spark; solved, the string turns gold and the star lights. |
| **Valentine's** | **Words** | Strands (NYT) | Every letter belongs to one theme word; trace words through touching letters (diagonals too). Bigger grids have a spangram running side to side. | Drag through letters. | A word locks in blue (the spangram gold) with a chime. |
| **Easter** | **Bunny hops** | Numbrix (Hidato with plain steps) | The bunny visits every square once, stepping up, down, left or right; numbered eggs are its steps of that number. Every panel has an egg 1 to start on. | Drag the trail; tap the bunny to step back. | Eggs glow when reached on time (red when early or missed); solved, they turn gold. |
| **Fourth of July** | **Picture grids** | Nonograms | Clues at each row and column give its runs of filled squares, in order. Pictures solve exactly as drawn. | Tap to fill / cross / clear; drag a run. | Clues go grey as lines match; the firework picture appears. |

## The six twists

| Holiday | Twist | What it always means | How it shows itself working |
|---|---|---|---|
| **Valentine's** | **Letters for numbers** | Some numbers are written as letters: the same letter is the same number, different letters different numbers. A little message's numbered blanks fill in from them, so the words and the puzzle help each other. Always at least two different letters (different numbers), even on easy: one letter alone is just a hidden given (fine only for a training level). | The message tiles fill in, gold, as the panel solves. Guessing the word is a legitimate shortcut. |
| **Christmas** | **Snowflakes** | The answer's skeleton is its own mirror image across a line, but a detail on each side is free, so neither half can be solved alone (see below). | A ghost shows where your drawing's mirror image still has to go; it fades once it's drawn. |
| **Halloween** | **The dark** | Some clues are hidden (could be anything) until worked out. | The dark lights up on solving, showing what was there. |
| **Easter** | **Numbered eggs** | An egg's number says *when*: the step it's visited on, or its place in an order. (Kept for now; to revisit: it reads awkwardly in Carving and Pictures.) | An egg turns green when its moment comes on time, red when it doesn't. |
| **Fourth of July** | **Red, white and blue** | Things are red or blue, or white (the default: uncoloured); two reds or two blues can't join or touch, and white touches anything. | A same-colour touch flashes both pieces red. |
| **Thanksgiving** | **Fair shares and cuts** | The board is outlined in portions and every portion gets the same; or short fences (cuts) that nothing may cross. | Each portion shows its share so far (🥧 2/3), green when it's fair; a fence flashes when something tries to cross it. |

### Snowflakes in detail

The rule that makes a mirror a puzzle rather than a copy: **some aspect of
the answer mirrors, and something still has to be decided on each side.**
Mirroring everything just halves the puzzle (solve one side, copy it).

- **Whole board where the mechanics allow.** Webs mirrors the whole board:
  the *joins* mirror across the icy line, but each side picks its own
  singles and doubles, so mirror knots usually show different numbers and
  you reason across both halves.
- **Otherwise, a frame:** inside a frosty frame, what's drawn (threads,
  cuts, wires, word strokes, the trail, filled squares) is its own mirror
  image; outside it, anything goes. Things crossing the frame's edge carry
  on freely, which is the escape: a 2×3 portion on one side can face a 2×2
  on the other, as long as the parts inside the frame match.
- **Between squares, in square puzzles.** In puzzles played on squares
  (Carving, Words, Bunny hops, Pictures, Lights) the mirror line runs between
  squares, never through their middles; Webs, played on points, mirrors
  through its middle knots.
- **Frames as large and square as possible.** A long thin frame (two
  columns mirroring each other) doesn't read as a snowflake; prefer near
  square frames covering a good share of the board.
- Shared code: `src/gen/core/mirror.ts` (frames, mirrored grid features,
  the symmetry check), so each genre only says what it draws.

## The matrix

Rows are puzzles, columns are twists. **Bold** marks the puzzle's own
holiday's twist, at home. ✅ built (all still need playing); ⚙️ in the
generator (any tier, any mix of twists); 🟡 tentative (built for Tuesday);
🔧 built with a retired twist, to be redone; ❓ open (ideas below).

| Puzzle ↓ / Twist → | Letters (Val.) | Snowflakes (Xmas) | Dark (Hall.) | Eggs (Easter) | Red, white & blue (4th) | Shares & cuts (Thanks.) |
|---|---|---|---|---|---|---|
| **Webs** (Halloween) | ✅ Box of Chocolates, ⚙️ | ⚙️ whole board | ✅ **Spider's Web**, ⚙️ | 🟡 Tuesday, ⚙️ | 🔧 Tree-Top Star (red and green), ⚙️ red and blue | ⚙️ cuts |
| **Carving** (Thanksgiving) | 🟡 Tuesday, ⚙️ | ⚙️ frame | 🟡 Tuesday, ⚙️ | ⚙️ Easter baskets | 🔧 Stocking (red and green), ⚙️ red and blue | ✅ **Feast**, ⚙️ cuts |
| **Lights** (Christmas) | ⚙️ | ⚙️ frame | 🟡 Tuesday, ⚙️ | ✅ Golden Egg, ⚙️ | ⚙️ red and blue | ✅ Pumpkin Pie, ⚙️ |
| **Words** (Valentine's) | ✅ **Valentine Mailbox**, ⚙️ | ⚙️ mirror pairs | ✅ Jack-o'-Lantern, ⚙️ | ✅ Bunny's Basket, ⚙️ | 🔧 Tuesday (red and green bows), ⚙️ red and blue | 🟡 Tuesday, ⚙️ cuts |
| **Bunny hops** (Easter) | 🟡 Tuesday, ⚙️ | ⚙️ frame | ⚙️ | ✅ **Egg Tree**, ⚙️ | ⚙️ | ✅ Cornucopia, ⚙️ |
| **Picture grids** (Fourth) | ✅ Cupid's Bow | ❓ frame | ✅ Witch's Broom | 🟡 Tuesday | ✅ **Grand Finale** (red and blue clues; to add white) | 🟡 Tuesday |

---

### Webs (Halloween)

- **Letters (Box of Chocolates, ✅; generator ⚙️):** some knots show a letter
  instead of a number; same letter, same count. Message blank *n* is the
  letter whose knots have *n* threads (1OV2 → LOVE). Guess the word, learn
  the counts.
- **Snowflakes (generator ⚙️):** the whole board; the joins mirror across
  the icy line, singles and doubles don't. Ghost threads show missing
  mirror joins.
- **The dark, at home (Spider's Web, ✅; generator ⚙️):** knots outside the
  lantern's light show no number. Home-only extra: diagonal threads.
- **Eggs (Tuesday, 🟡; generator ⚙️):** 🕷 marks the spider's home; an egg's
  number is how many threads it takes to reach it from home, always more
  than the shortest possible path (it refutes the obvious route).
- **Red, white and blue (🔧 Tree-Top Star; generator ⚙️):**
  knots are coloured, and a thread only joins different colours; plain
  knots join anything. The generator colours a grown web along its threads.
  Knots are red or blue; white ones (the default) join anything.
- **Cuts (generator ⚙️):** short fences on the squares' edges that no
  thread may cross, placed only where they rule other webs out.

### Carving (Thanksgiving)

All six columns are in the generator (⚙️), at every tier, in any mix (three
clue-adding twists at once only on easy so far). Playtested 2026-11-03: the
dark and cuts are good; the rest were adjusted as below.

- **Letters (Tuesday, 🟡; ⚙️):** some sizes are letters; the message shows
  a digit *n* as the letter for size *n*, other letters as they are (2A4 →
  YAM). Two letters on easy, three from medium up (each a different size).
  Size letters avoid T, P and C (the dishes).
- **Snowflakes (⚙️):** inside a frame, the cuts mirror; portions crossing
  the frame's edge carry on differently outside. The mirror line runs
  *between* squares (a line through a square's middle made no sense), so
  frames are an even number of squares across the mirror. Frames at least
  3×3, near square, at most three quarters of the board, largest first.
  Random carvings rarely mirror over a big area, so frames come out small
  (4×4 on a 9×9); carving symmetrically inside a chosen frame is the next
  step to make them larger.
- **The dark (Tuesday, 🟡; ⚙️):** some sizes show '?'. Playtested: good.
- **Easter, as baskets (⚙️; decided 2026-11-03):** Carving's Easter twist
  isn't numbered eggs (the "first cut" version was built and playtested:
  too confusing). Instead every portion gets an Easter basket: one 🥚 egg,
  one 🥕 carrot and one 🍫 chocolate (two foods on easy), with at least half
  the portions' sizes taken away. It's the Feast's fair-share rule with
  Easter food; Carving only, an exception to Easter's numbered eggs.
- **Red, white and blue (🔧 Stocking; ⚙️):** portions take the colour of
  their marks, and two of one colour never share an edge; plain portions
  touch anything. Every portion that can be coloured carries a mark (with
  only the strictly needed marks, the few dots looked pointless).
- **Thanksgiving, at home: cuts (⚙️):** fences no portion may cross.
  Playtested: great. The built Feast centrepiece uses fair shares (one of
  each Thanksgiving dish per portion); the generator's Thanksgiving twist
  for Carving is cuts.

### Lights (Christmas)

All six columns are in the generator (⚙️), generating in seconds across easy, medium, and hard.

- **Letters (⚙️):** letter bulbs whose distances (counting steps of wire from the plug)
  match numbered blanks in a message (e.g. LIGHT, SHINE, SPARK).
- **Snowflakes, at home (⚙️):** inside a frosty frame, the wires mirror across the axis;
  outside the frame, wiring carries on freely.
- **The dark (Tuesday, 🟡; ⚙️):** some pieces stay dark, and turn blind, until
  the whole panel is solved.
- **Eggs (Golden Egg, ✅; ⚙️):** an egg bulb must be reached in exactly its
  number of steps from the plug.
- **Red, white and blue (⚙️):** a red string and a blue string that never
  join, each powered from its own plug; white pieces can belong to either.
- **Fair shares (Pumpkin Pie, ✅; ⚙️):** pie slices with one serving each; no wire crosses
  a slice wall, and each slice gets exactly one wire from the middle.

### Words (Valentine's)

All six columns are in the generator (⚙️). Words come from theme banks
(`src/gen/words/themes.ts`, real words only), picked to fill the board
exactly; every word must be traceable only one way as the player sees the
board, so a found word is always the right one. A twist "does work" when,
without it, some words could be traced more than one way (1 on easy, 2
above): whole-board answers hardly ever differ in Strands. Boards are
filled straight from the theme's bank, choosing words as they go (a pocket
of four squares takes a four-letter word), with dead ends caught as each
word grows (a sealed-off pocket must fit some unused words; a lone square
never can) and paths grown Warnsdorff-style (hugging edges and corners).
A word that can be traced another way is swapped for a bank word of the
same length on the same path (new letters usually kill the other way), with
a refill of its squares as the fallback. Every single twist now generates
at every tier in seconds or less (eggs on hard is the slowest, ~6 s).

- **Letters, at home (Valentine Mailbox, ✅; ⚙️):** some letters are written
  as numbers, like a codeword (at least two). Tracing counts coded letters
  as known (the key fills in); the whole board must have one answer with the
  code unknown.
- **Snowflakes (⚙️):** the whole board is the frame, one column narrower
  than the tier's size (5×4, 7×6, 9×8, or turned) so the mirror line runs
  between squares; a leftover column would only have held a straight word
  outside the frame, a giveaway. Words come in mirror pairs: each word's
  squares mirror another word's, its letters in a different order (so the
  mirror side still has to be read). Built from same-length word pairs: one
  of each laid on the first half, preferring curled-up shapes (a straight
  word has only two ways to lie in its mirror), the partner on the mirrored
  squares in a new order. The solver keeps a word's way to lie only if
  another word of its length could lie on the mirror image, which settles
  almost everything (fast at every tier).
- **The dark (Jack-o'-Lantern, ✅; ⚙️):** some letters are blanks until a
  word through them is found; at most one per word, never first or last.
- **Eggs (Bunny's Basket, ✅; ⚙️):** a letter's egg is its place in its word,
  placed on words that could otherwise be traced another way.
- **Red, white and blue (🔧 Tuesday bows; ⚙️):** words are red, white or
  blue; one letter of each word is bowed to show its colour, and two words
  of one colour never touch.
- **Cuts (⚙️):** short fences between neighbouring squares that no word
  steps straight across, added after the board is laid: only on edges the
  true words never step, next to squares another way to lie would use, and
  kept only while they rule ways out (spare ones dropped). Tuesday's built
  words panel uses the older form: two portions, the same number of words
  each.

### Bunny hops (Easter)

- **Letters (Tuesday, 🟡):** some eggs show letters; each bunny's message
  of numbered blanks is its steps where its letters lie.
- **Snowflakes (❓):** inside a frame, the trail's strokes mirror; it
  enters and leaves in a different order, so the numbers differ.
- **The dark (❓):** rocks in the shadows (shadowed squares are lawn or
  rock; the last egg gives the route's length).
- **Eggs, at home (Egg Tree, ✅):** numbered eggs on tree-shaped boards.
  Home-only extra: burrows.
- **Red, white and blue (🔧 Tuesday two bunnies):** bunnies of different
  colours, each over its own colour; plain squares go to any.
- **Fair shares (Cornucopia, ✅):** courses: the bunny finishes each
  outlined portion before starting the next.

### Picture grids (Fourth of July)

- **Letters (Cupid's Bow, ✅):** some clue numbers are letters; a message
  fills in.
- **Snowflakes (❓):** inside a frame, the filled squares mirror; clues
  cover whole lines, so they differ (this works in one colour).
- **The dark (Witch's Broom, ✅):** some clues are in the dark.
- **Eggs (Tuesday, 🟡):** an egg's number is which filled square it is in
  its row, counting from the left.
- **Red, white and blue, at home (Grand Finale, ✅):** colour clues (runs of
  different colours may touch without a gap); built in red and blue, to add
  white. Edge clues are simply the genre itself, not a twist.
- **Fair shares (Tuesday, 🟡):** every outlined portion holds the same
  number of filled squares.

---

## Tuesday's final area (tentative)

Twelve panels, two per puzzle: an intro, then a bigger level where each
twist rules out at least two more answers. Built with the old twist set
(red and green, flags); to be redone from the generators once the matrix
is filled in. The grand finale is a board relay on one board, building
Tuesday's party cake (outline in `GAME.md`).

## Not cleaned up yet

The decision above isn't applied to the built rooms yet. Still using
retired twists, and to be redone:

- **Red and green:** the Tree-Top Star (Halloween), the Stocking
  (Thanksgiving), the Christmas Tree (Christmas's centrepiece, which needs
  snowflakes instead), and Tuesday's words and bunnies.
- **Flags:** the Hot Dog (Thanksgiving), the Star-Spangled Flag (Easter),
  and Tuesday's webs and lights.
- **The Webs generator** is up to date (red and blue, white plain; flags gone).
- **`GAME.md`'s room sections** still describe the old twists.

**Next steps:** keep building the generator out to the full matrix: migrate
each genre into `src/gen/` the way Webs was, and give each one generators
for the plain puzzle and every twist (at easy, medium and hard, in any
mix). Then rebuild the rooms, strays, centrepieces and Tuesday from
generated panels.
