# Puzz: Technical

How we build it: the stack, the architecture, and how assets get made. What the game *is* lives in [GAME.md](GAME.md). The tech is shared with `~/Code/schnau` and `~/Code/vox` (three.js, `.voxt` voxel models, synthesized sound, the cel-shaded look); the game, art and sound are Puzz's own.

---

## 1. Goals and Constraints

- **A web game that loads from a URL**, on a phone or a desktop browser.
- **Performance:** a steady 60 fps on a mid-range phone; first load under ~5 MB; no needless work while idle.
- **Minimal dependencies.** No game engine. Runtime dependencies: `three`. That's the whole list (Preact is pre-approved if menus get complex). Dev-only dependencies can be added more freely.
- **Testable rules.** Puzzle logic is plain TypeScript with no three.js or DOM, so every puzzle can be unit-tested (and solved) headlessly. Anything random comes from a seeded RNG (`src/sim/rng.ts`).

## 2. Stack

| Layer | Choice |
|---|---|
| Language | TypeScript, strict (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) |
| 3D | three.js: voxel meshes (blocky or smoothed) with vertex colours, cel shaded |
| UI overlay | Plain DOM + CSS over the canvas |
| Audio | Web Audio API: synthesized songs and SFX rendered at load |
| Build / dev | Vite |
| Tests | Vitest |
| Dev tooling | playwright-core driving the system Chrome (headless previews, screenshots, audio renders) |

## 3. Architecture

Nothing game-specific yet: `src/main.ts` shows a placeholder scene (a sunny cel-shaded corner of a room with a voxel crate, a drifting camera and the title) that proves the pipeline end to end. As the game takes shape: puzzle rules in plain TypeScript (`src/puzzles/`), rooms and their props as data, a controller that moves between rooms and puzzles, and renderers that only read state.

- URL options: `?outline=0`. In dev builds the view is `window.view`.

### Puzzle generators (`src/gen/`)

Panels for the base puzzles and their twists (see `PUZZLES.md` and `PUZZLE_DESIGN.md`) are generated
at dev time and pinned as JSON; the phone never runs a search.

- `src/gen/core/`: shared infrastructure. `rng.ts` (seeded, wraps
  `src/sim/rng.ts`), `budget.ts` (step limit plus deadline; `OverBudget`
  means "try the next seed", never "wait longer"), `clues.ts` (choose twist
  clues against a list of answers in memory: add while they rule answers
  out, then drop the spare ones; and each twist's margin), `spec.ts` (tier,
  twists, results, seed loop, rejection counts for tuning).
  `mirror.ts` holds the snowflake helpers (frames, mirrored grid features,
  the symmetry check) that every genre shares.
- `src/gen/<genre>/`: one folder per base puzzle — `webs/` (Hashi),
  `carving/` (Shikaku), `words/` (Strands, with theme banks in
  `themes.ts`), `hops/` (Numbrix bunny hops), `lights/` (Net Christmas
  lights), and `pictures/` (Nonogram picture grids) — each laid out much the same way:
  `model.ts` (panel format, parse), `rules.ts` (what threads add up to,
  `solved`), `solve.ts` (propagation and search, budgeted), `make.ts`
  (random solution-first boards), `verify.ts` (the checks the generator and
  tests share: one answer, each twist's margin, nothing pointless),
  `generate.ts` (the pipeline and tier shapes).
- Generation is solution-first: grow an answer, write every clue, hide clues
  for the dark and letters, then list the remaining answers once and add the
  clue-adding twists (eggs, flags, colours) against that list until one is
  left. Twists stack: any mix, or none.
- The same generators run in the browser: `src/gen/client.ts` asks a Web
  Worker (`src/gen/worker.ts`) for a panel, so a slow search never freezes the
  page, and cancelling ends the worker. Most specs take under 0.4 s; three
  clue-adding twists at once can take seconds. The prototypes page's workshops
  (`?p=webworkshop`, `?p=carvingworkshop`, `?p=wordsworkshop`, `?p=hopsworkshop`,
  `?p=lightsworkshop`, `?p=picturesworkshop`) use it: difficulty, twist checkboxes, Generate.
- `tools/make-panels.ts` writes `src/panels/<genre>/<twists>.<tier>.json`
  (with each panel's seed and stats); `tests/panels/` re-checks every pinned
  panel with the genre's `verify.ts`.

## 4. Rendering and UI

**The look is sunny cel shading** (as in Schnau): bright saturated colour, two flat tones per surface with a hard edge between them, cool coloured shade, crisp shadows, rounded forms, and coloured ink lines.

- **Cel tones** (`src/render/toon.ts`, `toonMaterial`): built on `MeshToonMaterial`, but its light only decides *whether* a pixel is lit (a hard ramp, and shadows). The tones come from `cel` in `palettes.ts`: lit = the surface colour × `litTint`; shade = the colour raised to `shadeGamma` × `shadeTint`, which darkens and saturates it. Every lit surface uses `toonMaterial`; call `syncCelSun` after changing the sun.
- **Line art** (`src/render/outline.ts`): a post pass that finds silhouettes (the Laplacian of 1/depth, so flat floors stay clean) and creases (normals), and draws each line in a darker, richer shade of the nearer surface's colour, never black. `?outline=0` turns it off.
- **Contour** (same pass): a thick line around only the outside of objects on `CONTOUR_LAYER` (`Outline.setContour`), for picking something out: the thing under the cursor, the selected piece.
- **Rounded models:** `.voxt` models marked `smooth` are meshed as rounded surfaces (§6), so the terminator sweeps across curves. Hard-edged things (crates) stay blocky.
- `src/render/view.ts` (`View`): renderer (pixel ratio capped at 2), the sky gradient and fog, and the sun (high, from the left; PCF shadows). The game places the camera.
- Voxel meshes are cached per model (`getGeometry`); use `InstancedMesh` for many copies of a static prop. Keep draw calls under ~100 (the outline pass doubles them) and don't allocate in the frame loop.
- The DOM overlay (`#ui`) lets taps through (`pointer-events: none`); real controls opt back in with `.interactive`. Style tokens are at the top of `src/ui/base.css`.
- **Colours** have one source of truth, `src/content/palettes.ts`: `common` becomes CSS custom properties (`ui/paletteVars.ts`), `voxel` is the named colours models use, `sky` and `cel` set the light.

## 5. Audio

One `AudioContext`, with a mixer: `master → (music, sfx, ui)` buses (`audio/mixer.ts`, levels in `src/content/tuning.ts`). Music must start from a tap (browsers require a gesture).

- **Songs are data** (`src/audio/songs/`): patterns per stem in a compact notation (`audio/synth/notes.ts`), instruments in `audio/synth/instruments.ts`, rendered to looping buffers with an `OfflineAudioContext`. All songs share `SONG_GRID` (tempo, meter, length) so any two can crossfade. `placeholder.ts` is a stand-in.
- **SFX** are sfxr-style parameter sets in `audio/sfx.ts` (a small generic starter set), with voice limits and pitch jitter.
- Hear them on `/dev/audio.html` or render them with `npm run render-audio`.
- **Samples** (CC0 / public domain) are allowed for what synthesis does badly: voices, crowds.

## 6. Voxel Models (`.voxt`)

A plain-text format Claude writes, reads and diffs. Full syntax at the top of `src/voxel/voxt.ts`:

```
size 8 8 8          # width (x), height (y), depth (z)
voxel 0.1           # world units per voxel
colors
  w wood            # names resolve to palettes.ts `voxel` (never raw hex in models)
box 0 0 0 7 7 7 w   # inclusive; y up from 0, z from the front
slice 0             # front-view grid at depth z; rows top to bottom
  ..w..
```

- **`ellipsoid x y z rx ry rz c`** fills a rounded blob: the main tool for soft cartoon shapes.
- **`paint ellipsoid …` / `paint box …`** recolours only voxels already filled: markings that follow a curved surface without adding bumps.
- **`smooth [passes]`** meshes the model as a rounded surface (surface nets, `src/voxel/smooth.ts`), with normals from the density field, so the cel terminator sweeps cleanly with no voxel staircase.
- **`part <name> pivot x y z [parent <name>]`** splits a model into separately animated parts (a door that swings, a lid that lifts). `buildRig(id)` gives a group per part at its pivot; `getGeometry(id)` is still the whole model.
- **Watch for overhangs:** sunlight slipping under one leaves a lit island inside its shadow; fill underneath.
- Models live in `assets-src/voxels/<folder>/<name>.voxt`; the **model id is the path** (`props/crate`). Vite loads them as text, so edits hot-reload.
- Slice 0 is the front and faces +z. `mirror x` makes each row the left half plus the centre column.
- `npm run import-vox -- model.vox folder/name [voxelSize]` converts MagicaVoxel files, snapping colours to the palette.

**Making a model:** write the `.voxt` → register it in `assets/manifest.json` (`author: "Claude"`, `license: "original"`) → `npm run preview-models -- <id>` and look at `previews/<id>.png`; for detail work, `--close` renders big front, ¾, side and ¾-back views → use it with `getGeometry(id)` and `voxelMaterial`. Judge models from the game camera: a thing should read from its silhouette alone.

## 7. Licensing

Every file under `assets/` and `assets-src/` needs an entry in `assets/manifest.json` (source, author, license). Allowed: `original`, `CC0-1.0`, `public-domain`, `OFL-1.1`. `tools/check-assets.ts` enforces it and runs in `npm run check` and the build.

## 8. Deployment

A static site. `.github/workflows/deploy.yml` runs `npm run check` and deploys `main` to GitHub Pages through Actions (repo Settings → Pages → Source: GitHub Actions). `vite.config.ts` uses a relative base, so any subpath works. The normal build includes the `/dev/` pages for phone testing; `npm run build:release` leaves them out.

## 9. Project Layout

```
/
├─ index.html
├─ dev/                  // dev pages: index, models, audio (sound board)
├─ src/
│  ├─ main.ts            // the placeholder scene, for now
│  ├─ render/            // view (renderer, scene, lights), toon shading, outline pass
│  ├─ ui/                // base styles, palette CSS variables
│  ├─ audio/             // mixer, synth, songs, SFX, wav encoding
│  ├─ voxel/             // .voxt parser, meshers, model cache, .vox import
│  ├─ content/           // palettes, shared tuning
│  ├─ sim/rng.ts         // seeded RNG
│  ├─ gen/               // puzzle generators: core/ helpers, one folder per genre (webs/)
│  ├─ panels/            // generated panels, pinned as JSON (by genre, twists, tier)
│  ├─ proto/             // puzzle prototypes: boards, runs, engines not yet moved to gen/
│  ├─ settings.ts        // localStorage settings shell
│  └─ dev/               // dev page scripts
├─ assets-src/           // voxels/, svg/, samples/
├─ assets/manifest.json
├─ tools/                // asset check, screenshots, model previews, audio render
└─ tests/
```

## 10. Working Notes

- **Environment:** Node 24 (`.nvmrc`), Vite 8, Vitest 5, ESLint 10, TypeScript 5. Headless tools drive the system Chrome via playwright-core with `--use-angle=swiftshader --enable-unsafe-swiftshader`.
- **Dev server:** `npm run dev` (port 5176, `--host` so a phone on the same Wi-Fi can open it; `/dev/` for the tools). `.claude/launch.json` has a `dev` config for the Browser pane.
- **Settings** (`src/settings.ts`) are saved to localStorage, guarded, with defaults when storage is unavailable.
- **Git:** commit after a verified step; run `npm run check` first; never push.

| Command | What it does |
|---|---|
| `npm run check` | Lint, Prettier check, typecheck, tests, asset-license check. Run before every commit. |
| `npm run build` / `build:release` | Build with / without the dev pages. |
| `npm run preview-models [--close] [ids…]` | PNG turntables → `previews/<id>.png`, plus a contact sheet per folder; `--close` for big detail views. |
| `npm run screenshot [seed] [query] [name]` | Phone-size (375×812 @2x) capture → `previews/<name>.png`. `WAIT=<ms>` waits first; `VIEW=WxH` for another size. |
| `npm run render-audio [song:id \| stem:song/stem \| sfx:id …]` | WAVs and waveform PNGs in `previews/audio/`, with levels and a loop-seam check. |
| `npm run import-vox -- file.vox folder/name [voxelSize]` | Convert a MagicaVoxel model to `.voxt`. |
