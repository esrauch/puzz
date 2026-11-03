# Puzz

A puzzle adventure in a house full of puzzles, in the tradition of *The 7th
Guest*, *The 11th Hour* and *The 13th Doll* (see `inspiration/`), but **bright
and light-hearted instead of scary**: a sunny, toy-like, cel-shaded house
(the look of Schnau), warm colours, playful characters, and humour in place
of dread. The house, characters, story and puzzles are Puzz's own.

## The idea: the holidays are all mixed up

The holidays live in a house: each one has its own room, a little world
done up for its day. And someone has **mixed them all up**. There's an
Easter egg in the Christmas tree, a hot dog at the head of the Thanksgiving
table, Cupid's bow strung up on the Fourth of July fireworks rack.

Every **stray item** is caught up in a puzzle, in the style of the holiday
it landed in. **Beat the puzzle, and the item is yours.** Carry it home to
its own holiday. Bring a holiday back both its items, and its **centrepiece**
wakes up: the tree to light, the feast to set, the web to spin. Beat
that puzzle and the centrepiece is restored.

You choose the order. Every holiday's door is open and every stray is there
to find, so there's always something else to try when a puzzle has you stuck
(as in *Safecracker*, where each safe hands you keys and clues for others).

## Getting around

- **Each holiday is one diorama, seen in a single fixed view**: the whole
  room laid out like a toy theatre set, everything in it on show. No
  walking about inside a holiday.
- **Tuesday's hall is the hub**, with a door to each holiday. Click a door
  to go into that holiday; click to go back to the hall.
- So any holiday is two clicks from any other: the hall in between.
- Within a diorama you click things: a stray's puzzle, the centrepiece, the
  spot where a returned item belongs (and later, the gags). A puzzle comes up
  close to play, then drops back to the diorama.

## The host: Ordinary Tuesday

**Ordinary Tuesday** is the most ordinary day of the year. Nobody throws a
party for a Tuesday, nobody sends Tuesday cards, and Tuesday has had enough.
So Tuesday mixed up all the holidays, to see how *they* like it.

Tuesday is the house's host, the way Stauf hosts *The 7th Guest*, but a
villain with a soft centre: beige, a bit sulky, very funny about it. Tuesday
pops up to grumble when you fix things, leaves notes on puzzles, rigs the
odd trick, and slowly warms to you. The hall that joins the holidays is
Tuesday's: plain, beige, utterly ordinary, the joke against all that colour.

## Direction: about 100 small panels (decided 2026-11-02)

Puzz plays like *The Witness*, made for a phone: **lots of small, clicky
panels**, each room a run of them in **one big puzzle genre**, the runs
introducing twists one at a time, and a final area where the genres
**combine**. (The first round, 19 one-off puzzles in the *7th Guest* way,
is kept below as material; see "Round one".)

- **One genre per room**, from proven pencil-puzzle families (Nikoli, Simon
  Tatham's collection: `inspiration/nikoli/`), given a theme and twists.
  Not strict: Valentine's is "anything with letters", a family rather than
  one puzzle. Hashi for Halloween is the model: a solid base with room for
  many twists.
- **Taught by the panels, not by text.** A room's first panels are tiny and
  can only be solved one way, so each rule is learned by doing it. (The
  playtests kept finding this: a too-easy first version is a learning level.)
- **Clicky.** Tap or drag, nothing else. No "check" button: the panel checks
  as you go, each clue lights when it's satisfied and flashes when broken,
  and a solved panel snaps, chimes and powers up the next one. Panels take
  seconds to minutes, not quarter-hours; failing is cheap.
- **Less environmental than *The Witness*.** The panels carry the game; the
  dioramas dress them, hide the odd panel, and hold the gags.

### Structure, kept: dioramas, items and gating

The holiday rooms, items, strays, centrepieces, lamps and Tuesday's final
door all stay; they now organise runs of panels instead of single puzzles.
Each room holds:

1. **The room's warm-up** (about 5 panels): the genre's rules, taught
   panel by panel. Open from the start; the strays' runs open after it.
2. **Two stray runs** (about 3 panels each). A stray item is caught in
   panels of this room's genre, **twisted by the item's own holiday**: the
   item *is* the twist. Solve the run and the item is freed.
3. **The centrepiece run** (about 5 panels), unlocked when the room's own two
   items come home. The genre's hardest panels, with the twists the
   returned items bring with them; its last panel restores the centrepiece.
   It uses **only its own holiday's twists** (and home-only extras), never a
   stray's: a player can reach it without having played the room's strays.

About 16 panels a room, 6 rooms, plus the final area: **about 100 panels**.

**Items carry twists.** An item's twist is a rule from its home holiday's
genre, grafted onto the room it's stranded in (the Box of Chocolates brings
Valentine's letters into Halloween's webs). Where it fits, the same twist
comes home with the item and appears in its own centrepiece, so a player
meets each twist abroad first and at home later. The model and the
diorama show the twist too: the item sits on the panel it's caught in.

### Cross-themes: one per holiday (decided 2026-11-02)

Each holiday has **one** cross-theme, a symbol that sits on top of any
genre. Its two items carry it into the two rooms where they're stray, and
it stays the same wherever it goes, so a player who's met it in one room
recognises it in the next. A room's centrepiece can also have home-only
extras (Halloween's diagonals).

| Holiday | Cross-theme | Goes into (where its items are stray) |
|---|---|---|
| **Valentine's** | **Letters for numbers:** the same letter means the same number; a message's numbered blanks fill in from the counts. | Halloween webs (Box of Chocolates, built) · Fourth of July picture grids (Cupid's Bow: clue numbers become letters) |
| **Christmas** | **Red and green:** pieces joined or touching must alternate colours. | Halloween webs (Tree-Top Star, built) · Thanksgiving carving (Stocking: same-colour portions can't share an edge) |
| **Halloween** | **The dark:** clues hidden in shadow (any value), with the lantern showing what's lit. | Valentine's words (Jack-o'-Lantern: letters in the dark, unknown until worked out) · Fourth of July picture grids (Witch's Broom: clues in the dark) |
| **Easter** | **Numbered eggs:** some pieces carry numbers saying when they're visited or read. | Valentine's words (Bunny's Basket: numbered eggs fix some letters' places) · Christmas lights (Golden Egg: the bulb marked 3 is three steps from the plug) |
| **Fourth of July** | **Clues from the edge:** little flags at the ends of rows and columns, each with a number about the line it points into. | Easter's bunny hops (Flag: parade viewers; an edge number is the first egg seen from that side) · Thanksgiving carving (Hot Dog: flag skewers; how many pieces the skewer goes through) |
| **Thanksgiving** | **Fair shares:** the board is split into outlined portions, and each must get the same. | Easter's bunny hops (Cornucopia: courses; the bunny finishes one portion before the next) · Christmas lights (Pumpkin Pie: each portion gets one bulb) |

Chosen for being about the holiday itself (love letters, red and green, the
dark, egg numbers, the parade crowd, fair portions) rather than its room's
genre, and for fitting numbers, regions or lines alike, so they also suit
the final area's crossings. **Second candidate for Halloween:** shadows and
mirrors (a mirror-symmetric solution, or letters read in a mirror), for
Halloween-themed things elsewhere.

**A room is complete** when its two stray runs and its centrepiece run are
done. Each completed room lights one of six lamps in Tuesday's hall (like
*The Witness*'s lasers into the mountain).

### The final area: genres crossed

With all six lamps lit, Tuesday's door opens on a run where **two genres
meet in one panel**. Ideas:

- **Both at once:** a panel that is a web *and* a word, placing threads and
  letters together, each constraining the other.
- **Two sides of one board:** flip the panel over; the back is another genre,
  and one move changes both sides.
- **One solve unlocks the other:** a route's solution reveals letter keys,
  and the panel's second half is unscrambling them.
- Ending with one big panel that uses every room, and Tuesday's party.

### Room left for a lighter layer (later)

Between the big puzzles, the inspirations have a lighter layer: *11th Hour*'s
~49 riddles (which object is meant, and where is it?), *Shivers*' pots and
lids to pair up, clickable scenery and story scenes. Puzz will have one too,
filled in after the puzzles:

- **Finding the strays:** a teasing note from Tuesday hints where a stray is
  hiding ("Something round and golden is keeping very sweet company").
  Spotting it is the quick win; its puzzle is the big one.
- **Gags:** clickable jokes and reactions all over each room, above all
  round the mash-ups.

Until then strays sit in plain sight and rooms have only their puzzles, but
the game is built so this layer slots in: each room has hotspots for things
to look at and react, a stray can start hidden until found, and Tuesday's
notes have somewhere to live.

## The six holidays

Each is a room in the house, a diorama of its day with its own palette and
music, and its own puzzle style (which every stray caught there uses).

| Holiday | The room | Its genre (see Direction) |
|---|---|---|
| **Valentine's Day** | A pink and red sweetheart parlour: lace, roses, a heart-shaped sofa. | **Strands:** a grid of letters that is entirely themed words; drag through touching letters to find them (like the New York Times' Strands). |
| **Easter** | A spring garden: pastel eggs, tulips, a hutch, a basket-weaver's bench. | **The bunny's hops:** a numbered route (Hidato with knight hops). |
| **Fourth of July** | A backyard cookout at dusk: picnic tables, a grill, bunting, a fireworks rack. | **Picture grids:** nonograms (fireworks paint a picture from row and column clues). |
| **Halloween** | A cosy pumpkin patch at night: friendly ghosts, a porch, a candy bowl. (Spooky-cute, never scary.) | **Webs:** Hashi (Bridges): join the knots with threads. |
| **Thanksgiving** | A harvest dining room: the long table, a hearth, pies cooling. | **Carving:** Shikaku: divide the grid into rectangles, each holding one number equal to its size. |
| **Christmas** | A snowy living room: the tree, stockings, a toy workshop corner. | **Lights:** Net: turn the connectors so power reaches every bulb. |

(New Year's, St. Patrick's Day and others can join later.)

## Items and centrepieces

Two portable items per holiday, and its centrepiece. Where it can, a
holiday's items feed into its centrepiece (the star goes on the tree last),
so bringing them home sets up its puzzle.

| Holiday | Its two items | Its centrepiece |
|---|---|---|
| **Valentine's** | Cupid's Bow, Box of Chocolates | **The Valentine Mailbox**, overflowing with love letters to deliver |
| **Easter** | Golden Egg, Bunny's Basket | **The Egg Tree**, its branches hung with decorated eggs |
| **Fourth of July** | Star-Spangled Flag, Hot Dog | **The Grand Finale**, the fireworks show |
| **Halloween** | Jack-o'-Lantern, Witch's Broom | **The Spider's Web**, a friendly spider's web to re-spin |
| **Thanksgiving** | Cornucopia, Pumpkin Pie | **The Feast**, the roast turkey and a table to set |
| **Christmas** | Tree-Top Star, Stocking | **The Christmas Tree**, to light (the star goes on last) |

Chosen to be recognisable as small models, distinct in silhouette and
colour from each other, funny out of place, and secular and playful (no
religious symbols, no Pilgrim or Native imagery).

## Where the strays are

Two strays in each room, from two different holidays; each holiday's two
items stranded in two different rooms.

| Room | Its strays (and their homes) |
|---|---|
| **Valentine's** | Jack-o'-Lantern (Halloween), Bunny's Basket (Easter) |
| **Easter** | Star-Spangled Flag (Fourth of July), Cornucopia (Thanksgiving) |
| **Fourth of July** | Cupid's Bow (Valentine's), Witch's Broom (Halloween) |
| **Halloween** | Box of Chocolates (Valentine's), Tree-Top Star (Christmas) |
| **Thanksgiving** | Hot Dog (Fourth of July), Stocking (Christmas) |
| **Christmas** | Golden Egg (Easter), Pumpkin Pie (Thanksgiving) |

## Valentine's: the love-letter run (designed 2026-11-02)

**Genre: Strands** (the New York Times' Strands, itself in the word-search
family). A grid of letters, a theme ("Cupid's kit"), and every letter
belongs to exactly one themed word. **The rules:**

- Drag through touching letters (diagonals too) to spell a theme word; let go
  to check it.
- Every letter is in exactly one theme word, so the words fill the grid.
- Bigger boards have a **spangram**: a theme word that runs from one side of
  the board to the other (it names the theme).

Logic as well as vocabulary: the words fill the grid exactly, so leftover
letters, corners and awkward clusters narrow down what's left. Each theme
word can be spelled only one way in its grid (checked when the panels are
made), so a word you find is always the right one.

**On a phone:** drag through letters; the word builds above the board as you
go, and sliding back undoes a letter. A theme word locks in (blue, the
spangram gold) with a chime; anything else shakes. The theme and how many
words are left are shown above the board. (Strands' hints for non-theme words
can come in the UX pass.)

### Warm-up: love notes (5 panels, open from the start)

1. **One word:** a 2×2 that spells LOVE.
2. **Two words:** a 3×3 of two words.
3. **Three words:** a 4×4.
4. **Side to side:** a 5×5 with its first spangram.
5. **A full note:** a 6×6.

### The Jack-o'-Lantern (stray from Halloween: the dark, 3 panels)

Halloween's dark comes with it. **Twist: some letters are in the dark**,
shown as blanks; they could be anything, and light up when a word through
them is found. Theme words with a Halloween bite ("Love bites": FANG,
BOO…).

### The Bunny's Basket (stray from Easter: numbered eggs, 3 panels)

Easter's numbered eggs come with it. **Twist: some letters carry an egg with
their place in their word** (an egg marked 1 starts a word). Theme words with
a spring hop ("Some bunny loves you").

### Centrepiece: the Valentine Mailbox (5 panels; unlocked by Cupid's Bow and the Box of Chocolates)

Valentine's own letters-for-numbers, at home: the round-one Mailbox's cipher
as panels. **Twist: some letters are written as numbers; the same number is
always the same letter.** Finding a word through a number reveals that
letter everywhere it appears, like a codeword, and a key fills in above the
board. The run ramps from one coded letter to the last panel, a love letter
mostly in code ("Sealed with a kiss"), and its spangram is the letter's
message.

## Halloween: the web run (designed 2026-11-02)

The first room designed as a run of panels. **Genre: Hashi** (Nikoli's
Hashiwokakero, Tatham's Bridges): the knots are a friendly spider's
anchor points, the bridges its threads. **The base rules:**

- Each knot's number is how many threads leave it.
- Threads run straight across or down between two knots, one or two
  between the same pair, and never cross.
- The finished web hangs together as one.

**On a phone:** drag from a knot towards a neighbour to spin a thread;
drag again for a double; tap a thread to cut it. A knot glows when its
count is right and blushes red when over. When every count is met but the
web is in pieces, the pieces flash in different colours. There's no
check button, so the web settles when it's done.

### Warm-up: the porch cobwebs (6 panels, open from the start)

Each panel teaches one rule, and can only be solved the way it teaches.

1. **One thread.** Two knots marked 1, side by side. Drag from one to
   the other.
2. **Doubles.** Two knots marked 2: one thread isn't enough, so drag again.
3. **Sharing out.** A 3 between a 1 and a 2: the threads must be split.
4. **No crossing.** A web where the thread you'd draw first would cross one
   that's forced elsewhere.
5. **One web.** Four 2s on a square: two doubles satisfy every number
   but leave two pieces (which flash); only the ring of singles hangs
   together.
6. **A first real web.** About seven knots, using everything.

### The Box of Chocolates (stray from Valentine's: letters, 3 panels)

The chocolates are knots in a heart-shaped box, and Valentine's genre
comes with them. **Twist: some knots show a letter instead of a number.**
The same letter always means the same count, and different letters mean
different counts.

**Each panel has a little message with numbered blanks.** Blank *n* takes
the letter whose knots have *n* threads, so words and web help each other:
guess the word and you know some counts; spin the web and the message fills
in (gold, when solved). The run ramps how much the words give away.

1. **1OV2** → LOVE: the word gives L = 1 and E = 2 away, which teaches the
   link.
2. **B2 M1N2** → BE MINE: E = 2, I = 1.
3. **I 1234 YOU** → I DARE YOU. The message's own letters (I, Y, O, U)
   share none with the knots, and it reads two ways: I DARE YOU (D = 1,
   A = 2, R = 3, E = 4) or I READ YOU (R = 1, E = 2, A = 3, D = 4). The words
   narrow it to two guesses; only the web says which. (DEAR VALENTINE was
   too obvious: VALENTINE gave A and E away.)

**Rule for messages:** a message's plain letters mustn't include the knots'
letters, or they give their counts away.

At home, the twist reappears in Valentine's centrepiece, the Mailbox:
letters standing for numbers. It's also a first taste of the final area's
crossings (a route that fills in words).

### The Tree-Top Star (stray from Christmas: lights, 3 panels)

The star's caught in a web of Christmas lights, and Christmas's genre
comes with it. **Twist: the knots are bulbs, red or green, and a thread
only joins a red bulb to a green one.**

1. A small web where one tempting thread would join two reds.
2. A bigger one, where the colours do most of the work.
3. **A string of lights:** the web must also be one unbranched string,
   from the plug to the star. Solved, it lights bulb by bulb, and the star
   comes free.

### Centrepiece: the Spider's Web (5 panels; unlocked by the Jack-o'-Lantern and the Witch's Broom)

The spider re-spins its web, and the returned items bring Halloween's own
twists.

1. **The big web:** plain Hashi, the largest yet (the 9×9 web of round one).
2. **The Jack-o'-Lantern: in the dark.** Knots outside the lantern's light
   show no number and may have any count. (Halloween's cross-theme, the
   dark, at home.)
3. **The Witch's Broom: corner to corner.** Threads may also run
   diagonally, and still never cross. (A home-only extra: abroad, the broom
   carries the dark like the lantern.)
4. **Dark and diagonal together.**
5. **The spider's web:** a big web with everything. Solved, the spider
   spins it in, the web glows in the moonlight, and Halloween's lamp lights.

**Halloween's items abroad** (both carry the dark):
- **Jack-o'-Lantern (in Valentine's):** letters in the dark.
- **Witch's Broom (in the Fourth of July):** picture-grid clues in the dark.

Halloween's genre (threads joining points) is also a candidate for the
final area's crossings: threads that spell, or webs whose solved shape
reveals keys.

**To build and check:** each panel needs exactly one answer. That's easy for
plain webs (round one's solver). The letter, colour, string, dark-knot and
diagonal rules need the solver extended, then searched levels pinned by tests,
as before.

## Thanksgiving: the carving run (designed 2026-11-02)

**Genre: Shikaku** (Nikoli; Tatham's Rectangles). The grid is the feast to
carve into portions. **The base rules:**

- Divide the grid into rectangles.
- Each rectangle holds exactly one number, and the number is its size in
  squares.

Chosen because drawing a rectangle is the clickiest thing on a phone (drag
corner to corner) and the rule fits in one line, so a new player gets it at
once. (Also considered: Galaxies/Tentai Show, delightful but too complex to
grok; the round-one Platter's fair shares as the base, kept instead as the
Pumpkin Pie's twist; Fillomino and Double Choco, less clicky.)

**On a phone:** drag from one square to another to carve the rectangle
between them; tap a portion to lift it off. A portion glows when it holds
one number of its own size, and blushes red when it holds two numbers, or
the wrong number of squares. When the grid is full and right, it's carved.

### Warm-up: the bread board (5 panels, open from the start)

1. **One portion.** A 2×2 board with a 4: drag corner to corner.
2. **Size counts.** A 2 and a 4 in a 2×3: the number is the size.
3. **Shape matters.** A 4 that could be a 2×2 or a 1×4, and only one fits.
4. **No gaps, no overlaps.** Every square in exactly one portion.
5. **A first real board.**

### The Hot Dog (stray from the Fourth of July: clues from the edge, 5 panels)

The hot dog's on the turkey platter, and the Fourth of July's clues from
the edge come with it. **Twist: flag skewers.** A little cookout flag at the
end of a row or column tops a skewer pushed straight through that line; its
number is **how many pieces (portions) the skewer goes through**. Some
portions then have no number inside, so the flags make up for them.

**The Fourth of July's symbol is a flag at the edge of the board** (the
Star-Spangled Flag is one of its items, and the flag-on-a-toothpick is the
cookout garnish). The flag always means "a clue about the line it points
into"; what it's planted on suits the room: skewers here, parade viewers in
Easter (the first egg seen from that side). Earlier name: grill marks,
which didn't explain the counting.

The flags are the one number on the board that isn't a size, so they're
taught by failing safely (there's precedent in custom Fillomino variants,
but they're not a standard Shikaku rule):
- **A wrong skewer is counted out:** when a line is carved right across and
  its count is off (or it's already over), its skewer is drawn right
  through it in red, each piece on it gets a numbered badge (1, 2, 3…), and
  the flag turns red. The status line spells it out ("The skewer through
  row 1 goes through 2 pieces, but its flag says 1").
- **Tap a flag** to see its skewer counted out in gold, any time.

1. **Count the pieces** (training): a 2×2 with no numbers, rows flagged 1
   and 2. The only answer is a bar on top and two squares below.
2. **Down the columns** (training): a 2×3 with no numbers, columns flagged
   1, 2, 1.
3. **A flag skewer:** numbers inside, and one flag doing the work.
4. **Across and down:** row and column flags together.
5. **Kebabs:** two numbers inside; the flags do the rest.

### The Stocking (stray from Christmas: red and green, 3 panels)

A stocking's hung by the hearth, and Christmas's twist comes with it, the
same one the Tree-Top Star brings to Halloween. **Twist: some portions are
marked red or green, and two portions of the same colour may not share an
edge; plain portions can touch anything** (like the stripes on a stocking).
Not every portion can be coloured: where three rectangles meet at a T, all
three touch, so a full red-and-green colouring is impossible. The plain
portions are what makes it work.

1. A small board where an obvious portion would put two reds side by side.
2. A bigger one, where the colours settle the shapes.
3. A full stocking, with a few numbers left uncoloured (any colour).

### Centrepiece: the Feast (5 panels; unlocked by the Cornucopia and the Pumpkin Pie)

The table's laid, and the returned items bring Thanksgiving's fair shares
home. **A centrepiece uses only its own holiday's twist**: the player may
reach it without ever having played the room's strays, so no red and green
here. (An earlier version used the Stocking's colours in panels 4 and 5,
and they read as unexplained.) Everything stays rectangles, so a new player
always knows what a portion is (the Cornucopia's L-shaped horns were
dropped for that reason). The fair share is always spelled out above the
board ("Each portion gets: 🦃 🥧 🍒").

1. **The big carve:** plain Shikaku, the largest yet (7×7).
2. **Fair shares:** dishes on the board (turkey, pie, cranberries), and every
   portion must hold exactly one of each, with no numbers. This is the
   round-one Platter you liked, as panels.
3. **Fair shares, some sizes:** a bigger table, with a few size numbers to
   pin it down.
4. **Seconds:** every portion gets one turkey, one pie and *two* cranberries.
5. **The Feast:** a 7×7 table of fair shares, no numbers at all. Solved, the
   dishes slide into place, Tuesday grudgingly takes a seat, and
   Thanksgiving's lamp lights.

**Thanksgiving's items abroad** (both carry fair shares):
- **Cornucopia (in Easter):** courses: the bunny finishes one outlined
  portion before starting the next.
- **Pumpkin Pie (in Christmas):** each outlined portion gets one bulb.

## Christmas: the lights run (designed and built 2026-11-02)

**Genre: Net** (Tatham's Net; the round-one Christmas Tree, confirmed as
"exactly the right kind of puzzle"). Every square holds a piece of the
light string; turn them so the power flows from the plug to every bulb.
**The base rules:**

- Turn the pieces so the power from the plug reaches every square.
- No loose ends: every wire end must meet another.

(No loops needs no rule: the pieces always have exactly enough wire ends for
one tree, so any join-up that reaches every square without loose ends is
loop-free. Plain Net on a board with edges is also almost always unique,
which is why the stray panels below start from the rare ambiguous boards.)

**On a phone:** tap a piece to turn it a quarter clockwise, always the same
way (four taps go all the way round; a turn-back half and long-press pinning
were tried and dropped: taps either side of the middle undid each other,
and slow taps pinned pieces by accident). Power spreads from the
plug (its square ringed in its string's colour) and every piece it reaches
lights up, so you watch the string grow. A lit wire end that meets nothing
sparks red. Solved, the lights turn gold, the tree-top star lights, and it
chimes. Boards are shaped: trees and a wreath here, an egg and a pie for
the strays.

### Warm-up: the fairy lights (6 panels, open from the start)

1. **One turn:** three pieces in a row, the middle one turned the wrong way.
2. **Corners:** a bend in the string.
3. **A branch:** a T-piece feeds two ways.
4. **No loose ends.**
5. **Everything lit:** two end pieces that could face each other and light
   only themselves (replacing "no loops", which can't come up).
6. **A first string**, 4×4.

### The Golden Egg (stray from Easter: numbered eggs, 3 panels)

The Golden Egg's hung among the lights, and Easter's numbered eggs come
with it. The board's egg-shaped. **Twist: some bulbs carry a numbered egg,
and the power must reach that egg in exactly that many steps from the plug**
(counting squares along the wire). An egg glows green when the power
reaches it on its number, and red when it arrives on the wrong one.

1. One egg settles the board.
2. Two eggs.
3. A big egg with two eggs far up (14 and 15 steps): the weakest of the
   three; wants a playtest.

### The Pumpkin Pie (stray from Thanksgiving: fair shares, 3 panels)

The pie's been plugged into the lights, and Thanksgiving's fair shares come
with it. The board's a round pie, cut in slices round the middle, where
the plug is. **Twist: one serving per slice.** No wire may cross the solid
wall between two slices (each slice's lights are their own little string),
and every slice gets exactly one wire from the middle across its dashed
edge. The rule is spelled out above the board; each slice shows its
servings so far (green at one, red over), and a wire through a wall shows
red.

(First tried: "the same number of wires crosses into every slice". Far too
hard: counting crossings isn't about the pieces, each crossing counts twice,
and big targets don't point anywhere.)

Tiny pies, so the rule is the whole puzzle (pies up to 8×8 with six slices
were still too confusing):

1. Two slices (5×5, the plug alone in the middle).
2. Three slices (5×5).
3. Four slices (6×6).

If it's still confusing at this size, the rule is the problem: swap the idea.

### Centrepiece: the Christmas Tree (5 panels; unlocked by the Tree-Top Star and the Stocking)

**Christmas's red and green, at home: two strings, a red one and a green
one, each from its own plug; red pieces only join red, green only green, and
the strings never join.** (Strictly "same colours join", where abroad it's
"colours alternate": in Net every wire joins neighbouring squares, so an
alternating rule would just be the chessboard pattern every answer already
has, and constrain nothing.)

Colours only ever rule moves out, so a red-and-green tree is *easier* than
the same tree in plain lights. The run therefore starts small, and gets
harder with **white lights**: a white piece can belong to either string (and
lights in the colour of whichever reaches it), but still can't join the two.
The more white lights, the less the colours give away.

1. **A little tree:** plain Net, small (6 rows).
2. **Red and green:** a small tree, two strings.
3. **A taller tree** in red and green.
4. **The wreath, with white lights:** a ring-shaped board, 8 white lights.
5. **The Christmas Tree:** the big one, about 40% white lights, the star on
   top.

**Christmas's items abroad** (both carry red and green): the Tree-Top Star
in Halloween (built), the Stocking in Thanksgiving (built).

## Round one: 19 one-off puzzles (being replaced room by room)

The first design, one bespoke puzzle per stray and centrepiece, prototyped
and playtested (status in [PROTOTYPES.md](PROTOTYPES.md)). The new direction
replaces it a room at a time; what fits a room's genre (the web, the
picture grid, the tree's lights, the knight's tour, the platter, the letter
puzzles) becomes panels, and the rest is material for the lighter layer or
cut. Each grew from a puzzle in the games we're inspired by (`inspiration/`),
with a twist or a modern turn. A stray's puzzle is in its **room's** style,
dressed as a mash-up with the stray's **own** holiday; a centrepiece's is
its own holiday through and through.

### Valentine's Day: logic and words

- **The Valentine Jack-o'-Lantern** (stray, from Halloween). A pumpkin
  carved full of letter-shaped holes, its candle throwing them onto the
  wall. Swap and turn the carved letters until the *shadow* on the wall
  reads as a love note: mirrored, as shadows are, so you carve backwards.
  *From* 7th Guest's cans and Threes and Fives (shuffle letters into a
  sentence); *twist:* you read the message in the light, not the letters. *Prototyped:* ten letters
  with no help was too hard to crack (an anagram and a mirror image at once),
  so it's three notes that ramp up, LOVE, BE MINE, then SWEET ON YOU, each
  with a little clue, and a letter glows on the wall once it's in the right
  place and the right way round.
- **The Bunny's Secret Admirers** (stray, from Easter). The basket is
  stuffed with unsigned valentines from six bunnies. Work out who sent which
  from what you can see on each card (a paw-print smudge, a chocolate
  thumbprint, a carrot-shaped stamp) and the little each bunny lets slip.
  *From* Clandestiny's The Truth Is Out There and the logic grids of
  Layton; *twist:* the clues are on the cards themselves, to turn over and
  look at, not a list.
- **Centrepiece: the Valentine Mailbox.** Love letters spill out, written in
  a sweetheart's code. Crack the cipher (Cupid's Bow and the Box of
  Chocolates each turn out to hold part of the key) and post each letter
  in its cubby. *From* Clandestiny's Cryptic Identity and Dr. Brain's
  cryptograms; *twist:* the key is assembled from the items you brought
  home, and each letter decoded is a little joke. *Prototyped and confirmed:*
  three coded letters and two key fragments felt like the right difficulty,
  and it's solvable before you have everything, so it completes in two
  layers: find and return the three letters, and beat the two puzzles that
  give the two keys.

### Easter: pattern and colour

- **The Egg-Carton Flag** (stray, from the Fourth of July). The flag has
  been remade in dyed eggs, wrongly. Dip a whole row or column of the
  carton in a dye bath to tint every egg in it; the dyes mix (red over
  blue makes purple), and a dip in vinegar clears a line. Make the stars
  and stripes. *From* 7th Guest's House puzzle (moves act on whole rows and
  columns) and the Stauf portrait (one click changes several squares);
  *twist:* colours mix rather than flip. *Prototyped:* on its own
  this is far too easy, so it's two levels: a small carton with two dyes to
  learn the mechanic (no tutorial needed), then the real one, a 5×5 carton
  with three dyes (eight colours) where vinegar has to come at the right
  moment (8 dips).
- **The Woven Cornucopia** (stray, from Thanksgiving). The horn of plenty
  is being rewoven as an Easter basket and the wicker's in a tangle. Turn
  the tiles so every strand runs unbroken, over, under, over, from one end
  to the other. *From* 11th Hour's Gems (turn tiles so touching edges
  match); *twist:* the over-under weave must alternate, so a strand's
  route matters, not just its ends. *Prototyped:* the simple
  weave is far too easy, so it's the learning level; the real one is a 7×7
  weave of four strands that snake round corners and cross each other, every
  tile scrambled.
- **Centrepiece: the Egg Tree.** The Easter Bunny hops through the tree's
  branches like a chess knight, hanging an egg on each spot it lands on;
  hang an egg on every spot without landing on one twice. *From* 7th
  Guest's and 11th Hour's knight puzzles, where an odd-shaped board hides
  the knights' paths; *twist:* a knight's tour on a tree-shaped board, and
  in later levels a few eggs come already numbered with their place in the
  order (Hidato with knight hops), so there's exactly one tour and it's
  found by logic. Fills the routes gap. (Replaced interlocking egg rings,
  Hungarian-rings style: too hard, its one trick unfindable unaided.)
  *Prototyped:* the learning level, a 16-spot sapling with no numbers.

### Fourth of July: timing and order

- **Cupid's Firework Bow** (stray, from Valentine's). The bow is strung up
  as a launcher, and its arrows paint pictures in the sky. The show program
  says how many bursts each tube fires and how they bunch at each height;
  work out the picture. Level 1 (the flag) teaches the knack; level 2 is a
  heart with Cupid's arrow through it (one answer, solvable by logic alone).
  *From* modern picture-logic (nonograms); *twist:* Cupid's arrows paint it.
  *Prototyped:* this was the Grand Finale, but felt like a level 1, too easy
  for a centrepiece; swapped with the fuse schedule.
- **The Witch's Parade Float** (stray, from Halloween). The parade is
  jammed and a witch's broom float is stuck in the middle. Slide the floats
  along the street to clear the broom's way out, while the marching band
  takes a step every time you move. *From* 11th Hour's Furniture puzzle (get
  the piano out, Rush Hour style); *twist:* the band keeps time, so every
  move costs a beat.
- **Centrepiece: the Grand Finale.** The fireworks show, one shell launched
  a beat. Each shell's fuse burns for its own number of beats; schedule the
  launches so the red, white and blue bursts go off exactly as the show
  program says, then watch it play. One schedule works. *From* 7th Guest's
  piano and Safecracker's switches (the right sequence); *twist:* it's a
  schedule, with fuses of different lengths.

### Halloween: shape and swaps

- **Trick or Trade** (stray, from Valentine's). The Box of Chocolates has
  ended up in the trick-or-treat haul. Six kids on the porch will each trade
  only for something they like better (their costumes say what: the vampire
  wants anything red). Start with a lone candy corn and trade your way up
  to the chocolates. *From* Clandestiny's Trade Winds; *twist:* the costumes
  are the rules.
- **The Star in the Shadows** (stray, from Christmas). The Tree-Top Star is
  only a shadow on the wall, from a candle behind a pile of cut-out shapes.
  Arrange the pieces between the candle and the wall to throw the star's
  silhouette; a piece nearer the candle casts a bigger shadow. *From*
  Clandestiny's 13 Easy Pieces and 7th Guest's Grate (fit the pieces);
  *twist:* the pieces fit in shadow, at depth, and size changes with
  distance.
- **Centrepiece: the Spider's Web.** The friendly spider's web needs
  re-spinning. Each knot says how many threads leave it; threads run straight
  across or down, one or two between a pair of knots, never crossing, and the
  finished web must hang together as one. *From* Hashi ("build bridges"), a
  modern logic classic. Most players won't know it, so it ramps up over four
  webs, from three knots to a 9×9 web of nineteen, each with one answer.
  *Prototyped:* this replaced the Bubbling Cauldron (a board game against
  Tuesday), which wasn't a pure enough puzzle.

### Thanksgiving: measure and fairness

- **The Hot Dog Platter** (stray, from the Fourth of July). A hot dog lies
  on the turkey's platter, among cranberries and stuffing. Carve the platter
  into a share for each of the family, every share with the same mix of
  everything. *From* 7th Guest's Cake (equal pieces with the same
  contents); *twist:* a bit of each dish in every helping, and one cousin
  who wants the piece nearest them. *Prototyped and confirmed:*
  just right as it is.
- **The Stuffed Stocking** (stray, from Christmas). A row of identical
  Christmas stockings in the Thanksgiving kitchen, and one of them is stuffed
  with the stuffing. Find it with the kitchen scales in only so many
  weighings: three stockings in one, nine in two, then twelve in three where
  it might be stuffed (heavier) or empty (lighter) and you must say which.
  *From* the classic counterfeit-coin weighing puzzle (and 11th Hour's Cash
  Register and Island of Dr. Brain's balances); *twist:* the scales never let
  you get lucky: until your weighings pin it down, it could always be
  another. *Prototyped:* this replaced a recipe-balancing puzzle that could be
  solved without looking at the weights.
- **Centrepiece: the Feast.** The table's set but the dishes are in the
  wrong places. Slide the platters round the table to everyone's wishes; a
  dish slides as many seats as there are dishes in its way. *From* 11th
  Hour's Plates (how far a plate moves depends on the plates in the way);
  *twist:* each diner wants something different, and passing the gravy is
  harder than it looks.

### Christmas: packing and pattern

- **The Golden Egg Ornament** (stray, from Easter). Hang the ornaments on
  the tree so no two of a colour share a row of branches or a diagonal,
  and the Golden Egg is left with only one place to go. *From* 7th Guest's
  Queens and Bishops (place pieces where none threaten); *twist:* a tree is
  a triangle, so the rows grow longer down the tree. *Prototyped and confirmed:*
  just right as it is.
- **The Pie in a Tin** (stray, from Thanksgiving). Santa's been left pumpkin
  pie, in mismatched slices. Fit them into the round gift tin to make a
  whole pie, no gaps, and no two slices of a flavour side by side. *From*
  Clandestiny's 13 Easy Pieces and Dr. Brain's 3-D Construction (packing);
  *twist:* wedges round a circle, where the angles have to add up. *Prototyped:* the
  six-slice pie is a level 1 (much easier than its inspirations, which are
  real spatial packing); level 2 has nine slices for a pie of six, so which
  slices make the pie is half the puzzle (one pie works).
- **Centrepiece: the Christmas Tree.** Light it: turn the light-string
  connectors so power runs from the plug through every bulb to the top,
  where the Tree-Top Star goes on last and lights the room. *From* 7th
  Guest's Heart Maze (switch the paths) and Shivers' gears; *twist:* every
  bulb on the way lights up as you go, so you see the circuit grow. *Prototyped:* exactly the
  right kind of puzzle, but too easy for a centrepiece as a small tree; it's
  now the learning level, and level 2 is a big tree (11 rows) wired with far
  more branches (lots of T-junctions), which is much harder to reason about.

### The final puzzle: a holiday for Tuesday (round one)

With all six lamps lit, Tuesday's door opens. Planning Tuesday's very own
holiday is a puzzle in six short parts, each a remix of one room's style:
a card for Tuesday (Valentine's), Tuesday's colours (Easter), a parade
(Fourth of July), a costume (Halloween), a feast for one (Thanksgiving)
and the presents (Christmas). Finish them all and Tuesday's party begins.
*From* the meta-puzzles of The Fool's Errand and 7th Guest's last puzzle;
*twist:* the end is a celebration, not a defeat.

Prototype status, the audit against the inspiration games, and next steps:
[PROTOTYPES.md](PROTOTYPES.md).

## Design principles

- **Every panel is fair.** Its rules are learned from earlier panels (and
  Tuesday's notes), it has one answer reached by logic, and it can always
  be reset.
- **Clicky.** Instant feedback on every tap; a panel shows which clue it's
  unhappy with. The UHS hint
  files in `inspiration/` show how good puzzles are meant to be understood.
- **Never stuck.** Several things to try at any moment. Hints are always
  available, gently graded from a nudge to the answer.
- **Mixed-up is funny.** Every stray item is a visual joke in its new room.
  Lean into the mash-ups.
- **Cosy, not scary**, even at Halloween.

## To decide

- The hint system: Tuesday's grudging hints, the restored holidays' own
  characters helping, a hint currency?
- Whether some strays should be gated (say, only visible once a holiday's
  lights are back on) for a little more structure.
- The lighter layer's riddles and gags (after the panels).
- Tuesday's look and voice.
